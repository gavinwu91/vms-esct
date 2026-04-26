<script setup lang="ts">
import {track} from "@/api/vehicle/index";
import "ol/ol.css";
import {Feature, Map, Overlay, View} from "ol";
import {Vector as VectorLayer} from "ol/layer";
import {Vector as VectorSource, XYZ} from "ol/source";
import {LineString, Point} from "ol/geom.js";
import {Circle, Fill, Icon, Stroke, Style} from "ol/style";
import TileLayer from "ol/layer/Tile";
import {getVectorContext} from "ol/render";
import {getImageUrl, imageShow} from "@/views/vehicle/components/index";
import {Fold} from "@element-plus/icons-vue";

defineOptions({name: 'VehicleTracking'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})

let carPoints = ref([]);
let captureDataList = ref([]);
const mapTools = ref({
  playTipContent: "Play",
  mapPlayButtonImage: getImageUrl('track/play.png'),
  forward: getImageUrl('track/forward.png'),
  mapType: false,
})
const showForm = ref(true);
const result = ref({});
let map = ref({});
const path = ref([]);
const styles = ref({
  //谷歌卫星地图线的样式
  route: new Style({
    stroke: new Stroke({
      width: 3,
      color: "#fff",
      lineDash: [0.1, 5],
    }),
  }),
  //谷歌动画地图线的样式
  routeGoogleMap: new Style({
    stroke: new Stroke({
      width: 3,
      color: "orange",
      lineDash: [0.1, 5],
    }),
  }),
  moveLine: new Style({
    stroke: new Stroke({
      width: 4,
      color: "black",
    }),
  }),
  startIcon: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      // src: "https://openlayers.org/en/v4.6.5/examples/data/icon.png",
      src: "img/point.svg",
      scale: 1, //设置大小
    }),
  }),

  endIcon: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      // src: "https://openlayers.org/en/v4.6.5/examples/data/icon.png",
      src: "img/end_location.svg",
      scale: 1, //设置大小
    }),
  }),
  //普通点位的样式
  usePoint: new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({
        color: '#f45c29'
      }),
      stroke: new Stroke({
        color: 'white',
        width: 2
      })
    })
  }),
  //移动点的样式
  featureMove: new Style({
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: "blue",
      }),
      stroke: new Stroke({
        color: "white",
        width: 3,
      }),
    }),
  }),

})
let overlay = ref({})
let distance = ref(0);
let vectorLayer = ref({});
let route = ref({});
let geometryMove = ref({});
let featureMove = ref({});
let loading = ref(true);
const radius = ref({});
const pointFeature = ref([]);
const tableRowItemIndex = ref(0);
const speed = ref(20);
const doubleSpeed = ref(1);
let playProgress = ref(0);
const mapId = ref(9999);
const moveFlag = ref(true);


const locationDataClass = ({row, rowIndex}) => {
  row.index = rowIndex;
}

const locationDataRowStyle = ({row, rowIndex}) => {
  if (tableRowItemIndex.value === rowIndex) {
    return {
      "color": "orangered",
      "cursor": "pointer",
    };
  } else {
    return {
      "cursor": "pointer",
    }
  }
}

const clickLocationDataCard = (data, index) => {
  //先停止
  stopMapAnimation();
  tableRowItemIndex.value = index;
  const location = [parseFloat(data.longitude), parseFloat(data.latitude), data.dateTime, data.dataType, data.address, data.captureImage];

  console.log(location, "======================")
  overlayProfile(null, location);
  map.getView().setCenter(location)
}

const clickLocationDataRow = (row, rowIndex) => {
  //先停止
  stopMapAnimation();
  tableRowItemIndex.value = row.index;
  const location = [parseFloat(row.longitude), parseFloat(row.latitude), row.dateTime, row.address];
  overlayProfile(null, location);
  map.getView().setCenter(location)
}


