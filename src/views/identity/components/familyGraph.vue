<script lang="ts" setup>
import RelationGraph, {RelationGraphComponent, RGNode, RGOptions} from 'relation-graph-vue3';
import Graph from "graphology";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";
import {dataDiff, familyRelations, getFamilyGraph} from "@/api/identity";
import {getCountryImage} from "@/views/vehicle/components";
import {Opportunity} from "@element-plus/icons-vue";

defineOptions({name: 'familyRelationsGraph'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})
const graphOptions: RGOptions = {
  debug: false,
  allowShowMiniToolBar: false,
  defaultLineColor: 'var(--el-text-color-primary)',
  defaultNodeColor: 'var(--el-text-color-primary)',
  defaultLineWidth: 1,
  defaultLineShape: 1,
  placeSingleNode: false,//自动为孤点分配位置
  moveToCenterWhenRefresh: true,//
  zoomToFitWhenRefresh: true,//刷新后移动到可见区域
  layout: {
    layoutName: 'fixed',
    distance_coefficient: 0.3,
  },
  defaultNodeBorderWidth: 0,
  allowShowFullscreenMenu: false,
  allowShowZoomMenu: false,
  allowAutoLayoutIfSupport: false,
  allowShowRefreshButton: false,
  allowShowDownloadButton: false,
}

let tools = ref({
  leftTools: true,
  loading: true,
  dark: true,
  isShowCodePanel: false,
  nodeSize: 13,
  nodeId: "",
})
let graphRef = ref<RelationGraphComponent>()
const selectNodes = ref([]);
let relationsObject = ref({} as any);
const nodes = ref([] as any)
const lines = ref([] as any)
let nodeId = ref<string>();

const getInsightPerson = async (idNo) => {
  tools.value.loading = true;
  try {
    let res = await getFamilyGraph(idNo);
    if (!res) {
      ElMessage.warning({
        message: 'No Family Relationships Information',
        type: 'warning',
        showClose: true,
      });
      tools.value.loading = false;
      return;
    }
    // alert(nodes.value.length)
    let nodesItem = res.nodes;
    let linesItem = res.lines;
    relationsObject.value = nodesItem.filter((item) => item.idNo === idNo).at(0);

    if (lines.value.length > 0 || nodes.value.length > 0) {
      for (let i = 0; i < nodesItem.length; i++) {
        const element = nodesItem[i];
        for (let j = 0; j < nodes.length; j++) {
          if (nodes.value[j].id === element.idNo) {
            nodes.value.splice(j, 1)
          }
        }
      }

      for (let i = 0; i < linesItem.length; i++) {
        const lineId = linesItem[i].from_id + "_" + linesItem[i].to_id;
        for (let j = 0; j < lines.value.length; j++) {
          if (lines.value[j].id === lineId) {
            lines.value.splice(j, 1)
          }
        }
      }
    }

    for (let i = 0; i < nodesItem.length; i++) {
      let item = nodesItem[i];
      buildItem(item)
      nodes.value.push({
        id: item.idNo,
        data: {
          icon: item.avatar,
          data: item
        },
        color: "",
        text: item.idNo,
        innerHTML: '<div class="relationGraphDiy"><img class="f-graph-avatar" src="' + item.avatar + '" ></div> ',
        borderColor: "rgb(255, 255, 255)"
      });
    }
    for (let i = 0; i < linesItem.length; i++) {
      let item = linesItem[i];
      lines.value.push({
        id: item.from_id + "_" + item.to_id,
        from: item.from_id,
        to: item.to_id,
        text: familyRelations(item.relation),
        styleClass: "relation_line",
        fontSize: 26,
      });
    }

    let data = {};
    data['nodes'] = nodes.value;
    data['lines'] = lines.value;
    data['rootId'] = idNo;
    addSelectNodes(nodes.value);
    await useGraphologyLayout(data);
    nodeId.value = idNo;
    await focusNode();

  } finally {
    tools.value.loading = false;
  }

}
const addSelectNodes = (nodes) => {
  for (let i = 0; i < nodes.length; i++) {
    let item = nodes[i];
    let check = selectNodes.value.filter((i) => i.data.data.idNo === item.data.data.idNo);
    if (check.length > 0) {
      continue;
    }
    selectNodes.value.push(item)
  }
}
const useGraphologyLayout = async (data: any) => {
  if (!data) {
    return;
  }
  let __graph_json_data = data;
  const graph = new Graph();
  const graphInstance = graphRef.value!.getInstance();
  await graphInstance.setJsonData(__graph_json_data);
  graphInstance.getNodes().forEach(node => {
    graph.addNode(node.id, {
      text: node.text,
      width: node.el.offsetWidth,
      height: node.el.offsetHeight,
    });
  });
  graphInstance.getLinks().forEach(link => {
    link.relations.forEach((line) => {
      graph.addEdge(link.fromNode.id, link.toNode.id, {
        id: line.id, // 设置id，到会儿通过id找到jsonData中的line，设置line.data.points
        weight: 1  // 这是一个非常重要的参数，尝试设置为0或者1或者中间值查看效果
      });
    })
  });
  circular.assign(graph);
  forceAtlas2.assign(graph, data["nodes"].length);

  graph.nodes().forEach(nodeId => { // 拷贝布局结果到relation-graph对应的节点中
    const node = graph.getNodeAttributes(nodeId);
    console.log(nodeId,);
    const rgNode = graphInstance.getNodeById(nodeId);
    rgNode.x = node.x * 80; // 通过乘以一个变量，来调节节点之间的距离
    rgNode.y = node.y * 110;
  })
}
const onNodeClick = async (nodeObject) => {
  relationsObject.value = nodeObject.data.data;
  relationsObject.value.node = nodeObject;
  console.log('onNodeClick:', nodeObject);
}
const onLineClick = (lineObject, linkObject, $event) => {
  console.log('onLineClick:', lineObject);
}

