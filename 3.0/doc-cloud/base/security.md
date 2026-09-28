# 安全

安全模块集成了 Spring Security，提供认证配置、Token 处理、用户上下文管理、权限红点以及权限安全相关的异常处理等功能。微服务版下登录与签发 JWT 在 `lihua-auth` 认证服务中完成，其余 servlet 服务通过本模块校验登录态。



## 配置

### Security配置

`SecurityConfig` 为Spring Security的核心配置，接口白名单、异常处理器都在此类配置。放行规则分三类——业务放行、仅签名独扛的 RPC 端点、系统公共端点：

``` java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {

        // 配置拦截请求
        http.authorizeHttpRequests(customizer -> customizer
                // 对于异步分发权限放开（涉及附件下载返回 ResponseEntity<StreamingResponseBody> 的情况）
                .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()
                // 后台接口配置
                .requestMatchers(
                        "/system/auth/login",                            // 登录
                        "/system/auth/register/**",                      // 注册
                        "/system/user/checkUserName/**",                 // 检查用户名
                        "/system/attachment/storage/download/**",        // 附件下载
                        "/system/setting/GrayModelSetting",              // 灰色模式设置
                        "/system/setting/base/**"                        // 基础设置
                ).permitAll()
                // 远程调用接口——@InternalOnly 与 permitAll 的搭配规则（签名为服务间信任凭证，与登录墙正交）：
                // 仅「调用时无用户 token」的场景入本清单由签名独扛（登录链在 token 签发前/注册/日志落库）；
                // 其余远程调用端点（如 system/setting/cacheIpBlack、system/dictData/queryByDictTypeCode——
                // 调用方恒带透传 token）保持 anyRequest().authenticated() 叠加签名墙，勿移入本清单
                .requestMatchers(
                        "/system/log/login/insert",                     // 登录日志记录
                        "/system/log/operate/insert",                   // 操作日志记录
                        "/system/user/auth/**"                          // 用户登录远程调用
                )
                .permitAll()
                // app接口配置（/app/... 前缀同构维护，此处略）
                // 系统其他接口配置
                .requestMatchers(
                        "/captcha/**",                                  // 验证码
                        "/actuator/health/**",                          // 健康探针
                        "/ws-connect/**",                               // websocket建立连接
                        "/swagger-ui/**",                               // spring-doc
                        "/v3/api-docs/**",                              // spring-doc
                        "/error"                                        // 出现404等异常时spring内部会转发到/error，需放过否则响应401
                ).permitAll()
                .anyRequest().authenticated());

        // 关闭csrf拦截
        http.csrf(AbstractHttpConfigurer::disable);

        // CORS 接入 Security 链：按名探测 base-web CorsConfig 的 corsConfigurationSource bean（唯一 CORS 源），
        // 使受保护接口的 OPTIONS 预检在认证前短路返回
        http.cors(Customizer.withDefaults());

        // 基于前后端分离token 认证 无需session
        http.sessionManagement(customizer -> customizer.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 添加 jwt token 验证过滤器
        http.addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);

        // 添加退出登录处理器
        http.logout(logoutCustomizer -> logoutCustomizer
                .logoutUrl("/logout")
                .logoutSuccessHandler(logoutSuccessHandler));

        // 添加权限/认证异常处理器
        http.exceptionHandling(customizer -> customizer
                .authenticationEntryPoint(securityAuthenticationEntryPoint)
                .accessDeniedHandler(securityAccessDeniedHandler));

        return http.build();
    }
}
```

> 微服务版下认证服务的 `DaoAuthenticationProvider` + `BCryptPasswordEncoder` 由 `lihua-auth` 的 `LoginConfig` 提供（配合 `UserDetailsService` RPC），本模块不再重复声明，详见 [认证服务](/3.0/doc-cloud/services/auth)。

### Token配置

Token 在 Nacos `lihua-common.yaml` 的 `token` 段配置，全部服务共享：

``` yaml
 # 系统配置
token:
  # 令牌过期时间（Duration 带单位写法：s/m/h/d，裸数字按分钟）
  tokenExpireTime: 1h
  # 令牌刷新阈值（距令牌过期不足该阈值时，新请求触发刷新）
  refreshThreshold: 15m
  # JWT 签发/验签密钥（HMAC-SHA256；缺失或长度不足启动失败。换值=全员重新登录；gateway 与 auth 必须一致）
  tokenSecret: xxxxxxxx
```

`tokenSecret` 为必配项，`TokenProperties` 启动时校验缺失或长度不足 32 字符直接拒绝启动。在 `LoginUserManager` 中的 `setLoginUserCache` 设置用户缓存、`verifyLoginUserCache` 校验用户缓存中会应用配置数据。

## 过滤器

