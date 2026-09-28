# 安全

安全模块集成了 Spring Security，提供认证配置、Token 处理、用户上下文管理、登录失败锁定以及权限安全相关的异常处理等功能。



## 配置

### Security配置

`SecurityConfig` 为Spring Security的核心配置，接口白名单、异常处理器都在此类配置

``` java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Resource
    private UserDetailsService userDetailsService;

    @Resource
    private JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;

    @Resource
    private LogoutSuccessHandlerImpl logoutSuccessHandler;

    @Resource
    private SecurityAccessDeniedHandler securityAccessDeniedHandler;

    @Resource
    private SecurityAuthenticationEntryPoint securityAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {

        // 配置拦截请求
        http.authorizeHttpRequests(authorizeHttpRequestsCustomizer -> authorizeHttpRequestsCustomizer
                // 对于异步分发权限放开（涉及附件下载返回 ResponseEntity<StreamingResponseBody> 的情况）
                .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()
                // 后台接口配置
                .requestMatchers(
                        "/system/auth/login",                            // 登录
                        "/system/auth/register/**",                      // 注册
                        "/system/user/checkUserName/**",                 // 检查用户名
                        "/system/attachment/storage/download/**",        // 附件下载
                        "/system/setting/base/**"                        // 基础设置
                ).permitAll()
                // app接口配置
                .requestMatchers(
                        "/app/system/auth/login",                           // 登录
                        "/app/system/auth/register/**",                     // 注册
                        "/app/system/user/checkUserName/**",                // 检查用户名
                        "/app/system/attachment/storage/download/**",       // 附件下载
                        "/app/system/app-version/check",                    // 检查更新（未登录也需可查）
                        "/app/system/setting/base/**"                       // 基础设置
                ).permitAll()
                // 系统其他接口配置
                .requestMatchers(
                        "/captcha/**",                                  // 验证码
                        "/actuator/health/**",                          // 健康探针（compose healthcheck 经主端口探活）
                        "/ws-connect/**",                               // websocket建立连接
                        "/swagger-ui/**",                               // spring-doc
                        "/v3/api-docs/**",                              // spring-doc
                        "/error"                                        // 当出现404等异常时spring内部会转发到/error，需要将其放过，否则会响应401
                ).permitAll()
                .anyRequest().authenticated());

        // 关闭csrf拦截
        http.csrf(AbstractHttpConfigurer::disable);

        // CORS 接入 Security 链：按名探测 base-web CorsConfig 的 corsConfigurationSource bean（唯一 CORS 源），
        // 使受保护接口的 OPTIONS 预检在认证前短路返回
        http.cors(Customizer.withDefaults());

        // 允许通过iframe访问
        http.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));

        // 基于前后端分离token 认证 无需session
        http.sessionManagement(sessionManagementCustomizer -> sessionManagementCustomizer.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 添加 jwt token 验证过滤器
        http.addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);

        // 添加退出登录处理器
        http.logout(logoutCustomizer -> logoutCustomizer
                .logoutUrl("/logout")
                .logoutSuccessHandler(logoutSuccessHandler));

        // 添加权限/认证异常处理器
        http.exceptionHandling(exceptionHandlingCustomizer -> exceptionHandlingCustomizer
                .authenticationEntryPoint(securityAuthenticationEntryPoint)
                .accessDeniedHandler(securityAccessDeniedHandler));

        return http.build();
    }

    /**
     * 全局抛出 AuthenticationManager 用于用户信息验证
     */
    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(new BCryptPasswordEncoder());
        return new ProviderManager(daoAuthenticationProvider);
    }
}

```



### Token配置

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对Token进行配置，可配置Token过期时间、刷新阈值和签名密钥

``` yaml
 # 系统配置
token:
  # 令牌过期时间（Duration 带单位写法：s/m/h/d，裸数字按分钟）
  tokenExpireTime: 1h
  # 令牌刷新阈值（距令牌过期不足该阈值时，新请求触发刷新）
  refreshThreshold: 15m
  # JWT 签发/验签密钥（HMAC-SHA256；缺失或长度不足启动失败。换值=全员重新登录）
  tokenSecret: xxxxxx
```

在 `LoginUserManager` 中的 `setLoginUserCache` 设置用户缓存、`verifyLoginUserCache` 校验用户缓存中会应用配置数据



## 登录失败锁定（3.0 新增）

登录失败锁定为账号与 IP **双维度**：失败窗口内（自首次失败起算的固定窗）某账号或某 IP 失败次数达阈值，即锁定对应主体，锁定期内登录直接被拒绝

