<template>
  <div class="vehicle-history-layout" v-loading="exportLoading">
    <!-- Sidebar: Alarm Filters -->
    <aside class="alarm-filters-sidebar">
      <div class="sidebar-header">
        <el-icon><Search /></el-icon>
        <span>Alarm Filters</span>
      </div>
      
      <el-scrollbar class="filter-scroll">
        <el-form label-position="top" :model="pageQuery">
          <div class="filter-item">
            <label class="cyber-label">Task Name</label>
            <el-select v-model="pageQuery.taskApiIds" multiple collapse-tags clearable filterable class="cyber-select-custom">
              <el-option v-for="(item, index) in taskOptions" :key="index" :label="item.label" :value="item.value" />
            </el-select>
          </div>

          <div class="filter-item">
            <label class="cyber-label">Vehicle Number</label>
            <el-input v-model="pageQuery.carNumber" placeholder="E.g. OM-1234" clearable class="cyber-input-custom" />
          </div>

          <div class="filter-item">
            <label class="cyber-label">Handling Status</label>
            <el-select v-model="pageQuery.status" clearable class="cyber-select-custom">
              <el-option v-for="item in handleStatusOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>

          <div class="filter-item">
            <label class="cyber-label">Time Range</label>
            <el-date-picker
              v-model="pageQuery.times"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              range-separator="-"
              class="cyber-date-picker-custom"
            />
          </div>

          <div class="filter-item">
            <label class="cyber-label">Device</label>
            <el-input v-model="deviceText" readonly @click="treeShow = true" class="cyber-input-custom" placeholder="Select camera..." />
          </div>
        </el-form>
      </el-scrollbar>

      <div class="sidebar-actions">
        <button class="btn-search" @click="changePage(1)"><el-icon><Search /></el-icon> Search</button>
        <button class="btn-reset" @click="reload"><el-icon><Refresh /></el-icon></button>
        <button class="btn-export" @click="handleExport"><el-icon><Download /></el-icon></button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="alarm-content-main">
      <header class="main-header">
        <div class="header-info">
          <h1 class="title">Vehicle Alarm History</h1>
          <p class="subtitle">Found <span class="count">{{ result.total }}</span> alarm records in system</p>
        </div>
        <div class="header-btns">
          <button class="btn-header-ghost"><el-icon><Location /></el-icon> Map View</button>
        </div>
      </header>

      <div class="alarm-cards-list">
        <el-empty v-if="result.data.length === 0" description="No vehicle history found" />
        
        <article class="alarm-card" v-for="(o, key) in result.data" :key="key">
          <!-- Card Image Section -->
          <div class="card-image-wrap">
            <el-image :src="imageShow(o.fullUrl)" fit="cover" lazy>
              <template #error><el-icon class="img-error"><icon-picture /></el-icon></template>
            </el-image>
            <div class="plate-badge">{{ o.carNumber }}</div>
            <div class="status-badges-overlay">
              <StatusTag :status="o.status" />
            </div>
          </div>

          <!-- Card Info Section -->
          <div class="card-info-content">
            <div class="info-top">
              <h3 class="alarm-title">{{ o.strategyName }}</h3>
              <div class="meta-row">
                <span class="meta-item"><el-icon><Clock /></el-icon> {{ formatDate(new Date(o.captureTime)) }}</span>
                <span class="meta-item ml-4"><el-icon><VideoCamera /></el-icon> {{ o.cameraName }}</span>
              </div>
            </div>

            <div class="info-grid">
              <div class="grid-cell">
                <div class="label">Vehicle Type</div>
                <div class="value">{{ getVehicleType(o.fullUrl) }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Speed (Detected)</div>
                <div class="value">{{ o.speed ? o.speed + ' km/h' : '---' }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Alarm Location</div>
                <div class="value">{{ o.location || 'Surveillance Area' }}</div>
              </div>
            </div>
          </div>

          <!-- Card Actions Section -->
          <div class="card-actions-rail">
            <button class="btn-action-outline" @click="showCaptureDetail(o, 'vehicle')">
              <el-icon><View /></el-icon> Detail
            </button>
            <button class="btn-action-outline ghost" @click="codeSearch(o.carNumber)">
              <el-icon><Aim /></el-icon> Filter
            </button>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div class="cyber-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          v-model:current-page="pageQuery.page"
          v-model:page-size="pageQuery.pageSize"
          :total="result.total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </main>

    <!-- Dialogs -->
    <el-dialog 
      v-model="tools.captureDetail" 
      width="1100px" 
      top="4vh" 
      class="cyber-dialog-premium"
      destroy-on-close
      title="Vehicle Alarm Information"
    >
      <VehicleAlarmDetail :content="content" :allContent="tools.content" />
    </el-dialog>

    <el-dialog v-model="treeShow" width="450px" title="Select Device" class="cyber-dialog-dark">
      <device-tree-template camera-type="4" @cancel-select="cancelSelect" @submit-select="checkNode" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { VideoCamera, Clock, Search, Refresh, Calendar, Download, Location, View, Aim, Picture as IconPicture } from '@element-plus/icons-vue'
import StatusTag from '../StatusTag.vue'
import { AlarmPlateMsgApi, imageShow, getDay } from '@/api/alarmmsg/plate'
import DeviceTreeTemplate from '../DeviceTreePop.vue'
import { AlarmTaskApi } from '@/api/alarmtask/plate'
import download from '@/utils/download'
import { formatDate } from '@/utils/formatTime'
import VehicleAlarmDetail from './VehicleAlarmDetail.vue'

defineOptions({ name: 'AlarmPlateMsg' })
const message = useMessage()
const reload = inject<any>('reload')
const route = useRoute()
const routeParam = route.query.apiTaskId
const exportLoading = ref(false)
const deviceText = ref('')
const treeShow = ref(false)
const taskOptions = ref<{value: string, label: string}[]>([])

const pageQuery = reactive({
  page: 1, pageSize: 20, taskApiIds: [] as string[], cameraIds: [] as string[],
  times: [getDay(-0) + ' 00:00:00', getDay(-0) + ' 23:59:59'],
  sort: 2, carNumber: '', matchType: '20', color: [], brand: [],
  startTime: '', endTime: '', status: undefined
})

const result = ref({
  total: 0,
  data: [] as any[]
})

const content = reactive({ rid: '', channel: 'Alarm' })
const tools = reactive({ key: 0, captureDetail: false, content: null as any })

const handleStatusOptions = [
  { id: 1, name: 'Awaiting confirmation' }, { id: 2, name: 'Awaiting receipt' },
  { id: 3, name: 'Awaiting feedback' }, { id: 4, name: 'Closed' }
]

const getList = async () => {
  if (pageQuery.times && pageQuery.times.length > 0) {
    pageQuery.startTime = pageQuery.times[0]
    pageQuery.endTime = pageQuery.times[1]
  }
  const res = await AlarmPlateMsgApi.getAlarmPlateMsgPage(pageQuery)
  result.value.data = res.list || []
  result.value.total = res.total
}

const changePage = async (page) => {
  pageQuery.page = parseInt(page)
  await getList()
}

const handleCurrentChange = (val: number) => changePage(val)
const handleSizeChange = (val: number) => { pageQuery.pageSize = val; changePage(1) }

const initTaskOptions = async () => {
  const options = await AlarmTaskApi.getLarmTaskOptions()
  taskOptions.value = options
  if (routeParam) pageQuery.taskApiIds = [routeParam as string]
}

const showCaptureDetail = (o, panel) => {
  const param = { rId: o.rId, apiTaskId: o.apiTaskId, alarmNo: o.alarmNo }
  AlarmPlateMsgApi.getAlarmPlateDetail(param).then((res) => {
    tools.content = res; tools.captureDetail = true
  })
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await AlarmPlateMsgApi.exportAlarmPlateMsg(pageQuery)
    download.excel(data, 'Vehicle plate alarm.xls')
  } finally { exportLoading.value = false }
}

const codeSearch = (code) => { pageQuery.carNumber = code; changePage(1) }

const checkNode = (data) => {
  pageQuery.cameraIds = data.map((x) => x.value)
  deviceText.value = data.map((x) => x.name).join(',')
  treeShow.value = false
}
const cancelSelect = () => { treeShow.value = false }

const getVehicleType = (url) => url ? url.split('_')[4] : 'Unknown'

const props = defineProps({ apiTaskId: String })

onMounted(async () => {
  await initTaskOptions()
  if (props.apiTaskId) pageQuery.taskApiIds = [props.apiTaskId]
  getList()
})
</script>

<style scoped lang="scss">
.vehicle-history-layout {
  display: flex; height: 100%; background: transparent; color: var(--vms-content-text); padding: 10px; gap: 12px; overflow: hidden;
}

/* Sidebar */
.alarm-filters-sidebar {
  width: 280px; background: var(--vms-card-bg); backdrop-filter: blur(12px); border-radius: 20px;
  border: 1px solid var(--vms-content-border); padding: 20px; display: flex; flex-direction: column;
  .sidebar-header { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: bold; color: var(--vms-primary); margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--vms-content-border); }
  .filter-scroll { flex: 1; margin-bottom: 20px; }
}

