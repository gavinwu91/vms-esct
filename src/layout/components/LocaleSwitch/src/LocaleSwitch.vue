<script lang="ts" setup>
import { computed, unref } from 'vue'
import { useLocaleStore } from '@/store/modules/locale'
import { useDesign } from '@/hooks/web/useDesign'
import { useLocale } from '@/hooks/web/useLocale'

defineOptions({ name: 'LocaleSwitch' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('locale-switch')
const localeStore = useLocaleStore()
const { changeLocale } = useLocale()

// 当前语言
const currentLocale = computed(() => localeStore.getCurrentLocale)

// 切换语言
const toggleLocale = async () => {
  const targetLang = unref(currentLocale).lang === 'en' ? 'ar' : 'en'
  
  // 使用官方钩子切换语言
  await changeLocale(targetLang)
  
  // 按照项目规范刷新页面以完成初始化
  window.location.reload()
}
</script>

<template>
  <div
    :class="[prefixCls, 'locale-switch-btn']"
    @click="toggleLocale"
    :title="unref(currentLocale).lang === 'en' ? 'Switch to Arabic' : 'Switch to English'"
  >
    <div class="icon-container">
      <span class="lang-text">{{ unref(currentLocale).lang === 'en' ? 'EN' : 'AR' }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.locale-switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px; /* 统一高度为 28px */
  padding: 0 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background: rgba(56, 189, 248, 0.1);
    transform: translateY(-1px);
    
    .locale-icon, .lang-text {
      color: #38bdf8 !important;
    }
  }

  &:active {
    transform: scale(0.92);
  }

  .icon-container {
    display: flex;
    align-items: center;

    .lang-text {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0px; /* 紧凑字间距 */
      transition: color 0.3s;
      text-align: center;
    }
  }
}
</style>
