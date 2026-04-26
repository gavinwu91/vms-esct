<template>
  <div class="main-page mb-5px pt-4vh">
    <div class="bottom">
      <ContentWrap style="height: 85vh">
        <div>
          <div :class="{ right: true }" v-loading="loading" element-loading-text="Loading......">
            <div class="right-center" v-if="searchData.length > 0">
              <el-row>
                <div class="page-info">
                  <div style="display: flex; flex-wrap: wrap; gap: 4px">
                    <div
                      class="card-item"
                      :span="3"
                      v-for="(o, index) in searchData"
                      :key="index"
                      @click="openForm(o, index)"
                    >
                      <div class="card-item-compare-base-info" style="height: 6%; font-size: 12px">
                        <div style="justify-content: space-between; display: flex">
                          <div style="display: flex; width: 130px">
                            <div
                              style="
                                margin-top: 2px;
                                margin-right: 2%;
                                width: 100%;
                                height: 18px;
                                line-height: 18px;
                                background-color: rgb(190, 87, 83);
                                color: white;
                                text-align: center;
                                padding: 0 30px;
                              "
                              >Level {{ o.alarmLevel }}
                            </div>
                            <div style="color: rgb(190, 87, 83); padding-top: 4px"
                              >{{ formatAbumName(o.albumName) }}
                            </div>
                          </div>
                          <div class="handle-status mr-5px mt-3px">
                            <StatusTag :status="o.status" />
                          </div>
                        </div>
                      </div>
                      <div class="card-item-images">
                        <div>
                          <el-image :src="o.cropUrl" style="width: 134px; height: 134px" />
                          <div style="width: 100%; height: 20px; font-size: 12px; text-align: left">
                            <div class="device-name"> {{ o.cameraName }}</div>
                            <div class="capturetime"> {{ formatDate(o.captureTime) }}</div>
                          </div>
                        </div>
                        <div>
                          <el-image :src="o.albumPhotoUrl" style="width: 134px; height: 134px" />
                          <div style="width: 100%; height: 20px; font-size: 12px; text-align: left">
                            <div class="person-name"> {{ o.albumPersonName }}</div>
                            <div class="id-card"> {{ o.albumPersonIdCard }}</div>
                          </div>
                        </div>

                        <div class="card-item-score">{{ o.score }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-row>
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
        </div>

        <el-empty
          :image-size="300"
          style="height: 78vh"
          v-show="searchData && searchData.length === 0"
        />
      </ContentWrap>
    </div>
  </div>
  <!-- 表单弹窗：添加/修改 -->
  <AlarmFaceMsgForm ref="formRef" @success="getList" style="width: 70%; height: 70vh" />
</template>

<script setup lang="ts">
import StatusTag from '../StatusTag.vue'
import { ref, reactive, onMounted } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { AlarmFaceMsgApi, AlarmFaceMsgVO } from '@/api/alarmfacemsg'
import { AlarmTaskApi } from '@/api/alarmtask/face'
import AlarmFaceMsgForm from '../facehistory/AlarmFaceMsgForm.vue'
import { ContentWrap } from '@/components/ContentWrap'
import { getPermissionDeviceTree } from '@/api/device'
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
    alarmLevel: '',
    albumName: '',
    cameraName: '',
    albumPersonName: '',
    albumPersonIdCard: ''
  }
])
const queryParams = reactive({
  page: 1,
  pageSize: 20,
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

.page-info {
  padding-left: 2px;
  height: 80vh;
  width: 100%;
  overflow-y: auto;
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
  bottom: 19%;
  left: 35%;
  width: 80px;
  font-weight: bold;
  font-size: 14px;
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
