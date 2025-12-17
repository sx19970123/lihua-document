# 工具类

> 工具类位于`lihua-common/src/main/java/com/lihua/utils` 下，根据需求可自行修改

## 加解密

### Hash

`HashUtils` Hash加密数据

**生成加密数据** `HashUtils.generateSHA256`

``` java
String text = "xxxxxxxxx"
String ciphertext = HashUtils.generateSHA256(text);
```

`HashUtils` 对字符串进行hash编码

``` java
// 待编码数据
String data = "xxx";
// hash编码后数据
String hash = HashUtils.generateSHA256(data)
```



### AES 加解密

`AesUtils` AES对称加密解密

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

### RAS 加解密

`RasUtils` RAS非对称加密解密

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



## 日期

`DateUtils.now` 获取当前日期时间

``` java
LocalDateTime now = DateUtils.now();
```

`DateUtils.nowDate` 获取当前日期

``` java
LocalDate now = DateUtils.nowDate();
```

`DateUtils.nowTimeStamp` 获取当前时间戳

``` java
long timeStamp = DateUtils.nowTimeStamp();
```

`DateUtils.timeStamp` 获取指定时间的时间戳

``` java
LocalDateTime now = DateUtils.now();
    
long timeStamp = DateUtils.nowTimeStamp(now);
```

`DateUtils.format` 格式化时间

``` java
LocalDateTime now = DateUtils.now();

String format = DateUtils.format(now, "yyyy-MM-dd HH:mm:ss");
```

`DateUtils.format` 格式化日期

``` java
LocalDate now = DateUtils.nowDate();

String format = DateUtils.format(now, "yyyy-MM-dd");
```

`DateUtils.differenceMinute` 两时间相差分钟数

``` java
LocalDateTime dateTime1 = DateUtils.now();
LocalDateTime dateTime2 = DateUtils.now();

long timeStamp = DateUtils.differenceMinute(dateTime1, dateTime2);
```



## 字典

`DictUtils.getLabel` 通过字典类型和字典值获取字典label

``` java
// 传入字典类型和字典值获取label
String label = DictUtils.getLabel(dictTypeCode, dictValue);
```

`DictUtils.setDictCache` 设置字典缓存

``` java
// 传入字典类型和字典数据集合，设置缓存
DictUtils.setDictCache(dictTypeCode,sysDictDataVOList);
```

`DictUtils.removeDictCache` 删除字典缓存

``` java
// 传入字典类型，删除缓存
DictUtils.removeDictCache(sysDictData.getDictTypeCode());
```

`DictUtils.getDictData` 获取缓存的字典数据

``` java
// 传入字典类型，获取字典数据对象集合
List<SysDictDataVO> dictData = DictUtils.getDictData(dictTypeCode);
```

`DictUtils.resetCacheDict` 重新缓存字典数据

``` java
// 传入字典类型，重新缓存该类型的字典数据
DictUtils.resetCacheDict(dictTypeCode)
```


## Json转换

### 对象转Json

`JsonUtils.toJson`  对象转为 json

``` java
Object o;
String json = JsonUtils.toJson(o);
```

`JsonUtils.toJsonOrCanonicalName`  对象转为 json，无法转换的返回全限定名

``` java
Object o;
String json = JsonUtils.toJsonOrCanonicalName(o);
```

`JsonUtils.toJsonIgnoreNulls`  对象转为 json，并忽略 null 值

``` java
Object o;
String json = JsonUtils.toJsonIgnoreNulls(o);
```

### Json 转对象

`JsonUtils.toObject`  json转java对象

``` java
String json;
Test test = JsonUtils.toObject(json, Test.class)
```

### 其他Json操作

`JsonUtils.excludeJsonKey`  排除json中指定的key

``` java
String orinigJson;
String json = JsonUtils.excludeJsonKey(orinigJson);
```

`JsonUtils.isJson`  判断字符串是否为json

判断字符串是否为json，不为 json 时抛出 `JsonProcessingException ` 异常

