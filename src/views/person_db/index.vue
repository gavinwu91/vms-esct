<script setup lang="ts">
import {ref} from "vue";
import {getCountryImage, getImageUrl, personImageShow} from "@/views/vehicle/components";
import { config } from '@/utils/runtimeConfig'
import {personPage} from "@/api/person_db";
import {getCountryInfoList} from "@/api/vehicle";
import IdentityInformation from "@/views/identity/index.vue";
import {Delete} from "@element-plus/icons-vue";
import {getAccessToken} from "@/utils/auth";
import {genFileId, UploadInstance, UploadProps, UploadRawFile} from "element-plus";
import {convertUrlImageToBase64, getFaceImageRect} from "@/api/retrieval";
import {formatDate, handleNullPersonPic, truncate} from "@/utils/commonUtils";
import FaceImagePermissions from "@/views/system/FaceImage/index.vue";
const UPLOAD_URL = `${config.VITE_BASE_URL}/admin-api/biz/retrieval/uploadImageToBase64`
const HEADERS = {Authorization: 'Bearer ' + getAccessToken()} // 设置上传的请求头部
defineOptions({name: 'PersonDatabaseIndex'})
const reload = inject<any>("reload");
const countryList = ref([])
const tools = ref({})
const pageQuery = ref({
  defaultFaceImage: '',
  filterShow: true,
  page: 1,
  pageSize: 20,
  age: [18, 99],
  queryFlag: false,
  gender: '',
  country: 'OMN',
  threshold: 50,
  searchKey: "",
  searchType: '10',
  loading: false,
  familyPage: false,
  imgBase64: "",
  album_id: "5faa225c09c2cc000731f73c",
  num: 50,
  imageUrl: "",
  hasFace: false,
  compareSuccess: false,
})

const result = ref({
  data: [],
  total: 0,
})


const vehicleSearch = ref(false);
const cardContainer = ref({});
const changePage = async (pageNumber: number) => {
  pageQuery.value.loading = true;
  vehicleSearch.value = false;
  if (!Number(pageQuery.value.age[0])) {
    pageQuery.value.age[0] = 0;
  }
  if (!Number(pageQuery.value.age[1])) {
    pageQuery.value.age[1] = 99;
  }
  pageQuery.value.page = parseInt(pageNumber);
  result.value.data = [];
  let res = await personPage(pageQuery.value)

  result.value.data = res.data;
  result.value.total = res.total;
  pageQuery.value.familyPage = false;
  if (pageQuery.value.searchType === '60' && result.value.data.length != 0) {
    pageQuery.value.familyPage = true;
  }
  if (pageQuery.value.searchType === '20') {
    vehicleSearch.value = true;
  }
  await nextTick(() => {
    pageQuery.value.loading = false;
    if (cardContainer.value) {
      cardContainer.value.scrollTop = 0;
      pageQuery.value.loading = false;
    }
    if (pageQuery.value.hasFace) {
      pageQuery.value.compareSuccess = true;
    }
  })

}

const handleSizeChange = (val: number) => {
  pageQuery.value.pageSize = val;
  result.value.data = [];
  changePage(1)
}

const handleCurrentChange = (val: number) => {
  changePage(val)
}

const $route = useRoute();

const init = async () => {
  if ($route.query && $route.query.imageUrl) {
    await routerImageSearch($route.query.imageUrl)
  } else {
    countryList.value = await getCountryInfoList();
    await changePage(1);
  }

}

onMounted(() => {
  init()
})
const informationQuery = ref({});
const showIdentityInformation = ref(false);
const goProfilePage = (obj, tab) => {
  informationQuery.value.idNo = obj.idNo;
  informationQuery.value.tabName = tab;
  showIdentityInformation.value = true;
}

const multipartFace = ref([]);
const upload = ref<UploadInstance>()
const uploadSuccess: UploadProps['onSuccess'] = async (response, uploadFile, uploadFiles): void => {
  tools.value.loading = true;
  pageQuery.value.imageUrl = response.data.base64;
  pageQuery.value.country = "";
  try {
    pageQuery.value.compareQuerySuccess = false;
    multipartFace.value.push(response.data.base64)
    const faceImageRect = await getFaceImageRect({portraitImageUrl: response.data.base64});
    if (faceImageRect) {
      for (let i = 0; i < faceImageRect.length; i++) {
        multipartFace.value.push(faceImageRect[i].base64)
      }
      pageQuery.value.imageUrl = faceImageRect[faceImageRect.length - 1].base64;
    }
  } catch (e) {

  } finally {
    pageQuery.value.imgBase64 = response.data.base64;
    pageQuery.value.hasFace = true;
    pageQuery.value.searchType = '10'
    tools.value.loading = false;
  }

}

