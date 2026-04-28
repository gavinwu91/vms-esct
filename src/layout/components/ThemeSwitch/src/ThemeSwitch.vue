<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'ThemeSwitch' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('theme-switch')
const appStore = useAppStore()

// 是否是暗黑模式
const isDark = computed(() => appStore.getIsDark)

// 切换主题
const themeChange = () => {
  const target = !isDark.value
  console.log('--- Theme Switch Triggered ---', { current: isDark.value, target })
  appStore.setIsDark(target)
}
</script>

<template>
  <div
    :class="[prefixCls, 'theme-switch-btn']"
    @click="themeChange"
  >
    <div class="icon-container" :class="{ 'is-dark': isDark }">
      <!-- 使用具有动效感的图标 -->
      <Icon
        v-if="isDark"
        icon="line-md:moon-rising-filled-loop"
        :size="18"
        class="theme-icon moon"
      />
      <Icon
        v-else
        icon="line-md:sunny-filled-loop"
        :size="18"
        class="theme-icon sun"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.theme-switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px; /* 统一高度为 28px */
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(56, 189, 248, 0.1);
    transform: translateY(-1px);
    
    .theme-icon {
      color: #38bdf8 !important;
    }
  }

  &:active {
    transform: scale(0.92);
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-dark {
      // 暗黑模式下的微调
      .moon {
        color: #fde047 !important;
        filter: drop-shadow(0 0 5px rgba(253, 224, 71, 0.3));
      }
    }

    .sun {
      color: #f59e0b !important;
    }
  }
}

/* 进场动画 */
.theme-icon {
  transition: all 0.3s;
  animation: icon-in 0.4s ease-out forwards;
}

@keyframes icon-in {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-45deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}
</style>