//地图轨迹移动停止
const stopMapAnimation = () => {
  if (moveFlag.value) {
    featureMove.setGeometry(geometryMove);
    vectorLayer.un("postrender", moveFeature);
    mapTools.value.mapPlayButtonImage = getImageUrl('track/play.png');
    mapTools.playTipContent = "Play";
    moveFlag.value = false;
  }
}

const overlayProfile = (e, currentCoordinate) => {
  const innerHtml = vehicleCaptureHtml(currentCoordinate);
  overlay.setPosition(currentCoordinate);
  overlay.getElement().innerHTML = innerHtml;
  overlay.getElement().className = "trackMoveDiv";
  overlay.getElement().id = "trackMoveDiv";
  map.addOverlay(overlay);
  geometryMove.setCoordinates(currentCoordinate);
  if (e) {
    const vectorContext = getVectorContext(e);
    vectorContext.setStyle(styles.value.featureMove);
    vectorContext.drawGeometry(geometryMove);
  }
}

const replaceVal = (val, template) => {
  return val.replace(template, "");
}

const vehicleCaptureHtml = (currentCoordinate) => {
  let address = replaceVal(currentCoordinate.at(4).toString(), "NaN");
  let dateTime = replaceVal(currentCoordinate.at(2).toString(), "NaN");
  let captureImage = replaceVal(currentCoordinate.at(5).toString(), "NaN");
  let carIcon = getImageUrl('track/car.png');
  let content = '<img style="width: 150px;height: 100px;margin: 5px"  src="' + imageShow(captureImage) + '"/>';
  content = content + '<div>';
  content = content + '<div style="margin-top: 5px;display: flex;align-items: center;">';
  content = content + '<img  src="' + carIcon + '"  class="box-shadow-radius" style="width: 20px;margin: 0px 3px 0px 0px">';
  content = content + '<span   >' + result.value.code + '</span></div>';
  content = content + '</div>';
  content = content + '<div style="\n' +
    '    display: flex;\n' +
    '    flex-wrap: nowrap;\n' +
    '    align-items: center;\n' +
    '    \n' +
    '    flex-direction: column;">';
  content = content + '<div><i class="el-icon-location-information" >&nbsp;' + address + '</i></div>';
  content = content + '<div><i class="el-icon-time" >&nbsp;' + dateTime + '</i></div>';
  content = content + '</div>'
  return content;
}

let lastTime = ref();
const moveFeature = (e) => {
  const time = e.frameState.time;
  const elapsedTime = time - lastTime.value;
  distance.value = (distance.value + (speed.value * elapsedTime) / 1e6) % 2;
  // 进度条
  playProgress.value = (distance.value * 100).toFixed(2);
  lastTime.value = time;
  //循环次数
  const currentCoordinate = route.getCoordinateAt(
    distance.value > 1 ? 2 - distance.value : distance.value
  );
  overlayProfile(e, currentCoordinate)
  map.render();
  if (distance.value > 1) {
    //最后停在终点位置
    overlayProfile(e, path.value.at(-1))
    stopMapAnimation();
    distance.value = 0;
    playProgress.value = 100;
  }
}


//地图轨迹移动
const startAnimation = () => {
  //可以重新赋值样式
  lastTime.value = Date.now();
  carPoints.value = [...path.value];
  vectorLayer.on("postrender", moveFeature);
  featureMove.setGeometry(null);
  mapTools.value.mapPlayButtonImage = getImageUrl('track/pause.png');
  mapTools.value.playTipContent = "Pause";
  moveFlag.value = true;
}

//调整速度
const speedAccelerate = () => {
  //最高4倍速
  if (speed.value >= 160) {
    speed.value = 20;
    doubleSpeed.value = 1;
  } else {
    speed.value = speed.value * 2;
    doubleSpeed.value = doubleSpeed.value + 1;
  }
}

const resetAnimation = () => {
  if (path.value.length === 0) {
    return;
  }
  //重置将坐标点重置到第一个位置
  overlayProfile(null, path.value.at(0))
  stopMapAnimation();
  distance.value = 0;
  playProgress.value = 0;
}


