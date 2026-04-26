<template>
  <Dialog v-model="dialogVisible" title="Job detail" width="700px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="Job ID" min-width="60">
        {{ detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="Job Name">
        {{ detailData.name }}
      </el-descriptions-item>
      <el-descriptions-item label="Job Status">
        <dict-tag :type="DICT_TYPE.INFRA_JOB_STATUS" :value="detailData.status" />
      </el-descriptions-item>
      <el-descriptions-item label="Handler name">
        {{ detailData.handlerName }}
      </el-descriptions-item>
      <el-descriptions-item label="Handler Param">
        {{ detailData.handlerParam }}
      </el-descriptions-item>
      <el-descriptions-item label="Cron">
        {{ detailData.cronExpression }}
      </el-descriptions-item>
      <el-descriptions-item label="retryCount">
        {{ detailData.retryCount }}
      </el-descriptions-item>
      <el-descriptions-item label="retryInterval">
        {{ detailData.retryInterval + ' SSS' }}
      </el-descriptions-item>
      <el-descriptions-item label="monitorTimeout">
        {{ detailData.monitorTimeout > 0 ? detailData.monitorTimeout + ' SSS' : ' Not enable' }}
      </el-descriptions-item>
      <el-descriptions-item label="Next times">
        <el-timeline>
          <el-timeline-item
            v-for="(nextTime, index) in nextTimes"
            :key="index"
            :timestamp="formatDate(nextTime)"
          >
            Count : {{ index + 1 }}
          </el-timeline-item>
        </el-timeline>
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import * as JobApi from '@/api/infra/job'

defineOptions({ name: 'InfraJobDetail' })

const dialogVisible = ref(false) // 弹窗的是否展示
const detailLoading = ref(false) // 表单的加载中
const detailData = ref({} as JobApi.JobVO) // 详情数据
const nextTimes = ref([]) // 下一轮执行时间的数组

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  // 查看，设置数据
  if (id) {
    detailLoading.value = true
    try {
      detailData.value = await JobApi.getJob(id)
      // 获取下一次执行时间
      nextTimes.value = await JobApi.getJobNextTimes(id)
    } finally {
      detailLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
