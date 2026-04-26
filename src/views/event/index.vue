<script setup lang="ts">
import {useAppStore} from "@/store/modules/app";
import {allEventType, groupEventTypes} from "@/api/event/event";
import {getDay} from "@/views/vehicle/components";
import {getPasserbyInfo, page} from "@/api/retrieval";
import FaceImagePermissions from "@/views/system/FaceImage/index.vue";
import {Close, Location} from "@element-plus/icons-vue";
import CommonCaptureLocation from "@/views/system/common/location.vue";

const appStore = useAppStore()
const response = ref({})
const eventIdx = ref(-1);
const fresh = ref(false);

const pageQuery = reactive({
  trackSize: 60,
  page: 1,
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
onMounted(async () => {
  //隐藏标签
  appStore.setTagsView(false);
  fresh.value = true;
  page(pageQuery).then(res => {
    pageData.value = res;
    currentRow(pageData.value.at(0))
    fresh.value = false;
  })
})

onUnmounted(() => {
  //组件清理之前  需要还原设置
  appStore.setTagsView(true)
})

const currentData = ref({})
const currentRow = async (row) => {
  fresh.value = true;

  currentData.value = await getPasserbyInfo(row.passerbyId);
  currentData.value.position = row.position;
  currentData.value.org = row;
  if (mapContent.value.show){
    openLocation(row)
  }
  fresh.value = false;
}


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
  display: flex;
  width: 100%;
  background: #435080;;
  overflow: hidden;
  height: calc(100vh - var(--top-tool-height));
}

.p-5px {
  padding: 0 !important;
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
}

.detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px;
}

.full-capture-image {
  display: flex;
  flex-shrink: 1;
  height: 260px;
  width: 100%;
  padding: 1px;

  img {
    object-fit: fill;
    width: 100%;
    height: 100%;
    border: 0;
  }
}


.left {
  margin: 5px 5px 0 0;
  width: 15%;
  box-shadow: inset 0 0 5px #94c7e1;
}

.center {
  margin: 5px 5px 0 5px;
  width: 60%;
  box-shadow: inset 0 0 5px #94c7e1;
}

.right {
  margin: 5px 0 0 5px;
  width: 25%;
  box-shadow: inset 0 0 5px #94c7e1;
}


