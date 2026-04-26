<template>
  <Dialog v-model="dialogVisible" :max-height="500" :scroll="true" title="Detail" width="800">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="ID" min-width="120">
        {{ detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="Track" v-if="detailData.traceId">
        {{ detailData.traceId }}
      </el-descriptions-item>
      <el-descriptions-item label="Operator Code">
        {{ detailData.userId }}
      </el-descriptions-item>
      <el-descriptions-item label="Operator Name">
        {{ detailData.userName }}
      </el-descriptions-item>
      <el-descriptions-item label="Operator IP">
        {{ detailData.userIp }}
      </el-descriptions-item>
      <el-descriptions-item label="Operator UA">
        {{ detailData.userAgent }}
      </el-descriptions-item>
      <el-descriptions-item label="Operate Module">
        {{ detailData.type }}
      </el-descriptions-item>
      <el-descriptions-item label="Operate Name">
        {{ detailData.subType }}
      </el-descriptions-item>
      <el-descriptions-item label="Operate Content">
        {{ detailData.action }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detailData.extra" label="Operate Extra Param">
        {{ detailData.extra }}
      </el-descriptions-item>
      <el-descriptions-item label="Request URL">
        {{ detailData.requestMethod }} {{ detailData.requestUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="Operate Time">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="Business Code">
        {{ detailData.bizId }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import * as OperateLogApi from '@/api/system/operatelog'

defineOptions({ name: 'SystemOperateLogDetail' })

const dialogVisible = ref(false) // 弹窗的是否展示
const detailLoading = ref(false) // 表单的加载中
const detailData = ref({} as OperateLogApi.OperateLogVO) // 详情数据

/** 打开弹窗 */
const open = async (data: OperateLogApi.OperateLogVO) => {
  dialogVisible.value = true
  // 设置数据
  detailLoading.value = true
  try {
    detailData.value = data
  } finally {
    detailLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
