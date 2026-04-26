<template>
  <div class="main-page mb-5px pt-4vh">
    <ContentWrap style="height: 85vh">
      <div :class="{ right: true }" v-loading="loading" element-loading-text="Loading......">
        <div class="h-80vh overflow-y-auto">
          <div class="alert-grid" v-if="searchData.length > 0">
            <div
              v-for="(item, index) in searchData"
              class="alert-card cursor-pointer"
              :class="'level-' + item.alarmLevel"
              :key="index"
              @click="openForm(item, index)"
            >
              <div class="alert-header">
                <div class="alert-level">
                  <LevelTag :level="item.alarmLevel" />
                </div>
                <div class="alert-time">
                  <el-link :icon="Clock" type="primary" :underline="false" title="Capture Time" />
                  {{ formatDate(item.captureTime) }}
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
                  <el-image :src="getKsProxyUrl(item.albumPhotoUrl)" class="face-image" >
                    <template #error>
                      <el-image :src="getImageUrl('default_face')" />
                    </template>
                  </el-image>
                </div>
                <div class="card-item-score">{{ item.score }}</div>
              </div>
              <div class="camera-name"
                ><el-link
                  :icon="VideoCamera"
                  title="Camera Name"
                  type="primary"
                  :underline="false"
                />
                {{ item.cameraName }}
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
          <el-empty v-else class="!w-full !h-full" />
        </div>
        <div class="right-bottom" v-if="total > 0">
          <el-pagination
            background
            layout="sizes,prev,pager,next,total"
            :size="queryParams.pageSize"
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.pageSize"
            @current-change="changePage"
            @size-change="changePage"
            :total="total"
          />
        </div>
      </div>
    </ContentWrap>
  </div>
  <!-- 表单弹窗：添加/修改 -->
  <AlarmFaceMsgForm ref="formRef" @success="getList" style="width: 70%; height: 70vh" />
</template>

<script setup lang="ts">
import StatusTag from '../StatusTag.vue'
import { getImageUrl } from '@/api/alarmtask/common'
import {getKsProxyUrl} from "@/api/common";
import { ref, reactive, onMounted } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { AlarmFaceMsgApi, AlarmFaceMsgVO } from '@/api/alarmfacemsg'
import { AlarmTaskApi } from '@/api/alarmtask/face'
import AlarmFaceMsgForm from '../facehistory/AlarmFaceMsgForm.vue'
import { ContentWrap } from '@/components/ContentWrap'
import { getPermissionDeviceTree } from '@/api/device'
import { VideoCamera, Clock } from '@element-plus/icons-vue'
import LevelTag from '../LevelTag.vue'
/** 人脸报警历史消息 列表 */
defineOptions({ name: 'AlarmFaceMsg' })
const reload = inject<any>('reload')
const message = useMessage() // 消息弹窗
const route = useRoute()
const routeParam = route.query.apiTaskId
//const { t } = useI18n() // 国际化

const props = defineProps({
  apiTaskId: {
    type: String
  },
  outerParams: {
    type: Object,
    default: () => ({
      cameraIds: [],
      levels: [1, 2, 3, 4],
      librarys: [],
      status: -1
    })
  }
})

const loading = ref(true) // 列表的加载中
const list = ref<AlarmFaceMsgVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数

const deviceOptions = ref<any[]>([]) //设备权限树
const checkStrictly = ref(true) // 是否严格模式，即父子不关联
const faceTaskOptions = ref([] as any[])

const formatAbumName = (name: String) => {
  if (name.length > 10) {
    return name.substring(0, 10) + '...'
  }
  return name
}

