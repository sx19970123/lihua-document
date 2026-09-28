# 工具类

3.0 中全局辅助函数拆分为 `src/utils`（纯工具）与 `src/helpers`（依赖 store 的业务辅助）两处，以下为常用工具速览

## AppInit

> 认证通过后加载系统所需的各种数据，位于 `src/app-init.ts`

- `const initApp = async (): Promise<void>`

  初始化应用：用户信息 → 服务端主题（唯一事实源，亮暗档位除外）→ 动态路由 → 菜单 → viewTabs，设置最近使用缓存 key，恢复上次打开标签，清除字典 store 与组件缓存

  ``` typescript
  import {initApp} from "@/app-init.ts";
  await initApp()
  ```

- `const refreshApp = async (route: RouteLocationNormalizedLoaded)`

  刷新应用（数据更新）：调用后端 `reloadData` 后重新 `initApp`，重新生成内容区组件 key，校验当前菜单权限后重载 ViewTab 或跳回首页

  ``` typescript
  import {refreshApp} from "@/app-init.ts";
  await refreshApp(route)
  ```

## Auth

> 判断用户是否拥有某些角色，位于 `src/helpers/auth.ts`

- `const hasRouteRole = (routeRoleList?: string[]): boolean`

  判断用户是否拥有指定角色，传入角色编码集合，当角色有任意一个角色存在时即返回 true；不配置或配置为空数组则所有用户可访问

  ``` typescript
  import {hasRouteRole} from "@/helpers/auth.ts";
  const hasTargetRole:boolean = hasRouteRole(["ROLE_admin"])
  ```

- `const isAdmin = (): boolean`

  判断当前登录角色是否为超级管理员

  ``` typescript
  import {isAdmin} from "@/helpers/auth.ts";
  const admin = isAdmin()
  ```

## Browser

> 获取浏览器类型及版本，当前浏览器不完全兼容或版本过低时进行提示时使用，位于 `src/utils/browser.ts`

- `export const getBrowserType = (): string`

  获取浏览器类型

  ``` typescript
  import {getBrowserType} from "@/utils/browser.ts"
  const browserType = getBrowserType()
  ```

- `export const getBrowserMajorVersion = (): number`

  获取浏览器主要版本号

  ``` typescript
  import {getBrowserMajorVersion} from "@/utils/browser.ts"
  const browserMajorVersion = getBrowserMajorVersion()
  ```

## BrowserId

> 获取浏览器指纹id（基于 @fingerprintjs/fingerprintjs），该id与用户浏览器软件和机器硬件相关，同一浏览器id值一般唯一，系统中用于作为 WebSocket 连接的 clientId

- `const createBrowserId = async (): Promise<string>`

  获取当前浏览器id

  ``` typescript
  import {createBrowserId} from "@/utils/browser-id.ts";
  const browserId = await createBrowserId()
  ```

## Crypto

> 用于系统前端的数据加解密（AES-CBC，crypto-js）。Key/IV 硬编码于前端源码，仅作「记住我」密码与锁屏密码的本地混淆（防肩窥），不是真正的保密手段，勿用于新的保密场景

- `const encrypt = (data: string): string`

  数据加密

  ``` typescript
  import {encrypt} from "@/utils/crypto.ts"
  const encrypted = encrypt("data")
  ```

- `const decrypt = (data: string): string`

  数据解密

  ``` typescript
  import {decrypt} from "@/utils/crypto.ts"
  const data = decrypt(encrypted)
  ```

## Dict

> 系统字典，位于 `src/helpers/dict.ts`

- `const initDict = (...dictTypeCodes: string[]): Record<string, ComputedRef<SysDictDataType[]>>`

  通过字典编码获取字典options，缺失编码合并为一次批量请求并进行并发去重，详细用法见：[系统字典](/3.0/doc-web/development/sys-dict)

- `const getDictLabel = (option: SysDictDataType[], value?: string): string | undefined`

  通过字典options和value获取label

  ``` typescript
  import {getDictLabel} from "@/helpers/dict.ts";
  const label = getDictLabel(sys_notice_type.value, type)
  ```

- `const reLoadDict = (code: string): Promise<void>`

  通过字典编码重新从后端拉取字典并更新 store（消费页经 computed 即时更新）

  ``` typescript
  import {reLoadDict} from "@/helpers/dict.ts";
  await reLoadDict(dictTypeCode)
  ```

## AttachmentDownload

> 附件下载工具类，位于 `src/utils/attachment-download.ts`

