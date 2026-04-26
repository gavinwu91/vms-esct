<template>
  <div v-loading="loadingInfo.show" :element-loading-text="loadingInfo.text">
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="condition">
          <div class="title-box">
            <div class="">
              <el-button class="vms-reset-button" type="warning" @click="reload">Reset</el-button>
              <el-button
                type="primary"
                plain
                size="default"
                style="margin-left: 10px"
                @click="changePage(1)"
                class="vms-main-button"
                >Search
              </el-button>
            </div>
          </div>
          <el-divider />
          <el-form
            label-position="top"
            v-model="pageQuery"
            style="max-width: 330px; margin: 5px 5px 0 2%"
          >
            <el-form-item label="Library">
              <el-select v-model="pageQuery.platformLibraryId" clearable filterable>
                <el-option
                  v-for="item in staticLibraryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Name">
              <el-input type="text" v-model="pageQuery.name" clearable placeholder="name" />
            </el-form-item>
            <el-form-item label="Wanted No">
              <el-input
                type="text"
                v-model="pageQuery.wantedNo"
                clearable
                placeholder="wanted no"
              />
            </el-form-item>
            <el-form-item label="Gender">
              <el-select v-model="pageQuery.gender" clearable filterable placeholder="gender">
                <el-option :key="1" label="Male" :value="1" />
                <el-option :key="2" label="Female" :value="2" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :span="20" style="">
        <div>
          <div
            style="
              height: 2.2vh;
              width: 100%;
              display: flex;
              justify-content: right;
              justify-items: center;
              padding-right: 1.3rem;
            "
          >
            <el-button
              type="primary"
              size="small"
              @click="confirmCopy"
              v-if="selectButtonInfo.clicked"
              >Copy</el-button
            >
            <el-button
              type="primary"
              size="small"
              @click="selectButtonInfo.clicked = !selectButtonInfo.clicked"
              >{{ selectButtonText }}</el-button
            >
          </div>
          <el-card class="container-card !h-83vh" v-show="!showTrack">
            <div class="h-77vh overflow-auto">
              <div class="card-container" v-show="result.data && result.data.length > 0">
                <el-card
                  v-for="(o, key) in result.data"
                  :key="key"
                  class="result-card"
                  @mouseenter="hoverIndex = key"
                  @mouseleave="hoverIndex = null"
                >
                  <el-checkbox
                    class="!absolute left-8px top--2px"
                    v-if="selectButtonInfo.clicked"
                    @change="(val) => onSelectCheckbox(val, o)"
                  />
                  <div style="padding: 10px">
                    <div class="card-header">
                      <div style="">
                        <FaceImagePermissions
                          element-type="div"
                          className="page-face-image"
                          :image-path="showDjImageUrl(o.url)"
                        />
                        <div class="oman-land-image">
                          <img :src="getImageUrl('OMAN.svg')" />
                        </div>
                      </div>
                      <div class="card-title">
                        <h4 style="font-style: italic">سلطنة عمان</h4>
                        <h4 style="font-style: italic">SULTANATE OF OMAN</h4>
                        <div class="small-title-box">
                          <span
                            class="residentCard"
                            v-if="
                              o.cmnt.toLowerCase() === 'oman' || o.cmnt.toLowerCase() === 'omani'
                            "
                            >IDENTITY<br />
                            CARD</span
                          >
                          <span class="residentCard" v-else
                            >RESIDENT<br />
                            CARD</span
                          >
                          <div class="small-face-image">
                            <img :src="showDjImageUrl(o.url)" alt="" />
                          </div>
                        </div>
                        <div class="card-body">
                          <div class="info-box">
                            <div class="info-item">
                              <div class="label">
                                <el-select
                                  v-model="o.identityType"
                                  size="small"
                                  style="width: 5rem;"
                                >
                                  <el-option :key="1" label="Identity" :value="1" />
                                  <el-option :key="2" label="Passport" :value="2" />
                                  <el-option :key="7" label="Email" :value="7" />
                                  <el-option :key="9" label="Visa" :value="9" />
                                  <el-option :key="4" label="Other" :value="4" />
                                </el-select>
                              </div>
                              <div class="value pt-4px">
                                <span v-if="o.identityType == 1 || o.identityType == undefined">{{
                                  o.identity.sfz
                                }}</span>
                                <span v-else-if="o.identityType == 2">{{ o.identity.hz }}</span>
                                <span v-else-if="o.identityType == 7">{{ o.identity.jzz }}</span>
                                <span v-else-if="o.identityType == 9">{{ o.identity.qz }}</span>
                                <span v-else-if="o.identityType == 4">{{ o.identity.twtxz }}</span>
                              </div>
                            </div>
                            <div class="info-item">
                              <div class="label">Wanted No:</div>
                              <div class="value">{{ o.criminalNumber }} </div>
                            </div>
                            <div class="info-item">
                              <div class="label">DATE OF BIRTH:</div>
                              <div>
                                {{ formatBirthday(o) }}
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
                        <img :src="getImageUrl('GOV.svg')" />
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
              <el-empty
                :image-size="300"
                style="height: 78vh"
                v-show="result.data && result.data.length === 0"
              />
            </div>
            <el-pagination
              style="float: right; margin: 10px"
              background
              layout="sizes,prev,pager,next,total"
              :size="pageQuery.pageSize"
              v-model:current-page="pageQuery.page"
              v-model:page-size="pageQuery.pageSize"
              @current-change="changePage"
              @size-change="changePage"
              :total="result.total"
            />
          </el-card>
        </div>
        <el-image-viewer :url-list="srcList" v-if="showPreview" @close="showPreview = false" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getImageUrl} from '@/views/vehicle/components'
