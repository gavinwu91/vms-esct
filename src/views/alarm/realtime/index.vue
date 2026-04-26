<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="layoutSpan.left" class="h-90vh relative">
        <!-- 浮动工具栏 下拉mode  摄像头列表信息 -->
        <div class="absolute top-2px left-20px w-60vh z-100 flex justify-start gap-1">
          <el-select v-model="realTimeMode" @change="changeRealTimeMode" class="!w-20vh">
            <el-option
              v-for="item in realTimeModeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-model="deviceClickText"
            class="!w-20vh !cursor-pointer"
            readonly
            @click="deviceTreeBoxShow = !deviceTreeBoxShow"
          />
          <el-radio-group
            v-model="faceVehicleRadio"
            v-show="realTimeMode == 3"
            @change="faceVehicleChange"
          >
            <el-radio-button :label="3"> Face </el-radio-button>
            <el-radio-button :label="4">Vehicle</el-radio-button>
          </el-radio-group>
        </div>
        <div class="absolute top-2px left-40%" v-show="realTimeMode == 3">
          <el-segmented v-model="outerParams.status" :options="handleStatusOptions" />
        </div>

        <!--  摄像头列表浮动div -->
        <div
          class="absolute left-5 top-35px z-100 border-b-coolgray border-solid border-1 w-32vh h-80vh bg-#fff"
          v-show="deviceTreeBoxShow"
        >
          <div class="device-box-body h-93% overflow-y-auto">
            <div class="video-tree-box" v-if="realTimeMode != 3">
              <el-tree
                ref="deviceTreeRef"
                class="!w-full !h-full"
                :props="defaultProps"
                :load="loadNodes"
                empty-text="Loaded, please later"
                node-key="key"
                lazy
                :filter-node-method="filterNode"
                :key="treeKey"
              >
                <!-- @check-change="oncheck" -->
                <template #default="{ node, data }">
                  <div
                    class="tree-node"
                    :draggable="data.type === 'device'"
                    @dragstart="ondragstart($event, data)"
                    @dragend="onDragEnd()"
                  >
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
              </el-tree></div
            >
            <div class="child-params-box" v-else>
              <ChildParams
                :cameraType="faceVehicleRadio"
                :key="outerParams.childParamsKey"
                @confirm-child-params="confirmChildParamSearch"
              />
            </div>
          </div>
          <!-- <div class="device-box-footer text-right">
            <el-button
              class="!m-r-10px m-t-2px"
              type="info"
              size="mini"
              @click="deviceTreeBoxShow = false"
              >Close</el-button
            >
          </div> -->
        </div>

        <div v-show="realTimeMode == 3">
          <FaceList v-if="faceVehicleRadio == 3" :outerParams="outerParams" />
          <VehicleList v-if="faceVehicleRadio == 4" :outerParams="outerParams" />
        </div>

        <div v-if="realTimeMode == 2">
          <VideoMode />
        </div>

        <div class="h-full w-full" v-show="realTimeMode == 1">
          <MapComponent
            v-if="mapCoordsFlag"
            :longitude="coord.longitude"
            :latitude="coord.latitude"
            :alarmCoords="coord.alarmCoords"
            @update:longitude="(val) => (coord.longitude = val)"
            @update:latitude="(val) => (coord.latitude = val)"
            :currentAlarmInfo="coord.currentAlarmInfo"
          />
          <div
            style="
              position: absolute;
              bottom: 0;
              width: 100%;
              height: 100px;
              z-index: 100;
              display: flex;
              padding-right: 10px;
            "
          >
            <div
              style="
                width: 18vh;
                height: 100%;
                background: linear-gradient(to bottom, #87ceeb, #00008b);
                position: relative;
                justify-items: center;
                padding-top: 20px;
              "
            >
              <h3
                >total: <span style="font-style: italic; color: red">{{ total }}</span></h3
              >
              <el-link
                type="primary"
                :underline="true"
                style="color: white; position: absolute; right: 10px; bottom: 10px"
                @click="handleMore()"
              >
                View all</el-link
              >
            </div>
            <span v-for="(item, index) in horizontalImage" :key="index">
              <el-image
                style="cursor: pointer; width: 13vh; height: 100%; margin-left: 5px"
                :src="item"
                :key="horizontalImageKey"
              >
              <template #error>
                <el-image :src="getImageUrl('default_face')" />
              </template>
            </el-image>
            </span>
          </div>
        </div>
      </el-col>
      <el-col :span="layoutSpan.right" class="relative !px-2px">
        <el-image
          :src="getImageUrl('alarm_sound')"
          style="
            width: 20px;
            height: 20px;
            position: absolute;
            right: 20px;
            top: 10px;
            z-index: 100;
          "
        />
        <div>
          <div class="status-top" style="height: 5%">
            <el-tabs
              v-model="queryParams.alarmType"
              type="card"
              tab-position="top"
              @tab-click="changeAlarmType"
            >
              <el-tab-pane :key="1" label="Face" :name="1" style="height: 83vh">
                <div>
                  <el-segmented
                    v-model="queryParams.status"
                    :options="handleStatusOptions"
                    @change="statusChange"
                  />
                </div>
                <div class="data-bottom" style="overflow-y: auto; height: 95%; padding-top: 10px">
                  <el-timeline>
                    <el-timeline-item
                      v-for="(item, index) in searchData"
                      :key="index"
                      :timestamp="formatDate(item.captureTime)"
                      :color="alarmTimeLineColor"
                      placement="top"
                      type="primary"
                      size="normal"
                    >
                      <div class="face-alert-grid">
                        <div
                          class="alert-card cursor-pointer"
                          :class="'level-' + item.alarmLevel"
                          :key="index"
                          @click="openForm(item, index)"
                        >
                          <div class="alert-header">
                            <div class="alert-level">
                              <LevelTag :level="item.alarmLevel" />
                            </div>
                            <div class="flex items-center"
                              ><el-link
                                :icon="VideoCamera"
                                title="Camera Name"
                                type="primary"
                                :underline="false"
                              />
                              <span class="ml-4px font-bold text-16px">{{ item.cameraName }}</span>
                            </div>
                          </div>

                          <div class="image-comparison">
                            <div class="image-container">
                              <div class="image-label">Capture Image</div>
                              <el-image :src="getKsProxyUrl(item.cropUrl)" class="face-image">
                                <template #error>
                                  <el-image :src="getImageUrl('default_face')" />
                                </template>
                              </el-image>
                            </div>

                            <div class="image-container">
                              <div class="image-label">Library Image</div>
                              <el-image :src="getKsProxyUrl(item.albumPhotoUrl)" class="face-image">
                                <template #error>
                                  <el-image :src="getImageUrl('default')" />
                                </template>
                              </el-image>
                            </div>
                            <div class="card-item-score">{{ item.score }}</div>
                          </div>

                          <div class="alert-details">
                            <div class="detail-item">
                              <span class="detail-label">Name</span>
                              <span class="detail-value">{{ item.albumPersonName }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Library</span>
                              <span class="detail-value">{{ formatAbumName(item.albumName) }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Status</span>
                              <StatusTag :status="item.status" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </el-tab-pane>

              <el-tab-pane label="Vehicle" :name="2" :key="2" style="height: 83vh">
                <div>
                  <el-segmented
                    v-model="queryParams.status"
                    :options="handleStatusOptions"
                    @change="statusChange"
                  />
                </div>
                <div style="overflow-y: auto; height: 95%; padding-top: 10px">
                  <el-timeline>
                    <el-timeline-item
                      v-for="item in plateRes.data"
                      :key="item.id"
                      :timestamp="formatDate(item.captureTime)"
                      placement="top"
                      :color="alarmTimeLineColor"
                      type="primary"
                      size="normal"
                    >
                      <div
                        class="vehicle-alert-card cursor-pointer"
                        @click="showCaptureDetail(item, 'vehicle')"
                      >
                        <el-image class="capture-image" :src="imageShow(item.fullUrl)">
                          <template #error>
                            <el-icon>
                              <icon-picture />
                            </el-icon>
                          </template>
                        </el-image>

                        <div class="alert-content">
                          <div class="alert-header">
                            <div class="plate-number">{{ item.carNumber }}</div>
                            <div class="flex items-center"
                              ><el-link :icon="VideoCamera" type="primary" :underline="false" />
                              <span class="ml-4px font-bold text-16px">{{ item.cameraName }}</span>
                            </div>
                          </div>
                          <div class="alert-details">
                            <div class="detail-item">
                              <span class="detail-label">Task Name</span>
                              <span class="detail-value">{{ item.strategyName }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Vehicle Type</span>
                              <span class="detail-value">{{ getVehicleType(item.fullUrl) }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Status</span>
                              <div>
                                <StatusTag :status="item.status" :size="'default'" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
  <!-- 表单弹窗：添加/修改 -->
  <AlarmFaceMsgForm ref="formRef" @success="getList" style="width: 70%; height: 70vh" />

  <!--  车牌抓拍详情 -->
  <el-dialog
    v-model="tools.captureDetail"
    draggable
    style="margin-top: 5px"
    width="90%"
    @close="tools.captureDetail = false"
    title="Vehicle Alarm Information"
  >
    <VehicleAlarmDetail :content="content" :allContent="tools.content" :key="tools.key" />
  </el-dialog>
</template>
<script setup lang="ts">
import MapComponent from './MapComponent.vue'
import {getKsProxyUrl} from "@/api/common";
import { defaultProps } from '@/utils/tree'
import { bus } from '@/utils/bus'
import StatusTag from '../StatusTag.vue'
import LevelTag from '../LevelTag.vue'
import { VideoCamera, OfficeBuilding, Clock } from '@element-plus/icons-vue'
import { getDay, AlarmPlateMsgApi, imageShow } from '@/api/alarmmsg/plate'
import { getVehicleType, formatAbumName, getImageUrl } from '@/api/alarmtask/common'
import { ref, reactive, onMounted } from 'vue'
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
import { error } from 'console'

const treeKey = ref(0)
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const message = useMessage() // 消息弹窗
const router = useRouter()
const deviceTreeRef = ref<TreeInstance>()
const basePath = import.meta.env.VITE_BASE_PATH
const lastAlarmTime = ref(new Date())
const horizontalImage = ref([])
const horizontalImageKey = ref(1)
const mapCoordsFlag = ref(false)
const deviceClickText = ref('Camera')

const faceVehicleRadio = ref(3)
let queryParams = reactive({
  page: 1,
  pageSize: 20,
  status: -1,
  cameraIds: [],
  librarys: [],
  levels: [],
  alarmType: 1,
  startTime: getDay(-3) + ' 00:00:00',
  endTime: getDay(-0) + ' 23:59:59',
  childParamsKey: 1
})

const outerParams = ref({
  status: -1,
  cameraIds: [],
  librarys: [],
  levels: [],
  startTime: queryParams.startTime,
  endTime: queryParams.endTime,
  childParamsKey: 1
})

const resetOutParams = () => {
  outerParams.value = {
    status: -1,
    cameraIds: [],
    librarys: [],
    levels: [],
    startTime: getDay(-3) + ' 00:00:00',
    endTime: getDay(-0) + ' 23:59:59',
    childParamsKey: 1
  }
}

const coord = ref({
  longitude: '58.339263',
  latitude: '23.598513',
  item: {} as any,
  alarmCoords: [],
  currentAlarmInfo: {}
})
const realTimeModeOptions = ref([
  { label: 'Map Mode', value: 1 },
  { label: 'Video Mode', value: 2 },
  { label: 'Alarm Mode', value: 3 }
])
const alarmTimeLineColor = ref('red')
const deviceTreeBoxShow = ref(false)
//人脸告警后台返回数据
const searchDataTotal = ref(0)

const layoutSpan = ref({
  left: 19,
  right: 5,
  rightShow: true
})

const keyBox = ref({
  childParamsKey: 1,
  faceVehicleListKey: 1,
  treeKey: 1
})

const searchData = ref([
  {
    alarmNo: '',
    albumId: '',
    albumPhotoUrl: '',
    apiAlarmId: '',
    cameraId: '',
    status: 0,
    captureTime: new Date(),
    cropUrl: '',
    deptId: '',
    fullLocator: '',
    fullUrl: '',
    id: '',
    score: '',
    alarmLevel: '',
    albumName: '',
    cameraName: '',
    albumPersonName: '',
    albumPersonIdCard: '',
    longitude: '',
    latitude: ''
  }
])

const plateRes = reactive({
  total: 0,
  data: [
    {
      carNumber: '',
      strategyName: '',
      linkMethod: 1,
      fullUrl: '',
      cropUrl: '',
      location: '',
      cameraName: '',
      captureTime: new Date(),
      speed: 0,
      id: 0,
      longitude: '',
      latitude: ''
    }
  ]
})

const realTimeMode = ref(1)

const handleStatusOptions = ref([
  { value: -1, label: 'All' },
  { value: 1, label: 'Unconfirm' },
  { value: 2, label: 'Unreceipt' },
  { value: 3, label: 'Unfeedback' },
  { value: 4, label: 'Closed' }
])

const content = reactive({ rid: '', channel: 'Alarm' })

const formRef = ref()
const openForm = (obj: Object, index?: number) => {
  formRef.value.open(obj, index)
}

/**method begin  */

const showCameraCoord = (item, cameraUsage) => {
  coord.value.longitude = item.longitude
  coord.value.latitude = item.latitude
  coord.value.currentAlarmInfo = { cameraUsage: cameraUsage, ...item }
}

const statusChange = (value: any) => {
  if (queryParams.alarmType == 1) {
    getList()
  } else {
    getPlateList()
  }
}

/** 查询人脸告警列表 */
const getList = async () => {
  loading.value = true
  try {
    //处理时间
    const data = await AlarmFaceMsgApi.getAlarmFaceMsgPage(queryParams)
    searchData.value = data.list
    searchDataTotal.value = data.total
  } finally {
    loading.value = false
  }
}

/** 获取车牌列表 */
const getPlateList = async () => {
  const plate_res = await AlarmPlateMsgApi.getAlarmPlateMsgPage(queryParams)
  if (plate_res && plate_res.list) {
    plateRes.data = plate_res.list || []
    plateRes.total = plate_res.total
  }
}

const getStatusWord = (status: number) => {
  const current = handleStatusOptions.value.find((a) => a.value == status)
  return current?.label
}

const changeAlarmType = async (pane: any) => {
  const paneName = pane.paneName

  if (paneName == 1) {
    //查询人脸告警列表
    await getList()
    if (searchData.value && searchData.value.length > 0) {
      coord.value.alarmCoords = []
      coord.value.currentAlarmInfo = { cameraUsage: '3', ...searchData.value[0] }
      horizontalImage.value = formathorizontalImage(searchData.value.map((a) => getKsProxyUrl(a.cropUrl)))
      total.value = searchDataTotal.value
    }
  } else if (paneName == 2) {
    //查询车牌告警列表
    await getPlateList()
    if (plateRes && plateRes.data.length > 0) {
      coord.value.alarmCoords = []
      coord.value.currentAlarmInfo = { cameraUsage: '4', ...plateRes.data[0] }
      total.value = plateRes.total
      horizontalImage.value = formathorizontalImage(plateRes.data.map((a) => imageShow(a.fullUrl)))
    }
  }
}

function formathorizontalImage(data) {
  if (data.length > 10) {
    return data.slice(0, 10)
  }
  return data
}

const plateContent = ref({
  rid: '',
  key: 0,
  channel: 'Alarm',
  captureDetail: false
})

// 查看抓拍详情
const showCaptureDetail = (o, panel) => {
  // plateContent.value.rid = item.rId
  // plateContent.value.captureDetail = true
  // plateContent.value.key++
  // console.log('plateContent===', plateContent)
  console.log('o ==== ', o)
  const param = {
    rId: o.rId,
    apiTaskId: o.apiTaskId,
    alarmNo: o.alarmNo
  }
  AlarmPlateMsgApi.getAlarmPlateDetail(param).then((res) => {
    console.log('getAlarmPlateDetail ============== ', res)
    tools.key++
    tools.content = res
    tools.captureDetail = true
  })
}

const handleMore = () => {
  let path = '/alarm/face/alarm/facehistory'
  if (queryParams.alarmType == 2) {
    path = '/alarm/alarm/vehicle/history'
  }
  router.push(path)
}

/** 声音播放按钮 */
const handleSound = () => {
  const soundPath = `${import.meta.env.VITE_BASE_PATH}/2981.wav`
  const audio = new Audio(soundPath)
  audio.play().catch((err) => {
    console.error('play sound error ' + err)
  })
}

const init = async () => {
  await getList()
  horizontalImage.value = formathorizontalImage(searchData.value.map((a) => getKsProxyUrl(a.cropUrl)))
  total.value = searchDataTotal.value
  await getPlateList()
  coord.value.alarmCoords = []
  coord.value.currentAlarmInfo = { cameraUsage: '3', ...searchData.value[0] }
  lastAlarmTime.value = coord.value.currentAlarmInfo.captureTime
  handleSound()
  //获取人脸告警所有坐标
  searchData.value.forEach((a) => {
    coord.value.alarmCoords.push({
      longitude: a.longitude,
      latitude: a.latitude,
      cameraUsage: '3'
    })
  })
  if (searchData.value && searchData.value.length > 0) {
    console.log('searchData.value ==== ', searchData.value)
    coord.value.longitude = searchData.value[0].longitude
    coord.value.latitude = searchData.value[0].latitude
  }

  //获取车牌告警所有坐标
  plateRes.data.forEach((a) => {
    coord.value.alarmCoords.push({
      longitude: a.longitude,
      latitude: a.latitude,
      cameraUsage: '4'
    })
  })

  mapCoordsFlag.value = true
}

const changeRealTimeMode = (value) => {
  //切换 摄像头树
  resetOutParams()
  deviceTreeBoxShow.value = false
  if (value == 3) {
    layoutSpan.value.left = 24
    layoutSpan.value.right = 0
    layoutSpan.value.rightShow = false
    faceVehicleRadio.value = 3
  } else {
    layoutSpan.value.left = 19
    layoutSpan.value.right = 5
    layoutSpan.value.rightShow = true
  }

  treeKey.value++
}

const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: 0, areaId: node.data.id }).then((res) => {
      return resolve(res)
    })
  }
  return reject([])
}

const oncheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
  const deviceIds = checkDeviceNodes.filter((node) => node.type === 'device').map((node) => node.id)
}

