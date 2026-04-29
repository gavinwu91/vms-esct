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
  VideoCamera,
  MapLocation,
  Document,
  Share,
  Aim
} from '@element-plus/icons-vue'

interface VehicleAlarm {
  id: string
  title: string
  time: string
  location: string
  plateNumber: string
  vehicleType: string
  vehicleColor: string
  captureDevice: string
  captureLocation: string
  details: string
  status: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  step: 'PENDING' | 'VERIFIED'
  image: string
  capPanoramaImg?: string
  capPlateImg?: string
  libImg?: string
  libraryName?: string
  ownerName?: string
  ownerId?: string
  contactNumber?: string
  speed?: string
  lane?: string
  direction?: string
  vehicleBrand?: string
}

const alarms = ref<VehicleAlarm[]>([
  {
    id: '1',
    title: 'Stolen Vehicle Alert',
    time: '2026-04-13 14:25:30',
    location: 'Sultan Qaboos Highway',
    plateNumber: 'OM-1234',
    vehicleType: 'Sedan',
    vehicleColor: 'Black',
    captureDevice: 'CAM-SQH-045',
    captureLocation: 'Sultan Qaboos Highway',
    details: 'Vehicle OM-1234 detected at Sultan Qaboos Highway. Task: Stolen Vehicle Alert. Immediate action required for Level 1 alarm.',
    status: 'CRITICAL',
    step: 'PENDING',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    capPanoramaImg: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&h=400',
    capPlateImg: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=300&h=300',
    libImg: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=300&h=300',
    libraryName: 'Stolen Vehicles DB',
    ownerName: 'Ali Al-Harthi',
    ownerId: 'O-123984',
    contactNumber: '+968 9123 4567',
    speed: '112 km/h',
    lane: 'Fast Lane (L1)',
    direction: 'Northbound',
    vehicleBrand: 'Toyota Camry'
  },
  {
    id: '2',
    title: 'Suspicious Activity',
    time: '2026-04-13 14:20:15',
    location: 'Al Ghubrah Roundabout',
    plateNumber: 'OM-5678',
    vehicleType: 'SUV',
    vehicleColor: 'White',
    captureDevice: 'CAM-AGR-012',
    captureLocation: 'Al Ghubrah Roundabout',
    details: 'Vehicle OM-5678 observed circling the area multiple times. Potential unauthorized parking in restricted zone.',
    status: 'HIGH',
    step: 'VERIFIED',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    capPanoramaImg: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&h=400',
    capPlateImg: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&h=300',
    libImg: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=300&h=300',
    libraryName: 'Watchlist',
    ownerName: 'Unknown',
    ownerId: 'N/A',
    contactNumber: 'N/A',
    speed: '45 km/h',
    lane: 'Roundabout Outer',
    direction: 'Eastbound',
    vehicleBrand: 'Nissan Patrol'
  }
])

defineProps<{
  hideTitle?: boolean
}>()

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(5)

// Dialog State
const detailDialogVisible = ref(false)
const selectedAlarm = ref<VehicleAlarm | null>(null)
const activeTab = ref('detail')

const openDetail = (alarm: VehicleAlarm) => {
  selectedAlarm.value = alarm
  activeTab.value = 'detail'
  detailDialogVisible.value = true
}
</script>

