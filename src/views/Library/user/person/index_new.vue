<template>
  <div>
    <el-row :gutter="20" style="height: 90vh">
      <el-col :span="5" style="">
        <div class="condition">
          <div class="title-box">
            <span class="condition-title">Filter</span>
            <div class="">
              <el-button type="warning" @click="reload" class="vms-reset-button">Reset</el-button>
              <el-button
                type="primary"
                plain
                size="default"
                style="margin-left: 10px"
                class="vms-main-button"
                @click="changePage(1)"
                >Search
              </el-button>
            </div>
          </div>
          <el-divider />
          <el-form
            label-position="top"
            v-model="pageQuery"
            style="max-width: 330px; margin: 5px 5px 0 10%"
          >
            <el-form-item label="Name">
              <el-input type="text" v-model="pageQuery.name" clearable placeholder="Name" />
            </el-form-item>
            <el-form-item label="ID Type">
              <div class="flex justify-start">
                <el-select class="!w-140px" v-model="pageQuery.idType">
                  <el-option :key="1" label="Identity" :value="1" />
                  <el-option :key="2" label="Passport" :value="2" />
                  <el-option :key="7" label="Email" :value="7" />
                  <el-option :key="9" label="Visa" :value="9" />
                  <el-option :key="4" label="Other" :value="4" />
                </el-select>
                <el-input
                  type="text"
                  v-model="pageQuery.idTypeValue"
                  clearable
                  placeholder="ID type"
                />
              </div>
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
              <el-select v-model="pageQuery.gender" clearable filterable placeholder="Gender">
                <el-option :key="1" label="Male" :value="1" />
                <el-option :key="2" label="Female" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="Phone">
              <el-input type="text" v-model="pageQuery.phone" clearable placeholder="phone" />
            </el-form-item>
            <el-form-item label="Nationality">
              <el-input v-model="pageQuery.remark" placeholder="Nationality" clearable />
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :span="19" style="">
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
              @click="openDialog(null, 'Add')"
              v-if="libraryType == '2'"
              >Add</el-button
            >
            <el-button
              type="primary"
              size="small"
              @click="openLibraryPersonDialog()"
              v-if="!selectButtonInfo.clicked"
              >Copy From Library</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="deleteBatchById"
              v-if="libraryType == '2' && selectButtonInfo.clicked"
              >Delete</el-button
            >
            <el-button
              type="primary"
              size="small"
              @click="copyPerson"
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
          <el-card class="container-card">
            <div class="!h-81vh">
              <div class="card-container" v-show="result.data && result.data.length > 0">
                <el-card
                  v-for="(o, key) in result.data"
                  :key="key"
                  class="result-card !relative"
                  @mouseenter="hoverIndex = key"
                  @mouseleave="hoverIndex = null"
                >
                  <el-checkbox
                    class="!absolute left-7px top--2px"
                    v-show="selectButtonInfo.clicked"
                    @change="(val) => onSelectCheckbox(val, o)"
                  />
                  <div
                    style="
                      position: absolute;
                      right: 5px;
                      top: 3px;
                      justify-content: right;
                      justify-items: center;
                      gap: 10;
                    "
                  >
                    <el-link
                      type="danger"
                      :underline="false"
                      title="Delete"
                      :icon="Delete"
                      style="font-size: 16px"
                      v-show="key == hoverIndex"
                      v-hasPermi="['library:user:delete']"
                      @click="deletePerson(o)"
                    />

                    <el-link
                      type="primary"
                      title="Copy"
                      :underline="false"
                      style="font-size: 16px"
                      :icon="CopyDocument"
                      v-show="key == hoverIndex"
                      @click="copyPerson(o)"
                    />
                  </div>

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
                                  style="width: 5rem"
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
                              <div class="value cursor-pointer" @click="openDialog(o, 'Show')">
                                <span class="w-30vh break-words"> {{ o.name }}</span>
                              </div>
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

    <el-dialog
      class="detailDialog"
      v-model="dialogTool.open"
      destroy-on-close
      draggable
      style="width: 130vh"
      :key="dialogTool.key"
      @close="clearChildInfo"
    >
      <AddUser
        ref="addUser"
        :albumId="routeParam"
        @close-dialog="handleCloseDialog"
        :platform-person-id="viewPlatformPersonId"
        :operateType="dialogTool.operateType"
        :libraryType="libraryType"
      />
    </el-dialog>

    <el-dialog title="Copy" v-model="copyDialogInfo.show" width="30%" @closed="cancelCopy">
      <div>
        <el-select v-model="copyDialogInfo.platformLibrayIds" clearable filterable>
          <el-option
            v-for="item in surLibraryFilterOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <template #footer>
        <span>
          <el-button type="warning" @click="cancelCopy">Cancel</el-button>
          <el-button type="primary" @click="confirmCopy">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="Copy"
      style="margin-top: 15px; height: 93vh"
      v-model="staticPersonCopyDialogInfo.show"
      width="97%"
      :key="staticPersonCopyDialogInfo.key"
      draggable
    >
      <StaticPerson :surPlatformLibraryId="routeParam" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Delete, CopyDocument } from '@element-plus/icons-vue'
