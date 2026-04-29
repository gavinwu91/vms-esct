<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, onUnmounted } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import { Location, Clock, VideoCamera, ArrowRight, Warning, Compass } from '@element-plus/icons-vue'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { Style, Stroke, Fill, Circle } from 'ol/style'

interface Alarm {
  id: string
  name: string
  gender?: string
  idCard?: string
  plate?: string
  library: string
  score?: number
  captureImg: string
  libraryImg?: string
  location: string
  time: string
  status: string
  statusClass: 'high' | 'warning' | 'normal'
  lon: number
  lat: number
}

const activeTab = ref('face')

const mockAlarms = ref<Alarm[]>([
  {
    id: 'ALM-001',
    name: '张伟 (Zhang Wei)',
    gender: '男',
    idCard: '110105198808081234',
    library: '重点监控人员库',
    score: 96.8,
    captureImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    libraryImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    location: 'Main Street Junction Cam-01',
    time: '2026-04-21 16:55:02',
    status: '高级 (High)',
    statusClass: 'high',
    lon: 58.4059,
    lat: 23.5859
  },
  {
    id: 'ALM-002',
    name: '未知身份 (Unknown)',
    gender: '女',
    idCard: '未知',
    library: '陌生人库',
    score: 82.5,
    captureImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    libraryImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    location: 'North Gate Entrance',
    time: '2026-04-21 16:50:15',
    status: '待确认 (Pending)',
    statusClass: 'warning',
    lon: 58.4100,
    lat: 23.5880
  },
  {
    id: 'ALM-003',
    name: '王强 (Wang Qiang)',
    gender: '男',
    idCard: '370203199012128888',
    library: '黑名单库',
    score: 98.2,
    captureImg: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    libraryImg: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    location: 'Central Plaza South',
    time: '2026-04-21 16:45:33',
    status: '高级 (High)',
    statusClass: 'high',
    lon: 58.3950,
    lat: 23.5900
  },
  {
    id: 'ALM-004',
    name: '李华 (Li Hua)',
    gender: '男',
    idCard: '440106199505051111',
    library: '常规访客库',
    score: 88.0,
    captureImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    libraryImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    location: 'East Wing Lobby',
    time: '2026-04-21 16:30:10',
    status: '待确认 (Pending)',
    statusClass: 'warning',
    lon: 58.4000,
    lat: 23.5800
  }
])

const mockVehicleAlarms = ref<Alarm[]>([
  {
    id: 'V-001',
    name: '车辆告警',
    plate: '沪B67890',
    library: '车辆布控库',
    captureImg: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80',
    location: 'Shipping Terminal Exit',
    time: '2026-04-20 14:22:17',
    status: '中级',
    statusClass: 'warning',
    lon: 58.4150,
    lat: 23.5750
  },
  {
    id: 'V-002',
    name: '嫌疑车辆',
    plate: '京A88888',
    library: '黑名单车辆',
    captureImg: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    location: 'Central Highway Toll',
    time: '2026-04-20 14:25:33',
    status: '高级',
    statusClass: 'high',
    lon: 58.3900,
    lat: 23.5850
  }
])

const currentAlarms = computed(() => {
  return activeTab.value === 'face' ? mockAlarms.value : mockVehicleAlarms.value
})

const thumbnails = computed(() => {
  return currentAlarms.value.map(a => a.captureImg)
})

const selectedAlarm = ref<Alarm | null>(null)

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<Map | null>(null)
const vectorSource = new VectorSource()
const renderTick = ref(0)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  map.value = new Map({
    target: mapContainer.value!,
    controls: [],
    layers: [
      new TileLayer({ 
        source: new OSM(),
        className: 'dark-map-layer'
      }),
      new VectorLayer({
        source: vectorSource,
        zIndex: 5
      })
    ],
    view: new View({
      center: fromLonLat([58.4059, 23.5859]),
      zoom: 14
    })
  })

  map.value.on('postrender', () => {
    renderTick.value++
  })

  resizeObserver = new ResizeObserver(() => {
    if (map.value) map.value.updateSize()
  })
  if (mapContainer.value) resizeObserver.observe(mapContainer.value)

  // Select first alarm by default
  setTimeout(() => {
    if (mockAlarms.value[0]) selectAlarm(mockAlarms.value[0])
  }, 500)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (map.value) {
    map.value.setTarget(undefined)
    map.value = null
  }
})

const getPixelStyle = (lon: number, lat: number) => {
  renderTick.value // reactive dependency
  if (!map.value) return { display: 'none' }
  const px = map.value.getPixelFromCoordinate(fromLonLat([lon, lat]))
  if (!px) return { display: 'none' }
  return { left: `${px[0]}px`, top: `${px[1]}px` }
}

