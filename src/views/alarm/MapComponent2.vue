<template>
  <div class="map-container">
    <div id="map" class="map"></div>
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

<script setup>
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
import { Fill, Icon, Style, Circle as CircleStyle } from 'ol/style'
import { fromCircle } from 'ol/geom/Polygon'
import { XYZ } from 'ol/source'
import makerSvg from '@/assets/imgs/maker.png'
import { onMounted, ref } from 'vue'
import { fromLonLat } from 'ol/proj'

defineOptions({ name: 'Map2' })

const props = defineProps({
  cameras: {
    type: Array,
    required: true
  },
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
let pointSource = null
const url2 =
  'https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}'
const url =
  'https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}'
const initMap = () => {
  const features = fillFeatures()
  console.log('features ==== ', features)
  // 带唯一名称的点
  pointSource = new VectorSource({
    features: features
    // [
    //   new Feature({
    //     geometry: new Point([0, 0]),
    //     name: "点A",
    //   }),
    //   new Feature({
    //     geometry: new Point([2000000, 2000000]),
    //     name: "点B",
    //   }),
    //   new Feature({
    //     geometry: new Point([1000000, 0]),
    //     name: "点C",
    //   }),
    //   new Feature({
    //     geometry: new Point([-2000000, -1000000]),
    //     name: "点D",
    //   }),
    // ],
  })

  const pointLayer = new VectorLayer({
    source: pointSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: 'red' })
      })
    })
  })

  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: url
        })
      }),
      pointLayer
    ],
    view: new View({
      center: fromLonLat([58.339263, 23.598513]),
      zoom: 10
    })
  })
}

const fillFeatures = () => {
  return props.cameras.map((a) => {
    const lon = a.longitude
    const lat = a.latitude
    const coorD = fromLonLat([lon, lat])
    const platformCameraId = a.platformCameraId

    // 添加坐标点
    const feature = new Feature({
      geometry: new Point(coorD),
      name: platformCameraId
    })

    //添加坐标点图片
    feature.setStyle(
      new Style({
        image: new Icon({
          src: getMarkerPng(coorD), // 或公网链接
          anchor: [0.5, 1],
          scale: 0.05
        })
      })
    )
    return feature
  })
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
    pointSource.forEachFeature((f) => {
      const coord = f.getGeometry().getCoordinates()
      // console.log("f 坐标点信息  ==== " ,f)
      const name = f.get('name') // 唯一名称

      if (polygon.intersectsCoordinate(coord)) {
        // f.setStyle(
        //   new Style({
        //     image: new CircleStyle({
        //       radius: 6,
        //       fill: new Fill({ color: "blue" }),
        //     }),
        //   })
        // );
        console.log(`选中点: ${name} 坐标:`, coord)
        console.log('f 坐标点信息  ==== ', f)
        //获取platformCameraId  选择树进行check
        internalCameras.push(name)
      } else {
        // f.setStyle(
        //   new Style({
        //     image: new CircleStyle({
        //       radius: 6,
        //       fill: new Fill({ color: "red" }),
        //     }),
        //   })
        // );
      }
      emit('select-tree-camera', internalCameras)
    })
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
