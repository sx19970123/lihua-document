# 安全

安全模块集成了 Spring Security，提供认证配置、Token 处理、用户上下文管理以及权限安全相关的异常处理等功能。



## 配置

### Security配置

`SecurityConfig` 为Spring Security的核心配置，接口白名单、异常处理器都在此类配置

``` java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity()
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
                        "/system/login",                                // 登录
                        "/system/publicKey/**",                         // 获取公钥
                        "/system/attachment/storage/download/**",       // 附件下载
                        "/system/setting/GrayModelSetting",             // 灰色模式设置
                        "/system/checkUserName/**",                     // 检查用户名
                        "/system/setting/base/**",                      // 基础设置
                        "/system/register/**"                           // 注册
                ).permitAll()
                // app接口配置
                .requestMatchers(
                        "/app/system/login",                                // 登录
                        "/app/system/publicKey/**",                         // 获取公钥
                        "/app/system/attachment/storage/download/**",       // 附件下载
                        "/app/system/checkUserName/**",                     // 检查用户名
                        "/app/system/setting/base/**",                      // 基础设置
                        "/app/system/register/**"                           // 注册
                ).permitAll()
                // 系统其他接口配置
                .requestMatchers(
                        "/captcha/**",                                  // 验证码
                        "/ws-connect/**",                               // websocket建立连接
                        "/druid/**",                                    // druid数据库监控
                        "/swagger-ui/**",                               // spring-doc
                        "/v3/api-docs/**",                              // spring-doc
                        "/error"                                        // 当出现404等异常时spring内部会转发到/error，需要将其放过，否则会响应401
                ).permitAll()
                .anyRequest().authenticated());

        // 关闭csrf拦截
        http.csrf(AbstractHttpConfigurer::disable);

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

    /**
     * 程序启动后修改认证信息上下文存储策略，支持子线程中获取认证信息
     */
    @PostConstruct
    public void setStrategyName() {
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    }
}

```



### Token配置

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对Token进行配置，可配置Token过期时间和刷新阈值

``` yaml
 # 系统配置
token:
  # 令牌过期时间（分钟）
  tokenExpireTime: 60
  # 令牌刷新阈值（分钟）距令牌过期15分钟内时，有新请求时对令牌进行刷新
  refreshThreshold: 15
```

在 `LoginUserManager` 中的 `setLoginUserCache` 设置用户缓存、`verifyLoginUserCache` 校验用户缓存中会应用配置数据



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
        String token = TokenUtils.getToken(request);

        if (StringUtils.hasText(token)) {
            LoginUser loginUser = LoginUserManager.getLoginUser(token);
            if (loginUser != null) {
                PreAuthenticatedAuthenticationToken authentication = new PreAuthenticatedAuthenticationToken(loginUser, null, loginUser.getPermissionList().stream().map(SimpleGrantedAuthority::new).toList());
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

1. `com.lihua.security.model.LoginUser` 实体类下添加自定义属性。

     ``` java
     @Data
     @Accessors(chain = true)
     @NoArgsConstructor
     @JsonIgnoreProperties(ignoreUnknown = true)
     public class LoginUser implements UserDetails {
     
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

     新建实现类实现`CacheLoginUserStrategy` 接口，在重写的`cacheLoginUser` 方法中进行查询逻辑的处理（查询对应的数据，set到LoginUser中即可）。

     ``` java
     /**
      * 缓存部门相关实现类
      */
     @Component
     public class CacheDeptStrategyImpl implements CacheLoginUserStrategy {
     
         @Resource
         private SysDeptMapper sysDeptMapper;
     
         @Override
         public void cacheLoginUser(LoginUser loginUser, boolean isAdmin) {
             String id = loginUser.getUser().getId();
             List<CurrentDept> deptList;
             if (isAdmin) {
                 deptList = sysDeptMapper.selectAllDept(id);
             } else {
                 deptList = sysDeptMapper.selectByUserId(id);
             }
             loginUser.setDeptList(deptList);
         }
     }
     ```

3. `com.lihua.security.manager.LoginUserContext` 增加全局静态方法可直接通过LoginUserContext调用

     本类中的`getLoginUser()` 方法可获取到 `LoginUser` 对象，可直接获取到自定义属性

     ``` java
     /**
      * 获取当前登录用户工具类
      */
     @Slf4j
     public class LoginUserContext implements Serializable {
     
         private static final RedisCache redisCache;
     
         static {
             redisCache = SpringUtils.getBean(RedisCache.class);
         }
     
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
