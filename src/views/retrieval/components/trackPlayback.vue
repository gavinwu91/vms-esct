<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount, watch, nextTick} from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import {Style, Stroke, Circle as CircleStyle, Fill} from 'ol/style';
import Overlay from 'ol/Overlay';
import XYZ from 'ol/source/XYZ';
import Icon from 'ol/style/Icon';
import {FaceCaptureDetail} from "@/views/retrieval/components/index";
import VehicleCaptureDetail from "@/views/vehicle/components/detail.vue";
import {unByKey} from 'ol/Observable';
import {Timer, VideoCamera} from "@element-plus/icons-vue";

defineOptions({name: 'FaceCaptureTrack'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})

const tools = ref({
  detail: false,
  detail2: false,
  content: {
    rid: "",
    channel: "",
  },
})
const detail = (data) => {
  const item = data.source;
  if (item.vehicleCaptured) {
    tools.value.content.rid = item.deviceId;
    tools.value.content.channel = "FaceCapture";
    tools.value.detail2 = true;
  } else {
    tools.value.content = item;
    tools.value.detail = true;
  }
}

const trackData = ref([]);
const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
let vectorLayer: VectorLayer<VectorSource> | null = null;
let overlay: Overlay | null = null;
const overlayRef = ref<HTMLDivElement | null>(null);
const overlayImgUrl = ref('');
const selectedIdx = ref(0);
const playSpeeds = [1, 2, 4];
const playSpeedIdx = ref(0); // 0:1x, 1:2x, 2:4x
const isPlaying = ref(false);
let playTimer: number | null = null;
const glowAlpha = ref(0.3);
let glowTimer: number | null = null;
const showSidebar = ref(true);
const mapType = ref<'normal' | 'earth'>('normal');
const pulseOverlayRef = ref<HTMLDivElement | null>(null);
let pulseOverlay: Overlay | null = null;
let mapClickKey: any = null;

function createTrackFeatures() {
  const features: Feature[] = [];
  // 图标地址
  const cameraIcon = 'https://cdn.jsdelivr.net/gh/feathericons/feather@4.28.0/icons/camera.svg';
  const carIcon = 'https://cdn.jsdelivr.net/gh/feathericons/feather@4.28.0/icons/truck.svg';
  // Track points
  trackData.value.forEach((point, idx) => {
    const feature = new Feature({
      geometry: new Point([point.lng, point.lat]),
      idx,
    });
    // 当前点高亮+脉冲动画，仍用原有逻辑
    if (idx === selectedIdx.value) {
      // 当前点：红色+光晕
      feature.setStyle([
        new Style({
          image: new Icon({
            src: point.isDriver ? carIcon : cameraIcon,
            scale: 0.9,
            color: '#d23c3c',
          }),
          zIndex: 2,
        })
      ]);
    } else {
      // 其它点：不同图标
      feature.setStyle(
        new Style({
          image: new Icon({
            src: point.isDriver ? carIcon : cameraIcon,
            scale: 0.7,
            color: '#2d3a4b',
          }),
        })
      );
    }
    features.push(feature);
  });
  // Track line
  const line = new Feature({
    geometry: new LineString(trackData.value.map(p => [p.lng, p.lat])),
  });
  line.setStyle(
    new Style({
      stroke: new Stroke({color: '#FFA500', width: 2, lineDash: [6, 6]}),
    })
  );
  features.push(line);
  return features;
}

function selectSnapshot(idx: number) {
  selectedIdx.value = idx;
  moveToPoint(idx);
  showOverlay(idx);
  updatePulseOverlay(idx);
  // Highlight point, add flashing to current
  if (vectorLayer) {
    const features = vectorLayer.getSource()?.getFeatures() || [];
    features.forEach(f => {
      const fIdx = f.get('idx');
      if (typeof fIdx === 'number') {
        f.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 9,
              fill: new Fill({color: fIdx === idx ? '#F56C6C' : '#409EFF'}),
              stroke: new Stroke({color: '#fff', width: 2}),
            }),
          })
        );
        // Add flashing class to current point
        const el = map?.getTargetElement();
        if (el) {
          const pointEls = el.querySelectorAll('.ol-layer canvas');
          // No direct DOM for feature, so flashing is handled by overlay below
        }
      }
    });
  }
  // Scroll sidebar to active item
  nextTick(() => {
    const sidebar = document.querySelector('.snapshots-list');
    const active = sidebar?.querySelector('.snapshot-item.active');
    if (active && sidebar) {
      (active as HTMLElement).scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  });
}

