<template>
  <div class="h-78vh">
    <el-table
      class="!w-100%"
      :data="response.list"
      border
      stripe
      @selection-change="handleSelectionChange"
      height="78vh"
    >
      <!-- <el-table-column type="selection" prop="id" label="ID" /> -->
      <el-table-column prop="cameraName" label="Device Name" />
      <el-table-column prop="ip" label="Device IP">
        <template #default="{ row }">
          <div>
            <el-link type="primary" :underline="true" :href="'http://' + row.ip" target="_blank">
              {{ row.ip }}
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="port" label="Port" />
      <el-table-column prop="cameraUsage" label="Device Usage">
        <template #default="{ row }">
          <el-tag
            type="success"
            size="small"
            effect="dark"
            v-for="(item, index) in toArray(row.cameraUsage)"
            :key="index"
          >
            {{ getUsageName(item) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status">
        <template #default="{ row }">
          <el-tag
            :type="row.status == 'Offline' ? 'danger' : 'success'"
            class="!cursor-pointer"
            @click="showCurrentIpStatistics(row.ip)"
            >{{ row.status }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="Create Time" :formatter="dateFormatter" />
    </el-table>
    <Pagination
      :total="response.total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script lang="ts" setup>
import * as DeviceLogApi from '@/api/devicelog'
import { dateFormatter } from '@/utils/formatTime'
defineOptions({
  name: 'CameraLogList'
})

const props = defineProps({
  outerQuery: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['show-currentip-statistics', 'loading-done'])

let queryParams = reactive({
  page: 1,
  pageSize: 50
})

const response = ref({
  list: [],
  total: 0
})

const handleSelectionChange = () => {}

const getList = async () => {
  const formData = {
    ...props.outerQuery,
    ...queryParams
  }
  DeviceLogApi.getList(formData).then((res) => {
    response.value = res
    emit('loading-done')
  })
}

const toArray = (cameraUsage: string) => {
  if (!cameraUsage) return ''
  if (!cameraUsage.includes(',')) return cameraUsage

  return cameraUsage
    .substring(1, cameraUsage.length - 1)
    .trim()
    .split(',')
}

function getUsageName(item) {
  item = item.trim()
  switch (item) {
    case '1':
      return 'Online-play'
    case '2':
      return 'Video-storage'
    case '3':
      return 'FR'
    case '4':
      return 'ANPR'
    case '5':
      return 'Video structuring'
    case '6':
      return 'Behavior analyze'
  }
}

const showCurrentIpStatistics = (ip) => {
  const form = { ...props.outerQuery }
  form.ip = ip
  emit('show-currentip-statistics', form)
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped></style>
