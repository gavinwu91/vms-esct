<template>
    <el-container class="main-container">
        <!-- 左侧查询面板 -->
        <el-aside :style="{ width: asideWidth + 'px' }" class="query-panel" ref="asideRef">
            <el-card class="search-card">
                <template #header>
                    <div class="card-header">
                        <span class="title">Condition</span>
                    </div>
                </template>

                <el-form label-position="top">
                    <!-- 搜索类型选择 -->
                    <el-form-item label="搜索类型">
                        <el-select v-model="searchType" placeholder="请选择" style="width: 100%">
                            <el-option label="人脸识别" value="face" />
                            <el-option label="车辆识别" value="vehicle" />
                            <el-option label="人体识别" value="body" />
                        </el-select>
                    </el-form-item>

                    <!-- 时间范围选择 -->
                    <el-form-item label="时间范围">
                        <el-date-picker
v-model="timeRange" type="datetimerange" range-separator="至"
                            start-placeholder="开始时间" end-placeholder="结束时间" style="width: 100%" />
                    </el-form-item>

                    <!-- 动态条件 -->
                    <template v-if="searchType === 'face'">
                        <el-form-item label="年龄范围">
                            <el-slider
v-model="ageRange" range :min="0" :max="100"
                                :marks="{ 0: '0', 50: '50', 100: '100' }" />
                        </el-form-item>

                        <el-form-item label="性别筛选">
                            <el-radio-group v-model="gender">
                                <el-radio-button label="all">全部</el-radio-button>
                                <el-radio-button label="male">男性</el-radio-button>
                                <el-radio-button label="female">女性</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                    </template>

                    <template v-if="searchType === 'vehicle_db'">
                        <el-form-item label="车牌号码">
                            <el-input v-model="plateNumber" placeholder="输入车牌号码" clearable />
                        </el-form-item>

                        <el-form-item label="颜色筛选">
                            <el-color-picker v-model="vehicleColor" show-alpha size="large" />
                        </el-form-item>
                    </template>

                    <el-button type="primary" style="width: 100%" @click="handleSearch">
                        <el-icon>
                            <Search />
                        </el-icon>
                        开始搜索
                    </el-button>
                </el-form>
            </el-card>

            <!-- 拖拽条 -->
            <div class="drag-bar" @mousedown.prevent="dragStart"></div>
        </el-aside>

        <!-- 右侧结果展示 -->
        <el-main class="result-area">
            <el-card class="result-card">
                <template #header>
                    <div class="result-header">
                        <span class="title">搜索结果</span>
                        <div class="stat">
                            <el-statistic title="总计" :value="results.length" />
                            <el-statistic title="匹配度" :value="matchRate" suffix="%" />
                        </div>
                    </div>
                </template>

                <el-row :gutter="20">
                    <el-col v-for="(item, index) in results" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
                        <el-card class="item-card" shadow="hover">
                            <el-image :src="item.image" fit="cover" class="card-image" :preview-src-list="[item.image]">
                                <template #error>
                                    <div class="image-error">
                                        <el-icon>
                                            <Picture />
                                        </el-icon>
                                    </div>
                                </template>
                            </el-image>

                            <div class="card-content">
                                <div class="meta-info">
                                    <el-tag :type="item.type === 'face' ? 'success' : 'warning'" effect="dark">
                                        {{ item.type === 'face' ? '人脸' : '车辆' }}
                                    </el-tag>
                                </div>

                                <span class="time">{{ item.time }}</span>
                                <el-descriptions :column="1" size="small">
                                    <template v-if="item.type === 'face'">
                                        <el-descriptions-item label="性别">
                                            <el-icon :style="{ color: item.gender === 'male' ? '#409EFF' : '#F56C6C' }">
                                                <Male v-if="item.gender === 'male'" />
                                                <Female v-else />
                                            </el-icon>
                                            {{ item.gender === 'male' ? '男性' : '女性' }}
                                        </el-descriptions-item>
                                        <el-descriptions-item label="年龄">{{ item.age }} 岁</el-descriptions-item>
                                        <el-descriptions-item label="相似度">
                                            <el-progress
