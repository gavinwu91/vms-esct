<template>
  <div v-if="isManager">
    <AdminDashboard/>
  </div>
  <div class="big-screen-map" v-else>
    <div class="dashboard_content">

      <div v-motion-slide-left class="left-panel glass">

        <section>
          <!--摄像头分布-->
          <dash-device @deviceChange="addDevicePoints"/>
        </section>
        <section>
          <!--抓拍趋势-->
          <dash-capture-quantity/>
        </section>
        <section>
          <!--底库统计-->
          <dash-documents/>
        </section>

        <div style="flex-shrink: 0;height: 310px">
          <!--实时告警展示-->
          <dash-face-alarm-list @countChange="setFaceAlarmCount" @viewAlarm="handleViewAlarm"/>
        </div>


      </div>

      <div id="map" class="map-container">
        <el-radio-group v-model="selected" :class="['custom-radio-group',isFullscreen?'mapButtonFull':'mapButton']">
          <el-radio
            v-for="item in options"
            :key="item.value"
            v-model="selected"
            :label="item.value"
            :class="{'custom-radio':true,'custom-radio-active':selected==item.value} "
            @change="changeLayer"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
        <div v-motion-pop-visible :class="['totalCount','countNumber',,isFullscreen?'mapCountFull':'mapCount']">
          <div class="sky">Face Capture:<span>{{ formatNumber(faceCaptureValue.toFixed(0)) }}</span>
          </div>
          <div class="green">Vehicle
            Capture:<span>{{ formatNumber(vehicleCaptureValue.toFixed(0)) }}</span></div>
          <div class="blue">Face Alarm:<span>{{ formatNumber(faceAlarmValue.toFixed(0)) }}</span>
          </div>
          <div class="red">Vehicle
            Alarm:<span>{{ formatNumber(vehicleAlarmValue.toFixed(0)) }}</span></div>
        </div>
        <img :class="isFullscreen?'earthFull':'earth'" :src="earthImg" @click="changeEarth"/>
        <el-icon :class="isFullscreen?'maxFull':'max'" :size="40" color="#409eff" @click="toggleFullscreen()" ><ElFullScreen/></el-icon>
        <!-- 视频播放对话框 -->
        <VideoPlayerDialog v-model="videoDialogVisible" :camera="currentCamera" :modelValue="true" />
        <!-- <el-dialog
          v-model="videoDialogVisible"
          @close="closeLive;videoDialogVisible = false"
          :title="currentCamera?.name"
          width="80%"
          destroy-on-close

        >
          <div class="video-container">
            <iframe
              ref="liveIfream"
              class="no-dark"
              allowfullscreen="allowfullscreen"
              :src="getVideoUrl(currentCamera)"
              style="width: 100%;height: 100%;border: none"></iframe>
          </div>
          <template #footer>
            <el-button type="primary" @click="videoDialogVisible=false">Close</el-button>

          </template>
        </el-dialog> -->
        <!-- 表单弹窗：添加/修改 -->
        <AlarmFaceMsgForm ref="formRef"  style="width: 70%; height: 65vh" />
      </div>
      <div v-motion-slide-right class="right-panel glass">
        <section>
          <!--告警统计-->
          <dash-events/>
        </section>

        <section>
          <!--车牌趋势-->
          <dash-vehicle-quantity/>
        </section>

        <div style="flex-shrink: 0;height: 310px">
          <!--实时告警展示-->
          <dash-vehicle-alarm-list @countChange="setVehicleAlarmCount"  @viewAlarm="handleViewVehicleAlarm"/>
        </div>

      </div>
      <div v-motion-slide-visible-bottom class="bottom-panel glass">
        <section class="scroll-container">
          <!--实时抓拍-->
          <dash-capture-realtime/>
        </section>
        <section class="scroll-container">
          <!--实时车牌抓拍-->
          <dash-vehicle-realtime @countChange="setVehicleCount"/>
        </section>
      </div>
      <div id="popup" class="popup" v-show="detailVisible">
        <div class="popup_play"  @click="handlePlay">
          <el-icon :size="35" color="#dadada">
            <ElVideoPlay/>
          </el-icon>
        </div>
        <el-image class="popup_image" :src="getCameraImageUrl(currentCamera.cameraIp)" >
          <template #error>
            <div class="image-lost">

            </div>
          </template>
        </el-image>
        <div class="popup_name">
          <el-text class="mx-1">{{ currentCamera.cameraName }}</el-text>
        </div>
        <div class="popup_info">
          <el-tag type="primary" class="popup_tag">{{ currentCamera.cameraIp }}</el-tag>
          <el-tag :type="currentCamera.runningStatus?'success':'info'" class="popup_tag">
            {{ currentCamera.runningStatus ? 'online' : 'offline' }}
          </el-tag>
          <div  style="cursor: pointer;z-index: 500"  >
            <el-icon :size="20" color="#67C23A" class="popup_tag"  >
              <ElExpand/>
            </el-icon>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import {Expand as ElExpand, VideoPlay as ElVideoPlay,FullScreen as ElFullScreen} from '@element-plus/icons-vue'

