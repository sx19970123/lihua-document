# 系统字典
字典作为业务开发中常用功能，app端进行了移植，用法与web端保持一致
::: warning 提示
initDict()中获取到的字典选项集合为响应式对象，ts中使用需.value，极端情况下可能需要配合watch使用
:::

字典在后端`系统管理`-`字典管理`中进行维护

![image-20251217104637275](./dict.assets/image-20251217104637275.png)

## 获取字典选项

```typescript
// 引入 @/utils/Dict，拿到initDict函数
import { initDict } from '@/utils/Dict'

// 参数中传入dict_code，返回对象中原封不动解构出来即可使用
const {sys_notice_type} = initDict("sys_notice_type")
```

获取到的ts类型为
```typescript
interface SysDictDataType {
  /**
   * 主键id
   */
  id?: string;

  /**
   * 父级id
   */
  parentId?: string;

  /**
   * 字典类型编码
   */
  dictTypeCode?: string;

  /**
   * 字典标签
   */
  label?: string;

  /**
   * 字典值
   */
  value?: string;

  /**
   * 字典排序
   */
  sort?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 删除标识
   */
  delFlag?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 回显颜色
   */
  tagStyle?: string;

  /**
   * 数据子集
   */
  children?: Array<SysDictDataType>;
}

```

## 根据value获取label
```typescript
// 导入 initDict和getDictLabel
import { initDict, getDictLabel } from '@/utils/Dict'
// 拿到目标字典选项集合
const {sys_notice_type} = initDict("sys_notice_type")
// 传入字典选项集合和需要翻译的value，将返回balel，如果不存在则直接返回value
const label = getDictLabel(sys_notice_type.value, '1')
```
## 在模板中使用
模板中可以将字典翻译为tag标签，样式颜色与后端定义的相同。使用时需要保证 dict-data-value 值存在，可以使用v-if进行判断加载，[详见](/doc-app/components/dict-tag)
``` vue
<template>
	<view class="content">
        <!--组件中使用 
            dict-data-option 传如字典选项，
            dict-data-value 传入需要被翻译的值
        -->
        <dict-tag dict-data-value="0" :dict-data-option="sys_status"/>
	</view>
</template>

<script lang="ts" setup>
// 引入 DictTag 组件
import DictTag from "@/components/dict-tag/index.vue"
// 引入 initDict 函数
import {initDict} from "@/utils/Dict"
// 获取字典选项列表
const {sys_status} = initDict("sys_status")
</script>
```