- `export const download = (data: string | Blob, fileName?: string)`

  通用下载，根据传入参数不同自动调用不同的下载函数（Blob 走对象URL，字符串按链接处理）

  ``` typescript
  import {download} from "@/utils/attachment-download.ts";
  // 传入 blob 或 url。附件名称选填
  download(blob, file.name)
  ```

- `const downloadBlob = (blob: Blob, filename?: string)`

  下载blob附件（对象URL延迟60s释放，避免引用泄漏）

  ``` typescript
  import {downloadBlob} from "@/utils/attachment-download.ts";
  downloadBlob(blob, fileName)
  ```

- `const downloadFromUrl = (url: string, fileName?: string)`

  通过URL进行附件下载

  ``` typescript
  import {downloadFromUrl} from "@/utils/attachment-download.ts";
  downloadFromUrl(url, fileName);
  ```

## HandleDate

> 特殊的日期格式处理，位于 `src/utils/handle-date.ts`

- `const handleTime = (time: string): string`

  传入`YYYY-MM-DD HH:mm`格式的日期字符串，格式化为 `今天` `昨天` `前天` 类型的日期形式

  ``` typescript
  import dayjs from "dayjs";
  import {handleTime} from "@/utils/handle-date.ts";
  // 调用dayjs格式化item.releaseTime的日期格式，通过handleTime 进行再次处理
  handleTime(dayjs(item.releaseTime).format('YYYY-MM-DD HH:mm'))
  ```

## Os

> 获取操作系统类型，位于 `src/utils/os.ts`

- `const osType = (): 'Windows' | 'MacOS' | 'Linux' | 'Android' | 'iOS' | 'Unknown'`

  获取当前操作系统类型

  ``` typescript
  import {osType} from "@/utils/os.ts";
  const type = osType()
  ```

## Request

> axios 请求、响应拦截器及数据返回统一样式的封装，位于 `src/utils/request.ts`，详见[Api](/3.0/doc-web/standard/api)

- 请求拦截器：为axios请求的请求头添加 `Authorization: Bearer <token>` 与 `Client-Type: web`

- 响应拦截器：对于后端返回的特殊业务码进行处理（401：token失效，5 秒单飞窗清空用户数据后跳回登录页；451：非法ip访问，跳转到451页面），错误提示 3 秒去重，所有异常统一抛出 `ResponseError(code, msg)`

- `export default async function request<T> (config: AxiosRequestConfig): Promise<ResponseType<T>>`

  axios请求返回统一样式的封装，由api接口进行调用，通过传入泛型可在组件中推断出数据类型

  ``` typescript
  import request from "@/utils/request.ts";
  // 通过传入泛型可在组件中推断出数据类型
  export const findList = (data: SysDictDataType) => {
    return request<Array<SysDictDataType>>({
      url: 'system/dictData/list',
      method: 'post',
      data: data
    })
  }
  ```

- `export const blobRequest = async (config: AxiosRequestConfig): Promise<Blob>`

  二进制类型请求，responseType 固定为 blob，直接返回 Blob，用于附件下载等场景

  ``` typescript
  import {blobRequest} from "@/utils/request.ts";
  const blob = await blobRequest({url: 'system/attachment/download/' + id, method: 'get'})
  ```

## Scrollbar

> 页面滚动条控制（基于 overlayscrollbars 的页面级悬浮滚动条 + 滚动锁），位于 `src/utils/scrollbar.ts`

- `const initPageScrollbar = (): OverlayScrollbars | undefined`

  页面级悬浮滚动条接管（幂等，可在任意挂载点重复调用；移动端浏览器跳过接管恢复原生滚动）

  ``` typescript
  import {initPageScrollbar} from "@/utils/scrollbar.ts";
  initPageScrollbar()
  ```

- `const hiddenOverflowY():void`

  锁定页面滚动（蒙层/锁屏等显式调用；幂等）

  ``` typescript
  import {hiddenOverflowY} from "@/utils/scrollbar.ts";    
  hiddenOverflowY()
  ```

- `const showOverflowY(): void`

  恢复页面滚动

  ``` typescript
  import {showOverflowY} from "@/utils/scrollbar.ts";    
  showOverflowY()
  ```

- `const bridgeAntdScrollLock = (): void`

  antd 弹层（Modal/Drawer/图片预览）打开时的滚动锁镜像桥接，应用启动时调用一次

  ``` typescript
  import {bridgeAntdScrollLock} from "@/utils/scrollbar.ts";
  bridgeAntdScrollLock()
  ```

