<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      size="default"
      label-width="100px"
    >
      <div class="flex justify-between">
        <div>
          <el-form-item label="Task Name" prop="strategyName">
            <el-input
              v-model="queryParams.strategyName"
              placeholder="Strategy Name"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="Vehicle No." prop="vehicleNo">
            <el-input
              v-model="queryParams.carNumber"
              placeholder="Vehicle No."
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>

          <el-form-item label="Time" prop="startTime">
            <el-date-picker
              v-model="queryParams.timeRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="Start Time"
              end-placeholder="End Time"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-220px"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleQuery" class="vms-main-button"
              ><Icon icon="ep:search" class="mr-5px" /> Search</el-button
            >
            <el-button @click="resetQuery" class="vms-reset-button"
              ><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button
            >
          </el-form-item>
        </div>
        <div>
          <el-form-item>
            <el-button type="primary" plain @click="openForm('create')" class="vms-main-button">
              <!-- v-hasPermi="['biz:alarm-plate-task:create']" -->
              <Icon icon="ep:plus" class="mr-5px" /> Add
            </el-button>
            <el-button
              type="success"
              plain
              @click="handleExport"
              :loading="exportLoading"
              class="vms-track-button"
            >
              <!-- v-hasPermi="['biz:alarm-plate-task:export']" -->
              <Icon icon="ep:download" class="mr-5px" /> Export
            </el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      size="default"
    >
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="Task Name" align="center" prop="strategyName">
        <template #default="{ row }">
          <el-link
            type="primary"
            :underline="true"
            @click="handleMore('/alarm/alarm/vehicle/history', row.apiTaskId)"
          >
            {{ row.strategyName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="Vehicle No." align="center" prop="carNumber" />
      <el-table-column label="Status" align="center" prop="status">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="(val) => updateTaskStatus(val, row)"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: red"
          />
        </template>
      </el-table-column>
      <el-table-column label="Term Type" align="center" prop="termType">
        <template #default="{ row }">
          <span v-if="row.termType == 0"> Temporary Surveillance </span>
          <span v-else> Long-term Surveillance </span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="No Of Alarms" align="center" prop="alarmsCount" /> -->
      <el-table-column label="Surveillance Device" align="center" prop="cameraCount" />
      <el-table-column
        label="Create Time"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <!-- :formatter="dateFormatter" -->
      <el-table-column label="Operate" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['biz:alarm-plate-task:update']"
          >
            <!--  -->
            Modify
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['biz:alarm-plate-task:delete']"
          >
            <!--  -->
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <AlarmTaskForm ref="formRef" @success="getList" style="width: 80%" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { AlarmTaskApi, AlarmTaskVO } from '@/api/alarmtask/plate'
import AlarmTaskForm from './AlarmPlateTaskForm.vue'

/** face alarm 列表 */
defineOptions({ name: 'AlarmTask' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter()
const route = useRoute
const loading = ref(true) // 列表的加载中
const list = ref<AlarmTaskVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  page: 1,
  timeRange: [],
  pageSize: 10,
  strategyName: undefined,
  carNumber: '',
  startTime: '',
  endTime: ''
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    if (queryParams.timeRange != null && queryParams.timeRange.length > 0) {
      queryParams.startTime = queryParams.timeRange[0]
      queryParams.endTime = queryParams.timeRange[1]
    }
    const data = await AlarmTaskApi.getAlarmTaskPage(queryParams)
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
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  console.log(type, id)
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await AlarmTaskApi.deleteAlarmTask(id)
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
    const data = await AlarmTaskApi.exportAlarmTask(queryParams)
    download.excel(data, 'face alarm.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const updateTaskStatus = async (value: number, obj: any) => {
  const form = {
    id: obj.id,
    strategyName: obj.strategyName,
    status: value,
    updateType: 2
  }
  await AlarmTaskApi.updateAlarmTask(form)
  message.alertSuccess('Update success!')
}

/** method */
const emits = defineEmits(['to-vehicle-history'])
/** 转到history tab */
function handleMore(path, id) {
  // router.push({ path: path, query: { apiTaskId: id } })

  emits('to-vehicle-history',id)
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
