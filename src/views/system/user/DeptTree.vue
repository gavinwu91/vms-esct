<template>
  <div class="head-container">
    <el-input v-model="deptName" class="mb-20px" clearable placeholder="Please input Dept name">
      <template #prefix>
        <Icon icon="ep:search" />
      </template>
    </el-input>
  </div>
  <div class="head-container">
    <el-tree
      ref="treeRef"
      :data="deptList"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :props="defaultProps"
      default-expand-all
      highlight-current
      node-key="id"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { ElTree } from 'element-plus'
import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SystemUserDeptTree' })

const deptName = ref('')
const deptList = ref<Tree[]>([]) // 树形结构
const treeRef = ref<InstanceType<typeof ElTree>>()

/** 获得部门树 */
const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  deptList.value = []
  deptList.value.push(...handleTree(res))
}

/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

/** 处理部门被点击 */
const handleNodeClick = async (row: { [key: string]: any }) => {
  emits('node-click', row)
}
const emits = defineEmits(['node-click'])

/** 监听deptName */
watch(deptName, (val) => {
  treeRef.value!.filter(val)
})

/** 初始化 */
onMounted(async () => {
  await getTree()
})
</script>
<style lang="scss" scoped>
.head-container {
  background: transparent !important;
  margin-bottom: 15px;
}

html.dark {
  :deep(.el-input) {
    .el-input__wrapper {
      background-color: rgba(15, 23, 42, 0.4) !important;
      border: 1px solid rgba(56, 189, 248, 0.2) !important;
      box-shadow: none !important;
      border-radius: 8px !important;
      transition: all 0.3s;

      &:hover, &.is-focus {
        border-color: rgba(56, 189, 248, 0.5) !important;
        background-color: rgba(15, 23, 42, 0.6) !important;
      }
      
      .el-input__inner {
        color: #e2e8f0 !important;
        &::placeholder {
          color: rgba(148, 163, 184, 0.5) !important;
        }
      }
      
      .el-input__prefix {
        color: #38bdf8 !important;
      }
    }
  }

  :deep(.el-tree) {
    background: transparent !important;
    color: #94a3b8 !important;

    .el-tree-node {
      &:focus > .el-tree-node__content {
        background-color: rgba(56, 189, 248, 0.1) !important;
      }
      
      &.is-current > .el-tree-node__content {
        background: linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, transparent 100%) !important;
        color: #38bdf8 !important;
        font-weight: 600;
        border-left: 2px solid #38bdf8;
      }
    }

    .el-tree-node__content {
      height: 36px !important;
      padding: 0 8px !important;
      border-radius: 4px;
      margin: 2px 0;
      transition: all 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
        color: #e2e8f0 !important;
      }
    }
    
    .el-tree-node__expand-icon {
      color: #64748b !important;
      &.is-leaf {
        color: transparent !important;
      }
    }
  }
}
</style>
