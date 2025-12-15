import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "狸花猫后台管理系统",
  // 浏览器标签页logo监听暗色模式变化
  head: [
    ['link', { rel: 'icon', href: '../static/miaomiao.png' }],
    ['script', {}, `
      (function() {
        const link = document.querySelector("link[rel='icon']")
        function setFavicon() {
          const isDark = document.documentElement.classList.contains('dark')
          link.href = isDark ? '../static/heihei.png' : '../static/miaomiao.png'
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
      light: '../static/miaomiao.png',  // 亮色主题图标
      dark: '../static/heihei.png',    // 暗色主题图标
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '后端', link: '../doc-server/server.md' },
      { text: '前端', link: '../doc-web/web.md' },
      { text: '移动端', link: '../doc-app/app.md' },
      {
        text: '版本信息',
        items: [
          { text: 'Web端', link: 'https://gitee.com/yukino_git/lihua/releases' },
          { text: '移动端', link: 'https://gitee.com/yukino_git/lihua-app/releases' }
        ]
      }
    ],
    outline: {
      level: [2, 6],      // 显示的标题级别：h2 到 h6
      label: '本页目录'    // 标题文字
    },
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'gitee', link: 'https://gitee.com/yukino_git' },
      { icon: 'github', link: 'https://github.com/sx19970123/lihua' },
      { icon: 'gitcode', link: 'https://gitcode.com/weixin_44118742/lihua' },
    ]
  }
})