function moveToPoint(idx: number) {
  if (!map) return;
  const point = trackData.value[idx];
  map.getView().animate({center: [point.lng, point.lat], duration: 500});
}

function showOverlay(idx: number) {
  if (!map || !overlay) return;
  const point = trackData.value[idx];
  overlayImgUrl.value = '';
  // Render overlay content: snapshot + score + cameraName + time
  if (overlayRef.value) {
    overlayRef.value.innerHTML = `
      <div class="retrieval-face-overlay-snapshot-box" >
        <div class="retrieval-face-overlay-snapshot-img-wrap">
          <img src="${point.snapshotUrl}" alt="Snapshot" class="retrieval-face-overlay-snapshot-img" />
        </div>
        <div class="retrieval-face-overlay-snapshot-score face-score-float">${point.score}</div>
        <div class="retrieval-face-overlay-snapshot-info">
          <div class="retrieval-face-overlay-snapshot-camera">${point.cameraName}</div>
          <div class="retrieval-face-overlay-snapshot-time">${point.time}</div>
        </div>
      </div>
    `;
  }
  overlay.setPosition([point.lng, point.lat]);
  // 设置 overlay 在点的上方
  overlay.setOffset([5, 5]);
  overlay.setPositioning('top-center');
}

function updatePulseOverlay(idx: number) {
  if (!map || !pulseOverlay) return;
  const point = trackData.value[idx];
  pulseOverlay.setPosition([point.lng, point.lat]);
}

// Get custom map service url
function getMapUrl(): string {
  // 切换地图底图
  if (mapType.value === 'normal') {
    return "https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}"; // 地球/卫星地图
  } else {
    return "https://192.168.80.185:8443/webGis/kh/&hl=zh-CN&src=api&x={x}&y={y}&z={z}"; // 普通地图
  }
}

function toggleMapType() {
  mapType.value = mapType.value === 'normal' ? 'earth' : 'normal';
  if (map && map.getLayers().getLength() > 0) {
    const tileLayer = map.getLayers().item(0);
    if (tileLayer && tileLayer.getSource && tileLayer.setSource) {
      // @ts-ignore
      tileLayer.setSource(new XYZ({url: getMapUrl()}));
    }
  }
}

function startPlayback() {
  if (isPlaying.value) return;
  isPlaying.value = true;
  showSidebar.value = true;
  playTimer = window.setInterval(() => {
    if (selectedIdx.value < trackData.value.length - 1) {
      selectSnapshot(selectedIdx.value + 1);
    } else {
      // Loop: go to first point and continue
      selectSnapshot(0);
    }
  }, 1000 / playSpeeds[playSpeedIdx.value]);
}

function pausePlayback() {
  isPlaying.value = false;
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
  showSidebar.value = true;
}

