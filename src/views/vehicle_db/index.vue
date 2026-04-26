<script setup lang="ts">
import {ref} from "vue";
import {
  checkImgUrl,
  detailsPage,
  getBrandLogo,
  getBrandPngLogo,

} from "@/api/vehicle_db";
import {getCountryImage, getImageUrl} from "@/views/vehicle/components";
import VehicleDatabaseDetail from "@/views/vehicle_db/components/details.vue";
import {getCountryInfoList, getVehicleBrands} from "@/api/vehicle";
import {ElLoading} from "element-plus";
import {formatDate, personalPic, truncate, vehicleBrandPic} from "@/utils/commonUtils";

defineOptions({name: 'VehicleDbIndex'})
const reload = inject<any>("reload");
const countryList = ref([])



const pageQuery = reactive({
  filterShow: true,
  pageSize: 50,
  registrationStatus: "VALID",
  page: 1,
  searchKey: "",
  queryModel: "20",
  country: "OMN",
  searchType: "20"
})

const tools = reactive({
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
})

const colors = ref([])
tools.color.forEach((color) => {
  colors.value.push(color.label);
})

const result = ref({
  data: [],
  total: 0,
})

const vehicleBrands = ref();
const init = async () => {
  countryList.value = await getCountryInfoList();
  await changePage(1);
  // vehicleBrands.value = await getVehicleBrands();
}

const statusSearch = (code) => {
  pageQuery.registrationStatus = code;
  changePage(1);
}

const codeSearch = (code) => {
  pageQuery.searchKey = code;
  changePage(1);
}

const cardContainer = ref({});
const changePage = async (page) => {
  const loadingInstance = ElLoading.service()
  pageQuery.page = parseInt(page);
  result.value.data = [];
  let res = await detailsPage(pageQuery)
  result.value.data = res.data;
  result.value.total = res.total;
  await nextTick(() => {
    const loadingInstance = ElLoading.service()
    if (cardContainer.value) {
      cardContainer.value.scrollTop = 0;
      loadingInstance.close()
    }
  })
  loadingInstance.close()
}

const handleSizeChange = (val: number) => {
  pageQuery.pageSize = val;
  result.value.data = [];
  changePage(1)
}

const handleCurrentChange = (val: number) => {
  changePage(val)
}

const vehicleContent = ref({});
const openDetail = ref(false);
const detail = (obj) => {
  vehicleContent.value = obj;
  openDetail.value = true;
}

onMounted(() => {
  init();
})

</script>

<style scoped>
.face-search-container {
  width: 100%;
  height: 90vh;
  overflow: hidden;
  display: flex;
}

