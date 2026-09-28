# 状态管理

项目使用`pinia`作为状态管理工具

## 项目store

将公共的属性和函数管理起来，方便在各个组件调用，项目中store位于`src/stores` 目录下，共六个：`user` / `permission` / `theme` / `dict` / `setting` / `view-tabs`



### 用户（user）

- 获取用户相关信息：id、昵称、用户名、头像、角色、权限、部门（含默认部门）、岗位（含默认部门下岗位）、权限变更红点标志 `permissionUpdate`
- 主要 action：
  - `initUserInfo()`：调用 `queryAuthInfo` 一次拉取登录用户全量数据并赋值 state
  - `handleLogout()`：退出登录（关 WS → 调后端 logout → 清空用户信息）
  - `authenticationFailure(msg)`：认证失效联动（5 秒单飞窗，清态 + 跳登录 + 提示）
  - `updateDefaultDept(dept)`：更新默认部门并联动默认岗位集合
  - `subscribeThemeSync()` / `unsubscribeThemeSync()`：挂接/拆除主题变更防抖同步（800ms 回存服务端）
  - `clearUserInfo()`：清空用户信息、移除 token、清空字典 store

详细字段与方法见[用户信息](/3.0/doc-web/development/user-info)

### 主题（theme）

可获取当前外观模式（`themeMode`：light/dark/auto）与暗色实际态（`isDarkTheme`）、布局类型、主题颜色等，另外提供了主题变化的配置方法（`changeThemeMode` / `changeColorPrimary` / `changeBorderRadius` / `resetState` / `enableGrayModel` 等），这些配置在「系统设置」页面进行调用。亮暗档位唯一事实源为 `localStorage['theme-mode']`，其余主题配置以服务端为唯一事实源，详见[系统主题](/3.0/doc-web/development/theme)

### 设置（setting）

​	系统设置管理主要提供了`保存系统配置`和`根据组件名称获取对应的配置信息`。像是刚进入登录页检测是否开启了验证码、自助注册、灰色模式，就是通过该store进行查询（`initBaseSetting` 并行拉取三项开关）。

​	另外就是在`/views/system/setting`（系统设置相关）中的组件进行了使用

### 字典（dict）

​	字典管理一般无需直接调用，dict store 以 Map 结构按字典编码缓存字典选项，`helpers/dict.ts` 的 `initDict` 依赖了`useDictStore`，大部分开发只需调用 `@/helpers/dict` 中的方法即可，详见[系统字典](/3.0/doc-web/development/sys-dict)

### 菜单（permission）

​	usePermissionStore 中主要提供了`动态路由`和`菜单`的加载（`initDynamicRouter` / `initMenu` / `reloadMenu`），在` app-init ` 和 `Layout` 的菜单中进行了使用。除此之外还提供了当前菜单状态（展开/折叠 `collapsed`）和菜单路由对象的管理。动态路由基于 `import.meta.glob('../views/**/*.vue')` 收集页面组件，配合 `Layout`/`MiddleView`/`Iframe` 三类特殊 component 值还原层级，详见[路由](/3.0/doc-web/core/router)

### 多任务标签页（viewTabs）

​	多任务栏管理主要提供了标签页的打开/关闭、固定/取消固定、拖拽排序、右键菜单（关闭左侧、关闭右侧、关闭其他等）功能的实现，以及 keep-alive 组件缓存集合的维护。打开的标签列表与最近使用列表按用户名持久化到 localStorage（`cacheViewTabs-<username>` / `recent-tabs-<username>`），刷新后自动恢复。主要在`Layout`的` view-tabs` 中进行了使用



## 新增store

1. 在`src/stores`目录下新增业务模块对应的store

2. 引入`defineStore`

3. 导出`useTestStore`，一般建议起名为`useXxxxStore`，`defineStore`中接收两个参数，第一个为store的`id`，第二个为store的`options`，`options`中最常用的就是`state`和`actions`，state 类似vue2 中的 `data`() ，可以定义属性后抛出，抛出的属性可在全局调用。actions类似vue2中的`methods`，可以定义函数供全局使用

   ``` typescript
   import { defineStore } from "pinia";
   
   export const useTestStore = defineStore('test', {
       state: () => {
           return {
           }
       },
       actions: {
   
       }
   })
   ```

## 使用store

1. 引入`store`

   ``` typescript
   import {useThemeStore} from "@/stores/theme.ts";
   ```

2. 实例化`store`，获取themeStore实例后即可调用其中的属性和函数了

   ``` typescript
   const themeStore = useThemeStore();
   ```

   
