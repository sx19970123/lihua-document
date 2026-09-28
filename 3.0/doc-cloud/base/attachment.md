# 系统附件

`lihua-base-attachment` 附件模块，系统自带 `本地` 和 `阿里云OSS` 的策略实现，可在配置文件进行切换。本模块主要为文件服务 `SysAttachmentStorageService` 提供能力，与web、app端 `attachment-upload` 组件深度绑定。3.0 起下载链接升级为 HMAC-SHA256 私密签名链。



## 配置

附件配置在 Nacos `lihua-file.yaml` 中维护：

### 附件配置

从 attachment 配置项可进行系统附件配置，其中 `downloadSignKey` 为下载链接签名密钥（**3.0 必配，缺失或短于 16 字符 lihua-file 启动失败**）。

``` yaml
# 附件配置
attachment:
  # 下载链接签名密钥（HMAC-SHA256；建议 32+ 随机字符，容器部署经 ATTACHMENT_DOWNLOAD_SIGN_KEY 环境变量注入）
  downloadSignKey: xxxxxxxx
  # 下载链接默认时效（Duration 带单位写法：s/m/h/d，裸数字按分钟）
  downloadExpireTime: 1h
  # 允许上传的附件扩展名（小写、不带点，如 [jpg, pdf]；空=不限制）
  # uploadAllowExtensions: [jpg, jpeg, png, gif, webp, bmp, pdf]
  # 文件上传服务类型：LOCAL（传统本地上传）、ALIYUN-OSS（阿里云oss）
  uploadFileModel: LOCAL
  # 上传文件路径（容器部署必须落在挂载卷内，否则容器重建附件丢失）
  uploadFilePath: lihua-file/data/upload/
```

> 2.x 的 `fileDownloadExpireTime`、`uploadPublicBusinessCode` 已被签名链接机制取代：下载链接自带过期时间与签名，公开附件语义改由附件表行级 `is_public` 标记表达。

### OSS配置

