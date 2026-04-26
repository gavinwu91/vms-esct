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

              <el-form-item label="Vehicle No." prop="carNumber">
                <el-input v-model="formData.carNumber" clearable class="form-input" />
              </el-form-item>
              <el-form-item label="Select Device" prop="cameras">
                <div style="overflow: auto; ">
                  <el-tree
                    ref="deviceTreeRef"
                    class="!w-54vh !h-28vh"
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

                  <!-- <el-tree
                    ref="deviceTreeRef"
                    style="width: 20rem"
                    :check-strictly="!checkStrictly"
                    :data="deviceOptions"
                    :props="defaultProps"
                    default-expand-all
                    empty-text="Loaded, please later"
                    node-key="id"
                    show-checkbox
                    @check-change="oncheck"
                    @node-collapse="onNodeCollapse"
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
                  </el-tree> -->
                </div>
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
                  :inactive-value="0"
                  active-text="Enable"
                  inactive-text="Disable"
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: red"
                />
              </el-form-item>
              <el-form-item
                label="Surveillance Time"
                prop="surveillanceTime"
                v-if="formData.termType == 0"
              >
                <el-date-picker
                  v-model="formData.validityPeriod"
                  type="datetimerange"
                  range-separator="To"
                  start-placeholder="Start date"
                  end-placeholder="End date"
                  value-format="YYYY-MM-DD hh:mm:ss"
                  size="default"
                  class="form-input"
                />
              </el-form-item>
            </div>
          </div>
        </el-col>

        <!-- 右侧地图和经纬度 -->
        <el-col :span="12">
          <div class="map-container">
            <div class="map-wrapper">
              <!-- :cameras="cameras"
                v-if="showMap" -->
              <MapComponent :alarmType="4" @select-tree-camera="selectTreeCamera" />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" class="vms-main-button" :disabled="formLoading"
        >Confirm</el-button
      >
      <el-button @click="dialogVisible = false" class="vms-cancel-button" :disabled="formLoading"
        >Cancel</el-button
      >
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AlarmTaskApi } from '@/api/alarmtask/plate'
import MapComponent from '../MapComponent3.vue'
import { getPermissionDeviceTree, loadCameraTree, getParentArea } from '@/api/device'
import { defaultProps, defaultDataProps, handleTree } from '@/utils/tree'
import { updateStatus } from '@/api/mall/product/spu'
import { number } from 'vue-types'
import { getPermissionDeviceList } from '@/api/device/index'
import { VideoCamera, OfficeBuilding } from '@element-plus/icons-vue'
import type { LoadFunction, TreeInstance, FilterNodeMethodFunction } from 'element-plus'
/** face alarm 表单 */
defineOptions({ name: 'AlarmPlateTaskForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const cameraTreeFilter = ref('')
const treeKey = ref(0)
const deviceOptions = ref<any[]>([]) //设备权限树
const checkStrictly = ref(true) // 是否严格模式，即父子不关联
const deviceTreeRef = ref<TreeInstance>()
const cameras = ref([] as any[])
const showMap = ref(false)
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  strategyName: '',
  carNumber: '',
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
  longitude: '58.339263',
  latitude: '23.598513',
  threshold: 0,
  updateType: 1
})
const formRules = reactive({
  strategyName: [{ required: true, message: 'TaskName cannot empty', trigger: 'blur' }],
  carNumber: [{ required: true, message: 'Vehicle No. cannot empty', trigger: 'blur' }]
})

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
  resetForm()
  dialogVisible.value = true
  dialogTitle.value = 'New task'
  formType.value = type
  deviceOptions.value = await getPermissionDeviceTree({ cameraType: 4 })
  console.log('deviceOptions.value ===', deviceOptions.value)

  getPermissionDeviceList({ cameraType: 4 }).then((data) => {
    cameras.value = data.map((a) => {
      return {
        longitude: a.longitude,
        latitude: a.latitude,
        platformCameraId: a.id
      }
    })
    showMap.value = true
  })

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await AlarmTaskApi.getAlarmTask(id)
      // deviceTreeRef.value.setCheckedKeys([10], false)
      // console.log('formData.value ===', formData.value)
      // const checkedNodes = getTargetDeviceNodes(deviceOptions.value, formData.value.cameraIds)
      // deviceTreeRef.value.setCheckedNodes(checkedNodes)
      // console.log('checkedNodes ==== ', checkedNodes)

      getParentArea({ cameraIds: formData.value.cameraIds }).then((areaParentIdArr) => {
        console.log('getParentArea ======== ', areaParentIdArr)
        expandTreeByAare(areaParentIdArr, formData.value.cameraIds)
      })

    } finally {
      formLoading.value = false
    }
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
  return flatNodes.filter((node) => node.type === 'device' && includeIds.includes(node.id))
}

const oncheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
  const deviceIds = checkDeviceNodes.filter((node) => node.type === 'device').map((node) => node.id)
  formData.value.cameraIds = deviceIds
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  const data = await AlarmTaskApi.getAlarmTaskPage({ carNumber: formData.value.carNumber })
  if (data.total > 0) {
    formData.value.carNumber = ''
    message.alertError('Already have vehicle No.')
    return
  }

  // 校验表单
  await formRef.value.validate()

  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value
    if (data.cameraIds.length == 0) {
      message.alertWarning('Cameras can not be empty!')
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
/** 重置表单 */
const resetForm = () => {
  formData.value = {
    strategyName: '',
    carNumber: '',
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
    longitude: '58.339263',
    latitude: '23.598513',
    threshold: 0,
    updateType: 1
  }
  formRef.value?.resetFields()
}

const handleTypeChange = () => {}

/** method */
const onNodeCollapse = (data, node) => {
  if (data.id == 7) {
    deviceTreeRef.value.expandeNode(data)
  }
}

const selectTreeCamera = (camera) => {
  // const checkedNodes = getTargetDeviceNodes(deviceOptions.value, cameraIds)
  // deviceTreeRef.value.setCheckedNodes(checkedNodes)
  // formData.value.cameraIds = cameraIds
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

const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: 4, areaId: node.data.id }).then((res) => {
      console.log('loadCameraTree ========= ', res)
      return resolve(res)
    })
  }
  return reject([])
}

watch(cameraTreeFilter, (val) => {
  deviceTreeRef.value!.filter(val)
})

const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}

/** method */
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
::v-deep .el-form-item__content {
  background: #fff;
}
</style>