const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}

const ondragstart = (event, data) => {
  console.log('event, data====== ', event, data)
  bus.emit('drag:start', data)
}
const onDragEnd = () => {}

let loopTimer: NodeJS.Timeout | null = null

const tools = reactive({
  key: 0,
  captureDetail: false,
  content: null as any
})

const faceVehicleChange = (value) => {
  outerParams.value.cameraIds = []
  outerParams.value.librarys = []
  outerParams.value.levels = []
  outerParams.value.status = -1
  outerParams.value.childParamsKey++
  horizontalImageKey.value++
}

const confirmChildParamSearch = (childParams) => {
  outerParams.value.cameraIds = [...childParams.deviceList]
  outerParams.value.librarys = [...childParams.libraryList]
  if (faceVehicleRadio.value == 3) {
    outerParams.value.levels = [...childParams.alarmLevelList]
  }
  keyBox.value.faceVehicleListKey++
  deviceTreeBoxShow.value = false
}
//methed end
/** 初始化 **/
onMounted(() => {
  init()
  loopTimer = setInterval(() => {
    getList()
    const item = searchData.value[0]
    console.log(
      'item.captureTime =====',
      item.captureTime,
      'lastAlarmTime.value=====',
      lastAlarmTime.value
    )
    if (item.captureTime != lastAlarmTime.value) {
      handleSound()
      lastAlarmTime.value = item.captureTime
    }
    getPlateList()
  }, 1000 * 20)
})

