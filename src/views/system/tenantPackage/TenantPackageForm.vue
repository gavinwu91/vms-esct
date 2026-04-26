<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" style="width: 900px; margin-top: 2%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="121px"
    >
      <el-form-item label="Plan name" prop="Name">
        <el-input v-model="formData.name" placeholder="Please input Plan name" />
      </el-form-item>
      <el-form-item label="Scope">
        <el-row :gutter="5">
          <el-col :span="12" class="!w-500px">
            <el-card class="w-full h-400px !overflow-y-scroll" shadow="never">
              <template #header>
                Menu permission
                <el-switch
                  v-model="treeNodeAll"
                  active-text="Yes"
                  inactive-text="No"
                  inline-prompt
                  @change="handleCheckedTreeNodeAll"
                />
                <!-- All expand/Collapse:
              <el-switch
                v-model="menuExpand"
                active-text="E"
                inactive-text="C"
                inline-prompt
                @change="handleCheckedTreeExpand"
              /> -->
              </template>
              <el-tree
                ref="treeRef"
                :data="menuOptions"
                :props="defaultProps"
                empty-text="Please wait while loading"
                node-key="id"
                show-checkbox
              />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="w-full h-400px !overflow-y-scroll" shadow="never">
              <template #header>
                Data permission
                <!-- <el-input
                  v-model="treeFilterText"
                  placeholder="search"
                  clearable
                  prefix-icon="el-icon-search"
                  @input="filterDeviceTree"
                /> -->
                <el-input
                  placeholder="Search"
                  class="!w-80%"
                  clearable
                  readonly
                  prefix-icon="el-icon-search"
                  @click="
                    () => {
                      searchTreeShow = true
                      deviceSearchTreeKey++
                    }
                  "
                />
              </template>
              <!-- <el-tree
              ref="treeDataRef"
              :data="dataOptions"
              :props="defaultDataProps"
              :filter-node-method="filterDeviceNode"
              empty-text="Please wait while loading"
              node-key="key"
              show-checkbox
            /> -->
              <el-tree
                ref="deviceTreeRef"
                class="!w-full !h-full"
                :props="defaultDataProps"
                :load="loadNodes"
                empty-text="Loaded, please later"
                node-key="key"
                lazy
                :key="treeKey"
                show-checkbox
                @check="oncheck"
              >
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
            </el-card>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="Library" size="normal">
        <el-checkbox
          v-model="toggleAll"
          @change="toggleLibrary"
          class="!mr-20px"
          :indeterminate="isIndeterminate"
        >
          All
        </el-checkbox>
        <el-checkbox-group v-model="formData.libraryIds" @change="handleCheckedItemsChange">
          <el-checkbox v-for="(item, index) in libraryOptions" :key="index" :label="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Remark" prop="remark">
        <el-input v-model="formData.remark" placeholder="Please input Remark" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm" class="vms-main-button"
        >Confirm</el-button
      >
      <el-button @click="dialogVisible = false" class="vms-cancel-button">Cancel</el-button>
    </template>
  </Dialog>
  <el-dialog title="Search" v-model="searchTreeShow" style="width: 30vw; height: 65vh">
    <DeviceSearchTree
      @confirm-search-device-ids="confirmSearchDevices"
      :key="deviceSearchTreeKey"
      @close-search="searchTreeShow = false"
    />
  </el-dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { defaultProps, defaultDataProps, handleTree } from '@/utils/tree'