:percentage="item.similarity"
                                                :status="item.similarity > 90 ? 'success' : 'warning'"
                                                :stroke-width="10" :show-text="false" />
                                        </el-descriptions-item>
                                    </template>

                                    <template v-if="item.type === 'vehicle_db'">
                                        <el-descriptions-item label="车牌">
                                            <el-tag effect="dark">{{ item.plate }}</el-tag>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="颜色">
                                            <span class="color-dot" :style="{ background: item.color }" >
                                            {{ item.colorName }}
                                            </span>
                                        </el-descriptions-item>
                                        <el-descriptions-item label="出现次数">{{ item.count }} 次</el-descriptions-item>
                                    </template>
                                </el-descriptions>

                                <div class="card-actions">
                                    <el-button type="primary" plain size="small">查看详情</el-button>
                                    <el-button
type="success" plain size="small"
                                        @click="handleTrack(item)">追踪轨迹</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-card>
        </el-main>
    </el-container>

    <!-- 地图 -->
    <el-dialog v-model="mapDialogVisible" title="轨迹回放" fullscreen @closed="destroyMap">
        <div ref="mapContainer" class="ol-map-container" id="map"></div>
        <div class="map-controls">
            <el-button type="primary" @click="togglePlay">
                {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            <el-slider v-model="playProgress" :step="1" :max="100" style="width: 300px; margin: 0 20px" />
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Search, Picture, Male, Female } from '@element-plus/icons-vue'

const rawData = [
    {
        type: 'face',
        image: '/vms/images/p1.png',
        time: '2023-05-20 14:30:45',
        gender: 'male',
        age: 32,
        similarity: 95,
        trajectory: [  // 新增轨迹数据
            { time: 0, coord: [58.3392639371309, 23.598513105718] },
            { time: 5, coord: [58.3393639371309, 23.568513105718] },
            { time: 10, coord: [58.3292639371309, 23.568613105718] },
            { time: 15, coord: [58.3293639371309, 23.598533105718] },
            { time: 20, coord: [58.3236639371309, 23.598533105718] }
        ]

    },
    {
        type: 'vehicle_db',
        image: '/vms/images/c1.png',
        time: '2023-05-20 15:12:20',
        plate: '京A12345',
        color: '#FF0000',
        colorName: '红色',
        count: 3,
        trajectory: [  // 新增轨迹数据
            { time: 0, coord: [58.3392639371309, 23.598513105718] },
            { time: 5, coord: [58.3393639371309, 23.568513105718] },
            { time: 10, coord: [58.3292639371309, 23.568613105718] },
            { time: 15, coord: [58.3293639371309, 23.598533105718] },
            { time: 20, coord: [58.3236639371309, 23.598533105718] }
        ]
    },
    {
        type: 'face',
        image: '/vms/images/p2.png',
        time: '2023-05-20 16:45:10',
        gender: 'female',
        age: 28,
        similarity: 88,
        trajectory: [  // 新增轨迹数据
            { time: 0, coord: [58.3392639371309, 23.598513105718] },
            { time: 5, coord: [58.3393639371309, 23.568513105718] },
            { time: 10, coord: [58.3292639371309, 23.568613105718] },
            { time: 15, coord: [58.3293639371309, 23.598533105718] },
            { time: 20, coord: [58.3236639371309, 23.598533105718] }
        ]
    },
    {
        type: 'vehicle_db',
        image: '/vms/images/c2.png',
        time: '2023-05-20 17:30:15',
        plate: '沪B56789',
        color: '#0000FF',
        colorName: '蓝色',
        count: 1,
        trajectory: [  // 新增轨迹数据
            { time: 0, coord: [58.3392639371309, 23.598513105718] },
            { time: 5, coord: [58.3393639371309, 23.568513105718] },
            { time: 10, coord: [58.3292639371309, 23.568613105718] },
            { time: 15, coord: [58.3293639371309, 23.598533105718] },
            { time: 20, coord: [58.3236639371309, 23.598533105718] }
        ]
    },
]

const results = ref([...rawData])
const searchType = ref('face')
const timeRange = ref([])
const ageRange = ref([20, 50])
const gender = ref('all')
const plateNumber = ref('')
const vehicleColor = ref('')

const matchRate = computed(() => Math.floor(Math.random() * 20 + 80))