import { getImageUrl, personImageShow } from '@/views/vehicle/components'
import { PersonApi } from '@/api/library/person'
import AddUser from '@/views/Library/addUser.vue'
import StaticPerson from '@/views/Library/user/person/StaticIndex.vue'
import FaceImagePermissions from '@/views/system/FaceImage/index.vue'
import { formatDate } from '@/utils/formatTime'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { config } from '@/utils/runtimeConfig'
const reload = inject<any>('reload')
const route = useRoute()
const tagsViewStore = useTagsViewStore()

const routeParam = route.query.platformLibraryId as string
const libraryType = route.query.libraryType as string
const message = useMessage()
const messageBox = ElMessageBox
const surLibraryOptions = ref([])
const surLibraryFilterOptions = ref([])

const pageQuery = reactive({
  page: 1,
  pageSize: 50,
  name: '',
  wantedNo: '',
  gender: undefined,
  collectionName: '',
  albumId: '',
  remark: '',
  phone: '',
  idType: 1,
  idTypeValue: ''
})

const dialogTool = ref({
  title: '',
  open: false,
  key: 1,
  operateType: ''
})

const addUser = ref(null)
const viewPlatformPersonId = ref('')
const hoverIndex = ref(null)

//是否点击了 select 按钮
const selectButtonInfo = ref({
  clicked: false,
  personIds: [] as any
})

// copy 弹窗
const copyDialogInfo = ref({
  show: false,
  platformLibrayIds: '',
  libraryType: 2
})

