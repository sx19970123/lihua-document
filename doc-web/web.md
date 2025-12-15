# 前端文档

### 前端项目结构

``` bash
lihua-vue                 			// 前端工程
├── public                			// 公共文件
├── src                   			// 工程主目录
│   ├── api             			// axios请求发送&type目录
│   │   ├── global             		// 全局type类型目录
│   │   ├── monitor             	// 监控相关请求&type目录 
│   │   ├── system             		// 系统业务请求&type目录 
│   ├── assets           			// 静态资源
│   ├── components       			// 公共组件
│   ├── directive        			// vue指令
│   ├── layout           			// layout布局
│   │   ├── content             	// 页面内容区域：router切换动画、keep-alive
│   │   ├── head             		// 页面头部
│   │   ├── layout-type          	// 不同导航类型
│   │   ├── logo             		// 左上角Logo
│   │   ├── sider             		// 导航栏
│   │   ├── view-tabs            	// 多任务栏
│   │   ├── index.vue             	// layout根文件
│   ├── router           			// 静态路由
│   ├── static           			// 静态资源
│   ├── stores           			// pinia全局状态管理
│   ├── utils            			// 工具类
│   ├── views            			// 页面目录
│   │   ├── component             	// 组件展示页面（二次开发可直接删除）
│   │   ├── error             		// 错误页面，403、404等
│   │   ├── index             		// 首页（二次开发可直接删除）
│   │   ├── login             		// 登录
│   │   ├── monitor             	// 监控相关页面组件
│   │   ├── system             		// 系统业务相关页面组件
│   ├── App.vue          			// vue主文件
│   ├── main.ts          			// vue主入口配置文件
│   ├── permission.ts    			// 路由守卫
│   ├── settings.ts      			// 系统配置文件
├── package.json          			// 项目包管理文件
├── tsconfig.json         			// ts配置文件
├── vite.config.ts        			// vite配置文件
```

### 修改系统标题

![image-20241111194950190](file/README/image-20241111194950190.png)

- 修改网站Logo及标题

  在项目根目录下`index.html`文件中，通过修改`link` 标签的`href`图片路径修改网站Logo；通过修改`title` 中内容修改网站名称。

  ![image-20241111195300670](file/README/image-20241111195300670.png)

