<template>
  <div class="echarts-box">
    <div ref="echartRef" class="charts" ></div>
  </div>
</template>
<script setup lang="ts">
import * as echarts from 'echarts';
import {getPie3D,PieItem} from "@/utils/echarts";
import 'echarts-gl';
import {debounce} from "lodash-es";

interface Props {
  data: PieItem[], // 不允许为空（必传）
  size?: number // 可选，但我们会设置默认值
}

const props = withDefaults(defineProps<Props>(), {
  size: 180 // 设置默认值
})


const echartRef = ref(null);

let dom = null;

//设置图表配置
const setOptions = (options) => {
  //清除画布
  dom && dom.clear();
  //重新渲染
  dom && dom.setOption(options);
};

const resizeHandler = debounce(() => {
  if (dom) {
    console.log("触发resize")
    dom.resize()
  }
}, 100)
watch(
  () => props.data,
  (val) => {
    // console.log("props.data:",props.data);
    nextTick(() => {
      // console.log("props.data:",val);
      //默认关闭动画
      setOptions(getPie3D(val,props.size));
    });
  },
  { deep: true, immediate: true }
);
const emits= defineEmits(['click'])
onMounted(() => {
  //初始化
  dom = markRaw(echarts.init(echartRef.value));
  //点击事件
  dom.on('click',  (param)=> {
    emits('click',param)
  } )
  window.addEventListener('resize', resizeHandler)
});
onBeforeUnmount(() => {
  //离开销毁
  echarts.dispose(dom);
  dom = null;
});

defineExpose({
  setOptions,
});
</script>
<style lang="scss" scoped>
.echarts-box {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.charts {
  width: 100%;
  height: 100%;
}
</style>