OSS 配置需从 [阿里云](https://www.aliyun.com/) 配置后填入系统（敏感信息推荐使用环境变量方式注入），并将 `uploadFileModel` 切换为 `ALIYUN-OSS`，此时 `uploadFilePath` 语义为桶下目录

``` yaml
aliyun:
  oss:
    endpoint:
    access-key-id:
    access-key-secret:
    bucket-name:
```



## 附件策略

模块通过 `AttachmentStorageStrategy` 策略定义附件能力，上层调用此策略接口完成相关附件操作。目前系统支持 `本地` 和 `阿里云OSS` 的策略（`LocalStorageStrategyImpl`/`AliyunStorageStrategyImpl`），如需使用其他对象存储服务，可直接实现此接口，重写对应方法。（可直接让AI根据此接口生成对应对象存储的实现！）

``` java
/**
 * 不同附件存储方式策略接口
 */
public interface AttachmentStorageStrategy {

    /**
     * 附件上传
     * @param file 附件
     * @param fullFilePath 附件上传全路径
     */
    void uploadFile(MultipartFile file, String fullFilePath);

    /**
     * 通过路径判断附件是否存在
     * @param fullFilePath 附件全路径
     * @return 附件是否存在
     */
    boolean isExists(String fullFilePath);

    /**
     * 获取分片上传 uploadId
     * @param fullFilePath 附件全路径
     * @return uploadId
     */
    String getUploadId(String fullFilePath);

    /**
     * 获取已上传的分片 PartNumber
     * @param fullFilePath 附件全路径
     * @param uploadId 分片上传id
     * @return 已上传的PartNumber
     */
    List<Integer> getUploadedChunksIndex(String fullFilePath, String uploadId);

    /**
     * 分片附件上传
     * @param file 附件
     * @param fullFilePath 附件全路径
     * @param index 附件分片索引（PartNumber，从1开始）
     * @param uploadId 附件上传id
     */
    void chunksUploadFile(MultipartFile file, String fullFilePath, Integer index, String uploadId);

    /**
     * 分片附件合并
     * @param fullFilePath 生成的附件全路径
     * @param uploadId 前端生成uploadId
     * @param md5 附件md5，用于附件校验比对
     * @param total 总分片数量
     */
    void chunksMerge(String fullFilePath, String md5, String uploadId, Integer total);

    /**
     * 清理分片上传的临时资源（放弃合并或复用已有同 md5 文件跳过合并时调用）
     * 幂等：资源不存在时静默返回；清理失败不抛错（仅记录日志，残留由存储平台生命周期回收）
     */
    void cleanChunks(String fullFilePath, String uploadId);

    /**
     * 删除附件
     * @param fullFilePath 附件全路径
     */
    void delete(String fullFilePath);

    /**
     * 下载数据面重定向地址（对象存储 302 现场生成短时效预签名；返回 null 表示直接流式下发）
     * @param fullFilePath 附件全路径
     * @return 重定向地址，null 表示无重定向
     */
    String getDownloadRedirectUrl(String fullFilePath);
}
```



## 签名下载 <Badge type="tip" text="3.0" />

下载链接由 `SignedUrlUtils` 签发与校验，令牌为三段结构：

```text
<过期毫秒时间戳>.<Base64Url(附件路径)>.<HMAC-SHA256Hex(路径::过期时间戳)>
```

- 路径与时效明文携带，签名防伪造防篡改；签名密钥 `attachment.downloadSignKey` 由配置注入，不出服务器
- 校验时使用 `MessageDigest.isEqual` 常量时间比较，防时序侧信道
- 下载入口 `GET system/attachment/storage/download?key=<签名令牌>`，服务端验签通过后流式下发（支持 Range 断点下载）；对象存储策略下返回 302 短时效预签名地址
- 附件下载接口在 SecurityConfig 中放行（permitAll），安全完全由签名链保障——无需登录态即可消费已签发的链接

## 工具类

`FileUtils`  提供了本地附件上传、下载等操作方法，如需单独处理本地附件，可调用此工具类。



### 文件上传

**单文件上传**
```java
public static String upload(MultipartFile file, String fullFilePath, String configPath)
```
- 参数：  
  - `file` 上传文件  
  - `fullFilePath` 完整保存路径  
  - `configPath` 允许写入的根目录（写入侧路径校验基准，防路径穿越）
- 返回：保存后的文件路径  

**流上传**
```java
public static String upload(InputStream inputStream, String fullFilePath, String configPath)
```
- 参数：  
  - `inputStream` 文件流  
  - `fullFilePath` 完整保存路径  
  - `configPath` 允许写入的根目录（写入侧路径校验基准，防路径穿越）
- 返回：保存后的文件路径  

> 上传前内部会执行 `checkWritePath` 路径安全校验（目标必须落在配置的附件根目录之下），并自动创建父目录。文件名生成与路径拼接配合 `generateUUIDFileName` 使用。


### 文件下载

**单文件下载**
```java
public static ResponseEntity<StreamingResponseBody> download(File file, String fileName, boolean autoDelete)
```
- 参数：  
  - `file` 文件对象  
  - `fileName` 下载文件名  
  - `autoDelete` 是否下载后删除  
- 返回：文件下载响应  

**多文件打包下载（ZIP）**
```java
public static ResponseEntity<StreamingResponseBody> download(List<AttachmentStreamAndInfoModel> fileAndNameList)
```
- 参数：`fileAndNameList` 文件流及信息列表  
- 返回：ZIP 下载响应  

**流下载**
```java
public static ResponseEntity<StreamingResponseBody> download(InputStream inputStream, String fileName)
```
- 参数：  
  - `inputStream` 文件流  
  - `fileName` 下载文件名  
- 返回：文件下载响应  


### 文件名工具

**生成 UUID 文件名**
```java
public static String generateUUIDFileName(String originFileName)
```
- 参数：`originFileName` 原文件名  
- 返回：`{uuid}.{ext}`  

**获取文件后缀**
```java
public static String getExtensionNameByFileName(String fileName)
```
- 参数：`fileName` 文件名  
- 返回：后缀（含`.`，如 `.jpg`）  

**从路径获取文件名**
```java
public static String getFileNameByPath(String fullPath)
```
- 参数：`fullPath` 文件路径  
- 返回：文件名  


### 文件操作

**删除文件**
```java
public static void delete(String fileFullPath)
```
- 参数：`fileFullPath` 文件完整路径  

**判断文件是否存在**
```java
public static boolean isExists(String path)
```
- 参数：`path` 文件路径  
- 返回：是否存在  

**路径安全检查**
```java
public static boolean checkPath(String path, String configPath)
```
- 参数：  
  - `path` 待检查路径  
  - `configPath` 允许目录  
- 返回：是否安全（防止目录遍历攻击）  

## 其他

### 业务编码

- `businessCode` 业务编码 `businessName` 业务名称 为附件上传接口必填参数，在附件管理中可快速定位到附件所属业务，并在附件上传时，在配置文件指定路径 `uploadFilePath` 基础上拼接 `businessCode` 更容易管理附件。前端使用 `attachment-upload` 组件时，会自动读取当前页面路由名称和页面菜单名称作为 `businessCode` `businessName` 。
