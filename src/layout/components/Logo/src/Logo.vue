<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'Logo' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)

const title = computed(() => appStore.getTitle)

const logo = computed(() => appStore.getDefLogo)
const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

onMounted(() => {
  if (unref(collapse)) show.value = false
})

watch(
  () => collapse.value,
  (collapse: boolean) => {
    if (unref(layout) === 'topLeft' || unref(layout) === 'cutMenu') {
      show.value = true
      return
    }
    // vmsUi 布局：折叠时只隐藏标题文字，Logo 图片始终显示
    if (!collapse) {
      setTimeout(() => {
        show.value = !collapse
      }, 400)
    } else {
      show.value = !collapse
    }
  }
)

watch(
  () => layout.value,
  (layout) => {
    if (layout === 'top' || layout === 'cutMenu') {
      show.value = true
    } else {
      if (unref(collapse)) {
        show.value = false
      } else {
        show.value = true
      }
    }
  }
)

const getImage = (name)=>{
  switch (name) {
    case "ROP":
      return new URL(`@/assets/logo/ROP.png` ,import.meta.url).href
    case "RO":
      return new URL(`@/assets/logo/RO.png` ,import.meta.url).href
    case "ISS":
      return new URL(`@/assets/logo/ISS.png` ,import.meta.url).href
  }
}
</script>

<template>
  <div>
    <router-link
      class="left-title"
      to="/"
    >
      <img
        class="logo-img"
        :src="getImage(logo)"
      />
      <div
        v-if="show"
        :class="[
          'text-13px font-600 custom-hover vms-logo-title',
          {
            'text-[var(--vms-text-main)]': layout === 'classic',
            'text-[var(--top-header-text-color)]':
              layout === 'topLeft' || layout === 'top' || layout === 'cutMenu'
          }
        ]"
      >
        منظومة سحاب المرئية
      </div>
    </router-link>
  </div>
</template>
<style scoped lang="scss">
  .left-title {
    font-weight: bold;
    font-size: 13px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    color: #fff;
    text-decoration: none;
    overflow: hidden;
    min-width: 0;
    flex: 1;
    gap: 8px;
  }

  .logo-img {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(34, 211, 238, 0.25);
  }

  .vms-logo-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }
</style>

<style lang="scss">
/* ========== VMS 侧边栏 Logo 布局 (全局生效以支持布局引用) ========== */
.vms-ui-header {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  min-height: 48px;
  flex-shrink: 0;
  padding: 0 20px 0 10px;
  overflow: visible;
}

.vms-ui-logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.vms-ui-logo-img {
  width: 26px !important;
  height: 26px !important;
  flex-shrink: 0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(34, 211, 238, 0.25);
  filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.3));
}

.vms-ui-logo-title {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

/* 折叠时 Logo 居中 */
.vms-ui-sidebar.collapsed .vms-ui-header {
  justify-content: center;
  padding: 0;
}

.vms-ui-sidebar.collapsed .vms-ui-logo-link {
  flex: 0;
  justify-content: center;
  overflow: visible;
}
</style>