function togglePlayback() {
  if (isPlaying.value) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function changeSpeed() {
  playSpeedIdx.value = (playSpeedIdx.value + 1) % playSpeeds.length;
  if (isPlaying.value) {
    pausePlayback();
    startPlayback();
  }
}

function resetPlayback() {
  pausePlayback();
  selectSnapshot(0);
  showSidebar.value = true;
}

function prevSnapshot() {
  pausePlayback();
  if (selectedIdx.value > 0) {
    selectSnapshot(selectedIdx.value - 1);
  } else {
    selectSnapshot(trackData.value.length - 1);
  }
}

function updateGlow() {
  if (vectorLayer) {
    // 重新设置当前点的 style，实现光晕透明度变化
    const features = vectorLayer.getSource()?.getFeatures() || [];
    features.forEach(f => {
      const fIdx = f.get('idx');
      if (typeof fIdx === 'number' && fIdx === selectedIdx.value) {
        f.setStyle([
          new Style({
            image: new CircleStyle({
              radius: 18,
              fill: new Fill({color: `rgba(245,108,108,${glowAlpha.value})`}),
            }),
            zIndex: 1,
          }),
          new Style({
            image: new CircleStyle({
              radius: 9,
              fill: new Fill({color: 'red'}),
              stroke: new Stroke({color: '#fff', width: 1}),
            }),
            zIndex: 2,
          })
        ]);
      }
    });
  }
}

const loading = ref(false);
onMounted(() => {
  trackData.value = props.content.data.map(item => ({
    lng: item.lon,
    lat: item.lat,
    snapshotUrl: item.captureUrl,
    referenceUrl: props.content.compareUrl,
    cameraName: item.deviceName,
    time: item.captureTime,
    score: item.score,
    isDriver: item.vehicleCaptured,
    source: item,
  }))
  if (trackData.value.length > 0) {
    map = new Map({
      target: mapContainer.value as HTMLElement,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: getMapUrl(),
          }),
        }),
      ],
      view: new View({
        center: [58.5453, 23.6100], // Centered at Muscat, Oman
        zoom: 10, // Suitable for Oman region
        projection: 'EPSG:4326',
      }),
    });
    vectorLayer = new VectorLayer({
      source: new VectorSource({features: createTrackFeatures()}),
    });
    map.addLayer(vectorLayer);

    // Overlay image
    nextTick(() => {
      overlay = new Overlay({
        element: overlayRef.value as HTMLElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -80],
      });
      map?.addOverlay(overlay);
      showOverlay(selectedIdx.value);
    });

    // 添加脉冲环Overlay
    nextTick(() => {
      pulseOverlay = new Overlay({
        element: pulseOverlayRef.value as HTMLElement,
        positioning: 'center-center',
        stopEvent: false,
        offset: [0, 0],
      });
      map?.addOverlay(pulseOverlay);
      updatePulseOverlay(selectedIdx.value);
    });

    // Default highlight first point
    selectSnapshot(0);

    // Map click: if click on point, select and toggle play/pause
    mapClickKey = map.on('singleclick', function (evt) {
      let found = false;
      map?.forEachFeatureAtPixel(evt.pixel, function (feature) {
        map.getTargetElement().style.cursor = 'pointer';
        const idx = feature.get('idx');
        if (typeof idx === 'number') {
          found = true;
          selectSnapshot(idx);
          //点击点位自动播放
          // if (isPlaying.value) {
          //   pausePlayback();
          // } else {
          //   startPlayback();
          // }
        }
      });
    });

    // 启动光晕闪烁定时器
    let alpha = 0.3;
    let dir = 1;
    glowTimer = window.setInterval(() => {
      if (dir === 1) {
        alpha += 0.04;
        if (alpha >= 0.7) dir = -1;
      } else {
        alpha -= 0.04;
        if (alpha <= 0.2) dir = 1;
      }
      glowAlpha.value = alpha;
      updateGlow();
    }, 60);
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  pausePlayback();
  if (mapClickKey && map) {
    unByKey(mapClickKey);
    mapClickKey = null;
  }
  map?.setTarget(undefined);
  if (glowTimer) {
    clearInterval(glowTimer);
    glowTimer = null;
  }
  overlay = null;
  pulseOverlay = null;
});
</script>

<style>
.retrieval-face-overlay-snapshot-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 250px;
  width: 250px;
  background: rgb(50 53 57 / 7%);
  backdrop-filter: blur(18px) saturate(1.1);
  position: relative;
  padding: 10px;
  cursor: pointer;
}

