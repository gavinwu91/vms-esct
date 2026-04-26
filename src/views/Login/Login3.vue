<template>
  <div class="login-container">
    <canvas ref="skyCanvas" class="bg-canvas"></canvas>

    <div class="login-box">
      <h2>欢迎登录</h2>
      <el-form>
        <el-form-item>
          <el-input v-model="username" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const username = ref('')
const password = ref('')
const skyCanvas = ref(null)

const login = () => {
  console.log('登录', username.value, password.value)
}

onMounted(() => {
  const canvas = skyCanvas.value
  const ctx = canvas.getContext('2d')

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // 云朵对象
  const clouds = Array.from({ length: 8 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.5,
    size: 80 + Math.random() * 60,
    speed: 0.2 + Math.random() * 0.2,
  }))

  // 飞鸟对象
  const birds = Array.from({ length: 5 }, () => ({
    x: Math.random() * canvas.width,
    y: 50 + Math.random() * 200,
    speed: 1 + Math.random() * 0.5,
    wing: 0,
  }))

  let t = 0
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 天空渐变背景
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, '#B0E0FF') // 浅天蓝
    grad.addColorStop(1, '#E6F5FF') // 云白
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制云朵
    clouds.forEach(cloud => {
      cloud.x += cloud.speed
      if (cloud.x > canvas.width + cloud.size) cloud.x = -cloud.size

      drawCloud(cloud.x, cloud.y, cloud.size)
    })

    // 绘制飞鸟
    birds.forEach(bird => {
      bird.x -= bird.speed
      bird.wing = Math.sin(t * 0.2) * 3

      if (bird.x < -30) {
        bird.x = canvas.width + 30
        bird.y = 50 + Math.random() * 200
      }

      drawBird(bird.x, bird.y, bird.wing)
    })

    t += 1
    requestAnimationFrame(draw)
  }

  // 云朵：用多个半圆绘制一团
  function drawCloud(x, y, size) {
    ctx.beginPath()
    const radius = size / 5
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.arc(x + radius * 1.5, y - radius * 0.5, radius * 1.2, 0, Math.PI * 2)
    ctx.arc(x + radius * 3, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fill()
  }

  // 飞鸟：简单贝塞尔线做成 "M" 形
  function drawBird(x, y, wingOffset) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x - 10, y - 10 + wingOffset, x - 20, y)
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + 10, y - 10 + wingOffset, x + 20, y)
    ctx.strokeStyle = 'rgba(60,60,60,0.8)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  draw()
})
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.bg-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: block;
}

.login-box {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  width: 320px;
}
</style>
