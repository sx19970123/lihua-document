---
layout: home
markdownStyles: false

hero:
  text: "狸花猫后台管理系统"
  tagline: "Spring Boot / Cloud 双形态后端 · Vue3 管理端 · UniApp 移动端"
  actions:
    - theme: alt
      text: 1.0 文档
      link: /1.0/doc-server/basic/overview
    - theme: alt
      text: 2.0 文档
      link: /2.0/doc-server/basic/overview
    - theme: brand
      text: 进入 3.0 文档
      link: /3.0/doc-server/basic/overview
    - theme: alt
      text: 介绍
      link: /home/overview
    - theme: alt
      text: 在线预览
      link: https://lihua.xyz/
---

<!-- 登录页同款氛围背景：时段主题（morning/noon/dusk/night）驱动整套色板变量，1:1 移植自 lihua-web LoginBackground -->
<div class="login-bg login-bg--noon" ref="loginBgRoot" aria-hidden="true">
  <div class="login-bg-base"></div>
  <div class="login-bg-beam"></div>
  <div class="login-bg-cats"></div>
  <div class="login-bg-orb orb-a"></div>
  <div class="login-bg-orb orb-b"></div>
  <div class="login-bg-orb orb-c"></div>
  <div class="login-bg-orb orb-d"></div>
  <div class="login-bg-noise"></div>
</div>

