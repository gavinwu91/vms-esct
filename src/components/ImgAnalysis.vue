<template>
    <div class="img-analysis">
        <el-upload
class="avatar-uploader" accept="image/*" :show-file-list="false" :auto-upload="false"
            :before-upload="handleBeforeUpload">
            <el-image
v-if="previewUrl" :src="previewUrl" fit="cover"
                style="width: 100%; height: 160px; border-radius: 4px;" />
            <div v-else class="upload-placeholder">
                <el-icon>
                    <Plus />
                </el-icon>
                <span>{{ $t('上传图片') }}</span>
            </div>
        </el-upload>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['change'])

const previewUrl = ref('')

/**
 * 处理文件上传前的 base64 转换
 */
function handleBeforeUpload(file) {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
        ElMessage.error('只能上传图片文件')
        return false
    }

    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB')
        return false
    }

    const reader = new FileReader()
    reader.onload = () => {
        previewUrl.value = reader.result
        emit('change', reader.result)
    }
    reader.readAsDataURL(file)

    // 阻止默认上传行为
    return false
}
</script>

<style scoped>
.img-analysis {
    width: 100%;
    position: relative;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 160px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    color: #909399;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.3s;
}

.upload-placeholder:hover {
    border-color: #409eff;
}
</style>
