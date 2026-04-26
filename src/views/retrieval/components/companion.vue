<script setup lang="ts">
import { companion, getPasserbyInfo } from '@/api/retrieval'
import { getAge, getInsightPerson } from '@/api/identity'
import { getCountryImage, getImageUrl } from '@/views/vehicle/components'
import IdentityInformation from '@/views/identity/index.vue'
import FamilyRelationsGraph from '@/views/identity/components/familyGraph.vue'
import { formatDate, handleNullPersonPic, personalPic, truncate } from '@/utils/commonUtils'
import { getKsProxyUrl } from '@/api/common'
import { faceSearchPermission } from '@/directives/permission/hasPermi'
import FaceImagePermissions from '@/views/system/FaceImage/index.vue'

defineOptions({ name: 'FaceCompanion' })
const props = defineProps({
  content: {
    type: Object,
    default: () => {}
  }
})

onMounted(() => {
  init(props.content)
})

watch(props.content, (newData) => {
  init(newData)
})

//身份信息
const informationQuery = ref({
  idNo: '',
  sessionId: ''
})
const showIdentityInformation = ref(false)
const goProfilePage = (idNo) => {
  informationQuery.value.idNo = idNo
  informationQuery.value.sessionId = props.content.JSESSIONID
  showIdentityInformation.value = true
}

//家庭关系
const showFamilyGrph = ref(false)
const familyContent = ref({})
const openFamilyGraph = (item) => {
  showFamilyGrph.value = true
  familyContent.value = item
}

const identityPhotoHost = ref('https://192.168.80.185:8443/person_img/')
const peerIndex = ref(0)
const peerObject = ref({
  cameraName: '',
  captureTime: '',
  faceBase64: '',
  placeName: '',
  rectFullImage: ''
})
const captureObject = ref({
  insightList: []
})
const insightInfo = ref({
  score: 0
})
let companionMapContent = ref({})
const tabActiveName = ref('detail')
const loading = ref(false)
const detailData = ref({
  source: {
    lat: '',
    lon: ''
  }
})
const companionList = ref([])
const nodeIndex = ref(0)

const init = async (content: any) => {
  loading.value = true
  detailData.value = content
  companionList.value = await companion({ photoId: content.passerby_id, peerInterval: 10 })
  if (companionList) {
    await peerChose(companionList.value[0], 0)
  }
  loading.value = false
}

