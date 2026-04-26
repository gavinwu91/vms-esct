<template>
  <div class="box-card" shadow="hover">
    <iframe :src="extendUrl" frameborder="0"  class="card-iframe"></iframe>
  </div>
</template>
<script setup>
  import {ref} from 'vue'
  const extendUrl = ref('https://192.168.80.185:8443/vms/#/vehicleSearch?platform=20')
</script>

<style scoped>
.box-card {
  width: 100%;
  height: 83vh;
}
.card-iframe {
  width: 100%;
  height: 83vh;
  border-radius: 8px;
}
</style>