# 网关

网关层基于 `spring cloud gateway`（WebFlux 响应式栈），从 Nacos 配置 `lihua-gateway.yaml`（`lihua-gateway` 分组）可进行路由转发规则的配置。网关承担五项通用职责：路由转发、JWT 合法性预校验、IP 黑名单、traceId 注入、熔断降级。

服务介绍与过滤器实现细节参考 [网关服务](/3.0/doc-cloud/services/gateway)，本篇聚焦开发视角的规则配置。

## 全局过滤器

网关作为微服务入口，前置处理通用请求校验。三个过滤器均实现 `GlobalFilter`，按 Order 从小到大依次执行，位于 `lihua-gateway/src/main/java/com/lihua/gateway/filter` 目录下。

| 顺序 | 过滤器 | Order | 职责 |
| ---- | ------ | ----- | ---- |
| 1 | `TraceIdFilter` | `-110` | 请求入口生成 traceId，经 mutate 覆写注入请求头随路由转发（外部携带的同名头被覆写），并回写响应头供前端排障定位 |
| 2 | `RequestIpFilter` | `-100` | 匹配 IP 黑名单（命中抛 `GatewayIpIllegalException`），并将解析出的客户端 IP 写入 `Request-IP` 请求头供下游使用 |
| 3 | `RequestTokenFilter` | `-99` | 携带 `Authorization` 头的请求验证 JWT 签名合法性，非法抛 `GatewayTokenIllegalException`；未携带直接放行（由下游服务决定是否匿名可访问） |

> **设计说明**：网关只做 JWT「合法性」校验（签名对不对、是否伪造），不做登录态校验（是否已退出、是否被强踢）。登录态的 Redis 校验在各 servlet 服务的 `JwtAuthenticationTokenFilter` 中完成。这样网关无需访问 Redis，保持无状态；同时放行接口（验证码、登录等）天然不校验 token。

IP 解析采用 `X-Real-IP → X-Forwarded-For 末段 → remoteAddr` 三级回退，黑名单规则支持 `*`、`?` 通配符，数据来源于系统设置「限制访问IP」缓存。

## 异常处理与降级

- `GatewayExceptionHandler`（`ErrorWebExceptionHandler`，`@Order(-1)`）：捕获 `BaseException` 渲染为统一响应结构，其余异常兜底返回 **502 网关异常**。
- `FallbackController`（`/fallback`）：各路由 CircuitBreaker 过滤器的降级出口，触发熔断时返回 `SYSTEM_ERROR`（501 系统异常）。

## 路由配置

`lihua-gateway.yaml` 中维护四条业务路由 + 四条 swagger 文档路由，业务路由均挂载 CircuitBreaker 过滤器：

``` yaml
spring:
  cloud:
    gateway:
      server:
        webflux:
          routes:
            # 认证服务
            - id: lihua-auth
              order: 1
              uri: lb://lihua-auth
              predicates:
                # 验证码,app,web
                - Path=/captcha/**,/app/system/auth/**,/system/auth/**,/logout
              filters: # 降级过滤器 
                - name: CircuitBreaker 
                  args: 
                    name: authCircuitBreaker 
                    fallbackUri: forward:/fallback
            # 附件服务（路由顺序承重：必须先于 lihua-system 的 /system/** 通配，否则附件请求落入业务服务）
            - id: lihua-file
              order: 2
              uri: lb://lihua-file
              predicates:
                # app,web
                - Path=/app/system/attachment/storage/**,/system/attachment/**
              filters: # 降级过滤器 
                - name: CircuitBreaker 
                  args: 
                    name: fileCircuitBreaker 
                    fallbackUri: forward:/fallback
            # 监控服务
            - id: lihua-monitor
              order: 3
              uri: lb://lihua-monitor
              predicates:
                # web端
                - Path=/monitor/**
              filters: # 降级过滤器 
                - name: CircuitBreaker 
                  args: 
                    name: monitorCircuitBreaker 
                    fallbackUri: forward:/fallback
            # 业务服务
            - id: lihua-system
              order: 4
              uri: lb://lihua-system
              predicates:
                # app,web
                - Path=/app/system/**,/system/**,/ws-connect/**
              filters: # 降级过滤器 
                - name: CircuitBreaker 
                  args: 
                    name: systemCircuitBreaker 
                    fallbackUri: forward:/fallback
```

