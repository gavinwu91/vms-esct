<template>
  <div class="title"  >
    <h3>Face alarm</h3>
    <div class="more" @click="handleMore('/alarm/face/alarm/facehistory')">More>></div>
  </div>
  <div  class="section_content"  style="width: 100%;">
    <div style="width: 100%;">
      <div v-for="item in alarmList" :key="item.id" class="alarmDiv">
         <div class="picDiv" @click="openForm(item)">
           <el-image :src="getKsProxyUrl(item.cropUrl)" class="image"/>
           <el-image :src="getKsProxyUrl(item.albumPhotoUrl)" class="image"/>
         </div>
         <div class="nameDiv">
           <div class="name1">{{item.cameraName}}</div>
           <div class="name2">{{item.albumName}}</div>
         </div>
        <div class="scoreDiv">
          <div class="score2">
            {{item.score}}
          </div>
        </div>

      </div>
    </div>
  </div>

</template>
<script setup lang="ts">
import {Position} from "@element-plus/icons-vue";
import {AlarmFaceMsgApi} from "@/api/alarmfacemsg";
import {getKsProxyUrl} from "@/api/common";

import {callWithDelay} from "@/utils";
import {useRouter} from "vue-router";
import {ref} from "vue";
import {surOptionList as getLibraryOptionList} from "@/api/library";
import dayjs from "dayjs";
import {useCache} from "@/hooks/web/useCache";
const { wsCache } = useCache()

const openForm = (obj: Object, index?: number) => {
  console.log("openForm:",obj)
  emit('viewAlarm',obj)
}
const router = useRouter()
function handleMore(path){
  router.push(path)
}



function getAssetImageUrl(path){
  console.log("path:",path)
  return new URL(`${path}`, import.meta.url).href
}



const albumIds=ref([]);
const initLibraryOption =   async () => {
  const libraryResult = await getLibraryOptionList()
  console.log("libraryResult:", libraryResult)
  albumIds.value = libraryResult.map(a => a.platformLibraryId);
}

const emit = defineEmits(['countChange','viewAlarm']) // 定义 success 事件，用于操作成功后的回调
const count=ref(0)
const startTime=ref(null)
let stopTimer:(()=>void)=null;
const alarmList=ref([])

onMounted(async ()=>{
  await initLibraryOption();
  console.log("albumIds:",albumIds.value)
  alarmList.value=wsCache.get("alarmList")||[];
  // console.log("cacheFaceAlarmList:",alarmList.value);
  if(!stopTimer) {
    startTime.value= dayjs(new Date()).add(-1,"day").format("YYYY-MM-DD 00:00:00")
    let endTime=dayjs(new Date()).format('YYYY-MM-DD 23:59:59');
    stopTimer=callWithDelay(() => {
      let parmas={
        startTime:startTime.value,
        endTime: endTime,
        pageSize: 2,
        identityType:1,
        albumIds:albumIds.value
      };
      // console.log("执行了:",parmas)
      AlarmFaceMsgApi.getAlarmFaceMsgPage(parmas).then(res => {
        console.log("getAlarmFaceMsgPage:",res)
        if (res.list != null&&res.list.length>0) {
            alarmList.value.unshift(...res.list);
            startTime.value = dayjs(res.list[0].captureTime).add(1, "second").format("YYYY-MM-DD HH:mm:ss");
            if (alarmList.value.length > 2) {
              alarmList.value.length = 2;
            }
            wsCache.set("alarmList:",unref(alarmList.value))
            if (count.value != res.total) {
              count.value =count.value+ res.total;
              emit('countChange', count.value);
            }
        }
      }).catch(err => {
        console.log("err:", err)
      })
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
    cursor: pointer;
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
