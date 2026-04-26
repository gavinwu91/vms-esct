<template>
  <div ref="mapContainer" class="map-container">
    <div v-if="loading" class="map-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Map loading...</span>
    </div>
    <div v-if="error" class="map-error">
      <el-icon><Warning /></el-icon>
      <span>Map load failed</span>
    </div>
    <img
      class="earth absolute top-10px right-10px cursor-pointer w-20px z-100"
      :src="earthImg"
      @click="changeEarth"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Loading, Warning } from '@element-plus/icons-vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Feature, Overlay } from 'ol'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Icon, Style } from 'ol/style'
import Translate from 'ol/interaction/Translate'
import TitleLayer from 'ol/layer/Tile'
import { XYZ } from 'ol/source'
import makerSvg from '@/assets/imgs/maker.png'
import {getKsProxyUrl} from '@/api/common'
defineOptions({ name: 'MapComponent' })

const props = defineProps({
  longitude: {
    type: [String, Number],
    default: '58.339263'
  },
  latitude: {
    type: [String, Number],
    default: '23.598513'
  },
  zoom: {
    type: Number,
    default: 14
  },
  markerIcon: {
    type: String,
    default: makerSvg
  },
  markerScale: {
    type: Number,
    default: 0.08
  },
  alarmCoords: {
    type: Array
  },
  currentAlarmInfo: {
    type: Object
  }
})

const emit = defineEmits(['update:longitude', 'update:latitude', 'marker-drag-end'])
const mapContainer = ref(null)
const loading = ref(true)
const error = ref(false)
const earthImg = ref(new URL('@/assets/imgs/map/earth.svg', import.meta.url).href)
let map = null
let markerLayer = null
let popupLayer = null
let markerFeature = null
let translateInteraction = null
let popupDiv = null
//摄像头做标点
let deviceSource = null //new VectorSource<Point>()
let deviceLayer = null
// new VectorLayer({
//   source: deviceSource
// })
// 转换坐标格式
const currentCoordinates = computed(() => {
  return fromLonLat([parseFloat('' + props.longitude), parseFloat('' + props.latitude)])
})

// 更新标记位置
const updateMarker = (lon, lat) => {
  if (!map) return

  const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)])

  if (!markerFeature) {
    markerFeature = new Feature({
      geometry: new Point(coordinates),
      name: 'location-marker'
    })

    markerFeature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: props.markerIcon,
          scale: props.markerScale
        })
      })
    )

    const vectorSource = new VectorSource({
      features: [markerFeature]
    })

    if (markerLayer) {
      map.removeLayer(markerLayer)
    }

    markerLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 100
    })

    map.addLayer(markerLayer)
    // 初始化拖拽交互
    initTranslateInteraction()
  } else {
    markerFeature.getGeometry().setCoordinates(coordinates)
  }

  // 如果坐标变化较大，调整视图中心
  const view = map.getView()
  const currentCenter = view.getCenter()
  const distance = Math.sqrt(
    Math.pow(coordinates[0] - currentCenter[0], 2) + Math.pow(coordinates[1] - currentCenter[1], 2)
  )

  if (distance > 1000) {
    // 如果距离超过1公里，调整视图
    view.setCenter(coordinates)
  }
}

// 初始化拖拽交互
const initTranslateInteraction = () => {
  if (translateInteraction) {
    map.removeInteraction(translateInteraction)
  }

  translateInteraction = new Translate({
    layers: [markerLayer],
    hitTolerance: 5 // 增加点击容差，方便选择标记
  })

  translateInteraction.on('translateend', (evt) => {
    const features = evt.features.getArray()
    if (features.length > 0 && features[0].get('name') === 'location-marker') {
      const coordinates = features[0].getGeometry().getCoordinates()
      const [lon, lat] = toLonLat(coordinates)
      emit('update:longitude', lon.toFixed(6))
      emit('update:latitude', lat.toFixed(6))
      emit('marker-drag-end', { longitude: lon, latitude: lat })
    }
  })

  map.addInteraction(translateInteraction)
}

const mapUrl =
  'https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}'
//卫星地图
const mapUrl2 = 'https://192.168.80.185:8443/webGis/kh/&hl=zh-CN&src=api&x={x}&y={y}&z={z}'
//基础图层
const normalLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl
  })
})
//卫星图层
const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl2,
    attributions: 'Tiles © Esri'
  }),
  visible: false // 默认是否显示
})

// 初始化地图
const initMap = () => {
  try {
    // addDevicePoints(props.alarmCoords)
    loading.value = true
    error.value = false
    const url2 =
      'https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}'
    const url =
      'https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}'

    map = new Map({
      target: mapContainer.value,
      // layers: [
      //   new TileLayer({
      //     source: new OSM()
      //   })
      // ],
      layers: [
        normalLayer,
        satelliteLayer
        // new TitleLayer({
        //   source: new XYZ({
        //     url: url
        //   })
        // })
      ],
      view: new View({
        center: currentCoordinates.value,
        zoom: props.zoom
      })
    })

    // 点击地图添加/移动标记
    // map.on('click', (evt) => {
    //   const [lon, lat] = toLonLat(evt.coordinate)
    //   emit('update:longitude', lon.toFixed(6))
    //   emit('update:latitude', lat.toFixed(6))
    //   updateMarker(lon, lat)
    // })

    // 初始标记
    // updateMarker(props.longitude, props.latitude)
    // map.addLayer(deviceLayer)

    console.log('props.currentAlarmInfo ==== ', props.currentAlarmInfo)

    if (props.currentAlarmInfo.longitude && props.currentAlarmInfo.latitude) {
      reViewLocation(props.currentAlarmInfo)
      addMarkerLayer(props.currentAlarmInfo)
      pushDivLayer(props.currentAlarmInfo)
    }

    loading.value = false
  } catch (err) {
    console.error('地图初始化失败:', err)
    error.value = true
    loading.value = false
  }
}

