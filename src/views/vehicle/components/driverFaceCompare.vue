<script setup lang="ts">
import {getFaceCompareResult} from "@/api/vehicle";
import {
  getCountryImage,
  getImageUrl,
  imageShow,
  personImageShow
} from "@/views/vehicle/components/index";
import {getAge, getInsightPerson} from "@/api/identity";
import {Postcard} from "@element-plus/icons-vue";
import IdentityInformation from "@/views/identity/index.vue";
import DriverFaceSelect from "@/views/vehicle/components/driverFaceSelect.vue";
import FamilyRelationsGraph from "@/views/identity/components/familyGraph.vue";
import {formatDate, handleNullPersonPic, truncate} from "@/utils/commonUtils";
import {useScrollTo} from "@/hooks/event/useScrollTo";
import FaceImagePermissions from "@/views/system/FaceImage/index.vue";

defineOptions({name: 'DriverFaceCompare'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})

const drawParams = ref({
  rect: {
    imgWidth: 0,
    imgHeight: 0,
  },
})

const params = ref({
  loading: false,
  insightIndex: 0,
  captureIndex: 0,
  content: {
    rid: "",
    face1: "",
    face2: "",
  },
  manyFace: [],
})


const nodeIndex = ref(0);

const elSpaceFooter = ref("elSpaceFooter")
const changeDriverFace = (obj, index) => {
  params.value.loading = true;
  getInsightPerson(obj.idNo).then(res => {
    insightInfo.value = res;
    insightInfo.value.score = obj.score;
    nodeIndex.value = index;
    params.value.loading = false;
    var child = elSpaceFooter.value?.$el?.children[index];
    child?.scrollIntoView({behavior: 'smooth', block: 'center'})
  })
}


const insightList = ref([])
const insightInfo = ref({
  score: 0,
});
const faceCompare = async (rid, index) => {
  params.value.loading = true;
  params.value.insightIndex = 0;
  params.value.captureIndex = index;
  getFaceCompareResult(rid, index, drawParams.value).then(res => {
    console.log(res)
    insightList.value = res;
    if (insightList.value && insightList.value.length > 0) {
      getInsightPerson(insightList.value[0].idNo).then(res => {
        insightInfo.value = res;
        insightInfo.value.score = insightList.value[0].score;
        nodeIndex.value = 0;
      })
    }
    params.value.loading = false;
  })
  // params.value.loading = false;
}


const init = (data) => {
  console.log(data)
  params.value.content = data;
  if (params.value.content.face1) {
    params.value.manyFace.push(params.value.content.face1);
  }
  if (params.value.content.face2) {
    params.value.manyFace.push(params.value.content.face2);
  }
  faceCompare(params.value.content.rid, 0);
}


watch(() => props.content, (newContent) => {
  if (newContent) {
    init(newContent)
  }
})
onMounted(() => {
  init(props.content)
})
const onSelectionComplete = (rect) => {
  console.log('Selected rectangle:', rect);
  drawParams.value.rect = rect;
  faceCompare(props.content.rid, params.value.captureIndex);
}


const showFamilyGrph = ref(false);
const familyContent = ref({});
const openFamilyGraph = (item) => {
  showFamilyGrph.value = true;
  familyContent.value = item;
}


const informationQuery = ref({
  idNo: "",
  sessionId: "",
});
const showIdentityInformation = ref(false);
const goProfilePage = (idNo) => {
  informationQuery.value.idNo = idNo;
  informationQuery.value.sessionId = props.content.JSESSIONID;
  showIdentityInformation.value = true;
}

</script>
<style scoped lang="scss">

.main {
  display: flex;
  flex-wrap: wrap;
}

.left {
  display: flex;
  flex-direction: column;
  border-right: 1px solid gray;
}

.left-face {
  width: 140px;
  height: 150px;
  margin: 5px;
  border: 2px solid white;
  box-shadow: var(--el-box-shadow-lighter);
  cursor: pointer;
}


.center {
  margin-left: 20px;
  height: 200px;
}

.comparison-left {
  display: flex;
}

.comparison-image {
  width: 180px;
  height: 200px;
}

