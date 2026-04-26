<template>

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="Operate User" prop="userId">
        <el-select
          v-model="queryParams.userId"
          clearable
          filterable
          placeholder="Operate User"
          class="!w-180px"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Operate Module" prop="type">
        <el-input
          v-model="queryParams.type"
          placeholder="Operate module"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="Operate Name" prop="subType">
        <el-input
          v-model="queryParams.subType"
          placeholder="Operate Name"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="Operate Content" prop="action">
        <el-input
          v-model="queryParams.action"
          placeholder="Operate action"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="Create Time" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="Begin date"
          end-placeholder="End date"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="Business ID" prop="bizId">
        <el-input
          v-model="queryParams.bizId"
          placeholder="Business ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['system:operate-log:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> Export
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="ID" align="center" prop="id" width="100" />
      <el-table-column label="Operate User" align="center" prop="userName"/>
      <el-table-column label="Operate Module" align="center" prop="type"/>
      <el-table-column label="Sub Type" align="center" prop="subType" />
      <el-table-column label="Operate Content" align="center" prop="action" />
      <el-table-column
        label="Create Time"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
      />
      <el-table-column label="Business ID" align="center" prop="bizId"/>
      <el-table-column label="Operate IP" align="center" prop="userIp"/>
      <el-table-column label="Operate" align="center" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openDetail(scope.row)"
            v-hasPermi="['system:operate-log:query']"
          >
            Detail
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：详情 -->
  <OperateLogDetail ref="detailRef" />
</template>
<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as OperateLogApi from '@/api/system/operatelog'
import OperateLogDetail from './OperateLogDetail.vue'
import * as UserApi from '@/api/system/user'
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

defineOptions({ name: 'SystemOperateLog' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  type: undefined,
  subType: undefined,
  action: undefined,
  createTime: [],
  bizId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OperateLogApi.getOperateLogPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮Operate */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮Operate */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 详情Operate */
const detailRef = ref()
const openDetail = (data: OperateLogApi.OperateLogVO) => {
  detailRef.value.open(data)
}

/** 导出按钮Operate */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await OperateLogApi.exportOperateLog(queryParams)
    download.excel(data, 'Operate log.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  // 获得用户列表
  userList.value = await UserApi.getSimpleUserList()
})
</script>