const routerImageSearch = async (image) => {
  convertUrlImageToBase64({imageUrl: image}).then(res => {
    pageQuery.value.imageUrl = res.data;
    pageQuery.value.imgBase64 = res.data
    pageQuery.value.faceImgBase64 = res.data;
    pageQuery.value.hasFace = true;
    tools.value.faceSelect = false;
    changePage(1);
  })


}

const imageSearch = async (image) => {
  pageQuery.value.imgBase64 = image;
  pageQuery.value.imageUrl = image;
  pageQuery.value.hasFace = true;
  tools.value.faceSelect = false;
  await changePage(1);
}

const removeImage = () => {
  pageQuery.value.imageUrl = "";
  pageQuery.value.imgBase64 = "";
  tools.value.removeFlag = false;
  pageQuery.value.compareQuerySuccess = false;
  pageQuery.value.country = 'OMN';
  multipartFace.value = [];
  pageQuery.value.hasFace = false;
}


const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile
  file.uid = genFileId();
  upload.value!.handleStart(file);
}


</script>

<template>
  <div class="face-search-container" v-loading="pageQuery.loading">
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
          <el-form
label-position="top" size="default" v-model="pageQuery"
                   style="max-width: 330px;margin: auto;padding:5px;">
            <el-form-item style="align-items:baseline">
              <div class="normal-box">
                <el-upload
                  ref="upload"
                  style="margin: 5px 5px 5px -30px"
                  :action="UPLOAD_URL"
                  :headers="HEADERS"
                  :on-success=" uploadSuccess"
                  :show-file-list="false"
                  :on-exceed="handleExceed">
                  <el-image
:src="pageQuery.imageUrl" v-if="pageQuery.imageUrl" class="upload-image"
                            @mouseover="tools.removeFlag=true"
                            @mouseleave="tools.removeFlag=false"/>
                  <el-image v-else src="default_face.png" class="upload-image"/>
                </el-upload>
                <div
class="multipart-face" v-show="multipartFace.length>1"
                     @click="tools.faceSelect=true">
                  <el-badge :value="multipartFace.length">
                    <el-avatar :src="multipartFace[multipartFace.length-1]" :size="40"/>
                  </el-badge>
                </div>
                <el-icon
@mouseover="tools.removeFlag=true"
                         class="remove-image"
                         title="Remove Image"
                         v-show="tools.removeFlag"
                         @click="removeImage">
                  <Delete/>
                </el-icon>
              </div>
            </el-form-item>
            <el-divider/>
            <el-form-item label="">
              <el-input
type="text" v-model="pageQuery.searchKey" clearable
                        v-if="!pageQuery.hasFace">
                <template #prepend>
                  <el-select v-model="pageQuery.searchType" style="width: 115px">
                    <el-option key="10" label="Identity No." value="10">Identity No.</el-option>
                    <el-option key="20" label="Vehicle No." value="20">
                      Vehicle No.
                    </el-option>
                    <el-option key="40" label="Passport" value="40">
                      Passport
                    </el-option>
                    <el-option key="50" label="Real Name" value="50">Real Name</el-option>
                    <el-option
key="60" label="Family Relations"
                               value="60">Family Relations
                    </el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item
label="Gender" v-show="!['20','30','60'].includes(pageQuery.searchType)"
                          v-if="!pageQuery.hasFace">
              <el-select
v-model="pageQuery.gender"
                         placeholder="Gender"
                         filterable clearable
                         style="margin-left: 5px"
                         v-show="!['20','30','60'].includes(pageQuery.searchType)">
                <el-option value="">Gender</el-option>
                <el-option value="Female">Female</el-option>
                <el-option value="Male">Male</el-option>
              </el-select>
            </el-form-item>
            <el-form-item
label="Nationality" v-show="!['30','60'].includes(pageQuery.searchType)"
                          v-if="!pageQuery.hasFace">
              <el-select
:key="index" style="width: 330px" v-model="pageQuery.country" clearable
                         filterable>
                <el-option
