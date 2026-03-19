# 工具类

## AppInit

> 认证通过后加载系统所需的各种数据

调用后将初始化`系统主题`、`动态路由`、`菜单数据`、`ViewTabs`，设置 `最近使用组件key值`，清除`字典store`、`组件缓存` 当前系统中有三处调用

1. 登录后检测需要登陆后配置，在进入配置前调用
2. 路由跳转时通过路由守卫配置当前是否拥有登录用户信息，无用户信息后调用
3. 点击页面右上角选择数据更新后调用

## Auth

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

## Browser

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

## BrowserId

> 获取浏览器指纹id，该id与用户浏览器软件和机器硬件相关，同一浏览器id值一般唯一，系统中用于作为SSE中Key的一部分，和记住我功能的密钥使用。

- `const createBrowserId = async (): Promise<string>`

  获取当前浏览器id

  ``` typescript
  import {createBrowserId} from "@/utils/BrowserId.ts";
  const browserId = await createClientKey()
  ```

## Crypto

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

## Dict

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




##  AttachmentDownload

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

  

##  HandleDate

> 特殊的日期格式处理

- `const handleTime = (time: string): string`

  传入`YYYY-MM-DD HH:mm`格式的日期字符串，格式化为 `今天` `昨天` `前天` 类型的日期形式

  ``` typescript
  import dayjs from "dayjs";
  import {handleTime} from "@/utils/HandleDate.ts";
  // 调用dayjs格式化item.releaseTime的日期格式，通过handleTime 进行再次处理
  handleTime(dayjs(item.releaseTime).format('YYYY-MM-DD HH:mm'))
  ```

## Request

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


## Scrollbar

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

## Token

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

## Tree

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

  