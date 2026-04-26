<template>
  <!--Welcome-->
  <div class="bg-blue-300 h-94.5vh">
    <!-- <div class="flex justify-between items-center h-28 pl-20 pr-20 pt-4">
      <el-card class="w-80 h-30 rounded-2xl" shadow="always" :body-style="{ padding: '20px' }">
        <el-row :gutter="20">
          <el-col :span="17">
            <div>
              <h1 class="text-1xl">Device</h1>
              <CountTo
                class="count-to text-emerald-500"
                :start-val="0"
                :end-val="totalSate.deviceTotal"
                :duration="2600"
              />
            </div>
          </el-col>
          <el-col :span="7">
            <div
              class="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500"
            >
              <el-icon class="ml-3 mt-25% icon-size"><VideoCamera class="text-white" /></el-icon>
            </div>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="w-80 h-30 rounded-2xl" shadow="always" :body-style="{ padding: '20px' }">
        <el-row :gutter="20">
          <el-col :span="17">
            <div>
              <h1 class="text-1xl">Library</h1>
              <div class="pl-2">
                <CountTo
                  class="count-to text-emerald-500"
                  :start-val="0"
                  :end-val="totalSate.libraryTotal"
                  :duration="2600"
                />
              </div>
            </div>
          </el-col>
          <el-col :span="7">
            <div
              class="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-600"
            >
              <el-icon class="ml-3 mt-25% icon-size"><Folder class="text-white" /></el-icon>
            </div>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="w-80 h-30 rounded-2xl" shadow="always" :body-style="{ padding: '20px' }">
        <el-row :gutter="20">
          <el-col :span="17">
            <div>
              <h1 class="text-1xl">User</h1>
              <div class="pl-2">
                <CountTo
                  class="count-to text-emerald-500"
                  :start-val="0"
                  :end-val="4"
                  :duration="2600"
                />
              </div>
            </div>
          </el-col>
          <el-col :span="7">
            <div
              class="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400"
            >
              <el-icon class="ml-3 mt-25% icon-size"><User class="text-white" /></el-icon>
            </div>
          </el-col>
        </el-row>
      </el-card>
      <el-card class="w-80 h-30 rounded-2xl" shadow="always" :body-style="{ padding: '20px' }">
        <el-row :gutter="20">
          <el-col :span="17">
            <div>
              <h1 class="text-1xl">Area</h1>
              <div class="pl-2">
                <CountTo
                  class="count-to text-emerald-500"
                  :start-val="0"
                  :end-val="totalSate.areaTotal"
                  :duration="2600"
                />
              </div>
            </div>
          </el-col>
          <el-col :span="7">
            <div
              class="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500"
            >
              <el-icon class="ml-3 mt-25% icon-size"><OfficeBuilding class="text-white" /></el-icon>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div> -->
    <!--Index-->
    <el-row class="w-99.9%" style="margin-left: 0.1vh; border-radius: 8%" :gutter="8">
      <el-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
        <el-card shadow="never" class="mt-0.3%">
          <el-skeleton :loading="loading" animated>
            <el-row :gutter="20" justify="space-between">
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <div class="flex justify-between">
                  <div class="flex gap-x-4">
                    <h1 class="text-25px mb-10px">Device total:</h1>
                    <CountTo
                      class="count-to text-emerald-500"
                      :start-val="0"
                      :end-val="totalSate.deviceTotal"
                      :duration="2600"
                    />
                  </div>
                  <div class="flex gap-x-4">
                    <h1 class="ml-20 text-25px">Library total:</h1>
                    <CountTo
                      class="count-to text-emerald-500"
                      :start-val="0"
                      :end-val="totalSate.libraryTotal"
                      :duration="2600"
                    />
                  </div>
                </div>
              </el-col>
              <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
                <el-card shadow="hover" class="mb-8px">
                  <el-skeleton :loading="loading" animated>
                    <Echart :options="deviceUsagePieOptionsData" :height="'32vh'" :width="'70vh'" />
                  </el-skeleton>
                </el-card>
              </el-col>

              <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
                <el-card shadow="hover" class="mb-8px">
                  <el-skeleton :loading="loading" animated>
                    <Echart :options="deviceStatusPieOption" :height="'32vh'" :width="'100%'" />
                  </el-skeleton>
                </el-card>
              </el-col>
              <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
                <el-card shadow="hover" class="mb-8px">
                  <el-skeleton :loading="loading" animated>
                    <Echart :options="deviceBrandPieOption" :height="'32vh'" :width="'100%'" />
                  </el-skeleton>
                </el-card>
              </el-col>
              <el-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
                <el-card shadow="hover" class="mb-8px">
                  <el-skeleton :loading="loading" animated>
                    <Echart
                      :options="deviceByLocationPieOptionsData"
                      :height="'40.5vh'"
                      :width="'100%'"
                    />
                  </el-skeleton>
                </el-card>
              </el-col>
            </el-row>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { set } from 'lodash-es'
import { EChartsOption } from 'echarts'
import { formatTime } from '@/utils'
import { DashboardAPI } from '@/api/managedashboard'
import { useUserStore } from '@/store/modules/user'
// import { useWatermark } from '@/hooks/web/useWatermark'
import type { WorkplaceTotal, Project, Notice, Shortcut } from './types'
import { pieOptions, barOptions } from './echarts-data'
import { useRouter } from 'vue-router'
import { Folder, VideoCamera, User, OfficeBuilding } from '@element-plus/icons-vue'