.retrieval-face-overlay-snapshot-img-wrap {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.retrieval-face-overlay-snapshot-img {
  height: 180px;
  width: 180px;
  object-fit: fill;
  //border-radius: 12px;
}

.retrieval-face-overlay-snapshot-score {
  background: url('../../../../public/insight/red_back2.850b4.svg') no-repeat;
  background-size: 100% 100%;
  color: #fff;
  border-radius: 0;
  width: 120px;
  font-size: 23px;
  bottom: 18px;
  height: 22px;
  font-weight: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px #409eff33;
  border: none;
  //clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);
  letter-spacing: 1px;
  z-index: 2;
  position: relative;
  text-shadow: 0 2px 8px #0008, 0 0 2px #fff;
}

.retrieval-face-overlay-snapshot-info {
  margin-top: -15px;
  text-align: center;
  width: 100%;
}

.retrieval-face-overlay-snapshot-camera {
  margin: 5px;
  font-weight: 200;
}

.retrieval-face-overlay-snapshot-time {
  font-weight: 200;
}
</style>

<style scoped>
html, body, #app {
  height: 100%;
  margin: 0;
  ////background: rgba(255,235,238,0.85);
  backdrop-filter: blur(18px) saturate(1.1);
}

body {
  /* Add a subtle shadow and border like snapshot-item */
  box-shadow: 0 4px 24px #bfcbd911, 0 0 0 2px #fff1 inset;
}

.track-playback-layout, .map-container {
  height: 100%;
}


.map-container {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 8px 32px 0 rgba(191, 203, 217, 0.12);
  //background: rgba(255,235,238,0.85);
  backdrop-filter: blur(18px) saturate(1.1);
  position: relative;
  //margin: 2vw 0 2vw 2vw;
  display: flex;
  flex-direction: column;
}

.playback-toolbar {
  position: absolute;
  left: 50%;
  bottom: 39px;
  transform: translateX(-50%);
  z-index: 30;
  background: rgb(50 53 57 / 7%);
  -webkit-backdrop-filter: blur(18px) saturate(1.1);
  backdrop-filter: blur(18px) saturate(1.1);
  //border-radius: 12px;
  display: flex;
  gap: 24px;
  padding: 9px 43px;
  align-items: center;
}

.toolbar-btn {
  background: linear-gradient(135deg, #fff 0%, #e9eff6 100%);
  color: #409EFF;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 4px 24px #bfcbd933, 0 0 0 2px #fff2;
}

.toolbar-btn:hover {
  background: linear-gradient(135deg, #e9eff6 0%, #fff 100%);
  color: #409EFF;
  box-shadow: 0 8px 32px #bfcbd966, 0 0 0 4px #fff3;
  transform: scale(1.08);
}

.toolbar-btn:active {
  background: #e9eff6;
}

.snapshots-panel.inside-map {
  background: rgb(50 53 57 / 7%);
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 30;
  margin: 0;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}


.snapshots-list {
  flex: 1 1 0;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  padding: 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
}

.card-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  margin-right: 0;
}

.snapshots-list::-webkit-scrollbar-track {
  background: transparent;
}

.snapshots-list::-webkit-scrollbar-thumb {
  background: rgba(12, 10, 10, 0.71);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.snapshots-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}


.snapshot-item {
  min-width: 335px;
  cursor: pointer;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.08);
  padding: 18px 12px 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  box-shadow: 0 8px 32px #bfcbd933, 0 0 0 4px #fff2;
  position: relative;
  backdrop-filter: blur(4px);
  width: 100%;
  box-sizing: border-box;
}

.snapshot-item.active {
  background: rgba(10, 31, 51, 0.34);
  box-shadow: 0 8px 32px #bfcbd933, 0 0 0 4px #fff2;
}

.snapshot-item img,
.face-img-block-float img {
  width: 250px;
  height: 180px;
}

.snapshot-info {
  font-size: 16px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 500;
  text-shadow: 0 2px 8px #bfcbd944;
  justify-content: center;
  align-items: center;
  margin: auto;
}

.map-overlay-img {
  position: absolute;
  z-index: 20;
  backdrop-filter: blur(18px) saturate(1.1);
  //border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.map-overlay-img img {
  width: 80px;
  height: 50px;
  //border-radius: 8px;
}

