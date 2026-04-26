<template>
  <div class="main-content">
    <!-- Camera Panel -->
    <CameraList
      :cameras="availableCameras"
      :total-pages="totalPage"
      :current-page="currentPage"
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
          <button
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
          </button>
        </div>
        <button class="control-btn danger" @click="clearAll">
          <FontAwesomeIcon :icon="['fas', 'trash-alt']" /> Clear
        </button>
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
            <div class="video-container">
              <div class="video-header">
                <div class="video-title">
                  <FontAwesomeIcon :icon="['fas', 'video']" /> 
                  {{ cell.camera.cameraName }}
                </div>
                <div class="video-actions">
                  <button
                    class="action-btn zoom"
                    @click.stop="zoomCell(index)"
                    :title="zoomedIndex === index ? 'Restore' : 'Zoom'"
                  >
                    <FontAwesomeIcon :icon="zoomedIndex === index ? ['fas', 'compress'] : ['fas', 'expand']" />
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
              <!-- 使用原生video元素 -->
              <video
                ref="videoElements"
                autoplay
                muted
                playsinline
                class="native-video"
                :data-index="index"
              ></video>
            </div>
          </template>
          
          <template v-else>
            <!-- Placeholder -->
            <div class="placeholder-content">
              <div class="placeholder-icon">
                <FontAwesomeIcon :icon="['fas', 'plus-circle']" />
              </div>
              <p>Drag and drop a camera here</p>
              <p class="small">Or double-click a camera on the left</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="stats-bar">
        <div>
          Layout: {{ gridCols }}×{{ gridCols }} | 
          In Use: {{ activeCameras }}/{{ gridCells.length }} |
          FPS: {{ fps.toFixed(1) }}
        </div>
        <div>
          Status: <span class="status-active">Running</span> | 
          Updated at: {{ currentTime }}
        </div>
      </div>
    </div>

    <!-- Notification Component -->
    <Transition name="slide-up">
      <div 
        v-if="notification.show" 
        class="notification"
        :class="notification.type"
      >
        <FontAwesomeIcon :icon="notification.icon" />
        <span>{{ notification.text }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import CameraList from '@/components/CameraList.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getCameras } from '@/api/device'
import axios from "axios";

// 常量
const maxCameras = 9;

const availableCameras = ref([]);
const gridCols = ref(2);
const gridCells = ref(createGridCells(4));
const notification = ref({ show: false, text: '', icon: '', type: 'info' });
const currentTime = ref('');
const fps = ref(0);
const videoElements = ref([]);
const targetFPS = 15;
const zoomedIndex = ref(null);
const animationFrameId = ref(null);
const peerConnections = ref(Array(maxCameras).fill(null));

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridCols.value}, 1fr)`
}));

const activeCameras = computed(() => 
  gridCells.value.filter(cell => cell.camera).length
);

function createGridCells(size) {
  return Array(size).fill().map(() => ({
    camera: null,
    zoomed: false
  }));
}

const showNotification = (text, type = 'info', icon = "['fas', 'info-circle']") => {
  notification.value = { show: true, text, icon, type };
  setTimeout(() => (notification.value.show = false), 3000);
};

const startDrag = (event, camera) => {
  event.dataTransfer.setData('camera', JSON.stringify(camera));
};

const addCameraToCell = async (camera, index) => {
  if (gridCells.value[index].camera?.id === camera.id) return;

  // 如果该位置已有摄像头，先移除
  if (gridCells.value[index].camera) {
    removeCamera(index, false);
  }

  gridCells.value[index] = { 
    ...gridCells.value[index], 
    camera,
    zoomed: false
  };

  // 延迟加载视频流，避免同时初始化多个连接
  setTimeout(() => initVideoStream(index, camera), 50);
  showNotification(`Added ${camera.cameraName} to video wall`, 'success', 'fas fa-video');
};

const dropCamera = (event, index) => {
  try {
    const cameraData = event.dataTransfer.getData('camera');
    if (cameraData) {
      const camera = JSON.parse(cameraData);
      addCameraToCell(camera, index);
    }
  } catch (e) {
    console.error('Failed to drop camera:', e);
  }
};

const addCameraToFirstAvailable = (camera) => {
  const emptyIndex = gridCells.value.findIndex(cell => !cell.camera);
  if (emptyIndex !== -1) {
    addCameraToCell(camera, emptyIndex);
  } else {
    showNotification('Video wall is full, please remove some cameras', 'warning', 'fas fa-exclamation-triangle');
  }
};

// 销毁视频流
const destroyVideoStream = (index) => {
  const pc = peerConnections.value[index];
  
  if (pc) {
    try {
      pc.close();
      console.log(`🔴 WebRTC 连接销毁: cell ${index}`);
    } catch (e) {
      console.error('关闭 WebRTC 连接时出错:', e);
    }
    peerConnections.value[index] = null;
  }

  // 清理视频元素
  const video = getVideoElement(index);
  if (video && video.srcObject) {
    try {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
        video.srcObject.removeTrack(track);
      });
      video.srcObject = null;
    } catch (e) {
      console.error('清理视频流时出错:', e);
    }
  }
  
  // 清理服务器资源
  if (gridCells.value[index].camera) {
    const camera = gridCells.value[index].camera;
    const url = `http://localhost:8000/v0/cameras/${camera.id}/streams/1`;
    axios.delete(url)
      .then(res => console.log("Del 成功:", res.data))
      .catch(err => console.error("Del 失败:", err));
  }
};

