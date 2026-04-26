<template>
  <div class="login-container">
    <!-- 背景装饰元素 -->
    <div class="tech-bg-overlay"></div>
    <div class="scanning-line"></div>
    <div class="corner-accents top-left"></div>
    <div class="corner-accents top-right"></div>
    <div class="corner-accents bottom-left"></div>
    <div class="corner-accents bottom-right"></div>

    <div class="form-wrapper">
      <div class="glass-card">
        <div class="card-glow"></div>
        <login-form />
      </div>
      
      <!-- 底部版权/装饰 -->
      <div class="footer-decoration">
        <span class="system-status">SYSTEM STATUS: OPERATIONAL</span>
        <span class="version-tag">VMS-ESCT PRO v4.2.0</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at 50% 50%, #0a192f 0%, #020617 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background-image: 
      linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    transform: rotate(15deg);
    top: -50%;
    left: -50%;
    pointer-events: none;
  }
}

.tech-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.08) 0%, transparent 40%);
  pointer-events: none;
}

.scanning-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), transparent);
  top: -10%;
  left: 0;
  animation: scan 8s linear infinite;
  z-index: 1;
}

@keyframes scan {
  0% { top: -10%; opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { top: 110%; opacity: 0; }
}

.form-wrapper {
  position: relative;
  z-index: 10;
  width: 440px;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
}

.corner-accents {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: rgba(56, 189, 248, 0.4);
  border-style: solid;
  pointer-events: none;
  z-index: 5;

  &.top-left { top: 40px; left: 40px; border-width: 2px 0 0 2px; }
  &.top-right { top: 40px; right: 40px; border-width: 2px 2px 0 0; }
  &.bottom-left { bottom: 40px; left: 40px; border-width: 0 0 2px 2px; }
  &.bottom-right { bottom: 40px; right: 40px; border-width: 0 2px 2px 0; }
}

.footer-decoration {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding: 0 10px;
  
  span {
    font-size: 10px;
    color: rgba(148, 163, 184, 0.5);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
  
  .system-status::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    margin-right: 8px;
    box-shadow: 0 0 8px #10b981;
  }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<script setup lang="ts">
import { LoginForm } from "@/views/Login/components";
</script>