import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import {fromLonLat} from 'ol/proj'
import {ref, onMounted} from 'vue'
import Point from 'ol/geom/Point'
import Feature from 'ol/Feature'
import {Vector as VectorSource} from 'ol/source'
import {Heatmap, Vector as VectorLayer} from 'ol/layer'
import {Icon, Style} from 'ol/style'
import Overlay from 'ol/Overlay'
import {getPermissionDeviceList} from "@/api/device";
import {AlarmFaceMsgApi} from "@/api/alarmfacemsg";
import {TransitionPresets, useTransition} from "@vueuse/core";
import {callWithDelay,formatNumber} from "@/utils";
import {faceCaptureCount} from "@/api/retrieval";
import dayjs from "dayjs";
import {ElMessage} from "element-plus";
import AlarmFaceMsgForm from "@/views/alarm/facehistory/AlarmFaceMsgForm.vue"
import {optionList as getLibraryOptionList} from "@/api/library";
import * as authUtil from '@/utils/auth'
import AdminDashboard from '@/views/Home/Index.vue'
import VideoPlayerDialog from '@/components/Device/VideoPlayerDialog.vue'

//告警处理窗口
const formRef = ref()

//首页数量
const faceCapture = ref(0)
const vehicleCapture = ref(0);
const faceAlarm = ref(0);
const vehicleAlarm = ref(0);

//视频对话框
const videoDialogVisible = ref(false)
const isManager = ref(false)
const isFullscreen=ref(false);
function toggleFullscreen() {
  // const el = fullscreenRef.value
  if (!document.fullscreenElement) {
    document.getElementById("map").requestFullscreen().then(() => {
      isFullscreen.value = true
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    })
  }
}

const getVideoUrl = (row) => {
  console.log("getVideoUrl:",row)
  let password = encodeURIComponent(row.password);
  let finalPassword = encodeURIComponent(password);
  let url = "https://192.168.200.165:8084/player/" + row.ip + "?stream=rtsp://" + row.username + ":" + finalPassword + "@" + row.ip + ":554"
  return url;
}
function handlePlay() {
  if(!currentCamera.value.runningStatus) {
    ElMessage.warning('The device is already offline')
    return
  }
  videoDialogVisible.value = true;
}
const liveIfream = ref(null);

const closeLive = () => {
  if (liveIfream.value) {
    liveIfream.value.contentWindow.postMessage({action: "close"}, "*")
  }
}

// 告警明细对话框
function handleViewAlarm(obj){
  console.log("handleViewAlarm:",obj)
  formRef.value.open(obj)
}
function handleViewVehicleAlarm(obj){
  // console.log("handleViewAlarm:",obj)
  // formRef.value.open(obj)
}
function setVehicleAlarmCount(count) {
  vehicleAlarm.value=count;
}
function setFaceAlarmCount(count){
  faceAlarm.value=count;
}

function setVehicleCount(count) {
  vehicleCapture.value=count;
}

