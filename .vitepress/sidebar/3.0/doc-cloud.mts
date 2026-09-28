// @ts-ignore
import type { SidebarItem } from '../types'

export const sidebarDocCloudV3: SidebarItem[] = [
  {
    text: 'SpringCloud 后端文档',
    items: [
      {
        text: '基础',
        items: [
          { text: '概览', link: '/3.0/doc-cloud/basic/overview' },
          { text: '项目启动', link: '/3.0/doc-cloud/basic/start' },
          { text: '新增子模块', link: '/3.0/doc-cloud/basic/module' },
          { text: '依赖维护', link: '/3.0/doc-cloud/basic/dependency' },
          { text: 'AI 辅助开发', link: '/3.0/doc-cloud/basic/skills' },
        ]
      },
      {
        text: '开发规范',
        items: [
          { text: 'controller', link: '/3.0/doc-cloud/standard/controller' },
          { text: 'service', link: '/3.0/doc-cloud/standard/service' },
          { text: 'mapper', link: '/3.0/doc-cloud/standard/mapper' },
          { text: '数据模型', link: '/3.0/doc-cloud/standard/data' },
          { text: '远程调用', link: '/3.0/doc-cloud/standard/api' },
          { text: '网关', link: '/3.0/doc-cloud/standard/gateway' },
        ]
      },
      {
        text: 'base 基础能力层',
        items: [
          { text: 'attachment 附件', link: '/3.0/doc-cloud/base/attachment' },
          { text: 'cache 系统缓存', link: '/3.0/doc-cloud/base/cache' },
          { text: 'captcha 验证码', link: '/3.0/doc-cloud/base/captcha' },
          { text: 'client 远程调用', link: '/3.0/doc-cloud/base/client' },
          { text: 'common 公共模块', link: '/3.0/doc-cloud/base/common' },
          { text: 'dict 字典', link: '/3.0/doc-cloud/base/dict' },
          { text: 'doc 接口文档', link: '/3.0/doc-cloud/base/doc' },
          { text: 'excel 导入导出', link: '/3.0/doc-cloud/base/excel' },
          { text: 'ip 地址相关', link: '/3.0/doc-cloud/base/ip' },
          { text: 'job 定时任务', link: '/3.0/doc-cloud/base/job' },
          { text: 'log 系统日志', link: '/3.0/doc-cloud/base/log' },
          { text: 'mybatis 持久化层', link: '/3.0/doc-cloud/base/mybatis' },
          { text: 'security 系统安全', link: '/3.0/doc-cloud/base/security' },
          { text: 'sensitive 数据脱敏', link: '/3.0/doc-cloud/base/sensitive' },
          { text: 'web 配置', link: '/3.0/doc-cloud/base/web' },
          { text: 'websocket 实时通信', link: '/3.0/doc-cloud/base/websocket' },
        ]
      },
      {
        text: '服务介绍',
        items: [
          { text: '网关服务 lihua-gateway', link: '/3.0/doc-cloud/services/gateway' },
          { text: '认证服务 lihua-auth', link: '/3.0/doc-cloud/services/auth' },
          { text: '系统服务 lihua-system', link: '/3.0/doc-cloud/services/system' },
          { text: '文件服务 lihua-file', link: '/3.0/doc-cloud/services/file' },
          { text: '监控服务 lihua-monitor', link: '/3.0/doc-cloud/services/monitor' },
          { text: 'WS 连接服务 lihua-websocket', link: '/3.0/doc-cloud/services/ws' },
        ]
      },
      {
        text: '项目部署',
        items: [
          { text: '打包部署', link: '/3.0/doc-cloud/deploy/deploy' },
          { text: 'docker部署', link: '/3.0/doc-cloud/deploy/docker' },
        ]
      }
    ]
  }
]
