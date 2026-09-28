# Controller 开发



## 统一返回方式

> controller 统一返回有两种方式，分为返回String 或 返回 ApiResponseModel\<T\> 可根据需求自行使用



### 返回 String

Controller 类继承 `StrResponseController`，方法定义返回值为 `String`。 这种情况下数据在业务工具中转为了Json，优势是无需考虑Controller的返回类型，非附件的情况下直接返回`String`即可。**适合前后端分离人不分离的场景** 这种模式下 `SpringDoc` 无法获取返回值的对象属性，不利于前后端沟通

``` java
package com.lihua;

import com.lihua.common.model.response.basecontroller.StrResponseController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("test")
public class TestController extends StrResponseController {

    @GetMapping("{id}")
    public String test(@PathVariable("id") String id) {
        return success(id);
    }
}
```



### 返回 ApiResponseModel\<T\>

Controller 类继承 `ApiResponseController`，方法定义返回值为 `ApiResponseModel<T>` 由MVC序列化为Json数据，优势是可以集成 `SpringDoc` 接口返回值文档清晰。**适合前后端分离的场景**

``` java
package com.lihua;

import com.lihua.common.model.response.ApiResponseModel;
import com.lihua.common.model.response.basecontroller.ApiResponseController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("test")
public class TestController extends ApiResponseController {

    @GetMapping("{id}")
    public ApiResponseModel<String> test(@PathVariable("id") String id) {
        return success(id);
    }
}
```

> 三者关系：`BaseResponseController` 为最基础的统一返回类，提供 `response()` 与 `responseToJson()` 方法；`ApiResponseController`（供 SpringDoc 读取返回值）与 `StrResponseController`（返回Json字符串）都继承自它。业务 Controller 按需继承后两者即可



### 返回 ResponseEntity\<StreamingResponseBody\>

附件下载中使用流式下载的返回值，`AttachmentResponse` 中已将麻烦的操作进行了封装，使用时直接调用 `AttachmentResponse.success()` 传入 `File、InputStream + fileName、List<AttachmentStreamAndInfoModel>`（多附件自动打包zip）即可，底层经 `FileUtils.download()` 实现，自动支持 HTTP Range 协商下载（视频拖动/断点续传）

``` java
@GetMapping("download")
public ResponseEntity<StreamingResponseBody> download(@RequestParam(name = "filePath") String filePath) {
    // 校验请求的文件路径是否合法（防止路径穿越）
    if (!FileUtils.checkPath(filePath, uploadFilePath)) {
        throw new AttachmentException("下载失败，路径不匹配");
    }

    // 单文件直接调用下载
    return AttachmentResponse.success(new File(filePath));
}
```

> `AttachmentResponse` 位于 `lihua-base-attachment` 模块 `com.lihua.attachment.model` 包下，提供 `success(File)`、`success(File, fileName)`、`success(File, fileName, autoDelete)`（下载完成后自动删除）、`success(List<AttachmentStreamAndInfoModel>)`、`success(InputStream, fileName)` 等重载



### 统一返回对象

``` java
public class ApiResponseModel<T> {
    // api请求正常默认值为200
    private Integer code;
    // api请求正常默认值为成功
    private String msg;
    // api请求响应对象
    private T data;
}
```



### 统一返回枚举

> 调用 success 返回时，使用默认枚举 SUCCESS
>
> 调用 error 返回时，强制要求传入 ResultCodeEnum 枚举来规范统一返回，可对返回的 msg 进行自定义，但code无法修改
>
> 3.0 中枚举对齐了 HTTP 语义：4xx 表示请求参数/权限/资源异常，429 为频控类（限流、防重复提交），451 为 IP 黑名单拦截，业务异常从 500 开始

