<template>
  <Dialog v-model="dialogVisible" title="Data Permission" width="1200">
    <div v-loading="formLoading" element-loading-text="Loading">
      <el-form ref="formRef" :model="formData" label-width="121px">
        <el-row :gutter="20">
          <el-col :span="12"
            ><el-form-item label="Role Name">
              <el-tag>{{ formData.name }}</el-tag>
            </el-form-item></el-col
          >
          <el-col :span="12"
            ><el-form-item label="Role Mark">
              <el-tag>{{ formData.code }}</el-tag>
            </el-form-item></el-col
          >
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"
            ><el-card class="w-full" shadow="never">
              <template #header> Device Permission </template>

              <el-form-item label="Scope" label-width="60px">
                <div class="w-full">
                  <div class="flex justify-between">
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
                  </div>

                  <!-- @input="filterDeviceTree" -->
                  <!-- <el-tree
                ref="deviceTreeRef"
                :check-strictly="!checkStrictly"
                :data="deviceOptions"
                :props="defaultDataProps"
                :filter-node-method="filterDeviceNode"
                default-expand-all
                empty-text="Loaded, please later"
                node-key="key"
                show-checkbox
              /> -->
                  <div class="h-350px !overflow-y-scroll">
                    <el-tree
                      ref="deviceTreeRef"
                      class="!w-full !h-full"
                      :props="defaultDataProps"
                      :load="loadNodes"
                      empty-text="Loaded, please later"
                      node-key="key"
                      :lazy="true"
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
                  </div>
                </div>
              </el-form-item>
            </el-card></el-col
          >
          <el-col :span="12"
            ><el-card class="w-full h-495px !overflow-y-scroll" shadow="never">
              <template #header>
                Other Data Permission

                <!-- All expand/Collapse:
            <el-switch
              v-model="deptExpand"
              active-text="E"
              inactive-text="C"
              inline-prompt
              @change="handleCheckedTreeExpand"
            />
            Parent-child linkage (select parent node, automatically select child node):
            <el-switch v-model="checkStrictly" active-text="Yes" inactive-text="No" inline-prompt /> -->
              </template>
              <el-form-item label="Permission">
                <el-select v-model="formData.dataScope">
                  <el-option
                    v-for="item in getIntDictOptions(DICT_TYPE.SYSTEM_DATA_SCOPE)"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="All Select"
                v-if="formData.dataScope === SystemDataScopeEnum.DEPT_CUSTOM"
              >

                <el-switch
                  v-model="treeNodeAll"
                  active-text="Yes"
                  inactive-text="No"
                  inline-prompt
                  @change="handleCheckedTreeNodeAll()"
                />
              </el-form-item>

              <el-form-item
                v-if="formData.dataScope === SystemDataScopeEnum.DEPT_CUSTOM"
                label="Scope"
                label-width="121px"
              >
                <el-tree
                  ref="treeRef"
                  class="!w-full"
                  :check-strictly="!checkStrictly"
                  :data="deptOptions"
                  :props="defaultProps"
                  default-expand-all
                  empty-text="Loaded, please later"
                  node-key="id"
                  show-checkbox
                />
              </el-form-item> </el-card
          ></el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <div class="text-right" v-show="!formLoading">
        <el-button
          :disabled="formLoading"
          type="primary"
          @click="submitForm"
          class="vms-main-button"
          >Confirm</el-button
        >
        <el-button @click="dialogVisible = false" class="vms-cancel-button">Cancel</el-button>
      </div>
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
import { defaultProps, defaultDataProps, handleTree } from '@/utils/tree'
import { SystemDataScopeEnum } from '@/utils/constants'
import * as RoleApi from '@/api/system/role'
import * as DeptApi from '@/api/system/dept'
import * as PermissionApi from '@/api/system/permission'
import { getCamerasByRole, loadCameraTree, getParentArea } from '@/api/device'
import type { TreeInstance } from 'element-plus'
import { VideoCamera, OfficeBuilding } from '@element-plus/icons-vue'
import { reject } from 'lodash-es'
import { faL } from '@fortawesome/free-solid-svg-icons'
import DeviceSearchTree from '@/components/Device/DeviceSearchTree.vue'
defineOptions({ name: 'SystemRoleDataPermissionForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  name: '',
  code: '',
  dataScope: undefined,
  dataScopeDeptIds: [],
  areaIds: [],
  deviceIds: []
})
const formRef = ref() // 表单 Ref
const deptOptions = ref<any[]>([]) // 部门树形结构
const deptExpand = ref(true) // 展开/折叠
const treeRef = ref() // 菜单树组件 Ref
const treeNodeAll = ref(false) // 全选/全不选
const checkStrictly = ref(true) // 是否严格模式，即父子不关联
const deviceSearchTreeKey = ref(1)
const deviceTreeRef = ref<TreeInstance>()
const checkedDeviceIds = ref(new Set())
const searchTreeShow = ref(false)
/** 打开弹窗 */
const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true
  formLoading.value = true
  resetForm()
  // 加载 Dept 列表。注意，必须放在前面，不然下面 setChecked 没数据节点
  deptOptions.value = handleTree(await DeptApi.getSimpleDeptList())
  // deviceOptions.value = await getPermissionDeviceTree({})
  const params = {
    roleId: row.id
  }
  const deviceIds = await getCamerasByRole(params)
  formData.value.deviceIds = deviceIds
  // 设置数据
  formData.value.id = row.id
  formData.value.name = row.name
  formData.value.code = row.code
  formData.value.dataScope = row.dataScope
  await nextTick()
  // 需要在 DOM 渲染完成后，再设置选中 Status
  row.dataScopeDeptIds?.forEach((deptId: number): void => {
    treeRef.value.setChecked(deptId, true, false)
  })
  checkedDeviceIds.value = new Set(deviceIds)
  // deviceIds?.forEach((deviceId: number) => {
  //   const key = 'device_' + deviceId
  //   deviceTreeRef.value!.setChecked(key, true, false)
  // })

  const res = await getParentArea({ cameraIds: deviceIds })
  console.log('getParentArea ======== ', res)
  await expandTreeByArea(res, deviceIds)
  formLoading.value = false
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  formLoading.value = true
  try {
    const data = {
      roleId: formData.value.id,
      dataScope: formData.value.dataScope,
      dataScopeDeptIds:
        formData.value.dataScope !== SystemDataScopeEnum.DEPT_CUSTOM
          ? []
          : treeRef.value.getCheckedKeys(false),
      areaIds: formData.value.areaIds,
      deviceIds: formData.value.deviceIds
    }
    // const checkDeviceNodes = deviceTreeRef.value!.getCheckedNodes(true)
    // const deviceIds = checkDeviceNodes
    //   .filter((node) => node.type === 'device')
    //   .map((node) => node.id)
    // data.deviceIds = [...deviceIds]
    await PermissionApi.assignRoleDataScope(data)
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  // 重置选项
  treeNodeAll.value = false
  deptExpand.value = true
  checkStrictly.value = true
  // 重置表单
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    dataScope: undefined,
    dataScopeDeptIds: [],
    areaIds: [],
    deviceIds: []
  }
  treeRef.value?.setCheckedNodes([])
  formRef.value?.resetFields()
}

/** 全选/全不选 */
const handleCheckedTreeNodeAll = () => {
  treeRef.value.setCheckedNodes(treeNodeAll.value ? deptOptions.value : [])
}

/** 展开/折叠全部 */

/** 异步加载摄像头树 */
const loadNodes = (node, resolve) => {
  if (node.data.type !== 'device') {
    loadCameraTree({ cameraType: 0, areaId: node.data.id }).then((res) => {
      return resolve(res)
    })
  }
  return reject([])
}

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

//
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
</script>
<style scss>
.device-tree-filter {
  display: flex;
}
</style>
