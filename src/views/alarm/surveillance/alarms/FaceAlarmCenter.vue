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
  UserFilled,
  Download,
  Files,
  Location,
  VideoCamera
} from '@element-plus/icons-vue'

interface FaceAlarm {
  id: string
  time: string
  taskType: string
  library: string
  score: string
  capImg: string
  capPanoramaImg: string
  libImg: string
  location: string
  device: string
  personName: string
  idNumber: string
  idType: string
  nationality: string
  gender: string
  birthDate: string
  remarks: string
}

const alarms = ref<FaceAlarm[]>([
  {
    id: '1',
    time: '2026-04-13 10:15:33',
    taskType: 'Blacklist Alert',
    library: 'Criminal DB',
    score: '94%',
    capImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300',
    capPanoramaImg: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&h=400',
    libImg: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=300&h=300',
    location: 'Muscat City Center',
    device: 'CAM-MCT-001',
    personName: 'Ahmed Al-Rashid',
    idNumber: 'A123456789',
    idType: 'National ID',
    nationality: 'Omani',
    gender: 'Male',
    birthDate: '1985-06-15',
    remarks: 'Wanted for questioning in related cases.'
  },
  {
    id: '2',
    time: '2026-04-13 14:18:42',
    taskType: 'Suspicious Activity',
    library: 'Watchlist',
    score: '87%',
    capImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300',
    capPanoramaImg: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&h=400',
    libImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300',
    location: 'North Gate Entrance',
    device: 'CAM-NGE-004',
    personName: 'Saleh Malik',
    idNumber: 'B987654321',
    idType: 'Passport',
    nationality: 'UAE',
    gender: 'Male',
    birthDate: '1990-11-22',
    remarks: 'Frequent suspicious border crossings.'
  }
])

defineProps<{
  hideTitle?: boolean
}>()

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(6)

// Dialog State
const detailDialogVisible = ref(false)
const selectedAlarm = ref<FaceAlarm | null>(null)
const activeTab = ref('detail')

const openDetail = (alarm: FaceAlarm) => {
  selectedAlarm.value = alarm
  activeTab.value = 'detail'
  detailDialogVisible.value = true
}
</script>