// 移除摄像头时销毁连接
const removeCamera = (index, showNote = true) => {
  const camera = gridCells.value[index].camera;
  if (camera && showNote) {
    showNotification(`Removed ${camera.cameraName}`, 'info', 'fas fa-trash-alt');
  }

  destroyVideoStream(index); 
  gridCells.value[index] = { camera: null, zoomed: false };
};

// 清空所有摄像头
const clearAll = () => {
  gridCells.value.forEach((_, index) => {
    destroyVideoStream(index); 
    gridCells.value[index] = { camera: null, zoomed: false };
  });
  showNotification('Video wall cleared', 'info', 'fas fa-broom');
};

const prevGridCols = ref(null); // 记录放大前布局

const changeLayout = (cols) => {
  if (gridCols.value === cols) return;
  
  // 如果正在放大，先退出放大
  if (zoomedIndex.value !== null) {
    zoomedIndex.value = null;
    prevGridCols.value = null;
  }

  const newSize = cols * cols;
  const oldSize = gridCells.value.length;

  // 1️⃣ 记录原来摄像头列表
  const oldCells = [...gridCells.value];
  const oldPCs = [...peerConnections.value];

  // 2️⃣ 清理多余格子的 WebRTC（被裁掉的）
  if (newSize < oldSize) {
    for (let i = newSize; i < oldSize; i++) {
      destroyVideoStream(i);
    }
  }

  // 3️⃣ 更新布局
  gridCols.value = cols;
  gridCells.value = [];
  peerConnections.value = [];

  // 4️⃣ 先保留前 newSize 个摄像头 & 连接
  for (let i = 0; i < newSize; i++) {
    if (oldCells[i] && oldCells[i].camera) {
      gridCells.value.push(oldCells[i]);
      peerConnections.value.push(oldPCs[i] || null);
    } else {
      gridCells.value.push({ camera: null, zoomed: false });
      peerConnections.value.push(null);
    }
  }

  // 5️⃣ 如果是扩容布局，直接补空格子
  while (gridCells.value.length < newSize) {
    gridCells.value.push({ camera: null, zoomed: false });
    peerConnections.value.push(null);
  }

  showNotification(`Switched to ${cols}×${cols} layout`, 'success', 'fas fa-th');
};

const zoomCell = (index) => {
  if (zoomedIndex.value === index) {
    // 当前已放大，再点同一个 -> 恢复布局
    zoomedIndex.value = null;
    if (prevGridCols.value !== null) {
      gridCols.value = prevGridCols.value;
      prevGridCols.value = null;
    }
  } else {
    // 放大
    prevGridCols.value = gridCols.value; // 保存原布局
    zoomedIndex.value = index;
    gridCols.value = 1; // 放大成单屏
  }
};

