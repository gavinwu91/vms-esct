<template>
  <div class="title"  >
    <h3>Vehicle alarm</h3>
    <div class="more" @click="handleMore('/alarm/alarm/vehicle/history')">More>></div>
  </div>
  <div  class="section_content"  style="width: 100%;">
    <div style="width: 100%;">
      <div v-for="item in alarmList" :key="item.id" class="alarmDiv">
         <div class="picDiv">
           <el-image :src="'https://192.168.80.185:8443/vehicle_img/'+item.fullUrl" class="image"/>
           <el-image :src="'https://192.168.80.185:8443/vehicle_img/'+item.cropUrl" class="image"/>
         </div>
         <div class="nameDiv">
           <div class="name1">{{item.cameraName}}</div>
           <div class="name2">{{dayjs(item.captureTime).format("YYYY-MM-DD HH:mm:ss")}}</div>
         </div>


      </div>
    </div>
  </div>

</template>
<script setup lang="ts">
import {Position} from "@element-plus/icons-vue";
import {AlarmFaceMsgApi} from "@/api/alarmfacemsg";
import {callWithDelay} from "@/utils";
import {useRouter} from "vue-router";
import {useCache} from "@/hooks/web/useCache";
import {AlarmPlateMsgApi} from "@/api/alarmmsg/plate";
import dayjs from "dayjs";
const { wsCache } = useCache()


const router = useRouter()
function handleMore(path){
  router.push(path)
}

function getAssetImageUrl(path){
  console.log("path:",path)
  return new URL(`${path}`, import.meta.url).href
}
const emit = defineEmits(['countChange','viewAlarm']) // 定义 success 事件，用于操作成功后的回调
const count=ref(0)
let stopTimer:(()=>void)=null;
const alarmList=ref([])
const startTime=ref(null);
onMounted(()=>{
  alarmList.value=wsCache.get("alarmList")||[];
  // console.log("cacheVehicleAlarmList:",alarmList.value)
  if(!stopTimer) {
    startTime.value=dayjs(new Date()).add(-1,"day").format("YYYY-MM-DD 00:00:00")
    let endTime=dayjs(new Date()).format("YYYY-MM-DD 23:59:59")
    stopTimer=callWithDelay(() => {
      AlarmPlateMsgApi.getAlarmPlateMsgPage({
        startTime: startTime.value,
        endTime: endTime,
        pageSize: 2
      })
        .then(res => {
          console.log("getAlarmPlateMsgPage:",res)
          if (res.list != null&&res.list.length>0) {
            alarmList.value.unshift(...res.list);
            startTime.value = dayjs(res.list[0].captureTime).add(1, "second").format("YYYY-MM-DD HH:mm:ss");

            if (alarmList.value.length > 2) {
              alarmList.value.length = 2;
            }
            wsCache.set("alarmList:",unref(alarmList.value))
            if (count.value != res.total) {
              count.value = count.value + res.total;
              emit('countChange', count.value);
            }
          }
        }).catch(err => {
        console.log("err:", err)
      })
    }, 5000)
  }

  //查询告警

})
onUnmounted(()=>{
  if(stopTimer){
    stopTimer();
    stopTimer=null;
  }
})
</script>
<style lang="scss" scoped>
@use '@/styles/dashboard.scss';

.alarmDiv{
  display: flex;
  flex-direction: column;
  position:relative;
  width: 100%;
  margin-top:5px;
  .scoreDiv{
    position: absolute;
    top: 98px;
    width: 50px;
    left: 110px;
    display: flex;
    justify-content: center;
    color: #ffffff;
    background-image: url("@/assets/svgs/red_back2.svg");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    .score{
      background-image: url("@/assets/svgs/red_back3.svg");
      background-repeat: no-repeat;
      background-size: 90% 90%;
    }
  }
  .picDiv{
    display: flex;
    height: 115px;
    .image{
      flex: 1;
    }
  }
  .nameDiv{
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }
}
</style>
