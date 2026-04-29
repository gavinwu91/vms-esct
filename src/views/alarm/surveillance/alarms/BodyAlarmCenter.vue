<script setup lang="ts">
import { ref } from 'vue'
import {
  Search,
  Refresh,
  Calendar,
  Warning,
  Check,
  Close,
  View,
  Download,
  Location,
  VideoCamera,
  Avatar,
  Monitor,
  UserFilled,
  Files,
  UploadFilled
} from '@element-plus/icons-vue'

interface BodyAlarm {
  id: string
  time: string
  taskType: string
  attributes: string
  score: string
  capImg: string
  capPanoramaImg: string
  location: string
  device: string
  gender: string
  age: string
  topColor: string
  bottomColor: string
  hasBag: string
  remarks: string
  status: 'HIGH' | 'MEDIUM' | 'LOW'
}

const alarms = ref<BodyAlarm[]>([
  {
    id: '1',
    time: '2026-04-13 11:20:15',
    taskType: 'Target Search',
    attributes: 'Red Top, Blue Bottom',
    score: '92%',
    capImg: 'https://images.unsplash.com/photo-1539106397238-1bc009b7d7aa?auto=format&fit=crop&w=300&h=300',
    capPanoramaImg: 'https://images.unsplash.com/photo-1517733948463-3c6158984c31?auto=format&fit=crop&w=600&h=400',
    location: 'Central Plaza Entrance',
    device: 'CAM-PLZ-002',
    gender: 'Male',
    age: 'Adult',
    topColor: 'Red',
    bottomColor: 'Blue',
    hasBag: 'No',
    remarks: 'Matching top/bottom color criteria.',
    status: 'HIGH'
  },
  {
    id: '2',
    time: '2026-04-13 15:45:00',
    taskType: 'Blackpack Tracking',
    attributes: 'Black Backpack, Female',
    score: '89%',
    capImg: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&h=300',
    capPanoramaImg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&h=400',
    location: 'West Gate Exit',
    device: 'CAM-WGE-015',
    gender: 'Female',
    age: 'Young Adult',
    topColor: 'White',
    bottomColor: 'Black',
    hasBag: 'Yes (Black)',
    remarks: 'Detected target with matching backpack.',
    status: 'MEDIUM'
  }
])

defineProps<{
  hideTitle?: boolean
}>()

const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(8)

const detailDialogVisible = ref(false)
const selectedAlarm = ref<BodyAlarm | null>(null)

const openDetail = (alarm: BodyAlarm) => {
  selectedAlarm.value = alarm
  detailDialogVisible.value = true
}
</script>

