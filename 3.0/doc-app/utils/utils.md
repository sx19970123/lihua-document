# 工具类
工具类定义在 `utils` 目录下（token、remember 等登录态辅助在 `helpers` 目录下），大多数为系统某些组件需要而编写，可自行增删

列出的工具无特殊说明则表示兼容`安卓、iOS、微信小程序`



## 附件

路径 `/utils/attachment/attachment-utils`

::: info 平台分叉架构
附件域采用「域入口 + 平台分叉」结构：业务只 import `attachment-utils.ts`，内部经条件编译分发到 `platform/h5.ts`、`platform/app.ts`、`platform/mp.ts`（三者同签名导出）。各平台差异在 platform 文件内消化，业务层零感知。
:::

| 方法             | 参数              | 返回值                                                       | 描述                                 |
| --------------- | ---------------- | ------------------------------------------------------------ | ------------------------------------ |
| getFileInfo     | filePath?: string | type FileInfoType = {<br/>	fileName?: string,<br/>	filePath?: string,<br/>	size?: number,<br/>	md5?: string<br/>} | 根据附件路径获取详细信息（异步，路径为空返回空对象）     |
| getUploadHeader | -                | Record\<string, string\>                                     | 获取上传请求头（multipart 组装方式平台分叉） |
| getFileTempPath | url: string      | tempPath: string                                             | 根据网络路径下载附件临时路径（异步） |

### 获取附件详情

附件组件中使用，根据路径拿到附件基础信息（md5 用于秒传链路）。各平台实现：H5 经 fetch 取 Blob 后以 crypto-js 计算 MD5；App 端 `uni.getFileInfo`；小程序端 `getFileSystemManager`

```typescript
import {getFileInfo} from '@/utils/attachment/attachment-utils'
const { md5, fileName, filePath, size } = await getFileInfo(url)
```

### 获取上传请求头

H5 端返回空对象（Content-Type 必须由浏览器自动生成以携带 multipart boundary）；App / 小程序端手动声明 `multipart/form-data`（boundary 由原生实现组装）

```typescript
import {getUploadHeader} from '@/utils/attachment/attachment-utils'
const header = getUploadHeader()
```

### 获取附件临时地址

在头像、消息通知中使用，根据网络图片下载临时地址

``` typescript
import {getFileTempPath} from '@/utils/attachment/attachment-utils'
const tempURL = await getFileTempPath(url)
```



## UUID

路径 `/utils/uuid/uuid`

| 方法    | 参数 | 返回值       | 描述             |
| ------- | ---- | ------------ | ---------------- |
| getUUID | -    | UUID: string | 获取UUID（同步） |

### 获取UUID

websocket 连接的 clientId 生成使用

``` typescript
import {getUUID} from "@/utils/uuid/uuid"
const uuid = getUUID()
```



## 加解密

路径 `/utils/crypto`

::: warning 警告

encrypt() 和 decrypt() 的 key 和 iv 都是写死的，没那么安全

:::

| 方法    | 参数         | 返回值       | 描述             |
| ------- | ------------ | ------------ | ---------------- |
| encrypt | data: string | resp: string | 传入加密前数据，返回密文 |
| decrypt | data: string | resp: string | 传入密文，返回原数据 |

### 数据加解密

记住密码功能使用，对保存到storage的密码进行 AES 加解密

``` typescript
import {encrypt, decrypt} from "@/utils/crypto"
const data = encrypt(value)
const value = decrypt(data)
```



## 客户端类型

路径 `/utils/client`

| 方法         | 参数 | 返回值                              | 描述                           |
| ------------ | ---- | ----------------------------------- | ------------------------------ |
| getClientType | -    | 'app' \| 'wechat_mp' \| 'app_h5'    | 经条件编译返回当前客户端类型   |

### 获取客户端类型

请求头 `Client-Type` 与 websocket 连接参数使用

``` typescript
import {getClientType} from '@/utils/client'
const clientType = getClientType()
```



## 字典

路径 `/helpers/dict`

