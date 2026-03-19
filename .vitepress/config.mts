import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  base: '/',
  title: "狸花猫后台管理系统",
  // 浏览器标签页logo监听暗色模式变化
  head: [
    ['link', { rel: 'icon', href: '/miaomiao.png' }],
    ['script', {}, `
      (function() {
        const link = document.querySelector("link[rel='icon']")
        function setFavicon() {
          const isDark = document.documentElement.classList.contains('dark')
          link.href = isDark ? '/heihei.png' : '/miaomiao.png'
        }
        setFavicon()
        new MutationObserver(setFavicon).observe(
          document.documentElement, 
          { attributes: true, attributeFilter: ['class'] }
        )
      })()
    `],
    ['style', {}, `
      .is-platform-nav-hidden .VPNavBarMenu .VPNavBarMenuLink[href^="/1.0/doc-server/"],
      .is-platform-nav-hidden .VPNavBarMenu .VPNavBarMenuLink[href^="/2.0/doc-server/"],
      .is-platform-nav-hidden .VPNavBarMenu .VPNavBarMenuLink[href^="/1.0/doc-web/"],
      .is-platform-nav-hidden .VPNavBarMenu .VPNavBarMenuLink[href^="/2.0/doc-web/"],
      .is-platform-nav-hidden .VPNavBarMenu .VPNavBarMenuLink[href^="/1.0/doc-app/"],
      .is-platform-nav-hidden .VPNavBarMenu .VPNavBarMenuLink[href^="/2.0/doc-app/"] {
        display: none !important;
      }

      .VPNavBarMenu .VPFlyout .button[data-version-menu="true"],
      .VPNavBarMenu .VPFlyout .button[data-version-menu="true"] .text {
        color: var(--vp-c-text-1) !important;
      }

    `],
    ['script', {}, `
      (function() {
        const VERSION_KEY = 'lihua-doc-version'
        const VERSIONS = ['1.0', '2.0']
        const DEFAULT_VERSION = '1.0'

        function getVersionFromPath(pathname) {
          const match = pathname.match(/^\\/(1\\.0|2\\.0)\\//)
          return match ? match[1] : null
        }

        function getCurrentVersion() {
          const fromPath = getVersionFromPath(location.pathname)
          if (fromPath) return fromPath
          const stored = localStorage.getItem(VERSION_KEY)
          return VERSIONS.includes(stored) ? stored : DEFAULT_VERSION
        }

        function setCurrentVersion(version) {
          if (VERSIONS.includes(version)) {
            localStorage.setItem(VERSION_KEY, version)
          }
        }

        function shouldHidePlatformNav(pathname) {
          const normalized = pathname.replace(/\\/+$/, '') || '/'
          return normalized === '/' || normalized === '/index' || normalized === '/index.html' || normalized === '/home/overview' || normalized === '/home/overview.html'
        }

        function updateHiddenNavClass() {
          document.documentElement.classList.toggle('is-platform-nav-hidden', shouldHidePlatformNav(location.pathname))
        }

        function updateNavLinks() {
          const version = getCurrentVersion()

          const serverPath = '/' + version + '/doc-server/basic/overview'
          const webPath = '/' + version + '/doc-web/basic/overview'
          const appPath = '/' + version + '/doc-app/basic/overview'

          document.querySelectorAll('.VPNavBarMenu .VPNavBarMenuLink').forEach((el) => {
            const text = (el.textContent || '').trim()
            if (text === '后端') el.setAttribute('href', serverPath)
            if (text === '前端') el.setAttribute('href', webPath)
            if (text === '移动端') el.setAttribute('href', appPath)
          })

          document.querySelectorAll('.VPNavBarMenu .VPNavBarMenuLink[href^="/1.0/"], .VPNavBarMenu .VPNavBarMenuLink[href^="/2.0/"]').forEach((el) => {
            const href = el.getAttribute('href') || ''
            const match = href.match(/^\\/(1\\.0|2\\.0)\\//)
            if (!match) return
            const selectedVersion = match[1]
            el.addEventListener('click', function() {
              setCurrentVersion(selectedVersion)
            }, { once: true })
          })
        }

        function markVersionFlyout() {
          document.querySelectorAll('.VPNavBarMenu .VPFlyout .button').forEach((btn) => {
            const text = (btn.textContent || '').trim()
            if (text === '版本') {
              btn.setAttribute('data-version-menu', 'true')
            }
          })
        }

        function bootstrap() {
          const detected = getVersionFromPath(location.pathname)
          if (detected) setCurrentVersion(detected)
          updateHiddenNavClass()
          markVersionFlyout()
          updateNavLinks()
        }

        bootstrap()
        window.addEventListener('DOMContentLoaded', bootstrap)
        window.addEventListener('popstate', bootstrap)
        document.addEventListener('click', function(e) {
          const target = e.target && e.target.closest ? e.target.closest('a') : null
          if (!target) return
          if (target.origin === location.origin) {
            setTimeout(bootstrap, 0)
          }
        })
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
      light: '/miaomiao.png',  // 亮色主题图标
      dark: '/heihei.png',    // 暗色主题图标
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '版本',
        items: [
          { text: '1.0', link: '/1.0/doc-server/basic/overview', activeMatch: '^/1\\.0/(doc-server|doc-web|doc-app)/' },
          { text: '2.0', link: '/2.0/doc-server/basic/overview', activeMatch: '^/2\\.0/(doc-server|doc-web|doc-app)/' }
        ]
      },
      { text: '后端', link: '/1.0/doc-server/basic/overview', activeMatch: '^/(1\\.0|2\\.0)/doc-server/' },
      { text: '前端', link: '/1.0/doc-web/basic/overview', activeMatch: '^/(1\\.0|2\\.0)/doc-web/' },
      { text: '移动端', link: '/1.0/doc-app/basic/overview', activeMatch: '^/(1\\.0|2\\.0)/doc-app/' }
    ],
    sidebar: {
        '/overview/': [
            {
                text: '项目概览',
                items: [
                    { text: '介绍', link: '/1.0/doc-server/server' },
                ]
            }
        ],
        '/1.0/doc-server/': [
            {
                text: '后端文档',
                items: [
                    {
                        text: '基础',
                        items: [
                            { text: '概览', link: '/1.0/doc-server/basic/overview' },
                            { text: '项目启动', link: '/1.0/doc-server/basic/start' },
                            { text: '新增子模块', link: '/1.0/doc-server/basic/module' },
                            { text: '依赖维护', link: '/1.0/doc-server/basic/dependency' },
                        ]
                    },
                    {
                        text: '开发规范',
                        items: [
                            { text: 'controller', link: '/1.0/doc-server/standard/controller' },
                            { text: 'service', link: '/1.0/doc-server/standard/service' },
                            { text: 'mapper', link: '/1.0/doc-server/standard/mapper' },
                            { text: '数据模型', link: '/1.0/doc-server/standard/data' },
                        ]
                    },
                    {
                        text: '系统组件',
                        items: [
                            { text: '用户上下文', link: '/1.0/doc-server/component/context' },
                            { text: 'Redis 缓存', link: '/1.0/doc-server/component/redis' },
                            { text: 'Excel 导入导出', link: '/1.0/doc-server/component/excel' },
                            { text: '工具类', link: '/1.0/doc-server/component/utils' },
                            { text: '注解', link: '/1.0/doc-server/component/annotation' },
                            { text: '附件', link: '/1.0/doc-server/component/file' },
                            { text: 'WebSocket', link: '/1.0/doc-server/component/websocket' },
                            { text: '定时任务', link: '/1.0/doc-server/component/schedule' },
                        ]
                    },
                    {
                        text: '接口与文档',
                        items: [
                            { text: 'Knife4j 文档', link: '/1.0/doc-server/doc/knife4j' }
                        ]
                    },
                    {
                        text: '项目部署',
                        items: [
                            { text: '打包部署', link: '/1.0/doc-server/deploy/deploy' },
                            { text: 'docker部署', link: '/1.0/doc-server/deploy/docker' },
                        ]
                    }
                ]
            }
        ],
        '/1.0/doc-web/': [
            {
                text: '前端文档',
                items: [
                    {
                        text: '基础',
                        items: [
                            { text: '概览', link: '/1.0/doc-web/basic/overview' },
                            { text: '项目启动', link: '/1.0/doc-web/basic/start' },
                        ]
                    },
                    {
                        text: '开发规范',
                        items: [
                            { text: 'api', link: '/1.0/doc-web/standard/api' },
                            { text: '页面与组件', link: '/1.0/doc-web/standard/component-page' },
                        ]
                    },
                    {
                        text: '业务开发',
                        items: [
                            { text: '用户信息', link: '/1.0/doc-web/development/user-info' },
                            { text: 'layout', link: '/1.0/doc-web/development/layout' },
                            { text: '系统主题', link: '/1.0/doc-web/development/theme' },
                            { text: '系统字典', link: '/1.0/doc-web/development/sys-dict' },
                            { text: '自定义图标', link: '/1.0/doc-web/development/icon' },
                            { text: 'Websocket', link: '/1.0/doc-web/development/websocket' },
                        ]
                    },
                    {
                        text: '核心机制',
                        items: [
                            { text: '状态管理', link: '/1.0/doc-web/core/store' },
                            { text: '路由与菜单', link: '/1.0/doc-web/core/router' },
                        ]
                    },
                    {
                        text: '系统工具',
                        items: [
                            { text: '工具类', link: '/1.0/doc-web/utils/utils' },
                            { text: '指令', link: '/1.0/doc-web/utils/directive' },
                        ]
                    },
                    {
                        text: '内置组件',
                        items: [
                            {
                                text: '数据展示',
                                items: [
                                    { text: '可展开卡片', link: '/1.0/doc-web/components/expandable-card' },
                                    { text: '用户展示', link: '/1.0/doc-web/components/user-show' },
                                    { text: '字典标签', link: '/1.0/doc-web/components/dict-tag' },
                                    { text: '全屏遮罩', link: '/1.0/doc-web/components/mask' },
                                    { text: '表格设置', link: '/1.0/doc-web/components/table-setting' }
                                ]
                            },{
                                text: '数据绑定',
                                items: [
                                    { text: '简单树形选择', link: '/1.0/doc-web/components/easy-tree-select' },
                                    { text: '可选择卡片', link: '/1.0/doc-web/components/selectable-card' },
                                    { text: '富文本编辑器', link: '/1.0/doc-web/components/editor' },
                                    { text: '颜色选择', link: '/1.0/doc-web/components/color-select' },
                                    { text: '图标选择', link: '/1.0/doc-web/components/icon-select' },
                                    { text: '图片剪裁', link: '/1.0/doc-web/components/image-cropper' },
                                    { text: '用户选择', link: '/1.0/doc-web/components/user-select' },
                                    { text: '附件上传', link: '/1.0/doc-web/components/attachment-upload' }
                                ]
                            }
                        ]
                    },
                    {
                        text: '项目部署',
                        items: [
                            { text: '打包部署', link: '/1.0/doc-web/deploy/deploy' },
                            { text: 'docker部署', link: '/1.0/doc-web/deploy/docker' },
                        ]
                    }
                ]
            }
        ],
        '/1.0/doc-app/': [
            {
                text: '移动端文档',
                items: [
                    {
                        text: '基础',
                        items: [
                            { text: '概览', link: '/1.0/doc-app/basic/overview' },
                            { text: '项目启动', link: '/1.0/doc-app/basic/start' },
                        ]
                    },
                    {
                        text: '开发规范',
                        items: [
                            { text: 'api', link: '/1.0/doc-app/standard/api' },
                            { text: '页面与组件', link: '/1.0/doc-app/standard/component-page' },
                        ]
                    },
                    {
                        text: '核心机制',
                        items: [
                            { text: '状态管理', link: '/1.0/doc-app/core/store' },
                            { text: '路由', link: '/1.0/doc-app/core/router' },
                        ]
                    },
                    {
                        text: '业务开发',
                        items: [
                            { text: '用户信息', link: '/1.0/doc-app/development/user-info' },
                            { text: '根节点', link: '/1.0/doc-app/development/root' },
                            { text: '自定义图标', link: '/1.0/doc-app/development/icon' },
                            { text: '系统字典', link: '/1.0/doc-app/development/dict' },
                            { text: 'Websocket', link: '/1.0/doc-app/development/websocket' }
                        ]
                    },
                    {
                        text: '系统工具',
                        items: [
                            { text: '工具类', link: '/1.0/doc-app/utils/utils' }
                        ]
                    },
                    {
                        text: '内置组件',
                        items: [
                            {
                                text: '数据展示',
                                items: [
                                    { text: '字典标签', link: '/1.0/doc-app/components/dict-tag' },
                                    { text: '消息通知', link: '/1.0/doc-app/components/notice-message' },
                                ]
                            },
                            {
                                text: '数据绑定',
                                items: [
                                    { text: '附件上传', link: '/1.0/doc-app/components/attachment' },
                                    { text: '颜色选择', link: '/1.0/doc-app/components/color-select' },
                                    { text: '图标选择', link: '/1.0/doc-app/components/icon-select' },
                                ]
                            }
                        ]
                    },
                    {
                        text: '项目部署',
                        items: [
                            { text: '打包部署', link: '/1.0/doc-app/deploy/deploy' }
                        ]
                    }
                ]
            }
        ],'/2.0/doc-server/': [
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
                        items: [
                            { text: 'Knife4j 文档', link: '/2.0/doc-server/doc/knife4j' }
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
        ],
        '/2.0/doc-web/': [
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
                            },{
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
        ],
        '/2.0/doc-app/': [
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
                        items: [
                            { text: '工具类', link: '/2.0/doc-app/utils/utils' }
                        ]
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
                        items: [
                            { text: '打包部署', link: '/2.0/doc-app/deploy/deploy' }
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
      { icon: 'github', link: 'https://github.com/sx19970123' },
      { icon: 'gitcode', link: 'https://gitcode.com/weixin_44118742' },
    ]
  }
})
