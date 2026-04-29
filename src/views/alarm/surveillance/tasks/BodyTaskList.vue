<script setup lang="ts">
import { ref, reactive } from 'vue'
import CameraSelectionMap from '@/components/CameraSelectionMap.vue'
import {
  Search,
  Plus,
  Filter,
  View,
  Edit,
  Delete,
  DataAnalysis,
  Location,
  User,
  Monitor
} from '@element-plus/icons-vue'

interface BodyTask {
  id: string
  name: string
  attributes: string
  type: 'Long-term' | 'Short-term'
  status: 'Active' | 'Paused' | 'Expired'
  cameraCount: number
  createTime: string
}

const tasks = ref<BodyTask[]>([
  {
    id: '#BT-2001',
    name: 'Red Jacket Search',
    attributes: 'Top: Red, Bottom: Black, Male',
    type: 'Short-term',
    status: 'Active',
    cameraCount: 18,
    createTime: '2026-04-22 10:00:00'
  },
  {
    id: '#BT-2002',
    name: 'Black Backpack Tracking',
    attributes: 'Bag: Yes (Black), Female, Young',
    type: 'Long-term',
    status: 'Paused',
    cameraCount: 25,
    createTime: '2026-04-21 15:30:00'
  }
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return '#10b981'
    case 'Paused': return '#f59e0b'
    case 'Expired': return '#ef4444'
    default: return '#94a3b8'
  }
}

const dialogVisible = ref(false)
const dialogTitle = ref('Create Body Task')
const form = reactive({
  name: '',
  gender: 'Any',
  topColor: 'Any',
  bottomColor: 'Any',
  hasBag: 'Any',
  type: 'Short-term',
  dateRange: [],
  selectedCameras: 0
})

const handleSelectionChange = (count: number) => {
  form.selectedCameras = count
}

const handleAdd = () => {
  dialogTitle.value = 'Create New Body Task'
  dialogVisible.value = true
}

const handleEdit = (task: BodyTask) => {
  dialogTitle.value = 'Edit Body Task'
  form.name = task.name
  dialogVisible.value = true
}

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(12)

defineProps<{
  hideTitle?: boolean
}>()
</script>

