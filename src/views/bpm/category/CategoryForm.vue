<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="分类名" prop="name">
        <el-input v-model="formData.name" placeholder="Please input 分类名" />
      </el-form-item>
      <el-form-item label="分类标志" prop="code">
        <el-input v-model="formData.code" placeholder="Please input 分类标志" />
      </el-form-item>
      <el-form-item label="分类描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="Please input 分类描述" />
      </el-form-item>
      <el-form-item label="分类 Status" prop="status">
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
      <el-form-item label="分类排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          placeholder="Please input 分类排序"
          class="!w-1/1"
          :precision="0"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { CategoryApi, CategoryVO } from '@/api/bpm/category'
import { CommonStatusEnum } from '@/utils/constants'

/** BPM 流程分类 表单 */
defineOptions({ name: 'CategoryForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  code: undefined,
  description: undefined,
  status: CommonStatusEnum.ENABLE,
  sort: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '分类名 can not empty', trigger: 'blur' }],
  code: [{ required: true, message: '分类标志 can not empty', trigger: 'blur' }],
  status: [{ required: true, message: '分类 Status can not empty', trigger: 'blur' }],
  sort: [{ required: true, message: '分类排序 can not empty', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CategoryApi.getCategory(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CategoryVO
    if (formType.value === 'create') {
      await CategoryApi.createCategory(data)
      message.success(t('common.createSuccess'))
    } else {
      await CategoryApi.updateCategory(data)
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
    id: undefined,
    name: undefined,
    code: undefined,
    description: undefined,
    status: CommonStatusEnum.ENABLE,
    sort: undefined
  }
  formRef.value?.resetFields()
}
</script>
