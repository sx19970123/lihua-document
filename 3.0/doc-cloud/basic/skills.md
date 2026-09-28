# AI 辅助开发

狸花猫 3.0 为 AI 辅助开发内置了一套技能（Skills），存放在本仓根目录 `skills/` 下。技能以 Markdown 文件承载项目约定与工作流程，供 Claude Code、Codex 等 AI 编码工具读取——AI 按技能文件中的规范开发，无需每次口头重复约定。

## 🧩 技能清单

| 文件 | 类型 | 用途 |
| --- | --- | --- |
| `skills/init.md` | 初始化流程 | 脚手架二次开发初始化：项目改名（含服务名联动）、版本重置、功能裁剪、多仓工作区布局 |
| `skills/lihua-cloud-backend.md` | 开发规范 | 本仓（微服务后端）服务端开发与验证的项目约定 |

## 🚀 使用方式

### 1. 首次接管：执行 init

下载项目后第一次让 AI 接管时，对 AI 编码工具说：

> 执行 init

AI 会读取 `skills/init.md` 并按流程执行：**工作区发现 → 问卷 → 改动清单确认 → 分步执行 → 验证报告**。init 完成时会在各仓根目录生成 `AGENTS.md` 与 `CLAUDE.md` 入口指针（`CLAUDE.md` 内容仅一行 `@AGENTS.md`），此后每次会话 AI 都能自动发现 `skills/` 与技能用途。

### 2. 日常开发：规范自动生效

init 之后（或未做 init 时直接指定），AI 处理本仓改动会按 `skills/lihua-cloud-backend.md` 中的约定工作：六服务边界、Gateway 路由与过滤器、`@RemoteClient` 远程调用与熔断、Nacos 配置、字典与枚举纪律、附件域契约、WebSocket 推送用法、删码死活判定纪律等。你只需用自然语言描述需求。

## 🎯 init：二次开发初始化

init 的定位是「把脚手架变成你的项目」——**问卷 → 改动清单确认 → 分步执行（每步验证 + commit）**，纪律高于速度。

**工作区协同**：init 以本仓为驱动、覆盖整个多仓工作区（本后端 + `lihua-web` / `lihua-app` 兄弟仓）；`lihua` 与 `lihua-cloud` 是二选一的两套后端，同存于一个工作区时 init 会先确认初始化哪套。最少组合为「后端 + lihua-web」。

**Phase 1 问卷内容**（均带默认值，一次收集）：

1. **项目名称**：新名 slug（包名/artifactId/数据库名/存储键前缀/**服务名**）+ 中文名（品牌显示）。
2. **改名层级**（三档，向上包含）：
   - **品牌层**：README、web/app 应用名与页面标题、登录页文案、compose 项目名
   - **品牌+标识层**（加）：Maven artifactId 与模块/服务目录名、数据库名（nacos 种子内 jdbc url）、package.json name、存储键前缀、**nacos 配置种子与服务名同步**（`spring.application.name`、`spring.config.import` 引用串、路由 `lb://<服务名>`）
   - **全量**（加）：Java 包名 `com.lihua` → `com.<slug>`（约 300+ 文件/服务，纯机械替换 + 编译兜底）
3. **初始版本**：默认重置为 1.0.0（后端 pom、前端 package.json、App versionCode=100、首页版本记录）。
4. **功能裁剪**（多选预设，先出细清单经确认再删）：
   - **部门+岗位**：联动面最大——域本体、用户管理消费点、注册链路、默认部门切换、登录后向导、SQL 种子与两端页面
   - **App 端**：删除各服务 `controller/app` 包，双版本基类下放合并，网关 `/app/...` 路由清理
   - **监控**：删 `lihua-biz/lihua-monitor` 服务、nacos 种子、网关路由与两端页面
   - **组件演示页**：删两端演示页与演示路由
   - **通知公告**：notice 域 + WS 红点链路 + 两端通知页面（可连带裁 `lihua-websocket` 服务）
5. 复述全部选择确认后执行。

**执行纪律**：每步一 commit（用户项目历史从 init 开始）、不 push；所有删除先列清单经确认；产出 INIT-REPORT（含**服务名映射表**、裁剪清单、豁免项、后续建议）。

## 📖 开发规范：lihua-cloud-backend

处理本仓服务端改动时 AI 自动遵循，覆盖：

- **服务边界**：六服务职责划分；biz 服务平级互不依赖，跨服务一切走 `lihua-api` RPC + 熔断；服务内跨模块用领域事件（进程内事件不跨服务）
- **新增业务接入四件套**：网关路由（order 先于通配）→ SecurityConfig 免登录登记 → 按需建 client/facade 契约 → nacos 配置种子
- **远程调用**：`@RemoteClient` + `@HttpExchange` 声明式客户端、facade + `@CircuitBreaker` 熔断降级、「一个接口两个实现」的本地/远程双通道范式
- **云端运行态**：Nacos v3.1.1 鉴权三件套、优雅停机窗口、`@InternalOnly` 内部 RPC 签名（留章去窗）、网关双层鉴权与 CORS
- **业务规范**：与单体版同基线的 Controller/Service/Mapper 结构、字典与枚举纪律、附件域契约（归属 file 服务）、WebSocket 推送（经 lihua-base-ws 投递）
- **删码纪律**：死活判定（getter/setter 形态 grep、消费方编译佐证、依赖分析误报甄别）
- **部署与验证**：镜像选型纪律、compose 六服务、`mvn -pl <module> -am` 定向验证

## ⚠️ 注意事项

- `AGENTS.md` / `CLAUDE.md` 是 **init 的产物**，脚手架仓库本身不携带——首次使用直接对 AI 说「执行 init」即可，不必手动创建。
- 技能文件中的路径与规则随项目演进，改名波及 `skills/` 内路径字样时 init 会同步更新（skill 是活文档）。
- **技能与代码冲突时，以代码为准**，并向使用者回报差异。
