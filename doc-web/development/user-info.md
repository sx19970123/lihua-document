# 用户信息



## 获取登录用户信息

通过 `useUserStore.$state` 可获取当前登录用户所有信息

```javascript
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

在组件中使用

```vue
<script setup lang="ts">
// 导入 useUserStore
import {useUserStore} from "@/stores/user.ts"
// 调用 useUserStore() 获取 userStore
const userStore = useUserStore();
// 调用 $state 获取 userStore 中的信息
const userId = userStore.$state.userId
const defaultDeptCode = userStore.$state.defaultDeptCode
const userInfo = userStore.$state.userInfo

// ... 更多数据参考 useUserStore 中的定义
</script>
```



## 自定义用户上下文

1. 修改后端接口中`getUserInfo`方法

   前端新增用户属性，需要修改后端对应接口 `SysAuthenticationController.getUserInfo()` 方法。推荐先将新增属性添加到后端上下文，通过`LoginUser`获取。

   ```java
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

   ```typescript
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

   ```typescript
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
   }
   ```

4. 修改 `useUserStore` 中定义的`initUserInfo`方法

   在此方法中处理逻辑并向 `state` 赋值

   ```typescript
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
   }
   ```

   