// 获取视频元素
const getVideoElement = (index) => {
  return videoElements.value.find(el => parseInt(el.dataset.index) === index);
};

// 初始化视频流
const initVideoStream = async (index, camera) => {
  // 清理旧连接
  destroyVideoStream(index);

  const video = getVideoElement(index);
  if (!video) return;

  // 创建新的WebRTC连接
  try {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnections.value[index] = pc;

    pc.addTransceiver('video', { direction: 'recvonly' });

    pc.ontrack = (event) => {
      if (!video.srcObject) {
        video.srcObject = new MediaStream();
      }
      event.streams[0].getTracks().forEach(track => {
        video.srcObject.addTrack(track);
      });
      
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
    };

    pc.onicecandidate = event => {
      if (!event.candidate) {
        const url = `http://localhost:8000/v0/cameras/${camera.id}/streams/1`;
        const data = {
          username: camera.cameraAccount,
          password: camera.cameraPassword,
          source_url: `rtsp://${camera.cameraAccount}:${camera.cameraPassword}@${camera.cameraIp}:${camera.cameraPort}`
        };

        axios.post(url, data, { headers: { "Content-Type": "application/json" }})
          .then(() => {
            const sdpUrl = `http://localhost:8000/v0/cameras/${camera.id}/streams/1/sdp`;
            axios.post(sdpUrl, pc.localDescription.sdp, {
              headers: { "Content-Type": "text/plain" }
            })
            .then(res => pc.setRemoteDescription({
              type: "answer",
              sdp: res.data
            }))
            .catch(err => console.error("SDP POST 失败:", err));
          })
          .catch(err => console.error("POST 失败:", err));
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log(`🔵 WebRTC 连接创建: cell ${index}`);

  } catch (e) {
    console.error('初始化视频流失败:', e);
    showNotification(`Failed to load ${camera.cameraName}`, 'warning', 'fas fa-exclamation-triangle');
  }
};

// 简单的FPS计算器
let frameCount = 0, lastFpsUpdate = 0;
const updateFps = () => {
  frameCount++;
  const now = performance.now();
  if (now - lastFpsUpdate >= 1000) {
    fps.value = frameCount;
    frameCount = 0;
    lastFpsUpdate = now;
  }
  animationFrameId.value = requestAnimationFrame(updateFps);
};

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString();
};

// 页面可见性处理
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // 页面隐藏时暂停视频
    videoElements.value.forEach(video => {
      if (video && !video.paused) video.pause();
    });
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  } else {
    // 页面显示时恢复视频
    videoElements.value.forEach(video => {
      if (video && video.paused) video.play().catch(e => console.log('视频恢复播放失败:', e));
    });
    if (!animationFrameId.value) {
      animationFrameId.value = requestAnimationFrame(updateFps);
    }
  }
};

const currentPage = ref(1)
const totalPage = ref(1)
const perPage = 10
const fetchCameras = async (page = 1, search = '') => {
  currentPage.value = page;
  const params = { page, size: perPage, name: search };
  const res = await getCameras(params);
  availableCameras.value = res.list;
  totalPage.value = Math.ceil(res.total/perPage);
};

const onSearch = (term) => {
  fetchCameras(1, term);
};

// 生命周期
onMounted(() => {
  fetchCameras();
  updateTime();
  setInterval(updateTime, 1000);
  
  // 启动FPS计数器
  animationFrameId.value = requestAnimationFrame(updateFps);
  
  // 添加页面可见性监听
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  // 清理所有资源
  gridCells.value.forEach((_, index) => destroyVideoStream(index));
  
  // 清理事件监听
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  
  // 停止动画帧
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
});
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
  0% { border-color: rgba(100, 150, 255, 0.4); }
  50% { border-color: rgba(100, 180, 255, 0.7); }
  100% { border-color: rgba(100, 150, 255, 0.4); }
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
  transition: transform 0.3s ease, opacity 0.3s ease;
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
</style>