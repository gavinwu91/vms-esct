<script setup lang="ts">
import {useAppStore} from "@/store/modules/app";
import {getDay} from "@/views/vehicle/components";
import {page} from "@/api/retrieval";
import {Clock, Close, Location, VideoCamera} from "@element-plus/icons-vue";
import FaceImagePermissions from "@/views/system/FaceImage/index.vue";
import {historyKeywords, videoEventTypes} from "@/api/videoSearch";
import DeviceTreeTemplate from "@/views/system/device/index.vue";
import CommonCaptureLocation from "@/views/system/common/location.vue";
import {FaceCaptureDetail} from "@/views/retrieval/components";

defineOptions({name: 'Video Search'})
const reload = inject<any>("reload");
const appStore = useAppStore()
const tools = ref({
  treeShow: false,
  content: null,
  detail: false,
});
const pageQuery = reactive({
  trackSize: 60,
  page: 1,
  // pageSize: 50,
  keyword: "",
  searchKey: "",
  times: [getDay(-1) + " 00:00:00", getDay(-0) + " 23:59:59"],
  fileList: [],
  features: [],
  devices: [],
  imageUrl: null,
  threshold: 60,
  searchType: "10",
  faceImgBase64: null,
  hasFace: false,
  compareQuerySuccess: false,
  gender: "",
})
const checkNode = (data) => {
  console.log(data)
  pageQuery.devices = data;
  search()
  tools.value.treeShow = false;
}

const cancelSelect = () => {
  tools.value.treeShow = false;
}
const pageSize = ref(50);
const pageData = ref([])
//前端分页
const pageViewData = computed(() => {
  if (pageData) {
    let start = (pageQuery.page - 1) * pageSize.value;
    let end = pageQuery.page * pageSize.value;
    return pageData.value.slice(start, end)
  }
})

const plusSort = (key) => {
  historyKeywords.filter(item => item.id === key.id).map(item => item.sort = (item.sort + 1))
  pageQuery.keyword = key.key;
  keywordData.value = [];
  keywordData.value = historyKeywords.sort((a, b) => b.sort - a.sort);
}

const keywordData = ref([]);
const detail = (item) => {
  mapContent.value.show = false;
  if (item.vehicleCaptured) {
    tools.value.content.rid = item.deviceId;
    tools.value.content.channel = "FaceCapture";
    tools.value.detail2 = true;
  } else {
    tools.value.content = item;
    tools.value.detail = true;
  }
}

onMounted(async () => {
  //隐藏标签
  appStore.setTagsView(false);
  appStore.setCurrentSize('default');
  keywordData.value = historyKeywords;
  page(pageQuery).then(res => {
    pageData.value = res;
  })
})

onUnmounted(() => {
  //组件清理之前  需要还原设置
  appStore.setTagsView(true)
  appStore.setCurrentSize('small');
})


const mapContent = ref({
  val: null,
  show: false,
})
const openLocation = (item) => {
  mapContent.value.show = false;
  mapContent.value.val = item;
  mapContent.value.org = item;
  mapContent.value.show = true;
}
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  overflow: hidden;
  height: calc(100vh - var(--top-tool-height));
  background: var(--default-main-bg2);
}

.top {
  background: transparent;
  border-bottom: 1px white solid;
}

.tags {
  padding: 5px 25px;
}

.search {
  padding: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;

  .item {
    padding: 5px 18px;
    display: flex;
    align-items: center;

    .label {
      font-size: 0.9rem;
      font-width: 500;
    }

    .box {
      margin: 5px;
    }
  }

}

.content {
  display: flex;
}

.result {
  width: 90%;
  height: 75vh;
}

.keyword {
  width: 10%;
}

