<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'Collapse' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('collapse')

defineProps({
  color: propTypes.string.def('')
})

const appStore = useAppStore()

const collapse = computed(() => appStore.getCollapse)

const toggleCollapse = () => {
  const collapsed = unref(collapse)
  appStore.setCollapse(!collapsed)
}
</script>

<template>
  <div :class="prefixCls" @click="toggleCollapse">
    <Icon
      :color="color"
      :icon="collapse ? 'ep:expand' : 'ep:fold'"
      :size="18"
      class="cursor-pointer"
    />
  </div>
</template>

<style lang="scss">
/* ========== VMS 折叠按钮 (全局生效以支持布局引用) ========== */
.vms-ui-collapse-btn {
  position: absolute;
  right: 0;
  top: 24px;
  transform: translateY(-50%);
  width: 8px;
  height: 32px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-right: none;
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  padding: 0;
  outline: none;
}

.vms-ui-collapse-btn:hover {
  background: rgba(56, 189, 248, 0.3);
  border-color: rgba(56, 189, 248, 0.5);
  color: #38bdf8;
  width: 12px;
}

.vms-ui-collapse-btn svg {
  width: 10px;
  height: 10px;
  stroke: currentColor;
}
</style>
