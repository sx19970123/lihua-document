# Lihua Cloud

狸花猫后台管理系统微服务版，基于 Spring Boot 4 与 Spring Cloud 2025.1 开发



## 🛠️ 技术特性

- 🆕 **持续更新**：持续监控依赖漏洞并及时更新修复
- 🗄️ **数据持久化**：采用MyBatisPlus框架，SQL语句通用化设计，支持多类型数据库快速切换
- 📢 **实时通信**：内置WebSocket消息推送工具，支持服务端向客户端实时推送消息
- 🧰 **工具集合**：提供树形结构处理、数据字典翻译、Excel导入导出等常用工具类
- 🧵 **并发处理**：支持JDK虚拟线程技术，配置文件默认开启，提升系统并发能力
- 🏷️ **注解集成**：内置日志记录、接口限流、防重复提交等注解，开箱即用无需配置
- 🔐 **权限管理**：完善的RBAC权限体系，支持角色关联菜单、页面、链接等多层级权限配置
- 📎 **文件管理**：支持上传、分片上传、断点续传、文件秒传，兼容本地存储和阿里OSS
- 🔗 **服务间调用**：基于 Spring HttpExchange 的声明式 RPC，服务名寻址 + 熔断降级 + HMAC 签名防伪造

## ☁️ 微服务技术选型
- 基础框架：Spring Boot 4.0.8 / Java 25
- 微服务：Spring Cloud 2025.1.3 + Spring Cloud Alibaba 2025.1.0.0
- 注册中心：Nacos（v3.1.1）
- 配置中心：Nacos
- 远程调用：HttpExchange（声明式 HTTP 客户端）
- 负载均衡：LoadBalancer
- 熔断降级：Resilience4j
- 网关：Spring Cloud Gateway

## ✨ 3.0 更新内容

- 📦 **仓库拆分**：微服务版独立为 `lihua-cloud` 仓库维护，与单体版（lihua-server）彻底分离，公共能力收敛到 `lihua-base` 基础模块
- 🚀 **全栈升级**：Spring Boot 升级到 4.0.8、Spring Cloud 升级到 2025.1.3、Spring Cloud Alibaba 升级到 2025.1.0.0、Nacos 升级到 v3.1.1、Java 升级到 25
- 🪝 **声明式 RPC**：服务间调用统一走 `@RemoteClient` 声明式 HTTP 客户端，Facade 层集成 Resilience4j 熔断，签名密钥 `rpc.signKey` 全链路防伪造
- 🪫 **接口限流**：新增 `@RateLimit` 注解，按「客户端 ip + 接口」维度令牌桶限流，Redis 侧计数多实例共享配额
- 🔒 **登录锁定**：新增 `login.lock` 登录失败锁定，账号 + IP 双维度计数，窗口内失败达阈值即锁定
- 🔴 **权限红点**：权限数据变更后自动置位标记并经 WebSocket 推送，前端「数据更新」红点提醒用户刷新会话数据
- ✍️ **签名下载**：附件下载链接升级为 HMAC-SHA256 私密签名链（`<过期时间>.<路径>.<签名>` 三段令牌），支持 Range 断点下载
- 🛡️ **安全加固**：JWT 密钥、RPC 签名密钥、附件下载签名密钥全部强制显式配置（缺失或过短拒绝启动），服务间调用常量时间比对防时序侧信道

## 🔛 可运行服务
需要启动运行的服务共有 6 个

| 服务 | spring.application.name | 默认端口 | 职责 |
| ---- | ----------------------- | -------- | ---- |
| 网关服务 | `lihua-gateway` | `8085` | 路由转发、JWT 预校验、IP 黑名单、traceId 注入、熔断降级 |
| 认证服务 | `lihua-auth` | `8082` | 登录、注册、验证码、一次性令牌，签发 JWT（自身无 DB，用户数据经 RPC 取自 lihua-system） |
| 核心业务服务 | `lihua-system` | `8084` | RBAC（用户/角色/菜单/部门/岗位）、字典、通知公告、系统日志、系统设置 |
| 文件服务 | `lihua-file` | `8083` | 附件上传/秒传/分片/断点续传、签名下载，本地与阿里云 OSS 双存储策略 |
| 监控服务 | `lihua-monitor` | `8081` | 在线用户管理、缓存监控、服务器/JVM 监控 |
| WS 连接服务 | `lihua-websocket` | `8086` | WebSocket 连接持有与消息推送（无库不落表，可多实例水平扩容），业务服务经 Redis pub/sub 投递 |

```text
lihua-cloud/  
├── lihua-auth/                         # 认证授权服务   
├── lihua-biz/ 
│   ├── lihua-file/                     # 文件服务模块
│   ├── lihua-monitor/                  # 系统监控
│   └── lihua-system/                   # 系统业务
├── lihua-gateway/                      # 网关服务
└── lihua-websocket/                    # WS 连接服务
```

## 📁 项目目录结构

```text
lihua-cloud/  
├── pom.xml                             # 项目依赖管理
├── deploy/                             # 部署资源
│   ├── db/                             # 数据库脚本（lihua.sql 基线 + upgrade-3.0.0.sql 升级）
│   ├── docker/                         # Docker Compose 部署全家桶
│   └── nacos/                          # Nacos 配置导出包（nacos_config_export.zip）
├── lihua-api/                          # 远程调用API定义模块  
│   ├── pom.xml  
│   └── lihua-api-system/               # 系统模块远程调用API（client接口 + facade + model）
├── lihua-auth/                         # 认证授权服务   
│   └── pom.xml  
├── lihua-base/                         # 基础能力模块  
│   ├── pom.xml  
│   ├── lihua-base-attachment/          # 附件模块，支持OSS存储
│   ├── lihua-base-cache/               # 系统缓存模块
│   ├── lihua-base-captcha/             # 验证码模块
│   ├── lihua-base-client/              # 远程调用客户端模块
│   ├── lihua-base-common/              # 公共模块
│   ├── lihua-base-dict/                # 字典模块
│   ├── lihua-base-doc/                 # 接口文档模块 
│   ├── lihua-base-excel/               # Excel导入导出模块
│   ├── lihua-base-job/                 # 定时任务模块
│   ├── lihua-base-log/                 # 日志模块 
│   ├── lihua-base-mybatis/             # MyBatis持久层框架模块
│   ├── lihua-base-security/            # 安全模块
│   ├── lihua-base-sensitive/           # 脱敏模块
│   ├── lihua-base-web/                 # Web模块（限流/防重复提交/内部签名校验/IP归属地）
│   └── lihua-base-ws/                  # WS 消息边界模块（推送投递入口 + 上行处理器 SPI）
├── lihua-websocket/                    # WS 连接服务（第六服务，连接层代码 + 启动引导一体）
├── lihua-biz/                          # 业务模块  
│   ├── pom.xml  
│   ├── lihua-file/                     # 文件服务模块
│   ├── lihua-monitor/                  # 系统监控
│   └── lihua-system/                   # 系统业务
└── lihua-gateway/                      # 网关服务
    └── pom.xml  

```



## 📄 许可证

本项目采用 **MIT License** 开源协议，详情请查看 `LICENSE` 文件。