import FaceImagePermissions from '@/views/system/FaceImage/index.vue'
import { PersonApi } from '@/api/library/person'
import { staticOptionList } from '@/api/library'
import {getKsProxyUrl} from "@/api/common";
import { config } from '@/utils/runtimeConfig'
const reload = inject<any>('reload')
const showTrack = ref(false)
const message = useMessage()
const messageBox = ElMessageBox

const staticLibraryOptions = ref([])

const props = defineProps({
  surPlatformLibraryId: {
    type: String
  }
})

const pageQuery = reactive({
  page: 1,
  pageSize: 50,
  platformLibraryId: '',
  name: '',
  wantedNo: '',
  gender: undefined,
  collectionName: '',
  albumId: ''
})

const hoverIndex = ref(null)

//是否点击了 select 按钮
const selectButtonInfo = ref({
  clicked: false,
  personIds: [] as any
})

const showPreview = ref(false)
const srcList = ref([])
const result = ref({
  total: 0,
  data: [
    {
      id: '',
      name: '',
      url: '',
      birthday: '',
      gender: 1,
      cmnt: '',
      homeAddress: '',
      identity: {
        sfz: '',
        hz: '',
        gatxz: '',
        twtxz: '',
        jzz: '',
        qz: ''
      },
      criminalNumber: '',
      identityType: 1
    }
  ],
  dataTotal: 0
})
const loadingInfo = ref({
  show: false,
  text: 'Loading...'
})
//翻页
const changePage = async (page) => {
  loadingInfo.value.show = true
  pageQuery.page = parseInt(page)
  try {
    let res = await PersonApi.getPage2(pageQuery)
    result.value.data = res.list || []
    if (result.value.data) {
      result.value.data.forEach((item) => (item.identityType = 1))
    }
    result.value.total = res.total
    loadingInfo.value.show = false
  } catch (e) {}
}

const showDjImageUrl = (url) => {
  return `${config.KS_PROXY_URL}/v5` + url
}

const showImage = (url) => {
  srcList.value = []
  srcList.value.push(showDjImageUrl(url))
  showPreview.value = true
}

const formatBirthday = (item) => {
  if (item && item.birthday) {
    return item.birthday.split(' ')[0]
  }
  return ''
}

const onSelectCheckbox = (val, item) => {
  if (val) {
    console.log('新增 ===== ', item.id)
    selectButtonInfo.value.personIds.push(item.id)
  } else {
    console.log('删减 ===== ', item.id)
    selectButtonInfo.value.personIds = selectButtonInfo.value.personIds.filter((v) => v != item.id)
  }
}

const selectButtonText = computed(() =>
  selectButtonInfo.value.clicked ? 'Cancel Select' : 'Select'
)

