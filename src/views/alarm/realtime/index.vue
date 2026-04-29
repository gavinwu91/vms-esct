<template>
  <div class="realtime-command-center" v-loading="exportLoading">
    <el-row :gutter="0" class="main-shell">
      <!-- Left/Center Work Area: Map / Video / Alarm Grid -->
      <el-col :span="layoutSpan.left" class="work-area relative">
        
        <!-- Floating Cyber Toolbar -->
        <header class="cyber-toolbar">
          <div class="toolbar-group">
            <el-select v-model="realTimeMode" @change="changeRealTimeMode" class="cyber-select-mini">
              <el-option v-for="item in realTimeModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            
            <div class="device-selector" @click="deviceTreeBoxShow = !deviceTreeBoxShow">
              <el-icon><VideoCamera /></el-icon>
              <span>{{ deviceClickText }}</span>
              <el-icon class="arrow"><ArrowDown /></el-icon>
            </div>

            <div class="mode-toggles" v-show="realTimeMode == 3">
              <el-radio-group v-model="faceVehicleRadio" @change="faceVehicleChange" class="cyber-radio">
                <el-radio-button :label="3">Face</el-radio-button>
                <el-radio-button :label="4">Vehicle</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="toolbar-center" v-show="realTimeMode == 3">
            <el-segmented v-model="outerParams.status" :options="handleStatusOptions" class="cyber-segmented" />
          </div>

          <div class="toolbar-right">
            <div class="live-clock">
              <el-icon><Clock /></el-icon>
              <span>REAL-TIME MONITORING</span>
            </div>
          </div>
        </header>

        <!-- Device Tree Floating Panel -->
        <transition name="fade">
          <div class="device-floating-panel" v-show="deviceTreeBoxShow">
            <div class="panel-body">
              <div class="video-tree-box" v-if="realTimeMode != 3">
                <el-tree
                  ref="deviceTreeRef"
                  :props="defaultProps"
                  :load="loadNodes"
                  node-key="key"
                  lazy
                  class="cyber-tree"
                >
                  <template #default="{ node, data }">
                    <div class="tree-node" :draggable="data.type === 'device'" @dragstart="ondragstart($event, data)">
                      <el-icon v-if="data.type === 'device'" class="tree-icon device"><VideoCamera /></el-icon>
                      <el-icon v-else class="tree-icon area"><OfficeBuilding /></el-icon>
                      <span>{{ node.label }}</span>
                    </div>
                  </template>
                </el-tree>
              </div>
              <div class="child-params-box" v-else>
                <ChildParams :cameraType="faceVehicleRadio" :key="outerParams.childParamsKey" @confirm-child-params="confirmChildParamSearch" />
              </div>
            </div>
          </div>
        </transition>

        <!-- Main Display Content -->
        <div class="display-container">
          <!-- Mode 1: Map -->
          <div class="map-view-wrapper h-full w-full" v-show="realTimeMode == 1">
            <div class="dark-map-overlay">
              <MapComponent
                v-if="mapCoordsFlag"
                :longitude="coord.longitude"
                :latitude="coord.latitude"
                :alarmCoords="coord.alarmCoords"
                :currentAlarmInfo="coord.currentAlarmInfo"
              />
            </div>
            
            <!-- Map Markers Overlay (If MapComponent supports slots or custom markers) -->
            <!-- Note: Markers are handled inside MapComponent, we assume it's updated or we provide styles -->

            <!-- Bottom Snapshot Strip -->
            <div class="snapshot-strip">
              <div class="total-stats">
                <span class="label">LIVE FEED</span>
                <span class="count">{{ total }}</span>
              </div>
              <div class="scrolling-thumbs">
                <div class="thumb-item" v-for="(item, index) in horizontalImage" :key="index">
                  <el-image :src="item" fit="cover">
                    <template #error><el-image :src="getImageUrl('default_face')" /></template>
                  </el-image>
                </div>
              </div>
              <button class="btn-all" @click="handleMore">VIEW HISTORY <el-icon><ArrowRight /></el-icon></button>
            </div>
          </div>

          <!-- Mode 2: Video -->
          <div v-if="realTimeMode == 2" class="video-view-wrapper h-full">
            <VideoMode />
          </div>

          <!-- Mode 3: Alarm Grid -->
          <div v-show="realTimeMode == 3" class="alarm-grid-wrapper h-full">
            <FaceList v-if="faceVehicleRadio == 3" :outerParams="outerParams" />
            <VehicleList v-if="faceVehicleRadio == 4" :outerParams="outerParams" />
          </div>
        </div>
      </el-col>

      <!-- Right Sidebar: Live Alarm Feed -->
      <el-col :span="layoutSpan.right" v-if="layoutSpan.rightShow" class="alarm-feed-sidebar">
        <div class="sidebar-inner">
          <div class="sidebar-header">
            <el-tabs v-model="queryParams.alarmType" @tab-click="changeAlarmType" class="cyber-tabs-alt">
              <el-tab-pane :name="1" label="FACE ALARMS" />
              <el-tab-pane :name="2" label="VEHICLE ALARMS" />
            </el-tabs>
            <div class="segmented-wrap">
              <el-segmented v-model="queryParams.status" :options="handleStatusOptions" @change="statusChange" />
            </div>
          </div>

          <div class="feed-scroll-area">
            <!-- Face Alarms Feed -->
            <div v-if="queryParams.alarmType == 1" class="alarm-feed">
              <article 
                class="feed-card face" 
                v-for="(item, index) in searchData" :key="index"
                @click="openForm(item, index)"
              >
                <div class="card-header">
                  <LevelTag :level="item.alarmLevel" />
                  <span class="time">{{ formatDate(item.captureTime) }}</span>
                </div>
                
                <div class="comparison-row">
                  <div class="img-box capture">
                    <el-image :src="getKsProxyUrl(item.cropUrl)" fit="cover" />
                    <span class="label">CAPTURE</span>
                  </div>
                  <div class="img-box library">
                    <el-image :src="getKsProxyUrl(item.albumPhotoUrl)" fit="cover">
                      <template #error><el-image :src="getImageUrl('default')" /></template>
                    </el-image>
                    <span class="label">DATABASE</span>
                  </div>
                  <div class="score-neon">{{ item.score }}</div>
                </div>

                <div class="card-info">
                  <h4 class="target-name">{{ item.albumPersonName }}</h4>
                  <div class="meta"><el-icon><VideoCamera /></el-icon> {{ item.cameraName }}</div>
                  <div class="meta"><el-icon><Files /></el-icon> {{ formatAbumName(item.albumName) }}</div>
                </div>

                <div class="card-footer">
                  <StatusTag :status="item.status" />
                </div>
              </article>
            </div>

            <!-- Vehicle Alarms Feed -->
            <div v-else class="alarm-feed">
              <article 
                class="feed-card vehicle" 
                v-for="item in plateRes.data" :key="item.id"
                @click="showCaptureDetail(item, 'vehicle')"
              >
                <div class="vehicle-hero">
                  <el-image :src="imageShow(item.fullUrl)" fit="cover" />
                  <div class="plate-badge">{{ item.carNumber }}</div>
                </div>

                <div class="card-info">
                  <div class="time-row">
                    <span class="time">{{ formatDate(item.captureTime) }}</span>
                  </div>
                  <div class="meta"><el-icon><VideoCamera /></el-icon> {{ item.cameraName }}</div>
                  <div class="meta"><el-icon><Compass /></el-icon> {{ item.strategyName }}</div>
                </div>

                <div class="card-footer">
                  <StatusTag :status="item.status" />
                  <span class="type-tag">{{ getVehicleType(item.fullUrl) }}</span>
                </div>
              </article>
            </div>
          </div>
        </div>

        <!-- Alarm Sound Pulse Icon -->
        <div class="sound-indicator" @click="handleSound">
          <el-image :src="getImageUrl('alarm_sound')" class="pulse" />
        </div>
      </el-col>
    </el-row>

    <!-- Dialogs -->
    <AlarmFaceMsgForm ref="formRef" @success="getList" />
    <el-dialog v-model="tools.captureDetail" width="90%" draggable class="cyber-dialog-premium" title="Vehicle Alarm Information">
      <VehicleAlarmDetail :content="content" :allContent="tools.content" :key="tools.key" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import MapComponent from './MapComponent.vue'
