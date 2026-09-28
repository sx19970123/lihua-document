# AI 辅助开发

狸花猫 3.0 为 AI 辅助开发内置了一套技能（Skills），存放在本仓根目录 `skills/` 下。技能以 Markdown 文件承载项目约定与工作流程，供 Claude Code、Codex 等 AI 编码工具读取——AI 按技能文件中的规范开发，无需每次口头重复约定。

## 🧩 技能清单

| 文件 | 类型 | 用途 |
| --- | --- | --- |
| `skills/init.md` | 初始化流程 | 本仓承接的二次开发初始化步骤（通常由后端仓 init 统一驱动） |
| `skills/lihua-web.md` | 开发规范 | 本仓（Vue 管理端）开发与验证的项目约定 |
| `skills/lihua-init-pattern.md` | 代码组织约定 | 组件逻辑组织范式：`initXxx()` 工厂模式与导包顺序 |

## 🚀 使用方式

### 1. 首次接管：执行 init

下载项目后第一次让 AI 接管时，对 AI 编码工具说：

> 执行 init

**推荐由后端仓（`lihua` / `lihua-cloud`）发起**——后端仓的 init 会统一收集问卷（项目名称、改名层级、版本、裁剪清单）并驱动整个多仓工作区，本仓按 `skills/init.md` 定义承接本仓步骤。单独初始化本仓时，AI 也可按相同问卷口径独立执行。

init 完成时会在各仓根目录生成 `AGENTS.md` 与 `CLAUDE.md` 入口指针（`CLAUDE.md` 内容仅一行 `@AGENTS.md`），此后每次会话 AI 都能自动发现 `skills/` 与技能用途。

### 2. 日常开发：规范自动生效

init 之后（或未做 init 时直接指定），AI 处理本仓改动会按 `skills/lihua-web.md` 中的约定工作：API 层组织、页面与组件范式、init 工厂模式、antdv-next API 核实铁律、样式四层优先级、附件与头像契约、路由与 keep-alive 机制等。你只需用自然语言描述需求。

## 🎯 init：二次开发初始化（本仓承接）

本仓的承接步骤按后端 init 问卷结果执行：

- **改名（按选定层级）**：
  - 品牌层：`src/app-info.ts` 应用名/标题、`index.html` title、登录页文案
  - 品牌+标识层（加）：`package.json` name、存储键前缀（`lihua_*` 前缀 grep 全量定位；改前缀会使用户本地登录态/记忆失效，属预期）
- **版本重置**：`package.json` version → 1.0.0；首页版本记录（`src/views/index/version-record.ts`）重置为「1.0.0 首发」
- **裁剪承接**（按驱动方清单执行对应项，每项删除后 type-check + 残留 grep 审计）：
  - 部门+岗位：部门/岗位页面与 api、顶栏部门切换器、default-dept-select 组件、用户管理部门列、注册默认部门项、向导默认部门步
  - 通知公告：通知页、头部通知组件与角标
  - 监控：`src/views/monitor` 与对应 api
  - 组件演示页：`src/views/component` 演示页与演示路由
- **验证与纪律**：每步 `npm run type-check`、阶段完成 `npm run build`；每步一 commit、不 push；删除先列清单经确认

## 📖 开发规范：lihua-web

处理本仓改动时 AI 自动遵循，覆盖：

- **代码地图**：`src/api/<domain>/<feature>/` + `type/` 类型分层、页面 `src/views/`、组件 `src/components/`、状态 `src/stores/`
- **请求契约**：`request<T>` / `blobRequest`、分页与响应类型、错误处理责任边界（拦截器与调用点分工）、弹窗防刷屏
- **页面范式**：init 工厂模式（一个关注点一个 `initXxx()` 工厂）、页面组件名全局唯一保证 keep-alive 可靠、先复用全局组件
- **antdv-next 铁律**：API 禁止猜测——必须核实 `node_modules/antdv-next` 源码；表单弹窗 `destroy-on-hidden`、Upload 走 `custom-request` 等组件契约
- **样式规范**：UnoCSS 四层优先级、`--ant-*` token 消费（主题色/圆角/暗色自动跟随）、写法坑位速查
- **权限与路由**：`v-hasRole`/`v-hasPermission` 指令、动态菜单与静态路由组合、meta 约定、孪生页 tab 参数模式
- **附件与头像**：`resolveAttachmentEntryUrl` 唯一出口、头像单字段契约、blob URL 所有权
- **图标体系**：`registry.ts` 唯一事实源、svgo 管线、新增第三方图标流程

其中 `lihua-init-pattern.md` 单独定义组件代码组织约定：`initXxx` 工厂函数的骨架与规则（闭包持有私有状态、最小导出）、导包顺序（vue → 生态 → 第三方 → 项目模块 → 组件 → 相对路径 → 副作用）——新建或重构 script setup 组件时遵循。

## ⚠️ 注意事项

- `AGENTS.md` / `CLAUDE.md` 是 **init 的产物**，脚手架仓库本身不携带——首次使用直接对 AI 说「执行 init」即可，不必手动创建。
- 技能文件中的路径与规则随项目演进，改名波及 `skills/` 内路径字样时 init 会同步更新（skill 是活文档）。
- **技能与代码冲突时，以代码为准**，并向使用者回报差异。
