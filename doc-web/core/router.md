# 路由与菜单

> 路由配置分为动态路由和静态路由，动态路由可在`系统管理/菜单管理` 中进行配置，包含 `目录` `页面` `权限` `链接`，通过菜单绑定角色分配给用户，达到动态菜单及路由的效果

> 静态路由可在工程`src/router/index.ts`中进行配置，这里介绍下静态路由的配置方法
>
> 与动态路由相同，静态路由也可以配置 `目录` `页面` `链接` 及指定特定角色的用户访问菜单，无法做到更细粒度的权限控制

## 介绍

`src/router/index.ts` 中维护了一个 `routers` 数组对象，通过对该集合的配置即可配置静态路由及菜单

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
    // 菜单图标，直接配置组件名即可。详见 https://antdv.com/components/icon-cn 自定义图标：@/components/icon
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
        component: () => import("@/views/system/setting/index.vue"),
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
  // login 登录页面allowAnonymous可不设置为true
  {
    path: '/login',
    name: 'Login',
    component: () => import("@/views/Login.vue"),
  },
  // 407
  {
    path: "/407",
    component: () => import("@/views/error/407/index.vue"),
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

   登录页面是一个很好的例子，最简单的只需配置`path` 和 `component` 即可，component 只想view下.vue组件，进入组件后不显示菜单和头部

   ``` javascript
     {
       path: '/login',
       name: 'Login',
       component: () => import("@/views/Login.vue"),
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
       component: () => import("@/views/system/setting/index.vue"),
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

### 
