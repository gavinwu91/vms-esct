<template>
  <div class="upload-demo">
    <!-- 上传组件 -->
    <el-upload
      class="upload-box"
      list-type="picture-card"
      :auto-upload="false"
      :limit="10"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      v-model:file-list="fileList"
      multiple
      accept="image/*"
    >
      <!-- <el-icon><Plus /></el-icon> -->
      <el-image
        :src="imageInfo.defaultImage"
        style="width: 252px; cursor: pointer"
        @click="previewImage"
        :preview-src-list="imageInfo.previewList"
      />
    </el-upload>

    <!-- 预览对话框 -->
    <el-dialog v-model="dialogVisible" width="50%">
      <img :src="dialogImageUrl" alt="Preview" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
const message = useMessage() // 消息弹窗
import defaultImg from '@/assets/imgs/default_face.png'
const imageInfo = ref({
  defaultImage: defaultImg,
  faceFile: undefined,
  previewList: []
})

const props = defineProps({
  imageUrls: {
    type: Array,
    required: false
  }
})

const emits = defineEmits(['change-upload-image-count'])


// 文件列表
const fileList = ref([])

// 预览对话框
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 预览
const handlePreview = (file) => {
  dialogImageUrl.value = file.url || URL.createObjectURL(file.raw)
  dialogVisible.value = true
}

// 删除
const handleRemove = (file, fileListNow) => {
  console.log('删除文件:', file)
  fileList.value = fileListNow
}

// 超过 10 个
const handleExceed = () => {
  console.log('最多只能上传 10 张图片')
  message.alertError('Just allow upload 10 images!')
}

//把获取所有文件数据的方法暴露出去
defineExpose({
  fileList
})

// 点击确认上传到后台
const handleConfirm = async () => {
  if (fileList.value.length === 0) {
    console.log('请先选择图片')
    return
  }

  const formData = new FormData()
  fileList.value.forEach((file) => {
    console.log('准备上传的文件:', file)
    formData.append('files', file.raw) // 关键: raw 才是 File 对象
  })

  try {
    //console.log("准备上传的文件:", formData)
    // const res = await axios.post("http://localhost:3000/upload", formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // })
    // console.log("后台返回:", res.data)
  } catch (err) {
    console.error(err)
  }
}

const urlToFile = async (url,fileName) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob],fileName,{type: blob.type})
}

const initFileList = async (imageUrls) => {
  const result = []
  for(let i = 0;i< imageUrls.length; i++){
    const imageUrl = imageUrls[i]
    const file = await urlToFile(imageUrl.url,imageUrl.name)
    result.push({
      name: file.name,
      url: imageUrl.url,
      status: 'success',
      raw: file
    })
  }
  fileList.value = result
  console.log('fileList.value ===== ', fileList.value)
}


onMounted(() => {
  initFileList(props.imageUrls)
  
})


watch(fileList,(newVal) => {
  console.log("最新文件数==== " ,newVal.length)
  emits('change-upload-image-count',fileList.value.length)
},{deep: true})

watch(
  () => props.imageUrls,
  (nv, ov) => {
    console.log('监听到新的imageUrls值', nv)
  },
  {
    deep: true
  }
)
</script>

<style scoped>
.upload-box {
  margin-bottom: 16px;
}
</style>
