# 路由与菜单

> 路由配置分为动态路由和静态路由，动态路由可在`系统管理/菜单管理` 中进行配置，包含 `目录` `页面` `权限` `链接`，通过菜单绑定角色分配给用户，达到动态菜单及路由的效果

> 静态路由可在工程`src/router/index.ts`中进行配置，这里介绍下静态路由的配置方法
>
> 与动态路由相同，静态路由也可以配置 `目录` `页面` `链接` 及指定特定角色的用户访问菜单，无法做到更细粒度的权限控制

## 介绍

`src/router/index.ts` 中维护了一个 `routers` 数组对象，通过对该集合的配置即可配置静态路由及菜单。**3.0 中静态路由仅保留基础页面（登录/403/404/451/首页/个人中心/系统设置），业务菜单全部由后端动态下发**

routers数组为嵌套的树形结构，主要接收的对象属性为

``` typescript
type CustomRouter = {
  // 路由跳转路径
  path: string,
  // 组件，可配置为Layout/菜单/链接/页面
  component: Component,
  // 组件名称，组件缓存时需要用到
  name: string,
  // 路由配置
  meta: {
    // 在菜单中显示：true(默认)、false
    visible: boolean,
    // 菜单栏标题
    label: string,
    // 鼠标悬浮显示的标题
    title: string,
    // 菜单图标，直接配置组件名即可。详见 https://www.antdv-next.cn/components/icon-cn 自定义图标：@/components/icon
    icon: string,
    // 在viewTab中显示：true(默认)、false
    viewTab: boolean,
    // 在viewTab中固定：true、false(默认)
    affix: boolean,
    // 固定在viewTab下的标签排序
    viewTabSort: number,
    // 缓存页面，需要配置router的name属性：true、false(默认)
    cache: boolean,
    // 标记当前路由类型为link情况下的打开方式：'inner' | 'new-page'
    linkOpenType: 'inner' | 'new-page',
    // link的链接地址
    link: string,
    // 标记哪些角色的用户可访问此页面/目录及以下页面/目录：['ROLE_admin','ROLE_normal',...]，不配置或配置为[]则所有用户均可访问
    role: string[],
  	// 是否允许在未登录的情况下访问：true、false（默认undefined）
    allowAnonymous: boolean
  },
  // 子集
  children: CustomRouter[]
}
```

meta 字段速查表：

| 字段 | 说明 | 默认值 |
| --- | --- | --- |
| visible | 是否在菜单中显示 | `true` |
| label | 菜单栏标题 | - |
| title | 鼠标悬浮显示的标题 | - |
| icon | 菜单图标（组件名字符串） | - |
| viewTab | 是否纳入多标签管理 | `true` |
| affix | 是否在多标签中固定 | `false` |
| viewTabSort | 固定标签排序 | - |
| cache | 是否 keep-alive 缓存（需配置路由 `name`） | `false` |
| linkOpenType | link 类型路由打开方式：`'inner'` \| `'new-page'` | `new-page` |
| link | link 的链接地址 | - |
| role | 可访问角色编码集合，空或不配置则所有用户可访问 | - |
| allowAnonymous | 是否允许未登录访问 | `false` |

以下为系统中的默认配置：

