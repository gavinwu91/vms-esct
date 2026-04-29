<template>
  <Dialog 
    v-model="dialogVisible" 
    class="task-add-dialog-custom" 
    v-loading="formLoading"
    :show-close="false"
    width="1200px"
  >
    <div class="wizard-container">
      <!-- Header: 车辆布控向导页眉 -->
      <header class="wizard-header">
        <div class="header-main">
          <div class="header-icon-box"><el-icon><Plus /></el-icon></div>
          <div class="header-title">
            <h3>{{ dialogTitle }}</h3>
            <p>Configure license plate recognition and vehicle monitoring parameters</p>
          </div>
        </div>
        <div class="header-ext">
          <div class="step-count">STEP <span>{{ activeStep + 1 }}</span> OF 3</div>
          <button class="close-wizard" @click="dialogVisible = false"><el-icon><Close /></el-icon></button>
        </div>
      </header>

      <div class="wizard-content">
        <!-- Sidebar: 时间轴进度 -->
        <aside class="timeline-sidebar">
          <div class="timeline-item" :class="{ active: activeStep === 0, done: activeStep > 0 }">
            <div class="dot"><el-icon v-if="activeStep > 0"><Check /></el-icon><span v-else>1</span></div>
            <div class="text"><h4>Basic Info</h4><p>Target vehicle</p></div>
            <div class="line"></div>
          </div>
          <div class="timeline-item" :class="{ active: activeStep === 1, done: activeStep > 1 }">
            <div class="dot"><el-icon v-if="activeStep > 1"><Check /></el-icon><span v-else>2</span></div>
            <div class="text"><h4>Schedule</h4><p>Validity period</p></div>
            <div class="line"></div>
          </div>
          <div class="timeline-item" :class="{ active: activeStep === 2, done: activeStep > 2 }">
            <div class="dot"><span>3</span></div>
            <div class="text"><h4>Deployment</h4><p>Camera selection</p></div>
          </div>

          <div class="active-tree-panel" v-if="activeStep === 2">
            <div class="panel-label">Device Filter</div>
            <el-input v-model="cameraTreeFilter" placeholder="Filter devices..." clearable size="small" class="cyber-input-mini" />
          </div>
        </aside>

        <!-- Main Work Area -->
        <main class="wizard-main-area">
          <el-row :gutter="0" style="height: 100%">
            <!-- 表单区域 -->
            <el-col :span="12" class="form-col">
              <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-position="top"
                class="cyber-form-scroll"
              >
                <!-- Step 1: Basic -->
                <div v-show="activeStep == 0">
                  <el-form-item label="Task Name" prop="strategyName">
                    <el-input v-model="formData.strategyName" placeholder="Enter vehicle task name..." />
                  </el-form-item>
                  
                  <el-form-item label="Vehicle No. (Target)" prop="carNumber">
                    <el-input v-model="formData.carNumber" placeholder="E.g. OM-12345" />
                  </el-form-item>

                  <el-form-item label="Initial Status">
                    <el-switch
                      v-model="formData.status"
                      :active-value="1"
                      :inactive-value="0"
                      active-text="Enabled"
                      inactive-text="Disabled"
                    />
                  </el-form-item>
                </div>

                <!-- Step 2: Schedule -->
                <div v-show="activeStep == 1">
                  <el-form-item label="Surveillance Strategy">
                    <el-radio-group v-model="formData.termType" class="cyber-radio-group full-width">
                      <el-radio-button v-for="sv in termType" :key="sv.value" :label="sv.value">
                        {{ sv.name }}
                      </el-radio-button>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="Effective Period" v-if="formData.termType == 0">
                    <el-date-picker
                      v-model="formData.validityPeriod"
                      type="datetimerange"
                      style="width: 100%"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      range-separator="To"
                    />
                  </el-form-item>

                  <div class="info-note">
                    <el-icon><Compass /></el-icon>
                    <span>Long-term surveillance does not require a fixed end date.</span>
                  </div>
                </div>

                <!-- Step 3: Deployment -->
                <div v-show="activeStep == 2" class="device-tree-area">
                  <el-form-item label="Select Surveillance Devices">
                    <div class="tree-wrapper">
                      <el-tree
                        ref="deviceTreeRef"
                        :props="defaultProps"
                        :load="loadNodes"
                        node-key="key"
                        lazy
                        show-checkbox
                        @check-change="oncheck"
                        :filter-node-method="filterNode"
                        :key="treeKey"
                      >
                        <template #default="{ node, data }">
                          <span class="tree-node">
                            <el-icon v-if="data.type === 'device'" class="tree-icon" color="#a855f7"><VideoCamera /></el-icon>
                            <el-icon v-else class="tree-icon" color="#10b981"><OfficeBuilding /></el-icon>
                            <span>{{ node.label }}</span>
                          </span>
                        </template>
                      </el-tree>
                    </div>
                  </el-form-item>
                </div>
              </el-form>

              <!-- Footer Navigation -->
              <footer class="wizard-footer">
                <button class="btn-secondary" v-show="activeStep > 0" @click="activeStep--">Back</button>
                <div class="flex-spacer"></div>
                <button class="btn-primary" v-show="activeStep < 2" @click="activeStep++">Next Phase</button>
                <button class="btn-primary btn-submit" v-show="activeStep == 2" @click="submitForm">Validate & Deploy</button>
              </footer>
            </el-col>

            <!-- Map Area -->
            <el-col :span="12" class="map-col">
              <div class="map-container-inner">
                <MapComponent :alarmType="4" @select-tree-camera="selectTreeCamera" />
              </div>
            </el-col>
          </el-row>
        </main>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { AlarmTaskApi } from '@/api/alarmtask/plate'
