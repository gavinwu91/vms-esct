<script setup lang="ts">
import {getDay, imageShow} from './components'
import {
  queryCheckpoints,
  search,
  VehicleCaptureInfo
} from "@/api/vehicle/index";
import {
  Close,
  Link, Location,
  Odometer,
  Timer,
  VideoCamera
} from "@element-plus/icons-vue";
import VehicleCaptureDetail from "@/views/vehicle/components/detail.vue";
import {ElLoading} from "element-plus";
import VehicleCaptureTrack from "@/views/vehicle/components/trackPlayback.vue";
import DeviceTreeTemplate from "@/views/system/device/index.vue";
import CommonCaptureLocation from "@/views/system/common/location.vue";

const reload = inject<any>("reload");
const pageQuery = reactive({
  filterShow: true,
  page: 1,
  pageSize: 50,
  cameraIdList: [],
  times: [getDay(-0) + " 00:00:00", getDay(-0) + " 23:59:59"],
  sort: 2,
  vehicleCode: "",
  matchType: '20',
  color: [],
  brand: [],
  trackSize: 60,
  compareQuerySuccess: false,
})

const result = ref({
  total: 0,
  data: [] as VehicleCaptureInfo | any,
  dataTotal: 0,
})

const controlFilter = () => {
  pageQuery.filterShow = !pageQuery.filterShow;
}

