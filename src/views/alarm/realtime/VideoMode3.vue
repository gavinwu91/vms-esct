<template>
  <div class="main-content">
    <!-- 隐藏的Video元素 -->
    <div style="display: none">
      <video
        v-for="index in maxCameras"
        :key="`video-${index}`"
        :ref="(el) => (videoRefs[index - 1] = el)"
        autoplay
        muted
        playsinline
      ></video>
    </div>
    <!-- Main Video Wall Area -->
    <div class="video-wall">
      <!-- Control Bar -->
      <!-- Grid Container -->
      <div class="grid-container" :style="gridStyle">
        <!-- 主Canvas渲染区域 -->
        <canvas ref="mainCanvas" class="main-canvas"></canvas>

        <!-- 网格交互层 -->
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
            <div class="video-container">
              <div v-show="loadingStates[index] === true" class="spinner"></div>
              <div class="video-header" v-show="zoomedIndex === null || zoomedIndex === index">
                <div class="video-title">
                  <FontAwesomeIcon :icon="['fas', 'video']" />
                  {{ cell.camera.cameraName }}
                </div>
                <div class="video-actions">
                  <button
                    class="action-btn zoom"
                    @click.stop="toggleZoom(index)"
                    :title="zoomedIndex === index ? 'Restore' : 'Zoom'"
                  >
                    <FontAwesomeIcon
                      :icon="zoomedIndex === index ? ['fas', 'compress'] : ['fas', 'expand']"
                    />
                  </button>
                  <button
                    class="action-btn remove"
                    @click.stop="removeCamera(index)"
                    title="Remove"
                  >
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                  </button>
                </div>
              </div>
            </div>
          </template>
          <button v-if="zoomedIndex === index" class="zoom-out-btn" @click="zoomedIndex = null">
            <FontAwesomeIcon :icon="['fas', 'compress']" />
          </button>
          <template v-else>
            <!-- Placeholder -->
            <div class="placeholder-content">
              <div class="placeholder-icon">
                <FontAwesomeIcon :icon="['fas', 'plus-circle']" />
              </div>
              <p>Drag and drop a device here</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="stats-bar">
        <div>
          Layout: {{ gridCols }}×{{ gridCols }} | In Use: {{ activeCameras }}/{{ gridCells.length }}
        </div>
        <div>
          Status: <span class="status-active">Running</span> | Updated at: {{ currentTime }}
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import CameraList from '@/components/CameraList.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getCameras } from '@/api/device'
import axios from 'axios'
import { config } from '@/utils/runtimeConfig'
import * as authUtil from '@/utils/auth'
import {bus} from '@/utils/bus'
// 常量
const maxCameras = 4

