<template>
  <div class="task-list-layout">
    <!-- 顶部状态概览 (Logic-less, purely visual stats) -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="title">Face Recognition Task</h1>
        <p class="subtitle">Intelligent Surveillance Management · Real-time AI Security</p>
      </div>
      <div class="header-right">
        <div class="stats-pill">
          <el-icon class="stats-icon"><DataAnalysis /></el-icon>
          <div class="stat-item"><span class="dot active-dot"></span><span>{{ total }} Total</span></div>
        </div>
        <el-button
          type="primary"
          @click="openForm('create')"
          class="btn-create"
          v-hasPermi="['biz:alarm-task:create']"
        >
          <el-icon><Plus /></el-icon> Create New Task
        </el-button>
      </div>
    </header>

    <!-- 搜索/过滤工作栏 -->
    <div class="filter-bar">
      <div class="filter-label"><el-icon><Filter /></el-icon> Filters:</div>
      
      <div class="search-input-wrap">
        <el-icon class="search-icon"><Search /></el-icon>
        <input 
          type="text" 
          class="search-input" 
          v-model="queryParams.strategyName" 
          placeholder="Search by task name..." 
          @keyup.enter="handleQuery"
        />
      </div>

      <div class="date-picker-wrap">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="Start"
          end-placeholder="End"
          class="cyber-date-picker"
        />
      </div>

      <div class="action-group">
        <button class="vms-main-button sm" @click="handleQuery">Search</button>
        <button class="vms-reset-button sm" @click="resetQuery">Reset</button>
        <button class="vms-track-button sm" @click="handleExport" :loading="exportLoading">Export</button>
      </div>
    </div>

    <!-- 任务卡片列表 (取代 el-table) -->
    <div class="task-list-container" v-loading="loading">
      <div v-if="list.length === 0" class="empty-placeholder">No tasks found.</div>
      
      <article class="task-card" v-for="row in list" :key="row.id">
        <div class="task-info">
          <div class="task-name-row">
            <span class="status-indicator" :class="row.status === 1 ? 'active' : 'disabled'"></span>
            <h3 class="task-name" @click="handleMore('/alarm/face/alarm/facehistory', row.apiTaskId, row.strategyName)">
              {{ row.strategyName }}
            </h3>
          </div>
          <div class="task-meta">
            <span class="meta-item">ID: {{ row.id }}</span>
            <span class="meta-divider">|</span>
            <span class="meta-item camera-info">
              <el-icon><VideoCamera /></el-icon> {{ row.cameraCount }} cams
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              {{ row.termType == 0 ? 'Temporary' : 'Long-term' }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">Alarms: {{ row.alarmsCount }}</span>
          </div>
        </div>

        <div class="task-right">
          <div class="status-toggle">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </div>
          
          <div class="btn-group">
            <button class="action-btn btn-edit" @click="openForm('update', row.id)" v-hasPermi="['biz:alarm-task:update']">
              <el-icon><Edit /></el-icon> Modify
            </button>
            <button class="action-btn btn-delete" @click="handleDelete(row.id)" v-hasPermi="['biz:alarm-task:delete']">
              <el-icon><Delete /></el-icon>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- 分页 -->
    <div class="cyber-pagination-wrap">
      <Pagination
        :total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 表单弹窗：添加/修改 (保持原逻辑) -->
    <AlarmTaskForm ref="formRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { AlarmTaskApi, AlarmTaskVO } from '@/api/alarmtask/face'
import AlarmTaskForm from './AlarmTaskFormDevelop.vue'
import { 
  Search, Plus, Filter, DataAnalysis, VideoCamera, Edit, Delete 
} from '@element-plus/icons-vue'

/** face alarm 列表 */
defineOptions({ name: 'AlarmTask' })

const emits = defineEmits(['to-face-history'])
const message = useMessage() 
const { t } = useI18n() 
const router = useRouter()

const loading = ref(true) 
const list = ref<AlarmTaskVO[]>([]) 
const total = ref(0) 
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  strategyName: undefined,
  startTime: [],
  endTime: []
})
const queryFormRef = ref() 
const exportLoading = ref(false) 

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AlarmTaskApi.getAlarmTaskPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 状态切换逻辑 (新增) */
const handleStatusChange = async (row: AlarmTaskVO) => {
  // 这里可以添加状态更新接口调用
  console.log('Status changed for:', row.id, row.status)
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.strategyName = undefined
  queryParams.startTime = []
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
    await message.delConfirm()
    await AlarmTaskApi.deleteAlarmTask(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await AlarmTaskApi.exportAlarmTask(queryParams)
    download.excel(data, 'face alarm.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 转到history tab */
function handleMore(path, apiTaskId, strategyName) {
  emits('to-face-history', apiTaskId)
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.task-list-layout {
  padding: 12px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: var(--vms-content-text);
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

  .title { font-size: 24px; font-weight: 700; color: var(--vms-content-text); margin: 0 0 4px 0; }
  .subtitle { font-size: 13px; color: var(--vms-content-muted); margin: 0; }
  .header-right { display: flex; gap: 20px; align-items: center; }
}

.stats-pill {
  display: flex;
  align-items: center;
  background: var(--vms-card-bg);
  border: 1px solid var(--vms-content-border);
  border-radius: 12px;
  padding: 8px 16px;
  gap: 12px;
  font-size: 13px;
  .stats-icon { font-size: 16px; color: var(--vms-primary); }
  .stat-item {
    display: flex; align-items: center; gap: 8px;
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--vms-primary); box-shadow: 0 0 10px var(--vms-primary); }
  }
}

.btn-create {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 10px 20px !important;
  font-weight: 700 !important;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4); }
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--vms-card-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--vms-content-border);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;

  .filter-label { display: flex; align-items: center; gap: 6px; color: var(--vms-primary); font-weight: 600; font-size: 13px; }
}