defineOptions({ name: 'Index' })

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
// const { setWatermark } = useWatermark()
const loading = ref(true)
const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption
// 获取统计数
let totalSate = reactive({
  deviceTotal: 0,
  libraryTotal: 0,
  areaTotal: 0
})

// const getCount = async () => {
//   const data = {
//     project: 40,
//     access: 2340,
//     todo: 10
//   }
//   totalSate = Object.assign(totalSate, data)
// }

// 获取项目数
let projects = reactive<Project[]>([])
const getProject = async () => {
  const data = [
    {
      name: 'vms-cloud',
      icon: 'material-symbols:cloud-outline',
      message: '',
      personal: '',
      time: new Date('2025-06-09'),
      color: '#1890ff'
    }
  ]
  projects = Object.assign(projects, data)
}

// 获取通知公告
let notice = reactive<Notice[]>([])
const getNotice = async () => {
  const data = [
    {
      title: '系统支持 JDK 8/17/21，Vue 2/3',
      type: '技术兼容性',
      keys: ['JDK', 'Vue'],
      date: new Date()
    },
    {
      title: '后端提供 Spring Boot 2.7/3.2 + Cloud 双架构',
      type: '架构灵活性',
      keys: ['Boot', 'Cloud'],
      date: new Date()
    }
  ]
  notice = Object.assign(notice, data)
}

// 获取快捷入口
let shortcut = reactive<Shortcut[]>([])

const getShortcut = async () => {
  const data = [
    {
      name: '首页',
      icon: 'ion:home-outline',
      url: '/',
      color: '#1fdaca'
    }
  ]
  shortcut = Object.assign(shortcut, data)
}

// 用户来源
const getUserAccessSource = async () => {
  const data = [
    { value: 335, name: 'analysis.directAccess' },
    { value: 310, name: 'analysis.mailMarketing' },
    { value: 234, name: 'analysis.allianceAdvertising' },
    { value: 135, name: 'analysis.videoAdvertising' },
    { value: 1548, name: 'analysis.searchEngines' }
  ]
  set(
    pieOptionsData,
    'legend.data',
    data.map((v) => t(v.name))
  )
  pieOptionsData!.series![0].data = data.map((v) => {
    return {
      name: t(v.name),
      value: v.value
    }
  })
}
const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption

// 周活跃量
const getWeeklyUserActivity = async () => {
  const data = [
    { value: 13253, name: 'analysis.monday' },
    { value: 34235, name: 'analysis.tuesday' },
    { value: 26321, name: 'analysis.wednesday' },
    { value: 12340, name: 'analysis.thursday' },
    { value: 24643, name: 'analysis.friday' },
    { value: 1322, name: 'analysis.saturday' },
    { value: 1324, name: 'analysis.sunday' }
  ]
  set(
    barOptionsData,
    'xAxis.data',
    data.map((v) => t(v.name))
  )
  set(barOptionsData, 'series', [
    {
      name: t('analysis.activeQuantity'),
      data: data.map((v) => v.value),
      type: 'bar'
    }
  ])
}

const getStatistics = () => {
  DashboardAPI.statistics().then((res) => {
    const deviceByUsage = res.deviceByUsage
    const deviceByLocation = res.deviceByLocation
    const deviceStatus = res.deviceStatus
    const deviceBrand = res.deviceBrand

    console.log('res ==== ', res)
    fillDeivceByUsagePieChart(deviceByUsage)
    fillDeivceByLocationPieChart(deviceByLocation)
    fillDeivceByStatusPieChart(deviceStatus)
    fillDeivceBrandPieChart(deviceBrand)
    totalSate.deviceTotal = res.deviceTotal
    totalSate.libraryTotal = res.libraryTotal
    totalSate.areaTotal = res.areaTotal
  })
}

const deviceUsagePieOptionsData = ref({})

const fillDeivceByUsagePieChart = (data) => {
  deviceUsagePieOptionsData.value = getOptions(data)
  //设置lengen data 数据
  // set(deviceUsagePieOptionsData, 'title.text', data.text)
}

const deviceByLocationPieOptionsData = ref({})
const fillDeivceByLocationPieChart = (data) => {
  deviceByLocationPieOptionsData.value = getBarOptions(data)
}

const deviceStatusPieOption = ref({})
const fillDeivceByStatusPieChart = (data) => {
  deviceStatusPieOption.value = getOptions(data)
}

const deviceBrandPieOption = ref({})
const fillDeivceBrandPieChart = (data) => {
  deviceBrandPieOption.value = getOptions(data)
}

const getOptions = (data) => {
  return {
    title: {
      text: data.text,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.seriesData.map((v) => v.name)
    },
    series: [
      {
        name: data.text,
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: data.seriesData.map((v) => {
          return {
            name: t(v.name),
            value: v.value
          }
        })
      }
    ]
  }
}

const getBarOptions = (data) => {
  return {
    title: {
      text: data.text,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: 50,
      right: 20,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: data.xaxisData,
      axisLabel: {
        interval: 0
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: data.text,
        data: data.seriesData,
        type: 'bar'
      }
    ]
  }
}

const getAllApi = async () => {
  await Promise.all([getStatistics()])
  loading.value = false
}

getAllApi()
</script>
<style scoped>
.count-to {
  font-size: 35px;
  /* color: #25f3e6; */
  font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif';
  font-weight: normal;
}
.icon-size {
  font-size: 25px;
}
</style>