const availableCameras = ref([])
const gridCols = ref(2)
const gridCells = ref(createGridCells(gridCols.value * gridCols.value))
const notification = ref({ show: false, text: '', icon: '', type: 'info' })
const currentTime = ref('')
const fps = ref(0)
const mainCanvas = ref(null)
const videoRefs = ref(Array(maxCameras).fill(null))
const targetFPS = 15
const zoomedIndex = ref(null)
const peerConnections = ref(Array(maxCameras).fill(null))
const cpuLoad = ref(0)
const memoryUsage = ref(0)
const currentDeviceData = ref({})
// 计算属性
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridCols.value}, 1fr)`
}))

const activeCameras = computed(() => gridCells.value.filter((cell) => cell.camera).length)
bus.on('drag:start', (data) => {
  currentDeviceData.value = data
})
// 初始化函数
function init() {
  fetchCameras()
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  requestAnimationFrame(drawFrame)
  setInterval(updateTime, 1000)
  setInterval(updatePerformanceStats, 2000)
}

function createGridCells(size) {
  return Array(size)
    .fill()
    .map(() => ({
      camera: null,
      zoomed: false
    }))
}

// 通知系统
const showNotification = (text, type = 'info', icon = "['fas', 'info-circle']") => {
  notification.value = { show: true, text, icon, type }
  setTimeout(() => (notification.value.show = false), 3000)
}

// 拖放功能
const startDrag = (event, camera) => {
  event.dataTransfer.setData('camera', JSON.stringify(camera))
}

// 摄像头管理
const addCameraToCell = (camera, index) => {
  // 确保索引在有效范围内
  if (index < 0 || index >= gridCells.value.length) {
    showNotification('Invalid position for camera', 'error')
    return
  }

  // 检查是否已添加相同摄像头
  const existingIndex = gridCells.value.findIndex(
    (cell, i) => cell.camera?.id === camera.id && i !== index
  )

  if (existingIndex !== -1) {
    removeCamera(existingIndex, false)
  }

  // 创建新的单元格对象（保留缩放状态）
  const newCells = [...gridCells.value]
  newCells[index] = {
    ...newCells[index],
    camera,
    zoomed: newCells[index]?.zoomed || false
  }

  gridCells.value = newCells

  // 初始化WebRTC流
  initWebRTCStream(index, camera)
  showNotification(`Added ${camera.cameraName} to video wall`, 'success')
}

const dropCamera = (event, index) => {
  try {
    let camera = null
    if(currentDeviceData.value){
    console.log("currentDeviceData.value ============= " , currentDeviceData.value.device)
    camera = currentDeviceData.value.device
  }
    // const cameraData = event.dataTransfer.getData('camera')
    // if (cameraData) {
    //   const camera = JSON.parse(cameraData)
    //   addCameraToCell(camera, index)
    // }
    addCameraToCell(camera, index)
    currentDeviceData.value = {}
  } catch (e) {
    console.error('Failed to drop camera:', e)
  }
}

const addCameraToFirstAvailable = (camera) => {
  const emptyIndex = gridCells.value.findIndex((cell) => !cell.camera)
  if (emptyIndex !== -1) {
    addCameraToCell(camera, emptyIndex)
  } else {
    showNotification(
      'Video wall is full, please remove some cameras',
      'warning',
      'fas fa-exclamation-triangle'
    )
  }
}

const loadingStates = ref(Array(maxCameras).fill(true))

// WebRTC连接管理
// const initWebRTCStream = async (index, camera) => {
//   console.log(import.meta.env.VITE_GOVIEW_URL)
//   loadingStates[index] = true
//   await destroyVideoStream(index) // 避免重复连接

//   const url = `${import.meta.env.VITE_GOVIEW_URL}/v0/cameras/${camera.id}/streams/1`
//   let token = authUtil.getAccessToken()
//   const data = {
//     session_id: token,
//     username: camera.cameraAccount,
//     password: camera.cameraPassword,
//     retina_url: `rtsp://${camera.cameraIp}:${camera.cameraPort}`,
//     source_url: `rtsp://${camera.cameraAccount}:${camera.cameraPassword}@${camera.cameraIp}:${camera.cameraPort}`
//   }

//   axios
//     .post(url, data, { headers: { 'Content-Type': 'application/json' } })
//     .then((res) => console.log('POST 成功:', res.data))
//     .catch((err) => console.error('POST 失败:', err))

//   const video = videoRefs.value[index]
//   if (!video) return

//   const pc = new RTCPeerConnection({
//     iceServers: [{ urls: 'turn:192.168.88.191:3478', username: 'user', credential: 'pass' }]
//   })
//   peerConnections.value[index] = pc // 保存引用

//   pc.addTransceiver('video', { direction: 'recvonly' })

//   pc.ontrack = (event) => {
//     video.srcObject = event.streams[0]
//     video.muted = true
//     video.playsInline = true
//     video.autoplay = true
//     video.onloadedmetadata = () => (loadingStates.value[index] = false)
//     video.onwaiting = () => (loadingStates.value[index] = true)
//     video.oncanplay = () => (loadingStates.value[index] = false)
//     video.onloadedmetadata = () =>
//       video.play().catch((err) => console.error('Video play error:', err))
//   }

//   pc.onicecandidate = (event) => {
//     if (!event.candidate) {
//       const url = `${import.meta.env.VITE_GOVIEW_URL}/v0/cameras/${camera.id}/streams/1/sdp`
//       axios
//         .post(
//           url,
//           { session_id: token, sdp: pc.localDescription.sdp },
//           {
//             headers: { 'Content-Type': 'text/plain' }
//           }
//         )
//         .then((res) =>
//           pc.setRemoteDescription({
//             type: 'answer',
//             sdp: res.data.sdp
//           })
//         )
//         .catch((err) => console.error('SDP POST failed:', err))
//     }
//   }

//   pc.createOffer().then((offer) => pc.setLocalDescription(offer))

//   console.log(`🔵 WebRTC connection created: cell ${index}`)
// }

