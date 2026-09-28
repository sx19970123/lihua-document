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



### 返回 ResponseEntity\<StreamingResponseBody\>

附件下载使用流式下载返回值，流式写出（含 Range 断点续传）由 `lihua-base-attachment` 的 `FileUtils.download(...)` 封装，controller 直接返回该响应即可。入口为附件存储控制器的下载端点：

``` java
@Operation(summary = "附件下载（key=私密签名链 / fullPath=公开链）")
@GetMapping("download")
public ResponseEntity<StreamingResponseBody> download(String key, String fullPath, String originName) {
    return sysAttachmentStorageService.download(key, fullPath, originName);
}
```

服务实现内先验签/鉴权，再调用 `FileUtils.download(File, fileName, autoDelete)`、`FileUtils.download(List<AttachmentStreamAndInfoModel>)`（多文件打包 ZIP）或 `FileUtils.download(InputStream, fileName)` 完成流式下发，详见 [系统附件](/3.0/doc-cloud/base/attachment)。



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

微服务下接口文档配置在 Nacos 的 `lihua-common.yaml` 公共段中，各服务在自身 yaml 中覆盖 `springdoc.swagger-ui.url/configUrl` 以适配网关的文档前缀路由（如 `/system/v3/api-docs`），详情参考 [网关](/3.0/doc-cloud/standard/gateway#swagger-文档聚合)。



## 字段校验

项目中集成了`validation`，通过注解可进行优雅的数据校验，在全局异常处理中捕获并处理了校验异常。平时开发只管打注解就OK。[详细用法参考官方文档](https://docs.spring.io/spring-boot/reference/io/validation.html)

分页参数超出上限的校验通过 `@Validated(MaxPageSizeLimit.class)` 分组校验触发，详见 [数据模型](/3.0/doc-cloud/standard/data)。



## 请求日志

项目中提供了 `@Log` 注解进行日志记录，详细用法参考 [系统日志](/3.0/doc-cloud/base/log)
