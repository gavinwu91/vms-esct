<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="160px"
    >
      <el-form-item label="Library Name" prop="libraryName">
        <el-input v-model="formData.libraryName" placeholder="Please Input Library Name" />
      </el-form-item>
      <el-form-item label="Level">
        <el-radio-group v-model="formData.level" size="small">
          <el-radio-button
            :class="'level-' + level.value"
            :label="level.value"
            v-for="(level, index) in levelOptions"
            :key="index"
            :indeterminate="false"
            >{{ level.label }}</el-radio-button
          >
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Department" prop="deptId">
        <el-cascader
          v-model="formData.deptId"
          :options="departments"
          :props="cascaderProps"
          placeholder="Please Select Departments"
          clearable
          style="width: 100%"
        />
      </el-form-item>
      <!-- <el-form-item label="Surveillance Reason" prop="surveillanceReason">
        <el-input v-model="formData.surveillanceReason" placeholder="Please Select Surveillance Reason" />
      </el-form-item>
      <el-form-item label="Contact Person" prop="contactPerson">
        <el-input v-model="formData.contactPerson" placeholder="Please Select Contact Person"/>
      </el-form-item> -->
      <el-form-item label="Remark" prop="remark">
        <el-input v-model="formData.remark" placeholder="Remark" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm" class="vms-main-button"
        >Confirm</el-button
      >
      <el-button @click="dialogVisible = false" class="vms-cancel-button">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as LibraryApi from '@/api/library'
import { getDepartments } from '@/api/device'
import * as authUtil from '@/utils/auth'

defineOptions({ name: 'LibraryForm' })

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  libraryName: '',
  libraryType: 2,
  remark: '',
  deptId: '',
  level: 2,
  surveillanceReason: '',
  contactPerson: ''
})

const levelOptions = ref([
  { label: 'Level 1', value: 1 },
  { label: 'Level 2', value: 2 },
  { label: 'Level 3', value: 3 },
  { label: 'Level 4', value: 4 }
])

const formRules = reactive({
  libraryName: [{ required: true, message: 'Library name can not empty', trigger: 'blur' }],
  libraryType: [{ required: true, message: 'Library type can not empty', trigger: 'change' }],
  deptId: [{ required: true, message: 'Department can not empty', trigger: 'change' }],
  remark: [{ required: false, message: 'Remark can not empty', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const departments = ref([])
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  let deptList = await getDepartments()
  departments.value = buildDeptTree(deptList)
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await LibraryApi.getSurLibrary(id)
    } finally {
      formLoading.value = false
    }
  }
}

// 构建树形结构
const buildDeptTree = (regions, parentId = 0) => {
  let result = regions
    .filter((region) => {
      // 处理可能的空值
      const regionParentId = region.parentId === 0 ? 0 : region.parentId
      if (parentId === 0) {
        return regionParentId === 0
      } else {
        return regionParentId === parentId
      }
    })
    .map((region) => {
      const children = buildDeptTree(regions, region.id)
      return {
        ...region,
        children: children.length > 0 ? children : undefined
      }
    })
  return result
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    libraryName: '',
    libraryType: 2,
    remark: '',
    deptId: '',
    level: 1
  }
  formRef.value?.resetFields()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as LibraryApi.LibraryVO
    const tenantid = authUtil.getTenantId()
    const loginFrom = authUtil.getLoginForm()
    data.tenantId = tenantid
    data.creator = loginFrom.username
    data.libraryType = '2'
    if (formType.value === 'create') {
      await LibraryApi.createSurLibrary(data)
      message.success(t('common.createSuccess'))
    } else {
      await LibraryApi.updateSurLibrary(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
<style scoped>
:deep(.el-radio-button) {
  margin-right: 6px;
}
:deep(.el-radio-button.level-1 .el-radio-button__inner) {
  background-color: #ce4f4f;
  color: white;
}
:deep(.el-radio-button.is-active.level-1 .el-radio-button__inner) {
  background-color: #ce4f4f;
  outline: 2px solid #a41a1a;
  outline-offset: 2px;
}
:deep(.el-radio-button.level-2 .el-radio-button__inner) {
  background-color: #e77e2d;
  color: white;
}
:deep(.el-radio-button.is-active.level-2 .el-radio-button__inner) {
  background-color: #e77e2d;
  outline: 2px solid #b45c19;
  outline-offset: 2px;
}
:deep(.el-radio-button.level-3 .el-radio-button__inner) {
  background-color: #fbc647;
  color: white;
}
:deep(.el-radio-button.is-active.level-3 .el-radio-button__inner) {
  background-color: #fbc647;
  outline: 2px solid #c99314;
  outline-offset: 2px;
}
:deep(.el-radio-button.level-4 .el-radio-button__inner) {
  background-color: #4c8ad4;
  color: white;
}
:deep(.el-radio-button.is-active.level-4 .el-radio-button__inner) {
  background-color: #4c8ad4;
  outline: 2px solid #0f4e99;
  outline-offset: 2px;
}
</style>