import {getKsProxyUrl} from "@/api/common";
import { defaultProps } from '@/utils/tree'
import { bus } from '@/utils/bus'
import StatusTag from '../StatusTag.vue'
import LevelTag from '../LevelTag.vue'
import { VideoCamera, OfficeBuilding, Clock, ArrowDown, ArrowRight, Files, Compass } from '@element-plus/icons-vue'
import { getDay, AlarmPlateMsgApi, imageShow } from '@/api/alarmmsg/plate'
import { getVehicleType, formatAbumName, getImageUrl } from '@/api/alarmtask/common'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { AlarmFaceMsgApi } from '@/api/alarmfacemsg'
import AlarmFaceMsgForm from '../facehistory/AlarmFaceMsgForm.vue'
import VehicleAlarmDetail from '@/views/alarm/platehistory/VehicleAlarmDetail.vue'
import VideoMode from './VideoMode3.vue'
import FaceList from './FaceList.vue'
import VehicleList from './VehicleList.vue'
import type { LoadFunction, TreeInstance, FilterNodeMethodFunction } from 'element-plus'
import { loadCameraTree } from '@/api/device'
import ChildParams from './ChildParams.vue'

const treeKey = ref(0)
const loading = ref(true) 
const total = ref(0) 
const message = useMessage() 
const router = useRouter()
const deviceTreeRef = ref<TreeInstance>()
const lastAlarmTime = ref(new Date())
const horizontalImage = ref([])
const mapCoordsFlag = ref(false)
const deviceClickText = ref('Device Tree')
const faceVehicleRadio = ref(3)
const realTimeMode = ref(1)
const deviceTreeBoxShow = ref(false)
const searchDataTotal = ref(0)
const exportLoading = ref(false)