| 方法         | 参数                             | 返回值                           | 描述                                         |
| ------------ | -------------------------------- | -------------------------------- | -------------------------------------------- |
| initDict     | ...dictTypeCodes: string[]       | [key: string]: SysDictDataType[] | 根据传入的字典编码返回对应字典数据集合（未命中批量请求并缓存） |
| getDictLabel | SysDictDataType[], value: string | label: string                    | 传入字典数据集合和对应的value，返回label标签 |

### 获取字典选项

::: warning 提示

initDict()中获取到的字典选项集合为响应式对象，ts中使用需.value，极端情况下可能需要配合watch使用

:::

``` typescript
import { initDict } from '@/helpers/dict'
const {sys_notice_type} = initDict("sys_notice_type")
```

### 根据字典value获取label

拿到的字典选项集合为响应式数据，当数据未及时返回时，可能无法返回label，调用时推荐先进行判断

``` typescript
import { initDict, getDictLabel } from '@/helpers/dict'
const {sys_notice_type} = initDict("sys_notice_type")
const label = getDictLabel(sys_notice_type.value, '1')
```



## 日期
路径 `/utils/handle-date`

| 方法       | 参数                           | 返回值             | 描述                                                         |
| ---------- | ------------------------------ | ------------------ | ------------------------------------------------------------ |
| handleTime | time?: string \| number \| Date | formatDate: string | 传入时间字符串或时间戳，格式化为 `YYYY-MM-DD HH:mm` 形式，当日期在今天/昨天/前天时转为 `今天` `昨天` `前天` |

### 处理日期时间格式

``` typescript
import {handleTime} from "@/utils/handle-date"
const formatDate = handleTime(date)
```



## 触觉反馈 <Badge type="warning" text="仅APP支持" />

路径 `/utils/haptic`

| 方法               | 参数 | 返回值 | 描述                                                         |
| ------------------ | ---- | ------ | ------------------------------------------------------------ |
| triggerLightHaptic | -    | -      | 轻触感反馈；H5/小程序端整体为 no-op，调用方无需做平台判断     |

### 触发轻触感

在需要触觉确认的时刻同步调用（如下拉刷新越阈值、拖拽吸附到位）；iOS 走 `UIImpactFeedbackGenerator`，Android 走原生 `performHapticFeedback`，均不可用时兜底 `uni.vibrateShort`

``` typescript
import {triggerLightHaptic} from '@/utils/haptic'
triggerLightHaptic()
```



## 消息通知 <Badge type="warning" text="仅APP支持" />

路径 `/utils/message-notify`

| 方法 | 参数                                                         | 描述                                                         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| show | notifyContent: NotifyContent, <br />clickCallback: () => void, <br />moveCallback: (direction: 'right' \| 'left' \| 'bottom' \| 'top') => void | 打开原生通知横幅，接收三个参数：<br />参数一为NotifyContent 对象，定义了`title标题` `content内容` `image图片` `duration自动消失时间` <br />参数二为点击消息通知触发的回调，点击后通知会自动消失<br />参数三为滑动通知触发的回调，返回滑动方向，只滑动一定阈值后才会触发，且触发后通知自动消失<Badge type="warning" text="受限于plusAPI安卓仅支持上划关闭" /> |
| hide | -                                                            | 关闭通知提示                                                 |

### 显示通知

App.vue 中结合 websocket 集成了全局消息通知（编排逻辑在 `helpers/notice-notify.ts`），收到通知后会在app头部弹出原生横幅。点击跳转消息详情，向下滑动打开轻量通知抽屉。

``` typescript
// #ifdef APP-PLUS
// 仅app支持原生消息通知
import MessageNotify from '@/utils/message-notify'
// #endif

const showNotify = () => {
  // 全局消息提醒
	MessageNotify.show({title: '收到一条新通知', content: '通知内容', image: '_www/static/notice/MessageOutlined.png', duration: 5000}, () => {
  	console.log("点击了消息通知")
	}, (direction) => {
  	// direction === 'bottom' 时向下滑动，项目中在此打开轻量通知抽屉
		console.log("滑动了消息通知，方向为：", direction)
	})
}
```

