<template>
  <div>
    <el-row>
      <el-col :span="4">
        <div class="camera-tree h-90vh">
          <el-card class="tree-card">
            <template #header>
              <div class="tree-header">
                <span class="tree-title">Device Location</span>
              </div>
            </template>

            <div class="tree-search">
              <el-input
                v-model="treeFilterText"
                placeholder="search"
                clearable
                prefix-icon="el-icon-search"
                @input="filterTree"
              />
            </div>

            <DeviceTree
              class="h-75vh overflow-auto"
              ref="treeRef"
              :treeData="treeData"
              :checkable="false"
              @node-click="handleNodeClick"
            />
          </el-card>
        </div>
      </el-col>
      <el-col :span="20">
        <div class="query-container">
          <el-form
            :model="queryForm"
            ref="form"
            label-width="80px"
            :inline="false"
            size="normal"
            class="flex justify-between pr-10"
          >
            <div class="flex justify-start">
              <el-form-item label="Device IP">
                <el-input v-model="queryForm.ip" class="!w-30vh" clearable placeholder="IP" />
              </el-form-item>
              <el-form-item label="Status" v-show="loadTool.contentType == 1">
                <el-select
                  v-model="queryForm.status"
                  class="!w-30vh"
                  clearable
                  placeholder="Status"
                >
                  <el-option :key="0" label="All" value="" />
                  <el-option :key="1" label="Online" value="Online" />
                  <el-option :key="2" label="Offline" value="Offline" />
                </el-select>
              </el-form-item>
              <el-form-item label="Time" size="normal" class="!w-60vh">
                <el-date-picker
                  v-model="queryForm.timeRange"
                  :clearable="false"
                  type="daterange"
                  range-separator="To"
                  size="normal"
                  start-placeholder="Start date"
                  end-placeholder="End date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </div>
            <div>
              <el-form-item>
                <el-button type="success" @click="toggleListAndStatistics">{{
                  loadTool.toggleName
                }}</el-button>
                <el-button type="primary" @click="onSubmit">Search</el-button>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <div class="border-1" v-loading="loading" element-loading-text="Loading">
          <div v-if="loadTool.contentType == 1 && loadTool.show" :key="loadTool.key2">
            <List :outer-query="queryForm" @show-currentip-statistics="sinleIpStatistics" :loading-done="loading =false"/>
          </div>

          <div v-else :key="loadTool.key" class="h-78vh overflow-auto">
            <div class="w-full h-50vh" v-for="(item, index) in response.ipDatas" :key="index">
              <Statistisc :dates="response.xaxisData" :ipData="item" />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      :title="singleIpStatusTool.ip"
      v-model="singleIpStatusTool.open"
      :key="singleIpStatusTool.key"
      append-to-body
      :width="width"
    >
      <Statistisc
        :dates="singleIpStatusTool.xaxisData"
        :ipData="singleIpStatusTool.ipDatas"
        :width="width"
      />
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, Transition } from 'vue'
import Statistisc from './statistics.vue'
import List from './list.vue'
import { getDay } from '@/api/alarmmsg/plate'
import { statistics } from '@/api/devicelog'
import { init } from 'echarts'
import DeviceTree from '@/components/Device/DeviceTree.vue'
import { getDepartments, getAreas, getGroups } from '@/api/device'
const width = ref('150vh')
defineOptions({ name: 'CameraLogIndex' })
const route = useRoute()
const routeParam = route.query.ip as string
const queryForm = ref({
  timeRange: [getDay(-7), getDay(-0)],
  ip: '',
  startTime: '',
  endTime: '',
  status: '',
  areaId: ''
})

const loadTool = ref({
  show: false,
  key: 1,
  contentType: 1,
  key2: 1,
  toggleName: 'statistics'
})

let response = reactive({
  xaxisData: [],
  ipDatas: []
})
const loading = ref(false)

const treeRef = ref(null)
// 树形数据
const treeData = ref([])