.filter-item { margin-bottom: 15px; .cyber-label { display: block; font-size: 12px; color: var(--vms-content-muted); margin-bottom: 6px; font-weight: 600; } }

:deep(.cyber-select-custom), :deep(.cyber-input-custom), :deep(.cyber-date-picker-custom) {
  width: 100% !important;
  .el-input__wrapper { background: rgba(15, 23, 42, 0.05) !important; border: 1px solid var(--vms-content-border) !important; box-shadow: none !important; border-radius: 8px; }
  .el-input__inner { font-size: 13px; color: var(--vms-content-text); }
}

.sidebar-actions {
  display: flex; gap: 8px;
  .btn-search { flex: 1; background: var(--vms-primary); color: #fff; border: none; border-radius: 8px; padding: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-reset, .btn-export { width: 44px; background: rgba(148, 163, 184, 0.1); border: 1px solid var(--vms-content-border); color: var(--vms-content-text); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
}

/* Main Content */
.alarm-content-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.main-header { margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end; .title { font-size: 22px; font-weight: bold; margin: 0; } .subtitle { font-size: 13px; color: var(--vms-content-muted); } .count { color: #f87171; font-weight: bold; } }

.btn-header-ghost { background: rgba(30, 41, 59, 0.4); border: 1px solid var(--vms-content-border); color: var(--vms-content-muted); padding: 8px 16px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; &:hover { border-color: var(--vms-primary); color: var(--vms-primary); } }

.alarm-cards-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 6px; }

.alarm-card {
  display: flex; background: var(--vms-card-bg); border: 1px solid var(--vms-content-border); border-radius: 20px; overflow: hidden; transition: all 0.25s;
  &:hover { border-color: var(--vms-primary); transform: translateX(4px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
}

.card-image-wrap {
  width: 280px; position: relative; background: #000;
  :deep(.el-image) { width: 100%; height: 100%; }
  .plate-badge { position: absolute; top: 12px; left: 12px; background: rgba(14, 165, 233, 0.9); color: #fff; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
  .status-badges-overlay { position: absolute; top: 12px; right: 12px; }
}

.card-info-content { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.alarm-title { font-size: 16px; font-weight: bold; margin: 0; color: var(--vms-primary); }
.meta-row { display: flex; align-items: center; font-size: 12px; color: var(--vms-content-muted); .meta-item { display: flex; align-items: center; gap: 6px; } .ml-4 { margin-left: 20px; } }

.info-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px;
  .grid-cell { .label { font-size: 10px; color: var(--vms-content-muted); text-transform: uppercase; margin-bottom: 2px; } .value { font-size: 13px; font-weight: 600; color: var(--vms-content-text); } }
}

.card-actions-rail { width: 140px; border-left: 1px solid var(--vms-content-border); padding: 15px; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
.btn-action-outline {
  width: 100%; background: transparent; border: 1px solid var(--vms-content-border); color: var(--vms-content-text); border-radius: 8px; padding: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s;
  &:hover { border-color: var(--vms-primary); color: var(--vms-primary); background: rgba(56, 189, 248, 0.05); }
}

.cyber-pagination { margin-top: 15px; display: flex; justify-content: flex-end; }

/* Dialog Fixes */
:deep(.cyber-dialog-premium) {
  background: var(--vms-main-bg) !important; border-radius: 20px; border: 1px solid var(--vms-content-border);
  .el-dialog__header { padding: 20px 24px 0; }
  .el-dialog__body { padding: 20px; }
}
</style>
