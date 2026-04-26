<template>
  <div class="main-page flex justify-start w-full">
    <div class="left w-18%">
      <div class="condition">
        <div class="title-box">
          <div class="">
            <el-button class="vms-reset-button" @click="reload">Reset</el-button>
            <el-button
              class="vms-track-button"
              size="default"
              style="margin-left: 10px"
              @click="handleExport"
              >Export
            </el-button>
            <el-button
              class="vms-main-button"
              size="default"
              style="margin-left: 10px"
              @click="handleQuery"
              >Search
            </el-button>
          </div>
        </div>
        <el-divider />
        <div style="overflow-y: auto; height: 90%">
          <el-form
            label-position="top"
            class="-mb-15px"
            :model="queryParams"
            ref="queryFormRef"
            :inline="true"
            style="padding: 5px 5px 5px 4%; width: 100%"
          >
            <el-form-item label="Task" prop="task">
              <el-select
                v-model="queryParams.apiAlarmIds"
                clearable
                filterable
                class="!w-32vh"
                multiple
              >
                <el-option
                  v-for="item in faceTaskOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Time" prop="time">
              <el-date-picker
                v-model="queryParams.timeRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                start-placeholder="Start time"
                end-placeholder="End time"
                :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
                class="!w-32vh"
              />
            </el-form-item>

            <el-form-item label="Handling Status" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="All"
                class="!w-32vh"
                @keyup.enter="handleQuery"
                clearable
              >
                <el-option
                  v-for="item in handleStatusOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Alarm Level" prop="level">
              <el-select
                v-model="queryParams.level"
                placeholder="All"
                class="!w-32vh"
                @keyup.enter="handleQuery"
                clearable
                multiple
              >
                <el-option
                  v-for="item in alarmLevelOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Album Ids" prop="albumIds">
              <el-select
                v-model="queryParams.albumIds"
                :multiple="true"
                clearable
                @keyup.enter="handleQuery"
                class="!w-32vh"
              >
                <el-option
                  v-for="item in libraryOptions"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Device">
              <el-input
                class="!w-32vh"
                v-model="deviceText"
                placeholder="Select device"
                readonly
                @click="treeShow = true"
              />
            </el-form-item>
            <div style="width: 100%; font-size: 15px; height: 20px">
              <a
                @click="searchSurveillanceInfoShow = !searchSurveillanceInfoShow"
                style="color: rgb(33, 83, 155); cursor: pointer"
                >{{ searchSurveillanceInfoShow ? `Hide` : 'More ' }}
              </a>
            </div>
            <div v-show="searchSurveillanceInfoShow">
              <el-form-item label="Name" prop="name">
                <el-input
                  v-model="queryParams.name"
                  clearable
                  @keyup.enter="handleQuery"
                  class="!w-32vh"
                />
              </el-form-item>
              <el-form-item label="Id Type" style="width: 100%">
                <div style="width: 90%">
                  <el-select
                    v-model="queryParams.identityType"
                    placeholder="ID type"
                    clearable
                    @clear="clearIdentityType"
                    style="width: 40%"
                  >
                    <el-option
                      v-for="item in identityTypeOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                  <el-input
                    v-model="queryParams.idNoReceiver"
                    type="text"
                    style="width: 60%"
                    placeholder="No."
                    clearable
                    @input="checkIdentityType"
                  />
                </div>
              </el-form-item>

              <el-form-item label="Gender" prop="gender">
                <el-select
                  v-model="queryParams.gender"
                  clearable
                  @keyup.enter="handleQuery"
                  class="!w-32vh"
                >
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Age" prop="ageRange">
                <el-select
                  v-model="queryParams.ageRange"
                  clearable
                  @keyup.enter="handleQuery"
                  class="!w-32vh"
                >
                  <el-option
                    v-for="item in ageOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Remark" prop="remark">
                <el-input
                  v-model="queryParams.remark"
                  clearable
                  @keyup.enter="handleQuery"
                  class="!w-32vh"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <div class="right w-82%">
      <ContentWrap style="height: 88.5vh">
        <!-- <div style="height: 90vh"></div> -->
        <div>
          <div :class="{ right: true }" v-loading="loading" element-loading-text="Loading......">
            <div class="right-center" v-if="searchData.length > 0">
              <el-row>
                <div class="h-83vh overflow-y-auto w-full">
                  <div class="alert-grid">
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
                          <el-link
                            :icon="Clock"
                            type="primary"
                            :underline="false"
                            title="Capture Time"
                          />
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
                          <el-image :src="getKsProxyUrl(item.albumPhotoUrl)" class="face-image">
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
                </div>
              </el-row>
            </div>
            <el-empty image-size="300" style="height: 78vh" v-else />
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
          image-size="300"
          style="height: 78vh"
          v-show="searchData && searchData.length === 0"
        />
      </ContentWrap>
    </div>
  </div>
  <el-dialog v-model="treeShow" width="450px" title="Device" draggable>
    <device-tree-template
      camera-type="3"
      @cancel-select="cancelSelect"
      @submit-select="checkNode"
    />
  </el-dialog>
  <!-- 表单弹窗：添加/修改 -->
  <AlarmFaceMsgForm ref="formRef" @success="getList" style="width: 70%; height: 70vh" />
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import DeviceTreeTemplate from '../DeviceTreePop.vue'
import LevelTag from '../LevelTag.vue'
import { ref, reactive, onMounted } from 'vue'
import { getImageUrl} from '@/api/alarmtask/common'
import {getKsProxyUrl} from "@/api/common";
import { formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import { AlarmFaceMsgApi, AlarmFaceMsgVO } from '@/api/alarmfacemsg'
import { surOptionList as getLibraryOptionList } from '@/api/library'
import { AlarmTaskApi } from '@/api/alarmtask/face'
import AlarmFaceMsgForm from './AlarmFaceMsgForm.vue'
import StatusTag from '../StatusTag.vue'
import { ContentWrap } from '@/components/ContentWrap'
import { getPermissionDeviceTree } from '@/api/device'
import { VideoCamera, Clock } from '@element-plus/icons-vue'

/** 人脸报警历史消息 列表 */
defineOptions({ name: 'AlarmFaceMsg' })
const reload = inject<any>('reload')
const message = useMessage() // 消息弹窗
const route = useRoute()
const routeParam = route.query.apiTaskId
//const { t } = useI18n() // 国际化

const props = defineProps({
  apiTaskId: String
})

const loading = ref(true) // 列表的加载中
const list = ref<AlarmFaceMsgVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const globalCaptureInfo = ref({} as any)

const deviceOptions = ref<any[]>([]) //设备权限树
const checkStrictly = ref(true) // 是否严格模式，即父子不关联
const deviceTreeRef = ref()
const showTreeCondition = ref(false)
const faceTaskOptions = ref([] as any[])

const handleStatusOptions = ref([
  { id: 1, name: 'Awaiting confirmation' },
  { id: 2, name: 'Awaiting receipt' },
  { id: 3, name: 'Awaiting feedback' },
  { id: 4, name: 'Closed' }
])
const alarmLevelOptions = ref([
  { id: 1, name: 'Level 1' },
  { id: 2, name: 'Level 2' },
  { id: 3, name: 'Level 3' },
  { id: 4, name: 'Level 4' }
])
const ageOptions = ref([
  { id: 1, name: 'Child (0 - 6)' },
  { id: 2, name: 'Juvenile (7 - 17)' },
  { id: 3, name: 'Youth (18 - 40)' },
  { id: 4, name: 'Mid-age (41 - 65)' },
  { id: 5, name: 'Elderly(66+)' }
])
const identityTypeOptions = ref([
  { id: 1, name: 'idNo' },
  { id: 2, name: 'Passport' },
  { id: 3, name: 'Phone' },
  { id: 4, name: 'Email' },
  { id: 5, name: 'Visa' },
  { id: 6, name: 'Other' }
])

const deviceCascaderProps = ref({
  expandTrigger: 'hover',
  multiple: true,
  checkStrictly: false,
  value: 'platformCameraId',
  label: 'name'
})

const libraryOptions = ref([{ id: '', label: '' }])

const searchSurveillanceInfoShow = ref(false)

const getStatusWord = (status: number) => {
  const current = handleStatusOptions.value.find((a) => a.id == status)
  return current?.name
}

const formatAbumName = (name: String) => {
  if (name.length > 10) {
    return name.substring(0, 10) + '...'
  }
  return name
}

const changeShowTree = () => {
  showTreeCondition.value = true
}

const clearIdentityType = () => {
  // 清空 identityType 时同时清空 idNo
  queryParams.idNoReceiver = ''
}
const checkIdentityType = () => {
  if (!queryParams.identityType) {
    // 如果 identityType 为空，提示用户选择
    message.alertError('please select ID type!')
    // 清空 idNo 值
    queryParams.idNoReceiver = ''
  }
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
  pageSize: 50,
  level: [1, 2, 3, 4],
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
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    //处理时间
    if (queryParams.timeRange && queryParams.timeRange.length > 0) {
      queryParams.startTime = queryParams.timeRange[0]
      queryParams.endTime = queryParams.timeRange[1]
    } else {
      queryParams.startTime = ''
      queryParams.endTime = ''
    }
    console.log('queryParams === ', queryParams)
    const data = await AlarmFaceMsgApi.getAlarmFaceMsgPage(queryParams)
    console.log('data === ', data)
    searchData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const initTaskJob = async () => {
  if (routeParam != undefined) {
    routeParam
  }
}

const initLibraryOption = async () => {
  const libraryResult = await getLibraryOptionList({})
  libraryOptions.value = libraryResult.map((d) => ({
    id: d.platformLibraryId,
    label: d.libraryName
  }))
  queryParams.albumIds = libraryResult.map((a) => a.platformLibraryId)
}

//  method

const handleNodeClick = (nodeData, node, tree) => {}

const onNodeCollapse = (data, node) => {
  if (data.id == 7) {
    deviceTreeRef.value.expandeNode(data)
  }
}

const changePage = (page: number) => {
  queryParams.page = page
  getList()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (obj: Object, index?: number) => {
  console.log('openForm:', obj)
  formRef.value.open(obj, index)
}

/** 删除按钮操作 */
// const handleDelete = async (id: number) => {
//   try {
//     // 删除的二次确认
//     await message.delConfirm()
//     // 发起删除
//     await AlarmFaceMsgApi.deleteAlarmFaceMsg(id)
//     message.success(t('common.delSuccess'))
//     // 刷新列表
//     await getList()
//   } catch {}
// }

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await AlarmFaceMsgApi.exportAlarmFaceMsg(queryParams)
    download.excel(data, 'Face alarm.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
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

const oncheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
  const deviceIds = checkDeviceNodes
    .filter((node) => node.type === 'device')
    .map((node) => node.platformCameraId)
  queryParams.cameraIds = deviceIds
  console.log('formData.value.cameraIds ==', queryParams.cameraIds)
}

const chooseNotNull = (value) => {
  queryParams.cameraIds = value.flat(Infinity).filter((item) => item != undefined && item != null)
}

const init = async () => {
  await initLibraryOption()
  await initDeviceTree()
  await initTaskOptions()
  if (props.apiTaskId) {
    queryParams.apiAlarmIds = [props.apiTaskId]
  }
  getList()
}

const treeShow = ref(false)
const deviceText = ref('')
const checkNode = (data) => {
  queryParams.cameraIds = data.map((x) => x.value)
  deviceText.value = data.map((x) => x.name).join(',')
  treeShow.value = false
}

const cancelSelect = () => {
  treeShow.value = false
}

/** 初始化 **/
onMounted(() => {
  init()
})

watch(
  () => props.apiTaskId,
  (newVal) => {
    alert(props.apiTaskId)
  }
)
</script>
<style scoped>
.condition {
  /* box-shadow: var(--el-box-shadow-lighter); */
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
  width: 100%;
  display: grid;
  flex-wrap: wrap;
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
