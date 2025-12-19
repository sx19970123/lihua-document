# websocket

系统集成了websocket `.env` 中配置后台ip即可使用

## 连接

用户登录后会在`src/permission.ts`中主动连接，一般无需手动调用

```typescript
import { websocket } from '@/utils/WebSocket'
// 连接到websocket
await connect()
```

## 断开

token失效或退出登录时会主动断开，一般无需手动调用

```typescript
import { closeConnect } from '@/utils/WebSocket'
// 没有token断开websocket连接
closeConnect()
```

## 发送数据

调用 sendMessage() 方法发送消息，接收两个参数，消息类型和消息。 消息类型需与后台定义相同，用于区分不同业务。消息需要可转为json或为字符串类型

```typescript
import { sendMessage } from '@/utils/WebSocket'
// 发送心跳
websocket.sendMessage("WS_HEARTBEAT", "ping")
```

## 接收数据

在需要添加监听时调用addEventListener函数，接收两个参数，消息类型和监听回调。 消息类型需与后台定义相同，用于区分不同业务。回调函数中会拿到后端发送的数据

```typescript
import {addEventListener} from "@/utils/WebSocket.ts";
// 添加websocket监听
addEventListener("WS_TYPE", (data: Type) => {console.log("拿到的websocket数据" + data)})
```

## 删除接收监听

在不需要添加监听时调用removeEventListener函数，传入消息类型即可

```typescript
import {removeEventListener} from "@/utils/WebSocket.ts";
// 删除websocket监听
removeEventListener("WS_TYPE")
```