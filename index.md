---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Lihua"
  text: "狸花猫后台管理系统"
  tagline: "Spring Boot 后端 · Vue 前端 · UniApp 移动端"
  actions:
    - theme: alt
      text: 介绍
      link: /home/overview
    - theme: alt
      text: 在线预览
      link: https://lihua.xyz/
    - theme: alt
      text: 进入 1.0 文档
      link: /1.0/doc-server/basic/overview
    - theme: brand
      text: 进入 2.0 文档（正在施工...）
      link: /2.0/doc-server/basic/overview




features:
  - icon: 🚀
    title: 极速启动
    details: 零配置快速启动，专注业务开发

  - icon: 🎯
    title: 优雅简洁
    details: 现代化界面设计，操作直观流畅

  - icon: 📦
    title: 组件丰富
    details: 内置常用业务组件，即拿即用

  - icon: 📱
    title: 多端适配
    details: 完美适配桌面和移动端

  - icon: 🌈
    title: 主题定制
    details: 轻松切换多种配色主题

  - icon: 🆕
    title: 持续更新
    details: 定期更新优化，紧跟技术潮流
---

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

let detach = null

onMounted(() => {
  const home = document.querySelector('.VPHome')
  if (!home) return

  const updateByEvent = (event) => {
    const rect = home.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const px = Math.max(0, Math.min(rect.width, x))
    const py = Math.max(0, Math.min(rect.height, y))
    home.style.setProperty('--glow-x', `${px.toFixed(2)}px`)
    home.style.setProperty('--glow-y', `${py.toFixed(2)}px`)
  }

  const reset = () => {
    home.style.setProperty('--glow-x', '50%')
    home.style.setProperty('--glow-y', '28%')
    home.classList.remove('is-active')
  }

  const onMove = (event) => updateByEvent(event)
  const onEnter = (event) => {
    home.classList.add('is-active')
    updateByEvent(event)
  }
  const onLeave = () => reset()

  home.addEventListener('mousemove', onMove)
  home.addEventListener('mouseenter', onEnter)
  home.addEventListener('mouseleave', onLeave)

  reset()
  detach = () => {
    home.removeEventListener('mousemove', onMove)
    home.removeEventListener('mouseenter', onEnter)
    home.removeEventListener('mouseleave', onLeave)
  }
})

onBeforeUnmount(() => {
  if (typeof detach === 'function') detach()
})
</script>

<style>
.VPHome {
  --glow-x: 50%;
  --glow-y: 28%;
  --glow-opacity: 0.25;
  --bg-extend: 96px;
  position: relative;
  isolation: isolate;
  overflow: clip;
  margin-bottom: 0 !important;
  min-height: 100vh;
}

.VPHome > * {
  position: relative;
  z-index: 1;
}

.VPFeatures.VPHomeFeatures {
  padding-bottom: 64px;
}

.VPHome::before {
  content: '';
  position: absolute;
  inset: 0 0 calc(-1 * var(--bg-extend)) 0;
  z-index: 0;
  pointer-events: none;
  background: transparent;
  backdrop-filter: blur(14px) saturate(1.08);
  -webkit-backdrop-filter: blur(14px) saturate(1.08);
  mask-image: radial-gradient(ellipse at 52% 42%, rgba(0, 0, 0, 0.92) 40%, rgba(0, 0, 0, 0.7) 72%, rgba(0, 0, 0, 0.52) 100%);
  -webkit-mask-image: radial-gradient(ellipse at 52% 42%, rgba(0, 0, 0, 0.92) 40%, rgba(0, 0, 0, 0.7) 72%, rgba(0, 0, 0, 0.52) 100%);
}

.VPHome::after {
  content: '';
  position: absolute;
  inset: 0 0 calc(-1 * var(--bg-extend)) 0;
  z-index: 0;
  opacity: var(--glow-opacity);
  transition: opacity 180ms ease;
  pointer-events: none;
  background:
    radial-gradient(640px circle at var(--glow-x) var(--glow-y), color-mix(in srgb, var(--vp-c-brand-1) 26%, transparent), transparent 80%),
    radial-gradient(360px circle at var(--glow-x) var(--glow-y), color-mix(in srgb, var(--vp-c-brand-2) 16%, #fff), transparent 82%),
    radial-gradient(860px circle at var(--glow-x) calc(var(--glow-y) + 42px), color-mix(in srgb, var(--vp-c-brand-3) 10%, transparent), transparent 84%);
  mix-blend-mode: screen;
}

.VPHome.is-active {
  --glow-opacity: 0.40;
}

.dark .VPHome::before {
  backdrop-filter: blur(16px) saturate(1.14);
  -webkit-backdrop-filter: blur(16px) saturate(1.14);
}

.dark .VPHome::after {
  background:
    radial-gradient(820px circle at var(--glow-x) var(--glow-y), color-mix(in srgb, var(--vp-c-brand-1) 21%, var(--vp-c-bg-soft) 10%), transparent 84%),
    radial-gradient(520px circle at var(--glow-x) calc(var(--glow-y) + 8px), color-mix(in srgb, var(--vp-c-brand-2) 14%, var(--vp-c-bg-soft) 14%), transparent 86%),
    radial-gradient(1060px circle at calc(var(--glow-x) + 6px) calc(var(--glow-y) + 42px), color-mix(in srgb, var(--vp-c-brand-3) 10%, var(--vp-c-bg-soft) 20%), transparent 88%),
    radial-gradient(360px circle at calc(var(--glow-x) - 10px) calc(var(--glow-y) - 8px), color-mix(in srgb, var(--vp-c-brand-soft) 11%, var(--vp-c-bg-soft) 22%), transparent 87%);
}

.dark .VPHome.is-active {
  --glow-opacity: 0.32;
}

@media (max-width: 960px) {
  .VPHome {
    --bg-extend: 72px;
  }
}
</style>

