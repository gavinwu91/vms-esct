<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="130px"
    >
      <el-form-item label="Sms signature" prop="signature">
        <el-input v-model="formData.signature" placeholder="Please input Sms signature" />
      </el-form-item>
      <el-form-item label="Channel code" prop="code">
        <el-select v-model="formData.code" clearable placeholder="Please select Channel code">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.SYSTEM_SMS_CHANNEL_CODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Enable Status">
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
      <el-form-item label="Sms API account" prop="apiKey">
        <el-input v-model="formData.apiKey" placeholder="Please input Sms API account" />
      </el-form-item>
      <el-form-item label="Sms API secret" prop="apiSecret">
        <el-input v-model="formData.apiSecret" placeholder="Please input Sms API secret" />
      </el-form-item>
      <el-form-item label="Sms send callback URL" prop="callbackUrl">
        <el-input v-model="formData.callbackUrl" placeholder="Please input Sms send callback URL" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import * as SmsChannelApi from '@/api/system/sms/smsChannel'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'SystemSmsChannelForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  signature: '',
  code: '',
  status: CommonStatusEnum.ENABLE,
  remark: '',
  apiKey: '',
  apiSecret: '',
  callbackUrl: ''
})
const formRules = reactive({
  signature: [{ required: true, message: 'Sms 签名 can not empty', trigger: 'blur' }],
  code: [{ required: true, message: ' Channel code can not empty', trigger: 'blur' }],
  status: [{ required: true, message: '启用 Status can not empty', trigger: 'blur' }],
  apiKey: [{ required: true, message: 'Sms API account can not empty', trigger: 'blur' }]
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
      formData.value = await SmsChannelApi.getSmsChannel(id)
      console.log(formData)
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
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as SmsChannelApi.SmsChannelVO
    if (formType.value === 'create') {
      await SmsChannelApi.createSmsChannel(data)
      message.success(t('common.createSuccess'))
    } else {
      await SmsChannelApi.updateSmsChannel(data)
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
    signature: '',
    code: '',
    status: CommonStatusEnum.ENABLE,
    remark: '',
    apiKey: '',
    apiSecret: '',
    callbackUrl: ''
  }
  formRef.value?.resetFields()
}
</script>
