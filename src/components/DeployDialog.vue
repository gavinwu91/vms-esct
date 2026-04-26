<template>
    <el-dialog :visible="visible" @update:visible="$emit('update:visible', $event)" title="一键布控" width="600px">
        <img :src="deployData?.photoUrl" style="width: 100%" />
        <p> Name：{{ deployData?.name }}</p>
        <p>ID：{{ deployData?.idCard }}</p>

        <template #footer>
            <el-button @click="close">取消</el-button>
            <el-button type="primary" @click="confirm">确认布控</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
defineProps({
    visible: Boolean,
    deployData: Object
})
const emit = defineEmits(['update:visible', 'confirm'])

const close = () => emit('update:visible', false)
const confirm = () => {
    emit('confirm', {
        photoUrl: deployData?.photoUrl,
        idCard: deployData?.idCard
    })
    close()
}
</script>
