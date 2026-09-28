# 文件服务 lihua-file

附件服务：上传、秒传、分片上传、断点续传、签名下载，本地与阿里云 OSS 双存储策略。

## 基本信息

| 项目 | 值 |
| ---- | -- |
| spring.application.name | `lihua-file` |
| 默认端口 | `8083`（`SERVER_PORT` 环境变量可覆盖） |
| 启动类 | `com.lihua.file.LiHuaFileApplication` |
| 依赖中间件 | MySQL（sys_attachment 表）、Redis（分片 uploadId 缓存）、Nacos |
| Nacos 配置 | `lihua-file.yaml`（`lihua-file` 分组）+ `lihua-common.yaml` + `lihua-resilience.yaml` |

## 模块结构

```text
lihua-file/
└── src/main/java/com/lihua/file/
    ├── LiHuaFileApplication.java               # 启动类
    ├── controller/
    │   ├── SysAttachmentController.java        # 附件管理（分页/详情/删除/下载链接）
    │   ├── SysAttachmentStorageController.java # 存储端点：分片系列（/system/attachment/storage）
    │   ├── app/
    │   │   └── AppSysAttachmentStorageController.java  # App版（app/system/attachment/storage）
    │   └── base/
    │       └── BaseSysAttachmentStorageController.java # 双版本共有端点基类
    ├── entity/SysAttachment.java               # 附件实体（含 md5、is_public）
    ├── mapper/                                 # 持久层
    ├── model/                                  # dto（分片开始/合并/秒传/上传）与 vo
    └── service/
        ├── SysAttachmentService.java           # 附件记录管理
        ├── SysAttachmentStorageService.java    # 存储业务（上传/下载/签名）
        └── impl/
            ├── SysAttachmentServiceImpl.java
            └── SysAttachmentStorageServiceImpl.java
```

> 存储能力底层由 `lihua-base-attachment` 提供（`AttachmentStorageStrategy` 策略接口 + `LocalStorageStrategyImpl`/`AliyunStorageStrategyImpl` 双实现），见 [系统附件](/3.0/doc-cloud/base/attachment)。

## 核心机制

### 附件三种上传模式

**普通上传**：`POST storage/upload` 直接上传，服务端生成 UUID 路径 `{uploadFilePath}/{uuid}.{ext}` 写入存储并落附件表记录。

**秒传**：`POST storage/fast/upload` 携带文件 md5——服务端已存在同 md5 文件时跳过传输直接建记录（复用既有物理文件），并清理分片临时资源；不存在时返回失败由前端转普通/分片上传。

**分片上传（断点续传）**：

1. `POST storage/chunk/start` 开始分片，获取 uploadId（Redis 缓存 `REDIS_CACHE_CHUNK_UPLOAD_ID:` 前缀）
2. `GET storage/chunk/uploadedIndex/{uploadId}` 查询已上传分片索引——前端据此跳过已传分片，实现**断点续传**
3. `POST storage/chunk/upload/{uploadId}/{index}` 逐片上传
4. `POST storage/chunk/merge/{total}` 合并分片，md5 校验比对后落库；OSS 策略下调用对象存储原生分片 API

### 存储策略双实现

上传模式 `attachment.uploadFileModel` 切换：`LOCAL`（服务器目录）与 `ALIYUN-OSS`（桶下目录 + 302 预签名）。策略接口 `AttachmentStorageStrategy` 抽象了上传/分片/合并/删除/下载等能力，切换存储只改配置不改代码。

### 签名下载

下载链接由 `SignedUrlUtils` 签发三段令牌（HMAC-SHA256），支持 Range 断点下载：

```text
GET /system/attachment/storage/download?key=<签名令牌>&originName=<原始文件名>

令牌：<过期毫秒时间戳>.<Base64Url(附件路径)>.<HMAC-SHA256Hex(路径::过期时间戳)>
```

- 服务端验签（常量时间比对）通过后流式下发，路径与时效明文携带、签名防伪造防篡改
- 下载接口在 SecurityConfig 中 permitAll，安全完全由签名链保障；默认时效 `attachment.downloadExpireTime: 1h`
- 附件管理接口 `GET system/attachment/url/{id}` 按需签发下载链接；`is_public` 行级公开标记的附件可走 `fullPath` 公开链下载

## 接口一览

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/system/attachment/page` | POST | 附件分页查询（附件管理页） |
| `/system/attachment/{id}` | GET | 根据 id 查询附件信息 |
| `/system/attachment` | DELETE | 附件删除（业务删除） |
| `/system/attachment/force/{id}` | DELETE | 强制删除（含物理文件，`@Log` 记录） |
| `/system/attachment/url/{id}` | GET | 获取附件下载链接（签发签名令牌） |
| `/system/attachment/storage/info` | POST | 查询附件信息（双版本共有） |
| `/system/attachment/storage/exists/{md5}` | GET | 按 md5 查询附件是否存在（秒传探测） |
| `/system/attachment/storage/upload` | POST | 普通上传 |
| `/system/attachment/storage/fast/upload` | POST | 文件秒传 |
| `/system/attachment/storage/chunk/start` | POST | 开始分片上传 |
| `/system/attachment/storage/chunk/uploadedIndex/{uploadId}` | GET | 查询已上传分片索引（断点续传） |
| `/system/attachment/storage/chunk/upload/{uploadId}/{index}` | POST | 上传分片 |
| `/system/attachment/storage/chunk/merge/{total}` | POST | 合并分片 |
| `/system/attachment/storage/download` | GET | 附件下载（key=私密签名链 / fullPath=公开链，支持 Range） |

## 配置与注意事项

- **`attachment.downloadSignKey` 必配**：缺失或短于 16 字符 lihua-file **拒绝启动**（`AttachmentProperties` 启动校验）；容器部署经 `ATTACHMENT_DOWNLOAD_SIGN_KEY` 环境变量注入，与 Nacos 配置 `downloadSignKey` 保持一致
- `uploadFilePath` 容器部署必须落在挂载卷内（`lihua-file/data/upload/` → 卷 `file-server-data`），否则容器重建附件丢失
- 大文件相关：`spring.servlet.multipart.max-file-size/max-request-size: 100MB`；网关侧 `fileCircuitBreaker` TimeLimiter 放宽到 **10m**，防止大文件分片/上传经网关被默认 10s 掐断
- 数据源与 lihua-system 共用同一 MySQL 库（`lihua-file.yaml`），修改须同步另一份
- 容器部署时 file 端口为 **8083**（compose 内 `SERVER_PORT=8083`），与本地默认一致；网关路由 `lihua-file` 必须先于 `lihua-system` 通配路由