const selectAlarm = (alarm: Alarm) => {
  selectedAlarm.value = alarm
  
  // Update Trajectory
  vectorSource.clear()
  const trajectoryPoints = [
    [alarm.lon - 0.005, alarm.lat - 0.003],
    [alarm.lon - 0.002, alarm.lat - 0.001],
    [alarm.lon, alarm.lat]
  ].map(coord => fromLonLat(coord))

  const lineFeature = new Feature({
    geometry: new LineString(trajectoryPoints)
  })
  lineFeature.setStyle(new Style({
    stroke: new Stroke({
      color: 'rgba(56, 189, 248, 0.8)',
      width: 3,
      lineDash: [8, 8]
    })
  }))
  vectorSource.addFeature(lineFeature)

  if (map.value) {
    map.value.getView().animate({
      center: fromLonLat([alarm.lon, alarm.lat]),
      duration: 800,
      zoom: 16
    })
  }
}

</script>

<template>
  <div class="realtime-dashboard">
    
    <!-- Left/Center: Map and Map overlays -->
    <div class="map-container">
      
      <!-- OpenLayers Map Background -->
      <div class="ol-map" ref="mapContainer"></div>

      <!-- Map Markers (Ripples) -->
      <div 
        v-for="alarm in currentAlarms" 
        :key="'marker-'+alarm.id"
        class="map-marker"
        :class="{ active: selectedAlarm?.id === alarm.id, [alarm.statusClass]: true }"
        :style="getPixelStyle(alarm.lon, alarm.lat)"
        @click="selectAlarm(alarm)"
      >
        <div class="ripple r1"></div>
        <div class="ripple r2"></div>
        <div class="core-dot"></div>
      </div>

      <!-- Floating Popup for Selected Alarm -->
      <transition name="popup">
        <div class="alarm-popup" v-if="selectedAlarm" :style="{ left: `calc(${getPixelStyle(selectedAlarm.lon, selectedAlarm.lat).left} + 25px)`, top: `calc(${getPixelStyle(selectedAlarm.lon, selectedAlarm.lat).top} - 100px)` }">
          <button class="popup-close" @click="selectedAlarm = null">×</button>
          <div class="popup-image-wrapper">
            <img :src="selectedAlarm.captureImg" alt="Focused Target" />
            <div class="score-overlay" :class="selectedAlarm.statusClass">
              <span class="label">匹配度</span>
              <span class="val">{{ selectedAlarm.score }}%</span>
            </div>
          </div>
          <div class="popup-footer">
            <el-icon class="icon"><Location /></el-icon>
            <span class="text">{{ selectedAlarm.location }}</span>
          </div>
        </div>
      </transition>

      <!-- Bottom Summary Strip -->
      <div class="bottom-strip">
        <div class="total-info">
          总计: <span class="cyan-text">{{ mockAlarms.length * 125 }}</span> 抓拍
        </div>
        <div class="thumbnail-list">
          <div class="thumb-wrap" v-for="(img, idx) in [...thumbnails, ...thumbnails, ...thumbnails].slice(0, 10)" :key="idx">
            <img :src="img" />
          </div>
        </div>
        <a class="view-all">查看全部 <el-icon><ArrowRight /></el-icon></a>
      </div>
    </div>

    <!-- Right Sidebar: Live Alarm Feed -->
    <aside class="alarm-sidebar">
      
      <!-- Tabs -->
      <div class="sidebar-header">
        <div class="neo-tabs">
          <button class="neo-tab" :class="{ active: activeTab === 'face' }" @click="activeTab = 'face'">人脸告警</button>
          <button class="neo-tab" :class="{ active: activeTab === 'vehicle' }" @click="activeTab = 'vehicle'">车辆告警</button>
        </div>
      </div>

      <!-- Scrollable List -->
      <div class="alarm-list">
        <template v-for="alarm in currentAlarms" :key="alarm.id">
          <!-- Face Alarm Card -->
          <article 
            v-if="activeTab === 'face'"
            class="alarm-card face-card" 
            :class="{ selected: selectedAlarm?.id === alarm.id, [alarm.statusClass]: true }"
            @click="selectAlarm(alarm)"
          >
            <!-- Images Section -->
            <div class="image-row">
              <div class="img-group">
                <span class="img-label">抓拍图</span>
                <div class="img-wrap">
                  <img :src="alarm.captureImg" />
                </div>
              </div>
              <div class="img-group">
                <span class="img-label">库图</span>
                <div class="img-wrap">
                  <img :src="alarm.libraryImg" />
                </div>
              </div>
            </div>

            <!-- Content Section -->
            <div class="card-main">
              <div class="info-side">
                <h3 class="person-name">{{ alarm.name }}</h3>
                <p class="library-name">{{ alarm.library }}</p>
                <div class="meta-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ alarm.location }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ alarm.time }}</span>
                </div>
              </div>
              <div class="score-side">
                <div class="score-badge" :class="alarm.statusClass">
                  {{ alarm.score }}%
                </div>
              </div>
            </div>

            <!-- Footer Section (Tags) -->
            <div class="card-footer">
              <span class="tag-btn pending">待确认</span>
              <span class="tag-btn level" :class="alarm.statusClass">
                {{ alarm.status }}
              </span>
            </div>
          </article>

          <!-- Vehicle Alarm Card -->
          <article 
            v-else-if="activeTab === 'vehicle'"
            class="alarm-card vehicle-card" 
            :class="{ selected: selectedAlarm?.id === alarm.id, [alarm.statusClass]: true }"
            @click="selectAlarm(alarm)"
          >
            <div class="vehicle-image-wrap">
              <img :src="alarm.captureImg" />
            </div>
            
            <div class="plate-box">
              <span class="plate-number">{{ alarm.plate }}</span>
            </div>

            <div class="card-main">
              <div class="info-side">
                <div class="meta-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ alarm.location }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ alarm.time }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <span class="tag-btn pending">待确认</span>
              <span class="tag-btn level" :class="alarm.statusClass">
                {{ alarm.status }}
              </span>
            </div>
          </article>
        </template>
      </div>

    </aside>

  </div>