### 关闭通知

一般不会主动调用，点击、滑动后都会由工具内部调用

``` typescript
// #ifdef APP-PLUS
// 仅app支持原生消息通知
import MessageNotify from '@/utils/message-notify'
// #endif

const hideNotify = () => {
  // 关闭通知
	MessageNotify.hide()
}
```



## 请求

路径 `/utils/request`

| 方法             | 参数                  | 返回值                             | 描述     |
| ---------------- | --------------------- | ---------------------------------- | -------- |
| request          | config: RequestConfig | resp: Promise\<ResponseType\<T\>\> | 发送请求 |
| attachmentUpload | config: RequestConfig | resp: Promise\<ResponseType\<T\>\> | 附件上传（独立 60s 超时） |

### 发送请求

一般由API中的方法调用，业务中基本不会调用

``` typescript
import request from "@/utils/request"
export const queryAttachmentInfoByIds = (ids: string[]) => {
    return request<Array<SysAttachment>>({
        url: "app/system/attachment/storage/info",
        method: "POST",
        data: ids
    })
}
```

### 附件上传

一般由API中的方法调用，业务中基本不会调用；大文件上传耗时远超普通请求，内部使用独立 60s 超时

``` typescript
import {attachmentUpload} from "@/utils/request";
import {getUploadHeader} from "@/utils/attachment/attachment-utils";
export const upload = (filePath: string, options: {businessCode: string, businessName?: string, public?: boolean}) => {
	// formData 值必须为字符串（undefined 会被序列化为 "undefined"），可选字段按需拼入
	const formData: Record<string, string> = {businessCode: options.businessCode}
	if (options.businessName) {
		formData.businessName = options.businessName
	}
	if (options.public) {
		formData.public = "true"
	}
	return attachmentUpload<AttachmentUploadVO>({
		url: "app/system/attachment/storage/upload",
		filePath: filePath,
		name: 'file',
		formData,
		header: getUploadHeader()
	})
}
```



## 文本

路径`/utils/text-utils`

| 方法             | 参数                                               | 返回值         | 描述                                           |
| ---------------- | -------------------------------------------------- | -------------- | ---------------------------------------------- |
| measureTextWidth | text: string, fontSize: number, fontFamily: string | length: number | 传入文本、字号、字体类型返回文本占用的横向长度 |

### 获取文本占用长度

原生消息通知中用于计算文本长度拼接省略号使用

``` typescript
import {measureTextWidth} from '@/utils/text-utils'
const width = measureTextWidth(slice, fontSize)
```



## 轻提示

路径`/utils/toast`

| 方法             | 参数                          | 描述                              |
| ---------------- | ----------------------------- | --------------------------------- |
| toast            | msg: string, duration: number | 显示无图标，在屏幕底部的toast提示 |
| toastRequestError | err: unknown                 | 请求异常兜底提示（内部跳过 401/451，避免与请求层处理双弹） |

### 显示提示

统一在底部、无图标的消息提醒

``` typescript
import { toast } from '@/utils/toast';
toast("轻提示")
```

### 请求异常兜底

请求层仅 401/451 自动 toast，其余失败路径静默抛错，调用方捕获后用此函数兜底提示

``` typescript
import { toastRequestError } from '@/utils/toast';
try {
  await api()
} catch(err) {
  toastRequestError(err)
}
```



## Token

路径 `/helpers/token`

| 方法        | 参数          | 返回值        | 描述      |
| ----------- | ------------- | ------------- | --------- |
| getToken    | -             | token: string | 获取token |
| setToken    | token: string | -             | 设置token |
| removeToken | -             | -             | 删除token |

### 获取Token

在路由守卫和请求前置拦截时使用

``` typescript
import {getToken} from '@/helpers/token'
const token = getToken()
```

### 设置Token

登录后设置token

``` typescript
import { setToken } from "@/helpers/token"
setToken(resp.data)
```

### 删除Token

退出登录或token失效时调用

