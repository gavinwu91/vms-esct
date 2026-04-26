<template>
  <div class="camera-management-container">
    <el-container>
      <!-- 左侧树形菜单 -->
      <el-aside width="280px" class="tree-aside">
        <el-card class="tree-card">
          <template #header>
            <div class="tree-header">
              <span class="tree-title">Device Location</span>
              <!-- <el-button type="primary" size="small" @click="newGroup">新建分组</el-button> -->
              <!-- <el-dropdown @command="handleLeftTreeCommand">
                    <span class="el-dropdown-link">
                      {{ selectedLabel }}
                      <el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="a">Display by department</el-dropdown-item>
                        <el-dropdown-item command="b">Display by group</el-dropdown-item>
                        <el-dropdown-item command="c">Display by area</el-dropdown-item>
                        <el-dropdown-item command="d">Search by attribute</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown> -->
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
            ref="treeRef"
            :treeData="treeData"
            :checkable="false"
            @node-click="handleNodeClick"
          />
          <!-- <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            :filter-node-method="filterNode"
            node-key="id"
            highlight-current
            :expand-on-click-node="false"
            :default-expanded-keys="expandedKeys"
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
          </el-tree> -->
        </el-card>
      </el-aside>

      <!-- 右侧主内容 -->
      <el-main class="main-content">
        <el-card>
          <template #header>
            <div class="header">
              <div class="title">
                <el-form v-if="!isSelect" :model="searchForm" inline>
                  <el-form-item label="Device Name">
                    <el-input
                      v-model="searchForm.name"
                      placeholder="Please enter device name"
                      clearable
                    />
                  </el-form-item>
                  <el-form-item label="Device Usage">
                    <el-select
                      v-model="searchForm.type"
                      placeholder="Select device usage"
                      style="min-width: 200px"
                      multiple
                      clearable
                      :collapse-tags="true"
                    >
                      <el-option
                        v-for="dict in getIntDictOptions(DICT_TYPE.CAMERA_USAGE)"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                      <!-- <el-option
                            v-for="model in cameraUsages"
                            :key="model.id"
                            :label="model.name"
                            :value="model.id"
                        /> -->
                    </el-select>
                  </el-form-item>
                  <el-form-item label="IP">
                    <el-input
                      v-model="searchForm.ip"
                      placeholder="Please enter ip"
                      clearable
                    />
                  </el-form-item>
                  <!-- <el-form-item label="运行状态">
                      <el-radio-group v-model="searchForm.status">
                        <el-radio-button label="">全部</el-radio-button>
                        <el-radio-button label="0">在线</el-radio-button>
                        <el-radio-button label="1">掉线</el-radio-button>
                      </el-radio-group>
                    </el-form-item> -->
                  <el-form-item>
                    <el-button type="primary" class="vms-main-button" @click="handleSearch"
                      >Search</el-button
                    >
                    <el-button @click="resetSearch" class="vms-reset-button">Reset</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <div class="actions">
                <el-button type="primary" @click="createCamera" class="vms-main-button"
                  >Create device</el-button
                >
                <el-button
                  v-if="isSelect"
                  type="primary"
                  class="vms-main-button"
                  @click="batchDelete"
                  >Batch delete</el-button
                >
                <el-button
                  v-if="isSelect"
                  type="primary"
                  class="vms-main-button"
                  @click="batchEnable"
                  >Batch enable</el-button
                >
                <el-button
                  v-if="isSelect"
                  type="primary"
                  class="vms-main-button"
                  @click="batchDisable"
                  >Batch disable</el-button
                >

                <el-button type="primary" @click="batchImport" class="vms-track-button"
                  >Batch import</el-button
                >
                <el-button @click="toggleSelection">{{
                  isSelect ? 'Cancel Select' : 'Select'
                }}</el-button>

                <el-button type="info" @click="toggleStats" class="vms-track-button">{{
                  showStats ? 'Hide statistics' : 'Show statistics'
                }}</el-button>
              </div>
            </div>
          </template>

          <div v-show="showStats" class="stats-container">
            <el-row :gutter="20">
              <el-col :span="3" v-for="stat in camera_stats" :key="stat.name">
                <stat-card :title="stat.name" :value="stat.value" type="primary" />
              </el-col>
            </el-row>
          </div>

          <!-- <div class="search-container">
            <el-form :model="searchForm" inline>
              <el-form-item label="Camera Name">
                <el-input
                  v-model="searchForm.name"
                  placeholder="Please enter camera name"
                  clearable
                />
              </el-form-item>
              <el-form-item label="CameraUsage">
                <el-select
                  v-model="searchForm.type"
                  placeholder="Select camera usage"
                  style="min-width: 200px"
                  multiple
                  clearable
                  :collapse-tags="true"
                >
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.CAMERA_USAGE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">Search</el-button>
                <el-button @click="resetSearch">Reset</el-button>
                <el-button type="primary" @click="createCamera">Create Camera</el-button>
              </el-form-item>
            </el-form>
          </div> -->

          <el-table
            v-loading="loading"
            :data="tableData"
            style="width: 100%; height: 69vh"
            stripe
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="isSelect" type="selection" width="55" align="center" />
            <el-table-column prop="cameraName" label="Device Name" min-width="100" />
            <el-table-column prop="cameraIp" label="Device IP" min-width="100">
              <template #default="{ row }">
                <div>
                  <el-link
                    type="primary"
                    :underline="true"
                    :href="'http://' + row.cameraIp"
                    target="_blank"
                  >
                    {{ row.cameraIp }}
                  </el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="cameraPort" label="Port" min-width="30" />
            <el-table-column label="Device Usage" min-width="80">
              <template #default="{ row }">
                <el-tag
                  type="success"
                  size="small"
                  effect="dark"
                  v-for="(item, index) in row.cameraUsage"
                  :key="index"
                >
                  {{ getUsageName(item) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cameraAccount" label="Account" min-width="60" />
            <el-table-column prop="cameraPassword" label="Password" min-width="60" />
            <el-table-column
              prop="runningStatus"
              label="Running Status"
              min-width="60"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.runningStatus)" size="small" effect="dark">
                  {{ getStatusLabel(row.runningStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="enableStatus"
              label="Enable Status"
              min-width="60"
              align="center"
            >
              <template #default="{ row }">
                <el-switch
                  v-model="row.enableStatus"
                  :active-value="true"
                  :inactive-value="false"
                  @change="changeCameraStatus(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="Actions" min-width="100" fixed="right" align="center">
              <template #default="{ row }">
                <!-- <el-button size="small" @click="viewDetail(row)">Details</el-button> -->
                <el-button size="small" type="primary" @click="editCamera(row)">Edit</el-button>
                <el-dropdown @command="(command) => handleCommand(command, row)">
                  <el-button size="small">
                    More<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="auth.isVideoPlay" command="preview">
                        <el-icon><VideoPlay /></el-icon>Play
                      </el-dropdown-item>
                      <el-dropdown-item v-if="auth.maintainAuth" command="delete" divided>
                        <el-icon><Delete /></el-icon>Delete
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container flex justify-end">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-main>
    </el-container>

    <!-- 对话框组件 -->
    <CameraDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :data="currentCamera"
      @submit="handleDialogSubmit"
    />

    <VideoPlayerDialog v-model="videoDialogVisible" :camera="currentCamera" :modelValue="true" />

    <BatchImportDialog v-model="importDialogVisible" @success="handleImportSuccess" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
  ArrowDown,
  VideoCamera,
  Folder,
  VideoPlay,
  Delete,
  OfficeBuilding
} from '@element-plus/icons-vue'
import CameraDialog from '@/components/Device/CameraDialog.vue'
import VideoPlayerDialog from '@/components/Device/VideoPlayerDialog.vue'
import BatchImportDialog from '@/components/Device/BatchImportDialog.vue'
import StatCard from '@/components/Device/StatCard.vue'
import DeviceTree from '@/components/Device/DeviceTree.vue'
import {
  getCameras,
  updateCameraStatus,
  deleteCamera,
  deleteCameras,
  enableCameras,
  disableCameras,
  getCameraStat,
  createDevice,
  getDepartments,
  getAreas,
  getGroups
} from '@/api/device'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as authUtil from '@/utils/auth'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
const camera_stats = ref([])
const treeRef = ref(null)
// 权限控制
const auth = ref({
  maintainAuth: true,
  isShowAuthDevice: true,
  isVideoPlay: true,
  editDept: true
})

// 显示当前选中项的名称
const selectedLabel = ref('Display by department')

// 命令与显示文本的映射
const commandLabelMap = {
  a: 'Display by department',
  b: 'Display by group',
  c: 'Display by area',
  d: 'Search by attribute'
}

const handleLeftTreeCommand = async (command) => {
  if (String(command) === 'a') {
    currentTreeType.value = 'dept'
    await fetchTreeData('dept')
  } else if (String(command) === 'b') {
    currentTreeType.value = 'group'
    await fetchTreeData('group')
  } else if (String(command) === 'c') {
    currentTreeType.value = 'area'
    await fetchTreeData('area')
  } else {
    currentTreeType.value = 'attr'
  }
  await fetchTableData()
  const label = commandLabelMap[String(command)]
  selectedLabel.value = label || 'Display by department'
}

// 树形数据
const treeData = ref([])

const treeProps = {
  children: 'children',
  label: 'name'
}

const treeFilterText = ref('')

// 搜索表单
const searchForm = ref({
  name: '',
  type: [],
  status: '',
  ip: ''
})

// 相机类型枚举
const cameraTypes = [
  { code: 'Video_Stream_Camera', value: 'Video Stream Camera' },
  { code: 'Face_Capture_Camera', value: 'Face Capture Camera' },
  { code: 'Library_Camera', value: 'Video/Image Library Camera' },
  { code: 'Video_Management_System_Camera', value: 'Video Management System Camera' }
]

// 统计区域控制
const showStats = ref(false)

// 统计数据示例
const stats = ref({
  onlineVideoCount: 1,
  videoTotalCount: 2,
  onlinePicCount: 0,
  picTotalCount: 1,
  authOpened: 1,
  authTotal: 3
})

// 分页
const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})

// 表格数据
const tableData = ref([])

// 选择状态
const isSelect = ref(false)

// 当前选中树节点ID（分组id）
const currentTreeType = ref('dept')
const currentTreeNodeId = ref(null)

// 加载状态
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const dialogMode = ref('create') // create | edit
const currentCamera = ref(null)

const videoDialogVisible = ref(false)
const importDialogVisible = ref(false)

const videoPlayer = ref(null)
const isFullscreen = ref(false)

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    videoPlayer.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
  isFullscreen.value = !isFullscreen.value
}

