<template>
  <div class="map-container">
    <div id="map" class="map"></div>
    <div class="absolute top-2 left-10 text-6">
      <el-tag size="large" effect="dark" class="opacity-90">Zoom Level : {{ zoomLevel }}</el-tag>
    </div>
    <div
      @click="circle('Rectangle')"
      v-show="showSelect"
      style="cursor: pointer; opacity: 0.9"
      class="rectangle-draw"
      >Rectangle Selection</div
    >
    <div
      @click="circle('Circle')"
      v-show="showSelect"
      style="cursor: pointer; opacity: 0.9"
      class="draw"
      >Circle Selection</div
    >
  </div>
</template>

<script setup lang="ts">
import { getBboxZoomList } from '@/api/device/index'

import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import { Draw } from 'ol/interaction'
import { createBox } from 'ol/interaction/Draw'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Cluster from 'ol/source/Cluster'
import { Style, Icon, Text, Fill, Stroke, Circle as CircleStyle } from 'ol/style'
import { fromCircle } from 'ol/geom/Polygon'
import { XYZ } from 'ol/source'
import { onMounted, ref } from 'vue'
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import { getBottomLeft, getTopRight } from 'ol/extent'

defineOptions({ name: 'Map3' })

const props = defineProps({
  alarmType: {
    type: Number,
    required: true,
    default: 3
  },
  controlStep: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['select-tree-camera'])
const showSelect = ref(false)

let shapeType = ''
let map = null
let draw = null
const clusterLayer = ref(null)
const zoomLevel = ref(5)

let clusterPointSource = null
let clusterSource: Cluster | null = null

const url2 =
  'https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}'
const url =
  'https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}'
const initMap = () => {
  //创建视图
  const view = new View({
    center: fromLonLat([58.339263, 23.598513]),
    zoom: zoomLevel.value
  })

  // 初始渲染
  clusterPointSource = new VectorSource()
  clusterSource = new Cluster({
    source: clusterPointSource,
    distance: zoomLevel.value < 8 ? 40 : 0
  })

  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: url
        })
      })
    ],
    view: view
  })

  const update = () => {
    const zoom = view.getZoom()
    zoomLevel.value = Math.round(zoom)

    // 计算可视范围的经纬度 BBOX
    const extent = view.calculateExtent(map.getSize())
    const [minX, minY, maxX, maxY] = extent
    const [minLon, minLat] = toLonLat([minX, minY])
    const [maxLon, maxLat] = toLonLat([maxX, maxY])
    // 过滤出在 BBOX 内的摄像头
    const param = {
      cameraType: props.alarmType,
      minLon: minLon.toFixed(6),
      maxLon: maxLon.toFixed(6),
      minLat: minLat.toFixed(6),
      maxLat: maxLat.toFixed(6)
    }
    // console.log("camera param ======" , param)
    // 创建并替换图层
    if (clusterLayer.value) map.removeLayer(clusterLayer.value)
    getBboxZoomList(param).then((res) => {
      // console.log("getBboxZoomList ==========",res)
      clusterLayer.value = createLayerFor(res, zoom)
      map.addLayer(clusterLayer.value)
    })
  }
  map.on('moveend', update)

  update()
}

function getMarkerPng() {
  if (props.alarmType == 3) {
    return new URL('@/assets/imgs/map/face_alarm.png', import.meta.url).href
  } else {
    return new URL('@/assets/imgs/map/car_alarm.png', import.meta.url).href
  }
}

const rectangle = () => {
  if (draw) {
    map.removeInteraction(draw)
  }
  draw = new Draw({
    source: new VectorSource(),
    type: 'Circle',
    geometryFunction: createBox()
  })
  map.addInteraction(draw)
  draw.on('drawend', (evt) => {
    const feature = evt.feature
  })
}

