# Controller 开发



## 统一返回方式

> controller 统一返回有两种方式，分为返回String 或 返回 ApiResponseModel\<T\> 可根据需求自行使用



### 返回 String

Controller 类继承 `StrResponseController`，方法定义返回值为 `String`。 这种情况下数据在业务工具中转为了Json，优势是无需考虑Controller的返回类型，非附件的情况下直接返回`String`即可。**适合前后端分离人不分离的场景** 这种模式下 `knife4j` 无法获取返回值的对象属性，不利于前后端沟通

``` java
package com.lihua;

import com.lihua.model.web.basecontroller.StrResponseController;
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

Controller 类继承 `ApiResponseController`，方法定义返回值为 `ApiResponseModel<T>` 由MVC序列化为Json数据，优势是可以集成 `knife4j` 接口返回值文档清晰。**适合前后端分离的场景**

``` java
package com.lihua;

import com.lihua.model.web.ApiResponseModel;
import com.lihua.model.web.basecontroller.ApiResponseController;
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

附件下载中使用流式下载的返回值，`success()` 中已将麻烦的操作进行了封装，使用时直接传入 `File、List<File>、InputStream + fileName` 即可

``` java
@GetMapping("download")
@Log(description = "附件下载", type = LogTypeEnum.DOWNLOAD)
public ResponseEntity<StreamingResponseBody> download(@RequestParam(name = "filePath") String filePath, @RequestParam(name = "split", defaultValue = ",") String split) {
    // 验证请求的文件是否允许下载
    FileDownloadUtils.isDownloadable(filePath, split);

    String[] filePathArray = filePath.split(split);

    // 单文件直接调用下载
    if (filePathArray.length == 1) {
        return success(new File(filePathArray[0]));
    }

    // 多文件创建文件集合
    List<File> files = new ArrayList<>();
    for (String path : filePathArray) {
        files.add(new File(path));
    }

    return success(files);
}
```



### 统一返回对象

``` java
public class ApiResponseModel<T> {
    @Schema(name = "code", description = "api请求正常默认值为200")
    private Integer code;
    @Schema(name = "msg", description = "api请求正常默认值为成功")
    private String msg;
    @Schema(name = "data", description = "api请求响应对象")
    private T data;
}
```



### 统一返回枚举

> 调用 success 返回时，使用默认枚举 SUCCESS
>
> 调用 error 返回时，强制要求传入 ResultCodeEnum 枚举来规范统一返回，可对返回的 msg 进行自定义，但code无法修改

``` java
public enum ResultCodeEnum {

    SUCCESS (200,"成功"),
    PARAMS_ERROR(400,"参数异常"),
    AUTHENTICATION_EXPIRED(401,"身份验证过期，请重新登陆"),
    PARAMS_MISSING(402,"参数缺失或不完整"),
    ACCESS_ERROR (403,"用户权限不足"),
    RESOURCE_NOT_FOUND_ERROR(404,"请求的资源不存在"),
    REQUEST_METHOD_ERROR(405,"请求方法异常"),
    ACCESS_EXPIRED_ERROR (406,"请求资源权限过期"),
    IP_ILLEGAL_ERROR(407, "暂时无法为该地区提供服务"),
    ERROR (500,"业务异常"),
    FILE_ERROR (501,"附件处理异常"),
    RATE_LIMITER_ERROR (502,"系统繁忙，请稍后再试"),
    SERVER_BAD_ERROR (503,"服务不可用"),
    MAX_UPLOAD_SIZE_EXCEEDED_ERROR (504,"上传的附件超过了允许的最大大小限制"),
    SERVER_UNAVAILABLE (505,"服务器维护中"),
    CAPTCHA_ERROR(506,"验证码错误"),
    SENSITIVE_ERROR(507,"数据脱敏异常"),
    DUPLICATE_SUBMIT_ERROR (508,"请勿重复提交"),
    WEBSOCKET_SEND_MSG_ERROR (509,"websocket发送消息异常");

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



## knife4j

使用 `@Tag` `@Operation` 等注解即可生成对应的接口文档。[详细用法参考官方文档](https://doc.xiaominfo.com/docs/quick-start)



## 字段校验

项目中集成了`validation`，通过注解可进行优雅的数据校验，在全局异常处理中捕获并处理了校验异常。平时开发只管打注解就OK。[详细用法参考官方文档](https://docs.spring.io/spring-boot/reference/io/validation.html)



## 请求日志

项目中提供了 `@Log` 注解进行日志记录，详细用法参考 [注解](/doc-server/component/annotation.html#日志记录)



## 接口限流

项目中提供了 `@RateLimiter` 注解进行限流；`@PreventDuplicateSubmit` 注解防止重复提交，详细用法参考 [注解](/doc-server/component/annotation.html#限流)