<template>
  <div class="task-list-layout">
    <!-- Header Area -->
    <header class="page-header" v-if="!hideTitle">
      <div class="header-left">
        <h1 class="title">Body Surveillance Task</h1>
        <p class="subtitle">Attribute-based Tracking · Pedestrian Analysis</p>
      </div>
      <div class="header-right">
        <div class="stats-pill">
          <el-icon class="stats-icon"><DataAnalysis /></el-icon>
          <div class="stat-item"><span class="dot active-dot"></span><span>1 Active</span></div>
          <div class="stat-item"><span class="dot paused-dot"></span><span>1 Paused</span></div>
        </div>
        <button class="btn-create" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          Create New Task
        </button>
      </div>
    </header>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-label">
        <el-icon><Filter /></el-icon> Filters:
      </div>
      <div class="search-input-wrap">
        <el-icon class="search-icon"><Search /></el-icon>
        <input type="text" class="search-input" placeholder="Search by task name or attributes..." />
      </div>
      <select class="cyber-select">
        <option>All Status</option>
        <option>Active</option>
        <option>Paused</option>
      </select>
      <button v-if="hideTitle" class="btn-create sm" @click="handleAdd">
        <el-icon><Plus /></el-icon> Create
      </button>
    </div>

    <!-- Task Grid -->
    <div class="task-grid">
      <article class="task-card" v-for="task in tasks" :key="task.id">
        <div class="card-main">
          <div class="task-info">
            <div class="task-name-row">
              <span class="status-indicator" :style="{ backgroundColor: getStatusColor(task.status) }"></span>
              <h3 class="task-name">{{ task.name }}</h3>
            </div>
            <div class="task-meta">
              <span class="id-text">{{ task.id }}</span>
              <span class="divider">|</span>
              <span class="attr-info">{{ task.attributes }}</span>
            </div>
          </div>

          <div class="task-stats">
            <div class="stat-group">
              <el-icon><User /></el-icon>
              <span>{{ task.type }}</span>
            </div>
            <div class="stat-group">
              <el-icon><Monitor /></el-icon>
              <span>{{ task.cameraCount }} Cameras</span>
            </div>
          </div>
        </div>

        <div class="task-actions">
          <span class="status-badge" :class="task.status.toLowerCase()">{{ task.status }}</span>
          <div class="btn-group">
            <button class="action-btn" @click="handleEdit(task)"><el-icon><Edit /></el-icon></button>
            <button class="action-btn btn-delete"><el-icon><Delete /></el-icon></button>
          </div>
        </div>
      </article>
    </div>

    <!-- Pagination -->
    <div class="cyber-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalTasks"
        background
      />
    </div>

    <!-- Unified Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1100px"
      class="cyber-dialog-premium"
      destroy-on-close
    >
      <div class="dialog-split-layout">
        <div class="params-section">
          <div class="section-title">
            <el-icon><Monitor /></el-icon> Task Configuration
          </div>
          <el-form :model="form" label-position="top" class="premium-form">
            <el-form-item label="Task Designation">
              <el-input v-model="form.name" placeholder="E.g. Red Jacket Tracking" />
            </el-form-item>
            
            <div class="form-row grid-2">
              <el-form-item label="Gender">
                <el-select v-model="form.gender" class="ep-full">
                  <el-option label="Any" value="Any" />
                  <el-option label="Male" value="Male" />
                  <el-option label="Female" value="Female" />
                </el-select>
              </el-form-item>
              <el-form-item label="Has Bag">
                <el-select v-model="form.hasBag" class="ep-full">
                  <el-option label="Any" value="Any" />
                  <el-option label="Yes" value="Yes" />
                  <el-option label="No" value="No" />
                </el-select>
              </el-form-item>
            </div>

            <div class="form-row grid-2">
              <el-form-item label="Top Color">
                <el-select v-model="form.topColor" class="ep-full">
                  <el-option label="Any" value="Any" />
                  <el-option label="Black" value="Black" />
                  <el-option label="White" value="White" />
                  <el-option label="Red" value="Red" />
                  <el-option label="Blue" value="Blue" />
                </el-select>
              </el-form-item>
              <el-form-item label="Bottom Color">
                <el-select v-model="form.bottomColor" class="ep-full">
                  <el-option label="Any" value="Any" />
                  <el-option label="Black" value="Black" />
                  <el-option label="Blue" value="Blue" />
                  <el-option label="Grey" value="Grey" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="Duration Strategy">
              <el-radio-group v-model="form.type" class="glass-radio">
                <el-radio-button label="Short-term" />
                <el-radio-button label="Long-term" />
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>

        <div class="map-selection-section">
          <div class="section-title">
            <el-icon><Location /></el-icon> Deployment Perimeter
          </div>
          <div class="map-container">
            <CameraSelectionMap 
              :visible="dialogVisible" 
              @selection-change="handleSelectionChange" 
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="premium-footer">
          <button class="btn-cancel" @click="dialogVisible = false">Cancel</button>
          <button class="btn-submit" @click="dialogVisible = false">Deploy Task</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.task-list-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 8px;
}

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 0 8px;
  .title { font-size: 24px; font-weight: 700; color: #f8fafc; margin: 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
}

.header-right {
  display: flex; align-items: center; gap: 20px;
  .stats-pill {
    display: flex; align-items: center; gap: 16px;
    background: rgba(15, 23, 42, 0.4); padding: 8px 16px; border-radius: 40px; border: 1px solid rgba(148, 163, 184, 0.1);
    .stats-icon { color: #38bdf8; font-size: 18px; }
    .stat-item {
      display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8;
      .dot { width: 6px; height: 6px; border-radius: 50%; }
      .active-dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
      .paused-dot { background: #f59e0b; }
    }
  }
}

.btn-create {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: #fff; border: none;
  padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: 0.2s;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4); }
  &.sm { padding: 6px 14px; font-size: 12px; }
}

