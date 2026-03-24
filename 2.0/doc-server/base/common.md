# 公共模块

公共模块定义了被多个模块引用的公共内容，包含通用异常码枚举、通用异常、通用返回对象、通用工具类等。一般来说 `lihua-common` 模块不能依赖其他模块，否则会有循环依赖风险。



## 统一返回

``` java
SUCCESS (200,"成功"),
PARAMS_ERROR(400,"参数异常"),
AUTHENTICATION_EXPIRED(401,"身份验证过期，请重新登录"),
PARAMS_MISSING(402,"参数缺失或不完整"),
ACCESS_ERROR (403,"用户权限不足"),
RESOURCE_NOT_FOUND_ERROR(404,"请求的资源不存在"),
REQUEST_METHOD_ERROR(405,"请求方法异常"),
ACCESS_EXPIRED_ERROR (406,"请求资源权限过期"),
IP_ILLEGAL_ERROR(407, "暂时无法为该地区提供服务"),
ERROR (500,"业务异常"),
FILE_ERROR (501,"附件处理异常"),
SERVER_BAD_ERROR (503,"服务不可用"),
MAX_UPLOAD_SIZE_EXCEEDED_ERROR (504,"上传的附件超过了允许的最大大小限制"),
SERVER_UNAVAILABLE (505,"服务器维护中"),
CAPTCHA_ERROR(506,"验证码错误"),
SENSITIVE_ERROR(507,"数据脱敏异常"),
WEBSOCKET_SEND_MSG_ERROR (509,"websocket发送消息异常"),
EXCEL_IMPORT_ERROR (510,"Excel导入异常");
```



## 全局异常

### BaseException

基础异常，业务层面的自定义异常可继承此异常，可额外传入 `ResultCodeEnum` 对象，进行统一的错误码控制

``` java
/**
 * 基础异常，业务中自定义异常需要继承此异常
 * web模块会进行统一捕获并响应到客户端
 */
@Getter
public class BaseException extends RuntimeException {

    /**
     * 异常枚举
     */
    private final ResultCodeEnum resultCodeEnum;

    /**
     * 抛出异常时附加的数据
     */
    private final Object data;

    public BaseException(ResultCodeEnum resultCodeEnum, Object data) {
        super(resultCodeEnum.getDefaultMsg());
        this.resultCodeEnum = resultCodeEnum;
        this.data = data;
    }

    public BaseException(ResultCodeEnum resultCodeEnum, String message, Object data) {
        super(message);
        this.resultCodeEnum = resultCodeEnum;
        this.data = data;
    }
}
```

### ServiceException

通用业务异常，没有指定具体异常时，可抛出此异常，状态码为 `500`

``` java
/**
 * 通用服务异常
 */
public class ServiceException extends BaseException {

    public ServiceException() {
        super(ResultCodeEnum.ERROR, null);
    }

    public ServiceException(String message) {
        super(ResultCodeEnum.ERROR, message, null);
    }

    public ServiceException(String message, Object data) {
        super(ResultCodeEnum.ERROR, message, data);
    }
}
```



## 业务模型

### 统一响应对象