@media (max-width: 900px) {
  .map-container, .snapshots-panel.inside-map {
    margin: 2vw;
    //border-radius: 14px;
    width: 100% !important;
    max-width: 100vw;
    min-width: 0;
  }

  .compare-result-card {
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    min-width: 0;
    max-width: 98vw;
    top: 2vw;
    cursor: pointer;
  }

  .snapshots-panel.inside-map {
    position: static;
    width: 100% !important;
    max-width: 100vw;
    min-width: 0;
    margin: 2vw 2vw 2vw 2vw;
  }
}

.face-compare-card-float-ltop {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 0;
  width: 100%;
  position: relative;
  margin-bottom: 8px;
}

.face-compare-card-float {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  width: 100%;
  position: relative;
  min-height: 120px;
  margin-bottom: 8px;
}

.face-img-block-float-ltop {

}

.face-img-block-float-ltop img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  //border-radius: 12px;
  box-shadow: 0 2px 8px #bfcbd933;
  background: #fff;
  display: block;
  margin: 0;
  transition: none;
}

.face-img-block-float {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
}

.face-img-block-float img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  box-shadow: 0 2px 8px #bfcbd933;
  background: #fff;
  display: block;
  margin: 0;
  transition: none;
}

.face-img-block-float img:hover {
  transform: none;
  z-index: 2;
}


.face-score-float-ltop,
.face-score-float {
  position: absolute;
  left: 150px;
  bottom: -10px;
  top: auto;
  transform: translateX(-50%);
  background: url('../../../../public/insight/red_back2.850b4.svg') no-repeat;
  background-size: 100% 100%;
  color: #fff;
  font-size: 20px;
  font-weight: 200;
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px #bfcbd955, 0 0 0 2px #fff2;
  border: none;
  clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);
  letter-spacing: 1px;
  z-index: 3;
  pointer-events: none;
  text-shadow: 0 2px 8px #0008, 0 0 2px #fff;
}


.overlay-face-img img {
  width: 36px;
  height: 36px;
  object-fit: cover;
  //border-radius: 6px;
  border: 1px solid #e0e6ed;
  background: #fff;
}


.compare-result-card {
  cursor: pointer;
  position: absolute;
  top: 4px;
  left: 35px;
  z-index: 40;
  background: rgb(50 53 57 / 7%);
  backdrop-filter: blur(18px) saturate(1.1);
  width: 350px;
  max-width: 98vw;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 10px 16px;
}

.compare-img-block img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  //border-radius: 10px;
  border: 1.5px solid #e0e6ed;
  box-shadow: 0 2px 8px #0001;
  background: #fff;
  display: block;
}

.compare-img-label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateY(50%);
  background: rgba(32, 40, 56, 0.72);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  border-radius: 0 0 8px 8px;
  padding: 2px 0 2px 0;
  letter-spacing: 0.5px;
  z-index: 2;
  pointer-events: none;
}

@keyframes flash-point {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  50% {
    box-shadow: 0 0 16px 8px rgba(245, 108, 108, 0.5);
  }
}

.ol-overlay-container .flashing-point {
  animation: flash-point 1s infinite;
}

.pulse-overlay {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 60px;
  height: 60px;
  pointer-events: none;
  z-index: 10;
  transform: translate(-50%, -50%);
}

.pulse-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2.5px solid #409EFF;
  opacity: 0.7;
  transform: translate(-50%, -50%) scale(0.5);
  animation: pulse-ring 1.8s cubic-bezier(.4, 0, .2, 1) infinite;
}

.pulse1 {
  animation-delay: 0s;
}

.pulse2 {
  animation-delay: 0.6s;
}

.pulse3 {
  animation-delay: 1.2s;
}

@keyframes pulse-ring {
  0% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(0.5);
  }
  70% {
    opacity: 0.15;
    transform: translate(-50%, -50%) scale(1.4);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.8);
  }
}

.ol-zoom {
  display: none !important;
}

.compare-info-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  margin: auto;
}

.compare-info-row {
  display: flex;
  gap: 6px;
  margin: 5px;
  align-items: center;
}

