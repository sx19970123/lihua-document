# IP模块

用于处理系统IP黑名单，提供IP相关工具类。



## IP黑名单

`RequestIpInterceptor` 简单处理黑名单相关逻辑，缓存中黑名单添加在系统 `系统设置` - `限制访问IP` 中维护



## 工具类

### getIpAddress（获取当前请求ip地址）

```java
String ip = IpUtils.getIpAddress();
```

- 参数：无
- 返回值：String IP地址
- 说明：获取当前请求的客户端IP，优先从请求头中获取（X-Forwarded-For、X-Real-IP），获取不到则使用request.getRemoteAddr()

### getRegion（根据ip获取归属地）

```java
String region = IpUtils.getRegion("8.8.8.8");
```

- 参数：ip - IP地址
- 返回值：String IP归属地
- 说明：根据IP地址解析所属地区，返回国家、省份、城市，内网IP返回“内网IP”，解析失败返回“未知IP”