每个HTTP请求都会经过 `JwtAuthenticationTokenFilter` 过滤器，从请求头中获取Token后验证用户的登录状态，进行后续操作（存入上下文｜抛出异常）。**网关只做 JWT 合法性校验，登录态（Redis）校验在这一步完成**：

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
                // 设置请求上下文信息
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

## 权限红点 <Badge type="tip" text="3.0" />

`PermissionUpdateUtils` 是前端「数据更新」红点的事实源：权限数据变更（用户改角色、角色重授菜单等）即置位标记，并经进程内事件通知 WebSocket 实时推送；登录或点击「数据更新」重载会话时消费标记（红点熄灭）。

``` java
// 变更即置位：Redis 置标记 + 进程内事件（WebSocketListener 收到后推送 WS_REFRESH_PERMISSION）
PermissionUpdateUtils.markChanged(userId);
PermissionUpdateUtils.markChanged(userIds);   // 批量：角色菜单重授等场景

// 是否存在未消费的变更标记（getInfo 红点判定）
boolean changed = PermissionUpdateUtils.hasChanged(userId);

// 消费变更标记（红点熄灭）：登录 /「数据更新」重载会话时调用
PermissionUpdateUtils.clear(userId);
```

- **参数**：`userId` - 用户id ｜ `userIds` - 用户id集合
- **返回值**：`hasChanged` 返回 `boolean`
- **说明**：标记按用户维度共享，任一端登录/更新即消费、其他设备红点随之熄灭；WebSocket 推送消息类型为 `WebSocketMsgTypeEnum.WS_REFRESH_PERMISSION`，见 [WebSocket](/3.0/doc-cloud/base/websocket)

## 登录失败锁定 <Badge type="tip" text="3.0" />

`login.lock` 登录失败锁定在 Nacos `lihua-auth.yaml` 中配置，账号与 IP 双维度独立计数与锁定（防针对单账号撞库与单源撞多账号）：

``` yaml
login:
  lock:
    # 双仓统一默认关闭（验证码为唯一防线）；二开按需自行开启
    enabled: false
    fail-threshold: 5      # 窗口内失败达该次数即锁定对应主体
    fail-window: 15m       # 失败计数窗口（自首次失败起算的固定窗）
    lock-duration: 10m     # 锁定时长
```

锁定逻辑位于 `lihua-auth` 的 `SysAuthenticationServiceImpl`：登录前检查账号或 IP 任一在锁即拒绝；认证失败双维度计数（首次计数起算窗口 TTL），任一达阈值写对应锁；登录成功清账号维度计数（IP 维度留窗口自然过期，继续压制同源撞库）；系统级故障（如下游服务不可用）不计失败，防服务故障期间误锁全部尝试用户。锁定开启后验证码与锁定形成双保险。

## 用户上下文

因获取用户上下文需要在数据库中查询大量数据。故只有在`登录`或点击`数据更新`时才会真正加载数据，普通刷新页面并不会获取最新数据，而是从Redis中直接返回。在对用户强绑定的属性更新时，请提示用户从数据更新获取最新数据

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
    // 获取当前登录用户角色编码集合
    List<String> roleCodeList = LoginUserContext.getRoleCodeList();
    // 获取当前登录用户默认部门
    CurrentDept defaultDept = LoginUserContext.getDefaultDept();
    // 获取当前登录用户默认部门编码
    String defaultDeptCode = LoginUserContext.getDefaultDeptCode();
    // 获取当前登录用户默认部门下的岗位编码集合
    List<String> defaultDeptPostCodeList = LoginUserContext.getDefaultDeptPostCodeList();
    // 获取当前登录用户部门编码集合
    List<String> deptCodeList = LoginUserContext.getDeptCodeList();
    // 获取当前登录用户岗位编码集合
    List<String> postCodeList = LoginUserContext.getPostCodeList();
    // 获取当前登录用户
    CurrentUser user = LoginUserContext.getUser();
}
```

### 自定义用户上下文

随着业务发展，可能新增其他与用户强绑定的属性。通过用户上下文直接获取会大大提高开发效率。想要增加用户上下文能够获取的数据，需要对以下实体类/方法进行改造。

1. `com.lihua.security.model.LoginUserSession` 实体类下添加自定义属性。

     ``` java
     @Data
     @Accessors(chain = true)
     @NoArgsConstructor
     @JsonIgnoreProperties(ignoreUnknown = true)
     public class LoginUserSession implements UserDetails {
     
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

2. 实现 `com.lihua.system.strategy.cacheloginuser.CacheLoginUserStrategy` 接口。

     新建实现类实现`CacheLoginUserStrategy` 接口，在重写的`cacheLoginUser` 方法中进行查询逻辑的处理（查询对应的数据，set到LoginUserSession中即可）。微服务版下该策略接口由 `lihua-system` 提供（数据属于业务库），现有的部门、岗位、角色、菜单等实现位于 `com.lihua.system.strategy.cacheloginuser` 包下。

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
     @Slf4j
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
