<template>
  <div class="camera-panel">
    <div class="flex justify-between">
      <div class="panel-title"> <FontAwesomeIcon :icon="['fas', 'camera']" /> Device List </div>
      <div class="items-center pr-15px">
        <el-link
          type="primary"
          @click="emits('change-show-type')"
          :icon="Switch"
          :underline="false"
          class="!text-18px"
        />
      </div>
    </div>
    <div class="camera-list">
      <el-tree
        ref="deviceTreeRef"
        class="camera-tree"
        :props="defaultProps"
        :load="loadNodes"
        empty-text="Loaded, please later"
        node-key="id"
        highlight-current
        lazy
        :filter-node-method="filterNode"
        :default-expanded-keys="[]"
        :key="treeKey"
      >
        <template #default="{ node, data }">
          <div
            class="tree-node"
            :draggable="data.type === 'device'"
            @dragstart="ondragstart($event, data)"
            @dblclick="doubleClick(data)"
          >
            <el-icon v-if="data.type === 'device'" class="tree-icon !mr-5px">
              <VideoCamera />
            </el-icon>
            <el-icon v-else class="tree-icon !mr-5px">
              <OfficeBuilding />
            </el-icon>
            <span>{{ node.label }}</span>
            <span v-if="data.type === 'camera'" class="status-indicator"></span>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { loadCameraTree } from '@/api/device'
import { defaultProps } from '@/utils/tree'
import { VideoCamera, OfficeBuilding, Switch } from '@element-plus/icons-vue'
import type { LoadFunction, TreeInstance, FilterNodeMethodFunction } from 'element-plus'
defineOptions({
  name: 'CameraAsyncLoadTree'
})

/**define */
const emits = defineEmits(['start-drag', 'change-show-type', 'dblclick'])
const props = defineProps({})

/**define */

/** properties begin */
const deviceTreeRef = ref<TreeInstance>()
const treeKey = ref(0)
/** properties end */

/** methed begin */

const ondragstart = (event, data) => {
  emits('start-drag', event, data.device)
}

const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.level === 0) {
    if (node.data.type !== 'device') {
      loadCameraTree({ cameraType: 0, areaId: node.data.id }).then((res) => {
        resolve(res)
        nextTick(() => {
          // 延迟执行，确保节点已渲染到 DOM
          if (deviceTreeRef.value) {
            // 遍历您加载的第一层节点
            res.forEach((item) => {
              // 只有非叶子节点才需要展开
              if (!item.isLeaf) {
                // 使用 store.nodesMap[key] 找到该节点对象
                let treeNode = deviceTreeRef.value?.getNode(item)
                if (treeNode) {
                  treeNode.expand() // 设置为展开状态
                }
              }
            })
          }
        })
        // return resolve(res)
      })
    }
  } else {
    if (node.data.type !== 'device') {
      loadCameraTree({ cameraType: 0, areaId: node.data.id }).then((res) => {
        return resolve(res)
      })
    }
  }
  return reject([])
}
const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}

const doubleClick = (data) => {
  if (data.device) {
    emits('dblclick', data.device)
  }
}
/** methed end */
</script>

<style lang="scss" scoped>
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

.camera-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}
.camera-tree {
  width: 26vh;
  height: 86vh;
  overflow: auto;
  background: var(--color-panel-bg-light);
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #4afc9c;
  border-radius: 50%;
}

:deep(.el-tree::-webkit-scrollbar-track) {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 5px;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3);
}

:deep(.el-tree::-webkit-scrollbar-thumb) {
  background: #ded9d5;
  border-radius: 10px;
}

:deep(.el-tree::-webkit-scrollbar) {
  width: 5px;
  height: 5px;
}

:deep(.el-tree::-webkit-scrollbar-thumb:hover) {
  background: rgb(100, 100, 100);
  border-radius: 10px;
}

:deep(.el-tree::-webkit-scrollbar-thumb:active) {
  background: rgb(68, 68, 68);
  border-radius: 10px;
}

:deep(.el-tree::-webkit-scrollbar-corner) {
  background: #1a1a1a;
}
</style>