const initWebRTCStream = async (index, camera) => {
  loadingStates.value[index] = true
  await destroyVideoStream(index)

  const url = `${config.PLAY_SERVER_URL}/v0/cameras/${camera.id}/streams/1`

  let token = camera.id + authUtil.getAccessToken()
  const data = {
    session_id: token,
    username: camera.cameraAccount,
    password: camera.cameraPassword,
    source_url: `rtsp://${camera.cameraIp}:${camera.cameraPort}`,
    retina_url: `rtsp://${camera.cameraAccount}:${camera.cameraPassword}@${camera.cameraIp}:${camera.cameraPort}`
  }

  // 先创建流
  try {
    await axios.post(url, data, { headers: { 'Content-Type': 'application/json' } })
    console.log('POST 成功: 流已创建')
  } catch (err) {
    console.error('POST 失败:', err)
    loadingStates.value[index] = false
    return
  }

  const video = videoRefs.value[index]
  if (!video) return

  // 优化的 WebRTC 配置
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // { urls: 'stun:192.168.200.217:3478' }
      { urls: `${config.STUN_SERVER_URL}` }
    ],
    // 关键配置优化
    iceTransportPolicy: 'all', // 允许所有传输方式
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceCandidatePoolSize: 10
  })

  peerConnections.value[index] = pc

  // 添加数据通道用于保活
  const dataChannel = pc.createDataChannel('keepalive', {
    ordered: true,
    maxRetransmits: 3
  })

  dataChannel.onopen = () => {
    console.log('Data channel opened, sending keepalive')
    // 定期发送保活消息
    setInterval(() => {
      if (dataChannel.readyState === 'open') {
        dataChannel.send('keepalive')
      }
    }, 5000)
  }

  dataChannel.onmessage = (event) => {
    console.log('Received message:', event.data)
  }

  pc.addTransceiver('video', { direction: 'recvonly' })
  pc.addTransceiver('audio', { direction: 'recvonly' })

  let streamStarted = false

  pc.ontrack = (event) => {
    if (streamStarted) return
    streamStarted = true

    console.log('Track received:', event.track.kind)

    // 初始化数据通道
    const channelInfo = initDataChannel(pc, camera, index)

    video.srcObject = event.streams[0]
    video.muted = true
    video.playsInline = true
    video.autoplay = true

    let hasFirstFrame = false
    let checkInterval

    // 检测第一帧渲染
    const checkFirstFrame = () => {
      if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        hasFirstFrame = true
        clearInterval(checkInterval)
        console.log('✅ 第一帧视频画面已渲染')
        loadingStates.value[index] = false

        // 确保视频播放
        video.play().catch((err) => {
          console.log('自动播放被阻止，用户交互后恢复:', err)
        })
      }
    }

    video.onloadedmetadata = () => {
      console.log('Video metadata loaded, 开始检测第一帧')
      // 开始检测第一帧
      checkInterval = setInterval(checkFirstFrame, 100)

      // 设置超时，防止无限等待
      setTimeout(() => {
        if (!hasFirstFrame) {
          console.log('⚠️ 第一帧检测超时，强制显示')
          clearInterval(checkInterval)
          // loadingStates.value[index] = false
        }
      }, 5000)
    }

    video.oncanplay = () => {
      console.log('Video can play')
      if (!hasFirstFrame) {
        loadingStates.value[index] = false
      }
    }

    video.oncanplaythrough = () => {
      console.log('Video can play through')
    }

    video.onwaiting = () => {
      console.log('Video waiting for data')
      loadingStates.value[index] = true
    }

    video.onplaying = () => {
      console.log('Video started playing')
      loadingStates.value[index] = false
    }

    // 监听视频尺寸变化（表示有实际画面）
    video.onresize = () => {
      console.log('Video resized, dimensions:', video.videoWidth, 'x', video.videoHeight)
      if (video.videoWidth > 0 && !hasFirstFrame) {
        hasFirstFrame = true
        loadingStates.value[index] = false
      }
    }
  }
  // 改进的连接状态监控
  pc.onconnectionstatechange = () => {
    const state = pc.connectionState
    console.log(`🔗 连接状态: ${state}`)

    switch (state) {
      case 'connected':
        console.log('✅ WebRTC 连接成功')
        showNotification(`camera ${camera.cameraName} connected`, 'success')
        break

      case 'disconnected':
        console.log('⚠️ WebRTC 连接断开')
        // 立即尝试恢复
        setTimeout(() => {
          if (pc.connectionState === 'disconnected') {
            handleConnectionRecovery(pc, camera, index)
          }
        }, 1000)
        break

      case 'failed':
        console.log('❌ WebRTC 连接失败')
        loadingStates.value[index] = false
        showNotification(`camera ${camera.cameraName} failed`, 'error')
        // 延迟后重新连接
        setTimeout(() => {
          initWebRTCStream(index, camera)
        }, 3000)
        break

      case 'closed':
        console.log('🔴 WebRTC 连接关闭')
        break
    }
  }

  const initDataChannel = (pc, camera, index) => {
    let dataChannel
    let keepAliveInterval
    let connectionAlive = true

    try {
      dataChannel = pc.createDataChannel('keepalive', {
        ordered: true,
        maxRetransmits: 3,
        protocol: 'tcp'
      })

      dataChannel.onopen = () => {
        console.log('📡 数据通道已打开，开始保活')

        // 清除之前的间隔（如果有）
        if (keepAliveInterval) clearInterval(keepAliveInterval)

        keepAliveInterval = setInterval(() => {
          if (dataChannel.readyState === 'open' && connectionAlive) {
            try {
              dataChannel.send(
                JSON.stringify({
                  type: 'keepalive',
                  timestamp: Date.now(),
                  cameraId: camera.id
                })
              )
              console.log('💓 发送保活信号')
            } catch (err) {
              console.warn('发送保活信号失败:', err)
              // 保活失败时尝试恢复连接
              handleConnectionRecovery(pc, camera, index)
            }
          }
        }, 3000) // 每3秒发送一次保活
      }

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 收到保活响应:', data.type)
        } catch (e) {
          console.log('📨 收到保活响应:', event.data)
        }
      }

      dataChannel.onclose = () => {
        console.log('🔴 数据通道关闭')
        connectionAlive = false
        if (keepAliveInterval) clearInterval(keepAliveInterval)
        handleConnectionRecovery(pc, camera, index)
      }

      dataChannel.onerror = (error) => {
        console.error('❌ 数据通道错误:', error)
        connectionAlive = false
        handleConnectionRecovery(pc, camera, index)
      }

      return { dataChannel, keepAliveInterval, connectionAlive }
    } catch (err) {
      console.warn('创建数据通道失败:', err)
      return null
    }
  }

  // 添加连接恢复处理函数
  const handleConnectionRecovery = (pc, camera, index) => {
    const state = pc.connectionState
    console.log(`🔄 检测到连接问题，当前状态: ${state}`)

    if (state === 'disconnected' || state === 'failed') {
      console.log('🔄 尝试恢复连接...')

      // 先尝试重启 ICE
      try {
        pc.restartIce()
        console.log('✅ ICE 重启成功')
      } catch (err) {
        console.warn('ICE 重启失败:', err)
      }

      // 如果5秒后仍然断开，完全重新连接
      setTimeout(() => {
        if (pc.connectionState !== 'connected') {
          console.log('🔄 完全重新连接摄像头')
          initWebRTCStream(index, camera)
        }
      }, 5000)
    }
  }
  // 改进的 SDP 请求函数
  const sendSDPRequest = async (maxRetries = 10, retryDelay = 500) => {
    const sdpUrl = `${config.PLAY_SERVER_URL}/v0/cameras/${camera.id}/streams/1/sdp`

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`SDP 请求尝试 ${attempt + 1}/${maxRetries}`)

        const response = await axios.post(
          sdpUrl,
          { session_id: token, sdp: pc.localDescription.sdp },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
          }
        )

        console.log('SDP 请求成功，响应数据:', response.data)

        // 检查返回的 SDP 格式
        let answerSdp = response.data.sdp

        // 如果返回的是 base64 编码的 SDP，需要解码
        if (answerSdp && !answerSdp.startsWith('v=')) {
          try {
            console.log('检测到 base64 编码的 SDP，正在解码...')
            // 解码 base64
            const decodedSdp = atob(answerSdp)
            console.log('解码后的 SDP 长度:', decodedSdp.length)
            console.log('解码后的 SDP 前100字符:', decodedSdp.substring(0, 100))

            // 验证解码后的 SDP 格式
            if (decodedSdp.startsWith('v=')) {
              answerSdp = decodedSdp
              console.log('SDP 解码成功，格式正确')
            } else {
              console.warn('解码后的 SDP 格式不正确，尝试直接使用')
            }
          } catch (decodeError) {
            console.warn('Base64 解码失败，尝试直接使用原始 SDP:', decodeError)
          }
        }

        // 验证 SDP 格式
        if (!answerSdp || !answerSdp.startsWith('v=')) {
          throw new Error(
            `无效的 SDP 格式: ${answerSdp ? answerSdp.substring(0, 50) + '...' : '空'}`
          )
        }

        console.log('设置远程 SDP，长度:', answerSdp.length)
        await pc.setRemoteDescription({
          type: 'answer',
          sdp: answerSdp
        })

        console.log('setRemoteDescription 成功')
        // loadingStates.value[index] = false
        return true
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message

        if (errorMsg.includes('camera not ready') && attempt < maxRetries - 1) {
          console.log(`摄像头未就绪，${retryDelay}ms后重试...`)
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          continue
        }

        console.error('SDP 请求最终失败:', errorMsg)

        // 详细错误信息
        if (error.response?.data) {
          console.error('后端错误详情:', error.response.data)
        }

        return false
      }
    }
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('ICE candidate:', event.candidate.type, event.candidate.protocol)
    } else {
      console.log('ICE gathering complete')
      // 开始发送 SDP 请求
      sendSDPRequest().then((success) => {
        if (!success) {
          showNotification(`摄像头 ${camera.cameraName} 连接失败`, 'error')
        }
      })
    }
  }

  // 创建 offer 并设置更长的超时
  try {
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    })

    await pc.setLocalDescription(offer)
    console.log(`🔵 WebRTC offer created: cell ${index}`)

    // 设置超时保护
    setTimeout(() => {
      if (pc.iceConnectionState === 'checking') {
        console.log('ICE connection taking too long, restarting...')
        pc.restartIce()
      }
    }, 30000)
  } catch (err) {
    console.error('创建 offer 失败:', err)
    loadingStates.value[index] = false
  }
}