<!-- 首页截图 · 浏览器外壳 · 3D 视差 -->
<div class="showcase">
  <div class="showcase-scene">
    <div class="showcase-scroll">
      <div class="showcase-tilt">
        <div class="showcase-float">
          <div class="browser">
            <div class="browser-bar">
              <span class="b-dot b-red"></span>
              <span class="b-dot b-yellow"></span>
              <span class="b-dot b-green"></span>
              <div class="b-address">
                <svg class="b-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                <span>lihua.xyz</span>
              </div>
            </div>
            <div class="browser-view">
              <div class="slide is-active" data-label="首页">
                <img class="shot shot-light" src="/3.0/shots/home-light.png" alt="首页（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/home-dark.png" alt="首页（暗色模式）" />
              </div>
              <div class="slide" data-label="锁屏">
                <img class="shot shot-light" src="/3.0/shots/lock-light.png" alt="锁屏（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/lock-dark.png" alt="锁屏（暗色模式）" />
              </div>
              <div class="slide" data-label="个人中心">
                <img class="shot shot-light" src="/3.0/shots/profile-light.png" alt="个人中心（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/profile-dark.png" alt="个人中心（暗色模式）" />
              </div>
              <div class="slide" data-label="主题设置">
                <img class="shot shot-light" src="/3.0/shots/theme-light.png" alt="主题设置（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/theme-dark.png" alt="主题设置（暗色模式）" />
              </div>
              <div class="slide" data-label="用户管理">
                <img class="shot shot-light" src="/3.0/shots/user-light.png" alt="用户管理（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/user-dark.png" alt="用户管理（暗色模式）" />
              </div>
              <div class="slide" data-label="角色管理">
                <img class="shot shot-light" src="/3.0/shots/role-light.png" alt="角色管理（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/role-dark.png" alt="角色管理（暗色模式）" />
              </div>
              <div class="slide" data-label="菜单管理">
                <img class="shot shot-light" src="/3.0/shots/menu-light.png" alt="菜单管理（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/menu-dark.png" alt="菜单管理（暗色模式）" />
              </div>
              <div class="slide" data-label="缓存监控">
                <img class="shot shot-light" src="/3.0/shots/cache-light.png" alt="缓存监控（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/cache-dark.png" alt="缓存监控（暗色模式）" />
              </div>
              <div class="slide" data-label="服务监控">
                <img class="shot shot-light" src="/3.0/shots/server-light.png" alt="服务监控（亮色模式）" />
                <img class="shot shot-dark" src="/3.0/shots/server-dark.png" alt="服务监控（暗色模式）" />
              </div>
              <div class="browser-glare"></div>
            </div>
          </div>
          <button class="browser-nav is-prev" type="button" aria-label="上一张">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button class="browser-nav is-next" type="button" aria-label="下一张">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <div class="browser-caption">
            <div class="caption-dots">
              <button class="dot is-active" type="button" aria-label="第 1 张：首页"></button>
              <button class="dot" type="button" aria-label="第 2 张：锁屏"></button>
              <button class="dot" type="button" aria-label="第 3 张：个人中心"></button>
              <button class="dot" type="button" aria-label="第 4 张：主题设置"></button>
              <button class="dot" type="button" aria-label="第 5 张：用户管理"></button>
              <button class="dot" type="button" aria-label="第 6 张：角色管理"></button>
              <button class="dot" type="button" aria-label="第 7 张：菜单管理"></button>
              <button class="dot" type="button" aria-label="第 8 张：缓存监控"></button>
              <button class="dot" type="button" aria-label="第 9 张：服务监控"></button>
            </div>
            <span class="caption-text">{{ carouselLabel }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 在线实况：直接嵌入 lihua.xyz 真实系统页面 -->
<div class="video">
  <div class="video-head">
    <p class="video-kicker">LIVE DEMO</p>
    <h2 class="video-title">亲眼所见，触手可及</h2>
    <p class="video-sub">这里嵌入的是真实的在线环境，可直接交互体验（未登录时展示登录页）。</p>
  </div>
  <div class="video-frame">
    <div class="video-box">
      <iframe
        class="video-player"
        src="https://lihua.xyz/index"
        scrolling="yes"
        frameborder="no"
        allowfullscreen="true"
      ></iframe>
    </div>
    <a class="video-bili-link" href="https://lihua.xyz" target="_blank" rel="noreferrer">在新标签页打开在线环境 ↗</a>
  </div>
</div>

<!-- 六大特性 -->
<div class="feat">
  <div class="feat-head">
    <p class="feat-kicker">WHY LIHUA 3.0</p>
    <h2 class="feat-title">一次搭建，四端复用</h2>
    <p class="feat-sub">3.0 完成前后端仓库拆分，Boot / Cloud / Web / App 四仓独立演进、按需取用，权限模型与数据结构全端一致。</p>
  </div>
  <div class="feat-grid">
    <div class="feat-card">
      <div class="feat-icon">🏗️</div>
      <h3>双形态后端</h3>
      <p>Boot 单体开箱即用，Cloud 微服务按需伸缩，同一套业务代码两种形态。</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🖖</div>
      <h3>Vue 3 管理端</h3>
      <p>Composition API + TypeScript 全量类型，Antdv Next 企业级组件体系。</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📱</div>
      <h3>移动多端</h3>
      <p>UniApp 一码多端：Android、iOS、鸿蒙与微信小程序，能力与 Web 端对齐。</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🔐</div>
      <h3>企业级 RBAC</h3>
      <p>用户、角色、菜单、部门、岗位精细化管控，支持多部门归属与默认部门。</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📢</div>
      <h3>实时消息</h3>
      <p>WebSocket 公告即时推送，权限变更全端红点同步提醒。</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🎨</div>
      <h3>主题生态</h3>
      <p>亮暗双模式、主题色自定义、多种导航布局，登录页时段氛围背景。</p>
    </div>
  </div>
</div>

<!-- 底部 CTA -->
<div class="cta">
  <h2 class="cta-title">准备好开始了吗？</h2>
  <p class="cta-sub">从项目启动到部署上线，3.0 文档覆盖四端全流程。</p>
  <div class="cta-actions">
    <a class="cta-btn is-primary" href="/3.0/doc-server/basic/overview">进入 3.0 文档</a>
    <a class="cta-btn is-ghost" href="https://gitee.com/yukino_git" target="_blank" rel="noreferrer">访问 Gitee 仓库</a>
  </div>
</div>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const loginBgRoot = ref(null)
const carouselLabel = ref('首页')
let bgTimer = null
let ctx = null
let cleanMouse = null
let cleanCarousel = null

// —— 截图轮播：4s 自动切换、首尾循环、悬停暂停、箭头/圆点手动切换 ——
const initCarousel = () => {
  const view = document.querySelector('.browser-view')
  if (!view) return
  const slides = Array.from(view.querySelectorAll('.slide'))
  const dots = Array.from(document.querySelectorAll('.browser-caption .dot'))
  const zone = document.querySelector('.showcase-float')
  const prevBtn = document.querySelector('.browser-nav.is-prev')
  const nextBtn = document.querySelector('.browser-nav.is-next')
  if (!slides.length) return

  // 禁用截图原生拖拽（避免图片被随意拖出）
  view.querySelectorAll('img').forEach((img) => { img.draggable = false })

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let current = 0
  let timer = null

  const goTo = (i) => {
    current = (i + slides.length) % slides.length
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === current))
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current))
    carouselLabel.value = slides[current].dataset.label || ''
  }
  const stopAuto = () => { if (timer) { window.clearInterval(timer); timer = null } }
  const startAuto = () => { if (!reduce && !timer) timer = window.setInterval(() => goTo(current + 1), 4000) }
  const manual = (i) => { goTo(i); stopAuto(); startAuto() }

  const onPrev = () => manual(current - 1)
  const onNext = () => manual(current + 1)
  const onEnter = () => stopAuto()
  const onLeave = () => startAuto()
  const dotHandlers = dots.map((d, idx) => {
    const fn = () => manual(idx)
    d.addEventListener('click', fn)
    return [d, fn]
  })
  prevBtn?.addEventListener('click', onPrev)
  nextBtn?.addEventListener('click', onNext)
  zone?.addEventListener('mouseenter', onEnter)
  zone?.addEventListener('mouseleave', onLeave)

  goTo(0)
  startAuto()
  cleanCarousel = () => {
    stopAuto()
    prevBtn?.removeEventListener('click', onPrev)
    nextBtn?.removeEventListener('click', onNext)
    zone?.removeEventListener('mouseenter', onEnter)
    zone?.removeEventListener('mouseleave', onLeave)
    dotHandlers.forEach(([d, fn]) => d.removeEventListener('click', fn))
    cleanCarousel = null
  }
}

