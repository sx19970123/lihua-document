# 路由

> uniapp 的页面需要在 `page.json` 中定义才可进行路由跳转

## 路由守卫

> 官方路由没有提供路由守卫，导致页面跳转时无法统一进行逻辑处理，为了解决这个痛点，系统使用sard-uniapp组件库提供的路由能力，支持路由前置守卫，根据返回值进行放行、拒绝、重定向；API 使用方式与官方保持一致，[详见sard-uniapp文档](https://sard.wzt.zone/sard-uniapp-docs/utilities/router)

在 `src/router/Router.ts` 中定义了路由守卫，逻辑与web端路由守卫一致，并定义了路由白名单，在名单内的路由可在未登录时访问

``` typescript
/**
 * 无需登录即可访问的路由列表
 */
const publicRoutesList = [
	// 首屏页
	"/pages/splash/index",
	// 登录
	"/pages/login/Login",
	// 注册
	"/pages/login/Register",
	// 隐私政策
	"/subpackages/system/protocol/PrivacyPolicy",
	// 用户协议
	"/subpackages/system/protocol/UserAgreement"
	]
```

## 使用路由

与官方路由随时调用不同，本项目中想要经过路由拦截器，需要先 `import router from '@/router/Router'` 后使用`router`提供的跳转函数，**函数用法与官方一致**，例： 

``` vue
<template>
  <sar-list card>
    <sar-list-item title="设置" @click="toSetting" icon-family="outlined" icon="SettingOutlined" hover arrow/>
    <sar-list-item title="组件" @click="toComponentList" icon-family="outlined" icon="SkinOutlined" hover arrow/>
    <sar-list-item title="仓库" @click="toGitee" icon-family="custom" icon="GiteeCustom" hover arrow/>
  </sar-list>
</template>
<script setup lang="ts">
// 调用前需要引入 router
import router from '@/router/Router'


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

// 前往修改部门
const toChangeDept = () => {
	router.navigateTo({
		url: "/subpackages/system/setting/user/SaveDefaultDept"
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

