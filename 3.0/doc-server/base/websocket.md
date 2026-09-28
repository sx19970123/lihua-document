# WebSocket

系统内置 WebSocket 实时通信能力，用于服务端向客户端推送消息（通知公告、权限变更红点等场景均经此通道）。

**3.0 单体版下，WebSocket 按两个模块拆分**：

- `lihua-base-ws`（lihua-base 下）：**WS 消息边界**，业务侧唯一依赖——提供推送投递入口 `WebSocketPushUtils` 与上行处理器 SPI `WsMessageReceiver`
- `lihua-websocket`（顶层）：**WS 连接层**（受控基建库），持有 `/ws-connect` 连接与会话表，随 `lihua-admin` 装配运行；业务模块不允许依赖它

业务与连接层之间经 **Redis pub/sub**（topic `ws_push`）解耦：业务侧投递一条消息，所有持有 WS 连接的实例各收一次并推送本地会话——多实例部署天然扇出

```text
lihua-system（业务）                lihua-admin 进程
┌──────────────────────┐          ┌──────────────────────┐
│  WebSocketPushUtils  │ ──┐      │  WsPushSubscriber     │
└──────────────────────┘   │      │  WebSocketManager     │──→ 客户端
        lihua-base-ws      │ Redis│  （/ws-connect 端点）  │
                           └─────→│        （lihua-websocket）│
                                   └──────────────────────┘
```

微服务版的差异仅在部署形态：连接层独立为 `lihua-websocket` 服务单独启动（见 [WS 连接服务](/3.0/doc-cloud/services/ws)），业务侧 API 完全一致。

## 消息类型

消息类型由 `WebSocketMsgTypeEnum` 枚举维护（位于 lihua-base-common）：

- `WS_NOTICE`：通知消息（公告发布推送，消息体为公告内容）
- `WS_HEARTBEAT`：心跳，客户端每 30s 发送（`data="ping"`），服务端经内置处理器回 `pong`
- `WS_REFRESH_PERMISSION`：权限数据更新提示，角色/菜单变更后定向推送给受影响在线用户，前端置「数据更新」红点（见 [安全模块](/3.0/doc-server/base/security)）

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

禁止业务模块依赖 `lihua-websocket`、直调 `WebSocketManager` 或使用进程内事件触达推送——那是单实例语义，多实例部署时其他实例上的连接将收不到推送。

:::

::: info 投递语义

- `push` 的 `userIdList` 为 `null` 时等价全员广播（一般直接用 `pushAll`）
- 推送为 fire-and-forget：无送达承诺与重试，可靠性靠持久层 + 客户端拉取兜底，消息体保持最小化
- 会话表中无此用户时静默跳过，属常态

:::

真实示例（公告发布，`SysNoticeServiceImpl.release`）：

``` java
// 全员公告：事务提交后向全部用户投递
TransactionSendUtils.runAfterCommit(() ->
        WebSocketPushUtils.pushAll(WebSocketMsgTypeEnum.WS_NOTICE, sysNotice));

// 指定范围公告：事务提交后向指定用户投递
List<String> userIds = sysUserNoticeService.queryUserIds(id);
TransactionSendUtils.runAfterCommit(() ->
        WebSocketPushUtils.push(userIds, WebSocketMsgTypeEnum.WS_NOTICE, sysNotice));
```



## 事务提交后再推送

「写库 + 推送」组合一律使用 `TransactionSendUtils.runAfterCommit` 包裹（在发布点包裹，工具内部不包，且**不可嵌套**）：当前存在活动事务则挂 afterCommit 执行，否则立即执行。避免事务未提交消息先达，客户端回拉读不到数据（如公告发布后拉取列表/未读数）

`TransactionSendUtils` 位于 lihua-base-common（由原 base-websocket 模块下沉），投递方无需依赖任何 WS 模块。权限变更红点同理：`PermissionUpdateUtils.markChanged` 先写 Redis 红点标记，再经 `runAfterCommit → WebSocketPushUtils.push` 投递 `WS_REFRESH_PERMISSION`（见 [安全模块](/3.0/doc-server/base/security)）



## 接收消息（上行处理）

客户端上行帧（结构与下行对称的 `{type, data, timestamp}`）由连接层解析后，按 `type` 分发给 `WsMessageReceiver` 处理器。二开新上行消息三步：

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

::: info 生效范围

处理器运行在**连接所在进程**——单体版即 lihua-admin 进程。处理器内异常由连接层兜底捕获记日志，不影响连接存活；上行是低频控制面，处理器内勿做重活

:::

内置参考实现 `HeartbeatWsMessageReceiver`：处理 `WS_HEARTBEAT` 帧并回 `pong`，确认链路双向可用。该帧为连接层内置语义，在连接进程内闭环、不经 Redis 扇出。服务端不基于心跳做超时踢线，断连由容器连接回调驱动客户端自动重连（最多 3 次）。



## 连接管理（连接层内部）

以下机制由 lihua-websocket 连接层实现，业务侧无需关心，仅供了解：

- **握手鉴权**：客户端连接前请求一次性令牌（`GET system/auth/onceToken`，Redis 存储有效期 1 分钟），握手时携带 `token + clientId + clientType` 参数（`/ws-connect?token=xx&clientId=xx&clientType=xx`），鉴权通过即删除令牌。`/ws-connect/**` 在 SecurityConfig 白名单放行，鉴权完全由握手拦截器承担
- **会话表**：两级结构 `userId → (userId_clientId_clientType → session)`；同一用户同一端重复建连时新连接建立后旧连接自动关闭，断连清理与并发新连接写入经 `compute` 原子操作，不会出现断开重连后收不到推送的窗口
- **慢消费者保护**：每个连接经 `ConcurrentWebSocketSessionDecorator` 装饰——单条消息发送超 5 秒或发送缓冲超 512KB 的连接自动断开，避免阻塞推送线程；上行回写与下行推送共用装饰实例的发送排队锁，规避底层 session 并发写
- **上行分发**：按帧 type 查处理器表分发，type 重复保留先注册者并告警；解析失败或无处理方仅记 debug 日志
