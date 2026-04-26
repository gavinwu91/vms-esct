<template>
  <el-form
    v-show="getShow"
    ref="formLogin"
    :model="loginData.loginForm"
    :rules="LoginRules"
    class="login-terminal-form"
    label-position="top"
    size="large"
  >
    <div class="auth-header">
      <div class="auth-title">SECURITY AUTHORIZATION</div>
      <div class="auth-divider">
        <div class="line"></div>
        <div class="dot"></div>
      </div>
    </div>

    <div class="input-section">
      <el-form-item prop="username">
        <div class="field-label">USER_IDENTIFIER</div>
        <el-input
          v-model="loginData.loginForm.username"
          placeholder="ENTER ID"
          :prefix-icon="iconAvatar"
          class="terminal-input"
        />
      </el-form-item>

      <el-form-item prop="password">
        <div class="field-label">PASS_CODE</div>
        <el-input
          v-model="loginData.loginForm.password"
          placeholder="••••••••"
          :prefix-icon="iconLock"
          show-password
          type="password"
          class="terminal-input"
          @keyup.enter="getCode()"
        />
      </el-form-item>
    </div>

    <div class="security-info">
      <div class="info-row">
        <span>ENCRYPTION</span>
        <span class="val">AES-256</span>
      </div>
      <div class="info-row">
        <span>PERMISSION_LEVEL</span>
        <span class="val">LEVEL_04</span>
      </div>
    </div>

    <el-form-item class="submit-item">
      <XButton
        :loading="loginLoading"
        title="INITIALIZE ACCESS"
        class="terminal-btn"
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
const iconAvatar = useIcon({ icon: 'ep:user' })
const iconLock = useIcon({ icon: 'ep:key' })
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
      text: 'AUTHORIZING SYSTEM ACCESS...',
      background: 'rgba(2, 6, 23, 0.9)'
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
.login-terminal-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-header {
  margin-bottom: 20px;
  .auth-title {
    font-size: 14px;
    color: #38bdf8;
    letter-spacing: 3px;
    font-weight: 600;
  }
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    .line { height: 1px; flex: 1; background: linear-gradient(90deg, #38bdf8, transparent); }
    .dot { width: 4px; height: 4px; background: #38bdf8; transform: rotate(45deg); }
  }
}

.field-label {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.terminal-input {
  :deep(.el-input__wrapper) {
    background: rgba(15, 23, 42, 0.8) !important;
    border: 1px solid rgba(56, 189, 248, 0.2) !important;
    border-radius: 4px !important;
    box-shadow: none !important;
    height: 52px;
    padding: 0 16px;
    transition: all 0.3s;

    &:hover { border-color: rgba(56, 189, 248, 0.5) !important; }

    &.is-focus {
      border-color: #38bdf8 !important;
      background: rgba(15, 23, 42, 1) !important;
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.15) !important;
    }
  }

  :deep(.el-input__inner) {
    color: #fff !important;
    font-family: 'Courier New', monospace;
    font-size: 15px;
    &::placeholder { color: rgba(148, 163, 184, 0.2); }
  }

  :deep(.el-input__prefix-icon) {
    color: #38bdf8 !important;
  }
}

.security-info {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  padding: 12px;
  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: rgba(148, 163, 184, 0.4);
    margin-bottom: 6px;
    &:last-child { margin-bottom: 0; }
    .val { color: rgba(34, 211, 238, 0.6); }
  }
}

.terminal-btn {
  width: 100%;
  height: 56px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid #38bdf8;
  color: #38bdf8;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.2), transparent);
    transition: 0.5s;
  }

  &:hover {
    background: rgba(56, 189, 248, 0.1);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
    &::before { left: 100%; }
  }
}

.submit-item { margin-bottom: 0; }

:deep(.el-form-item__error) {
  font-family: monospace;
  font-size: 10px;
  text-transform: uppercase;
}
</style>