const queryParams = reactive({
  page: 1, pageSize: 20, status: -1, cameraIds: [], librarys: [], levels: [], alarmType: 1,
  startTime: getDay(-3) + ' 00:00:00', endTime: getDay(-0) + ' 23:59:59', childParamsKey: 1
})

const outerParams = ref({
  status: -1, cameraIds: [], librarys: [], levels: [],
  startTime: queryParams.startTime, endTime: queryParams.endTime, childParamsKey: 1
})

const layoutSpan = ref({ left: 19, right: 5, rightShow: true })
const coord = ref({ longitude: '58.339263', latitude: '23.598513', alarmCoords: [], currentAlarmInfo: {} })

const realTimeModeOptions = [
  { label: 'Map Control', value: 1 }, { label: 'Video Wall', value: 2 }, { label: 'Alarm Stream', value: 3 }
]

const handleStatusOptions = [
  { value: -1, label: 'All' }, { value: 1, label: 'Unconfirm' }, { value: 2, label: 'Unreceipt' }, { value: 3, label: 'Unfeedback' }, { value: 4, label: 'Closed' }
]

const searchData = ref<any[]>([])
const plateRes = reactive({ total: 0, data: [] as any[] })

const formRef = ref()
const openForm = (obj: Object, index?: number) => formRef.value.open(obj, index)

const getList = async () => {
  try {
    const data = await AlarmFaceMsgApi.getAlarmFaceMsgPage(queryParams)
    searchData.value = data.list; searchDataTotal.value = data.total
  } finally { loading.value = false }
}

const getPlateList = async () => {
  const res = await AlarmPlateMsgApi.getAlarmPlateMsgPage(queryParams)
  if (res && res.list) { plateRes.data = res.list; plateRes.total = res.total }
}