const captureElSpace = ref('captureElSpace')
//伴随列表选择
const peerChose = async (object, index) => {
  loading.value = true
  try {
    peerObject.value = object
    peerIndex.value = index
    await peerShow(object.fullUrl, object.fullRect)
    captureObject.value = await getPasserbyInfo(object.photoId)
    if (captureObject.value.insightList && captureObject.value.insightList[0]) {
      await changeInformation(captureObject.value.insightList[0], 0)
    }
    //地图需要
    companionMapContent.value = {
      deviceName: peerObject.value.cameraName,
      captureTime: peerObject.value.captureTime,
      captureUrl: peerObject.value.faceBase64,
      lon: parseFloat(detailData.value.source.lon),
      lat: parseFloat(detailData.value.source.lat),
      position: peerObject.value.placeName,
      score: '0'
    }
  } finally {
    loading.value = false
    var child = captureElSpace.value?.$el?.children[index]
    child?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const elSpaceFooter = ref('elSpaceFooter')

//切换真实身份信息
const changeInformation = async (item, index) => {
  loading.value = true
  getInsightPerson(encodeURIComponent(item.idNo)).then((res) => {
    insightInfo.value = res
    insightInfo.value.score = item.score
    nodeIndex.value = index
    loading.value = false
    var child = elSpaceFooter.value?.$el?.children[index]
    child?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

//图标画框
const peerShow = async (fullUrl, rect) => {
  loading.value = true
  buildRect(getKsProxyUrl(fullUrl), JSON.stringify(rect)).then((res) => {
    peerObject.value.rectFullImage = res
    loading.value = false
  })
}
//图标画框
const buildRect = (url, rect) => {
  return new Promise((resolve) => {
    let image = new Image()
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
    image.onload = () => {
      let rects = JSON.parse(rect)
      let imgWidth = image.width
      let imgHeight = image.height
      if (!rects.length) {
        rects = [rects]
      }
      let canvas = document.createElement('canvas')
      canvas.width = imgWidth
      canvas.height = imgHeight
      let ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, imgWidth, imgHeight)
      ctx.lineWidth = 6
      ctx.strokeStyle = '#3572f1'
      const x = rects.at(0)
      ctx.strokeRect(x.leftPixels, x.topPixels, x.widthPixels, x.heightPixels)
      let detailImage = canvas.toDataURL('image/png')
      resolve(detailImage)
    }
  })
}
</script>
<template>
  <div v-loading="loading" v-if="peerObject">
    <div class="container">
      <div class="bottom">
        <div class="bottom-box">
          <el-divider content-position="left">Peer Face Captured</el-divider>
          <div style="display: flex; flex-direction: row; margin: 10px">
            <el-image
              :src="getKsProxyUrl(detailData.capture_url)"
              class="left-top-image"
              preview-teleported="true"
              hide-on-click-modal="true"
            />
            <span style="margin: 5px 5px; color: orangered">{{ detailData.capture_time }}</span>
          </div>
          <div class="space">
            <el-space direction="vertical" ref="captureElSpace">
              <el-card
                :key="index"
                v-for="(item, index) in companionList"
                @click="peerChose(item, index)"
                :style="index === peerIndex ? 'border:solid 2px dodgerblue' : ''"
                class="list-card"
                :class="{ 'list-card-hover': peerIndex === index }"
              >
                <div style="display: flex; flex-direction: column">
                  <FaceImagePermissions className="left-top-image" :image-path="getKsProxyUrl(item.faceUrl)" />
                </div>
                <template #footer>
                  <div
                    >{{
                      item.interval > 0
                        ? 'After ' + item.interval + ' s'
                        : 'Before ' + (0 - item.interval) + ' s'
                    }}
                  </div>
                  <div style="margin-top: 5px; color: orangered">{{ item.captureTime }}</div>
                </template>
              </el-card>
            </el-space>
          </div>
        </div>
      </div>
      <div class="detail-container">
        <div class="detail-container-left">
          <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center">
            <el-divider content-position="left">Compare Face</el-divider>
            <div class="comparison-left">
              <div style="position: relative">
                <FaceImagePermissions
                  className="comparison-image"
                  :image-path="getKsProxyUrl(peerObject.faceBase64)"
                />
                <FaceImagePermissions
                  className="comparison-image"
                  :image-path="getKsProxyUrl(peerObject.faceBase64)"
                />
                <div class="score">
                  <div class="score-num">{{ insightInfo.score }}</div>
                </div>
              </div>
              <div style="display: flex; align-items: flex-end; margin-top: 5px">
                <el-tag
                  v-for="(item, index) in captureObject.featureList"
                  :key="index"
                  style="margin-left: 5px"
                  >{{ item }}
                </el-tag>
              </div>
            </div>
          </div>
          <el-divider content-position="left">Panoramic Image</el-divider>
          <el-image
            :src="peerObject.rectFullImage"
            preview-teleported="true"
            hide-on-click-modal="true"
            fit="contain"
            :preview-src-list="[peerObject.rectFullImage]"
            style="width: 100%; height: 23vh"
          />
        </div>
      </div>
      <div class="id-card-box">
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
                    <div class="value">{{ formatDate(insightInfo.renewTime, 'YYYY/MM/DD') }} </div>
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
        <el-card class="backside-card" @click="goProfilePage(insightInfo.idNo)">
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
    </div>
    <el-divider content-position="left">Real Identity Information</el-divider>
    <div class="insight-space">
      <el-space ref="elSpaceFooter" style="width: 40%">
        <el-card
          v-for="(item, index) in captureObject.insightList"
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
                <div class="face-compare-box-num">{{ item.score }}</div>
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
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  font-size: 0.75rem !important;
}

.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.left {
  width: 250px;
}

.bottom-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 2px solid transparent;
  min-width: 280px;
  max-width: 280px;
  align-items: center;

  .capture-image {
    width: 80px;
    height: 80px;
  }
}

.left-top-image {
  width: 85px;
  height: 85px;
}

:deep(.el-timeline) {
  overflow-y: auto;
  height: 55vh;
}

:deep(.el-timeline-item__timestamp) {
  color: orangered;
}

.list-card-hover {
  border: 2px orangered solid;
}

.right {
  width: 60%;
}

.bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.space {
  margin-left: 20px;
  overflow: auto;
  overflow-x: hidden;
  height: 380px;
  max-height: 385px;
}

:deep(.el-card__footer) {
  padding: 5px;
}

.compare-container-footer {
  margin-top: 20px;
}

.insight-space {
  margin: auto;
  overflow: auto;
  overflow-y: hidden;
  width: 95%;
}

.list-card {
  //height: 200px;
  display: flex;
  cursor: pointer;
  border: transparent solid 2px;
  margin: 5px;
  width: 240px;
}

.detail-container {
  height: 50vh;
  display: flex;
}

.detail-container-left {
  width: 650px;
  height: 50%;
}

.comparison-left {
  position: relative;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.comparison-image {
  width: 180px;
  height: 175px;
}

.score {
  background: url('../../../../public/insight/red_back2.850b4.svg');
  background-size: 100% 100%;
  position: absolute;
  width: 80px;
  line-height: 26px;
  bottom: 0;
  left: 43%;
}

.score-num {
  display: flex;
  justify-content: center;
  font-size: 0.9rem;
  color: #fafafa;
  font-weight: bold;
}

.comparison-right {
  //width: 65%;
}

.user-profile-tips {
  width: 35px;
  height: 32px;
  margin-right: 65px;
  cursor: pointer;
}

.footer-card {
  width: 180px;
  height: 240px;
  position: relative;
  border: 2px solid transparent;
  text-align: center;
  margin: 5px 0;
}

.footer-card-hover {
  position: relative;
  text-align: center;
  border: 2px solid dodgerblue !important;
}

.footer-box {
  position: relative;
  cursor: pointer;
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
    background-size: 266px 295px;
    background-position-x: 28px;
    background-position-y: -107px;
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
    width: 35px;
    height: 35px;
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

.result-card-small {
  position: relative;
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.12),
    0 0 6px rgba(0, 0, 0, 0.04);
  margin: 5px 0;
  cursor: pointer;
  border-radius: 12px;
  max-height: 175px;
  height: 175px;
  border: 2px solid transparent;
  background: #ffffff;

  .card-header {
    display: flex;
    //position: relative;
    background: url(public/insight/oman-vision-2040-seeklogo.svg) no-repeat;
    background-size: 183px 157px;
    background-position-x: 59px;
    background-position-y: -33px;
  }

  :deep(.el-card__body) {
    padding: 10px;
    background: unset;
  }

  .oman-land-image {
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
    bottom: 56px;
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
    font-size: 0.5rem;
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
    font-size: 0.65rem;
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
    text-align: left;
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
    font-size: 0.75rem;
    color: #534277;
    display: flex;
    margin-left: 10px;
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .card-title h4 {
    font-weight: bold;
    font-size: 0.75rem;
    background: linear-gradient(to right, #cd7eec, #1d2585, #488638, #1b9b2c);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.face-image {
  width: 75px;
  height: 70px;
  box-shadow: var(--el-box-shadow-lighter);
}

@media (min-width: 1200px) {
  .result-card-small {
    min-width: 310px;
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

.id-card-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5px;
}

:deep(.el-divider--horizontal) {
  margin: 15px !important;
}
</style>
