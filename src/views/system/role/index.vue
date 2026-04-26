<template>

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      size="default"
      :model="queryParams"
      class="-mb-15px"
      label-width="120px"
    >
      <el-form-item label="Role  Name" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="Please input Role Name"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Role  mark" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="Please input Role mark"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="Please select Status">
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
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="End date"
          start-placeholder="Begin date"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery" class="vms-main-button">
          <Icon class="mr-5px" icon="ep:search" />
          Search
        </el-button>
        <el-button @click="resetQuery" class="vms-reset-button">
          <Icon class="mr-5px" icon="ep:refresh" />
          Reset
        </el-button>
        <el-button
          v-hasPermi="['system:role:create']"
          plain
          type="primary"
          class="vms-main-button"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          Add
        </el-button>
        <el-button
          v-hasPermi="['system:role:export']"
          :loading="exportLoading"
          plain
          type="success"
          class="vms-track-button"
          @click="handleExport"
        >
          <Icon class="mr-5px" icon="ep:download" />
          Export
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" size="default">
      <el-table-column align="center" label="Role Code" prop="id" />
      <el-table-column align="center" label="Role  Name" prop="name" />
      <el-table-column label="Role  Type" align="center" prop="type">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_ROLE_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="Role  mark" prop="code" />
      <el-table-column align="center" label="Sort" prop="sort" />
      <el-table-column align="center" label="Remark" prop="remark" />
      <el-table-column align="center" label="Status" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="Create Time"
        prop="createTime"
        width="180"
      />
      <el-table-column :width="300" align="center" label="Operate">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:role:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
          Modify
        </el-button>
          <el-button
            v-hasPermi="['system:permission:assign-role-menu']"
            link
            preIcon="ep:basketball"
            title="Menu permission"
            type="primary"
            @click="openAssignMenuForm(scope.row)"
          >
            Menu permission
          </el-button>
          <el-button
            v-hasPermi="['system:permission:assign-role-data-scope']"
            link
            preIcon="ep:coin"
            title="Data Permission"
            type="primary"
            @click="openDataPermissionForm(scope.row)"
          >
            Data Permission
          </el-button>
          <el-button
            v-hasPermi="['system:role:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <RoleForm ref="formRef" @success="getList" />
  <!-- 表单弹窗：菜单权限 -->
  <RoleAssignMenuForm ref="assignMenuFormRef" @success="getList" />
  <!-- 表单弹窗：数据权限 -->
  <RoleDataPermissionForm ref="dataPermissionFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as RoleApi from '@/api/system/role'
import RoleForm from './RoleForm.vue'
import RoleAssignMenuForm from './RoleAssignMenuForm.vue'
import RoleDataPermissionForm from './RoleDataPermissionForm.vue'

defineOptions({ name: 'SystemRole' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: '',
  name: '',
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询角色列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RoleApi.getRolePage(queryParams)
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
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 数据权限操作 */
const dataPermissionFormRef = ref()
const openDataPermissionForm = async (row: RoleApi.RoleVO) => {
  dataPermissionFormRef.value.open(row)
}

/** 菜单权限操作 */
const assignMenuFormRef = ref()
const openAssignMenuForm = async (row: RoleApi.RoleVO) => {
  assignMenuFormRef.value.open(row)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await RoleApi.deleteRole(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await RoleApi.exportRole(queryParams)
    download.excel(data, 'Role list.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