<template>
  <div class="vehicle-alarm-page">
    <!-- Sidebar Filters -->
    <aside class="alarm-filters-sidebar">
      <h2 class="sidebar-title">Alarm Filters</h2>
      
      <div class="filter-sections">
        <div class="filter-item">
          <label>Task Name</label>
          <select class="cyber-select">
            <option>All Tasks</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Vehicle Number</label>
          <input type="text" class="cyber-input" placeholder="e.g., OM-1234" />
        </div>

        <div class="filter-item">
          <label>Handling Status</label>
          <select class="cyber-select">
            <option>All Status</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Time Range</label>
          <div class="time-input-wrap">
            <input type="text" class="cyber-input" value="/2026/04/13  00:00" />
            <el-icon class="cal-icon"><Calendar /></el-icon>
          </div>
          <div class="time-input-wrap mt-2">
            <input type="text" class="cyber-input" value="/2026/04/13  23:59" />
            <el-icon class="cal-icon"><Calendar /></el-icon>
          </div>
        </div>

        <div class="filter-item">
          <label>Device</label>
          <select class="cyber-select">
            <option>All Devices</option>
          </select>
        </div>
      </div>

      <div class="sidebar-actions">
        <button class="btn-search">
          <el-icon><Search /></el-icon> Search
        </button>
        <button class="btn-reset">
          <el-icon><Refresh /></el-icon>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="alarm-content-main">
      <header class="main-header" v-if="!hideTitle">
        <div class="header-info">
          <h1 class="title">Vehicle Alarm Center</h1>
          <p class="subtitle"><span class="count">5</span> active vehicle alarms requiring attention</p>
        </div>
        <div class="header-btns">
          <button class="btn-header-ghost">Map View</button>
          <button class="btn-header-ghost">Export Report</button>
        </div>
      </header>

      <div class="alarm-cards-list">
        <article class="alarm-card" v-for="alarm in alarms" :key="alarm.id">
          <!-- Card Image Section -->
          <div class="card-image-wrap">
            <img :src="alarm.image" alt="Captured Vehicle" />
            <div class="plate-badge">{{ alarm.plateNumber }}</div>
            <div class="status-badges-overlay">
              <div class="status-tag" :class="alarm.status.toLowerCase()">
                <span class="dot"></span> {{ alarm.status }}
              </div>
              <div class="status-tag step-tag" :class="alarm.step.toLowerCase()">
                <span class="dot"></span> {{ alarm.step }}
              </div>
            </div>
          </div>

          <!-- Card Info Section -->
          <div class="card-info-content">
            <div class="info-top">
              <h3 class="alarm-title">{{ alarm.title }}</h3>
              <div class="meta-row">
                <span class="meta-item"><el-icon><Calendar /></el-icon> {{ alarm.time }}</span>
                <span class="meta-item ml-4"><el-icon><Location /></el-icon> {{ alarm.location }}</span>
              </div>
            </div>

            <div class="info-grid">
              <div class="grid-cell">
                <div class="label">Vehicle Type</div>
                <div class="value">{{ alarm.vehicleType }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Vehicle Color</div>
                <div class="value">{{ alarm.vehicleColor }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Capture Device</div>
                <div class="value">{{ alarm.captureDevice }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Capture Location</div>
                <div class="value">{{ alarm.captureLocation }}</div>
              </div>
            </div>

            <div class="alarm-details-box">
              <div class="box-label">Alarm Details</div>
              <p class="box-text">{{ alarm.details }}</p>
            </div>
          </div>

          <!-- Card Actions Section -->
          <div class="card-actions-rail">
            <button class="btn-action confirm"><el-icon><Check /></el-icon> Confirm</button>
            <button class="btn-action reject"><el-icon><Close /></el-icon> Reject</button>
            <button class="btn-action-outline" @click="openDetail(alarm)"><el-icon><View /></el-icon> Detail</button>
            <button class="btn-action-outline"><el-icon><UserFilled /></el-icon> Assign</button>
            <button class="btn-action-outline"><el-icon><Aim /></el-icon> Track</button>
          </div>
        </article>
      </div>

      <!-- Footer Pagination -->
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
      title="Vehicle Alarm Detail"
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
                  <img :src="selectedAlarm.capPanoramaImg || selectedAlarm.image" alt="Panorama" />
                </div>
                <div class="img-info">
                  <p><el-icon><Location /></el-icon> {{ selectedAlarm.location }}</p>
                  <p><el-icon><VideoCamera /></el-icon> {{ selectedAlarm.captureDevice }}</p>
                  <p><el-icon><Calendar /></el-icon> {{ selectedAlarm.time }}</p>
                </div>
              </div>

              <!-- Plate Capture -->
              <div class="img-card capture">
                <div class="img-header">Plate Capture</div>
                <div class="img-wrapper">
                  <img :src="selectedAlarm.capPlateImg" alt="Capture" />
                  <div class="score-overlay">{{ selectedAlarm.plateNumber }}</div>
                </div>
                <div class="img-info">
                  <p>Speed: {{ selectedAlarm.speed }}</p>
                  <p>Lane: {{ selectedAlarm.lane }}</p>
                  <p>Direction: {{ selectedAlarm.direction }}</p>
                </div>
              </div>

              <!-- Database Vehicle -->
              <div class="img-card library">
                <div class="img-header">Database Vehicle</div>
                <div class="img-wrapper">
                  <img :src="selectedAlarm.libImg" alt="Library" />
                </div>
                <div class="img-info">
                  <p>Library: {{ selectedAlarm.libraryName }}</p>
                  <p>Status: {{ selectedAlarm.status }}</p>
                  <p>Color: {{ selectedAlarm.vehicleColor }}</p>
                </div>
              </div>
            </div>

            <!-- Database Info Bottom Section -->
            <div class="db-info-section">
              <h3 class="section-title">Database Vehicle Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Owner Name</label>
                  <span>{{ selectedAlarm.ownerName }}</span>
                </div>
                <div class="info-item">
                  <label>Plate Number</label>
                  <span class="highlight">{{ selectedAlarm.plateNumber }}</span>
                </div>
                <div class="info-item">
                  <label>Vehicle Type</label>
                  <span>{{ selectedAlarm.vehicleType }}</span>
                </div>
                <div class="info-item">
                  <label>Brand / Model</label>
                  <span>{{ selectedAlarm.vehicleBrand }}</span>
                </div>
                <div class="info-item">
                  <label>Owner ID</label>
                  <span>{{ selectedAlarm.ownerId }}</span>
                </div>
                <div class="info-item">
                  <label>Contact Number</label>
                  <span>{{ selectedAlarm.contactNumber }}</span>
                </div>
                <div class="info-item full-width">
                  <label>Remarks / Details</label>
                  <span>{{ selectedAlarm.details }}</span>
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
.vehicle-alarm-page {
  display: flex;
  height: 100%;
  background: transparent;
  color: #fff;
  overflow: hidden;
}

/* Sidebar */
.alarm-filters-sidebar {
  width: 240px;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  flex-direction: column;
  padding: 8px 16px 16px 16px;
  border-radius: 16px;
  margin-right: 12px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    label { font-size: 11px; color: #94a3b8; font-weight: 500; }
  }
}

.cyber-input, .cyber-select {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  &:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1); }
  &::placeholder { color: #64748b; }
}

.time-input-wrap {
  position: relative;
  .cal-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 14px;
  }
}

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

/* Main Content */
.alarm-content-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 4px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);

  .title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
  .count { color: #f87171; font-weight: 700; }

  .header-btns {
    display: flex;
    gap: 10px;
  }
}

