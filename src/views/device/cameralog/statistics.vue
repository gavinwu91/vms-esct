<template>
  <div class="pl-5vh !w-full">
    <!-- <h2 @click="openIpStatistics" class="text-center">{{ props.ipData.ip }}</h2> -->
    <Echart :options="options" :height="'50vh'" :width="props.width" />
  </div>
</template>
<script setup lang="ts">
import { string } from 'vue-types'

defineOptions({ name: 'Statistics' })
const props = defineProps({
  dates: {
    type: Array,
    required: true
  },
  ipData:{
    type: Object,
    required: true
  },
  width: {
    type : String,
    require: true,
    default: '100%'
  }
})
const emits = defineEmits(['open-ip-statistics'])

const options = ref({})
const initOptions = () => {
  options.value = getOptions()
}
const getOptions = () => {
  return {
    color: ['#ee6666','#85ce61'],
    title: {
      text:props.ipData?.ip,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: [
      {
        left: 'left',
        orient: 'vertical',

      }
    ],
    yAxis: [
      {
        type: 'value',
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: props.dates
      }
    ],
    series: props.ipData.seriesData.map((a) => {
      const obj = {
        name: a.name,
        type: 'bar',
        barWidth: 60,
        emphasis: {
          focus: 'series'
        },
        stack: 'same',
        data: a.seriesData
      }
      return obj
    })
  }
}

const openIpStatistics = () => {
    emits('open-ip-statistics',props.ipData.ip)
}

onMounted( () => {
  initOptions()
})
</script>
<style scoped></style>