// —— 登录页同款时段背景：早上 5-11 / 中午 11-16 / 黄昏 16-19 / 晚上 19-5，每 60s 复查 ——
const PERIODS = ['morning', 'noon', 'dusk', 'night']
const resolvePeriod = () => {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 16) return 'noon'
  if (h >= 16 && h < 19) return 'dusk'
  return 'night'
}
const initLoginBg = () => {
  const el = loginBgRoot.value
  if (!el) return
  // 演示/截图用：URL ?loginBg=morning|noon|dusk|night 强制指定时段
  const override = new URLSearchParams(window.location.search).get('loginBg')
  if (override && PERIODS.includes(override)) {
    el.className = 'login-bg login-bg--' + override
    return
  }
  const apply = () => { el.className = 'login-bg login-bg--' + resolvePeriod() }
  apply()
  bgTimer = window.setInterval(apply, 60_000)
}

onMounted(async () => {
  initLoginBg()
  initCarousel()

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  gsap.registerPlugin(ScrollTrigger)

  ctx = gsap.context(() => {
    if (reduceMotion) return

    // hero 入场
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.VPHero .text', { y: 28, opacity: 0, duration: 0.75 }, 0.05)
      .from('.VPHero .tagline', { y: 22, opacity: 0, duration: 0.6 }, 0.22)
      .from('.VPHero .actions .action', { y: 18, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.34)
      // 下方区块与按钮同款上浮入场，不依赖滚动
      .from('.feat-kicker', { y: 18, opacity: 0, duration: 0.5 }, 0.55)
      .from('.feat-title', { y: 18, opacity: 0, duration: 0.55 }, 0.62)
      .from('.feat-sub', { y: 18, opacity: 0, duration: 0.55 }, 0.7)
      .from('.feat-card', { y: 18, opacity: 0, duration: 0.5, stagger: 0.08, clearProps: 'transform,opacity' }, 0.82)
      .from('.cta > *', { y: 18, opacity: 0, duration: 0.55, stagger: 0.08 }, 1.05)

    // 浏览器壳入场
    gsap.from('.showcase', { opacity: 0, y: 48, duration: 1, ease: 'power3.out', delay: 0.5 })

    // 滚动 3D 视差：俯视角随滚动压平、上浮、放大
    gsap.fromTo('.showcase-scroll',
      { rotateX: 18, y: 90, scale: 0.9, transformPerspective: 1400 },
      {
        rotateX: 0, y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.showcase', start: 'top 98%', end: 'top 40%', scrub: 0.5 }
      })

    // 悬浮呼吸
    gsap.to('.showcase-float', { y: 10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 })

    // 点击截图：滚动条平滑滚动，让截图区域居中占满视野（单纯移动滚动条，无放大）
    const mm = gsap.matchMedia()
    mm.add('(min-width: 769px)', () => {
      const view = document.querySelector('.browser-view')
      const showcase = document.querySelector('.showcase')
      if (!view || !showcase) return
      const onViewClick = () => {
        const rect = showcase.getBoundingClientRect()
        const target = window.scrollY + rect.top - (window.innerHeight - rect.height) / 2
        if (Math.abs(window.scrollY - target) < 24) return
        window.scrollTo({ top: Math.max(target, 0), behavior: 'smooth' })
      }
      view.addEventListener('click', onViewClick)
      return () => view.removeEventListener('click', onViewClick)
    })
  })

  // 鼠标 3D 视差（仅可悬浮设备）
  const zone = document.querySelector('.showcase')
  const tilt = document.querySelector('.showcase-tilt')
  const canHover = window.matchMedia('(hover: hover)').matches
  if (zone && tilt && canHover && !reduceMotion) {
    const rx = gsap.quickTo(tilt, 'rotateX', { duration: 0.7, ease: 'power3.out' })
    const ry = gsap.quickTo(tilt, 'rotateY', { duration: 0.7, ease: 'power3.out' })
    const onMove = (e) => {
      const r = tilt.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * 7)
      rx(-py * 5)
    }
    const onLeave = () => { rx(0); ry(0) }
    zone.addEventListener('mousemove', onMove)
    zone.addEventListener('mouseleave', onLeave)
    cleanMouse = () => {
      zone.removeEventListener('mousemove', onMove)
      zone.removeEventListener('mouseleave', onLeave)
    }
  }
})

