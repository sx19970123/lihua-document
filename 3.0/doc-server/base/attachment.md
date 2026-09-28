# 系统附件

`lihua-base-attachment` 附件模块，系统自带 `本地` 和 `阿里云OSS` 的策略实现，可在配置文件进行切换。本模块主要为业务模块 `SysAttachmentStorageService` 提供能力，与web、app端 `attachment-upload` 组件深度绑定。3.0 中新增了 Range 协商下载、签名下载链与分片上传模式化能力。



## 配置

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对附件进行配置

### 附件配置

``` yaml
# 附件配置
attachment:
  # 下载链接签名密钥（HMAC-SHA256；缺失或长度不足（16字符）启动失败。生产环境必须经环境变量注入；建议 32+ 随机字符，如 openssl rand -hex 32）
  downloadSignKey: xxxxxx
  # 下载链接默认时效（缺省 1 小时；Duration 带单位写法：s/m/h/d，如 1h、90m，裸数字按分钟）
  downloadExpireTime: 1h
  # 允许上传的附件扩展名（小写、不带点，如 [jpg, pdf]；空=不限制，由使用方按部署场景决定）
  # uploadAllowExtensions: [jpg, jpeg, png, gif, webp, bmp, pdf]
  # 文件上传服务类型：LOCAL（传统本地上传）、ALIYUN-OSS（阿里云oss）
  uploadFileModel: LOCAL
  # 上传文件路径，LOCAL模式下为服务器目录；ALIYUN-OSS模式下为桶下目录
  uploadFilePath: lihua
```

> `downloadSignKey` 是 3.0 附件下载链的安全基石：所有私密附件的下载地址都经该密钥 HMAC-SHA256 签名，未配置或长度不足时**系统直接拒绝启动**，避免悄悄回退成无签名链接

### OSS配置

