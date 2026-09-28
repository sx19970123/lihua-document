# WS 连接服务 lihua-websocket

微服务版的 **WebSocket 连接层独立服务**（第六服务）：持有全部客户端 `/ws-connect` 连接，订阅 Redis pub/sub 扇出推送本地会话。无数据库、不落表，可多实例部署水平扩容。

::: info 与单体版的关系

连接层代码与单体版 `lihua-websocket` 模块逐字节一致，差异仅在部署形态——单体版作为纯库随 lihua-admin 进程装配运行，微服务版自带启动引导作为独立服务运行。业务侧统一只依赖 `lihua-base-ws`，API 完全一致（见 [WebSocket](/3.0/doc-cloud/base/websocket)）。

:::

## 基本信息

| 项 | 值 |
| --- | --- |
| spring.application.name | `lihua-websocket` |
| 默认端口 | `8086`（`SERVER_PORT` 可覆盖） |
| 启动类 | `com.lihua.websocket.LiHuaWebSocketApplication` |
| 依赖中间件 | Redis（推送订阅 + 一次性令牌鉴权）、Nacos（注册 + 配置）——**无 MySQL** |
| 打包产物 | `lihua-websocket-exec.jar`（spring-boot-maven-plugin，classifier=exec） |

## 模块结构

```text
lihua-websocket/
├── pom.xml                                # 依赖 lihua-base-ws / lihua-base-security / websocket 栈 / nacos / actuator
└── src/main/
    ├── java/com/lihua/websocket/
    │   ├── LiHuaWebSocketApplication.java  # 启动引导（cloud 独有，mono 无此文件）
    │   ├── config/WebSocketConfig.java     # /ws-connect 端点注册，文本/二进制 buffer 512KB
    │   ├── interceptor/WebSocketInterceptor.java  # 握手拦截：once token 鉴权
    │   ├── manager/WebSocketManager.java   # 会话表 + 下行推送 + 上行分发
    │   ├── model/WebSocketResult.java      # 下行帧模型
    │   └── subscriber/WsPushSubscriber.java # Redis pub/sub 订阅端
    └── resources/application.yml           # 服务配置（无 dev/prod 变体）
```

## 核心机制

### Redis 订阅扇出

启动时订阅 Redis topic `ws_push`（`WsPushSubscriber`，`@PostConstruct` 注册监听）：收到业务投递的 `WsPushMessage`（`userIdList + type + data` JSON）后还原为 `WebSocketResult` 交 `WebSocketManager.send` 推送本地会话。每个 WS 实例各订阅一次、各推本地连接——业务方一次投递即完成多实例扇出。推送为 fire-and-forget，回调内异常仅记日志，不重试不确认

### 连接管理

- 会话表两级结构 `userId → (userId_clientId_clientType → session)`，`ConcurrentHashMap` + `compute` 原子写入/清理
- 同一用户同一端重复建连：新连接建立后旧连接自动关闭（挤旧）
- 每个连接经 `ConcurrentWebSocketSessionDecorator` 装饰（发送超时 5s、缓冲上限 512KB），慢消费端自动断开；装饰实例存入 session attributes，上行回写与下行推送共享排队锁
- 上行帧解析按 type 分发到 `WsMessageReceiver` 处理器（见 [WebSocket](/3.0/doc-cloud/base/websocket)），type 重复保留先注册者并告警

### 握手鉴权

握手参数 `token + clientId + clientType` 必填；token 为一次性令牌（Redis 前缀 `REDIS_CACHE_ONCE_TOKEN:`，有效期 1 分钟，由 `GET /system/auth/onceToken` 签发），校验通过即删除。服务进程引入 lihua-base-security 共享 `SecurityConfig`，`/ws-connect/**` 在 permitAll 清单，鉴权完全由握手拦截器承担

## 接口一览

无 REST 业务接口。对外仅有：

- `GET /ws-connect`：WebSocket 连接端点（握手参数见上）
- `GET /actuator/health`：健康探针（compose healthcheck 经主端口探活）

## 配置与注意事项

- **Nacos 配置**：`lihua-websocket.yaml`（group=lihua-websocket，当前为占位文件，后续 WS 专属参数在此追加）+ `lihua-common.yaml`（Redis 连接）+ `lihua-resilience.yaml`
- **compose**：`ws-server` 容器（lihua-websocket-server，8086），仅依赖 redis/nacos——无 mysql depends_on 是无库服务的部署佐证；healthcheck 走 `/actuator/health`
- **网关路由**：`/ws-connect/**` → `lb://lihua-websocket`（order 1，路由顺序承重：具体路径先于 lihua-system 通配）。注意 WebSocket 升级请求被熔断 fallback 拦截时表现为**握手失败**（非错误体）——ws 服务下线时先摘流量再停实例
- **多实例**：无状态服务，直接加实例即可水平扩容；连接经网关负载均衡自动分摊，推送经 Redis pub/sub 天然扇出到全部实例
