# 使用Docker部署应用程序
> docker默认配置在项目 `deploy/docker` 目录下

## 文件结构
```
lihua                 	                                # 项目工程目录
├── deploy               		                        # 部署目录
│   ├── db                                             # 数据库脚本目录
│   ├── docker                                         # docker 部署目录
│   │   ├── client                                     # 前端工程目录
│   │   │   ├── dist	                                # 前端打包后的dist目录（需自己添加）
│   │   │   ├── nginx.conf	                            # nginx配置
│   │   │   ├── dockerfile	                            # 前端构建镜像dockerfile
│   │   ├── server                                     # 后端服务目录
│   │   │   ├── lihua-admin-exec.jar	                # 后端打包后的jar文件（需自己添加）
│   │   │   ├── dockerfile	             		        # 后端构建镜像dockerfile
│   │   ├── compose.yaml                               # docker编排文件
......        
```
## 部署说明
**请确保服务器中已安装docker**

### client
> client 为前端部署目录包含：
> dist（lihua-web打包目录）
> nginx.conf（自定义的nginx配置，打包后覆盖镜像原有配置）
> dockerfile（构建镜像）

构建镜像时会将dist和nginx.conf复制到镜像指定路径下，并向外部暴露80端口
生产发包时，前端打包后替换掉旧版本的dist目录即可

### server
> server 为后端部署目录包含：
> lihua-admin-exec.jar（后端打包后文件，注意切换application.yml 中 active 为 prod）
> dockerfile（构建镜像）

server构建使用 `eclipse-temurin:25.0.4_7-jre-noble`（与 Java 25 编译目标匹配；镜像内含 fontconfig 与 DejaVu 字体，满足验证码字体渲染），将lihua-admin-exec.jar复制到指定路径下。启动时执行 `java -jar`（额外安装 curl 供 healthcheck 探活使用），服务端口为 `8085`
`application-prod.yml` 中关键配置读取自环境变量，在部署时通过 `compose.yaml` 对环境变量进行配置


### compose.yaml
启动前请根据实际情况完善`compose.yaml`中的配置信息，并将打包好的文件放到对应目录下。

将项目中`deploy/docker`目录上传到服务器，在`docker`目录中执行`docker compose -f compose.yaml up -d`时会默认启动 `lihua-web-server` `lihua-web-client` `lihua-mysql` `lihua-redis` 四个容器

四容器均配置了 healthcheck：

- server 经主端口 `/actuator/health` 全量聚合探活（含 db/redis 指标），`start_period: 60s` 给足 JVM 启动窗口
- client 探测 nginx 首页、mysql 经 `mysqladmin ping`、redis 经 `redis-cli ping`
- `server` 的 `depends_on` 使用 `condition: service_healthy`，确保数据库/缓存就绪后再启动后端；`client` 依赖 `server` 健康后再启动

`server` 容器还配置了 `stop_grace_period: 35s` 配合应用侧优雅停机（`server.shutdown: graceful`，各 phase 收尾超时 30s）：先停止接新请求、收尾在途请求再退出

所有容器统一配置日志轮转（json-file 单文件 10MB × 保留 3 份），防止日志无上限写爆磁盘；`ATTACHMENT_DOWNLOAD_SIGN_KEY` 需在 `.env` 或部署环境中提供，缺失时后端启动失败

第一次部署时，容器全部启动后需手动执行sql文件，可使用navicat等工具连接数据库后运行 `deploy/db` 下的 `lihua.sql` 文件（从低版本升级再执行 `upgrade-3.0.0.sql`）。

**配置仅包含最基础的项目启动，更多需求请根据项目情况修改dockerfile和compose.yaml**

## 卷映射

> 通过卷映射可以通过连接服务器直接修改docker容器中的文件

> /var/lib/docker/volumes 目录下对应容器卷映射目录

- mysql-conf：mysql配置文件
- mysql-data：mysql数据
- redis-data：redis数据
- server-data：服务器文件（文件上传、系统日志）
- jar-resource：启动服务器时的jar包路径
- dist-resource：前端打包dist路径

## 更新版本

- 前端 进入到 dist-resource 后，替换_data下的目录即可
- 后端 进入到 jar-resource 后，替换_data下对应的jar包，重启对应容器即可