function filterNode(value, data) {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

const expandedKeys = computed(() => {
  return treeData.value.map((node) => node.id)
})

function filterTree() {
  treeRef.value?.filter(treeFilterText.value)
}

// 切换相机状态
async function changeCameraStatus(row) {
  try {
    const params = { status: row.enableStatus }
    await updateCameraStatus(row.id, params)
    ElMessage.success('Status updated successfully')
  } catch (error) {
    row.enableStatus = oldStatus
    ElMessage.error('Failed to update status')
  }
}

// 获取状态标签颜色
function getStatusTagType(status) {
  return status === true ? 'success' : 'danger'
}

function getUsageName(item) {
  switch (item) {
    case '1':
      return 'Online-play'
    case '2':
      return 'Video-storage'
    case '3':
      return 'FR'
    case '4':
      return 'ANPR'
    case '5':
      return 'Video structuring'
    case '6':
      return 'Behavior analyze'
  }
}

function getStatusLabel(status) {
  return status === true ? 'Online' : 'Offline'
}

function getStatusClass(status) {
  return status === 0 ? 'status-online' : 'status-offline'
}

function getCameraTypeLabel(code) {
  const item = cameraTypes.find((i) => i.code === code)
  return item ? item.value : '-'
}

function newGroup() {
  ElMessage.info('New group feature to be implemented')
}

function createCamera() {
  dialogMode.value = 'create'
  currentCamera.value = null
  dialogVisible.value = true
}

function batchImport() {
  importDialogVisible.value = true
}

function toggleSelection() {
  isSelect.value = !isSelect.value
}

async function toggleStats() {
  try {
    const params = {
      name: searchForm.value.name,
      type: searchForm.value.type.join(','),
      status: searchForm.value.status,
      nodeType: currentTreeType.value,
      nodeId: currentTreeNodeId.value
    }
    const res = await getCameraStat(params)
    // console.log('res===========', JSON.stringify(res))
    camera_stats.value = res
  } catch (error) {
    ElMessage.error('Failed to load table data')
  } finally {
    showStats.value = !showStats.value
  }
}

// 点击树节点，设置选中分组，刷新表格数据
function handleNodeClick(data) {
  currentTreeNodeId.value = data.id
  fetchTableData()
}

function handleSearch() {
  pagination.value.current = 1
  fetchTableData()
}

function resetSearch() {
  searchForm.value = {
    name: '',
    type: [],
    status: ''
  }
  pagination.value.current = 1
  // fetchTableData()
}

// 请求表格数据，带分页、筛选和分组过滤
async function fetchTableData() {
  loading.value = true
  try {
    // 模拟接口参数
    const params = {
      ip: searchForm.value.ip,
      page: pagination.value.current,
      size: pagination.value.size,
      name: searchForm.value.name,
      type: searchForm.value.type.join(','),
      status: searchForm.value.status,
      nodeType: currentTreeType.value,
      nodeId: currentTreeNodeId.value
    }
    // console.log("params ===",params)
    // 这里用模拟接口，真实项目替换为实际API请求
    const res = await getCameras(params)
    // console.log('res===========', JSON.stringify(res))
    tableData.value = res.list
    pagination.value.total = res.total
  } catch (error) {
    ElMessage.error('Failed to load table data')
  } finally {
    loading.value = false
  }
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
const selectRows = ref([])
function handleSelectionChange(selection) {
  // 批量选择处理
  console.log('当前选择', selection)
  selectRows.value = selection
}

function handleSizeChange(size) {
  pagination.value.size = size
  fetchTableData()
}

function handleCurrentChange(page) {
  pagination.value.current = page
  fetchTableData()
}

function viewDetail(row) {
  dialogMode.value = 'view'
  currentCamera.value = row
  dialogVisible.value = true
}

function editCamera(row) {
  dialogMode.value = 'edit'
  currentCamera.value = row
  dialogVisible.value = true
}

function handleCommand(command, row) {
  if (command === 'preview') {
    currentCamera.value = row
    videoDialogVisible.value = true
  } else if (command === 'delete') {
    ElMessageBox.confirm('Are you sure you want to delete this camera?', 'Delete Confirmation', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async () => {
        try {
          await deleteCamera(row.id)
          ElMessage.success('Deleted successfully')
          fetchTableData()
        } catch {
          ElMessage.error('Delete failed')
        }
      })
      .catch(() => {})
  }
}

function batchDelete() {
  const ids = selectRows.value.map((row) => row.id)
  console.log('ids', ids)
  ElMessageBox.confirm('Are you sure you want to delete these cameras?', 'Delete Confirmation', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteCameras({ ids: ids })
        ElMessage.success('Deleted successfully')
        fetchTableData()
      } catch {
        ElMessage.error('Delete failed')
      }
    })
    .catch(() => {})
}

