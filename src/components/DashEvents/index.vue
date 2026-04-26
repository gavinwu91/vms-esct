<template>
  <div class="title">
    <h3>Events</h3>
<!--    <div class="more" @click="handleMore('/')">More>></div>-->
  </div>
  <div  class="section_content" >
    <div class="stats">
      <div class="stat-item" :class="{'active':item.id==activeId}" v-for="item in statList" :key="item.label" @click="handleAlarmClick(item.id)">
        <div class="label">{{ item.label }}</div>
        <div class="value">{{ item.value }}</div>
      </div>
    </div>
<!--    <div class="left_card">-->
<!--      <ul>-->
<!--        <li v-for="item in pieData" :key="item.id">{{item.name}}: <span>{{ item.value.toLocaleString() }}</span></li>-->
<!--      </ul>-->
<!--    </div>-->
    <div class="right_card" style="min-height: 80px">
      <echart :options="options" height="100%"   />
    </div>
  </div>

</template>
<script setup lang="ts">
import {PieItem} from "@/utils/echarts";
import {EChartsOption} from "echarts";
import {useRouter} from "vue-router";
const router = useRouter()
function handleMore(path){
  router.push(path)
}
const statList = ref([
  { id:1,label: 'Today', value: 437 },
  { id:2,label: 'Weekly', value: 861 },
  { id:3,label: 'Monthly', value: 41727 }
]);
const pieData=ref<PieItem[]>([
  {id:1,name:'Strangers',value:128 },
  {id:2,name:'Fighting',value:3},
  {id:3,name:'Gathering',value:12 },
  {id:4,name:'Vehicle',value:56},
  {id:4,name:'Fire warning',value:4},
])

const options = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  grid: {
    left: '5%',
    right: '12%',
    bottom: '-15%',
    top: '5%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    show: false,
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'category',
    data: pieData.value.map(item => item.name),
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: '#00eaff',
      fontWeight: 'bold'
    }
  },
  visualMap: {
    show:false,
    orient: 'horizontal',
    left: 'center',
    min: 10,
    max: 100,
    text: ['High Score', 'Low Score'],
    // Map the score column to color
    dimension: 0,
    inRange: {
      color: ['#65B581', '#FFCE34', '#FD665F']
    }
  },
  series: [
    {
      name: 'Count',
      type: 'bar',
      data: pieData.value.map(item => item.value),
      label: {
        show: true,
        position: 'right', // 数字显示在柱子末尾
        color: '#fff',     // 白色字体
        fontWeight: 'bold',
        fontSize: 14
      },
      itemStyle: {
        borderRadius: [0, 6, 6, 0] // 右边圆角
      },
      barWidth: 8

    }
  ]
});

const activeId:Number=ref(1)
function handleAlarmClick(itemId){
  activeId.value=itemId;
  if(itemId==1){
    options.series[0].data = pieData.value.map(x=>x.value)
  }else if(itemId==2){
    let data=[
      {id:1,name:'Strangers',value:1280 },
      {id:2,name:'Fighting',value:30},
      {id:3,name:'Gathering',value:120 },
      {id:4,name:'Vehicle',value:560},
      {id:4,name:'Fire warning',value:40},
    ]
    options.series[0].data = data.map(x=>x.value)

  }else if(itemId==3){
    let data=[
      {id:1,name:'Strangers',value:1380 },
      {id:2,name:'Fighting',value:50},
      {id:3,name:'Gathering',value:130 },
      {id:4,name:'Vehicle',value:580},
      {id:4,name:'Fire warning',value:80},
    ]
    options.series[0].data = data.map(x=>x.value)

  }

  getAlarmCount();
}
function getAlarmCount(){

}

onMounted(()=>{

})

</script>
<style lang="scss" scoped>
@use '@/styles/dashboard.scss';
.section_content {
  display: flex;
  flex-direction: column;
  //
  color: white;
  padding:0;
  .stats {
    display: flex;
    justify-content: space-around;

    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
    border-top: 1px solid rgba(255, 255, 255, 0.8);
    width:100%;
    .active{
      cursor: default !important;
      box-shadow: rgba(59,97,149,.5) 0px -1px 34px inset;
    }
    .stat-item {
      text-align: center;
      cursor: pointer;
      flex:1;
      padding: 2px 0;
      .label {
        font-size: 12px;
        color: #00eaff;
      }

      .value {
        font-size: 20px;
        font-weight: bold;
        color: white;
      }
    }
  }

}
</style>