// 销毁视频流
const destroyVideoStream = (index) => {
  return new Promise((resolve, reject) => {
    const pc = peerConnections.value[index]
    const video = videoRefs.value[index]

    if (pc) {
      pc.getSenders().forEach((sender) => sender.track?.stop())
      pc.close()
      peerConnections.value[index] = null
      console.log(`🔴 WebRTC connection destroyed: cell ${index}`)
    }
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop())
      video.srcObject = null
      video.load()
    }

    const camera = gridCells.value[index]?.camera
    if (!camera) return resolve() // 没摄像头时直接 resolve
    let token = camera.id + authUtil.getAccessToken()
    const url = `${config.PLAY_SERVER_URL}/v0/cameras/${camera.id}/streams/1?session_id=${token}`
    axios
      .delete(url)
      .then((res) => {
        console.log('DELETE success:', res.data)
        resolve(res.data)
      })
      .catch((err) => {
        console.error('DELETE failed:', err)
        reject(err)
      })
  })
}
// const destroyVideoStream = (index) => {
//   return new Promise((resolve, reject) => {
//     const pc = peerConnections.value[index]
//     const video = videoRefs.value[index]

//     if (pc) {
//       pc.getSenders().forEach((sender) => sender.track?.stop())
//       pc.close()
//       peerConnections.value[index] = null
//       console.log(`🔴 WebRTC connection destroyed: cell ${index}`)
//     }
//     if (video?.srcObject) {
//       video.srcObject.getTracks().forEach((track) => track.stop())
//       video.srcObject = null
//       video.load()
//     }

