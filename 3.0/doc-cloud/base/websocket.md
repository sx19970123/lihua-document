# WebSocket

系统内置 WebSocket 实时通信能力，用于服务端向客户端推送消息（通知公告、权限变更红点等场景均经此通道）。

**3.0 微服务版下，WebSocket 连接层独立为第六服务 `lihua-websocket`**（默认端口 8086，无库不落表，可多实例水平扩容）。业务服务不依赖连接层，仅依赖 `lihua-base-ws` 消息边界模块，经 Redis pub/sub 投递推送：

```text
业务服务（system 等）                lihua-websocket 服务（可多实例）
┌──────────────────────┐   Redis pub/sub   ┌──────────────────────┐
│  WebSocketPushUtils  │ ──── ws_push ───→ │  WsPushSubscriber     │
│  （lihua-base-ws）    │                   │  WebSocketManager     │──→ 客户端
└──────────────────────┘                   │  （持有 /ws-connect）  │
                                           └──────────────────────┘
```

客户端连接仍统一走网关：`/ws-connect/**` 路由 `lb://lihua-websocket`（Nacos 服务名负载均衡），多实例部署时由负载均衡分摊连接。

## 消息类型

消息类型由 `WebSocketMsgTypeEnum` 枚举维护（位于 lihua-base-common）：

- `WS_NOTICE`：通知消息（公告发布推送，消息体为公告内容）
- `WS_HEARTBEAT`：心跳，客户端每 30s 发送（`data="ping"`），服务端经内置处理器回 `pong`
- `WS_REFRESH_PERMISSION`：权限数据更新提示，角色/菜单变更后定向推送给受影响在线用户，前端置「数据更新」红点（见 [安全模块](/3.0/doc-cloud/base/security)）

下行帧结构为 `{type, data, timestamp}`，`timestamp` 由连接层发送时自动填充。

## 发送消息

业务侧统一使用 `WebSocketPushUtils`（lihua-base-ws 提供）静态方法投递推送，**不感知连接层**：

``` java
// 注入消息类型枚举与工具类
import com.lihua.common.enums.WebSocketMsgTypeEnum;
import com.lihua.ws.push.WebSocketPushUtils;

// 向全部在线用户广播
WebSocketPushUtils.pushAll(WebSocketMsgTypeEnum.WS_NOTICE, data);

// 向指定用户投递
List<String> userIdList;
WebSocketPushUtils.push(userIdList, WebSocketMsgTypeEnum.WS_NOTICE, data);
```

::: warning 铁纪律

禁止业务服务依赖 `lihua-websocket`、直调 `WebSocketManager` 或使用进程内事件触达推送——那是单实例语义，多实例部署时其他实例上的连接将收不到推送。

:::

::: info 投递语义

- `push` 的 `userIdList` 为 `null` 时等价全员广播（一般直接用 `pushAll`）
- 推送为 fire-and-forget：无送达承诺与重试，可靠性靠持久层 + 客户端拉取兜底，消息体保持最小化
- 会话表中无此用户的实例静默跳过，属扇出常态

:::

内部实现：投递即向 Redis topic `ws_push` 发布一条 `WsPushMessage`（`userIdList + type + data` 的 JSON），所有订阅该 topic 的 WS 实例各收一次、各自推送本地持有的连接——多实例天然扇出。



## 事务提交后再推送

「写库 + 推送」组合一律使用 `TransactionSendUtils.runAfterCommit` 包裹（在发布点包裹，工具内部不包）：存在活动事务则挂 afterCommit 执行，否则立即执行。避免事务未提交消息先达，客户端回拉读不到数据

真实示例（公告发布，`SysNoticeServiceImpl`）：

``` java
// 全员公告：事务提交后向全部用户投递
TransactionSendUtils.runAfterCommit(() ->
        WebSocketPushUtils.pushAll(WebSocketMsgTypeEnum.WS_NOTICE, sysNotice));

// 指定范围公告：事务提交后向指定用户投递
List<String> userIds = sysUserNoticeService.queryUserIds(id);
TransactionSendUtils.runAfterCommit(() ->
        WebSocketPushUtils.push(userIds, WebSocketMsgTypeEnum.WS_NOTICE, sysNotice));
```

权限变更红点同理：`PermissionUpdateUtils.markChanged` 内部先写 Redis 红点标记，再经 `runAfterCommit → WebSocketPushUtils.push` 投递 `WS_REFRESH_PERMISSION`。



## 接收消息（上行处理）

客户端上行帧（结构与下行对称的 `{type, data, timestamp}`）由 lihua-websocket 服务解析后，按 `type` 分发给 `WsMessageReceiver` 处理器。二开新上行消息三步：

1. 确定帧 `type`（内置枚举值或自定义字符串）
2. 实现 `WsMessageReceiver` 接口并标注 `@Component`（自动被宿主扫描注册）
3. 在 `receive` 中消费 `data`，需要应答时经 `reply` 回写

``` java
public class CustomWsMessageReceiver implements WsMessageReceiver {

    @Override
    public String type() {
        // 内置值取 WebSocketMsgTypeEnum.name()，二开可自定义新值
        return "CUSTOM_TYPE";
    }

    @Override
    public void receive(String userId, Object data, WsReply reply) {
        // userId：握手鉴权通过的用户 id
        // data：上行载荷
        // reply.send(...)：向当前连接回写同 type 帧（可选）
    }
}
```

::: warning 生效范围

处理器运行在**连接所在进程**——cloud 下即 lihua-websocket 服务进程。在业务服务（如 lihua-system）进程内注册的处理器收不到调用；跨服务的上行业务处理须经 WS 上行 Redis topic 桥接（`com.lihua.ws.receive` 包预留方向），勿用进程内事件（event 不跨进程）。

:::

内置参考实现 `HeartbeatWsMessageReceiver`：处理 `WS_HEARTBEAT` 帧并回 `pong`，确认链路双向可用。该帧为连接层内置语义，在连接进程内闭环、不经 Redis 扇出。服务端不基于心跳做超时踢线，断连由容器连接回调驱动客户端自动重连（最多 3 次）。



## 连接管理（lihua-websocket 服务内部）

以下机制由 lihua-websocket 服务实现，业务侧无需关心，仅供了解：

- **握手鉴权**：客户端连接前请求一次性令牌（`/system/auth/onceToken`，Redis 存储有效期 1 分钟），握手时携带 `token + clientId + clientType` 参数（`/ws-connect?token=xx&clientId=xx&clientType=xx`），鉴权通过即删除令牌。服务进程内 `/ws-connect/**` 在 SecurityConfig 白名单放行，鉴权完全由握手拦截器承担
- **会话表**：两级结构 `userId → (userId_clientId_clientType → session)`；同一用户同一端重复建连时新连接建立后旧连接自动关闭
- **慢消费者保护**：每个连接经 `ConcurrentWebSocketSessionDecorator` 装饰——单条消息发送超 5 秒或发送缓冲超 512KB 的连接自动断开，避免阻塞推送线程
- **上行分发**：按帧 type 查处理器表分发，type 重复保留先注册者并告警；解析失败或无处理方仅记 debug 日志，不影响连接存活；处理内异常由连接层兜底捕获，回写经装饰会话与下行共享发送排队锁
