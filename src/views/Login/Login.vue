<template>
  <div class="vms-login-portal">
    <!-- 背景层：动态科技格栅 -->
    <div class="vms-bg-base"></div>
    <div class="vms-bg-grid"></div>
    <div class="vms-bg-glow-1"></div>
    <div class="vms-bg-glow-2"></div>

    <!-- 登录表单容器 -->
    <div class="login-panel">
      <div class="panel-border-glow"></div>
      <login-form/>
    </div>

    <!-- 底部版权信息 (可选) -->
    <div class="vms-footer">
      VMS GLOBAL INTELLIGENCE SURVEILLANCE SYSTEM &copy; 2026
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoginForm } from "@/views/Login/components";
</script>

<style scoped lang="scss">
.vms-login-portal {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #010613;
  font-family: 'Inter', sans-serif;
}

/* 基础渐变底色 */
.vms-bg-base {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 50%, #0a1b3d 0%, #010613 100%);
  z-index: 1;
}

/* 科技感格栅 */
.vms-bg-grid {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
  z-index: 2;
}

/* 漂浮的装饰光晕 */
.vms-bg-glow-1, .vms-bg-glow-2 {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  z-index: 3;
}

.vms-bg-glow-1 {
  background: #0ea5e9;
  top: -10%; left: -10%;
  animation: floating 20s infinite alternate ease-in-out;
}

.vms-bg-glow-2 {
  background: #3b82f6;
  bottom: -10%; right: -10%;
  animation: floating 15s infinite alternate-reverse ease-in-out;
}

@keyframes floating {
  from { transform: translate(0, 0); }
  to { transform: translate(100px, 50px); }
}

/* 登录面板精修 */
.login-panel {
  width: 420px;
  padding: 40px;
  position: relative;
  z-index: 10;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 16px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(56, 189, 248, 0.05);
  box-sizing: border-box;

  /* 面板上方的细微高光边框 */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent);
  }
}

.vms-footer {
  position: absolute;
  bottom: 30px;
  width: 100%;
  text-align: center;
  color: rgba(148, 163, 184, 0.3);
  font-size: 10px;
  letter-spacing: 2px;
  z-index: 10;
}
</style>
