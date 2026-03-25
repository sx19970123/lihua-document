# Lihua Service

狸花猫后台管理系统，基于Java 21/25 SpringBoot 4.x开发



## 🛠️ 技术特性

- 🆕 **持续更新**：持续监控依赖漏洞并及时更新修复
- 🗄️ **数据持久化**：采用MyBatisPlus框架，SQL语句通用化设计，支持多类型数据库快速切换
- 📢 **实时通信**：内置WebSocket消息推送工具，支持服务端向客户端实时推送消息
- 🧰 **工具集合**：提供树形结构处理、数据字典翻译、Excel导入导出等常用工具类
- 🧵 **并发处理**：支持JDK虚拟线程技术，配置文件默认开启，提升系统并发能力
- 🏷️ **注解集成**：内置日志记录、接口限流、防重复提交等注解，开箱即用无需配置
- 🔐 **权限管理**：完善的RBAC权限体系，支持角色关联菜单、页面、链接等多层级权限配置
- 📎 **文件管理**：支持上传、分片上传、断点续传、文件秒传，兼容本地存储和阿里OSS

## ✨ 2.0 更新内容

:::warning 提示
2.0 版本主要对**后端架构与基础依赖**进行了升级与重构，Web / App 端改动较小，主要用于适配后端升级带来的变化。
:::

### 🧱 后端架构重构

2.0 版本对后端进行了模块化拆分，整体结构更加清晰，职责更加单一

- **`lihua-admin`（工程入口模块）**  
  作为项目启动入口，负责系统配置加载、组件装配及应用启动。

- **`lihua-base`（基础能力模块）**  
  为项目提供基础能力，不参与业务实现，只提供对应能力。
  例：Excel导入导出的第三方依赖、通用自定义注解、拦截器、工具类都维护在 `lihua-base` 下的 `lihua-excel` 模块。业务模块引入该模块的依赖后，即可使用Excel模块提供的各种功能。

- **`lihua-biz`（业务模块）**  
  聚焦具体业务逻辑实现，支持按业务领域拆分子模块，具备良好的扩展性与可维护性。

### 🚀 核心依赖升级

- **Spring Boot 升级至 4.x**
    - 完成相关依赖的版本升级与兼容适配
    - 针对 JSON 处理库（如 Jackson）升级带来的变化进行了调整
    - 关键依赖升级到适配SpringBoot4的版本

### 🔄 关键组件替换

为提升系统性能与可维护性，2.0 对部分核心组件进行了替换：

- **缓存客户端**
    - 替换为：`Redisson`（提供更完善的分布式能力支持）

- **Excel 处理工具**
    - 替换为：`Fesod`（原MyExcel已停止维护）

- **定时任务框架**
    - 替换为：`Snail Job`（更轻量、灵活）

- **对象存储服务**
    - 替换为：阿里云 OSS（MinIO不再维护）

## 📁 项目目录结构

```
lihua/
├── pom.xml                             # 项目依赖管理
├── lihua-admin/                        # 应用启动
│   └── pom.xml
├── lihua-base/                         # 基础能力模块
│   ├── pom.xml
│   ├── lihua-attachment/               # 附件模块
│   ├── lihua-captcha/                  # 验证码模块
│   ├── lihua-common/                   # 公共模块
│   ├── lihua-dict/                     # 字典模块
│   ├── lihua-doc/                      # 接口文档模块
│   ├── lihua-excel/                    # excel倒入导出模块
│   ├── lihua-ip/                       # ip模块
│   ├── lihua-job/                      # 定时任务模块
│   ├── lihua-log/                      # 日志模块
│   ├── lihua-mybatis/                  # mybatis持久层框架模块
│   ├── lihua-redis/                    # redis缓存模块
│   ├── lihua-security/                 # 安全模块
│   ├── lihua-sensitive/                # 脱敏模块
│   ├── lihua-web/                      # web模块
│   └── lihua-websocket/                # websocket通信模块
├── lihua-biz/                          # 业务模块
│   ├── pom.xml
│   ├── lihua-monitor/                  # 系统监控
│   └── lihua-system/                   # 系统业务
├── lihua-vue/                          # web端vue项目
├── docker/                             # docker快速部署
├── sql/                                # sql脚本
└── static-image/                       # 静态图片
```



## 📄 许可证

本项目采用 **MIT License** 开源协议，详情请查看 `LICENSE` 文件。