``` java
String json;
JsonUtils.isJson(json);
```

`JsonUtils.deepCopy` 对象进行深拷贝

``` java
T item;
T copyItem = JsonUtils.deepCopy(item);
```

`JsonUtils.deepCopyList` 集合进行深拷贝

``` java
List<T> itemList;
List<T> copyItemList = JsonUtils.deepCopy(itemList);
```

## Security相关

### JWT

`JwtUtils` jwt相关工具类

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

### 缓存刷新

`LoginUserManager` 登录用户管理类

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

### 用户密码相关

`SecurityUtils` 安全相关工具类

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

## Spring相关

`SpringUtils.getBean` 非Spring环境下获取SpringBean

工具类如需要用到SpringBean，又不想通过注入的方法调用，可使用该工具方法

``` java
LihuaConfig lihuaConfig = SpringUtils.getBean(LihuaConfig.class);
```

## String相关

### 首字母大小写转换

`StringUtils.initialUpperCase` 字符串首字母转为大写

``` java
String str;
String upperCase = StringUtils.initialUpperCase(str);
```

`StringUtils.initialLowerCase` 字符串首字母转为小写

``` java
String str;
String lowerCase = StringUtils.initialLowerCase(str);
```

## 树形结构相关

> 传入有树形结构的实体类集合，自动生成树形结构。
>
> 默认树形结构相关字段为：id、parentId、children

::: warning 注意

传入的集合应为可变集合，通过 Arrays.asList("A", "B", "C") 或 List.of("A", "B", "C") 等方法创建的List集合为不可变集合，用了会报错

:::

### 构建树形结构

`TreeUtils.buildTree` 构建树形结构

``` java
List<Test> tests;
// 当实体类树形结构相关字段符合默认值时，直接传入集合即可构建
List<Test> treeTest = TreeUtils.buildTree(tests);
// 当实体类树形结构相关字段不符合默认值时，需指定全部字段（首字母大写，因需拼接get、set方法）
List<Test> treeTest = TreeUtils.buildTree(tests,"Code","ParentCode","Children");
```

`TreeUtils.lambda().buildTree` 仿MybatisPlus Lambda的表达式写法

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

### 将树形结构扁平化

`TreeUtils.flattenTree` 将树形结构扁平化

``` java
// tests 为树形结构集合
List<Test> tests;
// 当实体类树形结构相关字段符合默认值时，直接传入集合即可进行扁平化
List<Test> treeTest = TreeUtils.flattenTree(tests);
// 当实体类树形结构相关字段不符合默认值时，需指定全部字段（首字母大写，因需拼接get、set方法）
List<Test> treeTest = TreeUtils.flattenTree(tests,"Children");
```

`TreeUtils.lambda().flattenTree` 仿MybatisPlus Lambda的表达式写法

``` java
// 使用Lambda表达式的写法
// tests 为树形结构集合
List<Test> tests;
List<Test> treeTest = TreeUtils.lambda().flattenTree(
    			tests
                Test::getChildren,
                Test::setChildren);
```



## Web相关

### 重写响应

`WebUtils.renderJson` 响应json数据到客户端

``` java
WebUtils.renderJson(response, BaseController.error(ResultCodeEnum.RESOURCE_NOT_FOUND_ERROR));
```

### 获取当前请求 HttpServletRequest

`WebUtils.getCurrentRequest` 获取当前请求的 HttpServletRequest

``` java
HttpServletRequest request = WebUtils.getCurrentRequest();
```

### 获取当前请求Token

`WebUtils.getToken` 从 HttpServletRequest 中获取 token

``` java
HttpServletRequest request = WebUtils.getCurrentRequest();
String token = WebUtils.getToken(request);
```

### 获取当前请求Ip

`WebUtils.getIpAddress` 获取当前请求的ip地址

``` java
String ip = WebUtils.getIpAddress()
```

### 获取当前请求归属地

`WebUtils.getRegion` 传入ip地址，返回ip所在的归属地

``` java
String region = WebUtils.getRegion(ip)
```

