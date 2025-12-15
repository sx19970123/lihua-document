# 后端文档

### 后端项目结构

``` bash
lihua
├── lihua-admin    			// 后台服务启动类&系统模块controller层
│		├── controller		// 业务controller层
│		├── job				// 定时任务
│		├── started			// 项目启动时加载类/执行方法
├── lihua-common   			// 系统通用模块
│		├── annotation		// 注解
│		├── cache			// redis缓存
│		├── config			// 系统通用配置类
│		├── enums			// 系统枚举
│		├── exception		// 全局异常
│		├── mapper			// common用到的mapper
│		├── model			// 全局通用对象实体
│		├── utils			// 全局工具类
├── lihua-core     			// 系统核心模块，包含各种配置及过滤器、拦截器、AOP
│		├── aspect			// 切面
│		├── config			// 全局配置
│		├── filter			// 过滤器
│		├── handle			// 全局处理器
│		├── interceptor		// 全局拦截器
├── lihua-service  			// 系统服务模块，系统功能业务实现
│		├── entity			// 实体类，字段与数据库对应
│		├── mapper			// mapper层
│		├── model			// VO、DTO等实体对象
│		├── service			// service层
│		├── strategy		// 某些业务的策略接口和实现类
├──	sql						// 系统sql脚本
├── static-image			// README.md用到的图片
```

### 新增子模块

> 对于业务的开发，为保证项目结构，通常新建子模块，在子模块中进行业务开发

1. 使用IDEA新建子模块

   在项目最`父级目录右键->新建->模块`

   ![image-20241019132226208](file/README/image-20241019132226208.png)

   子模块中选择Maven生成器（社区版IDEA无法直接新增Spring项目，不过问题不大），填好名称，选择子模块模板，点击创建。

   ![image-20241019134007061](file/README/image-20241019134007061.png)

   创建后可以看到新模块目录结构，根据需求可自行修改。创建完成后全局pom会自动添加新模块的module信息

   ![image-20241019134148800](file/README/image-20241019134148800.png)

2. 修改新模块项目结构、引入`lihua-common`依赖

   `lihua-common` 为全局通用依赖，新模块需引入该依赖。引入完成后刷新Maven

   ![image-20241019134247348](file/README/image-20241019134247348.png)

3. `lihua-admin` 中添加新模块的依赖

   `lihua-admin` 中包含系统启动类，需在此模块下引入系统所有模块，引入完成后刷新Maven

   ![image-20241019134533934](file/README/image-20241019134533934.png)

4. 测试

   新建测试 controller，验证请求是否能进入。

   ![image-20241019135001625](file/README/image-20241019135001625.png)

   **因 SpringSecurity 原因，没有携带token的请求无法通过校验，可在`lihuacore/com/lihua/config/SecurityConfig`下新增临时白名单。或从浏览器复制 token 到ApiPost等请求测试工具进行验证**

   ![image-20241019135207412](file/README/image-20241019135207412.png)

5. 测试完成

   通过url后端返回内容即表示新模块增加完成，可以进行业务开发了~

   ![image-20241019135714321](file/README/image-20241019135714321.png)

### 重要的全局功能

#### 获得当前登录用户上下文

> 需要注意的是，因获取用户上下文需要在数据库中查询大量数据。故只有在`登录`或点击`数据更新`时才会真正从数据库加载新数据，普通刷新页面并不会获取最新数据，而是从Redis中直接返回。在对用户强绑定的属性更新时，请提示用户从数据更新获取最新数据！

> 提示：在定时任务或无需验证token的方法中，无法获取！

- 通过 `LoginUserContext` 可获取当前登录用户所有信息

  ``` java
  import com.lihua.utils.security.LoginUserContext;
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

- 自定义用户上下文

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
           * 新增自己的查询逻辑
           */
         	...
     }
     ```

#### 使用全局Redis缓存

- 使用RedisCache

  通过自动装配 `RedisCache` 使用缓存

  ``` java
  import com.lihua.cache.RedisCache;
  
  @Service
  public class XxxServiceRedisImpl implements XxxServiceRedis {
  
      @Resource
      private RedisCache redisCache;
  
      @Override
      public void set(String s, String s1, long l) {
          redisCache.setCacheObject(s,s1,l, TimeUnit.SECONDS);
      }
  }
  ```

- 自定义RedisCache

  `RedisCache` 封装了 `RedisTemplate` 可根据业务需要自行增加工具方法

  ``` java
  package com.lihua.cache;
  
  @Component
  public class RedisCache {
  
      @Resource
      private RedisTemplate<String, Object> redisTemplate;
  
      @Resource
      private ObjectMapper objectMapper;
  
      /**
       * 缓存数据
       * @param key 缓存key
       * @param value 缓存值
       */
      public <T> void setCacheObject(String key,T value) {
          redisTemplate.opsForValue().set(key, value);
      }
  
      /**
       * 缓存数据
       * @param key 缓存key
       * @param value 缓存值
       * @param timeout 过期时间
       * @param timeUnit 时间单位
       */
      public <T> void setCacheObject(String key,T value,Long timeout,TimeUnit timeUnit) {
          redisTemplate.opsForValue().set(key,value,timeout,timeUnit);
      }
      
      ...
  }
  ```

- 统一维护Redis Key前缀

  在`lihua-common/src/main/java/com/lihua/enums/SysBaseEnum.java` 中维护了各种情况下的缓存前缀，业务中有需要缓存时，推荐在此枚举中进行统一维护。

  ``` java
  @Getter
  @AllArgsConstructor
  public enum SysBaseEnum {
      /**
       * 用户登录成功redis前缀
       */
      LOGIN_USER_REDIS_PREFIX("REDIS_CACHE_LOGIN_USER:"),
  
      /**
       * 字典数据redis前缀
       */
      DICT_DATA_REDIS_PREFIX("REDIS_CACHE_DICT_DATA:"),
  
      /**
       * 系统设置redis前缀
       */
      SYSTEM_SETTING_REDIS_PREFIX("REDIS_CACHE_SYSTEM_SETTING:"),
  
      /**
       * 系统ip黑名单redis前缀
       */
      SYSTEM_IP_BLACKLIST_REDIS_PREFIX("REDIS_CACHE_IP_BLACKLIST:"),
  
      /**
       * 防重复提交redis前缀
       */
      PREVENT_DUPLICATE_SUBMIT_REDIS_PREFIX("REDIS_CACHE_REQUEST_SUBMIT:"),
  
      /**
       * 验证码redis前缀
       */
      CAPTCHA_REDIS_PREFIX("REDIS_CACHE_CAPTCHA:"),
  
      /**
       * 二次验证redis前缀
       */
      SECONDARY_CAPTCHA_REDIS_PREFIX("REDIS_CACHE_SECONDARY_CAPTCHA:"),
  
      /**
       * 分片上传uploadId前缀
       */
      CHUNK_UPLOAD_ID_REDIS_PREFIX("REDIS_CACHE_CHUNK_UPLOAD_ID:"),
  
      /**
       * JWT 密钥
       */
      JWT_TOKEN_SECRET("xxx"),
  
      /**
       * 系统默认密码的加密key和 iv
       * 需与前端 src/utils/Crypto.ts 中定义的 DEFAULT_PASSWORD_KEY 一致
       * 更多修改密钥请参考 https://gitee.com/yukino_git/lihua/issues/IBFWG4#note_36173102_link
       */
      DEFAULT_PASSWORD_KEY("xxx"),
  
      /**
       * 附件临时路径信息加密key
       */
      ATTACHMENT_URL_KEY("xxx");
  
      private final String value;
  }
  ```

