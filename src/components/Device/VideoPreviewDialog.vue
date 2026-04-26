<template>
    <el-dialog
      v-model="visible"
      title="视频预览"
      width="70%"
      top="5vh"
      destroy-on-close
    >
      <div class="video-container">
        <video
          ref="videoPlayer"
          controls
          autoplay
          style="width: 100%; height: 100%;"
        >
          <source :src="videoUrl" type="application/x-mpegURL" />
        </video>
      </div>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, onUnmounted,computed  } from 'vue'
  import Hls from 'hls.js'
  
  const props = defineProps({
    modelValue: Boolean,
    camera: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })
  
  const videoPlayer = ref(null)
  const videoUrl = ref('')
  const hls = ref(null)
  
  // 获取视频流地址
  const getVideoUrl = async () => {
    try {
      // 这里应该是调用API获取视频流地址
      // 模拟返回
      videoUrl.value = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      initHlsPlayer()
    } catch (error) {
      console.error('获取视频流失败:', error)
    }
  }
  
  // 初始化HLS播放器
  const initHlsPlayer = () => {
    if (Hls.isSupported()) {
      hls.value = new Hls()
      hls.value.loadSource(videoUrl.value)
      hls.value.attachMedia(videoPlayer.value)
      hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
        videoPlayer.value.play()
      })
    } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari原生支持HLS
      videoPlayer.value.src = videoUrl.value
      videoPlayer.value.addEventListener('loadedmetadata', () => {
        videoPlayer.value.play()
      })
    }
  }
  
  // 销毁HLS实例
  const destroyHls = () => {
    if (hls.value) {
      hls.value.destroy()
      hls.value = null
    }
  }
  
  // 监听对话框显示状态
  watch(visible, (val) => {
    if (val) {
      getVideoUrl()
    } else {
      destroyHls()
    }
  })
  
  onUnmounted(() => {
    destroyHls()
  })
  </script>
  
  <style scoped>
  .video-container {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    height: 0;
    overflow: hidden;
  }
  
  .video-container video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  </style>