.search-input-wrap {
  flex: 1; position: relative;
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
  .search-input {
    width: 100%; background: rgba(15, 23, 42, 0.1); border: 1px solid var(--vms-content-border);
    border-radius: 8px; padding: 8px 12px 8px 36px; color: var(--vms-content-text); font-size: 13px; outline: none;
    &:focus { border-color: var(--vms-primary); }
  }
}

.cyber-date-picker {
  :deep(.el-input__wrapper) {
    background: rgba(15, 23, 42, 0.1) !important;
    border: 1px solid var(--vms-content-border) !important;
    box-shadow: none !important;
    border-radius: 8px;
  }
}

.action-group {
  display: flex; gap: 8px;
  button.sm { padding: 8px 16px; font-size: 12px; border-radius: 8px; cursor: pointer; }
}

/* Task Cards */
.task-list-container { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }

.task-card {
  background: var(--vms-card-bg);
  border: 1px solid var(--vms-content-border);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  &:hover {
    border-color: var(--vms-primary);
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.task-info {
  .task-name-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; }
    .status-indicator.active { background: #10b981; box-shadow: 0 0 8px #10b981; }
    .status-indicator.disabled { background: #ef4444; }
    .task-name { margin: 0; font-size: 15px; font-weight: 600; color: var(--vms-primary); cursor: pointer; }
  }
  .task-meta {
    display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--vms-content-muted);
    .camera-info { color: var(--vms-primary); display: flex; align-items: center; gap: 4px; }
    .meta-divider { opacity: 0.2; }
  }
}

.task-right {
  display: flex; align-items: center; gap: 20px;
  .btn-group { display: flex; gap: 8px; }
}

.action-btn {
  display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.05);
  border: 1px solid var(--vms-content-border); border-radius: 8px; padding: 6px 14px;
  font-size: 12px; color: var(--vms-content-text); cursor: pointer;
  &:hover { border-color: var(--vms-primary); color: var(--vms-primary); }
  &.btn-delete:hover { background: #ef4444 !important; color: #fff !important; border-color: #ef4444 !important; }
}

.empty-placeholder { text-align: center; padding: 40px; color: var(--vms-content-muted); font-size: 14px; }

.cyber-pagination-wrap {
  margin-top: 16px; display: flex; justify-content: flex-end;
}
</style>
