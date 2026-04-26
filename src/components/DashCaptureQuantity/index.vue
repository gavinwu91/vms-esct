<!--人脸抓拍趋势-->
<template>
  <div class="title">
    <h3>Face Capture Quantity</h3>
<!--    <div class="more" @click="handleMore('/')">More>></div>-->
  </div>
  <div  class="section_content"   >
    <div class="right_card" style="min-height: 80px">
      <echart :options="options" height="100%"   />
    </div>
  </div>
</template>

<script setup lang="ts">
import {EChartsOption} from "echarts";
import {faceCaptureCount} from "@/api/retrieval";
import dayjs from "dayjs";
import {getLast7Days} from "@/utils/index";
import {useRouter} from "vue-router";
const router = useRouter()
function handleMore(path){
  router.push(path)
}
const last7Days = getLast7Days()
const options =reactive<EChartsOption>({
  tooltip: {
    trigger: 'axis',
    // axisPointer: { type: 'line' }
    axisPointer: {
      type: "cross",
      label: {color:"#019cec",backgroundColor:"#03113f",shadowBlur:0,fontSize:12,fontWeight:"bold"},
      lineStyle: {
        color: {
          type: "dashed",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{ offset: 0, color: "rgba(73,73,155,.2)" }, {
            offset: 1,
            color: "rgba(73,73,155,.7)"
          }],
          globalCoord: false
        }, type: "dashed"
      }
    }
  },
  grid: {
    left: '5%',
    right: '5%',
    bottom: '10%',
    top: '5%',
    containLabel: true
  },
  xAxis: {
    axisLabel:{
      color:"#00eaff"
    },
    axisTick:{show:false},
    type: 'category',
    data: last7Days,
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    // axisTick: { show: false },
    axisLine: { show: true,lineStyle:{color:"rgba(19,94,229,.2)"} },
    splitLine: {show: true,lineStyle:{color:"rgba(19,94,229,.2)"} },
    axisPointer:{type:'shadow',show:false,label:{backgroundColor:"rgba(0,0,0,0)"}},
    axisLabel: {
      color: '#00eaff',
      fontWeight: 'bold',
      formatter: (value) => (value / 1000) + 'k'
    }
  },
  series: [
    {
      name: 'count',
      type: 'line',
      data: [],
      smooth: true,
      itemStyle:{
        normal:{
          areaStyle:{type:"default"},
          borderColor:"#17d1ff",
          color:{
            type:"linear",
            x:0,
            y:0,
            x2:0,
            y2:1,
            colorStops:[{offset:0,color:"rgba(23,209,255,0.5)"},{
              offset:1,
              color:"rgba(16,29,193,.1)"
            }]
          },lineStyle: {
            width: 1, // 去掉线
            color:"#17d1ff"
          },
        }
      },
      showSymbol: true, // 隐藏拐点圆圈
    }
  ]
})

onMounted(()=>{
  let startTime=dayjs(new Date()).add(-6,"day").format("YYYY-MM-DD HH:mm:ss");
  let endTime=dayjs(new Date()).add(1,"day").format("YYYY-MM-DD HH:mm:ss")
  faceCaptureCount({startTime:startTime,endTime:endTime}).then(res=>{
    // console.log("faceCaptureCount:",res)
    options.series[0].data=res.group.map(x=>x.count);
  })
})
</script>
<style lang="scss" scoped>
@use '@/styles/dashboard.scss';
</style>
