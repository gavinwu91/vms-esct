<script setup lang="ts">
import "ol/ol.css";
import {Map, View, Feature, Overlay} from "ol";
import {Vector as VectorLayer} from "ol/layer";
import {XYZ, Vector as VectorSource} from "ol/source";
import {Point, LineString} from "ol/geom.js";
import {Icon, Fill, Stroke, Style, Circle} from "ol/style";
import TileLayer from "ol/layer/Tile";
import {getVectorContext} from "ol/render";
import {imageShow} from "@/views/vehicle/components/index";

defineOptions({name: 'VehicleLocation'})
const props = defineProps({
  outerQuery: {
    type: Object,
    default: () => {
    },
  }
})

const mapTools = reactive({
  playTipContent: "Play",
  // mapPlayButtonImage: require("../image/track/play.png"),
  mapType: false,
})

let result = reactive({})
let map = reactive({})
let route = reactive<LineString>({})
const path = reactive([]);
let vectorLayer = reactive({});
let captureType = ref('');
const styles = reactive({
  //谷歌卫星地图线的样式
  route: new Style({
    stroke: new Stroke({
      width: 4,
      color: [237, 212, 0, 0.8],
      // color: [232, 212, 0, 0.8]
    }),
  }),
  //谷歌动画地图线的样式
  routeGoogleMap: new Style({
    stroke: new Stroke({
      width: 4,
      color: [255, 0, 0],
    }),
  }),
  startIcon: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      // src: "https://openlayers.org/en/v4.6.5/examples/data/icon.png",
      // src: require("img/point.svg"),
      src: '/img/point.svg',
      scale: 1, //设置大小
    }),
  }),

  endIcon: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      // src: "https://openlayers.org/en/v4.6.5/examples/data/icon.png",
      src: '/img/007.gif',
      scale: 1, //设置大小
    }),
  }),
  //普通点位的样式
  usePoint: new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: '#FF0000'
      }),
    })

  }),
  //移动点的样式
  featureMove: new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({
        color: "#0000FF",
      }),
      stroke: new Stroke({
        color: "white",
        width: 3,
      }),
    }),
  }),
})

const init = () => {
  let outerQuery = props.outerQuery;
  if (!outerQuery.source) {
    return;
  }
  let val = outerQuery.source;
  var car = outerQuery.source;
  let source = outerQuery.source;
  captureType = outerQuery.captureType;
  if (captureType.value == '10' || captureType.value == '30') {
    result = {
      code: source.deviceName,
      dateTime: source.captureTime,
      captureImage: source.captureUrl,
      lon: parseFloat(source.lon),
      lat: parseFloat(val.lat),
      location: source.position,
      score: source.score
    }
  } else {
    result = {
      code: source.licenseCode,
      dateTime: source.captureTime,
      captureImage: imageShow(source.imgPath2),
      lon: parseFloat(source.longnum),
      lat: parseFloat(val.latnum),
      location: source.location,
      speed: source.speed,
    }
  }
  path.push([parseFloat(result.lon), parseFloat(result.lat)])
}

let overlay = reactive({});

const initMap = () => {
  const elementMap = document.getElementById("map");
  if (elementMap) {
    elementMap.innerHTML = ""
  }
  map = getMap();
  //todo 初始化点和线
  const vectorSource = new VectorSource();
  route = new LineString(path)
  const pointGeometry = new Point(path[0]);
  const pointFeature = new Feature({
    geometry: pointGeometry,
    type: "usePoint"
  });
  vectorSource.addFeature(pointFeature);
  //todo 给每个点位添加样式
  vectorLayer = new VectorLayer({
    source: vectorSource,
    style: (feature) => {
      return styles[feature.get("type")];
    },
  });
  overlay = new Overlay({
    element: document.createElement('div'),
    positioning: 'bottom-center',
  });
  featurePostRender(pointFeature)
  overlayProfile(route.getFirstCoordinate())
  map.addLayer(vectorLayer);
  map.getView().setCenter(route.getFirstCoordinate());
  map.getView().setZoom(10)
}

const overlayProfile = (currentCoordinate) => {
  if (captureType.value == '10') {
    // overlay.getElement().innerHTML = buildFaceHtml();
    overlay.getElement().id = "pointFaceProfileDiv";
  } else if (captureType.value == '30') {
    // overlay.getElement().innerHTML = buildPointHtml();
    overlay.getElement().id = "pointProfileDiv2";
  } else {
    overlay.getElement().innerHTML = buildVehicleHtml();
    overlay.getElement().id = "pointProfileDiv";
  }
  overlay.setPosition(currentCoordinate);
  map.addOverlay(overlay);
}

