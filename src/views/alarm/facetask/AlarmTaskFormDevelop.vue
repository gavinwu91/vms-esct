<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="task-dialog" v-loading="formLoading">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="150px"
      label-position="left"
      class="task-form"
      v-loading="formLoading"
      element-loading-text="Saving"
    >
      <el-row :gutter="24">
        <!-- 左侧表单 -->
        <el-col :span="12">
          <div class="form-section-wrapper">
            <div class="form-section">
              <div style="width: 20%">
                <el-steps
                  :active="activeStep"
                  finish-status="success"
                  direction="vertical"
                  style="width: 180px; height: 56vh"
                >
                  <el-step description="Base information" />
                  <el-step description="Select Control Object" />
                  <el-step description="Control Range" />
                </el-steps>
              </div>
              <div style="width: 90%; padding-left: 2%">
                <div class="step1" v-show="activeStep == 0" style="height: 95%">
                  <el-form-item label="Task name" prop="strategyName">
                    <el-input v-model="formData.strategyName" clearable class="form-input" />
                  </el-form-item>
                  <el-form-item label="Status" prop="closed">
                    <el-switch
                      v-model="formData.status"
                      :active-value="1"
                      :inactive-value="0"
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: red"
                    />
                  </el-form-item>
                  <el-form-item label="validity" prop="termType">
                    <el-radio-group v-model="formData.termType">
                      <el-radio v-for="sv in termType" :key="sv.value" :value="sv.value">{{
                        sv.name
                      }}</el-radio>
                    </el-radio-group>
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
                      <div
                        style="
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          height: 35px;
                        "
                      >
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
                        <!-- <el-button type="primary" @click="addMinute(1, 0)">add</el-button>
                      <el-button type="danger" @click="addMinute(2, index)">del</el-button> -->
                        &nbsp;&nbsp;
                        <el-icon
                          @click="addMinute(1, 0)"
                          size="25"
                          color="green"
                          style="cursor: pointer"
                          ><CirclePlus
                        /></el-icon>
                        &nbsp;&nbsp;
                        <el-icon
                          @click="addMinute(2, index)"
                          size="25"
                          color="red"
                          style="cursor: pointer"
                          v-show="index != 0"
                          ><Remove
                        /></el-icon>
                      </div>
                    </div>
                  </el-form-item>
                </div>
                <div
                  class="step2"
                  v-show="activeStep == 1"
                  style="height: 95%; width: 90%; padding-left: 2%"
                >
                  <el-form-item label="Surveillance method" size="normal" label-width="180px">
                    <el-radio-group
                      v-model="formData.surveillanceMethod"
                      @change="surveillanceMethodChange"
                    >
                      <el-radio :key="1" :label="1">
                        Target Surveillance({{ uploadImageCount }}/10)
                      </el-radio>
                      <el-radio :key="2" :label="2"> Database Surveillance </el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="Deployment Threshold" prop="threshold" label-width="180px">
                    <el-slider
                      v-model="formData.threshold"
                      class="form-input"
                      placeholder="Threshold"
                      show-input
                      size="small"
                    />
                  </el-form-item>
                  <!-- <el-form-item v-show="formData.surveillanceMethod == 1">
                    <el-image
                      v-if="imageInfo.defaultImage"
                      :src="imageInfo.defaultImage"
                      style="width: 252px; cursor: pointer"
                      @click="previewImage"
                      :preview-src-list="imageInfo.previewList"
                    />
                  </el-form-item> -->
                  <div>
                    <UploadImage
                      v-if="formData.surveillanceMethod == 1"
                      ref="uploadRef"
                      :imageUrls="formData.imageUrls"
                      :key="uploadImageKey"
                      @change-upload-image-count="changeUploadImageCount"
                    />
                  </div>

                  <el-form-item
                    label="Select a library"
                    prop="libraryId"
                    v-if="formData.surveillanceMethod == 2"
                  >
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
                </div>
                <div class="step3" v-show="activeStep == 2" style="width: 100%; height: 54vh">
                  <el-form-item label="Select device" prop="cameras">
                    <div class="h-58vh overflow-auto">
                      <el-input v-model="cameraTreeFilter" placeholder="Filter" clearable />
                      <el-tree
                        ref="deviceTreeRef"
                        class="!w-42vh"
                        :props="defaultProps"
                        :load="loadNodes"
                        empty-text="Loaded, please later"
                        node-key="key"
                        lazy
                        show-checkbox
                        @check-change="oncheck"
                        :filter-node-method="filterNode"
                        :key="treeKey"
                      >
                        <template #default="{ node, data }">
                          <span class="tree-node">
                            <el-icon v-if="data.type === 'device'" class="tree-icon" color="purple">
                              <VideoCamera />
                            </el-icon>
                            <el-icon v-else class="tree-icon" color="green">
                              <OfficeBuilding />
                            </el-icon>
                            <span>{{ node.label }}</span>
                            <span v-if="data.type === 'camera'" class="status-indicator"></span>
                          </span>
                        </template>
                      </el-tree>
                    </div>
                  </el-form-item>
                </div>

                <el-button
                  class="vms-track-button"
                  v-show="activeStep > 0"
                  type="primary"
                  size="default"
                  @click="changeStep('sub')"
                  style="float: left"
                  >Back</el-button
                >
                <el-button
                  type="primary"
                  size="default"
                  class="vms-main-button"
                  @click="changeStep('add')"
                  style="float: right"
                  v-show="activeStep < 2"
                  >{{ nextStepText }}</el-button
                >
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧地图和经纬度 -->
        <el-col :span="12">
          <div class="map-container">
            <div class="map-wrapper">
              <MapComponent
                :alarmType="3"
                @select-tree-camera="selectTreeCamera"
                :controlStep="activeStep"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        @click="submitForm2"
        type="primary"
        v-show="activeStep == 2"
        :disabled="formLoading"
        >Confirm</el-button
      >
      <el-button @click="cancelForm" :disabled="formLoading">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AlarmTaskApi } from '@/api/alarmtask/face'
