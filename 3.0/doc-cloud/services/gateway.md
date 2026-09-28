# 网关服务 lihua-gateway

微服务统一入口：路由转发、JWT 预校验、IP 黑名单、traceId 注入、熔断降级，基于 Spring Cloud Gateway（WebFlux 响应式栈）。

## 基本信息

| 项目 | 值 |
| ---- | -- |
| spring.application.name | `lihua-gateway` |
| 默认端口 | `8085`（`SERVER_PORT` 环境变量可覆盖） |
| 启动类 | `com.lihua.gateway.LiHuaGatewayApplication` |
| 依赖中间件 | Nacos（服务发现 + 配置）、Redis（IP 黑名单缓存） |
| Nacos 配置 | `lihua-gateway.yaml`（`lihua-gateway` 分组）+ `lihua-common.yaml` + `lihua-resilience.yaml` |

## 模块结构

```text
lihua-gateway/
└── src/main/java/com/lihua/gateway/
    ├── LiHuaGatewayApplication.java     # 启动类
    ├── exception/
    │   ├── GatewayIpIllegalException.java    # IP 黑名单命中异常
    │   └── GatewayTokenIllegalException.java # 非法 token 异常
    ├── fallback/
    │   └── FallbackController.java      # 熔断降级出口（/fallback）
    ├── filter/
    │   ├── TraceIdFilter.java           # 链路追踪过滤器 @Order(-110)
    │   ├── RequestIpFilter.java         # IP 黑名单过滤器 @Order(-100)
    │   └── RequestTokenFilter.java      # JWT 预校验过滤器 @Order(-99)
    ├── handle/
    │   └── GatewayExceptionHandler.java # 网关异常处理器
    └── utils/
        ├── JwtUtils.java                # JWT 验签工具
        └── WebUtils.java                # 响应渲染工具
```

## 核心机制

### 三个全局过滤器

三个过滤器均实现 `GlobalFilter`，按 Order 升序执行：

**TraceIdFilter（@Order(-110)）**：请求入口一律生成 traceId，经 mutate 覆写注入请求头随路由转发——外部携带的同名头被覆写，下游服务读到的必为网关产物；同时回写响应头供前端排障定位。

``` java
@Order(-110)
@Component
public class TraceIdFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String traceId = TraceIdUtils.generateTraceId();
        exchange.getResponse().getHeaders().set(CustomHttpHeader.TRACE_ID.getValue(), traceId);
        ServerWebExchange newExchange = exchange.mutate()
                .request(builder -> builder.header(CustomHttpHeader.TRACE_ID.getValue(), traceId))
                .build();
        return chain.filter(newExchange);
    }
}
```

**RequestIpFilter（@Order(-100)）**：解析客户端真实 IP（`X-Real-IP → X-Forwarded-For 末段 → remoteAddr` 三级回退），与 Redis 中的 IP 黑名单匹配（规则支持 `*`、`?` 通配，正则编译结果本地缓存），命中抛 `GatewayIpIllegalException`；未命中则将 IP 写入 `Request-IP` 请求头供下游使用。黑名单数据优先走本地缓存（caffeine，`RedisKeyPrefixEnum` 中该 key 的 `localTTL=100s`），未命中再回源 Redis。

**RequestTokenFilter（@Order(-99)）**：仅当请求携带 `Authorization` 头时验证 JWT 签名合法性（密钥来自 `token.tokenSecret`，与 auth 服务签发密钥一致），非法抛 `GatewayTokenIllegalException`；未携带直接放行。

``` java
@Order(-99)
@Component
@Slf4j
public class RequestTokenFilter implements GlobalFilter {

    // JWT 验签密钥（与 auth 服务签发密钥一致，来自 lihua-common.yaml token 段；无默认值=缺失启动失败）
    @Value("${token.tokenSecret}")
    private String tokenSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        List<String> targetHeaders = exchange.getRequest().getHeaders().get(TokenEnum.TOKEN_KEY.getValue());

        if (targetHeaders == null || targetHeaders.isEmpty()) {
            return chain.filter(exchange);
        }

        String token = targetHeaders.get(0);

        try {
            JwtUtils.verify(token.replace(TokenEnum.TOKEN_PREFIX.getValue(), ""), tokenSecret);
        } catch (Exception e) {
            log.error("非法Token {}", e.getMessage(), e);
            return Mono.error(new GatewayTokenIllegalException());
        }

        return chain.filter(exchange);
    }
}
```

> **设计说明**：网关只做 JWT「合法性」校验（签名对不对、是否伪造），**不做登录态校验**（是否已退出、是否被强踢）。登录态的 Redis 校验在各 servlet 服务的 `JwtAuthenticationTokenFilter` 中完成。这样网关无需访问用户会话数据、保持轻量无状态；同时放行接口（验证码、登录等）天然不校验 token。

### 异常处理与降级

- `GatewayExceptionHandler`（`ErrorWebExceptionHandler`，`@Order(-1)`）：捕获 `BaseException` 渲染为统一响应结构；其余异常兜底返回 **502 网关异常**。已提交的响应不重复处理。
- `FallbackController`（`/fallback`）：各路由 CircuitBreaker 过滤器的降级出口，触发熔断时返回 `SYSTEM_ERROR`（501 系统异常）。

### 路由配置

路由在 Nacos `lihua-gateway.yaml` 中维护，四条业务路由 + 四条 swagger 文档路由，完整配置见 [网关](/3.0/doc-cloud/standard/gateway)。要点：

- `lihua-file`（order 2）必须先于 `lihua-system`（order 4）：`/system/attachment/**` 是 `/system/**` 通配的子集
- WebSocket 走 `/ws-connect/**` 归入 lihua-system 路由
- 每条路由挂载 CircuitBreaker 过滤器，`fallbackUri: forward:/fallback`；TimeLimiter 超时：default 10s（须大于内层 RPC 5s）、`fileCircuitBreaker` 10m（大文件上传）、`systemCircuitBreaker` 2m（大数据量导出）

## 接口一览

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/**` | ALL | 按路由规则转发到下游服务（业务端点见各服务接口一览） |
| `/fallback` | ALL | 熔断降级出口，返回 501 系统异常 |

## 配置与注意事项

- `spring.web.resources.add-mappings: false`：网关 404 拦截依赖此配置，勿删
- CORS 在网关全局配置并自答预检 OPTIONS；同时用 `DedupeResponseHeader` 对 `Access-Control-Allow-Origin` 等响应头去重（网关与下游 CorsConfig 各加一份会报 multiple values）
- `token.tokenSecret` 必配（缺失启动失败），且必须与 lihua-auth 一致
- 网关为 reactive 无 MDC，文件日志中 `TraceId=` 段为空；traceId 通过响应头与下游请求头传递
- 容器部署时网关映射端口为 **8080**（compose 内 `SERVER_PORT=8080`），与本地默认 8085 不同，nginx 代理地址为 `lihua-gateway-server:8080`