const tools = reactive({
  treeShow: false,
  captureDetail: false,
  previewList: [],
  showPreview: false,
  resultTable: "10",
  content: null,
  cascaderProps: {
    multiple: true,
    value: 'code',
    label: 'value',
    children: 'next'
  },
  cascaderOptions: [],
  color: [
    {
      label: "silver",
      value: "Silver",
    },
    {
      label: "Gray",
      value: "Gray",
    },
    {
      label: "Pink",
      value: "Pink",
    },
    {
      label: "Red",
      value: "Red",
    },
    {
      label: "Yellow",
      value: "Yellow",
    },
    {
      label: "Green",
      value: "Green",
    },
    {
      label: "Blue",
      value: "Blue",
    },
    {
      label: "Brown",
      value: "Brown",
    },
    {
      label: "white",
      value: "white",
    },
    {
      label: "Black",
      value: "Black",
    },
    {
      label: "Purple",
      value: "Purple",
    },
    {
      label: "Darkorange",
      value: "Darkorange",
    },
    {
      label: "orange",
      value: "orange",
    },
  ],
  brands: [
    "ACURA",
    "ALFAROMEO",
    "ALLION",
    "ASHOKLEYLAND",
    "ASTONMARTIN",
    "AUDI",
    "ACURA",
    "ALLION",
    "ASHOKLEYLAND",
    "ASTONMARTIN",
    "AUDI",
    "BEIBENTRUCK",
    "BEIJING",
    "BENTLEY",
    "BENZ",
    "BMC",
    "BMW",
    "BUICK",
    "BYD",
    "BEIJING",
    "BENTLEY",
    "BENZ",
    "BUICK",
    "CADILLAC",
    "CHANGAN",
    "CHENGLONG",
    "CHERY",
    "CHEVROLET",
    "CHRYSLER",
    "CHUANQI",
    "CITROEN",
    "CMC",
    "COROLLA",
    "CROWN",
    "CADILLAC",
    "CHANGAN",
    "CHENGLONG",
    "CHERY",
    "CHEVROLET",
    "CHRYSLER",
    "CHUANQI",
    "CITROEN",
    "COROLLA",
    "CROWN",
    "DAEWOO",
    "DAF",
    "DAIHATSU",
    "DATSUN",
    "DF",
    "DS",
    "DAEWOO",
    "DATSUN",
    "EMGRAND",
    "ESTIMA",
    "EMGRAND",
    "ESTIMA",
    "FERRARI",
    "FIAT",
    "FORD",
    "FOTON",
    "FREIGHTLINER",
    "FERRARI",
    "FIAT",
    "FORD",
    "FOTON",
    "FREIGHTLINER",
    "GEELY",
    "GMC",
    "GREAT WALL",
    "GEELY",
    "GREAT WALL",
    "HAFU",
    "HAIGE",
    "HANGTIANCHENGGONG",
    "HARRIER",
    "HICOM",
    "HINO",
    "HONDA",
    "HONGYAN",
    "HUALING",
    "HYUNDAI",
    "HAFU",
    "HAIGE",
    "HARRIER",
    "HICOM",
    "HINO",
    "HONDA",
    "HONGYAN",
    "HUALING",
    "HYUNDAI",
    "IKCO",
    "INFINITI",
    "INOKOM",
    "INTERNATION",
    "IVECOIRISBUS",
    "INFINITI",
    "INOKOM",
    "INTERNATION",
    "IVECOIRISBUS",
    "JAC",
    "JAGUAR",
    "JEEP",
    "JETOUR",
    "JINBEI",
    "JINGLONG",
    "JINLV",
    "JINNING",
    "JMC",
    "JAGUAR",
    "JEEP",
    "JETOUR",
    "JINLV",
    "JINNING",
    "JINBEI",
    "JINGLONG",
    "KAMA",
    "KENWORTH",
    "KIA",
    "KUBO",
    "KENWORTH",
    "KIA",
    "KUBO",
    "LANDROVER",
    "LEXUS",
    "LIFAN",
    "LINCOLN",
    "LSUZU",
    "LANDROVER",
    "LEXUS",
    "LIFAN",
    "LINCOLN",
    "LSUZU",
    "LYBRA",
    "MAHINDRA",
    "MAN",
    "MARCOPOLO",
    "MARCOPOLOVOLARE",
    "MASERATI",
    "MAZDA",
    "MERCURY",
    "MG",
    "MINI",
    "MITSUBISHI",
    "MAHINDRA",
    "MARCOPOLO",
    "MARCOPOLOVOLARE",
    "MASERATI",
    "MAZDA",
    "MERCURY",
    "MITSUBISHI",
    "NAVECO",
    "NAZA",
    "NISSAN",
    "NONE",
    "NAVECO",
    "NAZA",
    "NISSAN",
    "NONE",
    "OPEL",
    "OTOKAR",
    "OPEL",
    "OTOKAR",
    "PERODUA",
    "PEUGEOT",
    "PONTIAC",
    "PORSCHE",
    "PROTON",
    "PERODUA",
    "PEUGEOT",
    "PORSCHE",
    "RAM",
    "RENAULT",
    "ROLLSROYCE",
    "RENAULT",
    "ROLLSROYCE",
    "SAAB",
    "SAIPA",
    "SCANIA",
    "SEAT",
    "SETRA",
    "SHANGQIDATONG",
    "SHANQI",
    "SHIDAI",
    "SINOTRUK",
    "SKODA",
    "SSANGYONG",
    "SUBARU",
    "SUZUKI",
    "SAAB",
    "SAIPA",
    "SCANIA",
    "SETRA",
    "SHANGQIDATONG",
    "SHANQI",
    "SHIDAI",
    "SKODA",
    "SUBARU",
    "SUZUKI",
    "TATAMOTORS",
    "TESLA",
    "THACO",
    "TIANYE",
    "TOFAS",
    "TOYOTA",
    "TATAMOTORS",
    "TESLA",
    "THACO",
    "TIANYE",
    "TOFAS",
    "TOYOTA",
    "UD",
    "VDL",
    "VINFAST",
    "VOLKSWAGEN",
    "VOLVO",
    "VINFAST",
    "VOLKSWAGEN",
    "VOLVO",
    "WEIWANG",
    "WEIZI",
    "WEIZI",
    "WEIWANG",
    "YEMA",
    "YIQI",
    "YUTONG",
    "YIQI",
    "YUTONG",
    "YUEJIN",
    "ZASTAVA",
    "ZHONGHUA",
    "ZHONGTONG",
    "ZASTAVA",
    "ZHONGHUA",
    "ZHONGTONG",
    "HANGTIANCHENGGONG"
  ],
})
const colors = ref([])
tools.color.forEach((color) => {
  colors.value.push(color.label);
})


const cameraSearch = (object:any) => {
  pageQuery.cameraIdList = [[object.cameraName.trim(),object.cameraId]];
  search(pageQuery).then(res => {
    result.value.data = res.data || []
    result.value.total = res.total
     nextTick(() => {
      const loadingInstance = ElLoading.service()
      if (cardContainer.value) {
        cardContainer.value.scrollTop = 0;
        loadingInstance.close()
      }
    })
  })
}

