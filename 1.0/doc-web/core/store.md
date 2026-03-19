# 状态管理

项目使用`pinia`作为状态管理工具

## 项目store

将公共的属性和函数管理起来，方便在各个组件调用，项目中store位于`src/stores` 目录下



### 用户（user）

- 获取用户相关信息：id、昵称、用户名、头像、角色、权限、部门、岗位、菜单、viewTabs
- 提供用户相关方法：登录、退出登录、修改密码、认证失效、初始化用户信息、修改默认部门、清空用户信息、处理头像、获取默认头像

### 主题（theme）

可获取当前是否处于暗色模式、布局类型、主题颜色等，另外提供了主题变化的配置，这些配置在`src/views/system/profile/components/ProfileIndividuation.vue` 进行调用

### 设置（setting）

​	系统设置管理主要提供了`保存系统配置`和`根据组件名称获取对应的配置信息`。像是刚进入登录页检测是否开启了验证码、自助注册、灰色模式，就是通过该store进行查询。

​	另外就是在`/views/system/setting`（系统设置相关）中的组件进行了使用

### 字典（dict）

​	字典管理一般无需直接调用， `Dict`工具类依赖了`useDictStore`，大部分开发只需调用`src/utils/Dict.ts`工具类中的方法即可

### 菜单（permission）

​	usePermissionStore 中主要提供了`动态路由`和`菜单`的加载，在` AppInit ` 和 `Layout` 的菜单中进行了使用。除此之外还提供了当前菜单状态（展开/折叠）和菜单路由对象的管理

### 多任务标签页（viewTabs）

​	多任务栏管理主要提供了多任务栏右键菜单（关闭左侧、关闭右侧、关闭其他等）功能的实现。主要在`Layout`的` view-tabs` 中进行了使用



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

### 