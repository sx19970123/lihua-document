# 图标选择

需要动态配置图标的场景，系统中用于指定头像图标

::: warning 提示

图标选择组件依赖于 `plugins/buildIcons` vite插件，在`vite.config.ts` 已配置，项目启动时会读取`/src/static/icons` 中的文件，生成图标目录`/src/subpackages/system/static/icons.json` 

与web端保持一致， `Outlined` 结尾被分类到线框，`Filled` 结尾被分类到实底，`TwoTone` 结尾被分类到双色，其余将被分类到自定义。不在 ``/src/static/icons`` 中维护的图标在组件中无法显示

:::

## 基础用法

引入组件 `import IconSelect from '@/components/icon-select/index.vue'`

使用 `v-model:value="value"` 进行双向绑定

![IMG_1957](./icon-select.assets/IMG_1957.jpeg)

``` vue
<template>
	<view class="content">
		<view class="description">
			图标选择组件初衷是用户头像与web端保持一致，IconSelect 中选中的值，
			与sar-icon 组件使用规则：
			线框、实底为 family="iconName后缀首字母小写" name="iconName"
			双色、自定义 为读取的 src/static/icons/svg 下的svg文件
			</view>
		<view class="model-val">双向绑定：{{value}}</view>
		<IconSelect v-model:value="value" width="686rpx" height="50vh"></IconSelect>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconSelect from '@/components/icon-select/index.vue'
const value = ref<string>()
</script>
```

## API

### 双向绑定

| 属性名称      | 描述     | 类型   | 默认值 | 是否必填 |
| ------------- | -------- | ------ | ------ | -------- |
| v-model:value | 双向绑定 | string | -      | 是       |

### 属性

| 属性名称 | 描述                                 | 类型   | 默认值 | 是否必填 |
| -------- | ------------------------------------ | ------ | ------ | -------- |
| height   | 图标容器高度                         | string | 25vh   | 否       |
| width    | 图标容器宽度（750rpx为100%屏幕宽度） | string | 718rpx | 否       |