<template>
  <div class="title">
    <h3>Documents</h3>
  </div>
  <div  class="section_content" >
    <div class="left_card">
      <ul>
        <li class="link" @click="handleMore('/profiledb')">Portrait: <span class="document_item">{{ formatNumber(faceValue.toFixed(0)) }}</span></li>
        <li class="link" @click="handleMore('/Library/vehicle_db/index')">Vehicle: <span class="document_item">{{ formatNumber(vehicleValue.toFixed(0)) }}</span></li>
      </ul>
    </div>
    <div class="right_card">
      <!--      <echarts-pie :data="pieData" :size="300"/>-->
      <echarts-pie :data="datas" :size="500"  />
    </div>
  </div>

</template>

<script setup lang="ts">
 import {getDocumentTotal} from "@/api/vehicle";
 import {TransitionPresets, useTransition} from "@vueuse/core";
 import {formatNumber} from "@/utils";
 import {useRouter} from "vue-router";
 const router = useRouter()
 function handleMore(path){
   router.push(path)
 }
 const faceCount=ref(0);
 const vehicleCount=ref(0);
 const faceValue = useTransition(faceCount, {
   duration: 2000,
   transition: TransitionPresets.easeOutExpo
 })
 const vehicleValue = useTransition(vehicleCount, {
   duration: 2000,
   transition: TransitionPresets.easeOutExpo
 })

const datas=ref([])

onMounted(()=>{
  getDocumentTotal().then(res=>{
    faceCount.value=res.insight;
    vehicleCount.value=res.vehicle;
     datas.value=[
       {id:1,name:'Personal',value:res.insight},
       {id:2,name:'Vehicle',value:res.vehicle }
     ]
  })
})
</script>
<style lang="scss" scoped>
@use '@/styles/dashboard.scss';
  .document_item{
    padding-left: 5px;
    font-weight: bold;
  }
  .left_card{
    .link{
      cursor: pointer;
    }
    .link:hover{
      color:#ffff00;
    }
  }
</style>
