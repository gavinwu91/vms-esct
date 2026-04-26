<template>
  <div class="-container">
    <el-tag :class="'level-' + props.level" :size="props.size"> Level {{ props.level }} </el-tag>
  </div>
</template>

<script lang="ts" setup>
import { getStatusName } from '@/api/alarmtask/common'
defineOptions({
  name: 'AlarmLevelTag'
})

const props = defineProps({
  level: {
    type: Number
  },
  size: {
    type: String,
    default: 'default'
  }
})
</script>

<style lang="scss" scoped>
.-container {
  --low: #4c8ad4;
  --success: #fbc647;
  --warning: #e77e2d;
  --danger: #e63946;
}
.-container * {
  color: white;
}

.level-1 {
  background-color: var(--danger);
}

.level-2 {
  background-color: var(--warning);
}

.level-3 {
  background-color: var(--success);
}
.level-4 {
  background-color: var(--low);
}
</style>