## Token

> 处理登录令牌，位于 `src/helpers/token.ts`。token 持久化在 `localStorage['lihua_token']`（经 @vueuse useStorage 响应式管理）

- `const getToken = ():string`

  获取登录token

  ``` typescript
  import token from "@/helpers/token.ts"
  token.getToken()
  ```

- `const setToken = (token: string):void`

  设置用户token

  ``` typescript
  import token from "@/helpers/token.ts";
  token.setToken(data)
  ```

- `const removeToken = ()`

  删除用户token

  ``` typescript
  import token from "@/helpers/token.ts";
  token.removeToken()
  ```

## Tree

> 前端进行树形结构的构建和对树形结构进行扁平化处理，位于 `src/utils/tree.ts`

- `export const buildTree = <T> (originList: Array<T>, rootValue?, id?, parentId?, children?)`

  **构建树形结构**传入扁平化的具有树形结构元素的集合，返回构建完成的树形结构。

  ``` typescript
  import {buildTree} from "@/utils/tree.ts";
  const treeList = buildTree(resp.data);
  // 打印出树形结构的Array集合
  console.log(treeList)
  ```

  为兼容各种数据结构，可通过参数指定各个属性的字段名

  ``` typescript
  import {buildTree} from "@/utils/tree.ts";
  // 通过参数指定root节点值、id属性名、pid属性名、子节点属性名
  const treeList = buildTree(resp.data,"0","code","pCode","children");
  // 打印出树形结构的Array集合
  console.log(treeList)
  ```

- `export const flattenTree  = <T> (tree:Array<T>, children: string = 'children')`

  **扁平化树形结构**传入树形结构集合，执行完成后返回Array集合

  ``` typescript
  import {flattenTree} from "@/utils/tree.ts";
  const flattenDeptList = flattenTree(resp.data)
  // 打印出没有树形结构的Array集合
  console.log(flattenDeptList)
  ```

- `const traverse = <T> (tree: Array<T>, callback: (item: T) => void | boolean, children: string = 'children')`

  **遍历树形结构**，参数一传入树形结构数组。参数二为回调函数，返回的item为遍历出的每个节点对象，回调 return true 可终止递归。参数三为children对应的节点名称，默认children

  ``` typescript
  import { traverse } from "@/utils/tree.ts";
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

- `const traverseWithPath = <T> (tree: T[], callback: (path: T[]) => any, children: string = 'children')`

  **带路径遍历树形结构**，回调参数为从根到当前节点的完整路径数组，回调返回值收集成数组返回

  ``` typescript
  import { traverseWithPath } from "@/utils/tree.ts";
  traverseWithPath(treeList, (path) => {
      // path 为从根到当前节点的完整路径
      console.log(path)
  })
  ```

## WebSocket

> WebSocket 单例管理器，位于 `src/utils/web-socket.ts`，详见[websocket](/3.0/doc-web/development/websocket)

- `const connect = async (): Promise<void>`

  连接 WebSocket（先取一次性令牌再建立连接），登录后由路由守卫自动调用

  ``` typescript
  import {connect} from "@/utils/web-socket.ts";
  await connect()
  ```

- `const addEventListener = (type: string, callback: (data: any) => void)`

  添加监听订阅，消息类型需与后台定义相同

  ``` typescript
  import {addEventListener} from "@/utils/web-socket.ts";
  addEventListener("WS_NOTICE", (data) => {console.log(data)})
  ```

- `const sendMessage = (type: string, data: any): boolean`

  发送数据（以 `{type, data, timestamp}` 协议封装），连接未就绪返回 false

  ``` typescript
  import {sendMessage} from "@/utils/web-socket.ts";
  sendMessage("WS_TYPE", data)
  ```

## WindowGuard

> 按键时间窗守卫（前沿节流），位于 `src/utils/window-guard.ts`。同一 key 在窗口期内只有第一次放行，其后拒直到窗口过期；窗口按时间流逝自动复位。典型用途：并发请求失败时同文案 message 只弹一条、认证失效联动只执行一次

- `const createWindowGuard = (windowMs: number): (key: string) => boolean`

  创建指定窗口时长（ms）的守卫函数，返回的函数传入 key，返回本次是否放行

  ``` typescript
  import {createWindowGuard} from "@/utils/window-guard.ts";
  const guard = createWindowGuard(3000)
  // 同一 key 3 秒内只放行一次
  if (guard('error-notify')) {
      message.error(msg)
  }
  ```