.score {
  background: url('../../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 120px;
  line-height: 26px;
  bottom: 0;
  left: 32%;
}

.score-num {
  display: flex;
  justify-content: center;
  font-size: 26px;
  color: #fafafa;
  font-weight: bold;
}

.user-profile-tips {
  width: 35px;
  height: 32px;
  margin-right: 65px;
  cursor: pointer
}

.compare-container-footer {
  margin-top: 20px;
}

.insight-space {
  margin-left: 25px;
  overflow: auto;
  overflow-y: hidden;
  width: 46%;
}

.list-card {
  //height: 200px;
  display: flex;
  cursor: pointer;
  border: transparent solid 2px;
  margin: 5px;
  width: 240px;
}

.footer-card {
  width: 180px;
  height: 240px;
  position: relative;
  border: 2px solid transparent;
  text-align: center;
  margin: 5px 0;
  cursor: pointer;
}

.footer-card-hover {
  position: relative;
  text-align: center;
  border: 2px solid dodgerblue !important;

  //margin: 5px 0;
}

.footer-card:hover {
  transition: 0.8s;
  border: 2px solid dodgerblue;
}

.footer-box-image {
  width: 80%;
  height: 120px;
  padding: 5px;
}

.score-list {
  background: url('../../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 82px;
  line-height: 20px;
  bottom: 45px;
  left: 25%;
}

.score-list-num {
  display: flex;
  justify-content: center;
  font-size: 20px;
  color: #fafafa;
  font-weight: bold;
}

.space {
  margin-left: 20px;
  overflow: auto;
  width: 96%;
}

.face_selector_div {
  margin-left: 20px;
  display: flex;
  align-items: center;

  .face_selector_center_line {
    width: 20px;
    height: 100%;
    margin-right: 10px;
    border-right: 1px gray solid;
  }

  .face_selector_tip {
    width: 310px;
    height: 340px;
    background-image: url("../../../../public/insight/face_model.png");
    background-size: 100% 100%;
    position: relative;

    .box {
      position: absolute;
      width: 209px;
      height: 247px;
      border: red solid 1px;
      left: 54px;
      top: 11px;
    }

    .tip {
      position: absolute;
      font-size: 14px;
      color: white;
      padding-top: 10px;
      bottom: 21px;
      left: 15px;
    }
  }
}

.result-card-small {
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  //background: #efeaea;
  cursor: pointer;
  border-radius: 12px;
  max-height: 195px;
  height: 195px;
  max-width: 350px;
  min-width: 350px;
  background: #ffffff!important;

  .small-face-image {
    border-radius: 60%;
    right: 1px;
    width: 60px;
    height: 60px;
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

  .card-header {
    display: flex;
    //position: relative;
    background: url(public/insight/oman-vision-2040-seeklogo.svg) no-repeat;
    background-size: 179px 150px;
    background-position-x: 59px;
    background-position-y: -52px;
  }

  :deep(.el-card__body) {
    padding: 10px;
    background: unset;
  }

  .oman-land-image {
    margin-top: 5px;
    right: 1px;
    width: 57px;
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--el-border-color);
    overflow: hidden;
    flex-shrink: 0;
    position: absolute;
    left: 15px;
    bottom: 11px;
    flex-direction: column;
  }

  .oman-land-image img {
    object-fit: fill;
    width: 100%;
    height: 80%;
  }

  .oman-land-image span {
    color: #655091;
    font-size: 0.4rem;
  }

  .face-image {
    width: 85px;
    height: 80px;
    box-shadow: var(--el-box-shadow-lighter);
  }

  .face-compare-box {
    background: url('../../../../public/insight/red_back2.850b4.svg');
    background-size: 100% 100%;
    position: absolute;
    width: 65px;
    line-height: 26px;
    bottom: 65px;
    left: 24px;
  }

  .face-compare-box-num {
    display: flex;
    justify-content: center;
    font-size: 0.7rem;
    color: #fafafa;
    font-weight: bold;
  }


  .card-body {
    display: flex;
    flex-wrap: wrap;

  }

  .small-title-box {
    margin: 2px;
    display: flex;
    align-items: center;
  }

  .small-title-box .residentCard {
    font-size: 0.6rem;
    font-weight: 750;
    margin-right: 10px;
    color: #644d2e;
  }

  .small-face-image {
    border-radius: 60%;
    right: 1px;
    width: 30px;
    height: 30px;
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

  :deep(.el-splitter-panel) {
    overflow: hidden;
  }

  .info-box {
    margin-left: 2px;
  }

  .info-item {
    display: flex;
    margin: 3px;
  }

  .info-item .label {
    font-weight: 550;
    margin-right: 10px;
    font-size: 0.7rem;
    color: #655091;
  }

  .info-item .value.Valid {
    color: #0d2a4a;
  }

  .info-item .value.Expired {
    color: orangered;
  }

  .info-item .value {
    font-size: 0.65rem;
    font-weight: 500;
    color: #0d2a4a;
  }

  .brand-image {
    position: absolute;
    right: 1px;
    border-radius: 60%;
    width: 30px;
    height: 30px;
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

  .card-body {
    display: flex;
    flex-wrap: wrap;
  }

  .card-title {
    font-size: 0.9rem;
    color: #534277;
    display: flex;
    margin-left: 10px;
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .card-title h4 {
    font-weight: bold;
    font-size: 0.9rem;
    background: linear-gradient(to right, #cd7eec, #1d2585, #488638, #1b9b2c);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

:deep(.el-space) {
  grid-gap: 0 8px !important;
  padding: 3px;
}

@media (min-width: 1200px) {

  .insight-space {
    margin-left: 25px;
    overflow: auto;
    overflow-y: hidden;
    width: 45.5%;
  }

  .result-card-small {
    min-width: 350px;
  }

  .result-card {
    min-width: 500px;
  }
  .backside-card {
    min-width: 500px;
  }
  :deep(.el-empty) {
    width: 100% !important;
    height: 83.5vh !important;
  }
}
</style>
<template>
  <div class="main" v-loading="params.loading">
    <div class="left">
      <el-image :src="imageShow(face)" :key="index"
                @click="faceCompare(params.content.rid,index)"
                :style="index===params.captureIndex?'border: 2px solid orange':''"
                v-for="(face,index) in params.manyFace" class="left-face"/>
    </div>
    <div class="center" v-if="insightList.length>0">
      <el-descriptions title="Capture Face Comparison"/>
      <div class="comparison-left">
        <div style="position: relative">
          <face-image-permissions class-name="comparison-image"
          :image-path="imageShow(params.manyFace[params.captureIndex])"
          />

          <face-image-permissions class-name="comparison-image"
                                  :image-path="personImageShow(insightInfo.avatar)"
          />
          <div class="score">
            <div class="score-num">{{ insightInfo.score }}</div>
          </div>
        </div>
      </div>
    </div>
    <el-descriptions border column="3"
                     v-if="insightList.length>0"
                     title="Comparison Identity Information"
                     direction="horizontal"
                     style="margin-left: 10px;width: 60%;height: 400px">
      <el-descriptions-item label="Id No.">
        <el-link type="primary" @click="goProfilePage(insightInfo.idNo)">{{
            insightInfo.idNo
          }}
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="Gender">{{ insightInfo.gender }}</el-descriptions-item>
      <el-descriptions-item label="Country">
        <div style="display: flex;align-items: center">

          <el-image :src="getCountryImage(insightInfo.country)" style="width: 30px"
                    :title="insightInfo.country"/>
          <span>&nbsp;{{ insightInfo.country }}</span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label=" Name En">
        <el-link type="primary" @click="goProfilePage(insightInfo.idNo)">
          {{ insightInfo.englishName }}
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label=" Name Ar">
        <el-link type="primary" @click="goProfilePage(insightInfo.idNo)">
          {{ insightInfo.arabicName }}
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="Deceased">
        <div :style="insightInfo && insightInfo.isDead==='Yes'?'color:red':''"
             style="display: flex;align-items: center;">
          <span>{{ insightInfo.isDead }}</span>
          <span v-show="insightInfo && insightInfo.isDead==='Yes'" class="el-icon-info"
                :title="'Date of Death: '+insightInfo.dateOfDeath"
                style="cursor: pointer;margin-left: 5px"></span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="D.O.B">{{ insightInfo.birthDate }}</el-descriptions-item>
      <el-descriptions-item label="Age" v-if="insightInfo && insightInfo.isDead==='Yes'">
        <span style="color: red">{{ getAge(insightInfo) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="Age" v-if="insightInfo && insightInfo.isDead==='No'">{{
          getAge(insightInfo)
        }}
      </el-descriptions-item>
      <el-descriptions-item label="Martial Status">{{
          insightInfo.martialStatus
        }}
      </el-descriptions-item>
      <el-descriptions-item label="Education">{{
          insightInfo.education
        }}
      </el-descriptions-item>
      <el-descriptions-item label="Occupation">{{
          insightInfo.occupation
        }}
      </el-descriptions-item>
      <el-descriptions-item label="Occupation Ar">{{
          insightInfo.occupationArabic
        }}
      </el-descriptions-item>
      <el-descriptions-item label="Employment Status">{{
          insightInfo.employmentStatus
        }}
      </el-descriptions-item>
      <el-descriptions-item label="Family Relationships" span="2">
        <el-image @click="openFamilyGraph(insightInfo)"
                  title="Family Relationships" :src="getImageUrl('family_icon.svg')"
                  class="user-profile-tips"/>
      </el-descriptions-item>
      <el-descriptions-item label="Passport No." span="3">
        <el-tag v-for="(item,index) in insightInfo.passports" :key="index"
                style="margin-left: 3px" :type="index===0?'primary':'info'">{{ item }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="Address" span="3">{{
          insightInfo.address
        }}
      </el-descriptions-item>
      <!--      <el-descriptions-item label="Phone Numebrs" span="4" rowspan="">-->
      <!--        <el-tag v-for="(item,index) in insightInfo.mobiles" :key="index" v-show="index<5"-->
      <!--                style="margin-left: 3px">{{ item }}-->
      <!--        </el-tag>-->
      <!--      </el-descriptions-item>-->
      <el-descriptions-item label="Vehicle No." span="4">
        <el-tag v-for="(item,index) in insightInfo.vehicleNumbers" :key="index"
                style="margin-left: 3px">{{ item }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <!--    <div class="right">右边</div>-->
    <div class="compare-container-footer" v-if="insightList.length>0">
      <el-divider content-position="left" style="color: red">Face Similarity Persons
      </el-divider>
      <div class="insight-space">
        <el-space ref="elSpaceFooter">
          <el-card v-for="(item,index) in insightList" :key="index"
                   class="result-card-small"
                   :class="{'footer-card-hover':nodeIndex === index}"
                   @click="changeDriverFace(item,index)">
            <div class="card-header">
              <div class="oman-land-image">
                <span>SIGMATURE</span>
                <img :src="getImageUrl('OMAN.svg')"/>
              </div>
              <face-image-permissions class-name="face-image"
                                      element-type="el-div"
                                      :image-path="item.base64"
              />
              <div class="card-title">
                <div class="face-compare-box">
                  <div class="face-compare-box-num">{{ item.score }}</div>
                </div>
                <h4 style="font-style: italic">سلطنة عمان</h4>
                <h4 style="font-style: italic">SULTANATE OF OMAN</h4>
                <div class="small-title-box">
                        <span class="residentCard"
                              v-if="item.note==='OMANI'">IDENTITY<br/> CARD</span>
                  <span class="residentCard" v-else>RESIDENT<br/> CARD</span>
                  <div class="small-face-image">
                    <img :src="item.base64"
                         @error="handleNullPersonPic"
                         v-if="item.base64"
                         alt=""/>
                    <el-image src="default_face.png" v-else/>
                  </div>
                </div>
                <div class="card-body">
                  <div class="info-box">
                    <div class="info-item">
                      <div class="label">CIVIL NUMBER:</div>
                      <div class="value">{{ item.idNo }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">NATIONALITY:</div>
                      <div class="value">{{ truncate(item.note, 15) }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">RENEWAL DATE:</div>
                      <div class="value">{{
                          formatDate(item.renewTime, 'YYYY/MM/DD')
                        }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">DATE OF BIRTH:</div>
                      <div class="value" v-if="item.isDead==='Yes'" style="color: orangered"
                           :title="'Date of Death: '+item.dateOfDeath">
                        {{ formatDate(item.birthDate || item.dataBaseDOB, 'DD/MM/YYYY') }}
                      </div>
                      <div class="value" :title="item.dateOfDeath" v-else>
                        {{ formatDate(item.birthDate || item.dataBaseDOB, 'DD/MM/YYYY') }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">NAME:</div>
                      <div class="value">{{ truncate(item.name, 20) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="brand-image">
                <img :src="getImageUrl('GOV.svg')" alt="o.vehicleMakerEnglish"/>
              </div>
            </div>

          </el-card>
        </el-space>
      </div>
    </div>
    <div class="face_selector_div " v-if="insightList.length===0">
      <DriverFaceSelect
        style="cursor: crosshair;"
        title="Please draw the face position to re-recognize it"
        :imageSrc="imageShow(params.manyFace[params.captureIndex])"
        @selection-complete="onSelectionComplete"/>
      <div class="face_selector_center_line"></div>
      <div class="face_selector_tip box-shadow-radius">
        <div class="box"></div>
        <label class="tip">Please draw the face position and re-recognition it</label>
      </div>
    </div>
  </div>
  <el-dialog
    fullscreen
    draggable
    append-to-body
    v-model="showFamilyGrph"
    @close="showFamilyGrph = false"
    v-if="showFamilyGrph">
    <div v-if="showFamilyGrph" style="width: 100%;">
      <familyRelationsGraph :content="familyContent" v-if="showFamilyGrph"
                            style="height: 92vh"/>
    </div>
  </el-dialog>

  <el-dialog
    width="95%"
    style="margin-top: 1px"
    draggable
    append-to-body
    v-model="showIdentityInformation"
    @close="showIdentityInformation=false"
    v-if="showIdentityInformation">
    <IdentityInformation :content="informationQuery" v-if="showIdentityInformation"/>
  </el-dialog>
</template>


