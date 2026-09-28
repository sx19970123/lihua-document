# 用户信息

在 userStore 中可以获取登录用户的全部信息

1. 导入并获取实例

   ``` typescript
   // 引入userStore
   import {useUserStore} from '@/stores/user'
   // 获取userStore实例
   const userStore = useUserStore()
   ```

2. 调用 store 中提供的 state 和 actions

   ``` typescript
   const nickname = userStore.$state.nickname
   ```

3. 可获取到的数据

   ``` typescript
   // 用户相关数据
   const userInfo: UserInfoType
   const userId: string
   const nickname: string
   const username: string
   const avatar: AvatarType
   
   // 角色权限相关数据
   const roles: SysRole[]
   const roleCodes: string[]
   const permissions: string[]
   
   // 部门相关数据
   const deptTrees:SysDept[]
   const defaultDept: SysDept
   const defaultDeptName: string
   const defaultDeptCode: string
   
   // 岗位相关数据
   const posts: SysPost[]
   const defaultDeptPosts: SysPost[]
   
   // 权限数据待更新标志（WS 推送角色/菜单变更后置位，登录/静默刷新后由 info 重算）
   const permissionUpdate: boolean
   ```



## 初始化用户信息

路由守卫中已做懒加载预热，一般无需手动调用；如需在特定时机强制刷新用户信息，可调用：

``` typescript
// 在途 Promise 去重：并发调用复用同一请求，失败后下次调用可重试
await userStore.initUserInfo()
```

初始化内容：用户信息、avatar JSON 解析（脏数据降级默认头像）、角色权限、部门、岗位、permissionUpdate；image 类型头像会经 `handleAvatar` 下载为本地临时路径。

## 常用 actions

``` typescript
// 更新默认部门（内部调接口持久化并同步刷新默认部门下岗位）
await userStore.updateDefaultDept(dept)

// 退出登录（服务端登出 + 本地清态 + reLaunch 登录页）
await userStore.handleLogout()

// 认证失效（清token、清用户信息、断开websocket、reLaunch登录页）
// 请求拦截器 401 时自动调用，业务中一般无需手动调用
userStore.authenticationFailure()

// 获取默认头像
const avatar = userStore.getDefaultAvatar()
```

头像的渲染统一使用 `src/components/user-avatar` 组件（image/text 双类型渲染，icon 类型头像在 App 端降级为默认头像），传入 `customAvatar` 可自定义展示，缺省渲染当前登录用户头像。