- 修改导航栏Logo及标题

  在项目`src/layout/logo/index.vue` 组件中定义了导航Logo及标题。导航Logo分为两部分，一部分为大多数时候展示的Logo + 标题形式；另一部分为侧标导航（风格1）折叠后显示的Logo。可通过修改`<a-avatar/>` 组件来定义导航Logo，修改`<a-typography-title/>` 组件文本内容来定义导航标题。[a-avatar用法参考](https://antdv.com/components/avatar-cn)

  ![image-20250117135114378](file/CLIENT/image-20250117135114378.png)

### 重要的全局功能

#### 获得当前登录用户信息

- 通过 `useUserStore.$state` 可获取当前登录用户所有信息

  ``` javascript
  state: () => {
      // 当前登录用户基本信息
      const userInfo: UserInfoType = {}
      // 用户id
      const userId: string = ''
      // 用户昵称
      const nickname: string = ''
      // username
      const username: string = ''
      // 用户头像
      const avatar: AvatarType = {}
  
      // 用户收藏固定的菜单数据
      const viewTabs: StarViewType[] = []
  
      // 角色权限相关数据
      // 用户拥有角色集合
      const roles: SysRole[] = []
      // 用户角色编码集合
      const roleCodes: string[] = []
      // 用户权限集合
      const permissions: string[] = []
      // 部门相关数据
      // 用户拥有部门数据（树形结构）
      const deptTrees:SysDept[] = []
      // 用户默认部门
      const defaultDept: SysDept = {}
      // 用户默认部门名称
      const defaultDeptName: string = ''
      // 用户默认部门编码
      const defaultDeptCode: string = ''
      // 岗位相关数据
      // 用户岗位集合
      const posts: SysPost[] = []
      // 用户默认部门下岗位集合
      const defaultDeptPosts: SysPost[] = []
      return {
          userInfo,
          userId,
          nickname,
          username,
          avatar,
          viewTabs,
          roles,
          roleCodes,
          permissions,
          deptTrees,
          defaultDept,
          defaultDeptName,
          defaultDeptCode,
          posts,
          defaultDeptPosts
      }
  }
  ```

- 在组件中使用

  ``` vue
  <script setup lang="ts">
  // 导入 useUserStore
  import {useUserStore} from "@/stores/user.ts";
  // 调用 useUserStore() 获取 userStore
  const userStore = useUserStore();
  // 调用 $state 获取 userStore 中的信息
  const userId = userStore.$state.userId
  const userId = userStore.$state.defaultDeptCode
  const userId = userStore.$state.userInfo
  
  // ... 更多数据参考 useUserStore 中的定义
  </script>
  ```

- 自定义用户上下文

  1. 修改后端接口中`getUserInfo`方法

     前端新增用户属性，需要修改后端对应接口 `SysAuthenticationController.getUserInfo()` 方法。推荐先将新增属性添加到后端上下文，通过`LoginUser`获取。

     ``` java
     /**
      * 从该接口新增属性，返回到前端
      */
     @GetMapping("info")
     public String getUserInfo() {
         LoginUser loginUser = LoginUserContext.getLoginUser();
         // 前端 store 用户数据
         AuthInfo authInfo = new AuthInfo();
         authInfo.setUserInfo(loginUser.getUser() != null ? loginUser.getUser() : new CurrentUser());
         authInfo.setDepts(loginUser.getDeptTree());
         authInfo.setPosts(loginUser.getPostList());
         authInfo.setRoles(loginUser.getRoleList());
         authInfo.setPermissions(loginUser.getPermissionList().stream().filter(item -> !item.startsWith("ROLE_")).toList());
         authInfo.setRouters(loginUser.getRouterList());
         authInfo.setViewTabs(loginUser.getViewTabList());
         authInfo.setDefaultDept(LoginUserContext.getDefaultDept() != null ? LoginUserContext.getDefaultDept() : new CurrentDept());
         return success(authInfo);
     }
     ```

  2. 修改 `AuthInfoType` 类型

     `AuthInfoType` 位于`api/system/auth/type/AuthInfoType.ts`下，该 interface 定义了登录用户所有信息

     ``` typescript
     // 从该 interface 下新增属性
     export interface AuthInfoType {
         // 权限信息（菜单权限编码，角色编码集合）
         permissions: string[],
         // 所有路由信息
         routers: RouterType[],
         // 所有收藏固定的菜单信息
         viewTabs: StarViewType[],
         // 所有角色信息
         roles: SysRole[],
         // 登陆用户信息
         userInfo: UserInfoType,
         // 部门信息
         depts: SysDept[],
         // 默认部门
         defaultDept: SysDept,
         // 岗位信息
         posts: SysPost[],
     }
     ```

  3. 修改 `useUserStore` 中定义的`state`

     在此 state 中添加新增属性，并 return 返回

     ``` typescript
     state: () => {
         // 用户相关数据
         const userInfo: UserInfoType = {}
         const userId: string = ''
         const nickname: string = ''
         const username: string = ''
         const avatar: AvatarType = {}
     
         // 用户收藏固定的菜单数据
         const viewTabs: StarViewType[] = []
     
         // 角色权限相关数据
         const roles: SysRole[] = []
         const roleCodes: string[] = []
         const permissions: string[] = []
         // 部门相关数据
         const deptTrees:SysDept[] = []
         const defaultDept: SysDept = {}
         const defaultDeptName: string = ''
         const defaultDeptCode: string = ''
         // 岗位相关数据
         const posts: SysPost[] = []
         const defaultDeptPosts: SysPost[] = []
         return {
             userInfo,
             userId,
             nickname,
             username,
             avatar,
             viewTabs,
             roles,
             roleCodes,
             permissions,
             deptTrees,
             defaultDept,
             defaultDeptName,
             defaultDeptCode,
             posts,
             defaultDeptPosts
         }
     },
     ```

  4. 修改 `useUserStore` 中定义的`initUserInfo`方法

     在此方法中处理逻辑并向 `state` 赋值

     ``` java
     // 初始化用户信息
     initUserInfo ():Promise<ResponseType<AuthInfoType>> {
         return new Promise((resolve, reject) => {
             getAuthInfo().then((resp) => {
                 if (resp.code === 200) {
                     const data = resp.data
                     const state = this.$state
     
                     // 用户相关赋值
                     state.userInfo = data.userInfo
                     state.userId = data.userInfo.id ? data.userInfo.id : ''
                     state.nickname = data.userInfo.nickname ? data.userInfo.nickname : ''
                     state.username = data.userInfo.username ? data.userInfo.username : ''
                     state.avatar = data.userInfo.avatar ? JSON.parse(data.userInfo.avatar) : this.getDefaultAvatar()
     
                     // 收藏固定菜单赋值
                     state.viewTabs = data.viewTabs
     
                     // 角色权限相关赋值
                     state.roles = data.roles
                     state.roleCodes = data.roles.filter(role => role.code).map(role => role.code) as string[]
                     state.permissions = data.permissions
     
                     // 部门相关赋值
                     state.deptTrees = data.depts
                     state.defaultDept = data.defaultDept
                     state.defaultDeptName = data.defaultDept.name ? data.defaultDept.name : ''
                     state.defaultDeptCode = data.defaultDept.code ? data.defaultDept.code : ''
     
                     // 岗位相关赋值
                     state.posts = data.posts
                     state.defaultDeptPosts = data.posts.filter(post => post.deptCode === state.defaultDeptCode)
     
                     // 处理头像
                     this.handleAvatar()
                     resolve(resp)
                 } else {
                     reject(new ResponseError(resp.code,resp.msg))
                 }
             }).catch(err => {
                 reject(err)
             })
         })
     },
     ```

#### 获取当前主题信息

> 可获取当前是否处于暗色模式、布局类型、主题颜色等，方便自定义组件的适配

- 在组件中获取主题

  通过`useThemeStore.$state` 可获取当前主题信息

  > 其中主题颜色获取需通过 `antColorPrimary` 属性进行获取，或调用`actions` 下`getColorPrimary()` 方法进行获取
  >
  > `colorPrimary` 属性的颜色再暗色模式下没有经过 ant design 的算法调整，会出现色号和全局不统一的问题

  ``` vue
  <script setup lang="ts">
  // 导入 useThemeStore
  import {useThemeStore} from "@/stores/theme.ts";
  const themeStore = useThemeStore();
  // 当前是否处于暗色模式
  const isDark = themeStore.$state.isDarkTheme
  // 获取当前主题颜色
  const colorPrimary = themeStore.$state.antColorPrimary
  // 通过方法获取当前主题颜色
  const colorPrimary = themeStore.getColorPrimary()
  // 获取布局类型
  const layoutType = themeStore.$state.layoutType
  </script>
  ```

  主题定义state如下

  ``` typescript
  state() {
      /**
       * 暗色模式
       */
      const isDarkTheme: boolean = settings.isDarkTheme
  
      /**
       * 顶部栏背景颜色
       */
      const layoutBackgroundColor: string = settings.siderBackgroundColor
  
      /**
       * 布局类型 sider-header / header-sider / header-content
       */
      const layoutType: string = settings.layoutType
  
      /**
       * 组件大小 small/ middle / large
       */
      const componentSize: string = settings.componentSize
  
      /**
       * 导航模式 inline / horizontal
       */
      const siderMode: string = settings.siderMode
  
      /**
       * 菜单分组
       */
      const siderGroup: boolean = settings.siderGroup
  
      /**
       * 主要颜色
       * 组件中使用系统颜色不可直接取用该字段
       * 使用下面提供的getColorPrimary()方法进行获取
       */
      const colorPrimary: string = settings.themeConfig.token.colorPrimary
  
      /**
       * 通过ant提供的theme的主要颜色，针对暗色模式进行了颜色调整
       */
      const antColorPrimary: string = settings.themeConfig.token.colorPrimary
  
      /**
       * 侧边栏背景颜色
       */
      const siderBackgroundColor: string = settings.layoutBackgroundColor
  
      /**
       * 磨砂玻璃效果
       */
      const groundGlass: boolean = settings.groundGlass
  
      /**
       * 固定头部
       */
      const affixHead: boolean = settings.affixHead
  
      /**
       * 显示多窗口标签
       */
      const showViewTabs: boolean = settings.showViewTabs
  
      /**
       * 侧边颜色 light / dark
        */
      const siderTheme: string = settings.siderTheme
  
      /**
       * 侧边宽度
       */
      const siderWith: number = settings.siderWith
  
      /**
       * 原侧边宽度，用于调整侧边栏时保存临时变量
       */
      const originSiderWith: number = settings.originSiderWith
  
      /**
       * 切换路由时的过渡动画 zoom / fade / breathe / top / down / switch / trick
       */
      const routeTransition: string = settings.routeTransition
  
      /**
       * 灰色模式
       */
      const grayModel: string = settings.grayModel
  
      /**
       * ant 主题配置
       */
      const themeConfig = settings.themeConfig
  
      return {
          layoutType,
          componentSize,
          showViewTabs,
          isDarkTheme,
          colorPrimary,
          antColorPrimary,
          siderTheme,
          groundGlass,
          affixHead,
          layoutBackgroundColor,
          siderBackgroundColor,
          siderMode,
          siderGroup,
          siderWith,
          originSiderWith,
          routeTransition,
          grayModel,
          themeConfig
      }
  }
  ```

- 在css中获取主题

  在dom元素html标签中，定义了若干自定义属性，用来标识各种主题属性

![image-20241025160413038](./file/README/image-20241025160413038.png)

**自定义属性**

| 属性名称          | 属性描述                                                     |
| ----------------- | ------------------------------------------------------------ |
| data-theme        | 全局主题模式（暗色模式：dark，亮色模式：light）              |
| sider-dark        | 导航栏主题（深色模式：dark，亮色模式：light）                |
| enable-gray-model | 全局灰色模式（开启：active，关闭：none）                     |
| layout-type       | 导航样式（侧边导航样式1：sider-header，侧边导航样式2：header-sider，顶部导航：header-content） |
| data-head-affix   | 固定头部（固定：affix，不固定：un-affix）                    |
| data-ground-glass | 高级材质毛玻璃效果（开启：glass，关闭：no-glass）            |
| view-tabs         | 是否显示多任务栏（显示：show，隐藏：hide）                   |
| show-hide-layout  | 是否显示Layout（显示：show，隐藏：hide）                     |

> 组件中使用属性选择器，`style` 标签不可添加 `scoped` 否则不会生效

``` css
[data-theme = 'dark'] {
    .scrollbar, .sider-scrollbar {
        scrollbar-color: rgb(66,66,66) transparent;
    }
}
[sider-dark = 'dark'] {
    .sider-scrollbar {
        scrollbar-color: rgb(66,66,66) transparent;
    }
}
```

**css 变量**

| 变量名         | 变量描述                                        |
| -------------- | ----------------------------------------------- |
| --colorPrimary | 当前主题颜色（经由ant算法处理，已适配暗色模式） |

``` css
.icon-group:hover {
	background: var(--colorPrimary);
}
```

#### 使用自定义指令

> 在 `src/directive` 下定义了自定义指令，通过`v-hasRole` 和 `v-hasPermission` 可进行更细粒度的权限控制

- `v-hasRole` 当前登录用户拥有指定角色才进行dom元素加载

  ``` vue
  <a-button v-hasRole="['ROLE_admin','ROLE_manager']"> 查 询 </a-button>
  ```

- `v-hasPermission`当前登录用户拥有指定权限才进行dom元素加载

  ``` vue
  <a-button v-hasPermission="['sys:dept:query',sys:dept:all']"> 查 询 </a-button>
  ```

- `v-rollDisable` 禁用鼠标滚轮事件，在标记` v-rollDisable="true"` 的元素上，无法使用鼠标滚轮

  ``` vue
  <a-button v-rollDisable="true"> 查 询 </a-button>
  ```

- `v-draggable` 将当前元素变为可拖拽元素 （1.2.4+ 可使用）

  在 `a-modal` 组件下无需添加参数（a-modal 标签本身无法添加指令，指令需要添加到内部元素上）

  ``` html
  <a-modal>
    <template #title>
      <div style="margin-bottom: 24px" v-draggable>
        <a-typography-title :level="4">{{modalActive.title}}</a-typography-title>
      </div>
    </template>
  </a-modal>
  ```

  非 `a-modal` 组件需要传入自定义的class名称（.开头）

  ``` html
  <div class="draggable" v-draggable=".draggable">
      xxx
  </div>
  ```

  

#### 在组件中使用字典

使用字典之前首先在`系统管理` -> `字典管理` 中新增字典后在表格操作列点击`字典配置`，添加对应的字典数据后，即可在代码中使用。

> 在组件中可以十分便利的使用字典，无需手动通过API调用，只需引入`initDict` 方法，即可通过`dict_code`直接获取对应的字典集合。

``` vue
<script setup lang="ts">
// 引入 initDict 方法
import {initDict} from "@/utils/Dict.ts";
// 通过传入 dict_code 可直接返回字典数据集合，名称与code相同
const {sys_status} = initDict("sys_status")
</script>

```

> 在dom元素中，也可以通过` dict-tag ` 组件，直接进行翻译并展示字典设置的标签样式。

引入`DictTag`组件后，传入必填的`dict-data-option`（字典选项集合） 和 `dict-data-value`（需要翻译的字典值）即可进行翻译

**DictTag详细用法可见 自定义组件 部分** 

``` vue
<template>
    <a-table>
        <template #bodyCell="{column,record,text}">
          <template v-if="column.key === 'executeStatus' && text">
              <!--     通过传入字典option 和 数据对应的字典value 即可进行表格字典翻译-->
            <dict-tag :dict-data-option="sys_log_status" :dict-data-value="text"></dict-tag>
          </template>
        </template>
    </a-table>
</template>
<script setup lang="ts">
// 引入 dict-tag 组件
import DictTag from "@/components/dict-tag/index.vue";
// 引入 initDict 方法
import {initDict} from "@/utils/Dict"
// 获取sys_log_status字典
const {sys_log_status} = initDict("sys_log_status")
</script>
```

#### 图标【1.2.7更新】

**系统提供了图标选择组件，详见`内置组件`**

> 图标支持Ant Design Vue 4.0官方图标及自定义图标

- 官方图标

  官方案例在组件中使用图标需要将对应的图标组件进行导入，在实际开发中有些繁琐。在本项目`main.ts` 中对官方图标进行了全局组件注册，在组件中的图标使用上更加便利。

  ``` typescript
  // andv 图标
  import * as Icons from "@ant-design/icons-vue";
  // ant 自带图标
  const icons:Record<string, Component> = Icons
  for (const i in icons) {
      app.component(i,icons[i])
  }
  ```

- 自定义图标【1.2.7及之后版本】

  当官方图标不足以满足业务需求时，可创建自定义图标组件。在本项目`main.ts` 中对 `src/assets/icons` 下的svg文件识别为图标组件，直接将svg文件拷贝到该文件夹下，即可像官方图标一样使用。

  ![image-20251106221930627](file/CLIENT/image-20251106221930627.png)
  
- 自定义图标【1.2.6及之前版本】

  当官方图标不足以满足业务需求时，可创建自定义图标组件。在本项目`main.ts` 中对 `src/components/icon` 下的组件识别为图标组件，按照约定的方式创建图标组件后，即可像官方图标一样使用。

  ``` typescript
  // 导入自定义图标
  const modules = import.meta.glob("./components/icon/**/*.vue")
  for (let path in modules) {
      modules[path]().then((module:any) => {
          if (module && module.default) {
              // 组件名
              const match = path.match(/\/([^/]+)\.vue$/)
              if (match) {
                  // 注册组件
                  app.component(match[1], defineComponent(module.default));
              }
          }
      });
  }
  ```

- 添加自定义图标【1.2.6及之前版本】

  自定义图标目录结构如下，在`component/icon` 目录下新图标对应目录，目录下创建图标vue组件（请保证组件名在系统中唯一）

  ![image-20241104210305254](file/README/image-20241104210305254.png)

  图标 vue 组件对应格式为：在icon组件的component插槽下使用图标svg代码

  ``` vue
  <template>
    <icon>
      <template #component>
        <!--图标svg-->
      </template>
    </icon>
  </template>
  <script lang="ts" setup>
  import Icon from '@ant-design/icons-vue';
  </script>
  
  ```

  在阿里巴巴矢量图标库https://www.iconfont.cn/ 下选择自己需求的图标，点击下载按钮

  ![image-20241104211406327](file/README/image-20241104211406327.png)

  无需考虑图标尺寸，直接点击 复制SVG代码

  ![image-20241104211504772](file/README/image-20241104211504772.png)

  复制SVG代码后回到新建的图标vue组件中，复制后的代码如下

  ![image-20241104212125384](file/README/image-20241104212125384.png)

  ``` vue
  <template>
    <icon>
      <template #component>
        <!--图标svg-->
      <svg t="1730726059117" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1193" width="200" height="200">
      	    <!--svg内容省略-->
      <path>xxxxxxxxxxx</path>
      </svg>
      </template>
    </icon>
  </template>
  <script lang="ts" setup>
  import Icon from '@ant-design/icons-vue';
  </script>
  ```

  修改svg代码，复制过来的SVG代码中，`svg`标签带有很多属性，为了与官方图标相同，手动删除矢量图标库自带属性，复制`<svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">` 进行替换。替换后的svg组件代码如下

  ![image-20241104212451965](file/README/image-20241104212451965.png)

  ``` vue
  <template>
    <icon>
      <template #component>
        <!--图标svg-->
      <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
      	    <!--svg内容省略-->
      <path>xxxxxxxxxxx</path>
      </svg>
      </template>
    </icon>
  </template>
  <script lang="ts" setup>
  import Icon from '@ant-design/icons-vue';
  </script>
  ```

  至此，自定义图标就完成，可以像官方图标一样，在项目中使用。

- 项目中使用图标

  > 具体图标使用方法请参考官方文档：https://antdv.com/components/icon-cn 项目中自定义图标用法与官方相同，下面例句中在项目中的简单用法

  1. 直接使用图标组件：无需引入组件，直接在vue模板中使用图标组件名标签

     ``` vue
     <a-button type="primary" @click="handleModelStatus('新增用户')">
       <template #icon>
         <PlusOutlined />
       </template>
       新 增
     </a-button>
     ```

  2. 使用vue `component` 组件：在 component 的 is 属性直接传入图标组件名

     ``` vue
     <a-button type="primary" @click="handleModelStatus('新增用户')">
       <template #icon>
         <component is="PlusOutlined"/>
       </template>
       新 增
     </a-button>
     ```

  3. 使用项目提供`Icon`组件：引入`import Icon from "@/components/icon/index.vue"` 后传入`icon` 属性为组件名

     ``` vue
     <a-button type="primary" @click="handleModelStatus('新增用户')">
       <template #icon>
     	<icon icon="PlusOutlined"/>
       </template>
       新 增
     </a-button>
     
     <script setup lang="ts">
     // 引入提供的icon组件
     import Icon from "@/components/icon/index.vue"
     </script>
     ```

### 路由

> 路由配置分为动态路由和静态路由，动态路由可在`系统管理/菜单管理` 中进行配置，包含 `目录` `页面` `权限` `链接`，通过菜单绑定角色分配给用户，达到动态菜单及路由的效果

> 静态路由可在工程`src/router/index.ts`中进行配置，这里介绍下静态路由的配置方法
>
> 与动态路由相同，静态路由也可以配置 `目录` `页面` `链接` 及指定特定角色的用户访问菜单，无法做到更细粒度的权限控制

#### 介绍

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

#### 例子

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

### Pinia（store）

vue3 中一般使用 `Pinia` 进行全局状态管理。将**公共的属性和函数管理起来，方便在各个组件调用**，在`重要的全局功能`中已经介绍了 `useUserStore`（当前登录用户信息管理）和 `useThemeStore`（当前主题管理） 

> 系统还内置了 `useSettingStore`（系统设置管理）`useDictStore`（系统字典管理）`usePermissionStore`（动态路由/菜单管理）和`useViewTabsStore`（多任务栏管理）

这些store在调整部分功能时才有可能进行修改，下面对这些store做一个大概的介绍

#### useSettingStore

​	系统设置管理主要提供了`保存系统配置`和`根据组件名称获取对应的配置信息`。像是刚进入登录页检测是否开启了验证码、自助注册、灰色模式，就是通过该store进行查询。

​	另外就是在`/views/system/setting`（系统设置相关）中的组件进行了使用。

#### useDictStore

​	字典管理一般无需直接调用， `Dict`工具类依赖了`useDictStore`，大部分开发只需调用`src/utils/Dict.ts`工具类中的方法即可。

#### usePermissionStore

​	usePermissionStore 中主要提供了`动态路由`和`菜单`的加载，在` AppInit ` 和 `Layout` 的菜单中进行了使用。除此之外还提供了当前菜单状态（展开/折叠）和菜单路由对象的管理。

#### useViewTabsStore

​	多任务栏管理主要提供了多任务栏右键菜单（关闭左侧、关闭右侧、关闭其他等）功能的实现。主要在`Layout`的` view-tabs` 中进行了使用。

#### 新增及使用Store

- 新增store

  1. 在`src/stores`目录下新增业务模块对应的store

  2. 引入`defineStore`

  3. 导出`useTestStore`，一般建议起名为`useXxxxStore`，`defineStore`中接收两个参数，第一个为store的`id`，第二个为store的`options`，`options`中最常用的就是`state`和`actions`，state 类似vue2 中的 `data`() ，可以定义属性后抛出，抛出的属性可在全局调用。actions类似vue2中的`methods`，可以定义函数供全局使用。

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

- 使用store

  1. 引入`store`

     ``` typescript
     import {useThemeStore} from "@/stores/theme.ts";
     ```

  2. 实例化`store`，获取themeStore实例后即可调用其中的属性和函数了

     ``` typescript
     const themeStore = useThemeStore();

### 开发

> 与后端不同，前端开发不涉及子模块。通常在`api`、`view` 下新建对应业务目录即可

#### api 开发

> 目录结构

![image-20241101233929826](file/README/image-20241101233929826.png)

1. type类型定义

   一般根据后端实体类进行type的定义，根据业务需要可以增加VO、DTO等

   ``` typescript
   import type {SysPost} from "@/api/system/post/type/SysPost.ts";
   
   export interface SysDept {
     /**
      * 主键id
      */
     id?: string;
     /**
      * 父级id
      */
   	...
   }
   
   export interface SysDeptVO extends SysDept {
   
     statusIsNormal?: boolean
   
     updateStatusLoading?: boolean
   }
   ```

2. api接口定义

   **一般API接口文件中都应引入`import request from "@/utils/Request.ts"`** 他是由`Request`工具类中封装的函数，可通过泛型指定返回的对象类型，在config中传入`url`、`method`、`data` 等配置项与后端进行交互。

   ``` typescript
   import request from "@/utils/Request.ts";
   
   // 导出接口
   export const findList = (data: SysDept) => {
       // 指定返回对象类型
     return request<Array<SysDeptVO>>({
       url: 'system/dept/list', // 后端地址
       method: 'post', // 请求类型
       data: data // 请求参数
     })
   }
   ```

3. 返回值类型

   通过`return request` 返回的函数类型为 `Promise<ResponseType<T> & Blob>` 在使用then 或 async / await 获取返回值后对应的类型ResponseType为，

   code 为 200 时表示请求成功，可获取data返回值进行业务处理。反之为请求失败，通过msg可获取后端传递的异常信息提示。

   ``` typescript
   export interface ResponseType<T> {
       code: number
       msg: string
       data: T
   }
   ```

   在某些特定业务下还提供了其他公共interface类型

   ``` typescript
   /**
    * 接收分页接口的返回值
    */
   export interface PageResponseType<T> {
       current: number
       pages: number
       records: Array<T>
       size: number
       total: number
   }
   
   /**
    * 接收Map类型返回值
    */
   export interface MapResponseType<String,V> {
       [key: string]: V[]
   }
   
   
   /**
    *  请求异常时返回值
    *  catch中无法对 error 进行有效的类型判断，
    *  定义 ResponseError 类可直接使用 instanceof 进行错误类型判断
    */
   export class ResponseError implements ResponseErrorType {
       constructor(code: number, msg: string) {
           this.code = code
           this.msg = msg
       }
       code: number;
       msg: string;
   }
   
   /**
    * 描述响应错误类型
    */
   export interface ResponseErrorType {
       code: number,
       msg: string
   }
   
   /**
    * excel 导入返回结果
    */
   export interface ExcelImportResult {
       // 是否全部导入成功
       allSuccess: boolean
       // 读取到的数量
       readCount: number
       // 导入成功的数量
       successCount: number
       // 导入失败的数量
       errorCount: number
       // 导入失败excel文件路径
       errorExcelPath: string
   }
   ```

#### view 开发

> 目录结构

**为保证 keep-alive 正常工作，业务组件名称应全局唯一，推荐使用 业务模块目录名称 + 细分功能目录名称 的大驼峰命名**

![image-20241102000109790](file/README/image-20241102000109790.png)

组件内就根据自己的习惯写就好了~



### 工具类

#### AppInit

> 认证通过后加载系统所需的各种数据

调用后将初始化`系统主题`、`动态路由`、`菜单数据`、`ViewTabs`，设置 `最近使用组件key值`，清除`字典store`、`组件缓存` 当前系统中有三处调用

1. 登录后检测需要登陆后配置，在进入配置前调用
2. 路由跳转时通过路由守卫配置当前是否拥有登录用户信息，无用户信息后调用
3. 点击页面右上角选择数据更新后调用

#### Auth

> 判断用户是否有用某些权限

- `const hasRouteRole = (routeRoleList?: string[]): boolean`

  判断用户是否拥有指定角色，传入角色编码集合，当角色有任意一个角色存在时即返回 true

  ``` typescript
  import {hasRouteRole} from "@/utils/Auth.ts";
  const hasTargetRole:boolean = hasRouteRole(["ROLE_admin"])
  ```

- `const isAdmin = (): boolean`

  判断当前登录角色是否为超级管理员

  ``` typescript
  import {isAdmin} from "@/utils/Auth.ts";
  const admin = isAdmin()
  ```

#### Browser

> 获取浏览器类型及版本，当前浏览器不完全兼容或版本过低时进行提示时使用

- `export const getBrowserType = (): string`

  获取浏览器类型

  ``` typescript
  import {getBrowserType} from "@/utils/Browser.ts"
  const browserType = getBrowserType()
  ```

- `export const getBrowserVersion = (): string`

  获取浏览器完整版本号

  ``` typescript
  import {getBrowserVersion} from "@/utils/Browser.ts"
  const browserVersion = getBrowserVersion()
  ```

- `export const getBrowserMajorVersion = (): string`

  获取浏览器主要版本号

  ``` typescript
  import {getBrowserMajorVersion} from "@/utils/Browser.ts"
  const browserMajorVersion = getBrowserMajorVersion()
  ```

#### BrowserId

> 获取浏览器指纹id，该id与用户浏览器软件和机器硬件相关，同一浏览器id值一般唯一，系统中用于作为SSE中Key的一部分，和记住我功能的密钥使用。

- `const createBrowserId = async (): Promise<string>`

  获取当前浏览器id

  ``` typescript
  import {createBrowserId} from "@/utils/BrowserId.ts";
  const browserId = await createClientKey()
  ```

#### Crypto

> 用于系统前端的数据加解密

- `const encrypt = (data: string):string`

  数据加密，用于token加密

  ``` typescript
  import {encrypt} from "@/utils/Crypto.ts"
  const encrypt = encrypt("data")
  ```

- `const decrypt = (data: string):string`

  数据解密，用于token解密

  ``` typescript
  import {decrypt} from "@/utils/Crypto.ts"
  const data = decrypt(encrypt)
  ```

- `const defaultPasswordEncrypt = (defaultPassword: string): string`

  默认密码的前端加密，与后端定义了相同的key和vi，用于传输加密

  ``` typescript
  import {defaultPasswordEncrypt} from "@/utils/Crypto.ts";
  const defPwd = defaultPasswordEncrypt(defaultPassword)
  ```

- `const defaultPasswordDecrypt = (encryptedPassword: string): string`

  默认密码前端解密，用于回显

  ``` typescript
  import {defaultPasswordDecrypt} from "@/utils/Crypto.ts";
  const defaultPassword = defaultPasswordEncrypt(defPwd)
  ```

- `const rasEncryptPassword = (password: string): Promise<{ciphertext:string,requestKey:string}>`

  密码传输加密，传入密码返回密文和请求key，由后端进行解密

  ``` typescript
  import {rasEncryptPassword} from "@/utils/Crypto.ts";
  const passwordEncrypt = await rasEncryptPassword(password)
  ```



#### Debounce【1.2.5移除】

> 函数防抖

- `const debounce = (fun: Function, wait: number | undefined = 300):Function`

  传入业务函数，在 wait（参数二）的毫秒数内只执行最后一次调用

  ``` typescript
  import {debounce} from "@/utils/Debounce.ts";
  // 需要防抖的业务函数
  const fun = (val) => {
      console.log(val);
  }
  // 使用debounce包装后具有防抖功能
  const deFun = debounce(fun,500)
  
  // 调用具有防抖的fun
  deFun("123")
  ```



#### Dict

> 系统字典

- `const initDict = (...dictTypeCodes: string[]):ref<ResDictOptionType>`

  通过字典编码获取字典options，详细用法见：`重要的全局功能`-`在组件中使用字典`

- `const getDictLabel = (option: SysDictDataType[], value?: string): string | undefined`

  通过字典options和value获取label

  ``` typescript
  import {getDictLabel} from "@/utils/Dict.ts";
  const label = getDictLabel(sys_notice_type.value, type)
  ```

- `const reLoadDict = (code: string):Promise<ResponseType<Array<SysDictDataType>>>`

  通过字典编码重新加载字典options

  ``` typescript
  import {reLoadDict} from "@/utils/Dict.ts";
  const options:Array<SysDictDataType> = await reLoadDict(dictTypeCode)
  ```




####  AttachmentDownload

> 附件下载工具类

- `export const download = (data: string, fileName?: string)`

  通用附件下载，可传入 url | 附件路径 | 附件id 和 附件名称

  ``` typescript
  import {download} from "@/utils/AttachmentDownload.ts";
  // 传入 url 或 附件路径 或 附件表id。附件名称选填
  download(url, file.name)
  ```
  
- `const downloadPublic = (id: string, fileName?: string)`

  根据附件id下载，仅公开数据（后端配置文件中的公开业务编码下的附件）可通过id下载

  ``` typescript
  import {downloadPublic} from "@/utils/AttachmentDownload.ts";
  downloadPublic(id, fileName)
  ```

- `const downloadExport = (path: string, fileName?: string)`

  导出附件下载，传入附件导出后返回的路径地址进行下载

  ``` typescript
  import {downloadExport} from "@/utils/AttachmentDownload.ts";
  downloadExport(path, fileName);
  ```

- `const downloadFromUrl = (url: string, fileName?: string)`

  通过URL进行附件下载

  ``` typescript
  import {downloadFromUrl} from "@/utils/AttachmentDownload.ts";
  downloadFromUrl(url, fileName);
  ```

  

####  HandleDate

> 特殊的日期格式处理

- `const handleTime = (time: string): string`

  传入`YYYY-MM-DD HH:mm`格式的日期字符串，格式化为 `今天` `昨天` `前天` 类型的日期形式

  ``` typescript
  import dayjs from "dayjs";
  import {handleTime} from "@/utils/HandleDate.ts";
  // 调用dayjs格式化item.releaseTime的日期格式，通过handleTime 进行再次处理
  handleTime(dayjs(item.releaseTime).format('YYYY-MM-DD HH:mm'))
  ```

#### Request

> axios 请求、响应拦截器及数据返回统一样式的封装

- 请求拦截器：为axios请求的请求头添加token

- 响应拦截器：对于后端返回的特殊状态码进行处理（401：token失效，清空用户数据后跳回登录页；407：黑名单ip访问，跳转到407页面；501：文件处理异常，给出message提示）

- `export default <T> (config: AxiosRequestConfig)`

  axios请求返回统一样式的封装，由api接口进行调用，返回的统一样式为`ResponseType<T> & Blob`

  ``` typescript
  import request from "@/utils/Request.ts";
  // 返回的request即调用了 export default <T> (config: AxiosRequestConfig)，通过传入泛型可在组件中推断出数据类型
  export const findList = (data: SysDictDataType) => {
    return request<Array<SysDictDataType>>({
      url: 'system/dictData/list',
      method: 'post',
      data: data
    })
  }
  ```


#### Scrollbar

> 页面滚动条控制

- `const hiddenOverflowY():void`

  隐藏页面Y轴滚动条

  ``` typescript
  import {hiddenOverflowY} from "@/utils/Scrollbar.ts";    
  hiddenOverflowY()
  ```

- `const showOverflowY(): void`

  显示页面Y轴滚动条

  ``` typescript
  import {showOverflowY} from "@/utils/Scrollbar.ts";    
  showOverflowY()
  ```

- `const hasScrollbar = (): boolean`

  当前页面是否出现滚动条

  ``` typescript
  import {hasScrollbar} from "@/utils/Scrollbar.ts";
  // 返回true/false
  const hasScrollbar = hasScrollbar()
  ```

#### ServerSentEvents

> sse相关工具

- `const connect = async ():Promise`

  连接到sse

  ``` typescript
  import {connect} from "@/utils/ServerSentEvents.ts";
  // 连接到sse
  await connect()
  ```

- `const close = async ():Promise `

  关闭sse连接

  ``` typescript
  import {close} from "@/utils/ServerSentEvents.ts";
  // 关闭sse连接
  await close()
  ```

- `const handleSseMessage = <T> (callback: MessageCallbackType<T>)`

  获取sse获取到的数据

  ``` typescript
  import {handleSseMessage, type SSEResponseType} from "@/utils/ServerSentEvents.ts";
  // 调用handleSseMessage，通过回调函数的response获取sse消息
  handleSseMessage((response: SSEResponseType<T>) => {
      console.log(response)
  })
  ```

  SSEResponseType

  ``` typescript
  export interface SSEResponseType<T> {
      type: string; // 后端定义的sse类型，用于业务区分
      data: T; // 返回的sse数据
  }
  ```



#### Token

> 处理令牌、记住我忘记我、从cookie中获取账号密码、登陆后设置信息

- `const getToken = ():string`

  获取登录token

  ``` typescript
  import {getToken} from "@/utils/Token.ts"
  getToken()
  ```

- `const setToken = (token: string):void`

  设置用户token

  ``` typescript
  import { setToken } from "@/utils/Token.ts";
  setToken(data)
  ```

- `const removeToken = ()`

  删除用户token

  ``` typescript
  import { removeToken } from "@/utils/Token.ts";
  removeToken()
  ```

- `const getUsername = ():string`

  获取用户名

  ``` typescript
  import { getUsername } from "@/utils/Token.ts";
  getUsername()
  ```

- `const setUsername = (username:string, expires: number)`

  设置用户名

  ``` typescript
  import { setUsername } from "@/utils/Token.ts";
  setUsername(username, expires)
  ```

- `const removeUsername = ()`

  删除用户名

  ``` typescript
  import { removeUsername } from "@/utils/Token.ts";
  removeUsername()
  ```

- `const getPassword = ():string`

  获取密码

  ``` typescript
  import { getPassword } from "@/utils/Token.ts";
  getPassword()
  ```

- `const setPassword = (password:string, expires: number)`

  设置密码

  ``` typescript
  import { setPassword } from "@/utils/Token.ts";
  setPassword(password, expires)
  ```

- `const removePassword = ()`

  删除密码

  ``` typescript
  import { removePassword } from "@/utils/Token.ts";
  removePassword()
  ```

- `const enableRememberMe = ():boolean`

  是否开启记住我功能

  ``` typescript
  import { enableRememberMe } from "@/utils/Token.ts";
  enableRememberMe()
  ```

- `const rememberMe = (username:string, password:string)`

  设置记住我

  ``` typescript
  import { rememberMe } from "@/utils/Token.ts";
  rememberMe(loginForm.username, loginForm.password)
  ```

- `const forgetMe = ()`

  设置忘记我

  ``` typescript
  import { forgetMe } from "@/utils/Token.ts";
  forgetMe()
  ```

- `const getUsernamePassword = (): {username:string, password:string}`

  获取账号密码

  ``` typescript
  import { getUsernamePassword } from "@/utils/Token.ts";
  const {username, password} = getUsernamePassword()
  ```

- `const getLoginSettingResult = (): boolean | undefined`

  获取登陆后设置结果

  ``` typescript
  import { getLoginSettingResult } from "@/utils/Token.ts";
  getLoginSettingResult()
  ```

- `const setLoginSettingResult = ()`

  登录设置完成后记录结果

  ``` typescript
  import { setLoginSettingResult } from "@/utils/Token.ts";
  setLoginSettingResult()
  ```

- `const removeLoginSettingResult = ()`

  删除登陆后设置信息

  ``` typescript
  import { removeLoginSettingResult } from "@/utils/Token.ts";
  removeLoginSettingResult()
  ```

#### Tree

> 前端进行树形结构的构建和对树形结构进行扁平化处理

- `export const buildTree = <T> (list: Array<T>)`

  **构建树形结构**传入扁平化的具有树形结构元素的集合，返回构建完成的树形结构。

  ``` typescript
  import {buildTree} from "@/utils/Tree.ts";
  const treeList = buildTree(resp.data);
  // 打印出树形结构的Array集合
  console.log(treeList)
  ```
  
  为兼容各种数据结构，可通过参数指定各个属性的字段名
  
  ``` typescript
  import {buildTree} from "@/utils/Tree.ts";
  // 通过参数指定root节点值、id属性名、pid属性名、子节点属性名
  const treeList = buildTree(resp.data,"0","code","pCode","children");
  // 打印出树形结构的Array集合
  console.log(treeList)
  ```
  
- `export const flattenTree  = <T> (tree:Array<T>, children: string = 'children')`

  **扁平化树形结构**传入树形结构集合，执行完成后返回Array集合

  ``` typescript
  import {flattenTree} from "@/utils/Tree.ts";
  const flattenDeptList = flattenTree(resp.data)
  // 打印出没有树形结构的Array集合
  console.log(flattenDeptList)
  ```

- `const traverse = <T> (tree: Array<T>, callback: (item: T) => void, children: string = DEFAULT_CHILDREN)`

  **遍历树形结构**，参数一传入树形结构数组。参数二为回调函数，返回的item为遍历出的每个节点对象。参数三为children对应的节点名称，默认children

  ``` typescript
  import { traverse } from "@/utils/Tree.ts";
  // 树形结构
  const treeList = [{
      id: '1',
      data: 'xxx',
      children: [{
          id: '1-1',
      	data: 'xxx',
          children: [{}]
      }]
  }]
  // 调用递归遍历
  traverse(treeList, (item) => {
      // 每个节点的数据
  	console.log(item)
  }, 'children')
  ```

  
