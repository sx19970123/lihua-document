// @ts-ignore
import type { SidebarItem } from '../types'

export const sidebarDocWebV2: SidebarItem[] = [
  {
    text: '前端文档',
    items: [
      {
        text: '基础',
        items: [
          { text: '概览', link: '/2.0/doc-web/basic/overview' },
          { text: '项目启动', link: '/2.0/doc-web/basic/start' },
        ]
      },
      {
        text: '开发规范',
        items: [
          { text: 'api', link: '/2.0/doc-web/standard/api' },
          { text: '页面与组件', link: '/2.0/doc-web/standard/component-page' },
        ]
      },
      {
        text: '业务开发',
        items: [
          { text: '用户信息', link: '/2.0/doc-web/development/user-info' },
          { text: 'layout', link: '/2.0/doc-web/development/layout' },
          { text: '系统主题', link: '/2.0/doc-web/development/theme' },
          { text: '系统字典', link: '/2.0/doc-web/development/sys-dict' },
          { text: '自定义图标', link: '/2.0/doc-web/development/icon' },
          { text: 'Websocket', link: '/2.0/doc-web/development/websocket' },
        ]
      },
      {
        text: '核心机制',
        items: [
          { text: '状态管理', link: '/2.0/doc-web/core/store' },
          { text: '路由与菜单', link: '/2.0/doc-web/core/router' },
        ]
      },
      {
        text: '系统工具',
        items: [
          { text: '工具类', link: '/2.0/doc-web/utils/utils' },
          { text: '指令', link: '/2.0/doc-web/utils/directive' },
        ]
      },
      {
        text: '内置组件',
        items: [
          {
            text: '数据展示',
            items: [
              { text: '可展开卡片', link: '/2.0/doc-web/components/expandable-card' },
              { text: '用户展示', link: '/2.0/doc-web/components/user-show' },
              { text: '字典标签', link: '/2.0/doc-web/components/dict-tag' },
              { text: '全屏遮罩', link: '/2.0/doc-web/components/mask' },
              { text: '表格设置', link: '/2.0/doc-web/components/table-setting' }
            ]
          },
          {
            text: '数据绑定',
            items: [
              { text: '简单树形选择', link: '/2.0/doc-web/components/easy-tree-select' },
              { text: '可选择卡片', link: '/2.0/doc-web/components/selectable-card' },
              { text: '富文本编辑器', link: '/2.0/doc-web/components/editor' },
              { text: '颜色选择', link: '/2.0/doc-web/components/color-select' },
              { text: '图标选择', link: '/2.0/doc-web/components/icon-select' },
              { text: '图片剪裁', link: '/2.0/doc-web/components/image-cropper' },
              { text: '用户选择', link: '/2.0/doc-web/components/user-select' },
              { text: '附件上传', link: '/2.0/doc-web/components/attachment-upload' }
            ]
          }
        ]
      },
      {
        text: '项目部署',
        items: [
          { text: '打包部署', link: '/2.0/doc-web/deploy/deploy' },
          { text: 'docker部署', link: '/2.0/doc-web/deploy/docker' },
        ]
      }
    ]
  }
]
