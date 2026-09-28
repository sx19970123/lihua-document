# 路由

> uniapp 的页面需要在 `page.json` 中定义才可进行路由跳转

## 路由守卫

> 官方路由没有提供路由守卫，导致页面跳转时无法统一进行逻辑处理，为了解决这个痛点，系统使用sard-uniapp组件库提供的 Router 能力，支持路由前置守卫，根据返回值进行放行、拒绝、重定向；API 使用方式与官方保持一致，[详见sard-uniapp文档](https://sard.wzt.zone/sard-uniapp-docs/utilities/router)

在 `src/router/router.ts` 中定义了路由守卫 `checkRouteGuard`，逻辑与web端路由守卫一致：

**有 token 时：**

1. 登录后存在待补全项（`helpers/user-setup` 暂存），任何跳转都会被拉回登录后设置向导页 `/pages/user-setup/UserSetup`（目标即为向导页时放行；覆盖杀 App 重启、直接打开任意页等绕过路径）
2. 用户信息不存在时乐观放行，同时异步预热：`initUserInfo()`（Promise 去重）、`webSocket.connect()`、`noticeStore.getUnreadCount()`、`initDict("sys_notice_type")`

**无 token 时：**

1. 断开 websocket 连接，清理未完成的登录后补全暂存
2. 访问的是公开路由则放行，否则 reLaunch 回登录页

公开路由表定义在 `src/constants/public-routes.ts`，名单内的路由可在未登录时访问：

``` typescript
/**
 * 无需登录即可访问的路由列表
 */
const PUBLIC_ROUTES = [
	// 首屏页
	"/pages/splash/index",
	// 登录
	"/pages/login/Login",
	// 注册
	"/pages/login/Register",
	// 隐私政策
	"/subpackages/system/protocol/PrivacyPolicy",
	// 用户协议
	"/subpackages/system/protocol/UserAgreement",
	// 错误兜底页（403/404/451，未登录直达也要能展示）
	"/pages/error/Error"
	]
```

::: info H5 补验守卫
H5 端地址栏输入、收藏直达、浏览器前进后退不经过 sard Router 的包装方法，`beforeEach` 不会执行。项目在 `App.vue` 的 `onLaunch` 中调用 `setupH5Guard()` 补验：冷启动首验启动路径 + 监听 `hashchange`，复用同一份 `checkRouteGuard` 判定进行纠偏；未注册路径直接 reLaunch 到 404 错误页。非 H5 平台为空操作。
:::

## 使用路由

与官方路由随时调用不同，本项目中想要经过路由拦截器，需要先 `import router from '@/router/router'` 后使用`router`提供的跳转函数，**函数用法与官方一致**，例： 

``` vue
<template>
  <sar-list card>
    <sar-list-item title="设置" @click="toSetting" icon-family="icon" icon="SettingOutlined" hover arrow/>
    <sar-list-item title="组件" @click="toComponentList" icon-family="icon" icon="SkinOutlined" hover arrow/>
    <sar-list-item title="仓库" @click="toGitee" icon-family="custom" icon="GiteeCustom" hover arrow/>
  </sar-list>
</template>
<script setup lang="ts">
// 调用前需要引入 router
import router from '@/router/router'


// 前往gitee
const toGitee = () => {
	router.navigateTo({
		url: "/pages/webview/index?url=" + encodeURIComponent('https://gitee.com/yukino_git/lihua-app')
	})
}

// 前往设置
const toSetting = () => {
	router.navigateTo({
		url: "/subpackages/system/setting/index"
	})
}

// 前往组件列表
const toComponentList = () => {
	router.navigateTo({
		url: '/subpackages/system/components/index'
	})
}

// 前往用户设置
const toUserSetting = () => {
	router.navigateTo({
		url: "/subpackages/system/setting/user/index"
	})
}

// 前往消息通知
const toNotice = () => {
	router.navigateTo({
		url: "/subpackages/system/notice/index"
	})
}
</script>

```