const handleSearch = () => {
    let filtered = [...rawData]

    if (searchType.value) {
        filtered = filtered.filter((item) => item.type === searchType.value)
    }

    if (timeRange.value.length === 2) {
        const [start, end] = timeRange.value
        filtered = filtered.filter((item) => {
            const t = new Date(item.time)
            return t >= new Date(start) && t <= new Date(end)
        })
    }

    if (searchType.value === 'face') {
        filtered = filtered.filter(
            (item) => item.age >= ageRange.value[0] && item.age <= ageRange.value[1]
        )
        if (gender.value !== 'all') {
            filtered = filtered.filter((item) => item.gender === gender.value)
        }
    } else if (searchType.value === 'vehicle_db') {
        if (plateNumber.value.trim()) {
            filtered = filtered.filter((item) =>
                item.plate.includes(plateNumber.value.trim())
            )
        }
        if (vehicleColor.value) {
            filtered = filtered.filter(
                (item) => item.color.toLowerCase() === vehicleColor.value.toLowerCase()
            )
        }
    }

    results.value = filtered
}

// 拖拽调整宽度逻辑
const asideWidth = ref(380)
const asideRef = ref(null)
let isDragging = false

const dragStart = (e) => {
    isDragging = true
    document.addEventListener('mousemove', dragMove)
    document.addEventListener('mouseup', dragEnd)
}

const dragMove = (e) => {
    if (!isDragging) return
    // 限制最小宽度100，最大宽度600
    const newWidth = e.clientX
    if (newWidth > 100 && newWidth < 600) {
        asideWidth.value = newWidth
    }
}

const dragEnd = () => {
    isDragging = false
    document.removeEventListener('mousemove', dragMove)
    document.removeEventListener('mouseup', dragEnd)
}

onBeforeUnmount(() => {
    // 清理事件监听，防止内存泄漏
    document.removeEventListener('mousemove', dragMove)
    document.removeEventListener('mouseup', dragEnd)
})

import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import { Point, LineString } from 'ol/geom'
import Feature from 'ol/Feature'
import { Style, Icon, Stroke, Circle } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { easeOut } from 'ol/easing'
import { Fill } from 'ol/style'
import TitleLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';

// 新增轨迹相关状态
const mapDialogVisible = ref(false)
const mapContainer = ref(null)
const currentTrajectory = ref([])
const mapInstance = ref(null)
const isPlaying = ref(false)
const playProgress = ref(0)
let animationFrameId = null

let playTimer = null
const startPlay = () => {
    if (playTimer) return

    // 播放完成后再次点击播放时，重置进度
    if (playProgress.value >= 100) {
        playProgress.value = 0
    }

    playTimer = setInterval(() => {
        if (playProgress.value >= 100) {
            clearInterval(playTimer)
            playTimer = null
            isPlaying.value = false
            return
        }
        playProgress.value += 1
        updateMapPosition()
    }, 300)

    isPlaying.value = true
}


const pausePlay = () => {
    if (playTimer) {
        clearInterval(playTimer)
        playTimer = null
    }
    isPlaying.value = false
}

const togglePlay = () => {
    if (isPlaying.value) {
        pausePlay()
    } else {
        startPlay()
    }
}

// 计算轨迹对应当前进度的位置并更新地图视角
const updateMapPosition = () => {
    if (!mapInstance.value || !currentTrajectory.value.length) return

    const maxTime = currentTrajectory.value[currentTrajectory.value.length - 1].time
    const curTime = (playProgress.value / 100) * maxTime

    // 找出轨迹中当前时间点之前和之后的两个点，做插值
    let prevPoint = currentTrajectory.value[0]
    let nextPoint = currentTrajectory.value[currentTrajectory.value.length - 1]

    for (let i = 0; i < currentTrajectory.value.length - 1; i++) {
        if (currentTrajectory.value[i].time <= curTime && currentTrajectory.value[i + 1].time >= curTime) {
            prevPoint = currentTrajectory.value[i]
            nextPoint = currentTrajectory.value[i + 1]
            break
        }
    }

    const ratio = (curTime - prevPoint.time) / (nextPoint.time - prevPoint.time)
    const lon = prevPoint.coord[0] + ratio * (nextPoint.coord[0] - prevPoint.coord[0])
    const lat = prevPoint.coord[1] + ratio * (nextPoint.coord[1] - prevPoint.coord[1])

    const coord = fromLonLat([lon, lat])

    // 更新地图视角
    mapInstance.value.getView().setCenter(coord)

    // 更新轨迹点位置（假设你用 featureTrackPoint）
    if (featureTrackPoint) {
        featureTrackPoint.setGeometry(new Point(coord))
    }
}

