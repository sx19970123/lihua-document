# AI 辅助开发

狸花猫 3.0 为 AI 辅助开发内置了一套技能（Skills），存放在本仓根目录 `skills/` 下。技能以 Markdown 文件承载项目约定与工作流程，供 Claude Code、Codex 等 AI 编码工具读取——AI 按技能文件中的规范开发，无需每次口头重复约定。

## 🧩 技能清单

| 文件 | 类型 | 用途 |
| --- | --- | --- |
| `skills/init.md` | 初始化流程 | 本仓承接的二次开发初始化步骤（通常由后端仓 init 统一驱动） |
| `skills/lihua-app.md` | 开发规范 | 本仓（UniApp 移动端）开发与验证的项目约定 |

## 🚀 使用方式

### 1. 首次接管：执行 init

下载项目后第一次让 AI 接管时，对 AI 编码工具说：

> 执行 init

**推荐由后端仓（`lihua` / `lihua-cloud`）发起**——后端仓的 init 会统一收集问卷（项目名称、改名层级、版本、裁剪清单）并驱动整个多仓工作区，本仓按 `skills/init.md` 定义承接本仓步骤；用户确认不需要移动端时不初始化本仓。单独初始化本仓时，AI 也可按相同问卷口径独立执行。

init 完成时会在各仓根目录生成 `AGENTS.md` 与 `CLAUDE.md` 入口指针（`CLAUDE.md` 内容仅一行 `@AGENTS.md`），此后每次会话 AI 都能自动发现 `skills/` 与技能用途。

### 2. 日常开发：规范自动生效

init 之后（或未做 init 时直接指定），AI 处理本仓改动会按 `skills/lihua-app.md` 中的约定工作：pages.json 与分包、sard 组件契约、路由守卫、App 专用后端接口、字典/附件/通知/主题、跨平台条件编译等。你只需用自然语言描述需求。

## 🎯 init：二次开发初始化（本仓承接）

本仓的承接步骤按后端 init 问卷结果执行：

- **改名（按选定层级）**：
  - 品牌层：`src/manifest.json` name、首页亮暗徽章文案、登录页文案
  - 品牌+标识层（加）：`package.json` name、存储键前缀（`lihua_*` 前缀 grep 全量定位；改前缀会清除用户本地登录态/记忆，属预期）
- **版本重置**：`package.json` version → 1.0.0；`manifest.json` versionName → 1.0.0、**versionCode → 100**（App 版本检查按 versionCode 数值比较，留百位空间）
- **裁剪承接**（按驱动方清单执行对应项，每项删除后 type-check + 残留 grep 审计）：
  - 部门+岗位：向导默认部门步、设置页修改默认部门、`stores/user.ts` 部门状态、Profile 部门岗位展示、相关 api
  - 通知公告：通知中心、红点链路消费点、推送横幅资产
  - 组件演示页：`subpackages/system` 内演示性质页面（公共组件本体保留）
- **验证与纪律**：每步 `npm run type-check`；涉及页面/交互的裁剪列出真机人工回归点；每步一 commit、不 push；删除先列清单经确认

## 📖 开发规范：lihua-app

处理本仓改动时 AI 自动遵循，覆盖：

- **代码地图**：`src/api` 分层、主包/分包页面组织（业务功能页进 `subpackages/<domain>/` 避免主包膨胀）、六个 Pinia store、路由守卫与公开白名单
- **请求与上传**：统一 request 封装（401 登录页特殊处理）、上传超时独立 60s、multipart Content-Type 平台契约、`formData` 值必须字符串
- **附件**：附件访问链单字段契约（`resolveAttachmentEntryUrl` 唯一出口）、附件状态字典、v-model 持久化 id
- **WebSocket 与通知**：重连形态（2s×3 次）、`manualReconnect` 外部恢复通道、tabBar 红点唯一值驱动
- **组件契约与坑位**：sard 样式覆盖三连坑、captcha 坐标系契约、refresh-content 使用前提与侧滑锁定、message-notify 原生横幅绘制契约
- **跨平台归一层**：域入口 + `platform/`（h5/app/mp）伴随文件的条件编译架构
- **主题与暗色**：`isDark` getter 唯一判定、`theme-dark` class 桥接、H5/小程序差异
- **版本基线**：@dcloudio 与 HBuilderX 版本配对、vite/sass 钉版原因、TS 6 已知坑
- **验证边界**：AI 以 type-check/构建/静态检查为界——页面视觉与交互由用户真机回归

## ⚠️ 注意事项

- `AGENTS.md` / `CLAUDE.md` 是 **init 的产物**，脚手架仓库本身不携带——首次使用直接对 AI 说「执行 init」即可，不必手动创建。
- 技能文件中的路径与规则随项目演进，改名波及 `skills/` 内路径字样时 init 会同步更新（skill 是活文档）。
- **技能与代码冲突时，以代码为准**，并向使用者回报差异。
