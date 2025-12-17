# 工具类
工具类定义在 `utils` 目录下，大多数为系统某些组件需要而编写，可自行增删

列出的工具无特殊说明则表示兼容`安卓、iOS、微信小程序`



## 附件

路径 `/utils/attachment/AttachmentUtils`

| 方法            | 参数             | 返回值                                                       | 描述                                 |
| --------------- | ---------------- | ------------------------------------------------------------ | ------------------------------------ |
| getFileInfo     | filePath: string | type FileInfoType = {<br/>	fileName?: string,<br/>	filePath?: string,<br/>	size?: number,<br/>	md5?: string<br/>} | 根据附件路径获取详细信息（异步）     |
| getFileTempPath | url: string      | tempPath: string                                             | 根据网络路径获取附件临时路径（异步） |

### 获取附件详情

附件组件中使用，根据路径拿到附件基础信息


```typescript
import {getFileInfo} from '@/utils/attachment/AttachmentUtils'
const { md5, fileName, filePath, size } = await getFileInfo(url)
```
### 获取附件临时地址

在消息通知中使用，根据网络图片拿到临时地址，显示到通知中

``` typescript
import {getFileTempPath} from '@/utils/attachment/AttachmentUtils'
const tempURL = await getFileInfo(url)
```



## UUID

路径 `/utils/uuid/uuid`

| 方法    | 参数 | 返回值       | 描述             |
| ------- | ---- | ------------ | ---------------- |
| getUUID | -    | UUID: string | 获取UUID（异步） |

### 获取UUID

``` typescript
import {getUUID} from "@/utils/uuid/uuid"
const uuid = await getUUID()
```



## 加解密

路径 `/utils/Crypto`

::: warning 警告

encrypt() 和 decrypt() 的 key 和 iv 都是写死的，没那么安全

:::

| 方法               | 参数             | 返回值                                | 描述                                         |
| ------------------ | ---------------- | ------------------------------------- | -------------------------------------------- |
| encrypt            | data: string     | resp: string                          | 传入加密前数据，返回密文                     |
| decrypt            | data: string     | resp: string                          | 传入密文，返回原数据                         |
| rasEncryptPassword | password: string | {ciphertext:string,requestKey:string} | 用户密码的非对称加密，与后端交互使用（异步） |

### 数据加密

记住我功能使用，对保存到storage的密码进行加密

``` typescript
import {encrypt} from "@/utils/Crypto"
const data = encrypt(value)
```

### 数据解密

记住我功能使用，对保存到storage的密码进行解密

``` typescript
import {decrypt} from "@/utils/Crypto"
const value = decrypt(data)
```

### 密码加密

用户注册、登录等涉及密码时使用，ciphertext、requestKey 供后台解密，业务中一般不会调用

``` typescript
import {rasEncryptPassword} from "@/utils/Crypto";
const {ciphertext, requestKey} = await rasEncryptPassword(password)
```



## 字典

路径 `/utils/Dict`

| 方法         | 参数                             | 返回值                           | 描述                                         |
| ------------ | -------------------------------- | -------------------------------- | -------------------------------------------- |
| initDict     | dictCodes: string[]              | [key: string]: SysDictDataType[] | 根据传入的字典编码返回对应字典数据集合       |
| getDictLabel | SysDictDataType[], value: string | label: string                    | 传入字典数据集合和对应的value，返回label标签 |

### 获取字典选项

::: warning 提示

initDict()中获取到的字典选项集合为响应式对象，ts中使用需.value，极端情况下可能需要配合watch使用

:::

``` typescript
import { initDict } from '@/utils/Dict'
const {sys_notice_type} = initDict("sys_notice_type")
```

### 根据字典value获取label

拿到的字典选项集合为响应式数据，当数据未及时返回时，可能无法返回label，调用时推荐先进行判断

``` typescript
import { initDict, getDictLabel } from '@/utils/Dict'
const {sys_notice_type} = initDict("sys_notice_type")
const label = getDictLabel(sys_notice_type.value, '1')
```




## 日期
路径 `/utils/HandleDate`

| 方法       | 参数                           | 返回值             | 描述                                                         |
| ---------- | ------------------------------ | ------------------ | ------------------------------------------------------------ |
| handleTime | date: string \| number \| Date | formatDate: string | 传入时间字符串或时间戳，格式化为 `YYYY-MM-DD HH:mm` 形式，当日期在三天以内时 `YYYY-MM-DD` 转为 `今天` `昨天` `前天` |

### 处理日期时间格式

``` typescript
import {handleTime} from "@/utils/HandleDate"
const formatDate = handleTime(date)
```