``` typescript
import { removeToken } from "@/helpers/token"
removeToken()
```



## 记住我

路径 `/helpers/remember`

| 方法                     | 参数                                                  | 返回值                                      | 描述                 |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------- | -------------------- |
| rememberMe               | enable: boolean, username?: string, password?: string | -                                           | 记住我               |
| updateRememberedPassword | password: string                                      | -                                           | 修改密码后同步更新已记住的密码（仅记住我开启时生效） |
| getRememberedInfo        | -                                                     | false\|{username: string, password: string} | 获取记住我对应的数据（有效期30天） |

### 记住我

登录页面勾选调用，密码经 crypto AES 加密后存 storage

``` typescript
import { rememberMe } from '@/helpers/remember'
rememberMe(enableRememberMe.value, username, password)
```

### 获取记住我对应的数据

打开app时在登录页调用，用于回显账号密码信息

``` typescript
import { getRememberedInfo } from '@/helpers/remember'
const rememberedInfo = getRememberedInfo()
```



## 树数据处理

路径 `/utils/tree`

| 方法             | 参数                                                         | 返回值           | 描述                                       |
| ---------------- | ------------------------------------------------------------ | ---------------- | ------------------------------------------ |
| traverse         | tree: Array\<T\>,<br />callback: (item: T) => void \| boolean,<br />children: string | boolean          | 遍历树形结构数据，callback 返回 `true` 时停止遍历 |
| traverseWithPath | tree: T[],<br />callback: (path: T[]) => any,<br />children: string | 收集结果数组     | 遍历树形结构数据，回调参数为从根到当前节点的完整路径 |

### 遍历树形数据

只获取当前节点，在回调中返回 `true` 则停止遍历，参数三支持配置children的key

``` typescript
import {traverse} from '@/utils/tree'
traverse(treeData, (item) => {
  console.log("获取到的树节点", item)
})
```

获取当前节点的所有父节点，在回调中以集合的形式返回当前节点的所有父级节点，参数三支持配置children的key

``` typescript
import { traverseWithPath } from "@/utils/tree"
traverseWithPath(treeData, (itemList) => {
  console.log("获取到的树节点以及所有父节点集合", itemList)
})
```



## websocket

路径 `/utils/web-socket`

| 方法                | 参数                                        | 描述                     |
| ------------------- | ------------------------------------------- | ------------------------ |
| connect             | -                                           | 建立websocket连接（内部先换取一次性令牌） |
| closeConnect        | -                                           | 断开websocket连接        |
| manualReconnect     | -                                           | 手动重连（自动重连耗尽后的外部恢复通道） |
| sendMessage         | type: string, data: any                     | 向服务器发送数据         |
| addEventListener    | type: string, callback: (data: any) => void | 添加监听服务器发送的数据 |

另有响应式连接状态 `wsStatus`（`connected` / `reconnecting` / `disconnected`）。

### 连接

用户登录后会在`src/router/router.ts`中主动连接，一般无需手动调用

```typescript
webSocket.connect()
```

### 断开

token失效或退出登录时会主动断开，一般无需手动调用

```typescript
webSocket.closeConnect()
```

### 手动重连

自动重连（3次×2s）耗尽停止后，由 UI 层显式调用恢复

```typescript
if (wsStatus.value === 'disconnected') {
  webSocket.manualReconnect()
}
```

### 发送数据

调用 sendMessage() 方法发送消息，接收两个参数，消息类型和消息。 消息类型需与后台定义相同，用于区分不同业务。消息需要可转为json或为字符串类型

```typescript
webSocket.sendMessage("WS_HEARTBEAT", "ping")
```

### 接收数据

在需要添加监听时调用addEventListener函数，接收两个参数，消息类型和监听回调。 消息类型需与后台定义相同，用于区分不同业务。回调函数中会拿到后端发送的数据。全局业务监听统一住 App.vue，[详见](/3.0/doc-app/development/websocket)

```typescript
webSocket.addEventListener("WS_TYPE", (data: Type) => {console.log("拿到的websocket数据" + data)})
```
