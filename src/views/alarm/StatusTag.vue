<template>
  <div class="-container">
    <el-tag :type="props.status != 4 ? 'danger' : 'success'" :size="props.size">
      {{ getStatusName(props.status) }}
    </el-tag>
  </div>
</template>

<script lang="ts" setup>
import { getStatusName } from '@/api/alarmtask/common'
defineOptions({
  name: 'StatusTag'
})

const props = defineProps({
  status: {
    type: Number
  },
  size: {
    type: String,
    default: 'default'
  }
})
</script>

<style lang="scss" scoped></style>