const changeAlarmType = async (pane: any) => {
  const name = pane.paneName
  if (name == 1) {
    await getList()
    if (searchData.value.length > 0) {
      coord.value.currentAlarmInfo = { cameraUsage: '3', ...searchData.value[0] }
      horizontalImage.value = searchData.value.slice(0, 12).map(a => getKsProxyUrl(a.cropUrl))
      total.value = searchDataTotal.value
    }
  } else {
    await getPlateList()
    if (plateRes.data.length > 0) {
      coord.value.currentAlarmInfo = { cameraUsage: '4', ...plateRes.data[0] }
      total.value = plateRes.total
      horizontalImage.value = plateRes.data.slice(0, 12).map(a => imageShow(a.fullUrl))
    }
  }
}

const statusChange = () => queryParams.alarmType == 1 ? getList() : getPlateList()

const showCaptureDetail = (o, panel) => {
  const param = { rId: o.rId, apiTaskId: o.apiTaskId, alarmNo: o.alarmNo }
  AlarmPlateMsgApi.getAlarmPlateDetail(param).then((res) => { tools.content = res; tools.captureDetail = true })
}

const handleMore = () => router.push(queryParams.alarmType == 2 ? '/alarm/alarm/vehicle/history' : '/alarm/face/alarm/facehistory')

const handleSound = () => {
  const audio = new Audio(`${import.meta.env.VITE_BASE_PATH}/2981.wav`)
  audio.play().catch(() => {})
}

const changeRealTimeMode = (val) => {
  deviceTreeBoxShow.value = false
  if (val == 3) { layoutSpan.value.left = 24; layoutSpan.value.rightShow = false }
  else { layoutSpan.value.left = 19; layoutSpan.value.rightShow = true }
}

const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: 0, areaId: node.data.id }).then(res => resolve(res))
  } else reject([])
}

const confirmChildParamSearch = (child) => {
  outerParams.value.cameraIds = [...child.deviceList]
  outerParams.value.librarys = [...child.libraryList]
  if (faceVehicleRadio.value == 3) outerParams.value.levels = [...child.alarmLevelList]
  deviceTreeBoxShow.value = false
}

const faceVehicleChange = () => {
  outerParams.value = { ...outerParams.value, cameraIds: [], librarys: [], levels: [], status: -1 }
}

const tools = reactive({ key: 0, captureDetail: false, content: null as any })
const content = reactive({ rid: '', channel: 'Alarm' })

let loopTimer: any = null
onMounted(async () => {
  await getList(); await getPlateList()
  horizontalImage.value = searchData.value.slice(0, 12).map(a => getKsProxyUrl(a.cropUrl))
  total.value = searchDataTotal.value
  coord.value.alarmCoords = [...searchData.value, ...plateRes.data].map(a => ({ longitude: a.longitude, latitude: a.latitude, cameraUsage: a.carNumber ? '4' : '3' }))
  mapCoordsFlag.value = true
  
  loopTimer = setInterval(() => {
    getList(); getPlateList()
    if (searchData.value[0]?.captureTime != lastAlarmTime.value) { handleSound(); lastAlarmTime.value = searchData.value[0]?.captureTime }
  }, 20000)
})

onUnmounted(() => clearInterval(loopTimer))
</script>

<style scoped lang="scss">
.realtime-command-center {
  height: calc(100vh - 110px); background: #0a0f1e; color: #fff; overflow: hidden; border-radius: 12px; margin: 10px;
}
.main-shell { height: 100%; }
.work-area { height: 100%; border-right: 1px solid rgba(0, 180, 255, 0.1); display: flex; flex-direction: column; }

/* Cyber Toolbar */
.cyber-toolbar {
  position: absolute; top: 15px; left: 15px; right: 15px; z-index: 100; display: flex; justify-content: space-between; align-items: center;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(0, 180, 255, 0.2); border-radius: 12px; padding: 10px 20px;
  .toolbar-group { display: flex; gap: 15px; align-items: center; }
}

