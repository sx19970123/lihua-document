# Web 模块

此模块主要处理web相关的配置及处理，包括跨域、全局异常、接口限流、防重复提交、内部RPC验签、IP归属地等能力。

## 跨域配置

``` java
@Configuration
public class CorsConfig {

    /**
     * Security 链 CORS 源（SecurityConfig 的 http.cors() 按名自动探测本 bean）。
     * 受保护接口的 OPTIONS 预检不携带 Authorization，若 CORS 仅在 MVC 层配置（addCorsMappings），
     * 预检会先被认证链拒绝——预检响应缺 Access-Control-* 头，浏览器拦截真正的跨域请求；
     * 挂入 Security 链后预检在认证前短路返回。Security 链覆盖全部路径，MVC 层无需再另配 CORS。
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 允许所有域名
        configuration.setAllowedOriginPatterns(List.of("*"));
        // 允许的 HTTP 方法
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        // 允许所有请求头
        configuration.setAllowedHeaders(List.of("*"));
        // 预检请求缓存时间（秒）
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 全局异常处理

捕获 `BaseException` 异常，进行统一处理，自定义业务异常需继承 `BaseException` 

``` java
@RestControllerAdvice
@Configuration
@Slf4j
public class GlobalExceptionHandle extends StrResponseController {

    /**
     * 通用业务异常处理
     */
    @ExceptionHandler(BaseException.class)
    public String handleBaseException(BaseException e) {
        log.error(e.getMessage(),e);
        return error(e.getResultCodeEnum(), e.getMessage(), e.getData());
    }

    /**
     * 捕获全局spring validation 异常信息
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public String handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String errMessages = e
                .getBindingResult()
                .getAllErrors()
                .stream()
                .map(ObjectError::getDefaultMessage)
                .distinct()
                .collect(Collectors.joining("；"));
        return error(ResultCodeEnum.PARAMS_MISSING, errMessages);
    }

    /**
     * 全局捕获直接在controller中校验的 validation 异常信息
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public String handleConstraintViolationException(ConstraintViolationException e) {
        String errMessages = Arrays.stream(e.getMessage().split(","))
                .map(item -> item.split(":"))
                .filter(item -> item.length > 1)
                .map(item -> item[1].trim())
                .distinct()
                .collect(Collectors.joining("；"));
        return error(ResultCodeEnum.PARAMS_MISSING, String.join("、", errMessages));
    }

    /**
     * 处理spring mvc 参数格式异常信息
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public String handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.error(e.getMessage(),e);
        return error(ResultCodeEnum.PARAMS_ERROR,e.getMessage());
    }

    /**
     * 处理404异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public void handleNoHandlerFoundException(NoHandlerFoundException e) {
        log.error(e.getMessage(),e);
        WebUtils.renderJson(error(ResultCodeEnum.RESOURCE_NOT_FOUND_ERROR));
    }

    /**
     * 处理405请求方法异常
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public void handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        log.error(e.getMessage(),e);
        WebUtils.renderJson(error(ResultCodeEnum.REQUEST_METHOD_ERROR));
    }

}
```

> 以上为节选，完整实现另含认证失败（`BadCredentialsException`）、接口限流（`RateLimitException`）、系统级认证故障（`InternalAuthenticationServiceException`）、权限不足（`AccessDeniedException`）与最终 `Exception` 兜底等 handler。



## 接口限流 <Badge type="tip" text="3.0" />

`@RateLimit` 标记在 controller 方法上，按「客户端 ip + 接口」维度限流：底层为 Redisson `RRateLimiter` 令牌桶——桶容量 `rate` 个令牌、按 `interval` 秒匀速补充，突发打空令牌后超出的调用被拒绝（响应码 `429 REPEAT_SUBMIT_ERROR`）。

| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------ | ---- |
| `rate` | int | `10` | 窗口内允许的调用次数（容人类连点与小型 NAT 共享 ip，拦持续刷接口） |
| `interval` | int | `10` | 令牌补充周期（秒）；默认即限速 1 次/秒、可突发 10 次 |

``` java
@RateLimit
@PostMapping("get")
@Operation(summary = "获取验证码")
public ApiResponse<ImageCaptchaVO> getCaptcha() { ... }
```

- 配额经 Redisson `RRateLimiter`（`RateType.OVERALL`）在 Redis 侧计数，多实例部署共享同一配额
- 令牌按 `rate/interval` 匀速恢复：默认配置下突发 10 次打空后约每 1 秒恢复一个配额，无需等整个周期清空
- 限流键 = 前缀 + 接口签名 + 客户端 ip，键闲置（`interval + 60s` 无访问）自动过期清理
- 注意 `trySetRate` 仅在键首次创建时生效，调整注解参数后需删除存量 Redis 键（或换键）才能对新调用生效
- 适用于高消耗公开接口（验证码生成等）的刷接口防护；限流主体为 ip，无法防分布式多源攻击（那属 WAF 层）



## 防重复提交 <Badge type="tip" text="3.0" />

`@PreventDuplicateSubmit` 标记在 controller 方法上：同一会话（token 相同，匿名请求按客户端 ip）+ 同接口 + 同参数，在窗口期内只允许提交一次。

| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------ | ---- |
| `interval` | int | `5` | 幂等窗口时长（秒），窗口期过后键自动过期放行 |
| `excludeParams` | String[] | `{}` | 摘要前排除的参数字段名（与 `@Log` excludeParams 同源口径），防止敏感字段（如密码）经幂等键进入 Redis 数据面 |

``` java
@PreventDuplicateSubmit(excludeParams = {"password", "confirmPassword"})
@PostMapping("register")
@Operation(summary = "用户注册")
public ApiResponseModel<String> register(@RequestBody @Valid SysRegisterDTO sysRegisterDTO) { ... }
```

重复提交抛出 `DuplicateSubmitException`，由全局异常处理转换为 `REPEAT_SUBMIT_ERROR`（429）；修改参数会生成新的幂等键，不受窗口影响。

## 内部 RPC 验签

`@InternalOnly`（方法级注解）+ `InternalRequestInterceptor` 搭配，对内部 RPC 端点进行 HMAC 签名校验，原理与代码参考 [远程调用](/3.0/doc-cloud/standard/api#hmac-签名机制)。

## IP 归属地

IP 解析与归属地能力位于本模块：`Ip2regionConfig` 加载 classpath 下 `ip2region/ip2region_v4.xdb` 数据文件，`WebUtils.getRegion(ip)` 完成归属地解析，详见 [IP 模块](/3.0/doc-cloud/base/ip)。