``` yaml
# 登录失败锁定
login:
  lock:
    # 是否启用（默认关闭，关闭后验证码为唯一防线；双仓统一口径，二开按需自行开启）
    enabled: false
    # 窗口内失败达该次数即锁定（账号与 ip 双维度各自计数）
    fail-threshold: 5
    # 失败计数窗口（自首次失败起算的固定窗；Duration 带单位写法如 15m，裸数字按分钟）
    fail-window: 15m
    # 锁定时长（Duration 带单位写法如 10m，裸数字按分钟）
    lock-duration: 10m
```

- 配置类为 `LoginLockProperties`（前缀 `login.lock`），失败计数与锁定标记经 Redis 维护（前缀 `LOGIN_FAIL_COUNT:` / `LOGIN_LOCK:`），多实例共享
- 锁定目标为「账号 + IP」两个维度各自计数：单账号被刷只锁账号，单 IP 撞库只锁 IP，互不影响正常用户



## 权限变更红点（3.0 新增）

3.0 起，角色/菜单等权限数据变更后**不再强制用户下线**，改为「红点提醒 + 用户主动更新」模式，用户不会被莫名踢出当前操作

### 工作流程

1. 权限数据变更（角色重授菜单、用户分配角色等）时调用 `PermissionUpdateUtils.markChanged(userId)`：Redis 置变更标记，并经 `TransactionSendUtils.runAfterCommit` 在事务提交后调用 `WebSocketPushUtils.push` 向受影响在线用户定向投递 `WS_REFRESH_PERMISSION` 消息（经 Redis pub/sub 扇出到 WS 连接层），前端置「数据更新」红点
2. WS 推送仅负责在线即时提示；Redis 标记为事实源，覆盖离线/关浏览器重进场景
3. 用户 getInfo 查询时经 `PermissionUpdateUtils.hasChanged(userId)` 判定红点展示（App 端提示重新登录生效）
4. 用户登录或点击「数据更新」重载会话时调用 `PermissionUpdateUtils.clear(userId)` 消费标记，红点熄灭

### 工具方法

#### markChanged（标记权限变更）

```java
PermissionUpdateUtils.markChanged(userId);
```

- 参数：userId - 用户id，另有 `List<String>` 重载支持批量（角色菜单重授等场景）
- 返回值：无
- 说明：Redis 置变更标记 + 发布进程内事件，事务提交后 WS 实时推送红点提示

#### hasChanged（是否存在变更标记）

```java
boolean changed = PermissionUpdateUtils.hasChanged(userId);
```

- 参数：userId - 用户id
- 返回值：boolean 是否存在未消费的变更标记
- 说明：getInfo 红点判定，标记按用户维度共享——任一端登录/更新即消费，其他设备红点随之熄灭

#### clear（消费变更标记）

```java
PermissionUpdateUtils.clear(userId);
```

- 参数：userId - 用户id
- 返回值：无
- 说明：删除变更标记（红点熄灭），登录或「数据更新」重载会话时调用

> 红点事实源在 Redis 标记，WS 推送只是在线即时提示，不依赖推送送达——离线用户下次登录也会看到待更新状态



## 过滤器

每个HTTP请求都会经过 `JwtAuthenticationTokenFilter` 过滤器，从请求头中获取Token后验证用户的登录状态，进行后续操作（存入上下文｜抛出异常）

``` java
/**
 * 请求 token 过滤器
 */
@Component
@Slf4j
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 获取token
        String token = WebUtils.getToken(request);

        if (StringUtils.hasText(token)) {
            LoginUserSession loginUserSession = LoginUserManager.getLoginUser(token);
            if (loginUserSession != null) {
                PreAuthenticatedAuthenticationToken authentication = new PreAuthenticatedAuthenticationToken(
                        loginUserSession,
                        null,
                        loginUserSession.getPermissionList().stream().map(SimpleGrantedAuthority::new).toList());
                // 设置请求上下文信息（ip、客户端类型、token）
                authentication.setDetails(new RequestContext(WebUtils.getIpAddress(request), WebUtils.getClientType(request), token));
                // 将用户信息存入上下文
                SecurityContextHolder.getContext().setAuthentication(authentication);
                // 判断过期时间进行重新缓存
                LoginUserManager.verifyLoginUserCache();
            }
        }

        filterChain.doFilter(request,response);
    }

}
```



## 处理器

### 退出登录处理器

调用 `/logout` 接口后会进入  `LogoutSuccessHandlerImpl` 处理器，执行删除用户缓存后，将响应信息写入 HttpServletResponse

### 权限异常处理器

发生权限处理异常后会进入  `SecurityAccessDeniedHandler` 处理器，将异常提示写入 HttpServletResponse

### 认证异常处理器

