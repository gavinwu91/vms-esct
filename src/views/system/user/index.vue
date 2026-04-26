<template>
  <el-row :gutter="20">
    <!-- 左侧部门树 -->
    <el-col :span="4" :xs="24">
      <ContentWrap class="h-1/1">
        <DeptTree @node-click="handleDeptNodeClick" />
      </ContentWrap>
    </el-col>
    <el-col :span="20" :xs="24">
      <!-- 搜索 -->
      <ContentWrap>
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          size="default"
          label-width="120px"
        >
          <el-form-item label="User Name" prop="username">
            <el-input
              v-model="queryParams.username"
              placeholder="Please input user name"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="Phone Number" prop="mobile">
            <el-input
              v-model="queryParams.mobile"
              placeholder="Please input Phone number"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="Please select user Status"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Create Time" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              start-placeholder="Begin date"
              end-placeholder="End date"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button class="vms-main-button" @click="handleQuery"><Icon icon="ep:search" />Search</el-button>
            <el-button class="vms-reset-button" @click="resetQuery"><Icon icon="ep:refresh" />Reset</el-button>
            <el-button
              type="primary"
              plain
              class="vms-main-button"
              @click="openForm('create')"
              v-hasPermi="['system:user:create']"
            >
              <Icon icon="ep:plus" /> Add
            </el-button>
            <el-button
              type="warning"
              plain
              class="vms-track-button"
              @click="handleImport"
              v-hasPermi="['system:user:import']"
            >
              <Icon icon="ep:upload" /> Import
            </el-button>
            <el-button
              type="success"
              plain
              class="vms-track-button"
              @click="handleExport"
              :loading="exportLoading"
              v-hasPermi="['system:user:export']"
            >
              <Icon icon="ep:download" />Export
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <ContentWrap>
        <el-table v-loading="loading" :data="list" size="default">
          <el-table-column label="User ID" align="center" key="id" prop="id" />
          <el-table-column
            label="Account"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="User Name"
            align="center"
            prop="nickname"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Dept"
            align="center"
            key="deptName"
            prop="deptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Phone Number" align="center" prop="mobile" width="130"  />
          <el-table-column label="Status" key="status">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="handleStatusChange(scope.row)"
                :disabled="!checkPermi(['system:user:update'])"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="Create Time"
            align="center"
            prop="createTime"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column label="Operate" align="center" width="160">
            <template #default="scope">
              <div class="flex items-center justify-center">
                <el-button
                  type="primary"
                  link
                  @click="openForm('update', scope.row.id)"
                  v-hasPermi="['system:user:update']"
                >
                  <Icon icon="ep:edit" />Modify
                </el-button>
                <el-dropdown
                  @command="(command) => handleCommand(command, scope.row)"
                  v-hasPermi="[
                    'system:user:delete',
                    'system:user:update-password',
                    'system:permission:assign-user-role'
                  ]"
                >
                  <el-button type="primary" link><Icon icon="ep:d-arrow-right" /> More</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        command="handleDelete"
                        v-if="checkPermi(['system:user:delete'])"
                      >
                        <Icon icon="ep:delete" />Delete
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleResetPwd"
                        v-if="checkPermi(['system:user:update-password'])"
                      >
                        <Icon icon="ep:key" />Reset password
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="handleRole"
                        v-if="checkPermi(['system:permission:assign-user-role'])"
                      >
                        <Icon icon="ep:circle-check" />Assign role
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          :total="total"
          v-model:page="queryParams.pageNo"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </ContentWrap>
    </el-col>
  </el-row>

  <!-- 添加或修改用户对话框 -->
  <UserForm ref="formRef" @success="getList" />
  <!-- 用户导入对话框 -->
  <UserImportForm ref="importFormRef" @success="getList" />
  <!-- 分配Role -->
  <UserAssignRoleForm ref="assignRoleFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserApi from '@/api/system/user'
import UserForm from './UserForm.vue'
import UserImportForm from './UserImportForm.vue'
import UserAssignRoleForm from './UserAssignRoleForm.vue'
import DeptTree from './DeptTree.vue'