.p-5px {
  padding: 0 !important;
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

.container-card {
  margin-top: 10px;
  max-width: 100%;
  background: var(--el-bg-color);
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


.card-container {
  padding: 5px;
  max-width: 100%;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  background: transparent;
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


@media (min-width: 1200px) {
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
  .container {
    min-width: 100%;
    max-width: 100%;
  }

  .container-card {
    max-width: 100%;
    min-width: 89%;
  }

  .card-container {
    overflow: auto;
    height: 76.5vh;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    grid-auto-rows: 220px;
  }

  :deep(.el-empty) {
    width: 100% !important;
    height: 75.5vh !important;
  }
}

.keyword-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    padding: 10px;
    text-align: center;
    font-weight: 600;
    font-style: normal;
    font-size: 1rem;
    color: var(--default-main-color);
  }

  .keyword-box {
    .item {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #66778f;
      font-size: 0.85rem;
      font-weight: bold;
      padding: 12px;

      svg {
        width: 20px;
        color: #66778f;
        margin-right: 5px;
      }
    }

    .item:hover {
      color: orangered;

      svg {
        color: orangered;
      }
    }
  }
}
</style>
<!--右下角鹰眼-->
<style scoped lang="scss">
.position:hover {
  svg {
    color: darkorange;
  }
}

.location-map-box {
  position: absolute;
  z-index: 9999;
  right: 5px;
  bottom: 10%;
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
<template>
  <div class="container">
    <div class="top">
      <div class="search">
        <div class="item">
          <el-input class="box" size="default" style="width: 360px"
                    v-model="pageQuery.keyword"
                    placeholder="Please enter keyword search"/>
        </div>
        <div class="item">
          <div class="label">Time</div>
          <el-date-picker
            class="box"
            size="default"
            range-separator="To"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="Start Time"
            end-placeholder="End Time"
            style="width: 450px;margin-left: 10px"
            v-model="pageQuery.times"
            type="datetimerange"/>
        </div>
        <div class="item">
          <div class="label">Threshold</div>
          <el-slider style="width: 230px;margin-left: 20px" size="default"
                     v-model="pageQuery.threshold"/>
        </div>
        <div class="item">
          <div class="label">Device</div>
          <el-input class="box" size="default" style="width: 230px"
                    @click="tools.treeShow = true" v-model="pageQuery.devices" clearable
                    @keyup="tools.treeShow = true"
                    placeholder="Please select device"/>
        </div>
        <el-button class="vms-reset-button" @click="reload" size="default">Reset</el-button>
        <el-button class="vms-main-button" @click="search" size="default">
          Search
        </el-button>
      </div>
      <div class="tags">
        <el-button :key="index" v-for="(item,index) in videoEventTypes"
                   class="vms-main-button" size="default">{{ item.name }}
        </el-button>
      </div>
    </div>
    <div class="content">
      <div class="container-card">
        <div class="card-container" v-if="pageViewData.length>0"
             ref="cardContainer">
          <div v-for="(item,index) in pageViewData" :key="index" class="result-card">
            <div style="display: flex;flex-direction: row" @click="detail(item)">
              <FaceImagePermissions elementType="div" className="capture-image"
                                    :image-path="item.captureUrl"/>

              <div class="time-item">
                <div class="value ">
                  <Clock style=""/>
                  {{ item.captureTime }}
                </div>
              </div>
            </div>
            <div class="score-container" v-show="item.score">
              <div class="score">
                <div class="score-num">{{ item.score }}</div>
              </div>
            </div>
            <div style="display: flex;flex-direction: row">
              <div class="info-item" style="text-align: left">
                <div class="value value-hover" @click="openLocation(item)">
                  <Location/>
                  {{ item.position }}
                </div>
              </div>
              <div class="info-item" style="text-align: left">
                <div class=" value ">
                  <VideoCamera/>
                  {{ item.deviceName }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-empty image-size="150" style="height: 60vh" v-show="pageViewData.length===0"/>
        <el-pagination
          style="padding: 10px;background: var(--default-main-bg2);"
          background
          size="default"
          layout="total,sizes,prev,pager,next"
          :page-sizes="pageQuery.pageSize"
          v-model:current-page="pageQuery.page"
          v-model:page-size="pageSize"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :total="pageData.length"/>
      </div>
      <div class="keyword-container">
        <h5 class="title">HISTORY KEYWORD</h5>
        <div class="keyword-box">
          <div v-for="(item,index) in keywordData" :key="index" class="item"
               @click="plusSort(item)">
            <clock style="width: 20px"/>
            {{ item.key }}
          </div>
        </div>
      </div>
    </div>
    <transition name="el-zoom-in-center">
      <div class="location-map-box"
           v-if="mapContent.show">
        <div class="title">
          <div class="title-left" @click="detail(mapContent.org)">[{{ mapContent.val.dateTime }}]
            {{ mapContent.val.position }}&nbsp;-&nbsp;{{ mapContent.val.deviceName }}
          </div>
          <Close class="location-close-icon" style="width: 20px" @click="mapContent.show=false"/>
        </div>
        <CommonCaptureLocation style="height: 100%;width: 100%" v-if="mapContent.show"
                               :key="mapContent.val" :content="mapContent.val"/>
      </div>
    </transition>
  </div>
  <el-dialog v-model="tools.treeShow" width="450px" title="Device"
             draggable>
    <device-tree-template camera-type="3" @cancelSelect="cancelSelect" @submitSelect="checkNode"/>
  </el-dialog>

  <el-dialog v-model="tools.detail" draggable width="85%" style="margin-top: 5px">
    <FaceCaptureDetail :content="tools.content"
                       v-if="tools.detail"/>
  </el-dialog>
</template>