``` java
/**
 * 定义 controller 统一返回code 和 默认msg
 */
@AllArgsConstructor
@Getter
public enum ResultCodeEnum {

    // 访问成功
    SUCCESS (200,"成功"),
    // 请求参数/权限/资源异常，4xx
    PARAMS_ERROR(400,"参数异常"),
    AUTHENTICATION_EXPIRED(401,"身份验证过期，请重新登录"),
    ACCESS_ERROR (403,"用户权限不足"),
    RESOURCE_NOT_FOUND_ERROR(404,"请求的资源不存在"),
    REQUEST_METHOD_ERROR(405,"请求方法异常"),
    PARAMS_MISSING(422,"参数缺失或不完整"),
    REPEAT_SUBMIT_ERROR(429,"操作过于频繁，请稍后再试"),
    IP_ILLEGAL_ERROR(451, "暂时无法为该地区提供服务"),
    // 后台业务异常，5xx开始
    ERROR (500,"业务异常"),
    SYSTEM_ERROR (501,"系统异常"),
    BAD_GATEWAY_ERROR(502,"网关异常"),
    SERVER_BAD_ERROR(503,"服务不可用"),
    FILE_ERROR (505,"附件处理异常"),
    CAPTCHA_ERROR(507,"验证码错误"),
    SENSITIVE_ERROR(508,"数据脱敏异常"),
    EXCEL_IMPORT_ERROR (509,"Excel导入异常"),
    EXCEL_EXPORT_ERROR (510,"Excel导出异常");

    /**
     * 状态码
     */
    private final Integer code;

    /**
     * 默认 msg
     */
    private final String defaultMsg;

}

```



## SpringDoc