const codeSearch = (code) => {
  pageQuery.vehicleCode = code;
  pageQuery.matchType = '10'
  pageQuery.compareQuerySuccess = false;
  search(pageQuery).then(res => {
    result.value.data = res.data || []
    result.value.total = res.total
    pageQuery.compareQuerySuccess = result.value.total > 0;
  })
}

const cardContainer = ref({
  scrollTop: 0,
});
const changePage = async (page) => {
  const loadingInstance = ElLoading.service()
  showTrack.value = false;
  pageQuery.page = parseInt(page);
  result.value.data = [];
  pageQuery.compareQuerySuccess = false;
  if (!pageQuery.cameraIdList) {
    pageQuery.cameraIdList = []
  }
  try {
    let res = await search(pageQuery);
    result.value.data = res.data || []
    result.value.total = res.total
    await nextTick(() => {
      const loadingInstance = ElLoading.service()
      if (cardContainer.value) {
        cardContainer.value.scrollTop = 0;
        loadingInstance.close()

      }
    })
  } catch (e) {
  }
  loadingInstance.close()
}


const handleSizeChange = (val: number) => {
  pageQuery.pageSize = val;
  result.value.data = [];
  changePage(1)
}

const handleCurrentChange = (val: number) => {
  result.value.data = [];
  changePage(val)
}

const init = async () => {
  tools.cascaderOptions = await queryCheckpoints();
  await changePage(1)
}


const $route = useRoute();
onMounted(() => {
  if ($route.query && $route.query.vehicleCode) {
    pageQuery.vehicleCode = $route.query.vehicleCode;
  }
  init();
})

const checkNode = (data) => {
  console.log(data)
  pageQuery.cameraIdList = data;
  changePage(1)
  tools.treeShow = false;
}

const cancelSelect = () => {
  tools.treeShow = false;
}

const showCaptureDetail = (o, panel) => {
  mapContent.value.show = false;
  tools.content = null;
  tools.content = o;
  tools.content.panel = panel;
  tools.captureDetail = true;
}

const showTrack = ref(false);
const trackData = ref([]);
const codeByTracking = () => {
  showTrack.value = false;
  let trackQuery = pageQuery;
  pageQuery.trackSize = pageQuery.trackSize == 0 ? 60 : pageQuery.trackSize
  trackQuery.pageSize = pageQuery.trackSize;
  search(trackQuery).then(res => {
    trackData.value = res.data;
    showTrack.value = true;
  })
}
const mapContent = ref({
  val: null,
  show: false,
})
const openLocation = (item) => {
  mapContent.value.show = false;
  mapContent.value.val = {
    licenseCode: item.licenseCode,
    checkpointName: item.checkpointName,
    cameraName: item.cameraName,
    dateTime: item.captureTime,
    captureUrl: `https://192.168.80.185:8443/vehicle_img${item.imgPath2}`,
    lon: parseFloat(item.longnum),
    lat: parseFloat(item.latnum),
    isVehicle: true,
  };
  mapContent.value.org = item;
  mapContent.value.show = true;
}

const mapContentHover = (item) => {
  if (mapContent.value.show) {
    mapContent.value.show = false;
    openLocation(item)
  }
}
</script>
<template>
  <div class="face-search-container">
    <el-splitter>
      <el-splitter-panel size="17%" :collapsible="true" :resizable="false">
        <div class="condition" v-show="pageQuery.filterShow">
          <div class="title-box">
            <el-button class="vms-reset-button" @click="reload" size="default">Reset</el-button>
            <el-button class="vms-main-button" @click="changePage(1)" size="default">
              Search
            </el-button>
            <el-button class="vms-track-button" @click="codeByTracking" size="default" v-show="pageQuery.compareQuerySuccess">
              Track
            </el-button>
          </div>
          <el-divider/>
          <el-form
size="default" label-position="top" v-model="pageQuery"
                   style="max-width: 330px;margin: 5px">
            <el-form-item label="Vehicle No.">
              <el-input
type="text" v-model="pageQuery.vehicleCode" clearable
                        @blur="pageQuery.matchType='20'"
                        placeholder="Vehicle No."/>
            </el-form-item>
            <el-form-item label="Time Range">
              <el-date-picker
                range-separator="To"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="Begin date"
                end-placeholder="End date"
                v-model="pageQuery.times"
                style="width: 330px;margin: auto;font-size: 12px"
                type="datetimerange"/>
            </el-form-item>
            <el-form-item label="Device">
              <el-input