//后台返回数据
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
    alarmLevel: 1,
    albumName: '',
    cameraName: '',
    albumPersonName: '',
    albumPersonIdCard: ''
  }
])
const queryParams = reactive({
  page: 1,
  pageSize: 50,
  level: [],
  type: undefined,
  status: undefined,
  albumIds: undefined,
  cameraIds: [],
  apiAlarmIds: [],
  name: '',
  gender: undefined,
  ageRange: undefined,
  remark: undefined,
  nativePlace: undefined,
  timeRange: [
    formatDate(new Date(), 'YYYY-MM-DD') + ' 00:00:00',
    formatDate(new Date(), 'YYYY-MM-DD') + ' 23:59:59'
  ],
  startTime: '',
  endTime: '',
  idNoReceiver: '',
  identityType: 1
})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    //处理时间
    const data = await AlarmFaceMsgApi.getAlarmFaceMsgPage(queryParams)
    searchData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

//  method

const changePage = (page: number) => {
  queryParams.page = page
  getList()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (obj: Object, index?: number) => {
  console.log('openForm:', obj)
  formRef.value.open(obj, index)
}

const initDeviceTree = async () => {
  deviceOptions.value = await getPermissionDeviceTree({ cameraType: 3 })
}

const initTaskOptions = async () => {
  const options = await AlarmTaskApi.getTaskOptions()
  faceTaskOptions.value.push(...options)
  console.log('routeParam ====== ', routeParam)
  if (routeParam != undefined) {
    queryParams.apiAlarmIds.push(routeParam as string)
  } else {
    queryParams.apiAlarmIds.push(...options.map((a) => a.value))
  }
}

const init = async () => {
  if (props.apiTaskId) {
    queryParams.apiAlarmIds = [props.apiTaskId]
  }
  queryParams.startTime = queryParams.timeRange[0]
  queryParams.endTime = queryParams.timeRange[1]
  queryParams.status = props.outerParams.status
  queryParams.albumIds = [...props.outerParams.librarys]
  queryParams.level = [...props.outerParams.levels]
  queryParams.cameraIds = [...props.outerParams.cameraIds]
  console.log('face queryParams ============ ', queryParams)
  getList()
  loopList()
}

let interval: any
const loopList = () => {
  interval = setInterval(() => {
    getList()
  }, 30 * 1000)
}

/** 初始化 **/
onMounted(() => {
  init()
})

watch(
  () => props.outerParams,
  (newVal) => {
    queryParams.status = newVal.status
    queryParams.albumIds = [...newVal.librarys]
    queryParams.level = [...newVal.levels]
    queryParams.cameraIds = [...newVal.cameraIds]
    getList()
  },
  {
    deep: true
  }
)

const statusChange = () => {}

onUnmounted(() => {
  clearInterval(interval)
})
</script>
<style scoped>
.condition {
  height: 88.6vh;
}
.title-box {
  margin: 5px;
  display: flex;
  justify-content: flex-end;
  line-height: 40px;
}

.condition-title {
  font-weight: bold;
  color: #2672ff;
}

.card-item {
  position: relative;
  width: 31vh;
  height: 22vh;
  cursor: pointer;
  border-top: 2px solid rgb(171, 26, 26);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.card-item:hover {
  transition: 0.8s;
  transform: translateY(-2px);
  border-color: red;
}

.card-item-images {
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
  margin-top: 5px;
  float: right;
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
<style scoped>
.alert-grid {
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

.alert-card {
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

.alert-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-hover-shadow);
}

.alert-card.level-1 {
  /* background: rgba(230, 57, 70, 0.15); */
  border-left: 4px solid var(--danger);
}

.alert-card.level-2 {
  /* background: rgba(247, 37, 133, 0.15); */
  border-left: 4px solid var(--warning);
}

.alert-card.level-3 {
  /* background: rgba(250, 231, 135, 0.15); */
  border-left: 4px solid var(--success);
}
.alert-card.level-4 {
  /* background: rgba(76, 201, 240, 0.15); */
  border-left: 4px solid var(--low);
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
  margin-top: 10px;
  padding-left: 16px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
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
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-label {
  font-size: 16px;
  color: var(--gray);
  font-weight: 500;
  min-width: 100px;
}

.detail-value {
  font-size: 15px;
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
</style>
