<script setup lang="ts">
import { getAccessToken } from '@/utils/auth'
import { getKsProxyUrl } from '@/api/common/index'
import { config } from '@/utils/runtimeConfig'
// const UPLOAD_URL = import.meta.env.VITE_BASE_URL + `/admin-api/biz/retrieval/uploadImageToBase64`
const UPLOAD_URL = `${config.VITE_BASE_URL}/admin-api/biz/retrieval/uploadImageToBase64`
const HEADERS = { Authorization: 'Bearer ' + getAccessToken() } // 设置上传的请求头部
import { FaceCaptureDetail } from './components'
import { Clock, Close, Delete, Location, Right, VideoCamera } from '@element-plus/icons-vue'
import {
  genFileId,
  TabsPaneContext,
  UploadInstance,
  UploadProps,
  UploadRawFile
} from 'element-plus'
import { getDevices, getFaceImageRect, getFeatures, getGenderList, page } from '@/api/retrieval'
import VehicleCaptureDetail from '@/views/vehicle/components/detail.vue'
import { getDay, getImageUrl } from '@/views/vehicle/components'
import TrackPlayback from '@/views/retrieval/components/trackPlayback.vue'
import FaceImagePermissions from '@/views/system/FaceImage/index.vue'
import DeviceTreeTemplate from '@/views/system/device/index.vue'
import CommonCaptureLocation from '@/views/system/common/location.vue'

const tools = ref({
  treeShow: false,
  removeFlag: false,
  content: {
    rid: '',
    channel: ''
  },
  detail: false,
  detail2: false,
  faceSelect: false,
  hasFace: false,
  resultTable: '10',
  features: [],
  genders: [],
  devices: [],
  featureProps: {
    multiple: true,
    value: 'value',
    label: 'code',
    children: 'next'
  },
  deviceProps: {
    multiple: true,
    value: 'code',
    label: 'value',
    children: 'next'
  },
  loading: false
})

const pageSize = ref(50)
const pageQuery = reactive({
  trackSize: 60,
  page: 1,
  // pageSize: 50,
  searchKey: '',
  times: [getDay(-1) + ' 00:00:00', getDay(-0) + ' 23:59:59'],
  fileList: [],
  features: [],
  devices: [],
  imageUrl: null,
  threshold: 60,
  searchType: '10',
  faceImgBase64: null,
  hasFace: false,
  compareQuerySuccess: false,
  gender: ''
})

const reload = inject<any>('reload')

const $route = useRoute()

const checkNode = (data) => {
  console.log(data)
  pageQuery.devices = data
  search()
  tools.value.treeShow = false
}

const cancelSelect = () => {
  tools.value.treeShow = false
}

const init = () => {
  if ($route.query && $route.query.imageUrl) {
    imageSearch($route.query.imageUrl)
  } else {
    page(pageQuery).then((res) => {
      pageData.value = res
      if (pageQuery.hasFace && pageData.value) {
        pageQuery.compareQuerySuccess = true
      }
      tools.value.loading = false
    })
  }
}

const pageData = ref([])

const imageSearch = (image) => {
  tools.value.loading = true
  pageQuery.faceImgBase64 = image
  pageQuery.imageUrl = image
  pageQuery.searchType = '30'
  pageQuery.hasFace = true
  tools.value.faceSelect = false
  // pageViewData.value = [];
  pageData.value = []
  page(pageQuery).then((res) => {
    pageData.value = res
    if (pageQuery.hasFace && pageData.value) {
      pageQuery.compareQuerySuccess = true
    }
    tools.value.loading = false
  })
}

const cardContainer = ref({})
const changeTypeSearch = () => {
  tools.value.loading = true
  pageData.value = []
  page(pageQuery).then((res) => {
    pageData.value = res
    tools.value.loading = false
  })
}

