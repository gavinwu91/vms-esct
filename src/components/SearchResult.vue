<template>
    <div class="archR">
        <div class="header">
            <div class="h-left">
                <span>{{ $t('检索结果:共') }} <i>{{ clusterData.totalRecords || 0 }}</i> {{ $t('条') }}</span>
            </div>
            <div v-if="isAdministration" class="h-admin">
                <el-button
v-if="!isSelectMode && permission"
                    :disabled="!(clusterData.records && clusterData.records.length)" @click="isSelectMode = true">
                    {{ $t('选择') }}
                </el-button>
                <div v-show="isSelectMode" class="btn-wap">
                    <el-button @click="compare">{{ $t('比较') }}</el-button>
                    <el-button @click="merge">{{ $t('合并') }}</el-button>
                    <el-button size="medium" @click="cancelMerge">{{ $t('退出选择') }}</el-button>
                </div>
            </div>
        </div>

        <div class="container">
            <el-scrollbar ref="scrollbar">
                <div class="containerBar">
                    <div class="images-container">
                        <div class="card-wrapper">
                            <div v-for="(item, index) in clusterData.records" :key="index" class="general-card-wrapper">
                                <GeneralCard :data="item" @click="toInfo(item)" />
                                <div
v-show="isSelectMode" class="card-mask"
                                    :class="{ disabled: selectedIndexs.length === 2 && !selectedIndexs.includes(index) }"
                                    @click="onCardMaskClick(index, item)">
                                    <div class="card-checkbox" @click.stop>
                                        <el-checkbox
:model-value="selectedIndexs.includes(index)"
                                            :disabled="selectedIndexs.length === 2 && !selectedIndexs.includes(index)"
                                            @change="onCardMaskClick(index, item)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pag">
                        <el-pagination
:total="clusterData.totalRecords" :current-page="currentPageNo"
                            :page-sizes="[60]" @size-change="sizeChange" @current-change="currentChange" />
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <el-dialog :model-value="magerData.score >= 0" :title="$t('比较')" width="50%" @close="compareDialogClose">
            <div class="dialogBody">
                <el-card class="card-item">
                    <div style="display: flex; justify-content: space-between;">
                        <el-image
:src="magerData.leftImgSrc" style="width: 45%; height: 300px;" fit="contain"
                            @click="enlargeImg" />
                        <el-image
:src="magerData.rightImgSrc" style="width: 45%; height: 300px;" fit="contain"
                            @click="enlargeImg" />
                    </div>
                    <div style="text-align: center; margin-top: 20px; font-size: 24px;">
                        相似度: {{ magerData.score.toFixed(2) }}
                    </div>
                </el-card>
            </div>
            <template #footer>
                <el-button @click="compareDialogClose">{{ $t('关闭') }}</el-button>
                <el-button type="primary" @click="compareConfirm">{{ $t('合并') }}</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="fullImgScreen" fullscreen @close="enlargeClose">
            <div style="display: flex; height: 100%; justify-content: center; align-items: center;">
                <el-image
v-for="(src, idx) in maxSrc" :key="idx" :src="src"
                    style="width: 45%; height: 80%; margin: 0 10px;" fit="contain" />
                <div v-if="compareScore > 0" style="position: absolute; bottom: 50px; font-size: 24px;">
                    相似度: {{ compareScore.toFixed(2) }}
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import GeneralCard from './GeneralCard.vue'

