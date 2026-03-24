// @ts-ignore
import type { SidebarItem } from '../types'

export const sidebarDocServerV2: SidebarItem[] = [
  {
    text: '后端文档',
    items: [
      {
        text: '基础',
        items: [
          { text: '概览', link: '/2.0/doc-server/basic/overview' },
          { text: '项目启动', link: '/2.0/doc-server/basic/start' },
          { text: '新增子模块', link: '/2.0/doc-server/basic/module' },
          { text: '依赖维护', link: '/2.0/doc-server/basic/dependency' },
        ]
      },
      {
        text: '开发规范',
        items: [
          { text: 'controller', link: '/2.0/doc-server/standard/controller' },
          { text: 'service', link: '/2.0/doc-server/standard/service' },
          { text: 'mapper', link: '/2.0/doc-server/standard/mapper' },
          { text: '数据模型', link: '/2.0/doc-server/standard/data' },
        ]
      },
      {
        text: 'base 基础能力层',
        items: [
          { text: 'attachment 附件', link: '/2.0/doc-server/base/attachment' },
          { text: 'captcha 验证码', link: '/2.0/doc-server/base/captcha' },
          { text: 'common 公共模块', link: '/2.0/doc-server/base/common' },
          { text: 'dict 字典', link: '/2.0/doc-server/base/dict' },
          { text: 'doc 接口文档', link: '/2.0/doc-server/base/doc' },
          { text: 'excel Excel导入导出', link: '/2.0/doc-server/base/excel' },
          { text: 'ip ip能力', link: '/2.0/doc-server/base/ip' },
          { text: 'job 定时任务', link: '/2.0/doc-server/base/job' },
          { text: 'mybatis 持久化层', link: '/2.0/doc-server/base/mybatis' },
          { text: 'redis 系统缓存', link: '/2.0/doc-server/base/redis' },
          { text: 'security 系统安全', link: '/2.0/doc-server/base/security' },
          { text: 'sensitive 数据脱敏', link: '/2.0/doc-server/base/sensitive' },
          { text: 'web web配置', link: '/2.0/doc-server/base/web' },
          { text: 'websocket 实时通信', link: '/2.0/doc-server/base/websocket' },
        ]
      },
      {
        text: '项目部署',
        items: [
          { text: '打包部署', link: '/2.0/doc-server/deploy/deploy' },
          { text: 'docker部署', link: '/2.0/doc-server/deploy/docker' },
        ]
      }
    ]
  }
]