<template>
  <div class="face-alarm-layout">
    <!-- 左侧过滤器面板 -->
    <aside class="filter-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <el-icon><Search /></el-icon>
          <span>Search Filters</span>
        </div>
        
        <div class="form-group">
          <label class="cyber-label">Task Type</label>
          <select class="cyber-select">
            <option>All Tasks</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Date Range</label>
          <div class="cyber-input-wrap">
            <input type="text" class="cyber-input" value="2026/04/13 00:00" />
            <el-icon class="append-icon"><Calendar /></el-icon>
          </div>
          <div class="cyber-input-wrap mt-2">
            <input type="text" class="cyber-input" value="2026/04/13 23:59" />
            <el-icon class="append-icon"><Calendar /></el-icon>
          </div>
        </div>

        <div class="form-group">
          <label class="cyber-label">Handling Status</label>
          <select class="cyber-select">
            <option>All Status</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Alarm Level</label>
          <select class="cyber-select">
            <option>All Levels</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Library</label>
          <select class="cyber-select">
            <option>All Libraries</option>
          </select>
        </div>

        <div class="sidebar-actions">
          <button class="btn-search">
            <el-icon><Search /></el-icon> Search
          </button>
          <button class="btn-reset">
            <el-icon><Refresh /></el-icon>
          </button>
        </div>
      </div>
    </aside>

    <!-- 右侧内容区域 -->
    <main class="main-content">
      <!-- 头部信息 -->
      <header class="content-header" v-if="!hideTitle">
        <div class="header-left">
          <h2 class="title">Face Alarm Center</h2>
          <p class="subtitle"><span class="highlight-num">6</span> active face alarms requiring attention</p>
        </div>
        <div class="header-right">
          <button class="btn-ghost"><el-icon><Files /></el-icon> Batch Process</button>
          <button class="btn-ghost"><el-icon><Download /></el-icon> Export Report</button>
        </div>
      </header>

      <!-- 告警列表区 -->
      <div class="alarm-list-container">
        <!-- 单个告警卡片 -->
        <article class="alarm-card" v-for="alarm in alarms" :key="alarm.id">
          <!-- 信息列 -->
          <div class="col-info">
            <div class="tag-row">
              <span class="status-tag high">
                <el-icon><Warning /></el-icon> HIGH
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
                <span class="data-label">Task Type</span>
                <span class="data-value">{{ alarm.taskType }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Library</span>
                <span class="data-value">{{ alarm.library }}</span>
              </div>
            </div>
          </div>

          <!-- 图片展示列 -->
          <div class="col-images">
            <!-- 抓拍图像 -->
            <div class="image-section capture">
              <span class="img-title">Captured Image</span>
              <div class="img-box capture-box">
                <img :src="alarm.capImg" alt="Captured" />
                <div class="score-badge">★ {{ alarm.score }}</div>
              </div>
              <div class="img-footer capture-footer">
                <p><el-icon><Location /></el-icon> {{ alarm.location }}</p>
                <p><el-icon><VideoCamera /></el-icon> {{ alarm.device }}</p>
              </div>
            </div>

            <!-- 库内图像 -->
            <div class="image-section library">
              <span class="img-title">Library Image</span>
              <div class="img-box library-box">
                <img :src="alarm.libImg" alt="Library" />
              </div>
              <div class="img-footer library-footer">
                <h4>{{ alarm.personName }}</h4>
                <p>Match Score: {{ alarm.score }}</p>
              </div>
            </div>
          </div>

          <!-- 操作按钮列 -->
          <div class="card-actions-rail">
            <button class="btn-action confirm"><el-icon><Check /></el-icon> Confirm</button>
            <button class="btn-action reject"><el-icon><Close /></el-icon> Reject</button>
            <button class="btn-action-outline" @click="openDetail(alarm)"><el-icon><View /></el-icon> Detail</button>
            <button class="btn-action-outline"><el-icon><UserFilled /></el-icon> Assign</button>
          </div>
        </article>
      </div>

      <!-- 分页底栏 -->
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
      title="Face Alarm Detail"
      width="1100px"
      top="4vh"
      class="cyber-dialog-premium"
      destroy-on-close
    >
      <el-tabs v-model="activeTab" class="cyber-tabs">
        <el-tab-pane label="Detail" name="detail">
          <div class="detail-tab-content" v-if="selectedAlarm">
            <!-- 3 Images Section -->
            <div class="images-grid">
              <!-- Panorama -->
              <div class="img-card panorama">
                <div class="img-header">Capture Panorama</div>
                <div class="img-wrapper">
                  <img :src="selectedAlarm.capPanoramaImg" alt="Panorama" />
                </div>
                <div class="img-info">
                  <p><el-icon><Location /></el-icon> {{ selectedAlarm.location }}</p>
                  <p><el-icon><VideoCamera /></el-icon> {{ selectedAlarm.device }}</p>
                  <p><el-icon><Calendar /></el-icon> {{ selectedAlarm.time }}</p>
                </div>
              </div>

              <!-- Face Capture -->
              <div class="img-card capture">
                <div class="img-header">Face Capture</div>
                <div class="img-wrapper">
                  <img :src="selectedAlarm.capImg" alt="Capture" />
                  <div class="score-overlay">Score: {{ selectedAlarm.score }}</div>
                </div>
                <div class="img-info">
                  <p>Quality: High</p>
                  <p>Yaw: 5° | Pitch: -2°</p>
                  <p>Mask: No | Glasses: Yes</p>
                </div>
              </div>

              <!-- Database Face -->
              <div class="img-card library">
                <div class="img-header">Database Face</div>
                <div class="img-wrapper">
                  <img :src="selectedAlarm.libImg" alt="Library" />
                </div>
                <div class="img-info">
                  <p>Library: {{ selectedAlarm.library }}</p>
                  <p>Registered: 2025-01-10</p>
                  <p>Status: Active</p>
                </div>
              </div>
            </div>

            <!-- Database Info Bottom Section -->
            <div class="db-info-section">
              <h3 class="section-title">Database Person Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name</label>
                  <span>{{ selectedAlarm.personName }}</span>
                </div>
                <div class="info-item">
                  <label>ID Number</label>
                  <span class="highlight">{{ selectedAlarm.idNumber }}</span>
                </div>
                <div class="info-item">
                  <label>ID Type</label>
                  <span>{{ selectedAlarm.idType }}</span>
                </div>
                <div class="info-item">
                  <label>Nationality</label>
                  <span>{{ selectedAlarm.nationality }}</span>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <span>{{ selectedAlarm.gender }}</span>
                </div>
                <div class="info-item">
                  <label>Birth Date</label>
                  <span>{{ selectedAlarm.birthDate }}</span>
                </div>
                <div class="info-item full-width">
                  <label>Remarks</label>
                  <span>{{ selectedAlarm.remarks }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <!-- Future tabs placeholders -->
        <el-tab-pane label="Video Playback" name="video" disabled></el-tab-pane>
        <el-tab-pane label="Trajectory" name="trajectory" disabled></el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.face-alarm-layout {
  display: flex;
  height: 100%;
  background: transparent;
  color: #e2e8f0;
  overflow: hidden;
}

/* =========== 左侧过滤器面板 =========== */
.filter-panel {
  width: 280px;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  margin-right: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #38bdf8;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }
}

.form-group {
  margin-bottom: 18px;
  .cyber-label {
    display: block;
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 6px;
  }
}

.cyber-select, .cyber-input {
  width: 100%;
  background: rgba(10, 15, 30, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #fff;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  &:focus { border-color: #38bdf8; }
}

.cyber-input-wrap {
  position: relative;
  .append-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 14px;
  }
}
.mt-2 { margin-top: 8px; }

.mt-2 { margin-top: 8px; }

.sidebar-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;

  .btn-search {
    flex: 1;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    &:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4); }
  }

  .btn-reset {
    width: 42px;
    background: rgba(148, 163, 184, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #cbd5e1;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: rgba(148, 163, 184, 0.1); border-color: #38bdf8; color: #38bdf8; }
  }
}

