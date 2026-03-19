# 用户上下文

因获取用户上下文需要在数据库中查询大量数据。故只有在`登录`或点击`数据更新`时才会真正从数据库加载新数据，普通刷新页面并不会获取最新数据，而是从Redis中直接返回。在对用户强绑定的属性更新时，请提示用户从数据更新获取最新数据

::: warning 提示

在无token的匿名访问中，无法获取用户上下文

:::

## 获取登录用户信息

使用 `LoginUserContext` 可获取当前登录用户的所有信息

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



## 自定义用户上下文

随着业务发展，可能新增其他与用户强绑定的属性。通过用户上下文直接获取会大大提高开发效率。想要增加用户上下文能够获取的数据，需要对以下实体类/方法进行改造。

1. `com.lihua.model.security.LoginUser` 实体类下添加自定义属性。

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

2. 实现 `com.lihua.system.strategy.CacheLoginUserStrategy` 接口。

     在 `com.lihua.system.strategy.impl.loginuser` 下新建实现类实现`CacheLoginUserStrategy` 接口，在重写的`cacheLoginUser` 方法中进行查询逻辑的处理（查询对应的数据，set到LoginUser中即可）。

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

3. `com.lihua.utils.security.LoginUserContext` 增加全局静态方法可直接通过LoginUserContext调用

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

