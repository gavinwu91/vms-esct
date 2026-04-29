<script setup lang="ts">
import { ref, watch } from 'vue'
import { User, Van } from '@element-plus/icons-vue'
import FaceAlarmCenter from './FaceAlarmCenter.vue'
import VehicleAlarmCenter from './VehicleAlarmCenter.vue'
import BodyAlarmCenter from './BodyAlarmCenter.vue'

const props = defineProps<{
  initialTab?: string
}>()

// 'face', 'vehicle', 'body'
const activeModule = ref('face')

const updateTab = (tab?: string) => {
  if (tab === 'vehicle-alarm') activeModule.value = 'vehicle'
  else if (tab === 'body-alarm') activeModule.value = 'body'
  else activeModule.value = 'face'
}

updateTab(props.initialTab)

watch(() => props.initialTab, (newTab) => {
  updateTab(newTab)
})
</script>

<template>
  <div class="unified-alarm-container">
    <!-- Unified Page Header -->
    <header class="unified-page-header">
      <div class="header-left">
        <h1 class="title">Alarm Center</h1>
        <div class="module-toggle-inline">
          <div 
            class="toggle-item" 
            :class="{ active: activeModule === 'face' }"
            @click="activeModule = 'face'"
          >
            Face Alarms
          </div>
          <div 
            class="toggle-item" 
            :class="{ active: activeModule === 'vehicle' }"
            @click="activeModule = 'vehicle'"
          >
            Vehicle Alarms
          </div>
          <div 
            class="toggle-item" 
            :class="{ active: activeModule === 'body' }"
            @click="activeModule = 'body'"
          >
            Body Alarms
          </div>
          <div class="toggle-slider" :class="activeModule"></div>
        </div>
      </div>
      <div class="header-right">
        <!-- Global buttons could go here if needed -->
      </div>
    </header>

    <!-- Content Area -->
    <div class="module-content">
      <transition name="fade-slide" mode="out-in">
        <FaceAlarmCenter v-if="activeModule === 'face'" :hideTitle="true" />
        <VehicleAlarmCenter v-else-if="activeModule === 'vehicle'" :hideTitle="true" />
        <BodyAlarmCenter v-else :hideTitle="true" />
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.unified-alarm-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.unified-page-header {
  padding: 6px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.1);
}

.module-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  padding-top: 8px; /* Maintain a small, elegant gap */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;

  .title {
    font-size: 20px;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0;
    letter-spacing: 0.5px;
  }
}

.module-toggle-inline {
  display: flex;
  background: rgba(10, 15, 30, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 3px;
  position: relative;
  width: 360px;
}

.toggle-item {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  padding: 6px 0;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
  
  &.active {
    color: #fff;
  }
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(33.33% - 3px);
  height: calc(100% - 6px);
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  border-radius: 6px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);

  &.vehicle {
    transform: translateX(100%);
  }
  &.body {
    transform: translateX(200%);
  }
}

.module-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Transition Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
