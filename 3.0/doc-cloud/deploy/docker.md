# 使用 Docker 部署应用程序

> docker 相关配置在项目根目录 `/deploy/docker/` 下

## 文件结构

```text
├── docker                                                # Docker 部署目录
│   ├── compose.yaml                                      # Docker Compose 编排文件
│   ├── client                                            # Web 前端服务目录
│   │   ├── dist                                          # lihua-web 打包后的 dist 目录（需自行添加或替换）
│   │   ├── nginx.conf                                    # Nginx 配置
│   │   ├── dockerfile                                    # 前端镜像构建文件
│   ├── lihua-auth                                        # 认证中心服务目录
│   │   ├── lihua-auth-exec.jar                           # 后端打包后的 jar 文件（需自行添加）
│   │   ├── dockerfile                                    # 后端镜像构建文件
│   ├── lihua-file                                        # 文件服务目录
│   │   ├── lihua-file-exec.jar                           # 后端打包后的 jar 文件（需自行添加）
│   │   ├── dockerfile                                    # 后端镜像构建文件
│   ├── lihua-gateway                                     # 网关服务目录
│   │   ├── lihua-gateway-exec.jar                        # 后端打包后的 jar 文件（需自行添加）
│   │   ├── dockerfile                                    # 后端镜像构建文件
│   ├── lihua-monitor                                     # 监控服务目录
│   │   ├── lihua-monitor-exec.jar                        # 后端打包后的 jar 文件（需自行添加）
│   │   ├── dockerfile                                    # 后端镜像构建文件
│   ├── lihua-system                                      # 核心业务服务目录
│   │   ├── lihua-system-exec.jar                         # 后端打包后的 jar 文件（需自行添加）
│   │   ├── dockerfile                                    # 后端镜像构建文件
│   ├── lihua-websocket                                   # WS 连接服务目录
│   │   ├── lihua-websocket-exec.jar                       # 后端打包后的 jar 文件（需自行添加）
│   │   ├── dockerfile                                     # 后端镜像构建文件
```

## 部署说明

请确保服务器已安装 Docker 和 Docker Compose，并且 80、3306、6379、8090、8848、9848 端口未被占用，或已在 `compose.yaml` 中调整端口映射。

### 准备打包文件

后端服务在 `lihua-cloud` 目录下打包：

```shell
cd lihua-cloud
mvn clean package -DskipTests
```

将生成的 exec jar 复制到 Docker 部署目录：

```shell
cp lihua-auth/target/lihua-auth-exec.jar deploy/docker/lihua-auth/
cp lihua-gateway/target/lihua-gateway-exec.jar deploy/docker/lihua-gateway/
cp lihua-biz/lihua-system/target/lihua-system-exec.jar deploy/docker/lihua-system/
cp lihua-biz/lihua-file/target/lihua-file-exec.jar deploy/docker/lihua-file/
cp lihua-biz/lihua-monitor/target/lihua-monitor-exec.jar deploy/docker/lihua-monitor/
cp lihua-websocket/target/lihua-websocket-exec.jar deploy/docker/lihua-websocket/
```

