# Api

> `api` 目录主要负责与后端进行 Axios 通信，并集中维护项目中使用的 TypeScript 接口定义。

api 目录结构示意

```text
/src/api/  
├── global/                    		# 全局类型
│   └── Type.ts               		# 全局响应类型定义  
├── system/                    		# 系统管理模块  
│   ├── attachment/           		# 附件管理  
│   │   ├── Attachment.ts     		# 附件业务API  
│   │   └── type/  					# interface类型定义
│   │       └── SysAttachment.ts 	# 附件类型定义  
...									# 略
└── utils/  
    └── Request.ts           		# 请求工具类
```

![image-20241101233929826](./api.assets/image-20241101233929826.png)

## 全局通用Type

`/api/global/Type.ts` 中定义了全局公共的 interface包含：

- ResponseType\<T\>：后端接口通用返回包装对象
- PageResponseType\<T\>：后端分页查询接口返回包装对象
- MapResponseType\<String,V\>：后端Map接口返回包装对象
- ResponseError：可控的异常包装对象

## 模块Type

每个业务可在自己的模块下定义interface，在本模块的目录下新建ts文件，export interface 类型供外部使用，例：



```typescript
/**
 * 登陆成功后的认证数据信息，包含用户、角色、部门、岗位等所有信息
 */
export interface AuthInfoType {
    // 权限信息（菜单权限编码，角色编码集合）
    permissions: string[],
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

## 请求交互

> request 接口使用 `/src/utils/Request` 中定义的全局请求处理，如需修改全局请求配置，可在这里进行配置

### Request

- 发送请求时经过请求拦截器，设置请求头、token等信息
- 接收响应时可针对特殊状态码进行全局处理（如 401 登录失效，可直接调用store中用户退出逻辑）
- 封装了数据统一返回格式，响应数据自动包装为 ResponseType\<T\>，api中传入对应泛型即可
- 封装了附件上传api，由api层统一调用

### Api

api中需要引入 `/utils/Request` ，定义导出的方法，方法中将 request 返回。request的参数为`url` `data` `param` `method` 等。使用时传入泛型类型，在业务中使用即可自动推导。request 返回值为 Promise\<ResponseType\<T\>\>，例：

- 定义api

  ```typescript
  import request from "@/utils/Request";
  import type {AuthInfoType} from "@/api/system/auth/type/AuthInfoType";
  
  // 获取用户信息
  export const queryAuthInfo = () => {
      return request<AuthInfoType>({
          url: 'system/info',
          method: 'GET'
      })
  }
  // 刷新用户数据
  export const reloadData = () => {
      return request({
          url: 'system/reloadData',
          method: 'POST'
      })
  }
  // 获取公钥
  export const getPublicKey = (requestKey: string) => {
      return request<string>({
          url: 'system/publicKey/' + requestKey,
          method: 'GET'
      })
  }
  
  // 获取一次性令牌
  export const getOnceToken = () => {
      return request<string>({
          url: 'system/onceToken',
          method: 'GET'
      })
  }
  ```

- 组件中使用

  引入`api`调用接口，此函数返回的都是异步操作，需要`then().catch()`或使用`await语法糖` 接收返回和处理异常

  ```typescript
  <script lang="ts" setup>
  import {reloadData} from "@/api/system/auth/Auth.ts";
  import {message} from "ant-design-vue";
  
  /**
   * 刷新用户数据
   * @param route 判断菜单权限
   */
  export const refreshUserData = async (route: RouteLocationNormalizedLoaded) => {
      const viewTabsStore = useViewTabsStore()
      try {
          const resp = await reloadData()
          if (resp.code === 200) {
              message.success(resp.msg)
          } else {
              message.error(resp.msg)
          }
      } catch (e) {
          if (e instanceof ResponseError) {
              message.error(e.msg)
          } else {
              console.error(e)
          }
      }
  }
  </script>
  ```

- 异常处理

  当发生异常后会进入`Promise`的`catch`代码块，需要判断 err 类型进行处理

  有可控异常和不可控异常，可控异常为底层处理封装为 `ResponseError` 对象的异常，可获取到异常码和异常信息。

  

  ```typescript
  // 异常类型是否为 ResponseError
  if (err instanceof ResponseError) {
    // 给出提示
    message.error(err.msg)
  } else {
    // 打印log
    console.error(err)
  }
  ```