## 消息通知 <Badge type="warning" text="仅APP支持" />

路径 `/utils/MessageNotify`

| 方法 | 参数                                                         | 描述                                                         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| show | notifyContent: NotifyContent, <br />clickCallback: () => void, <br />moveCallback: (direction: 'right' \| 'left' \| 'bottom' \| 'top') => void | 打开通知提示，接收三个参数：<br />参数一为NotifyContent 对象，定义了`title标题` `content内容` `image图片` `duration自动消失时间` <br />参数二为点击消息通知触发的回调，点击后通知会自动消失<br />参数三为滑动通知触发的回调，返回滑动方向，只滑动一定阈值后才会触发，且触发后通知自动消失<Badge type="warning" text="受限于plusAPI安卓仅支持上划关闭" /> |
| hide | -                                                            | 关闭通知提示                                                 |

### 显示通知

App.vue 中结合 websocket 集成了全局消息通知，收到通知后会在app头部弹出，任意方向滑动超过阈值后会关闭，向下滑动有阻尼效果。收到消息提醒后会触发轻通知，在当前页面打开抽屉展示通知。<Badge type="warning" text="受限于plusAPI安卓仅支持上划关闭" />

``` typescript
// #ifdef APP-PLUS
// 仅app支持原生消息通知
import MessageNotify from '@/utils/MessageNotify'
// #endif

const showNotify = () => {
  // 全局消息提醒
	MessageNotify.show({title: '收到一条新通知', content: '通知内容', image: 'http://www.xxx/xxx.png', duration: 5000}, () => {
  	console.log("点击了消息通知")
	}, (direction) => {
		console.log("滑动了消息通知，方向为：", direction)
	})
}
```

### 关闭通知

一般不会主动调用，点击、滑动后都会由工具内部调用

``` typescript
// #ifdef APP-PLUS
// 仅app支持原生消息通知
import MessageNotify from '@/utils/MessageNotify'
// #endif

const hideNotify = () => {
  // 关闭通知
	MessageNotify.hide()
}
```

## 请求

路径 `/utils/Request`

| 方法             | 参数                  | 返回值                                           | 描述     |
| ---------------- | --------------------- | ------------------------------------------------ | -------- |
| request          | config: RequestConfig | resp: Promise\<ResponseType\<T\> & ArrayBuffer\> | 发送请求 |
| attachmentUpload | config: RequestConfig | resp: Promise\<ResponseType\<T\>\>               | 附件上传 |

### 发送请求

一般由API中的方法调用，业务中基本不会调用

``` typescript
import request from "@/utils/Request"
export const queryAttachmentInfoByIds = (ids: string[]) => {
    return request<Array<SysAttachment>>({
        url: "app/system/attachment/storage/info",
        method: "POST",
        data: ids
    })
}
```

### 附件上传

一般由API中的方法调用，业务中基本不会调用

``` typescript
import {attachmentUpload} from "@/utils/Request";
export const upload = (filePath: string, businessCode: string, businessName: string, md5?: string) => {
	return attachmentUpload<string>({
		url: "app/system/attachment/storage/upload",
		filePath: filePath,
		name: 'file',
		formData: {
			md5,
			businessCode,
			businessName,
			uploadMode: "0"
		},
		header: {'Content-Type': 'multipart/form-data'}
	})
}
```

## 文本

路径`/utils/TextUtils`

| 方法             | 参数                                               | 返回值         | 描述                                           |
| ---------------- | -------------------------------------------------- | -------------- | ---------------------------------------------- |
| measureTextWidth | text: string, fontSize: number, fontFamily: string | length: number | 传入文本、字号、字体类型返回文本占用的横向长度 |

### 获取文本占用长度

原生消息通知中用于计算文本长度拼接省略号使用

``` typescript
import {measureTextWidth} from '@/utils/TextUtils'
const width = measureTextWidth(slice, fontSize)
```



## 轻提示

路径`/utils/Toast`

| 方法  | 参数                          | 描述                              |
| ----- | ----------------------------- | --------------------------------- |
| toast | msg: string, duration: number | 显示无图标，在屏幕底部的toast提示 |

### 显示提示

统一在底部、无图标的消息提醒

``` typescript
import { toast } from '@/utils/Toast';
toast("轻提示")
```



## Token

路径 `/utils/Token`