//点击开始or暂停按钮
const clickAnimationButton = () => {
  if (path.value.length == 0) {
    return;
  }
  if (moveFlag.value) {
    stopMapAnimation();
  } else {
    startAnimation();
  }
}


const mapStyleSwitch = ref();
const getMap = () => {
  const url = "https://192.168.80.185:8443/webGis/kh/&hl=zh-CN&src=api&x={x}&y={y}&z={z}";
  const url2 = "https://192.168.80.185:8443/webGis/vt/lyrs=m@205000000&hl=zh-CN&src=api&x={x}&y={y}&z={z}";
  return new Map({
    target: "map",
    view: new View({
      //EPSG 是webGis的一个协议，之前被混淆了
      projection: "EPSG:4326",
      center: [58.424297, 23.596676],
      zoom: 10,
      minZoom: 2,
      maxZoom: 19,
    }),
    layers: [
      new TileLayer({
        visible: true,
        source: new XYZ({
          url: url2
        })
      }),
      new TileLayer({
        visible: false,
        source: new XYZ({
          url: url
        })
      }), new VectorLayer({})
    ]
  });
}

const initMap = () => {
  if (path.value.length > 0) {
    const myMap = document.getElementById("map");
    if (myMap) {
      myMap.innerHTML = ""
    }
    map = getMap();
    const vectorSource = new VectorSource();
    route = new LineString(path.value)
    //只有一个点的时候不显示线路
    let len = path.value.length;
    if (len === 1) {
      const pointGeometry = new Point(path.value.at(0));
      const pointFeature = new Feature({
        geometry: pointGeometry,
        type: "usePoint"
      });
      vectorSource.addFeature(pointFeature);
    } else {
      let routFeature;
      if (mapStyleSwitch.value === '20') {
        routFeature = new Feature({
          type: "route",
          geometry: route
        })
      } else {
        //谷歌地图看不清
        routFeature = new Feature({
          type: "routeGoogleMap",
          geometry: route
        })
      }
      vectorSource.addFeature(routFeature);
      for (let i = 0; i <= len; i++) {
        let feature = null;
        if (i === 0) {
          feature = new Feature({
            type: "startIcon",
            geometry: new Point(route.getFirstCoordinate()),
          })
        } else if (i === len) {
          feature = new Feature({
            type: "endIcon",
            geometry: new Point(route.getLastCoordinate()),
          });
        } else {
          const pointGeometry = new Point(path.value[i]);
          feature = new Feature({
            geometry: pointGeometry,
            type: "usePoint"
          });
        }
        vectorSource.addFeature(feature);
        pointFeature.value.push(feature)
      }
    }
    geometryMove = new Point(route.getFirstCoordinate());
    featureMove = new Feature({
      type: "featureMove",
      geometry: geometryMove,
    });
    vectorSource.addFeature(featureMove);

    //todo 给每个点位添加样式
    vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        return styles.value[feature.get("type")];
      },
    });
    overlay = new Overlay({
      element: document.createElement('div'),
      positioning: 'bottom-center',
    });
    map.getView().setCenter(route.getFirstCoordinate());
    map.getView().setZoom(10)
    overlayProfile(null, route.getFirstCoordinate())
    map.addLayer(vectorLayer);
    map.on('pointermove', (evt) => {
      map.getTargetElement().style.cursor = 'pointer';
      if (map.hasFeatureAtPixel(evt.pixel)) {
        let feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          return feature;
        });
        let config = feature.getProperties();
        console.log(config)
        if (config.type === 'usePoint') {
          overlayProfile(null, config.geometry.flatCoordinates)
        } else {
          overlayProfile(null, route.getFirstCoordinate())
        }
      }

    });
  } else {
    const myMap = document.getElementById(mapId.value);
    if (myMap) {
      myMap.innerHTML = ""
    }
    map = getMap();
  }
  loading.value = false;
}


