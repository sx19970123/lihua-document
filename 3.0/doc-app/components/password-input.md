# 密码输入

需要录入密码并实时反馈密码强度的场景使用（修改密码、登录后设置向导重置密码等）

组件（`src/components/password-input/index.vue`）在密码输入框下方提供三段式强度指示条（红/黄/绿三条进度），随输入实时点亮：

- **弱**：长度 ≥ 6 位
- **中**：长度 ≥ 8 位且同时包含字母与数字（字母按 Unicode 判定，中文等非拉丁字母同样计入）
- **强**：长度 ≥ 10 位且同时包含字母、数字与符号

## 基础用法

引入组件 `import PasswordInput from '@/components/password-input/index.vue'`，使用 `v-model:value` 进行双向绑定：

``` vue
<template>
	<view class="content">
		<view class="model-val">密码：{{password}}</view>
		<password-input v-model:value="password" placeholder="请输入新密码"/>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import PasswordInput from '@/components/password-input/index.vue'

const password = ref<string>('')
</script>
```

::: info 前置图标
`showPrepend` 为 true 时输入框前置显示锁图标（登录后设置向导等场景使用），缺省不显示。
:::

## API

### 双向绑定

| 属性名称      | 描述         | 类型   | 默认值 | 是否必填 |
| ------------- | ------------ | ------ | ------ | -------- |
| v-model:value | 绑定的密码值 | string | -      | 是       |

### 属性

| 属性名称     | 描述                       | 类型    | 默认值 | 是否必填 |
| ------------ | -------------------------- | ------- | ------ | -------- |
| value        | 密码值（配合 v-model 使用） | string  | -      | 否       |
| showPrepend  | 是否显示前置锁图标         | boolean | -      | 否       |
| placeholder  | 输入框占位文本             | string  | -      | 否       |
| clazz        | 输入框附加类名             | string  | -      | 否       |

### 行为说明

| 行为         | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| 强度指示     | 输入时实时计算并点亮三段式强度条；值为空时隐藏指示条          |
| 外部换绑     | 外部重置/换绑密码时自动同步输入框并重算强度                   |
| 输入能力     | 密码框自带明文切换（show-eye）与清除按钮，最长 30 位          |
