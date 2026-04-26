<template>
  <div class="main-content">
    <!-- Camera Panel -->
    <CameraList
      :cameras="availableCameras"
      :total-pages="totalPage"
      :current-page="currentPage"
      :source="'playback'"
      @page-change="fetchCameras"
      @search="onSearch"
      @start-drag="startDrag"
      @dblclick="addCameraToFirstAvailable"
      
    />

    <!-- Main Video Wall Area -->
    <div class="video-wall">
      <!-- Control Bar -->
      <div class="wall-controls">
        <div class="layout-buttons">
          <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true">
            <el-form-item label="Query time" prop="queryTime">
              <el-date-picker
                v-model="queryParams.queryTime"
                type="datetimerange"
                start-placeholder="Begin date"
                end-placeholder="End date"
                class="!w-330px"
                style="background-color: rgba(255, 255, 255, 0.1); border: node !important"
              />
            </el-form-item>
            <el-form-item>
              <el-button @click="handleQuery"><Icon icon="ep:search" />Search</el-button>
              <el-button @click="resetQuery"><Icon icon="ep:refresh" />Reset</el-button>
            </el-form-item>
          </el-form>
          <!-- <button
            class="control-btn"
            @click="changeLayout(2)"
            :class="{ active: gridCols === 2 }"
          >
            <FontAwesomeIcon :icon="['fas', 'border-all']" /> 2×2
          </button>
          <button
            class="control-btn"
            @click="changeLayout(1)"
            :class="{ active: gridCols === 1 }"
          >
            <FontAwesomeIcon :icon="['fas', 'border-none']" /> 1×1
          </button> -->
        </div>
        <!-- <button class="control-btn danger" @click="clearAll">
          <FontAwesomeIcon :icon="['fas', 'trash-alt']" /> Clear
        </button> -->
      </div>

      <!-- Grid Container -->
      <div class="grid-container" :style="gridStyle">
        <!-- 使用原生Video元素替代Canvas -->
        <div
          v-for="(cell, index) in gridCells"
          :key="`cell-${index}`"
          class="grid-item"
          :class="{
            placeholder: !cell.camera,
            zoomed: zoomedIndex === index,
            'has-video': cell.camera
          }"
          @dragover.prevent
          @dragenter.prevent
          @drop="dropCamera($event, index)"
        >
          <template v-if="cell.camera">
            <!-- Video Container -->
            <div
              class="video-container"
              @mouseenter="showControls = true"
              @mouseleave="showControls = false"
            >
              <div class="video-header">
                <div class="video-title">
                  <FontAwesomeIcon :icon="['fas', 'video']" />
                  {{ cell.camera.cameraName }}
                </div>
                <div class="video-actions">
                  <button
                    class="action-btn remove"
                    @click.stop="removeCamera(index)"
                    title="Remove"
                  >
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                  </button>
                </div>
              </div>
              <!-- 使用原生video元素 -->
              <video
                ref="videoElements"
                autoplay
                muted
                playsinline
                class="native-video"
                :data-index="index"
                @ended="playNextSegment"
                @timeupdate="updateCurrentTime"
              ></video>
              <!-- 中间的播放/暂停按钮 -->
              <div v-if="showControls" class="center-control" @click="togglePlay">
                <span v-if="!gridCells[0].playerState.isPlaying">▶</span>
                <span v-else>⏸</span>
              </div>
            </div>
          </template>

          <template v-else>
            <!-- Placeholder -->
            <div class="placeholder-content">
              <div class="placeholder-icon">
                <FontAwesomeIcon :icon="['fas', 'plus-circle']" />
              </div>
              <p>Drag and drop a device here</p>
              <p class="small">Or double-click a device on the left</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="stats-bar">
        <!-- 日期 + 时间刻度 -->
        <div class="timeline-wrapper" ref="timelineWrapper" @mousedown="onTimelineMouseDown">
          <!-- 日期段 -->
          <div class="date-row" :style="{ width: timelineWidth + 'px' }">
            <div
              v-for="(seg, i) in dateSegments"
              :key="i"
              class="date-segment"
              :style="{ width: seg.width + 'px' }"
            >
              {{ seg.label }}
            </div>
          </div>

          <!-- 时间刻度 -->
          <div class="timeline" :style="{ width: timelineWidth + 'px' }">
            <div
              v-for="(tick, i) in ticks"
              :key="i"
              class="tick"
              :class="{
                'hour-tick': tick.isHour,
                'has-data': tick.hasData
              }"
              :style="{ left: tick.position + 'px', height: tick.isHour ? '16px' : '8px' }"
              @click.stop="jumpToTick(tick)"
            >
              <span v-if="tick.isHour" class="tick-label">{{ tick.label }}</span>
            </div>

            <!-- 播放位置线 -->
            <div class="playhead" :style="{ left: playheadX + 'px' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Component -->
    <Transition name="slide-up">
      <div v-if="notification.show" class="notification" :class="notification.type">
        <FontAwesomeIcon :icon="notification.icon" />
        <span>{{ notification.text }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import CameraList from '@/components/CameraList.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getCameras } from '@/api/device'
import axios from 'axios'
import Hls from 'hls.js'

// 常量
const maxCameras = 1

const availableCameras = ref([])
const gridCols = ref(1)
const gridCells = ref(createGridCells(1))
const notification = ref({ show: false, text: '', icon: '', type: 'info' })
const currentTime = ref('')
const fps = ref(0)
const videoElements = ref([])
const targetFPS = 15
const zoomedIndex = ref(null)
const animationFrameId = ref(null)
const peerConnections = ref(Array(maxCameras).fill(null))
// 模拟查询时间范围
const queryStart = ref(null)
const queryEnd = ref(null)
const queryParams = reactive({
  queryTime: [
    new Date(new Date().setHours(0, 0, 0, 0)),
    new Date(new Date().setHours(23, 59, 59, 999))
  ]
})
const queryFormRef = ref() // 搜索的表单
/** 搜索按钮操作 */
const handleQuery = async () => {
  let startDate = queryParams.queryTime[0]
  let endDate = queryParams.queryTime[1]
  if (startDate && endDate) {
    queryStart.value = startDate
    queryEnd.value = endDate

    // 搜索所有已添加摄像头的录像
    await searchAllCamerasRecords()

    genDataSegments()
    genTicks()
    console.log(startDate, endDate)
  }
}

// 搜索所有摄像头的录像
const searchAllCamerasRecords = async () => {
  const startTime = Math.floor(queryStart.value.getTime() / 1000)
  const endTime = Math.floor(queryEnd.value.getTime() / 1000)

  for (let i = 0; i < gridCells.value.length; i++) {
    const cell = gridCells.value[i]
    if (cell.camera) {
      try {
        const request = {
          channelId: cell.camera.channelId, // 确保摄像头数据中有channelId
          startTime: startTime,
          endTime: endTime,
          streamType: '1', // 主码流
          recordType: '0', // 全部类型
          recordSource: '2' // 设备存储
        }

        const segments = await searchRecords(request)

        // 更新单元格的播放列表
        cell.playerState.segments = segments.map((seg) => ({
          name: seg.name,
          src: seg.src, // HLS播放地址
          startOffset: seg.startOffset,
          duration: seg.duration
        }))

        // 如果有片段，加载第一个
        if (segments.length > 0) {
          loadSegment(i, 0, false)
        }
      } catch (error) {
        console.error(`搜索摄像头 ${cell.camera.cameraName} 录像失败:`, error)
        showNotification(
          `搜索 ${cell.camera.cameraName} 录像失败`,
          'error',
          'fas fa-exclamation-triangle'
        )
      }
    }
  }
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 播放列表
// const playlist = ref([
//   { name: "camera-segment", src: "/videos/test.mp4", startOffset: 3600*30 + 150*1, duration: 150 },
//   { name: "camera-segment", src: "/videos/test.mp4", startOffset: 3600*30 + 150*2, duration: 150 },
//   { name: "camera-segment", src: "/videos/test.mp4", startOffset: 3600*30 + 150*3, duration: 150 },
//   { name: "camera-segment", src: "/videos/test.mp4", startOffset: 3600*30 + 150*4, duration: 150 },
//   { name: "camera-segment", src: "/videos/test.mp4", startOffset: 3600*30 + 150*5, duration: 150 },
//   { name: "camera-segment", src: "/videos/test.mp4", startOffset: 3600*30 + 150*6, duration: 150 },
//   { name: "camera-segment", src: "/videos/test.mp4", startOffset: 3600*30 + 150*7, duration: 150 },
//   { name: "14-10.mp4", src: "/videos/test.mp4", startOffset: 3600*3+1000, duration: 3000 }
// ]);

// // 播放器相关
// const currentSegmentIndex = ref(0);
const globalCurrentTime = ref(0)
const isPlaying = ref(false)
const showControls = ref(false)
let hls

// 修改加载片段函数
const loadSegment = (cellIndex, segmentIndex, autoPlay = true) => {
  const cell = gridCells.value[cellIndex]
  if (!cell || !cell.camera) return

  const video = getVideoElement(cellIndex)
  if (!video) return

  // 使用单元格自己的播放列表
  const segments = cell.playerState.segments
  const segment = segments[segmentIndex]
  if (!segment) return

  // 清理旧实例
  if (cell.playerState.hls) {
    cell.playerState.hls.destroy()
    cell.playerState.hls = null
  }

  video.pause()
  video.src = ''

  // 使用setTimeout确保DOM更新
  setTimeout(() => {
    if (Hls.isSupported() && segment.src.endsWith('.m3u8')) {
      const hls = new Hls()
      cell.playerState.hls = hls
      hls.loadSource(segment.src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = 0
        if (autoPlay) playVideo(cellIndex)
      })
    } else {
      video.src = segment.src
      video.onloadeddata = () => {
        if (autoPlay) playVideo(cellIndex)
      }
    }

    // 更新状态
    cell.playerState.currentSegmentIndex = segmentIndex
    cell.playerState.startOffset = segment.startOffset
  }, 100)
}

// 修改播放器相关函数
const playVideo = async (cellIndex) => {
  const video = getVideoElement(cellIndex)
  if (!video) return

  try {
    await video.play()
    gridCells.value[cellIndex].playerState.isPlaying = true
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('播放失败:', e)
    }
  }
}

