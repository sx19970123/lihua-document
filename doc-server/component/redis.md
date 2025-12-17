# Redis 缓存



## 使用缓存

Bean中注入 `RedisCache`  即可使用

``` java
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



## 自定义RedisCache

`lihua-common/src/main/java/com/lihua/cache/RedisCache.java` 封装了 `RedisTemplate` 可根据业务需要自行增加工具方法

``` java
@Slf4j
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

    // ... 省略

    /**
     * 获取 key 对应的value在redis中对应的数据类型
     * @return 返回值包括：string、list、set、hash、zset等
     */
    public String getRedisType(String key) {
        return Objects.requireNonNull(redisTemplate.type(key)).code();
    }
}

```



## 统一维护RedisKey前缀

`lihua-common/src/main/java/com/lihua/enums/RedisKeyPrefixEnum.java` 中维护了系统Redis前缀，业务中有需要缓存时，推荐在此枚举中进行统一维护

> 在此枚举中维护的前缀可通过「系统监控」-「缓存监控」进行具体类型的维护
>
> 不在此枚举中维护的前缀会在「系统监控」-「缓存监控」的OTHER类型中维护

``` java
/**
 * Redis-Key前缀枚举
 */
@Getter
@AllArgsConstructor
public enum RedisKeyPrefixEnum {

    LOGIN_USER_REDIS_PREFIX("REDIS_CACHE_LOGIN_USER:", "登录用户"),

    DICT_DATA_REDIS_PREFIX("REDIS_CACHE_DICT_DATA:", "系统字典"),

    SYSTEM_SETTING_REDIS_PREFIX("REDIS_CACHE_SYSTEM_SETTING:", "系统设置"),

    SYSTEM_IP_BLACKLIST_REDIS_PREFIX("REDIS_CACHE_IP_BLACKLIST:", "IP黑名单"),

    PREVENT_DUPLICATE_SUBMIT_REDIS_PREFIX("REDIS_CACHE_REQUEST_SUBMIT:", "防重复提交"),

    CAPTCHA_REDIS_PREFIX("REDIS_CACHE_CAPTCHA:", "验证码"),

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

**使用方式**

`RedisKeyPrefixEnum.XXX_REDIS_PREFIX.getValue()` + `标识` 形式使用，例：

``` java
/**
 * 设置字典缓存
 */
public static <T> void setDictCache(String dictTypeCode, List<SysDictDataVO> dictValue) {
    redisCache.setCacheList(RedisKeyPrefixEnum.DICT_DATA_REDIS_PREFIX.getValue() + dictTypeCode, dictValue);
}
```

