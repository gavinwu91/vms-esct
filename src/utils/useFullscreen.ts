// composables/useFullscreen.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useFullscreen(targetEl = document.documentElement) {
  const isFullscreen = ref(false)

  const enter = () => {
    if (targetEl.requestFullscreen) {
      targetEl.requestFullscreen()
    }
    // 可添加其它兼容写法
  }

  const exit = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  const toggle = () => {
    isFullscreen.value ? exit() : enter()
  }

  const onChange = () => {
    isFullscreen.value = document.fullscreenElement === targetEl
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', onChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', onChange)
  })

  return {
    isFullscreen,
    enter,
    exit,
    toggle,
  }
}
