<template>
      <div>
          <el-tree
            ref="treeRef"
            :data="props.treeData"
            :props="treeProps"
            :filter-node-method="filterNode"
            node-key="id"
            highlight-current
            :expand-on-click-node="false"
            :default-expanded-keys="expandedKeys"
            :show-checkbox="props.checkable"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon v-if="data.type === 'device'" class="tree-icon">
                  <VideoCamera />
                </el-icon>
                <el-icon v-else class="tree-icon">
                  <OfficeBuilding />
                </el-icon>
                <span>{{ node.label }}</span>
                <span
                  v-if="data.type === 'camera'"
                  class="status-indicator"
                  :class="getStatusClass(data.status)"
                ></span>
              </span>
            </template>
          </el-tree>
   </div>
  </template>
  
  <script setup>
  import {
  ArrowDown,
  VideoCamera,
  Folder,
  VideoPlay,
  Delete,
  OfficeBuilding
} from '@element-plus/icons-vue'

  const props = defineProps({
    treeData: {
      type: Array,
      required: true,
    },
    checkable: {
      type: Boolean,
      default: false,
    }
  });

  const emit = defineEmits(['node-click']);
  const treeRef = ref(null)
  const treeProps = {
    children: 'children',
    label: 'name'
  }

  defineExpose({
    setCurrentKey: (key) => {
      treeRef.value.setCurrentKey(key)
    }
  })

  function getStatusClass(status) {
    return status === 0 ? 'status-online' : 'status-offline'
  }

  function filterNode(value, data) {
    if (!value) return true
    return data.name.toLowerCase().includes(value.toLowerCase())
  }

  const expandedKeys = computed(() => {
    return props.treeData.map((node) => node.id)
  })

  function handleNodeClick(nodeData, node, comp) {
    emit('node-click', nodeData, node, comp)
  }
  </script>
  
  <style scoped>
  
  .tree-node {
    display: flex;
    align-items: center;
  }

  .tree-icon {
    margin-right: 6px;
    font-size: 16px;
    color: #409eff;
  }

  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 8px;
  }

  .status-online {
    background-color: #67c23a;
  }

  .status-offline {
    background-color: #f56c6c;
  }
  </style>
  