const init = async (content) => {
  var loadingInstance = ElLoading.service();
  let res = await track(content);
  captureDataList.value = res.allLocationList;
  pushPathArray(res.result, res.allLocationList)
  initMap();
  loadingInstance.close();

}


const pushPathArray = async (var1, allLocationList) => {
  if (allLocationList.length > 0) {
    let length = allLocationList.length;
    for (let i = 0; i < length; i++) {
      let val = allLocationList[i];
      path.value.push([parseFloat(val.longitude), parseFloat(val.latitude), "" + val.dateTime, "" + val.dataType, val.address, val.captureImage]);
    }
    result.value.code = var1.carNo;
  }
}
watch(() => props.content, (content) => {
  init(content);
})

onMounted(() => {
  mapId.value = Math.random();
  init(props.content);
})

const earthImg = ref(new URL("@/assets/imgs/map/earth.svg", import.meta.url).href);
function changeMap() {
  console.log(earthImg.value);
  if (mapTools.mapType) {
    earthImg.value = new URL("@/assets/imgs/map/earth.svg", import.meta.url).href;
    mapTools.mapType = false;
    map.getLayers().item(0).setVisible(true);
    map.getLayers().item(1).setVisible(false);
  } else {
    mapTools.mapType = true;
    earthImg.value = new URL("@/assets/imgs/map/map.svg", import.meta.url).href;
    map.getLayers().item(0).setVisible(false);
    map.getLayers().item(1).setVisible(true);
  }
}

</script>
<style scoped lang="scss">
.data-table-box::-webkit-scrollbar {
  width: 5px;
}

.data-table-box::-webkit-scrollbar-track {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 10px;
}

.data-table-box::-webkit-scrollbar-thumb {
  background: #ded9d5;
  border-radius: 10px;
}

.data-table-box::-webkit-scrollbar-thumb:hover {
  background: rgb(100, 100, 100);
  border-radius: 10px;
}

.data-table-box::-webkit-scrollbar-thumb:active {
  background: rgb(68, 68, 68);
  border-radius: 10px;
}


.data-table-box.few-cards .profile_item:only-child {
  max-width: 360px;
  gap: 1px;
}

.data-table-box.few-cards {
  display: flex;
  gap: 16px;
}

.information {
  cursor: pointer;
  border: 2px solid transparent;
}

.information:hover {
  transition: 0.8s;
  border: 2px orange solid;
  color: #0d9bf2;
}

.informationChecked {
  border: 2px orange solid;
  color: #0d9bf2;
}

:deep(.el-timeline) {
  margin: 10px;
}

:deep(.el-timeline-item) {
  padding: 0;
}

#map {
  width: 100%;
  height: 100%;
}

