<template>
    <el-form
:model="activeFormData" label-position="top" class="doc-search-form" :rules="formRules"
        @submit.prevent="formSearch">
        <div class="form-header">
            <el-dropdown @command="switchSearchType" trigger="click">
                <el-button type="primary" class="search-type-btn">
                    {{ searchTypeLabels[searchType] }}
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
v-for="type in searchTypes" :key="type.value" :command="type.value"
                            :class="{ 'active': searchType === type.value }">
                            {{ type.label }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>

            <div class="form-actions">
                <el-button type="primary" native-type="submit">{{ $t('检索') }}</el-button>
                <el-button @click="resetForm">{{ $t('重置') }}</el-button>
            </div>
        </div>

        <transition name="fade-mode" mode="out-in">
            <div v-if="searchType === 'precise'" class="form-section precise-search">
                <el-form-item :label="$t('照片')" prop="photoCondition" class="photo-form-item">
                    <ImgAnalysis :upload-num="1" :init-file="initFile" @change="imgFileChange" />
                </el-form-item>

                <el-form-item :label="$t(' Name')" prop="name">
                    <el-input
v-model="activeFormData.name" :placeholder="$t('Please input{entity}', { entity: $t(' Name') })"
                        clearable />
                </el-form-item>

                <el-form-item :label="$t('证件号')" prop="cardNo" class="id-card-item">
                    <el-input>
                        <template #prepend>
                  <el-select v-model="activeFormData.cardType" :placeholder="placeholder" class="id-type-select">
                            <el-option
v-for="item in idCardTypes" :key="item.code" :label="item.value"
                                :value="item.code" />
                        </el-select>
                        </template>
                              
                        <el-input
v-model="activeFormData.cardNo"
                            :placeholder="$t('Please input{entity}', { entity: $t('证件号') })" clearable />
                    </el-input>
  
                </el-form-item>

                <el-form-item :label="$t('性别')">
                    <el-select v-model="activeFormData.genderCode" :placeholder="placeholder" class="gender-select">
                        <el-option
v-for="item in genderOptions" :key="item.code" :label="item.value"
                            :value="item.code" />
                    </el-select>
                </el-form-item>

                <el-form-item :label="$t('籍贯')">
                    <el-input
v-model="activeFormData.ancientCity"
                        :placeholder="$t('Please input{entity}', { entity: $t('籍贯') })" clearable />
                </el-form-item>
            </div>

            <div v-else-if="searchType === 'fuzzy'" class="form-section fuzzy-search">
                <el-form-item :label="$t('档案类型')">
                    <el-select
v-model="activeFormData.profileType" :placeholder="placeholder"
                        class="profile-type-select">
                        <el-option
v-for="item in profileTypeOptions" :key="item.code" :label="item.value"
                            :value="item.code" />
                    </el-select>
                </el-form-item>

                <el-form-item :label="$t('底库')">
                    <el-tree-select
v-model="activeFormData.albumIds" :data="albumList" :props="albumDataProps"
                        show-checkbox node-key="id" :placeholder="$t('请选择{entity}', { entity: $t('底库') })"
                        class="album-select" />
                </el-form-item>

                <el-form-item :label="$t('起止时间')">
                    <el-date-picker
v-model="defaultTime" type="daterange" :picker-options="pickerOptions"
                        :placeholder="$t('请选择时间范围')" class="date-range-picker" @change="getDateValue" />
                </el-form-item>

                <el-form-item :label="$t('相机')">
                    <el-tree-select
v-model="activeFormData.cameraIds" :data="cameraList" :props="albumDataProps"
                        show-checkbox node-key="id" :placeholder="$t('请选择{entity}', { entity: $t('相机') })"
                        class="camera-select" />
                </el-form-item>

                <div class="tag-section">
                    <el-form-item :label="$t('标签')">
                        <el-select
v-model="activeFormData.labelCode" :placeholder="placeholder" class="label-select"
                            @change="labelChange">
                            <el-option
v-for="item in labelList" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>

                    <el-form-item v-if="showAreaSelect" :label="$t('区域')" class="area-select-item">
                        <el-select v-model="activeFormData.areaCode" :placeholder="placeholder" class="area-select">
                            <el-option
v-for="item in areaList" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </div>

                <div class="demographic-section">
                    <el-form-item :label="$t('性别')">
                        <el-select v-model="activeFormData.genderCode" :placeholder="placeholder" class="gender-select">
                            <el-option
v-for="item in genderOptions" :key="item.code" :label="item.value"
                                :value="item.code" />
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="$t('年龄')">
                        <el-select v-model="activeFormData.ageCode" :placeholder="placeholder" class="age-select">
                            <el-option
v-for="item in ageOptions" :key="item.code" :label="item.value"
                                :value="item.code" />
                        </el-select>
                    </el-form-item>

                    <el-form-item v-if="isZHEnv" :label="$t('民族')">
                        <el-select v-model="activeFormData.nation" :placeholder="placeholder" class="nation-select">
                            <el-option
v-for="item in nationOptions" :key="item.code" :label="item.value"
                                :value="item.code" />
                        </el-select>
                    </el-form-item>
                </div>
            </div>
        </transition>
    </el-form>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import ImgAnalysis from '@/components/ImgAnalysis.vue'

interface FormData {
    photoCondition: {
        photoData?: string
        rect?: any
        landmark?: any
    }
    name: string
    cardNo: string
    cardType: string
    genderCode: string
    ancientCity: string
    albumIds: any[]
    cameraIds: any[]
    agespan: string
    nation: string
    startTime: string
    endTime: string
    ageCode: string
    areaCode: string
    labelCode: string
    profileType: string
    pageNo: number
    pageSize: number
}

interface Option {
    code: string
    value: string
}

interface TreeSelectProps {
    name: string
    nodesType: string
    id: string
    deep: string
    chooseId: string
    type: string
}

export default defineComponent({
    name: 'SearchForm',
    components: {
        ImgAnalysis
    },
    props: {
        formData: {
            type: Object as PropType<FormData>,
            default: () => ({})
        },
        cameraList: {
            type: Array as PropType<any[]>,
            default: () => []
        },
        albumList: {
            type: Array as PropType<any[]>,
            default: () => []
        },
        labelList: {
            type: Array as PropType<any[]>,
            default: () => []
        },
        areaList: {
            type: Array as PropType<any[]>,
            default: () => []
        },
        initData: {
            type: Object as PropType<FormData>,
            default: () => ({})
        }
    },
    setup(props, { emit }) {
        const { t } = useI18n()

        // Form data
        const activeFormData = ref<FormData>({
            photoCondition: {},
            name: '',
            cardNo: '',
            cardType: 'sfz',
            genderCode: '',
            ancientCity: '',
            albumIds: [],
            cameraIds: [],
            agespan: '',
            nation: '',
            startTime: '',
            endTime: '',
            ageCode: '',
            areaCode: '',
            labelCode: '',
            profileType: '',
            pageNo: 1,
            pageSize: 60
        })

        // Form validation rules
        const formRules = {
            name: [
                { required: true, message: t('Please input Name'), trigger: 'blur' },
                { max: 50, message: t(' Name长度不能超过50个字符'), trigger: 'blur' }
            ],
            cardNo: [
                {
                    validator: (rule: any, value: string, callback: any) => {
                        if (activeFormData.value.cardType === 'sfz' && value && !/^\d{17}[\dXx]$/.test(value)) {
                            callback(new Error(t('Please input有效的身份证号码')))
                        } else {
                            callback()
                        }
                    },
                    trigger: 'blur'
                }
            ]
        }

        // Search type handling
        const searchTypes = [
            { value: 'precise', label: t('精确检索') },
            { value: 'fuzzy', label: t('模糊检索') }
        ]
        const searchType = ref<string>('precise')
        const searchTypeLabels = computed(() => ({
            precise: t('精确检索'),
            fuzzy: t('模糊检索')
        }))

        const switchSearchType = (command: string) => {
            searchType.value = command
            if (command === 'precise') {
                resetForm()
            }
        }

        // Image upload
        const initFile = ref<any[]>([])
        const imgFileChange = (files: any[]) => {
            activeFormData.value.photoCondition.photoData = files.length > 0 ? files[0].url : ''
        }

        // Date picker
        const defaultTime = ref<[Date, Date] | null>(null)
        const minDate = ref<Date | null>(null)
        const pickerOptions = {
            disabledDate(time: Date) {
                if (minDate.value) {
                    return (
                        time.getTime() > minDate.value.getTime() + 5184e5 ||
                        time.getTime() < minDate.value.getTime() - 5184e5
                    )
                }
                return false
            },
            onPick: ({ maxDate, minDate: md }: any) => {
                minDate.value = maxDate ? null : md
            }
        }

        const getDateValue = (val: [Date, Date] | null) => {
            if (val && val.length === 2) {
                activeFormData.value.startTime = val[0].toISOString()
                activeFormData.value.endTime = val[1].toISOString()
            } else {
                activeFormData.value.startTime = ''
                activeFormData.value.endTime = ''
            }
        }

        // Select options
        const placeholder = ref<string>(t('请选择'))
        const albumDataProps = ref<TreeSelectProps>({
            name: 'name',
            nodesType: 'items',
            id: 'id',
            deep: 'database',
            chooseId: 'id',
            type: 'flag'
        })

        const idCardTypes = computed<Option[]>(() => [
            { code: 'sfz', value: t('身份证') },
            { code: 'passport', value: t('护照') }
        ])

        const genderOptions = computed<Option[]>(() => [
            { code: '', value: t('全部') },
            { code: 'male', value: t('男') },
            { code: 'female', value: t('女') }
        ])

        const ageOptions = computed<Option[]>(() => [
            { code: '', value: t('全部') },
            { code: '18', value: '18' },
            { code: '18-30', value: '18-30' },
            { code: '30-50', value: '30-50' },
            { code: '50+', value: '50+' }
        ])

        const nationOptions = computed<Option[]>(() => [
            { code: '', value: t('全部') },
            { code: '1', value: '汉族' },
            { code: '2', value: '少数民族' }
        ])

        const profileTypeOptions = computed<Option[]>(() => [
            { code: '', value: t('全部') },
            { code: '1', value: t('类型1') },
            { code: '2', value: t('类型2') }
        ])

        const isZHEnv = computed<boolean>(() => true)
        const showAreaSelect = computed<boolean>(() =>
            activeFormData.value.labelCode !== ''
        )

        // Form actions
        const resetForm = () => {
            activeFormData.value = {
                photoCondition: {},
                name: '',
                cardNo: '',
                cardType: 'sfz',
                genderCode: '',
                ancientCity: '',
                albumIds: [],
                cameraIds: [],
                agespan: '',
                nation: '',
                startTime: '',
                endTime: '',
                ageCode: '',
                areaCode: '',
                labelCode: '',
                profileType: '',
                pageNo: 1,
                pageSize: 60
            }
            defaultTime.value = null
            initFile.value = []
            emit('reset')
        }

        const formSearch = () => {
            if (!validateForm()) return
            emit('search', activeFormData.value)
        }

        const validateForm = (): boolean => {
            if (searchType.value === 'precise') {
                if (!activeFormData.value.name && !activeFormData.value.cardNo && !activeFormData.value.photoCondition.photoData) {
                    ElMessage.warning(t('请至少填写一项精确检索条件'))
                    return false
                }
            }
            return true
        }

        const labelChange = () => {
            activeFormData.value.areaCode = ''
        }

        // Watch for initData changes
        watch(
            () => props.initData,
            (newVal) => {
                resetForm()
                Object.assign(activeFormData.value, newVal)
                if (newVal.photoCondition?.photoData) {
                    searchType.value = 'precise'
                    const photo = {
                        usefulFrame: newVal.photoCondition.rect,
                        url: newVal.photoCondition.photoData,
                        couldEdit: true
                    }
                    if (newVal.photoCondition.landmark) {
                        photo.landmark = newVal.photoCondition.landmark
                        formSearch()
                    } else {
                        initFile.value = [photo]
                    }
                }
            },
            { immediate: true }
        )

        // Watch for formData changes
        watch(
            () => props.formData,
            (val) => {
                Object.assign(activeFormData.value, val)
            }
        )

        return {
            activeFormData,
            formRules,
            defaultTime,
            searchType,
            searchTypes,
            searchTypeLabels,
            initFile,
            pickerOptions,
            albumDataProps,
            ageOptions,
            nationOptions,
            profileTypeOptions,
            idCardTypes,
            genderOptions,
            placeholder,
            isZHEnv,
            showAreaSelect,
            switchSearchType,
            formSearch,
            resetForm,
            imgFileChange,
            getDateValue,
            labelChange
        }
    }
})
</script>

<style lang="scss" scoped>
.doc-search-form {
    padding: 24px;
    border-radius: 12px;
    background-color: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-light);
    transition: all 0.3s ease;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid var(--el-border-color-light);

    &:hover {
        box-shadow: var(--el-box-shadow);
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;

        .search-type-btn {
            padding: 10px 16px;
            font-weight: 500;
            border-radius: 8px;
            min-width: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .form-actions {
            display: flex;
            gap: 12px;

            .el-button {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 500;
            }
        }
    }

    .form-section {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 16px;

        &.precise-search {
            .photo-form-item {
                grid-column: 1 / -1;
                margin: 0 auto 24px;
                width: 180px;
                height: 180px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                border: 1px dashed var(--el-border-color);

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
                    border-color: var(--el-color-primary);
                }
            }

            .id-card-item {
                grid-column: 1 / -1;

                .el-input-group {
                    display: flex;
                    gap: 8px;

                    .id-type-select {
                        flex: 0 0 120px;
                    }
                }
            }
        }

        &.fuzzy-search {
            .tag-section {
                grid-column: 1 / -1;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }

            .demographic-section {
                grid-column: 1 / -1;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }
        }
    }

    .el-form-item {
        margin-bottom: 0;

        :deep(.el-form-item__label) {
            font-weight: 500;
            color: var(--el-text-color-regular);
            font-size: 13px;
            margin-bottom: 6px;
            display: block;
        }
    }

    .el-select,
    .el-input,
    .el-date-editor,
    .el-tree-select {
        width: 100%;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
            border-color: var(--el-color-primary-light-5);
        }

        &:focus-within {
            border-color: var(--el-color-primary);
            box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
        }
    }

    .el-tree-select {
        :deep(.el-select__tags) {
            max-width: calc(100% - 32px);
        }
    }
}

// Transition effects
.fade-mode-enter-active,
.fade-mode-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-mode-enter-from,
.fade-mode-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

// Dropdown menu styles
.el-dropdown-menu {
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: var(--el-box-shadow-light);

    .el-dropdown-menu__item {
        padding: 8px 20px;
        font-size: 13px;
        transition: all 0.2s ease;

        &.active {
            color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
        }

        &:hover {
            background-color: var(--el-color-primary-light-9);
        }
    }
}

@media (max-width: 768px) {
    .doc-search-form {
        padding: 16px;

        .form-section {
            grid-template-columns: 1fr;
        }
    }
}
</style>