前端在 [lihua-web](https://gitee.com/yukino_git/lihua-web) 仓库下打包：

```shell
cd lihua-web
npm install
npm run build
```

将生成的 `dist` 目录复制或替换到 `deploy/docker/client/dist`。

### client

`client` 为 Web 管理端部署目录，包含：

- `dist`：`lihua-web` 打包产物。
- `nginx.conf`：Nginx 配置文件，会覆盖镜像中的 `/etc/nginx/nginx.conf`。
- `dockerfile`：基于 `nginx` 构建前端镜像。

镜像构建时会将 `dist` 复制到 `/usr/share/nginx/html/dist`，并通过 Nginx 暴露 80 端口。当前 compose 将宿主机 `80:80` 映射到前端容器（443 映射已移除：nginx 仅 listen 80 无证书，启用 HTTPS 时恢复映射并在 nginx.conf 补 ssl 配置）。

Nginx 已配置：

- `/`：访问前端页面。
- `/prod-api/`：反向代理到 `lihua-gateway-server:8080`（注意尾部斜线）。
- `/ws-connect`：反向代理 WebSocket 到网关服务。

生产发布前端时，替换 `client/dist` 后重建 `client` 服务即可。

### server

后端服务包含 `auth-server`、`system-server`、`file-server`、`monitor-server`、`gateway-server` 五个容器。

各服务镜像基于 `eclipse-temurin:25.0.4_7-jre-noble` 构建（额外安装 curl 供 healthcheck 探活），构建时将对应的 `*-exec.jar` 复制到 `/app/` 目录，容器启动时执行 `java $JAVA_OPTS -jar`（JVM 内存参数由 compose 按容器限额注入 `-XX:MaxRAMPercentage=75.0`，OOM 时 dump 到数据卷并退出交由 restart 自愈）。

当前服务端口如下，**compose 容器内端口与 jar 本地默认端口存在错位，以容器内 `SERVER_PORT` 为准**：

| 服务             | 容器名                 | 容器端口 | jar 本地默认端口 | 说明         |
| ---------------- | ---------------------- | -------- | ---------------- | ------------ |
| `gateway-server` | `lihua-gateway-server` | `8080`   | `8085`           | 网关服务     |
| `auth-server`    | `lihua-auth-server`    | `8081`   | `8082`           | 认证中心     |
| `system-server`  | `lihua-system-server`  | `8082`   | `8084`           | 核心业务服务 |
| `file-server`    | `lihua-file-server`    | `8083`   | `8083`           | 文件服务     |
| `monitor-server` | `lihua-monitor-server` | `8084`   | `8081`           | 监控服务     |
| `ws-server`      | `lihua-websocket-server` | `8086` | `8086`           | WS 连接服务（无库，可多实例） |

后端容器默认不直接暴露到宿主机，外部请求通过 `client` 容器的 Nginx 代理进入网关。每个后端容器统一：

- **healthcheck**：`curl http://localhost:$SERVER_PORT/actuator/health`（15s 间隔，start_period 60s 给足 JVM 启动 + Nacos 配置拉取窗口）
- **stop_grace_period: 35s**：配合优雅停机（须大于 `timeout-per-shutdown-phase` 30s），停机时先从 Nacos 注销实例、LB 摘流后再收尾在途请求
- **日志轮转**：json-file 单文件 10MB × 保留 3 份
- **mem_limit**：JVM 服务 768m（网关 512m）

部署时可通过 `compose.yaml` 中的环境变量调整端口、Nacos 地址、命名空间和账号密码：

- `SERVER_PORT`
- `NACOS_ADDR` / `NACOS_USERNAME` / `NACOS_PASSWORD`
- `NACOS_NAMESPACE`（默认 `prod`）
- `MYSQL_ADDR` / `MYSQL_USERNAME` / `MYSQL_PASSWORD`
- `REDIS_ADDR` / `REDIS_PASSWORD`
- `ATTACHMENT_DOWNLOAD_SIGN_KEY`：附件下载签名密钥，**在 `.env` 或部署环境提供，缺失 lihua-file 启动失败**
- `TZ`

### mysql

`mysql` 使用 `mysql:8.0` 镜像，容器名为 `lihua-mysql`，默认映射 `3306:3306`。

当前默认配置：

- root 密码：`password`
- 配置卷：`mysql-conf`
- 数据卷：`mysql-data`

首次部署后，需要导入项目数据库脚本 `deploy/db/lihua.sql`（2.x 升级环境追加 `deploy/db/upgrade-3.0.0.sql`）。可以使用 Navicat、DataGrip 等工具连接宿主机 `3306` 端口后执行，也可以进入容器执行导入命令。默认账号 `admin / 123456`。

生产环境请务必修改 `MYSQL_ROOT_PASSWORD`，并根据需要限制数据库端口对外暴露。

### redis

`redis` 使用 `redis:7` 镜像，容器名为 `lihua-redis`，默认映射 `6379:6379`。

当前启动命令为：

```shell
redis-server --requirepass password
```

生产环境请修改 Redis 密码，并按实际安全策略决定是否暴露 `6379` 端口。

### nacos

`nacos` 使用 `nacos/nacos-server:v3.1.1` 镜像，容器名为 `lihua-nacos`，以单机模式启动。

当前默认配置：

- 控制台端口：宿主机 `8090` 映射到容器 `8080`
- 服务端口：`8848`
- gRPC 端口：`9848`
- 鉴权：已开启
- 默认账号密码：`nacos` / `nacos`
- 命名空间：后端服务默认使用 `prod`
- `NACOS_AUTH_TOKEN`：base64 且解码后 ≥32 字节（v3.1.1 启动强制校验，占位短值直接启动失败）
- healthcheck 走主端口根路径匿名 200（v3.1.1 console 健康端点路径已漂移且开启鉴权后不可用）

**nacos-admin-init 一次性初始化**：nacos ≥2.4 不再内置 admin 默认密码，首次启动须经 v3 官方 API 初始化后各服务才能用 `NACOS_USERNAME/PASSWORD` 登录拉取配置。compose 中 `nacos-admin-init` 服务（curlimages/curl 镜像）会在 nacos 健康后自动调用 admin 初始化 API；由于 nacos 无持久卷（重建数据即失），该服务随每次 `up` 幂等执行（已初始化则登录探活直接成功）。

首次部署时，需要将 `deploy/nacos/nacos_config_export.zip` 导入到 Nacos，并确认配置中的 MySQL、Redis、网关地址、附件签名密钥等参数与当前 compose 环境一致。

### compose.yaml

启动前请根据服务器实际情况修改 `compose.yaml` 中的密码、端口、Nacos token、命名空间、JVM 参数，并在 `.env` 中提供 `ATTACHMENT_DOWNLOAD_SIGN_KEY` 等密钥。

将 `deploy/docker` 目录上传到服务器后，在该目录执行：

```shell
docker compose up -d --build
```

当前 compose 会启动以下容器：

- `lihua-web-client`
- `lihua-auth-server`
- `lihua-system-server`
- `lihua-file-server`
- `lihua-monitor-server`
- `lihua-websocket-server`（WS 连接服务，仅依赖 redis/nacos）
- `lihua-gateway-server`
- `lihua-mysql`
- `lihua-redis`
- `lihua-nacos`
- `lihua-nacos-admin-init`（一次性初始化，执行完成后退出）

如果是首次部署，建议启动基础组件并完成数据初始化后，再启动业务服务：

```shell
docker compose up -d mysql redis nacos nacos-admin-init
```

导入 `deploy/db/lihua.sql` 和 `deploy/nacos/nacos_config_export.zip`，确认配置无误后再执行：

```shell
docker compose up -d --build auth-server system-server file-server monitor-server ws-server gateway-server client
```

各后端服务通过 `depends_on` 声明了启动依赖：mysql/redis/nacos 健康 + nacos-admin-init 执行成功后才会拉起，网关仅依赖 nacos。

查看容器状态和日志：

```shell
docker compose ps
docker compose logs -f gateway-server
docker compose logs -f auth-server
```

配置仅包含基础项目启动，更多生产需求请结合实际情况修改 `dockerfile`、`compose.yaml`、`nginx.conf` 和 Nacos 配置。

## 卷映射

通过卷映射可以持久化数据库、缓存、前端资源、后端 jar 包和服务数据。

Docker 命名卷默认位于服务器 `/var/lib/docker/volumes` 目录下。

- `mysql-conf`：MySQL 配置目录，挂载到 `/etc/mysql/`。
- `mysql-data`：MySQL 数据目录，挂载到 `/var/lib/mysql`。
- `redis-data`：Redis 数据目录，挂载到 `/data/`。
- `dist-resource`：前端资源目录，挂载到 `/usr/share/nginx/html/`。
- `auth-server-data`：认证中心服务数据目录，挂载到 `/lihua-auth/data/`。
- `auth-jar-resource`：认证中心 jar 目录，挂载到 `/app/`。
- `system-server-data`：核心业务服务数据目录，挂载到 `/lihua-system/data/`。
- `system-jar-resource`：核心业务服务 jar 目录，挂载到 `/app/`。
- `file-server-data`：文件服务数据目录，挂载到 `/lihua-file/data/`（**附件上传路径须落在该卷内**）。
- `file-jar-resource`：文件服务 jar 目录，挂载到 `/app/`。
- `gateway-server-data`：网关服务数据目录，挂载到 `/lihua-gateway/data/`。
- `gateway-jar-resource`：网关服务 jar 目录，挂载到 `/app/`。
- `monitor-server-data`：监控服务数据目录，挂载到 `/lihua-monitor/data/`。
- `monitor-jar-resource`：监控服务 jar 目录，挂载到 `/app/`。

注意：各后端服务同时在镜像内复制 jar，并将 `/app/` 映射为命名卷。首次创建命名卷时 Docker 会将镜像内 `/app/` 的 jar 初始化到卷中；后续如果只替换部署目录中的 jar，需要重建镜像并重建对应容器，或直接替换对应 `*-jar-resource` 卷中的 jar。

## 更新版本

### 更新前端

重新打包 `lihua-web`，替换 `deploy/docker/client/dist` 后执行：

```shell
docker compose up -d --build --force-recreate client
```

如果只替换了 `dist-resource` 卷中的静态文件，可重载或重启前端容器：

```shell
docker compose restart client
```

### 更新后端

重新打包目标服务，替换对应目录下的 `*-exec.jar` 后，重建对应容器。

示例：更新网关服务。

```shell
cp lihua-cloud/lihua-gateway/target/lihua-gateway-exec.jar deploy/docker/lihua-gateway/
cd deploy/docker
docker compose up -d --build --force-recreate gateway-server
```

其他后端服务名称对应如下：

- `auth-server`：`lihua-auth/lihua-auth-exec.jar`
- `system-server`：`lihua-system/lihua-system-exec.jar`
- `file-server`：`lihua-file/lihua-file-exec.jar`
- `monitor-server`：`lihua-monitor/lihua-monitor-exec.jar`
- `gateway-server`：`lihua-gateway/lihua-gateway-exec.jar`

> 更换 `rpc.signKey` 时需 auth/system/file/monitor 四个 servlet 服务**同步重建**，滚动替换会出现实例间签名不一致互相拒绝。

### 更新配置

- 修改 `compose.yaml` 后，执行 `docker compose up -d` 使配置生效。
- 修改 `client/nginx.conf` 后，执行 `docker compose up -d --build --force-recreate client`。
- 修改 Nacos 配置后：运行时配置（路由、熔断参数等）推送即生效；**启动期组件配置（数据源、redisson、rpc 连接池、@RemoteClient timeout 等）需重启对应后端容器生效**。