- 在系统监控中对缓存类型进行分组

  `lihua-service/src/main/java/com/lihua/monitor/service/impl/MonitorCacheServiceImpl.java` 下 `cacheKeyGroups`、`cacheKeys` 方法中可设置Redis Key分组。当有业务数据需要存入缓存时，可在以下方法中配置。**不进行单独处理将被归为“其他”**

  ``` java
  public List<CacheMonitor> cacheKeyGroups() {
      return List.of(
          new CacheMonitor(LOGIN_USER_REDIS_PREFIX.getValue(), "登录用户"),
          new CacheMonitor(DICT_DATA_REDIS_PREFIX.getValue(), "系统字典"),
          new CacheMonitor(SYSTEM_SETTING_REDIS_PREFIX.getValue(), "系统设置"),
          new CacheMonitor(SYSTEM_IP_BLACKLIST_REDIS_PREFIX.getValue(), "IP黑名单"),
          new CacheMonitor(PREVENT_DUPLICATE_SUBMIT_REDIS_PREFIX.getValue(), "防重复提交"),
          new CacheMonitor(CAPTCHA_REDIS_PREFIX.getValue(), "验证码"),
          new CacheMonitor(SECONDARY_CAPTCHA_REDIS_PREFIX.getValue(), "验证码二次验证"),
          new CacheMonitor(CHUNK_UPLOAD_ID_REDIS_PREFIX.getValue(), "分片上传uploadId"),
          new CacheMonitor("OTHER", "其他")
      );
  }
  ```

  ``` java
  public Set<String> cacheKeys(String keyPrefix) {
      if (!"OTHER".equals(keyPrefix)) {
          return redisCache.keys(keyPrefix);
      }
      Set<String> keys = redisCache.keys();
      return keys.stream()
              .filter(key -> !key.startsWith(LOGIN_USER_REDIS_PREFIX.getValue()))
              .filter(key -> !key.startsWith(DICT_DATA_REDIS_PREFIX.getValue()))
              .filter(key -> !key.startsWith(SYSTEM_SETTING_REDIS_PREFIX.getValue()))
              .filter(key -> !key.startsWith(SYSTEM_IP_BLACKLIST_REDIS_PREFIX.getValue()))
              .filter(key -> !key.startsWith(PREVENT_DUPLICATE_SUBMIT_REDIS_PREFIX.getValue()))
              .filter(key -> !key.startsWith(CAPTCHA_REDIS_PREFIX.getValue()))
              .collect(Collectors.toSet());
  }
  ```
  
  

#### 获取当前时间

- 推荐使用 Java 8 提供的`LocalDataTime` 获取当前时间日期

  ``` java
  LocalDateTime now = LocalDateTime.now();
  ```

#### 逻辑删除

- 为保证数据安全，系统设计初期采用了逻辑删除方式，如mp配置文件所示，对应数据库对应逻辑删除字段为`del_flag` 正常值为 `0` 删除后值置为 `1`

  ``` yaml
  mybatis-plus:
    global-config:
      db-config:
        # 逻辑删除对应字段
        logic-delete-field: delFlag
        # 逻辑删除后的字段对应值
        logic-delete-value: 1
        # 逻辑删除前的字段对应值
        logic-not-delete-value: 0
  ```

#### knife4j文档

- 系统集成了knife4j 文档，在`application-dev.yml` 和 `application-prod.yml` 中可对开发生产环境进行分别配置

  ``` yaml
  # springdoc-openapi项目配置
  springdoc:
    swagger-ui:
      path: /swagger-ui.html
      tags-sorter: alpha
      operations-sorter: alpha
    api-docs:
      path: /v3/api-docs
  # knife4j的增强配置，不需要增强可以不配
  knife4j:
    enable: true
  # 生产模式打开，防止接口泄漏
    production: true
    setting:
      language: zh_cn
  ```

- knife4j 配置类 `com.lihua.config.Knife4jConfig` 中可自定义接口描述信息、接口分组配置等。

- 后端项目启动后访问 `http://ip:端口/doc.html` 即可查看接口文档，例如http://localhost:8080/doc.html


#### 系统附件

> 附件接口 `com/lihua/controller/system/SysAttachmentStorageController.java` 与前端 `attachment-upload` 组件进行交互，该接口包含 `attachment-upload` 组件中 附件上传（一般上传|分片上传|断点续传|文件秒传）、附件回显、附件删除、附件预览/下载 等功能

> 系统提供本地附件、MINIO对象存储。通过配置文件可进行切换

**附件配置**

``` yaml
 # 系统配置
lihua:
	...
  # 文件上传服务类型：LOCAL（传统本地上传）、MINIO（Minio对象存储）
  uploadFileModel: LOCAL
  # 公开文件的业务编码，publicLocalDownload 中判断包含业务编码的文件才会进行返回
  uploadPublicBusinessCode: [UserAvatar, SystemNotice]
  # 上传文件路径 mac windows 注意目录切换
  uploadFilePath: D:/home/lihua/
  # 文件导出路径
  exportFilePath: D:/home/lihua/export/
  ...
```

- `lihua.uploadFileModel`指定文件服务类型，可选 LOCAL（本地）、MINIO（minio）。可自行扩展其他第三方服务。
- `lihua.uploadPublicBusinessCode` 指定可公开访问附件的业务编码。业务编码可由前端指定，默认为当前页面的路由名称。设置为公开的文件可通过`system/attachment/storage/download/p/{id}` 进行下载。
- `lihua.uploadFilePath` 附件上传目录
- `lihua.exportFilePath` excel 导出目录

**扩展其他附件服务**

> 在 `com/lihua/strategy/system/attachment/impl` 下新增 `AttachmentStorageStrategy` 接口实现类，根据传入参数进行上传/下载等业务逻辑编写，按要求返回参数即可。

![image-20250221070216007](file/SERVER/image-20250221070216007.png)

**AttachmentStorageStrategy 接口共有 9 个抽象方法（其中四个为分片上传相关，不需要分片上传可在实现类中直接抛出异常，反正调用不到）**

- `void uploadFile(MultipartFile file, String fullFilePath)` 一般附件上传，接收一个附件对象和全路径。将附件上传到对应路径即可
- `boolean isExists(String fullFilePath)` 通过全路径判断附件是否存在，返回 true 或 false
- `String getUploadId(String fullFilePath)` 通过全路径获取分片上传 uploadId （不需要分片上传的话直接抛出异常就行）
- `List<Integer> getUploadedChunksIndex(String fullFilePath, String uploadId)`  通过全路径和uploadId 获取已上传附件的索引值，用于断点续传（不需要分片上传的话直接抛出异常就行）
- `void chunksUploadFile(MultipartFile file, String fullFilePath, Integer index, String uploadId)` 附件分片上传，接收附件、全路径、当前附件索引值、uploadId （不需要分片上传的话直接抛出异常就行）
- `void chunksMerge(String fullFilePath, String md5, String uploadId, Integer total)` 分片合并，分片全部上传完毕后前端会调用此方法进行附件合并，接收 全路径、附件md5（用于完整性校验）、uploadId、附件总分片数（不需要分片上传的话直接抛出异常就行）
- `void delete(String fullFilePath)` 根据全路径删除附件
- `String getDownloadURL(String fullFilePath, String originName, int expiryInMinutes)` 获取附件下载URL，接收附件全路径、原文件名、过期时间（分钟）
- `InputStream download(String fullFilePath)` 通过全路径名获取附件对应InputStream，用于附件下载



注1： *扩展完成后若无其他需求就不用改动其他代码，直接使用  [附件上传](document/component/ATTACHMENT-UPLOAD.md) 组件即可*。

注2：*调用SysAttachmentStorageController下的附件上传接口，按要求传递参数，附件会进入【附件管理】*



### 开发

#### controller 层开发（1.1.x）

> 最简单的controller

``` java
package com.lihua;

import com.lihua.model.web.BaseController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("test")
public class TestController extends BaseController {
    
    @GetMapping("{id}")
    public String test(@PathVariable("id") String id) {
        return success(id);
    }
}

```

- 数据校验

  项目中继承了`validation`，通过注解可进行优雅的数据校验，在全局异常处理中捕获并处理了校验异常。平时开发只管打注解就OK，validation的详细使用请参考官方文档。

  ``` java
  @PreAuthorize("hasRole('ROLE_admin')")
  public String test(@RequestBody @Validated Test test) {
      return success(test);
  }
  ```