v-for="(item,index) in countryList" :key="index"
                           :label="item.countryName"
                           :value="item.countryCode">
                  <div style="display: flex;flex-direction: row;justify-content: space-between">
                    <el-image style="width: 18px" :src="getCountryImage(item.countryName)"/>
                    <span>{{ item.countryName }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
label="Avg Range" v-show="['10','50'].includes(pageQuery.searchType)"
                          v-if="!pageQuery.hasFace">
              <el-input
style="width: 80px;margin-left: 5px;" size="medium"
                        v-model="pageQuery.age[0]"
                        clearable
                        maxlength="3"/>
              <span>&nbsp;~&nbsp;</span>
              <el-input
style="width: 80px;margin-left: 5px;" size="medium"
                        v-model="pageQuery.age[1]"
                        clearable
                        maxlength="3"/>
            </el-form-item>
            <el-form-item label="Face Similarity" v-if="pageQuery.hasFace">
              <div class="normal-box">
                <el-input v-model="pageQuery.threshold" style="width: 19%;" maxlength="3"/>
                &emsp;
                <el-slider
style="width: 75%;margin-left: 5px" size="small"
                           v-model="pageQuery.threshold"/>
              </div>
            </el-form-item>

            <el-form-item label="Number Of Comparisons" v-if="pageQuery.hasFace">
              <div class="normal-box">
                <el-input v-model="pageQuery.num" style="" maxlength="3"/>
                &emsp;
                <el-slider
style="width: 75%;margin-left: 5px" size="small"
                           v-model="pageQuery.num"/>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-splitter-panel>
      <el-splitter-panel>
        <div class="container-card">
          <div class="card-container" v-if="result.data.length>0" ref="cardContainer">
            <el-card
              v-for="(o,key) in result.data" :key="key"
              class="result-card"
              @click="goProfilePage(o,'10')">
              <div v-if=" vehicleSearch" style="background: transparent;padding: 10px">
                <div style="display: flex">
                  <div class="gcc-image">
                    <img :src="getImageUrl('GCC.svg')" alt="o.vehicleMakerEnglish"/>
                  </div>
                  <div class="card-title">
                    <h4>سلطنة عمان</h4>
                    <h4>SULTANATE OF OMAN</h4>
                    <span style="color: #000000;font-size: 0.75rem;font-weight: 500">Royal Oman Police</span>
                    <span
                      style="color: orangered;font-size: 0.75rem;font-weight: 500 ">VEHICLE DRIVING LICENCE</span>
                  </div>
                  <div class="brand-image">
                    <img :src="getImageUrl('ROP.png')" alt="o.vehicleMakerEnglish"/>
                  </div>
                </div>
                <div class="card-body">
                  <FaceImagePermissions
element-type="div" className="page-vehicle-face-image"
                                        :image-path="personImageShow(o.image)"/>
                  <div class="info-box">
                    <div class="info-item">
                      <div class="label">Vehicle NUMBER:</div>
                      <div class="value">{{ o.carNo }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">LICENCE NUMBER:</div>
                      <div class="value">{{ o.idNo }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">NATIONALITY:</div>
                      <div class="value">{{ o.country }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">DATE OF BIRTH:</div>
                      <div class="value">{{
                          formatDate(o.birthDate, 'MM/DD/YYYY')
                        }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">CIVIL NUMBER:</div>
                      <div class="value">
                        {{ o.idNo }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">NAME:</div>
                      <div class="value">{{ o.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if=" !vehicleSearch" style="position: relative;padding: 10px">
                <div class="face-compare-box" v-if="o.score">
                  <div class="face-compare-box-num">{{ o.score }}</div>
                </div>
                <!--ID查询-->
                <div class="card-header">
                  <div style="">
                    <FaceImagePermissions
element-type="div" className="page-face-image"
                                          :image-path="personImageShow(o.image || o.avatar)"/>
                    <div class="oman-land-image">
                      <img :src="getImageUrl('OMAN.svg')"/>
                    </div>
                  </div>
                  <div class="card-title">
                    <h4 style="font-style: italic">سلطنة عمان</h4>
                    <h4 style="font-style: italic">SULTANATE OF OMAN</h4>
                    <div class="small-title-box">
                        <span
class="residentCard"
                              v-if="o.country==='Oman'">IDENTITY<br/> CARD</span>
                      <span class="residentCard" v-else>RESIDENT<br/> CARD</span>
                      <div class="small-face-image">
                        <img
:src="personImageShow(o.image || o.avatar)"
                             @error="handleNullPersonPic"
                             v-if="o.image || o.avatar"
                             alt=""/>
                        <el-image src="default_face.png" v-else/>
                      </div>
                    </div>
                    <div class="card-body">
                      <div class="info-box">
                        <div class="info-item">
                          <div class="label">CIVIL NUMBER:</div>
                          <div class="value">{{ o.idNo }}</div>
                        </div>
                        <div class="info-item">
                          <div class="label">NATIONALITY:</div>
                          <div class="value">{{ truncate(o.country, 15) }}</div>
                        </div>
                        <div class="info-item">
                          <div class="label">RENEWAL DATE:</div>
                          <div class="value">{{
                              formatDate(o.renewTime, 'YYYY/MM/DD')
                            }}
                          </div>
                        </div>
                        <div class="info-item">
                          <div class="label">DATE OF BIRTH:</div>
                          <div
class="value" v-if="o.isDead==='Yes'" style="color: orangered"
                               :title="'Date of Death: '+o.dateOfDeath">
                            {{ formatDate(o.birthDate || o.dataBaseDOB, 'DD/MM/YYYY') }}
                          </div>
                          <div class="value" :title="o.dateOfDeath" v-else>
                            {{ formatDate(o.birthDate || o.dataBaseDOB, 'DD/MM/YYYY') }}
                          </div>
                        </div>
                        <div class="info-item">
                          <div class="label">NAME:</div>
                          <div class="value">{{ o.name }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="brand-image">
                    <img :src="getImageUrl('GOV.svg')" alt="o.vehicleMakerEnglish"/>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty image-size="150" style="margin: auto;" v-show="result.data.length===0"/>
          <el-pagination
            style="float: right;margin: 10px"
            v-if="!pageQuery.familyPage && !pageQuery.compareSuccess"
            background
            layout="total,sizes,prev,pager,next"
            :size="pageQuery.pageSize"
            v-model:current-page="pageQuery.page"
            v-model:page-size="pageQuery.pageSize"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            :total="result.total"/>
        </div>
      </el-splitter-panel>
    </el-splitter>

  </div>
  <el-dialog
    draggable
    append-to-body
    width="95%"
    style="margin-top: 1px"
    v-model="showIdentityInformation"
    @close="showIdentityInformation=false"
    v-if="showIdentityInformation">
    <IdentityInformation :content="informationQuery" v-if="showIdentityInformation"/>
  </el-dialog>

  <el-dialog
v-model="tools.faceSelect" draggable width="50%" style="margin-top: 5px"
             title="Multipart Face Select">
    <div class="select-face-container">
      <el-divider/>
      <div class="select-face-box">
        <div v-for="(src,index) in multipartFace" :key="index">
          <el-tooltip
            trigger="hover"
            placement="bottom">
            <template #content>
              <el-image
style="width: 30px;height:25px;cursor: pointer"
                        title="Face Captured Search"
                        :src="getImageUrl('face_search.svg')" @click="imageSearch(src)"/>
            </template>
            <el-image
class="select-face-image"
                      :src="src"/>
          </el-tooltip>
        </div>
      </div>
      <el-divider/>
    </div>
  </el-dialog>
</template>

<style scoped>


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

.normal-box {
  display: flex;
  width: 100%;
  position: relative;
  justify-content: center
}

.face-search-container {
  width: 100%;
  height: 90vh;
  overflow: hidden;
  display: flex;
}

.condition {
  font-size: 0.8rem;
  color: var(--el-text-color-primary);
  margin-right: 10px;
  height: 90vh;
}

.face-compare-box {
  background: url('../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 80px;
  bottom: 75px;
  left: 20px;
  z-index: 999;
}

.face-compare-box-num {
  display: flex;
  justify-content: center;
  font-size: 0.95rem;
  color: #fafafa;
  font-weight: 600;
}


.title-box {
  margin: 5px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  padding: 10px;
  background: unset;
}

:deep(.el-card__header) {
  padding: 10px;
}


.card-container {
  overflow: auto;
  height: 83.5vh;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 5px;
}

.result-card {
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  background: #ffffff;
  cursor: pointer;
  border-radius: 12px;
  max-height: 235px;
  height: 235px;
  max-width: 400px;
}


.result-card:hover {
  position: relative;
  transition: all 0.8s;
  transform: translateY(-5px);
}

.condition-title {
  font-weight: bold;
  color: #2672ff;
}

:deep(.el-date-editor .el-range-input) {
  font-size: 12px;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: bold;
  font-size: 15px;
}


:deep(.el-carousel__indicators) {
  display: none;
}

:deep(.el-carousel__container) {
  height: 300px;
  text-align: center;
}

:deep(.el-carousel__arrow:hover) {
  background: orangered;
}


:deep(.el-descriptions-label-diy) {
  background: transparent;
  color: white;
}

:deep(.el-descriptions),
:deep(.el-descriptions__body) {
  background: transparent !important;

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


.multipart-face {
  position: absolute;
  right: 0;
  top: 5px;
  border: transparent 2px solid;
  cursor: pointer;
  border-radius: 60%;
  height: 45px;
  width: 45px;
}

.multipart-face:hover {
  transform: 0.3s;
  border: dodgerblue solid 2px;
}


.remove-image {
  position: absolute;
  top: 12px;
  right: 75px;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  color: white;
  margin: 5px;
  background: rgba(48, 68, 100, 0.62);
}

.remove-image:hover {
  background: rgba(48, 68, 100, 0.98);
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


@media (min-width: 1200px) {
  .container-card {
    min-width: 82% !important;
    max-width: 100% !important;
  }

  .result-card {
    max-width: 450px;
    min-width: 315px;
  }

  .card-container {
    display: grid;
    gap: 0.5rem;
    height: 83.5vh;
    margin: 0;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    grid-auto-rows: 235px;
    overflow: auto;
  }


  :deep(.el-empty) {
    width: 100% !important;
    height: 83.5vh !important;
  }
}


.result-card:hover {
  position: relative;
  transition: all 0.8s;
  transform: translateY(-5px);
}



:deep(.el-date-editor .el-range-input) {
  font-size: 0.75rem;
}

:deep(.el-date-editor .el-range-input) {
  font-size: 0.75rem;
}

:deep(.el-select-dropdown__item) {
  font-size: 0.75rem !important;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: bold;
  font-size: 0.75rem;
}

.card-title {
  font-size: 0.9rem;
  color: #534277;
  display: flex;
  margin-left: 10px;
  flex-direction: column;
  align-items: flex-start;
  text-align: center;
  position: relative;
}

.card-title h4 {
  font-weight: bold;
  font-size: 0.86rem;
  background: linear-gradient(to right, #cd7eec, #1d2585, #488638, #1b9b2c);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}


:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  font-size: 0.75rem;
}

.container-card {
  max-width: 100%;
  background: var(--el-bg-color);
  margin-left: 10px;
  background: transparent;
}

:deep(.card-container .el-card__body) {
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



.card-body {
  display: flex;
  flex-wrap: nowrap;
}

.small-title-box {
  margin: 2px;
  display: flex;
  align-items: center;
}

.small-title-box .residentCard {
  font-size: 0.75rem;
  font-weight: 750;
  margin-right: 10px;
  color: #644d2e;
}


.small-face-image {
  border-radius: 60%;
  right: 1px;


  width: 51px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;
  filter: contrast(0.75);
}

.small-face-image img {
  object-fit: fill;
  width: 100%;
  height: 100%;
}


.oman-land-image {
  margin-top: 5px;
  right: 1px;
  width: 60px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;
  left: 0;
  bottom: 0;
}

.oman-land-image img {
  object-fit: fill;
  width: 100%;
  height: 100%;
}

.vehicle-face-image img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}


.face-image img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.gcc-image {
  left: 1px;
  border-radius: 60%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;
}

.gcc-image img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.brand-image {
  position: absolute;
  right: 1px;
  border-radius: 60%;
  width: 63px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;
}

.brand-image img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}


.info-box {
  margin-left: 2px;
}

.info-item {
  display: flex;
  padding: 3px;
}

.info-item .label {
  font-weight: 550;
  margin-right: 10px;
  font-size: 0.8rem;
  color: #655091;
}

.info-item .value.Valid {
  color: #0d2a4a;
}

.info-item .value.Expired {
  color: orangered;
}

.info-item .value {
  font-size: 0.8rem;
  font-weight: 500;
  color: #0d2a4a;
  text-align: left;
}

:deep(.el-card__footer) {
  border-top-color: #ffffff !important;
}

:deep(.el-card__header) {
  border-bottom: unset;
}

.card-header {
  display: flex;
  position: relative;
  background: url(public/insight/oman-vision-2040-seeklogo.svg) no-repeat;
  background-size: 300px 271px;
  background-position-x: 31px;
  background-position-y: -86px;

}

.result .width82 {
  width: 82% !important;
}

.result .width100 {
  width: 100%;
}

:deep(.el-link) {
  font-size: 0.8rem !important;
}
</style>