.btn-header-ghost {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; color: #fff; }
}

/* Alarm Card */
.alarm-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-card {
  display: flex;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { 
    border-color: rgba(56, 189, 248, 0.4); 
    background: rgba(15, 23, 42, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
}

.card-image-wrap {
  width: 320px;
  position: relative;
  img { width: 100%; height: 100%; object-fit: cover; }

  .plate-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: rgba(14, 165, 233, 0.9);
    backdrop-filter: blur(4px);
    color: #fff;
    padding: 6px 14px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .status-badges-overlay {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;
  }
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  &.critical { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
  &.high { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  &.pending { background: rgba(234, 179, 8, 0.15); color: #fbbf24; border: 1px solid rgba(234, 179, 8, 0.3); }
  &.verified { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
}

.card-info-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-title { font-size: 18px; font-weight: 700; margin: 0; color: #f8fafc; }
.meta-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
  .meta-item { display: flex; align-items: center; gap: 8px; }
  .ml-4 { margin-left: 24px; }
  .el-icon { color: #38bdf8; }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .grid-cell {
    .label { font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
    .value { font-size: 14px; font-weight: 600; color: #e2e8f0; }
  }
}

.alarm-details-box {
  background: rgba(10, 15, 30, 0.4);
  border-radius: 12px;
  padding: 14px 18px;
  border: 1px solid rgba(148, 163, 184, 0.08);

  .box-label { font-size: 10px; color: #475569; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; }
  .box-text { font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6; }
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

/* Pagination */
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
      background: rgba(14, 165, 233, 0.9);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      font-family: monospace;
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