const pauseVideo = (cellIndex) => {
  const video = getVideoElement(cellIndex)
  if (!video) return

  video.pause()
  if (gridCells.value[cellIndex]) {
    gridCells.value[cellIndex].playerState.isPlaying = false
  }
}

function togglePlay() {
  if (gridCells.value[0].playerState.isPlaying) {
    pauseVideo(0)
  } else {
    playVideo(0)
  }
}

function playNextSegment(cellIndex) {
  const cell = gridCells.value[cellIndex]
  if (!cell || !cell.camera) return

  const segments = cell.playerState.segments
  const currentIndex = cell.playerState.currentSegmentIndex

  if (currentIndex < segments.length - 1) {
    loadSegment(cellIndex, currentIndex + 1)
  }
}

function updateCurrentTime(index) {
  const video = getVideoElement(index)
  if (!video) return

  const cell = gridCells.value[index]
  if (!cell || !cell.camera) return

  const segment = cell.playerState.segments[cell.playerState.currentSegmentIndex]
  if (segment) {
    cell.playerState.currentTime = segment.startOffset + video.currentTime

    // 如果是第一个单元格，更新全局时间（用于时间轴）
    if (index === 0) {
      globalCurrentTime.value = cell.playerState.currentTime
    }
  }
}

// 修正选择器
const updateDragPosition = (e) => {
  const timeline = document.querySelector('.timeline')
  if (!timeline) return

  const rect = timeline.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, timelineWidth.value))
  const targetCell = gridCells.value[0] // 示例：只控制第一个视频
  if (targetCell) {
    targetCell.playerState.currentTime = x / pxPerSecond.value
    seekGlobal(targetCell.playerState.currentTime, 0)
  }
}