import MapComponent from './MapComponent3.vue'
import { getPermissionDeviceTree, loadCameraTree, getParentArea } from '@/api/device'
import { defaultProps, defaultDataProps, handleTree } from '@/utils/tree'
import { getPermissionDeviceList } from '@/api/device/index'
import { surOptionList } from '@/api/library/index'
import UploadImage from './UploadImage.vue'
import { CirclePlus, Remove, VideoCamera, OfficeBuilding } from '@element-plus/icons-vue'
import type { LoadFunction, TreeInstance, FilterNodeMethodFunction } from 'element-plus'
/** face alarm 表单 */
defineOptions({ name: 'AlarmTaskForm' })

const cameraTreeFilter = ref('')
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const activeStep = ref(0)
const nextStepText = ref('Next')
const deviceOptions = ref<any[]>([]) //设备权限树
const checkStrictly = ref(true) // 是否严格模式，即父子不关联
const deviceTreeRef = ref<TreeInstance>()
const minuteList = ref([] as any[])
const showMap = ref(false)
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const treeKey = ref(0)

// 上传图片组件信息
const uploadRef = ref(null)

const imageInfo = ref({
  defaultImage: '/vms/public/default_face.png',
  faceFile: undefined,
  previewList: []
})
const uploadImageCount = ref(0)
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  strategyName: '',
  type: 1,
  deptId: '',
  status: 1,
  surveillanceMethod: 1,
  validityPeriod: [] as string[],
  cameraIds: [] as string[],
  minutes: [] as string[],
  albumList: [] as string[],
  termType: 0,
  startTime: '',
  endTime: '',
  remark: '',
  longitude: '58.339263',
  latitude: '23.598513',
  threshold: 60,
  imageUrls: []
})

const formRules = reactive({
  // strategyName: [{ required: true, message: 'Task name cannot empty', trigger: 'blur' }],
})

const libraryOptions = ref([] as any[])