- controller 上可用的其他注解

  除常规MVC提供的注解外，系统还提供了`@Log` 日志记录 `@RateLimiter` 限流  `@PreventDuplicateSubmit` 防重复提交注解，详细使用请参考 `注解`

  ``` java
  @RateLimiter
  @PreventDuplicateSubmit
  @Log(description = "测试", type = LogTypeEnum.REGISTER, excludeParams = {"password", "confirmPassword"}, recordResult = false)
  public String test(@RequestBody @Validated Test test) {
  return success(test);
  }
  ```

- controller 的返回值

  系统设计中，controller返回类型应该有三类，其中前两类在 BaseController 中进行了封装

  1. String （大多数情况）

     不管返回是基本类型还是对象或集合，都可以直接调用 `success()` 方法，会转换为 Json 进行返回。在编写controller时不用在想封装的响应类叫什么名字了，大多数时候无脑String就行了。

     ``` java
     public String test(@PathVariable("id") String id) {
         return success(id);
     }
     
     public String test() {
         SysUser sysUser = new SysUser();
         return success(sysUser);
     }
     
     public String test() {
         List<SysUser> sysUsers = new ArrayList<>();
         return success(sysUsers);
     }
     
     public String test() {
         int i = 5;
         return success(i);
     }
     ```

     

  2. ResponseEntity< StreamingResponseBody >（流式文件下载的情况）

     使用流式下载，无需将文件加载到内存即可向客户端传输。`success()`中已将麻烦的操作进行了封装，使用时直接传入`File、List<File>、InputStream + fileName`即可。

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

  3. void （直接通过 HttpServletResponse 返回的情况）

     ``` java
     @GetMapping("/download")
     public void test(HttpServletResponse response) {
         String filePath = "path/to/your/file.txt"; // 文件路径
         File file = new File(filePath);
     
         if (file.exists()) {
             response.setContentType("application/octet-stream");
             response.setHeader("Content-Disposition", "attachment;filename=" + file.getName());
             response.setContentLength((int) file.length());
     
             try (FileInputStream fileInputStream = new FileInputStream(file);
                  OutputStream outputStream = response.getOutputStream()) {
     
                 byte[] buffer = new byte[1024];
                 int bytesRead;
                 while ((bytesRead = fileInputStream.read(buffer)) != -1) {
                     outputStream.write(buffer, 0, bytesRead);
                 }
     
                 outputStream.flush();
             } catch (IOException e) {
                 e.printStackTrace();
             }
         } else {
             response.setStatus(HttpServletResponse.SC_NOT_FOUND);
         }
     }
     ```

- BaseController （1.2.x中已移除）

  BaseController 提供两种静态方法的重载分别是`success()` 和 `error()` 返回结构如下：
  
  ``` json
  {
      code: 200 			// 返回状态码
      data: null			// 返回对象
      msg: "成功"		   // 返回描述
  }
  ```
  
  - success：无需返回data的情况直接调用`success()`即可，需要返回数据直接将数据放入重载参数即可。
  - error：当在controller中判断数据不合法或其他业务问题时，返回error()，需指定错误类型，该类型在 `ResultCodeEnum` 枚举类中维护，当系统运行中出现运行时异常，该异常会被全局异常处理器（`GlobalExceptionHandle`）捕获，并返回异常中指定的`ResultCodeEnum`
  
  ![image-20241019144009491](file/README/image-20241019144009491.png)
  
  ![image-20241019144111155](file/README/image-20241019144111155.png)

