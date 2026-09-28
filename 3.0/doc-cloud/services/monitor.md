# 监控服务 lihua-monitor

系统监控：在线用户管理（强退）、缓存监控、服务器/JVM 监控。无独立业务表，数据全部来自 Redis 与运行时系统指标。

## 基本信息

| 项目 | 值 |
| ---- | -- |
| spring.application.name | `lihua-monitor` |
| 默认端口 | `8081`（`SERVER_PORT` 环境变量可覆盖） |
| 启动类 | `com.lihua.monitor.LiHuaMonitorApplication` |
| 依赖中间件 | Redis、Nacos（无 MySQL） |
| Nacos 配置 | `lihua-monitor.yaml`（`lihua-monitor` 分组）+ `lihua-common.yaml` + `lihua-resilience.yaml` |

## 模块结构

```text
lihua-monitor/
└── src/main/java/com/lihua/monitor/
    ├── LiHuaMonitorApplication.java            # 启动类
    ├── controller/
    │   ├── MonitorLoggedUserController.java    # 在线用户（monitor/loggedUser）
    │   ├── MonitorCacheController.java         # 缓存监控（monitor/cache）
    │   └── MonitorServerController.java        # 服务监控（monitor/server）
    ├── model/
    │   ├── LoggedUser.java                     # 在线用户
    │   ├── CacheMonitor.java                   # 缓存信息
    │   ├── ServerInfo.java / CpuMonitor.java   # 服务器 / CPU
    │   └── MemoryMonitor.java / DiskMonitor.java / JvmMonitor.java  # 内存 / 磁盘 / JVM
    └── service/
        ├── MonitorLoggedUserService.java       # 在线用户服务
        ├── MonitorCacheService.java            # 缓存监控服务
        ├── MonitorServerService.java           # 服务器监控服务
        └── impl/                               # 各实现类
```

## 核心机制

### 在线用户

扫描 Redis 中 `REDIS_CACHE_LOGIN_USER:` 前缀的全部会话 key（按登录时间倒序），从缓存 key 本身解析登录时间（JWT 载荷即 Redis key，四段结构 `前缀:userId:时间戳:uuid`），组装用户名、昵称、IP、归属地、客户端类型等展示信息。

**强退用户**（`DELETE monitor/loggedUser`）带有 cacheKey 白名单校验：仅接受登录会话前缀开头的四段结构 key，防止任意 Redis key 被当作会话广播删除，校验通过后删除会话缓存实现强退。

``` java
public void forceLogout(List<String> cacheKeys) {
    // 白名单校验：合法会话 key 为登录会话前缀的四段结构（前缀:userId:时间戳:uuid）
    cacheKeys.forEach(cacheKey -> {
        if (!cacheKey.startsWith(RedisKeyPrefixEnum.LOGIN_USER_REDIS_PREFIX.getValue())
                || cacheKey.split(":").length != 4) {
            throw new ServiceException("无效的 cacheKey");
        }
    });
    cacheKeys.forEach(LoginUserManager::removeLoginUserSession);
}
```

### 缓存监控

按 `RedisKeyPrefixEnum` 枚举分组管理缓存（登录用户、系统字典、IP 黑名单、防重复提交、验证码、分片上传、一次性令牌、接口限流、登录锁定等），不在枚举中维护的前缀归入 OTHER 组：

- `GET monitor/cache/memory`：Redis 内存占用量
- `GET monitor/cache/group`：缓存组列表（各前缀的 key 数量等信息）
- `GET monitor/cache/prefix/{keyPrefix}`：根据前缀查询所有 key
- `POST monitor/cache/info`：根据 key 查询缓存详情（类型/值/TTL）
- `DELETE monitor/cache/key`：删除缓存

### 服务器监控

`GET monitor/server` 返回运行时指标聚合：CPU（`CpuMonitor`）、内存（`MemoryMonitor`）、磁盘（`DiskMonitor`）与 JVM（`JvmMonitor`）信息。

## 接口一览

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/monitor/loggedUser` | GET | 在线用户列表查询 |
| `/monitor/loggedUser` | DELETE | 强退用户（cacheKey 白名单校验） |
| `/monitor/cache/memory` | GET | Redis 内存占用量 |
| `/monitor/cache/group` | GET | 缓存组列表 |
| `/monitor/cache/prefix/{keyPrefix}` | GET | 根据前缀查询所有 key |
| `/monitor/cache/info` | POST | 根据 key 获取缓存信息 |
| `/monitor/cache/key` | DELETE | 删除缓存 |
| `/monitor/server` | GET | 服务监控信息（CPU/内存/磁盘/JVM） |

## 配置与注意事项

- 监控接口挂在业务路由 `/monitor/**` 下，须经网关认证后访问；服务自身无独立配置项，公共配置全部来自 `lihua-common.yaml`
- 服务监控读取的是 **monitor 进程所在机器/JVM** 的指标，容器部署时即容器内指标
- 缓存监控的删除操作直接作用于生产 Redis，请谨慎操作
- 容器部署时 monitor 端口为 **8084**（compose 内 `SERVER_PORT=8084`），与本地默认 8081 不同
