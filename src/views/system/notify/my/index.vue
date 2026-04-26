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
      <el-form-item label="Read Status" prop="readStatus">
        <el-select
          v-model="queryParams.readStatus"
          placeholder="Please select Status"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Send Time" prop="createTime">
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
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> Search</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> Reset</el-button>
        <el-button @click="handleUpdateList">
          <Icon icon="ep:reading" class="mr-5px" /> Mark read
        </el-button>
        <el-button @click="handleUpdateAll">
          <Icon icon="ep:reading" class="mr-5px" /> All read
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      ref="tableRef"
      row-key="id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :selectable="selectable" :reserve-selection="true" />
      <el-table-column label="Sender" align="center" prop="templateNickname" width="180" />
      <el-table-column
        label="Send Time"
        align="center"
        prop="createTime"
        width="200"
        :formatter="dateFormatter"
      />
      <el-table-column label="Type" align="center" prop="templateType" width="180">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="scope.row.templateType" />
        </template>
      </el-table-column>
      <el-table-column
        label="Message Content"
        align="center"
        prop="templateContent"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span v-for="(item, index) in contentToArray(row.templateContent)" :key="index">
            <span v-if="item.isIp">
              <el-link
                type="danger"
                :underline="true"
                @click="showIpLog('../cameralog', item.text)"
              >
                {{ item.text }}
              </el-link>
            </span>
            <span v-else> {{ item.text }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Read Status" align="center" prop="readStatus" width="160">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.readStatus" />
        </template>
      </el-table-column>
      <el-table-column label="Handel Status" align="center" width="160">
        <template #default="{ row }">
          <el-tag type="danger" size="normal" v-if="row.handleStatus == 0">No handle</el-tag>
          <el-tag type="success" size="normal" v-if="row.handleStatus == 1">Handled</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="Read Time"
        align="center"
        prop="readTime"
        width="200"
        :formatter="dateFormatter"
      />
      <el-table-column label="Operate" align="center" width="160">
        <template #default="scope">
          <el-button
            link
            :type="scope.row.readStatus ? 'primary' : 'warning'"
            @click="openDetail(scope.row)"
          >
            {{ scope.row.readStatus ? 'Detail' : 'Read' }}
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleMyNotify(scope.row)"
            v-show="scope.row.handleStatus == 0"
          >
            Handle
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
  <MyNotifyMessageDetail ref="detailRef" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getBoolDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as NotifyMessageApi from '@/api/system/notify/message'
import MyNotifyMessageDetail from './MyNotifyMessageDetail.vue'
import { isIP } from 'net'

defineOptions({ name: 'SystemMyNotify' })

const message = useMessage() // 消息
const router = useRouter()
const route = useRoute()
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
let queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  readStatus: undefined,
  createTime: [],
  id: null
})
const queryFormRef = ref() // 搜索的表单
const tableRef = ref() // 表格的 Ref
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await NotifyMessageApi.getMyNotifyMessagePage(queryParams)
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
  tableRef.value.clearSelection()
  resetForm()
  handleQuery()
}
const resetForm = () => {
  queryParams = {
    pageNo: 1,
    pageSize: 10,
    readStatus: undefined,
    createTime: [],
    id: null
  }
}

/** 详情操作 */
const detailRef = ref()
const openDetail = (data: NotifyMessageApi.NotifyMessageVO) => {
  if (!data.readStatus) {
    handleReadOne(data.id)
  }
  detailRef.value.open(data)
}

/** 标记一条站内信已读 */
const handleReadOne = async (id) => {
  await NotifyMessageApi.updateNotifyMessageRead(id)
  await getList()
}

/** 标记全部站内信已读 **/
const handleUpdateAll = async () => {
  await NotifyMessageApi.updateAllNotifyMessageRead()
  message.success('All read successfully！')
  tableRef.value.clearSelection()
  await getList()
}

/** 标记一些站内信已读 **/
const handleUpdateList = async () => {
  if (selectedIds.value.length === 0) {
    return
  }
  await NotifyMessageApi.updateNotifyMessageRead(selectedIds.value)
  message.success('Batch read successfully！')
  tableRef.value.clearSelection()
  await getList()
}

/** 某一行，是否允许选中 */
const selectable = (row) => {
  return !row.readStatus
}

/** 当表格选择项发生变化时会触发该事件  */
const handleSelectionChange = (array: NotifyMessageApi.NotifyMessageVO[]) => {
  selectedIds.value = []
  if (!array) {
    return
  }
  array.forEach((row) => selectedIds.value.push(row.id))
}

/** 处理我的告警 */
const handleMyNotify = (row) => {
  ElMessageBox.confirm('Sure to handle?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(() => {
    NotifyMessageApi.handleMyNotify(row.id).then((res) => {
      row.handleStatus = 1
      ElMessage.success('Handle success!')
      getList()
    })
  })
}

const contentToArray = (content) => {
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
  const result = []
  let lastIndex = 0
  let match

  while ((match = ipRegex.exec(content)) !== null) {
    //非IP 部分
    if (match.index > lastIndex) {
      result.push({ text: content.slice(lastIndex, match.index), isIP: false })
    }

    //IP部分
    result.push({ text: match[0], isIp: true })
    lastIndex = match.index + match[0].length
  }

  //剩余部分
  if (lastIndex < content.length) {
    result.push({ text: content.slice(lastIndex), isIp: false })
  }
  return result
}

/**method */
const showIpLog = async (path, param) => {
  router.push({
    path: path,
    query: { ip: param }
  })
}

/** 初始化 **/
onMounted(() => {
  const messageId = route.query.messageId
  if (messageId && Number(messageId) > 0) {
    const id = Number(messageId)
    queryParams.id = id
  }
  getList()
})
</script>