| 方法              | 参数                                                  | 返回值                                      | 描述                 |
| ----------------- | ----------------------------------------------------- | ------------------------------------------- | -------------------- |
| getToken          | -                                                     | token: string                               | 获取token            |
| setToken          | token: string                                         | -                                           | 设置token            |
| removeToken       | -                                                     | -                                           | 删除token            |
| rememberMe        | enable: boolean, username?: string, password?: string | -                                           | 记住我               |
| getRememberedInfo | -                                                     | false\|{username: string, password: string} | 获取记住我对应的数据 |

### 获取Token

在路由守卫和请求前置拦截时使用

``` typescript
import {getToken} from '@/utils/Token'
const token = getToken()
```

### 设置Token

登录后设置token

``` typescript
import { setToken } from "@/utils/Token"
setToken(resp.data)
```

### 删除Token

退出登录或token失效时调用

``` typescript
import { removeToken } from "@/utils/Token"
removeToken()
```

### 记住我

登录页面勾选调用

``` typescript
import { rememberMe } from '@/utils/Token'
rememberMe(enableRememberMe.value, username, password)
```

### 获取记住我对应的数据

打开app时在登录页调用，用于回显账号密码信息

``` typescript
import { getRememberedInfo } from '@/utils/Token'
const rememberedInfo = getRememberedInfo()
```



## 树数据处理

路径 `/utils/Tree`

| 方法             | 参数                                                         | 返回值           | 描述                                       |
| ---------------- | ------------------------------------------------------------ | ---------------- | ------------------------------------------ |
| flattenTree      | tree: Array\<T\>, children: string                           | tree: Array\<T\> | 将树形结构扁平化                           |
| buildTree        | originList: Array\<T\>,<br/>rootValue: string,<br/> id: string,<br/>parentId: string,<br/>children: string | tree: Array\<T\> | 构建树形结构数据                           |
| traverse         | tree: Array\<T\>,<br />callback: (item: T) => void,<br />children: string | -                | 遍历树形结构数据                           |
| traverseWithPath | tree: T[],<br />callback: (path: T[]) => any,<br />children: string | -                | 遍历树形结构数据，返回当前节点的所有父节点 |

### 将树形数据扁平化

传入树形结构，将树形结构中所有children都放到一个集合中，参数二支持配置children的key

``` typescript
import {buildTree} from '@/utils/Tree'
const data = flattenTree(treeData)
```



### 构建树形数据

 传入符合构建为树形结构的数据集合。除了集合本身可配置rootValue、id、parentId、children 的key 以适应不同结构的数据

``` typescript
import {buildTree} from '@/utils/Tree'
const treeData = buildTree(originList)
```



### 遍历树形数据

只获取当前节点，在回调用返回 `false` 则停止遍历，参数三支持配置children的key

``` typescript
import {traverse} from '@/utils/Tree'
traverse(treeData, (item) => {
  console.log("获取到的树节点", item)
})
```

获取当前节点的所有父节点，在回调中以集合的形式返回当前节点的所有父级节点，参数三支持配置children的key

``` typescript
import { traverseWithPath } from "@/utils/Tree"
traverseWithPath(treeData, (itemList) => {
  console.log("获取到的树节点以及所有父节点集合", itemList)
})
```



## websocket

路径 `/utils/Websocket`

| 方法                | 参数                                        | 描述                     |
| ------------------- | ------------------------------------------- | ------------------------ |
| connect             | -                                           | 建立websocket连接        |
| closeConnect        | -                                           | 断开websocket连接        |
| sendMessage         | type: string, data: any                     | 向服务器发送数据         |
| addEventListener    | type: string, callback: (data: any) => void | 添加监听服务器发送的数据 |
| removeEventListener | type: string                                | 删除监听服务器发送的数据 |

### 连接

用户登录后会在`src/router/Router.ts`中主动连接，一般无需手动调用

```typescript
websocket.connect()
```

### 断开

token失效或退出登录时会主动断开，一般无需手动调用

```typescript
websocket.closeConnect()
```

### 发送数据

调用 sendMessage() 方法发送消息，接收两个参数，消息类型和消息。 消息类型需与后台定义相同，用于区分不同业务。消息需要可转为json或为字符串类型

```typescript
websocket.sendMessage("WS_HEARTBEAT", "ping")
```

### 接收数据

在需要添加监听时调用addEventListener函数，接收两个参数，消息类型和监听回调。 消息类型需与后台定义相同，用于区分不同业务。回调函数中会拿到后端发送的数据

```typescript
websocket.addEventListener("WS_TYPE", (data: Type) => {console.log("拿到的websocket数据" + data)})
```

### 删除接收监听

在不需要添加监听时调用removeEventListener函数，传入消息类型即可

```typescript
websocket.removeEventListener("WS_TYPE")
```