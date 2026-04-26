<template>
  <Dialog v-model="dialogVisible" title="Test">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="Template Content" prop="content">
        <Editor :model-value="formData.content" height="150px" readonly />
      </el-form-item>
      <el-form-item label="Receive Email" prop="mail">
        <el-input v-model="formData.mail" placeholder="Please input Receive Email" />
      </el-form-item>
      <el-form-item
        v-for="param in formData.params"
        :key="param"
        :label="'Param {' + param + '}'"
        :prop="'templateParams.' + param"
      >
        <el-input
          v-model="formData.templateParams[param]"
          :placeholder="'Please input ' + param + ' param'"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as MailTemplateApi from '@/api/system/mail/template'

defineOptions({ name: 'SystemMailTemplateSendForm' })

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  content: '',
  params: {},
  mail: '',
  templateCode: '',
  templateParams: new Map()
})
const formRules = reactive({
  mail: [{ required: true, message: ' Email can not empty', trigger: 'blur' }],
  templateCode: [{ required: true, message: 'Template code can not empty', trigger: 'blur' }],
  templateParams: {}
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  resetForm()
  // 设置数据
  formLoading.value = true
  try {
    const data = await MailTemplateApi.getMailTemplate(id)
    // 设置动态表单
    formData.value.content = data.content
    formData.value.params = data.params
    formData.value.templateCode = data.code
    formData.value.templateParams = data.params.reduce((obj, item) => {
      obj[item] = '' // 给每个动态属性赋值，避免无法读取
      return obj
    }, {})
    formRules.templateParams = data.params.reduce((obj, item) => {
      obj[item] = { required: true, message: 'Param ' + item + '  can not empty', trigger: 'blur' }
      return obj
    }, {})
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as MailTemplateApi.MailSendReqVO
    const logId = await MailTemplateApi.sendMail(data)
    if (logId) {
      message.success('Submit send success! send result,see send log code：' + logId)
    }
    dialogVisible.value = false
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    content: '',
    params: {},
    mail: '',
    templateCode: '',
    templateParams: new Map()
  }
  formRules.templateParams = {}
  formRef.value?.resetFields()
}
</script>
