<template>
  <el-form
    v-show="getShow"
    ref="formLogin"
    :model="loginData.loginForm"
    :rules="LoginRules"
    class="login-form"
    label-position="top"
    label-width="120px"
    size="large"
  >
    <el-row style="margin-right: -10px; margin-left: -10px">
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
         <div class="login-logo-div">
           <img src="@/assets/imgs/logo.png" class="login-logo-image"/>
           <h2 class="login-logo-title">
             منظومة سحاب المرئية
           </h2>
         </div>
      </el-col>

      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="username">
          <el-input class="loginInput"
            v-model="loginData.loginForm.username"
            :placeholder="t('login.usernamePlaceholder')"
            :prefix-icon="iconAvatar"
          />
        </el-form-item>
      </el-col>

      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="password">
          <el-input class="loginInput"
            v-model="loginData.loginForm.password"
            :placeholder="t('login.passwordPlaceholder')"
            :prefix-icon="iconLock"
            show-password
            type="password"
            @keyup.enter="getCode()"
          />
        </el-form-item>
      </el-col>

      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.login')"
            class="w-[100%] loginBtn"
            type="primary"
            @click="getCode()"
          />
        </el-form-item>
      </el-col>

      <Verify
        v-if="loginData.captchaEnable === 'true'"
        ref="verify"
        :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }"
        mode="pop"
        @success="handleLogin"
      />

    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import { ElLoading } from 'element-plus'
import LoginFormTitle from './LoginFormTitle.vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { useIcon } from '@/hooks/web/useIcon'

import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()
const message = useMessage()
const iconHouse = useIcon({ icon: 'ep:house' })
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
const captchaType = ref('blockPuzzle') // blockPuzzle 滑块 clickWord 点击文字

const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN)

const LoginRules = {
  tenantName: [required],
  username: [required],
  password: [required]
}
const loginData = reactive({
  isShowPassword: false,
  captchaEnable: 'false', // import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
    username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
    password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
    captchaVerification: '',
    rememberMe: true // 默认记录我。如果不需要，可手动修改
  }
})

const socialList = [
  { icon: 'ant-design:wechat-filled', type: 30 },
  { icon: 'ant-design:dingtalk-circle-filled', type: 20 },
  { icon: 'ant-design:github-filled', type: 0 },
  { icon: 'ant-design:alipay-circle-filled', type: 0 }
]

// 获取验证码
const getCode = async () => {
  // 情况一，未开启：则直接登录
  if (loginData.captchaEnable === 'false') {
    await handleLogin({})
  } else {
    // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
    // 弹出验证码
    verify.value.show()
  }
}
// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
    console.log("getTenantId:",res)
    authUtil.setTenantId(res)
  }
}
// 记住我
const getLoginFormCache = () => {
  const loginForm = authUtil.getLoginForm()
  if (loginForm) {
    loginData.loginForm = {
      ...loginData.loginForm,
      username: loginForm.username ? loginForm.username : loginData.loginForm.username,
      password: loginForm.password ? loginForm.password : loginData.loginForm.password,
      rememberMe: loginForm.rememberMe,
      tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
    }
  }
}
// 根据域名，获得租户信息
const getTenantByWebsite = async () => {
  const website = location.host
  const res = await LoginApi.getTenantByWebsite(website)
  if (res) {
    loginData.loginForm.tenantName = res.name
    authUtil.setTenantId(res.id)
  }
}
const loading = ref() // ElLoading.service 返回的实例
// 登录
const handleLogin = async (params: any) => {
  loginLoading.value = true
  try {
    // await getTenantId()
    const data = await validForm()
    if (!data) {
      return
    }
    const loginDataLoginForm = { ...loginData.loginForm }
    loginDataLoginForm.captchaVerification = params.captchaVerification
    // const res = await LoginApi.login(loginDataLoginForm)
    const res = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      id: 1,
      userId: 1,
      userType: 1,
      clientId: 'test-client',
      expiresTime: Date.now() + 3600000
    }
    console.log("login:",res)
    if (!res) {
      return
    }
    loading.value = ElLoading.service({
      lock: true,
      text: 'Loading...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    if (loginDataLoginForm.rememberMe) {
      authUtil.setLoginForm(loginDataLoginForm)
    } else {
      authUtil.removeLoginForm()
    }
    authUtil.setToken(res)
    if (!redirect.value) {
      redirect.value = '/index'
    }
    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      await push({ path: redirect.value })
    }
  } finally {
    loginLoading.value = false
    loading.value.close()
  }
}

// 社交登录
const doSocialLogin = async (type: number) => {
  if (type === 0) {
    message.error('此方式未配置')
  } else {
    loginLoading.value = true
    if (loginData.tenantEnable === 'true') {
      // 尝试先通过 tenantName 获取租户
      await getTenantId()
      // 如果获取不到，则需要弹出提示，进行处理
      if (!authUtil.getTenantId()) {
        try {
          const data = await message.prompt('Please input租户名称', t('common.reminder'))
          if (data?.action !== 'confirm') throw 'cancel'
          const res = await LoginApi.getTenantIdByName(data.value)
          authUtil.setTenantId(res)
        } catch (error) {
          if (error === 'cancel') return
        } finally {
          loginLoading.value = false
        }
      }
    }
    // 计算 redirectUri
    // 注意: type、redirect 需要先 encode 一次，否则钉钉回调会丢失。
    // 配合 social-login.vue#getUrlValue() 使用
    const redirectUri =
      location.origin +
      '/social-login?' +
      encodeURIComponent(`type=${type}&redirect=${redirect.value || '/'}`)

    // 进行跳转
    window.location.href = await LoginApi.socialAuthRedirect(type, encodeURIComponent(redirectUri))
  }
}
watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)
onMounted(() => {
  getLoginFormCache()
  getTenantByWebsite()
})
</script>

<style lang="scss" scoped>
.login-form{
  --el-color-primary:#2ab5fc ;
  .loginBtn{
    margin-top: 30px;
    height: 44px;
    max-height: 44px;
    font-size: 16px;
    font-weight: 200;
    border-radius: 20px;
    background: #2ab5fc;
  }
  .loginInput{
    :deep(.el-input__wrapper){
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: none;
      border-radius: 32px;
      /* height: 44px; */
      position: relative;
      width: 100%;
      min-width: 0;
      padding: 4px 11px;
      font-size: 14px;
      line-height: 1.5715;
      box-shadow: none;
      margin-bottom: 13px;
      transition: all 0.4s;
      display: inline-flex;
      color: #fff;
    }
    :deep(.el-input__wrapper:hover){
      border: 1px solid #40a9ff;
    }
    :deep(.el-input__prefix){
      .el-icon{
        color:#40a9ff;
      }
    }
    :deep(.el-input__inner){
      color: #fff !important;
      height:44px;
    }
    :deep(.el-input__inner::placeholder){
      color: #666 !important;
    }
  }

}



.login-logo-div{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom:20px;
  .login-logo-image{
    width: 60px;
    margin: 24px auto;
  }
  .login-logo-title{
    margin-bottom: 44px;
    text-align: center;
    //letter-spacing: 0.1em;
    font-size: 26px;
    color: #ffffff;
  }
}
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}

.login-code {
  float: right;
  width: 100%;
  height: 38px;

  img {
    width: 100%;
    height: auto;
    max-width: 100px;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>