@click="tools.treeShow = true" v-model="pageQuery.cameraIdList" clearable
                        @keyup="tools.treeShow = true"
                        placeholder="Please select device"/>
            </el-form-item>

            <el-form-item label="Vehicle Color">
              <el-select v-model="pageQuery.color" multiple clearable placeholder="Vehicle Color">
                <el-option
v-for="(item,index) in tools.color" :key="index" :label="item.label"
                           :value="item.value">
                  <div class="flex items-center">
                    <el-tag :color="item.label" style="margin-right: 8px" size="small"/>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
                <template #tag>
                  <el-tag v-for="(o,index) in  pageQuery.color" :key="index" :color="o"/>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item label="Vehicle Brand">
              <el-select
v-model="pageQuery.brand" multiple collapse-tags clearable
                         placeholder="Vehicle Color">
                <el-option
v-for="(item,index) in tools.brands" :key="index" :label="item"
                           :value="item"/>
              </el-select>
            </el-form-item>
            <el-form-item
label="Number Of Track Displays "
                          v-show=" pageQuery.compareQuerySuccess ">
              <div class="normal-box">
                <el-input
v-model="pageQuery.trackSize" style="width: 70px;" maxlength="3"
                          clearable/>
                &emsp;
                <el-slider
style="width: 230px;margin-left: 5px" size="small"
                           v-model="pageQuery.trackSize"/>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-splitter-panel>
      <el-splitter-panel>
        <div class="container-card" v-show="!showTrack">
          <div
class="card-container"
               ref="cardContainer" v-show=" result.data &&result.data.length>0">
            <div
class="result-card" v-for="(o,key) in result.data" :key="key"
                 @mouseenter="mapContentHover(o)">
              <div class="capture-image" @click="showCaptureDetail(o,'vehicle')">
                <img :src="imageShow(o.imgPath2)"/>
              </div>
              <div class="vehicle-code-box" @click="codeSearch(o.licenseCode)">
                <div class="vehicle-code">
                  {{ o.licenseCode || "None" }}
                </div>
              </div>
              <div class="info-box">

                <div class="info-item">
                  <el-link
type="primary"
                           @click="openLocation(o)">
                    <Location style="width: 0.9rem"/> &nbsp;{{ o.location }}
                  </el-link>
                  <el-link
type="primary" :icon="VideoCamera"
                           @click="cameraSearch(o)">
                    &nbsp;{{ o.cameraName }}
                  </el-link>
                </div>
                <div class="info-item">
                  <el-link
type="warning" v-if="o.linkMethod==1"
                           :icon="Link" @click="showCaptureDetail(o ,'vehicle')">&nbsp;Wired
                  </el-link>
                  <el-link
type="warning" v-if="o.linkMethod==2"
                           :icon="Link" @click="showCaptureDetail(o ,'vehicle')">&nbsp;Wireless
                  </el-link>
                  <el-link
style="margin-left: 20px" type="warning" v-show="o.speed>0"
                           :icon="Odometer"
                           @click="showCaptureDetail(o,'tracking')"
                           :title="'Speed: '+o.speed +'km'">&nbsp;{{ o.speed }}km
                  </el-link>
                  <el-link
style="margin-left: 20px" type="danger" :icon="Timer"
                           @click="showCaptureDetail(o,'tracking')"
                           :title="'Capture Time: '+o.captureTime ">&nbsp;{{ o.captureTime }}
                  </el-link>
                </div>
              </div>
            </div>
          </div>
          <el-empty
image-size="150"
                    v-show=" result.data &&result.data.length===0"/>
          <el-button
style="float: left;margin: 13px" type="primary" plain size="small"
                     @click="controlFilter" v-show="!pageQuery.filterShow">
            Collapse
          </el-button>
          <el-pagination
            style="float: right;margin: 13px"
            background
            layout="total,sizes,prev,pager,next"
            :size="pageQuery.pageSize"
            v-model:current-page="pageQuery.page"
            v-model:page-size="pageQuery.pageSize"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            :total="result.total"/>
        </div>
        <div class="track-map-container" v-show="showTrack">
          <VehicleCaptureTrack
