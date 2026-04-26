<template>
  <div class="camera-panel">
    <div class="flex justify-between">
      <div class="panel-title"> <FontAwesomeIcon :icon="['fas', 'camera']" /> Device List </div>
      <div class="items-center" v-show="props.source == 'monitor'">
        <el-link
          type="primary"
          @click="changeToTree"
          :icon="Switch"
          :underline="false"
          class="!text-18px !text-white"
        />
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search..."
        @keyup.enter="emit('search', searchTerm)"
      />
    </div>

    <!-- 摄像头列表（分页 + 滚动） -->
    <div class="camera-list">
      <div
        v-for="camera in props.cameras"
        :key="camera.id"
        class="camera-item"
        draggable="true"
        @dragstart="$emit('start-drag', $event, camera)"
        @dblclick="$emit('dblclick', camera)"
      >
        <div class="camera-icon">
          <FontAwesomeIcon :icon="['fas', 'video']" />
        </div>
        <div class="camera-info">
          <div class="camera-name">{{ camera.cameraName }}</div>
          <div class="camera-status">
            <span class="status-indicator"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button
        class="page-btn"
        :disabled="props.currentPage === 1"
        @click="emit('page-change', props.currentPage - 1, searchTerm)"
      >
        <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
      </button>
      <div class="stats-bar">{{ props.currentPage }} / {{ props.totalPages }}</div>
      <button
        class="page-btn"
        :disabled="props.currentPage === props.totalPages"
        @click="emit('page-change', props.currentPage + 1, searchTerm)"
      >
        <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Switch } from '@element-plus/icons-vue'
const props = defineProps({
  totalPages: Number,
  currentPage: Number,
  cameras: Array,
  source: {
    type: String,
    default: 'monitor'
  }
})
const emit = defineEmits(['start-drag', 'dblclick', 'page-change', 'search', 'change-show-type'])

const searchTerm = ref('')
const perPage = 10

const changeToTree = () => {
  emit('change-show-type')
}
</script>

<style scoped>
.camera-panel {
  width: 300px;
  background: rgba(20, 30, 48, 0.85);
  border-radius: 12px;
  padding-left: 25px;
  padding-right: 25px;
  padding-top: 10px;
  padding-bottom: 1px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-box {
  margin-bottom: 12px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.95rem;
}

.camera-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

.camera-item {
  background: rgba(40, 55, 90, 0.6);
  border-radius: 8px;
  padding: 12px;
  cursor: grab;
  border: 1px solid rgba(100, 150, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
}
.camera-item:hover {
  background: rgba(60, 85, 140, 0.8);
  transform: translateY(-2px);
}

.camera-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3494e6, #ec6ead);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.camera-info {
  flex: 1;
}
.camera-name {
  font-weight: 600;
}
.camera-status {
  font-size: 0.85rem;
  color: #4afc9c;
  display: flex;
  align-items: center;
  gap: 5px;
}
.status-indicator {
  width: 8px;
  height: 8px;
  background: #4afc9c;
  border-radius: 50%;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}
.page-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.camera-list::-webkit-scrollbar {
  width: 5px;
}

.camera-list::-webkit-scrollbar-track {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 10px;
}

.camera-list::-webkit-scrollbar-thumb {
  background: #cac5bf;
  border-radius: 10px;
}

.camera-list::-webkit-scrollbar-thumb:hover {
  background: rgb(100, 100, 100);
  border-radius: 10px;
}

.camera-list::-webkit-scrollbar-thumb:active {
  background: rgb(68, 68, 68);
  border-radius: 10px;
}
</style>