const featurePostRender = (pointFeature) => {
  // 关键的地方在此：监听postrender事件，在里面重新设置circle的样式
  let radius = 0;
  vectorLayer.on("postrender", (e) => {
    if (radius >= 20) radius = 0;
    let opacity = (20 - radius) * (1 / 20); //不透明度
    let pointStyle = new Style({
      image: new Circle({
        radius: radius,
        stroke: new Stroke({
          color: "rgba(255,0,0" + opacity + ")",
          width: 2 - radius / 10, //设置宽度
        }),
      }),
    });
    // 获取矢量要素上下文
    let vectorContext = getVectorContext(e);
    vectorContext.setStyle(pointStyle);
    vectorContext.drawGeometry(pointFeature.getGeometry());
    radius = radius + 0.4; //调整闪烁速度
    //请求地图渲染（在下一个动画帧处）
    map.render();
  });
}
const buildVehicleHtml = () => {
  // const carIcon = require('../image/track/car.png');
  const carIcon = "";
  let content = '<div style="margin-top: 5px"><img style="width: 180px;height: 110px" src= "' + result.captureImage + '"/></div>';
  content = content + '<div>';
  content = content + '<div style="margin-top: 5px;display: flex;align-items: center;">';
  content = content + '<img src="' + carIcon + '" class="box-shadow-radius" style="width: 20px;margin: 0px 3px 0px 0px">';
  content = content + '<span   style="font-weight: bold;color: #2d8cf0">' + result.code + '</span></div>';
  content = content + '</div>';
  content = content + '<div style="    width: 270px;\n' +
    '    display: flex;\n' +
    '    flex-wrap: nowrap;\n' +
    '    font-family: unset;\n' +
    '    font-size: 0.75rem;\n' +
    '    flex-direction: column;\n' +
    '    align-items: center;">';
  content = content + '<div><i class="el-icon-location-information" >&nbsp;' + result.location + '</i></div>';
  content = content + '<div><i class="el-icon-time" >&nbsp;' + result.dateTime + '</i></div>';
  if (result.speed) {
    content = content + '  <div class="mapProfileCompareScore"><div class="scoreDiv"><span class="score-num">' + result.speed + '<i class="unit">&nbsp;km</i></span></div></div>'
  }
  content = content + '</div>'
  return content;
}


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
onMounted(() => {
  init();
  initMap();
})

</script>
<style lang="scss">
#map {
  width: 100%;
  height: 100%;
}

#pointProfileDiv {
  width: 185px;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  opacity: 0.75;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  flex-direction: column;
  align-content: center;
  align-items: center;
  border-radius: 4px;
  //box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  box-shadow: var(--el-box-shadow);
  position: relative;

  .mapProfileCompareScore {
    //background: url('../../assets/image/insight/red_back3.795b0.svg') no-repeat;
    background: url('../../../../public/insight/red_back3.795b0.svg') no-repeat;
    background-size: 100% 100%;
    position: absolute;
    color: white;
    width: 88px;
    bottom: 58px;

    .scoreDiv {
      //background: url('../../assets/image/insight/red_back2.850b4.svg') no-repeat;
      background: url('../../../../public/insight/red_back2.850b4.svg') no-repeat;
      background-size: 100% 100%;
      width: 95px;
      height: 90%;
      font-size: 0.5rem;
      position: relative;
      text-align: center;

      .unit {
        font-size: 16px;
      }
    }
  }
}

#pointProfileDiv2 {
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

#pointFaceProfileDiv {
  position: relative;
  width: 200px;
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

  .mapProfileCompareScore {
    background: url('../../../../public/insight/red_back3.795b0.svg') no-repeat;
    background-size: 100% 100%;
    position: absolute;
    color: white;
    width: 88px;
    bottom: 58px;

    .scoreDiv {
      background: url('../../../../public/insight/red_back2.850b4.svg') no-repeat;
      background-size: 100% 100%;
      width: 95px;
      height: 90%;
      font-size: 18px;
      position: relative;
      text-align: center;
    }
  }
}
</style>
<style lang="scss">

.vehicle_location_map {
  width: 100%;
  height: 100%;

  .ol-zoom {
    top: 0.5em;
    left: calc(100% - 2.375em);
  }

  .ol-zoom-in {
    cursor: pointer;
  }

  .ol-zoom-out {
    cursor: pointer;
  }
}

</style>
<style type="text/scss" scoped>
.active {
  border: 1px solid #666666;
  background-color: orange;
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
}

.maptool_view_time {
  position: absolute;
  background-color: #fff;
  z-index: 999;
  top: 2px;
  right: 15px;

  width: 22px;
  height: 20px;
  border-radius: 0 0 2px 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  color: #666666;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.maptool:hover {
  border: 1px solid #666666;
}

.earthicon {
  top: 55px;
  width: 20px;
}

.main {
  width: 100%;
  height: 800px;
  position: relative;

  .tools {
    position: absolute;
    display: flex;
    /*width: 600px;*/
    align-items: center;
    padding: 0 10px;
    left: 27%;
    top: 90%;
    bottom: 0;
    height: 55px;
    border-radius: 4px;
    background-color: rgba(0, 60, 136, 0.5);
    justify-content: flex-start;
    flex-wrap: wrap;
    flex-direction: row;

    .ml60 {
      margin-left: 60px;
    }

    .tip-item {
      margin: 4px;
    }

    #speed {
      width: 450px;
      height: 40px;
    }
  }

  #map {
    width: 100%;
    height: 100%;
  }


}
</style>
<template>
  <div style=" width: 100%;height: 800px;">
    <div id="map" class="vehicle_location_map"></div>
    <div class="maptool earthicon " :class="{'maptool_view_time':outerQuery.cls2}"
         @click="changeMap">
      <el-image :src="earthImg" :class="{'active':mapTools.mapType}"/>
    </div>
  </div>
</template>
