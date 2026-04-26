<script setup lang="ts">
import {defaultProps} from "@/utils/tree";
import {OfficeBuilding, VideoCamera} from "@element-plus/icons-vue";
import {loadCameraTree} from "@/api/device";

interface DeviceInfo {
  cameraType: string,
}

defineOptions({name: 'DeviceTreeTemplate'})
const emit = defineEmits(['submitSelect', 'cancelSelect'])
const deviceTreeTemplateRef = ref([])
const props = defineProps<DeviceInfo>()
const treeData = ref([]);
const filterText = ref('');
watch(props, (newProps: DeviceInfo) => {
  if (newProps) {
    init(newProps.cameraType)
  }
})

onMounted(async () => {
  await init(props.cameraType)
})
const init = async (type) => {
  //treeData.value = await loadCameraTree({cameraType: type, areaId: 0})
}

const submitSelect = () => {
  if (nodeData.value.length === 0) {
    ElMessage.warning({message: 'Please select device'})
    return;
  }
  emit('submitSelect', nodeData.value)
}
const cancelSelect = () => {
  emit('cancelSelect', false)
}

watch(filterText, (val) => {
  deviceTreeTemplateRef.value!.filter(val);
})


const filterNode: FilterNodeMethodFunction = (value: string, data: tree) => {
  if (!value) return true;
  return data.name.includes(value.toUpperCase())
}


const nodeData = ref([]);
const checkNode = () => {
  nodeData.value = [];
  var checkedNodes = deviceTreeTemplateRef.value!.getCheckedNodes(true);
  var nodes = checkedNodes.filter(item => item.platformCameraId);
  for (let i = 0; i < nodes.length; i++) {
    nodeData.value.push([nodes[i].name, nodes[i].platformCameraId])
  }
}

const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({cameraType: props.cameraType, areaId: node.data.id})
      .then(res => {
        return resolve(res);
      })
  }
  return reject([]);
}

</script>
<style scoped lang="scss">
.device-tree {
  height: 40vh;
  overflow: auto;
}

.tree-icon {
  font-size: 1rem;
  margin: 3px;
}
</style>

<template>
  <el-input v-model="filterText" placeholder="Filter keyword"/>
  <el-tree
    ref="deviceTreeTemplateRef"
    class="device-tree"
    :data="treeData"
    :props="defaultProps"
    :filter-node-method="filterNode"
    empty-text="Loaded, please later"
    node-key="id"
    :load="loadNodes"
    lazy
    show-checkbox
    @check-change="checkNode"
  >
    <template #default="{ node, data }">
      <span class="tree-node">
        <el-icon
          v-if="data.type === 'device'"
          class="tree-icon"
          color="skyblue"
        >
          <VideoCamera/>
        </el-icon>
        <el-icon v-else class="tree-icon" color="var(--default-main-color)">
          <OfficeBuilding/>
        </el-icon>
        <span>{{ node.label }}</span>
        <span v-if="data.type === 'camera'"></span>
      </span>
    </template>
  </el-tree>
  <el-divider/>
  <div style="display: flex;flex-direction: row">
    <el-button class="vms-main-button" @click="submitSelect" :disabled="nodeData.length===0"
               size="default">Submit
    </el-button>
    <el-button class="vms-cancel-button" @click="cancelSelect" size="default">
      Cancel
    </el-button>
  </div>
</template>
