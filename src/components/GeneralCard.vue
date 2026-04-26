<template>
    <el-card class="select-card-item">
        <template #header>
            <div class="r">
                <p class="threshold" :class="{ station: data.score === '' }">
                    {{ data.score === '' ? 0 : Number(data.score).toFixed(2) }}
                </p>
                <InfoIcon v-if="data.realName" icon-name="card_face" :text="data.names" />
                <template v-else>
                    <InfoIcon :icon-name="gender" :text="codeDataSex[data.gender]" single-line />
                    <InfoIcon icon-name="card_face" :text="data.age" single-line />
                    <InfoIcon v-if="isZhEnv" icon-name="nation" :text="data.minoritys" single-line />
                </template>
                <InfoIcon v-if="data.realName" icon-name="database" :text="data.albums" />
            </div>
        </template>

        <el-image :src="data.coverPageImgUri" fit="cover" style="width: 100%; height: 160px;" />

        <template #footer>
            <div class="wrap-bt">
                <div class="bt">
                    <p>
                        <el-icon><i class="el-icon-document"></i></el-icon>
                        <span>{{ data.cardNo }}</span>
                    </p>
                    <div class="iconW">
                        <el-icon><i class="el-icon-files"></i></el-icon>
                        <span>{{ data.faceCount }} 张</span>
                    </div>
                </div>
                <!-- 可扩展标签展示 -->
                <div v-if="showLabel" class="bb">
                    <el-tooltip
v-for="(label, idx) in filteredLabels" :key="idx" :content="label.labelName"
                        placement="top">
                        <span class="show-label" :class="label.labelType ? 'custom-label' : 'system-label'">
                            {{ label.labelName }}
                        </span>
                    </el-tooltip>
                </div>
            </div>
        </template>
    </el-card>
</template>

<script setup>
import InfoIcon from './InfoIcon.vue'
import { computed, defineProps } from 'vue'

const props = defineProps({
    data: Object,
    showLabel: {
        type: Boolean,
        default: true
    }
})

const codeDataSex = {
    '1': '男',
    '2': '女'
}

const gender = computed(() => {
    if (props.data.gender === '1') return 'gender_male'
    if (props.data.gender === '2') return 'gender_female'
    return 'gender_unknown'
})

const isZhEnv = computed(() => true)

// 标签处理
const fullLabels = computed(() => [
    ...(props.data.customLabels || []),
    ...(props.data.labels || [])
])
const filteredLabels = computed(() => fullLabels.value.slice(0, 3))
</script>

<style scoped>
.select-card-item {
    width: 100%;
    margin-bottom: 20px;
    padding: 0 10px;
}

.threshold {
    font-weight: bold;
}

.wrap-bt {
    margin-top: 10px;
}

.bt {
    display: flex;
    justify-content: space-between;
}

.bb {
    margin-top: 5px;
}

.show-label {
    padding: 2px 6px;
    margin-right: 4px;
    border-radius: 3px;
    background-color: #f0f0f0;
}

.custom-label {
    background-color: #ffe0b2;
}

.system-label {
    background-color: #c8e6c9;
}
</style>
