# websocket

系统集成了websocket `.env`中配置后台ip即可使用
```typescript
// 使用websocket需要先引入到组件
import { websocket } from '@/utils/WebSocket'
```

## 连接
用户登录后会在`src/router/Router.ts`中主动连接，一般无需手动调用
```typescript
// 连接到websocket
websocket.connect()
```
## 断开
token失效或退出登录时会主动断开，一般无需手动调用
```typescript
// 没有token断开websocket连接
websocket.closeConnect()
```
## 发送数据
调用 sendMessage() 方法发送消息，接收两个参数，消息类型和消息。
消息类型需与后台定义相同，用于区分不同业务。消息需要可转为json或为字符串类型
```typescript
// 发送心跳
websocket.sendMessage("WS_HEARTBEAT", "ping")
```
## 接收数据
在需要添加监听时调用addEventListener函数，接收两个参数，消息类型和监听回调。
消息类型需与后台定义相同，用于区分不同业务。回调函数中会拿到后端发送的数据
```typescript
// 添加websocket监听
websocket.addEventListener("WS_TYPE", (data: Type) => {console.log("拿到的websocket数据" + data)})
```
项目中使用websocket接收消息通知
```typescript
// 处理websocket消息通知监听
const addNoticeEventListener = () => {
	// 订阅notice通知消息
	websocket.addEventListener("WS_NOTICE", (data: NoticeMessage) => {
		// #ifdef APP-PLUS
		// 全局通知推送（仅原生app）
		showNotify(data)
		// #endif
		
		// 重新获取未读消息数量，尝试更新红点
		noticeStore.getUnreadCount().finally(() => noticeStore.setTabbarRedDot())
	})
}
```

## 删除接收监听
在不需要添加监听时调用removeEventListener函数，传入消息类型即可
```typescript
// 删除websocket监听
websocket.removeEventListener("WS_TYPE")
```