const focusNode = async () => {
  if (!nodeId.value) {
    return;
  }
  const graphInstance = graphRef.value!.getInstance();
  const node: RGNode = graphInstance.getNodeById(nodeId);
  await onNodeClick(node)
  await graphInstance.focusNodeById(node.id)
}

const buildItem = (item) => {
  if (item.avatar) {
    item.avatar = 'https://192.168.80.185:8443/person_img' + item.avatar;
  } else {
    item.avatar = "img/default_avatar.webp"
  }
}

watch(() => props.content.idNo, (idNo) => {
  getInsightPerson(idNo)
})

onMounted(() => {
  getInsightPerson(props.content.idNo);
})

</script>
<style lang="scss">
.family-relations-graph {
  position: relative;

}

.family-relations-graph::-webkit-scrollbar {
  width: 10px;
}

.family-relations-graph::-webkit-scrollbar-track {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 10px;
}

.family-relations-graph::-webkit-scrollbar-thumb {
  background: #ded9d5;
  border-radius: 10px;
}

.family-relations-graph::-webkit-scrollbar-thumb:hover {
  background: rgb(100, 100, 100);
  border-radius: 10px;
}

.family-relations-graph::-webkit-scrollbar-thumb:active {
  background: rgb(68, 68, 68);
  border-radius: 10px;
}

.family-relations-graph {


  .graph {
    .rel-map {
      background-color: #2d2f36;
    }

    .c-rg-line-text {
      fill: #FFFFFF !important;
      font-size: 13px;
      margin-bottom: 3px;
    }
  }

  .graphLight {
    .rel-map {
      background-color: #b0b1b2;
    }

    .c-rg-line-text {
      fill: #FFFFFF !important;
      font-size: 13px;
      margin-bottom: 3px;
    }
  }


  background: #43484f;

  .relationGraphDiy {
    .f-graph-avatar {
      width: 80px;
      height: 80px;
      border-radius: 60%;
    }
  }

  .c-my-panel {
    width: 400px;
    position: absolute;
    left: 10px;
    top: 10px;
    border-radius: 10px;
    z-index: 800;
    background-color: #efefef;
    border: #eeeeee solid 1px;
    padding: 10px;

    .c-option-name {
      color: #666666;
      font-size: 14px;
      line-height: 40px;
      padding-left: 10px;
      padding-right: 10px;
    }

    .c-my-options {
      text-align: center;

      .c-my-option-item {
        text-align: left;
        color: #1da9f5;
        cursor: pointer;
        border-radius: 5px;
        padding-left: 10px;
        margin-top: 5px;
        line-height: 25px;

        &:hover {
          background-color: rgba(29, 169, 245, 0.2);
        }
      }
    }
  }
}


</style>

