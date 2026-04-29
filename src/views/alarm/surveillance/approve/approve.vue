<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Search,
  Filter,
  Check,
  Close,
  View,
  User,
  Van,
  Camera,
  ArrowRight,
  Document
} from '@element-plus/icons-vue'

// Dummy Clock icon since Time is removed in newer el-icon packages
const Clock = {
  name: 'Clock',
  render() {
    return null
  }
}

interface ApprovalStep {
  name: string
  status: 'approved' | 'current' | 'pending'
}

interface ApprovalTask {
  id: string
  type: 'Face' | 'Vehicle'
  title: string
  target: string
  termType: string
  cameraCount: number
  flow: ApprovalStep[]
}

const activeTab = ref('pending')

const mockTasks = ref<ApprovalTask[]>([
  {
    id: '#2847',
    type: 'Face',
    title: 'Downtown Surveillance Task',
    target: 'Criminal Database, VIP Watchlist',
    termType: 'Temporary',
    cameraCount: 12,
    flow: [
      { name: 'Alex K.', status: 'approved' },
      { name: 'You', status: 'current' },
      { name: 'James P.', status: 'pending' }
    ]
  },
  {
    id: '#2846',
    type: 'Vehicle',
    title: 'Harbor District License Plate Monitor',
    target: 'ABC-1234, XYZ-5678',
    termType: 'Long-term',
    cameraCount: 8,
    flow: [
      { name: 'You', status: 'current' },
      { name: 'Mike R.', status: 'pending' }
    ]
  },
  {
    id: '#2845',
    type: 'Face',
    title: 'North Quarter VIP Recognition',
    target: 'VIP Database',
    termType: 'Long-term',
    cameraCount: 15,
    flow: [
      { name: 'Emma W.', status: 'approved' },
      { name: 'You', status: 'current' }
    ]
  },
  {
    id: '#2844',
    type: 'Vehicle',
    title: 'Highway 1 Speed Control',
    target: 'All Vehicles > 120km/h',
    termType: 'Temporary',
    cameraCount: 4,
    flow: [
      { name: 'System', status: 'approved' },
      { name: 'Sarah J.', status: 'approved' },
      { name: 'You', status: 'current' }
    ]
  },
  {
    id: '#2843',
    type: 'Face',
    title: 'Airport Terminal 2 Security',
    target: 'No-fly List',
    termType: 'Long-term',
    cameraCount: 32,
    flow: [
      { name: 'You', status: 'current' },
      { name: 'Security Chief', status: 'pending' }
    ]
  },
  {
    id: '#2842',
    type: 'Vehicle',
    title: 'City Entrance Toll Monitor',
    target: 'Unregistered Vehicles',
    termType: 'Long-term',
    cameraCount: 6,
    flow: [
      { name: 'John D.', status: 'approved' },
      { name: 'You', status: 'current' }
    ]
  }
])

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(25)

// Dialog States
const detailDialogVisible = ref(false)
const actionDialogVisible = ref(false)
const actionType = ref<'approve' | 'reject'>('approve')
const selectedTask = ref<ApprovalTask | null>(null)
const actionForm = reactive({ comment: '' })

const openDetail = (task: ApprovalTask) => {
  selectedTask.value = task
  detailDialogVisible.value = true
}

const openAction = (task: ApprovalTask, type: 'approve' | 'reject') => {
  selectedTask.value = task
  actionType.value = type
  actionForm.comment = ''
  actionDialogVisible.value = true
}
</script>

