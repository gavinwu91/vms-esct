<template>
    <div class="doc-search-module">
        <div class="aside">
            <div class="aside-header">
                <el-button type="text" icon="el-icon-arrow-left" @click="goBack">
                    {{ $t('档案检索') }}
                </el-button>
            </div>
            <div class="aside-body">
                <SearchForm
:form-data="searchParams" :camera-list="cameraList" :album-list="albumList"
                    :label-list="labelList" :area-list="areaList" :init-data="initFormData" @confirm="search" />
            </div>
        </div>
        <div class="result">
            <el-scrollbar v-loading="isLoading">
                <SearchResult
:cluster-data="profileData" :score="score" :permission="authPermission" @compare="compare"
                    @merges="merges" @current-change="pageChange" />
            </el-scrollbar>
        </div>
    </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import SearchResult from '@/components/SearchResult.vue'
import * as api from '@/api/docSearch'

export default {
    name: 'DocSearch',
    components: {
        SearchForm,
        SearchResult
    },
    setup() {
        const router = useRouter()
        const { t } = useI18n()

        const cameraList = ref([])
        const albumList = ref([])
        const labelList = ref([])
        const areaList = ref([])
        // const profileData = ref({ records: [] })
        const profileData = {
            totalRecords: 8,
            pageNo: 1,
            records: [
                {
                    score: '',
                    realName: '张三',
                    names: '张三',
                    gender: '1',   // M => 1
                    age: 34,
                    minoritys: '',
                    albums: 'album100',
                    coverPageImgUri: '/vms/images/p1.png',
                    cardNo: '',
                    faceCount: 0,
                    customLabels: [],
                    labels: [
                        { labelName: '教师', labelType: false },
                        { labelName: '志愿者', labelType: false }
                    ]
                },
                {
                    score: '',
                    realName: '',
                    names: '',
                    gender: '2',   // F => 2
                    age: 28,
                    minoritys: '',
                    albums: 'album101',
                    coverPageImgUri: '/vms/images/p2.png',
                    cardNo: '',
                    faceCount: 0,
                    customLabels: [],
                    labels: [
                        { labelName: '学生', labelType: false }
                    ]
                },
                {
                    score: '',
                    realName: '李四',
                    names: '李四',
                    gender: '1',
                    age: 42,
                    minoritys: '',
                    albums: 'album100',
                    coverPageImgUri: '/vms/images/p1.png',
                    cardNo: '',
                    faceCount: 0,
                    customLabels: [],
                    labels: [
                        { labelName: '工程师', labelType: false }
                    ]
                }
            ]
        }


        const isLoading = ref(false)
        const searchParams = ref({
            pageNo: 1,
            pageSize: 60
        })
        const initFormData = ref({})
        const score = ref(-1)
        const authPermission = ref(false)

        // Fetch initial data
        onMounted(async () => {
            try {
                await getCamera()
                await getAlbums()
                await getLabel()
                await getArea()
                await checkPermission()
            } catch (error) {
                ElMessage.error(error.message)
            }
        })

        const checkPermission = async () => {
            try {
                const res = await api.checkPermission()
                authPermission.value = res.data.records.length > 0
            } catch (error) {
                console.error('Permission check failed:', error)
            }
        }

        const getCamera = async () => {
            try {
                const res = await api.cameraList({ range: 'all' })
                cameraList.value = res.data
            } catch (error) {
                throw new Error(t('获取相机列表失败'))
            }
        }

        const getAlbums = async () => {
            try {
                const res = await api.albumList({})
                albumList.value = res.data.map(item => ({
                    ...item,
                    flag: 'database'
                }))
            } catch (error) {
                throw new Error(t('获取底库列表失败'))
            }
        }

        const getLabel = async () => {
            try {
                const res = await api.labelList({ pageNo: 1, pageSize: 1000 })
                labelList.value = filterLabelData(res.data.records)
            } catch (error) {
                throw new Error(t('获取标签列表失败'))
            }
        }

        const getArea = async () => {
            try {
                const res = await api.areaList()
                areaList.value = res.data
            } catch (error) {
                throw new Error(t('获取区域列表失败'))
            }
        }

        const filterLabelData = (labels) => {
            return [
                { value: '', label: t('请选择') },
                ...labels.map(label => ({
                    value: label.labelId,
                    label: label.labelName,
                    type: label.labelGroup,
                    ...label
                }))
            ]
        }

        const compare = async (data) => {
            score.value = -1
            try {
                const res = await api.compare(data)
                score.value = res.data.score
            } catch (error) {
                ElMessage.error(error.message)
            }
        }

        const merges = async (data) => {
            isLoading.value = true
            try {
                await api.merge(data)
                ElMessage.success(t('合并 success'))
                searchParams.value.pageNo = 1
                await search(searchParams.value)
            } catch (error) {
                ElMessage.error(error.message)
            } finally {
                isLoading.value = false
            }
        }

        const search = async (params, type = 'fuzzy') => {
            isLoading.value = true
            try {
                const query = paramResolve(params, type)
                let res
                if (type === 'fuzzy') {
                    res = await api.realnameSearch(query)
                    profileData.value = res.data
                } else if (query.condition.photoCondition) {
                    res = await api.photoSearch(query)
                    profileData.value = res.data
                } else {
                    res = await api.profileSearch(query)
                    profileData.value = res.data
                }
            } catch (error) {
                ElMessage.error(error.message)
            } finally {
                isLoading.value = false
            }
        }

        const paramResolve = (params, type) => {
            if (type === 'fuzzy') {
                return {
                    condition: {
                        realNameCondition: {
                            albumIds: params.albumIds,
                            agespan: params.ageCode,
                            nation: params.nation,
                            genderCode: params.genderCode
                        },
                        profileCondition: {
                            startTime: params.startTime,
                            endTime: params.endTime,
                            labels: params.labels,
                            cameraIds: params.cameraIds,
                            areaCodes: params.areaCode ? [params.areaCode] : [],
                            profileType: params.profileType
                        }
                    },
                    pageNo: params.pageNo,
                    pageSize: params.pageSize
                }
            } else {
                const condition = {}
                if (params.photoCondition?.photoData) {
                    condition.photoCondition = params.photoCondition
                }
                condition.realNameCondition = {
                    name: params.name,
                    cardType: params.cardType,
                    cardNo: params.cardNo,
                    ancientCity: params.ancientCity,
                    genderCode: params.genderCode
                }
                return {
                    condition,
                    pageNo: params.pageNo,
                    pageSize: params.pageSize
                }
            }
        }

        const pageChange = (page) => {
            searchParams.value.pageNo = page
            search(searchParams.value)
        }

        const goBack = () => {
            router.go(-1)
        }

        return {
            cameraList,
            albumList,
            labelList,
            areaList,
            profileData,
            isLoading,
            searchParams,
            initFormData,
            score,
            authPermission,
            compare,
            merges,
            search,
            pageChange,
            goBack
        }
    }
}
</script>