.condition {
  font-size: 0.8rem;

  /* border: 1px solid var(--el-border-color);
  box-shadow: var(--el-box-shadow-lighter);
  padding: 10px;
  background: var(--el-bg-color);
   border-radius: 4px;*/
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

:deep(.el-link) {
  font-size: 0.8rem !important;
}

:deep(.el-card__header) {
  padding: 10px;
}


.card-container {
  overflow: auto;
  height: 84vh;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 5px;
  background: transparent;
}


.result-card {
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  background:  #ffffff;
  cursor: pointer;
  border-radius: 12px;
  max-height: 245px;
  height: 245px;
  border: 2px solid white;
  max-width: 320px;
  min-width: 288px;
}


.result-card:hover {
  position: relative;
  transition: 0.8s;
  transform: translateY(-5px);
}

:deep(.el-date-editor .el-range-input) {
  font-size: 0.7rem;
}

:deep(.el-date-editor .el-range-input) {
  font-size: 0.7rem;
}

:deep(.el-select-dropdown__item) {
  font-size: 0.7rem !important;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: 500;
  font-style: normal;
}


.card-title-box {
  position: relative;
  display: flex;
  justify-content: space-between;
  background-color: #bec7eb;
  padding: 5px;
}

.card-title {
  padding: 2px;
  font-size: 0.7rem;
  color: #32384b;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: 700;
}

.card-title-ar {
  font-size: 0.7rem;
  color: #32384b;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
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

.card-title-ar h4 {
  padding: 3px;
  font-size: 0.7rem;
  font-weight: 700;
}

.card-title h4 {
  padding: 3px;
  font-size: 0.65rem;
  font-weight: 700;
}


:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  font-size: 0.75rem;
}

.container-card {
  max-width: 100%;
  margin-left: 10px;
  background: var(--el-bg-color);
}

:deep(.container-card .el-card__body) {
  padding: 0 !important;
  border: unset;
  box-shadow: unset;
  background: unset;
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
}

.card-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

@media (min-width: 1200px) {
  .container-card {
    max-width: 100%;
  }

  .result-card {
    max-width: 400px;
  }

  .card-container {
    display: grid;
    gap: 0.5rem;
    height: 84.5vh;
    margin: 0;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    grid-auto-rows: 248px;
    overflow: auto;
  }


  :deep(.el-empty) {
    width: 100% !important;
    height: 83.5vh !important;
  }
}

.card-body {
  margin-top: 5px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}


.brand-image {
  position: absolute;
  left: 45%;
  border-radius: 60%;
  width: 70px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;
}

.brand-image img {
  object-fit: fill;
  width: 100%;
  height: 100%;
}


.info-box {
  margin-left: 2px;
  padding: 5px;
}

.info-item {
  display: flex;
  margin: 3px;
  padding: 3px;
  border-bottom: 0.3px #081728 dashed;
}

.info-item .label {
  font-weight: 500;
  margin-right: 10px;
  font-size: 0.7rem;
  color: #0d2a4a;
}

.info-item .value.Valid {
  color: #0d2a4a;
}

.info-item .value.Expired {
  color: orangered;
}

.info-item .value {
  font-size: 0.7rem;
  font-weight: 500;
  color: #0d2a4a;
}

:deep(.el-card__footer) {
  border-top-color: #ffffff !important;
}

:deep(.el-card__header) {
  border-bottom: unset;
}

</style>
<template>
  <div class="face-search-container">
    <el-splitter>
      <el-splitter-panel size="17%" :collapsible="true" :resizable="false">
        <div class="condition">
          <div class="title-box">
            <el-button class="vms-reset-button" @click="reload" size="default">Reset</el-button>
            <el-button class="vms-main-button" @click="changePage(1)" size="default">
              Search
            </el-button>
          </div>
          <el-divider/>
          <el-form label-position="top" size="default" v-model="pageQuery" style="max-width: 330px;margin: auto;padding: 5px">
            <el-form-item label="Vehicle No./ Name / Id No.">
              <el-input type="text" v-model="pageQuery.searchKey" clearable>
                <template #prepend>
                  <el-select v-model="pageQuery.searchType" style="width: 115px">
                    <el-option label="Vehicle No." value="20">Vehicle No.</el-option>
                    <el-option label="Name" value="30">Name</el-option>
                    <el-option label="Id No." value="10">Id No.</el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="Vehicle Color">
              <el-select v-model="pageQuery.color" multiple clearable placeholder="Vehicle Color">
                <el-option v-for="(item,index) in tools.color" :key="index" :label="item.label"
                           :value="item.value">
                  <div class="flex items-center">
                    <el-tag :color="item.label" style="margin-right: 8px"/>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
                <template #tag>
                  <el-tag v-for="(o,index) in  pageQuery.color" :key="index" :color="o"/>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item label="Registration Status">
              <el-select v-model="pageQuery.registrationStatus" style="margin-left: 5px"
                         clearable filterable>
                <el-option value="" label="All"/>
                <el-option value="VALID" label="Valid"/>
                <el-option value="EXPIRED" label="Expired"/>
              </el-select>
            </el-form-item>
            <el-form-item label="Registration Nationality">
              <el-select :key="index" style="width: 330px" v-model="pageQuery.country" clearable
                         filterable>
                <el-option v-for="(item,index) in countryList" :key="index"
                           :label="item.countryName"
                           :value="item.countryCode">
                  <div style="display: flex;flex-direction: row;justify-content: space-between">
                    <el-image style="width: 18px" :src="getCountryImage(item.countryName)"/>
                    <span>{{ item.countryName }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-splitter-panel>
      <el-splitter-panel :min="800">
        <div class="container-card">
          <div class="result-container">
            <div class="card-container" ref="cardContainer" v-show="result.data.length>0">
              <div v-for="(o,key) in result.data" :key="key" class="result-card"
                   @click="detail(o)">
                <div class="card-title-box">
                  <div class="card-title">
                    <h4>SULTANATE OF OMAN</h4>
                    <h4>ROYAL OMAN POLICE</h4>
                    <h4>DIR. GENERAL OF TRAFFIC</h4>
                  </div>
                  <div class="brand-image">
                    <img :src="getImageUrl('ROP.png')" alt="o.vehicleMakerEnglish"/>
                  </div>
                  <div class="card-title-ar">
                    <h4>سلطنة عمان</h4>
                    <h4>شرطة عمان الملكية</h4>
                    <h4>د.د. العام لحركة المرور</h4>
                  </div>
                </div>
                <div style="display: flex;justify-content: space-between;line-height: 25px">
                  <span
                    style="margin-left:3px;color: orangered;font-size: 0.65rem;font-weight: 600;font-style: italic ">MOTOR VEHICLE LICENSE</span>
                  <span
                    style="margin-right: 3px;color: orangered;font-size: 0.7rem;font-weight: 600;font-style: italic ">رخصة السيارات</span>
                </div>
                <div class="card-body">
                  <div class="info-box">
                    <div class="info-item">
                      <div class="label">VEHICLE NUMBER:</div>
                      <div class="value">{{ o.plateCodeNumberEnglish }}</div>
                      <div class="value">&emsp;{{ o.plateTypeEnglish }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">VEHICLE BRAND:</div>
                      <div class="value">
                        {{ o.vehicleMakerEnglish }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">VEHICLE MAKER:</div>
                      <div class="value">
                        {{ o.vehicleModelEnglish }}
                        {{ o.vehicleTypeEnglish }}
                        {{ o.vehiclecolorenglish1 }}
                        {{ o.yearManufactured }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">CHASSIS NUMBER:</div>
                      <div class="value">{{ o.chassisNumber }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">ENGINE NUMBER:</div>
                      <div class="value">{{
                          o.engineNumber
                        }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">EXPIRY DATE:</div>
                      <div class="value">{{
                          formatDate(o.registrationstartdateStr, 'YYYY/DD/MM')
                        }}
                      </div>
                      <div class="value" style="font-size: 0.7rem">&emsp;TO&emsp;</div>
                      <div class="value" :class="o.englishRegistrationStatus">
                        {{ formatDate(o.registrationexpirydateStr, 'YYYY/DD/MM') }}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            <el-empty image-size="150" style="margin: auto;" v-show="result.data.length===0"/>
            <el-pagination
              style="float: right;margin: 10px"
              background
              layout="total,sizes,prev,pager,next"
              :size="pageQuery.pageSize"
              v-model:current-page="pageQuery.page"
              v-model:page-size="pageQuery.pageSize"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
              :total="result.total"/>
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
  <el-dialog v-model="openDetail" style="width: 90%;margin-top: 15px" draggable>
    <VehicleDatabaseDetail :content="vehicleContent"
                           v-if="openDetail"/>
  </el-dialog>
</template>
