<script setup>
import {ref, computed} from 'vue'
//父组件的方法
const emit = defineEmits(['selection-complete']);
defineOptions({name: 'DriverFaceCompare'})
const props = defineProps({
  imageSrc: {
    type: Object,
    default: () => {
    },
  }
})
const imgWidth = ref(280);
const imgHeight = ref(270);
const isDrawing = ref(false)
const startX = ref(0)
const startY = ref(0)
const currentX = ref(0)
const currentY = ref(0)

const container = ref(null)

const handleMouseDown = (event) => {
  isDrawing.value = true
  const rect = container.value.getBoundingClientRect()
  startX.value = event.clientX - rect.left
  startY.value = event.clientY - rect.top
  currentX.value = startX.value
  currentY.value = startY.value
}

const handleMouseMove = (event) => {
  if (!isDrawing.value) return

  const rect = container.value.getBoundingClientRect()
  currentX.value = event.clientX - rect.left
  currentY.value = event.clientY - rect.top
}

const handleMouseUp = () => {
  isDrawing.value = false
  const rowData = {
    top: Math.min(startX.value, currentX.value),
    left: Math.min(startY.value, currentY.value),
    width: Math.abs(currentX.value - startX.value),
    height: Math.abs(currentY.value - startY.value),
    imgWidth: imgWidth.value,
    imgHeight: imgHeight.value,
  }
  emit('selection-complete', rowData)
}

const rectangleStyle = computed(() => {
  const left = Math.min(startX.value, currentX.value)
  const top = Math.min(startY.value, currentY.value)
  const width = Math.abs(currentX.value - startX.value)
  const height = Math.abs(currentY.value - startY.value)

  return {
    position: 'absolute',
    border: '2px solid red',
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    imgWidth: imgWidth.value,
    imgHeight: imgHeight.value,
  }
})
</script>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
}

.image {
  display: block;
  width: 100%;
}

.rectangle {
  pointer-events: none;
}
</style>
<template>
  <div
    ref="container"
    class="image-container"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <img :src="imageSrc" class="image" draggable="false" :width="imgWidth" :height="imgHeight"/>
    <div
      v-if="isDrawing"
      class="rectangle"
      :style="rectangleStyle"
    ></div>
  </div>
</template>
