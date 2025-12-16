import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "狸花猫后台管理系统",
  // 浏览器标签页logo监听暗色模式变化
  head: [
    ['link', { rel: 'icon', href: '/static/miaomiao.png' }],
    ['script', {}, `
      (function() {
        const link = document.querySelector("link[rel='icon']")
        function setFavicon() {
          const isDark = document.documentElement.classList.contains('dark')
          link.href = isDark ? '/static/heihei.png' : '/static/miaomiao.png'
        }
        setFavicon()
        new MutationObserver(setFavicon).observe(
          document.documentElement, 
          { attributes: true, attributeFilter: ['class'] }
        )
      })()
    `]
  ],
  lastUpdated: true,
  description: "LiHua",
  themeConfig: {
    search: {
      provider: 'local'
    },
    logo: {
      light: '/static/miaomiao.png',  // 亮色主题图标
      dark: '/static/heihei.png',    // 暗色主题图标
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '后端', link: '/doc-server/server.md' },
      { text: '前端', link: '/doc-web/web.md' },
      { text: '移动端', link: '/doc-app/basic/overview' },
      {
        text: '版本',
        items: [
          { text: 'web端 1.3.0', link: 'https://gitee.com/yukino_git/lihua/releases' },
          { text: '移动端 1.0.0', link: 'https://gitee.com/yukino_git/lihua-app/releases' }
        ]
      }
    ],
    sidebar: {
        '/overview/': [
            {
                text: '项目概览',
                items: [
                    { text: '介绍', link: '/doc-server/server' },
                ]
            }
        ],
        '/doc-server/': [
            {
                text: '后端文档',
                items: [
                    {
                        text: '基础',
                        items: [
                            { text: '概览', link: '/doc-server/server' },
                            { text: '项目启动', link: '/doc-server/start' },
                            { text: '新增子模块', link: '/doc-server/module' },
                            { text: '依赖维护', link: '/doc-server/dependency' },
                        ]
                    },
                    {
                        text: '开发规范',
                        items: [
                            { text: 'controller', link: '/doc-server/business' },
                            { text: 'service', link: '/doc-server/business' },
                            { text: 'mapper', link: '/doc-server/business' },
                            { text: '数据模型', link: '/doc-server/business' },
                        ]
                    },
                    {
                        text: '系统组件',
                        items: [
                            { text: '用户上下文', link: '/doc-server/context' },
                            { text: 'Redis 缓存', link: '/doc-server/redis' },
                            { text: 'Excel 导入导出', link: '/doc-server/redis' },
                            { text: '工具类', link: '/doc-server/utils' },
                            { text: '注解', link: '/doc-server/annotation' },
                            { text: '附件', link: '/doc-server/file' },
                            { text: 'WebSocket', link: '/doc-server/websocket' },
                            { text: '定时任务', link: '/doc-server/schedule' },
                        ]
                    },
                    {
                        text: '接口与文档',
                        items: [
                            { text: 'Knife4j 文档', link: '/doc-server/knife4j' }
                        ]
                    },
                    {
                        text: '项目部署',
                        items: [
                            { text: '项目打包', link: '/doc-server/knife4j' }
                        ]
                    }
                ]
            }
        ],
        '/doc-web/': [
            {
                text: '前端文档',
                items: [
                    {
                        text: '基础',
                        items: [
                            { text: '概览', link: '/doc-server/server' },
                            { text: '项目启动', link: '/doc-server/start' },
                        ]
                    },
                    {
                        text: '开发规范',
                        items: [
                            { text: 'api', link: '/doc-server/business' },
                            { text: '页面与组件', link: '/doc-server/business' },
                        ]
                    },
                    {
                        text: '业务开发',
                        items: [
                            { text: '用户信息', link: '/doc-server/business' },
                            { text: 'layout', link: '/doc-server/context' },
                            { text: '系统字典', link: '/doc-server/context' },
                            { text: '自定义图标', link: '/doc-server/context' },
                            { text: 'websocket', link: '/doc-server/redis' },
                        ]
                    },
                    {
                        text: '核心机制',
                        items: [
                            { text: '状态管理', link: '/doc-server/business' },
                            { text: '路由与菜单', link: '/doc-server/redis' },
                        ]
                    },
                    {
                        text: '系统工具',
                        items: [
                            { text: '工具类', link: '/doc-server/business' },
                            { text: '指令', link: '/doc-server/redis' },
                        ]
                    },
                    {
                        text: '内置组件',
                        items: [
                            { text: '可展开卡片', link: '/doc-server/business' },
                            { text: '用户展示', link: '/doc-server/redis' },
                            { text: '字典标签', link: '/doc-server/redis' },
                            { text: '全屏遮罩', link: '/doc-server/redis' },
                            { text: '表格设置', link: '/doc-server/redis' },
                            { text: '简单树形选择', link: '/doc-server/redis' },
                            { text: '可选择卡片', link: '/doc-server/redis' },
                            { text: '富文本编辑器', link: '/doc-server/redis' },
                            { text: '颜色选择', link: '/doc-server/redis' },
                            { text: '图标选择', link: '/doc-server/redis' },
                            { text: '图片剪裁', link: '/doc-server/redis' },
                            { text: '用户选择', link: '/doc-server/redis' },
                            { text: '附件上传', link: '/doc-server/redis' },
                        ]
                    },
                    {
                        text: '项目部署',
                        items: [
                            { text: '项目打包', link: '/doc-server/knife4j' }
                        ]
                    }
                ]
            }
        ],
        '/doc-app/': [
            {
                text: '移动端文档',
                items: [
                    {
                        text: '基础',
                        items: [
                            { text: '概览', link: '/doc-app/basic/overview' },
                            { text: '项目启动', link: '/doc-app/basic/start' },
                        ]
                    },
                    {
                        text: '开发规范',
                        items: [
                            { text: 'api', link: '/doc-app/standard/api' },
                            { text: '页面与组件', link: '/doc-app/standard/component-page' },
                        ]
                    },
                    {
                        text: '核心机制',
                        items: [
                            { text: '状态管理', link: '/doc-app/core/store' },
                            { text: '路由与菜单', link: '/doc-app/core/router' },
                        ]
                    },
                    {
                        text: '业务开发',
                        items: [
                            { text: '用户信息', link: '/doc-app/business/user-info' },
                            { text: '自定义图标', link: '/doc-app/business/icon' },
                            { text: '系统字典', link: '/doc-app/business/dict' },
                            { text: 'websocket', link: '/doc-app/business/websocket' },
                        ]
                    },
                    {
                        text: '系统工具',
                        items: [
                            { text: '工具类', link: '/doc-app/utils/utils' }
                        ]
                    },
                    {
                        text: '内置组件',
                        items: [
                            { text: '附件上传', link: '/doc-app/components/attachment' },
                            { text: '颜色选择', link: '/doc-app/components/color-select' },
                            { text: '字典标签', link: '/doc-app/components/dict-tag' },
                            { text: '图标选择', link: '/doc-app/components/icon-select' },
                            { text: '消息通知', link: '/doc-app/components/notice-message' },
                        ]
                    },
                    {
                        text: '项目部署',
                        items: [
                            { text: '打包部署', link: '/doc-app/deploy/deploy' }
                        ]
                    }
                ]
            }
        ]
    },
    outline: {
      level: [2, 6],      // 显示的标题级别：h2 到 h6
      label: '本页目录'    // 标题文字
    },
    socialLinks: [
      { icon: 'gitee', link: 'https://gitee.com/yukino_git' },
      { icon: 'github', link: 'https://github.com/sx19970123/lihua' },
      { icon: 'gitcode', link: 'https://gitcode.com/weixin_44118742/lihua' },
    ]
  }
})