import * as TenantPackageApi from '@/api/system/tenantPackage'
import * as MenuApi from '@/api/system/menu'
import { ElTree } from 'element-plus'
import { getPermissionDeviceTree, loadCameraTree, getParentArea } from '@/api/device'
import type { LoadFunction, TreeInstance, FilterNodeMethodFunction } from 'element-plus'
import { VideoCamera, OfficeBuilding } from '@element-plus/icons-vue'
import * as LibraryApi from '@/api/portraitlibrary/index'
defineOptions({ name: 'SystemTenantPackageForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const treeKey = ref(0)
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const toggleAll = ref(false)
const libraryOptions = ref([
  {
    label: '',
    value: undefined
  }
])
const formData = ref({
  id: null,
  name: null,
  remark: null,
  menuIds: [],
  status: CommonStatusEnum.ENABLE,
  libraryIds: [],
  areaIds: [],
  deviceIds: []
})
const formRules = reactive({
  name: [{ required: true, message: 'Plan name can not empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status can not empty', trigger: 'blur' }],
  menuIds: [{ required: true, message: 'The associated menu code can not empty', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const menuOptions = ref<any[]>([]) // 树形结构数据
const menuExpand = ref(false) // 展开/折叠
const treeRef = ref<InstanceType<typeof ElTree>>() // 树组件 Ref
const treeNodeAll = ref(false) // 全选/全不选

const dataOptions = ref<any[]>([]) // 树形结构数据
const treeDataRef = ref<TreeInstance>() // 树组件 Ref
const treeNodeDataAll = ref(false) // 全选/全不选
const treeFilterText = ref('')

const searchTreeShow = ref(false)
const deviceSearchTreeKey = ref(1)
const isIndeterminate = ref(false)
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  initLibraryOption()
  resetForm()
  // 加载 Menu 列表。注意，必须放在前面，不然下面 setChecked 没数据节点
  menuOptions.value = handleTree(await MenuApi.getSimpleMenusList())
  dataOptions.value = await getPermissionDeviceTree({})

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const res = await TenantPackageApi.getTenantPackage(id)
      // 设置选中
      formData.value = res
      // 设置选中
      res.menuIds.forEach((menuId: number) => {
        treeRef.value!.setChecked(menuId, true, false)
      })
      // console.log(JSON.stringify(res.deviceIds))
      // console.log("data:===", treeDataRef.value)
      console.log('formData.value ==========', formData.value)
      // res.deviceIds.forEach((deviceId: number) => {
      //   const key = 'device_' + deviceId
      //   treeDataRef.value!.setChecked(key, true, false)
      // })
      checkedDeviceIds.value = new Set(res.deviceIds)
      const areas = await getParentArea({ cameraIds: res.deviceIds })
      console.log('getParentArea ======== ', res)
      await expandTreeByArea(areas, res.deviceIds)
      formLoading.value = false
    } finally {
      formLoading.value = false
    }
  }
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const initLibraryOption = () => {
  LibraryApi.optionList().then((res) => {
    libraryOptions.value = res.map((x) => {
      return { value: Number(x.id), label: x.libraryName }
    })
  })
}
const deviceTreeRef = ref<TreeInstance>()

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return

  if (!formData.value.libraryIds || formData.value.libraryIds.length == 0) {
    ElMessage.warning('Please select library!')
    return
  }
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as TenantPackageApi.TenantPackageVO
    data.menuIds = [
      ...(treeRef.value!.getCheckedKeys(false) as unknown as Array<number>), // 获得当前选中节点
      ...(treeRef.value!.getHalfCheckedKeys() as unknown as Array<number>) // 获得半选中的父节点
    ]

    // const checkDataNodes = deviceTreeRef.value.getCheckedNodes(true)
    // console.log('checkDataNodes', checkDataNodes)
    // const deviceIds = checkDataNodes.filter((node) => node.type === 'device').map((node) => node.id)
    // const areaIds = checkDataNodes.filter((node) => node.type === 'region').map((node) => node.id)
    // console.log('deviceIds', deviceIds)
    // data.deviceIds = [...deviceIds]
    // data.areaIds = [...areaIds]

    if (formType.value === 'create') {
      await TenantPackageApi.createTenantPackage(data)
      message.success(t('common.createSuccess'))
    } else {
      await TenantPackageApi.updateTenantPackage(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
/**method begin */
/** 重置表单 */
const resetForm = () => {
  // 重置选项
  treeNodeAll.value = false
  menuExpand.value = false
  // 重置表单
  formData.value = {
    id: null,
    name: null,
    remark: null,
    menuIds: [],
    status: CommonStatusEnum.ENABLE,
    libraryIds: [],
    areaIds: [],
    deviceIds: []
  }
  treeRef.value?.setCheckedNodes([])
  formRef.value?.resetFields()
}

/** 全选/全不选 */
const handleCheckedTreeNodeAll = () => {
  treeRef.value!.setCheckedNodes(treeNodeAll.value ? menuOptions.value : [])
}

const handleCheckedDataTreeNodeAll = () => {
  treeDataRef.value!.setCheckedNodes(treeNodeDataAll.value ? dataOptions.value : [])
}

/** 展开/折叠全部 */
const handleCheckedTreeExpand = () => {
  const nodes = treeRef.value?.store.nodesMap
  for (let node in nodes) {
    if (nodes[node].expanded === menuExpand.value) {
      continue
    }
    nodes[node].expanded = menuExpand.value
  }
}
/** 异步加载摄像头树 */
const loadNodes: LoadFunction = (node, resolve, reject) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: 0, areaId: node.data.id }).then((res) => {
      console.log('res ====== ', res)
      return resolve(res)
    })
  }
  return reject([])
}
const checkedDeviceIds = ref(new Set())
const oncheck = (data, checked, indeterminate) => {
  const checkDeviceNodes = checked.checkedNodes
  formData.value.areaIds = checkDeviceNodes.filter((x) => x.type == 'region').map((y) => y.id)
  formData.value.deviceIds = checkDeviceNodes
    .filter((x) => x.type == 'device')
    .map((y) => {
      checkedDeviceIds.value.add(formData.value.deviceIds)
      return y.id
    })
}

const toggleLibrary = (val) => {
  if (val) {
    formData.value.libraryIds = [...libraryOptions.value.map((s) => s.value)]
  } else {
    formData.value.libraryIds = []
  }
  isIndeterminate.value = false
}

const checkAll = ref(false)
const handleCheckedItemsChange = (value) => {
  const checkedCount = value.length
  checkAll.value = checkedCount == libraryOptions.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < libraryOptions.value.length
  if (checkedCount == libraryOptions.value.length) {
    toggleAll.value = true
  } else {
    toggleAll.value = false
  }
}

const confirmSearchDevices = (searchDeviceIds) => {
  //获取当前摄像头id的全部父级area 并展开
  getParentArea({ cameraIds: searchDeviceIds }).then((res) => {
    expandTreeByArea(res, searchDeviceIds)
  })
  const deviceIdsSet = new Set(formData.value.deviceIds)
  searchDeviceIds.forEach((x) => deviceIdsSet.add(x))
  formData.value.deviceIds = [...deviceIdsSet]
  searchTreeShow.value = false
}
const expandTreeByArea = async (res, cameraIdArr) => {
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
/**method end */
</script>

<style>
.tree_container {
  display: flex;
}
</style>