//     const camera = gridCells.value[index]?.camera
//     if (!camera) return resolve() // 没摄像头时直接 resolve

//     const url = `${import.meta.env.VITE_GOVIEW_URL}/v0/cameras/${camera.id}/streams/1?session_id=${authUtil.getAccessToken()}`
//     axios
//       .delete(url)
//       .then((res) => {
//         console.log('DELETE success:', res.data)
//         resolve(res.data)
//       })
//       .catch((err) => {
//         console.error('DELETE failed:', err)
//         reject(err)
//       })
//   })
// }

// 移除摄像头
const removeCamera = (index, showNote = true) => {
  const camera = gridCells.value[index]?.camera
  if (camera && showNote) {
    showNotification(`Removed ${camera.cameraName}`, 'info', 'fas fa-trash-alt')
  }
  console.log('destroyVideoStream =========== 3')
  destroyVideoStream(index)
  gridCells.value[index] = { camera: null, zoomed: false }
}

// 清空所有摄像头
const clearAll = () => {
  gridCells.value.forEach((_, index) => {
    console.log('destroyVideoStream =========== 2')
    destroyVideoStream(index)
    gridCells.value[index] = { camera: null, zoomed: false }
  })
  showNotification('Video wall cleared', 'info', 'fas fa-broom')
}

