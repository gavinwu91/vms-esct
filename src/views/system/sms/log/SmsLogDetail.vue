<template>
  <Dialog v-model="dialogVisible" :max-height="500" :scroll="true" title="Detail" width="800">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="ID" min-width="120">
        {{ detailData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="Sms Channel">
        {{ channelList.find((channel) => channel.id === detailData.channelId)?.signature }}
        <dict-tag :type="DICT_TYPE.SYSTEM_SMS_CHANNEL_CODE" :value="detailData.channelCode" />
      </el-descriptions-item>
      <el-descriptions-item label="SmsTemplate ">
        {{ detailData.templateId }} | {{ detailData.templateCode }}
        <dict-tag :type="DICT_TYPE.SYSTEM_SMS_TEMPLATE_TYPE" :value="detailData.templateType" />
      </el-descriptions-item>
      <el-descriptions-item label="API 的Template code">
        {{ detailData.apiTemplateId }}
      </el-descriptions-item>
      <el-descriptions-item label="User infomation">
        {{ detailData.mobile }}
        <span v-if="detailData.userType && detailData.userId">
          <dict-tag :type="DICT_TYPE.USER_TYPE" :value="detailData.userType" />
          ({{ detailData.userId }})
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="Sms Content">
        {{ detailData.templateContent }}
      </el-descriptions-item>
      <el-descriptions-item label="Sms param">
        {{ detailData.templateParams }}
      </el-descriptions-item>
      <el-descriptions-item label="Create Time">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="Send Status">
        <dict-tag :type="DICT_TYPE.SYSTEM_SMS_SEND_STATUS" :value="detailData.sendStatus" />
      </el-descriptions-item>
      <el-descriptions-item label="Send time">
        {{ formatDate(detailData.sendTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="API result">
        {{ detailData.apiSendCode }} | {{ detailData.apiSendMsg }}
      </el-descriptions-item>
      <el-descriptions-item label="API Sms Code">
        {{ detailData.apiSerialNo }}
      </el-descriptions-item>
      <el-descriptions-item label="API Request Code">
        {{ detailData.apiRequestId }}
      </el-descriptions-item>
      <el-descriptions-item label="API Receive Status">
        <dict-tag :type="DICT_TYPE.SYSTEM_SMS_RECEIVE_STATUS" :value="detailData.receiveStatus" />
        {{ formatDate(detailData.receiveTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="API result">
        {{ detailData.apiReceiveCode }} | {{ detailData.apiReceiveMsg }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import * as SmsLogApi from '@/api/system/sms/smsLog'
import * as SmsChannelApi from '@/api/system/sms/smsChannel'

defineOptions({ name: 'SystemSmsLogDetail' })

const dialogVisible = ref(false) // 弹窗的是否展示
const detailLoading = ref(false) // 表单的加载中
const detailData = ref() // 详情数据
const channelList = ref([]) // Sms渠道列表

/** 打开弹窗 */
const open = async (data: SmsLogApi.SmsLogVO) => {
  dialogVisible.value = true
  // 设置数据
  detailLoading.value = true
  try {
    detailData.value = data
  } finally {
    detailLoading.value = false
  }
  // 加载渠道列表
  channelList.value = await SmsChannelApi.getSimpleSmsChannelList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
