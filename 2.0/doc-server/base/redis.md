# Redis

系统Redis客户端为 `redisson` ，提供了基础的Redis操作。



## 配置

`lihua-admin` 下 `application-dev.yml（开发）` 配置文件可对Redisson进行配置

``` yaml
spring:
  redis:
    redisson:
      config: |
        singleServerConfig:
          address: "redis://127.0.0.1:6379"
          database: 0
          # 命令超时时间
          timeout: 3000
          # 连接超时时间
          connectTimeout: 10000
          # 连接池最大连接数
          connectionPoolSize: 64
          # 最小空闲连接数
          connectionMinimumIdleSize: 10
        # 自定义序列化器
        codec: !<com.lihua.redis.config.TypedRedissonJsonCodec> {}
```

其中 codec 指向了 `TypedRedissonJsonCodec` 自定义序列化器，`TypedRedissonJsonCodec` 在IDEA中显示灰色（没有被调用）但不可删除！

## 缓存

### setCacheObject

```java
redisCache.setCacheObject("user:1", user);
```

- 参数：key - 缓存key，value - 缓存对象
- 返回值：无
- 说明：缓存单个对象数据到Redis（无过期时间）

### setCacheObject

```java
redisCache.setCacheObject("user:1", user, Duration.ofMinutes(30));
```

- 参数：key - 缓存key，value - 缓存对象，duration - 过期时间
- 返回值：无
- 说明：缓存单个对象数据并设置过期时间

### setCacheList

```java
redisCache.setCacheList("user:list", userList);
```

- 参数：key - 缓存key，valueList - 集合数据
- 返回值：无
- 说明：缓存List集合数据，会先清空原有数据再写入

### setCacheMap

```java
redisCache.setCacheMap("user:map", userMap);
```

- 参数：key - 缓存key，map - Map集合
- 返回值：无
- 说明：缓存整个Map数据，会覆盖原有数据

### setCacheMapItem

```java
redisCache.setCacheMapItem("user:map", "1", user);
```

- 参数：key - 缓存key，mapKey - Map中的key，mapValue - Map中的值
- 返回值：无
- 说明：向Map缓存中添加或更新单条数据

### getCacheMapItem

```java
User user = redisCache.getCacheMapItem("user:map", "1", User.class);
```

- 参数：key - 缓存key，mapKey - Map中的key，clazz - 返回对象类型
- 返回值：T 对象
- 说明：获取Map中指定key的数据并转换为指定类型

### removeMapItem

```java
redisCache.removeMapItem("user:map", "1");
```

- 参数：key - 缓存key，mapKey - Map中的key
- 返回值：无
- 说明：删除Map中指定key的数据

### getCacheObject

```java
User user = redisCache.getCacheObject("user:1", User.class);
```

- 参数：key - 缓存key，clazz - 返回对象类型
- 返回值：T 对象
- 说明：根据key获取缓存对象，并转换为指定类型

### getCacheList

```java
List<User> list = redisCache.getCacheList("user:list", User.class);
```

- 参数：key - 缓存key，clazz - 集合元素类型
- 返回值：List\<T\> 集合
- 说明：获取List缓存并转换为指定类型集合

### getCacheMap

```java
Map<String, User> map = redisCache.getCacheMap("user:map", User.class);
```

- 参数：key - 缓存key，clazz - Map value类型
- 返回值：Map\<String, T\>
- 说明：获取Map缓存并转换为指定类型

### keys

```java
Set<String> keys = redisCache.keys("user:");
```

- 参数：prefix - key前缀
- 返回值：Set\<String\> key集合
- 说明：根据前缀匹配获取Redis中的key集合

### keys - 全部

```java
Set<String> keys = redisCache.keys();
```

- 参数：无
- 返回值：Set\<String\> key集合
- 说明：获取Redis中所有key

### scanKeys

```java
Set<String> keys = redisCache.scanKeys("user:*");
```

