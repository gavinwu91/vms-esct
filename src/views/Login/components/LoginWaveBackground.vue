<template>
  <div class="login-wave-background">
    <!-- 波浪背景 -->
    <div class="wave-container">
      <!-- Canvas波浪 -->
      <canvas ref="waveCanvas" class="wave-canvas"></canvas>
    </div>

    <!-- 插槽内容 -->
    <div class="content-slot">
      <slot></slot>
    </div>
  </div>
</template>

<script>
// 登录页面专用的波浪背景组件
export default {
  name: 'LoginWaveBackground',
  data() {
    return {
      // 波浪配置
      waveConfig: {
        color: 'var(--accent-primary)',
        height: 0.6,
        speed: 0.05,
        amplitude: 80,
        frequency: 3
      },
      // 背景配置
      backgroundConfig: {
        gradient: 'var(--bg-primary)'
      },
      // 粒子配置
      particles: [],
      animationId: null,
      time: 0,
      isVisible: true,
      isActive: false
    }
  },
  // created() {
  //   // 页面加载后波浪动画一直播放
  //   this.startAnimation()
  // },
  mounted() {
    this.setupVisibilityListener()
    this.setupResizeListener()
    this.setupAnimationControlListener()
    this.initParticles()
    // 页面加载后波浪动画一直播放
    this.startAnimation()
  },
  beforeUnmount() {
    this.stopAnimation()
    this.removeVisibilityListener()
    this.removeResizeListener()
    this.removeAnimationControlListener()
  },
  methods: {
    // 设置页面可见性监听
    setupVisibilityListener() {
      this.handleVisibilityChange = () => {
        this.isVisible = !document.hidden
        if (this.isVisible && !this.isActive) {
          this.startAnimation()
        } else if (!this.isVisible && this.isActive) {
          this.stopAnimation()
        }
      }
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    },

    // 移除页面可见性监听
    removeVisibilityListener() {
      if (this.handleVisibilityChange) {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      }
    },

    // 设置窗口大小变化监听
    setupResizeListener() {
      this.handleResize = () => {
        this.initParticles()
      }
      window.addEventListener('resize', this.handleResize)
    },

    // 移除窗口大小变化监听
    removeResizeListener() {
      if (this.handleResize) {
        window.removeEventListener('resize', this.handleResize)
      }
    },

    // 设置动画控制监听
    setupAnimationControlListener() {
      this.handleAnimationControl = (event) => {
        const {paused} = event.detail
        if (paused) {
          this.stopAnimation()
        } else {
          this.startAnimation()
        }
      }
      window.addEventListener('toggleBackgroundAnimation', this.handleAnimationControl)
    },

    // 移除动画控制监听
    removeAnimationControlListener() {
      if (this.handleAnimationControl) {
        window.removeEventListener('toggleBackgroundAnimation', this.handleAnimationControl)
      }
    },

    // 开始动画
    startAnimation() {
      if (!this.isActive && this.isVisible) {
        this.isActive = true
        this.drawWave()
      }
    },

    // 停止动画
    stopAnimation() {
      this.isActive = false
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },

    // 初始化粒子
    initParticles() {
      this.particles = []
      for (let i = 0; i < 30; i++) {
        this.particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.7 + 0.3
        })
      }
    },

    // 绘制波浪
    drawWave() {
      if (!this.isVisible || !this.isActive) {
        return
      }

      const canvas = this.$refs.waveCanvas
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 设置canvas尺寸
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        return
      }

      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // 清空画布
      ctx.clearRect(0, 0, rect.width, rect.height)

      // 波浪参数
      const width = rect.width
      const height = rect.height
      const baseWaveHeight = height * this.waveConfig.height
      const waveY = height - baseWaveHeight

      // 创建波浪路径 - 确保没有边框
      ctx.beginPath()
      ctx.moveTo(0, height)
      ctx.strokeStyle = 'transparent'
      ctx.lineWidth = 0

      // 绘制波浪
      const step = Math.max(2, Math.floor(width / 100))
      const points = []

      for (let x = 0; x <= width; x += step) {
        const waveX = x / width

        // 波浪计算 - 增强动态效果
        const wave1 = Math.sin(waveX * Math.PI * this.waveConfig.frequency + this.time * 0.8) * this.waveConfig.amplitude
        const wave2 = Math.sin(waveX * Math.PI * (this.waveConfig.frequency * 1.5) + this.time * 0.6) * (this.waveConfig.amplitude * 0.7)
        const wave3 = Math.cos(waveX * Math.PI * (this.waveConfig.frequency * 0.8) + this.time * 0.4) * (this.waveConfig.amplitude * 0.4)

        const y = waveY + wave1 + wave2 + wave3
        points.push({x, y})
      }

      // 绘制第一层波浪
      ctx.beginPath()
      ctx.moveTo(0, height)
      points.forEach(point => ctx.lineTo(point.x, point.y))
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      // 获取当前主题的波浪颜色并创建渐变
      const waveColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()
      const gradient = ctx.createLinearGradient(0, waveY, 0, height)
      gradient.addColorStop(0, waveColor + '80') // 半透明
      // gradient.addColorStop(1, waveColor + '40') // 更透明

      ctx.fillStyle = gradient
      ctx.fill()

      // 添加光晕效果 - 移除边框
      ctx.shadowColor = waveColor
      ctx.shadowBlur = 20
      ctx.fill()
      ctx.shadowBlur = 0

      // 确保没有边框
      ctx.strokeStyle = 'transparent'
      ctx.lineWidth = 0

      // 绘制第二层波浪（更小的波浪）
      ctx.beginPath()
      ctx.moveTo(0, height)

      const points2 = []
      for (let x = 0; x <= width; x += step) {
        const waveX = x / width

        // 第二层波浪计算
        const wave4 = Math.sin(waveX * Math.PI * 4 + this.time * 1.2) * 30
        const wave5 = Math.cos(waveX * Math.PI * 2.5 + this.time * 0.9) * 20

        const y2 = waveY + wave4 + wave5
        points2.push({x, y: y2})
      }

      points2.forEach(point => ctx.lineTo(point.x, point.y))
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      // 第二层波浪使用更透明的颜色
      const gradient2 = ctx.createLinearGradient(0, waveY, 0, height)
      gradient2.addColorStop(0, waveColor + '40') // 更透明
      gradient2.addColorStop(1, waveColor + '20') // 最透明

      ctx.fillStyle = gradient2
      ctx.fill()

      // 确保第二层波浪也没有边框
      ctx.strokeStyle = 'transparent'
      ctx.lineWidth = 0

      // 绘制粒子
      this.drawParticles(ctx)

      // 更新时间
      this.time += this.waveConfig.speed

      // 继续动画
      if (this.isVisible && this.isActive) {
        this.animationId = requestAnimationFrame(this.drawWave)
      }
    },

    // 绘制粒子
    drawParticles(ctx) {
      const waveColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()

      this.particles.forEach(particle => {
        // 更新粒子位置
        particle.x += particle.vx
        particle.y += particle.vy

        // 边界检查
        if (particle.x < 0 || particle.x > window.innerWidth) {
          particle.vx = -particle.vx
        }
        if (particle.y < 0 || particle.y > window.innerHeight) {
          particle.vy = -particle.vy
        }

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = waveColor + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // 添加粒子光晕
        ctx.shadowColor = waveColor
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0

        // 确保粒子没有边框
        ctx.strokeStyle = 'transparent'
        ctx.lineWidth = 0
      })
    }
  }
}
</script>

<style>
:root {
  --bg-primary: #111827;
  --bg-secondary: rgba(34, 41, 55, 0.8);
  --accent-primary: #60a5fa;
}
</style>

<style scoped>
.login-wave-background {
  position: relative;
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  animation: backgroundShift 20s ease-in-out infinite;
}
@keyframes backgroundShift {
  0%, 100% {
    background: var(--bg-primary);
  }
  50% {
  }
}

/* 波浪容器 */
.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

/* Canvas波浪样式 */
.wave-canvas {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 内容插槽 - 登录页面专用 */
.content-slot {
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