// 布局管理
const changeLayout = async (cols) => {
  // 如果正在放大，先退出放大
  if (zoomedIndex.value !== null) {
    zoomedIndex.value = null
  }

  if (gridCols.value === cols) return

  const newSize = cols * cols
  const currentCameras = gridCells.value
    .filter((cell) => cell.camera)
    .map((cell) => cell.camera)
    .slice(0, newSize)

  // 销毁多余连接
  if (newSize < gridCells.value.length) {
    for (let i = newSize; i < gridCells.value.length; i++) {
      if (gridCells.value[i]?.camera) {
        console.log('destroyVideoStream =========== 1')
        await destroyVideoStream(i)
      }
    }
  }

  // 更新布局
  gridCols.value = cols
  gridCells.value = createGridCells(newSize)

  // 重新添加摄像头
  currentCameras.forEach((camera, index) => {
    gridCells.value[index] = {
      camera,
      zoomed: false
    }

    // 重新初始化流
    if (camera) {
      initWebRTCStream(index, camera)
    }
  })

  showNotification(`Switched to ${cols}×${cols} layout`, 'success', 'fas fa-th')
}

// 缩放功能
const toggleZoom = (index) => {
  if (zoomedIndex.value === index) {
    // 退出缩放
    zoomedIndex.value = null
  } else {
    // 进入缩放
    zoomedIndex.value = index
  }
  console.log('zoomedIndex.value', zoomedIndex.value)
  resizeCanvas() // 更新 Canvas 尺寸
}

// 视频渲染
// const renderVideos = () => {
//   if (!mainCanvas.value) return

//   const ctx = mainCanvas.value.getContext('2d')
//   const canvasWidth = mainCanvas.value.width
//   const canvasHeight = mainCanvas.value.height

//   // 重置上下文
//   ctx.setTransform(1, 0, 0, 1, 0, 0)
//   ctx.clearRect(0, 0, canvasWidth, canvasHeight)

//   // 处理高DPI设备
//   const dpr = window.devicePixelRatio || 1
//   ctx.scale(dpr, dpr)

//   // 绘制质量
//   ctx.imageSmoothingEnabled = true
//   ctx.imageSmoothingQuality = 'high'

//   // 没有活动视频
//   if (activeCameras.value === 0 && zoomedIndex.value === null) {
//     return
//   }

//   // helper: 绘制 cover 视频并裁剪
//   const drawCoverVideo = (video, x, y, w, h) => {
//     const videoAspect = video.videoWidth / video.videoHeight
//     const cellAspect = w / h

//     let renderWidth, renderHeight, offsetX, offsetY
//     if (videoAspect > cellAspect) {
//       // 视频更宽，裁左右
//       renderHeight = h
//       renderWidth = h * videoAspect
//       offsetX = (w - renderWidth) / 2
//       offsetY = 0
//     } else {
//       // 视频更高，裁上下
//       renderWidth = w
//       renderHeight = w / videoAspect
//       offsetX = 0
//       offsetY = (h - renderHeight) / 2
//     }

//     ctx.save()
//     ctx.beginPath()
//     ctx.rect(x, y, w, h) // 限制绘制区域
//     ctx.clip()
//     ctx.drawImage(video, x + offsetX, y + offsetY, renderWidth, renderHeight)
//     ctx.restore()
//   }

//   // 缩放模式
//   if (zoomedIndex.value !== null) {
//     if (
//       zoomedIndex.value >= 0 &&
//       zoomedIndex.value < gridCells.value.length &&
//       gridCells.value[zoomedIndex.value]?.camera
//     ) {
//       const video = videoRefs.value[zoomedIndex.value]
//       if (video && video.readyState >= video.HAVE_ENOUGH_DATA) {
//         drawCoverVideo(video, 0, 0, canvasWidth / dpr, canvasHeight / dpr)
//       }
//     } else {
//       zoomedIndex.value = null
//     }
//     return
//   }