``` javascript
import Layout from '@/layout/index.vue'
import MiddleView from '@/components/middle-view/index.vue'
import Iframe from '@/components/iframe/index.vue'

const routers = [
  // 重定向到首页
  {
    path: '',
    alias:['/','/root','/home'],
    redirect: '/index'
  },
  {
    path: '',
    component: Layout,
    meta: { visible: true },
    children: [
      // 首页
      {
        path: '/index',
        component: () => import("@/views/index/index.vue"),
        name: 'AppIndex',
        meta: {
          label: '首页',
          icon: 'HomeOutlined',
          viewTabSort: 1,
          affix: true,
          viewTab: true,
          visible: true
        }
      },
        // 个人中心
      {
        path: '/profile',
        component: () => import("@/views/system/profile/SystemProfile.vue"),
        name: 'SystemProfile',
        meta: {
          label: '个人中心',
          icon: 'UserOutlined',
          cache: false,
          affix: false,
          viewTab: true,
          visible: false
        },
      },
      {
        path: '/setting',
        component: () => import("@/views/system/setting/SystemSetting.vue"),
        name: 'SysSetting',
        meta: {
          label: "系统设置",
          icon: "SettingOutlined",
          cache: false,
          affix: false,
          viewTab: true,
          visible: false,
          role: ["ROLE_admin", "ROLE_visitor"]
        }
      }
    ],
  },
  // login
  {
    path: '/login',
    name: 'Login',
    component: () => import("@/views/login/index.vue")
  },
  // 451（配置的非法ip访问）
  {
    path: "/451",
    component: () => import("@/views/error/451/index.vue"),
    meta: {
      allowAnonymous: true
    }
  },
  // 403
  {
    path: "/403",
    component: () => import("@/views/error/403/index.vue"),
  },
  // 404
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/views/error/404/index.vue"),
  },
]
```

## 动态路由加载流程

后端下发的菜单数据（`AuthInfoType.routers`）由 permission store 的 `initDynamicRouter` 转为 vue-router 路由并注册：

1. **component 三类特殊值**：`handleRouterComponent` 递归处理各层级 component：
   - `type === 'page'`（页面）：以 `import.meta.glob('../views/**/*.vue')` 收集的组件映射表，按后端下发的 component 字符串（即 `src/views` 下的相对路径）匹配懒加载函数；匹配不到时标记 `danger` 并提示「项目路径下没有找到资源」
   - `type === 'link'`（链接）：component 固定为 `Iframe`（`@/components/iframe`）
   - 目录/顶级节点：`parentId === '0'` 的顶级节点 component 为 `Layout`，非顶级目录节点 component 为 `MiddleView`（中间视图，菜单识别为目录）
2. **addRoute 注册**：顶级无父组件的目录/页面/链接，自动包一层 `component: Layout` 的父级路由后 `router.addRoute` 注册，保证业务页面都在布局内渲染
3. **菜单生成**：`initMenu` 合并静态菜单（按 `meta.visible` 与 `meta.role` 过滤）与动态菜单数据，生成导航菜单对象，供 Layout 渲染

## 路由守卫

全局前置守卫位于 `src/permission.ts`，流程如下：

**有 token 时：**

1. 若 `userStore.userInfo.id` 为空（首次进入/刷新）：
   - 并行执行 WebSocket `connect()` 与 `initApp()`（用户信息 → 服务端主题 → 动态路由 → 菜单 → viewTabs）
   - 检查登录后信息是否完善（user-setup 走马灯检查项存在时跳转登录页完善信息）
   - 等待 WS 连接完成后，校验目标路由 `meta.role`（`hasRouteRole`）：有权限则放行（已登录访问 /login 自动跳首页），无权限跳转 `/403`
2. 已拉取用户信息：直接按 `meta.role` 校验放行或跳 `/403`
3. 过程抛出异常：关闭 WebSocket、清空用户信息、重定向登录页

**无 token 时：**

1. 清空登录后信息完善检查数据（user-setup）
2. 重置主题（内存与展示回到默认；主题无本地缓存，服务端为唯一事实源）
3. 关闭 WebSocket
4. 目标路由 `meta.allowAnonymous` 为 `true` 放行（如 451 页）；否则重定向登录页（登录页自身放行）

后置守卫仅负责结束 NProgress 顶部进度条。

## 例子

1. 配置一个在菜单**显示带有Layout**的简单的静态路由

   将父级节点 component 指向 layout，children 为目标组件，设置`meta` 中 `visible` 为 `true` 即可在菜单展示，进入后组件后显示菜单和头部

   ``` javascript
   {
       path: '',
       component: Layout,
       meta: { visible: true },
       children: [
         // 首页
         {
           path: '/index',
           component: () => import("@/views/index/index.vue"),
           name: 'AppIndex',
           meta: {
             label: '首页',
             icon: 'HomeOutlined',
             viewTabSort: 1,
             affix: true,
             viewTab: true,
             visible: true
           }
         },
       ],
     },
   ```

