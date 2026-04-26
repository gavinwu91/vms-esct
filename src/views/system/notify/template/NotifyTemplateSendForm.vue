<template>
  <Dialog v-model="dialogVisible" title="Send" :max-height="500">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="180px"
    >
      <el-form-item label="Template Content" prop="content">
        <el-input
          v-model="formData.content"
          placeholder="Please input Template  Content"
          readonly
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="User Type" prop="userType">
        <el-radio-group v-model="formData.userType">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.USER_TYPE)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="formData.userType === 1" label="Receiver" prop="userId">
        <el-select
          v-model="formData.userId"
          placeholder="Please select Receiver"
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in userOption"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item v-show="formData.userType === 2" label="Receiver" prop="userId">
        <el-select v-model="formData.userId" placeholder="Please select Receiver">
          <el-option
            v-for="item in userOption"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item> -->
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
import * as UserApi from '@/api/system/user'
import * as NotifyTemplateApi from '@/api/system/notify/template'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

defineOptions({ name: 'SystemNotifyTemplateSendForm' })

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  content: '',
  params: {},
  userId: [],
  userType: 1,
  templateCode: '',
  templateParams: new Map()
})
const formRules = reactive({
  // userId: [{ required: true, message: 'User id can not empty', trigger: 'change' }],
  templateCode: [{ required: true, message: 'Template code can not empty', trigger: 'blur' }],
  templateParams: {}
})
const formRef = ref() // 表单 Ref
const userOption = ref<UserApi.UserVO[]>([])

const open = async (id: number) => {
  dialogVisible.value = true
  resetForm()
  // 设置数据
  formLoading.value = true
  try {
    const data = await NotifyTemplateApi.getNotifyTemplate(id)
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
  // 加载用户列表
  userOption.value = await UserApi.getSimpleUserList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return

  if (formData.value.userType == 1 && (formData.value.userId == undefined || formData.value.userId.length == 0)) {
    ElMessage.warning('Please Selet Receiver!')
    return
  }

  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as NotifyTemplateApi.NotifySendReqVO
    const logId = await NotifyTemplateApi.sendNotify(data)
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
    mobile: '',
    templateCode: '',
    templateParams: new Map(),
    userType: 1
  } as any
  formRef.value?.resetFields()
}
</script>
