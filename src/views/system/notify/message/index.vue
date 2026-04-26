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
      <el-form-item label="User ID" prop="userId" label-width="60px">
        <el-input
          v-model="queryParams.userId"
          placeholder="User id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="User Type" prop="userType"  label-width="80px">
        <el-select
          v-model="queryParams.userType"
          placeholder="User type"
          clearable
          class="!w-180px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.USER_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Template Code" prop="templateCode">
        <el-input
          v-model="queryParams.templateCode"
          placeholder="Template Code"
          clearable
          @keyup.enter="handleQuery"
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item label="Template Type" prop="templateType">
        <el-select
          v-model="queryParams.templateType"
          placeholder="Template Type"
          clearable
          class="!w-200px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE)"
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
          type="daterange"
          start-placeholder="Begin Date"
          end-placeholder="End Date"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="User Type" align="center" prop="userType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType" />
        </template>
      </el-table-column>
      <el-table-column label="User ID" align="center" prop="userId" />
      <el-table-column label="Template Code" align="center" prop="templateCode"/>
      <el-table-column label="Send Name" align="center" prop="templateNickname"/>
      <el-table-column
        label="Template Content"
        align="center"
        prop="templateContent"
        width="200"
        show-overflow-tooltip
      />
      <el-table-column
        label="Template param"
        align="center"
        prop="templateParams"
        width="180"
        show-overflow-tooltip
      >
        <template #default="scope"> {{ scope.row.templateParams }}</template>
      </el-table-column>
      <el-table-column label="Template Type" align="center" prop="templateType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="scope.row.templateType" />
        </template>
      </el-table-column>
      <el-table-column label="Read Status" align="center" prop="readStatus">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.readStatus" />
        </template>
      </el-table-column>
      <el-table-column
        label="ReadTime"
        align="center"
        prop="readTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="Create Time"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="Operate" align="center" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openDetail(scope.row)"
            v-hasPermi="['system:notify-message:query']"
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
  <NotifyMessageDetail ref="detailRef" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as NotifyMessageApi from '@/api/system/notify/message'
import NotifyMessageDetail from './NotifyMessageDetail.vue'

defineOptions({ name: 'SystemNotifyMessage' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userType: undefined,
  userId: undefined,
  templateCode: undefined,
  templateType: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await NotifyMessageApi.getNotifyMessagePage(queryParams)
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

/** 详情操作 */
const detailRef = ref()
const openDetail = (data: NotifyMessageApi.NotifyMessageVO) => {
  detailRef.value.open(data)
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