定义了 `controller` 中的统一响应模型，相见 [controller](/2.0/doc-server/standard/controller#统一返回方式)

###  桥接模型

桥接模型定义在 `com/lihua/common/model/bridge` 中，主要作用为当两个业务模块需要进行方法调用时，无法直接进行maven依赖，使用 `ApplicationEventPublisher` 与 `@EventListener` 组合可跨模块调用，此方式需要一个公共对象作为参数，此对象在桥接模型中进行维护。



## 全局工具

`com/lihua/common/utils` 定义了全局工具类



### 集合工具类

#### getRepeatItem（获取集合中的重复元素）

``` java
Set<Integer> repeat = CollectionUtils.getRepeatItem(list);
```

- **参数**：`collection` - 待处理的集合
- **返回值**：`Set<T>` - 集合中所有重复出现的元素（去重后的结果）
- **说明**：通过分组统计每个元素出现次数，筛选出出现次数大于 1 的元素



### 加密解密工具类

#### encrypt（AES加密）

``` java
String encrypt = AesUtils.encrypt(input, secretKey);
```

**参数**：

- `input` - 被加密的内容
- `secretKey` - 密钥（16位字符串）

**返回值**：`String` - BASE64编码后的密文

**说明**：使用 AES 模式加密，并对结果进行 Base64 编码



#### decryptToString（AES解密）

``` java
String result = AesUtils.decryptToString(ciphertext, secretKey);
```

**参数**：

- `ciphertext` - 密文（Base64编码）
- `secretKey` - 密钥（16位字符串）

**返回值**：`String` - 解密后的字符串

**说明**：先进行 Base64 解码，再使用 AES 模式解密；若密文为空则直接返回原值



### 时间日期工具类

#### now（获取当前时间）

```java
LocalDateTime now = DateUtils.now();
```

- 参数：无
- 返回值：LocalDateTime 当前时间
- 说明：获取系统当前时间（包含时分秒）

#### nowDate（获取当前日期）

```java
LocalDate today = DateUtils.nowDate();
```

- 参数：无
- 返回值：LocalDate 当前日期
- 说明：获取系统当前日期（不包含时间）

#### nowTimeStamp（获取当前时间戳）

```java
long timestamp = DateUtils.nowTimeStamp();
```

- 参数：无
- 返回值：long 当前时间戳（毫秒）
- 说明：获取当前系统时间的毫秒级时间戳

#### fromTimestamp（时间戳转为LocalDateTime）

```java
LocalDateTime dateTime = DateUtils.fromTimestamp(1711252800000L);
```

- 参数：timestamp - 时间戳（毫秒）
- 返回值：LocalDateTime
- 说明：将毫秒时间戳转换为本地时间

#### timeStamp（LocalDateTime转为时间戳）

```java
long ts = DateUtils.timeStamp(LocalDateTime.now());
```

- 参数：localDateTime - 时间对象
- 返回值：long 时间戳（毫秒）
- 说明：将 LocalDateTime 转换为毫秒时间戳

#### format（时间格式化）

```java
String dateTimeStr = DateUtils.format(LocalDateTime.now());
```

- 参数：localDateTime - 时间对象
- 返回值：String 格式化后的时间字符串
- 说明：将时间格式化为 yyyy-MM-dd HH:mm:ss

#### format（日期格式化）

```java
String dateStr = DateUtils.format(LocalDate.now());
```

- 参数：localDate - 日期对象
- 返回值：String 格式化后的日期字符串
- 说明：将日期格式化为 yyyy-MM-dd

#### parseDateTime（格式化时间转为LocalDateTime）

```java
LocalDateTime parsed = DateUtils.parseDateTime("2026-03-24 12:00:00");
```

- 参数：datetime - 时间字符串（yyyy-MM-dd HH:mm:ss）
- 返回值：LocalDateTime
- 说明：将时间字符串解析为 LocalDateTime

#### parseDate（格式化日期转为LocalDate）

```java
LocalDate parsed = DateUtils.parseDate("2026-03-24");
```

- 参数：date - 日期字符串（yyyy-MM-dd）
- 返回值：LocalDate
- 说明：将日期字符串解析为 LocalDate

#### differenceMinute（计算分钟差）

```java
long minutes = DateUtils.differenceMinute(
    LocalDateTime.now().minusHours(1),
    LocalDateTime.now()
);
```

- 参数：startDateTime - 开始时间，endDateTime - 结束时间
- 返回值：long 时间差（分钟）
- 说明：计算两个时间之间的分钟差值

### Json序列化工具类

#### toJson（对象转Json）

```java
String json = JsonUtils.toJson(user);
```

- 参数：data - 任意对象
- 返回值：String JSON字符串
- 说明：将对象转换为JSON字符串，要求对象具备getter方法或使用@JsonAutoDetect注解

#### toJsonIgnoreNulls（对象忽略null转Json）

```java
String json = JsonUtils.toJsonIgnoreNulls(user);
```

- 参数：data - 任意对象
- 返回值：String JSON字符串
- 说明：将对象转换为JSON字符串，并忽略null值、空集合和空字符串

#### toJsonOrCanonicalName（对象忽略null转json，无法转换使用权限定名）

```java
String json = JsonUtils.toJsonOrCanonicalName(user);
```

- 参数：data - 任意对象
- 返回值：String JSON字符串或类全限定名
- 说明：对象无法序列化时返回类全限定名，同时忽略null值

#### excludeJsonKey（转为Json忽略指定Key）

```java
String result = JsonUtils.excludeJsonKey(json, Arrays.asList("password", "token"));
```

- 参数：json - JSON字符串，excludeKeys - 需要排除的key集合
- 返回值：String 处理后的JSON字符串
- 说明：递归移除JSON中指定的key，适用于敏感字段过滤

#### toObject（Json转对象）

```java
User user = JsonUtils.toObject(json, User.class);
```

- 参数：json - JSON字符串，clazz - 目标对象类型
- 返回值：T 目标对象
- 说明：将JSON字符串反序列化为指定类型对象

#### toArrayObject（Json转List集合）

```java
List<User> list = JsonUtils.toArrayObject(json, User.class);
```

- 参数：json - JSON字符串，clazz - 集合元素类型
- 返回值：List\<T\> 对象集合
- 说明：将JSON数组字符串转换为指定类型的集合对象

#### isJson（判断是否为Json）

```java
JsonUtils.isJson(json);
```

- 参数：json - JSON字符串
- 返回值：无
- 说明：校验字符串是否为合法JSON，非法时会抛出异常

#### deepCopy（深拷贝）

```java
User copy = JsonUtils.deepCopy(user);
```

- 参数：item - 待拷贝对象
- 返回值：T 拷贝后的新对象
- 说明：通过JSON序列化实现对象深拷贝，失败时抛出业务异常



### Spring 工具类

#### getBean（获取Beam）

```java
UserService userService = SpringUtils.getBean(UserService.class);
```

- 参数：clazz - 需要获取的Bean类型
- 返回值：T Spring容器中的Bean实例
- 说明：从Spring容器中获取指定类型的Bean，适用于非Spring管理的类中调用



### Spring 字符串处理工具类

#### initialUpperCase（首字母大写）

```java
String result = StringUtils.initialUpperCase("hello");
```

- 参数：str - 原始字符串
- 返回值：String 处理后的字符串
- 说明：将字符串首字母转换为大写，若字符串为空或无内容则原样返回

#### initialLowerCase（首字母小写）

```java
String result = StringUtils.initialLowerCase("Hello");
```

- 参数：str - 原始字符串
- 返回值：String 处理后的字符串
- 说明：将字符串首字母转换为小写，若字符串为空或无内容则原样返回

### 树型结构工具类

#### lambda（类MyBatis-Plus方式构建树）

```java
LambdaTreeUtils utils = TreeUtils.lambda();
```

- 参数：无
- 返回值：LambdaTreeUtils
- 说明：获取基于Lambda表达式的树构建工具实例（链式调用方式）

#### buildTree（构建树）

```java
List<Menu> tree = TreeUtils.buildTree(list);
```

- 参数：list - 原始集合（需包含id、parentId字段）
- 返回值：List\<T\> 树形结构集合
- 说明：根据默认字段（id、parentId、children）将集合构建为树形结构

#### buildTree（自定义字段构建树）

```java
List<Menu> tree = TreeUtils.buildTree(list, "id", "pid", "children");
```

- 参数：list - 原始集合，propKeyName - id字段名，propParentKeyName - 父id字段名，propChildrenName - 子节点字段名
- 返回值：List\<T\> 树形结构集合
- 说明：根据自定义字段名称构建树形结构

#### flattenTree（扁平化树型结构）

```java
List<Menu> flat = TreeUtils.flattenTree(tree);
```

- 参数：list - 树形结构集合
- 返回值：List\<T\> 扁平化集合
- 说明：将树形结构扁平化为普通集合，默认子节点字段为children

#### flattenTree（自定义字段扁平化树型结构）

```java
List<Menu> flat = TreeUtils.flattenTree(tree, "children");
```

- 参数：list - 树形结构集合，propChildrenName - 子节点字段名
- 返回值：List\<T\> 扁平化集合
- 说明：根据指定子节点字段进行树结构扁平化

### Web工具类

#### renderJson（写入Http响应）

```java
WebUtils.renderJson("{\"code\":200,\"msg\":\"success\"}");
```

- 参数：json - JSON字符串
- 返回值：无
- 说明：将JSON数据写入HTTP响应中，设置状态码为200并指定编码为UTF-8

#### getCurrentRequest（获取当前HttpServletRequest）

```java
HttpServletRequest request = WebUtils.getCurrentRequest();
```

- 参数：无
- 返回值：HttpServletRequest
- 说明：获取当前线程绑定的HTTP请求对象

#### getCurrentResponse（获取当前HttpServletResponse）

```java
HttpServletResponse response = WebUtils.getCurrentResponse();
```

- 参数：无
- 返回值：HttpServletResponse
- 说明：获取当前线程绑定的HTTP响应对象

#### getClientType（获取当前客户端类型）

```java
String clientType = WebUtils.getClientType();
```

- 参数：无
- 返回值：String 客户端类型
- 说明：从请求头中获取Client-Type，通常用于区分web、app、wechat_mp等客户端
