<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="Job Name" prop="name">
        <el-input v-model="formData.name" placeholder="Please input job Name" />
      </el-form-item>
      <el-form-item label="Handler Name" prop="handlerName">
        <el-input
          :readonly="formData.id !== undefined"
          v-model="formData.handlerName"
          placeholder="Please input handler Name"
        />
      </el-form-item>
      <el-form-item label="Handler Param" prop="handlerParam">
        <el-input v-model="formData.handlerParam" placeholder="Please input handler param" />
      </el-form-item>
      <el-form-item label="CRON" prop="cronExpression">
        <crontab v-model="formData.cronExpression" />
      </el-form-item>
      <el-form-item label="Retry count" prop="retryCount">
        <el-input
          v-model="formData.retryCount"
          placeholder="Please input retry count, if 0, not retry"
        />
      </el-form-item>
      <el-form-item label="Retry interval" prop="retryInterval">
        <el-input
          v-model="formData.retryInterval"
          placeholder="Please input retry interval, if 0,no interval"
        />
      </el-form-item>
      <el-form-item label="Monitor timeout" prop="monitorTimeout">
        <el-input v-model="formData.monitorTimeout" placeholder="Please input monitorTimeout.Unit: SSS" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm" :loading="formLoading">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as JobApi from '@/api/infra/job'

defineOptions({ name: 'JobForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: '',
  handlerName: '',
  handlerParam: '',
  cronExpression: '',
  retryCount: undefined,
  retryInterval: undefined,
  monitorTimeout: undefined
})
const formRules = reactive({
  name: [{ required: true, message: 'Job name can not empty', trigger: 'blur' }],
  handlerName: [{ required: true, message: 'Handler name can not empty', trigger: 'blur' }],
  cronExpression: [{ required: true, message: 'CRON can not empty', trigger: 'blur' }],
  retryCount: [{ required: true, message: 'Retry count can not empty', trigger: 'blur' }],
  retryInterval: [{ required: true, message: 'Retry interval can not empty', trigger: 'blur' }]
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
      formData.value = await JobApi.getJob(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交按钮 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as JobApi.JobVO
    if (formType.value === 'create') {
      await JobApi.createJob(data)
      message.success(t('common.createSuccess'))
    } else {
      await JobApi.updateJob(data)
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
    name: '',
    handlerName: '',
    handlerParam: '',
    cronExpression: '',
    retryCount: undefined,
    retryInterval: undefined,
    monitorTimeout: undefined
  }
  formRef.value?.resetFields()
}
</script>