onBeforeUnmount(() => {
  if (bgTimer) window.clearInterval(bgTimer)
  if (ctx) ctx.revert()
  if (cleanMouse) cleanMouse()
  if (cleanCarousel) cleanCarousel()
})
</script>

<style>
/* ==================== 布局层级：背景 fixed 压底，内容 z-1 ==================== */
.VPHome {
  position: relative;
  z-index: 1;
  margin-bottom: 0 !important;
  padding-bottom: 0;
}

.VPHomeHero .main {
  text-align: center;
  margin: 0 auto;
}

.VPHomeHero .heading .text {
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.VPHomeHero .heading,
.VPHomeHero .tagline {
  margin-left: auto;
  margin-right: auto;
}

.VPHomeHero .tagline {
  max-width: 780px;
}

.VPHomeHero .actions {
  justify-content: center;
}

/* 1.0 / 2.0 入口弱化为幽灵按钮（3.0 为 brand 高亮） */
.VPHomeHero .actions .action a[href^="/1.0/"],
.VPHomeHero .actions .action a[href^="/2.0/"] {
  border-color: transparent !important;
  background-color: transparent;
  color: var(--vp-c-text-2);
  font-weight: 500;
  opacity: 0.85;
}

.VPHomeHero .actions .action a[href^="/1.0/"]:hover,
.VPHomeHero .actions .action a[href^="/2.0/"]:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1) !important;
  background-color: transparent;
  opacity: 1;
}

/* ==================== 登录页同款背景（1:1 移植，dark 选择器换为 .dark） ==================== */
.login-bg {
  --cat-pattern: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='264' height='264'%3E%3Cg fill='none' stroke='%23465efb' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M 2 6.5 Q 7 11.5 12 5.5 Q 17 11.5 22 6.5' stroke-opacity='0.12' transform='translate(36,52) rotate(-12) scale(0.8)'/%3E%3Cpath d='M 2 13 Q 2.8 8 4.8 4 Q 7.2 6.8 9 11 M 8.5 11 Q 9.5 13 10.5 11 M 11 11 Q 12.8 6.8 15.2 4 Q 17.2 8 18 13' stroke-opacity='0.11' transform='translate(160,60) rotate(8) scale(1.05)'/%3E%3Cpath d='M 2 13 Q 2.8 8 4.8 4 Q 7.2 6.8 9 11 M 8.5 11 Q 9.5 13 10.5 11 M 11 11 Q 12.8 6.8 15.2 4 Q 17.2 8 18 13' stroke-opacity='0.09' transform='translate(60,190) rotate(15) scale(0.7)'/%3E%3Cpath d='M 2 6.5 Q 7 11.5 12 5.5 Q 17 11.5 22 6.5' stroke-opacity='0.08' transform='translate(190,196) rotate(-4) scale(0.65)'/%3E%3C/g%3E%3C/svg%3E");
  --noise-opacity: 0.05;

  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--bg-base);
}