:content="trackData"
                               v-if="showTrack"
                               :key="new Date()"
                               @control-filter="controlFilter"/>
        </div>
      </el-splitter-panel>
    </el-splitter>
    <el-dialog
v-model="tools.captureDetail" draggable style="margin-top: 5px" width="90%"
               @close="tools.captureDetail=false">
      <VehicleCaptureDetail :content="tools.content" v-if="tools.captureDetail"/>
    </el-dialog>
    <transition name="el-zoom-in-center">
      <div
class="location-map-box"
           v-loading="mapContentLoadding"
           v-if="mapContent.show">
        <div class="title">
          <div class="title-left" @click="showCaptureDetail(mapContent.org,'vehicle')">
            [{{ mapContent.val.dateTime }}] {{
              mapContent.val.licenseCode
            }}&nbsp;-{{ mapContent.val.checkpointName }}-&nbsp;{{ mapContent.val.cameraName }}
          </div>
          <Close class="location-close-icon" style="width: 20px" @click="mapContent.show=false"/>
        </div>
        <CommonCaptureLocation
style="height: 100%;width: 100%" v-if="mapContent.show"
                               :key="mapContent.val" :content="mapContent.val"/>
      </div>
    </transition>
  </div>
  <el-dialog
v-model="tools.treeShow" width="450px" title="Device"
             draggable>
    <device-tree-template camera-type="4" @cancel-select="cancelSelect" @submit-select="checkNode"/>
  </el-dialog>
</template>
<!--右下角鹰眼-->
<style scoped>
:deep(.el-card) {
  background: unset;
}

.face-search-container {
  width: 100%;
  height: 90vh;
  overflow: hidden;
  display: flex;

}

:deep(.info-item .el-link) {
  font-size: 0.85rem !important;
  font-weight: 500 !important;
}

:deep(.el-link.el-link--primary) {
  --el-link-text-color: #4d6de3 !important;
}

.condition {
  color: var(--el-text-color-primary);
  margin-right: 10px;
  height: 90vh;
}


.title-box {
  margin: 5px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  padding: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}


.card-container {
  max-width: 100%;
  width: 100%;
  overflow: auto;
  height: 78vh;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 0.5rem;
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

:deep(.container-card .el-card__body) {
  background: var(--el-bg-color);
  background: transparent;
  padding: 0 !important;
  border: unset;
  box-shadow: unset;
  background: unset;
}

.result-card {
  overflow: hidden;
  //box-shadow: var(--default-card-box-shadow);
  cursor: pointer;
  max-height: 260px;
  height: 255px;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 1px 1px 5px #ccc;
  margin: 1px;
}

.result-card:hover {
  transform: translateY(-5px);
  transition: 0.8s;
}


.capture-image {
  display: flex;
  flex-shrink: 1;
  height: 200px;
  padding: 2px;
  max-height: 210px;
  position: relative;
}

.capture-image img {
  object-fit: fill;
  width: 100%;
  height: 100%;
  border: 0;
}


.info-box {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 3px;
}


.result-card .vehicle-code-box {
  position: absolute;
  top: 5px;
  right: 5px;

  .vehicle-code {
    float: right;
    background: var(--defaulat-cuz-color);
    padding: 8px;
    box-shadow: var(--default-box-shadow);
    font-size: 0.82rem;
    color: white;
  }

  .vehicle-code:hover {
    transition: 0.8s;
    background: #2b99d5;
  }

}

.result-card .vehicle-code-box:hover {
  box-shadow: var(--el-box-shadow);
}


.info-item {
  display: flex;
  justify-content: space-around;
  padding: 5px;
}


:deep(.el-date-editor .el-range-input) {
  font-size: 0.75rem;
}

:deep(.el-date-editor .el-range-separator) {
  font-size: 0.75rem;
}

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

.track-map-container {
  max-width: 100%;
  height: 90vh;
  margin-top: 5px;
  border-radius: 4px
}

@media (min-width: 1200px) {
  .container-card {
    max-width: 100%;
  }

  .card-container {
    overflow: auto;
    height: 83.5vh;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    grid-auto-rows: 255px;
  }

  :deep(.el-empty) {
    width: 100% !important;
    height: 83.5vh !important;
  }
}

:deep(.el-splitter-bar__disable:before) {
  //background: var(--el-splitter-bar-bg-color) !important;
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

</style>
<style scoped lang="scss">
@use "@/styles/vms";
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