import MapComponent from '../MapComponent3.vue'
import { getPermissionDeviceTree, loadCameraTree, getParentArea } from '@/api/device'
import { defaultProps, defaultDataProps, handleTree } from '@/utils/tree'
import { getPermissionDeviceList } from '@/api/device/index'
import { VideoCamera, OfficeBuilding, Plus, Close, Check, Compass } from '@element-plus/icons-vue'
import type { LoadFunction, TreeInstance, FilterNodeMethodFunction } from 'element-plus'

/** plate alarm 表单 */
defineOptions({ name: 'AlarmPlateTaskForm' })

const { t } = useI18n() 
const message = useMessage() 
const cameraTreeFilter = ref('')
const treeKey = ref(0)
const deviceTreeRef = ref<TreeInstance>()
const dialogVisible = ref(false) 
const dialogTitle = ref('') 
const activeStep = ref(0)
const formLoading = ref(false) 
const formType = ref('') 
const formData = ref({
  strategyName: '', carNumber: '', type: 5, deptId: '', status: 1,
  validityPeriod: [] as string[], cameraIds: [] as string[], minutes: [] as string[],
  albumList: [] as string[], termType: 0, startTime: '', endTime: '',
  remark: '', longitude: '58.339263', latitude: '23.598513', threshold: 0, updateType: 1
})

const formRules = reactive({
  strategyName: [{ required: true, message: 'Task Name is required', trigger: 'blur' }],
  carNumber: [{ required: true, message: 'Vehicle No. is required', trigger: 'blur' }]
})

const termType = reactive([
  { name: 'Temporary', value: 0 },
  { name: 'Long-term', value: 1 }
])

const formRef = ref() 