let featureTrackPoint = null
let vectorLayer = null

const initMap = () => {
  
    if (!Array.isArray(currentTrajectory.value) || currentTrajectory.value.length === 0) {
        console.warn("轨迹数据为空，无法初始化地图")
        return
    }
    const url2 = "https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}";
    const url = "https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}";
    if (mapInstance.value) {
        mapInstance.value.setTarget(null)
        mapInstance.value = null
    }

    // 创建地图
    console.log(JSON.stringify(currentTrajectory.value))
    mapInstance.value = new Map({
        target: 'map',
        layers: [
            new TitleLayer({
                source: new XYZ({
                    url: url
                })
            })
        ],
        view: new View({
            center: fromLonLat(currentTrajectory.value[0].coord),
            zoom: 13,
            minZoom: 1,
            maxZoom: 19,
        })
    })

    // 轨迹线
    const coords = currentTrajectory.value.map(p => fromLonLat(p.coord))
    const lineFeature = new Feature(new LineString(coords))
    lineFeature.setStyle(new Style({
        stroke: new Stroke({
            color: '#409EFF',
            width: 3,
        }),
    }))

    // 轨迹当前点
    featureTrackPoint = new Feature(new Point(fromLonLat(currentTrajectory.value[0].coord)))
    featureTrackPoint.setStyle(new Style({
        // image: new Circle({
        //     radius: 7,
        //     fill: new Fill({ color: 'red' }),
        // }),
        image: new Icon({
            src: '/vms/images/point.svg', // 你可以换成小车图标
            scale: 0.6,
            anchor: [0.5, 1],
        })
    }))


    // 所有轨迹点 feature
    const pointFeatures = coords.map(coord => {
        const pt = new Feature(new Point(coord));
        pt.setStyle(new Style({
            image: new Circle({
                radius: 4,
                fill: new Fill({ color: '#ff9900' }),
            }),
        }));
        return pt;
    });



    const vectorSource = new VectorSource({
        features: [lineFeature, featureTrackPoint, ...pointFeatures]
    })

    vectorLayer = new VectorLayer({
        source: vectorSource,
    })

    mapInstance.value.addLayer(vectorLayer)
}


// 监听进度条拖动，更新地图位置
watch(playProgress, () => {
    updateMapPosition()
})



// 销毁地图
const destroyMap = () => {
    if (mapInstance.value) {
        mapInstance.value.setTarget(null)
        mapInstance.value = null
    }
    isPlaying.value = false
    playProgress.value = 0
}

// 在追踪轨迹按钮点击事件中调用
const handleTrack = (item) => {
    currentTrajectory.value = item.trajectory || []
    mapDialogVisible.value = true
    nextTick(() => {
        initMap()
    })
}

</script>

<style scoped>
.main-container {
    height: 100vh;
    overflow: hidden;
}

.query-panel {
    background: #f5f7fa;
    padding: 20px;
    box-sizing: border-box;
    position: relative;
    overflow-y: auto;
}

.search-card {
    height: 100%;
    box-sizing: border-box;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.title {
    font-weight: bold;
    font-size: 18px;
    color: #409eff;
}

.drag-bar {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: ew-resize;
    background-color: transparent;
    transition: background-color 0.3s;
}

.drag-bar:hover {
    background-color: #409eff;
}

.result-area {
    background: #fff;
    padding: 20px;
    overflow-y: auto;
}

.result-card {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat {
    display: flex;
    gap: 30px;
}

.item-card {
    margin-bottom: 20px;
}

.card-image {
    width: 100%;
    height: 200px;
}

.image-error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #909399;
}

.card-content {
    padding: 15px 0;
}

.meta-info {
    margin-bottom: 5px;
}

.time {
    color: #909399;
    font-size: 12px;
    margin-bottom: 10px;
    display: block;
}

.color-dot {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
}

.card-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
}

.ol-map-container {
    width: 100%;
    height: calc(100vh - 100px);
}

.map-controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 999;
}
</style>