2. 配置一个在菜单**显示不带Layout**的简单的静态路由

   登录页面是一个很好的例子，最简单的只需配置`path` 和 `component` 即可，component 指向view下.vue组件，进入组件后不显示菜单和头部

   ``` javascript
     {
       path: '/login',
       name: 'Login',
       component: () => import("@/views/login/index.vue")
     }
   ```

3. 配置一个在菜单显示的**外链**

   最简单的外链配置，将 `component` 指定为 `Iframe`，设置 `meta` 中的 `link` 即可，默认为 new-page 在新标签页打开

   ``` javascript
     {
       path: '/link',
       name: 'Link',
       component: Iframe,
       meta: {
         visible: true,
         label: '百度外链',
         link: 'https://www.baidu.com/',
       }
     },
   ```

4. 配置一个在菜单显示的**Iframe外链**

   在上一个例子中的`meta`新增`linkOpenType` 属性指定为`inner` 即可。父级配置Layout 后可在显示菜单头部的情况下显示外链

   ``` javascript
     {
       path: '/link',
       name: 'Link',
       component: Iframe,
       meta: {
         visible: true,
         label: '百度外链',
         link: 'https://www.baidu.com/',
         linkOpenType: 'inner'
       }
     },  
     {
       path: '',
       component: Layout,
       meta: { visible: true },
       children: [
         {
           path: '/link',
           name: 'Link',
           component: Iframe,
           meta: {
             visible: true,
             label: '百度外链',
             link: 'https://www.baidu.com/',
             linkOpenType: 'inner'
           }
         },
       ],
     }
   ```

5. 配置一个在菜单**隐藏**的简单的静态路由

   设置`meta` 中 `visible` 为 `false` 即不在菜单显示，可通过业务中路由跳转进入

   ``` javascript
     {
       path: '/profile',
       component: () => import("@/views/system/profile/SystemProfile.vue"),
       name: 'SystemProfile',
       meta: {
         label: '个人中心',
         icon: 'UserOutlined',
         cache: false,
         affix: false,
         viewTab: true,
         visible: false
       },
     },
   ```

6. 配置一个在菜单中有**父级目录**的静态路由

   如需要在菜单的静态路由外层套上目录结构，需进行套娃处理。第一层为`Layout`负责显示菜单和头部，第二层为`MiddleView` 为中间视图，菜单生成中将其识别为目录，第三层为目标组件。需要将每一层的`visible` 属性设置为`true`

   ``` javascript
   {
       path: '',
       component: Layout,
       meta: { visible: true },
       children: [
         {
           path: '',
           component: MiddleView,
           meta: { visible: true,label: '首页',icon: 'HomeOutlined'},
           children: [
             // 首页
             {
               path: '/index',
               component: () => import("@/views/index/index.vue"),
               name: 'AppIndex',
               meta: {
                 label: '首页',
                 icon: 'HomeOutlined',
                 viewTabSort: 1,
                 affix: true,
                 viewTab: true,
                 visible: true
               }
             },
           ]
         }
       ],
     },
   ```

7. 根据**用户角色**显示菜单

   在`meta`的`role` 属性中可配置角色编码。拥有该角色的用户才可在菜单中显示。**无权限用户通过路由跳转或地址栏进入会跳转至403页面**

   ``` javascript
     {
       path: '/setting',
       component: () => import("@/views/system/setting/SystemSetting.vue"),
       name: 'SysSetting',
       meta: {
         label: "系统设置",
         icon: "SettingOutlined",
         cache: false,
         affix: false,
         viewTab: true,
         visible: true,
         role: ["ROLE_admin", "ROLE_visitor"]
       }
     }
   ```

**更多配置组合请参考`src/router/index.ts`中介绍进行配置**