// 修正刻度跳转
const jumpToTick = (tick) => {
  seekGlobal(tick.position / pxPerSecond.value, 0)
  playVideo(0)
}

function seekGlobal(seconds, index) {
  const cell = gridCells.value[index]
  if (!cell || !cell.camera) return

  const video = getVideoElement(index)
  if (!video) return

  const segments = cell.playerState.segments
  let targetIndex = segments.findIndex(
    (seg) => seconds >= seg.startOffset && seconds < seg.startOffset + seg.duration
  )

  if (targetIndex === -1) return

  if (targetIndex !== cell.playerState.currentSegmentIndex) {
    loadSegment(index, targetIndex, false)
  }

  video.currentTime = seconds - segments[targetIndex].startOffset
  cell.playerState.currentTime = seconds
}

// 时间轴计算
const pxPerSecond = computed(() => {
  return 1500 / 86400 // 一天1500px
})
const timelineWidth = computed(() => {
  const totalSeconds = (queryEnd.value - queryStart.value) / 1000
  return totalSeconds * pxPerSecond.value
})

// 日期段
const dateSegments = ref([])
const ticks = ref([])
function genDataSegments() {
  const days = []
  let cur = new Date(queryStart.value)
  while (cur <= queryEnd.value) {
    const next = new Date(cur)
    next.setHours(24, 0, 0, 0)
    let segEnd = next > queryEnd.value ? queryEnd.value : next
    const seconds = (segEnd - cur) / 1000
    days.push({
      label: cur.toLocaleDateString().slice(0, 10),
      width: seconds * pxPerSecond.value
    })
    cur = new Date(segEnd.getTime() + 1000)
  }
  dateSegments.value = days
}

