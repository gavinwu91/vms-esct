<template>
  <div class="basic-info-form">
    <Form ref="formRef" :labelWidth="120" :rules="rules" :schema="schema" class="vms-form">
      <template #sex="form">
        <el-radio-group v-model="form['sex']" class="vms-radio-group">
          <el-radio :value="1">{{ t('profile.user.man') }}</el-radio>
          <el-radio :value="2">{{ t('profile.user.woman') }}</el-radio>
        </el-radio-group>
      </template>
    </Form>
    <div class="form-actions mt-8 flex justify-center gap-4">
      <XButton :title="t('common.save')" type="primary" class="vms-btn-action" @click="submit()" />
      <XButton :title="t('common.reset')" type="default" class="vms-btn-secondary" @click="init()" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import { FormSchema } from '@/types/form'
import type { FormExpose } from '@/components/Form'
import {
  getUserProfile,
  updateUserProfile,
  UserProfileUpdateReqVO
} from '@/api/system/user/profile'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'BasicInfo' })

const { t } = useI18n()
const message = useMessage()
const userStore = useUserStore()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const rules = reactive<FormRules>({
  nickname: [{ required: true, message: t('profile.rules.nickname'), trigger: 'blur' }],
  email: [
    { required: true, message: t('profile.rules.mail'), trigger: 'blur' },
    { type: 'email', message: t('profile.rules.truemail'), trigger: ['blur', 'change'] }
  ],
  mobile: [
    { required: true, message: t('profile.rules.phone'), trigger: 'blur' },
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: t('profile.rules.truephone'), trigger: 'blur' }
  ]
})

const schema = reactive<FormSchema[]>([
  {
    field: 'nickname',
    label: t('profile.user.nickname'),
    component: 'Input'
  },
  {
    field: 'mobile',
    label: t('profile.user.mobile'),
    component: 'Input'
  },
  {
    field: 'email',
    label: t('profile.user.email'),
    component: 'Input'
  },
  {
    field: 'sex',
    label: t('profile.user.sex'),
    component: 'InputNumber',
    value: 0
  }
])

const formRef = ref<FormExpose>()
const submit = () => {
  const elForm = unref(formRef)?.getElFormRef()
  if (!elForm) return
  elForm.validate(async (valid) => {
    if (valid) {
      const data = unref(formRef)?.formModel as UserProfileUpdateReqVO
      await updateUserProfile(data)
      message.success(t('common.updateSuccess'))
      const profile = await init()
      userStore.setUserNicknameAction(profile.nickname)
      emit('success')
    }
  })
}

const init = async () => {
  const res = await getUserProfile()
  unref(formRef)?.setValues(res)
  return res
}

onMounted(async () => {
  await init()
})
</script>

<style lang="scss" scoped>
.basic-info-form {
  max-width: 600px;
  margin: 0 auto;
}

:deep(.vms-form) {
  .el-form-item__label {
    color: #94a3b8 !important;
    font-size: 13px !important;
  }

  .el-input__wrapper {
    background: rgba(15, 23, 42, 0.6) !important;
    border: 1px solid rgba(148, 163, 184, 0.1) !important;
    box-shadow: none !important;
    transition: all 0.3s;
    
    &:hover {
      border-color: rgba(56, 189, 248, 0.3) !important;
    }
    
    &.is-focus {
      border-color: #0ea5e9 !important;
      background: rgba(15, 23, 42, 0.8) !important;
    }
  }

  .el-input__inner {
    color: #f1f5f9 !important;
    font-size: 13px;
  }
}

:deep(.vms-radio-group) {
  .el-radio {
    color: #94a3b8;
    &.is-checked {
      .el-radio__label {
        color: #38bdf8;
      }
      .el-radio__inner {
        background: #38bdf8;
        border-color: #38bdf8;
      }
    }
    .el-radio__inner {
      background: transparent;
      border-color: rgba(148, 163, 184, 0.3);
    }
  }
}

.vms-btn-action {
  min-width: 120px;
  height: 40px;
  background: #0ea5e9 !important;
  border: none !important;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s;
  
  &:hover {
    background: #38bdf8 !important;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
  }
}

.vms-btn-secondary {
  min-width: 120px;
  height: 40px;
  background: rgba(148, 163, 184, 0.1) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  color: #94a3b8 !important;
  border-radius: 6px;
  
  &:hover {
    background: rgba(148, 163, 184, 0.2) !important;
    color: #f1f5f9 !important;
  }
}
</style>
