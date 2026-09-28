# Lihua Service

狸花猫后台管理系统（单体版），基于 Java 25 + Spring Boot 4.x 开发



## 🛠️ 技术特性

- 🆕 **持续更新**：持续监控依赖漏洞并及时更新修复
- 🗄️ **数据持久化**：采用MyBatisPlus框架，SQL语句通用化设计，支持多类型数据库快速切换
- 📢 **实时通信**：内置WebSocket消息推送工具，支持服务端向客户端实时推送消息，支持事务提交后再推送
- 🧰 **工具集合**：提供树形结构处理、数据字典翻译、Excel导入导出等常用工具类
- 🧵 **并发处理**：支持JDK虚拟线程技术，配置文件默认开启，提升系统并发能力
- 🏷️ **注解集成**：内置日志记录、接口限流、防重复提交等注解，开箱即用无需配置
- 🔐 **权限管理**：完善的RBAC权限体系，支持角色关联菜单、页面、链接等多层级权限配置
- 📎 **文件管理**：支持上传、分片上传、断点续传、文件秒传、Range协商下载（视频拖动/断点续传），兼容本地存储和阿里OSS



## ✨ 3.0 更新内容

:::warning 提示
3.0 版本对**仓库结构、模块命名、基础依赖**进行了全面升级，并补齐了一批安全与性能能力。
:::

### 🧱 仓库拆分

3.0 版本起，项目按端拆分仓库，后端单体服务独立为本仓库维护

- **本仓库（Lihua Service）**
    纯后端单体服务，只包含 Spring Boot 后端工程。

- **`lihua-web`（Web 管理端）**
    前端 Vue 3 管理端拆分至独立仓库。

- **`lihua-app`（移动端）**
    UniApp 移动端拆分至独立仓库。

### 🏷️ 模块命名升级

基础能力模块统一升级为 `lihua-base-xxx` 命名（如 `lihua-excel` → `lihua-base-excel`），模块职责一目了然。同时 3.0 中不再单独维护 `lihua-ip` 模块，IP 相关能力（真实IP解析、ip2region归属地、IP黑名单拦截）全部并入 `lihua-base-web`。

### 🚀 核心依赖升级

- **Spring Boot 升级至 4.1.1，Java 升级至 25**
    - 虚拟线程默认开启（`spring.threads.virtual.enabled: true`）
    - JSON 处理库升级至 Jackson 3，完成相关适配
- **MyBatis-Plus 升级至 3.5.17**（boot4 starter）
- **Redisson 升级至 4.7.0**，并新增基于 Caffeine 的本地二级缓存
- **JWT 升级至 java-jwt 4.6.0**、**Excel 处理升级至 Apache Fesod 2.0.2**
- **定时任务框架 Snail Job 升级至 2.0.2**、**ip2region 升级至 3.3.7**
- 对象存储继续使用阿里云 OSS（3.18.5），无 hutool 依赖，工具类全部自研于 `lihua-base-common`

### 🎁 新增能力

- **接口限流**：`@RateLimit` 注解，按「客户端 ip + 接口」维度滑动窗口限流，超出即 429
- **登录失败锁定**：账号 + IP 双维度计数，窗口内失败达阈值即锁定对应主体
- **权限变更红点**：权限数据变更后推送红点提示，用户点击「数据更新」重载会话，替代旧版"权限变更踢下线"
- **附件能力增强**：HTTP Range 协商下载（206 Partial Content）、HMAC-SHA256 签名下载链、分片上传/秒传模式化
- **本地缓存**：Caffeine 一级缓存 + Redis 二级缓存，多实例部署下经发布订阅广播本地失效
- **通知公告 REST API**：管理端发布/撤销/预览、用户侧列表/标星/已读/未读计数完整接口，公告发布事务提交后 WebSocket 推送

### 🔐 安全加固

- **统一返回码重构**：`ResultCodeEnum` 对齐 HTTP 语义（400/401/403/404/405/422/429/451），业务异常 5xx
- **全局异常加固**：认证失败、权限不足、限流等异常固定文案返回，兜底异常不透传内部细节，防止接口枚举与信息泄露
- **下载链防伪**：附件下载链接经 HMAC-SHA256 签名，密钥未配置直接拒绝启动
- **防重复提交**：新增 `excludeParams` 属性，敏感字段（如密码）不进入 Redis 幂等键
- **IP 黑名单**：请求进入业务前经黑名单拦截器校验，规则经本地缓存加速



## 📁 项目目录结构

```
lihua/
├── pom.xml                             # 项目依赖管理
├── lihua-admin/                        # 应用启动
│   └── pom.xml
├── lihua-base/                         # 基础能力模块
│   ├── pom.xml
│   ├── lihua-base-attachment/          # 附件模块
│   ├── lihua-base-cache/               # 系统缓存模块
│   ├── lihua-base-captcha/             # 验证码模块
│   ├── lihua-base-common/              # 公共模块
│   ├── lihua-base-dict/                # 字典模块
│   ├── lihua-base-doc/                 # 接口文档模块
│   ├── lihua-base-excel/               # excel倒入导出模块
│   ├── lihua-base-job/                 # 定时任务模块
│   ├── lihua-base-log/                 # 日志模块
│   ├── lihua-base-mybatis/             # mybatis持久层框架模块
│   ├── lihua-base-security/            # 安全模块
│   ├── lihua-base-sensitive/           # 脱敏模块
│   ├── lihua-base-web/                 # web模块（含IP解析、归属地、黑名单能力）
│   └── lihua-base-ws/                  # WS 消息边界模块（推送投递入口 + 上行处理器 SPI）
├── lihua-websocket/                    # WebSocket 连接层（受控基建库，随 lihua-admin 装配持有连接）
└── lihua-biz/                          # 业务模块
    ├── pom.xml
    ├── lihua-monitor/                  # 系统监控
    └── lihua-system/                   # 系统业务

```



## 📄 许可证

本项目采用 **MIT License** 开源协议，详情请查看 `LICENSE` 文件。
