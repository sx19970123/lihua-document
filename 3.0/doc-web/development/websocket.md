# websocket

系统集成了websocket，连接地址由 `.env` 中 `VITE_APP_WS_API`（默认 `/ws-connect`）配置，开发环境下经 vite 代理转发到后端服务。连接建立在 `src/utils/web-socket.ts` 中，内部为单例 `WebSocketManager`，一般通过模块导出的函数操作

## 连接

用户登录后会在`src/permission.ts`中主动连接（与 `initApp` 并行执行，互不依赖），一般无需手动调用

连接前会先调用后端 `getOnceToken` 接口获取**一次性令牌**，再以 `VITE_APP_WS_API?token=<一次性令牌>&clientId=<浏览器指纹>&clientType=web` 建立连接，令牌单次有效，避免长连接复用正式 token 带来的泄露面

```typescript
import { connect } from '@/utils/web-socket'
// 连接到websocket
await connect()
```

## 断开

token失效或退出登录时会主动断开，一般无需手动调用

```typescript
import { closeConnect } from '@/utils/web-socket'
// 没有token断开websocket连接
closeConnect()
```

## 心跳与自动重连

- 连接成功后每 **30 秒** 发送一次 `WS_HEARTBEAT` 心跳保活
- 异常断开（关闭码非 1000）时自动重连，间隔 2 秒，最多 **3 次**；达到上限后停止自动重连
- 手动重连：达到上限或需要主动恢复时调用 `manualReconnect`（清零计数重启新一轮自动重试，连接在存时忽略），头部连接状态图标点击即触发

```typescript
import { manualReconnect } from '@/utils/web-socket'
// 手动重连
manualReconnect()
```

## 连接状态

模块导出响应式状态 `wsStatus`，取值 `connected` / `reconnecting` / `disconnected`，头部状态图标即按此渲染：

```typescript
import {wsStatus} from "@/utils/web-socket.ts";
// 头部图标展示连接状态
const status = wsStatus.value
```

## 发送数据

调用 sendMessage() 方法发送消息，接收两个参数，消息类型和消息。消息类型需与后台定义相同，用于区分不同业务。消息以 `{type, data, timestamp}` 协议封装后发送，连接未就绪时返回 false

```typescript
import { sendMessage } from '@/utils/web-socket'
// 发送心跳
sendMessage("WS_HEARTBEAT", "ping")
```

## 接收数据

在需要添加监听时调用addEventListener函数，接收两个参数，消息类型和监听回调。 消息类型需与后台定义相同，用于区分不同业务。回调函数中会拿到后端发送的数据

系统内置消息类型：

| 消息类型 | 说明 |
| --- | --- |
| `WS_HEARTBEAT` | 心跳保活（客户端 30 秒一次） |
| `WS_NOTICE` | 通知公告推送（头部消息通知组件实时刷新） |
| `WS_REFRESH_PERMISSION` | 权限数据变更推送（角色/菜单变更定向推送，头部用户组件置「数据更新」红点） |

```typescript
import {addEventListener} from "@/utils/web-socket.ts";
// 添加websocket监听
addEventListener("WS_TYPE", (data: Type) => {console.log("拿到的websocket数据" + data)})
```

## 删除接收监听

在不需要添加监听时调用removeEventListener函数，传入消息类型即可

```typescript
import {removeEventListener} from "@/utils/web-socket.ts";
// 删除websocket监听
removeEventListener("WS_TYPE")
```