//   // 网格模式
//   const gridSize = gridCols.value
//   const gap = 12 // CSS grid-gap
//   const scaledGap = gap * dpr

//   const cellWidth = (canvasWidth - (gridSize - 1) * scaledGap) / gridSize
//   const cellHeight = (canvasHeight - (gridSize - 1) * scaledGap) / gridSize

//   for (let i = 0; i < gridCells.value.length; i++) {
//     const cell = gridCells.value[i]
//     if (!cell.camera) continue

//     const row = Math.floor(i / gridSize)
//     const col = i % gridSize
//     const x = col * (cellWidth + scaledGap)
//     const y = row * (cellHeight + scaledGap)

//     const video = videoRefs.value[i]
//     if (video && video.readyState >= video.HAVE_ENOUGH_DATA) {
//       try {
//         drawCoverVideo(video, x, y, cellWidth, cellHeight)
//       } catch (err) {
//         console.error(`Error rendering video in cell ${i}:`, err)
//       }
//     }
//   }
// }
const renderVideos = () => {
  if (!mainCanvas.value) return

  const ctx = mainCanvas.value.getContext('2d')
  const canvasWidth = mainCanvas.value.width
  const canvasHeight = mainCanvas.value.height

  // 重置上下文
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 处理高DPI设备
  const dpr = 1
  // const dpr = window.devicePixelRatio || 1
  ctx.scale(dpr, dpr)

  // 绘制质量
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 没有活动视频
  if (activeCameras.value === 0 && zoomedIndex.value === null) {
    return
  }

  const drawContainVideo = (video, x, y, w, h) => {
    const videoAspect = video.videoWidth / video.videoHeight // ≈1.75
    const cellAspect = w / h

    let renderWidth, renderHeight, offsetX, offsetY
    if (videoAspect > cellAspect) {
      renderWidth = w
      renderHeight = w / videoAspect
      offsetX = 0
      offsetY = (h - renderHeight) / 2
    } else {
      renderHeight = h
      renderWidth = h * videoAspect
      offsetX = (w - renderWidth) / 2
      offsetY = 0
    }

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h) // 限制绘制区域
    ctx.clip()
    ctx.drawImage(video, x + offsetX, y + offsetY, renderWidth, renderHeight)
    ctx.restore()
  }

  // 缩放模式
  if (zoomedIndex.value !== null) {
    if (
      zoomedIndex.value >= 0 &&
      zoomedIndex.value < gridCells.value.length &&
      gridCells.value[zoomedIndex.value]?.camera
    ) {
      const video = videoRefs.value[zoomedIndex.value]
      if (video && video.readyState >= video.HAVE_ENOUGH_DATA) {
        drawContainVideo(video, 0, 0, canvasWidth / dpr, canvasHeight / dpr)
      }
    } else {
      zoomedIndex.value = null
    }
    return
  }

  // 网格模式
  const gridSize = gridCols.value
  const gap = 12 // CSS grid-gap
  const scaledGap = gap * dpr

  const cellWidth = (canvasWidth - (gridSize - 1) * scaledGap) / gridSize
  const cellHeight = (canvasHeight - (gridSize - 1) * scaledGap) / gridSize

  for (let i = 0; i < gridCells.value.length; i++) {
    const cell = gridCells.value[i]
    if (!cell.camera) continue

    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    const x = col * (cellWidth + scaledGap)
    const y = row * (cellHeight + scaledGap)

    const video = videoRefs.value[i]
    if (video && video.readyState >= video.HAVE_ENOUGH_DATA) {
      try {
        drawContainVideo(video, x, y, cellWidth, cellHeight)
      } catch (err) {
        console.error(`Error rendering video in cell ${i}:`, err)
      }
    }
  }
}



// 性能管理
let lastDrawTime = 0,
  frameCount = 0,
  lastFpsUpdate = 0
const drawFrame = (timestamp) => {
  frameCount++
  const now = performance.now()

  // 每秒更新一次FPS
  if (now - lastFpsUpdate >= 1000) {
    fps.value = frameCount / ((now - lastFpsUpdate) / 1000)
    frameCount = 0
    lastFpsUpdate = now
  }

  // 控制帧率
  if (timestamp - lastDrawTime > 1000 / targetFPS) {
    renderVideos()
    lastDrawTime = timestamp
  }

  requestAnimationFrame(drawFrame)
}