<style lang="scss">
.family-relations-graph {
  .graph_box_title {
    position: absolute;
    right: 105px;
    top: 8px;
    color: orangered;
    font-size: 20px;
    z-index: 1;
  }

  .el-icon-close {
    right: 7px;
    top: 5px;
    z-index: 2;
    position: absolute;
    font-size: 22px;
    cursor: pointer;
    color: #0d9bf2;
  }

  .el-icon-download:hover {
    color: red;
  }

  .el-icon-download {
    right: 60px;
    top: 6px;
    z-index: 2;
    position: absolute;
    font-size: 25px;
    cursor: pointer;
    color: mediumspringgreen;
  }

  .el-icon-more {
    margin-left: 20px;
    font-size: 25px;
    cursor: pointer;
    color: white;
  }

  .el-icon-close:hover {
    color: orangered;
  }

  .el-icon-more:hover {
    color: orangered;
  }

  .identityInformation {
    position: absolute;
    display: flex;
    flex-direction: column;
    right: 0;
    top: 30px;
    opacity: 0.9;
    padding: 10px 0 10px 0;
    align-items: stretch;
    width: 330px;
    margin: 10px;
    background: black;
    z-index: 9999;

    .row2 {
      display: flex;
      box-sizing: border-box;
      align-items: baseline;
      justify-content: space-between;

      .label {
        color: #fff;
        white-space: nowrap;
        width: 100px !important;
      }

      .detail_name {
        color: #fff;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
      }

      .detailInput {
        color: #FFFFFF;
        text-align: right;
      }

    }

  }

  .graph {
    height: 92vh;
    position: relative;
    display: flex;


    .leftToolsClose {
      cursor: pointer;
      position: absolute;
      bottom: 5px;
      right: 5px;
      font-size: 25px;
      color: #e4e4e4;
      font-weight: bold;
    }

    .leftToolsClose:hover {
      color: orangered;
      transform: 0.5m;
    }

    .leftTools {
      top: 10px;
      left: 10px;
      cursor: pointer;
      position: absolute;
      z-index: 99;
      color: #2f7fea;
      font-size: 20px
    }

    .leftTools:hover {
      color: orangered;
      transform: 0.5m;
    }


    .node-select {
      padding: 4px;
      position: absolute;
      left: 15px;
      top: 10px;
      z-index: 999;
      background-color: rgb(70 58 194);
      border-radius: 5px;
      font-size: 15px;
      color: rgb(255, 255, 255);

      .theme-box {
        width: 35px;
        height: 35px;
        border: 2px solid transparent;
        cursor: pointer;
      }

      .theme-box:hover {
        border: 2px solid #0d9bf2;
      }

      .filter {
        width: 330px;
        margin-left: 3px;
      }
    }

    .el-icon-close {
      right: 7px;
      top: 5px;
      z-index: 2;
      position: absolute;
      font-size: 22px;
      cursor: pointer;
      color: #0d9bf2;
    }

    .el-icon-download:hover {
      color: red;
    }

    .el-icon-download {
      right: 60px;
      top: 6px;
      z-index: 2;
      position: absolute;
      font-size: 25px;
      cursor: pointer;
      color: mediumspringgreen;
    }


    .el-icon-more {
      margin-left: 20px;
      font-size: 25px;
      cursor: pointer;
      color: white;
    }

    .el-icon-close:hover {
      color: orangered;
    }

    .el-icon-more:hover {
      color: orangered;
    }


    .el-checkbox__inner::after {
      box-sizing: content-box;
      content: "";
      border: 1px solid #FFF;
      border-left: 0;
      border-top: 0;
      height: 10px;
      left: 5px;
      position: absolute;
      top: 1px;
      transform: rotate(45deg) scaleY(0);
      width: 3px;
      transition: transform .15s ease-in .05s;
      transform-origin: center;
    }


    .el-checkbox__label {
      display: inline-block;
      padding-left: 5px;
      line-height: 18px;
    }

    .el-checkbox__inner {
      display: inline-block;
      position: relative;
      border: 1px solid #DCDFE6;
      border-radius: 2px;
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      background-color: #FFF;
      z-index: 1;
      transition: border-color .25s cubic-bezier(.71, -.46, .29, 1.46), background-color .25s cubic-bezier(.71, -.46, .29, 1.46);
    }

    .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: orangered;
      border-color: orangered;
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: orangered;
    }

    .tools {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 10px;
      right: 0;
      opacity: 0.75;
      width: 350px;
      align-items: center;
      z-index: 999;
    }


    .relationGraphDiyLight {
      background-size: 100%;
      height: 100%;
      width: 100%;
      overflow: visible;
      border-radius: 40px;
      background-position: center center;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .relationGraphDiy {
      background-size: 100%;
      height: 100%;
      width: 100%;
      overflow: visible;
      border-radius: 40px;
      background-position: center center;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .relationGraphDiy-information-light {
      width: 300px;
      margin-left: -130px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
      font-size: 13px;
      color: #43484f;
    }

    .relationGraphDiy-information {
      width: 300px;
      margin-left: -130px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
      font-size: 13px;
    }

    .user-information {
      //height: 200px;
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 10px;

      .avatar {
        margin: 5px 0px 0px 5px;
        width: 200px;
        height: 224px;
      }


    }

    .relation-title {
      position: absolute;
      right: 0;
      height: 25px;
      line-height: 15px;
      margin-top: 5px;
      font-size: 17px;
      width: 535px;
      color: orange;
      text-align: center;
      border-bottom: white 1px solid;
    }

    .relationGraphLight {
      //height: 550px !important;
      //border-radius: 30px;
      //box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      .rel-map {
        background-color: #DCDFE6;
      }

      .child-node {
        background-size: 100%;
        height: 57px;
        width: 55px;
        border-radius: 50px;
        margin: -2px;
        cursor: pointer;
      }

      .rel-node-shape-0 {
        width: 50px !important;
        height: 50px !important;
        //border-radius: 150px;
      }
    }


    .relationGraph {
      //height: 550px !important;
      //border-radius: 30px;
      //box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      width: 100%;
      height: 100%;

      .rel-map {
        background-color: #2d2f36;
      }

      .child-node {
        background-size: 100%;
        height: 57px;
        width: 55px;
        border-radius: 50px;
        margin: -2px;
        cursor: pointer;
      }

      .rel-node-shape-0 {
        width: 50px !important;
        height: 50px !important;
        //border-radius: 150px;
      }
    }
  }

  .graphLight {
    height: 92vh;
    position: relative;
    display: flex;


    .leftToolsClose {
      cursor: pointer;
      position: absolute;
      bottom: 5px;
      right: 5px;
      font-size: 25px;
      color: #e4e4e4;
      font-weight: bold;
    }

    .leftToolsClose:hover {
      color: #0d9bf2;
      transform: 0.5m;
    }

    .leftTools {
      top: 10px;
      left: 10px;
      cursor: pointer;
      position: absolute;
      z-index: 99;
      color: #2f7fea;
      font-size: 20px
    }

    .leftTools:hover {
      color: orangered;
      transform: 0.5m;
    }


    .node-select {
      padding: 4px;
      position: absolute;
      left: 15px;
      top: 10px;
      z-index: 999;
      background-color: rgb(103, 194, 58);
      border-radius: 5px;
      font-size: 15px;
      color: rgb(255, 255, 255);

      .theme-box {
        width: 35px;
        height: 35px;
        border: 2px solid transparent;
        cursor: pointer;
      }

      .theme-box:hover {
        border: 2px solid #0d9bf2;
      }

      .filter {
        width: 330px;
        margin-left: 3px;
      }
    }

    .el-icon-close {
      right: 7px;
      top: 5px;
      z-index: 2;
      position: absolute;
      font-size: 22px;
      cursor: pointer;
      color: #0d9bf2;
    }

    .el-icon-download:hover {
      color: red;
    }

    .el-icon-download {
      right: 60px;
      top: 6px;
      z-index: 2;
      position: absolute;
      font-size: 25px;
      cursor: pointer;
      color: mediumspringgreen;
    }

    .el-icon-more {
      margin-left: 20px;
      font-size: 25px;
      cursor: pointer;
      color: white;
    }

    .el-icon-close:hover {
      color: orangered;
    }

    .el-icon-more:hover {
      color: orangered;
    }


    .el-checkbox__inner::after {
      box-sizing: content-box;
      content: "";
      border: 1px solid #FFF;
      border-left: 0;
      border-top: 0;
      height: 10px;
      left: 5px;
      position: absolute;
      top: 1px;
      transform: rotate(45deg) scaleY(0);
      width: 3px;
      transition: transform .15s ease-in .05s;
      transform-origin: center;
    }


    .el-checkbox__label {
      display: inline-block;
      padding-left: 5px;
      line-height: 18px;
    }

    .el-checkbox__inner {
      display: inline-block;
      position: relative;
      border: 1px solid #DCDFE6;
      border-radius: 2px;
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      background-color: #FFF;
      z-index: 1;
      transition: border-color .25s cubic-bezier(.71, -.46, .29, 1.46), background-color .25s cubic-bezier(.71, -.46, .29, 1.46);
    }

    .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: orangered;
      border-color: orangered;
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: orangered;
    }

    .tools {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 10px;
      right: 0;
      opacity: 0.75;
      width: 350px;
      align-items: center;
      z-index: 999;
    }


    .relationGraphDiyLight {
      background-size: 100%;
      height: 100%;
      width: 100%;
      overflow: visible;
      border-radius: 40px;
      background-position: center center;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .relationGraphDiy {
      background-size: 100%;
      height: 100%;
      width: 100%;
      overflow: visible;
      border-radius: 40px;
      background-position: center center;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .relationGraphDiy-information-light {
      width: 300px;
      margin-left: -130px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
      font-size: 13px;
      color: #43484f;
    }

    .relationGraphDiy-information {
      width: 300px;
      margin-left: -130px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
      font-size: 13px;
    }

    .user-information {
      //height: 200px;
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 10px;

      .avatar {
        margin: 5px 0px 0px 5px;
        width: 200px;
        height: 224px;
      }


    }

    .relation-title {
      position: absolute;
      right: 0;
      height: 25px;
      line-height: 15px;
      margin-top: 5px;
      font-size: 17px;
      width: 535px;
      color: orange;
      text-align: center;
      border-bottom: white 1px solid;
    }

    .relationGraphLight {
      //height: 550px !important;
      //border-radius: 30px;
      //box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      .rel-map {
        background-color: #DCDFE6;
      }

      .child-node {
        background-size: 100%;
        height: 57px;
        width: 55px;
        border-radius: 50px;
        margin: -2px;
        cursor: pointer;
      }

      .rel-node-shape-0 {
        width: 50px !important;
        height: 50px !important;
        //border-radius: 150px;
      }
    }


    .relationGraph {
      //height: 550px !important;
      //border-radius: 30px;
      //box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      width: 100%;
      height: 100%;

      .rel-map {
        background-color: #2d2f36;
      }

      .child-node {
        background-size: 100%;
        height: 57px;
        width: 55px;
        border-radius: 50px;
        margin: -2px;
        cursor: pointer;
      }

      .rel-node-shape-0 {
        width: 50px !important;
        height: 50px !important;
        //border-radius: 150px;
      }
    }
  }

}