OSS 配置需从 [阿里云](https://www.aliyun.com/) 配置后填入系统（敏感信息推荐使用环境变量方式注入），并同配置项 `uploadFilePath` 为桶下目录

``` yaml
aliyun:
  oss:
    endpoint:
    access-key-id:
    access-key-secret:
    bucket-name:
```



## 附件策略

模块通过 `AttachmentStorageStrategy` 策略定义附件能力，上层调用此策略接口完成相关附件操作。目前系统支持 `本地` 和 `阿里云OSS` 的策略，如需使用其他对象存储服务，可直接实现此接口，重写对应方法。（可直接让AI根据此接口生成对应对象存储的实现！）

``` java
/**
 * 不同附件存储方式策略接口
 */
public interface AttachmentStorageStrategy {

    /**
     * 附件上传
     */
    void uploadFile(MultipartFile file, String fullFilePath);

    /**
     * 通过路径判断附件是否存在
     */
    boolean isExists(String fullFilePath);

    /**
     * 获取分片上传 uploadId
     */
    String getUploadId(String fullFilePath);

    /**
     * 获取已上传的分片 PartNumber
     */
    List<Integer> getUploadedChunksIndex(String fullFilePath, String uploadId);

    /**
     * 分片附件上传
     */
    void chunksUploadFile(MultipartFile file, String fullFilePath, Integer index, String uploadId);

    /**
     * 分片附件合并
     */
    void chunksMerge(String fullFilePath, String md5, String uploadId, Integer total);

    /**
     * 清理分片上传的临时资源
     */
    void cleanChunks(String fullFilePath, String uploadId);

    /**
     * 删除附件
     */
    void delete(String fullFilePath);

    /**
     * 下载数据面重定向地址（对象存储 302 现场生成短时效预签名；返回 null 表示直接流式下发）
     */
    String getDownloadRedirectUrl(String fullFilePath);
}
```



## 上传模式

附件上传方式由 `AttachmentUploadModeEnum` 枚举维护（字典类型 `sys_attachment_upload_mode`），前端 `attachment-upload` 组件按此区分行为

- `NORMAL`：一般上传，单请求直传
- `CHUNK`：分片上传，大文件切片上传后合并，配合断点续传（已传分片索引存于 Redis，前缀 `REDIS_CACHE_CHUNK_UPLOAD_ID`）
- `FAST`：文件秒传，服务端按 md5 检测已有文件直接建立关联，跳过传输



## 签名下载链

私密附件的下载地址不再"拼路径即可访问"，而是经过 HMAC-SHA256 签名的三段式令牌：`过期时间戳.Base64Url(附件路径).签名`，路径与时效明文携带、签名防伪造防篡改

- 签发：`SignedUrlUtils.sign(path, expireTimeMillis, secretKey)` 生成下载链
- 校验：`SignedUrlUtils.verify(token, secretKey)` 还原签发内容，格式与签名均合法才放行（常量时间比较防时序侧信道）
- 时效：`attachment.downloadExpireTime` 控制默认有效期，过期链接返回失败

下载接口为 `system/attachment/storage/download`（App 端多一层 `app` 前缀）：`key` 参数携带签名链时按私密下载处理，`fullPath` 参数走公开链下载



## Range 协商下载

本地附件下载支持 HTTP Range 区间请求，按请求头自动协商、与文件类型无关

- 区间命中时响应 `206 Partial Content`，只返回请求区间的字节，并带 `Content-Range` 与 `Accept-Ranges`
- 视频进度条拖动（media seek）、断点续传等场景依赖此能力
- 仅处理单区间形态（`bytes=start-end` / `start-` / `-suffix`），多区间与非法形态回退 `200` 全量下载（RFC 允许忽略 Range）



## 工具类

`FileUtils`  提供了本地附件上传、下载等操作方法，如需单独处理本地附件，可调用此工具类。



### 文件上传

**单文件上传**
```java
public static String upload(MultipartFile file, String fullFilePath, String configPath)
```
- 参数：`file` 上传文件、`fullFilePath` 完整保存路径、`configPath` 允许写入的根目录
- 返回：保存后的文件路径
- 说明：内部转调流上传；写入前校验目标路径必须落在根目录之下，防路径穿越

**流上传**
```java
public static String upload(InputStream inputStream, String fullFilePath, String configPath)
```
- 参数：`inputStream` 文件流、`fullFilePath` 完整保存路径、`configPath` 允许写入的根目录
- 返回：保存后的文件路径
- 说明：自动创建父目录后保存，路径非法或写入失败抛出 `AttachmentException`


### 文件下载

**单文件下载**
```java
public static ResponseEntity<StreamingResponseBody> download(File file, String fileName, boolean autoDelete)
```
- 参数：`file` 文件对象、`fileName` 下载文件名、`autoDelete` 是否下载后删除
- 返回：文件下载响应
- 说明：自动协商 Range，支持 206 区间下载

**多文件打包下载（ZIP）**
```java
public static ResponseEntity<StreamingResponseBody> download(List<AttachmentStreamAndInfoModel> fileAndNameList)
```
- 参数：`fileAndNameList` 文件流及信息列表
- 返回：ZIP 下载响应
- 说明：多文件打包为ZIP后输出

**流下载**
```java
public static ResponseEntity<StreamingResponseBody> download(InputStream inputStream, String fileName)
```
- 参数：`inputStream` 文件流、`fileName` 下载文件名
- 返回：文件下载响应
- 说明：流式输出，另有带 `size` 参数的重载用于已知大小的场景


### 文件名工具

**生成 UUID 文件名**
```java
public static String generateUUIDFileName(String originFileName)
```
- 参数：`originFileName` 原文件名
- 返回：`{uuid}.{ext}`
- 说明：UUID 去横线后拼接原文件后缀

**获取文件后缀**
```java
public static String getExtensionNameByFileName(String fileName)
```
- 参数：`fileName` 文件名
- 返回：后缀（含`.`，如 `.jpg`）
- 说明：从文件名中解析后缀

**从路径获取文件名**
```java
public static String getFileNameByPath(String fullPath)
```
- 参数：`fullPath` 文件路径
- 返回：文件名
- 说明：取路径最后一段


### 文件操作

**删除文件**
```java
public static void delete(String fileFullPath)
```
- 参数：`fileFullPath` 文件完整路径
- 返回：无
- 说明：删除本地文件

**判断文件是否存在**
```java
public static boolean isExists(String path)
```
- 参数：`path` 文件路径
- 返回：是否存在
- 说明：判断本地文件是否存在

**读路径安全检查**
```java
public static boolean checkPath(String path, String configPath)
```
- 参数：`path` 待检查路径、`configPath` 允许目录
- 返回：是否安全
- 说明：防止目录遍历攻击，读取侧路径校验

**写路径安全检查**
```java
public static boolean checkWritePath(String path, String configPath)
```
- 参数：`path` 待检查路径、`configPath` 允许目录
- 返回：是否安全
- 说明：上传写入侧的路径校验，目标必须落在配置的附件根目录之下

## 其他

### 业务编码

- `businessCode` 业务编码 `businessName` 业务名称 为附件上传接口必填参数，在附件管理中可快速定位到附件所属业务，并在附件上传时，在配置文件指定路径 `uploadFilePath` 基础上拼接 `businessCode` 更容易管理附件。前端使用 `attachment-upload` 组件时，会自动读取当前页面路由名称和页面菜单名称作为 `businessCode` `businessName` 。