- ResultCodeEnum 用于维护controller中响应类型的枚举

  ``` java
  package com.lihua.enums;
  
  import lombok.AllArgsConstructor;
  import lombok.Getter;
  
  /**
   * 定义 controller 统一返回code 和 默认msg
   */
  @AllArgsConstructor
  @Getter
  public enum ResultCodeEnum {
  
      SUCCESS (200,"成功"),
      EDITOR_SUCCESS(0,"成功"),
      AUTHENTICATION_EXPIRED(401,"身份验证过期，请重新登陆"),
      PARAMS_MISSING(402,"参数缺失或不完整"),
      ACCESS_ERROR (403,"用户权限不足"),
      RESOURCE_NOT_FOUND_ERROR(404,"请求的资源不存在"),
      PARAMS_ERROR(405,"参数格式异常"),
      ACCESS_EXPIRED_ERROR (406,"请求资源权限过期"),
      IP_ILLEGAL_ERROR(407, "暂时无法为该地区提供服务"),
      ERROR (500,"业务异常"),
      FILE_ERROR (501,"文件处理异常"),
      RATE_LIMITER_ERROR (502,"系统繁忙，请稍后再试"),
      DUPLICATE_SUBMIT_ERROR (503,"请勿重复提交"),
      SERVER_UNAVAILABLE (504,"服务器维护中");
  
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

#### controller 层开发（1.2.x）

> 2.1.0 项目中集成了knife4j 接口文档，knife4j与继承`BaseController`返回String方式不互相兼容（因手动将数据转为了Json，knife4j 无法获取返回值对象属性，导致接口文档中返回值全部为String）。2.1.0 对Controller统一返回进行改动，可选择继承 `StrResponseController` 继续返回String；也可选择继承`ApiResponseController` ，返回 `ApiResponseModel< T >`（注意泛型要指明返回值类型，否则knife4j 无法识别）。全都不继承的情况下，可调用 `ApiResponse` 或 `StrResponse` 中的`success()` `error()` 方法进行返回。

> 最简单的controller

**继承 `StrResponseController` 后返回值直接返回String** 

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

**继承 `ApiResponseController` 后返回值直接返回ApiResponseModel< T >** 

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

- knife4j 

  使用`@Tag` `@Operation` 等注解可生成对应的接口文档，详细请参考官方文档。

- 数据校验

  项目中继承了`validation`，通过注解可进行优雅的数据校验，在全局异常处理中捕获并处理了校验异常。平时开发只管打注解就OK，validation的详细使用请参考官方文档。

  ``` java
  @PreAuthorize("hasRole('ROLE_admin')")
  public String test(@RequestBody @Validated Test test) {
      return success(test);
  }
  ```

- controller 上可用的其他注解

  除常规MVC提供的注解外，系统还提供了`@Log` 日志记录 `@RateLimiter` 限流  `@PreventDuplicateSubmit` 防重复提交注解，详细使用请参考 `注解`

  ``` java
  @RateLimiter
  @PreventDuplicateSubmit
  @Log(description = "测试", type = LogTypeEnum.REGISTER, excludeParams = {"password", "confirmPassword"}, recordResult = false)
  public String test(@RequestBody @Validated Test test) {
  return success(test);
  }
  ```

- controller 的返回值

  系统设计中，controller返回类型应该有三类，其中前两类在 BaseController 中进行了封装

  1. String 或 ApiResponseModel< T >（大多数情况）

     不管返回是基本类型还是对象或集合，都可以直接调用 `success()` 方法，如个人开发或不需要knife4j 接口文档，可选择`StrResponse.success`直接返回String。否则使用`ApiResponse.success` **返回值泛型要指定**

     ``` java
     public String test(@PathVariable("id") String id) {
         return StrResponse.success(id);
     }
     
     public String test() {
         SysUser sysUser = new SysUser();
         return StrResponse.success(sysUser);
     }
     
     public ApiResponseModel<List<SysUser>> test() {
         List<SysUser> sysUsers = new ArrayList<>();
         return ApiResponse.success(sysUsers);
     }
     
     public ApiResponseModel<Integer> test() {
         int i = 5;
         return ApiResponse.success(i);
     }
     ```

  2. ResponseEntity< StreamingResponseBody >（流式文件下载的情况）

     使用流式下载，无需将文件加载到内存即可向客户端传输。`success()`中已将麻烦的操作进行了封装，使用时直接传入`File、List<File>、InputStream + fileName`即可。

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

  3. void （直接通过 HttpServletResponse 返回的情况）

     ``` java
     @GetMapping("/download")
     public void test(HttpServletResponse response) {
         String filePath = "path/to/your/file.txt"; // 文件路径
         File file = new File(filePath);
     
         if (file.exists()) {
             response.setContentType("application/octet-stream");
             response.setHeader("Content-Disposition", "attachment;filename=" + file.getName());
             response.setContentLength((int) file.length());
     
             try (FileInputStream fileInputStream = new FileInputStream(file);
                  OutputStream outputStream = response.getOutputStream()) {
     
                 byte[] buffer = new byte[1024];
                 int bytesRead;
                 while ((bytesRead = fileInputStream.read(buffer)) != -1) {
                     outputStream.write(buffer, 0, bytesRead);
                 }
     
                 outputStream.flush();
             } catch (IOException e) {
                 e.printStackTrace();
             }
         } else {
             response.setStatus(HttpServletResponse.SC_NOT_FOUND);
         }
     }
     ```

- ApiResponseModel

  ApiResponseModel 结构如下：

  ``` json
  {
      code: 200 			// 返回状态码
      data: null			// 返回对象
      msg: "成功"		   // 返回描述
  }
  ```

- ResultCodeEnum 用于维护controller中响应类型的枚举

  ``` java
  package com.lihua.enums;
  
  import lombok.AllArgsConstructor;
  import lombok.Getter;
  
  /**
   * 定义 controller 统一返回code 和 默认msg
   */
  @AllArgsConstructor
  @Getter
  public enum ResultCodeEnum {
  
      SUCCESS (200,"成功"),
      EDITOR_SUCCESS(0,"成功"),
      AUTHENTICATION_EXPIRED(401,"身份验证过期，请重新登陆"),
      PARAMS_MISSING(402,"参数缺失或不完整"),
      ACCESS_ERROR (403,"用户权限不足"),
      RESOURCE_NOT_FOUND_ERROR(404,"请求的资源不存在"),
      PARAMS_ERROR(405,"参数格式异常"),
      ACCESS_EXPIRED_ERROR (406,"请求资源权限过期"),
      IP_ILLEGAL_ERROR(407, "暂时无法为该地区提供服务"),
      ERROR (500,"业务异常"),
      FILE_ERROR (501,"文件处理异常"),
      RATE_LIMITER_ERROR (502,"系统繁忙，请稍后再试"),
      DUPLICATE_SUBMIT_ERROR (503,"请勿重复提交"),
      SERVER_UNAVAILABLE (504,"服务器维护中");
  
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

#### service 层开发

- 最简单的Service与ServiceImpl

  ``` java
  public interface TestService {
      /**
       * 分页查询
       */
      IPage<Test> findPage(TestDTO dto);
  }
  ```

  ``` java
  @Service
  public class TestServiceImpl extends ServiceImpl<TestMapper, Test> implements TestService {
      
      @Resource
      private TestMapper testMapper;
      
      /**
       * 分页查询
       */
      IPage<Test> findPage(TestDTO dto) {
        	IPage<Test> iPage = new Page<>(dto.getPageNum(), dto.getPageSize());
          QueryWrapper<Test> queryWrapper = new QueryWrapper<>();
          // ...
      	testMapper.selectPage(iPage, queryWrapper);
          return iPage;
      }
  }
  ```

- 系统集成了MybatisPlus，在ServiceImpl实现类中继承`ServiceImpl<EntityMapper, Entity>` 以提高开发效率。详细使用方法请参考Mybatis-Plus官方文档。

- 系统分页基于 MybatisPlus 的 分页插件，详细使用方法请参考Mybatis-Plus官方文档。

  在`lihua-core/src/main/java/com/lihua/config/MybatisPlusConfig.java` 中配置了分页插件，如有个性化需求，可进行配置更改。

  ``` java
  @Configuration
  public class MybatisPlusConfig {
      @Bean
      public MybatisPlusInterceptor mybatisPlusInterceptor() {
          MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
  
          // 如果配置多个插件,切记分页最后添加
          PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor();
          // 分页溢出后自动查询第一页
          paginationInnerInterceptor.setOverflow(true);
          // 数据库类型
          paginationInnerInterceptor.setDbType(DbType.MYSQL);
          interceptor.addInnerInterceptor(paginationInnerInterceptor);
          return interceptor;
      }
  }
  
  ```

#### mapper 层开发

> 为保证Mapper层与Service层结构一致，将xml文件放置到了mapper包下
>
> 具体Mapper写法请参考Mybatis-Plus官方文档

新建模块请在启动类`LiHuaApplication`下`@MapperScan` 注解中新增对应mapper路径，防止扫描不到Mapper

``` java
@SpringBootApplication
@EnableAsync
@EnableAspectJAutoProxy(exposeProxy = true)
@MapperScan("com.lihua.**.mapper")
@ComponentScan("com.lihua.**")
public class LiHuaApplication {
    public static void main(String[] args) {
        SpringApplication.run(LiHuaApplication.class, args);
    }
}
```

![image-20241019160900602](file/README/image-20241019160900602.png)

#### entity & model

> 项目设计中，entity为与数据库字段想对应的实体类，model中则包含dto、vo、validation等实体类

![image-20241019161903466](file/README/image-20241019161903466.png)

- XxxEntity

  entity类中通常属性与数据库相对应，需指定主键（insert时IdType取雪花算法，主键数据库类型为varchar），另外集成了Lombok简化重复代码

  ``` java
  @EqualsAndHashCode(callSuper = true)
  @Data
  public class Test extends BaseEntity {
      /**
       * 主键
       */
      @TableId(type = IdType.ASSIGN_ID)
      private String id;
  
      /**
       * 名称
       */
      @NotNull(message = "请输入名称")
      private String name;
  
      /**
       * 逻辑删除标志
       */
      private String delFlag;
  }
  
  ```

- BaseEntity

  BaseEntity包含SQL表中必须存在的字段，所有Entity都应该继承此类（中间关联表可以忽略）

  ``` java
  @Data
  public class BaseEntity implements Serializable {
      @Serial
      private static final long serialVersionUID = 1L;
  
      /**
       * 创建人
       */
      private String createId;
  
      /**
       * 创建时间
       */
      private LocalDateTime createTime;
  
      /**
       * 更新人
       */
      private String updateId;
  
      /**
       * 更新时间
       */
      private LocalDateTime updateTime;
  }
  ```

- XxxDTO

  在系统设计中，前端向后台传递参数时，当参数不与Entity相同时，一般建立对应Entity的DTO进行接收，有分页需求的DTO类应继承 `BaseDTO`

  对应条件查询、分页查询等场景，可建立对应Entity的DTO接受数据，尽量不破坏Entity类

  ``` java
  @EqualsAndHashCode(callSuper = true)
  @Data
  public class SysPostDTO extends BaseDTO {
      /**
       * 部门id
       */
      private String deptId;
      /**
       * 岗位名称
       */
      private String name;
      /**
       * 岗位编码
       */
      private String code;
      /**
       * 岗位状态
       */
      private String status;
  }
  ```

- BaseDTO

  主要应对分页查询参数的实体类，当没有传递分页参数时，会使用默认值，同时配合 `validation` 可限制分页最大size

  ``` java
  @Data
  public class BaseDTO implements Serializable {
  
      @Serial
      private static final long serialVersionUID = 1L;
      /**
       * 最大分页页码
       */
      public static final int MAX_PAGE_NUM = 100;
      /**
       * 最大分页大小
       */
      public static final int MAX_PAGE_SIZE = 100;
      /**
       * 默认分页页码
       */
      public static final int DEFAULT_PAGE_NUM = 1;
      /**
       * 默认分页大小
       */
      public static final int DEFAULT_PAGE_SIZE = 10;
  
      /**
       * 当前页码
       */
      @Max(value = MAX_PAGE_NUM, message = "当前分页参数超出限制", groups = {MaxPageSizeLimit.class})
      protected Integer pageNum;
  
      /**
       * 当前分页大小
       */
      @Max(value = MAX_PAGE_SIZE, message = "当前分页参数超出限制", groups = {MaxPageSizeLimit.class})
      protected Integer pageSize;
  
      //在构造方法中设置默认值
      public BaseDTO() {
          this.pageNum = Optional.ofNullable(pageNum).orElse(BaseDTO.DEFAULT_PAGE_NUM);
          this.pageSize = Optional.ofNullable(pageSize).orElse(BaseDTO.DEFAULT_PAGE_SIZE);
      }
  }
  ```

- XxxVO

  在系统设计时，数据库向后端映射多表数据时，Entity无法映射全部数据，为不破坏Entity结构，新建对应的VO类，属于对Entity类的扩展。可直接继承Entity（当entity中映射的属性较少时，会造成许多元素为null的情况，会增加数据传输大小，不过一般无需在意），再添加新增的属性。

  ``` java
  @EqualsAndHashCode(callSuper = true)
  @ExcelModel(sheetName = "部门信息",includeAllField = false)
  @Data
  public class SysDeptVO extends SysDept {
  
      /**
       * 部门名称路径
       */
      @ExcelColumn(index = 0, title = "*部门名称路径", width = 12)
      private String namePath;
  
      /**
       * 岗位名称
       */
      @ExcelColumn(order = 9, title = "部门下岗位", width = 12)
      private String postNames;
  
      /**
       * excel 批量导入异常说明
       * 数据导入后，因异常无法入库的数据错误描述
       */
      @ExcelColumn(order = 10, title = "系统提示", style = {"cell->color:red"})
      private String importErrorMsg;
  
      /**
       * 岗位信息
       */
      private List<SysPost> sysPostList;
  }
  
  ```

  

### 工具类

> 工具类位于`lihua-common/src/main/java/com/lihua/utils` 下，根据需求可自行修改

#### 加解密

- `HashUtils` Hash加密数据

  **生成加密数据** `HashUtils.generateSHA256`

  ``` java
  String text = "xxxxxxxxx"
  String ciphertext = HashUtils.generateSHA256(text);
  ```

  

- `AesUtils` AES对称加密解密

  **使用AES加密**

  ``` java
  String params = "xxx" // 待加密的字符串
  String key = "1111111111111111" // 16位密钥
  // 获取加密后数据
  String encrypted = AesUtils.encrypt(params, key);
  ```

  **使用AES解密**

  ``` java
  String encrypted = "xxx" // 加密后的数据
  String key = "1111111111111111" // 16位密钥（与加密密钥相同）  
  // 获得原数据
  String data = AesUtils.decryptToString(encrypted, SysBaseEnum.DEFAULT_PASSWORD_KEY.getValue())
  ```

  **生成AES密钥**`AesUtils.generateKey`

  密钥需进行单独保存，加密解密需用到相同密钥

  ``` java
  // 获取 AES 密钥
  SecretKey secretKey = AesUtils.generateKey();
  ```

  **使用AES加密（byte[] 和 SecretKey）** `AesUtils.encrypt`

  ``` java
  // 待加密文本
  String text = "xxxxxxxxx";
  // 使用Base64 decode将字符串转为byte数组
  byte[] decode = Base64.getDecoder().decode(text);
  // 获取 AES 密钥
  SecretKey secretKey = AesUtils.generateKey();
  // 使用 AES 密钥加密
  String ciphertext = AesUtils.encrypt(decode, secretKey);
  ```

  **使用AES解密（密文和SecretKey）** `AesUtils.decrypt` `AesUtils.decryptToString`

  ``` java
  // 加密时的AES密钥
  SecretKey secretKey;
  
  // 传入密文和加密时的密钥进行解密
  // 解密为 byte 数组
  byte[] res = AesUtils.decrypt(ciphertext, secretKey);
  // 解密为字符串
  String res = AesUtils.decryptToString(ciphertext, secretKey);
  ```

  

- `RasUtils` RAS非对称加密解密

  **生成公私钥** `RasUtils.generateKey`

  ``` java
  // 生成RAS加密公私钥
  RasModel rasModel = RasUtils.generateKey();
  ```

  >  RasModel `RasUtils.generateKey` 返回的对象，包含公钥、私钥、私钥的密钥（生成过程中会对私钥再次使用AES加密）

  ```java
  @Data
  @AllArgsConstructor
  public class RasModel {
      /**
       * 公钥
       */
      private String publicKey;
  
      /**
       * 私钥
       */
      private String privateKey;
  
      /**
       * 私钥的密钥
       */
      private SecretKey privateKeySecretKey;
  }
  ```
  **使用公钥加密** `RasUtils.encrypt`

  > 前端也提供对应的AES公钥加密方法，系统密码相关业务是由后端生成公私钥，前端利用公钥加密，后端使用私钥解密。

  ``` java
  // 待加密文本
  String text = "xxxxxxxxx";
  // 使用Base64 decode将字符串转为byte数组
  byte[] decode = Base64.getDecoder().decode(text);
  // 生成 RAS 加密公私钥
  RasModel rasModel = RasUtils.generateKey();
  // 使用 RAS 密钥加密
  String ciphertext = encrypt(decode, rasModel);
  ```

  **使用私钥解密** `RasUtils.decrypt`

  ``` java
  // 加密时的 RasModel 对象
  RasModel rasModel;
  // 使用 RAS 解密
  String res = RasUtils.decrypt(ciphertext, rasModel);
  ```



- `HashUtils` 对字符串进行hash编码

  ``` java
  // 待编码数据
  String data = "xxx";
  // hash编码后数据
  String hash = HashUtils.generateSHA256(data)
  ```

  

#### 日期

- `DateUtils.now` 获取当前日期时间

  ``` java
  LocalDateTime now = DateUtils.now();
  ```

- `DateUtils.nowDate` 获取当前日期

  ``` java
  LocalDate now = DateUtils.nowDate();
  ```

- `DateUtils.nowTimeStamp` 获取当前时间戳

  ``` java
  long timeStamp = DateUtils.nowTimeStamp();
  ```

- `DateUtils.timeStamp` 获取指定时间的时间戳

  ``` java
  LocalDateTime now = DateUtils.now();
      
  long timeStamp = DateUtils.nowTimeStamp(now);
  ```

- `DateUtils.format` 格式化时间

  ``` java
  LocalDateTime now = DateUtils.now();
  
  String format = DateUtils.format(now, "yyyy-MM-dd HH:mm:ss");
  ```

- `DateUtils.format` 格式化日期

  ``` java
  LocalDate now = DateUtils.nowDate();
  
  String format = DateUtils.format(now, "yyyy-MM-dd");
  ```

- `DateUtils.differenceMinute` 两时间相差分钟数

  ``` java
  LocalDateTime dateTime1 = DateUtils.now();
  LocalDateTime dateTime2 = DateUtils.now();
  
  long timeStamp = DateUtils.differenceMinute(dateTime1, dateTime2);
  ```

#### 字典

- `DictUtils.getLabel` 通过字典类型和字典值获取字典label

  ``` java
  // 传入字典类型和字典值获取label
  String label = DictUtils.getLabel(dictTypeCode, dictValue);
  ```

- `DictUtils.setDictCache` 设置字典缓存

  ``` java
  // 传入字典类型和字典数据集合，设置缓存
  DictUtils.setDictCache(dictTypeCode,sysDictDataVOList);
  ```

- `DictUtils.removeDictCache` 删除字典缓存

  ``` java
  // 传入字典类型，删除缓存
  DictUtils.removeDictCache(sysDictData.getDictTypeCode());
  ```

- `DictUtils.getDictData` 获取缓存的字典数据

  ``` java
  // 传入字典类型，获取字典数据对象集合
  List<SysDictDataVO> dictData = DictUtils.getDictData(dictTypeCode);
  ```

- `DictUtils.resetCacheDict` 重新缓存字典数据

  ``` java
  // 传入字典类型，重新缓存该类型的字典数据
  DictUtils.resetCacheDict(dictTypeCode)
  ```

#### Excel导入导出

> Excel导入导出依赖于开源项目 `myexcel` 详细文档请参阅 https://github.com/liaochong/myexcel/wiki/%E9%A6%96%E9%A1%B5

- `ExcelUtils.excelExport` Excel导出

  ``` java
  // 数据库中查询出待导出集合
  List<Test> testList = new ArrayList<>();
  // 调用ExcelUtils导出。传入数据集合、对应实体类class、导出文件名称（未指定文件后缀会自动添加.xlsx）
  // 返回导出文件路径，可通过该路径进行文件下载
  String Path = ExcelUtils.excelExport(testList, Test.class, "导出文件名称");
  ```
  
- `ExcelUtils.importExport` Excel导入

  ``` java
  // controller 使用 MultipartFile 接收导入文件
  MultipartFile file;
  // 调用ExcelUtils导入，返回解析出的对应类型的集合。传入MultipartFile，对应实体类class，表格开始读取行数（0：第二行开始读取，1：第三行开始读取，根据是否多级表头进行配置）
  List<Test> sysUserVOS = ExcelUtils.importExport(file, Test.class, 0);
  ```

**常用注解及自定义转化**

> myexcel 导入导出依赖于对应实体类的相关注解，下面列出常用注解，更多用法请参阅官方文档！
>
> myexcel 提供了自定义转化，比如数据库中存储的为字典值，导出后需要显示翻译后的结果，使用了自定义转化完成
>
> 官方注解文档：https://github.com/liaochong/myexcel/wiki/Annotation

- `@ExcelModel` 可指定sheet名称等信息，注解打在实体类上

- `@ExcelColumn`  描述导出的字段属性，注解打在属性上

- `@ExcelWriteConverterDictTypeCode` 这是利用自定义转化编写的自定义注解，作用是传入对应的字典类型，导出时会自动翻译为label（导入时请在程序中自行判断处理）。该注解需搭配`@ExcelColumn(writeConverter = SysDictWriteConverter.class)` 进行使用

  ``` java
  @EqualsAndHashCode(callSuper = true)
  @ExcelModel(sheetName = "岗位信息",includeAllField = false)
  @Data
  public class SysPostVO extends SysPost {
  
      // 所属部门名称
      @ExcelColumn(order = 2, index = 2, title = "*所属部门", width = 12)
      private String deptName;
  
      /**
       * excel 批量导入异常说明
       * 数据导入后，因异常无法入库的数据错误描述
       */
      @ExcelColumn(order = 9, title = "系统提示", style = {"cell->color:red"})
      private String importErrorMsg;
  }
  
  ```

  ``` java
  @EqualsAndHashCode(callSuper = true)
  @Data
  public class SysPost extends BaseEntity {
  
      /**
       * 主键
       */
      @TableId(type = IdType.ASSIGN_ID)
      private String id;
  
      /**
       * 部门主键
       */
      @NotNull(message = "请选择所属部门")
      private String deptId;
  
      /**
       * 部门编码
       */
      @NotNull(message = "请选择所属部门")
      private String deptCode;
  
      /**
       * 岗位名称
       */
      @ExcelColumn(index = 0, title = "*岗位名称", width = 12)
      @NotNull(message = "请输入岗位名称")
      private String name;
  
      /**
       * 岗位编码
       */
      @ExcelColumn(order = 1, index = 1, title = "*岗位编码", width = 12)
      @NotNull(message = "请输入岗位编码")
      private String code;
  
      /**
       * 岗位排序
       */
      @NotNull(message = "请输入岗位排序")
      private Integer sort;
  
      /**
       * 岗位状态
       */
      @ExcelColumn(order = 3, index = 3, title = "*状态", writeConverter = SysDictWriteConverter.class)
      @ExcelWriteConverterDictTypeCode("sys_status")
      @NotNull(message = "请选择状态")
      private String status;
  
      /**
       * 岗位负责人姓名
       */
      @ExcelColumn(order = 4, index = 4, title = "负责人")
      private String manager;
  
      /**
       * 岗位联系电话
       */
      @Pattern(regexp = "^1[3-9]\\d{9}$",
              message = "请输入正确的手机号码")
      @ExcelColumn(order = 5, index = 5, title = "联系电话", width = 6)
      private String phoneNumber;
  
      /**
       * 岗位邮件
       */
      @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
              message = "请输入正确的邮箱地址")
      @ExcelColumn(order = 6, index = 6, title = "邮箱", width = 6)
      private String email;
  
      /**
       * 岗位传真号码
       */
      @ExcelColumn(order = 7, index = 7, title = "传真", width = 6)
      private String fax;
  
      /**
       * 备注
       */
      @ExcelColumn(order = 8, index = 8, title = "备注", width = 6)
      private String remark;
  
      /**
       * 逻辑删除标志
       */
      private String delFlag;
  }
  ```

- 自定义转化

  > 通过指定`@ExcelColumn` 中的 `writeConverter` 可实现自定义转化，可实现数据库保存编码，导出为名称的效果。
  >
  > （导入无效，考虑到入库的严谨性，导入需要在程序中进行业务判断）

  1. 在 `lihua-common/src/main/java/com/lihua/utils/excel/annotation` 目录下新建自定义注解

     ``` java
     // 字典翻译的自定义转化注解
     @Retention(RetentionPolicy.RUNTIME)
     @Target({ElementType.FIELD})
     public @interface ExcelWriteConverterDictTypeCode {
         String value();
     }
     ```

  2. 在 `lihua-common/src/main/java/com/lihua/utils/excel/converter` 目录下新建自定义转化实现

     需要实现 `CustomWriteConverter` 接口，通过 `customWriteContext.getField().getAnnotation()` 可获取到自定义注解及参数，可根据业务进行翻译等处理，最后将结果返回，返回的结果即为导出后显示的内容。

     ``` java
     // 字典翻译的自定义转化实现
     public class SysDictWriteConverter implements CustomWriteConverter<String, String> {
     
         @Override
         public String convert(String dictValue, CustomWriteContext customWriteContext) {
     
             // 获取自定义注解
             ExcelWriteConverterDictTypeCode annotation = customWriteContext.getField().getAnnotation(ExcelWriteConverterDictTypeCode.class);
     
             if (annotation == null) {
                 return null;
             }
     
             // 通过注解参数获取字典类型编码
             String dictTypeCode = annotation.value();
     
             // 通过字典类型编码和字典value获取label
             if (StringUtils.hasText(dictTypeCode)) {
                 String label = DictUtils.getLabel(dictTypeCode, dictValue);
     
                 if (StringUtils.hasText(label)) {
                     return label;
                 }
     
                 return dictValue;
             }
     
             return dictValue;
         }
     }
     ```

  3. 使用自定义转化

     在 `@ExcelColumn` 注解上指定 `writeConverter` 为自定义转化实现，并打上自定义注解，传入指定参数即可。

     ``` java
     /**
      * 岗位状态
      */
     @ExcelColumn(order = 3, index = 3, title = "*状态", writeConverter = SysDictWriteConverter.class)
     @ExcelWriteConverterDictTypeCode("sys_status")
     @NotNull(message = "请选择状态")
     private String status;
     ```

#### Json转换

- `JsonUtils.toJson`  对象转为 json

  ``` java
  Object o;
  String json = JsonUtils.toJson(o);
  ```

- `JsonUtils.toJsonOrCanonicalName`  对象转为 json，无法转换的返回全限定名

  ``` java
  Object o;
  String json = JsonUtils.toJsonOrCanonicalName(o);
  ```

- `JsonUtils.toJsonIgnoreNulls`  对象转为 json，并忽略 null 值

  ``` java
  Object o;
  String json = JsonUtils.toJsonIgnoreNulls(o);
  ```

- `JsonUtils.excludeJsonKey`  排除json中指定的key

  ``` java
  String orinigJson;
  String json = JsonUtils.excludeJsonKey(orinigJson);
  ```

- `JsonUtils.toObject`  json转java对象

  ``` java
  String json;
  Test test = JsonUtils.toObject(json, Test.class)
  ```

- `JsonUtils.isJson`  判断字符串是否为json

  判断字符串是否为json，不为 json 时抛出 `JsonProcessingException ` 异常

  ``` java
  String json;
  JsonUtils.isJson(json);
  ```

- `JsonUtils.deepCopy` 对象进行深拷贝

  ``` java
  T item;
  T copyItem = JsonUtils.deepCopy(item);
  ```

- `JsonUtils.deepCopyList` 集合进行深拷贝

  ``` java
  List<T> itemList;
  List<T> copyItemList = JsonUtils.deepCopy(itemList);
  ```

#### Security相关

- `JwtUtils` jwt相关工具类

  **对字符串进行jwt加密** `JwtUtils.create`

  ``` java
  String str;
  String jwt = JwtUtils.create(str);
  ```

  **对字符串进行jwt解密** `JwtUtils.decode` 

  ``` java
  String jwt;
  String str = JwtUtils.decode(jwt);
  ```

  **验证jwt是否合法** `JwtUtils.verify`

  jwt不合法时抛出异常

  ``` java
  String jwt;
  JwtUtils.decode(jwt);
  ```

- `LoginUserContext` 获取当前登录用户上下文

  > `重要的全局功能-获取当前登录用户上下文` 中已描述，请前往查看

- `LoginUserManager` 登录用户管理类

  **通过token获取用户信息** `LoginUserManager.getLoginUser`

  ``` java
  String token;
  LoginUser loginUser = LoginUserManager.getLoginUser(token);
  ```

  **小于阈值时刷新用户登录剩余时间** `LoginUserManager.verifyLoginUserCache`

  ``` java
  LoginUserManager.verifyLoginUserCache();
  ```

  **重新设置用户Redis缓存** `LoginUserManager.setLoginUserCache`

  ``` java
  LoginUser loginUser;
  String cacheKey = LoginUserManager.setLoginUserCache(loginUser);
  ```

  **删除用户Redis缓存** `LoginUserManager.removeLoginUserCache`

  ``` java
  String token;
  LoginUserManager.removeLoginUserCache(token);
  ```

  **通过Redis缓存Key获取用户id** `LoginUserManager.getUserIdByCacheKey`

  ``` java
  // 使用 Jwt 对 token 解密后获取 cacheKey
  String cacheKey = JwtUtils.decode(token);
  String userId = LoginUserManager.getUserIdByCacheKey(cacheKey);
  ```

  **通过Redis缓存Key获取用户登录时间戳** `LoginUserManager.getLoginTimestampByCacheKey`

  ``` java
  long timeStamp = LoginUserManager.getLoginTimestampByCacheKey(cacheKey);
  ```

  **通过Redis缓存Key获取用户登录时间** `LoginUserManager.getLoginTimeByCacheKey`

  ``` java
  LocalDateTime dateTime = LoginUserManager.getLoginTimeByCacheKey(cacheKey);
  ```

- `SecurityUtils` 安全相关工具类

  **判断密码是否相同** `SecurityUtils.matchesPassword`

  ``` java
  String password = SecurityUtils.decryptGetPassword(pwd);
  String currentPassword;
  // password 应为解密后的明文；currentPassword 为经过 SecurityUtils.encryptPassword加密的密文（直接从数据库中取出的就是）
  boolean b = SecurityUtils.matchesPassword(password, currentPassword)
  ```

  **密码加密** `SecurityUtils.encryptPassword`

  ``` java
  String password = SecurityUtils.decryptGetPassword(pwd);
  // 对明文数据进行加密
  String ciphertext = SecurityUtils.encryptPassword(password);
  ```

  **获取密码加密的RAS公钥** `SecurityUtils.getPasswordPublicKey`

  ``` java
  // 通过一个标识获取公钥。后续解密需要对应的标识
  String requestKey;
  String publickey = SecurityUtils.getPasswordPublicKey(requestKey)
  ```

  **密码解密** `SecurityUtils.decryptGetPassword`

  ``` java
  // 拿到请求标识
  String requestKey;
  // 使用公钥加密的密文
  String ciphertext;
  // 通过请求标识，对密文解密
  String confirmPassword = SecurityUtils.decryptGetPassword(ciphertext, requestKey);
  ```

  **默认密码解密** `SecurityUtils.defaultPasswordDecrypt`

  ``` java
  // 前端加密的默认密码
  String defaultPwd;
  // 对默认密码解密
  String defaultPassword = SecurityUtils.defaultPasswordDecrypt(defaultPwd);
  ```

#### Spring相关

- `SpringUtils.getBean` 非Spring环境下获取SpringBean

  工具类如需要用到SpringBean，又不想通过注入的方法调用，可使用该工具方法

  ``` java
  LihuaConfig lihuaConfig = SpringUtils.getBean(LihuaConfig.class);
  ```

#### SSE相关

- `ServerSentEventsManager.create` 创建一个SSE连接

  ``` java
  // 通过客户端key创建sse连接
  SseEmitter sse = erverSentEventsManager.create(clientKey)
  ```

- `ServerSentEventsManager.close` 关闭指定客户端连接

  ``` java
  // 通过客户端key关闭sse连接
  ServerSentEventsManager.close(clientKey);
  ```

- `ServerSentEventsManager.send` 向客户端推送数据

  ``` java
  String msg = "msg";
  // 向所有客户端推送数据
  ServerSentEventsManager.send(new ServerSentEventsResult<>(ServerSentEventsEnum.SSE_HEART_BEAT, msg))
  // 通过userIds向指定客户端推送消息
  List<String> userIds;
  ServerSentEventsManager.send(userIds, new ServerSentEventsResult<>(ServerSentEventsEnum.SSE_NOTICE, msg));
  // 通过userId向指定客户端推送消息
  String userId;
  ServerSentEventsManager.send(userId, new ServerSentEventsResult<>(ServerSentEventsEnum.SSE_NOTICE, msg));
  ```

  > 为规范SSE推送标准化，使用 `ServerSentEventsResult` 和 `ServerSentEventsEnum` 约束推送格式

  **ServerSentEventsResult**

  维护了推送消息的类型和数据，每次消息推送时使用构造器构建传入此对象

  ``` java
  /**
   * 标准化sse发送数据格式
   * serverSentEventsEnum 表示功能模块
   * data 为发送的数据
   * @param <T>
   */
  
  @Data
  @AllArgsConstructor
  public class ServerSentEventsResult<T> implements Serializable {
  
      @Serial
      private static final long serialVersionUID = 1L;
  
      // 类型枚举
      private ServerSentEventsEnum type;
  
      // 发送数据data
      private T data;
  
  }
  ```

  **ServerSentEventsEnum**

  通过枚举维护了推送的消息类型，算是和前端做的某种约定

  ``` java
  /**
   * sse 消息发送类型枚举
   * 帮助了解发送的消息类型
   */
  @Getter
  @AllArgsConstructor
  public enum ServerSentEventsEnum implements Serializable {
      /**
       * 通知
       */
      SSE_NOTICE,
      /**
       * 保持心跳
       */
      SSE_HEART_BEAT
  }
  ```

#### String相关

- `StringUtils.initialUpperCase` 字符串首字母转为大写

  ``` java
  String str;
  String upperCase = StringUtils.initialUpperCase(str);
  ```

- `StringUtils.initialLowerCase` 字符串首字母转为小写

  ``` java
  String str;
  String lowerCase = StringUtils.initialLowerCase(str);
  ```

#### 树形结构相关

> 传入有树形结构的实体类集合，自动生成树形结构。
>
> 默认树形结构相关字段为：id、parentId、children

> 注意：传入的集合应为可变集合，通过 Arrays.asList("A", "B", "C") 或 List.of("A", "B", "C") 等方法创建的List集合为不可变集合，用了会报错！

- `TreeUtils.buildTree` 构建树形结构

  ``` java
  List<Test> tests;
  // 当实体类树形结构相关字段符合默认值时，直接传入集合即可构建
  List<Test> treeTest = TreeUtils.buildTree(tests);
  // 当实体类树形结构相关字段不符合默认值时，需指定全部字段（首字母大写，因需拼接get、set方法）
  List<Test> treeTest = TreeUtils.buildTree(tests,"Code","ParentCode","Children");
  ```

- `TreeUtils.lambda().buildTree` 仿MybatisPlus Lambda的表达式写法

  ``` java
  // 使用Lambda表达式的写法
  List<Test> tests;
  List<Test> treeTest = TreeUtils.lambda().buildTree(
                  tests,
                  Test::getCode,
                  Test::getParentCode,
                  Test::getChildren,
                  Test::setChildren);
  ```

- `TreeUtils.flattenTree` 将树形结构扁平化

  ``` java
  // tests 为树形结构集合
  List<Test> tests;
  // 当实体类树形结构相关字段符合默认值时，直接传入集合即可进行扁平化
  List<Test> treeTest = TreeUtils.flattenTree(tests);
  // 当实体类树形结构相关字段不符合默认值时，需指定全部字段（首字母大写，因需拼接get、set方法）
  List<Test> treeTest = TreeUtils.flattenTree(tests,"Children");
  ```

- `TreeUtils.lambda().flattenTree` 仿MybatisPlus Lambda的表达式写法

  ``` java
  // 使用Lambda表达式的写法
  // tests 为树形结构集合
  List<Test> tests;
  List<Test> treeTest = TreeUtils.lambda().flattenTree(
      			tests
                  Test::getChildren,
                  Test::setChildren);
  ```

#### Web相关

- `WebUtils.renderJson` 响应json数据到客户端

  ``` java
  WebUtils.renderJson(response, BaseController.error(ResultCodeEnum.RESOURCE_NOT_FOUND_ERROR));
  ```

- `WebUtils.getCurrentRequest` 获取当前请求的 HttpServletRequest

  ``` java
  HttpServletRequest request = WebUtils.getCurrentRequest();
  ```

- `WebUtils.getToken` 从 HttpServletRequest 中获取 token

  ``` java
  HttpServletRequest request = WebUtils.getCurrentRequest();
  String token = WebUtils.getToken(request);
  ```

- `WebUtils.getIpAddress` 获取当前请求的ip地址

  ``` java
  String ip = WebUtils.getIpAddress()
  ```

### 注解

> 仅列出了自定义注解和SpringSecurity的权限校验注解，其他注解请参考对应第三方库的官方文档

#### 日志记录

`@Log` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会记录操作日志

参数

- description：模块描述（必填）
- type：模块类型（必填）
- excludeParams：排除参数（默认为[]）
- recordResult：记录返回结果（默认true）

``` java
@Log(description = "用户登录", type = LogTypeEnum.LOGIN, excludeParams = {"password", "requestKey"}, recordResult = false)
public String login(@RequestBody @Valid CurrentUser currentUser) {
    return success();
}
```

#### 限流

`@RateLimiter` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会进行限流处理

参数

- value：同一请求每秒超过 value 次之后的请求全部拒绝（默认 5）

``` java
@PostMapping("reloadData")
@RateLimiter
public String reloadData() {
    sysAuthenticationService.cacheLoginUserInfo(LoginUserContext.getLoginUser());
    return success();
}

// 该接口每秒只能处理10次，超出的请求全部丢弃
@PostMapping("login")
@RateLimiter(10)
public String login(@RequestBody @Valid CurrentUser currentUser) {
    return success();
}
```

#### 防重复提交

`@PreventDuplicateSubmit` 在需要记录的 `controller` 接口上打上该注解，执行该接口时会检测同一用户再规定时间内是否请求多次，多余请求会拒绝处理

参数

- value：同一用户在 value 时间内只能请求一次（默认 1000 毫秒）
- timeUnit：value 时间单位（默认 TimeUnit.MILLISECONDS）

``` java
// 同一用户1秒内只能访问该接口一次
@PostMapping
@PreventDuplicateSubmit
public String save(@RequestBody @Validated SysDept sysDept) {
    return success(sysDeptService.saveDept(sysDept));
}

// 同一用户1天内只能访问该接口一次
@PostMapping
@PreventDuplicateSubmit(value = 1, timeUnit = TimeUnit.DAYS)
public String save(@RequestBody @Validated SysDept sysDept) {
    return success(sysDeptService.saveDept(sysDept));
}
```

####  权限验证

> 注解由SpringSecurity提供，详情请参考官方文档

`@PreAuthorize("hasRole()")` 在需要记录的 `controller` 接口上打上该注解，有用对应角色的用户才会接受请求

``` java
@PreAuthorize("hasRole('ROLE_admin')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

`@PreAuthorize("hasAnyRole()")` 在需要记录的 `controller` 接口上打上该注解，有用对应任意角色的用户才会接受请求

``` java
@PreAuthorize("hasAnyRole('ROLE_admin','ROLE_common')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

`@PreAuthorize("hasAuthority()")` 在需要记录的 `controller` 接口上打上该注解，有用对应权限的用户才会接受请求

``` java
@PreAuthorize("hasAuthority('system:dept:save')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

`@PreAuthorize("hasAnyAuthority()")` 在需要记录的 `controller` 接口上打上该注解，有用对应任意权限的用户才会接受请求

``` java
@PreAuthorize("hasAnyAuthority('system:dept:save','system:dept:all')")
@PostMapping("updateStatus/{id}/{currentStatus}")
@Log(description = "更新部门状态", type = LogTypeEnum.UPDATE_STATUS)
public String updateStatus(@PathVariable("id") String id,@PathVariable("currentStatus") String currentStatus) {
    return success(sysDeptService.updateStatus(id, currentStatus));
}
```

#### 数据脱敏

**v1.1.2版本新增**

>  数据脱敏中集合类型字段不可设置为**不可变集合**，否则将抛出异常！！！

`@Sensitive` 标记在实体类需要脱敏的字段上，指定脱敏规则即可。可作用于String、List< String >、Set< String >、Map<?, String> 等字段

- type：脱敏规则，由 `DesensitizedTypeEnum` 维护，可自行扩展
- ignoreRoleCodes：忽略角色编码，拥有对应角色的用户不进行数据脱敏

``` java
    /**
     * 手机号码
     */
    @Sensitive(type = DesensitizedTypeEnum.PHONE_NUMBER, ignoreRoleCodes = {})
    @ExcelColumn(order = 4, index = 4, title = "用户信息->手机号码", width = 8)
    private String phoneNumber;
```

`@DeepSensitive` 标记在实体类中需要脱敏的字段上，该字段为一对一的对象，标记`@DeepSensitive` 后会解析此对象中标记 `@Sensitive` 注解的属性

``` java
    /**
     * 标记到对象中，支持List<SysUserVO>、Set<SysUserVO>、Map<String, SysUserVO> 等
     */    
	@DeepSensitive
    private SysUserVO vos;
```

`@ApplySensitive` 应用数据脱敏。只标记 `@Sensitive` 和 `@DeepSensitive` 并不会处理数据脱敏，需要在对应的方法上使用`@ApplySensitive` 后才会对返回值进行拦截处理

``` java
	/**
     * 方法上标记了@ApplySensitive，会对该方法的返回值进行拦截，解析SysUserVO中的 @Sensitive 和 @DeepSensitive 注解
     * 支持 IPage、Collection、Map、数组、对象 五种数据格式
     */ 
	@ApplySensitive
    @Override
    public IPage<SysUserVO> queryPage(SysUserDTO sysUserDTO) {
        IPage<SysUserVO> iPage = new Page<>(sysUserDTO.getPageNum(), sysUserDTO.getPageSize());
		// 中间代码省略 ...
        return iPage;
    }
```



### 定时任务

> 定时任务基于XXL - JOB，调度中心需单独部署。详情请参阅：https://www.xuxueli.com/xxl-job/

**本项目（执行器）application.yml 中对 xxl-job 的配置**

``` yaml
xxl-job:
  # 是否启用定时任务
  enable: false
  # 调度中心部署地址
  adminAddress: http://127.0.0.1:8081/xxl-job-admin
  # 执行器通讯token
  accessToken: default_token
  # 执行器应用名称
  appName: lihua
  # 执行器注册地址
  address:
  # 执行器ip
  ip:
  # 执行器端口号
  port: 0
  # 执行器日志保存目录
  logPath: D:/home/lihua/job-logs
  # 执行器日志保存天数
  logRetentionDays: 30

```

**系统中使用定时任务**

通过`@XxlJob`注解可让XXL-JOB调度中心调用到此方法。（定时任务方法无法获取到用户上下文！（没有登录嘛））

``` java
@Component
@Slf4j
public class SseHeartbeat {

    /**
     * 保持SSE连接，定时向客户端发送数据
     * 通过定时任务定期执行
     */
    @XxlJob("keepHeartbeat")
    public void keepHeartbeat () {
        String name = ServerSentEventsEnum.SSE_HEART_BEAT.name();
        log.info(name);
        ServerSentEventsManager.send(new ServerSentEventsResult<>(ServerSentEventsEnum.SSE_HEART_BEAT, name));
    }
}
```

