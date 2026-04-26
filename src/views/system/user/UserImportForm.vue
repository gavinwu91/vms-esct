<template>
  <Dialog v-model="dialogVisible" title="Import" width="400">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">Drag the file here ,or <em>click Upload </em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            Update existing user data
          </div>
          <span>Only imports of xls, xlsx format files are allowed.</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            Download Template
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm" class="vms-main-button">Confirm</el-button>
      <el-button @click="dialogVisible = false" class="vms-cancel-button">Cancel</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/utils/download'

defineOptions({ name: 'SystemUserImportForm' })

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const uploadRef = ref()
const importUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/system/user/import'
const uploadHeaders = ref() // 上传 Header 头
const fileList = ref([]) // 文件列表
const updateSupport = ref(0) // 是否更新已经存在的用户数据

/** 打开弹窗 */
const open = () => {
  dialogVisible.value = true
  updateSupport.value = 0
  fileList.value = []
  resetForm()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  if (fileList.value.length == 0) {
    message.error('Please upload the document')
    return
  }
  // 提交请求
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
  formLoading.value = true
  uploadRef.value!.submit()
}

/** 文件上传成功 */
const emits = defineEmits(['success'])
const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    formLoading.value = false
    return
  }
  // 拼接提示语
  const data = response.data
  let text = 'Number of successful uploads：' + data.createUsernames.length + ';'
  for (let username of data.createUsernames) {
    text += '< ' + username + ' >'
  }
  text += 'Update success number：' + data.updateUsernames.length + ';'
  for (const username of data.updateUsernames) {
    text += '< ' + username + ' >'
  }
  text += 'Update failure count：' + Object.keys(data.failureUsernames).length + ';'
  for (const username in data.failureUsernames) {
    text += '< ' + username + ': ' + data.failureUsernames[username] + ' >'
  }
  message.alert(text)
  formLoading.value = false
  dialogVisible.value = false
  // 发送操作成功的事件
  emits('success')
}

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error('Upload failure, please re-upload!')
  formLoading.value = false
}

/** 重置表单 */
const resetForm = async (): Promise<void> => {
  // 重置上传 Status和文件
  formLoading.value = false
  await nextTick()
  uploadRef.value?.clearFiles()
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('Only one file can be uploaded!')
}

/** 下载Template 操作 */
const importTemplate = async () => {
  const res = await UserApi.importUserTemplate()
  download.excel(res, 'User Template.xls')
}
</script>
<style lang="scss" scoped>
:deep(.el-upload) {
  .el-upload-dragger {
    background-color: rgba(15, 23, 42, 0.4) !important;
    border: 1px dashed rgba(56, 189, 248, 0.3) !important;
    border-radius: 12px !important;
    transition: all 0.3s;

    &:hover {
      border-color: #38bdf8 !important;
      background-color: rgba(56, 189, 248, 0.05) !important;
    }

    .el-icon--upload {
      color: #38bdf8 !important;
    }

    .el-upload__text {
      color: #94a3b8 !important;
      em {
        color: #38bdf8 !important;
        font-style: normal;
        font-weight: 600;
      }
    }
  }
}

:deep(.el-upload__tip) {
  color: #64748b !important;
  line-height: 1.6 !important;
}

:deep(.el-checkbox) {
  --el-checkbox-text-color: #94a3b8 !important;
}

:deep(.el-link--primary) {
  color: #38bdf8 !important;
  &:hover {
    color: #7dd3fc !important;
  }
}
</style>
