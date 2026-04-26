<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="120px"
    >
      <div class="flex justify-center">
        <el-form-item label="Rule Name" prop="ruleName">
          <el-input
            v-model="queryParams.ruleName"
            placeholder="Rule Name"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><Icon icon="ep:search" />Search</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" />Reset</el-button>
          <el-button
            type="primary"
            plain
            @click="openForm('create')"
            v-hasPermi="['system:user:create']"
          >
            <Icon icon="ep:plus" /> Add
          </el-button>
        </el-form-item>
      </div>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="ID" align="center" key="id" prop="id" width="40" />
      <el-table-column label="Rule Name" align="center" prop="ruleName" />
      <!-- <el-table-column label="Rule type" align="center" prop="ruleType" /> -->
      <el-table-column label="Monitor Type" align="center" prop="monitorType">
        <template #default="{ row }">
          <span v-for="item in notifyTemplateOptions" :key="item.value">
            <span v-if="row.monitorType == item.value">{{ item.label }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Alert Status" align="center" prop="alartStatus">
        <template #default="{ row }">
          {{ getAlertStatusLabel(row.alertStatus) }}
        </template>
      </el-table-column>
      <el-table-column label="Execute Strategy" prop="executeStrategy" min-width="200">
        <template #default="{ row }">
          {{ getStrategyLabel(row) }}
        </template>
      </el-table-column>
      <el-table-column label="Description" prop="description" />
      <el-table-column
        label="Create Time"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="Operate" align="center" width="160">
        <template #default="{ row }">
          <div class="flex items-center justify-center">
            <el-button type="primary" link @click="openForm('update', row.id)">
              <Icon icon="ep:edit" />Modify
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">
              <Icon icon="ep:delete" />Delete
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 添加或修改用户对话框 -->
  <RuleForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as AlarmRuleApi from '@/api/alarmrule'
import RuleForm from './RuleForm.vue'

defineOptions({ name: 'Rule' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  ruleName: ''
})
const queryFormRef = ref() // 搜索的表单

const notifyTemplateOptions = ref([] as any)
const initNotifyTemplateOption = async () => {
  AlarmRuleApi.notifyTemplateOptions().then((res) => {
    console.log('notifyTemplateOptions  ==== ', res)
    notifyTemplateOptions.value = res.data.list
  })
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AlarmRuleApi.getRulePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const alertStatusOptions = ref([
  {
    value: 1,
    label: 'New alert'
  },
  {
    value: 2,
    label: 'Confirm alert'
  },
  {
    value: 3,
    label: 'Clear alert'
  }
] as any)

const getAlertStatusLabel = (alertStatus: string) => {
  if (alertStatus == undefined || alertStatus == '') return
  let str = ''
  if (alertStatus.includes(',')) {
    const alertStatusArr = alertStatus.split(',')
    const tempArr = []
    for (const alertSingle of alertStatusArr) {
      tempArr.push(alertStatusOptions.value.find((a) => a.value == Number(alertSingle))?.label)
    }
    str = tempArr.join()
  } else {
    str = alertStatusOptions.value.find((a) => a.value == Number(alertStatus))?.label
  }
  return str
}

const executeStrategyList = ref([
  {
    id: 1,
    content: 'Execute actions repeatly before alert is confirmed'
  },
  {
    id: 2,
    content: 'Execute actions continuously before alert is confirmed'
  },
  {
    id: 3,
    content: 'Execute actions regularly before alert is confirmed'
  }
])

const getStrategyLabel = (row: any) => {
  if (row.executeStrategy == undefined || row.executeStrategy == '') return ''
  let str = executeStrategyList.value.find((a) => a.id == row.executeStrategy).content
  switch (row.executeStrategy) {
    case 2:
      str += '  ' + row.strategyValue + ' times'
      break
    case 3:
      str += '  ' + row.strategyValue + ' minutes'
  }
  return str
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

/** 导出按钮操作 */
const exportLoading = ref(false)
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await AlarmRuleApi.exportRule(queryParams)
    download.excel(data, 'User data.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await AlarmRuleApi.deleteRule(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

const init = async () => {
  await initNotifyTemplateOption()
  getList()
}

/** 初始化 */
onMounted(() => {
  init()
})
</script>
