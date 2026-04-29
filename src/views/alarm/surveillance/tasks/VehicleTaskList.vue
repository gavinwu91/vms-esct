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
  SwitchButton,
  DataAnalysis,
  Camera,
  Compass,
  Location,
  Monitor,
  Calendar,
  Close,
  Check,
  ArrowDown
} from '@element-plus/icons-vue'

interface VehicleTask {
  id: string
  name: string
  plateNumber: string
  type: 'Long-term' | 'Short-term'
  status: 'Active' | 'Paused' | 'Expired'
  cameraCount: number
  createTime: string
}

const tasks = ref<VehicleTask[]>([
  {
    id: '#VT-1024',
    name: 'Stolen White Toyota Search',
    plateNumber: 'OM-1234, OM-5678',
    type: 'Short-term',
    status: 'Active',
    cameraCount: 15,
    createTime: '2026-04-20 09:00:00'
  },
  {
    id: '#VT-1025',
    name: 'Illegal Taxi Monitoring',
    plateNumber: 'OM-9988, OM-7766',
    type: 'Long-term',
    status: 'Paused',
    cameraCount: 42,
    createTime: '2026-04-18 14:30:00'
  },
  {
    id: '#VT-1026',
    name: 'VIP Convoy Route Protection',
    plateNumber: 'VIP-001, VIP-002',
    type: 'Short-term',
    status: 'Active',
    cameraCount: 120,
    createTime: '2026-04-21 11:20:00'
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
const dialogTitle = ref('Create Vehicle Task')
const form = reactive({
  name: '',
  plates: '',
  type: 'Short-term',
  dateRange: [],
  remark: '',
  selectedCameras: 0,
  collaborators: [],
  approvers: []
})

const activeStep = ref(0)
const nextStep = () => { if (activeStep.value < 3) activeStep.value++ }
const prevStep = () => { if (activeStep.value > 0) activeStep.value-- }

const handleSelectionChange = (count: number) => {
  form.selectedCameras = count
}

const handleAdd = () => {
  dialogTitle.value = 'Create New Vehicle Task'
  activeStep.value = 0
  dialogVisible.value = true
}

const handleEdit = (task: VehicleTask) => {
  dialogTitle.value = 'Edit Vehicle Task'
  form.name = task.name
  form.plates = task.plateNumber
  form.type = task.type
  activeStep.value = 0
  dialogVisible.value = true
}

defineProps<{
  hideTitle?: boolean
}>()

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(38)
</script>

<template>
  <div class="task-list-layout">
    <!-- Main Dashboard Header -->
    <header class="page-header" v-if="!hideTitle">
      <div class="header-left">
        <h1 class="title">Vehicle Surveillance Task</h1>
        <p class="subtitle">License Plate Recognition · Traffic Anomaly Detection</p>
      </div>
      <div class="header-right">
        <div class="stats-pill">
          <el-icon class="stats-icon"><DataAnalysis /></el-icon>
          <div class="stat-item">
            <span class="dot active-dot"></span>
            <span>3 Active</span>
          </div>
          <div class="stat-item">
            <span class="dot paused-dot"></span>
            <span>1 Paused</span>
          </div>
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
        <el-icon><Filter /></el-icon>
        Filters:
      </div>
      
      <div class="search-input-wrap">
        <el-icon class="search-icon"><Search /></el-icon>
        <input type="text" class="search-input" placeholder="Search by task name or plate..." />
      </div>

      <select class="cyber-select">
        <option>All Status</option>
        <option>Active</option>
        <option>Paused</option>
        <option>Expired</option>
      </select>

      <button v-if="hideTitle" class="btn-create sm" @click="handleAdd">
        <el-icon><Plus /></el-icon> Create
      </button>

      <select class="cyber-select">
        <option>All Types</option>
        <option>Short-term</option>
        <option>Long-term</option>
      </select>
    </div>

    <!-- Task Card List -->
    <div class="task-grid">
      <article class="task-card" v-for="task in tasks" :key="task.id">
        <div class="card-main">
          <div class="task-info">
            <div class="task-name-row">
              <span class="status-indicator" :style="{ backgroundColor: getStatusColor(task.status) }"></span>
              <h3 class="task-name">{{ task.name }}</h3>
            </div>
            <div class="task-meta">
              <span class="meta-item id-text">{{ task.id }}</span>
              <span class="divider">|</span>
              <span class="plate-info">
                <el-icon><Van /></el-icon> {{ task.plateNumber }}
              </span>
              <span class="divider">|</span>
              <span class="meta-item">{{ task.type }}</span>
            </div>
          </div>
          
          <div class="task-stats">
            <div class="stat-group">
              <el-icon><VideoCamera /></el-icon>
              <span>{{ task.cameraCount }} Cameras</span>
            </div>
            <div class="stat-group">
              <el-icon><Calendar /></el-icon>
              <span>{{ task.createTime }}</span>
            </div>
          </div>
        </div>

        <div class="task-actions">
          <div class="status-badge" :class="task.status.toLowerCase()">
            {{ task.status }}
          </div>
          <div class="btn-group">
            <button class="action-btn btn-detail">
              <el-icon><View /></el-icon> Detail
            </button>
            <button class="action-btn btn-edit" @click="handleEdit(task)">
              <el-icon><Edit /></el-icon> Edit
            </button>
            <button class="action-btn btn-delete">
              <el-icon><Delete /></el-icon>
            </button>
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

    <!-- Unified Add/Edit Dialog -->    <el-dialog
      v-model="dialogVisible"
      width="1200px"
      class="task-add-dialog-custom"
      destroy-on-close
      :show-close="false"
      align-center
    >
      <div class="wizard-container">
        <!-- Header -->
        <header class="wizard-header">
          <div class="header-main">
            <div class="header-icon-box"><el-icon><Plus /></el-icon></div>
            <div class="header-title">
              <h3>Vehicle Task Wizard</h3>
              <p>Configure plate recognition and monitoring task</p>
            </div>
          </div>
          <div class="header-ext">
            <div class="step-count">STEP <span>{{ activeStep + 1 }}</span> OF 4</div>
            <button class="close-wizard" @click="dialogVisible = false"><el-icon><Close /></el-icon></button>
          </div>
        </header>

        <div class="wizard-content">
          <!-- Sidebar: Timeline -->
          <aside class="timeline-sidebar">
            <div class="timeline-item" :class="{ active: activeStep === 0, done: activeStep > 0 }">
              <div class="dot"><el-icon v-if="activeStep > 0"><Check /></el-icon><span v-else>1</span></div>
              <div class="text"><h4>Basic Info</h4><p>Target plates</p></div>
              <div class="line"></div>
            </div>
            <div class="timeline-item" :class="{ active: activeStep === 1, done: activeStep > 1 }">
              <div class="dot"><el-icon v-if="activeStep > 1"><Check /></el-icon><span v-else>2</span></div>
              <div class="text"><h4>AI Rules</h4><p>Vehicle attributes</p></div>
              <div class="line"></div>
            </div>
            <div class="timeline-item" :class="{ active: activeStep === 2, done: activeStep > 2 }">
              <div class="dot"><el-icon v-if="activeStep > 2"><Check /></el-icon><span v-else>3</span></div>
              <div class="text"><h4>Deployment</h4><p>Camera selection</p></div>
              <div class="line"></div>
            </div>
            <div class="timeline-item" :class="{ active: activeStep === 3, done: activeStep > 3 }">
              <div class="dot"><span>4</span></div>
              <div class="text"><h4>Workflow</h4><p>Approval & Review</p></div>
            </div>
          </aside>

          <!-- Main Work Area -->
          <main class="step-workarea">
            <div class="form-scrollable">
              <!-- Step 0: Basic -->
              <el-form v-if="activeStep === 0" label-position="top">
                <el-form-item label="Task Name">
                   <el-input v-model="form.name" placeholder="Enter task name..." />
                </el-form-item>
                <el-form-item label="Plate Numbers (Comma separated)">
                   <el-input v-model="form.plates" placeholder="E.g. OM-1234, OM-5678" />
                </el-form-item>
                <div class="grid-2">
                  <el-form-item label="Strategy"><el-radio-group v-model="form.type"><el-radio-button label="Short-term"/><el-radio-button label="Long-term"/></el-radio-group></el-form-item>
                </div>
              </el-form>

              <!-- Step 1: AI Rule -->
              <el-form v-if="activeStep === 1" label-position="top">
                <div class="grid-2">
                  <el-form-item label="Vehicle Color"><el-select v-model="form.remark" style="width:100%"><el-option label="Any" value="Any"/></el-select></el-form-item>
                  <el-form-item label="Vehicle Type"><el-select v-model="form.remark" style="width:100%"><el-option label="Any" value="Any"/></el-select></el-form-item>
                </div>
              </el-form>

              <!-- Step 2: Map/Deployment -->
              <div v-if="activeStep === 2" style="height: 400px;">
                <CameraSelectionMap 
                  :visible="activeStep === 2 && dialogVisible" 
                  @selection-change="handleSelectionChange" 
                />
              </div>

              <!-- Step 3: Collaboration -->
              <el-form v-if="activeStep === 3" label-position="top">
                <el-form-item label="Collaborators"><el-select v-model="form.collaborators" multiple style="width:100%"><el-option label="Traffic Admin" value="1"/></el-select></el-form-item>
                <el-form-item label="Audit Workflow"><el-checkbox-group v-model="form.approvers"><el-checkbox label="Dept Head" border>Requires Department Head Approval</el-checkbox></el-checkbox-group></el-form-item>
              </el-form>
            </div>

            <!-- Footer: Navigation -->
            <footer class="wizard-footer">
              <button class="btn-secondary" v-if="activeStep > 0" @click="prevStep">Back</button>
              <div class="flex-spacer"></div>
              <button class="btn-primary" v-if="activeStep < 3" @click="nextStep">Next Configuration</button>
              <button class="btn-primary btn-submit" v-else @click="dialogVisible = false">Validate & Deploy</button>
            </footer>
          </main>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.task-list-layout {
  padding: 12px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: #e2e8f0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .title { font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 6px 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }

  .header-right { display: flex; gap: 24px; align-items: center; }
}

.stats-pill {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 10px 20px;
  gap: 20px;
  font-size: 13px;

  .stats-icon { font-size: 18px; color: #38bdf8; }
  .stat-item {
    display: flex; align-items: center; gap: 8px; color: #cbd5e1;
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      &.active-dot { background: #10b981; box-shadow: 0 0 10px #10b981; }
      &.paused-dot { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
    }
  }
}

.btn-create {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.6); }
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(26, 32, 53, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 14px 20px;
  margin-bottom: 24px;

  .filter-label { display: flex; align-items: center; gap: 8px; color: #38bdf8; font-weight: 600; font-size: 14px; }
}

.search-input-wrap {
  flex: 1; position: relative;
  .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; }
  .search-input {
    width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 10px; padding: 10px 16px 10px 45px; color: #fff; font-size: 14px; outline: none;
    &:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1); }
  }
}

.cyber-select {
  width: 160px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px; color: #fff; padding: 10px 16px; font-size: 13px; outline: none; cursor: pointer;
  &:hover { border-color: #38bdf8; }
}

/* Task Cards */
.task-grid { display: flex; flex-direction: column; gap: 16px; }

.task-card {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    background: rgba(30, 41, 59, 0.5);
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateX(4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
}

.card-main { display: flex; align-items: center; gap: 60px; flex: 1; }

.task-info {
  width: 300px;
  .task-name-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; }
    .task-name { margin: 0; font-size: 16px; font-weight: 600; color: #f8fafc; }
  }
  .task-meta {
    display: flex; align-items: center; gap: 12px; font-size: 12px; color: #64748b;
    .id-text { font-family: monospace; font-weight: 600; color: #94a3b8; }
    .plate-info { color: #38bdf8; display: flex; align-items: center; gap: 6px; font-weight: 600; }
    .divider { color: rgba(148, 163, 184, 0.2); }
  }
}

.task-stats {
  display: flex; gap: 40px;
  .stat-group {
    display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 12px;
    .el-icon { font-size: 18px; color: #38bdf8; margin-bottom: 4px; }
  }
}

.task-actions {
  display: flex; align-items: center; gap: 24px;
  .status-badge {
    padding: 6px 18px; border-radius: 30px; font-size: 11px; font-weight: 800; text-transform: uppercase;
    &.active { color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.1); }
    &.paused { color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); }
  }
  .btn-group { display: flex; gap: 12px; }
}

.action-btn {
  display: flex; align-items: center; gap: 8px; background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 10px; padding: 10px 18px;
  font-size: 13px; color: #cbd5e1; cursor: pointer; transition: 0.2s;
  &:hover { border-color: #38bdf8; color: #fff; background: rgba(56, 189, 248, 0.1); }
  &.btn-delete:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
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

/* Wizard Styling - Essential Fixing without append-to-body */
:deep(.task-add-dialog-custom) {
  background: transparent !important; box-shadow: none !important; border: none !important; .el-dialog__header, .el-dialog__body { padding: 0 !important; }
}

.wizard-container {
  width: 1000px; height: 600px; background: #0a0f1e; border: 1px solid #38bdf8; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
}

.wizard-header {
  padding: 16px 24px; background: #111827; border-bottom: 1px solid #1f2937; display: flex; justify-content: space-between; align-items: center;
  .header-main { display: flex; gap: 16px; align-items: center; .header-icon-box { width: 44px; height: 44px; background: #38bdf8; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #000; font-size: 20px; } h3 { margin: 0; color: #fff; font-size: 18px; } p { margin: 4px 0 0; font-size: 12px; color: #64748b; } }
  .header-ext { display: flex; align-items: center; gap: 20px; .step-count { font-size: 12px; color: #94a3b8; span { color: #38bdf8; font-weight: bold; font-size: 16px; } } .close-wizard { background: #1f2937; border: none; color: #64748b; padding: 6px; border-radius: 6px; cursor: pointer; &:hover { color: #fff; } } }
}

.wizard-content { flex: 1; display: flex; overflow: hidden; }

.timeline-sidebar {
  width: 280px; background: #070a14; border-right: 1px solid #1f2937; padding: 32px 0; display: flex; flex-direction: column;
  .timeline-item {
    padding: 0 24px; display: flex; gap: 16px; position: relative; margin-bottom: 40px;
    .dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #1f2937; background: #070a14; color: #4b5563; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 14px; position: relative; z-index: 2; transition: 0.3s; }
    .text { h4 { margin: 0; color: #4b5563; font-size: 14px; } p { margin: 4px 0 0; font-size: 11px; color: #374151; } }
    .line { position: absolute; left: 39px; top: 32px; width: 2px; height: 40px; background: #1f2937; z-index: 1; }
    &:last-child .line { display: none; }
    
    &.active { .dot { border-color: #38bdf8; color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.4); } .text h4 { color: #fff; } .text p { color: #38bdf8; } }
    &.done { .dot { border-color: #10b981; background: #10b981; color: #fff; } .line { background: #10b981; } .text h4 { color: #94a3b8; } }
  }
}

.step-workarea { flex: 1; display: flex; flex-direction: column; padding: 32px; background: linear-gradient(135deg, #0a0f1e, #070a14); }
.form-scrollable { flex: 1; overflow-y: auto; padding-right: 10px; }

:deep(.el-form-item) {
  .el-form-item__label { color: #94a3b8 !important; padding-bottom: 8px !important; font-weight: 500; font-size: 13px; }
  .el-input__wrapper, .el-select .el-input__wrapper { background: #111827 !important; border: 1px solid #1f2937 !important; box-shadow: none !important; border-radius: 8px; color: #fff; &:hover { border-color: #38bdf8 !important; } }
  .el-input__inner { color: #fff !important; }
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

:deep(.el-radio-button__inner) { background: #111827 !important; color: #64748b !important; border-color: #1f2937 !important; padding: 10px 24px; }
:deep(.el-radio-button.is-active .el-radio-button__inner) { background: #38bdf8 !important; color: #000 !important; border-color: #38bdf8 !important; }

.wizard-footer {
  margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937; display: flex; align-items: center;
  .btn-secondary { background: transparent; border: 1px solid #1f2937; color: #94a3b8; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; &:hover { color: #fff; border-color: #fff; } }
  .btn-primary { background: #38bdf8; color: #000; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); &:hover { opacity: 0.8; } }
  .btn-submit { background: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); }
  .flex-spacer { flex: 1; }
}
</style>
