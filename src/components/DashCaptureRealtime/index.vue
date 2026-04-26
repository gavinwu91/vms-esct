<template>
  <div class="body">
    <div class="title">
      <h3>Face Captures</h3>
      <div class="more" @click="handleMore('/retrieval')">More>></div>
    </div>
    <div class="imagePanel">
      <el-image v-for="(item,index) in captureList" :key="index" :src="item.captureUrl" class="image" @click="handleSearch(item)"/>
    </div>
  </div>
</template>
<script setup lang="ts">
  import {faceCaptureCount, page} from "@/api/retrieval";
import {callWithDelay} from "@/utils";
import dayjs from "dayjs";
import {useRouter} from "vue-router";
const router = useRouter()
function handleMore(path){
  router.push(path)
}

const captureList = ref([])

const startTime=ref(null);
const endTime=ref(null);
function handleSearch(item){
  // console.log("handleSearch:",item)
  router.push(`/retrieval?imageUrl=${item.captureUrl}`)
}
let stopTimer:(()=>void)=null;
onMounted(()=>{
  if(!stopTimer){
    // setInterval(loadData,1000)
    stopTimer=callWithDelay(()=>{
      //查询人脸抓拍
      page({searchType:10,pageSize:8,sort:"capture_time",startTime:startTime.value}).then(res=>{
        // console.log("人脸抓拍:",res);
        if(res.length>0){
          captureList.value.unshift(...res);
          startTime.value=dayjs(res[0].captureTime).add(1,"second").format("YYYY-MM-DD HH:mm:ss");
        }
        if( captureList.value.length>10){
          captureList.value.length=10;
        }
      }).catch(err=>{
        console.error(err)
      });
    },5000)
  }
})
onUnmounted(()=>{
  if(stopTimer){
    stopTimer();
    stopTimer=null;
  }
})
</script>
<style lang="scss" scoped>


.body{
  width: 100%;
  height:100%;
  overflow:hidden;
  h3 {
    font-size: 16px;
    color: #fff;
  }

  .more {
    cursor: pointer;
    font-size: 14px;
    color:#ffff00;
  }
  .more:hover {
    opacity: 0.8;
  }
  .title{
    display: flex;
    width:100%;
    justify-content: space-between;
    align-items: center;
    height:30px;
    padding-left: 5px;
  }
  .imagePanel {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin-top:15px;
    overflow:hidden;
    .image {
      margin: 0 5px;
      height: 110px;
      width: 100px;
      min-width: 100px;
      cursor: pointer;
    }
  }
}


</style>
