<template>
  <div v-loading="exportLoading">
    <div class="pt-4vh">
      <el-card class="container-card" v-show="!showTrack">
        <div class="card-container" v-show="result.data && result.data.length > 0">
          <el-card v-for="(o, key) in result.data" :key="key" class="result-card">
            <template #header>
              <div class="card-item flex justify-between">
                <el-link
                  type="danger"
                  style="font-weight: bold"
                  v-if="o.carNumber"
                  :icon="Postcard"
                >
                  &nbsp;{{ o.carNumber }}
                </el-link>
                <div>
                  <StatusTag :status="o.status" />
                </div>
              </div>
            </template>
            <div class="compare-box" @click="showCaptureDetail(o, 'vehicle')">
              <el-image class="capture-image" :src="imageShow(o.fullUrl)" lazy>
                <template #error>
                  <el-icon>
                    <icon-picture />
                  </el-icon>
                </template>
              </el-image>
            </div>
            <template #footer>
              <div class="item-box">
                <div class="card-item">
                  <el-link
                    type="danger"
                    style="font-weight: bold"
                    :icon="Notebook"
                    @click="showCaptureDetail(o, 'vehicle')"
                  >
                    &nbsp;{{ o.strategyName }}
                  </el-link>
                  <el-link
                    :icon="VideoCamera"
                    type="primary"
                    style="font-weight: bold"
                    @click="showCaptureDetail(o, 'location')"
                    >&nbsp;
                    {{ o.cameraName }}
                  </el-link>
                </div>
                <div class="card-item">
                  <el-link
                    type="danger"
                    style="font-weight: bold"
                    :icon="Timer"
                    @click="showCaptureDetail(o, 'vehicle')"
                  >
                    &nbsp;{{ formatDate(new Date(o.captureTime)) }}
                  </el-link>
                  <el-link
                    style="color: orange"
                    v-show="o.speed > 0"
                    :icon="Odometer"
                    @click="showCaptureDetail(o, 'tracking')"
                    :title="'Speed: ' + o.speed + 'km'"
                    >&nbsp;{{ o.speed }}km
                  </el-link>
                  <el-link
                    style="color: orange"
                    v-show="o.speed === 0"
                    :icon="Odometer"
                    @click="showCaptureDetail(o, 'tracking')"
                    title="No radar"
                    >&nbsp;No radar
                  </el-link>
                </div>
              </div>
            </template>
          </el-card>
        </div>
        <el-empty
          image-size="300"
          style="height: 78vh"
          v-show="result.data && result.data.length === 0"
        />
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
import { Odometer, Postcard, Timer, VideoCamera, Notebook } from '@element-plus/icons-vue'
import { AlarmPlateMsgApi, imageShow, getDay } from '@/api/alarmmsg/plate'
import StatusTag from '../StatusTag.vue'
import { AlarmTaskApi } from '@/api/alarmtask/plate'
import { formatDate } from '@/utils/formatTime'
import { getPermissionDeviceTree } from '@/api/device'
import VehicleAlarmDetail from '../platehistory/VehicleAlarmDetail.vue'
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
.condition {
  overflow-y: auto;
  /* box-shadow: var(--el-box-shadow-lighter); */
}

.result {
  width: 82%;
  margin-left: 10px;
}

.title-box {
  margin: 0 10px;
  display: flex;
  justify-content: flex-end;
  line-height: 40px;
  /* border-bottom: 2px dodgerblue solid; */
}

:deep(.el-card__body) {
  padding: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}

.card-container {
  overflow: auto;
  height: 79vh;
  display: grid;

  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  /* flex-wrap: wrap;
  align-content: flex-start;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0); */
}
.card-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  margin-right: 0;
}
.card-container::-webkit-scrollbar-track {
  background: transparent;
}
.card-container::-webkit-scrollbar-thumb {
  background: rgba(12, 10, 10, 0.71);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.card-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.container-card {
  max-width: 100%;
  height: 85vh;
  margin-top: 5px;
  /* background: linear-gradient(135deg, #f0f0f0, #e0e0e0); */
}

:deep(.el-splitter-bar__dragger) {
  background: orangered !important;
}

.result-card {
  /* background: rgba(255, 255, 255, 0.76); */
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
  backdrop-filter: blur(10px);
  /* border: 2px solid rgba(255, 255, 255, 0.3);
  border: 1px solid #ebeef5; */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.12),
    0 0 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  border-radius: 12px;
  height: 350px;
  min-height: 350px;
}

.result-card:hover {
  transition: 0.8s;
  transform: translateY(-8px);
  border: solid #ff4040 1px;
}

.capture-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
}

.compare-box {
  position: relative;
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
