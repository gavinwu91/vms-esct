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
          <el-form-item v-if="formData.id === undefined" label="Account" prop="username">
            <el-input v-model="formData.username" placeholder="Please input account" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Dept" prop="deptId">
            <el-tree-select
              v-model="formData.deptId"
              :data="deptList"
              :props="defaultProps"
              check-strictly
              node-key="id"
              placeholder="Please select dept"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Phone Number" prop="mobile">
            <el-input
              v-model="formData.mobile"
              maxlength="11"
              placeholder="Please input Phone number"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Email" prop="email">
            <el-input v-model="formData.email" maxlength="50" placeholder="Please input Email" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Real Name" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="Please input real name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="formData.id === undefined" label="Password" prop="password">
            <el-input
              v-model="formData.password"
              placeholder="Please input password"
              show-password
              type="password"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item v-if="formData.id === undefined" label="RePassword" prop="repeatPassword">
            <el-input
              v-model="formData.repeatPassword"
              placeholder="Please input repeat password"
              show-password
              type="password"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- <el-row>
        <el-col :span="12">
          <el-form-item label="Gender">
            <el-select v-model="formData.sex" placeholder="Please select ">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Post ">
            <el-select v-model="formData.postIds" multiple placeholder="Please select ">
              <el-option
                v-for="item in postList"
                :key="item.id"
                :label="item.name"
                :value="item.id!"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row> -->
      <el-row>
        <el-col :span="24">
          <el-form-item label="Remark">
            <el-input
              v-model="formData.remark"
              placeholder="Please input Content"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm" class="vms-main-button"
        >Confirm</el-button
      >
      <el-button @click="dialogVisible = false" class="vms-cancel-button">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'
import * as PostApi from '@/api/system/post'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { FormRules } from 'element-plus'

defineOptions({ name: 'SystemUserForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  nickname: '',
  deptId: '',
  mobile: '',
  email: '',
  id: undefined,
  username: '',
  password: '',
  repeatPassword: '',
  sex: undefined,
  postIds: [],
  remark: '',
  status: CommonStatusEnum.ENABLE,
  roleIds: []
})
const formRules = reactive<FormRules>({
  username: [{ required: true, message: 'Username can not empty', trigger: 'blur' }],
  nickname: [{ required: true, message: 'Nick name can not empty', trigger: 'blur' }],
  password: [{ required: true, message: 'Password can not empty', trigger: 'blur' }],
  email: [
    {
      type: 'email',
      message: 'Please input correct Email Address',
      trigger: ['blur', 'change']
    }
  ],
  mobile: [
    {
      pattern: /^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/,
      message: 'Please input correct Phone number',
      trigger: 'blur'
    }
  ],
  repeatPassword: [
    { required: true, message: 'Repeat Password can not empty', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please confirm password!'))
        } else if (value !== formData.value.password) {
          callback(new Error('Password not match!'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    }
  ]
})
const formRef = ref() // 表单 Ref
const deptList = ref<Tree[]>([]) // 树形结构
const postList = ref([] as PostApi.PostVO[]) // 岗位列表

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
      formData.value = await UserApi.getUser(id)
    } finally {
      formLoading.value = false
    }
  }
  // 加载部门树
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  // 加载岗位列表
  postList.value = await PostApi.getSimplePostList()
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
    const data = formData.value as unknown as UserApi.UserVO
    if (formType.value === 'create') {
      await UserApi.createUser(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserApi.updateUser(data)
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
    nickname: '',
    deptId: '',
    mobile: '',
    email: '',
    id: undefined,
    username: '',
    password: '',
    sex: undefined,
    postIds: [],
    remark: '',
    status: CommonStatusEnum.ENABLE,
    roleIds: []
  }
  formRef.value?.resetFields()
}
</script>
<style lang="scss" scoped>
:deep(.el-form) {
  .el-form-item__label {
    color: #94a3b8 !important;
    font-weight: 500 !important;
  }

  .el-input__wrapper, .el-select__wrapper, .el-tree-select .el-input__wrapper {
    background-color: rgba(15, 23, 42, 0.6) !important;
    border: 1px solid rgba(56, 189, 248, 0.2) !important;
    box-shadow: none !important;
    border-radius: 8px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover, &.is-focus {
      border-color: rgba(56, 189, 248, 0.6) !important;
      background-color: rgba(15, 23, 42, 0.8) !important;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.1) !important;
    }

    .el-input__inner {
      color: #e2e8f0 !important;
    }
  }

  .el-textarea__inner {
    background-color: rgba(15, 23, 42, 0.6) !important;
    border: 1px solid rgba(56, 189, 248, 0.2) !important;
    border-radius: 8px !important;
    color: #e2e8f0 !important;
    
    &:focus {
      border-color: rgba(56, 189, 248, 0.6) !important;
      background-color: rgba(15, 23, 42, 0.8) !important;
      box-shadow: none !important;
    }
  }
}

:deep(.el-tree-select) {
  width: 100% !important;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid rgba(148, 163, 184, 0.1) !important;
  padding-top: 20px !important;
}
</style>