</style>
<template>
  <div ref="mapContainer" class="map-container" v-loading="loading">
    <!-- 脉冲环动画Overlay -->
    <div ref="pulseOverlayRef" class="pulse-overlay">
      <span class="pulse-circle pulse1"></span>
      <span class="pulse-circle pulse2"></span>
      <span class="pulse-circle pulse3"></span>
    </div>
    <!-- Compare Result Card -->
    <div class="compare-result-card" v-if="trackData.length>0"
         @click="detail(trackData[selectedIdx])">
      <div class="face-compare-card-float-ltop">
        <div class="face-img-block-float-ltop">
          <img :src="trackData[selectedIdx].snapshotUrl" alt="Snapshot"/>
        </div>
        <div class="face-score-float-ltop">{{ trackData[selectedIdx].score }}</div>
        <div class="face-img-block-float-ltop">
          <img :src="trackData[selectedIdx].referenceUrl" alt="Reference"/>
        </div>
      </div>
      <div class="compare-info-block">
        <el-link type="primary" :underline="false" :icon="VideoCamera" style="font-weight: bold">
          {{ trackData[selectedIdx].cameraName }}
        </el-link>
        <el-link type="danger" :underline="false" :icon="Timer" style="font-weight: bold">
          {{ trackData[selectedIdx].time }}
        </el-link>
        <div style="margin: auto">
          <el-tag type="primary">
            {{ trackData[selectedIdx].source.position }}
          </el-tag>
          <el-tag type="primary" style="margin-left: 5px">
            {{ trackData[selectedIdx].isDriver ? 'ANPR' : 'FR' }}
          </el-tag>
        </div>
      </div>
    </div>
    <!-- Playback Toolbar -->
    <div class="playback-toolbar">
      <button class="toolbar-btn" @click="toggleMapType" title="Switch Map Type">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path
            d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="prevSnapshot" :disabled="selectedIdx === 0"
              title="Previous">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="togglePlayback" :title="isPlaying ? 'Pause' : 'Play'">
        <svg v-if="!isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="resetPlayback" title="Reset">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="changeSpeed">{{ playSpeeds[playSpeedIdx] }}x</button>
      <button class="toolbar-btn" @click="showSidebar = !showSidebar"
              :title="showSidebar ? 'Hide List' : 'Show List'">
        <svg v-if="showSidebar" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19V5"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
        </svg>
      </button>
    </div>
    <!-- Map Image Overlay -->
    <div ref="overlayRef" class="map-overlay-img" @click="detail( trackData[selectedIdx])"></div>
    <div v-if="showSidebar" class="snapshots-panel inside-map">
      <!--      <div class="snapshots-title">Face Comparison</div>-->
      <div class="snapshots-list">
        <div
          v-for="(point, idx) in trackData"
          :key="idx"
          :class="['snapshot-item', { active: idx === selectedIdx }]"
          @click="selectSnapshot(idx)"
        >
          <div class="face-compare-card-float">
            <div class="face-img-block-float">
              <img :src="point.snapshotUrl" alt="Snapshot"/>
            </div>
            <div class="face-score-float">{{ point.score }}</div>
            <div class="face-img-block-float">
              <img :src="point.referenceUrl" alt="Reference"/>
            </div>
          </div>
          <div class="snapshot-info">
            <el-link style="font-weight: bold" :underline="false" type="primary"
                     :icon="VideoCamera">{{ point.cameraName }}
            </el-link>
            <el-link style="font-weight: bold" :underline="false" type="danger" :icon="Timer">
              {{ point.time }}
            </el-link>
            <div>
              <el-tag type="primary">{{ point.source.position }}</el-tag>
              <el-tag type="primary" style="margin-left: 5px">{{ point.isDriver ? 'ANPR' : 'FR' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="tools.detail2" draggable width="90%" style="margin-top: 5px">
    <VehicleCaptureDetail :content="tools.content"
                          v-if="tools.detail2"/>
  </el-dialog>
  <el-dialog v-model="tools.detail" draggable width="90%" style="margin-top: 5px">
    <FaceCaptureDetail :content="tools.content"
                       v-if="tools.detail"/>
  </el-dialog>
</template>
