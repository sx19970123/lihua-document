# 加载动画

页面局部需要加载占位的场景使用（如列表首屏加载、局部区块等待）

纯 CSS 圆环加载组件（`src/components/app-loading/index.vue`），已在 `pages.json` 中注册 easycom 规则（`^app-loading$`），模板中直接使用，无需 import

## 基础用法

``` vue
<template>
	<view class="content">
		<!-- 默认用法 -->
		<app-loading />

		<!-- 带文案纵向排列 -->
		<app-loading text="努力加载中" vertical />

		<!-- 自定义颜色与尺寸 -->
		<app-loading color="var(--sar-primary)" size="60rpx" text="加载中" vertical />
	</view>
</template>
```



## API

### 属性

| 属性名称     | 描述                       | 类型                                  | 默认值                    | 是否必填 |
| ------------ | -------------------------- | ------------------------------------- | ------------------------- | -------- |
| size         | 圆环尺寸                   | string                                | 44rpx                     | 否       |
| strokeWidth  | 圆环描边宽度               | string                                | 4rpx                      | 否       |
| color        | 圆环与默认文字颜色         | string                                | var(--sar-secondary-color) | 否       |
| trackOpacity | 轨道透明度                 | number                                | 0.28                      | 否       |
| text         | 可选加载文案               | string                                | ''                        | 否       |
| textColor    | 文案颜色（默认跟随圆环）   | string                                | ''                        | 否       |
| textSize     | 文案字号                   | string                                | 26rpx                     | 否       |
| vertical     | 是否纵向排列圆环和文案     | boolean                               | false                     | 否       |
| rootClass    | 根节点附加类名             | string                                | ''                        | 否       |
| rootStyle    | 根节点附加样式             | string \| Record\<string, string \| number\> | ''                  | 否       |