const uploadImageKey = ref(0)

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
  treeKey.value++
  activeStep.value = 0
  dialogVisible.value = true
  dialogTitle.value = 'New task'
  uploadImageKey.value++
  formType.value = type
  showMap.value = true
  resetForm()

  //初始化监控库数据

  const sls = await surOptionList({ isShow: 1 })
  console.log('sls ===== ', sls)
  libraryOptions.value = []
  for (const sl of sls) {
    libraryOptions.value.push({
      value: sl.platformLibraryId,
      name: sl.libraryName
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
      console.log('formData.value ===', formData.value)
      getParentArea({ cameraIds: formData.value.cameraIds }).then((areaParentIdArr) => {
        console.log('getParentArea ======== ', areaParentIdArr)
        expandTreeByAare(areaParentIdArr, formData.value.cameraIds)
        uploadImageKey.value++
      })
    } finally {
      formLoading.value = false
    }
  } else {
    uploadImageKey.value++
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

const oncheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
  const deviceIds = checkDeviceNodes.filter((node) => node.type === 'device').map((node) => node.id)
  formData.value.cameraIds = deviceIds
  console.log(
    'checkDeviceNodes, formData.value.cameraIds ===== ',
    checkDeviceNodes,
    formData.value.cameraIds
  )
}

const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: 3, areaId: node.data.id }).then((res) => {
      console.log('loadCameraTree ========= ', res)
      return resolve(res)
    })
  }
  return reject([])
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
    if (minuteList.value.length == 1) {
      return
    }
    minuteList.value.splice(index, 1)
  }
}

//减少分钟列

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const validForm = () => {
  if (formData.value.strategyName == '') {
    ElMessage.warning('Task name is required!')
    return false
  }
  const fileList = uploadRef.value?.fileList
  //如果surveillanceMethod == 1  是上传图片告警,如果是上传图片告警，file为空则不能提交
  if (formData.value.surveillanceMethod == 1) {
    if (fileList.length == 0) {
      ElMessage.warning('File image is required!')
      return false
    }
  } else {
    if (formData.value.albumList.length == 0) {
      ElMessage.warning('Library is required!')
      return false
    }
  }
  if (formData.value.threshold == 0) {
    ElMessage.warning('Threshold must greater than 0!')
    return false
  }

  if (formData.value.cameraIds.length == 0) {
    ElMessage.warning('Cameras is required!')
    return false
  }
  return true
}

const submitForm2 = async () => {
  // 校验表单
  if (!validForm()) return
  try {
    const formDataSend = new FormData()
    const fileList = uploadRef.value?.fileList
    if (formData.value.surveillanceMethod == 1) {
      console.log('fileList ========= ', fileList)
      fileList.forEach((f) => {
        formDataSend.append('files', f.raw)
      })
    }
    console.log('formDataSend ====== ', formDataSend)
    // 提交请求
    formLoading.value = true
    //处理分钟数
    processMinutes()

    formDataSend.append(
      'data',
      new Blob([JSON.stringify(formData.value)], { type: 'application/json' })
    )
    console.log('formDataSend ========= ', formDataSend)
    if (formType.value === 'create') {
      AlarmTaskApi.uploadAlarmTask(formDataSend).then((res) => {
        cancelForm()
        formLoading.value = false
        ElMessage.success(t('common.createSuccess'))
        // 发送操作成功的事件
        emit('success')
      })
    } else {
      AlarmTaskApi.updateAlarmTask(formDataSend).then((res) => {
        cancelForm()
        formLoading.value = false
        ElMessage.success(t('common.updateSuccess'))
        // 发送操作成功的事件
        emit('success')
      })
    }
  } catch (err) {
    ElMessage.error(err)
    formLoading.value = false
  }
}

const cancelForm = () => {
  activeStep.value = 0
  dialogVisible.value = false
  resetForm()
}

const processMinutes = () => {
  // formData.value.minutes = minuteList.value
  formData.value.minutes = []
  for (const item of minuteList.value) {
    //用作尖峰
    // const [hours, minutes] = item.start.split(':').map(Number)
    // const [hours2, minutes2] = item.end.split(':').map(Number)
    // const loopMinutes = hours * 60 + minutes + ',' + (hours2 * 60 + minutes2)\
    //用作洞鉴
    const loopMinutes = item.start + ',' + item.end
    console.log('loopMinutes ==', loopMinutes)
    formData.value.minutes.push(loopMinutes)
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    surveillanceMethod: 1,
    strategyName: '',
    type: 1,
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
    threshold: 60,
    imageUrls: []
  }
  formRef.value?.resetFields()
  minuteList.value = []
}