const treeProps = {
  children: 'children',
  label: 'name'
}
const treeFilterText = ref('')
const statisticsLoading = ref(false)

// 当前选中树节点ID（分组id）
const currentTreeType = ref('dept')
const currentTreeNodeId = ref(null)

const singleIpStatusTool = ref({
  open: false,
  key: 1,
  xaxisData: [],
  ipDatas: [],
  ip: ''
})

const sinleIpStatistics = async (form) => {
  statistics(form).then((res) => {
    console.log('res === ', res)
    singleIpStatusTool.value.xaxisData = res.xaxisData
    singleIpStatusTool.value.ipDatas = res.ipDatas[0]
    singleIpStatusTool.value.key++
    singleIpStatusTool.value.open = true
  })
}

const executeStatistics = async () => {
  statistics({ ...queryForm.value }).then((res) => {
    response = res
    console.log('response ===== ', response)
    loadTool.value.key++
    loading.value= false
  })
}

const toggleListAndStatistics = () => {
  loading.value = true
  if (loadTool.value.contentType == 1) {
    loadTool.value.contentType = 2
    loadTool.value.toggleName = 'List'
  } else {
    loadTool.value.contentType = 1
    loadTool.value.toggleName = 'Statistics'
  }
  onSubmit()
}

const onSubmit = () => {
  loading.value=true
  queryForm.value.startTime = queryForm.value.timeRange[0]
  queryForm.value.endTime = queryForm.value.timeRange[1]
  if (loadTool.value.contentType == 1) {
    loadTool.value.key2++
  } else {
    executeStatistics()
  }
}

function filterTree() {
  treeRef.value?.filter(treeFilterText.value)
}

// 点击树节点，设置选中分组，刷新表格数据
function handleNodeClick(data) {
  console.log('handleNodeClick  data ====', data)
  // currentTreeNodeId.value = data.id
  queryForm.value.areaId = data.id
  onSubmit()
}

async function fetchTreeData(type) {
  try {
    if (type === 'dept') {
      let deptList = await getDepartments()
      treeData.value = buildDeptTree(deptList)
      console.log('tree res===========', JSON.stringify(treeData.value))
    } else if (type === 'group') {
      treeData.value = await getGroups()
    } else if (type === 'area') {
      let areaList = await getAreas()
      treeData.value = buildAreaTree(areaList)
    }
    // nextTick(() => {
    if (treeData.value.length > 0) {
      const firstNode = treeData.value[0]
      currentTreeNodeId.value = firstNode.id
      treeRef.value.setCurrentKey(firstNode.id)
    }
    // })
  } catch (error) {
    ElMessage.error('Failed to load tree data')
  } finally {
    loading.value = false
  }
}

// 构建树形结构
const buildAreaTree = (regions, parentId = null) => {
  let result = regions
    .filter((region) => {
      // 处理可能的空值
      const regionParentId = region.parentId === null ? null : region.parentId
      if (parentId === null) {
        return regionParentId === null
      } else {
        return regionParentId === parentId
      }
    })
    .map((region) => {
      const children = buildAreaTree(regions, region.id)
      return {
        ...region,
        children: children.length > 0 ? children : undefined
      }
    })
  return result
}

// 构建树形结构
const buildDeptTree = (regions, parentId = 0) => {
  let result = regions
    .filter((region) => {
      // 处理可能的空值
      const regionParentId = region.parentId === 0 ? 0 : region.parentId
      if (parentId === 0) {
        return regionParentId === 0
      } else {
        return regionParentId === parentId
      }
    })
    .map((region) => {
      const children = buildDeptTree(regions, region.id)
      return {
        ...region,
        children: children.length > 0 ? children : undefined
      }
    })
  return result
}

onMounted(async () => {
  console.log('routeParam ==== =', routeParam)
  if (routeParam) {
    queryForm.value.ip = routeParam
  }
  await fetchTreeData('area')

  onSubmit()
  loadTool.value.show = true
})
</script>
<style scoped></style>