</style>
<template>
  <div class="family-relations-graph" v-loading="tools.loading" element-loading-text="Loading..."
       element-loading-background="#fff">
    <div style="height:calc(100vh);">
      <!--      <span class="el-icon-download" @click="download" title="download"-->
      <!--            style="font-size: 25px;cursor: pointer"></span>-->
      <div class="graph_box_title" title="Family Relationships" v-show="relationsObject">
        Family Relationships
      </div>
      <transition name="el-zoom-in-center" v-show="relationsObject">
        <div class="identityInformation box-shadow-radius" v-if="relationsObject">
          <span class="el-icon-close" title="close" @click="relationsObject=null"></span>
          <el-image :src="relationsObject.avatar" style="width: 125px;margin: 5px;"
                    :preview-src-list="[relationsObject.avatar]"/>
          <div style="margin: 6px;">
            <div class="row2" :title="relationsObject.country">
              <div class="label"></div>
              <div class="detail_name detailInput" style="display: flex;margin-bottom: 5px">
                <el-image :title="relationsObject.country"
                          :src="getCountryImage(relationsObject.country)" style="width: 30px"/>&nbsp;{{
                  relationsObject.country
                }}
              </div>
            </div>
            <div class="row2">
              <div class="label">Identity No.:</div>
              <div class="detail_name detailInput"> {{ relationsObject.idNo }}</div>
            </div>
            <div class="row2" :title="relationsObject.englishName">
              <div class="label">Name:</div>
              <div class="detail_name detailInput">{{ relationsObject.englishName }}</div>
            </div>
            <div class="row2">
              <div class="label">BirthDate:</div>
              <div class="detail_name detailInput"> {{ relationsObject.birthDate }}</div>
            </div>
            <div class="row2" v-if="relationsObject.isDead==='No'">
              <div class="label">Age:</div>
              <div class="detail_name detailInput">
                {{ +(dataDiff(relationsObject.birthDate, "") / 365).toFixed(0) }}
              </div>
            </div>
            <div class="row2">
              <div class="label">Passport No.:</div>
              <div class="detail_name detailInput"> {{ relationsObject.passportNo }}</div>
            </div>
            <div class="row2" v-if="relationsObject.gender">
              <div class="label">Gender:</div>
              <div class="detail_name detailInput">{{ relationsObject.gender }}</div>
            </div>
            <div class="row2" v-if="relationsObject.relation">
              <div class="label">Relation:</div>
              <div class="detail_name detailInput"
                   v-if="relationsObject.relation && !relationsObject.reasonOfEnd">
                {{ relationsObject.relation }}
              </div>
              <div class="detail_name detailInput"
                   v-if="relationsObject.relation && relationsObject.reasonOfEnd">
                {{ relationsObject.relation + '(' + relationsObject.reasonOfEnd + ')' }}
              </div>
            </div>
            <div style="display: flex;align-items: flex-end;">
              <el-button type="primary" style="margin-top: 10px;z-index: 999"
                         @click="getInsightPerson(relationsObject.idNo)">Expand
              </el-button>
            </div>
          </div>
        </div>
      </transition>
      <RelationGraph
        ref="graphRef"
        :class="tools.dark?'graph': 'graphLight'"
        :options="graphOptions"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick">
        <template #node="{node}">
          <div :class="tools.dark?'relationGraphDiy':'relationGraphDiyLight'"
               :style="{'background-image':'url('+node.data.icon+')'}"></div>
          <div
            :class="tools.dark?'relationGraphDiy-information':'relationGraphDiy-information-light'"
            :style="'font-size:'+tools.nodeSize+'px'">
            <span>{{ node.data.data.englishName }}</span>
            <span>{{ node.data.data.idNo }}</span>
            <span>{{ node.data.data.birthDate }}</span>
          </div>
        </template>
        <template #graph-plug>
          <div class="leftTools" title="Tools" v-show="!tools.leftTools"
               @click="tools.leftTools=true">
            <Opportunity/>
          </div>
          <transition name="el-zoom-in-center" v-show="tools.leftTools &&  relationsObject">
            <div class="node-select" v-show="tools.leftTools">
              <div>
                <span>Search Node:</span>
                <el-select class="filter" filterable clearable @change="focusNode" v-model="nodeId">
                  <el-option :key="index" v-for="(o,index) in selectNodes" :value="o.id"
                             :label="o.data.data.idNo +' - '+o.data.data.englishName">
                    <el-popover
                      trigger="hover"
                      placement="right"
                      transition="el-zoom-in-center">
                      <div style="display: flex;flex-direction: column;">
                        <el-image :src="o.data.data.avatar" style="width: 130px;margin: 5px;"/>
                        <el-button type="primary" style="margin: 5px;z-index: 999"
                                   @click="getInsightPerson(o.data.data.idNo)">Expand
                        </el-button>
                      </div>
                      <template #reference>
                        <div style="display: flex;align-items: stretch;">
                          <el-image :src="o.data.data.avatar"
                                    style="width: 30px;margin-right: 5px"/>
                          <el-image :src="getCountryImage(o.data.data.country)"
                                    style="width: 20px;margin-right: 5px"/>
                          <span>{{
                              o.data.data.idNo + '&nbsp;-&nbsp;' + o.data.data.englishName
                            }}</span>
                          <span
                            v-if="o.data.data.isDead==='No'">&nbsp;-&nbsp;{{
                              +(dataDiff(o.data.data.birthDate, "") / 365).toFixed(0)
                            }} </span>
                        </div>
                      </template>
                    </el-popover>
                  </el-option>
                </el-select>
              </div>
              <div style="margin: 10px 20px">
                <span>Font Size:&nbsp;</span>
                <el-input-number v-model="tools.nodeSize" :max="35"/>
              </div>
              <div style="margin: 11px 33px;display: flex; align-items: center;">
                <span>Background Theme:&nbsp;</span>
                <div class="theme-box" @click="tools.dark=true"
                     style="background-color: black"></div>
                <div class="theme-box" @click="tools.dark=false"
                     style="background-color: #DCDFE6"></div>
              </div>
              <div class="el-icon-remove leftToolsClose" title="hide"
                   @click="tools.leftTools=false"></div>
            </div>
          </transition>
        </template>
      </RelationGraph>
    </div>
  </div>
</template>

