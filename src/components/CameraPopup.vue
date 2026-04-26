
<template>
    <div class="popup-wrapper">
        <el-card 
        class="camera-card" 
        shadow="hover" 
        :body-style="{ padding: '0px' }"
      >
        <div class="image-container" @click="popPlay(camera)">
          <el-image 
            :src="getImageUrl(camera.cameraIp)" 
            fit="cover" 
            class="preview-image"
            lazy
          >
            <template #placeholder>
              <div class="image-skeleton">
                <el-icon :size="40"><Picture /></el-icon>
                <p>loading...</p>
              </div>
            </template>
            <template #error>
              <div class="image-error">
                <el-icon :size="40"><Warning /></el-icon>
                <p></p>
              </div>
            </template>
          </el-image>
          <div class="hover-overlay">
            <el-icon :size="40"><VideoPlay /></el-icon>
          </div>
        </div>
        
        <div class="card-footer">
          <div class="camera-info">
            <h4>{{ camera.cameraName }}</h4>
            <div class="meta-info">
              <el-tooltip content="IP">
                <el-tag size="small">{{ camera.cameraIp }}</el-tag>
              </el-tooltip>
              <el-tooltip content="Status">
                 <el-tag 
                   size="small" 
                   :type="camera.runningStatus === 'online' ? 'success' : 'danger'"
                 >
                  {{ camera.runningStatus? 'Online':'Offline' }}
                 </el-tag>
              </el-tooltip>
              <el-tooltip content="Capture Record">
                <!-- <el-tag type="info" size="small">Capture</el-tag> -->
                <el-link type="success" size="small" :href="getCaptureUrl(camera)" target="_blank"><el-icon><Expand/></el-icon></el-link>
              </el-tooltip>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div>
        <!-- 视频播放对话框 -->
        <el-dialog 
          v-model="videoDialogVisible" 
          @close="closeLive;videoDialogVisible = false"
          :title="currentCamera?.name" 
          width="80%"
          fullscreen
          destroy-on-close
        >
          <div class="video-container">
            <iframe
            ref="liveIfream"
            class="no-dark"
            allowfullscreen="allowfullscreen"
            :src="getVideoUrl(currentCamera)"
            style="width: 100%;height: 100%;border: none"></iframe>
  
          </div>
          <!-- <template #footer>
            <div class="dialog-footer">
              <button type="primary">download</button>
            </div>
          </template> -->
        </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref } from 'vue';
  import {
    Close,
    Menu,
    VideoCamera,
    FolderOpened,
    Search,
    VideoPlay,
    More,
    Picture,
    Warning,
    Histogram,
    Setting,
    MapLocation,
    Grid,
    Expand
  } from '@element-plus/icons-vue'
  
  const videoDialogVisible = ref(false)
  const currentCamera = ref(null)

  const props = defineProps({
    camera: {
      type: Object,
      required: true
    },
    position: {
      type: Object, // { x: number, y: number } — pixel position on the map
      default: () => ({ x: 0, y: 0 })
    }
  });

  const openVideoDialog = (camera) => {
    console.log("camera12312312 ",camera)
    if(camera.status !== 'online') {
      ElMessage.warning('该设备当前离线')
      return
    }
    currentCamera.value = camera
    videoDialogVisible.value = true
  }
  
    // 获取本地图片路径
    const getImageUrl = (path) => {
        return new URL(`/public/images/${path}.png`, import.meta.url).href
    }
    
    const getVideoUrl = (row) => {
      let password = encodeURIComponent(row.cameraPassword);
      let finalPassword = encodeURIComponent(password);
      let url = "https://192.168.200.165:8084/player/" + row.cameraIp + "?stream=rtsp://" + row.cameraAccount + ":" + finalPassword + "@" + row.cameraIp + ":554"
      return url;
    } 
    const closeLive = () => {
        if (this.$refs.liveIfream) {
          this.$refs.liveIfream.contentWindow.postMessage({action: "close"}, "*")
        }
      }
    const getCaptureUrl = (camera) => {
        if (camera.ctype === '10') {
        return `https://192.168.80.185:8443/vms/#/vehicleSearch?platform=20&cid=${camera.cid}&gid=${camera.gid}`;
        } else if (camera.ctype === '20') {
        return `http://192.168.80.185:8080/vms/#/captureSearch?cid=${camera.cid}&gid=${camera.gid}`;
        } else {
        return '#'
        }
    }
  const emit = defineEmits(['play']);

  const popPlay= (camera) => {
    emit("play", camera);
  }
  </script>
  
  <style scoped>
  .video-container {
    position: relative;
    height: 80vh;
    background: black;

  }
  .camera-card {
    margin-bottom: 20px;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .image-container {
      position: relative;
      height: 200px;
      cursor: pointer;

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .hover-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        .el-icon {
          color: white;
        }
      }

      &:hover .hover-overlay {
        opacity: 1;
      }

      .image-skeleton, .image-error {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        color: #909399;

        p {
          margin: 8px 0 0;
          font-size: 12px;
        }
      }
    }

    .card-footer {
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .camera-info {
        h4 {
          margin: 0 0 8px;
          font-size: 14px;
          color: #303133;
        }

        .meta-info {
          display: flex;
          gap: 8px;
        }
      }

      .el-dropdown {
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;

        &:hover {
          background: #f5f7fa;
        }
      }
    }
  }
  </style>