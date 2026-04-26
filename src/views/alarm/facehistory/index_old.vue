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
                            <div class="person-name text-12px"> {{ o.albumPersonName }}</div>
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
import { ref, reactive, onMounted } from 'vue'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import { AlarmFaceMsgApi, AlarmFaceMsgVO } from '@/api/alarmfacemsg'
import { surOptionList as getLibraryOptionList } from '@/api/library'
import { AlarmTaskApi } from '@/api/alarmtask/face'
import AlarmFaceMsgForm from './AlarmFaceMsgForm.vue'
import StatusTag from '../StatusTag.vue'
import { ContentWrap } from '@/components/ContentWrap'
import { getPermissionDeviceTree } from '@/api/device'
import { defaultProps, defaultDataProps, handleTree } from '@/utils/tree'
import { tr } from 'element-plus/es/locale'
import { dataDiff } from '@/api/identity'
import { OfficeBuilding, VideoCamera } from '@element-plus/icons-vue'
import { string } from 'vue-types'
import { status } from 'nprogress'

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
  pageSize: 20,
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

.page-info {
  padding-left: 2px;
  height: 82.5vh;
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
