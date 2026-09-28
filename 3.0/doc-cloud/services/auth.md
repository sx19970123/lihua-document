# 认证服务 lihua-auth

认证中心：登录、注册、验证码、一次性令牌，签发 JWT。自身**无数据库**，用户数据全部经 RPC 取自 `lihua-system`。

## 基本信息

| 项目 | 值 |
| ---- | -- |
| spring.application.name | `lihua-auth` |
| 默认端口 | `8082`（`SERVER_PORT` 环境变量可覆盖） |
| 启动类 | `com.lihua.auth.LiHuaAuthApplication` |
| 依赖中间件 | Nacos、Redis（无 MySQL——用户数据经 RPC 取自 lihua-system） |
| Nacos 配置 | `lihua-auth.yaml`（`lihua-auth` 分组）+ `lihua-common.yaml` + `lihua-resilience.yaml` |

## 模块结构

```text
lihua-auth/
└── src/main/java/com/lihua/auth/
    ├── LiHuaAuthApplication.java             # 启动类
    ├── config/
    │   └── LoginConfig.java                  # DaoAuthenticationProvider + BCrypt
    ├── controller/
    │   ├── CaptchaController.java            # 验证码 captcha/get、captcha/check
    │   ├── SysAuthenticationController.java  # 管理版认证 system/auth（reloadData）
    │   ├── app/
    │   │   └── AppSysAuthenticationController.java  # App版 app/system/auth
    │   └── base/
    │       └── BaseSysAuthenticationController.java # 双版本共有端点基类
    ├── model/dto/
    │   ├── SysLoginUserDTO.java              # 登录参数
    │   └── SysRegisterDTO.java               # 注册参数
    └── service/
        ├── SysAuthenticationService.java
        └── impl/
            ├── LoginUserDetailsServiceImpl.java   # UserDetailsService，经 RPC 加载用户
            └── SysAuthenticationServiceImpl.java  # 登录/锁定/缓存/令牌核心逻辑
```

## 核心机制

### 登录链全流程

```text
前端 → 网关（只验 token 合法性，登录请求无 token 放行）
     → lihua-auth /system/auth/login
        1. checkCaptcha      验证码二次校验（开关经 RPC 查询 system，可关闭）
        2. checkLoginLock    登录失败锁定检查（账号 + IP 双维度）
        3. authenticationManager.authenticate
           └─ DaoAuthenticationProvider + BCrypt
              └─ UserDetailsService.loadUserByUsername
                 └─ SysUserAuthClientFacade.loginSelect  ← RPC 调 lihua-system
        4. cacheAndCreateToken
           ├─ queryLoginUserProfile    ← RPC 拉取用户全量信息（角色/部门/岗位/菜单/权限）
           ├─ PermissionUpdateUtils.clear（消费权限红点标记）
           ├─ LoginUserManager.setLoginUserCache（写 Redis，返回 redisKey）
           └─ JwtUtils.create(redisKey)  ← **JWT 载荷是 Redis key，而非用户信息**
        5. checkSameAccount    同账号最大登录数检查，超限先登录者被踢下线
```

**JWT 载荷是 Redis key 而非用户信息**：签发的 token 解开后得到的是该用户会话在 Redis 中的 key（`REDIS_CACHE_LOGIN_USER:{userId}:{timestamp}:{uuid}`）。下游服务拿到 token 后经 `LoginUserManager.getLoginUser` 用 key 反查 Redis 还原会话。好处是会话可随时主动失效（强踢、退出只删 Redis），改密、禁用等操作即时生效，且 JWT 中不泄露任何用户信息。

登录链 fallback 保 503 语义：`loginSelect` 的 fallback 抛 `InternalAuthenticationServiceException`（系统级故障通道），避免下游不可用被防枚举机制伪装成「用户名或密码错误」（401）误导排障。

### 登录失败锁定 login.lock

账号与 IP 双维度独立计数与锁定（防针对单账号撞库与单源撞多账号），配置于 Nacos `lihua-auth.yaml`：

``` yaml
login:
  lock:
    enabled: false        # 双仓统一默认关闭（验证码为唯一防线）；二开按需自行开启
    fail-threshold: 5     # 窗口内失败达该次数即锁定对应主体
    fail-window: 15m      # 失败计数窗口（自首次失败起算的固定窗）
    lock-duration: 10m    # 锁定时长
```

- 登录前检查：账号或 IP 任一在锁即拒绝（提示 N 分钟后再试）；锁未过期时 authenticate 不执行，计数不再增长
- 认证失败：双维度各自累加计数（首次计数起算窗口 TTL），任一达阈值写对应锁
- 登录成功：清账号维度计数（IP 维度留窗口自然过期，继续压制同源撞库）
- 系统级故障（`InternalAuthenticationServiceException`，如下游不可用）不计失败，防服务故障期间误锁全部尝试用户

### 验证码二次验证

tianai 滑块验证码开启二次验证（`captcha.secondary.enabled: true`）：前端先调 `captcha/get` 拿验证码、`captcha/check` 完成前置校验拿到 `captchaVerification` 令牌，登录/注册时携带令牌走 `SecondaryVerificationApplication.secondaryVerification()` 复核。验证码总开关存于系统设置，经 RPC 查询（`enableCaptcha`），关闭时直接放行；远程配置读取失败时**从严降级**视为开启。

### onceToken 一次性令牌

`GET /system/auth/onceToken` 签发一次性令牌：UUID 写入 Redis（有效期 **1 分钟**，value 为当前用户 id），供 WebSocket 建连等需要临时授权的场景使用（前端建连前先取令牌并以 query 参数携带），使用即删、不可复用。

### 同账号互踢

`checkSameAccount` 读取系统设置「同账号最大同时登录数」（-1 为不限制）：登录成功后扫描该用户全部会话 key，按登录时间排序，超限则最早的会话先被踢下线。

## 接口一览

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/system/auth/login` | POST | 登录，返回 token（App 版 `/app/system/auth/login`） |
| `/system/auth/register` | POST | 注册（验证码 + 两次密码校验 + 防重复提交） |
| `/system/auth/onceToken` | GET | 获取一次性令牌（1 分钟有效） |
| `/system/auth/reloadData` | POST | 重新加载登录用户数据（刷新权限红点） |
| `/captcha/get` | POST | 获取验证码（@RateLimit 限流） |
| `/captcha/check` | POST | 校验验证码，返回 captchaVerification |
| `/logout` | POST | 退出登录，删除会话缓存 |

## 配置与注意事项

- `token.tokenSecret` 必配且与网关一致（签发/验签同一密钥）；`tokenExpireTime` 默认 1h、`refreshThreshold` 15m
- `springdoc.swagger-ui.url/configUrl` 覆盖为 `/system/auth/v3/api-docs` 前缀适配网关文档路由
- 登录接口 `@Log(recordResult = false, excludeParams = {"password"})`——密码与响应均不入日志
- 验证码配置在 lihua-auth 本地 `application.yml`（tianai 参数），静态资源在 `lihua-base-captcha` 模块内
- 容器部署时 auth 端口为 **8081**（compose 内 `SERVER_PORT=8081`），与本地默认 8082 不同