const open = async (type: string, id?: number) => {
  resetForm()
  activeStep.value = 0
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? 'New Vehicle Task' : 'Modify Vehicle Task'
  formType.value = type
  
  if (id) {
    formLoading.value = true
    try {
      formData.value = await AlarmTaskApi.getAlarmTask(id)
      getParentArea({ cameraIds: formData.value.cameraIds }).then((areaParentIdArr) => {
        expandTreeByAare(areaParentIdArr, formData.value.cameraIds)
      })
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) 

const oncheck = () => {
  const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
  formData.value.cameraIds = checkDeviceNodes.filter((node) => node.type === 'device').map((node) => node.id)
}

const submitForm = async () => {
  if (formType.value === 'create') {
    const checkData = await AlarmTaskApi.getAlarmTaskPage({ carNumber: formData.value.carNumber })
    if (checkData.total > 0) {
      message.alertError('Vehicle No. already exists in another task!')
      return
    }
  }

  await formRef.value.validate()
  if (formData.value.cameraIds.length == 0) {
    message.alertWarning('Please select at least one camera!')
    return
  }

  formLoading.value = true
  try {
    const apiCall = formType.value === 'create' ? AlarmTaskApi.createAlarmTask : AlarmTaskApi.updateAlarmTask
    await apiCall(formData.value)
    message.success(t(`common.${formType.value}Success`))
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    strategyName: '', carNumber: '', type: 5, deptId: '', status: 1,
    validityPeriod: [], cameraIds: [], minutes: [], albumList: [], termType: 0,
    startTime: '', endTime: '', remark: '', longitude: '58.339263', latitude: '23.598513',
    threshold: 0, updateType: 1
  }
  formRef.value?.resetFields()
}

const emit = defineEmits(['success'])

const selectTreeCamera = (camera) => {
  treeKey.value++
  loadCameraTree({ cameraType: 3, areaId: 0 }).then(() => {
    const seen = new Set()
    const areaParentIdArr = camera.map((x) => x.areaId).filter((n) => !seen.has(n) && seen.add(n))
    const cameraIdArr = camera.map((x) => x.id)
    getParentArea({ areaIds: areaParentIdArr }).then((res) => expandTreeByAare(res, cameraIdArr))
  })
}

const expandTreeByAare = async (res, cameraIdArr) => {
  const leafAareas = res.filter((s) => s.parentId != null)
  const rootArea = res.find((s) => s.parentId == null)
  if (!rootArea) return
  const rootNode = deviceTreeRef.value.getNode('region_' + rootArea.id)
  if (!rootNode) return
  await expandNodeAndWait(rootNode)
  for (const area of leafAareas) {
    let leafNode = deviceTreeRef.value.getNode('region_' + area.id)
    if (leafNode) await expandNodeAndWait(leafNode)
  }
  await nextTick()
  for (const id of cameraIdArr) {
    const node = deviceTreeRef.value.getNode('device_' + id)
    if (node) node.setChecked(true, true)
  }
}

async function expandNodeAndWait(node) {
  if (!node || (node.loaded && node.expanded)) return
  node.expand()
  await new Promise((resolve) => {
    const checkLoaded = () => node.loaded ? resolve(true) : setTimeout(checkLoaded, 100)
    checkLoaded()
  })
}

const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: 4, areaId: node.data.id }).then((res) => resolve(res))
  } else { reject([]) }
}

watch(cameraTreeFilter, (val) => deviceTreeRef.value!.filter(val))
const filterNode: FilterNodeMethodFunction = (value, data) => value ? data.name.includes(value) : true
</script>

<style scoped lang="scss">
/* Wizard Container & Header */
.task-add-dialog-custom {
  :deep(.el-dialog) { 
    background: transparent !important; box-shadow: none !important; border: none !important; 
    .el-dialog__header { display: none !important; }
    .el-dialog__body { padding: 0 !important; background: transparent !important; } 
  }
}

.wizard-container {
  width: 1200px; height: 750px; background: var(--vms-main-bg); border: 1px solid var(--vms-content-border); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
}

