<template>
  <div class="title">
    <h3>Captures</h3>
    <div class="more" @click="handleMore('/')">More>></div>
  </div>
  <div  class="section_content" >
    <div class="left_card">
      <ul>
        <li v-for="item in pieData" :key="item.id">{{item.name}}: <span>{{ item.value.toLocaleString() +'/'+item.value.toLocaleString() }}</span></li>
      </ul>
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
  {id:1,name:'Total',value:644479400 },
  {id:2,name:'Face',value:29263901 },
  {id:3,name:'Vehicle',value:17662272 }
])
onMounted(()=>{

})
</script>
<style lang="scss" scoped>
@use '@/styles/dashboard.scss';
</style>
