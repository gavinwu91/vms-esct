<script setup lang="ts">
import {getDay, imageShow} from "@/views/vehicle/components/index";
import {TabsPaneContext} from "element-plus";
import VehicleUsedInformation from "@/views/vehicle/components/usersms.vue";
import DriverFaceCompare from "@/views/vehicle/components/driverFaceCompare.vue";
import VehicleDatabaseDetail from "@/views/vehicle_db/components/details.vue";
import {getRealIdentity} from "@/api/vehicle_db/index";
import {getVehicleCaptureDetail} from "@/api/retrieval";
import VehicleCaptureTrack from "@/views/vehicle/components/trackPlayback.vue";
import {search} from "@/api/vehicle";

defineOptions({name: 'VehicleCaptureDetail'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})
const mapRandomId = ref(new Date())
const loading = ref(false);
const trackQuery = ref({
  carNo: null,
  captureType: "20",
  searchType: '20',
  searchKey: null,
  key: Math.random(),
  times: [getDay(-3) + " 00:00:00", getDay(-0) + " 23:59:59"],
  source: {},
})

const tools = reactive({
  captureImages: [],
  activeName: "vehicle",

})
const vehicleDetail = ref({});
const vehicleContent = ref({});
const trackData = ref([]);
const init = (outParams: any) => {
  loading.value = true;
  vehicleDetail.value = outParams;
  trackQuery.value.carNo = vehicleDetail.value.licenseCode;
  trackQuery.value.searchKey = vehicleDetail.value.licenseCode;
  trackQuery.value.source = vehicleDetail.value;
  if (outParams.panel) {
    tools.activeName = outParams.panel;
  }
  trackData.value.push(vehicleDetail.value)
  const params = [
    vehicleDetail.value.imgPath2,
    vehicleDetail.value.imgPath,
    vehicleDetail.value.face1,
    vehicleDetail.value.face2
  ];
  params
    .filter(item => !item)
    .forEach(item => {
      tools.captureImages.push("https://192.168.80.185:8443/vehicle_img" + item);
    });
  loading.value = false;
}

const findRealIdentity = ref(false);
const handleClick = (tab: TabsPaneContext, event: Event) => {
  loading.value = true;
  switch (tab.paneName) {
    case "tracking":
      trackQuery.value.carNo = vehicleDetail.value.licenseCode;
      trackQuery.value.searchKey = vehicleDetail.value.licenseCode;
      trackQuery.value.source = vehicleDetail.value;
      mapRandomId.value = new Date();
      break;
    case "vehicleDatabase":
      try {
        getRealIdentity({
          plateNumber: vehicleDetail.value.licenseCode,
          captureTime: vehicleDetail.value.captureTime,
        }).then((res) => {
          vehicleContent.value = res;
          findRealIdentity.value = true;
          loading.value = false;
        });
      } catch (e) {
        console.log(e)
      }
      break;
  }

  loading.value = false;
}

watch(() => props.content, (content) => {
  if (content) {
    init(content)
  }
})

onMounted(() => {
  if (props.content.channel) {
    //说明是第三方过来的id
    getVehicleCaptureDetail(props.content.rid).then((res) => {
      res.panel = "vehicle";
      init(res)
    })
  } else {
    init(props.content)
  }
});

const controlFilter = () => {
}


const loadding = ref(false);
const searchTracking = () => {
  loadding.value = true;
  pageQuery.vehicleCode = vehicleDetail.value.licenseCode;
  search(pageQuery).then(res => {
    trackData.value = [];
    mapRandomId.value = new Date();
    trackData.value = res.data || []
    loadding.value = false;
  })
}

const pageQuery = reactive({
  times: [getDay(-0) + " 00:00:00", getDay(-0) + " 23:59:59"],
  page: 1,
  matchType: "10",
  pageSize: 20,
})
</script>
<style scoped lang="scss">
.filter-box {
  position: absolute;
  z-index: 9999;
  left: 30px;
  top: 1px;
  padding: 5px;
  border-radius: 4px;
  //background: rgb(50 53 57 / 7%);
  background: var(--el-bg-color);
}

.footer-card {
  width: 150px;
  position: relative;
  border: 2px solid transparent;
  text-align: center;
}

.footer-card:hover {
  transition: 0.8s;
  border: 2px solid dodgerblue;
}

.footer-box {
  position: relative;
  cursor: pointer;

}

.score-list {
  background-image: url(public/score_bak.svg);
  background-size: 100% 100%;
  position: absolute;
  width: 80px;
  line-height: 26px;
  bottom: 0;
  left: 17px;
}

.score-list-num {
  display: flex;
  justify-content: center;
  font-size: 18px;
  color: #fafafa;
  font-weight: bold;
}

.score {
  background-image: url(public/score_bak.svg);
  background-size: 100% 100%;
  position: absolute;
  width: 108px;
  line-height: 26px;
  bottom: 4px;
  left: 250px;
}

.score-num {
  display: flex;
  justify-content: center;
  font-size: 26px;
  color: #fafafa;
  font-weight: bold;
}

.detail {
  display: flex;
  justify-content: space-between;
  box-shadow: var(--el-box-shadow-lighter);
}

.capture-params {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin: 10px;

}

.capture-left {
  display: flex;
  flex-direction: column;
  width: 70%;
}