function batchEnable() {
  const ids = selectRows.value.map((row) => row.id)
  console.log('ids', ids)
  ElMessageBox.confirm('Are you sure you want to enable these cameras?', 'Enable Confirmation', {
    confirmButtonText: 'Enable',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      try {
        await enableCameras({ ids: ids })
        ElMessage.success('Enable successfully')
        fetchTableData()
      } catch {
        ElMessage.error('Enable failed')
      }
    })
    .catch(() => {})
}

function batchDisable() {
  const ids = selectRows.value.map((row) => row.id)
  console.log('ids', ids)
  ElMessageBox.confirm('Are you sure you want to disable these cameras?', 'Disable Confirmation', {
    confirmButtonText: 'Disable',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      try {
        await disableCameras({ ids: ids })
        ElMessage.success('Disable successfully')
        fetchTableData()
      } catch {
        ElMessage.error('Disable failed')
      }
    })
    .catch(() => {})
}

async function handleDialogSubmit(data) {
  const tenantid = authUtil.getTenantId()
  const loginFrom = authUtil.getLoginForm()
  data.tenantId = tenantid
  data.creator = loginFrom.username
  console.log('---123---', JSON.stringify(data))
  await createDevice(data)
  dialogVisible.value = false
  fetchTableData()
}

function handleImportSuccess() {
  importDialogVisible.value = false
  fetchTableData()
}

