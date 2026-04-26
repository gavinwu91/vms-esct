<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="121px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="Rule name" prop="ruleName">
            <el-input v-model="formData.ruleName" placeholder="Please input Rule name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- <el-form-item label="Rule type" prop="ruleType">
            <el-input v-model="formData.ruleType" placeholder="Please input Rule type" />
          </el-form-item> -->
          <el-form-item label="Monitor type" prop="monitorType">
            <el-select v-model="formData.monitorType" clearable filterable>
              <el-option
                v-for="item in notifyTemplateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Alert status" prop="alartStatus">
            <el-checkbox-group v-model="formData.alertStatus">
              <el-checkbox v-for="item in alertStatusOptions" :key="item.value" :label="item.value">
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- <el-row>
        <el-col :span="24">
          <el-form-item label="Alarm condition" prop="alarmCondition">
            <el-input class=" !w-40px" v-model="formData.rangeHour" />&nbsp;hours having&nbsp;
            <el-input class=" !w-40px" v-model="formData.rangeTimes" />&nbsp; times
          </el-form-item>
        </el-col>
      </el-row> -->
      <el-row>
        <el-col :span="24">
          <el-form-item label="Execute strategy" prop="executeStrategy">
            <el-radio-group v-model="formData.executeStrategy">
              <el-radio v-for="item in executeStrategyList" :key="item.id" :label="item.id">
                {{ item.content }}
                <span v-if="item.id == 2">
                  &nbsp;<el-input size="small" v-model="formData.timesValue" class="!w-40px" />
                  times
                </span>
                <span v-if="item.id == 3">
                  &nbsp;<el-input size="small" v-model="formData.minutesValue" class="!w-40px" />
                  minutes
                </span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Description">
            <el-input
              v-model="formData.description"
              placeholder="Please input description"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">Confirm</el-button>
      <el-button @click="dialogVisible = false">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as AlarmRuleApi from '@/api/alarmrule'
import { FormRules } from 'element-plus'

defineOptions({ name: 'AlarmRuleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  ruleName: '',
  ruleType: '',
  monitorType: '',
  alertStatus: [],
  executeStrategy: undefined,
  strategyValue: undefined,
  description: '',
  createTime: undefined,
  timesValue: 1,
  minutesValue: 60,
  rangeHour: 1,
  rangeTimes: 1
})
const formRules = reactive<FormRules>({
  ruleName: [{ required: true, message: 'Rule name can not empty', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

const executeStrategyList = ref([
  {
    id: 1,
    content: 'Execute actions repeatly before alert is confirmed'
  },
  {
    id: 2,
    content: 'Execute actions continuously before alert is confirmed'
  },
  {
    id: 3,
    content: 'Execute actions regularly before alert is confirmed'
  }
])

const notifyTemplateOptions = ref([] as any)
const initNotifyTemplateOption = async () => {
  AlarmRuleApi.notifyTemplateOptions().then((res) => {
    console.log('notifyTemplateOptions  ==== ', res)
    notifyTemplateOptions.value = res.data.list
  })
}

const alertStatusOptions = ref([
  {
    value: 1,
    label: 'New alert'
  },
  {
    value: 2,
    label: 'Confirm alert'
  },
  {
    value: 3,
    label: 'Clear alert'
  }
])

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  await initNotifyTemplateOption()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const returnFormData = await AlarmRuleApi.getRule(id)
      console.log('returnFormData ===== ', returnFormData)
      if (returnFormData.executeStrategy == 2) {
        returnFormData.timesValue = returnFormData.strategyValue
        returnFormData.minutesValue = 60
      } else if (returnFormData.executeStrategy == 3) {
        returnFormData.timesValue = 1
        returnFormData.minutesValue = returnFormData.strategyValue
      } else {
        returnFormData.timesValue = 1
        returnFormData.minutesValue = 60
      }
      const alertStatus = returnFormData.alertStatus
      if (alertStatus && alertStatus) {
        returnFormData.alertStatus = []
        const arr = alertStatus.split(',')
        for (const a of arr) {
          returnFormData.alertStatus.push(Number(a))
        }
      }
      formData.value = returnFormData
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
    if (formData.value.executeStrategy == 2) {
      formData.value.strategyValue = formData.value.timesValue
    } else if (formData.value.executeStrategy == 3) {
      formData.value.strategyValue = formData.value.minutesValue
    }
    const alertStatusArr = formData.value.alertStatus
    let alertStatusStr = ''
    if (alertStatusArr.length > 0) {
      alertStatusStr += formData.value.alertStatus.join()
    }
    const data = {
      ...formData.value,
      alertStatus: alertStatusStr
    }
    console.log('data ================= ', data)
    if (formType.value === 'create') {
      await AlarmRuleApi.createRule(data)
      message.success(t('common.createSuccess'))
    } else {
      await AlarmRuleApi.updateRule(data)
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
    ruleName: '',
    ruleType: '',
    monitorType: '',
    alertStatus: [],
    executeStrategy: 1,
    strategyValue: undefined,
    description: '',
    createTime: undefined,
    timesValue: 1,
    minutesValue: 60,
    rangeHour: 1,
    rangeTimes: 1
  }
  formRef.value?.resetFields()
}
</script>
