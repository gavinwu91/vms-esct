<template>
  <el-dialog v-model="dialogVisible" title="Detail" destroy-on-close draggable>
    <canvas ref="myCanvas" style="display: none"></canvas>
    <el-tabs
      v-model="activeTab"
      type="border-card"
      tab-position="top"
      v-loading="formLoading"
      element-loading-text="Loading......"
    >
      <el-tab-pane key="Alarm" label="Alarm" name="Alarm">
        <div class="tab-content">
          <!--如果是没有图片搜索的 ， 直接显示的是从mysql库中查出来的所有抓拍图片数据-->
          <el-row>
            <el-col :span="8">
              <p style="margin-left: 20px">Panoramic image</p>
              <el-card :body-style="{ padding: '0px' }">
                <el-image
                  :src="getKsProxyUrl(globalFaceInfo.fullUrl)"
                  style="margin-left: 5px; height: 242px; width: 420px"
                  :preview-src-list="[getKsProxyUrl(globalFaceInfo.fullUrl)]"
                />
                <div style="padding-left: 5px">
                  <div style="color: #869abb">Alarm Information:</div>
                  <p class="panoramic-text"
                    ><span class="panoramic-text-span">Time:</span
                    ><span>{{ formatDate(new Date(globalFaceInfo.captureTime)) }}</span></p
                  >
                  <p class="panoramic-text"
                    ><span class="panoramic-text-span">No.:</span>
                    <span>{{ globalFaceInfo.alarmNo }}</span></p
                  >
                  <p class="panoramic-text"
                    ><span class="panoramic-text-span">Level: </span>
                    <span v-for="(item, index) in levelColor" :key="index">
                      <el-tag
                        size="small"
                        v-if="item.value == globalFaceInfo.alarmLevel"
                        effect="dark"
                        :style="{ 'background-color': item.color }"
                        >Level&nbsp;{{ globalFaceInfo.alarmLevel }}</el-tag
                      >
                    </span></p
                  >
                  <p class="panoramic-text"
                    ><span class="panoramic-text-span">Type:</span>
                    <span>Surveillance Library Alarm</span></p
                  >
                </div>
              </el-card>
            </el-col>
            <el-col :span="10">
              <div>
                <!-- title -->
                <div style="">
                  <span> Face capture image </span>
                  <span style="margin-left: 22%"> Library Image </span>
                </div>

                <!-- content -->
                <div style="display: flex; position: relative">
                  <el-card :body-style="{ padding: '0px' }">
                    <el-image
                      :src="getKsProxyUrl(globalFaceInfo.cropUrl)"
                      style="height: 240px; width: 240px"
                      :preview-src-list="[getKsProxyUrl(globalFaceInfo.cropUrl)]"
                    >
                      <template #error>
                        <el-image :src="getImageUrl('default_face')" />
                      </template>
                    </el-image>
                    <p class="compare-card-text" style="color: #869abb"
                      >Location information:&nbsp;
                    </p>
                    <p class="compare-card-text">Camera: &nbsp; {{ globalFaceInfo.cameraName }}</p>
                    <p class="compare-card-text">Area: &nbsp; {{ globalFaceInfo.cameraArea }}</p>
                  </el-card>

                  <el-card :body-style="{ padding: '0px' }">
                    <el-image
                      :src="getKsProxyUrl(globalFaceInfo.albumPhotoUrl)"
                      style="height: 240px; width: 240px"
                      :preview-src-list="[getKsProxyUrl(globalFaceInfo.albumPhotoUrl)]"
                      ><template #error>
                        <el-image :src="getImageUrl('default_face')" />
                      </template>
                    </el-image>
                    <p class="compare-card-text" style="color: #869abb"
                      >Business information:&nbsp;</p
                    >
                    <p class="compare-card-text"
                      >Surveillance Time:&nbsp;{{
                        formatDate(globalFaceInfo.surveillanceLibraryCreateTime)
                      }}</p
                    >
                    <div class="compare-card-text flex justify-start items-center">
                      <div>Handling status:&nbsp;</div>
                      <StatusTag :status="globalFaceInfo.status" />
                    </div>
                  </el-card>

                  <div class="item-score"> {{ globalFaceInfo.score }}</div>
                </div>
              </div>
            </el-col>

            <el-col :span="6">
              <div>Library details</div>
              <div>
                <el-descriptions border :column="1">
                  <el-descriptions-item label="Name">
                    {{ globalFaceInfo.surveillancePerson.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Wanted No.">
                    {{ globalFaceInfo.surveillancePerson.wantedNo }}
                  </el-descriptions-item>
                  <el-descriptions-item label="ID Type">
                    {{ globalFaceInfo.surveillancePerson.idCardType }}
                  </el-descriptions-item>
                  <el-descriptions-item label="ID No">
                    {{ globalFaceInfo.surveillancePerson.idCard }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Nationality">
                    {{ globalFaceInfo.surveillancePerson.remark }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Gender">
                    {{ globalFaceInfo.surveillancePerson.gender == '1' ? 'Male' : 'Female' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="BirthDate">
                    {{ globalFaceInfo.surveillancePerson.birthDate }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Native place" />
                  <!-- <el-descriptions-item label="Remark">
                    {{ globalFaceInfo.surveillancePerson.remark }}
                  </el-descriptions-item> -->
                </el-descriptions>
              </div>
            </el-col>
          </el-row>
        </div>
        <div style="width: 100%; display: flex; justify-content: right">
          <div class="handle-div" style="width: 40vh; height: 30px; margin-top: 5%">
            <span style="font-size: 16px">Handle</span>
            <el-select v-model="updateForm.status" style="margin: 0 1cap 0 1cap; width: 200px">
              <el-option
                v-for="item in statusOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-button type="primary" size="default" @click="updateStatus" class="vms-main-button"
              >Confirm</el-button
            >
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane key="Alarm location" label="Alarm location" name="Alarm location">
        <div style="width: 100%; height: 30rem">
          <MapComponent
            :key="mapRefreshKey"
            :locationInfo="locationInfo"
            :longitude="globalFaceInfo.longitude"
            :latitude="globalFaceInfo.latitude"
            @update:longitude="(val) => (val = globalFaceInfo.longitude)"
            @update:latitude="(val) => (val = globalFaceInfo.latitude)"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { AlarmFaceMsgApi } from '@/api/alarmfacemsg'
import { getImageUrl} from '@/api/alarmtask/common'
import {getKsProxyUrl} from "@/api/common";
import MapComponent from './MapComponent.vue'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import StatusTag from '../StatusTag.vue'
import { statusOptions } from '@/api/alarmtask/common'
import { status } from 'nprogress'
import { color } from 'echarts'
/** 人脸报警历史消息 表单 */
defineOptions({ name: 'AlarmFaceMsgForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(true) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const locationInfo = ref({
  alarmTime: '',
  cameraType: '',
  cameraName: '',
  areaName: ''
})

const updateForm = ref({
  id: 0,
  status: 1
})

const globalFaceInfo = ref({
  id: 0,
  longitude: 58.339263,
  latitude: 23.598513,
  cropUrl: '',
  fullUrl: '',
  cameraName: '',
  cameraArea: '',
  albumPhotoUrl: '',
  captureTime: '',
  alarmNo: '',
  alarmLevel: 1,
  status: 0,
  surveillanceLibraryCreateTime: new Date(),
  score: 0,
  fullLocator: '',
  cropLocator: '',
  surveillancePerson: {
    name: '',
    wantedNo: '',
    idCardType: '',
    idCard: '',
    nationality: '',
    gender: '',
    birthDate: '',
    remark: ''
  }
})
// const formRules = reactive({})

// 变量定义
const tabs = ref([
  { name: 'alarm', label: 'Alarm', content: 'alarm' },
  { name: 'alarm_location', label: 'Alarm location', content: 'alarm location' }
])

const levelColor = ref([
  { value: 1, color: '#ce4f4f' },
  { value: 2, color: '#e77e2d' },
  { value: 3, color: '#fbc647' },
  { value: 4, color: '#4c8ad4' }
])
const activeIndex = ref(0)
const mapRefreshKey = ref(0)
const activeTab = ref('Alarm')
/** 打开弹窗 */
const open = async (obj: Object, index?: Number) => {
  mapRefreshKey.value++
  activeTab.value = 'Alarm'
  dialogVisible.value = true
  dialogTitle.value = ''
  // 修改时，设置数据
  formLoading.value = true
  const alarmFaceMsg = await AlarmFaceMsgApi.getAlarmFaceMsg(obj.id)
  //设置全局数据
  globalFaceInfo.value = {
    ...alarmFaceMsg
  }
  //设置处理状态数据
  updateForm.value.id = globalFaceInfo.value.id
  updateForm.value.status = globalFaceInfo.value.status

  //设置map 数据

  locationInfo.value = {
    alarmTime: formatDate(new Date(globalFaceInfo.value.captureTime)),
    cameraType: 'FaceCamera',
    cameraName: globalFaceInfo.value.cameraName,
    areaName: globalFaceInfo.value.cameraArea
  }

  console.log('globalFaceInfo.value ==== ', globalFaceInfo.value)
  drawFace()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const myCanvas = ref<HTMLCanvasElement | null>(null)
//初始化并绘制全景图框
const drawFace = () => {
  // 创建一个图片对象
  let img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = globalFaceInfo.value.fullUrl
  const fullLocator = globalFaceInfo.value.fullLocator
  const rect = JSON.parse(fullLocator)
  if (myCanvas.value) {
    const ctx = myCanvas.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height)
      // 图片加载完成后执行绘制
      img.onload = () => {
        if (myCanvas.value) {
          myCanvas.value.width = img.width
          myCanvas.value.height = img.height
          console.log(
            'canvas.width =={},canvas.height === {}',
            myCanvas.value.width,
            myCanvas.value.height
          )
          // 将图片绘制到 Canvas 上
          ctx.drawImage(img, 0, 0, myCanvas.value.width, myCanvas.value.height)
          //再将原始canvas的图片缩放
          drawRectangle(rect.leftPixels, rect.topPixels, rect.widthPixels, rect.heightPixels, ctx)
          const dataURL = myCanvas.value.toDataURL()
          globalFaceInfo.value.fullUrl = dataURL
          formLoading.value = false
        }
      }
      // 绘制矩形框的函数
      function drawRectangle(x, y, width, height, ctx) {
        ctx.beginPath()
        ctx.lineWidth = '5' // 设置线宽
        ctx.strokeStyle = 'green' // 设置边框颜色
        ctx.rect(x, y, width, height) // 绘制矩形
        ctx.stroke() // 绘制边框
      }
    }
  }
}

//方法定义
//显示哪一个tab标签
const showTab = (tabName: string) => {
  activeTab.value = tabName
  activeIndex.value = -1
  mapRefreshKey.value++
}

//查看大图
const onpreview = (url: String) => {
  ElMessage('' + url)
}

const setActive = (index: Number, obj: Object) => {
  ElMessage('' + index + obj)
}

const format = (name: String) => {}

//computed 定义
const computedBottomUrl = (url: String) => {
  return 'http://' + url
}
const computedCurrentCompareFaceScore = computed(() => '')

const handleStatusOptions = ref([
  { id: 1, name: 'Awaiting confirmation' },
  { id: 2, name: 'Awaiting receipt' },
  { id: 3, name: 'Awaiting feedback' },
  { id: 4, name: 'Closed' }
])

const getStatusWord = (status: number) => {
  const current = handleStatusOptions.value.find((a) => a.id == status)
  return current?.name
}

const updateStatus = () => {
  const a = { id: updateForm.value.id, status: updateForm.value.status }
  const result = AlarmFaceMsgApi.updateAlarmFaceMsg(a)
  dialogVisible.value = false
  message.alertSuccess('Update success!')
}
</script>
<style type="text/scss" lang="scss" scoped>
.item-score {
  background-image: url('/insight/red_back2.850b4.svg');
  position: absolute;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  top: 74%;
  width: 80px;
  font-weight: bold;
  font-size: 14px;
  color: rgb(240, 238, 238);
  left: 38%;
  text-align: center;
}

.right-active {
  height: 100%;
}
.left-top {
  line-height: 56px;
  background: #eeeeee;
  padding: 0 25px;
  width: 100%;
  box-sizing: border-box;
  font-weight: bold;
  display: inline-block;
  font-size: 16px;
  font-weight: 900;
  color: #435068;
}

.diff-image {
  width: 300px;
  height: 360px;
}

.list-diff-image {
  width: 120px;
  height: 150px;
}

.arrow {
  width: 15px;
  height: 90px;
  display: flex;
  align-content: space-between;
  flex-wrap: nowrap;
  justify-content: flex-end;
  align-items: center;
  /*background-image: linear-gradient(to top left, #0053a900, #bdc7df);*/
  font-weight: bold;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}
.card-item {
  flex-direction: row;
  display: flex;
  width: 326px;
  margin-right: 8px;
  margin-bottom: 5px;
  border: 1px outset #4ab7bd;
  background-color: white;
  cursor: pointer;
}
.page-info .card-item {
  height: 190px;
}

.compare-score {
  margin: 2px 0;
  padding-left: 5px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-family: 'newFont';
  font-size: 24px;
  color: #21539a;
  letter-spacing: 0.22px;
}
.meg-double-card {
  position: relative;
  transition: 0.5s;
  background-color: #f5f5f5;
}

.meg-double-card-body {
  display: flex;
  position: relative;
  width: 100%;
  margin-left: 38px;
}

.detail-card-image-score .meg-score-shadow {
  background-color: red;
  background-size: 100% 100%;
  position: relative;
  font-size: 12px;
  width: 74px;
  height: 24px;
  color: #fff;
  bottom: 118px;
  left: 43%;
  .meg-score-box {
    line-height: 24px;
    background-size: 100% 100%;
    width: 90%;
    height: 90%;
    position: absolute;
    top: 5%;
    left: 5%;
    text-align: center;
    .score-num {
      font-size: 18px;
    }
  }
}

.double-card-score {
  position: absolute;
  bottom: -3px;
  left: 42%;
  transform: translate(-50%);
}

.meg-score .meg-score-shadow {
  background-color: red;
  background-size: 100% 100%;
  position: relative;
  font-size: 12px;
  width: 94px;
  height: 31px;
  color: #fff;
  bottom: 4px;
}

.meg-score .meg-score-box {
  line-height: 32px;
  background-size: 100% 100%;
  width: 90%;
  height: 90%;
  position: absolute;
  top: 5%;
  left: 5%;
  text-align: center;
}

.meg-score-size__large .score-num {
  font-size: 26px;
}

.footer_image_box {
  margin-top: 15px;
  display: flex;
  justify-content: space-around;
  background-image: linear-gradient(to top left, #00000096, #a9a49f);
  height: 180px;
  align-items: center;
  .footer-image-data {
    display: flex;
    justify-content: flex-start;
    width: 95%;
    .image_box_item {
      width: 120px;
      height: 110px;
      cursor: pointer;
      /*border: 2px solid #0088ff;*/
      .inner_image {
        width: 100%;
        height: 100%;
      }
    }
  }

  .footerActive {
    width: 108px;
    border: 2px solid rgb(56, 140, 242);
  }
  .view_footer_arrow {
    cursor: pointer;
    height: 150px;
    line-height: 150px;
  }
}

/* 左上角标签样式 */
.tabs {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: row;
}

.tabs .tab {
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 10px;
  display: inline-block;
  height: 50px;
  line-height: 50px;
  font-size: 16px;
  font-weight: 900;
  color: #435068;
  text-align: center;
  background-color: white;
}
.tabs .active {
  border-bottom: 4px solid #21539b;
  color: #21539b;
}

.detail-compare-info .card-item {
  height: 145px;
}
.detail-compare-info .card-wrapper .card-item.active {
  border: 3px solid #5b98e7;
}

.detail-compare-info .block-title {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 14px;
  color: #435068;
  padding-left: 8px;
}

.detail-compare-info .border-line {
  width: 320px;
  border-bottom: 1px solid #dce1e5;
  margin-bottom: 13px;
  margin-left: -8px;
}

.tab-content table tr {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
}

.tab-content table tr .td-text-right {
  color: #869abb;
  text-align: right;
  width: 90px;
}

.tab-content table tr .td-text-left {
  padding-left: 10px;
}
.split-new-img {
  cursor: pointer;
  margin: 0px 10px 10px 0px;
}
.device-info {
  height: 13px;
  line-height: 23px;
  display: flex;
}
.device-name {
  font-size: 13px;
}
.library-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #fafafa;
}
.library-table td {
  border: 1px solid #ddd;
  padding: 2px 6px;
  background-color: #fff;
}
.library-table tr:nth-child(even) td {
  background-color: #f5f7fa;
}

.compare-card-text,
.panoramic-text {
  font-size: 13px;
}

.panoramic-text .panoramic-text-span {
  margin: 0 10px 5px 0;
  text-align: left;
}
:deep(.el-descriptions__label) {
  width: 15vh;
}
</style>
