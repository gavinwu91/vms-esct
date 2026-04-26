<template>
  <div class="body">
    <div class="title">
      <h3>Vehicle Captures</h3>
      <div class="more" @click="handleMore('/vehicle/index')">More>></div>
    </div>
    <div class="imagePanel">
      <el-image v-for="(item,index) in captureList"
                :key="index"
                :title="item.checkpointName+' '+item.cameraName"
                :src="'https://192.168.80.185:8443/vehicle_img/'+item.imgPath2"
                class="image" @click="handleSearch(item)"/>
    </div>
  </div>
</template>
<script setup lang="ts">

  import {search} from "@/api/vehicle";
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
  const count=ref(0);
  function handleSearch(item){
    // console.log("handleSearch:",item)
    router.push(`/vehicle/index?vehicleCode=${item.licenseCode}`)
  }
  const emit=defineEmits(['countChange'])
  let stopTimer:(()=>void)=null;
  onMounted(()=>{
    // setInterval(loadData,1000)
    if(!stopTimer) {
      startTime.value=dayjs(new Date()).format("YYYY-MM-DD 00:00:00")
      let endTime=dayjs(new Date()).format("YYYY-MM-DD 23:59:59")
      stopTimer=callWithDelay(() => {
        search({
          pageSize: 8,
          times: [startTime.value, endTime],
          "cameraIdList": []
        })
          .then(res => {
            // console.log("车牌抓拍:",res);
            if (res.data.length > 0) {
              captureList.value.unshift(...res.data);
              startTime.value = dayjs(res.data[0].captureTime).add(1, "second").format("YYYY-MM-DD HH:mm:ss");
            }
            if (count.value != res.total) {

              emit("countChange", res.total)
            }
            if (captureList.value.length > 10) {
              captureList.value.length = 10;
            }
          })
          .catch(err => {
            console.error(err)
          });
      }, 5000)
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
    justify-content: space-between;
    width:100%;
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
