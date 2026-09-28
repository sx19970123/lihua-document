# websocket

系统集成了websocket `.env.development` 中配置后台地址（`VITE_APP_WS_API`）即可使用
```typescript
// 使用websocket需要先引入单例
import { webSocket, wsStatus } from '@/utils/web-socket'
```

## 连接

连接地址需要一次性令牌：`connect()` 内部先调用 `app/system/auth/onceToken` 接口换取 token，再拼接 `token`、`clientId`（UUID）、`clientType` 查询参数建立连接

用户登录后会在`src/router/router.ts`的路由守卫中主动连接，一般无需手动调用
```typescript
// 连接到websocket
webSocket.connect()
```

连接建立后每 30s 自动发送一次心跳（`WS_HEARTBEAT`）；连接异常断开时自动重连，最多重试 3 次（间隔 2s），耗尽后 `wsStatus` 置为 `disconnected`，等待手动重连或重新登录。

## 断开

token失效或退出登录时会主动断开，一般无需手动调用
```typescript
// 没有token断开websocket连接
webSocket.closeConnect()
```

## 手动重连

自动重连额度耗尽（`wsStatus === 'disconnected'`）后，可由 UI 层显式调用恢复连接（清零重试计数重启新一轮自动重连）：

```typescript
import { webSocket, wsStatus } from '@/utils/web-socket'

// wsStatus 为响应式状态：connected=已连接 / reconnecting=连接中 / disconnected=已断链
if (wsStatus.value === 'disconnected') {
  webSocket.manualReconnect()
}
```

## 发送数据
调用 sendMessage() 方法发送消息，接收两个参数，消息类型和消息。
消息类型需与后台定义相同，用于区分不同业务。消息需要可转为json或为字符串类型。未连接时发送失败并返回 false，不会抛错
```typescript
// 发送心跳（内部自动发送，业务一般无需调用）
const ok = await webSocket.sendMessage("WS_HEARTBEAT", "ping")
```

## 接收数据

在需要添加监听时调用addEventListener函数，接收两个参数，消息类型和监听回调。
消息类型需与后台定义相同，用于区分不同业务。回调函数中会拿到后端发送的数据

::: warning 全局监听统一住 App.vue
WebSocket 的全局业务监听（消息通知、权限更新）统一在 `App.vue` 的 `onLaunch` 中接线——App.vue 生命周期是应用级的，只注册一次，不会随页面切换重复注册。业务局部监听可在页面组件中按需添加。
:::

项目中在 App.vue 全局使用websocket接收消息通知与权限更新：

```typescript
// App.vue
// 处理websocket消息通知监听
const addNoticeEventListener = () => {
	// 订阅notice通知消息
	webSocket.addEventListener("WS_NOTICE", (data: NoticeMessage) => {
		// 原生通知横幅（平台分叉在 helper 内部，非 APP 平台为空实现）
		showNoticePush(data)

		// 重新获取未读消息数量（unreadCount 变化经 watch 驱动红点更新）
		noticeStore.getUnreadCount()
	})

	// 权限数据更新提示：角色/菜单变更后服务端定向推送——置红点（tabBar + 个人中心头像），
	// 点击头像静默刷新生效
	webSocket.addEventListener("WS_REFRESH_PERMISSION", () => {
		useUserStore().$state.permissionUpdate = true
	})
}
```

### 原生通知横幅（平台分叉）

`WS_NOTICE` 的横幅编排收敛在 `src/helpers/notice-notify.ts` 的 `showNoticePush()` 中，函数体内条件编译：**仅 App 端**用 `plus.nativeObj.View` 原生绘制横幅（点击跳转详情页并标记已读、向下滑动打开全局轻量通知抽屉），其余平台编译为空实现，调用点无需再做平台判断。

### tabBar 红点

未读数量与权限待更新两个红点来源共用 `uni.showTabBarRedDot` 的单槽位，亮/灭统一经 `src/helpers/tabbar-red-dot.ts` 收敛判定（任一来源为真即亮）；`unreadCount` 与 `permissionUpdate` 的变化由 App.vue 中的 watch 驱动，切回 tabBar 页时由 AppRoot 的 onShow 重设。
