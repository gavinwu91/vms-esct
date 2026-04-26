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
        style="width: 36px;height: 36px;margin-right: 5px;"
        :src="getImage(logo)"
      />
      <div
        v-if="show"
        :class="[
          'text-16px font-700 custom-hover',
          {
            'text-[var(--logo-title-text-color)]': layout === 'classic',
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
    font-size: 15px;
    white-space: nowrap;
    width: 295px;
    display: flex;
    align-items: center;
    color: #fff;
    text-decoration: none;

  }
</style>
