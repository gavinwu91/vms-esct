<template>
  <!-- 搜索工作栏 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      size="default"
      label-width="120px"
    >
      <el-form-item label="Dept name" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="Please input Dept name"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="Dept Status" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Please select Dept Status"
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
      <el-form-item>
        <el-button class="vms-main-button" @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button class="vms-reset-button" @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['system:dept:create']"
          class="vms-main-button"
        >
          <Icon icon="ep:plus" class="mr-5px" /> Add
        </el-button>
        <el-button type="danger" plain @click="toggleExpandAll" class="vms-track-button">
          <Icon icon="ep:sort" class="mr-5px" /> Expand/Collapse
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      size="default"
      v-loading="loading"
      :data="list"
      row-key="id"
      :default-expand-all="isExpandAll"
      v-if="refreshTable"
    >
      <el-table-column prop="name" label="Dept name" />
      <el-table-column prop="leader" label="Leader">
        <template #default="scope">
          {{ userList.find((user) => user.id === scope.row.leaderUserId)?.nickname }}
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="Sort" />
      <el-table-column prop="status" label="Status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="Create Time"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="Operate" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:dept:update']"
          >
            Modify
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:dept:delete']"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <DeptForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
import DeptForm from './DeptForm.vue'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'SystemDept' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref() // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  name: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const isExpandAll = ref(true) // 是否展开，默认全部展开
const refreshTable = ref(true) // 重新渲染表格 Status
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 查询部门列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    list.value = handleTree(data)
  } finally {
    loading.value = false
  }
}

/** 展开/折叠操作 */
const toggleExpandAll = () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.pageNo = 1
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DeptApi.deleteDept(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  // 获取用户列表
  userList.value = await UserApi.getSimpleUserList()
})
</script>