.vehicle_track_map {
  width: 100%;
  height: 100%;


  .myToolTip {
    background-color: #fff !important;

    z-index: 999;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    justify-content: center;

    .item {
      display: flex;
      align-items: center;
      font-size: 14px;
      box-sizing: border-box;
      padding: 2px 0px;

      .my-label {
        color: #869abb;
        width: 90px;
      }

      .my-value {
        color: #67C23A;
        white-space: pre-wrap;
        word-break: break-all;
        flex: 1;
      }
    }

  }
}
</style>
<style lang="scss">
.trackMoveDiv {
  width: 160px;
  background-color: white;
  color: #000000;
  margin-bottom: 8px;
  opacity: 0.75;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  flex-direction: column;
  align-content: center;
  align-items: center;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

#trackMoveDiv {
  width: 160px;
  background-color: white;
  color: #000000;
  margin-bottom: 8px;
  opacity: 0.75;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  flex-direction: column;
  align-content: center;
  align-items: center;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

.track_map_main {
  width: 100%;
  height: 800px;


  .vehicle_track_map {
    width: 100%;
    height: 100%;
  }

  .trackMyheader {
    color: #000 !important;
  }

  .trackMyCell {
    padding: 5px 0px !important;
    height: 45px;

    .cell {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .maptool {
    position: absolute;
    background-color: #fff;
    z-index: 999;
    right: 12px;
    width: 20px;
    height: 20px;
    border-radius: 0 0 2px 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    color: #666666;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
  }

  .maptool:hover {
    border: 1px solid #666666;
  }

  .earthicon {
    top: 90px;
    width: 20px;
  }

  .formicon {
    top: 55px;
  }

  .active {
    border: 1px solid #666666;
    background-color: #5488a059;
  }

  .tip-item {
    margin: 4px;
  }

  .data-table-box {
    position: absolute;
    right: 40px;
    top: 20px;
    background: rgba(0, 0, 0, .4);
    border-radius: 5px;
    max-height: 80vh;
    width: 350px;
    overflow-y: auto;
  }

  .play-control-max {
    flex-wrap: wrap;
    flex-direction: row;
    position: absolute;
    display: flex;
    width: 675px;
    align-items: center;
    left: 50%;
    margin-left: -355px;
    bottom: 18px;
    height: 70px;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, .4);
    padding: 10px;
    justify-content: space-around;

    .ml60 {
      margin-left: 60px;
    }

    #playProgress {
      width: 400px;
      height: 40px;
    }

    .playControlImage {
      width: 25px;
      height: 25px;
      cursor: pointer;
    }
  }

  .ol-zoom {
    display: none;
    top: 0.5em;
    right: 12px;
  }
}
</style>
<template>
  <div class="track_map_main" style=" width: 100%;height: 800px;" v-loading="loading">
    <div id="map" class="vehicle_track_map"></div>
    <div class="play-control-max no-dark">
      <el-tooltip class="tip-item" effect="dark" :content="mapTools.playTipContent"
                  placement="top-start">
        <el-image :src="mapTools.mapPlayButtonImage" class="ml20 playControlImage"
                  @click="clickAnimationButton"/>
      </el-tooltip>
      <el-tooltip class="tip-item" effect="dark" content="Reset" placement="top-start">
        <el-image :src="getImageUrl('track/reset.png')" class="ml20 playControlImage"
                  @click="resetAnimation"
        />
      </el-tooltip>
      <el-tooltip class="tip-item" effect="dark" content="Accelerate" placement="top-start">
        <el-image :src="mapTools.forward" class="ml20 playControlImage"
                  @click="speedAccelerate"/>
      </el-tooltip>
      <div style="color: whitesmoke;font-size: 23px;" title="Double speed">x{{ doubleSpeed }}</div>
      <el-tooltip class="tip-item" effect="dark" content="Progress" placement="top-start">
        <input id="playProgress" type="range" min="0" max="100" :value="playProgress" disabled
               class="ml20"/>
      </el-tooltip>
      <div style="color: whitesmoke;font-size: 17px;">{{ playProgress }}%</div>
    </div>
    <div class="maptool earthicon " style="" :class="{'active':mapTools.mapType}" @click="changeMap">
      <img :src="earthImg" style="width: 20px"/>
    </div>
    <div v-show="captureDataList" class="maptool formicon" :class="{'active':showForm}"
         @click="showForm=!showForm">
      <Fold style="color: #0d9bf2"/>
    </div>
    <el-collapse-transition>
      <div v-show="showForm && captureDataList.length>0" class="data-table-box">
        <el-timeline :hide-timestamp="true">
          <el-timeline-item placement="top" v-for="(item,index) in captureDataList" :key="index">
            <el-card :class="tableRowItemIndex===index?'informationChecked':'information'"
                     style="background: rgba(0,0,0,.4)"
                     @click="clickLocationDataCard(item,index)">
              <template #header>
                <span style="color: white;font-weight: bold">{{ item.dateTime }}</span>
              </template>
              <el-image :src="imageShow(item.captureImage)"/>
              <template #footer>
                <span style="color: white;font-weight: bold">{{ item.address }}</span>
              </template>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <div class="tableDiv">
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>