.left-title {
  height: 45px;
  font-weight: bold;
  line-height: 42px;
  font-size: 0.9rem;
  margin: 2px;
  color: #eeeeee;
  text-align: center;
  background: linear-gradient(90deg, #1c1843 0, #1c1843 22%);
  box-shadow: inset 0 0 5px #94c7e1;
}

.warning-link {
  overflow-y: auto;
}

.warning-type {
  color: #ffffff;
  cursor: pointer;
  width: 100%;
  line-height: 40px;
  text-align: center;
  margin-top: 5px;
  font-size: 0.9rem;
  font-weight: 600;
}

.height-hover {
  color: orangered;
  box-shadow: inset 0 0 5px #94c7e1;
}

.warning-type:hover {
  box-shadow: inset 0 0 5px #94c7e1;
  transition: 0.6s;
}

.right-bottom {
  width: 100%;
  border: rgb(235, 238, 245) 1px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  background: transparent;
  margin-top: 3px;
}


</style>
<!--右下角鹰眼-->
<style scoped lang="scss">
.position:hover{
  svg{
    color: darkorange;
  }
}
.location-map-box {
  position: absolute;
  z-index: 9999;
  left: 5px;
  bottom: 5%;
  height: 320px;
  width: 450px;
  max-width: 500px;
  box-shadow: 1px 1px 5px #ccc;


  .title-left:hover {
    /*color: #11a0ff;*/
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
<!--element ui覆盖-->
<style scoped lang="scss">
:deep(.el-table th.el-table__cell) {
  background: var(--default-event-main-color);
}

:deep(.el-table th.el-table__cell.is-leaf) {
  border-bottom: unset;
}

:deep(.el-table tr) {
  background-color: transparent !important;
  cursor: pointer;
  color: white;
}

:deep(.el-table tr:hover) {
  background-color: transparent !important;
  cursor: pointer;
  box-shadow: inset 0 0 5px #94c7e1;
  color: orangered;
}

:deep(.el-table .cell) {
  font-size: 0.9rem !important;
  font-style: normal;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell) {
  background-color: transparent;
}

:deep(.table-header .cell) {
  background-color: transparent !important;
  font-size: 0.9rem !important;
  font-style: normal;
  line-height: 35px;
  color: white;
  background: var(--default-event-main-color);
}

:deep(.el-table__body tr.current-row>td.el-table__cell) {
  background: transparent;
  color: orangered;
  border: 0;
}

:deep(.event-table) {
  padding: 3px;
  background: transparent;
  overflow-x: hidden;
}

:deep(.el-pagination__total) {
  color: white;
  font-size: 0.9rem;
}

:deep(.current-row) {
  background: transparent;
  box-shadow: inset 0 0 5px #94c7e1;
}

.submit-btn {
  width: 80px;
  background: var(--default-event-main-color);
  border-radius: 3px;
  border-color: unset !important;
  border: 0 !important;
}

.submit-btn:hover {
  background: var(--default-main-color);
  border-color: var(--default-event-main-color);
}

:deep(.el-radio.el-radio--small .el-radio__label) {
  color: white;
  font-size: 0.9rem;
}

.early-box {
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.item-descr {
  padding: 3px;
}

:deep(.item-descr .el-descriptions__body) {
  background: transparent;
}

:deep(.item-descr .el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  background: transparent;
  font-size: 0.8rem;
  color: white;

}

:deep(.item-descr .el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell) {
  border: unset;
  border-top: 1px solid white;
  border-bottom: 1px solid white;

}

:deep(.item-descr .el-descriptions__content.el-descriptions__cell.is-bordered-content) {
  color: white;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background: orangered;
}
</style>
<template>
  <div class="container">
    <div class="left box-shadow-radius">
      <div class="left1" v-for="(group,index) in groupEventTypes" :key="index">
        <h6 class="left-title box-shadow-radius">{{ group.name }}</h6>
        <div class="warning-link">
          <div class="warning-type" :class="{'height-hover':(ek+group.source)===eventIdx}"
               v-for="(event,ek) in group.data" :key="ek" @click="eventIdx=(ek+group.source)">
            {{ event.name }}
          </div>
        </div>
      </div>
    </div>
    <div class="center box-shadow-radius">
      <div style="box-shadow: inset 0 0 5px #94c7e1;">
        <el-radio-group v-model="pageQuery.updataStatus" style="padding: 10px 15px;font-size: 1rem">
          <el-radio label="">All</el-radio>
          <el-radio :label="10">Pending</el-radio>
          <el-radio :label="20">Valid</el-radio>
          <el-radio :label="30">Invalid</el-radio>
          <el-radio :label="40">Processed</el-radio>
        </el-radio-group>
      </div>
      <el-table height="84vh" class-name="event-table" header-cell-class-name="table-header"
                highlight-current-row
                @row-click="currentRow"
                :data="pageViewData">
        <el-table-column label="Capture Face" prop="summary" min-width="180">
          <template #default="{row}">
            <FaceImagePermissions elementType="div" className="capture-image-list"
                                  :image-path="row.captureUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="Device Name" prop="deviceName" min-width="180"/>
        <el-table-column label="Lat" prop="lat" min-width="180"/>
        <el-table-column label="Lon" prop="lon" min-width="180"/>
        <el-table-column label="Event Time" prop="captureTime" min-width="180"/>
        <el-table-column label="Process Status" prop="summary" min-width="180">
          <template #default>
            Mock
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="float: right;margin: 13px"
        background
        size="default"
        layout="total,sizes,prev,pager,next"
        :page-size="pageQuery.pageSize"
        v-model:current-page="pageQuery.page"
        v-model:page-size="pageQuery.pageSize"
        :total="allEventType.length"/>
    </div>
    <div class="right box-shadow-radius" v-loading="fresh">
      <div class="right1">
        <h6 class="left-title box-shadow-radius">Details of Event</h6>
        <div style="display: flex;align-items: center;justify-content: center">
          <FaceImagePermissions elementType="div" className="capture-image"
                                :image-path="currentData.capture_url"/>
        </div>
        <el-descriptions border :column="1" size="default" class="item-descr">
          <el-descriptions-item label="Device Name">{{ currentData.device_name }}
          </el-descriptions-item>
          <el-descriptions-item label="Position">
            <el-link type="warning" class="position" @click="openLocation(currentData.org)">
              <Location style="color: #c8e1ff; width: 20px;"/>{{ currentData.position }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="Gender">{{ currentData.genderStr }}</el-descriptions-item>
          <el-descriptions-item label="Age">{{ currentData.age }}</el-descriptions-item>
          <el-descriptions-item label="Beard">{{ currentData.beardStatusStr }}
          </el-descriptions-item>
          <el-descriptions-item label="Head Wear">{{ currentData.headwearStatusStr }}
          </el-descriptions-item>
          <el-descriptions-item label="Event Time" style="color: orangered">
            {{ currentData.capture_time }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="full-capture-image">
          <img :src="currentData.capture_panorama_url"/>
        </div>
      </div>
      <!--      <div class="right4" v-show="type===20 &&(vehicle.face1 || vehicle.face2)">-->
      <!--        <h6 class="left-title box-shadow-radius">Face Snapshot Information</h6>-->
      <!--        <div style="display: flex;justify-content: center;align-items: center;">-->
      <!--          <el-image class="capture-image"-->
      <!--                    style="width: 80px"-->
      <!--                    v-show="vehicle.face1"-->
      <!--                    :preview-src-list="[imageShow(vehicle.face1)]"-->
      <!--                    :src="imageShow(vehicle.face1)">-->
      <!--            <span slot="error"></span>-->
      <!--          </el-image>-->
      <!--          <el-image class="capture-image"-->
      <!--                    style="width: 80px"-->
      <!--                    v-show="vehicle.face2"-->
      <!--                    :preview-src-list="[imageShow(vehicle.face2)]"-->
      <!--                    :src="imageShow(vehicle.face2)">-->
      <!--            <span slot="error"></span>-->
      <!--          </el-image>-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <div class="right2">-->
      <!--        <h6 class="left-title box-shadow-radius">Snapshot Information</h6>-->
      <!--        <div style="display: flex;">-->
      <!--          <el-image class="capture-image"-->
      <!--                    v-show="type===10"-->
      <!--                    :preview-src-list="[faceUrlReplace(identity.capture_panorama_url)]"-->
      <!--                    :src="faceUrlReplace(identity.capture_panorama_url)">-->
      <!--            <span slot="error"></span>-->
      <!--          </el-image>-->
      <!--          <el-image class="capture-image"-->
      <!--                    v-show="type===20"-->
      <!--                    :preview-src-list="[imageShow(vehicle.imgPath2)]"-->
      <!--                    :src="imageShow(vehicle.imgPath2)">-->
      <!--            <span slot="error"></span>-->
      <!--          </el-image>-->
      <!--          <el-image class="capture-image"-->
      <!--                    v-show="type===30"-->
      <!--                    :preview-src-list="[faceEventUrl(eventObject.picName)]"-->
      <!--                    :src="faceEventUrl(eventObject.picName)">-->
      <!--            <span slot="error"></span>-->
      <!--          </el-image>-->
      <!--        </div>-->
      <!--      </div>-->
      <div class="right3">
        <h6 class="left-title box-shadow-radius">Early Event Processing</h6>
        <div class="early-box" >
          <el-radio-group v-model="pageQuery.updataStatus" disabled>
            <el-radio :label="10">Pending</el-radio>
            <el-radio :label="20">Valid</el-radio>
            <el-radio :label="30">Invalid</el-radio>
            <el-radio :label="40">Processed</el-radio>
          </el-radio-group>
          <el-button  class="vms-main-button" size="default" style="width: 80px;margin: 5px" @click="process" disabled  >
            Submit
          </el-button>
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
</template>



