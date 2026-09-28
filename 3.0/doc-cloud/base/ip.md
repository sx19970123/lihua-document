# IP模块

用于处理系统IP黑名单，提供IP解析与归属地相关工具类。

> 3.0 起不再有独立的 `lihua-base-ip` 模块：IP 归属地数据与工具位于 `lihua-base-web`，纯解析函数 `IpResolveUtils` 位于 `lihua-base-common`（网关等非 servlet 环境也可复用），黑名单数据缓存位于 `lihua-base-cache`。



## IP黑名单

黑名单数据在系统 `系统设置` - `限制访问IP` 中维护，缓存到 Redis 后经网关的 `RequestIpFilter` 全局过滤器匹配，命中黑名单的请求直接拒绝（`IP_ILLEGAL_ERROR` 451）。规则支持 `*`、`?` 通配符（如 `192.168.*.*`），规则会被编译为正则并缓存。

跨服务的黑名单缓存刷新：非 system 服务通过 `SysSettingClient.cacheIpBlack()` 远程调用触发 system 服务重建缓存，实现各实例黑名单同步。

## 工具类

### IpResolveUtils.resolveClientIp（解析客户端真实IP）

```java
String ip = IpResolveUtils.resolveClientIp(xRealIp, forwardedFor, remoteAddr);
```

- 参数：`xRealIp` - X-Real-IP 头，`forwardedFor` - X-Forwarded-For 头原始值，`remoteAddr` - TCP 对端地址
- 返回值：`String` 解析出的 IP，三级信号全部不可用时返回 null
- 说明：`X-Real-IP（前置代理覆写语义，单值）→ X-Forwarded-For（追加语义，取最右侧合法段）→ remoteAddr（TCP 对端）` 三级回退；全程防御式，合法性用正则校验而非 InetAddress（后者对非 IP 字符串会发起 DNS 查询，畸形头可被用来触发解析阻塞）

### WebUtils.getIpAddress（获取当前请求ip地址）

```java
String ip = WebUtils.getIpAddress();
```

- 参数：无
- 返回值：String IP地址
- 说明：获取当前请求的客户端IP，网关裁决值 `Request-IP` 头优先（外部伪造的同名头已被网关覆写）；网关缺席（内网直连服务端口）时按 `X-Real-IP → X-Forwarded-For → request.getRemoteAddr()` 三级回退解析

### WebUtils.getRegion（根据ip获取归属地）

```java
String region = WebUtils.getRegion("8.8.8.8");
```

- 参数：ip - IP地址
- 返回值：String IP归属地
- 说明：基于 ip2region 离线数据（`ip2region/ip2region_v4.xdb`，服务启动时加载）解析所属地区，返回国家、省份、城市，内网IP返回"内网IP"，解析失败返回"未知IP"
