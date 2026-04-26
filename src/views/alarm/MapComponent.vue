<template>
    <div ref="mapContainer" class="map-container">
      <div v-if="loading" class="map-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>地图加载中...</span>
      </div>
      <div v-if="error" class="map-error">
        <el-icon><Warning /></el-icon>
        <span>地图加载失败</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { Loading, Warning } from '@element-plus/icons-vue'
  import 'ol/ol.css'
  import Map from 'ol/Map'
  import View from 'ol/View'
  import TileLayer from 'ol/layer/Tile'
  import OSM from 'ol/source/OSM'
  import { fromLonLat, toLonLat } from 'ol/proj'
  import { Feature } from 'ol'
  import Point from 'ol/geom/Point'
  import VectorLayer from 'ol/layer/Vector'
  import VectorSource from 'ol/source/Vector'
  import { Icon, Style } from 'ol/style'
  import Translate from 'ol/interaction/Translate'
  import TitleLayer from 'ol/layer/Tile';
  import { XYZ } from 'ol/source';
  import makerSvg from '@/assets/imgs/maker.png'
  defineOptions({name: 'MapComponent'})
  
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
    }
  })
  
  const emit = defineEmits(['update:longitude', 'update:latitude', 'marker-drag-end'])
  
  const mapContainer = ref(null)
  const loading = ref(true)
  const error = ref(false)
  
  let map = null
  let markerLayer = null
  let markerFeature = null
  let translateInteraction = null
  
  // 转换坐标格式
  const currentCoordinates = computed(() => {
    return fromLonLat([
      parseFloat(props.longitude),
      parseFloat(props.latitude)
    ])
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
      Math.pow(coordinates[0] - currentCenter[0], 2) + 
      Math.pow(coordinates[1] - currentCenter[1], 2)
    )
    
    if (distance > 1000) { // 如果距离超过1公里，调整视图
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
  
  // 初始化地图
  const initMap = () => {
    try {
      loading.value = true
      error.value = false
      
      const url2 = "https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}";
      const url = "https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}";

      map = new Map({
        target: mapContainer.value,
        // layers: [
        //   new TileLayer({
        //     source: new OSM()
        //   })
        // ],
        layers: [
            new TitleLayer({
                source: new XYZ({
                    url: url
                })
            })
        ],
        view: new View({
          center: currentCoordinates.value,
          zoom: props.zoom
        })
      })
      
      // 点击地图添加/移动标记
      map.on('click', (evt) => {
        const [lon, lat] = toLonLat(evt.coordinate)
        emit('update:longitude', lon.toFixed(6))
        emit('update:latitude', lat.toFixed(6))
        updateMarker(lon, lat)
      })
      
      // 初始标记
      updateMarker(props.longitude, props.latitude)
      
      loading.value = false
    } catch (err) {
      console.error('地图初始化失败:', err)
      error.value = true
      loading.value = false
    }
  }
  
  // 监听props变化
  watch(
    () => [props.longitude, props.latitude],
    ([lon, lat]) => {
      if (map && lon && lat) {
        updateMarker(lon, lat)
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
  </style>