发生认证处理异常后会进入  `SecurityAuthenticationEntryPoint` 处理器，将异常提示写入 HttpServletResponse



## 用户上下文

因获取用户上下文需要在数据库中查询大量数据。故只有在`登录`或点击`数据更新`时才会真正从数据库加载新数据，普通刷新页面并不会获取最新数据，而是从Redis中直接返回。在对用户强绑定的属性更新时，请提示用户从数据更新获取最新数据

::: warning 提示

在无token的匿名访问中，无法获取用户上下文

:::

### 获取用户上下文

`LoginUserContext` 下提供获取用户上下文的静态方法，调用后可获取当前登录用户信息

``` java
public static void main(String[] args) {
    // 获取当前登录用户id
    String userId = LoginUserContext.getUserId();
    // 获取当前登录用户username
    String username = LoginUserContext.getUsername();
    // 获取当前登录用户角色集合
    List<CurrentRole> roleList = LoginUserContext.getRoleList();
    // 获取当前登录用户角色编码集合
    List<String> roleCodeList = LoginUserContext.getRoleCodeList();
    // 判断当前用户是否为admin
    boolean isAdmin = LoginUserContext.isAdmin();
    // 获取当前登录用户部门集合/部门树/部门编码集合
    List<CurrentDept> deptList = LoginUserContext.getDeptList();
    List<CurrentDept> deptTree = LoginUserContext.getDeptTree();
    List<String> deptCodeList = LoginUserContext.getDeptCodeList();
    // 获取当前登录用户默认部门及编码
    CurrentDept defaultDept = LoginUserContext.getDefaultDept();
    String defaultDeptCode = LoginUserContext.getDefaultDeptCode();
    // 获取当前登录用户岗位集合及默认部门下岗位编码集合
    List<CurrentPost> postList = LoginUserContext.getPostList();
    List<String> defaultDeptPostCodeList = LoginUserContext.getDefaultDeptPostCodeList();
    // 获取当前登录用户
    CurrentUser user = LoginUserContext.getUser();
    // 获取请求上下文（ip、客户端类型、token）
    RequestContext requestContext = LoginUserContext.getRequestContext();
    // 判断某用户是否持有有效会话
    boolean login = LoginUserContext.isLogin(userId);
    // 获取当前客户端类型（web、app等）
    String clientType = LoginUserContext.getClientType();
}
```

### 自定义用户上下文

随着业务发展，可能新增其他与用户强绑定的属性。通过用户上下文直接获取会大大提高开发效率。想要增加用户上下文能够获取的数据，需要对以下实体类/方法进行改造。

1. `com.lihua.security.model.LoginUserSession` 实体类下添加自定义属性。

     ``` java
     @Data
     public class LoginUserSession {
     
         /**
          * 当前登陆用户信息
          */
         private CurrentUser user;
     
         /**
          * 权限集合，ROLE_开头为拥有的角色编码，其余为页面权限
          */
         private List<String> permissionList;
         
         /**
          * 可在此实体类中新增属性
          */
         ... 
     }
     ```

2. 实现 `com.lihua.strategy.cacheloginuser.CacheLoginUserStrategy` 接口。

     新建实现类实现`CacheLoginUserStrategy` 接口，在重写的`cacheLoginUser` 方法中进行查询逻辑的处理（查询对应的数据，set到LoginUserSession中即可）。

     ``` java
     /**
      * 缓存部门相关实现类
      */
     @Component
     public class CacheDeptStrategyImpl implements CacheLoginUserStrategy {
     
         @Resource
         private SysDeptMapper sysDeptMapper;
     
         @Override
         public void cacheLoginUser(LoginUserSession loginUserSession, boolean isAdmin) {
             String id = loginUserSession.getUser().getId();
             List<CurrentDept> deptList;
             if (isAdmin) {
                 deptList = sysDeptMapper.selectAllDept(id);
             } else {
                 deptList = sysDeptMapper.selectByUserId(id);
             }
             loginUserSession.setDeptList(deptList);
         }
     }
     ```

3. `com.lihua.security.manager.LoginUserContext` 增加全局静态方法可直接通过LoginUserContext调用

     本类中的`getLoginUser()` 方法可获取到 `LoginUserSession` 对象，可直接获取到自定义属性

     ``` java
     /**
      * 获取当前登录用户工具类
      */
     public class LoginUserContext implements Serializable {
     
         /**
          * 获取当前登录用户 id
          */
         public static String getUserId() {
             return getUser().getId();
         }
     
         /**
          * 获取当前登录用户 username
          */
         public static String getUsername() {
             return getUser().getUsername();
         }
         
          /**
           * 新增自己的获取逻辑
           */
           ...
     }
     ```
