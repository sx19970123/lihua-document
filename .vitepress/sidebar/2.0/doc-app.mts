// @ts-ignore
import type { SidebarItem } from '../types'

export const sidebarDocAppV2: SidebarItem[] = [
  {
    text: '移动端文档',
    items: [
      {
        text: '基础',
        items: [
          { text: '概览', link: '/2.0/doc-app/basic/overview' },
          { text: '项目启动', link: '/2.0/doc-app/basic/start' },
        ]
      },
      {
        text: '开发规范',
        items: [
          { text: 'api', link: '/2.0/doc-app/standard/api' },
          { text: '页面与组件', link: '/2.0/doc-app/standard/component-page' },
        ]
      },
      {
        text: '核心机制',
        items: [
          { text: '状态管理', link: '/2.0/doc-app/core/store' },
          { text: '路由', link: '/2.0/doc-app/core/router' },
        ]
      },
      {
        text: '业务开发',
        items: [
          { text: '用户信息', link: '/2.0/doc-app/development/user-info' },
          { text: '根节点', link: '/2.0/doc-app/development/root' },
          { text: '自定义图标', link: '/2.0/doc-app/development/icon' },
          { text: '系统字典', link: '/2.0/doc-app/development/dict' },
          { text: 'Websocket', link: '/2.0/doc-app/development/websocket' }
        ]
      },
      {
        text: '系统工具',
        items: [{ text: '工具类', link: '/2.0/doc-app/utils/utils' }]
      },
      {
        text: '内置组件',
        items: [
          {
            text: '数据展示',
            items: [
              { text: '字典标签', link: '/2.0/doc-app/components/dict-tag' },
              { text: '消息通知', link: '/2.0/doc-app/components/notice-message' },
            ]
          },
          {
            text: '数据绑定',
            items: [
              { text: '附件上传', link: '/2.0/doc-app/components/attachment' },
              { text: '颜色选择', link: '/2.0/doc-app/components/color-select' },
              { text: '图标选择', link: '/2.0/doc-app/components/icon-select' },
            ]
          }
        ]
      },
      {
        text: '项目部署',
        items: [{ text: '打包部署', link: '/2.0/doc-app/deploy/deploy' }]
      }
    ]
  }
]