// 刻度
function genTicks() {
  console.log(queryStart.value, queryEnd.value)
  const res = []
  const totalSeconds = (queryEnd.value - queryStart.value) / 1000
  console.log(totalSeconds)

  const step = 300 // 5分钟刻度

  // 获取第一个摄像头的播放列表
  const segments = gridCells.value[0]?.camera ? gridCells.value[0].playerState.segments : []

  for (let s = 0; s <= totalSeconds; s += step) {
    const time = new Date(queryStart.value.getTime() + s * 1000)
    const isHour = time.getMinutes() === 0

    // 检查是否有数据（使用第一个摄像头的播放列表）
    const hasData = segments.some(
      (seg) => s >= seg.startOffset && s < seg.startOffset + seg.duration
    )

    res.push({
      position: s * pxPerSecond.value,
      label: isHour ? `${String(time.getHours()).padStart(2, '0')}:00` : '',
      isHour,
      hasData
    })
  }
  console.log(res)
  ticks.value = res
}

// 播放位置 X 坐标
const playheadX = computed(() => {
  // 如果有第一个摄像头，使用它的当前时间
  if (gridCells.value[0]?.camera) {
    return gridCells.value[0].playerState.currentTime * pxPerSecond.value
  }
  return 0
})

// 拖拽逻辑
const onTimelineMouseDown = (e) => {
  const timeline = document.querySelector('.timeline')
  if (!timeline) return

  const rect = timeline.getBoundingClientRect()
  let lastX = e.clientX

  const moveHandler = (moveEvent) => {
    const deltaX = moveEvent.clientX - lastX
    lastX = moveEvent.clientX

    // 计算新位置
    const newPosition = Math.max(
      0,
      Math.min(globalCurrentTime.value * pxPerSecond.value + deltaX, timelineWidth.value)
    )

    globalCurrentTime.value = newPosition / pxPerSecond.value

    // 更新第一个摄像头的当前时间
    if (gridCells.value[0]?.camera) {
      gridCells.value[0].playerState.currentTime = globalCurrentTime.value
    }
  }

  const upHandler = () => {
    if (gridCells.value[0]?.camera) {
      seekGlobal(globalCurrentTime.value, 0)
      playVideo(0)
    }
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
  }

  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
}