onMounted(async () => {
  await fetchTreeData('area')
  // 组件挂载时初始化加载
  await fetchTableData()
  // nextTick(() => {

  //   if (treeRef.value && treeRef.value.length > 0) {
  //     console.log("treeRef.value:",treeData.value[0]);
  //     treeRef.value.expandNode(treeData.value[0]);
  //   }
  // });
})
</script>

<style scoped>
.camera-management-container {
  height: 85vh;
  display: flex;
  flex-direction: column;
}

.tree-aside {
  background: #f5f7fa;
  border-right: 1px solid #ebeef5;
}

.tree-card {
  height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tree-title {
  font-weight: 600;
  font-size: 18px;
}

.tree-search {
  margin-bottom: 10px;
}

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

.main-content {
  flex: 1;
  overflow-y: auto;
  height: 89vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  height: 30px;
}

.actions > * {
  margin-left: 10px;
  height: 30px;
}

.stats-container {
  margin: 15px 0;
  background: #f0f9eb;
  padding: 20px;
  border-radius: 6px;
}

.search-container {
  margin: 20px 0;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  border: none !important;
  outline: none !important;
}

.tree-card::-webkit-scrollbar {
  width: 5px;
}

.tree-card::-webkit-scrollbar-track {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 10px;
}

.tree-card::-webkit-scrollbar-thumb {
  background: #ded9d5;
  border-radius: 10px;
}

.tree-card::-webkit-scrollbar-thumb:hover {
  background: rgb(100, 100, 100);
  border-radius: 10px;
}

.tree-card::-webkit-scrollbar-thumb:active {
  background: rgb(68, 68, 68);
  border-radius: 10px;
}

.main-content::-webkit-scrollbar {
  width: 5px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #ded9d5;
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgb(100, 100, 100);
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb:active {
  background: rgb(68, 68, 68);
  border-radius: 10px;
}
.el-main {
  padding: 0px;
}
</style>
