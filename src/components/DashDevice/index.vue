<template>
    <div class="title">
      <h3>Device Distribution</h3>
      <div class="more" @click="handleMore('/vms/list')">More>></div>
    </div>
    <div  class="section_content" >

      <div class="left_card">
        <ul>
          <li class="back" @click="handleClickBack" v-if="beforeTree.length>0"><el-icon :size="16"><Back/></el-icon></li>
          <li class="left_card_li" @click="handleClickTree(item)" v-for="item in deviceTree" :key="item.id">{{item.name}}: <span style="font-weight: bold">{{ item.deviceCount }}</span></li>

        </ul>
      </div>
      <div class="right_card">
        <echarts-pie :data="cameraData" :size="500"  />
      </div>
    </div>
</template>
<script setup lang="ts">

import {PieItem} from "@/utils/echarts";
import {getPermissionDeviceTree} from "@/api/device";
import {Back} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
const router = useRouter()
function handleMore(path){
  router.push(path)
}
const deviceTree=ref([]);
const cameraData=computed(()=>{
   return deviceTree.value.map(x=>{return {"name":x.name,"value":x.deviceCount,"id":x.id}})
})

const beforeTree=ref([]);
const emit = defineEmits(['deviceChange']) // 定义 success 事件，用于操作成功后的回调

function handleClickTree(item){

  let arr=item.children.filter(_=>_.type=='region')||[];
  // console.log("handleClickTree",arr)
  if(arr.length>0){
    beforeTree.value.push([...deviceTree.value]);
    deviceTree.value=arr.sort((a,b)=>b.deviceCount-a.deviceCount);
  }

  let deviceList=[];
  filterDeviceList( item.children,deviceList);
  // console.log("deviceList:",deviceList)
  emit("deviceChange",deviceList)
}
function filterDeviceList(tree,arr){
  tree.forEach(node=>{
    if(node.type=='region'){
      filterDeviceList(node.children,arr)
    }else if(node.device){
      arr.push(node.device);
    }
  })
}
function handleClickBack(){
  deviceTree.value=beforeTree.value.pop()||[];
  let deviceList=[];
  filterDeviceList( [...deviceTree.value],deviceList);
  // console.log("deviceList:",deviceList)
  emit("deviceChange",deviceList)
}

onMounted(()=>{
  getPermissionDeviceTree({showExists:"true"}).then(res=>{
     // console.log("getPermissionDeviceTree-showExists:",res)
    if(res.length>0){
      deviceTree.value=res.sort((a,b)=>b.deviceCount-a.deviceCount);
    }
  }).catch(err=>console.error)
})
</script>
<style lang="scss" scoped>
@use '@/styles/dashboard.scss';
.back{
  cursor: pointer;
  width: 30px;
  color: #fff;
  font-weight: bold;
}
.back:hover{
  opacity: .8;
}
.left_card_li{
  cursor: pointer;
}
.left_card_li:hover{
  opacity: .8;
}
</style>