.wizard-header {
  padding: 20px 30px; background: var(--vms-card-bg); border-bottom: 1px solid var(--vms-content-border); display: flex; justify-content: space-between; align-items: center;
  .header-main { display: flex; gap: 20px; align-items: center; .header-icon-box { width: 48px; height: 48px; background: var(--vms-primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; box-shadow: 0 0 15px var(--vms-primary); } h3 { margin: 0; color: var(--vms-content-text); font-size: 20px; } p { margin: 4px 0 0; font-size: 13px; color: var(--vms-content-muted); } }
  .header-ext { display: flex; align-items: center; gap: 30px; .step-count { font-size: 14px; color: var(--vms-content-muted); span { color: var(--vms-primary); font-weight: bold; font-size: 20px; } } .close-wizard { background: rgba(148, 163, 184, 0.1); border: none; color: var(--vms-content-muted); padding: 8px; border-radius: 8px; cursor: pointer; &:hover { color: var(--vms-primary); background: rgba(148, 163, 184, 0.2); } } }
}

.wizard-content { flex: 1; display: flex; overflow: hidden; }

/* Timeline Sidebar */
.timeline-sidebar {
  width: 300px; background: rgba(15, 23, 42, 0.05); border-right: 1px solid var(--vms-content-border); padding: 40px 0; display: flex; flex-direction: column;
  .timeline-item {
    padding: 0 30px; display: flex; gap: 20px; position: relative; margin-bottom: 50px;
    .dot { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--vms-content-border); background: var(--vms-card-bg); color: var(--vms-content-muted); font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 15px; z-index: 2; transition: 0.3s; }
    .text { h4 { margin: 0; color: var(--vms-content-muted); font-size: 15px; } p { margin: 4px 0 0; font-size: 12px; color: var(--vms-content-muted); opacity: 0.6; } }
    .line { position: absolute; left: 47px; top: 36px; width: 2px; height: 50px; background: var(--vms-content-border); z-index: 1; }
    
    &.active { .dot { border-color: var(--vms-primary); color: var(--vms-primary); box-shadow: 0 0 12px var(--vms-primary); } .text h4 { color: var(--vms-content-text); } .text p { color: var(--vms-primary); opacity: 1; } }
    &.done { .dot { border-color: #10b981; background: #10b981; color: #fff; } .line { background: #10b981; } }
  }
}

.active-tree-panel { margin-top: auto; padding: 25px; background: rgba(56, 189, 248, 0.03); border: 1px solid var(--vms-content-border); margin: 0 15px 15px; border-radius: 15px; .panel-label { font-size: 12px; color: var(--vms-primary); font-weight: bold; margin-bottom: 15px; text-transform: uppercase; } }

/* Main Area */
.wizard-main-area { flex: 1; display: flex; flex-direction: column; background: var(--vms-main-bg); overflow: hidden; }
.form-col { height: 100%; display: flex; flex-direction: column; padding: 30px; border-right: 1px solid var(--vms-content-border); }
.cyber-form-scroll { flex: 1; overflow-y: auto; padding-right: 15px; }

:deep(.el-form-item) {
  .el-form-item__label { color: var(--vms-content-muted) !important; font-weight: 600; font-size: 13px; padding-bottom: 10px !important; }
  .el-input__wrapper, .el-select .el-input__wrapper { background: rgba(15, 23, 42, 0.05) !important; border: 1px solid var(--vms-content-border) !important; box-shadow: none !important; border-radius: 10px; color: var(--vms-content-text); &:hover { border-color: var(--vms-primary) !important; } }
  .el-input__inner { color: var(--vms-content-text) !important; }
}

.info-note { display: flex; align-items: center; gap: 10px; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); padding: 12px; border-radius: 8px; color: var(--vms-primary); font-size: 12px; margin-top: 20px; }

.wizard-footer {
  margin-top: 30px; padding-top: 25px; border-top: 1px solid var(--vms-content-border); display: flex; align-items: center;
  .btn-secondary { background: transparent; border: 1px solid var(--vms-content-border); color: var(--vms-content-muted); padding: 12px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; &:hover { color: var(--vms-content-text); border-color: var(--vms-content-text); } }
  .btn-primary { background: var(--vms-primary); color: #fff; border: none; padding: 12px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3); transition: 0.3s; &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(56, 189, 248, 0.5); } }
  .btn-submit { background: #10b981; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
  .flex-spacer { flex: 1; }
}

.map-col { height: 100%; background: #000; }
.map-container-inner { height: 100%; width: 100%; }

.tree-wrapper {
  background: rgba(15, 23, 42, 0.05); border: 1px solid var(--vms-content-border); border-radius: 12px; padding: 15px; height: 350px; overflow-y: auto;
  :deep(.el-tree) { background: transparent; color: var(--vms-content-text); .el-tree-node__content:hover { background: rgba(56, 189, 248, 0.1); } }
}
.tree-node { display: flex; align-items: center; gap: 10px; }
</style>