使用 `@Tag` `@Operation` 等注解即可生成对应的接口文档。[详细用法参考官方文档](https://springdoc.springframework.org.cn/#modules)



## 字段校验

项目中集成了`validation`，通过注解可进行优雅的数据校验，在全局异常处理中捕获并处理了校验异常。平时开发只管打注解就OK。[详细用法参考官方文档](https://docs.spring.io/spring-boot/reference/io/validation.html)

分页类接口建议在 `@Validated` 中指定 `MaxPageSizeLimit` 校验组，配合继承 `BaseDTO` 的分页参数限制最大分页大小，防止一次查询拖垮数据库

``` java
@PostMapping("page")
public ApiResponseModel<IPage<SysNotice>> queryPage(@RequestBody @Validated(MaxPageSizeLimit.class) SysNoticeDTO sysNoticeDTO) {
    return success(sysNoticeService.queryPage(sysNoticeDTO));
}
```



## 请求日志

项目中提供了 `@Log` 注解进行日志记录，详细用法参考 [系统日志](/3.0/doc-server/base/log)



## 完整示例：通知公告 Controller

通知公告是系统内一条完整业务链路的参考实现，管理端与用户侧接口齐备，二开新业务时可直接对照抄作业：

- 管理端 `SysNoticeController`（路由前缀 `system/notice`）负责公告的**维护**：分页查询、详情、保存、发布、撤销、删除、已读统计
- 用户侧接口抽在抽象基类 `BaseSysNoticeController` 中，管理端 `SysNoticeController` 与 App 端 `AppSysNoticeController`（路由前缀 `app/system/notice`）共同继承，**对外行为完全一致**，差异仅在路由前缀与文档分组
- 公告发布后经 `TransactionSendUtils.runAfterCommit` 在**事务提交后** WebSocket 推送 `WS_NOTICE` 消息（全部用户或指定用户），客户端收到消息立即回拉也不会读到未提交数据

### 管理端接口

`com.lihua.controller.SysNoticeController`，继承 `BaseSysNoticeController`，需要登录且校验菜单权限

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| POST | `system/notice/page` | 分页查询公告 |
| GET | `system/notice/{id}` | 根据 id 查询详情 |
| GET | `system/notice/managePreview/{id}` | 管理端预览公告（**3.0 新增**，不受公告状态限制，草稿/已撤销也可预览） |
| POST | `system/notice` | 保存公告 |
| POST | `system/notice/release/{id}` | 发布公告（事务提交后 WS 推送） |
| POST | `system/notice/revoke/{id}` | 撤销公告 |
| DELETE | `system/notice` | 批量删除公告 |
| POST | `system/notice/readInfo` | 分页查询公告的已读/未读用户 |

参考代码：

``` java
@Tag(name = "通知公告")
@RestController
@RequestMapping("system/notice")
@Validated
public class SysNoticeController extends BaseSysNoticeController {

    @Operation(summary = "分页查询")
    @PostMapping("page")
    public ApiResponseModel<IPage<SysNotice>> queryPage(@RequestBody @Validated(MaxPageSizeLimit.class) SysNoticeDTO sysNoticeDTO) {
        return success(sysNoticeService.queryPage(sysNoticeDTO));
    }

    @Operation(summary = "根据id查询详情")
    @GetMapping("{id}")
    public ApiResponseModel<SysNoticeVO> queryById(@PathVariable("id") String id) {
        return success(sysNoticeService.queryById(id));
    }

    @Operation(summary = "管理端预览通知公告（不限制公告状态）")
    @GetMapping("managePreview/{id}")
    public ApiResponseModel<SysNoticeVO> managePreview(@PathVariable("id") String id) {
        return success(sysNoticeService.managePreview(id));
    }

    @Operation(summary = "保存通知公告")
    @PostMapping
    @Log(description = "保存通知公告", type = LogTypeEnum.SAVE)
    public ApiResponseModel<String> save(@RequestBody @Validated SysNoticeDTO sysNoticeDTO) {
        return success(sysNoticeService.save(sysNoticeDTO));
    }

    @Operation(summary = "发布通知公告")
    @PostMapping("release/{id}")
    @Log(description = "发布通知公告", type = LogTypeEnum.OTHER)
    public ApiResponseModel<String> release(@PathVariable("id") String id) {
        return success(sysNoticeService.release(id));
    }

    @Operation(summary = "撤销通知公告")
    @PostMapping("revoke/{id}")
    @Log(description = "撤销通知公告", type = LogTypeEnum.OTHER)
    public ApiResponseModel<String> revoke(@PathVariable("id") String id) {
        return success(sysNoticeService.revoke(id));
    }

    @Operation(summary = "删除通知公告")
    @DeleteMapping
    @Log(description = "删除通知公告", type = LogTypeEnum.DELETE)
    public ApiResponseModel<String> deleteByIds(@RequestBody @NotEmpty(message = "请选择数据") List<String> ids) {
        sysNoticeService.deleteByIds(ids);
        return success();
    }

    @Operation(summary = "分页查询已读/未读用户")
    @PostMapping("readInfo")
    public ApiResponseModel<IPage<SysUser>> queryReadInfo(@RequestBody @Validated({Default.class, MaxPageSizeLimit.class}) NoticeReadInfoDTO readInfoDTO) {
        return success(sysUserNoticeService.queryReadInfo(readInfoDTO));
    }
}
```

**接口出入参说明**

- `POST page`：入参 `SysNoticeDTO`（继承 `BaseDTO` 携带 `pageNum`/`pageSize`，可按标题、类型、状态、优先级等条件过滤），校验组 `MaxPageSizeLimit.class` 限制最大分页大小；返回 `IPage<SysNotice>`
- `GET {id}`：路径参数公告 id；返回 `SysNoticeVO`（`SysNotice` 扩展了指定用户 `userIdList`、创建用户、发布用户）
- `GET managePreview/{id}`：路径参数公告 id；返回 `SysNoticeVO`。与用户侧 `preview` 的区别是**不校验公告状态**，草稿、已撤销状态在管理端也能预览排版效果
- `POST 保存`：入参 `SysNoticeDTO`，标题 `@NotNull` + `@Size(max = 80)`，类型/状态/优先级/用户范围为 `@Pattern` 正则校验，备注 `@Size(max = 500)`、图标 `@Size(max = 100)`；保存成功返回公告 id。`userScope` 为 `1` 时发送给全部用户，为 `0` 时配合 `userIdList` 指定用户
- `POST release/{id}`：公告状态置为已发布并记录发布时间/发布人；事务提交后向全部在线用户或 `userIdList` 中用户推送 `WS_NOTICE` 消息（消息体为公告内容）
- `POST revoke/{id}`：公告状态置为已撤销，用户侧不再可见
- `DELETE`：入参为 id 集合 `@NotEmpty(message = "请选择数据")`；执行逻辑删除
- `POST readInfo`：入参 `NoticeReadInfoDTO`（`noticeId` 公告 id `@NotBlank`、`readFlag` 已读标识 `0` 未读 / `1` 已读）；返回已读或未读用户的分页数据 `IPage<SysUser>`

### 用户侧接口

`com.lihua.controller.base.BaseSysNoticeController` 抽象基类，承载管理版与 App 版共有端点，由 `SysNoticeController`（`system/notice`）与 `AppSysNoticeController`（`app/system/notice`）继承，路径一致（`app` 端多一层前缀）

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET | `preview/{id}` | 根据 id 预览公告（仅已发布 `status='1'` 的公告可预览） |
| POST | `list` | 用户查询自己的通知公告列表 |
| POST | `star/{noticeId}/{star}` | 标星/取消标星公告 |
| POST | `read/{noticeId}` | 记录公告已读 |
| GET | `unread/count` | 获取当前用户未读公告总数 |

参考代码：

``` java
public abstract class BaseSysNoticeController extends ApiResponseController {

    @Resource
    protected SysNoticeService sysNoticeService;

    @Resource
    protected SysUserNoticeService sysUserNoticeService;

    @Operation(summary = "根据id预览公告")
    @GetMapping("preview/{id}")
    public ApiResponseModel<SysNoticeVO> preview(@PathVariable("id") String id) {
        return success(sysNoticeService.preview(id));
    }

    @Operation(summary = "用户查询自己的通知公告")
    @PostMapping("list")
    public ApiResponseModel<IPage<SysUserNoticeVO>> userMessageList(@RequestBody SysNoticeDTO sysNoticeDTO) {
        return success(sysNoticeService.userMessageList(sysNoticeDTO));
    }

    @Operation(summary = "标星公告")
    @PostMapping("star/{noticeId}/{star}")
    public ApiResponseModel<String> changeStar(@PathVariable("noticeId") String noticeId, @PathVariable("star") String star) {
        sysUserNoticeService.changeStar(noticeId, star);
        return success();
    }

    @Operation(summary = "记录已读")
    @PostMapping("read/{noticeId}")
    public ApiResponseModel<String> changeRead(@PathVariable("noticeId") String noticeId) {
        sysUserNoticeService.changeRead(noticeId);
        return success();
    }

    @Operation(summary = "获取未读总数")
    @GetMapping("unread/count")
    public ApiResponseModel<Integer> queryUnReadCount() {
        return success(sysUserNoticeService.queryUnReadCount());
    }
}
```

**接口出入参说明**

- `GET preview/{id}`：路径参数公告 id；返回 `SysNoticeVO`，公告未发布时无法预览（管理端预览请使用 `managePreview`）
- `POST list`：入参 `SysNoticeDTO`（不传分页参数时默认 `pageNum=1`、`pageSize=10`，可按已读/标星/类型过滤）；返回当前用户的消息分页 `IPage<SysUserNoticeVO>`，包含公告标题、类型、优先级、发布用户、发布时间、已读标记、标星标记、图标
- `POST star/{noticeId}/{star}`：路径参数公告 id 与标星标记；标星数据只作用于当前用户
- `POST read/{noticeId}`：路径参数公告 id；记录当前用户已读，未读总数随之减少
- `GET unread/count`：无入参；返回当前用户未读公告总数（`Integer`），前端用于角标展示

> App 端 `AppSysNoticeController` 只需继承基类并声明路由前缀即可复用全部用户侧接口，新增共有接口时在基类中添加，双端自动生效

``` java
@Tag(name = "APP-通知公告")
@RestController
@RequestMapping("app/system/notice")
public class AppSysNoticeController extends BaseSysNoticeController {

}
```
