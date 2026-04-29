// @ts-ignore
import type { SidebarItem } from '../types'

export const sidebarDocCloudV2: SidebarItem[] = [
  {
    text: 'SpringCloud 后端文档',
    items: [
      {
        text: '基础',
        items: [
          { text: '概览', link: '/2.0/doc-cloud/basic/overview' },
          { text: '项目启动', link: '/2.0/doc-cloud/basic/start' },
          { text: '新增子模块', link: '/2.0/doc-cloud/basic/module' },
          { text: '依赖维护', link: '/2.0/doc-cloud/basic/dependency' },
        ]
      },
      {
        text: '开发规范',
        items: [
          { text: 'controller', link: '/2.0/doc-cloud/standard/controller' },
          { text: 'service', link: '/2.0/doc-cloud/standard/service' },
          { text: 'mapper', link: '/2.0/doc-cloud/standard/mapper' },
          { text: '数据模型', link: '/2.0/doc-cloud/standard/data' },
        ]
      },
      {
        text: 'base 基础能力层',
        items: [
          { text: 'attachment 附件', link: '/2.0/doc-cloud/base/attachment' },
          { text: 'cache 系统缓存', link: '/2.0/doc-cloud/base/cache' },
          { text: 'captcha 验证码', link: '/2.0/doc-cloud/base/captcha' },
          { text: 'common 公共模块', link: '/2.0/doc-cloud/base/common' },
          { text: 'dict 字典', link: '/2.0/doc-cloud/base/dict' },
          { text: 'doc 接口文档', link: '/2.0/doc-cloud/base/doc' },
          { text: 'excel 导入导出', link: '/2.0/doc-cloud/base/excel' },
          { text: 'ip 地址相关', link: '/2.0/doc-cloud/base/ip' },
          { text: 'job 定时任务', link: '/2.0/doc-cloud/base/job' },
          { text: 'log 系统日志', link: '/2.0/doc-cloud/base/log' },
          { text: 'mybatis 持久化层', link: '/2.0/doc-cloud/base/mybatis' },
          { text: 'security 系统安全', link: '/2.0/doc-cloud/base/security' },
          { text: 'sensitive 数据脱敏', link: '/2.0/doc-cloud/base/sensitive' },
          { text: 'web 配置', link: '/2.0/doc-cloud/base/web' },
          { text: 'websocket 实时通信', link: '/2.0/doc-cloud/base/websocket' },
        ]
      },
      {
        text: '项目部署',
        items: [
          { text: '打包部署', link: '/2.0/doc-cloud/deploy/deploy' },
          { text: 'docker部署', link: '/2.0/doc-cloud/deploy/docker' },
        ]
      }
    ]
  }
]