.filter-bar {
  display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
  background: rgba(15, 23, 42, 0.3); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1);
  .filter-label { font-size: 13px; color: #38bdf8; font-weight: 600; display: flex; align-items: center; gap: 6px; }
}

.search-input-wrap {
  flex: 1; position: relative;
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
  .search-input {
    width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 8px; padding: 8px 12px 8px 36px; color: #fff; font-size: 13px; outline: none;
    &:focus { border-color: #38bdf8; }
  }
}

.cyber-select {
  background: rgba(0,0,0,0.2); border: 1px solid rgba(148, 163, 184, 0.1);
  color: #e2e8f0; padding: 8px 12px; border-radius: 8px; font-size: 13px; outline: none;
}

.task-grid { display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto; padding-right: 4px; }

.task-card {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px; padding: 16px 24px; transition: 0.2s;
  &:hover { background: rgba(30, 41, 59, 0.5); border-color: rgba(56, 189, 248, 0.2); }
  
  .card-main { display: flex; align-items: center; gap: 40px; flex: 1; }
  .task-info {
    width: 300px;
    .task-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; }
    .task-name { font-size: 16px; font-weight: 600; color: #f1f5f9; margin: 0; }
    .task-meta { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 8px; }
    .id-text { font-family: monospace; }
    .attr-info { color: #38bdf8; }
  }
  .task-stats {
    display: flex; gap: 32px;
    .stat-group {
      display: flex; flex-direction: column; gap: 2px; color: #94a3b8; font-size: 12px;
      .el-icon { color: #38bdf8; font-size: 16px; margin-bottom: 2px; }
    }
  }
}

.task-actions {
  display: flex; align-items: center; gap: 20px;
  .status-badge {
    padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;
    &.active { color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); }
    &.paused { color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); background: rgba(245, 158, 11, 0.05); }
  }
  .btn-group { display: flex; gap: 8px; }
}

.action-btn {
  background: rgba(148, 163, 184, 0.1); border: none; color: #94a3b8; width: 32px; height: 32px;
  border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
  &:hover { background: #38bdf8; color: #0f172a; }
  &.btn-delete:hover { background: #ef4444; color: #fff; }
}

/* Custom Pagination Styling */
.cyber-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 20px;

  :deep(.el-pagination) {
    --el-pagination-bg-color: rgba(30, 41, 59, 0.4);
    --el-pagination-text-color: #94a3b8;
    --el-pagination-button-color: #94a3b8;
    --el-pagination-hover-color: #38bdf8;
    
    .el-pagination__total, .el-pagination__jump {
      color: #64748b;
    }
    
    .el-input__wrapper {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: none;
      .el-input__inner { color: #cbd5e1; }
    }

    .el-pager li {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      margin: 0 4px;
      font-weight: 600;
      &.is-active {
        background: rgba(14, 165, 233, 0.2);
        border-color: #38bdf8;
        color: #38bdf8;
      }
      &:hover { color: #38bdf8; }
    }
    
    .btn-prev, .btn-next {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      margin: 0 4px;
      &:hover { color: #38bdf8; }
      &:disabled { background: rgba(15, 23, 42, 0.4); color: #475569; border-color: transparent; }
    }
  }
}

.dialog-split-layout {
  display: flex; gap: 32px; height: 500px;
  .params-section { flex: 1; overflow-y: auto; padding-right: 12px; }
  .map-selection-section { flex: 1.2; display: flex; flex-direction: column; }
}

.section-title {
  display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #38bdf8;
  margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.form-row.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.map-container { flex: 1; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1); }

.premium-footer {
  display: flex; justify-content: flex-end; gap: 12px; padding: 12px 0;
  button { padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
  .btn-cancel { background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8; }
  .btn-submit { background: #38bdf8; color: #0f172a; border: none; &:hover { box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); } }
}

:deep(.cyber-dialog-premium) {
  background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px;
  .el-dialog__title { color: #fff; font-weight: 700; }
  .el-dialog__body { padding: 24px 32px; }
}
</style>