const resizeCanvas = () => {
  if (!mainCanvas.value) return

  const container = document.querySelector('.grid-container')
  if (container) {
    const dpr = window.devicePixelRatio || 1

    const width = container.clientWidth
    const height = container.clientHeight

    // 设置 CSS 尺寸（视觉）
    mainCanvas.value.style.width = `${width}px`
    mainCanvas.value.style.height = `${height}px`

    // 设置实际绘图尺寸（像素）
    mainCanvas.value.width = width * dpr
    mainCanvas.value.height = height * dpr

    const ctx = mainCanvas.value.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // 确保高清显示
  }
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

const updatePerformanceStats = () => {
  // 模拟性能数据
  cpuLoad.value = Math.min(100, Math.floor(20 + Math.random() * 30 + activeCameras.value * 3))
  memoryUsage.value = Math.min(500, Math.floor(100 + activeCameras.value * 20 + Math.random() * 20))
}

// 摄像头数据
const currentPage = ref(1)
const totalPage = ref(1)
const perPage = 10
const fetchCameras = async (page = 1, search = '') => {
  currentPage.value = page
  const params = {
    page: page,
    size: perPage,
    name: search
  }
  const res = await getCameras(params)
  availableCameras.value = res.list
  totalPage.value = Math.ceil(res.total / perPage)
}

const onSearch = (term) => {
  fetchCameras(1, term)
}

// 生命周期
onMounted(init)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)

  // 清理所有连接
  peerConnections.value.forEach((pc, index) => {
    if (pc) {
      pc.close()
      console.log(`🔴 WebRTC connection closed on unmount: cell ${index}`)
    }
  })
})
</script>

<style scoped>
/* 新增或修改的CSS */
.main-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  transform: translateZ(0);
  background-color: #0a0a1a;
  pointer-events: none;
}

.grid-container {
  position: relative;
  padding: 0;
  margin: 0;
  border: none;
}

.grid-item {
  position: relative;
  z-index: 2;
  background-color: transparent !important;
  border: 1px solid rgba(100, 150, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.grid-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 100, 255, 0.3);
  border-color: rgba(100, 180, 255, 0.4);
}

.grid-item.zoomed {
  z-index: 10;
  box-shadow: 0 0 0 3px #4afc9c;
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
  background: linear-gradient(to right, rgba(10, 20, 40, 0.9), rgba(20, 40, 80, 0.7));
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  opacity: 0;
  transform: translateY(-100%);
  transition: all 0.3s ease;
}

.grid-item:hover .video-header {
  opacity: 1;
  transform: translateY(0);
}

.video-title {
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
}

.video-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: #e0f0ff;
  font-size: 0.8rem;
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
  align-items: center;
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

.performance-info {
  background: rgba(40, 55, 90, 0.5);
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: monospace;
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

/* 网格布局 */
.grid-container {
  display: grid;
  grid-gap: 12px;
  flex: 1;
  min-height: 0;
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
  z-index: 3;
}

.placeholder-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: rgba(100, 180, 255, 0.6);
  transition: transform 0.3s;
}

.grid-item.placeholder:hover .placeholder-icon {
  transform: scale(1.1);
}

.small {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 状态栏 */
.stats-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
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
  padding: 14px 24px;
  border-radius: 8px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  max-width: 320px;
  font-size: 0.9rem;
}

.notification i {
  font-size: 1.2rem;
}

.notification.info {
  background: linear-gradient(135deg, #3494e6, #5d6df0);
}

.notification.success {
  background: linear-gradient(135deg, #00b09b, #7bcb4d);
}

.notification.warning {
  background: linear-gradient(135deg, #ff8c00, #ff5252);
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(80px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    height: auto;
  }

  .grid-container {
    height: 60vh;
  }

  .wall-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .performance-info {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .layout-buttons {
    width: 100%;
  }

  .control-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
  }

  .stats-bar {
    flex-direction: column;
    gap: 6px;
  }

  .video-header {
    padding: 6px 10px;
  }

  .video-title {
    font-size: 0.8rem;
  }

  .action-btn {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }

  .video-wall {
    padding: 15px;
  }

  .grid-container {
    grid-gap: 8px;
  }

  .placeholder-content {
    padding: 10px;
  }

  .notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 10;
}
@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.video-container {
  position: relative;
}
.video-container video {
  display: block;
}
</style>