const circle = (type) => {
  shapeType = type
  if (draw) {
    map.removeInteraction(draw)
  }
  if (type == 'Circle') {
    draw = new Draw({
      source: new VectorSource(),
      type: 'Circle'
    })
  } else if (type == 'Rectangle') {
    draw = new Draw({
      source: new VectorSource(),
      type: 'Circle',
      geometryFunction: createBox()
    })
  }

  map.addInteraction(draw)

  draw.on('drawend', (evt) => {
    let polygon
    if (shapeType == 'Circle') {
      const circleGeom = evt.feature.getGeometry()
      polygon = fromCircle(circleGeom, 64)
    } else if (shapeType == 'Rectangle') {
      polygon = evt.feature.getGeometry()
    }
    // console.log("==== 选中结果 ====");
    const internalCameras = []
    // pointSource.forEachFeature((f) => {
    //   const coord = f.getGeometry().getCoordinates()
    //   // console.log("f 坐标点信息  ==== " ,f)
    //   const name = f.get('name') // 唯一名称

    //   if (polygon.intersectsCoordinate(coord)) {
    //     console.log(`选中点: ${name} 坐标:`, coord)
    //     console.log('f 坐标点信息  ==== ', f)
    //     //获取platformCameraId  选择树进行check
    //     internalCameras.push(name)
    //   }
    //   emit('select-tree-camera', internalCameras)
    // })

    clusterPointSource.forEachFeature((f) => {
      const coord = f.getGeometry().getCoordinates()
      const name = f.get('camera').cameraName // 唯一名称
      if (polygon.intersectsCoordinate(coord)) {
        console.log("f.get('camera')   ========== ", f.get('camera'))
        // console.log(`选中点: ${name} 坐标:`, coord)
        // console.log('f 坐标点信息  ==== ', name)
        //获取platformCameraId  选择树进行check
        const camera = f.get('camera')
        internalCameras.push(camera)
      }
    })
    if (internalCameras.length > 0) {
      emit('select-tree-camera', internalCameras)
    }
  })
}

/**
 * 步加载摄像头数据 bbox + zoom
 * 1 、 map zoom >8 显示，摄像头图片，否则显示点聚合数量
 *
 */
//1、监听获取map当前视图中的上下左右坐标点
const getBbox = () => {
  const extent = map.getView().calculateExtent(map.getSize())
  const bottomLeft = toLonLat(getBottomLeft(extent))
  const topRight = toLonLat(getTopRight(extent))
  const bbox = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]
  return bbox
}
//2、监听moveend 事件,根据bbox 请求 摄像头数据

//3 根据点生成marker
const createLayerFor = (visibleCameras, zoom) => {
  const features = visibleCameras.map((c) => {
    return new Feature({ geometry: new Point(fromLonLat([c.longitude, c.latitude])), camera: c })
  })
  // const source = new VectorSource({ features })
  // const clusterSource = new Cluster({ source, distance: zoom < 8 ? 40 : 0 })
  clusterPointSource.clear()
  clusterPointSource.addFeatures(features)
  clusterSource.setDistance(zoom < 12 ? 40 : 0)
  return new VectorLayer({
    source: clusterSource,
    style: (feature) => {
      const clustered = feature.get('features')
      const size = clustered.length
      if (size > 1 && zoom < 12) {
        return new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: 'rgba(0,123,255,0.7)' }),
            stroke: new Stroke({ color: '#fff', width: 2 })
          }),
          text: new Text({ text: String(size), fill: new Fill({ color: '#fff' }), offsetY: 0 })
        })
      }
      const cam = clustered[0].get('camera')
      // Only use Icon when zoom >= 8 and cameraIcon exists; otherwise show a simple dot
      return new Style({
        image: new Icon({ src: getMarkerPng(), scale: 0.05 }),
        text: new Text({
          text: cam.cameraName,
          offsetY: -18,
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        })
      })

      // if (zoom >= 12) {
      //   return new Style({
      //     image: new Icon({ src: getMarkerPng(), scale: 0.05 }),
      //     text: new Text({
      //       text: cam.cameraName,
      //       offsetY: -18,
      //       fill: new Fill({ color: '#000' }),
      //       stroke: new Stroke({ color: '#fff', width: 2 })
      //     })
      //   })
      // }
      // // zoom < 8 and single feature: render small circle (no Icon) to avoid undefined src error
      // return new Style({
      //   image: new CircleStyle({
      //     radius: 6,
      //     fill: new Fill({ color: 'rgba(0,123,255,0.7)' }),
      //     stroke: new Stroke({ color: '#fff', width: 1 })
      //   })
      // })
    }
  })
}

onMounted(() => {
  initMap()
  if (props.alarmType == 4) {
    showSelect.value = true
  }
})

watch(
  () => props.controlStep,
  (newVal) => {
    if (props.alarmType == 3) {
      if (newVal == 2) {
        showSelect.value = true
      } else {
        showSelect.value = false
      }
    }
  },
  { deep: true }
)
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
}
.map {
  width: 100%;
  height: 100%;
}
.draw,
.rectangle-draw {
  position: absolute;
  top: 10px;
  right: 1%;
  z-index: 1000;
  padding: 8px 16px;
  border: none;
  background: #6ab081;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.rectangle-draw {
  right: 20%;
}
.draw:hover,
.rectangle-draw:hover {
  background: #66b1ff;
}
</style>
