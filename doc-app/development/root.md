# 根节点
uniapp 中并没有web端类似的根节点，项目引入了`uni-ku/root`组件来实现全局根节点[官方文档](https://uni-ku.js.org/projects/root/introduction)

`uni-ku/root` 更像是将根节点中定义的内容编译到了各个组件中，使用时应避免从根节点处理过重的任务

## 组件
根节点位于项目 `src/AppRoot.vue` 里面定义的模版可应用到各个组件中，项目中将`sard-uniapp`需要的代理组件都放置在根节点组件，业务中需要时直接调用ts api即可
```vue
<template>
	<view>
		<KuRootView />
		<!-- 通知代理组件 -->
		<sar-notify-agent />
		<!-- 模态框代理组件 -->
		<sar-dialog-agent />
		<!-- 裁剪组件代理 -->
		<sar-crop-image-agent />
		<!-- 轻量通知组件 -->
		<notice-lite v-model="noticeLiteVisible" :notice-id="noticeId"/>
	</view>
</template>
```
## 生命周期
不要将 uni-ku/root 的生命周期与 App.vue 的生命周期混淆。
App.vue 的生命周期对应的是整个应用级别，只会在应用启动、前后台切换等场景触发。
而 uni-ku/root 本质上是一个组件，其生命周期与组件实例的存在保持一致：每次页面跳转时，根节点组件都会被重新创建，从而触发其完整的生命周期流程。

**执行顺序** [来自官网](https://uni-ku.js.org/projects/root/features#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F)
1. 根组件的 onLaunch / created
2. 根组件的 onLoad
3. 页面组件的 onLoad
4. 根组件的 onShow
5. 页面组件的 onShow
6. 根组件的 onReady
7. 页面组件的 onReady

## 获取根节点实例
根节点实例保存在了rootStore中，使用方法与其他store一致

```typescript
// 引入 useRootRefStore
import {useRootRefStore} from "@/stores/root"
// 获取rootRefStore实例
const rootRefStore = useRootRefStore()
// 调用根节点中 defineExpose 的方法
const ref = rootRefStore.getRootRef()
```