const faceCaptureValue = useTransition(faceCapture, {
  duration: 2000,
  transition: TransitionPresets.easeOutExpo
})
const vehicleCaptureValue = useTransition(vehicleCapture, {
  duration: 2000,
  transition: TransitionPresets.easeOutExpo
})
const faceAlarmValue = useTransition(faceAlarm, {
  duration: 2000,
  transition: TransitionPresets.easeOutExpo
})
const vehicleAlarmValue = useTransition(vehicleAlarm, {
  duration: 2000,
  transition: TransitionPresets.easeOutExpo
})


const selected = ref('device')
const options = [
  {label: 'Devices', value: 'device'},
  {label: 'Alarms', value: 'alarm'}
]

const earthImg = ref(new URL("@/assets/imgs/map/earth.svg", import.meta.url).href);

const detailVisible = ref(false);

const currentCamera = ref({});
//摄像头做标点
const deviceSource = new VectorSource<Point>();
//热力图
const alarmSource = new VectorSource<Point>();
const deviceLayer = new VectorLayer({
  source: deviceSource,
});

const alarmLayer = new Heatmap({
  source: alarmSource,
  blur: 20,
  radius: 15,
  weight: 'weight',
  visible: false
});

const mapUrl = "https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}";
//卫星地图
const mapUrl2 = "https://192.168.80.185:8443/webGis/kh/&hl=zh-CN&src=api&x={x}&y={y}&z={z}";

const remoteMap = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png?api_key=c955fe6b-13bc-49d3-8e77-2ea157c2373f';
const remoteMap2 = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
//基础图层
const normalLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl,
  }),
});
//卫星图层
const satelliteLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl2,
    attributions: 'Tiles © Esri',
  }),
  visible: false, // 默认是否显示
});


function getCameraImageUrl(ip) {
  return new URL(`/public/images/${ip}.png`, import.meta.url).href
}

function changeEarth() {
  console.log(earthImg.value);
  if (satelliteLayer.isVisible()) {
    earthImg.value = new URL("@/assets/imgs/map/earth.svg", import.meta.url).href;
    satelliteLayer.setVisible(false);
    normalLayer.setVisible(true);
  } else {
    earthImg.value = new URL("@/assets/imgs/map/map.svg", import.meta.url).href;
    satelliteLayer.setVisible(true);
    normalLayer.setVisible(false);
  }
}

function getMarkerPng(camera) {
  if (camera.cameraUsage.includes("3")) {
    if (camera.runningStatus) {
      return new URL("@/assets/imgs/map/face.svg", import.meta.url).href;
    } else {
      return new URL("@/assets/imgs/map/face_offline.svg", import.meta.url).href;
    }
  } else if (camera.cameraUsage.includes("4")) {
    if (camera.runningStatus) {
      return new URL("@/assets/imgs/map/car.svg", import.meta.url).href;
    } else {
      return new URL("@/assets/imgs/map/car_offline.svg", import.meta.url).href;
    }
  } else {
    if (camera.runningStatus) {
      return new URL("@/assets/imgs/map/camera.svg", import.meta.url).href;
    } else {
      return new URL("@/assets/imgs/map/camera_offline.svg", import.meta.url).href;
    }
  }
}

function addDevicePoints(coords) {
  console.log("addDevicePoints:", coords);
  deviceSource.clear();
  coords.forEach(coord => {
    const feature = new Feature(Object.assign({
      geometry: new Point(fromLonLat([parseFloat(coord.longitude), parseFloat(coord.latitude)])),
    }, coord))

    feature.setStyle(
      new Style({
        image: new Icon({
          src: getMarkerPng(coord), // 或公网链接
          anchor: [0.5, 1],
          scale: 0.2,
        }),
      })
    )
    deviceSource.addFeature(feature)
  })
}

function addAlarmData(data) {
  // 解析并添加到 source 中
  const features = data.map(item =>
    new Feature(Object.assign({
      geometry: new Point(fromLonLat([parseFloat(item.longitude), parseFloat(item.latitude)])),
      weight: 0.2
    }, item))
  );
  alarmSource.addFeatures(features);
}

function changeLayer(value) {
  if (value == 'device') {
    deviceLayer.setVisible(true);
    alarmLayer.setVisible(false);
  } else {
    deviceLayer.setVisible(false);
    alarmLayer.setVisible(true);
  }
}

let map: Map // OpenLayers Map 类型
let detailOverlay;

