<template>
  <Dialog v-model="dialogVisible" title="Assign role">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="121px">
      <el-form-item label="User Name">
        <el-input v-model="formData.username" :disabled="true" />
      </el-form-item>
      <el-form-item label="Nick Name">
        <el-input v-model="formData.nickname" :disabled="true" />
      </el-form-item>
      <el-form-item label="Role ">
        <el-select v-model="formData.roleIds" multiple placeholder="Please select Role">
          <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm" class="vms-main-button">Confirm</el-button>
      <el-button @click="dialogVisible = false" class="vms-cancel-button">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as PermissionApi from '@/api/system/permission'
import * as UserApi from '@/api/system/user'
import * as RoleApi from '@/api/system/role'

defineOptions({ name: 'SystemUserAssignRoleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: -1,
  nickname: '',
  username: '',
  roleIds: []
})
const formRef = ref() // 表单 Ref
const roleList = ref([] as RoleApi.RoleVO[]) // 角色的列表

/** 打开弹窗 */
const open = async (row: UserApi.UserVO) => {
  dialogVisible.value = true
  resetForm()
  // 设置数据
  formData.value.id = row.id
  formData.value.username = row.username
  formData.value.nickname = row.nickname
  // 获得角色拥有的菜单集合
  formLoading.value = true
  try {
    formData.value.roleIds = await PermissionApi.getUserRoleList(row.id)
  } finally {
    formLoading.value = false
  }
  // 获得角色列表
  roleList.value = await RoleApi.getSimpleRoleList()
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
    await PermissionApi.assignUserRole({
      userId: formData.value.id,
      roleIds: formData.value.roleIds
    })
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success', true)
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: -1,
    nickname: '',
    username: '',
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

  .el-input__wrapper, .el-select__wrapper {
    background-color: rgba(15, 23, 42, 0.6) !important;
    border: 1px solid rgba(56, 189, 248, 0.2) !important;
    box-shadow: none !important;
    border-radius: 8px !important;
    
    &.is-disabled {
      background-color: rgba(15, 23, 42, 0.3) !important;
      border-color: rgba(148, 163, 184, 0.1) !important;
      .el-input__inner {
        color: #64748b !important;
      }
    }

    &:not(.is-disabled):hover, &:not(.is-disabled).is-focus {
      border-color: rgba(56, 189, 248, 0.6) !important;
    }

    .el-input__inner {
      color: #e2e8f0 !important;
    }
  }

  .el-select .el-select__tags .el-tag {
    background: rgba(56, 189, 248, 0.15) !important;
    border-color: rgba(56, 189, 248, 0.3) !important;
    color: #38bdf8 !important;
  }
}
</style>