/* 早上：灰金的晨、灰青苏醒的海（莫兰迪调，微留彩度） */
.login-bg--morning {
  --bg-base: linear-gradient(180deg, #faf8f1 0%, #eff4ec 55%, #ecf3ec 100%);
  --orb-a: rgba(224, 204, 162, 0.4);
  --orb-b: rgba(168, 210, 226, 0.32);
  --orb-c: rgba(122, 190, 188, 0.32);
  --orb-d: rgba(122, 156, 210, 0.28);
  --beam-light: rgba(248, 246, 238, 0.5);
  --base-glow-a: rgba(246, 244, 236, 0.45);
  --base-glow-b: rgba(238, 243, 242, 0.3);
}

/* 中午：灰蓝的天、灰青海的水 */
.login-bg--noon {
  --bg-base: linear-gradient(180deg, #f5fafb 0%, #ebf1f4 55%, #ecf1f5 100%);
  --orb-a: rgba(136, 180, 228, 0.42);
  --orb-b: rgba(150, 200, 220, 0.36);
  --orb-c: rgba(92, 172, 180, 0.38);
  --orb-d: rgba(108, 130, 214, 0.34);
  --beam-light: rgba(250, 250, 250, 0.5);
  --base-glow-a: rgba(250, 250, 250, 0.45);
  --base-glow-b: rgba(246, 248, 250, 0.3);
}

/* 黄昏：陶土与灰玫瑰的天、映着余温的海 */
.login-bg--dusk {
  --bg-base: linear-gradient(180deg, #fbf3e9 0%, #f5ede4 55%, #efedf4 100%);
  --orb-a: rgba(226, 174, 122, 0.42);
  --orb-b: rgba(218, 156, 150, 0.34);
  --orb-c: rgba(206, 146, 134, 0.28);
  --orb-d: rgba(120, 134, 212, 0.36);
  --beam-light: rgba(222, 202, 182, 0.5);
  --base-glow-a: rgba(240, 228, 212, 0.4);
  --base-glow-b: rgba(232, 228, 236, 0.28);
}

/* 晚上：灰蓝的月夜、灰靛的海 */
.login-bg--night {
  --bg-base: linear-gradient(180deg, #f1f5fb 0%, #e4ebf7 55%, #dfe7f4 100%);
  --orb-a: rgba(188, 210, 238, 0.4);
  --orb-b: rgba(126, 150, 224, 0.44);
  --orb-c: rgba(110, 134, 220, 0.46);
  --orb-d: rgba(94, 156, 176, 0.4);
  --beam-light: rgba(224, 230, 240, 0.45);
  --base-glow-a: rgba(220, 228, 240, 0.4);
  --base-glow-b: rgba(214, 222, 234, 0.3);
}

/* 暗色主题 × 时段：仅覆盖色板变量 */
.dark .login-bg {
  --cat-pattern: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='264' height='264'%3E%3Cg fill='none' stroke='%238caaff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M 2 6.5 Q 7 11.5 12 5.5 Q 17 11.5 22 6.5' stroke-opacity='0.10' transform='translate(36,52) rotate(-12) scale(0.8)'/%3E%3Cpath d='M 2 13 Q 2.8 8 4.8 4 Q 7.2 6.8 9 11 M 8.5 11 Q 9.5 13 10.5 11 M 11 11 Q 12.8 6.8 15.2 4 Q 17.2 8 18 13' stroke-opacity='0.09' transform='translate(160,60) rotate(8) scale(1.05)'/%3E%3Cpath d='M 2 13 Q 2.8 8 4.8 4 Q 7.2 6.8 9 11 M 8.5 11 Q 9.5 13 10.5 11 M 11 11 Q 12.8 6.8 15.2 4 Q 17.2 8 18 13' stroke-opacity='0.07' transform='translate(60,190) rotate(15) scale(0.7)'/%3E%3Cpath d='M 2 6.5 Q 7 11.5 12 5.5 Q 17 11.5 22 6.5' stroke-opacity='0.07' transform='translate(190,196) rotate(-4) scale(0.65)'/%3E%3C/g%3E%3C/svg%3E");
  --noise-opacity: 0.07;
}

.dark .login-bg--morning {
  --bg-base: linear-gradient(180deg, #0b0d10 0%, #090f12 55%, #090f12 100%);
  --orb-a: rgba(132, 118, 70, 0.36);
  --orb-b: rgba(54, 108, 140, 0.4);
  --orb-c: rgba(28, 110, 108, 0.42);
  --orb-d: rgba(40, 78, 134, 0.38);
  --beam-light: rgba(140, 158, 178, 0.26);
  --base-glow-a: rgba(115, 135, 170, 0.07);
  --base-glow-b: rgba(115, 135, 170, 0.05);
}

.dark .login-bg--noon {
  --bg-base: linear-gradient(180deg, #090f14 0%, #081013 55%, #081013 100%);
  --orb-a: rgba(48, 114, 152, 0.44);
  --orb-b: rgba(42, 100, 134, 0.42);
  --orb-c: rgba(26, 106, 118, 0.46);
  --orb-d: rgba(48, 72, 150, 0.42);
  --beam-light: rgba(148, 168, 192, 0.3);
  --base-glow-a: rgba(118, 138, 172, 0.07);
  --base-glow-b: rgba(118, 138, 172, 0.05);
}

.dark .login-bg--dusk {
  --bg-base: linear-gradient(180deg, #100d0c 0%, #0e0f13 55%, #0d0f14 100%);
  --orb-a: rgba(164, 106, 52, 0.44);
  --orb-b: rgba(148, 74, 78, 0.36);
  --orb-c: rgba(124, 64, 62, 0.32);
  --orb-d: rgba(54, 68, 156, 0.42);
  --beam-light: rgba(178, 158, 138, 0.26);
  --base-glow-a: rgba(165, 142, 122, 0.06);
  --base-glow-b: rgba(140, 132, 148, 0.05);
}

.dark .login-bg--night {
  --bg-base: linear-gradient(180deg, #070b12 0%, #050a0e 55%, #050a0c 100%);
  --orb-a: rgba(122, 158, 222, 0.36);
  --orb-b: rgba(62, 88, 178, 0.46);
  --orb-c: rgba(54, 80, 178, 0.48);
  --orb-d: rgba(28, 96, 122, 0.46);
  --beam-light: rgba(138, 156, 190, 0.34);
  --base-glow-a: rgba(108, 128, 168, 0.08);
  --base-glow-b: rgba(104, 122, 160, 0.06);
}

.login-bg-base {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(42% 36% at 18% 22%, var(--base-glow-a), transparent 70%),
    radial-gradient(50% 44% at 84% 78%, var(--base-glow-b), transparent 72%);
  animation: lihua-bg-breathe 18s ease-in-out infinite alternate;
}

.login-bg-beam {
  position: absolute;
  top: -25%;
  left: -60%;
  width: 220%;
  height: 150%;
  background: linear-gradient(100deg,
    transparent 32%,
    var(--beam-light) 50%,
    transparent 68%);
  opacity: 0.16;
  transform: rotate(8deg) translateX(-12%);
  filter: blur(30px);
  animation: lihua-beam-sweep 26s ease-in-out infinite alternate;
}

.login-bg-cats {
  position: absolute;
  inset: 0;
  background-image: var(--cat-pattern);
  background-size: 264px 264px;
  -webkit-mask-image: radial-gradient(ellipse 70% 62% at 50% 44%, transparent 42%, #000 100%);
  mask-image: radial-gradient(ellipse 70% 62% at 50% 44%, transparent 42%, #000 100%);
}

.login-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
}

.orb-a {
  width: 46vw;
  height: 46vw;
  left: -10vw;
  top: -14vh;
  background: radial-gradient(circle at 35% 35%, var(--orb-a), transparent 68%);
  animation: lihua-orb-a-drift 32s ease-in-out infinite alternate;
}

.orb-b {
  width: 38vw;
  height: 38vw;
  right: -8vw;
  top: -10vh;
  background: radial-gradient(circle at 60% 40%, var(--orb-b), transparent 66%);
  animation: lihua-orb-b-drift 40s ease-in-out infinite alternate;
}

.orb-c {
  width: 50vw;
  height: 50vw;
  right: -14vw;
  bottom: -22vh;
  background: radial-gradient(circle at 45% 55%, var(--orb-c), transparent 68%);
  animation: lihua-orb-c-drift 46s ease-in-out infinite alternate;
}

.orb-d {
  width: 30vw;
  height: 30vw;
  left: 6vw;
  bottom: -12vh;
  background: radial-gradient(circle at 50% 40%, var(--orb-d), transparent 64%);
  animation: lihua-orb-d-drift 28s ease-in-out infinite alternate;
}

.login-bg-noise {
  position: absolute;
  inset: 0;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes lihua-bg-breathe {
  from { opacity: 0.75; transform: scale(1); }
  to { opacity: 1; transform: scale(1.03); }
}

@keyframes lihua-beam-sweep {
  from { transform: rotate(8deg) translateX(-12%); }
  to { transform: rotate(8deg) translateX(12%); }
}

@keyframes lihua-orb-a-drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(6vw, 5vh, 0) scale(1.12); }
}

@keyframes lihua-orb-b-drift {
  from { transform: translate3d(0, 0, 0) scale(1.08); }
  to { transform: translate3d(-7vw, 7vh, 0) scale(0.96); }
}

@keyframes lihua-orb-c-drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(-5vw, -6vh, 0) scale(1.15); }
}

@keyframes lihua-orb-d-drift {
  from { transform: translate3d(0, 0, 0) scale(0.94); }
  to { transform: translate3d(5vw, -4vh, 0) scale(1.1); }
}

/* ==================== 浏览器外壳 · 3D 视差 ==================== */
.showcase {
  max-width: 1216px;
  margin: 12px auto 0;
  padding: 0 24px;
}

.showcase-scene {
  perspective: 1600px;
}

.showcase-scroll {
  transform-style: preserve-3d;
  will-change: transform;
}

.showcase-tilt {
  transform-style: preserve-3d;
  will-change: transform;
}

.showcase-float {
  will-change: transform;
}

.browser {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.42);
  background: #f6f7f9;
  box-shadow:
    0 40px 90px -28px rgba(15, 42, 92, 0.34),
    0 18px 44px -20px rgba(15, 42, 92, 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.35) inset;
  transform: translateZ(24px);
}

.dark .browser {
  border-color: rgba(148, 163, 184, 0.2);
  background: #171a20;
  box-shadow:
    0 44px 96px -30px rgba(0, 0, 0, 0.66),
    0 18px 44px -22px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

.browser-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.32);
  background: linear-gradient(180deg, #fbfcfd 0%, #f2f4f7 100%);
}

.dark .browser-bar {
  border-bottom-color: rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, #1d2129 0%, #16191f 100%);
}

.b-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex: none;
}

.b-red { background: #ff5f57; }
.b-yellow { background: #febc2e; }
.b-green { background: #28c840; }

.b-address {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 0 auto;
  min-width: 260px;
  max-width: 46%;
  padding: 6px 18px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1;
  user-select: none;
}

.dark .b-address {
  background: rgba(148, 163, 184, 0.14);
}

.b-lock {
  width: 12px;
  height: 12px;
  flex: none;
  opacity: 0.7;
}

.browser-view {
  position: relative;
  display: grid;
  background: #fff;
}

.dark .browser-view {
  background: #0b0d10;
}

/* 轮播：全部 slide 堆叠在同一格，激活的淡入到位 */
.browser-view .slide {
  grid-area: 1 / 1;
  opacity: 0;
  transform: scale(0.988);
  transition: opacity 0.55s ease, transform 0.55s ease;
  pointer-events: none;
}

.browser-view .slide.is-active {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.shot {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-drag: none;
}

.browser-view {
  cursor: pointer;
}

.shot-dark {
  display: none;
}

.dark .shot-light {
  display: none;
}

.dark .shot-dark {
  display: block;
}

/* 左右切换箭头：置于截图外侧，悬停展示区时浮现 */
.showcase-float {
  position: relative;
}

.browser-nav {
  position: absolute;
  top: 42%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-bg) 82%, transparent);
  box-shadow: 0 6px 18px -8px rgba(15, 42, 92, 0.28);
  backdrop-filter: blur(8px) saturate(1.1);
  -webkit-backdrop-filter: blur(8px) saturate(1.1);
  color: var(--vp-c-text-1);
  cursor: pointer;
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.25s, transform 0.25s, background-color 0.25s, border-color 0.25s, color 0.25s;
}

.browser-nav svg {
  width: 20px;
  height: 20px;
}

.showcase-float:hover .browser-nav,
.browser-nav:focus-visible,
.browser-nav:focus {
  opacity: 1;
  transform: scale(1);
}

.browser-nav:hover {
  background: var(--vp-c-brand-3);
  border-color: var(--vp-c-brand-3);
  color: #fff;
  box-shadow: 0 8px 22px -8px color-mix(in srgb, var(--vp-c-brand-1) 60%, transparent);
}

.browser-nav.is-prev {
  left: -66px;
}

.browser-nav.is-next {
  right: -66px;
}

/* 窄屏时页边距不够，箭头退回截图内侧 */
@media (max-width: 1360px) {
  .browser-nav.is-prev {
    left: 16px;
  }

  .browser-nav.is-next {
    right: 16px;
  }
}

@media (hover: none) {
  .browser-nav {
    opacity: 0.85;
    transform: scale(1);
  }
}

/* 浏览器下方：圆点指示器 + 当前页面名称 */
.browser-caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 18px;
}

.caption-text {
  font-size: 19px;
  font-weight: 650;
  letter-spacing: 0.14em;
  color: var(--vp-c-text-1);
}

.caption-dots {
  display: flex;
  align-items: center;
  gap: 7px;
}

.caption-dots .dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.45);
  cursor: pointer;
  transition: width 0.3s, background-color 0.3s;
}

.caption-dots .dot:hover {
  background: rgba(148, 163, 184, 0.75);
}

.caption-dots .dot.is-active {
  width: 20px;
  background: var(--vp-c-brand-1);
}

/* 玻璃高光 */
.browser-glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 32%);
}

/* ==================== 六大特性 ==================== */
.feat {
  max-width: 1216px;
  margin: 96px auto 0;
  padding: 0 24px;
}

.feat-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 44px;
}

