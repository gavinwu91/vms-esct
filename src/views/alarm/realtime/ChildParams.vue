<template>
  <div class="-container">
    <el-form label-position="top">
      <div class="pl-10px">
        <div class="confirm text-right pt-10px pr-4px mb-10px">
          <el-button type="primary" @click="confirmChildParams" size="small">Confirm</el-button>
          <el-divider direction="horizontal" class="!my-12px" />
        </div>
        
        <div class="alarm-level mb-10px" v-show="props.cameraType == 3">
          <div class="title pl-5px"> Alarm level </div>
          <el-checkbox-group v-model="childParams.alarmLevelList" size="small">
            <el-checkbox-button class="level-1" :label="1" :indeterminate="false"
              >Level 1</el-checkbox-button
            >
            <el-checkbox-button class="level-2" :label="2" :indeterminate="false"
              >Level 2</el-checkbox-button
            >
            <el-checkbox-button class="level-3" :label="3" :indeterminate="false"
              >Level 3</el-checkbox-button
            >
            <el-checkbox-button class="level-4" :label="4" :indeterminate="false"
              >Level 4</el-checkbox-button
            >
          </el-checkbox-group>
          <el-divider direction="horizontal" class="!my-12px" />
        </div>
        
        <div class="device-library-radio mb-10px">
          <div class="title pl-5px"> Libraries associated with devices </div>
          <el-radio-group v-model="deviceLibraryRadio" size="small" class="!w-full">
            <el-radio-button :label="1">Device</el-radio-button>
            <el-radio-button :label="2">{{ libraryName }}</el-radio-button>
          </el-radio-group>
        </div>
        <el-divider direction="horizontal" class="!my-8px" />
        <div class="device-library-box mb-10px">
          <div class="tree-box" v-show="deviceLibraryRadio == 1">
            <el-tree
              ref="deviceTreeRef"
              class="!w-full !h-full"
              :props="defaultProps"
              :load="loadNodes"
              empty-text="Loaded, please later"
              node-key="key"
              lazy
              :key="treeKey"
              show-checkbox
              @check-change="oncheck"
            >
              <!-- @check-change="oncheck" -->
              <template #default="{ node, data }">
                <div class="tree-node">
                  <el-icon v-if="data.type === 'device'" class="tree-icon" color="purple">
                    <VideoCamera />
                  </el-icon>
                  <el-icon v-else class="tree-icon" color="green">
                    <OfficeBuilding />
                  </el-icon>
                  <span>
                    {{ node.label }}
                  </span>
                </div>
              </template>
            </el-tree>
          </div>
          <div class="library-box" v-show="deviceLibraryRadio == 2">
            <el-select
              v-model="childParams.libraryList"
              size="small"
              class="form-input !w-90%"
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
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { defaultProps } from '@/utils/tree'
import type { LoadFunction, TreeInstance, FilterNodeMethodFunction } from 'element-plus'
import { VideoCamera, OfficeBuilding } from '@element-plus/icons-vue'
import { loadCameraTree } from '@/api/device'
import { surOptionList } from '@/api/library/index'
import { AlarmTaskApi as PlateAlarmTaskApi} from '@/api/alarmtask/plate'
defineOptions({
  name: 'RealTimeChildParams'
})

const treeKey = ref(0)
const deviceTreeRef = ref<TreeInstance>()
const deviceLibraryRadio = ref(1)
const libraryOptions = ref([] as any[])


const childParams = ref({
  alarmLevelList: [1, 2, 3, 4],
  deviceList: [],
  libraryList: []
})

const emits = defineEmits(['confirmChildParams'])
const props = defineProps({
  cameraType: {
    type: Number,
    default: 0
  }
})


const libraryName = computed(() => props.cameraType == 3 ? "Library" : "Task")


const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: props.cameraType, areaId: node.data.id }).then((res) => {
      console.log('loadNodes ========== ', res)
      return resolve(res)
    })
  }
  return reject([])
}

const filterNode: FilterNodeMethodFunction = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}

const oncheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
  const deviceIds = checkDeviceNodes
    .filter((node) => node.type === 'device')
    .map((node) => {
      if (props.cameraType == 3) {
        return node.platformCameraId
      }
      return node.id
    })
  childParams.value.deviceList = deviceIds
}

const confirmChildParams = () => {
  emits('confirmChildParams', childParams.value)
}

const init = async () => {
  if (props.cameraType == 3) {
    //初始化人脸监控库
    surOptionList({ isShow: 1 }).then((sls) => {
      libraryOptions.value = []
      childParams.value.libraryList = []
      for (const sl of sls) {
        childParams.value.libraryList.push(sl.platformLibraryId)
        libraryOptions.value.push({
          value: sl.platformLibraryId,
          name: sl.libraryName
        })
      }
    })
  } else {
    //初始化车牌任务
    PlateAlarmTaskApi.getLarmTaskOptions().then((res) => {
      childParams.value.libraryList = []
      libraryOptions.value = res.map((x) => {
        childParams.value.libraryList.push(x.value)
        return {
          value: x.value,
          name: x.label
        }
      })
    })
  }
}

onMounted(() => {
  //初始化device
  init()
})
</script>

<style lang="scss" scoped>
:deep(.el-checkbox-button) {
  margin-right: 6px;
  margin-top: 2px;
}
:deep(.el-checkbox-button.level-1 .el-checkbox-button__inner) {
  background-color: #e63946;
  color: white;
}
:deep(.el-checkbox-button.is-checked.level-1 .el-checkbox-button__inner) {
  background-color: #e63946;
  outline: 2px solid #a41a1a;
  outline-offset: 1px;
}
:deep(.el-checkbox-button.level-2 .el-checkbox-button__inner) {
  background-color: #e77e2d;
  color: white;
}
:deep(.el-checkbox-button.is-checked.level-2 .el-checkbox-button__inner) {
  background-color: #e77e2d;
  outline: 2px solid #b45c19;
  outline-offset: 1px;
}
:deep(.el-checkbox-button.level-3 .el-checkbox-button__inner) {
  background-color: #fbc647;
  color: white;
}
:deep(.el-checkbox-button.is-checked.level-3 .el-checkbox-button__inner) {
  background-color: #fbc647;
  outline: 2px solid #c99314;
  outline-offset: 1px;
}
:deep(.el-checkbox-button.level-4 .el-checkbox-button__inner) {
  background-color: #4c8ad4;
  color: white;
}
:deep(.el-checkbox-button.is-checked.level-4 .el-checkbox-button__inner) {
  background-color: #4c8ad4;
  outline: 2px solid #0f4e99;
  outline-offset: 1px;
}
</style>