const search = () => {
  showTrack.value = false
  tools.value.loading = true
  pageData.value = []
  if (!pageQuery.devices) {
    pageQuery.devices = []
  }
  if (pageQuery.hasFace) {
    pageQuery.searchType = '30'
  }
  // await page(pageQuery);
  page(pageQuery).then((res) => {
    pageData.value = res
    if (pageQuery.hasFace && pageData.value) {
      pageQuery.compareQuerySuccess = true
    }
    tools.value.loading = false
  })
}

//前端分页
const pageViewData = computed(() => {
  if (pageData) {
    let start = (pageQuery.page - 1) * pageSize.value
    let end = pageQuery.page * pageSize.value
    return pageData.value.slice(start, end)
  }
})

const handleSizeChange = async (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  nextTick(() => {
    tools.value.loading = true
    if (cardContainer.value) {
      cardContainer.value.scrollTop = 0
      tools.value.loading = false
    }
  })
}

onMounted(() => {
  getFeatures().then((res) => {
    tools.value.features = res
  })
  getGenderList().then((res) => {
    tools.value.genders = res
  })
  getDevices().then((res) => {
    tools.value.devices = res
  })
  init()
})
const currentTreeNodeId = ref({})

function handleNodeClick(data) {
  currentTreeNodeId.value = data.id
  // fetchTableData()
}

const changeType = async (tab: TabsPaneContext, event: Event) => {
  pageQuery.searchType = tab.paneName
  await changeTypeSearch()
}

const removeImage = () => {
  pageQuery.imageUrl = ''
  tools.value.removeFlag = false
  pageQuery.compareQuerySuccess = false
  multipartFace.value = []
  pageQuery.hasFace = false
}

