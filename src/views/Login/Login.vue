<template>
  <div class="portal-container">
    <!-- 左侧：战术视效区 -->
    <div class="visual-section">
      <div class="map-overlay"></div>
      <div class="data-grid"></div>
      
      <!-- 装饰性数据流 -->
      <div class="system-logs">
        <div v-for="i in 15" :key="i" class="log-line">
          [SEC_OS_v4.2] INITIALIZING_ENCRYPTED_CHANNEL_{{ Math.random().toString(36).substring(7).toUpperCase() }}... OK
        </div>
      </div>

      <div class="hero-content">
        <div class="logo-wrapper">
          <img src="@/assets/imgs/logo.png" class="hero-logo" />
        </div>
        <h1 class="hero-title">VMS-ESCT</h1>
        <p class="hero-desc">GLOBAL INTELLIGENCE SURVEILLANCE PLATFORM</p>
      </div>

      <!-- 左下角状态 -->
      <div class="system-metrics">
        <div class="metric-item">
          <div class="label">CORE_TEMP</div>
          <div class="bar"><div class="fill" style="width: 45%"></div></div>
        </div>
        <div class="metric-item">
          <div class="label">UPLINK_SEC</div>
          <div class="bar"><div class="fill" style="width: 82%"></div></div>
        </div>
      </div>
    </div>

    <!-- 右侧：登录授权区 -->
    <div class="auth-section">
      <div class="auth-panel-glow"></div>
      <div class="auth-wrapper">
        <div class="security-badge">
          <div class="pulse-ring"></div>
          <Icon icon="ep:lock" :size="24" />
        </div>
        <login-form />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.portal-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  background: #020617;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* 左侧视效区 */
.visual-section {
  flex: 1;
  position: relative;
  background: radial-gradient(circle at 30% 50%, #0f172a 0%, #020617 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 80px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url('https://raw.githubusercontent.com/v-v-v/v-v-v/main/world-map.svg'); /* 占位，实际可替换为本地地图SVG */
    background-size: cover;
    opacity: 0.1;
    filter: brightness(0.5) blue;
  }
}

.data-grid {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(circle at 30% 50%, black, transparent 80%);
}

.system-logs {
  position: absolute;
  top: 40px;
  left: 40px;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: rgba(34, 211, 238, 0.3);
  pointer-events: none;
  
  .log-line {
    margin-bottom: 4px;
    animation: logFade 4s infinite linear;
    @for $i from 1 through 15 {
      &:nth-child(#{$i}) { animation-delay: $i * 0.2s; }
    }
  }
}

@keyframes logFade {
  0% { opacity: 0; transform: translateX(-10px); }
  10%, 90% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(10px); }
}

.hero-content {
  position: relative;
  z-index: 5;
  
  .hero-logo {
    width: 80px;
    margin-bottom: 24px;
    filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.6));
  }
  
  .hero-title {
    font-size: 64px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -2px;
    margin: 0;
    line-height: 1;
    background: linear-gradient(to bottom, #fff, rgba(255,255,255,0.5));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .hero-desc {
    font-size: 14px;
    color: #38bdf8;
    letter-spacing: 4px;
    margin-top: 12px;
    font-weight: 300;
  }
}

.system-metrics {
  position: absolute;
  bottom: 60px;
  left: 80px;
  width: 200px;

  .metric-item {
    margin-bottom: 16px;
    .label {
      font-size: 9px;
      color: rgba(148, 163, 184, 0.6);
      margin-bottom: 6px;
      letter-spacing: 1px;
    }
    .bar {
      height: 2px;
      background: rgba(255, 255, 255, 0.05);
      .fill {
        height: 100%;
        background: #38bdf8;
        box-shadow: 0 0 8px #38bdf8;
      }
    }
  }
}

/* 右侧授权区 */
.auth-section {
  width: 500px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5);
}

.auth-wrapper {
  width: 360px;
  position: relative;
}

.security-badge {
  width: 60px;
  height: 60px;
  background: rgba(34, 211, 238, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40px;
  color: #38bdf8;
  position: relative;

  .pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid #38bdf8;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}
</style>

<script setup lang="ts">
import { LoginForm } from "@/views/Login/components";
import { Icon } from '@/components/Icon'
</script>