onUnmounted(() => {
  clearInterval(loopTimer)
})
</script>
<style scoped lang="scss">
.page-info {
  background-color: #dce1e5;
  padding-left: 2px;
  height: 78vh;
  width: 100%;
  overflow-y: scroll;
}

.card-item {
  position: relative;
  width: 95%;
  height: 25vh;
  border-top: 4px solid rgb(171, 26, 26);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.card-item:hover {
  transform: translateY(-8px);
  transition: 1.5s;
}

.card-item-images {
  cursor: pointer;
  text-align: center;
  padding-top: 10px;
  display: flex;
  justify-content: center;
  gap: 2px;
  align-items: center;
}

.card-item-score {
  background-image: url('/insight/red_back2.850b4.svg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  bottom: 4%;
  left: 37%;
  width: 80px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: rgb(240, 238, 238);
}
.right-bottom {
  margin-top: 10px;
}

:deep(.el-timeline-item__timestamp) {
  color: red;
}
</style>
<!-- face css-->
<style scoped lang="scss">
.face-alert-grid {
  --primary: #4361ee;
  --primary-dark: #3a56d4;
  --secondary: #7209b7;
  --low: #4c8ad4;
  --success: #fbc647;
  --warning: #e77e2d;
  --danger: #e63946;
  --dark: #1d3557;
  --light: #f8f9fa;
  --gray: #6c757d;
  --light-gray: #e9ecef;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --card-hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  --border-radius: 12px;
  --transition: all 0.3s ease;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32vh, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.face-alert-grid {
  width: 36vh;
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: var(--transition);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.face-alert-grid:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-hover-shadow);
}

.face-alert-grid {
  .alert-card.level-1 {
    border-left: 3px solid var(--danger);
  }
  .alert-card.level-2 {
    border-left: 3px solid var(--warning);
  }
  .alert-card.level-3 {
    border-left: 3px solid var(--success);
  }
  .alert-card.level-4 {
    border-left: 3px solid var(--low);
  }

  .alert-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--light-gray);
    background: #f8f9ff;
  }

  .alert-time {
    color: var(--gray);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .alert-level {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 300;
    text-align: center;
  }

  .image-comparison {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 12px;
    border-bottom: 1px solid var(--light-gray);
  }

  .image-container {
    flex: -1;
    margin-right: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .image-label {
    font-size: 14px;
    color: var(--gray);
    margin-bottom: 6px;
    font-weight: 300;
  }

  .face-image {
    width: 7vw;
    height: 8vw;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--light-gray);
  }

  .camera-name {
    padding-left: 16px;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
    color: var(--dark);
  }

  .alert-details {
    padding: 12px 16px;
    flex-grow: 1;
    font-size: 13px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .detail-label {
    font-size: 16px;
    color: var(--gray);
    font-weight: 500;
    min-width: 100px;
  }

  .detail-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--dark);
    text-align: right;
    flex-grow: 1;
    word-break: break-word;
  }

  .alert-actions {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--light-gray);
  }

  /* 响应式设计 */
  @media (max-width: 100vh) {
    .alert-grid {
      grid-template-columns: repeat(auto-fill, minmax(36vh, 1fr));
    }
  }

  @media (max-width: 1200px) {
    .alert-grid {
      grid-template-columns: repeat(auto-fill, minmax(36vh, 1fr));
    }
  }

  @media (max-width: 992px) {
    .alert-grid {
      grid-template-columns: repeat(auto-fill, minmax(36vh, 1fr));
    }

    .stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .controls {
      width: 100%;
      justify-content: space-between;
    }

    .search-box input {
      width: 200px;
    }

    .alert-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .image-comparison {
      flex-direction: column;
      gap: 10px;
    }
  }

  @media (max-width: 576px) {
    .search-box input {
      width: 160px;
    }

    .alert-grid {
      grid-template-columns: 1fr;
    }

    .stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>

<!-- vehicle css-->
<style scoped lang="scss">
* {
  box-sizing: border-box;
}

/* 告警卡片网格 */
.vehicle-alert-card {
  --primary: #4361ee;
  --primary-dark: #3a56d4;
  --secondary: #7209b7;
  --success: #4cc9f0;
  --warning: #f72525;
  --dark: #1d3557;
  --light: #f8f9fa;
  --gray: #6c757d;
  --light-gray: #e9ecef;
  --card-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  --border-radius: 16px;
  --transition: all 0.3s ease;
  width: 37vh;
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: var(--transition);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vehicle-alert-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-hover-shadow);
}

.vehicle-alert-card {
  border-left: 3px solid var(--warning);
}

.vehicle-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.alert-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--light-gray);
}

.plate-number {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
  background: linear-gradient(to right, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  padding: 4px 12px;
  border-radius: 8px;
  background-color: rgba(67, 97, 238, 0.1);
  border: 1px solid rgba(67, 97, 238, 0.2);
}

.alert-time {
  color: var(--gray);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.camera-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dark);
}

.camera-name i {
  color: var(--primary);
}

.alert-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-label {
  color: var(--gray);
  font-weight: 500;
  min-width: 100px;
}

.detail-value {
  font-weight: 600;
  color: var(--dark);
  text-align: right;
  flex-grow: 1;
}

/* 响应式设计 */
@media (max-width: 100vh) {
  .alert-grid {
    grid-template-columns: repeat(auto-fill, minmax(37vh, 1fr));
  }
}

@media (max-width: 480px) {
  .search-box input {
    width: 180px;
  }

  .alert-grid {
    grid-template-columns: 1fr;
  }

  .plate-number {
    font-size: 20px;
  }
}
:deep(.el-timeline-item__wrapper) {
  padding-left: 16px !important;
}
</style>
