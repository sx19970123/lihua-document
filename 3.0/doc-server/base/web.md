# Web 模块

此模块（`lihua-base-web`）主要处理web相关的配置及处理，3.0 中接口限流、防重复提交、IP能力（解析/归属地/黑名单）都维护在此模块

## 接口限流 @RateLimit（3.0 新增）

`@RateLimit` 打在 controller 方法上即可限流，按「客户端 ip + 接口」维度计数，无需任何其他配置。典型场景是验证码等高消耗公开接口的刷接口防护（系统已挂载于 `captcha/get`、`captcha/check`）

### 限流语义

- **滑动窗口**：任意 interval 秒窗口内最多放行 rate 次，超出即拒绝（HTTP 429）
- **Redis 侧计数**：配额经 Redisson `RRateLimiter` 维护（每次放行记时间戳，早于 now-interval 的记录滚动退还配额），多实例部署共享同一配额
- **滚动复原**：窗口内最早一次调用满 interval 秒出窗即放行下一次，最长等待不超过 interval 秒，无需等整个窗口清空
- **限流主体为 ip**：无法防分布式多源攻击（那属 WAF 层）

### 属性

- rate：窗口内允许的调用次数（默认 10：容人类连点与小型 NAT 共享 ip，拦持续刷接口）
- interval：窗口时长（秒），亦是触发后最长复原等待；默认 10 即限速 1 次/秒、可突发 10 次

### 使用示例

``` java
// 默认配置：10秒窗口内最多10次
@RateLimit
@PostMapping("get")
public ApiResponse<ImageCaptchaVO> getCaptcha() {
    ...
}

// 自定义：60秒窗口内最多5次
@RateLimit(rate = 5, interval = 60)
@GetMapping("report")
public ApiResponseModel<String> report() {
    ...
}
```

> 超限后经全局异常处理返回 `429 REPEAT_SUBMIT_ERROR`（"操作过于频繁，请稍后再试"）；限流键为 `RATE_LIMIT:` 前缀 + 接口签名 + 客户端 ip，可在「缓存监控」中查看

## 防重复提交 @PreventDuplicateSubmit

`@PreventDuplicateSubmit` 打在 controller 方法上即可防重复提交：同一会话（token 相同，匿名请求按客户端 ip）+ 同接口 + 同参数，在窗口期内只允许提交一次。窗口期内重复提交将被拒绝；窗口期过后键自动过期放行，修改参数也会生成新的幂等键、不受窗口影响

- interval：幂等窗口时长（秒），默认 5
- excludeParams（3.0 新增）：摘要前排除的参数字段名，防止敏感字段（如密码）经幂等键进入 Redis 数据面

``` java
// 注册接口：5秒内同参数只允许提交一次，密码字段不进入幂等键
@PreventDuplicateSubmit(excludeParams = {"password", "confirmPassword"})
@PostMapping("register")
public ApiResponseModel<String> register(@RequestBody @Validated SysUserDTO sysUserDTO) {
    ...
}
```

> 重复提交返回 `429 REPEAT_SUBMIT_ERROR`；幂等键经 `REDIS_CACHE_REQUEST_SUBMIT` 前缀维护

## 跨域配置

``` java
@Configuration
public class CorsConfig {

    /**
     * Security 链 CORS 源（SecurityConfig 的 http.cors() 按名自动探测本 bean）
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

> CorsConfig 注册的 `corsConfigurationSource` 同时被 Security 链按名探测接入，受保护接口的 OPTIONS 预检在认证前短路返回

## 全局异常处理

捕获 `BaseException` 异常，进行统一处理，自定义业务异常需继承 `BaseException`。3.0 中对认证、权限、限流与兜底异常做了**固定文案加固**，不透传内部细节，防止接口枚举与信息泄露

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

### 安全加固相关处理（3.0）

除上述常规处理外，`GlobalExceptionHandle` 中还维护了以下安全加固逻辑：

- **凭据失败固定文案**：`BadCredentialsException` 固定返回"用户名或密码错误"（Spring Security 默认英文消息不透传，防止账号枚举）
- **接口限流**：`RateLimitException` 返回 `429` 频控文案
- **权限不足固定文案**：`AccessDeniedException` 固定返回 `403` "用户权限不足"
- **兜底异常固定文案**：`Exception` 兜底处理固定返回枚举文案，`e.getMessage()` 可能携带 NPE/SQL/文件路径等内部细节，一律不透传客户端，根因经日志排查

## 链路追踪

`TraceIdFilter` 为每个请求生成 traceId 写入 MDC，日志模板中经 `%X{traceId}` 输出（见 `logging.pattern` 配置），一次请求全链路日志可按 TraceId 串联检索

## IP 能力

IP 黑名单拦截、真实IP解析、ip2region 归属地等能力自 3.0 起并入本模块维护，详细文档参考 [IP 地址相关](/3.0/doc-server/base/ip)
