<script setup lang="ts">
import { getPasserbyInfo } from '@/api/retrieval'
import { getInsightPerson } from '@/api/identity'
import { getImageUrl } from '@/views/vehicle/components'
import FamilyRelationsGraph from '@/views/identity/components/familyGraph.vue'
import IdentityInformation from '@/views/identity/index.vue'
import FaceCompanion from '@/views/retrieval/components/companion.vue'
import { formatDate, handleNullPersonPic, personalPic, truncate } from '@/utils/commonUtils'
import { getKsProxyUrl } from '@/api/common/index'
import FaceImagePermissions from '@/views/system/FaceImage/index.vue'
import CommonCaptureLocation from '@/views/system/common/location.vue'

defineOptions({ name: 'FaceCaptureDetail' })
const props = defineProps({
  content: {
    type: Object,
    default: () => {}
  }
})

const tools = reactive({
  activeName: 'detail'
})

const identityPhotoHost = ref('https://192.168.80.185:8443/person_img/')
const loading = ref(false)
const detailData = ref({})
const passerInfo = ref({})
const insightInfo = ref({})
const nodeIndex = ref(0)
let mapContent = ref({})
let companionContent = ref({})

const init = async (content) => {
  loading.value = true
  detailData.value = content
  passerInfo.value = await getPasserbyInfo(content.passerbyId)
  if (passerInfo.value.insightList && passerInfo.value.insightList[0]) {
    await changeInformation(passerInfo.value.insightList[0], 0)
  }
  companionContent.value = passerInfo.value
  companionContent.value.source = content
  companionContent.value.position = content.postion
  mapContent.value = content
  loading.value = false
}

const showFamilyGrph = ref(false)
const familyContent = ref({})
const openFamilyGraph = (item) => {
  showFamilyGrph.value = true
  familyContent.value = item
}

const changeInformation = async (item, index) => {
  loading.value = true
  getInsightPerson(encodeURIComponent(item.idNo)).then((res) => {
    insightInfo.value = res
    insightInfo.value.score = item.score
    nodeIndex.value = index
    loading.value = false
  })
}

watch(
  () => props.content,
  (newData) => {
    init(newData)
  }
)

onMounted(() => {
  init(props.content)
})