<template>
  <div class="body-alarm-layout">
    <!-- Filter Sidebar -->
    <aside class="filter-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <el-icon><Search /></el-icon>
          <span>Body Search Filters</span>
        </div>
        
        <div class="form-group">
          <label class="cyber-label">Gender</label>
          <select class="cyber-select">
            <option>Any</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Top Color</label>
          <select class="cyber-select">
            <option>Any</option>
            <option>Red</option>
            <option>Blue</option>
            <option>Black</option>
            <option>White</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Date Range</label>
          <div class="cyber-input-wrap">
            <input type="text" class="cyber-input" value="2026/04/13 00:00" />
            <el-icon class="append-icon"><Calendar /></el-icon>
          </div>
        </div>

        <div class="sidebar-actions">
          <button class="btn-search"><el-icon><Search /></el-icon> Search</button>
          <button class="btn-reset"><el-icon><Refresh /></el-icon></button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <header class="content-header" v-if="!hideTitle">
        <div class="header-left">
          <h2 class="title">Body Alarm Center</h2>
          <p class="subtitle"><span class="highlight-num">{{ totalTasks }}</span> active body alarms requiring attention</p>
        </div>
        <div class="header-right">
          <button class="btn-ghost"><el-icon><Files /></el-icon> Batch Process</button>
          <button class="btn-ghost"><el-icon><Download /></el-icon> Export Report</button>
        </div>
      </header>

      <div class="alarm-list-container">
        <article class="alarm-card" v-for="alarm in alarms" :key="alarm.id">
          <!-- Info Column -->
          <div class="col-info">
            <div class="tag-row">
              <span class="status-tag" :class="alarm.status.toLowerCase()">
                <el-icon><Warning /></el-icon> {{ alarm.status }}
              </span>
              <span class="status-tag verified">
                <el-icon><Check /></el-icon> VERIFIED
              </span>
            </div>
            <div class="meta-data">
              <div class="data-group">
                <span class="data-label">Alarm Time</span>
                <span class="data-value">{{ alarm.time }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Attributes</span>
                <span class="data-value">{{ alarm.attributes }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Location</span>
                <span class="data-value">{{ alarm.location }}</span>
              </div>
            </div>
          </div>

          <!-- Images Column -->
          <div class="col-images">
            <div class="image-section capture">
              <span class="img-title">Captured Body</span>
              <div class="img-box capture-box">
                <img :src="alarm.capImg" />
                <div class="score-badge">★ {{ alarm.score }}</div>
              </div>
              <div class="img-footer capture-footer">
                <p><el-icon><VideoCamera /></el-icon> {{ alarm.device }}</p>
              </div>
            </div>
            
            <div class="image-section info-summary">
              <span class="img-title">Detected Traits</span>
              <div class="traits-box">
                <div class="trait"><label>Gender</label><span>{{ alarm.gender }}</span></div>
                <div class="trait"><label>Age</label><span>{{ alarm.age }}</span></div>
                <div class="trait"><label>Top</label><span :style="{color: alarm.topColor}">{{ alarm.topColor }}</span></div>
                <div class="trait"><label>Bag</label><span>{{ alarm.hasBag }}</span></div>
              </div>
            </div>
          </div>

          <!-- Actions Rail -->
          <div class="card-actions-rail">
            <button class="btn-action confirm"><el-icon><Check /></el-icon> Confirm</button>
            <button class="btn-action reject"><el-icon><Close /></el-icon> Reject</button>
            <button class="btn-action-outline" @click="openDetail(alarm)"><el-icon><View /></el-icon> Detail</button>
            <button class="btn-action-outline"><el-icon><UserFilled /></el-icon> Assign</button>
          </div>
        </article>
      </div>

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
    </main>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Body Alarm Detail Analysis"
      width="1000px"
      class="cyber-dialog-premium"
      destroy-on-close
    >
      <div v-if="selectedAlarm" class="detail-layout">
        <div class="detail-left">
          <div class="comparison-header">Target Verification</div>
          <div class="comparison-box">
            <div class="img-panel">
              <img :src="selectedAlarm.capImg" />
              <div class="panel-label">Captured Image</div>
            </div>
          </div>
          <div class="panorama-panel">
            <div class="panel-title">Wide Scene Panorama</div>
            <img :src="selectedAlarm.capPanoramaImg" />
          </div>
        </div>
        <div class="detail-right">
          <div class="info-section">
            <div class="section-title"><el-icon><Avatar /></el-icon> Person Information</div>
            <div class="info-grid">
              <div class="info-item"><label>Gender</label><span>{{ selectedAlarm.gender }}</span></div>
              <div class="info-item"><label>Age Group</label><span>{{ selectedAlarm.age }}</span></div>
              <div class="info-item"><label>Top Color</label><span>{{ selectedAlarm.topColor }}</span></div>
              <div class="info-item"><label>Bottom Color</label><span>{{ selectedAlarm.bottomColor }}</span></div>
              <div class="info-item"><label>Carrying Bag</label><span>{{ selectedAlarm.hasBag }}</span></div>
            </div>
          </div>
          <div class="info-section">
            <div class="section-title"><el-icon><Location /></el-icon> Spatial-Temporal Data</div>
            <div class="info-list">
              <div class="list-item"><label>Alarm Time</label><span>{{ selectedAlarm.time }}</span></div>
              <div class="list-item"><label>Location</label><span>{{ selectedAlarm.location }}</span></div>
              <div class="list-item"><label>Device ID</label><span>{{ selectedAlarm.device }}</span></div>
              <div class="list-item"><label>Task Type</label><span>{{ selectedAlarm.taskType }}</span></div>
            </div>
          </div>
          <div class="info-section">
            <div class="section-title"><el-icon><Monitor /></el-icon> System Remarks</div>
            <div class="remarks-box">{{ selectedAlarm.remarks }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.body-alarm-layout {
  height: 100%;
  display: flex;
  gap: 20px;
  padding: 0 4px;
}

/* Sidebar Styles matching Face/Vehicle */
.filter-panel {
  width: 280px; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px; padding: 20px;
  .panel-header { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 24px; }
}

.form-group {
  margin-bottom: 20px;
  .cyber-label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 8px; font-weight: 600; }
  .cyber-select, .cyber-input {
    width: 100%; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 13px; outline: none;
    &:focus { border-color: #38bdf8; }
  }
}

.sidebar-actions {
  display: flex; gap: 12px; margin-top: 32px;
  button { flex: 1; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .btn-search { background: #38bdf8; color: #0f172a; border: none; }
  .btn-reset { background: rgba(148, 163, 184, 0.1); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
}

/* Content Styles matching Face/Vehicle */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.content-header {
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;
  .title { font-size: 24px; font-weight: 700; color: #f8fafc; margin: 0; }
  .subtitle { font-size: 14px; color: #94a3b8; margin-top: 6px; .highlight-num { color: #38bdf8; font-weight: 700; } }
}

.btn-ghost {
  background: rgba(148, 163, 184, 0.05); border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;
  display: inline-flex; align-items: center; gap: 8px; margin-left: 12px;
  &:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; color: #fff; }
}

.alarm-list-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding-right: 4px; }

/* Rail-style Card Layout */
.alarm-card {
  display: flex; background: rgba(30, 41, 59, 0.3); border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px; overflow: hidden; transition: 0.3s;
  &:hover { background: rgba(30, 41, 59, 0.5); border-color: rgba(56, 189, 248, 0.3); transform: translateX(4px); }
}

.col-info {
  width: 260px; padding: 24px; border-right: 1px solid rgba(148, 163, 184, 0.1);
  display: flex; flex-direction: column; gap: 20px;
  .tag-row { display: flex; gap: 8px; }
  .status-tag {
    padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 4px;
    &.high { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    &.medium { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    &.verified { background: rgba(16, 185, 129, 0.15); color: #10b981; }
  }
  .data-group {
    margin-bottom: 12px;
    .data-label { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .data-value { font-size: 13px; color: #e2e8f0; font-weight: 500; }
  }
}

.col-images {
  flex: 1; padding: 20px; display: flex; gap: 24px;
  .image-section {
    flex: 1; display: flex; flex-direction: column; gap: 10px;
    .img-title { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .img-box {
      aspect-ratio: 4/3; background: #000; border-radius: 12px; overflow: hidden; position: relative;
      img { width: 100%; height: 100%; object-fit: cover; }
      .score-badge { position: absolute; top: 12px; right: 12px; background: rgba(16, 185, 129, 0.9); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    }
    .img-footer { font-size: 12px; color: #94a3b8; p { margin: 0; display: flex; align-items: center; gap: 6px; } }
  }
}

.traits-box {
  background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; height: 100%;
  .trait {
    display: flex; justify-content: space-between; align-items: center;
    label { font-size: 11px; color: #64748b; text-transform: uppercase; }
    span { font-size: 13px; color: #f1f5f9; font-weight: 600; }
  }
}

.card-actions-rail {
  width: 140px; background: rgba(15, 23, 42, 0.3); padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
  .btn-action {
    width: 100%; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    &.confirm { background: #10b981; color: #fff; }
    &.reject { background: #ef4444; color: #fff; }
  }
  .btn-action-outline {
    width: 100%; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    &:hover { border-color: #38bdf8; color: #38bdf8; background: rgba(56, 189, 248, 0.1); }
  }
}

/* Custom Pagination Styling */
.cyber-pagination {
  margin-top: 24px; display: flex; justify-content: flex-end; padding-bottom: 20px;
  :deep(.el-pagination) {
    --el-pagination-bg-color: rgba(30, 41, 59, 0.4);
    --el-pagination-text-color: #94a3b8;
    --el-pagination-button-color: #94a3b8;
    --el-pagination-hover-color: #38bdf8;
    .el-pagination__total, .el-pagination__jump { color: #64748b; }
    .el-pager li {
      background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 6px; margin: 0 4px; font-weight: 600;
      &.is-active { background: rgba(14, 165, 233, 0.2); border-color: #38bdf8; color: #38bdf8; }
    }
  }
}

/* Detail Analysis Dialog Styles */
.detail-layout { display: flex; gap: 32px; min-height: 500px; }
.detail-left { flex: 1.2; display: flex; flex-direction: column; gap: 24px; }
.detail-right { flex: 1; display: flex; flex-direction: column; gap: 24px; }

.comparison-header { font-size: 14px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; }
.img-panel {
  background: #000; border-radius: 16px; overflow: hidden; position: relative; height: 320px;
  img { width: 100%; height: 100%; object-fit: contain; }
  .panel-label { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.6); color: #fff; font-size: 11px; padding: 8px; text-align: center; }
}
.panorama-panel {
  .panel-title { font-size: 12px; color: #64748b; margin-bottom: 12px; }
  img { width: 100%; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1); }
}

.info-section {
  background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 16px; padding: 20px;
  .section-title { font-size: 14px; font-weight: 700; color: #38bdf8; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
}

.info-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  .info-item {
    label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    span { font-size: 14px; color: #f1f5f9; font-weight: 600; }
  }
}

.info-list {
  display: flex; flex-direction: column; gap: 12px;
  .list-item {
    display: flex; justify-content: space-between;
    label { font-size: 12px; color: #64748b; }
    span { font-size: 13px; color: #f1f5f9; font-weight: 500; }
  }
}

.remarks-box { font-size: 13px; color: #94a3b8; line-height: 1.6; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; }

:deep(.cyber-dialog-premium) {
  background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 24px;
  .el-dialog__header { padding: 24px 32px; .el-dialog__title { color: #fff; font-weight: 700; } }
  .el-dialog__body { padding: 32px; }
}
</style>
