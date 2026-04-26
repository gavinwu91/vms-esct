<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <div class="header-title">
        <h1>Dashboard</h1>
        <p>Video Management System Analytics</p>
      </div>
      <div class="time-display">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
    </div>

    <!-- Platform Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Storage Usage</div>
            <div class="stat-value">7.8 TB</div>
            <div class="stat-total">/ 10 TB</div>
          </div>
          <div class="stat-icon storage-icon">
            <i class="el-icon-s-data"></i>
          </div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: 78%; background: linear-gradient(90deg, #3b82f6, #60a5fa)"
          ></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Bandwidth Usage</div>
            <div class="stat-value">650 Mbps</div>
            <div class="stat-total">/ 1 Gbps</div>
          </div>
          <div class="stat-icon bandwidth-icon">
            <i class="el-icon-s-promotion"></i>
          </div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: 65%; background: linear-gradient(90deg, #10b981, #34d399)"
          ></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">License Usage</div>
            <div class="stat-value">89</div>
            <div class="stat-total">/ 100</div>
          </div>
          <div class="stat-icon license-icon">
            <i class="el-icon-s-ticket"></i>
          </div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: 89%; background: linear-gradient(90deg, #f59e0b, #fbbf24)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Camera Statistics -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-icon">
            <i class="el-icon-camera"></i>
          </div>
          <div class="chart-title">Device Types</div>
        </div>
        <div class="chart-container" id="cameraTypeChart"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-icon">
            <i class="el-icon-s-check"></i>
          </div>
          <div class="chart-title">Device Status</div>
        </div>
        <div class="chart-container" id="cameraStatusChart"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-icon">
            <i class="el-icon-s-marketing"></i>
          </div>
          <div class="chart-title">Device Brands</div>
        </div>
        <div class="chart-container" id="cameraBrandChart"></div>
      </div>
    </div>

    <!-- Regional Distribution -->
    <div class="region-chart">
      <div class="region-header">
        <div class="region-icon">
          <i class="el-icon-s-map"></i>
        </div>
        <div class="region-title">Device Distribution by Region</div>
      </div>
      <div class="region-chart-container" id="regionChart"></div>
    </div>

    <!-- System Status -->
    <div class="status-footer">
      <div class="status-item">
        <div class="status-icon operational">
          <i class="el-icon-success"></i>
        </div>
        <div class="status-text">All Systems Operational</div>
      </div>
      <div class="status-item">
        <div class="status-icon warning">
          <i class="el-icon-warning"></i>
        </div>
        <div class="status-text">61 Devices Offline</div>
      </div>
      <div class="status-item">
        <div class="status-icon info">
          <i class="el-icon-time"></i>
        </div>
        <div class="status-text">Last Updated: Now</div>
      </div>
      <div class="status-item">
        <div class="status-icon total">
          <i class="el-icon-s-data"></i>
        </div>
        <div class="status-text">Total: {{ totalSate.deviceTotal }} Devices</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts'
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { formatTime } from '@/utils'
import { DashboardAPI } from '@/api/managedashboard'
import { useUserStore } from '@/store/modules/user'
// import { useWatermark } from '@/hooks/web/useWatermark'
import type { WorkplaceTotal, Project, Notice, Shortcut } from './types'
import { pieOptions, barOptions } from './echarts-data'
import { useRouter } from 'vue-router'
import { Folder, VideoCamera, User, OfficeBuilding } from '@element-plus/icons-vue'
defineOptions({
  name: 'DashboardCenter'
})
const currentTime = ref('')
const currentDate = ref('')

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
// const { setWatermark } = useWatermark()
const loading = ref(true)
const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption
// 获取统计数
let totalSate = reactive({
  deviceTotal: 0,
  libraryTotal: 0,
  areaTotal: 0
})
const deviceByUsage = ref({})
const deviceByLocation = ref({})
const deviceStatus = ref({})
const deviceBrand = ref({})

// Update time every second
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('En', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('En', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatistics = () => {
  DashboardAPI.statistics().then((res) => {
    deviceByUsage.value = res.deviceByUsage
    deviceByLocation.value = res.deviceByLocation
    deviceStatus.value = res.deviceStatus
    deviceBrand.value = res.deviceBrand
    totalSate.deviceTotal = res.deviceTotal
    totalSate.libraryTotal = res.libraryTotal
    totalSate.areaTotal = res.areaTotal
    initCharts()
    console.log('res ==== ', res)
  })
}

const getAllApi = async () => {
  await Promise.all([getStatistics()])
  loading.value = false
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  getAllApi()
})

const initCharts = () => {
  // Camera Types Chart
  const cameraTypeChart = echarts.init(document.getElementById('cameraTypeChart'))
  cameraTypeChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      textStyle: {
        color: '#1e293b'
      },
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        color: '#64748b'
      }
    },
    series: [
      {
        name: deviceByUsage.value.text,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: deviceByUsage.value.seriesData.map((v) => {
          return {
            name: t(v.name),
            value: v.value
          }
        })
        ,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      }
    ]
  })

  // Camera Status Chart
  const cameraStatusChart = echarts.init(document.getElementById('cameraStatusChart'))
  cameraStatusChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      textStyle: {
        color: '#1e293b'
      },
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        color: '#64748b'
      }
    },
    series: [
      {
        name: deviceStatus.value,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: deviceStatus.value.seriesData.map((v) => {
          return {
            name: t(v.name),
            value: v.value
          }
        })
        ,
        color: ['#10b981', '#ef4444', '#f59e0b']
      }
    ]
  })

  // Camera Brands Chart
  const cameraBrandChart = echarts.init(document.getElementById('cameraBrandChart'))
  cameraBrandChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      textStyle: {
        color: '#1e293b'
      },
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        color: '#64748b'
      }
    },
    series: [
      {
        name: deviceBrand.value.text,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: deviceBrand.value.seriesData.map((v) => {
          return {
            name: t(v.name),
            value: v.value
          }
        }),
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }
    ]
  })

  // Regional Distribution Chart
  const regionChart = echarts.init(document.getElementById('regionChart'))
  regionChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e2e8f0',
      borderRadius: 8,
      textStyle: {
        color: '#1e293b'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: deviceByLocation.value.xaxisData,
      
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        color: '#64748b',
        rotate: -45
      },
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748b'
      },
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9'
        }
      }
    },
    series: [
      {
        name: deviceByLocation.value.text,
        type: 'bar',
        barWidth: '60%',
        data: deviceByLocation.value.seriesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4f46e5' },
            { offset: 1, color: '#818cf8' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  })

  // Handle window resize
  window.addEventListener('resize', () => {
    cameraTypeChart.resize()
    cameraStatusChart.resize()
    cameraBrandChart.resize()
    regionChart.resize()
  })
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  min-height: 94.5vh;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.header-title h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 8px;
}

.header-title p {
  color: #64748b;
  font-size: 1.1rem;
}

.time-display {
  text-align: right;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0e0e0;
}

.time-display .time {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a365d;
  font-family: 'Courier New', monospace;
}

.time-display .date {
  color: #64748b;
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.storage-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.bandwidth-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.license-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-total {
  color: #64748b;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  margin-top: 16px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.chart-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.region-chart {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  margin-bottom: 32px;
}

.region-chart:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.region-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.region-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.region-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
}

.region-chart-container {
  height: 450px;
  width: 100%;
}

.status-footer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-item {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0e0e0;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.operational {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.warning {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}
.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.total {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.status-text {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .time-display {
    text-align: center;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>