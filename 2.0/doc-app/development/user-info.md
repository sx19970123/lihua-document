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
   ```

   