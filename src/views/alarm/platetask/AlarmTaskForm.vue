<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="task-dialog">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="150px"
      label-position="right"
      class="task-form"
    >
      <el-row :gutter="24">
        <!-- 左侧表单 -->
        <el-col :span="12">
          <div class="form-section-wrapper">
            <div class="form-section">
              <el-form-item label="Task Name" prop="strategyName">
                <el-input v-model="formData.strategyName" clearable class="form-input" />
              </el-form-item>

              <el-form-item label="Type" prop="type" v-show="false">
                <el-select
                  v-model="formData.type"
                  @change="handleTypeChange"
                  clearable
                  class="form-input"
                  placeholder="Select"
                >
                  <el-option
                    v-for="item in surveillanceTypes"
                    :key="item.code"
                    :label="item.value"
                    :value="item.code"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Select Device" prop="cameras">
                <el-tree
                  ref="deviceTreeRef"
                  :check-strictly="!checkStrictly"
                  :data="deviceOptions"
                  :props="defaultProps"
                  default-expand-all
                  empty-text="Loaded, please later"
                  node-key="id"
                  show-checkbox
                  @check-change="oncheck"
                />
              </el-form-item>

              <el-form-item label="Validity" prop="termType">
                <el-radio-group v-model="formData.termType">
                  <el-radio v-for="sv in termType" :key="sv.value" :value="sv.value">{{
                    sv.name
                  }}</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Status" prop="closed">
                <el-switch
                  v-model="formData.status"
                  :active-value="1"
                  :inactive-value="2"
                  active-text="Enable"
                  inactive-text="Disable"
                />
              </el-form-item>
              <el-form-item
                label="Validity period"
                prop="validityPeriod"
                v-if="formData.termType == 0"
              >
                <el-date-picker
                  v-model="formData.validityPeriod"
                  type="daterange"
                  range-separator="To"
                  start-placeholder="Start date"
                  end-placeholder="End date"
                  value-format="YYYY-MM-DD"
                  size="default"
                  class="form-input"
                />
              </el-form-item>
              <el-form-item label="Surveillance Time" prop="surveillanceTime">
                <div v-for="(item, index) in minuteList" :key="index" class="minute-row">
                  <el-time-picker
                    v-model="item.start"
                    :editable="false"
                    :clearable="false"
                    :disable-second="true"
                    format="HH:mm"
                    value-format="HH:mm"
                    size="default"
                    class="form-time-picker"
                    style="width: 130px"
                  />
                  ~
                  <el-time-picker
                    v-model="item.end"
                    :editable="false"
                    :clearable="false"
                    :disable-second="true"
                    format="HH:mm"
                    value-format="HH:mm"
                    size="default"
                    class="form-time-picker"
                    style="width: 130px"
                  />
                  <el-button type="primary" class="vms-main-button" @click="addMinute(1, 0)">add</el-button>
                  <el-button type="primary"  class="vms-main-button" @click="addMinute(2, index)">del</el-button>
                </div>
              </el-form-item>
              <el-form-item label="Select Library" prop="libraryId">
                <el-select
                  v-model="formData.albumList"
                  class="form-input"
                  placeholder="Library"
                  :multiple="true"
                >
                  <el-option
                    v-for="item in libraryOptions"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Threshold" prop="threshold">
                <el-slider
                  v-model="formData.threshold"
                  class="form-input"
                  placeholder="Threshold"
                />
              </el-form-item>
            </div>
          </div>
        </el-col>

        <!-- 右侧地图和经纬度 -->
        <el-col :span="12">
          <div class="map-container">
            <el-form-item label="Longitude" required class="coordinates">
              <div class="coordinates-inputs">
                <el-input
                  v-model="formData.longitude"
                  placeholder="Longitude"
                  clearable
                  class="coordinate-input"
                />
                <el-input
                  v-model="formData.latitude"
                  placeholder="Latitude"
                  clearable
                  class="coordinate-input"
                />
              </div>
            </el-form-item>

            <div class="map-wrapper">
              <MapComponent
                :longitude="formData.longitude"
                :latitude="formData.latitude"
                @update:longitude="(val) => (formData.longitude = val)"
                @update:latitude="(val) => (formData.latitude = val)"
              />
            </div>

            <div class="map-tip">
              <el-icon><InfoFilled /></el-icon>
              <span
                >Click on the map setting location or enter latitude and longitude directly</span
              >
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AlarmTaskApi, AlarmTaskVO } from '@/api/alarmtask/plate'
import MapComponent from './MapComponent.vue'
import { getPermissionDeviceTree } from '@/api/device'
import { defaultProps, defaultDataProps, handleTree } from '@/utils/tree'
import { de } from 'element-plus/es/locale'

