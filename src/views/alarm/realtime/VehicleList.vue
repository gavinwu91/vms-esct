<template>
  <div v-loading="exportLoading">
    <div class="pt-4vh">
      <el-card class="container-card">
        <div class="h-79vh overflow-y-auto">
          <div
            class="alert-grid"
            id="alert-container"
            v-show="result.data && result.data.length > 0"
          >
            <!-- 告警卡片将通过JavaScript动态生成 -->
            <div
              class="alert-card cursor-pointer"
              v-for="(o, key) in result.data"
              :key="key"
              @click="showCaptureDetail(o, 'vehicle')"
            >
              <el-image class="capture-image" :src="imageShow(o.fullUrl)" lazy>
                <template #error>
                  <el-icon>
                    <icon-picture />
                  </el-icon>
                </template>
              </el-image>

              <div class="alert-content">
                <div class="alert-header">
                  <div class="plate-number">{{ o.carNumber }}</div>
                  <div class="alert-time">
                    <el-link :icon="Clock" type="primary" :underline="false" />
                    {{ formatDate(new Date(o.captureTime)) }}
                  </div>
                </div>
                <div class="camera-name"
                  ><el-link :icon="VideoCamera" type="primary" :underline="false" />
                  {{ o.cameraName }}
                </div>
                <div class="alert-details">
                  <div class="detail-item">
                    <span class="detail-label">Task Name</span>
                    <span class="detail-value">{{ o.strategyName }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Vehicle Type</span>
                    <span class="detail-value">{{ getVehicleType(o.fullUrl) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <div>
                      <StatusTag :status="o.status" :size="'default'" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty
            image-size="300"
            style="height: 78vh"
            v-show="result.data && result.data.length === 0"
          />
        </div>

        <el-pagination
          style="float: right; margin: 10px"
          background
          layout="sizes,prev,pager,next"
          :size="pageQuery.pageSize"
          v-model:current-page="pageQuery.page"
          v-model:page-size="pageQuery.pageSize"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :total="result.total"
        />
      </el-card>
    </div>

    <el-dialog
      :key="tools.key"
      v-model="tools.captureDetail"
      draggable
      style="margin-top: 5px"
      width="90%"
      @close="tools.captureDetail = false"
      title="Vehicle Alarm Information"
    >
      <VehicleAlarmDetail :content="content" :allContent="tools.content" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { VideoCamera, Clock } from '@element-plus/icons-vue'
import { AlarmPlateMsgApi, imageShow, getDay } from '@/api/alarmmsg/plate'
import StatusTag from '../StatusTag.vue'
import { AlarmTaskApi } from '@/api/alarmtask/plate'
import { formatDate } from '@/utils/formatTime'
import { getPermissionDeviceTree } from '@/api/device'
import VehicleAlarmDetail from '../platehistory/VehicleAlarmDetail.vue'
import {getVehicleType} from '@/api/alarmtask/common'
const deviceOptions = ref<any[]>([]) //设备权限树
const showTrack = ref(false)
const route = useRoute()
const routeParam = route.query.apiTaskId
const exportLoading = ref(false)
const pageQuery = reactive({
  page: 1,
  pageSize: 50,
  taskApiIds: [] as string[],
  cameraIds: [] as string[],
  times: [getDay(-0) + ' 00:00:00', getDay(-0) + ' 23:59:59'],
  sort: 2,
  carNumber: '',
  matchType: '20',
  color: [],
  brand: [],
  startTime: '',
  endTime: '',
  status: 1
})

const result = ref({
  total: 0,
  data: [
    {
      carNumber: '',
      strategyName: '',
      linkMethod: 1,
      fullUrl: '',
      location: '',
      cameraName: '',
      captureTime: 0,
      speed: 0
    }
  ],
  dataTotal: 0
})

const taskOptions = ref([{ value: '', label: '' }])

const initTaskOptions = async () => {
  const result = await AlarmTaskApi.getLarmTaskOptions()
  taskOptions.value = result
  if (routeParam != undefined) {
    pageQuery.taskApiIds.push(routeParam as string)
  } else {
    pageQuery.taskApiIds = taskOptions.value.map((a) => a.value)
  }
}

const content = reactive({ rid: '', channel: 'Alarm' })

//翻页
const changePage = async (page) => {
  const loadingInstance = ElLoading.service()
  showTrack.value = false
  pageQuery.page = parseInt(page)
  try {
    if (pageQuery.times != null && pageQuery.times.length > 0) {
      pageQuery.startTime = pageQuery.times[0]
      pageQuery.endTime = pageQuery.times[1]
    }
    let res = await AlarmPlateMsgApi.getAlarmPlateMsgPage(pageQuery)
    result.value.data = res.list || []
    result.value.total = res.total
  } catch (e) {}
  console.log(result)
  loadingInstance.close()
}

// 添加车牌号并查询
const codeSearch = (code) => {
  pageQuery.carNumber = code
  changePage(1)
}

// 查看抓拍详情
const showCaptureDetail = (o, panel) => {
  console.log('o ==== ', o)
  const param = {
    rId: o.rId,
    apiTaskId: o.apiTaskId,
    alarmNo: o.alarmNo
  }
  AlarmPlateMsgApi.getAlarmPlateDetail(param).then((res) => {
    tools.key++
    tools.content = res
    tools.captureDetail = true
  })
}

const handleCurrentChange = (val: number) => {
  result.value.data = []
  changePage(val)
}

const handleSizeChange = (val: number) => {
  pageQuery.pageSize = val
  result.value.data = []
  changePage(1)
}

const initDeviceOptions = async () => {
  deviceOptions.value = await getPermissionDeviceTree({ cameraType: 4 })
}
const init = async () => {
  await initDeviceOptions()
  await initTaskOptions()
  pageQuery.status = props.outerParams.status
  pageQuery.taskApiIds = [...props.outerParams.librarys]
  pageQuery.cameraIds = [...props.outerParams.cameraIds]
  changePage(1)
  loopList()
}

onMounted(() => {
  init()
})

const props = defineProps({
  outerParams: {
    type: Object,
    default: () => ({
      cameraIds: [],
      librarys: [],
      status: -1
    })
  }
})

const formatStatus = (status) => {}

const tools = reactive({
  key: 0,
  captureDetail: false,
  content: null as any
})

watch(
  () => props.outerParams,
  (newVal) => {
    pageQuery.cameraIds = [...newVal.cameraIds]
    pageQuery.taskApiIds = [...newVal.librarys]
    pageQuery.status = newVal.status
    changePage(1)
  },
  {
    immediate: true,
    deep: true
  }
)
let interval: any

const loopList = () => {
  interval = setInterval(() => {
    changePage(1)
  }, 30 * 1000)
}
onUnmounted(() => {
  clearInterval(interval)
})
</script>
<style scoped>
:deep(.el-card__body) {
  padding: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}
.container-card {
  overflow-y: auto;
  max-width: 100%;
  height: 85vh;
  margin-top: 5px;
  /* background: linear-gradient(135deg, #f0f0f0, #e0e0e0); */
}

.capture-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
}

.condition-title {
  font-weight: bold;
  color: #2672ff;
}

.card-item {
  width: 100%;
  padding: 3px;
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.item-box {
  display: flex;
  flex-direction: column;
}

:deep(.el-date-editor .el-range-input) {
  font-size: 12px;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: bold;
  font-size: 15px;
}
:deep(.el-date-editor .el-range-separator) {
  font-size: 10px;
}
:deep(.el-divider--horizontal) {
  margin: 10px 0;
}
.result-count-title {
  line-height: 20px;
  font-weight: bold;
  font-size: 20px;
  color: var(--el-text-color-regular);
}
:deep(.el-card__footer) {
  padding: 10px;
}
</style>
<style scoped lang="scss">
* {
  box-sizing: border-box;
}

/* 告警卡片网格 */
.alert-grid {
  --primary: #4361ee;
  --primary-dark: #3a56d4;
  --secondary: #7209b7;
  --success: #4cc9f0;
  --danger: #e63946;
  --dark: #1d3557;
  --light: #f8f9fa;
  --gray: #6c757d;
  --light-gray: #e9ecef;
  --card-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  --border-radius: 16px;
  --transition: all 0.3s ease;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(37vh, 1fr));
  gap: 14px;
  margin-bottom: 30px;
}

.alert-card {
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

.alert-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-hover-shadow);
}

.alert-card {
  border-left: 4px solid var(--danger);
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
@media (max-width: 96vh) {
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
</style>
