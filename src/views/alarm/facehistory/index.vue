<template>
  <div class="face-history-layout">
    <!-- Left Sidebar: Search Filters -->
    <aside class="filter-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <el-icon><Search /></el-icon>
          <span>History Filters</span>
        </div>
        
        <el-scrollbar class="filter-scroll">
          <el-form label-position="top" :model="queryParams" ref="queryFormRef">
            <div class="form-group">
              <label class="cyber-label">Surveillance Task</label>
              <el-select v-model="queryParams.apiAlarmIds" multiple collapse-tags clearable filterable class="cyber-select-custom">
                <el-option v-for="item in faceTaskOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="form-group">
              <label class="cyber-label">Time Range</label>
              <el-date-picker
                v-model="queryParams.timeRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                class="cyber-date-picker-custom"
              />
            </div>

            <div class="form-group">
              <label class="cyber-label">Alarm Level</label>
              <el-select v-model="queryParams.level" multiple class="cyber-select-custom">
                <el-option v-for="item in alarmLevelOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>

            <div class="form-group">
              <label class="cyber-label">Handling Status</label>
              <el-select v-model="queryParams.status" clearable class="cyber-select-custom">
                <el-option v-for="item in handleStatusOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>

            <div class="form-group">
              <label class="cyber-label">Target Library</label>
              <el-select v-model="queryParams.albumIds" multiple class="cyber-select-custom">
                <el-option v-for="item in libraryOptions" :key="item.id" :label="item.label" :value="item.id" />
              </el-select>
            </div>

            <div class="form-group">
              <label class="cyber-label">Device</label>
              <el-input v-model="deviceText" readonly @click="treeShow = true" class="cyber-input-custom" placeholder="Select device..." />
            </div>

            <!-- Advanced Filters Toggle -->
            <div class="advanced-toggle" @click="searchSurveillanceInfoShow = !searchSurveillanceInfoShow">
              {{ searchSurveillanceInfoShow ? 'Hide Advanced' : 'More Filters' }}
              <el-icon><ArrowDown v-if="!searchSurveillanceInfoShow"/><ArrowUp v-else/></el-icon>
            </div>

            <div v-show="searchSurveillanceInfoShow" class="advanced-fields">
              <div class="form-group">
                <label class="cyber-label">Person Name</label>
                <el-input v-model="queryParams.name" class="cyber-input-custom" />
              </div>
              <div class="form-group">
                <label class="cyber-label">Gender</label>
                <el-select v-model="queryParams.gender" clearable class="cyber-select-custom">
                  <el-option v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </div>
            </div>
          </el-form>
        </el-scrollbar>

        <div class="sidebar-actions">
          <button class="btn-search" @click="handleQuery"><el-icon><Search /></el-icon> Search</button>
          <button class="btn-reset" @click="reload"><el-icon><Refresh /></el-icon></button>
          <button class="btn-export" @click="handleExport"><el-icon><Download /></el-icon></button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <header class="content-header">
        <div class="header-left">
          <h2 class="title">Face Recognition History</h2>
          <p class="subtitle">Showing <span class="highlight-num">{{ total }}</span> records matching criteria</p>
        </div>
      </header>

      <div class="alarm-list-container" v-loading="loading">
        <el-empty v-if="searchData.length === 0" image-size="200" description="No recognition history found" />
        
        <article class="alarm-card" v-for="(item, index) in searchData" :key="index">
          <!-- Col 1: Meta -->
          <div class="col-info">
            <div class="tag-row">
              <LevelTag :level="item.alarmLevel" />
              <StatusTag :status="item.status" />
            </div>
            <div class="meta-data">
              <div class="data-group">
                <span class="data-label">Capture Time</span>
                <span class="data-value">{{ formatDate(item.captureTime) }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Device</span>
                <span class="data-value"><el-icon><VideoCamera /></el-icon> {{ item.cameraName }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Library</span>
                <span class="data-value">{{ formatAbumName(item.albumName) }}</span>
              </div>
            </div>
          </div>

          <!-- Col 2: Images -->
          <div class="col-images">
            <div class="image-section capture">
              <span class="img-title">Captured Face</span>
              <div class="img-box capture-box">
                <el-image :src="getKsProxyUrl(item.cropUrl)" fit="cover">
                  <template #error><el-image :src="getImageUrl('default_face')" /></template>
                </el-image>
                <div class="score-badge">★ {{ item.score }}</div>
              </div>
            </div>

            <div class="image-section library">
              <span class="img-title">Registered Face</span>
              <div class="img-box library-box">
                <el-image :src="getKsProxyUrl(item.albumPhotoUrl)" fit="cover">
                  <template #error><el-image :src="getImageUrl('default_face')" /></template>
                </el-image>
              </div>
              <div class="img-footer">
                <h4>{{ item.albumPersonName }}</h4>
                <p>Confidence: {{ item.score }}</p>
              </div>
            </div>
          </div>

          <!-- Col 3: Actions -->
          <div class="card-actions-rail">
            <button class="btn-action-outline" @click="openForm(item, index)">
              <el-icon><View /></el-icon> View Details
            </button>
            <button class="btn-action-outline ghost">
              <el-icon><Location /></el-icon> Map
            </button>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div class="cyber-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          @current-change="changePage"
          @size-change="changePage"
        />
      </div>
    </main>

    <!-- Dialogs -->
    <el-dialog v-model="treeShow" width="450px" title="Select Device" class="cyber-dialog-dark">
      <device-tree-template camera-type="3" @cancel-select="cancelSelect" @submit-select="checkNode" />
    </el-dialog>

    <AlarmFaceMsgForm ref="formRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import DeviceTreeTemplate from '../DeviceTreePop.vue'
import LevelTag from '../LevelTag.vue'
import { ref, reactive, onMounted, inject, watch } from 'vue'
import { getImageUrl} from '@/api/alarmtask/common'
import {getKsProxyUrl} from "@/api/common";
import { formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import { AlarmFaceMsgApi, AlarmFaceMsgVO } from '@/api/alarmfacemsg'
import { surOptionList as getLibraryOptionList } from '@/api/library'
import { AlarmTaskApi } from '@/api/alarmtask/face'
import AlarmFaceMsgForm from './AlarmFaceMsgForm.vue'
import StatusTag from '../StatusTag.vue'
import { Search, Refresh, Calendar, Download, VideoCamera, View, Location, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

defineOptions({ name: 'AlarmFaceMsg' })
const reload = inject<any>('reload')
const message = useMessage()
const route = useRoute()
const routeParam = route.query.apiTaskId

const props = defineProps({
  apiTaskId: String
})

const loading = ref(true)
const total = ref(0)
const searchData = ref<any[]>([])
const faceTaskOptions = ref([] as any[])
const deviceText = ref('')
const treeShow = ref(false)
const searchSurveillanceInfoShow = ref(false)
const libraryOptions = ref<{id: string, label: string}[]>([])

const handleStatusOptions = [
  { id: 1, name: 'Awaiting confirmation' }, { id: 2, name: 'Awaiting receipt' },
  { id: 3, name: 'Awaiting feedback' }, { id: 4, name: 'Closed' }
]
const alarmLevelOptions = [
  { id: 1, name: 'Level 1' }, { id: 2, name: 'Level 2' },
  { id: 3, name: 'Level 3' }, { id: 4, name: 'Level 4' }
]

const queryParams = reactive({
  page: 1, pageSize: 20, level: [1, 2, 3, 4], status: undefined,
  albumIds: undefined, cameraIds: [], apiAlarmIds: [], name: '',
  gender: undefined, ageRange: undefined, remark: undefined,
  timeRange: [
    formatDate(new Date(), 'YYYY-MM-DD') + ' 00:00:00',
    formatDate(new Date(), 'YYYY-MM-DD') + ' 23:59:59'
  ],
  startTime: '', endTime: '', idNoReceiver: '', identityType: 1
})

const getList = async () => {
  loading.value = true
  try {
    if (queryParams.timeRange && queryParams.timeRange.length > 0) {
      queryParams.startTime = queryParams.timeRange[0]
      queryParams.endTime = queryParams.timeRange[1]
    }
    const data = await AlarmFaceMsgApi.getAlarmFaceMsgPage(queryParams)
    searchData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.page = 1; getList() }

const initLibraryOption = async () => {
  const libraryResult = await getLibraryOptionList({})
  libraryOptions.value = libraryResult.map((d) => ({ id: d.platformLibraryId, label: d.libraryName }))
  queryParams.albumIds = libraryResult.map((a) => a.platformLibraryId)
}

const initTaskOptions = async () => {
  const options = await AlarmTaskApi.getTaskOptions()
  faceTaskOptions.value = options
  if (routeParam) queryParams.apiAlarmIds = [routeParam as string]
}

const changePage = (page: number) => { queryParams.page = page; getList() }

const formRef = ref()
const openForm = (obj: Object, index?: number) => formRef.value.open(obj, index)

const handleExport = async () => {
  try {
    await message.exportConfirm()
    const data = await AlarmFaceMsgApi.exportAlarmFaceMsg(queryParams)
    download.excel(data, 'Face alarm.xls')
  } catch {}
}

const checkNode = (data) => {
  queryParams.cameraIds = data.map((x) => x.value)
  deviceText.value = data.map((x) => x.name).join(',')
  treeShow.value = false
}
const cancelSelect = () => { treeShow.value = false }

const formatAbumName = (name: string) => name?.length > 12 ? name.substring(0, 12) + '...' : name

onMounted(async () => {
  await initLibraryOption()
  await initTaskOptions()
  if (props.apiTaskId) queryParams.apiAlarmIds = [props.apiTaskId]
  getList()
})
</script>

<style scoped lang="scss">
.face-history-layout {
  display: flex; height: 100%; background: transparent; color: var(--vms-content-text); padding: 10px; gap: 12px; overflow: hidden;
}

/* Sidebar Styling */
.filter-panel {
  width: 300px; background: var(--vms-card-bg); backdrop-filter: blur(12px); border-radius: 20px;
  border: 1px solid var(--vms-content-border); padding: 20px; display: flex; flex-direction: column;
  .panel-header { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: bold; color: var(--vms-primary); margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--vms-content-border); }
  .filter-scroll { flex: 1; margin-bottom: 20px; }
}

.form-group { margin-bottom: 15px; .cyber-label { display: block; font-size: 12px; color: var(--vms-content-muted); margin-bottom: 6px; font-weight: 600; } }

:deep(.cyber-select-custom), :deep(.cyber-input-custom), :deep(.cyber-date-picker-custom) {
  width: 100% !important;
  .el-input__wrapper { background: rgba(15, 23, 42, 0.05) !important; border: 1px solid var(--vms-content-border) !important; box-shadow: none !important; border-radius: 8px; }
  .el-input__inner { font-size: 13px; color: var(--vms-content-text); }
}

.advanced-toggle { font-size: 12px; color: var(--vms-primary); cursor: pointer; display: flex; align-items: center; gap: 4px; margin: 10px 0; font-weight: 600; }

.sidebar-actions {
  display: flex; gap: 8px;
  .btn-search { flex: 1; background: var(--vms-primary); color: #fff; border: none; border-radius: 8px; padding: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-reset, .btn-export { width: 44px; background: rgba(148, 163, 184, 0.1); border: 1px solid var(--vms-content-border); color: var(--vms-content-text); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
}

/* Main Content Styling */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.content-header { margin-bottom: 15px; .title { font-size: 22px; font-weight: bold; margin: 0; } .subtitle { font-size: 13px; color: var(--vms-content-muted); } .highlight-num { color: var(--vms-primary); font-weight: bold; } }

.alarm-list-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 6px; }

.alarm-card {
  display: flex; background: var(--vms-card-bg); border: 1px solid var(--vms-content-border); border-radius: 16px; padding: 16px; gap: 20px; transition: all 0.2s;
  &:hover { border-color: var(--vms-primary); transform: translateX(4px); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
}

.col-info { width: 180px; flex-shrink: 0; .tag-row { display: flex; gap: 8px; margin-bottom: 15px; } }
.data-group { margin-bottom: 10px; .data-label { font-size: 11px; color: var(--vms-content-muted); text-transform: uppercase; } .data-value { font-size: 13px; display: block; margin-top: 2px; } }

.col-images { flex: 1; display: flex; gap: 15px; }
.image-section {
  flex: 1; max-width: 220px;
  .img-title { font-size: 11px; color: var(--vms-content-muted); margin-bottom: 4px; display: block; }
  .img-box {
    width: 100%; aspect-ratio: 1; background: #000; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid var(--vms-content-border);
    :deep(.el-image) { width: 100%; height: 100%; }
  }
}
.score-badge { position: absolute; top: 6px; right: 6px; background: var(--vms-primary); color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.img-footer { margin-top: 8px; h4 { margin: 0; font-size: 14px; color: var(--vms-primary); } p { margin: 2px 0 0; font-size: 11px; color: var(--vms-content-muted); } }

.card-actions-rail { width: 140px; border-left: 1px solid var(--vms-content-border); padding-left: 20px; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
.btn-action-outline {
  width: 100%; background: transparent; border: 1px solid var(--vms-content-border); color: var(--vms-content-text); border-radius: 8px; padding: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s;
  &:hover { border-color: var(--vms-primary); color: var(--vms-primary); background: rgba(56, 189, 248, 0.05); }
}

.cyber-pagination { margin-top: 15px; display: flex; justify-content: flex-end; }
</style>