- 参数：pattern - 匹配规则
- 返回值：Set\<String\> key集合
- 说明：按指定规则扫描匹配Redis中的key

### getExpireMinutes

```java
Long minutes = redisCache.getExpireMinutes("user:1");
```

- 参数：key - 缓存key
- 返回值：Long 剩余过期时间（分钟）
- 说明：获取key剩余过期时间，-1表示永不过期，-2表示不存在

### setExpire

```java
redisCache.setExpire("user:1", Duration.ofMinutes(10));
```

- 参数：key - 缓存key，duration - 过期时间
- 返回值：无
- 说明：为指定key设置过期时间

### delete

```java
redisCache.delete("user:1");
```

- 参数：key - 缓存key
- 返回值：Boolean 是否删除成功
- 说明：删除指定key的缓存数据

### delete - 多个key

```java
redisCache.delete("user:1", "user:2");
```

- 参数：keys - 缓存key数组
- 返回值：Long 删除数量
- 说明：批量删除多个key

### delete - 集合

```java
redisCache.delete(keyList);
```

- 参数：keys - 缓存key集合
- 返回值：Long 删除数量
- 说明：根据集合批量删除key

### getRedisType

```java
String type = redisCache.getRedisType("user:1");
```

- 参数：key - 缓存key
- 返回值：String 数据类型
- 说明：获取key在Redis中的数据类型（string、list、hash等）

### memoryInfo

```java
String memory = redisCache.memoryInfo();
```

- 参数：无
- 返回值：String 内存占用（MB）
- 说明：获取Redis当前内存使用情况（单位MB）

## 统一前缀

`RedisKeyPrefixEnum` 枚举中定义的Redis的统一前缀，在此维护的Key可自动被 `系统监控` `缓存监控` 识别。

``` java
/**
 * Redis-Key前缀枚举
 * 在此枚举中维护的前缀可通过「系统监控」-「缓存监控」进行具体类型的维护
 * 不在此枚举中维护的前缀会在「系统监控」-「缓存监控」的OTHER类型中维护
 */
@Getter
@AllArgsConstructor
public enum RedisKeyPrefixEnum {

    LOGIN_USER_REDIS_PREFIX("REDIS_CACHE_LOGIN_USER:", "登录用户"),

    DICT_DATA_REDIS_PREFIX("REDIS_CACHE_DICT_DATA:", "系统字典"),

    SYSTEM_SETTING_REDIS_PREFIX("REDIS_CACHE_SYSTEM_SETTING:", "系统设置"),

    SYSTEM_IP_BLACKLIST_REDIS_PREFIX("REDIS_CACHE_IP_BLACKLIST:", "IP黑名单"),

    PREVENT_DUPLICATE_SUBMIT_REDIS_PREFIX("REDIS_CACHE_REQUEST_SUBMIT:", "防重复提交"),

    CAPTCHA_TYPE_VALUE_REDIS_PREFIX("captcha:config:", "验证码缓存"),

    CAPTCHA_REDIS_PREFIX("REDIS_CACHE_CAPTCHA:", "验证码验证中"),

    SECONDARY_CAPTCHA_REDIS_PREFIX("REDIS_CACHE_SECONDARY_CAPTCHA:", "验证码二次验证"),

    CHUNK_UPLOAD_ID_REDIS_PREFIX("REDIS_CACHE_CHUNK_UPLOAD_ID:", "分片上传uploadId"),

    CHECK_PASSWORD_REDIS_PREFIX("REDIS_CACHE_CHECK_PASSWORD:", "检测密码"),

    ONCE_TOKEN_REDIS_PREFIX("REDIS_CACHE_ONCE_TOKEN:", "一次性令牌"),

    // 业务需要，非真实 redis key
    OTHER("OTHER", "其他");

    private final String value;
    private final String label;

    /**
     * 获取全部枚举
     */
    public static List<RedisKeyPrefixEnum> getRedisKeyPrefix() {
        return new ArrayList<>(Arrays.asList(values()));
    }
}
```