.device-selector {
  display: flex; align-items: center; gap: 10px; background: rgba(0, 180, 255, 0.1); border: 1px solid rgba(0, 180, 255, 0.2);
  padding: 6px 15px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #00b4ff; font-weight: bold;
  &:hover { background: rgba(0, 180, 255, 0.2); }
  .arrow { font-size: 12px; opacity: 0.7; }
}

.live-clock { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #38bdf8; letter-spacing: 1px; font-weight: bold; }

/* Floating Panel */
.device-floating-panel {
  position: absolute; top: 75px; left: 15px; width: 300px; max-height: 70vh; z-index: 110;
  background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(0, 180, 255, 0.3); border-radius: 16px; overflow: hidden;
  .panel-body { padding: 15px; overflow-y: auto; }
}

/* Display Area */
.display-container { flex: 1; position: relative; background: #000; }
.dark-map-overlay { height: 100%; width: 100%; :deep(.ol-viewport) { filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%) saturate(120%); } }

/* Snapshot Strip */
.snapshot-strip {
  position: absolute; bottom: 20px; left: 20px; right: 20px; height: 80px; z-index: 10;
  background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(0, 180, 255, 0.2); border-radius: 15px;
  display: flex; align-items: center; padding: 0 20px; gap: 20px;
  .total-stats { .label { display: block; font-size: 10px; color: #94a3b8; } .count { font-size: 24px; font-weight: bold; color: #00b4ff; font-family: monospace; } }
  .scrolling-thumbs { flex: 1; display: flex; gap: 10px; overflow-x: auto; &::-webkit-scrollbar { display: none; } .thumb-item { width: 60px; height: 60px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(0, 180, 255, 0.3); } }
  .btn-all { background: transparent; border: 1px solid #00b4ff; color: #00b4ff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; &:hover { background: rgba(0,180,255,0.1); } }
}

/* Sidebar Alarms */
.alarm-feed-sidebar { height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(10px); display: flex; flex-direction: column; overflow: hidden; }
.sidebar-inner { flex: 1; display: flex; flex-direction: column; height: 100%; }
.sidebar-header { padding: 20px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); .segmented-wrap { margin-top: 15px; } }

.feed-scroll-area { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 15px; }

/* Feed Card */
.feed-card {
  background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(56, 189, 248, 0.1); border-radius: 12px; padding: 15px; cursor: pointer; transition: 0.2s;
  &:hover { background: rgba(30, 41, 59, 0.6); border-color: #38bdf8; transform: translateX(-4px); }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; .time { font-size: 11px; color: #64748b; } }
  
  .comparison-row {
    display: flex; gap: 10px; position: relative; margin-bottom: 12px;
    .img-box { flex: 1; aspect-ratio: 1; background: #000; border-radius: 6px; overflow: hidden; position: relative; .label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); font-size: 8px; color: #fff; text-align: center; padding: 2px 0; } }
    .score-neon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ff4d4f; color: #fff; font-size: 14px; font-weight: 900; padding: 2px 6px; border-radius: 4px; box-shadow: 0 0 15px #ff4d4f; }
  }

  .target-name { font-size: 15px; margin: 0 0 8px 0; color: #f8fafc; }
  .meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #94a3b8; margin-bottom: 4px; .el-icon { color: #38bdf8; } }
  
  &.vehicle {
    .vehicle-hero { position: relative; width: 100%; aspect-ratio: 2; border-radius: 8px; overflow: hidden; margin-bottom: 12px; .plate-badge { position: absolute; top: 10px; left: 10px; background: #00b4ff; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; } }
  }
}

.sound-indicator { position: absolute; right: 20px; bottom: 20px; width: 40px; height: 40px; background: rgba(239, 68, 68, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; .pulse { width: 24px; height: 24px; animation: pulseAnim 2s infinite; } }
@keyframes pulseAnim { 0% { transform: scale(0.9); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.7; } }

:deep(.cyber-tabs-alt) { .el-tabs__item { font-size: 12px; font-weight: 800; color: #64748b; } .el-tabs__item.is-active { color: #00b4ff; } .el-tabs__active-bar { background: #00b4ff; } }
</style>