export default {
    name: 'SearchResult',
    components: {
        GeneralCard
    },
    props: {
        clusterData: {
            type: Object,
            default: () => ({ records: [] })
        },
        score: {
            type: Number,
            default: -1
        },
        permission: {
            type: Boolean,
            default: false
        }
    },
    emits: ['compare', 'merges', 'current-change'],
    setup(props, { emit }) {
        const router = useRouter()

        const isAdministration = ref(true)
        const maxSrc = ref([])
        const fullImgScreen = ref(false)
        const isSelectMode = ref(false)
        const selectedIndexs = ref([])
        const compareScore = ref(0)
        const magerData = ref({
            leftImgSrc: '',
            rightImgSrc: '',
            score: -1
        })
        const currentPageNo = ref(1)

        watch(
            () => props.score,
            (newVal) => {
                if (newVal >= 0) {
                    magerData.value.score = newVal
                }
            }
        )

        watch(
            () => props.clusterData,
            (newVal) => {
                cancelMerge()
                if (newVal.records?.length > 0) {
                    scrollbar.value?.scrollTo()
                }
                currentPageNo.value = newVal.pageNo || 1
            },
            { deep: true }
        )

        const scrollbar = ref(null)

        const onCardMaskClick = (index, item) => {
            const idx = selectedIndexs.value.indexOf(index)
            if (idx > -1) {
                selectedIndexs.value.splice(idx, 1)
            } else {
                if (selectedIndexs.value.length > 1) {
                    ElMessage.warning('最多选择2个档案进行操作')
                    return
                }
                selectedIndexs.value.push(index)
            }
        }

        const stopProp = (event) => {
            event.stopPropagation()
        }

        const cancelMerge = () => {
            isSelectMode.value = false
            selectedIndexs.value = []
        }

        const compare = () => {
            if (selectedIndexs.value.length !== 2) {
                ElMessage.warning('请选择2个档案进行比较')
                return
            }

            const item1 = props.clusterData.records[selectedIndexs.value[0]]
            const item2 = props.clusterData.records[selectedIndexs.value[1]]

            magerData.value.leftImgSrc = item1.coverPageImgUri
            magerData.value.rightImgSrc = item2.coverPageImgUri

            emit('compare', {
                profileId1: item1.profileId,
                profileId2: item2.profileId
            })
        }

        const enlargeImg = () => {
            fullImgScreen.value = true
            maxSrc.value = [magerData.value.leftImgSrc, magerData.value.rightImgSrc]
            compareScore.value = magerData.value.score
        }

        const enlargeClose = () => {
            fullImgScreen.value = false
        }

        const merge = () => {
            if (selectedIndexs.value.length !== 2) {
                ElMessage.warning('请选择2个档案进行合并')
                return
            }

            const item1 = props.clusterData.records[selectedIndexs.value[0]]
            const item2 = props.clusterData.records[selectedIndexs.value[1]]

            if (item1.realName && item2.realName) {
                ElMessage.warning('2个实名档案无法合并')
                return
            }

            const data = {
                profileId1: item1.profileId,
                profileId2: item2.profileId
            }

            mergeBox(data)
        }

        const compareConfirm = () => {
            merge()
        }

        const compareDialogClose = () => {
            magerData.value.score = -1
        }

        const mergeBox = (data) => {
            ElMessageBox.confirm(
                '两个档案合并后将变为一个档案，确定要合并吗？',
                '确定要合并吗',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(() => {
                emit('merges', data)
                magerData.value.score = -1
                cancelMerge()
            })
        }

        const sizeChange = (size) => {
            emit('sizeChange', size)
        }

        const currentChange = (page) => {
            emit('current-change', page)
        }

        const toInfo = (item) => {
            router.push({
                name: 'docSearchDetails',
                query: { id: item.profileId }
            })
        }

        const lookPhoto = () => {
            router.push({ name: 'docUnPhoto' })
        }

        return {
            isAdministration,
            maxSrc,
            fullImgScreen,
            isSelectMode,
            selectedIndexs,
            compareScore,
            magerData,
            currentPageNo,
            scrollbar,
            onCardMaskClick,
            stopProp,
            cancelMerge,
            compare,
            enlargeImg,
            enlargeClose,
            merge,
            compareConfirm,
            compareDialogClose,
            mergeBox,
            sizeChange,
            currentChange,
            toInfo,
            lookPhoto
        }
    }
}
</script>

<style scoped>
.archR {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-left: 17px;
    box-sizing: border-box;
    background: #dce1e5;
    display: flex;
    flex-direction: column;
}

.archR p,
.archR span,
.archR div {
    box-sizing: border-box;
}

.header {
    width: 100%;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding-right: 20px;
}

.header .h-left span {
    font-size: 12px;
}

.header .h-left span i {
    font-size: 14px;
    font-style: normal;
}

.header .h-right {
    margin-right: 9px;
}

.header .h-admin {
    display: flex;
    align-items: center;
}

.header .h-admin>span {
    font-size: 14px;
    cursor: pointer;
    color: #21539a;
    margin-right: 10px;
    font-weight: 600;
}

.header .h-center {
    display: flex;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    flex-wrap: nowrap;
}

.header .h-center p {
    width: 106px;
    line-height: 34px;
    background: #fff;
    color: #21539a;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
}

.header .h-center p:nth-child(1) {
    border: 1px solid #a6bad7;
    border-right: none;
}

.header .h-center p:nth-child(2) {
    border: 1px solid #a6bad7;
    border-left: none;
}

.header .h-center p.active {
    color: #fff;
    border: none;
    background: #21539a;
}

.container {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
}

.container .containerBar {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.container .pag {
    width: 100%;
    height: 49px;
    background: #fff;
}

.container .images-container {
    flex: 1;
    min-height: initial;
}

.general-card-wrapper {
    display: inline-block;
    position: relative;
    padding-left: 10px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.general-card-wrapper:hover {
    transform: translateY(-5px);
    /* 上移5px */
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    /* 浮动阴影 */
    z-index: 10;
    /* 悬浮时置顶 */
}


.card-mask {
    position: absolute;
    cursor: pointer;
    z-index: 7;
    top: 0;
    width: 100%;
    height: 100%;
}

.card-mask.disabled {
    background-color: #94949433;
}

.card-checkbox {
    position: absolute;
    left: 10px;
    top: 7px;
}

.station {
    visibility: hidden;
}

.cardCheckbox {
    position: absolute;
    top: 5px;
    left: 5px;
}

.dialogBody {
    width: 100%;
    height: 100%;
    padding: 36px 25px 0 25px;
}

.serious {
    background: #bf6767;
}

.noSerious {
    background: #d8a9a9;
}

.darkGreen {
    background: #bf6767;
}

.lightGreen {
    background: #8ea882;
}

.docScaled {
    z-index: 10000 !important;
}

.scroll {
    padding-right: 17px;
}
</style>