.capture-right {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 30%;
  margin-left: 30px;
  align-content: stretch;
  // box-shadow: var(--el-box-shadow-lighter);
}

.fill-image {
  //width: 800px;
  box-shadow: var(--el-box-shadow-lighter);
}

.face-image {
  width: 150px;
  height: 150px;
  box-shadow: var(--el-box-shadow-lighter);
}

.params-title {
  color: #575b65;
  font-weight: bold;
  line-height: 40px;
}

.params-value {
  color: dodgerblue;
  font-weight: 500;
  line-height: 40px;
}

.location-box {
  display: flex;
  flex-direction: column;
  background: #bfbfbf;
  box-shadow: var(--el-box-shadow-lighter);
}

.font-title {
  font-weight: bold;
  font-size: 16px;
  line-height: 40px;
  color: #484c57;
}

.compare-container {
  display: flex;
}

.comparison-left {
  position: relative;
}

.comparison-image {
  width: 270px;
  height: 320px;
}

.compare-container-footer {
  width: 100%;
  overflow-x: auto;
}

.companion-container {
  display: flex;
  border-bottom: 2px solid #979da9;
}

.companion-footer {
  display: flex;
}

.companion-footer-left {
  margin-top: 5px;
  width: 200px;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.companion-footer-right {
  width: 100%;
  overflow-y: auto;
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

:deep(.el-tabs__item) {
  font-weight: unset;
  font-size: 0.75rem !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  font-size: 0.75rem !important;
}
.vehicle_captured_box {
  right: 1px;
  width: 100%;
  height: 66.3vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;
  filter: contrast(0.75);
}

.vehicle_captured_box img {
  object-fit: fill;
  width: 100%;
  height: 100%;
}

</style>
<template>
  <el-tabs type="card" v-model="tools.activeName" @tab-click="handleClick" v-loading="loading">
    <el-tab-pane label="Vehicle" name="vehicle">
      <el-descriptions border class="box-shadow-radius" :column="3">
        <el-descriptions-item label="Vehicle No" v-if="vehicleDetail.imgPath">
          <el-image
            style="width: 120px;height: 30px;"
            :src="imageShow(vehicleDetail.imgPath)"/>
        </el-descriptions-item>
        <el-descriptions-item label="Vehicle No">{{
            vehicleDetail.licenseCode || "None"
          }}
        </el-descriptions-item>
        <el-descriptions-item label="Speed">{{ vehicleDetail.speed }}&nbsp;km</el-descriptions-item>
        <el-descriptions-item label="Vehicle Type">{{
            vehicleDetail.vehicleType
          }}
        </el-descriptions-item>
        <el-descriptions-item label="Vehicle Color">{{
            vehicleDetail.vehicleColor
          }}
        </el-descriptions-item>
        <el-descriptions-item label="Brand">{{ vehicleDetail.brand }}</el-descriptions-item>
        <el-descriptions-item label="Checkpoint">{{ vehicleDetail.location }}</el-descriptions-item>
        <el-descriptions-item label="Device Name">{{
            vehicleDetail.cameraName
          }}
        </el-descriptions-item>
        <el-descriptions-item label="Link Method" v-if="vehicleDetail.linkMethod===1">Wired
        </el-descriptions-item>
        <el-descriptions-item label="Link Method" v-if="vehicleDetail.linkMethod===2">Wireless
        </el-descriptions-item>
        <el-descriptions-item label="Capture Time">{{
            vehicleDetail.captureTime
          }}
        </el-descriptions-item>
      </el-descriptions>
      <el-divider/>
      <div class="vehicle_captured_box" >
        <img :src="imageShow(vehicleDetail.imgPath2)" />
      </div>
    </el-tab-pane>
    <el-tab-pane label="Location" name="location" style="height: 80vh">
      <VehicleCaptureTrack :content="trackData" v-if="tools.activeName == 'location'"
                           :key="new Date()"/>
    </el-tab-pane>
    <el-tab-pane label="Registration Identity" name="vehicleDatabase">
      <VehicleDatabaseDetail @controlFilter="controlFilter" :content="vehicleContent"
                             v-if="tools.activeName == 'vehicleDatabase' && findRealIdentity"/>
    </el-tab-pane>
    <el-tab-pane label="Driver Face Compare" name="driverFaceCompare"
                 v-if="vehicleDetail.faceHas">
      <DriverFaceCompare :content="vehicleDetail"
                         v-if="tools.activeName == 'driverFaceCompare'"/>
    </el-tab-pane>
    <el-tab-pane label="Tracking" name="tracking" style="height: 80vh;position: relative"
                 v-loading="loadding">
      <div class="filter-box">
        <el-date-picker
          range-separator="To"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="Begin date"
          end-placeholder="End date"
          v-model="pageQuery.times"
          size="default"
          style="margin: auto;font-size: 12px"
          type="datetimerange"/>
        <el-button class="vms-track-button" type="primary" plain size="default" style="margin: 5px" @click="searchTracking"
                   :disabled="loadding">Search
        </el-button>
      </div>
      <VehicleCaptureTrack @controlFilter="controlFilter" :content="trackData"
                           v-if="tools.activeName == 'tracking'" :key="mapRandomId"/>
    </el-tab-pane>
  </el-tabs>

</template>
