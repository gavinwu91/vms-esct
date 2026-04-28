<template>
  <div class="body animated-bg">
    <div class="form">
      <login-form/>
    </div>
  </div>
</template>
<style scoped lang="scss">
.body{
  background-image: url("@/assets/imgs/bg.jpg");
  height: 100%;
  width: 100%;
  position:relative;
  opacity: 1;
  .form{
    width: 400px;
    padding: 28px 40px 32px 40px;
    z-index: 2;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    color: #ffffff;
    //box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
    //backdrop-filter: blur(5px);
  }
}
</style>
<script setup lang="ts">

import {LoginForm} from "@/views/Login/components";
</script>
