<template>
  <div class="-container">
    <el-tabs type="card" v-model="tools.activeName" @tab-click="handleClick" v-loading="loading">
      <el-tab-pane label="Vehicle" name="vehicle">
        <div class="flex justify-between mb-5px">
          <h3 class="text-red-6">Alarm Info</h3>
          <div v-show="allContent.alarmMsgInfo.status != 4">
            <span class="text-14px text-#606266">Handle</span>
            <el-select v-model="updateForm.status" style="margin: 0 1cap 0 1cap; width: 200px">
              <el-option
                v-for="item in statusOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-button type="primary" size="default" @click="updateStatus" class="vms-main-button"
              >Confirm</el-button
            >
          </div>
        </div>
        <el-descriptions border :column="2" class="alarm-info-desc">
          <el-descriptions-item label="Task Name">{{
            allContent.taskInfo.strategyName
          }}</el-descriptions-item>
          <el-descriptions-item label="Vehicle No">{{
            allContent.taskInfo.carNumber
          }}</el-descriptions-item>

          <el-descriptions-item label="User">{{
            allContent.taskInfo.userName
          }}</el-descriptions-item>
          <el-descriptions-item label="Department">{{
            allContent.taskInfo.deptName
          }}</el-descriptions-item>
          <el-descriptions-item label="Create Time" :span="2">{{
            formatDate(allContent.taskInfo.createTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="Alarm No">{{
            allContent.alarmMsgInfo.alarmNo
          }}</el-descriptions-item>
          <el-descriptions-item label="Status">
            <StatusTag :status="allContent.alarmMsgInfo.status" />
          </el-descriptions-item>
          <el-descriptions-item label="Alarm Time">
            {{ formatDate(allContent.alarmMsgInfo.createTime) }}
          </el-descriptions-item>
        </el-descriptions>
        <el-divider direction="horizontal" content-position="left" />
        <h3 class="mb-5px text-red-6">Vehicle Info</h3>
        <el-descriptions border class="box-shadow-radius" :column="3">
          <el-descriptions-item label="Vehicle No" v-if="vehicleDetail.imgPath">
            <el-image style="width: 120px; height: 30px" :src="imageShow(vehicleDetail.imgPath)" />
          </el-descriptions-item>
          <el-descriptions-item label="Vehicle No"
            >{{ vehicleDetail.licenseCode || 'None' }}
          </el-descriptions-item>
          <el-descriptions-item label="Speed"
            >{{ vehicleDetail.speed }}&nbsp;km</el-descriptions-item
          >
          <el-descriptions-item label="Vehicle Type"
            >{{ vehicleDetail.vehicleType }}
          </el-descriptions-item>
          <el-descriptions-item label="Vehicle Color"
            >{{ vehicleDetail.vehicleColor }}
          </el-descriptions-item>
          <el-descriptions-item label="Brand">{{ vehicleDetail.brand }}</el-descriptions-item>
          <el-descriptions-item label="Checkpoint">{{
            vehicleDetail.location
          }}</el-descriptions-item>
          <el-descriptions-item label="Device Name"
            >{{ vehicleDetail.cameraName }}
          </el-descriptions-item>
          <el-descriptions-item label="Link Method" v-if="vehicleDetail.linkMethod === 1"
            >Wired
          </el-descriptions-item>
          <el-descriptions-item label="Link Method" v-if="vehicleDetail.linkMethod === 2"
            >Wireless
          </el-descriptions-item>
          <el-descriptions-item label="Capture Time"
            >{{ vehicleDetail.captureTime }}
          </el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <div class="vehicle_captured_box">
          <img :src="imageShow(vehicleDetail.imgPath2)" class="!w-full !h-100vh" />
        </div>
      </el-tab-pane>
      <el-tab-pane label="Location" name="location" style="height: 80vh">
        <VehicleCaptureTrack
          :content="trackData"
          v-if="tools.activeName == 'location'"
          :key="mapRandomId"
        />
      </el-tab-pane>
      <el-tab-pane label="Registration Identity" name="vehicleDatabase">
        <VehicleDatabaseDetail
          :content="vehicleContent"
          v-if="tools.activeName == 'vehicleDatabase' && findRealIdentity"
        />
      </el-tab-pane>
      <el-tab-pane
        label="Driver Face Compare"
        name="driverFaceCompare"
        v-if="driverFaceCompareInfo.hasFace && driverFaceCompareInfo.haveAnotherRid"
      >
        <DriverFaceCompare
          :content="driverFaceCompareInfo"
          v-if="tools.activeName == 'driverFaceCompare'"
        />
      </el-tab-pane>
      <el-tab-pane
        label="Tracking"
        name="tracking"
        style="height: 80vh; position: relative"
        v-loading="loading"
      >
        <div class="filter-box">
          <el-date-picker
            range-separator="To"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="Begin date"
            end-placeholder="End date"
            v-model="pageQuery.times"
            size="default"
            style="margin: auto; font-size: 12px"
            type="datetimerange"
          />
          <el-button
            class="vms-track-button"
            type="primary"
            plain
            size="default"
            style="margin: 5px"
            @click="searchTracking"
            :disabled="loading"
            >Search
          </el-button>
        </div>
        <VehicleCaptureTrack
          :content="trackData"
          v-if="tools.activeName == 'tracking'"
          :key="mapRandomId"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import StatusTag from '../StatusTag.vue'
import { formatDate } from '@/utils/formatTime'
import { getDay, imageShow } from '@/views/vehicle/components/index'
import { TabsPaneContext } from 'element-plus'
import DriverFaceCompare from '@/views/vehicle/components/driverFaceCompare.vue'
import VehicleDatabaseDetail from '@/views/vehicle_db/components/details.vue'
import { getRealIdentity } from '@/api/vehicle_db/index'
import VehicleCaptureTrack from '@/views/vehicle/components/trackPlayback.vue'
import { search } from '@/api/vehicle'
import { AlarmPlateMsgApi } from '@/api/alarmmsg/plate'
import { statusOptions } from '@/api/alarmtask/common'
import { all } from 'axios'
defineOptions({ name: 'VehicleAlarmDetail' })
const props = defineProps({
  content: {
    type: Object,
    default: () => {}
  },
  allContent: {
    type: Object,
    require: true
  }
})
let contentObj = {
  alarmMsgInfo: {},
  taskInfo: {},
  recordInfo: {}
}
const mapRandomId = ref(1)
const loading = ref(false)
const trackQuery = ref({
  carNo: null,
  captureType: '20',
  searchType: '20',
  searchKey: null,
  key: Math.random(),
  times: [getDay(-3) + ' 00:00:00', getDay(-0) + ' 23:59:59'],
  source: {}
})

let tools = reactive({
  captureImages: [],
  activeName: 'vehicle'
})

const vehicleDetail = ref({
  rid: null,
  checkpointId: null,
  cameraId: null,
  licenseCode: null,
  vehicleColor: null,
  licensePlateColor: null,
  vehicleCountry: null,
  vehicleType: null,
  brand: null,
  laneNo: null,
  speed: null,
  imgPath: null,
  imgPath2: null,
  captureTime: null,
  importTime: null,
  captureTimeStr: null,
  status: null,
  face1: null,
  face2: null,
  location: '',
  cameraName: '',
  linkMethod: 1,
  hasFace: false
})

const driverFaceCompareInfo = ref({ haveAnotherRid: false } as any)

const vehicleContent = ref({})
const trackData = ref([])
let allContent = reactive({ ...props.allContent })
const init = () => {
  updateForm.value.id = allContent.alarmMsgInfo.id
  loading.value = true
  vehicleDetail.value = allContent.recordInfo
  getVsRid()
  trackQuery.value.carNo = allContent.recordInfo.licenseCode
  trackQuery.value.searchKey = allContent.recordInfo.licenseCode
  trackQuery.value.source = allContent.recordInfo
  // if (outParams.panel) {
  //   tools.activeName = outParams.panel
  // }
  trackData.value.push(allContent.recordInfo)
  const params = [
    allContent.recordInfo.imgPath2,
    allContent.recordInfo.imgPath,
    allContent.recordInfo.face1,
    allContent.recordInfo.face2
  ]
  params
    .filter((item) => !item)
    .forEach((item) => {
      tools.captureImages.push('https://192.168.80.185:8443/vehicle_img' + item)
    })
  loading.value = false
}
const updateForm = ref({
  id: 0,
  status: 1
})

const updateStatus = () => {
  const a = { id: updateForm.value.id, status: updateForm.value.status }
  AlarmPlateMsgApi.updateAlarmPlateMsg(a).then((res) => {
    allContent.alarmMsgInfo.status = updateForm.value.status
    ElMessage.success('Update success!')
  })
}

const findRealIdentity = ref(false)
const handleClick = (tab: TabsPaneContext, event: Event) => {
  loading.value = true
  switch (tab.paneName) {
    case 'tracking':
      trackQuery.value.carNo = allContent.recordInfo.licenseCode
      trackQuery.value.searchKey = allContent.recordInfo.licenseCode
      trackQuery.value.source = allContent.recordInfo
      mapRandomId.value++
      break
    case 'vehicleDatabase':
      try {
        getRealIdentity({
          plateNumber: allContent.recordInfo.licenseCode,
          captureTime: allContent.recordInfo.captureTime
        }).then((res) => {
          vehicleContent.value = res
          findRealIdentity.value = true
          loading.value = false
        })
      } catch (e) {
        console.log(e)
      }
      break
    case 'vehicleDatabase':
      mapRandomId.value++
  }

  loading.value = false
}

const searchTracking = () => {
  loading.value = true
  pageQuery.vehicleCode = allContent.recordInfo.licenseCode
  search(pageQuery).then((res) => {
    trackData.value = []
    mapRandomId.value++
    trackData.value = res.data || []
    loading.value = false
  })
}
const pageQuery = reactive({
  times: [getDay(-0) + ' 00:00:00', getDay(-0) + ' 23:59:59'],
  page: 1,
  matchType: '10',
  pageSize: 20,
  vehicleCode: ''
})

const getVsRid = async () => {
  driverFaceCompareInfo.value = { ...vehicleDetail.value }

  AlarmPlateMsgApi.getVsRid(allContent.alarmMsgInfo.rId)
    .then((res) => {
      if (res) {
        console.log('getVsRid ====== ', res)
        driverFaceCompareInfo.value.rid = res
        driverFaceCompareInfo.value.haveAnotherRid = true
      }
    })
    .catch((eres) => {})
}

watch(
  () => props.content,
  (content) => {
    if (content) {
      init()
    }
  }
)
onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped></style>
