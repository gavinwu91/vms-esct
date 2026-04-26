<template>
  <div class="-container">
    <el-divider direction="horizontal" content-position="left" class="!mt-10px !mb-10px" />

    <div>
      <div class="flex justify-start gap-3">
        <el-input
          v-model="treeSearchText"
          placeholder="Device Name"
          class="!w-80%"
          clearable
          @clear="cancelSearch"
          prefix-icon="el-icon-search"
        />
        <el-button type="primary" size="default" @click="filterCameraWindow">Search</el-button>
      </div>
      <div class="h-43vh overflow-y-auto">
        <el-tree
          ref="searchTreeRef"
          class="!w-full"
          :props="defaultDataProps"
          :data="deviceOptions"
          empty-text="Please input search text"
          node-key="key"
          show-checkbox
          :key="deviceTreeKey"
          @check="onSearchCheck"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon v-if="data.type === 'device'" class="tree-icon" color="purple">
                <VideoCamera />
              </el-icon>
              <el-icon v-else class="tree-icon" color="green">
                <OfficeBuilding />
              </el-icon>
              <span>
                {{ node.label }}
              </span>
            </div>
          </template>
        </el-tree>
      </div>
    </div>
    <el-divider direction="horizontal" content-position="left" />

    <div class="text-right">
      <span>
        <el-button @click="closeSearch">Cancel</el-button>
        <el-button type="primary" @click="confirmDeviceIds">Confirm</el-button>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TreeInstance } from 'element-plus'
import { defaultDataProps } from '@/utils/tree'
import { filterPermissionDeviceTree } from '@/api/device'
import { VideoCamera, OfficeBuilding } from '@element-plus/icons-vue'
defineOptions({
  name: 'DeviceSearchTree'
})

const emits = defineEmits(['confirm-search-device-ids', 'close-search'])
const props = defineProps({})

const treeSearchText = ref('')
const deviceOptions = ref<any[]>([])
const deviceTreeKey = ref(1)
const searchTreeRef = ref<TreeInstance>()

const closeSearch = () => {
  emits('close-search')
}
onMounted(() => {})
let lastSearchResult = []
const filterCameraWindow = () => {
  const kw = treeSearchText.value.trim()
  if (!kw) {
    return
  }
  filterPermissionDeviceTree({ keyWord: treeSearchText.value }).then((treeData) => {
    deviceTreeKey.value++
    deviceOptions.value = treeData
    lastSearchResult = treeData
    nextTick()
    expandAll()
  })
}
const expandAll = async () => {
  await nextTick()
  if (!searchTreeRef.value || lastSearchResult.length === 0) return
  const walk = (nodes) => {
    nodes.forEach((n) => {
      const treeNode = searchTreeRef.value.getNode(n.key)
      if (treeNode && treeNode.data.type === 'region') {
        treeNode.expand()
      }
      if (n.children) walk(n.children)
    })
  }
  walk(lastSearchResult)
}

const cancelSearch = () => {
  treeSearchText.value = ''
  deviceOptions.value = []
}
const checkedDeviceIds = ref([])
const onSearchCheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = checked.checkedNodes
  checkedDeviceIds.value = checkDeviceNodes.filter((x) => x.type == 'device').map((y) => y.id)
}

const confirmDeviceIds = () => {
  emits('confirm-search-device-ids', checkedDeviceIds.value)
}
</script>

<style lang="scss" scoped></style>