//添加地图overlay
const pushDivLayer = (currentAlarmInfo: any) => {
  if (popupLayer) {
    map.removeLayer(popupLayer)
  }
  if (!popupDiv) {
    popupDiv = document.createElement('div')
    popupDiv.id = 'popup-div'
    popupDiv.style.fontSize = '15px'
    popupDiv.style.background = 'white'
    popupDiv.style.fontWeight = 'bold'
    popupDiv.style.border = '2px solid red'
    //添加联系人的手机号,坐标
  }
  popupDiv.innerHTML = ''
  //人脸
  if (currentAlarmInfo.cameraUsage.includes('3')) {
    popupDiv.style.width = '20vh'
    popupDiv.innerHTML = `
                        <div style="height:90%;background-color:grey;justify-content:center">
                        <img 
                        src="${getKsProxyUrl(currentAlarmInfo.cropUrl)}" 
                        style="width:100%;height:100%"
                        onerror="this.src='default_face.png';this.onerror=null"
                        />
                        </div>
                        <div style="width:100%;align:center;background-color:red;text-align:center">
                          ${currentAlarmInfo.score}
                        </div>
                    `
  } else {
    popupDiv.style.width = '30vh'
    //车牌
    popupDiv.innerHTML = `
                        <img src="https://192.168.80.185:8443/vehicle_img${currentAlarmInfo.fullUrl}" style="width:100%;height:100%"/>
                    `
  }
  popupLayer = new Overlay({
    className: 'location-info',
    element: popupDiv,
    positioning: 'top-center',
    position: fromLonLat([
      parseFloat(currentAlarmInfo.longitude),
      parseFloat(currentAlarmInfo.latitude)
    ])
  })
  map.addOverlay(popupLayer)
}

function addMarkerLayer(coord) {
  deviceSource = new VectorSource<Point>()
  const feature = new Feature(
    Object.assign(
      {
        geometry: new Point(fromLonLat([parseFloat(coord.longitude), parseFloat(coord.latitude)]))
      },
      coord
    )
  )

  feature.setStyle(
    new Style({
      image: new Icon({
        src: getMarkerPng(coord), // 或公网链接
        anchor: [0.5, 1],
        scale: 0.05
      })
    })
  )
  deviceSource.addFeature(feature)
  map.removeLayer(deviceLayer)
  deviceLayer = new VectorLayer({
    source: deviceSource
  })
  map.addLayer(deviceLayer)
}

function reViewLocation(item) {
  const coordinates = fromLonLat([parseFloat(item.longitude), parseFloat(item.latitude)])
  // 如果坐标变化较大，调整视图中心
  const view = map.getView()
  const currentCenter = view.getCenter()
  const distance = Math.sqrt(
    Math.pow(coordinates[0] - currentCenter[0], 2) + Math.pow(coordinates[1] - currentCenter[1], 2)
  )

  if (distance > 1000) {
    // 如果距离超过1公里，调整视图
    view.setCenter(coordinates)
  }
}

//给地图添加当前所有alarm的标记点
function addDevicePoints(coords) {
  console.log('addDevicePoints:', coords)
  deviceSource.clear()
  coords.forEach((coord) => {
    const feature = new Feature(
      Object.assign(
        {
          geometry: new Point(fromLonLat([parseFloat(coord.longitude), parseFloat(coord.latitude)]))
        },
        coord
      )
    )

    feature.setStyle(
      new Style({
        image: new Icon({
          src: getMarkerPng(coord), // 或公网链接
          anchor: [0.5, 1],
          scale: 0.05
        })
      })
    )
    deviceSource.addFeature(feature)
  })
}

function getMarkerPng(camera) {
  if (camera.cameraUsage.includes('3')) {
    return new URL('@/assets/imgs/map/face_alarm.png', import.meta.url).href
  } else if (camera.cameraUsage.includes('4')) {
    return new URL('@/assets/imgs/map/car_alarm.png', import.meta.url).href
  }
}

// 监听props变化
// watch(
//   () => [props.longitude, props.latitude],
//   ([lon, lat]) => {
//     if (map && lon && lat) {
//       updateMarker(lon, lat)
//     }
//   }
// )

watch(
  () => props.currentAlarmInfo,
  (currentAlarmInfo) => {
    if (map && currentAlarmInfo) {
      reViewLocation(currentAlarmInfo)
      addMarkerLayer(currentAlarmInfo)
      pushDivLayer(currentAlarmInfo)
    }
  }
)

watch(
  () => props.zoom,
  (newZoom) => {
    if (map) {
      map.getView().setZoom(newZoom)
    }
  }
)

onMounted(() => {
  initMap()
})

function changeEarth() {
  console.log(earthImg.value)
  if (satelliteLayer.isVisible()) {
    earthImg.value = new URL('@/assets/imgs/map/earth.svg', import.meta.url).href
    satelliteLayer.setVisible(false)
    normalLayer.setVisible(true)
  } else {
    earthImg.value = new URL('@/assets/imgs/map/map.svg', import.meta.url).href
    satelliteLayer.setVisible(true)
    normalLayer.setVisible(false)
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-loading,
.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.map-loading .el-icon,
.map-error .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.map-loading span,
.map-error span {
  font-size: 14px;
  color: #666;
}
::v-deep .ol-zoom {
  display: none;
}
</style>
