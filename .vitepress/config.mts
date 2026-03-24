import { defineConfig } from 'vitepress'
// @ts-ignore
import { sidebarOverview } from './sidebar/overview.mts'
// @ts-ignore
import { sidebarDocServerV1 } from './sidebar/1.0/doc-server.mts'
// @ts-ignore
import { sidebarDocWebV1 } from './sidebar/1.0/doc-web.mts'
// @ts-ignore
import { sidebarDocAppV1 } from './sidebar/1.0/doc-app.mts'
// @ts-ignore
import { sidebarDocServerV2 } from './sidebar/2.0/doc-server.mts'
// @ts-ignore
import { sidebarDocWebV2 } from './sidebar/2.0/doc-web.mts'
// @ts-ignore
import { sidebarDocAppV2 } from './sidebar/2.0/doc-app.mts'

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
          const versionInPath = getVersionFromPath(location.pathname)
          document.querySelectorAll('.VPNavBarMenu .VPFlyout .button').forEach((btn) => {
            const text = (btn.textContent || '').trim()
            const isVersionButton = btn.getAttribute('data-version-menu') === 'true' || text === '版本' || text.startsWith('v')
            if (isVersionButton) {
              btn.setAttribute('data-version-menu', 'true')
              const label = versionInPath ? ('v' + versionInPath) : '版本'
              const textEl = btn.querySelector('.text')
              if (textEl) {
                textEl.textContent = label
              } else {
                btn.textContent = label
              }
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
          { text: 'v1.0', link: '/1.0/doc-server/basic/overview', activeMatch: '^/1\\.0/(doc-server|doc-web|doc-app)/' },
          { text: 'v2.0', link: '/2.0/doc-server/basic/overview', activeMatch: '^/2\\.0/(doc-server|doc-web|doc-app)/' }
        ]
      },
      { text: '后端', link: '/1.0/doc-server/basic/overview', activeMatch: '^/(1\\.0|2\\.0)/doc-server/' },
      { text: '前端', link: '/1.0/doc-web/basic/overview', activeMatch: '^/(1\\.0|2\\.0)/doc-web/' },
      { text: '移动端', link: '/1.0/doc-app/basic/overview', activeMatch: '^/(1\\.0|2\\.0)/doc-app/' }
    ],
    sidebar: {
      '/overview/': sidebarOverview,
      '/1.0/doc-server/': sidebarDocServerV1,
      '/1.0/doc-web/': sidebarDocWebV1,
      '/1.0/doc-app/': sidebarDocAppV1,
      '/2.0/doc-server/': sidebarDocServerV2,
      '/2.0/doc-web/': sidebarDocWebV2,
      '/2.0/doc-app/': sidebarDocAppV2
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