// copy 按钮点击事件
const copyPerson = (o: any) => {
  if (o) {
    loadingInfo.value.show = true
    loadingInfo.value.text = 'Copying...'
    const copyData = {
      platformLibraryIds: [props.surPlatformLibraryId],
      albumId: pageQuery.platformLibraryId,
      platformPersonIds: [o.id]
    }
    console.log('copyData === ', copyData)
    PersonApi.copy(copyData).then((res) => {
      loadingInfo.value.show = false
      ElMessage.success('Copy success')
    })
  }
}

// copy 弹窗  确认事件
const confirmCopy = async () => {
  if (!selectButtonInfo.value.personIds || selectButtonInfo.value.personIds.length < 1) {
    ElMessage.warning('Please select person!')
    return
  }
  messageBox
    .confirm('Sure copy person?', 'Copy', {
      confirmButtonText: 'Ok',
      type: 'warning',
      draggable: true
    })
    .then(() => {
      loadingInfo.value.show = true
      loadingInfo.value.text = 'Copying...'
      const copyData = {
        platformLibraryIds: [props.surPlatformLibraryId],
        albumId: pageQuery.platformLibraryId,
        platformPersonIds: selectButtonInfo.value.personIds
      }
      console.log('copyData === ', copyData)
      PersonApi.copy(copyData).then((res) => {
        loadingInfo.value.show = false
        ElMessage.success('Copy success')
        clear()
      })
    })
}

const initLibraryOption = async () => {
  const libraryResult = await staticOptionList()
  staticLibraryOptions.value = libraryResult.map((d) => ({
    value: d.platformLibraryId,
    label: d.libraryName
  }))
  pageQuery.platformLibraryId = staticLibraryOptions.value[0].value
}

const init = async () => {
  loadingInfo.value.show = true
  await initLibraryOption()
  await changePage(1)
}

const clear = () => {
  selectButtonInfo.value = {
    clicked: false,
    personIds: [] as any
  }
}

onMounted(() => {
  init()
})
</script>
<style scoped>
.condition {
  overflow-y: auto;
  /* box-shadow: var(--el-box-shadow-lighter); */
}

.result {
  width: 82%;
  margin-left: 10px;
}

.title-box {
  margin: 5px;
  display: flex;
  justify-content: flex-end;
  line-height: 40px;
  /* border-bottom: 2px dodgerblue solid; */
}

:deep(.el-card__body) {
  padding: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}

.container-card {
  max-width: 100%;
  margin-top: 5px;
  /* background: linear-gradient(135deg, #f0f0f0, #e0e0e0); */
}

:deep(.el-date-editor .el-range-input) {
  font-size: 12px;
}

:deep(.el-form-item--label-top .el-form-item__label) {
  font-weight: bold;
  font-size: 15px;
}
:deep(.el-date-editor .el-range-separator) {
  font-size: 10px;
}
:deep(.el-divider--horizontal) {
  margin: 10px 0;
}
.result-count-title {
  line-height: 20px;
  font-weight: bold;
  font-size: 20px;
  color: var(--el-text-color-regular);
}
:deep(.el-card__footer) {
  padding: 10px;
}

:deep(.el-descriptions__label) {
  width: 50px;
}
:deep(.el-dialog.detailDialog) {
  padding: 0;
}
:deep(.el-dialog.detailDialog .el-dialog__header) {
  padding-bottom: 0;
}
</style>
<style scoped lang="scss">
.card-container {
  overflow: auto;
  display: grid;
  justify-content: center;
  flex-wrap: wrap;
  grid-template-columns: repeat(auto-fill, minmax(22vh, 39vh));
  gap: 5px;
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
  background: rgba(12, 10, 10, 0.71);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.card-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.result-card {
  position: relative;
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.12),
    0 0 6px rgba(0, 0, 0, 0.04);
  background: #ffffff;
  cursor: pointer;
  border-radius: 12px;
  height: 245px;
  max-width: 40vh;
}

.result-card:hover {
  transition: 0.8s;
  transform: translateY(-8px);
  border: solid orange 1px;
}

.card-header {
  display: flex;
  position: relative;
  background: url('public/insight/oman-vision-2040-seeklogo.svg') no-repeat;
  background-size: 300px 271px;
  background-position-x: 31px;
  background-position-y: -86px;
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

.card-body {
  display: flex;
  flex-wrap: nowrap;
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
</style>