const informationQuery = ref({})
const showIdentityInformation = ref(false)
const goProfilePage = (idNo) => {
  informationQuery.value.idNo = idNo
  informationQuery.value.sessionId = props.content.JSESSIONID
  showIdentityInformation.value = true
}
</script>
<template>
  <el-tabs v-loading="loading" v-model="tools.activeName">
    <!--基础信息-->
    <el-tab-pane label="Detail" name="detail">
      <div class="detail">
        <div class="capture-left">
          <!--          <span class="font-title"-->
          <!--                style="color: var(&#45;&#45;el-text-color);font-weight: bold;font-size: 0.9rem">Panoramic Image</span>-->
          <el-divider content-position="left">Panoramic Image</el-divider>
          <div class="full-image-box">
            <el-image
              preview-teleported="true"
              hide-on-click-modal="true"
              :preview-src-list="[getKsProxyUrl(passerInfo.capture_panorama_url)]"
              :src="getKsProxyUrl(passerInfo.capture_panorama_url)"
              class="full-image"
            />
          </div>
        </div>
        <div class="capture-right">
          <!--          <span class="font-title"-->
          <!--                style="color: var(&#45;&#45;el-text-color);font-weight: bold;font-size: 0.9rem">Information</span>-->
          <el-divider content-position="left">Information</el-divider>
          <div style="display: flex; justify-content: flex-start">
            <el-image
              preview-teleported="true"
              hide-on-click-modal="true"
              :preview-src-list="[getKsProxyUrl(passerInfo.capture_url)]"
              :src="getKsProxyUrl(passerInfo.capture_url)"
              class="face-image"
            />
            <el-descriptions column="1" style="margin-top: 5px; margin-left: 20px">
              <el-descriptions-item label="Capture Time:"
                >{{ passerInfo.capture_time }}
              </el-descriptions-item>
              <el-descriptions-item label="Device Type:">FR</el-descriptions-item>
              <el-descriptions-item label="Device Location:"
                >{{ detailData.position }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <el-divider content-position="left">Features</el-divider>
          <div style="display: flex; align-items: flex-end; margin-top: 5px">
            <el-tag
              v-for="(item, index) in passerInfo.featureList"
              :key="index"
              style="margin-left: 5px"
              >{{ item }}
            </el-tag>
          </div>
          <span
            class="font-title"
            style="color: var(--el-text-color); font-weight: bold; font-size: 0.9rem"
            >Location Information</span
          >
          <CommonCaptureLocation
            style="height: 380px; width: 100%; box-shadow: var(--el-box-shadow-lighter)"
            v-if="tools.activeName === 'detail'"
            :key="mapContent"
            :content="mapContent"
          />
        </div>
      </div>
    </el-tab-pane>
    <!--比对信息-->
    <el-tab-pane label="Comparison" name="comparison">
      <div class="compare-container">
        <div class="comparison-left">
          <div style="height: 230px; display: flex; position: relative">
            <FaceImagePermissions
              className="comparison-image"
              :image-path="getKsProxyUrl(passerInfo.capture_url)"
            />
            <FaceImagePermissions
              className="comparison-image"
              :image-path="identityPhotoHost + insightInfo.avatar"
            />
            <div class="score">
              <div class="score-num">{{ insightInfo.score }}</div>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center">
          <el-divider content-position="left">Compare Identity Information</el-divider>
          <el-card class="result-card" @click="goProfilePage(insightInfo.idNo)">
            <div class="card-header">
              <div class="oman-land-image">
                <span>SIGMATURE</span>
                <img :src="getImageUrl('OMAN.svg')" />
              </div>
              <FaceImagePermissions
                element-type="el-div"
                className="face-image"
                :image-path="personalPic(insightInfo.avatar)"
              />
              <div class="card-title">
                <h4 style="font-style: italic">سلطنة عمان</h4>
                <h4 style="font-style: italic">SULTANATE OF OMAN</h4>
                <div class="small-title-box">
                  <span class="residentCard" v-if="insightInfo.country === 'Oman'"
                    >IDENTITY<br />
                    CARD</span
                  >
                  <span class="residentCard" v-else
                    >RESIDENT<br />
                    CARD</span
                  >
                  <div class="small-face-image">
                    <img
                      :src="personalPic(insightInfo.avatar)"
                      @error="handleNullPersonPic"
                      v-if="insightInfo.avatar"
                      alt=""
                    />
                    <el-image src="default_face.png" v-else />
                  </div>
                </div>
                <div class="card-body">
                  <div class="info-box">
                    <div class="info-item">
                      <div class="label">CIVIL NUMBER:</div>
                      <div class="value">{{ insightInfo.idNo }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">NATIONALITY:</div>
                      <div class="value">{{ truncate(insightInfo.country, 15) }}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">RENEWAL DATE:</div>
                      <div class="value"
                        >{{ formatDate(insightInfo.renewTime, 'YYYY/MM/DD') }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">DATE OF BIRTH:</div>
                      <div
                        class="value"
                        v-if="insightInfo.isDead === 'Yes'"
                        style="color: orangered"
                        :title="'Date of Death: ' + insightInfo.dateOfDeath"
                      >
                        {{
                          formatDate(insightInfo.birthDate || insightInfo.dataBaseDOB, 'DD/MM/YYYY')
                        }}
                      </div>
                      <div class="value" :title="insightInfo.dateOfDeath" v-else>
                        {{
                          formatDate(insightInfo.birthDate || insightInfo.dataBaseDOB, 'DD/MM/YYYY')
                        }}
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="label">NAME:</div>
                      <div class="value">{{ insightInfo.englishName }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="brand-image">
                <img :src="getImageUrl('GOV.svg')" alt="o.vehicleMakerEnglish" />
              </div>
            </div>
          </el-card>
          <el-card class="backside-card">
            <div class="backside-header">
              <div class="title">
                <h4>سلطنة عمان</h4>
                <h4>الشرطة الملكية</h4>
                <h4>ROYAL OMAN POLICE</h4>
                <h4>D.G.OF.CIVIL STATUS</h4>
                <div class="small-face-image">
                  <img
                    :src="personalPic(insightInfo.avatar)"
                    @error="handleNullPersonPic"
                    v-if="insightInfo.avatar"
                    alt=""
                  />
                  <el-image src="default_face.png" v-else />
                </div>
              </div>
              <div class="center">
                <div class="info-box">
                  <div class="info-item">
                    <div class="label">ARABIC NAME:</div>
                    <div class="value">{{ insightInfo.arabicName }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">PASSPORT NUMBER:</div>
                    <div class="value">{{ insightInfo.passportNo }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">PASSPORT EXPIRY DATE:</div>
                    <div class="value"
                      >{{ formatDate(insightInfo.passportExpiryDate, 'YYYY/MM/DD') }}
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="label">EDUCATION:</div>
                    <div class="value">{{ insightInfo.education }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">EMPLOYMENT STATUS:</div>
                    <div class="value">{{ insightInfo.employmentStatus }}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">OCCUPATION:</div>
                    <div class="value">{{ insightInfo.occupation }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="backside-bottom">
              <h4>{{ 'IDOMAN :' + insightInfo.idNo }}</h4>
              <h4>
                {{ formatDate(insightInfo.birthDate || insightInfo.dataBaseDOB, 'YYYYMMDD') }}>{{
                  insightInfo.country
                }}</h4
              >
              <h4>{{ insightInfo.englishName }}</h4>
              <h4>{{ insightInfo.arabicName }}</h4>
            </div>
          </el-card>
        </div>
        <div class="compare-container-footer">
          <el-divider content-position="left">Real Identity Information</el-divider>
          <el-space direction="vertical">
            <el-card
              v-for="(item, index) in passerInfo.insightList"
              :key="index"
              class="result-card-small"
              :class="{ 'footer-card-hover': nodeIndex === index }"
              @click="changeInformation(item, index)"
            >
              <div class="card-header">
                <div class="oman-land-image">
                  <span>SIGMATURE</span>
                  <img :src="getImageUrl('OMAN.svg')" />
                </div>
                <FaceImagePermissions
                  element-type="el-div"
                  className="face-image"
                  :image-path="getKsProxyUrl(item.photo_url)"
                />
                <div class="card-title">
                  <div class="face-compare-box">
                    <div class="face-compare-box-num">{{ insightInfo.score }}</div>
                  </div>
                  <h4 style="font-style: italic">سلطنة عمان</h4>
                  <h4 style="font-style: italic">SULTANATE OF OMAN</h4>
                  <div class="small-title-box">
                    <span class="residentCard" v-if="item.note === 'OMANI'"
                      >IDENTITY<br />
                      CARD</span
                    >
                    <span class="residentCard" v-else
                      >RESIDENT<br />
                      CARD</span
                    >
                    <div class="small-face-image">
                      <img
                        :src="getKsProxyUrl(item.photo_url)"
                        @error="handleNullPersonPic"
                        v-if="item.photo_url"
                        alt=""
                      />
                      <el-image src="default_face.png" v-else />
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
                        <div class="value">{{ formatDate(item.renewTime, 'YYYY/MM/DD') }} </div>
                      </div>
                      <div class="info-item">
                        <div class="label">DATE OF BIRTH:</div>
                        <div
                          class="value"
                          v-if="item.isDead === 'Yes'"
                          style="color: orangered"
                          :title="'Date of Death: ' + item.dateOfDeath"
                        >
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
                  <img :src="getImageUrl('GOV.svg')" alt="o.vehicleMakerEnglish" />
                </div>
              </div>
            </el-card>
          </el-space>
        </div>
      </div>
    </el-tab-pane>
    <!--伴随信息-->
    <el-tab-pane label="Companion" name="companion">
      <FaceCompanion
        :content="companionContent"
        :key="companionContent"
        v-if="tools.activeName === 'companion'"
        v-loading="loading"
      />
    </el-tab-pane>
  </el-tabs>

  <el-dialog
    fullscreen
    draggable
    append-to-body
    v-model="showFamilyGrph"
    @close="showFamilyGrph = false"
    v-if="showFamilyGrph"
  >
    <div v-if="showFamilyGrph" style="width: 100%">
      <familyRelationsGraph :content="familyContent" v-if="showFamilyGrph" style="height: 92vh" />
    </div>
  </el-dialog>

  <el-dialog
    width="95%"
    style="margin-top: 1px"
    draggable
    append-to-body
    v-model="showIdentityInformation"
    @close="showIdentityInformation = false"
    v-if="showIdentityInformation"
  >
    <IdentityInformation :content="informationQuery" v-if="showIdentityInformation" />
  </el-dialog>
</template>
<style scoped lang="scss">
.footer-card {
  width: 80px;
  height: 240px;
  //height: 200px;
  position: relative;
  border: 2px solid transparent;
  text-align: center;
  margin: 5px 0;
}

.footer-card-hover {
  //height: 350px;
  //position: relative;
  border: 2px solid dodgerblue !important;
  //margin: 5px 0;
}

.footer-card:hover {
  //transition: 0.8s;
  border: 2px solid dodgerblue;
}

.footer-box {
  position: relative;
  cursor: pointer;
}

.footer-box-image {
  width: 70%;
  height: 120px;
  padding: 5px;
}

.score-list {
  background: url('../../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 82px;
  line-height: 34px;
  bottom: 0;
  left: 25%;
}

.score-list-num {
  display: flex;
  justify-content: center;
  font-size: 20px;
  color: #fafafa;
  font-weight: bold;
}

.score {
  background: url('../../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 100px;
  line-height: 28px;
  bottom: 39px;
  left: 37%;
}

.score-num {
  display: flex;
  justify-content: center;
  font-size: 0.9rem;
  color: #fafafa;
  font-weight: 700;
}

.detail {
  display: flex;
  justify-content: space-between;
  box-shadow: var(--el-box-shadow-lighter);
  align-items: baseline;
}

.capture-params {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin: 5px;
}

.capture-left {
  display: flex;
  flex-direction: column;
  width: 70%;
  height: 100%;
}

.capture-right {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 70%;
  margin-left: 30px;
  align-content: stretch;
  // box-shadow: var(--el-box-shadow-lighter);
}

.full-image {
  //height: 70%;
  height: 100%;
}

.fill-image {
  //width: 800px;
  width: 100%;
  height: 80%;
  box-shadow: var(--el-box-shadow-lighter);
}

.face-image {
  width: 85px;
  height: 80px;
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
}

.comparison-image {
  width: 230px;
  height: 225px;
}

.compare-container-footer {
  overflow-x: auto;
  width: 25%;
  flex-direction: column;
  display: flex;
}

.companion-container {
  flex-direction: column;
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

:deep(.el-divider__text.is-left) {
  font-weight: bold;
}

.user-profile-tips {
  width: 35px;
  height: 32px;
  margin-right: 65px;
  cursor: pointer;
}

.comparison-left {
  position: relative;
  display: flex;
  flex-direction: row;
}

.compare-container {
  display: flex;
  flex-direction: row;
  height: 560px;
  max-height: 560px;
  justify-content: space-between;
}

:deep(.el-card__body) {
  padding: 2px;
}

:deep(.el-card__footer) {
  padding: 5px;
}

:deep(.el-card__body) {
  padding: 10px;
  background: unset;
}

.backside-card {
  margin-top: 2px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  max-height: 285px;
  min-height: 285px;
  padding: 0;
  background: #ffffff;

  .backside-header {
    min-height: 50%;
    height: 150px;
    display: flex;

    .title {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .title h4 {
      text-align: right;
      font-weight: 800;
      font-size: 0.7rem;
      background: linear-gradient(to right, #cd7eec, #1d2585, #488638, #1b9b2c);
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .title .small-face-image {
      margin-top: 5px;
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
      border-radius: 60%;

      img {
        object-fit: fill;
        width: 100%;
        height: 100%;
      }
    }

    .center {
      .info-box {
        margin-left: 8px;
      }

      .info-item {
        display: flex;
        margin: 3px;
      }

      .info-item .label {
        font-weight: 550;
        margin-right: 10px;
        font-size: 0.85rem;
        color: #655091;
      }

      .info-item .value {
        font-size: 0.8rem;
        font-weight: 500;
        color: #0d2a4a;
      }
    }
  }

  .backside-bottom {
    margin-top: 2px;
    background: #efe8f1;
    max-height: 115px;
    height: 120px;
    padding: 10px;

    h4 {
      color: #0d2a4a;
      line-height: 25px;
      font-size: 0.9rem;
      font-weight: 700;
    }
  }
}

.result-card {
  position: relative;
  overflow: hidden;
  //background: #efeaea;
  cursor: pointer;
  border-radius: 12px;
  max-height: 265px;
  min-height: 265px;
  background: #ffffff;

  .face-image {
    width: 120px;
    height: 120px;
    box-shadow: var(--el-box-shadow-lighter);
  }

  .card-header {
    display: flex;
    background: url(public/insight/oman-vision-2040-seeklogo.svg) no-repeat;
    background-size: 292px 294px;
    background-position-x: 12px;
    background-position-y: -112px;
  }

  .oman-land-image {
    margin-top: 5px;
    right: 1px;
    width: 80px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--el-border-color);
    overflow: hidden;
    flex-shrink: 0;
    position: absolute;
    left: 15px;
    flex-direction: column;
    bottom: 0;
  }

  .oman-land-image span {
    line-height: 20px;
    color: #655091;
    font-size: 0.5rem;
  }

  .oman-land-image img {
    object-fit: fill;
    width: 100%;
    height: 70%;
  }

  .face-compare-box {
    text-align: center;
    color: red;
    font-weight: 500;
    overflow: hidden;
    flex-shrink: 0;
    position: absolute;
    left: 50px;
    bottom: 0;
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
    font-size: 0.8rem;
    font-weight: 750;
    margin-right: 10px;
    color: #644d2e;
  }

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
    font-size: 0.85rem;
    color: #655091;
  }

  .info-item .value {
    font-size: 0.8rem;
    font-weight: 500;
    color: #0d2a4a;
  }

  .brand-image {
    position: absolute;
    right: 1px;
    border-radius: 60%;
    width: 60px;
    height: 60px;
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
    color: #534277;
    display: flex;
    margin-left: 10px;
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .card-title h4 {
    font-weight: bold;
    font-size: 1.2rem;
    background: linear-gradient(to right, #cd7eec, #1d2585, #488638, #1b9b2c);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.result-card-small {
  position: relative;
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.12),
    0 0 6px rgba(0, 0, 0, 0.04);
  //background: #efeaea;
  border: 2px solid transparent;
  cursor: pointer;
  border-radius: 12px;
  max-height: 195px;
  height: 195px;
  background: #ffffff;

  .card-header {
    display: flex;
    //position: relative;
    background: url(public/insight/oman-vision-2040-seeklogo.svg) no-repeat;
    background-size: 184px 191px;
    background-position-x: 68px;
    background-position-y: -48px;
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

@media (min-width: 1200px) {
  .result-card-small {
    min-width: 350px;
  }

  .result-card {
    min-width: 420px;
    max-width: 420px;
  }
  .backside-card {
    min-width: 420px;
    max-width: 420px;
  }
  :deep(.el-empty) {
    width: 100% !important;
    height: 83.5vh !important;
  }
}

.result-card {
  position: relative;
  overflow: hidden;
  //background: #efeaea;
  cursor: pointer;
  border-radius: 12px;
  max-height: 240px;
  min-height: 230px;
  background: #ffffff;

  .face-image {
    width: 80px;
    height: 70px;
    box-shadow: var(--el-box-shadow-lighter);
  }

  .card-header {
    display: flex;
    background: url(public/insight/oman-vision-2040-seeklogo.svg) no-repeat;
    background-size: 300px 300px;
    background-position-x: 60px;
    background-position-y: -85px;
  }

  .oman-land-image {
    right: 1px;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--el-border-color);
    overflow: hidden;
    flex-shrink: 0;
    position: absolute;
    left: 20px;
    flex-direction: column;
    bottom: 20px;
  }

  .oman-land-image span {
    color: #655091;
    font-size: 0.6rem;
  }

  .oman-land-image img {
    object-fit: fill;
    width: 100%;
    height: 70%;
  }

  .face-compare-box {
    text-align: center;
    color: red;
    font-weight: 500;
    overflow: hidden;
    flex-shrink: 0;
    position: absolute;
    left: 50px;
    bottom: 0;
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
    font-size: 0.65rem;
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
    font-size: 0.75rem;
    color: #655091;
  }

  .info-item .value {
    font-size: 0.75rem;
    font-weight: 500;
    color: #0d2a4a;
    text-align: left !important;
  }

  .brand-image {
    position: absolute;
    right: 1px;
    border-radius: 60%;
    width: 60px;
    height: 60px;
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
    color: #534277;
    display: flex;
    margin-left: 10px;
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .card-title h4 {
    font-weight: bold;
    font-size: 0.95rem;
    background: linear-gradient(to right, #cd7eec, #1d2585, #488638, #1b9b2c);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.backside-card {
  margin-top: 10px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  max-height: 250px;
  min-height: 240px;
  padding: 0;
  background: #ffffff;

  .backside-header {
    min-height: 50%;
    height: 120px;
    display: flex;

    .title {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .title h4 {
      text-align: right;
      font-weight: 800;
      font-size: 0.6rem;
      background: linear-gradient(to right, #cd7eec, #1d2585, #488638, #1b9b2c);
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .title .small-face-image {
      margin-top: 5px;
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
      border-radius: 60%;

      img {
        object-fit: fill;
        width: 100%;
        height: 100%;
      }
    }

    .center {
      .info-box {
        margin-left: 8px;
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

      .info-item .value {
        font-size: 0.7rem;
        font-weight: 500;
        color: #0d2a4a;
      }
    }
  }

  .backside-bottom {
    margin-top: 2px;
    background: #efe8f1;
    max-height: 100px;
    height: 100px;
    padding: 10px;

    h4 {
      color: #0d2a4a;
      line-height: 16px;
      font-size: 0.7rem;
      font-weight: 700;
    }
  }
}

.full-image-box {
  display: flex;
  flex-shrink: 1;
  .full-image {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
}
</style>
