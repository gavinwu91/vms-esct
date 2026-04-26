<template>
  <el-dialog
    v-model="visible"
    :title="props.camera?.cameraName"
    :modal-append-to-body="false"
    custom-class="camera-dialog"
    destroy-on-close
  >
    <div class="video-container" v-loading="loading">
      <video ref="videoElements" autoplay muted playsinline controls class="native-video"></video>
    </div>
    <!-- <template #footer>
        <div class="dialog-footer">
          <button type="primary">download</button>
        </div>
      </template> -->
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import axios from 'axios'
import * as authUtil from '@/utils/auth'

import { config } from '@/utils/runtimeConfig'
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
const pcValue = ref(null)
const videoElements = ref(null)
const loading = ref(true)
const MAX_RETRY = 3
let retryCount = 0

const getVideoUrl = async () => {
  try {
    loading.value = true
    await nextTick()
    const video = videoElements.value
    let camera = props.camera
    // const pc = new RTCPeerConnection({
    //   iceServers: [{ urls: 'turn:192.168.88.191:3478', username: 'user', credential: 'pass' }]
    // })
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: `${config.STUN_SERVER_URL}` },
        { urls: 'stun:stun.l.google.com:19302' }
        // { urls: 'stun:192.168.200.217:3478' }
      ],
      // 关键配置优化
      iceTransportPolicy: 'all', // 允许所有传输方式
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 10
    })

    pcValue.value = pc

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

    pc.ontrack = (event) => {
      if (!video.srcObject) {
        video.srcObject = new MediaStream()
      }

      event.streams[0]?.getTracks()?.forEach((track) => {
        video.srcObject.addTrack(track)
      })
      loading.value = false

      video.muted = true
      video.playsInline = true
      video.autoplay = true
    }

    const sendSDPRequest = async (token, maxRetries = 10, retryDelay = 500) => {
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
      if (!event.candidate) {
        const url = `${config.PLAY_SERVER_URL}/v0/cameras/${camera.id}/streams/1`
        let token = camera.id + authUtil.getAccessToken()
        const data = {
          session_id: token,
          username: camera.cameraAccount,
          password: camera.cameraPassword,
          source_url: `rtsp://${camera.cameraIp}:${camera.cameraPort}`,
          retina_url: `rtsp://${camera.cameraAccount}:${camera.cameraPassword}@${camera.cameraIp}:${camera.cameraPort}`
        }

        axios
          .post(url, data, { headers: { 'Content-Type': 'application/json' } })
          .then(() => {
            sendSDPRequest(token).then((success) => {
              if (!success) {
                console.error('SDP POST 失败:', err)
              }
            })
            // const sdpUrl = `${config.PLAY_SERVER_URL}/v0/cameras/${camera.id}/streams/1/sdp`
            // axios
            //   .post(
            //     sdpUrl,
            //     { session_id: token, sdp: pc.localDescription.sdp },
            //     {
            //       headers: { 'Content-Type': 'text/plain' },
            //       timeout: 15000
            //     }
            //   )
            //   .then((res) => {
            //     console.log('rerererere: ', res)

            //     let answerSdp = res.data.sdp

            //     // 如果返回的是 base64 编码的 SDP，需要解码
            //     if (answerSdp && !answerSdp.startsWith('v=')) {
            //       try {
            //         console.log('检测到 base64 编码的 SDP，正在解码...')
            //         // 解码 base64
            //         const decodedSdp = atob(answerSdp)
            //         console.log('解码后的 SDP 长度:', decodedSdp.length)
            //         console.log('解码后的 SDP 前100字符:', decodedSdp.substring(0, 100))

            //         // 验证解码后的 SDP 格式
            //         if (decodedSdp.startsWith('v=')) {
            //           answerSdp = decodedSdp
            //           console.log('SDP 解码成功，格式正确')
            //         } else {
            //           console.warn('解码后的 SDP 格式不正确，尝试直接使用')
            //         }
            //       } catch (decodeError) {
            //         console.warn('Base64 解码失败，尝试直接使用原始 SDP:', decodeError)
            //       }
            //     }

            //     // 验证 SDP 格式
            //     if (!answerSdp || !answerSdp.startsWith('v=')) {
            //       throw new Error(
            //         `无效的 SDP 格式: ${answerSdp ? answerSdp.substring(0, 50) + '...' : '空'}`
            //       )
            //     }

            //     console.log('设置远程 SDP，长度:', answerSdp.length)
            //     pc.setRemoteDescription({
            //       type: 'answer',
            //       sdp: answerSdp
            //     })
            //   })
            //   .catch((err) => console.error('SDP POST 失败:', err))
          })
          .catch((err) => {
            console.error('POST 失败:', err)
            if (retryCount < MAX_RETRY) {
              retryCount++
              setTimeout(() => {
                getVideoUrl()
              }, 30000)
              console.log('retry count:', retryCount)
            } else {
              console.error('POST 失败:', err)
            }

            // console.error('POST 失败:', err)
          })
      }
    }

    // const offer = await pc.createOffer()
    // await pc.setLocalDescription(offer)

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })

      await pc.setLocalDescription(offer)

      // 设置超时保护
      setTimeout(() => {
        if (pc.iceConnectionState === 'checking') {
          console.log('ICE connection taking too long, restarting...')
          pc.restartIce()
        }
      }, 30000)
    } catch (err) {
      console.error('创建 offer 失败:', err)
      loading.value = false
    }
  } catch (e) {
    console.error('初始化视频流失败:', e)
  }
}

const destroyHls = () => {
  const pc = pcValue.value

  if (pc) {
    try {
      pc.close()
    } catch (e) {
      console.error('关闭 WebRTC 连接时出错:', e)
    }
  }

  // 清理视频元素
  const video = videoElements.value
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

  // 清理服务器资源
  if (props.camera) {
    let token = props.camera.id + authUtil.getAccessToken()
    const url = `${config.PLAY_SERVER_URL}/v0/cameras/${props.camera.id}/streams/1?session_id=${token}`
    axios
      .delete(url)
      .then((res) => console.log('Del 成功:', res.data))
      .catch((err) => console.error('Del 失败:', err))
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
  // destroyHls()
})
</script>

<style scoped>
.video-container {
  position: relative;
  height: 60vh;
  overflow: hidden;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.native-video {
  width: 100%;
  height: calc(100% - 40px);
  object-fit: cover;
  background: #000;
  transform: translateZ(0);
}

.camera-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
