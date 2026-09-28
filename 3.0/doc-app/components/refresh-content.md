# 下拉刷新

列表页需要下拉刷新 + 上拉加载的场景使用，用于替代原生 `enablePullDownRefresh`

组件为页面级「下拉刷新 + 上拉加载」一体组件（`src/components/refresh-content/index.vue`）：自绘触摸手势 + renderjs 视图层桥接，对外暴露与 mescroll 兼容的 API 形状；两段线性阻尼（阈值前 1:1、越阈值后 0.2）、越阈值轻震动一次。组件演示页：`subpackages/system/components/pull-refresh`。

## 使用契约

::: warning 使用前必读
以下 8 条为该组件的使用契约，违反会导致下拉失效、加载态卡死或手势冲突，请逐条对照检查：
:::

1. **父级必须确定高度**：页面根节点使用 `height: 100vh`，勿用 `min-height`——组件根 `min-height: 100%` 在父链无确定 height 时退化为 0，列表不满屏时下方空白区域在组件根之外、touchstart 不触发（空白区无法下拉）
2. **页面级滚动**：列表不套 `scroll-view`、不写死列表容器高度；不开启 `enablePullDownRefresh`（原生下拉与手势冲突）
3. **每页仅一个实例**：`onPageScroll`/`onReachBottom` 在组件 setup 内注册、挂到当前页面实例，一页多实例会相互覆盖
4. **自定义导航栏让位**：`navigationStyle: custom` 页面传 `:top`（状态栏+导航栏高的 rpx 值）；原生导航栏页面不传
5. **侧滑锁定**：带 `sar-swipe-action-group` 的列表容器加 `root-class="ptr-swipe-lock"`（renderjs 侧滑锁定契约，防横滑列表项与下拉手势冲突）
6. **请求结束必须回调**：`mescroll.endSuccess(本页条数, 是否有下一页)` 或 `mescroll.endErr()`（失败内部自动回退页码），漏调会一直停在加载态
7. **renderjs 仅 APP/H5 编译**：小程序端逻辑层手势照常，微信端自绘下拉与页面回弹可能轻微叠加（已知限制）
8. **越阈值震动仅 APP 端生效**（`utils/haptic` 为 APP-PLUS 条件编译），H5/小程序无感

## 基础用法

页面根节点 `height: 100vh`，组件内放列表内容，通过 `@init`/`@refresh`/`@load-more` 处理请求，结束时回调 `endSuccess` / `endErr`：

``` vue
<template>
	<view class="page">
		<RefreshContent
			:down="{ use: true, offset: 80 }"
			:up="{ use: true, auto: false, page: { size: 10 } }"
			:loading="!loaded"
			:empty="loaded && items.length === 0"
			@init="onInit"
			@refresh="onRefresh"
			@load-more="onLoadMore"
		>
			<template #empty>
				<sar-empty description="暂无数据"/>
			</template>

			<sar-list card>
				<sar-list-item v-for="i in items" :key="i" :title="`条目 ${i}`"/>
			</sar-list>
		</RefreshContent>
	</view>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'
import RefreshContent from '@/components/refresh-content/index.vue'
import type { MescrollInstance } from '@/components/refresh-content/type'

const PAGE_SIZE = 10

const items = ref<number[]>([])
const loaded = ref(false)

// 页面样式契约：height 而非 min-height（使用契约第 1 条）
</script>

<style scoped lang="scss">
.page {
	height: 100vh;
}
</style>
```

请求处理示例（契约第 6 条：结束必须回调）：

``` typescript
let mescrollRef: MescrollInstance | undefined

// init 后自动执行首屏加载
const onInit = (mescroll: MescrollInstance) => {
	mescrollRef = mescroll
	onRefresh(mescroll)
}

// 下拉刷新：拉取第一页
const onRefresh = async (mescroll: MescrollInstance) => {
	try {
		const list = await queryList({ pageNum: 1, pageSize: PAGE_SIZE })
		items.value = list.records
		loaded.value = true
		mescroll.endSuccess(list.records.length, list.total > PAGE_SIZE)
	} catch {
		mescroll.endErr()
	}
}

// 上拉加载：拉取下一页
const onLoadMore = async (mescroll: MescrollInstance) => {
	try {
		const list = await queryList({ pageNum: mescroll.num, pageSize: mescroll.size })
		items.value = items.value.concat(list.records)
		mescroll.endSuccess(list.records.length, list.total > items.value.length)
	} catch {
		mescroll.endErr()
	}
}
```



## API

### 属性

| 属性名称 | 描述                                                             | 类型                          | 默认值 | 是否必填 |
| -------- | ---------------------------------------------------------------- | ----------------------------- | ------ | -------- |
| top      | 顶部让位高度（自定义导航栏页面传状态栏+导航栏高的 rpx 值）       | string \| number              | 0      | 否       |
| bottom   | 底部让位高度                                                     | string \| number              | 0      | 否       |
| down     | 下拉刷新配置：`use` 是否启用、`offset` 阈值（px）、`inOffsetRate`/`outOffsetRate` 阻尼系数（`auto` 仅透传实例对象，不驱动行为） | Object                        | {}     | 否       |
| up       | 上拉加载配置：`use` 是否启用、`auto` 组件挂载后是否自动发起首屏加载、`page.size` 每页条数、`noMoreSize`「没有更多」提示的最少剩余条数 | Object                        | {}     | 否       |
| theme    | 主题                                                             | 'auto' \| 'light' \| 'dark'   | 'auto' | 否       |
| empty    | 空态插槽显隐                                                     | boolean                       | false  | 否       |
| loading  | 首屏/静默加载占位显隐                                            | boolean                       | false  | 否       |
| topbar / safearea / bottombar / sticky | 旧 mescroll-body 专属配置，新版已转为 no-op，保留接收避免页面传参报错 | -                             | -      | 否       |

### 事件

| 事件名称   | 描述                       | 回调参数             |
| ---------- | -------------------------- | -------------------- |
| init       | 组件初始化完成时触发       | mescroll 实例        |
| refresh    | 下拉刷新触发时触发         | mescroll 实例        |
| load-more  | 触底加载更多时触发         | mescroll 实例        |
| emptyclick | 点击空态区域时触发         | mescroll 实例        |

### 插槽

| 插槽名称 | 描述               |
| -------- | ------------------ |
| default  | 列表内容           |
| empty    | 空态内容（配合 empty 属性显隐） |

### Mescroll 实例（API 要点）

| 方法                              | 描述                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| endSuccess(dataSize?, hasNext?)   | 请求成功回调：传入本页条数与是否有下一页；未传 hasNext 时按条数是否满页推断 |
| endErr()                          | 请求失败回调：内部自动回退页码，便于下次重试                  |
| endByPage(dataSize, totalPage?)   | 按总页数判定是否有下一页的成功回调                            |
| endBySize(dataSize, totalSize?)   | 按总条数判定是否有下一页的成功回调                            |
| resetUpScroll(isShowLoading?)     | 重置上拉加载（页码归零），用于筛选条件变化后重新拉取          |
| triggerDownScroll()               | 主动触发下拉刷新                                              |
| scrollTo(y, duration?)            | 滚动到指定位置                                                |
| num / size                        | 当前页码 / 每页条数（请求分页参数直接取用）                   |