const multipartFace = ref([])
const upload = ref<UploadInstance>()
const uploadSuccess: UploadProps['onSuccess'] = async (response, uploadFile, uploadFiles): void => {
  tools.value.loading = true
  pageQuery.imageUrl = response.data.base64
  try {
    pageQuery.compareQuerySuccess = false
    multipartFace.value.push(response.data.base64)
    const faceImageRect = await getFaceImageRect({ portraitImageUrl: response.data.base64 })
    if (faceImageRect) {
      for (let i = 0; i < faceImageRect.length; i++) {
        multipartFace.value.push(faceImageRect[i].base64)
      }
      pageQuery.imageUrl = faceImageRect[faceImageRect.length - 1].base64
    }
  } catch (e) {
  } finally {
    pageQuery.faceImgBase64 = response.data.base64
    pageQuery.hasFace = true
    tools.value.loading = false
  }
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

const detail = (item) => {
  mapContent.value.show = false
  if (item.vehicleCaptured) {
    tools.value.content.rid = item.deviceId
    tools.value.content.channel = 'FaceCapture'
    tools.value.detail2 = true
  } else {
    tools.value.content = item
    tools.value.detail = true
  }
}

const mapContent = ref({
  val: null,
  show: false
})
const openLocation = (item) => {
  mapContent.value.show = false
  mapContent.value.val = item
  mapContent.value.org = item
  mapContent.value.show = true
}

const mapContentHover = (item) => {
  if (mapContent.value.show) {
    openLocation(item)
  }
}

const showTrack = ref(false)
const trackData = ref({
  data: [],
  compareUrl: ''
})
const track = () => {
  showTrack.value = false
  tools.value.loading = true
  trackData.data = []
  if (pageQuery.trackSize == 0) {
    pageQuery.trackSize = 60
  }
  //大于60个就没必要在展示后面的了，直接切割
  trackData.value.data =
    pageData.value.length > pageQuery.trackSize
      ? pageData.value.slice(0, pageQuery.trackSize)
      : pageData.value
  trackData.value.compareUrl = pageQuery.imageUrl
  showTrack.value = true
  tools.value.loading = false
}
</script>
<template>
  <div class="face-search-container" v-loading="tools.loading">
    <el-splitter>
      <el-splitter-panel size="18%" :collapsible="true" :resizable="false">
        <div class="condition">
          <div class="title-box">
            <el-button class="vms-reset-button" @click="reload" size="default">Reset</el-button>
            <el-button class="vms-main-button" @click="search" size="default"> Search </el-button>
            <el-button
              class="vms-track-button"
              size="default"
              v-show="pageQuery.compareQuerySuccess && pageData.length > 0"
              @click="track"
            >
              Track
            </el-button>
          </div>
          <el-divider />
          <el-form
            label-position="top"
            size="default"
            v-model="pageQuery"
            style="max-width: 360px; margin: auto; padding: 5px; overflow-y: auto"
          >
            <el-form-item style="align-items: baseline">
              <div class="normal-box">
                <el-upload
                  ref="upload"
                  style="margin: 5px 5px 5px -30px"
                  :action="UPLOAD_URL"
                  :headers="HEADERS"
                  :on-success="uploadSuccess"
                  :show-file-list="false"
                  :on-exceed="handleExceed"
                >
                  <el-image
                    :src="pageQuery.imageUrl"
                    v-if="pageQuery.imageUrl"
                    class="upload-image"
                    @mouseover="tools.removeFlag = true"
                    @mouseleave="tools.removeFlag = false"
                  />
                  <el-image v-else src="default_face.png" class="upload-image" />
                </el-upload>
                <div
                  class="multipart-face"
                  v-show="multipartFace.length > 1"
                  @click="tools.faceSelect = true"
                >
                  <el-badge :value="multipartFace.length">
                    <el-avatar :src="multipartFace[multipartFace.length - 1]" :size="40" />
                  </el-badge>
                </div>
                <el-icon
                  @mouseover="tools.removeFlag = true"
                  class="remove-image"
                  title="Remove Image"
                  v-show="tools.removeFlag"
                  @click="removeImage"
                >
                  <Delete />
                </el-icon>
              </div>
            </el-form-item>
            <el-divider />
            <div class="filter-over">
              <el-form-item label="Time Range">
                <el-date-picker
                  range-separator="To"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  start-placeholder="Begin date"
                  end-placeholder="End date"
                  style="width: 120px; margin: auto"
                  v-model="pageQuery.times"
                  type="datetimerange"
                />
              </el-form-item>
              <el-form-item label="Device">
                <el-input
                  @click="tools.treeShow = true"
                  v-model="pageQuery.devices"
                  clearable
                  @keyup="tools.treeShow = true"
                  placeholder="Please select device"
                />
              </el-form-item>
              <el-form-item label="Features">
                <el-cascader
                  placeholder="Please select features"
                  v-model="pageQuery.features"
                  :options="tools.features"
                  :props="tools.featureProps"
                  style="width: 330px; margin: auto"
                  clearable
                  collapse-tags
                  filterable
                />
              </el-form-item>
              <el-form-item label="Gender">
                <el-select
                  v-model="pageQuery.gender"
                  placeholder="Please select gender"
                  style="width: 330px; margin: auto"
                >
                  <el-option label="All" value="">All</el-option>
                  <el-option label="Male" value="1">Male</el-option>
                  <el-option label="Female" value="2">Female</el-option>
                  <el-option label="UnKnown" value="9">UnKnown</el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Face Similarity">
                <div class="normal-box">
                  <el-input
                    v-model="pageQuery.threshold"
                    style="width: 70px"
                    maxlength="3"
                    clearable
                  />
                  &emsp;
                  <el-slider
                    style="width: 200px; margin-left: 5px"
                    size="small"
                    v-model="pageQuery.threshold"
                  />
                </div>
              </el-form-item>
              <el-form-item
                label="Number Of Track Displays "
                v-show="pageQuery.compareQuerySuccess && pageData.length > 0"
              >
                <div class="normal-box">
                  <el-input
                    v-model="pageQuery.trackSize"
                    style="width: 70px"
                    maxlength="3"
                    clearable
                  />
                  &emsp;
                  <el-slider
                    style="width: 230px; margin-left: 5px"
                    size="small"
                    v-model="pageQuery.trackSize"
                  />
                </div>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </el-splitter-panel>
      <el-splitter-panel>
        <track-playback
          :key="new Date()"
          class="map-container"
          v-if="showTrack"
          v-show="showTrack"
          :content="trackData"
        />
        <div class="container-card" v-show="!showTrack">
          <div class="card-container" v-if="pageViewData.length > 0" ref="cardContainer">
            <div
              v-for="(item, index) in pageViewData"
              :key="index"
              class="result-card"
              @mouseenter="mapContentHover(item)"
            >
              <div style="display: flex; flex-direction: row" @click="detail(item)">
                <FaceImagePermissions
                  elementType="div"
                  className="capture-image"
                  :image-path="getKsProxyUrl(item.captureUrl)"
                />

                <div class="time-item">
                  <div class="value">
                    <Clock style="" />
                    {{ item.captureTime }}
                  </div>
                </div>
              </div>
              <div class="score-container" v-show="item.score">
                <div class="score">
                  <div class="score-num">{{ item.score }}</div>
                </div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div class="info-item" style="text-align: left">
                  <div class="value value-hover" @click="openLocation(item)">
                    <Location />
                    {{ item.position }}
                  </div>
                </div>
                <div class="info-item" style="text-align: left">
                  <div class="value">
                    <VideoCamera />
                    {{ item.deviceName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty image-size="150" style="height: 60vh" v-show="pageViewData.length === 0" />
          <el-pagination
            style="float: right; margin: 13px"
            background
            layout="total,sizes,prev,pager,next"
            :size="pageQuery.pageSize"
            v-model:current-page="pageQuery.page"
            v-model:page-size="pageSize"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            :total="pageData.length"
          />
        </div>
      </el-splitter-panel>
    </el-splitter>
    <transition name="el-zoom-in-center">
      <div class="location-map-box" v-if="mapContent.show">
        <div class="title">
          <div class="title-left" @click="detail(mapContent.org)"
            >[{{ mapContent.val.dateTime }}] {{ mapContent.val.position }}&nbsp;-&nbsp;{{
              mapContent.val.deviceName
            }}</div
          >
          <Close class="location-close-icon" style="width: 20px" @click="mapContent.show = false" />
        </div>
        <CommonCaptureLocation
          style="height: 100%; width: 100%"
          v-if="mapContent.show"
          :key="mapContent.val"
          :content="mapContent.val"
        />
      </div>
    </transition>
  </div>
  <el-dialog v-model="tools.treeShow" width="450px" title="Device" draggable>
    <device-tree-template
      camera-type="3"
      @cancel-select="cancelSelect"
      @submit-select="checkNode"
    />
  </el-dialog>
  <el-dialog v-model="tools.detail2" draggable width="90%" style="margin-top: 5px">
    <VehicleCaptureDetail :content="tools.content" v-if="tools.detail2" />
  </el-dialog>
  <el-dialog v-model="tools.detail" draggable width="85%" style="margin-top: 5px">
    <FaceCaptureDetail :content="tools.content" v-if="tools.detail" />
  </el-dialog>
  <el-dialog
    v-model="tools.faceSelect"
    draggable
    width="50%"
    style="margin-top: 5px"
    title="Multipart Face Select"
  >
    <div class="select-face-container">
      <el-divider />
      <div class="select-face-box">
        <div v-for="(src, index) in multipartFace" :key="index">
          <el-tooltip trigger="hover" placement="bottom">
            <template #content>
              <el-image
                style="width: 30px; height: 25px; cursor: pointer"
                title="Face Captured Search"
                :src="getImageUrl('face_search.svg')"
                @click="imageSearch(src)"
              />
            </template>
            <el-image class="select-face-image" :src="src" />
          </el-tooltip>
        </div>
      </div>
      <el-divider />
    </div>
  </el-dialog>
</template>
<!--右下角鹰眼-->
<style scoped>
:deep(.el-card__footer) {
  padding: 10px;
}

.face-search-container {
  width: 100%;
  height: 90vh;
  overflow: hidden;
  display: flex;
}

.title-box {
  margin: 5px;
  display: flex;
  justify-content: flex-end;
  line-height: 40px;
}

.normal-box {
  display: flex;
  width: 100%;
  position: relative;
  justify-content: center;
}

.multipart-face {
  position: absolute;
  right: 8px;
  top: 9px;
  border: transparent 2px solid;
  cursor: pointer;
  border-radius: 60%;
  height: 45px;
  width: 45px;
}

.multipart-face:hover {
  transform: 0.3s;
  border: solid 1px #21539b;
}

.upload-image {
  width: 170px;
  height: 170px;
  border: solid 2px transparent;
  cursor: pointer;
}

.upload-image:hover {
  transition: 0.8s;
  border: solid 1px #21539b;
}

:deep(.el-card__body) {
  padding: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}

.score {
  background: url('../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 80px;
  line-height: 20px;
  bottom: 4px;
  left: 5rem;
}

.score-num {
  display: flex;
  justify-content: center;
  font-size: 0.8rem;
  color: #fafafa;
  font-weight: bold;
}

:deep(.el-date-editor .el-range-input) {
  font-size: 12px;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: bold;
  font-size: 15px;
}

.map-container {
  border: 2px solid;
  border-radius: 12px;
  padding: 5px;
}

.card-container {
  max-width: 100%;
  width: 100%;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  background: var(--el-bg-color);
}

.card-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  margin-right: 0;
}

.card-container::-webkit-scrollbar-track {
  background: transparent;
}

.card-container::-webkit-scrollbar-thumb {
  background: var(--el-bg-color);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.card-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.container-card {
  max-width: 100%;
  background: var(--el-bg-color);
  margin-left: 10px;
  background: transparent;
}

.condition {
  color: var(--el-text-color-primary);
  margin-right: 10px;
  height: 90vh;
}

.result-card {
  overflow: hidden;
  cursor: pointer;
  max-height: 220px;
  height: 220px;
  position: relative;
  background-color: #fff;
  box-shadow: 1px 1px 5px #ccc;
}

.result-card:hover {
  transform: translateY(-5px);
  transition: 0.8s;
}

.select-face-image {
  width: 150px;
  height: 150px;
  margin: 10px;
  cursor: pointer;
  border: transparent 2px solid;
}

.select-face-image:hover {
  border: #0d9bf2 solid 2px;
}

.select-face-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.select-face-box {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 350px;
  width: 100%;
  overflow-y: auto;
  align-content: flex-start;
}

.score-container {
  position: relative;
  display: flex;
}

.score {
  background: url('../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 94px;
  line-height: 24px;
  bottom: 0;
  left: 38px;
}

.score-num {
  font-style: italic;
  font-size: 0.9rem;
  color: #fafafa;
  font-weight: bold;
}

:deep(.el-date-editor .el-range-separator) {
  font-size: 10px;
}

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

:deep(.el-slider) {
  --el-slider-main-bg-color: var(--default-main-color) !important;
}

.remove-image {
  position: absolute;
  top: 12px;
  right: 95px;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  color: var(--default-main-color);
  margin: 5px;
}

.remove-image:hover {
  color: white;
  background: var(--default-main-color);
}

.filter-over {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0;
}

.container-card {
  max-width: 100%;
  background: var(--el-bg-color);
  margin-left: 10px;
  background: transparent;
}

:deep(.container-card .el-card__body) {
  background: var(--el-bg-color);
  background: transparent;
  padding: 0 !important;
  border: unset;
  box-shadow: unset;
  background: unset;
}

.container-card {
  border-left: 0 !important;
}

@media (min-width: 1200px) {
  .container-card {
    max-width: 100%;
  }

  .card-container {
    overflow: auto;
    height: 84vh;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    grid-auto-rows: 220px;
  }

  :deep(.el-empty) {
    width: 100% !important;
    height: 75.5vh !important;
  }
}

.box-title .right-title {
  color: white;
  background: #3b9d95;
  font-size: 0.6rem;
  padding: 3px;
  font-weight: bold;
  margin-left: 3px;
}

.box-title .left-title {
  color: white;
  background: #1da9f5;
  font-size: 0.6rem;
  font-weight: bold;
  padding: 3px;
}

:deep(.el-date-editor .el-range-input) {
  font-size: 12px;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: bold;
  font-size: 15px;
}

:deep(.el-date-editor .el-range-input) {
  font-size: 0.75rem;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: bold;
  font-size: 0.75rem;
}

:deep(.el-form-item--default) {
  font-size: 0.75rem;
}

:deep(.el-date-editor .el-range-separator) {
  font-size: 0.75rem;
}

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

:deep(.el-link) {
  font-size: 0.78rem !important;
}

:deep(.el-splitter-bar__dragger) {
  border: 0 !important;
}

.container-card {
  border-left: 0 !important;
  border-left: unset;
}

:deep(.el-tabs__item) {
  font-size: 0.75rem;
}

:deep(.el-splitter-bar__disable:before) {
  width: 0;
}

:deep(.el-splitter-bar__collapse-icon) {
  width: 20px !important;
  height: 40px !important;
}

:deep(.el-splitter-bar__collapse-icon:hover) {
  width: 20px !important;
  height: 40px !important;
  background: var(--default-main-color) !important;
  color: white;
  font-size: 0.8rem;
}

:deep(.result-tabs-title .el-tabs__item) {
  font-size: 0.82rem;
}

:deep(.el-pagination--small .el-pager li) {
  font-size: var(--el-pagination-font-size);
  height: var(--el-pagination-button-height);
  line-height: var(--el-pagination-button-height);
  min-width: var(--el-pagination-button-width);
}

:deep(.el-pagination--small span:not([class*='suffix'])) {
  font-size: var(--el-pagination-font-size);
}

.value-hover {
  cursor: pointer;
}

.value-hover:hover {
  color: orangered;
}

.info-item {
  align-items: center;
  padding: 15px;
  color: #2b4664;

  .value-hover {
    cursor: var(--el-button-hover-bg-color);
  }

  .value-hover:hover {
    color: orangered;
  }

  .value {
    color: var(--default-main-color);
    font-weight: 500;
    font-size: 0.85rem;
    display: flex;

    svg {
      width: 15px;
      height: 15px;
    }
  }

  .value:first-letter {
  }
}

.time-item {
  .value {
    padding-top: 50px;
    padding-left: 20px;
    display: flex;
    word-break: initial;
    float: right;
    color: var(--default-main-color);
    font-weight: 500;
    font-size: 0.85rem;

    svg {
      width: 15px;
      height: 15px;
    }
  }
}
</style>

<style scoped lang="scss">
.location-map-box {
  position: absolute;
  z-index: 9999;
  right: 5px;
  bottom: 13%;
  height: 320px;
  width: 450px;
  max-width: 500px;
  box-shadow: 1px 1px 5px #ccc;

  .title-left:hover {
    color: #11a0ff;
    transition: 0.8s;
  }

  .title-left {
    cursor: pointer;
  }

  .title {
    cursor: pointer;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    box-shadow: inset 0 0 5px #d3f0ff;
    background: var(--top-bar-bg);
    font-weight: 700;
    color: white;
    font-size: 0.8rem;
    padding: 10px;
    .location-close-icon {
      cursor: pointer;
      height: 20px;
    }

    .location-close-icon:hover {
      color: orangered;
      transition: 0.8s;
    }
  }
}
</style>