/* =========== 右侧主内容区 =========== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 4px; /* Scrollbar space */

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  .title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
  .highlight-num { color: #38bdf8; font-weight: 700; }
  .header-right { display: flex; gap: 12px; }
}

/* 告警列表区 */
.alarm-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-card {
  display: flex;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  padding: 20px;
  gap: 24px;
  transition: transform 0.2s, border-color 0.2s;
  &:hover {
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateY(-2px);
  }
}

.col-info {
  width: 180px;
  flex-shrink: 0;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 40px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
  margin-bottom: 8px;
  &.high { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
  &.verified { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
}

.meta-data {
  .data-group {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    .data-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-value { font-size: 13px; color: #e2e8f0; font-weight: 500; margin-top: 2px; }
  }
}

.col-images {
  flex: 1;
  display: flex;
  gap: 20px;
}

.image-section {
  flex: 1;
  max-width: 260px;
  .img-title { font-size: 11px; color: #94a3b8; margin-bottom: 6px; display: block; }
  .img-box {
    width: 100%;
    aspect-ratio: 4/3;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.05);
    img { width: 100%; height: 100%; object-fit: cover; }
    &.capture-box { border: 1px solid rgba(239, 68, 68, 0.4); }
  }
}

.score-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0f172a;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.img-footer {
  margin-top: 8px;
  p { margin: 0; font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
  h4 { margin: 0; font-size: 14px; font-weight: 600; color: #f1f5f9; }
}

.card-actions-rail {
  width: 140px;
  border-left: 1px solid rgba(148, 163, 184, 0.08);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.btn-action {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &.confirm { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); &:hover { background: #10b981; color: #fff; } }
  &.reject { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); &:hover { background: #ef4444; color: #fff; } }
}

.btn-action-outline {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover { background: rgba(56, 189, 248, 0.08); border-color: #38bdf8; color: #38bdf8; }
}

.btn-ghost {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 6px 14px;
  border-radius: 40px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  &:hover { background: #334155; color: white; }
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

/* ================= Dialog Styling ================= */
:deep(.el-dialog.cyber-dialog-premium) {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 20px;
  .el-dialog__header { padding: 16px 24px 0; border-bottom: none; margin-right: 0;}
  .el-dialog__title { color: #fff; font-weight: 700; font-size: 18px; }
  .el-dialog__body { padding: 0 24px 24px; }
}

/* Tabs Styling */
:deep(.cyber-tabs) {
  .el-tabs__nav-wrap::after { background-color: rgba(148, 163, 184, 0.1); }
  .el-tabs__item { color: #94a3b8; font-weight: 600; font-size: 14px; padding: 0 16px; height: 36px; line-height: 36px; }
  .el-tabs__item.is-active { color: #38bdf8; }
  .el-tabs__active-bar { background-color: #38bdf8; }
  .el-tabs__header { margin-bottom: 12px; }
}

/* Detail Content */
.detail-tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.images-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
}

.img-card {
  background: rgba(10, 15, 30, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .img-header {
    background: rgba(30, 41, 59, 0.5);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #cbd5e1;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    text-align: center;
  }

  .img-wrapper {
    flex: 1;
    position: relative;
    background: #000;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .score-overlay {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(220, 38, 38, 0.9);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
  }

  .img-info {
    padding: 8px 12px;
    background: rgba(15, 23, 42, 0.8);
    p {
      margin: 0 0 4px 0;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;
      &:last-child { margin-bottom: 0; }
    }
  }
}

.db-info-section {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  padding: 12px 20px;

  .section-title {
    margin: 0 0 10px 0;
    font-size: 13px;
    color: #38bdf8;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    &::before {
      content: '';
      width: 4px;
      height: 14px;
      background: #38bdf8;
      border-radius: 2px;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      &.full-width {
        grid-column: 1 / -1;
      }

      label {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
      }

      span {
        font-size: 13px;
        color: #e2e8f0;
        font-weight: 500;
        
        &.highlight {
          color: #f8fafc;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
      }
    }
  }
}
</style>
