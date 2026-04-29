# Lihua Cloud

狸花猫后台管理系统微服务版，基于 SpringCloud 2025.1 开发



## 🛠️ 技术特性

- 🆕 **持续更新**：持续监控依赖漏洞并及时更新修复
- 🗄️ **数据持久化**：采用MyBatisPlus框架，SQL语句通用化设计，支持多类型数据库快速切换
- 📢 **实时通信**：内置WebSocket消息推送工具，支持服务端向客户端实时推送消息
- 🧰 **工具集合**：提供树形结构处理、数据字典翻译、Excel导入导出等常用工具类
- 🧵 **并发处理**：支持JDK虚拟线程技术，配置文件默认开启，提升系统并发能力
- 🏷️ **注解集成**：内置日志记录、接口限流、防重复提交等注解，开箱即用无需配置
- 🔐 **权限管理**：完善的RBAC权限体系，支持角色关联菜单、页面、链接等多层级权限配置
- 📎 **文件管理**：支持上传、分片上传、断点续传、文件秒传，兼容本地存储和阿里OSS

## ☁️ 微服务技术选型
- 微服务：Spring Cloud Alibaba 2025.1
- 服务发现：Nacos
- 注册中心：Nacos
- 远程调用：HttpExchange
- 负载均衡：Loadbalancer
- 熔断降级：Resilience4j
- 网关：Gateway

## 🔛 可运行服务
需要启动运行的服务共有 5 个
```
lihua-cloud/  
├── lihua-auth/                         # 认证授权服务   
├── lihua-biz/ 
│   ├── lihua-file/                     # 文件服务模块
│   ├── lihua-monitor/                  # 系统监控
│   └── lihua-system/                   # 系统业务
└── lihua-gateway/                      # 网关服务
```

## 📁 项目目录结构

```
lihua-cloud/  
├── pom.xml                             # 项目依赖管理
├── lihua-api/                          # 远程调用API定义模块  
│   ├── pom.xml  
│   └── lihua-api-system/               # 系统模块远程调用API
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
│   ├── lihua-base-ip/                  # IP地址处理模块
│   ├── lihua-base-job/                 # 定时任务模块
│   ├── lihua-base-log/                 # 日志模块 
│   ├── lihua-base-mybatis/             # MyBatis持久层框架模块
│   ├── lihua-base-security/            # 安全模块
│   ├── lihua-base-sensitive/           # 脱敏模块
│   ├── lihua-base-web/                 # Web模块
│   └── lihua-base-websocket/           # WebSocket通信模块
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