<style scoped>
/* 全局基础样式，确保根元素撑满屏幕 */
html,
body,
#app {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #2c3e50;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* 主体容器 */
.doc-search-module {
    display: flex;
    height: 100vh;
    /* 视口高度，撑满屏幕 */
    overflow: hidden;
    /* 防止横向滚动 */
    background-color: #f5f7fa;
}

/* 左侧搜索栏 */
.aside {
    width: 320px;
    height: 100%;
    border-right: 1px solid #e6e6e6;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    box-shadow: 2px 0 5px rgb(0 0 0 / 0.05);
}

/* 左侧头部 */
.aside-header {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 25px;
    font-size: 16px;
    font-weight: 600;
    color: #435068;
    background-color: #f0f2f5;
    border-bottom: 1px solid #e6e6e6;
}

/* 按钮样式调整 */
.aside-header .el-button {
    font-weight: 600;
    color: #2c3e50;
}

/* 左侧主体区域，滚动 */
.aside-body {
    flex: 1;
    /* 占满剩余高度 */
    padding: 20px;
    overflow-y: auto;
    background-color: #fafafa;
    border-left: 1px solid #e6e6e6;
    border-right: 1px solid #e6e6e6;
    border-bottom: 1px solid #e6e6e6;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

/* 右侧结果区 */
.result {
    flex: 1;
    background-color: #f9fafb;
    padding: 20px;
    overflow-y: auto;
    border-radius: 0 8px 8px 0;
    box-shadow: inset 0 0 10px rgb(0 0 0 / 0.03);
}

/* 自定义滚动条 - Chrome/Edge/Safari */
.aside-body::-webkit-scrollbar,
.result::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.aside-body::-webkit-scrollbar-thumb,
.result::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.aside-body::-webkit-scrollbar-track,
.result::-webkit-scrollbar-track {
    background: transparent;
}

/* 响应式调整（可选）*/
@media (max-width: 768px) {
    .doc-search-module {
        flex-direction: column;
        height: auto;
    }

    .aside {
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #e6e6e6;
    }

    .aside-body {
        max-height: 300px;
    }

    .result {
        border-radius: 0;
        padding: 15px 10px;
    }
}
</style>
