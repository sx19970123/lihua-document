# 系统附件

`lihua-attachment` 附件模块，系统自带 `本地` 和 `阿里云OSS` 的策略实现，可在配置文件进行切换。本模块只要为业务模块 `SysAttachmentStorageService` 提供能力，与web、app端 `attachment-upload` 组件深度绑定。



## 配置

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对附件进行配置

### 附件配置

从 attachment 配置项可进行系统附件配置，其中 `uploadPublicBusinessCode` 为公开附件业务编码，即上传附件时携带的业务编码参数在此配置后，就可通过附件路径直接访问，无需经过鉴权。

``` yaml
# 附件配置
attachment:
  # 附件下载生成链接过期时间（分钟）
  fileDownloadExpireTime: 30
  # 文件上传服务类型：LOCAL（传统本地上传）、ALIYUN-OSS（阿里云oss）
  uploadFileModel: LOCAL
  # 公开文件的业务编码
  uploadPublicBusinessCode: [UserAvatar, SystemNotice, EditorIndex]
  # 上传文件路径，LOCAL模式下为服务器目录；ALIYUN-OSS模式下为桶下目录
  uploadFilePath: lihua
```

### OSS配置

OSS 配置需从 [阿里云](https://www.aliyun.com/) 配置后填入系统（敏感信息推荐使用环境变量方式注入）

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
     * 删除附件
     * @param fullFilePath 附件全路径
     */
    void delete(String fullFilePath);

    /**
     * 获取下载地址（针对限时链接）
     * @param fullFilePath 附件全路径
     * @param expiryInMinutes 过期时间（分钟）
     * @return 下载地址
     */
    String getDownloadURL(String fullFilePath, String originName, int expiryInMinutes);

    /**
     * 通过路径进行附件下载
     * @param fullFilePath 附件路径
     * @return 下载的附件流
     */
    InputStream download(String fullFilePath);
}
```



## 工具类

`FileUtils`  提供了本地附件上传、下载等操作方法，如需单独处理本地附件，可调用此工具类。



### 文件上传

**单文件上传（自动生成路径）**
```java
public static String upload(MultipartFile file)
```
- 参数：`file` 上传文件  
- 返回：文件完整路径  
- 说明：自动使用 UUID 重命名，路径格式：`{uploadFilePath}/{uuid}.{ext}`  

**单文件上传（指定路径）**
```java
public static String upload(MultipartFile file, String fullFilePath)
```
- 参数：  
  - `file` 上传文件  
  - `fullFilePath` 完整保存路径  
- 返回：保存后的文件路径  

**多文件上传**
```java
public static List<String> upload(MultipartFile[] files)
```
- 参数：`files` 文件数组  
- 返回：文件路径列表  

**流上传**
```java
public static String upload(InputStream inputStream, String fullFilePath)
```
- 参数：  
  - `inputStream` 文件流  
  - `fullFilePath` 完整保存路径  
- 返回：保存后的文件路径  


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

- `businessCode` 业务编码 `businessName` 业务名称 为附件上传接口必填参数，在固件管理中可快速定位到附件所属业务，并在附件上传时，在配置文件指定路径 `uploadFilePath` 基础上拼接 `businessCode` 更容易管理附件。前端使用 `attachment-upload` 组件时，会自动读取当前页面路由名称和页面菜单名称作为 `businessCode` `businessName` 。



- 在调用 `system/attachment/storage/public/upload` 进行附件上传时，需配置公开附件编码 `uploadPublicBusinessCode` ，否则无法调用公开上传。



- 在调用 `system/attachment/storage/download/p?fullPath=${fullPath}` 时也会对路径进行检查，是否包含公开附件编码。