// 直接从静态库选择人员copy 弹窗
const staticPersonCopyDialogInfo = ref({
  show: false,
  platformLibrayIds: '',
  key: 0
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
//翻页
const changePage = async (page) => {
  if (routeParam) {
    pageQuery.albumId = routeParam as string
  }
  const loadingInstance = ElLoading.service()
  loadingInstance.setText('Loading...')
  pageQuery.page = parseInt(page)
  try {
    let res
    if (libraryType == '1') {
      res = await PersonApi.getPage2(pageQuery)
    } else {
      res = await PersonApi.getPage(pageQuery)
    }

    result.value.data = res.list || []
    if (result.value.data) {
      result.value.data.forEach((item) => (item.identityType = 1))
    }
    result.value.total = res.total
  } catch (e) {}
  console.log(result)
  loadingInstance.close()
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

const handleCloseDialog = () => {
  dialogTool.value.open = false
  clearChildInfo()
  changePage(1)
}

const clearChildInfo = () => {
  addUser.value?.clear()
}

/** 打开弹窗 */
const openDialog = (person: any, type: string) => {
  console.log('routeParam ==== ', routeParam)
  if (person) {
    viewPlatformPersonId.value = person.id
    console.log('viewPlatformPersonId === ', viewPlatformPersonId)
  } else {
    viewPlatformPersonId.value = ''
  }
  if (type == 'Show') {
    dialogTool.value.operateType = 'Show'
    dialogTool.value.title = 'Edit'
  } else if (type == 'Add') {
    dialogTool.value.operateType = 'Add'
    dialogTool.value.title = 'Add'
  }
  dialogTool.value.key++
  dialogTool.value.open = true
}
const openLibraryPersonDialog = () => {
  staticPersonCopyDialogInfo.value.key++
  staticPersonCopyDialogInfo.value.show = true
}

const deleteBatchById = () => {
  const platformPersonIds = selectButtonInfo.value.personIds
  if (!platformPersonIds || platformPersonIds.length == 0) {
    ElMessage.warning('Please select person!')
    return
  }
  messageBox
    .confirm('Sure delete person?', 'Delete', {
      confirmButtonText: 'Ok',
      type: 'warning',
      draggable: true
    })
    .then(() => {
      const param = {
        platformPersonIds: platformPersonIds,
        albumId: routeParam
      }
      console.log('param ====', param)
      selectButtonInfo.value.clicked = false
      PersonApi.delete(param).then((res) => {
        changePage(1)
      })
    })
}

const deletePerson = (person: any) => {
  const platformPersonId = person.id
  messageBox
    .confirm('Sure delete person?', 'Delete', {
      confirmButtonText: 'Ok',
      type: 'warning',
      draggable: true
    })
    .then(() => {
      const param = {
        platformPersonIds: [platformPersonId],
        albumId: routeParam
      }
      console.log('param ====', param)
      PersonApi.delete(param).then((res) => {
        changePage(1)
      })
    })
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
    selectButtonInfo.value.personIds.push(o.id)
  }
  if (selectButtonInfo.value.personIds && selectButtonInfo.value.personIds.length > 0) {
    if (libraryType == '1') {
      surLibraryFilterOptions.value = surLibraryOptions.value
    } else {
      surLibraryFilterOptions.value = surLibraryOptions.value.filter((a) => routeParam != a.value)
    }
    copyDialogInfo.value.show = true
  } else {
    message.alertWarning('Please select person!')
  }
}

// copy 弹窗  确认事件
const confirmCopy = async () => {
  const copyData = {
    platformPersonIds: selectButtonInfo.value.personIds,
    platformLibraryIds: [copyDialogInfo.value.platformLibrayIds],
    libraryType: 2
  }
  await PersonApi.copy(copyData).then((res) => {
    ElMessage.success('Copy success')
    clear()
    cancelCopy()
  })
}

// copy 弹窗 取消事件
const cancelCopy = () => {
  selectButtonInfo.value.personIds = []
  copyDialogInfo.value.platformLibrayIds = ''
  copyDialogInfo.value.show = false
}

const initSurLibraryOption = async () => {
  const libraryResult = await surOptionList()
  surLibraryOptions.value = libraryResult.map((d) => ({
    value: d.platformLibraryId,
    label: d.libraryName
  }))
}

const clear = () => {
  selectButtonInfo.value = {
    clicked: false,
    personIds: [] as any
  }

  copyDialogInfo.value = {
    show: false,
    platformLibrayIds: '',
    libraryType: 2
  }
}

const updateTitle = () => {
  const name = route.query.name as string
  if (name) {
    tagsViewStore.setTitle(name, route.path)
  }
}

onMounted(() => {
  updateTitle()
  initSurLibraryOption()
  changePage(1)
})

watch(() => route.query.name, updateTitle)
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
  justify-content: space-between;
  line-height: 40px;
  /* border-bottom: 2px dodgerblue solid; */
}

:deep(.el-card__body) {
  padding: 10px;
}

:deep(.el-card__header) {
  padding: 10px;
}

.card-container {
  overflow: auto;
  display: grid;
  justify-content: center;
  flex-wrap: wrap;
  grid-template-columns: repeat(auto-fill, minmax(22vh, 40vh));
  gap: 6px;
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

.capture-image {
  height: 20vh;
  object-fit: cover;
  border-radius: 4px;
}

.compare-box {
  position: relative;
}

.condition-title {
  font-weight: bold;
  color: #2672ff;
}

.card-item {
  width: 100%;
  padding: 3px;
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
}

.item-box {
  display: flex;
  flex-direction: column;
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
