# Lihua Service

狸花猫后台管理系统，基于Java 21 SpringBoot 3.x开发



## 🛠️技术特性

- 🆕 **持续更新**：持续监控依赖漏洞并及时更新修复
- 🗄️ **数据持久化**：采用MyBatisPlus框架，SQL语句通用化设计，支持多类型数据库快速切换
- 📢 **实时通信**：内置WebSocket消息推送工具，支持服务端向客户端实时推送消息
- 🧰 **工具集合**：提供树形结构处理、数据字典翻译、Excel导入导出等常用工具类
- 🧵 **并发处理**：支持JDK虚拟线程技术，配置文件默认开启，提升系统并发能力
- 🏷️ **注解集成**：内置日志记录、接口限流、防重复提交等注解，开箱即用无需配置
- 🔐 **权限管理**：完善的RBAC权限体系，支持角色关联菜单、页面、链接等多层级权限配置
- 📎 **文件管理**：支持上传、分片上传、断点续传、文件秒传，兼容本地存储与MINIO对象存储



## 📁 项目目录结构

```
lihua/  
├── lihua-admin/              				# Web入口模块  
│   └── src/main/java/com/lihua/  
│       ├── LiHuaApplication.java    		# 启动类  
│       ├── controller/             		# 控制器层  
│       └── job/                    	 	# 定时任务  
│   └── src/main/resources/  
│       ├── application.yml          		# 配置文件  
│       ├── application-dev.yml      		# 开发环境  
│       └── application-prod.yml     		# 生产环境  
│   └── pom.xml                      		# 模块POM文件  
├── lihua-core/               				# 核心基础设施  
│   └── src/main/java/com/lihua/  
│       ├── config/          				# 配置类  
│       ├── filter/          				# 过滤器  
│       ├── interceptor/     				# 拦截器  
│       └── aspect/          				# AOP切面  
│   └── pom.xml              				# 模块POM文件  
├── lihua-common/             				# 通用工具模块  
│   └── src/main/java/com/lihua/  
│       ├── config/          				# 通用配置  
│       ├── utils/           				# 工具类  
│       ├── annotation/      				# 自定义注解  
│       ├── enums/           				# 枚举类  
│       └── exception/       				# 异常类  
│   └── pom.xml              				# 模块POM文件  
├── lihua-service/            				# 业务逻辑模块  
│   └── src/main/java/com/lihua/  
│       ├── entity/          				# 实体类  
│       ├── mapper/          				# 数据访问层  
│       ├── service/         				# 业务服务层  
│       └── model/           				# 数据传输对象  
│   └── pom.xml              				# 模块POM文件  
├── sql/  
│   └── lihua.sql             				# 数据库脚本  
└── pom.xml                  				# 父级POM文件  
```



## 📄 许可证

本项目采用 **MIT License** 开源协议，详情请查看 `LICENSE` 文件。