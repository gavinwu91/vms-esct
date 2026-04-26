<template>
  <div class="title">
    <h3>Portraits</h3>
    <div class="more" @click="handleMore('/')">More>></div>
  </div>
  <div class="section_content">
    <div class="left_card">
      <ul>
        <li v-for="item in pieData" :key="item.id">{{ item.name }}:
          <span>{{ item.value.toLocaleString() }}</span></li>
      </ul>
    </div>
    <div class="right_card">
      <echarts-pie :data="pieData" :size="500" />
    </div>
  </div>

</template>
<script setup lang="ts">
import {PieItem} from "@/utils/echarts";
import {useRouter} from "vue-router";
const router = useRouter()
function handleMore(path){
  router.push(path)
}
const pieData=ref<PieItem[]>([
  {id: 1, name: 'Face', value: 9409802 },
  {id: 2, name: 'Vehicle', value: 469516 }
])
</script>
<style lang="scss" scoped>
@use '@/styles/dashboard.scss';
</style>