.feat-kicker {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--vp-c-brand-1);
}

.feat-title {
  margin: 0 0 14px;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border-top: none;
  padding-top: 0;
}

.feat-sub {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.feat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.feat-card {
  position: relative;
  border: 1px solid rgba(148, 163, 184, 0.32);
  border-radius: 16px;
  padding: 26px 24px 24px;
  background: color-mix(in srgb, var(--vp-c-bg) 78%, transparent);
  backdrop-filter: blur(10px) saturate(1.1);
  -webkit-backdrop-filter: blur(10px) saturate(1.1);
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.3s, box-shadow 0.35s;
}

.feat-card:hover {
  transform: translateY(-5px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 52%, transparent);
  box-shadow:
    0 18px 40px -18px color-mix(in srgb, var(--vp-c-brand-1) 34%, transparent),
    0 8px 22px -12px rgba(15, 42, 92, 0.16);
}

.dark .feat-card {
  border-color: rgba(148, 163, 184, 0.18);
  background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent);
}

.feat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-bottom: 16px;
  border-radius: 12px;
  font-size: 24px;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent),
    color-mix(in srgb, var(--vp-c-brand-1) 5%, transparent));
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
}

.feat-card h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 650;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  border-top: none;
  padding-top: 0;
}

.feat-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