</template>

<style scoped lang="scss">
.realtime-dashboard {
  display: flex;
  height: calc(100vh - 140px); /* Constrain height to viewport to enable internal scrolling */
  width: 100%;
  background: #0a0f1e;
  overflow: hidden;
  border-radius: 8px;
}

/* =========================================================
   Center Map Area
========================================================= */
.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  /* OpenLayers Map styles */
  .ol-map {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 1;
    background: #0f172a;
  }

  /* Apply dark mode filter to OpenStreetMap tiles */
  :deep(.dark-map-layer) {
    filter: invert(100%) hue-rotate(180deg) brightness(90%) contrast(110%) saturate(120%) grayscale(10%);
  }

  /* Map Markers */
  .map-marker {
    position: absolute;
    z-index: 5;
    width: 24px; height: 24px;
    transform: translate(-50%, -50%);
    cursor: pointer;

    .core-dot {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #00b4ff;
      box-shadow: 0 0 10px #00b4ff;
    }

    .ripple {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 100%; height: 100%;
      border-radius: 50%;
      border: 1px solid #00b4ff;
      animation: rippleAnim 2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
      &.r2 { animation-delay: 1s; }
    }

    /* Colors by status */
    &.high {
      .core-dot { background: #ff4d4f; box-shadow: 0 0 10px #ff4d4f; }
      .ripple { border-color: #ff4d4f; }
    }
    &.warning {
      .core-dot { background: #fbbf24; box-shadow: 0 0 10px #fbbf24; }
      .ripple { border-color: #fbbf24; }
    }

    &.active {
      z-index: 10;
      .core-dot { width: 12px; height: 12px; }
      .ripple { animation-duration: 1.5s; border-width: 2px; }
    }
  }

  /* Bottom Ribbon */
  .bottom-strip {
    position: absolute;
    bottom: 24px; left: 24px; right: 24px;
    height: 72px;
    background: rgba(10, 15, 30, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 180, 255, 0.15);
    border-radius: 12px;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 0 24px;
    gap: 32px;

    .total-info {
      font-size: 14px; color: #94a3b8;
      .cyan-text { font-size: 24px; color: #00b4ff; font-weight: bold; font-family: monospace; }
    }

    .thumbnail-list {
      flex: 1;
      display: flex;
      gap: 12px;
      overflow-x: hidden;
      
      .thumb-wrap {
        width: 48px; height: 48px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid rgba(0, 180, 255, 0.3);
        img { width: 100%; height: 100%; object-fit: cover; }
      }
    }

    .view-all {
      color: #00b4ff; font-size: 13px; font-weight: 500;
      display: flex; align-items: center; gap: 4px;
      cursor: pointer; transition: 0.2s;
      &:hover { text-shadow: 0 0 8px #00b4ff; }
    }
  }

  /* Focused Alarm Popup */
  .alarm-popup {
    position: absolute;
    z-index: 20;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 180, 255, 0.3);
    border-radius: 12px;
    width: 200px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 180, 255, 0.2);
    overflow: hidden;

    .popup-close {
      position: absolute;
      top: 6px; right: 6px;
      background: rgba(0,0,0,0.5); border: none; border-radius: 50%;
      color: #94a3b8; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 5;
      &:hover { color: #fff; background: #ff4d4f; }
    }

    .popup-image-wrapper {
      position: relative;
      height: 200px;
      width: 100%;
      background: #000;
      img { width: 100%; height: 100%; object-fit: cover; }

      .score-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.9));
        padding: 16px 12px 8px;
        display: flex; justify-content: space-between; align-items: flex-end;
        
        .label { font-size: 11px; color: #94a3b8; }
        .val { font-size: 20px; font-weight: bold; color: #00b4ff; }

        &.high .val { color: #ff4d4f; }
        &.warning .val { color: #fbbf24; }
      }
    }

    .popup-footer {
      padding: 10px 12px;
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: #e2e8f0;
      background: rgba(0,0,0,0.3);
      .icon { color: #00b4ff; }
      .text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    }
  }
}

/* =========================================================
   Right Sidebar Area
========================================================= */
.alarm-sidebar {
  width: 440px;
  flex-shrink: 0; /* Prevent sidebar from being squeezed by the map */
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(0, 180, 255, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: -10px 0 30px rgba(0,0,0,0.3);
  min-height: 0; /* Important for flex-child scrolling */

  .sidebar-header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    
    .neo-tabs {
      display: flex; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 4px;
      .neo-tab {
        flex: 1; padding: 8px 0; border: none; background: transparent; color: #94a3b8;
        font-size: 14px; font-weight: 500; border-radius: 6px; cursor: pointer; transition: 0.2s;
        &.active {
          background: rgba(0, 180, 255, 0.15); color: #00b4ff;
          box-shadow: 0 0 10px rgba(0, 180, 255, 0.2);
        }
      }
    }
  }

  .alarm-list {
    flex: 1;
    padding: 20px 24px;
    overflow-y: scroll; /* Force scrollbar visibility to avoid confusion */
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    &::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.4); border-radius: 4px; }
    &::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.6); }
  }

  /* Alarm Card Format - Matching realface.png */
  .alarm-card {
    position: relative;
    flex-shrink: 0;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(0, 180, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;

    &:hover, &.selected {
      background: rgba(15, 23, 42, 0.8);
      border-color: rgba(0, 180, 255, 0.4);
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }

    .image-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      .img-group {
        flex: 1;
        .img-label {
          display: block;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .img-wrap {
          width: 100%;
          aspect-ratio: 1.5;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          img { width: 100%; height: 100%; object-fit: cover; }
        }
      }
    }

    .card-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .info-side {
        .person-name {
          font-size: 18px;
          font-weight: bold;
          color: #fff;
          margin: 0 0 4px 0;
        }
        .library-name {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 8px 0;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 4px;
          .el-icon { color: #64748b; font-size: 14px; }
        }
      }

      .score-side {
        .score-badge {
          font-size: 22px;
          font-weight: 800;
          color: #f87171;
          padding: 4px 8px;
          background: rgba(239, 68, 68, 0.15);
          border-radius: 4px;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
          
          &.warning { color: #fbbf24; background: rgba(251, 191, 36, 0.15); box-shadow: 0 0 15px rgba(251, 191, 36, 0.2); }
          &.normal { color: #34d399; background: rgba(16, 185, 129, 0.15); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
        }
      }
    }

    .card-footer {
      display: flex;
      gap: 8px;
      
      .tag-btn {
        padding: 2px 10px;
        font-size: 11px;
        border-radius: 4px;
        
        &.pending {
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        &.level {
          &.high { color: #f87171; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
          &.warning { color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); }
          &.normal { color: #34d399; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); }
        }
      }
    }

    &.vehicle-card {
      .vehicle-image-wrap {
        width: 100%;
        aspect-ratio: 2.2;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 12px;
        img { width: 100%; height: 100%; object-fit: cover; }
      }

      .plate-box {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(0, 180, 255, 0.3);
        border-radius: 8px;
        padding: 10px 16px;
        margin-bottom: 12px;
        .plate-number {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 2px;
          font-family: 'Inter', sans-serif;
        }
      }
    }
  }
}

/* Animations */
@keyframes rippleAnim {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
}

.popup-enter-active, .popup-leave-active { transition: all 0.3s cubic-bezier(0.1, 0.8, 0.3, 1); }
.popup-enter-from, .popup-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
</style>
