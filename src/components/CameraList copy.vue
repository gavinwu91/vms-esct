<template>
    <!-- 左侧摄像头树 -->
    <div class="sidebar">
      <div class="panel-title">
         <FontAwesomeIcon :icon="['fas', 'camera']" />
         摄像头列表
      </div>
      <el-input
        v-model="searchTerm"
        placeholder="搜索摄像头"
        clearable
        class="search-box"
      />
      <el-tree
        :data="filteredTree"
        :props="defaultProps"
        node-key="id"
        highlight-current
        draggable
        :expand-on-click-node="false"
        @node-drag-start="handleDragStart"
        @node-dblclick="handleDoubleClick"
        class="camera-tree"
      />
    </div>


</template>

<script setup>
import { ref, computed } from 'vue';
import { ElInput, ElTree } from 'element-plus';
import 'element-plus/es/components/tree/style/css';
import 'element-plus/es/components/input/style/css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
  cameras: Array // 树形结构数据
});

const searchTerm = ref('');
const videoPlayers = ref([]);

const defaultProps = {
  children: 'children',
  label: 'name'
};

function handleDragStart(node, event) {
  const data = node.data;
  if (!data.children) {
    event.dataTransfer.setData('camera', JSON.stringify(data));
  }
}

function handleDoubleClick(node) {
  if (!node.children) addToWall(node);
}

function addToWall(camera) {
  if (!videoPlayers.value.find(p => p.id === camera.id)) {
    videoPlayers.value.push({ ...camera });
  }
}

function removePlayer(index) {
  videoPlayers.value.splice(index, 1);
}

function maximizePlayer(index) {
  const player = videoPlayers.value.splice(index, 1)[0];
  videoPlayers.value.unshift(player);
}

// 搜索功能
function filterTree(data, term) {
  return data
    .map(node => {
      if (node.children) {
        const filtered = filterTree(node.children, term);
        if (filtered.length > 0 || node.name.toLowerCase().includes(term)) {
          return { ...node, children: filtered };
        }
      } else if (node.name.toLowerCase().includes(term)) {
        return node;
      }
      return null;
    })
    .filter(Boolean);
}

const filteredTree = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  return term ? filterTree(props.cameras, term) : props.cameras;
});
</script>

<style scoped>
.video-wall {
  display: flex;
  height: 100%;
  background: #0e1a2b;
  color: #fff;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background: rgba(20, 30, 48, 0.85);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
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
  margin-bottom: 10px;
  :deep(.el-input__inner) {
    background-color:rgba(20, 25, 45, 0.85);
  }
}

.camera-tree {
  flex: 1;
  overflow-y: auto;
  background: transparent;
  color: #d1c5cf;
  --el-tree-node-hover-bg-color: rgba(255, 255, 255, 0.05);
  --el-color-primary: #4d2a3e;
  --el-color-primary-light-9: #343f49;
}

.video-grid {
  flex: 1;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  padding: 20px;
}

.video-cell {
  background: #1f2d3d;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #2a3b4d;
  font-size: 0.95rem;
  font-weight: bold;
}

.video-actions button {
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  margin-left: 8px;
}

.video-actions button:hover {
  color: #fff;
}

.video-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111b27;
  color: #8ecdf8;
  font-size: 1rem;
}

.mock-video {
  border: 2px dashed #4afc9c;
  padding: 20px;
  border-radius: 8px;
}
</style>