defineOptions({ name: 'SystemUser' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 处理部门被点击 */
const handleDeptNodeClick = async (row) => {
  queryParams.deptId = row.id
  await getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 用户导入 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** 修改用户 Status */
const handleStatusChange = async (row: UserApi.UserVO) => {
  try {
    // 修改 Status的二次确认
    const text = row.status === CommonStatusEnum.ENABLE ? 'Enable' : 'Disable'
    await message.confirm('Sure want to "' + text + '""' + row.username + '" User?')
    // 发起修改 Status
    await UserApi.updateUserStatus(row.id, row.status)
    // 刷新列表
    await getList()
  } catch {
    // 取消后，进行恢复按钮
    row.status =
      row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** 导出按钮操作 */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserApi.exportUser(queryParams)
    download.excel(data, 'User data.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 操作分发 */
const handleCommand = (command: string, row: UserApi.UserVO) => {
  switch (command) {
    case 'handleDelete':
      handleDelete(row.id)
      break
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleRole':
      handleRole(row)
      break
    default:
      break
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserApi.deleteUser(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 重置密码 */
const handleResetPwd = async (row: UserApi.UserVO) => {
  try {
    // 重置的二次确认
    const result = await message.prompt(
      'Please input"' + row.username + '" new password',
      t('common.reminder')
    )
    const password = result.value
    // 发起重置
    await UserApi.resetUserPassword(row.id, password)
    message.success('Modify success,new password is: ' + password)
  } catch {}
}

/** 分配Role */
const assignRoleFormRef = ref()
const handleRole = (row: UserApi.UserVO) => {
  assignRoleFormRef.value.open(row)
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
<style lang="scss" scoped>
:deep(.el-table) {
  background-color: transparent !important;
  --el-table-border-color: rgba(148, 163, 184, 0.1) !important;
  --el-table-header-bg-color: rgba(15, 23, 42, 0.6) !important;
  --el-table-tr-bg-color: transparent !important;
  --el-table-row-hover-bg-color: rgba(56, 189, 248, 0.08) !important;

  header {
    background-color: transparent !important;
  }

  .el-table__header-wrapper th {
    color: #e2e8f0 !important;
    font-weight: 600 !important;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.2) !important;
  }

  .el-table__row {
    td {
      color: #94a3b8 !important;
      border-bottom: 1px solid rgba(148, 163, 184, 0.05) !important;
    }
    
    &:last-child td {
      border-bottom: none !important;
    }
  }

  .el-button--link {
    color: #38bdf8 !important;
    &:hover {
      color: #7dd3fc !important;
    }
  }
}

:deep(.el-form) {
  .el-form-item__label {
    color: #94a3b8 !important;
    font-weight: 500 !important;
  }

  .el-input__wrapper, .el-select__wrapper, .el-range-editor.el-input__wrapper {
    background-color: rgba(15, 23, 42, 0.4) !important;
    border: 1px solid rgba(56, 189, 248, 0.15) !important;
    box-shadow: none !important;
    border-radius: 8px !important;
    
    &:hover, &.is-active, &.is-focus {
      border-color: rgba(56, 189, 248, 0.5) !important;
      background-color: rgba(15, 23, 42, 0.6) !important;
    }

    .el-input__inner, .el-range-input {
      color: #e2e8f0 !important;
    }
    
    .el-range-separator {
      color: #64748b !important;
    }
  }
}

:deep(.v-content-wrap),
:deep(.el-card) {
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(148, 163, 184, 0.1) !important;
  border-radius: 12px !important;
  margin-bottom: 16px !important;
  color: #e2e8f0 !important;

  .el-card__header {
    border-bottom: 1px solid rgba(148, 163, 184, 0.1) !important;
    color: #38bdf8 !important;
    font-weight: 600 !important;
  }
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent !important;
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.05) !important;
  --el-pagination-hover-color: #38bdf8 !important;
  margin-top: 20px !important;
  justify-content: flex-end !important;
  
  .el-pager li {
    background-color: rgba(255, 255, 255, 0.05) !important;
    color: #94a3b8 !important;
    border-radius: 4px !important;
    margin: 0 3px !important;
    
    &.is-active {
      background-color: #0ea5e9 !important;
      color: #fff !important;
    }
  }
}
</style>
