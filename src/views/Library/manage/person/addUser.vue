<template>
  <div style="width: 100%; height: 62vh; position: relative" v-loading="loading">
    <el-link
      :underline="false"
      :icon="Close"
      style="position: absolute; top: 5px; right: 5px; z-index: 9999; font-size: 16px"
      @click="closeDialog"
    />

    <el-tabs
      type="border-card"
      tab-position="top"
      style="height: 100%"
      v-model="tabTool.activeTabName"
    >
      <el-tab-pane :key="1" label="Detail" name="Detail" v-if="tabTool.showDetailTabFlag">
        <div style="position: relative">
          <div style="position: absolute; right: -10px; top: -20px; z-index: 9999">
            <h1>
              <el-link
                type="primary"
                :underline="false"
                :icon="Edit"
                style="font-size: large"
                title="Edit"
                @click="showEditTab"
              />
            </h1>
          </div>
          <el-form :model="formData" ref="form" :rules="rules" label-width="100" :inline="false">
            <el-row :gutter="20">
              <el-col :span="6">
                <div style="padding: 0 0 0 10%">
                  <el-image
                    v-if="imageInfo.defaultImage"
                    :src="imageInfo.defaultImage"
                    style="width: 252px; cursor: pointer"
                  />
                </div>
              </el-col>
              <el-col :span="18">
                <el-descriptions
                  :column="2"
                  size="large"
                  border
                  label-width="160"
                  class="detail-descriptions"
                >
                  <el-descriptions-item label="Name" label-align="right">
                    {{ formData.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="ID No" label-align="right">
                    {{ formData.identityNumber }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Wanted No" label-align="right">
                    {{ formData.wantedNo }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Passport" label-align="right">
                    {{ formData.passportNumber }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Gender" label-align="right">
                    {{ formData.gender == 1 ? 'Male' : 'Female' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Email" label-align="right">
                    {{ formData.email }}
                  </el-descriptions-item>

                  <el-descriptions-item label="Date Of Birth" label-align="right">
                    {{ formData.birthDate }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Visa" label-align="right">
                    {{ formData.visaNumber }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Address" label-align="right">
                    {{ formData.address }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Phone" label-align="right">
                    {{ formData.phoneNumber }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Capture Time" label-align="right">
                    {{ formData.captureTime }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Other" label-align="right">
                    {{ formData.otherNumber }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Data Source" label-align="right">
                    {{ formData.dataSource }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Nationality" label-align="right">
                    {{ formData.remark }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="tabTool.editName" name="Edit" v-if="tabTool.showEditTabFlag">
        <el-form :model="formData" ref="form" :rules="rules" label-width="100" :inline="false">
          <el-row :gutter="20">
            <el-col :span="6">
              <div style="padding: 10%">
                <el-upload
                  action="#"
                  class="avatar-uploader"
                  ref="upload"
                  :on-success="handleUploadSuccess"
                  :http-request="requestUpload"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                >
                  <el-image
                    v-if="imageInfo.defaultImage"
                    :src="imageInfo.defaultImage"
                    style="width: 252px; cursor: pointer"
                  />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </div>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Name">
                <el-input v-model="formData.name" placeholder="" clearable />
              </el-form-item>
              <el-form-item label="Wanted No">
                <el-input v-model="formData.wantedNo" placeholder="" clearable />
              </el-form-item>
              <el-form-item label="Gender">
                <el-radio-group v-model="formData.gender" size="small">
                  <el-radio v-for="item in genderOptions" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Date Of Birth">
                <el-date-picker
                  v-model="formData.birthDate"
                  :editable="false"
                  placeholder="Birth Date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item label="Address">
                <el-input v-model="formData.address" placeholder="" clearable />
              </el-form-item>
              <el-form-item label="Capture Time">
                <el-date-picker
                  type="datetime"
                  v-model="formData.captureTime"
                  :editable="false"
                  placeholder="Capture time"
                  format="YYYY-MM-DD hh:mm:ss"
                  value-format="YYYY-MM-DD hh:mm:ss"
                />
              </el-form-item>
              <el-form-item label="Data Source">
                <el-input v-model="formData.dataSource" placeholder="" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <div style="height: 100%; overflow-y: auto">
                <!-- <el-link type="success" :underline="false" href="" target="_blank"
                  ><Plus style="width: 18px"
                /></el-link> -->
                <el-form-item label="ID No" label-width="180">
                  <el-input v-model="formData.identityNumber" placeholder="" clearable />
                </el-form-item>
                <el-form-item label="Passport" label-width="180">
                  <el-input v-model="formData.passportNumber" placeholder="" clearable />
                </el-form-item>
                <el-form-item label="Email" label-width="180">
                  <el-input v-model="formData.email" placeholder="" clearable />
                </el-form-item>
                <el-form-item label="Visa" label-width="180">
                  <el-input v-model="formData.visaNumber" placeholder="" clearable />
                </el-form-item>
                <el-form-item label="Phone" label-width="180">
                  <el-input v-model="formData.phoneNumber" placeholder="" clearable />
                </el-form-item>
                <el-form-item label="Other" label-width="180">
                  <el-input v-model="formData.otherNumber" placeholder="" clearable />
                </el-form-item>
                <el-form-item label="Nationality" label-width="180">
                  <el-input v-model="formData.remark" placeholder="" clearable />
                </el-form-item>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <div style="width: 100%; justify-items: right">
                <el-form-item>
                  <el-button type="primary" @click="submitForm" class="vms-main-button"
                    >Confirm</el-button
                  >
                  <el-button @click="cancel" class="vms-cancel-button">Cancel</el-button>
                </el-form-item>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { Loading, Plus, EditPen, Edit, Close } from '@element-plus/icons-vue'
import { PersonApi } from '@/api/portraitlibrary/person'
import defaultImg from '@/assets/imgs/default_face.png'
import { config } from '@/utils/runtimeConfig'
const message = useMessage() // 消息弹窗
const route = useRoute()
const router = useRouter()

const imageInfo = ref({
  defaultImage: defaultImg,
  faceFile: undefined,
  djBaseUrl: `${config.KS_PROXY_URL}/v5`
})
const props = defineProps({
  libraryType: {
    type: Number,
    default: 2,
    required: true
  },
  anyPa: String,
  albumId: {
    type: String,
    required: true
  },
  platformPersonId: {
    type: String,
    required: false
  },
  operateType: {
    type: String,
    required: true
  }
})

const genderOptions = ref([
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
  { label: 'Unknown', value: 3 }
])

const form = ref(null)
const loading = ref(false)
const tabTool = ref({
  tabInfo: [
    { name: 'Detail', label: 'Detail' },
    { name: 'Edit', label: 'Edit' }
  ],
  activeTabName: 'Detail',
  showEditTabFlag: false,
  showDetailTabFlag: false,
  editName: 'Edit'
})

const formData = ref({
  id: undefined,
  name: '',
  wantedNo: '',
  gender: 1,
  birthDate: '',
  remark: '',
  identityNumber: '',
  passportNumber: '',
  email: '',
  visaNumber: '',
  phoneNumber: '',
  otherNumber: '',
  address: '',
  captureTime: '',
  dataSource: '',
  surveillanceReason: '',
  alarmContactPerson: '',
  albumId: props.albumId,
  url: '',
  nationality: ''
})

const rules = reactive({
  name: [{ required: true, message: 'Name can not empty', trigger: 'blur' }]
})

// method

const requestUpload = () => {}

const beforeAvatarUpload = (file) => {
  imageInfo.value.faceFile = file
  if (file.type.indexOf('image/') == -1) {
    message.alertError('File format error, Only support JPG,PNG file!')
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      imageInfo.value.defaultImage = reader.result as string
    }
  }
}

const handleUploadSuccess = () => {}

const clear = () => {
  formData.value = {
    id: undefined,
    name: '',
    wantedNo: '',
    gender: 1,
    birthDate: '',
    remark: '',
    identityNumber: '',
    passportNumber: '',
    email: '',
    visaNumber: '',
    phoneNumber: '',
    otherNumber: '',
    address: '',
    captureTime: '',
    dataSource: '',
    surveillanceReason: '',
    alarmContactPerson: '',
    albumId: props.albumId,
    url: '',
    nationality: ''
  }

  imageInfo.value = {
    defaultImage: defaultImg,
    faceFile: undefined,
    djBaseUrl: `${config.KS_PROXY_URL}/v5`
  }
}

const getOne = async () => {
  const platformPersonId = props.platformPersonId
  const data = {
    platformPersonId: platformPersonId,
    albumId: props.albumId
  }

  const result = await PersonApi.get(data)
  console.log('result.data ==== ', result.data)
  formData.value = result
  imageInfo.value.defaultImage = imageInfo.value.djBaseUrl + formData.value.url
}

const submitForm = async () => {
  loading.value = true
  form.value.validate((valid) => {
    if (valid) {
      //重新组装form表单
      let postData = new FormData()
      formData.value.albumId = props.albumId
      const jsonData = JSON.stringify(formData.value)
      postData.append('file', imageInfo.value.faceFile)
      postData.append('personJson', jsonData)
      PersonApi.save(postData).then((response) => {
        loading.value = false
        closeDialog()
        cancel()
        ElMessage.success('Success!')
      })
    }
  })
}

const showEditTab = () => {
  tabTool.value.showEditTabFlag = true
  tabTool.value.activeTabName = 'Edit'
}

defineExpose({
  clear
})

const emit = defineEmits(['close-dialog'])

const cancel = () => {
  //如果从页面点击过来的是添加按钮
  if (props.operateType == 'Add') {
    emit('close-dialog')
  } else {
    //如果是从人像页面过来的详情按钮
    tabTool.value.showEditTabFlag = false
    tabTool.value.activeTabName = 'Detail'
  }
}

const closeDialog = () => {
  emit('close-dialog')
}

onMounted(() => {
  console.log('props.operateType ===== ', formData.value)
  console.log('albumId ==== ', props.albumId)
  if (props.operateType == 'Show') {
    tabTool.value.showDetailTabFlag = true
    tabTool.value.showEditTabFlag = false
    tabTool.value.activeTabName = 'Detail'
    const platformPersonId = props.platformPersonId
    console.log('platformPersonId ==== ', platformPersonId)
    if (platformPersonId) {
      getOne()
    }
  } else if (props.operateType == 'Add') {
    tabTool.value.editName = 'Add'
    tabTool.value.showEditTabFlag = true
    tabTool.value.showDetailTabFlag = false
    tabTool.value.activeTabName = 'Edit'
  }
})

onUnmounted(() => {
  clear()
})
</script>
<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 252px;
  height: 336px;
  text-align: center;
}

:deep(.detail-descriptions .el-descriptions__cell) {
  width: 30vh;
}
</style>
