<template>
  <el-form
    v-show="getShow"
    ref="formLogin"
    :model="loginData.loginForm"
    :rules="LoginRules"
    class="login-form-content"
    label-position="top"
    size="large"
  >
    <div class="login-header">
      <img src="@/assets/imgs/logo.png" class="login-logo" />
      <h2 class="login-title">منظومة سحاب المرئية</h2>
      <p class="login-subtitle">Cloud Surveillance Command Center</p>
    </div>

    <div class="input-group">
      <el-form-item prop="username">
        <el-input
          v-model="loginData.loginForm.username"
          :placeholder="t('login.usernamePlaceholder')"
          :prefix-icon="iconAvatar"
          class="tactical-input"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginData.loginForm.password"
          :placeholder="t('login.passwordPlaceholder')"
          :prefix-icon="iconLock"
          show-password
          type="password"
          class="tactical-input"
          @keyup.enter="getCode()"
        />
      </el-form-item>
    </div>

    <el-form-item class="submit-item">
      <XButton
        :loading="loginLoading"
        :title="t('login.login')"
        class="tactical-btn"
        type="primary"
        @click="getCode()"
      />
    </el-form-item>

    <Verify
      v-if="loginData.captchaEnable === 'true'"
      ref="verify"
      :captchaType="captchaType"
      :imgSize="{ width: '400px', height: '200px' }"
      mode="pop"
      @success="handleLogin"
    />
  </el-form>
</template>

<script lang="ts" setup>
import { ElLoading } from 'element-plus'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useIcon } from '@/hooks/web/useIcon'
import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()
const message = useMessage()
const iconAvatar = useIcon({ icon: 'ep:avatar' })
const iconLock = useIcon({ icon: 'ep:lock' })
const formLogin = ref()
const { validForm } = useFormValid(formLogin)
const { setLoginState, getLoginState } = useLoginState()
const { currentRoute, push } = useRouter()
const permissionStore = usePermissionStore()
const redirect = ref<string>('')
const loginLoading = ref(false)
const verify = ref()
const captchaType = ref('blockPuzzle')

const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN)

const LoginRules = {
  username: [required],
  password: [required]
}

const loginData = reactive({
  isShowPassword: false,
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
    username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
    password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
    captchaVerification: '',
    rememberMe: true
  }
})

const getCode = async () => {
  if (loginData.captchaEnable === 'false') {
    await handleLogin({})
  } else {
    verify.value.show()
  }
}

const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
    authUtil.setTenantId(res)
  }
}

const getLoginFormCache = () => {
  const loginForm = authUtil.getLoginForm()
  if (loginForm) {
    loginData.loginForm = {
      ...loginData.loginForm,
      username: loginForm.username || loginData.loginForm.username,
      password: loginForm.password || loginData.loginForm.password,
      rememberMe: loginForm.rememberMe,
      tenantName: loginForm.tenantName || loginData.loginForm.tenantName
    }
  }
}

const getTenantByWebsite = async () => {
  const website = location.host
  const res = await LoginApi.getTenantByWebsite(website)
  if (res) {
    loginData.loginForm.tenantName = res.name
    authUtil.setTenantId(res.id)
  }
}

const loading = ref()

const handleLogin = async (params: any) => {
  loginLoading.value = true
  try {
    await getTenantId()
    const data = await validForm()
    if (!data) return

    const loginDataLoginForm = { ...loginData.loginForm }
    loginDataLoginForm.captchaVerification = params.captchaVerification
    const res = await LoginApi.login(loginDataLoginForm)
    
    if (!res) return

    loading.value = ElLoading.service({
      lock: true,
      text: 'Authenticating...',
      background: 'rgba(2, 6, 23, 0.8)'
    })

    if (loginDataLoginForm.rememberMe) {
      authUtil.setLoginForm(loginDataLoginForm)
    } else {
      authUtil.removeLoginForm()
    }
    authUtil.setToken(res)
    
    const targetPath = (redirect.value && redirect.value.indexOf('sso') === -1) 
      ? redirect.value 
      : '/index'
    
    await push({ path: targetPath })
  } finally {
    loginLoading.value = false
    if (loading.value) loading.value.close()
  }
}

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  { immediate: true }
)

onMounted(() => {
  getLoginFormCache()
  getTenantByWebsite()
})
</script>

<style lang="scss" scoped>
.login-form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  .login-logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.5));
  }

  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .login-subtitle {
    font-size: 12px;
    color: rgba(148, 163, 184, 0.6);
    text-transform: uppercase;
    letter-spacing: 2px;
  }
}

.tactical-input {
  :deep(.el-input__wrapper) {
    background: rgba(15, 23, 42, 0.5) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    height: 48px;
    padding: 0 16px;
    transition: all 0.3s;

    &:hover {
      border-color: rgba(56, 189, 248, 0.4) !important;
    }

    &.is-focus {
      border-color: #38bdf8 !important;
      background: rgba(15, 23, 42, 0.8) !important;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.2) !important;
    }
  }

  :deep(.el-input__inner) {
    color: #fff !important;
    font-size: 14px;
    &::placeholder {
      color: rgba(148, 163, 184, 0.4);
    }
  }

  :deep(.el-input__prefix-icon) {
    color: rgba(56, 189, 248, 0.8) !important;
    font-size: 18px;
  }
}

.tactical-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  border: none;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%);
  }

  &:active {
    transform: translateY(0);
  }
}

.submit-item {
  margin-top: 10px;
  margin-bottom: 0;
}

:deep(.el-form-item__error) {
  padding-top: 4px;
  color: #ef4444;
  font-size: 12px;
}
</style>