/** face alarm 表单 */
defineOptions({ name: 'AlarmTaskForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const deviceOptions = ref<any[]>([]) //设备权限树
const checkStrictly = ref(true) // 是否严格模式，即父子不关联
const deviceTreeRef = ref()
const minuteList = ref([] as any[])

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  strategyName: '',
  type: 5,
  deptId: '',
  status: 1,
  validityPeriod: [] as string[],
  cameraIds: [] as string[],
  minutes: [] as string[],
  albumList: [] as string[],
  termType: 0,
  startTime: '',
  endTime: '',
  remark: '',
  longitude: '58.3392639',
  latitude: '23.598513',
  threshold: 0
})
const formRules = reactive({
  strategyName: [{ required: true, message: 'name cannot empty', trigger: 'blur' }],
  type: [{ required: true, message: 'type cannot empty', trigger: 'blur' }],
  // surveillanceTime: [
  //   {
  //     validator: (rule, value, callback) => {
  //       if (formData.value.termType == 0) {
  //         if (!formData.value.startTime || !formData.value.endTime) {
  //           callback(new Error('surveillanceTime cannot empty!'))
  //         } else {
  //           callback()
  //         }
  //       }
  //     },
  //     trigger: 'blur'
  //   }
  // ],
  threshold: [{ required: true, message: 'threshold cannot empty', trigger: 'blur' }]
})

const libraryOptions = ref([] as any[])

// 布控类型  1 人脸布控  2 车牌布控
const surveillanceTypes = reactive([
  { code: 1, value: 'Portrait Surveillance' },
  { code: 2, value: 'Vehicle Plate Surveillance' }
])

// 布控时长 1 临时布控 2 长期布控
const termType = reactive([
  {
    name: 'Temporary Surveillance',
    value: 0
  },
  {
    name: 'Long-term Surveillance',
    value: 1
  }
])

