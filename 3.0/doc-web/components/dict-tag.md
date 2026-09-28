# 字典标签

列表或页面中涉及字典翻译时使用

## 基础用法

1. 引入组件 `import DictTag from "@/components/dict-tag/index.vue"`
2. 引入方法 `import {initDict} from "@/helpers/dict"`，初始化字典选项 `const {sys_status} = initDict("sys_status")`
3. 设置字典选项 `:dict-data-option="sys_status"`
4. 设置需要被翻译的值 `dict-data-value="0"`

![image-20241219212948218](./dict-tag.assets/image-20241219212948218.png)

```vue
<template>
  <a-typography-title :level="4">最简单的字典回显</a-typography-title>
  <dict-tag dict-data-value="0" :dict-data-option="sys_status"/>
  <dict-tag dict-data-value="1" :dict-data-option="sys_status"/>
</template>

<script setup lang="ts">
import DictTag from "@/components/dict-tag/index.vue"
import {initDict} from "@/helpers/dict"
const {sys_status} = initDict("sys_status")
</script>
```

## 树形字典回显

树形字典可通过配置`full-tree-node`属性来展示单节点或全路径，`root-tree-node-prefix`属性可指定根节点前缀

![image-20241219213417477](./dict-tag.assets/image-20241219213417477.png)

```vue
<template>
  <a-typography-title :level="4">树形字典回显</a-typography-title>
  <a-typography>某一节点的回显</a-typography>
  <dict-tag dict-data-value="2-2" :dict-data-option="test_tree"/>
  <a-typography>展示全路径</a-typography>
  <dict-tag dict-data-value="2-2-1" :dict-data-option="test_tree" full-tree-node/>
  <a-typography>路径前增加前缀</a-typography>
  <dict-tag dict-data-value="2-2-1" :dict-data-option="test_tree" full-tree-node root-tree-node-prefix="~"/>

  <a-typography-text strong>树形字典结构</a-typography-text>
  <a-row>
    <a-col :span="4">
      <a-tree style="padding: 16px"
              v-if="test_tree.length"
              :tree-data="test_tree"
              :field-names="{children:'children', title:'label'}"
              default-expand-all/>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import DictTag from "@/components/dict-tag/index.vue"
import {initDict} from "@/helpers/dict"
const {test_tree} = initDict("test_tree")
</script>
```

## 标签变体与样式

`variant` 属性透传 a-tag 的标签变体（`outlined` 有边框 / `filled` 填充 / `solid` 实底），`styles` 属性透传 a-tag 的语义化自定义样式。被翻译的值为空或未命中时渲染为空（列表数据的合法形态，不视为配置错误）

## API

### 属性

| 属性名称           | 描述               | 类型              | 默认值                | 是否必填 |
| ------------------ | ------------------ | ----------------- | --------------------- | -------- |
| dictDataOption     | 字典data集合       | SysDictDataType[] | -                     | 是       |
| dictDataValue      | 被翻译的字典值     | string            | -                     | 是       |
| variant            | 标签变体（透传 a-tag variant） | 'outlined' \| 'filled' \| 'solid' | 'outlined' | 否 |
| styles             | 标签语义化自定义样式（透传 a-tag styles） | Object | { root: { marginRight: 0 } } | 否 |
| fullTreeNode       | 展示树型结构全路径 | boolean           | false                 | 否       |
| fullTreeSeparator  | 树型结构分隔符     | string            | /                     | 否       |
| rootTreeNodePrefix | 树型根节点前缀     | string            | ''                    | 否       |
