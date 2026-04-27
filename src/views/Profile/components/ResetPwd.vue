<template>
  <div class="reset-pwd-form">
    <el-form ref="formRef" :model="password" :rules="rules" :label-width="120" class="vms-form">
      <el-form-item :label="t('profile.password.oldPassword')" prop="oldPassword">
        <InputPassword v-model="password.oldPassword" class="vms-pwd-input" />
      </el-form-item>
      <el-form-item :label="t('profile.password.newPassword')" prop="newPassword">
        <InputPassword v-model="password.newPassword" strength class="vms-pwd-input" />
      </el-form-item>
      <el-form-item :label="t('profile.password.confirmPassword')" prop="confirmPassword">
        <InputPassword v-model="password.confirmPassword" strength class="vms-pwd-input" />
      </el-form-item>
      <div class="form-actions mt-10 flex justify-center gap-4">
        <XButton :title="t('common.save')" type="primary" class="vms-btn-action" @click="submit(formRef)" />
        <XButton :title="t('common.reset')" type="default" class="vms-btn-secondary" @click="reset(formRef)" />
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { InputPassword } from '@/components/InputPassword'
import { updateUserPassword } from '@/api/system/user/profile'

defineOptions({ name: 'ResetPwd' })

const { t } = useI18n()
const message = useMessage()
const formRef = ref<FormInstance>()
const password = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const equalToPassword = (_rule, value, callback) => {
  if (password.newPassword !== value) {
    callback(new Error(t('profile.password.diffPwd')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: t('profile.password.oldPwdMsg'), trigger: 'blur' },
    { min: 6, max: 20, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('profile.password.newPwdMsg'), trigger: 'blur' },
    { min: 6, max: 20, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('profile.password.cfPwdMsg'), trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      await updateUserPassword(password.oldPassword, password.newPassword)
      message.success(t('common.updateSuccess'))
      reset(formEl)
    }
  })
}

const reset = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<style lang="scss" scoped>
.reset-pwd-form {
  max-width: 600px;
  margin: 0 auto;
}

:deep(.vms-form) {
  .el-form-item__label {
    color: #94a3b8 !important;
    font-size: 13px !important;
  }
}

:deep(.vms-pwd-input) {
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

  .el-input__suffix {
    color: #38bdf8 !important;
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