function onTimelineMouseUp() {
  seekGlobal(globalCurrentTime.value, 0)
  playVideo(0)
  document.removeEventListener('mousemove', updateDragPosition)
  document.removeEventListener('mouseup', onTimelineMouseUp)
}

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridCols.value}, 1fr)`
}))

const activeCameras = computed(() => gridCells.value.filter((cell) => cell.camera).length)

function createGridCells(size) {
  return Array(size)
    .fill()
    .map(() => ({
      camera: null,
      zoomed: false,
      // 每个单元格独立的状态
      playerState: {
        hls: null,
        segments: [], // 独立的播放列表
        currentSegmentIndex: 0,
        isPlaying: false,
        currentTime: 0, // 独立的时间状态
        startOffset: 0 // 当前片段的起始偏移
      }
    }))
}

const showNotification = (text, type = 'info', icon = "['fas', 'info-circle']") => {
  notification.value = { show: true, text, icon, type }
  setTimeout(() => (notification.value.show = false), 3000)
}

const startDrag = (event, camera) => {
  event.dataTransfer.setData('camera', JSON.stringify(camera))
}

const addCameraToCell = async (camera, index) => {
  if (gridCells.value[index].camera?.id === camera.id) return

  // 如果该位置已有摄像头，先移除
  if (gridCells.value[index].camera) {
    removeCamera(index, false)
  }

  // 为每个摄像头创建独立的播放列表
  gridCells.value[index] = {
    ...gridCells.value[index],
    camera,
    zoomed: false,
    playerState: {
      hls: null,
      segments: [
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4', // 使用真实可访问的视频源
          startOffset: 0,
          duration: 150
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 60 * 1,
          duration: 60
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 60 * 2,
          duration: 60
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 60 * 3,
          duration: 60
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 60 * 4,
          duration: 60
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 60 * 5,
          duration: 60
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 60 * 6,
          duration: 60
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 60 * 7,
          duration: 60
        },
        {
          name: 'camera-segment',
          src: '/vms/videos/test.mp4',
          startOffset: 3600 * 3 + 1000,
          duration: 3000
        }
      ],
      currentSegmentIndex: 0,
      isPlaying: false,
      currentTime: 0,
      startOffset: 0
    }
  }

  // 等待DOM更新
  nextTick(() => {
    // 加载第一个片段
    loadSegment(index, 0)
    handleQuery()
    showNotification(`Added ${camera.cameraName} to video wall`, 'success', 'fas fa-video')
  })
}

const dropCamera = (event, index) => {
  try {
    const cameraData = event.dataTransfer.getData('camera')
    if (cameraData) {
      const camera = JSON.parse(cameraData)
      addCameraToCell(camera, index)
    }
  } catch (e) {
    console.error('Failed to drop device:', e)
  }
}

const addCameraToFirstAvailable = (camera) => {
  const emptyIndex = gridCells.value.findIndex((cell) => !cell.camera)
  if (emptyIndex !== -1) {
    addCameraToCell(camera, emptyIndex)
  } else {
    showNotification(
      'Video wall is full, please remove some devices',
      'warning',
      'fas fa-exclamation-triangle'
    )
  }
}

// 销毁视频流
const destroyVideoStream = (index) => {
  // 清理视频元素
  const video = getVideoElement(index)
  if (video && video.srcObject) {
    try {
      const tracks = video.srcObject.getTracks()
      tracks.forEach((track) => {
        track.stop()
        video.srcObject.removeTrack(track)
      })
      video.srcObject = null
    } catch (e) {
      console.error('清理视频流时出错:', e)
    }
  }
}

// 移除摄像头时销毁连接
const removeCamera = (index, showNote = true) => {
  const camera = gridCells.value[index].camera
  if (camera && showNote) {
    showNotification(`Removed ${camera.cameraName}`, 'info', 'fas fa-trash-alt')
  }

  destroyVideoStream(index)
  gridCells.value[index] = { camera: null, zoomed: false }
}

// 清空所有摄像头
const clearAll = () => {
  gridCells.value.forEach((_, index) => {
    destroyVideoStream(index)
    gridCells.value[index] = { camera: null, zoomed: false }
  })
  showNotification('Video wall cleared', 'info', 'fas fa-broom')
}

const prevGridCols = ref(null) // 记录放大前布局

const changeLayout = (cols) => {
  if (gridCols.value === cols) return

  // 如果正在放大，先退出放大
  if (zoomedIndex.value !== null) {
    zoomedIndex.value = null
    prevGridCols.value = null
  }

  const newSize = cols * cols
  const oldSize = gridCells.value.length

  // 1️⃣ 记录原来摄像头列表
  const oldCells = [...gridCells.value]
  const oldPCs = [...peerConnections.value]

  // 2️⃣ 清理多余格子的 WebRTC（被裁掉的）
  if (newSize < oldSize) {
    for (let i = newSize; i < oldSize; i++) {
      destroyVideoStream(i)
    }
  }

  // 3️⃣ 更新布局
  gridCols.value = cols
  gridCells.value = []
  peerConnections.value = []

  // 4️⃣ 先保留前 newSize 个摄像头 & 连接
  for (let i = 0; i < newSize; i++) {
    if (oldCells[i] && oldCells[i].camera) {
      gridCells.value.push(oldCells[i])
      peerConnections.value.push(oldPCs[i] || null)
    } else {
      gridCells.value.push({ camera: null, zoomed: false })
      peerConnections.value.push(null)
    }
  }

  // 5️⃣ 如果是扩容布局，直接补空格子
  while (gridCells.value.length < newSize) {
    gridCells.value.push({ camera: null, zoomed: false })
    peerConnections.value.push(null)
  }

  showNotification(`Switched to ${cols}×${cols} layout`, 'success', 'fas fa-th')
}

const zoomCell = (index) => {
  if (zoomedIndex.value === index) {
    // 当前已放大，再点同一个 -> 恢复布局
    zoomedIndex.value = null
    if (prevGridCols.value !== null) {
      gridCols.value = prevGridCols.value
      prevGridCols.value = null
    }
  } else {
    // 放大
    prevGridCols.value = gridCols.value // 保存原布局
    zoomedIndex.value = index
    gridCols.value = 1 // 放大成单屏
  }
}

// 获取视频元素
const getVideoElement = (index) => {
  const videos = document.querySelectorAll('.native-video')
  for (const video of videos) {
    if (parseInt(video.dataset.index) === index) {
      return video
    }
  }
  return null
}

// 初始化视频流
// 修复初始化视频流
const initVideoStream = async (index, camera) => {
  const video = getVideoElement(index)
  if (!video) return

  // 确保视频元素已准备好
  nextTick(() => {
    if (gridCells.value[index].playerState.segments.length > 0) {
      const firstSeg = gridCells.value[index].playerState.segments[0]
      seekGlobal(firstSeg.startOffset, index)
      playVideo(index)
    }
  })
}

// 简单的FPS计算器
let frameCount = 0,
  lastFpsUpdate = 0
const updateFps = () => {
  frameCount++
  const now = performance.now()
  if (now - lastFpsUpdate >= 1000) {
    fps.value = frameCount
    frameCount = 0
    lastFpsUpdate = now
  }
  animationFrameId.value = requestAnimationFrame(updateFps)
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

// 页面可见性处理
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // 页面隐藏时暂停视频
    gridCells.value.forEach((cell, index) => {
      if (cell.camera && cell.playerState.isPlaying) {
        pauseVideo(index)
      }
    })

    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  } else {
    // 页面显示时恢复视频
    gridCells.value.forEach((cell, index) => {
      if (cell.camera && cell.playerState.isPlaying) {
        playVideo(index)
      }
    })

    if (!animationFrameId.value) {
      animationFrameId.value = requestAnimationFrame(updateFps)
    }
  }
}

const currentPage = ref(1)
const totalPage = ref(1)
const perPage = 10
const fetchCameras = async (page = 1, search = '') => {
  currentPage.value = page
  const params = { page, size: perPage, name: search }
  const res = await getCameras(params)
  availableCameras.value = res.list
  totalPage.value = Math.ceil(res.total / perPage)
}

const onSearch = (term) => {
  fetchCameras(1, term)
}

// 生命周期
onMounted(() => {
  fetchCameras()

  // 添加页面可见性监听
  document.addEventListener('visibilitychange', handleVisibilityChange)

  nextTick(() => {
    let startDate = queryParams.queryTime[0]
    let endDate = queryParams.queryTime[1]
    if (startDate && endDate) {
      queryStart.value = startDate
      queryEnd.value = endDate
      genDataSegments()
      genTicks()
      console.log(startDate, endDate)
    }
  })
})

onBeforeUnmount(() => {
  // 清理所有资源
  gridCells.value.forEach((_, index) => destroyVideoStream(index))

  // 清理事件监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // 停止动画帧
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped>
/* 新增或修改的CSS */
.native-video {
  width: 100%;
  height: calc(100% - 40px);
  object-fit: cover;
  background: #000;
  transform: translateZ(0); /* 启用GPU加速 */
}

.grid-container {
  position: relative;
  display: grid;
  grid-gap: 18px;
  flex: 1;
  min-height: 0;
}

.grid-item {
  position: relative;
  background: rgba(30, 40, 70, 0.6);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(100, 150, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 100, 255, 0.3);
  border-color: rgba(100, 180, 255, 0.4);
}

.grid-item.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(40, 55, 90, 0.3);
  border: 2px dashed rgba(100, 150, 255, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    border-color: rgba(100, 150, 255, 0.4);
  }
  50% {
    border-color: rgba(100, 180, 255, 0.7);
  }
  100% {
    border-color: rgba(100, 150, 255, 0.4);
  }
}

.placeholder-content {
  text-align: center;
  color: rgba(200, 220, 255, 0.7);
  padding: 20px;
}

.placeholder-icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
  color: rgba(100, 180, 255, 0.6);
  transition: transform 0.3s;
}

.grid-item.placeholder:hover .placeholder-icon {
  transform: scale(1.1);
}

.small {
  font-size: 0.85rem;
  opacity: 0.8;
}

.video-title {
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.5px;
}

.video-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: #e0f0ff;
}

.action-btn:hover {
  transform: scale(1.15);
}

.action-btn.zoom:hover {
  background: rgba(100, 200, 255, 0.3);
}

.action-btn.remove:hover {
  background: rgba(255, 100, 100, 0.3);
}

/* 主布局 */
.main-content {
  display: flex;
  gap: 25px;
  height: 90vh;
  padding: 20px;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: white;
}

/* 视频墙样式 */
.video-wall {
  flex: 1;
  background: rgba(20, 25, 45, 0.85);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wall-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.layout-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.control-btn {
  background: rgba(60, 80, 120, 0.7);
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: rgba(80, 120, 200, 0.8);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 100, 255, 0.2);
}

.control-btn.active {
  background: rgba(100, 150, 255, 0.9);
  box-shadow: 0 0 15px rgba(100, 150, 255, 0.5);
}

.control-btn.danger {
  background: rgba(180, 60, 60, 0.7);
}

.control-btn.danger:hover {
  background: rgba(220, 80, 80, 0.9);
}

.video-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
  background: linear-gradient(to right, rgba(10, 20, 40, 0.9), rgba(20, 40, 80, 0.7));
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}
.grid-item:hover .video-header {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

/* 放大模式 */
.grid-item.zoomed {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  height: 90vh;
  z-index: 1000;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.92);
  border-radius: 12px;
  animation: zoomIn 0.4s forwards;
}

@keyframes zoomIn {
  from {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* 状态栏 */
.stats-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: #a0c8ff;
}

.status-active {
  color: #4afc9c;
  font-weight: 500;
}

/* 通知 */
.notification {
  position: fixed;
  bottom: 25px;
  right: 25px;
  color: white;
  padding: 16px 28px;
  border-radius: 10px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  max-width: 350px;
}

.notification.info {
  background: linear-gradient(to right, #3494e6, #ec6ead);
}

.notification.success {
  background: linear-gradient(to right, #00b09b, #96c93d);
}

.notification.warning {
  background: linear-gradient(to right, #ff8c00, #ff2d55);
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    height: auto;
  }

  .grid-container {
    height: 70vh;
  }
}

@media (max-width: 768px) {
  .wall-controls {
    flex-direction: column;
  }

  .layout-buttons {
    width: 100%;
    justify-content: center;
  }

  .control-btn {
    flex: 1;
    justify-content: center;
  }

  .stats-bar {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }

  .video-wall {
    padding: 15px;
  }

  .layout-buttons {
    gap: 8px;
  }

  .control-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .grid-container {
    grid-gap: 10px;
  }
}

.playback-container {
  width: 100%;
  max-width: 1200px;
}
.video-wrapper {
  position: relative;
}
.video-player {
  width: 100%;
  background: black;
  height: 80vh;
}
.center-control {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 40px;
  padding: 10px 20px;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
}
.timeline-wrapper {
  overflow-x: auto;
  background: #222;
  padding-top: 4px;
  cursor: pointer;
}
.date-row {
  display: flex;
  color: #fff;
  font-size: 12px;
  background: #333;
}
.date-segment {
  text-align: center;
  border-right: 1px solid #555;
}
.timeline {
  position: relative;
  height: 24px;
  background: #222;
  margin-right: 10px; /* 留出刻度线的宽度 */
  margin-left: 10px; /* 留出刻度线的宽度 */
}
.tick {
  position: absolute;
  bottom: 0;
  width: 1px;
  background: #666;
}
.hour-tick {
  background: #aaa;
}
.tick-label {
  position: absolute;
  bottom: 100%;
  left: -10px;
  font-size: 10px;
  color: #fff;
}
.has-data {
  background: green;
}
.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: red;
}
.el-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ece6e6;
  border-color: rgba(255, 255, 255, 0.1);
}
.el-input__wrapper .el-input__inner {
  border: none !important;
  outline: none;
}
::v-deep(.el-form-item__label) {
  color: #ece6e6;
}
/* 暗色表单输入框 */
.el-input__inner,
.el-range-editor.el-input__inner {
  background: rgba(30, 40, 60, 0.8) !important;
  border: 1px solid rgba(100, 150, 255, 0.3) !important;
  color: #e0e6f0 !important;
}

.el-input__inner::placeholder,
.el-range-editor__placeholder {
  color: rgba(200, 220, 255, 0.5) !important;
}

/* 日期选择器面板暗色 */
.el-picker-panel {
  background: #1e2435 !important;
  color: #ddd !important;
  border-color: rgba(100, 150, 255, 0.3) !important;
}
.el-picker-panel__body {
  background: #1e2435 !important;
}
.el-date-table td.available:hover {
  background: rgba(100, 150, 255, 0.2) !important;
  color: #fff !important;
}

/* 表单按钮 */
.el-button {
  background: rgba(60, 80, 120, 0.8) !important;
  border: 1px solid rgba(100, 150, 255, 0.3) !important;
  color: #e0f0ff !important;
  transition: all 0.3s;
}
.el-button:hover {
  background: rgba(100, 150, 255, 0.2) !important;
  border-color: rgba(100, 150, 255, 0.6) !important;
  color: #fff !important;
}

/* 滚动条整体 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: rgba(20, 25, 40, 0.8);
}
::-webkit-scrollbar-thumb {
  background: rgba(100, 150, 255, 0.4);
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(120, 180, 255, 0.6);
}
</style>