**路由要点**

- `lihua-file` 必须排在 `lihua-system` 之前（order 2 < 4）：附件路径 `/system/attachment/**` 是 `/system/**` 的子集，通配路由在后才能被精确路由优先命中
- `/ws-connect/**` 归入 lihua-system 路由：WebSocket 建连请求由 system 服务的 WebSocket 端点处理
- 每条路由的 `name: xxxCircuitBreaker` 与 `lihua-resilience.yaml` 中的 TimeLimiter 实例对应（如 `fileCircuitBreaker` 10 分钟、`systemCircuitBreaker` 2 分钟，适配大文件上传与大数据量导出；未覆盖的走 default 10s，该超时必须大于内层 RPC 的 5s）

## CORS 与响应头去重

``` yaml
          # ---- 全局 CORS：网关须自答预检 OPTIONS（无此配置时网关本地终结预检且零 CORS 头，浏览器直连网关必被拦）----
          globalcors:
            cors-configurations:
              '[/**]':
                allowedOriginPatterns: "*"
                allowedMethods: [GET, POST, PUT, DELETE]
                allowedHeaders: "*"
                maxAge: 3600
          # 网关与下游 CorsConfig 会在实际响应上各加一份 ACAO，必须去重，否则浏览器报 multiple values
          default-filters:
            - name: DedupeResponseHeader
              args:
                name: Access-Control-Allow-Origin Access-Control-Allow-Credentials
                strategy: RETAIN_FIRST
```

## 放行规则

网关放行与下游各服务的 SecurityConfig 需要配合理解——网关层的放行由「未携带 token 直接放行」天然实现；真正的接口白名单在各服务的 `SecurityConfig` 中维护，分为三类：

| 类别 | 端点示例 | 保护方式 |
| ---- | -------- | -------- |
| 仅签名独扛（permitAll + `@InternalOnly`） | `/system/log/login/insert`、`/system/log/operate/insert`、`/system/user/auth/**` | 调用时无用户 token，由 HMAC 签名独扛防伪造 |
| 带 token RPC（authenticated 叠签名） | `system/setting/cacheIpBlack`、`system/dictData/queryByDictTypeCode` | 调用方恒带透传 token，登录墙 + 签名墙双重保护 |
| 业务放行（permitAll） | `/system/auth/login`、`/system/auth/register/**`、`/system/user/checkUserName/**`、`/system/attachment/storage/download/**`、`/system/setting/GrayModelSetting`、`/system/setting/base/**`、`/captcha/**`、`/actuator/health/**`、`/ws-connect/**`、`/swagger-ui/**`、`/v3/api-docs/**`、`/error` | 匿名可访问的业务端点 |

App 端 `/app/...` 前缀接口同构维护。完整规则见 [安全模块](/3.0/doc-cloud/base/security)。

## Swagger 文档聚合

服务端 swagger 默认路径无前缀，经网关不可达。开发环境通过四条 `order: 0` 的文档路由按前缀匹配后 `RewritePath` 剥前缀转发：

``` yaml
            - id: lihua-system-docs
              order: 0
              uri: lb://lihua-system
              predicates:
                - Path=/system/v3/api-docs/**,/system/swagger-ui/**
              filters:
                - RewritePath=/system/(?<segment>.*), /$\{segment}
```

各服务在自身 yaml 中把 `springdoc.swagger-ui.url/configUrl` 覆盖为对应前缀（如 `/system/v3/api-docs`），**url 与 configUrl 必须同前缀**，否则经网关 404 报 "Failed to load remote configuration"。生产环境随服务端 `springdoc.enabled=false` 一并失效。

## 其他

- 网关 404 拦截依赖 `spring.web.resources.add-mappings: false`（各服务 application.yml 均已配置，缺省时 404 不会抛出 `NoHandlerFoundException`）
- 网关日志同样落文件（经 `lihua-common.yaml` logging 段生效），但网关为 reactive 无 MDC，日志中的 `TraceId=` 段为空，traceId 透传由 `TraceIdFilter` 在响应头与下游请求头中完成
