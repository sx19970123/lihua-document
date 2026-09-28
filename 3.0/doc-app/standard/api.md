# Api

> `api` 目录主要负责与后端进行通信，并集中维护项目中使用的 TypeScript 接口定义。App 端接口均以 `/app` 为前缀，为 App 专用接口，与 Web 端接口相互独立。

api 目录结构示意

```
/src/api/  
├── global/                    				# 全局类型
│   └── type.ts                				# 全局响应类型定义（ResponseType、ResponseError等）
└── system/                    				# 系统管理模块  
    ├── app-version/           			# 应用版本（App 更新检查）
    ├── attachment/            		# 附件管理  
    │   ├── attachment-storage.ts      	# 附件业务API  
    │   └── type/  			            # interface类型定义
    ├── authentication/         			# 认证（login/logout/register/checkUserName/reloadData/onceToken）
    ├── captcha/                			# 验证码
    ├── dept/                   			# 部门
    ├── dict/                   			# 字典
    ├── notice/                 			# 消息通知（preview/star/read/unread/count/list）
    ├── post/                   			# 岗位
    ├── profile/                			# 个人信息（info/basics/password/default/deactivate/postLoginCheck等）
    ├── role/                   			# 角色
    ├── setting/                			# 系统设置（验证码/注册开关）
    └── user/                   			# 用户（checkUserName）
```



## 全局通用Type

`/api/global/type.ts` 中定义了全局公共的 interface包含：

- ResponseType\<T\>：后端接口通用返回包装对象
- PageResponseType\<T\>：后端分页查询接口返回包装对象
- MapResponseType\<V\>：后端Map接口返回包装对象
- ResponseError：可控的异常包装对象（类实现，支持 `instanceof` 判断）



## 模块Type

每个业务可在自己的模块下定义interface，在本模块的目录下新建ts文件，export interface 类型供外部使用，例：

``` typescript
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
    // 权限数据是否已变更（服务端标记比对）：tabBar/头像红点数据源
    permissionUpdate?: boolean,
}
```



## 请求交互

> request 接口基于 `sard-uniapp` 的 `Request` 封装，定义在 ` /src/utils/request.ts ` 中。`baseURL` 取环境变量 `VITE_APP_BASE_API`，默认超时 5000ms；如需修改全局请求配置，可在这里进行配置

### Request

- 发送请求时经过请求拦截器，设置 `Content-Type`、`Client-Type` 请求头、`Authorization` token 等信息

- `Client-Type` 经条件编译自动取值：App 端为 `app`、微信小程序为 `wechat_mp`、H5 为 `app_h5`（定义在 `/utils/client.ts`），后台据此区分客户端来源
- 接收响应时对特殊业务码进行全局处理：
  - **401** 登录失效：非登录页调用 store 中的 `authenticationFailure()` 清态并跳转登录页（登录页上的 401 是凭据错误，仅提示避免冲掉已输入内容）
  - **403** 权限不足：跳转错误兜底页（`/pages/error/Error?type=403`）
  - **451** 非法ip访问：跳转错误兜底页（`/pages/error/Error?type=451`）
  - **505** 服务器处理文件异常：抛出异常提示
- 封装了数据统一返回格式，响应数据自动包装为 ResponseType\<T\>，api中传入对应泛型即可
- 封装了附件上传api `attachmentUpload`：大文件上传耗时远超普通请求，独立 60s 超时（对齐 uni.uploadFile 平台默认值），由api层统一调用

### Api

api中需要引入 `/utils/request` ，定义导出的方法，方法中将 request 返回。request的参数为`url` `data` `param` `method` 等。使用时传入泛型类型，在业务中使用即可自动推导。request 返回值为 Promise<ResponseType\<T\>>，例：

- 定义api

  ``` typescript
  import request from "@/utils/request";
  
  // 获取用户信息
  export const queryAuthInfo = () => {
      return request<AuthInfoType>({
          url: 'app/system/profile/info',
          method: 'GET'
      })
  }
  // 刷新用户数据
  export const reloadData = () => {
      return request({
          url: 'app/system/auth/reloadData',
          method: 'POST'
      })
  }
  // 获取一次性令牌（websocket连接使用）
  export const getOnceToken = () => {
      return request<string>({
          url: 'app/system/auth/onceToken',
          method: 'GET'
      })
  }
  ```

- 组件中使用

  引入api，调用接口。此函数返回的都是异步操作，需要`then().catch()`或使用`await语法糖` 接收返回和处理异常

  ``` vue
  
  <script lang="ts" setup>
  import { reloadData } from '@/api/system/authentication/authentication'
  
  /**
   * 刷新用户信息
   */
  const reloadUserInfo = async () => {
  	try {
  		uni.showLoading({title: '加载中', mask: true})
  		await reloadData()
  		...
  		toast("更新完成")
  	} catch(err) {
      uni.hideLoading()
  		if (err instanceof ResponseError) {
  			toast((err as unknown as ResponseError).msg)
  		} else {
  			console.error(err)
  		}
  	}
  }
  </script>
  ```

- 异常处理

  当发生异常后会进入Promise的catch代码块，需要判断 err 类型进行处理

  有可控异常和不可控异常，可控异常为底层处理封装为 `ResponseError` 对象的异常，可获取到异常码和异常信息。也可使用 `utils/toast.ts` 提供的 `toastRequestError()` 兜底提示（内部已跳过 401/451，避免与请求层处理双弹）

  ``` typescript
  // 异常类型是否为 ResponseError
  if (err instanceof ResponseError) {
    // 给出提示
    toast((err as unknown as ResponseError).msg)
  } else {
    // 打印log
    console.error(err)
  }
  ```

  

