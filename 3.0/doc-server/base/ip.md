# IP 地址相关

3.0 中不再单独维护 `lihua-ip` 模块，IP 相关能力（真实IP解析、ip2region归属地、IP黑名单拦截）全部并入 `lihua-base-web` 模块。

## IP黑名单

`RequestIpInterceptor` 拦截器在请求进入业务前校验黑名单，黑名单在系统 `系统设置` - `限制访问IP` 中维护

- 规则支持 `*` 通配（如 `192.168.*`），匹配结果经 `Pattern` 缓存加速
- 黑名单列表经本地缓存回源 Redis（`REDIS_CACHE_IP_BLACKLIST` 前缀），不逐请求查库
- 命中黑名单的请求返回 `451 IP_ILLEGAL_ERROR`（"暂时无法为该地区提供服务"）

## 工具类

### getIpAddress（获取当前请求真实ip地址）

```java
String ip = WebUtils.getIpAddress();
```

- 参数：无（另有 `HttpServletRequest` 参数重载）
- 返回值：String IP地址；非请求线程或全部信号不可用时返回 null
- 说明：获取当前请求的客户端真实IP，按 `X-Real-IP` → `X-Forwarded-For` 最右合法段 → `remoteAddr` 三级解析（底层为 `IpResolveUtils.resolveClientIp`），任一信号缺失/`unknown`/格式非法即跳过回退

### getRegion（根据ip获取归属地）

```java
String region = WebUtils.getRegion("8.8.8.8");
```

- 参数：ip - IP地址
- 返回值：String IP归属地
- 说明：基于 ip2region（3.3.7，离线数据文件随 `lihua-base-web` 打包）解析所属地区，返回国家、省份、城市，内网IP返回"内网IP"，解析失败返回"未知IP"

## 解析细节

`IpResolveUtils` 为客户端真实 IP 解析的底层工具，全程防御式：任何输入不抛错，三级信号全部不可用时返回 null

- `X-Real-IP`：前置代理覆写语义（单值），客户端自带的伪造值会被标准反代替换，优先采用
- `X-Forwarded-For`：追加语义，取最右侧合法段（由最内层代理写入，客户端仅能污染左侧段）
- `remoteAddr`：TCP 对端地址，无代理时即客户端 IP，绝对真实
- 合法性用正则校验（IPv4 严格、IPv6 宽松）而非 `InetAddress`——后者对非 IP 字符串会发起 DNS 查询，畸形头可被用来触发解析阻塞