/* ==================== 功能介绍视频 ==================== */
.video {
  max-width: 1216px;
  margin: 72px auto 0;
  padding: 0 24px;
}

.video-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 40px;
}

.video-kicker {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--vp-c-brand-1);
}

.video-title {
  margin: 0 0 14px;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border-top: none;
  padding-top: 0;
}

.video-sub {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.video-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.video-bili-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none !important;
  transition: color 0.25s;
}

.video-bili-link:hover {
  color: var(--vp-c-brand-1);
}

.video-box {
  width: 100%;
  max-width: 960px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.42);
  background: #0b0d10;
  box-shadow:
    0 34px 80px -30px rgba(15, 42, 92, 0.4),
    0 16px 40px -22px rgba(15, 42, 92, 0.22);
}

.dark .video-box {
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow:
    0 38px 88px -32px rgba(0, 0, 0, 0.66),
    0 16px 40px -24px rgba(0, 0, 0, 0.5);
}

.video-player {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}



/* ==================== 底部 CTA ==================== */
.cta {
  max-width: 1216px;
  margin: 104px auto 96px;
  padding: 0 24px;
  text-align: center;
}

.cta-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border-top: none;
  padding-top: 0;
}

.cta-sub {
  margin: 0 0 28px;
  font-size: 15px;
  color: var(--vp-c-text-2);
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.cta-btn {
  display: inline-block;
  padding: 10px 26px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none !important;
  transition: transform 0.25s, box-shadow 0.25s, background-color 0.25s, border-color 0.25s;
}

.cta-btn.is-primary {
  color: #fff;
  background: linear-gradient(120deg, var(--vp-c-brand-3), #465efb);
  box-shadow: 0 12px 28px -12px color-mix(in srgb, var(--vp-c-brand-1) 62%, transparent);
}

.cta-btn.is-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px -12px color-mix(in srgb, var(--vp-c-brand-1) 72%, transparent);
}

.cta-btn.is-ghost {
  color: var(--vp-c-text-1);
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: transparent;
}

.cta-btn.is-ghost:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ==================== 响应式 ==================== */
@media (max-width: 960px) {
  .feat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feat {
    margin-top: 72px;
  }

  .video {
    margin-top: 72px;
  }

  .video-title,
  .feat-title {
    font-size: 26px;
  }

  .b-address {
    min-width: 0;
    width: 40%;
    padding: 6px 12px;
  }
}

@media (max-width: 640px) {
  .feat-grid {
    grid-template-columns: 1fr;
  }

  .video-title,
  .feat-title {
    font-size: 22px;
  }

  .b-address span {
    display: none;
  }

  .cta {
    margin: 80px auto 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-bg,
  .login-bg * {
    animation: none;
  }
}
</style>