let stopTimer:(()=>void)=null;

onMounted(() => {

  detailOverlay = new Overlay({
    element: document.getElementById('popup')!,
    positioning: 'bottom-center',  // 弹窗底部中点对齐坐标点，也就是正上方
    stopEvent: false,              // 事件穿透
    // autoPan: false{
    //   animation:{
    //     duration:250
    //   }
    // }
  })
  map = new Map({
    target: 'map',
    layers: [
      normalLayer,
      satelliteLayer,
      deviceLayer,
      alarmLayer
    ],
    view: new View({
      center: fromLonLat([58.3829, 23.5880]), // Muscat
      zoom: 12,
    }),
  })
  map.addOverlay(detailOverlay) // Overlay 只能用这个方法添加

  //中间地图显示device以及侧边统计
  getPermissionDeviceList().then(res => {
    // console.log("getPermissionDeviceList:", res)
    // cameras.value=res.list;
    addDevicePoints(res);
  })

  //查询首页告警
  AlarmFaceMsgApi.getAlarmFaceMsgPage({
    startTime: dayjs(new Date()).format('YYYY-MM-DD 00:00:00'),
    endTime: dayjs(new Date()).format('YYYY-MM-DD 23:59:59'),
    pageSize: 100
  })
    .then(res => {
    console.log("getAlarmFaceMsgPage:", res)
    if (res.list != null) {
      addAlarmData(res.list)
    }
  }).catch(err => {
    console.log("err:", err)
  })

  if(!stopTimer){
    let startTime=dayjs(new Date()).format("YYYY-MM-DD 00:00:00");
    let endTime=dayjs(new Date()).add(1,'day').format("YYYY-MM-DD 23:59:59");
    stopTimer=callWithDelay(()=>{
      //查询今日数量
      faceCaptureCount({startTime:startTime,endTime:endTime}).then(res=>{
        // console.log("faceCaptureCount-today:",res)
        faceCapture.value=res.group[0]?.count
        // options.series[0].data=res.group.map(x=>x.count);
      })
    },5000)
  }


  map.on('singleclick', (evt) => {
    let featureFound = false
    const pixel = evt.pixel
    map.forEachFeatureAtPixel(pixel, (feature) => {
      let obj = feature.getProperties()
      if (obj.weight) {//alarm
        console.log("alarm")
      } else {
        currentCamera.value = obj;
        detailOverlay.setPosition(fromLonLat([parseFloat(feature.get('longitude')), parseFloat(feature.get('latitude'))]))
        detailVisible.value = true
        featureFound = true
        return true  // 停止继续遍历
      }
    })
    // 如果没有点击到 Feature，就隐藏 Overlay 弹窗
    if (!featureFound) {
      detailOverlay.setPosition(undefined)  //  隐藏 Overlay
      detailVisible.value = false
    }
  })

   const tenantid = authUtil.getTenantId();
   if (tenantid === 1) {
    isManager.value = true;
   } else {
    isManager.value = false;
   }
})
onUnmounted(()=>{
  if(stopTimer){
    stopTimer();
    stopTimer=null;
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard.scss';
.mapCount{
  position: absolute;
  bottom: 183px;
  right: 308px;

}
.mapCountFull{
  position: absolute;
  bottom: 20px;
  right: 20px;
}
.totalCount {
  z-index: 100;
  box-sizing: border-box;
  padding: 5px;
  /* color: #00d9ff; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 26px;
  /* text-shadow: 0px 0px 1px #00d9ff, 0px 0px 5px #00d9ff, 0px 0px 72px #00d9ff, 0px 0px 150px #00d9ff; */
  //background: rgba(20, 40, 60, 0.2);
  box-shadow: 0 0 10px rgba(53, 54, 54, 0.2);
  background: #4b4a4acc;
  //border: 1px solid rgba(0, 255, 255, 0.1);
}

#map {
  position: relative;
}

.image-lost {
  background-color: #000;
  width: 100%;
  height: 100%;
}

.popup {
  margin-bottom: 30px;
  box-sizing: border-box;
  padding: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 100px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

  .popup_image {
    width: 300px;
    height: 160px;

  }

  .popup_name {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 5px;
  }

  .popup_info {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 5px;
  }

  .popup_play {
    position: absolute;
    margin: 0 auto;
    left: 136px;
    z-index: 1000;
    top: 67px;
    cursor: pointer;
  }

  .popup_tag {
    margin-right: 8px;
  }
}


.earth {
  position: absolute;
  right: 310px;
  top: 10px;
  z-index: 100;
  width: 20px;
  cursor: pointer;
}
.max {
  position: absolute;
  right: 310px;
  top: 30px;
  z-index: 200;
  width: 20px;
  cursor: pointer;
}
.earthFull {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 100;
  width: 20px;
  cursor: pointer;
}
.maxFull {
  position: absolute;
  right: 10px;
  top: 30px;
  z-index: 200;
  width: 20px;
  cursor: pointer;
}
/* Webkit 浏览器滚动条样式（Chrome、Edge、Safari） */
.scroll-container::-webkit-scrollbar {
  height: 8px; /* 横向滚动条高度 */
}

.scroll-container::-webkit-scrollbar-track {
  background: #1a1f2d; /* 滚动轨道背景色（深灰） */
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: #00d9ff; /* 滚动条颜色：亮青色 */
  border-radius: 4px;
  box-shadow: inset 0 0 4px rgba(0, 217, 255, 0.6);
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: #33e2ff; /* 悬停时颜色更亮 */
}

/* Firefox 滚动条（可选） */
.scroll-container {
  scrollbar-color: #00d9ff #1a1f2d;
  scrollbar-width: thin;
}


.dashboard_content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
}

.dark{
  .glass {
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
  }
  .custom-radio {
    --bg-selected: linear-gradient(to right, #00c6ff, #0072ff);
    position: relative;
    border: 1px solid #666;
    border-radius: 2px;
    color: #fff;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 14px;
    transition: 0.3s;
    display: flex;
    align-items: center;
    width: 110px;
    background: rgba(0, 0, 0, 0.5);
  }
}
/**left*/
.left-panel {
  width: 300px;
  padding: 0 15px;
  color: #00eaff; //#00eaff
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  left: 0;
  z-index: 100;
  flex: 1;
  height: calc(100vh - 50px);

  section {
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
    padding-bottom: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: flex-start;
    box-sizing: border-box;
    overflow: hidden;
    min-height: 0;
  }
}

.right-panel {
  width: 300px;
  padding: 0 15px;
  color: #00eaff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  right: 0;
  z-index: 100;
  flex: 1;
  height: calc(100vh - 50px);

  section {
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
    padding-bottom: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: flex-start;
    box-sizing: border-box;
    overflow: hidden;
    min-height: 0;
  }
}

.bottom-panel {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 305px;
  right: 305px;
  height: 180px;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: #00eaff;

  section {
    border-right: 1px solid rgba(255, 255, 255, 0.8);
    padding: 5px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
    min-height: 0;
  }
}
.mapButton{
  position: absolute;
  left: 320px;
  top: 10px;
  z-index: 100;
}
.mapButtonFull{
  position: absolute;
  left: 10px;
  top: 60px;
  z-index: 100;
}
/**radio*/
.custom-radio-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 120px;
  --el-color-primary: #00d9ff !important;
}

:deep(.el-radio:last-child ) {
  margin-right: 30px;
}

.custom-radio-active {
  border: 1px solid #00eaff !important;
  color: #00eaff;
  /* 添加内阴影 */
  box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.2),
  inset 0 0 35px rgba(0, 204, 255, 0.3),
  0 0 6px rgba(0, 153, 255, 0.6); /* 外发光保留 */

}

.custom-radio {
  --bg-selected: linear-gradient(to right, #00c6ff, #0072ff);
  position: relative;
  border: 1px solid #666;
  border-radius: 2px;
  color: #fff;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  width: 110px;
  background: rgba(43, 44, 45, 0.5);
}

/**center*/
.big-screen-map {
  height: 100vh;
  width: 100vw;
  background-color: #0c1a2a;
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
}

.map-container {
  flex: 1;
  position: relative;
}

.glass {
  background: rgba(20, 40, 60, 0.6);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}


</style>
