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
        text: '系统组件',
        items: [
          { text: '用户上下文', link: '/2.0/doc-server/component/context' },
          { text: 'Redis 缓存', link: '/2.0/doc-server/component/redis' },
          { text: 'Excel 导入导出', link: '/2.0/doc-server/component/excel' },
          { text: '工具类', link: '/2.0/doc-server/component/utils' },
          { text: '注解', link: '/2.0/doc-server/component/annotation' },
          { text: '附件', link: '/2.0/doc-server/component/file' },
          { text: 'WebSocket', link: '/2.0/doc-server/component/websocket' },
          { text: '定时任务', link: '/2.0/doc-server/component/schedule' },
        ]
      },
      {
        text: '接口与文档',
        items: [{ text: 'Knife4j 文档', link: '/2.0/doc-server/doc/knife4j' }]
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