<template>
  <div class="approval-center-container">
    <header class="page-header">
      <h1 class="title">Approval Center</h1>
      <p class="subtitle">Review and approve surveillance tasks · AI Security Operations</p>
    </header>

    <div class="filter-bar">
      <div class="filter-label">
        <el-icon><Filter /></el-icon> Filters:
      </div>
      <select class="cyber-select" v-model="activeTab">
        <option value="pending">Status: Pending (3)</option>
        <option value="initiated">Status: Initiated (3)</option>
        <option value="history">Status: History (15)</option>
      </select>
      <div class="search-wrap">
        <el-icon class="search-icon"><Search /></el-icon>
        <input type="text" placeholder="Search by task name or ID..." class="cyber-input" />
      </div>
      <select class="cyber-select">
        <option>All Term Types</option>
      </select>
    </div>

    <div class="task-list">
      <article class="approval-card" v-for="task in mockTasks" :key="task.id">
        
        <div class="left-section">
          <div class="task-meta-top">
            <span class="type-tag" :class="task.type.toLowerCase()">
              <el-icon><component :is="task.type === 'Face' ? User : Van" /></el-icon>
              {{ task.type }}
            </span>
            <span class="task-id">{{ task.id }}</span>
          </div>
          <h2 class="task-title">{{ task.title }}</h2>
          <div class="task-details">
            <div class="detail-row">
              <span class="lbl">Target:</span> <span class="val cyan">{{ task.target }}</span>
            </div>
            <div class="detail-row inline">
              <span class="lbl">Type:</span> <span class="val">{{ task.termType }}</span>
              <span class="divider">|</span>
              <el-icon class="cam-icon"><Camera /></el-icon> <span class="val">{{ task.cameraCount }} cameras</span>
            </div>
          </div>
        </div>

        <div class="center-section">
          <span class="flow-lbl">Approval Flow</span>
          <div class="flow-visualizer">
            <template v-for="(step, idx) in task.flow" :key="idx">
              <!-- Node -->
              <div class="flow-node" :class="step.status">
                <div class="node-circle">
                  <el-icon v-if="step.status === 'approved'"><Check /></el-icon>
                  <el-icon v-else><User /></el-icon>
                </div>
                <span class="node-name">{{ step.name }}</span>
              </div>
              <!-- Connector (Arrow) -->
              <div class="flow-connector" v-if="idx < task.flow.length - 1">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </template>
          </div>
        </div>

        <div class="right-section">
          <button class="action-btn detail" @click="openDetail(task)">
            <el-icon><View /></el-icon> Detail
          </button>
          <button class="action-btn approve" @click="openAction(task, 'approve')">
            <el-icon><Check /></el-icon> Approve
          </button>
          <button class="action-btn reject" @click="openAction(task, 'reject')">
            <el-icon><Close /></el-icon> Reject
          </button>
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
    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Task Details"
      width="500px"
      class="cyber-dialog-premium"
      destroy-on-close
    >
      <div class="detail-content" v-if="selectedTask">
        <div class="detail-grid">
          <div class="info-group">
            <label>Task ID</label>
            <span class="value cyan-text">{{ selectedTask.id }}</span>
          </div>
          <div class="info-group">
            <label>Type</label>
            <span class="value">{{ selectedTask.type }}</span>
          </div>
          <div class="info-group full-width">
            <label>Task Title</label>
            <span class="value highlight-text">{{ selectedTask.title }}</span>
          </div>
          <div class="info-group full-width">
            <label>Target</label>
            <span class="value">{{ selectedTask.target }}</span>
          </div>
          <div class="info-group">
            <label>Term</label>
            <span class="value">{{ selectedTask.termType }}</span>
          </div>
          <div class="info-group">
            <label>Cameras</label>
            <span class="value">{{ selectedTask.cameraCount }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Action Dialog -->
    <el-dialog
      v-model="actionDialogVisible"
      :title="actionType === 'approve' ? 'Approve Task' : 'Reject Task'"
      width="450px"
      class="cyber-dialog-premium"
      destroy-on-close
    >
      <div class="action-form">
        <div class="prompt-alert" :class="actionType">
          <el-icon class="alert-icon"><component :is="actionType === 'approve' ? Check : Close" /></el-icon>
          <p>
            You are about to <strong>{{ actionType }}</strong> task 
            <span class="id-text">{{ selectedTask?.id }}</span>.
          </p>
        </div>
        <div class="form-group-modal">
          <label>Comments (Optional)</label>
          <textarea v-model="actionForm.comment" rows="3" class="cyber-textarea" placeholder="Enter your remarks..."></textarea>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="actionDialogVisible = false">Cancel</button>
          <button class="btn-confirm" :class="actionType" @click="actionDialogVisible = false">
            Confirm {{ actionType === 'approve' ? 'Approval' : 'Rejection' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.approval-center-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  background: transparent;
  color: #e2e8f0;
}

.page-header {
  margin-bottom: 24px;
  .title { font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #f8fafc; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
}


.filter-bar {
  display: flex; align-items: center; gap: 16px;
  background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 12px 20px; border-radius: 12px; margin-bottom: 24px;

  .filter-label { display: flex; align-items: center; gap: 6px; color: #38bdf8; font-size: 14px; font-weight: 600; }
  
  .search-wrap {
    flex: 1; position: relative;
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
    .cyber-input {
      width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px; padding: 8px 12px 8px 36px; color: #fff; font-size: 14px; outline: none; transition: 0.2s;
      &:focus { border-color: #38bdf8; background: rgba(0,0,0,0.4); }
    }
  }

  .cyber-select {
    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px; padding: 8px 32px 8px 16px; color: #e2e8f0; font-size: 13px; outline: none; appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
    &:focus { border-color: #38bdf8; }
    option { background: #0f172a; }
  }
}

.task-list {
  display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1;
  padding-bottom: 20px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }
}

.approval-card {
  display: flex; align-items: stretch; justify-content: space-between;
  background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 12px;
  padding: 20px 24px; transition: all 0.2s;

  &:hover { background: rgba(30, 41, 59, 0.6); border-color: rgba(56, 189, 248, 0.3); transform: translateY(-1px); }

  .left-section {
    flex: 1;
    .task-meta-top {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
      .type-tag {
        display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
        &.face { color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.1); }
        &.vehicle { color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1); }
      }
      .task-id { color: #64748b; font-size: 12px; font-family: monospace; }
    }
    
    .task-title { font-size: 18px; font-weight: 600; color: #f8fafc; margin: 0 0 12px 0; }
    
    .task-details {
      display: flex; flex-direction: column; gap: 6px;
      .detail-row {
        font-size: 13px;
        &.inline { display: flex; align-items: center; gap: 8px; }
        .lbl { color: #94a3b8; }
        .val { color: #e2e8f0; &.cyan { color: #38bdf8; } }
        .divider { color: #475569; }
        .cam-icon { color: #38bdf8; }
      }
    }
  }

  .center-section {
    width: 340px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px; padding: 16px; margin: 0 24px;
    display: flex; flex-direction: column; justify-content: center;

    .flow-lbl { font-size: 11px; color: #64748b; margin-bottom: 12px; display: block; }
    
    .flow-visualizer {
      display: flex; align-items: center; gap: 8px;
      
      .flow-node {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        .node-circle {
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          border: 2px solid transparent; transition: all 0.3s;
        }
        .node-name { font-size: 11px; color: #94a3b8; }

        &.approved {
          .node-circle { background: rgba(16, 185, 129, 0.1); border-color: #10b981; color: #10b981; }
          .node-name { color: #10b981; }
        }
        &.current {
          .node-circle { background: rgba(14, 165, 233, 0.1); border-color: #0ea5e9; color: #0ea5e9; box-shadow: 0 0 12px rgba(14, 165, 233, 0.4); }
          .node-name { color: #38bdf8; font-weight: 600; }
        }
        &.pending {
          .node-circle { background: transparent; border-color: #475569; color: #64748b; }
        }
      }

      .flow-connector { color: #475569; font-size: 12px; display: flex; align-items: center; margin-bottom: 16px; }
    }
  }

  .right-section {
    display: flex; align-items: center; gap: 12px;

    .action-btn {
      display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
      &.detail { background: transparent; border: 1px solid #0ea5e9; color: #38bdf8; &:hover { background: rgba(14, 165, 233, 0.1); } }
      &.approve { background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; &:hover { background: #10b981; color: #fff; } }
      &.reject { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; &:hover { background: #ef4444; color: #fff; } }
    }
  }
}

/* Custom Pagination Styling */
.cyber-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 8px;

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

/* Dialog Styling */
:deep(.el-dialog.cyber-dialog-premium) {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 24px;
  .el-dialog__header { padding: 24px 32px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
  .el-dialog__title { color: #fff; font-weight: 700; font-size: 18px; }
  .el-dialog__body { padding: 32px; }
  .el-dialog__footer { padding: 0 32px 32px; border: none; }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  &.full-width { grid-column: span 2; }
  label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
  .value { font-size: 14px; color: #e2e8f0; font-weight: 500; }
  .cyan-text { color: #38bdf8; font-family: monospace; font-weight: 700; }
  .highlight-text { color: #f8fafc; font-weight: 700; font-size: 16px; }
}

.prompt-alert {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px; border-radius: 12px; margin-bottom: 24px;
  .alert-icon { font-size: 20px; }
  p { margin: 0; font-size: 14px; line-height: 1.5; color: #e2e8f0; }
  .id-text { font-family: monospace; font-weight: 700; }
  
  &.approve {
    background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);
    .alert-icon { color: #10b981; }
    .id-text { color: #10b981; }
  }
  &.reject {
    background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
    .alert-icon { color: #ef4444; }
    .id-text { color: #ef4444; }
  }
}

.form-group-modal {
  display: flex; flex-direction: column; gap: 8px;
  label { font-size: 12px; color: #94a3b8; font-weight: 600; }
}

.cyber-textarea {
  width: 100%; background: rgba(10, 15, 30, 0.6); border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px; padding: 12px; color: #fff; font-size: 13px; outline: none; resize: none;
  font-family: inherit;
  &:focus { border-color: #38bdf8; }
}

.dialog-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  button { padding: 10px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
  .btn-cancel { background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8; &:hover { color: #fff; border-color: #fff; } }
  .btn-confirm {
    border: none; color: #fff;
    &.approve { background: #10b981; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5); } }
    &.reject { background: #ef4444; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5); } }
  }
}
</style>
