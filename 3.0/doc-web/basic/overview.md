# Lihua Vue
**SpringBoot单体版 与 SpringCloud微服务版 可共用Web端**


狸花猫后台管理系统，基于Vue3 TypeScript开发



## ✨ 功能特性

- 🆕 **持续更新**：持续监控依赖安全漏洞，及时跟进升级与修复
- 📢 **实时通信**：内置 WebSocket 消息推送机制，支持服务端向客户端实时推送消息
- 🧰 **工具集合**：提供树形结构处理、数据字典翻译、附件下载等高频通用工具
- 🎨 **高度可配置**：支持亮/暗/跟随系统三档外观、主题色定制、毛玻璃虚化效果、四种导航布局等个性化配置
- 🧩 **内置扩展组件**：内置多种业务常用组件，如卡片展开、用户选择、附件上传等，开箱即用



## 🛠️ 技术特性

- 🖖 **Vue 3**：基于 Composition API 的现代前端框架
- 🧑‍💻 **TypeScript**：提供完善的类型系统，提升可维护性与开发体验
- 🧱 **Antdv Next**：企业级 UI 组件库（antdv-next，3.0 由 ant-design-vue 迁移而来），统一交互与视觉规范
- 🧠 **Pinia**：新一代状态管理方案，轻量且直观
- ⚡ **Vite 8**：极速构建，type-check 与 build 并行执行
- 🎯 **UnoCSS**：原子化 CSS，样式值跟随组件库 `--ant-*` 主题 token
- 📝 **TinyMCE 8**：富文本编辑器（3.0 由 Vditor 迁移而来），图片/媒体/文件统一走附件上传
- 🎉 **快乐工作主题**：集成 @antdv-next/happy-work-theme，支持趣味点击特效



## 🧩 组件库

- **UI 组件库**：[antdv-next（Antdv Next）](https://www.antdv-next.cn)



## 📦 在线体验

- 👉 [点击访问](https://lihua.xyz/login)



## 🖼️ 项目截图



::: info 部分截图

<img src="/3.0/shots/home-light.png" width="100%" />

<img src="/3.0/shots/home-dark.png" width="100%" />

:::



## 📁 项目目录结构

``` text
lihua-web                 # 前端工程  
├── public                # 公共文件  
├── src                   # 工程主目录  
│    ├── antd-adapter     # antdv-next 统一出口（message/notification/Modal 上下文接线）  
│    ├── api              # axios接口目录（global/monitor/system 分域 + type 类型）  
│    ├── assets           # 静态资源  
│    ├── components       # 公共组件  
│    ├── directive        # vue指令  
│    ├── helpers          # 业务辅助函数（token/auth/dict/avatar/lock-screen/remember 等）  
│    ├── layout           # layout布局（side/mix/top/drawer 四种导航 + view-tabs 多标签）  
│    ├── router           # 路由（仅静态路由）  
│    ├── static           # 静态资源  
│    ├── stores           # pinia（user/permission/theme/dict/setting/view-tabs）  
│    ├── utils            # 工具类  
│    ├── views            # 页面目录  
│    ├── App.vue          # vue主文件（ConfigProvider 主题接线 + a-app + HappyProvider）  
│    ├── app-init.ts      # 应用初始化（initApp/refreshApp：用户信息→主题→动态路由→菜单→viewTabs）  
│    ├── main.ts          # vue 主入口配置文件  
│    ├── permission.ts    # 全局路由守卫  
│    ├── settings.ts      # 系统配置文件  
├── package.json          # 项目包管理文件  
├── tsconfig.json         # ts配置文件  
├── vite.config.ts        # vite配置文件  
```

## 📄 许可证

本项目采用 **MIT License** 开源协议，详情请查看 `LICENSE` 文件。
