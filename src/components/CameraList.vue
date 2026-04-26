<template>
  <div class="camera-panel">
    <div class="flex justify-between">
      <div class="panel-title"> <FontAwesomeIcon :icon="['fas', 'camera']" /> Device List </div>
      <div class="items-center pr-15px" v-show="props.source == 'monitor'">
        <el-link
          type="primary"
          @click="changeToTree"
          :icon="Switch"
          :underline="false"
          class="!text-18px"
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
.stats-bar {
  font-size: 0.85rem;
  color: #a0c8ff;
}
.camera-panel {
  width: 100%;
  height: 100%;
  background: var(--color-panel-bg-light);
  border-radius: 12px;
  padding-left: 25px;
  padding-right: 5px;
  padding-top: 10px;
  padding-bottom: 1px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  color: var(--color-text-dark);
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  /* 标题图标和文字使用品牌色/深色 */
  color: var(--color-primary);
}
.panel-title .svg-inline--fa {
  color: var(--color-primary);
}

.search-box {
  margin-bottom: 15px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0; /* 浅色边框 */
  outline: none;
  background: #f8f8f8; /* 极浅的背景 */
  color: var(--color-text-dark);
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 5px rgba(74, 144, 226, 0.2);
}

.camera-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

.camera-item {
  /* 💥 关键修改：背景改为白色系，更清新 */
  background: #f8f8f8;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: grab;
  /* 边框使用浅色或无边框 */
  border: 1px solid #eeeeee;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  color: var(--color-text-dark);
}

.camera-item:hover {
  background: #eef3f8; /* 悬停时使用浅蓝灰色，保持清新 */
  transform: translateY(-1px); /* 保持位移但减小幅度 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.camera-icon {
  width: 30px;
  height: 30px;
  background: var(--color-primary); /* 使用品牌蓝色 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white; /* 图标为白色 */
}

.camera-name {
  font-weight: 500;
  /* 保持深色文字 */
  color: var(--color-text-dark);
}

.camera-status {
  font-size: 0.8rem;
  color: #555555;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-indicator {
  width: 7px;
  height: 7px;
  background: #4afc9c; /* 保持绿色 */
  border-radius: 50%;
  box-shadow: 0 0 5px #4afc9c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  padding-bottom: 10px;
  gap: 10px;
}

.page-btn {
  /* 按钮改为浅色系 */
  background: #f0f0f0;
  color: var(--color-text-dark);
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f8f8;
  color: #aaaaaa;
}

.stats-bar {
  /* 使用深色文字 */
  color: var(--color-text-dim);
}

.camera-list::-webkit-scrollbar {
  width: 6px; /* 稍微增宽一点点，易于点击，但仍细长 */
  height: 6px;
}

.camera-list::-webkit-scrollbar-track {
  /* 轨道使用与面板背景相似的极浅灰色，使其几乎不可见 */
  background: var(--color-panel-bg-light); /* #FFFFFF */
  border-radius: 10px;
}

.camera-list::-webkit-scrollbar-thumb {
  /* 滚动条滑块使用柔和的中性灰 */
  background: #c5ccd6;
  border-radius: 10px;
  /* 滚动条边框可以使它看起来更圆润，但我们选择使用 padding 或 border-radius */
}

.camera-list::-webkit-scrollbar-thumb:hover {
  /* 悬停时，颜色略微加深，提供视觉反馈 */
  background: #9aa3ad;
}

.camera-list::-webkit-scrollbar-thumb:active {
  /* 按下时，颜色进一步加深 */
  background: #7f8791;
}
</style>