const selectTreeCamera = (camera) => {
  treeKey.value++
  //将之前的cameraTree重置
  loadCameraTree({ cameraType: 3, areaId: 0 }).then((res) => {
    // deviceOptions.value = res
    console.log('camera =======', camera)
    const seen = new Set()
    const areaParentIdArr = camera.map((x) => x.areaId).filter((n) => !seen.has(n) && seen.add(n))
    const cameraIdArr = camera.map((x) => x.id)

    //获取全部areaID的父级id并展开
    getParentArea({ areaIds: areaParentIdArr }).then((res) => {
      console.log('getParentArea ======== ', res)
      expandTreeByAare(res, cameraIdArr)
    })
  })
}

const expandTreeByAare = async (res, cameraIdArr) => {
  let node = null
  const leafAareas = res.filter((s) => s.parentId != null)
  const rootArea = res.find((s) => s.parentId == null)

  //2 b
  //根节点
  if (!rootArea) return
  const rootNode = deviceTreeRef.value.getNode('region_' + rootArea.id)
  if (!rootNode) return
  await expandNodeAndWait(rootNode)

  console.log('leafAareas ======= ', leafAareas)
  //叶子节点
  for (const area of leafAareas) {
    setTimeout(() => 1000)
    const id = area.id

    let leafNode = deviceTreeRef.value.getNode('region_' + id)
    console.log(' 当前leafNode ======= ', leafNode)
    if (!leafNode) continue
    await expandNodeAndWait(leafNode)
  }

  await nextTick()

  for (const id of cameraIdArr) {
    const node = deviceTreeRef.value.getNode('device_' + id)
    if (node) node.setChecked(true, true)
  }

  //2 e

  //1 b
  // rootNode.expand()
  // node = rootNode
  // for (const item of leafAareas) {
  //   const id = item.id
  //   console.log(" expand id ======",id)
  //   let leafNode = deviceTreeRef.value.getNode(id)
  //   if (!leafNode && node) {
  //     node.expand()
  //     await new Promise((resolve) => {
  //       const timer = setInterval(() => {
  //         if (node.loaded) {
  //           clearInterval(timer)
  //           resolve(2)
  //         }
  //       }, 100)
  //     })
  //     leafNode = deviceTreeRef.value.getNode(id)
  //   }
  //   if (leafNode && !leafNode.expanded) {
  //       console.log("id,leafNode===========",id,leafNode)
  //       leafNode.expand()
  //       if(!leafNode.expanded){
  //         leafNode.loaded = false
  //         leafNode.expand()
  //       }
  //   }

  //   node = leafNode
  // }

  // console.log("deviceoptions ==== " ,deviceOptions.value)
  // console.log("deviceTreeRef.value.store.root.childNodes",deviceTreeRef.value.store.root.childNodes)
  // for(const id of areaIdArr){
  //   const node = deviceTreeRef.value.getNode(id)
  //   if(node) node.setChecked(true,true)
  // }
  //1 e
}

async function expandNodeAndWait(node) {
  if (!node) return
  if (node.loaded && node.expanded) return

  //展开节点
  node.expand()

  await new Promise((resolve) => {
    const checkLoaded = () => {
      if (node.loaded) resolve(true)
      else setTimeout(checkLoaded, 100)
    }
    checkLoaded()
  })
}

const changeStep = (type) => {
  if (type == 'add' && activeStep.value < 2) {
    activeStep.value++
  } else if (type == 'sub' && activeStep.value > 0) {
    activeStep.value--
  }
}

const changeUploadImageCount = (count) => {
  uploadImageCount.value = count
}

const surveillanceMethodChange = (value) => {
  if (value == 2) {
    uploadImageCount.value = 0
  }
}

watch(cameraTreeFilter, (val) => {
  deviceTreeRef.value!.filter(val)
})

const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}
</script>
<style scoped lang="scss">
.form-section-wrapper {
  background-color: #f9f9f9;
  height: 60vh; /* 控制左侧滚动区域高度 */
  overflow-y: auto;
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
      padding: 10px 5px;

      border-radius: 4px;
      display: flex;
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
      height: 100%;
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
::v-deep .el-form-item__label {
  font-size: 14px;
}
::v-deep .el-form-item__content {
  background: #fff;
}
</style>
