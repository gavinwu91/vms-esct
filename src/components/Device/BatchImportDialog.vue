<template>
    <el-dialog
      v-model="visible"
      title="Batch Import Devices"
      width="50%"
    >
      <el-steps :active="activeStep" finish-status="success">
        <el-step title="Download Template" />
        <el-step title="Upload File" />
        <el-step title="Import Result" />
      </el-steps>
      
      <div v-if="activeStep === 0" class="step-content">
        <el-button type="primary" @click="download">Download Template</el-button>
        <div class="tips">
          <h4>Import Instructions:</h4>
          <p>1. Please download the template file first and fill in the data according to the template format</p>
          <p>2. Supports .xlsx format files, file size must not exceed 5MB</p>
          <p>3. Each import allows up to 1000 records</p>
        </div>
      </div>
      
      <div v-else-if="activeStep === 1" class="step-content">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          action=""
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Drag the file here, or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              Please upload .xlsx or .xls format files, file size must not exceed 5MB
            </div>
          </template>
        </el-upload>
      </div>
      
      <div v-else class="step-content">
        <el-result
          v-if="importResult.success"
          icon="success"
          title="Import Success"
          :sub-title="`import ${importResult.successCount} items`"
        >
          <template #extra>
            <el-button type="primary" @click="handleComplete">finished</el-button>
          </template>
        </el-result>
        
        <el-result
          v-else
          icon="error"
          title="Import failed"
          :sub-title="importResult.message || 'error'"
        >
          <template #extra>
            <el-button @click="activeStep = 1">Upload</el-button>
          </template>
        </el-result>
        
        <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
          <h4>error info：</h4>
          <el-table :data="importResult.errors" border style="width: 100%">
            <el-table-column prop="row" label="row" width="80" />
            <el-table-column prop="field" label="column" width="120" />
            <el-table-column prop="message" label="error info" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button v-if="activeStep > 0 && activeStep < 2" @click="activeStep--">Previous</el-button>
        <el-button
          v-if="activeStep < 1"
          type="primary"
          @click="activeStep++"
        >
          Next
        </el-button>
        <el-button
          v-if="activeStep === 1"
          type="primary"
          @click="submitUpload"
          :loading="uploading"
          :disabled="!file"
        >
          Start
        </el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref,computed,watch } from 'vue'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
  downloadTemplate,
  importCameras
} from '@/api/device'
  
  const props = defineProps({
    modelValue: Boolean
  })
  
  const emit = defineEmits(['update:modelValue', 'success'])
  
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })
  
  const activeStep = ref(0)
  const templateDownloaded = ref(false)
  const file = ref(null)
  const uploading = ref(false)
  const importResult = ref({
    success: false,
    successCount: 0,
    message: '',
    errors: []
  })
  
  const uploadRef = ref(null)
  
  // 下载模板
  const download = async () => {
      const blob = await downloadTemplate();
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'device_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove() 
  }
  
  // 文件变化
  const handleFileChange = (uploadFile) => {
    file.value = uploadFile.raw
  }
  
  // 提交上传
  const submitUpload = async () => {
    if (!file.value) {
      ElMessage.warning('please select file')
      return
    }
    
    try {
      uploading.value = true
      const formDataSend = new FormData()
      formDataSend.append('file', file.value)
      const result = await importCameras(formDataSend);
      
      importResult.value = {
        success: true,
        successCount: result.data,
        message: '',
        errors: []
      }
      
      activeStep.value = 2
    } catch (error) {
      importResult.value = {
        success: false,
        successCount: 0,
        message: error.message || 'failed',
        errors: []
      }
      activeStep.value = 2
    } finally {
      uploading.value = false
    }
  }
  
  // 完成导入
  const handleComplete = () => {
    visible.value = false
    emit('success')
    reset()
  }
  
  // 重置对话框
  const reset = () => {
    activeStep.value = 0
    templateDownloaded.value = false
    file.value = null
    uploading.value = false
    importResult.value = {
      success: false,
      successCount: 0,
      message: '',
      errors: []
    }
    uploadRef.value?.clearFiles()
  }
  
  // 监听对话框关闭
  watch(visible, (val) => {
    if (!val) {
      reset()
    }
  })
  </script>
  
  <style scoped>
  .step-content {
    padding: 20px 0;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .tips {
    margin-top: 20px;
    color: #666;
    line-height: 1.6;
  }
  
  .error-list {
    margin-top: 20px;
    width: 100%;
  }
  </style>