const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = 'New task'
  formType.value = type
  deviceOptions.value = await getPermissionDeviceTree()
  console.log('deviceOptions.value ===', deviceOptions.value)
  resetForm()

  //初始化监控库数据

  const sls = await AlarmTaskApi.getSurveillanceLibrary()
  libraryOptions.value = []
  for (const sl of sls.results) {
    libraryOptions.value.push({
      value: sl.album_id,
      name: sl.name
    })
  }

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await AlarmTaskApi.getAlarmTask(id)
      minuteList.value = []
      for (const min of formData.value.minutes) {
        const [start, end] = min.split(',')
        minuteList.value.push({ start: start, end: end })
      }
      // deviceTreeRef.value.setCheckedKeys([10], false)
      console.log('formData.value ===', formData.value)
      const checkedNodes = getTargetDeviceNodes(deviceOptions.value, formData.value.cameraIds)
      deviceTreeRef.value.setCheckedNodes(checkedNodes)
      console.log('checkedNodes ==== ', checkedNodes)
    } finally {
      formLoading.value = false
    }
  } else {
    minuteList.value.push({ start: '00:00', end: '23:59' })
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

function flattenTree(data) {
  const result = [] as any[]
  function traverse(nodes) {
    for (const node of nodes) {
      result.push(node)
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  traverse(data)
  return result
}

function getTargetDeviceNodes(treeData, includeIds: string[] = []) {
  const flatNodes = flattenTree(treeData)
  return flatNodes.filter(
    (node) => node.type === 'device' && includeIds.includes(node.platformCameraId)
  )
}

const oncheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
  const deviceIds = checkDeviceNodes
    .filter((node) => node.type === 'device')
    .map((node) => node.platformCameraId)
  formData.value.cameraIds = deviceIds
}

//增加分钟列
const addMinute = (type: number, index: number) => {
  //增加
  if (type == 1) {
    if (minuteList.value.length > 4) {
      message.alert('Cannot greater than 5!')
      return
    }
    minuteList.value.push({ start: '00:00', end: '23:59' })
  } else if (type == 2) {
    //删除
    // if ((minuteList.value.length = 1)) {
    //   return
    // }
    minuteList.value.splice(index, 1)
  }
}
//减少分钟列

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  //处理分钟数
  processMinutes()
  try {
    const data = formData.value
    if (data.cameraIds.length == 0) {
      message.alertWarning('Cameras can not be empty!')
      return
    }

    if (data.albumList.length == 0) {
      message.alertWarning('Library can not be empty!')
      return
    }

    if (formType.value === 'create') {
      await AlarmTaskApi.createAlarmTask(data)
      message.success(t('common.createSuccess'))
    } else {
      await AlarmTaskApi.updateAlarmTask(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const processMinutes = () => {
  // formData.value.minutes = minuteList.value
  for (const item of minuteList.value) {
    //用作尖峰
    // const [hours, minutes] = item.start.split(':').map(Number)
    // const [hours2, minutes2] = item.end.split(':').map(Number)
    // const loopMinutes = hours * 60 + minutes + ',' + (hours2 * 60 + minutes2)\
    //用作洞见
    const loopMinutes = item.start + ',' + item.end
    console.log('loopMinutes ==', loopMinutes)
    formData.value.minutes.push(loopMinutes)
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    strategyName: '',
    type: '',
    deptId: '',
    status: 1,
    validityPeriod: [] as string[],
    cameraIds: [] as string[],
    minutes: [] as string[],
    albumList: [] as string[],
    termType: 1,
    startTime: '',
    endTime: '',
    remark: '',
    longitude: '58.339263',
    latitude: '23.598513',
    threshold: 0
  }
  formRef.value?.resetFields()
}

const handleTypeChange = () => {}
</script>
<style scoped lang="scss">
.form-section-wrapper {
  height: 560px; /* 控制左侧滚动区域高度 */
  overflow-y: auto;
  padding-right: 12px;
  .form-input {
    width: 100%;
  }
}

.task-dialog {
  .el-dialog__body {
    padding: 20px;
    max-height: 600px; /* 根据你的实际需求调整 */
    overflow: hidden; /* 避免整体滚动 */
    display: flex;
    flex-direction: column;
  }

  .task-form {
    flex: 1;
    overflow: hidden;
    .form-section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-tip {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
      line-height: 1.5;
    }

    .storage-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .storage-ttl {
        display: flex;
        align-items: center;

        span {
          font-size: 12px;
          color: #666;
          margin-right: 8px;
        }

        .el-select {
          width: 90px;
        }
      }
    }

    .low-quality {
      margin-top: 10px;
    }
  }

  .map-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .coordinates {
      margin-bottom: 10px;

      .coordinates-inputs {
        display: flex;
        gap: 10px;

        .coordinate-input {
          flex: 1;
        }
      }
    }

    .map-wrapper {
      height: 50vh;
      width: 100%;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      overflow: hidden;
    }

    .map-tip {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      display: flex;
      align-items: center;

      .el-icon {
        margin-right: 5px;
        font-size: 14px;
      }
    }
  }

  .dialog-footer {
    text-align: right;
    padding: 10px 20px;
    border-top: 1px solid #e6e6e6;
  }
}
</style>
