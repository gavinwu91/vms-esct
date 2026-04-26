<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="121px"
    >
      <el-form-item label="Library  Name" prop="libraryName">
        <el-input v-model="formData.libraryName" placeholder="Please Input Library Name" />
      </el-form-item>
      <!-- <el-form-item label="Department" prop="deptId">
          <el-cascader
          v-model="formData.deptId"
          :options="departments"
          :props="cascaderProps"
          placeholder="Please Select Departments"
          clearable
          style="width: 100%"
          />
      </el-form-item> -->
      <el-form-item label="Remark" prop="remark">
        <el-input v-model="formData.remark" placeholder="Remark" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm" class="vms-main-button">Confirm</el-button>
      <el-button @click="dialogVisible = false" class="vms-cancel-button">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as LibraryApi from '@/api/portraitlibrary'
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
const isDisabled = ref(false)
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  libraryName: '',
  libraryType: undefined,
  remark: '',
  deptId: ''
})
const formRules = reactive({
  libraryName: [{ required: true, message: 'Library name can not empty', trigger: 'blur' }],
  // deptId: [{ required: true, message: 'Department can not empty', trigger: 'change' }],
  remark: [{ required: false, message: 'Remark can not empty', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const departments = ref([])
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  if (type === "create") {
    isDisabled.value = false;
  } else {
    isDisabled.value = true;
  }
  let deptList = await getDepartments()
  departments.value = buildDeptTree(deptList)
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await LibraryApi.getLibrary(id)
      formData.value.libraryType = Number(formData.value.libraryType)
    } finally {
      formLoading.value = false
    }
  }
}


  // 构建树形结构
  const buildDeptTree = (regions, parentId = 0) => {
    let result = regions
      .filter(region => {
        // 处理可能的空值
        const regionParentId = region.parentId === 0 ? 0 : region.parentId;
        if (parentId === 0) {
          return regionParentId === 0
        } else {
          return regionParentId === parentId
        }
      })
      .map(region => {
        const children = buildDeptTree(regions, region.id)
        return {
          ...region,
          children: children.length > 0 ? children : undefined
        }
      });
      return result;
  }

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    libraryName: '',
    libraryType: '',
    remark: '',
    deptId: ''
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
    const tenantid = authUtil.getTenantId();
    const loginFrom = authUtil.getLoginForm();
     data.tenantId = tenantid;
     data.creator = loginFrom.username;
    if (formType.value === 'create') {
      await LibraryApi.createLibrary(data)
      message.success(t('common.createSuccess'))
    } else {
      await LibraryApi.updateLibrary(data)
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
