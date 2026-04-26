<script setup lang="ts">
import {getAge, getInsightPerson} from "@/api/identity";
import {getCountryImage, getImageUrl} from "@/views/vehicle/components";
import {TabPaneName, TabsPaneContext} from "element-plus";
import {
  familyRelations,
  familyRelationsGraph,
  identityRecord,
  vehicleRecord
} from "./components";


defineOptions({name: 'IdentityInformation'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})


const mainLoading = ref(true);

const main = ref({
  idNo: "",
});
const mainTable = ref();
const tabName = ref("10");

const item = ref({});
const itemTable = ref();
const itemTbsName = ref("10");
const identityIds = ref([]);
const identityPhotoHost = ref("https://192.168.80.185:8443/person_img/");

const familyContent = ref({});
const showFamilyGrph = ref(false);

watch(() => props.content, (content) => {
  const loadingInstance = ElLoading.service()
  mainTable.value = content.idNo;
  loadingInstance.close();
})


const findInformation = async (idNo) => {
  const loadingInstance = ElLoading.service()
  mainLoading.value = true;
  var res = await getInsightPerson(encodeURIComponent(idNo));
  item.value = res;
  itemTable.value = "10";
  mainTable.value = idNo;
  loadingInstance.close();
  mainLoading.value = false;
}

const changeChannel = (tab: TabsPaneContext) => {
  findInformation(tab.paneName)
}

const reQueryPersonInformation = (idNo: string) => {
  if (idNo === main.value.idNo) {
    findInformation(idNo)
    return;
  }
  const filter = identityIds.value.filter((item) => item === idNo);
  if (filter.length > 0) {
    findInformation(idNo)
    return;
  }
  findInformation(idNo)
  identityIds.value.push(idNo);
}

const openFamilyGraph = (item) => {
  showFamilyGrph.value = true;
  familyContent.value = item;
}

const editTabs = (targetName: TabPaneName | undefined, action: 'remove') => {
  if (action === "remove") {
    const filter = identityIds.value.filter((item) => item !== targetName);
    identityIds.value = filter;
    if (filter.length === 0) {
      mainTable.value = main.value.idNo;
    } else if (filter.length === 1) {
      findInformation(filter.at(0))
    } else if (filter.length > 1) {
      findInformation(filter.at(filter.length - 1))
    }
  }
}

const init = async (object) => {
  const loadingInstance = ElLoading.service()
  try {
    var res = await getInsightPerson(encodeURIComponent(object.idNo));
    main.value = res;
    if (main) {
      mainTable.value = main.value.idNo;
    }
    tabName.value = "10";
    if (object.tabName) {
      tabName.value = object.tabName;
    }
  } catch (e) {
  } finally {
    mainLoading.value = false;
    loadingInstance.close();
  }
}

onMounted(() => {
  init(props.content)
})

</script>
<style scoped lang="scss">
:deep(.el-carousel__indicators) {
  display: none;
}

.identity-information-empty {
  height: 75vh;

  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .image {
      width: 16%;
    }

    .text {
      color: #869abb;
      font-size: 30px;
    }
  }
}

.slot-label {
  display: flex;
  margin-left: -20px;
  align-items: baseline;

  .tab-delete-icon {
    color: red;
    font-size: 18px;
    margin-left: 10px;
    cursor: pointer;
  }

  .tab-delete-icon:hover {
    color: darkorange;
  }
}

.user-profile-tips {
  position: absolute;
  top: 0;
  right: 5px;
  cursor: pointer;
  width: 35px;
  border: transparent 2px solid;
}

.user-profile-tips:hover {
  transition: 0.8s;
}

.el-descriptions-item__label.is-bordered-label {
  font-weight: 700;
  color: #000000 !important;
  background: #fafafa !important;
}

.el-tabs__content {
  padding: 0 !important;
}

::v-deep.el-tabs__content {
  padding: 5px !important;
}


.information-tabs {
  .el-tabs__header {
    margin: 0 !important;
  }

  .el-tabs__header .el-tabs__item.is-active {
    background: #f8f8f9;
    //color: #0d9bf2 !important;
    border-right-color: #f8f8f9;
    border-bottom-color: #DCDFE6;
    border-left-color: #DCDFE6;
  }

  .el-tabs__header .el-tabs__item {
    color: #000000;
  }

}

.informationCardTabs {
  .el-tabs__header {
    margin: 0 !important;
  }

  .el-tabs__header .el-tabs__item.is-active {
    background: #409EFF !important;
    color: white !important;
    border-right-color: #f8f8f9;
    border-bottom-color: #DCDFE6;
    border-left-color: #DCDFE6;
  }

  .el-tabs__header .el-tabs__item {
    color: #000000;
  }

  .el-tabs__nav {
    /* white-space: nowrap; */
    position: relative;
    transition: transform .3s;
    float: left;
    z-index: 2;
  }
}

.changedCardTabs {
  .el-tabs__header .el-tabs__item.is-active {
    background: #409EFF !important;
    color: white !important;
    border-right-color: #f8f8f9;
    border-bottom-color: #DCDFE6;
    border-left-color: #DCDFE6;
  }

}

.information {
  margin: 2px 2px 2px 5px;
  display: flex;

  .el-descriptions__header {
    margin-bottom: 5px;
  }
}

.new_photo_tip {
  position: absolute;
  z-index: 11;
  right: 0;
  width: 50px
}

.el-carousel__indicator--horizontal {
  display: none;
}


.el-carousel__arrow--left {
  left: 2px;
}

:deep(.el-carousel__container ) {
  position: relative;
  height: 240px;
}

.el-carousel__arrow--right {
  right: 2px;
}

.el-carousel__arrow {
  display: block;
  border: none;
  outline: 0;
  padding: 0;
  margin: 0;
  height: 26px;
  width: 26px;
  cursor: pointer;
  transition: .3s;
  border-radius: 50%;
  //background-color: #d5d5d5;
  background-color: rgba(31, 45, 61, .11);
  color: dodgerblue;
  position: absolute;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
  text-align: center;
  font-size: 22px;
}

.top {
  display: flex;
  align-items: flex-end;
}

.el-tabs--border-card {
  margin: 0 !important;
}
</style>
<template>
  <el-tabs v-model="mainTable" type="card"
           v-loading="mainLoading"
           :class="identityIds && identityIds.length>0?'informationCardTabs':'information-tabs'"
           closable
           @edit="editTabs"
           @tab-click="changeChannel" id="drag-tab">
    <el-tab-pane :name="main.idNo" :label="main.idNo">
      <div class="information">
        <el-carousel v-if="main.avatars && main.avatars.length>1 " style="width: 9%;"
                     :autoplay="false" arrow="always">
          <el-carousel-item v-for="(o,key) in main.avatars" :key="key">
            <img :src="getImageUrl('new_right.svg')" v-if="key===0"
                 class="new_photo_tip"
                 title="New ID Photo"/>
            <el-image :src="identityPhotoHost+o" class="row-col-avatar box-shadow-radius"
                      preview-teleported="true"
                      hide-on-click-modal="true"
                      :preview-src-list="[identityPhotoHost+o]"/>
          </el-carousel-item>
        </el-carousel>
        <el-image v-else :src="identityPhotoHost+main.avatar"
                  preview-teleported="true"
                  hide-on-click-modal="true"
                  class="row-col-avatar box-shadow-radius" style="width: 9%;height: 220px"
                  :preview-src-list="[identityPhotoHost+main.avatar]">
          <template #error>
            <el-image src="default_face.png" style="width: 200px;"/>
          </template>
        </el-image>
        <el-descriptions :column="4" title="Basic Information" style="width: 90%;margin-left: 10px;"

                         border>
          <el-descriptions-item label="Identity No.">{{ main.idNo }}</el-descriptions-item>
          <el-descriptions-item label="Name En">
            {{ main.englishName }}
          </el-descriptions-item>
          <el-descriptions-item label="Name Ar">
            {{ main.arabicName }}
          </el-descriptions-item>
          <el-descriptions-item label="Nationality">
            <el-image :src="getCountryImage(main.country)" style="width: 30px"
                      :title="main.country"/>

          </el-descriptions-item>
          <el-descriptions-item label="Gender">{{ main.gender }}</el-descriptions-item>
          <el-descriptions-item label="Date of Birth">{{ main.birthDate }}</el-descriptions-item>
          <el-descriptions-item label="Age" v-if="main && main.isDead==='Yes'">
            <span style="color: red">{{ getAge(main) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Age" v-if="main && main.isDead==='No'">{{
              getAge(main)
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Deceased">
            <div :style="main && main.isDead==='Yes'?'color:red':''"
                 style="display: flex;align-items: center;">
              <span>{{ main.isDead }}</span>
              <span v-show="main && main.isDead==='Yes'" class="el-icon-info"
                    :title="'Date of Death: '+main.dateOfDeath"
                    style="cursor: pointer;margin-left: 5px"></span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="Martial Status">{{
              main.martialStatus
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Education">{{ main.education }}</el-descriptions-item>
          <el-descriptions-item label="Occupation">{{ main.occupation }}</el-descriptions-item>
          <el-descriptions-item label="Occupation Ar">{{
              main.occupationArabic
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Employment Status">{{
              main.employmentStatus
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Address">{{ main.address }}</el-descriptions-item>
        </el-descriptions>
        <el-image @click="openFamilyGraph(main)"
                  title="Family Relationships" :src="getImageUrl('family_icon.svg')"
                  style="width: 35px;height: 32px;margin-right: 65px;"
                  class="user-profile-tips"/>
      </div>
      <el-tabs type="card" style="margin: 10px" class="changedCardTabs" v-model="tabName">
        <el-tab-pane label="Identity" name="10">
          <identityRecord style="margin: 0;height: 51vh" :content="main"
                          v-if="tabName==='10'"/>
        </el-tab-pane>
        <el-tab-pane label="Family Relations" name="30">
          <familyRelations style="margin: 0;height: 51vh" :content="main"
                           v-if="tabName==='30'"
                           :reQueryPersonInformation="reQueryPersonInformation"/>
        </el-tab-pane>

        <el-tab-pane label="Vehicle" name="50">
          <vehicleRecord style="margin: 0;height: 51vh" :content="main"
                         v-if="tabName==='50'"
                         :reQueryPersonInformation="reQueryPersonInformation"/>
        </el-tab-pane>
<!--        <el-tab-pane label="Phone Number" name="60">-->
<!--          <phoneNumberRecord style="margin: 0;height: 51vh" :content="main"-->
<!--                             v-if="tabName==='60'"-->
<!--                             :reQueryPersonInformation="reQueryPersonInformation"/>-->
<!--        </el-tab-pane>-->
      </el-tabs>
    </el-tab-pane>

    <el-tab-pane v-for="(o,index) in identityIds"
                 :key="index"
                 :label="o"
                 :name="o">
      <div class="information">
        <el-carousel v-if="item.avatars && item.avatars.length>1 " style="width: 9%;"
                     :autoplay="false" arrow="always">
          <el-carousel-item v-for="(o,key) in item.avatars" :key="key">
            <img :src="getImageUrl('new_right.svg')" v-if="key===0"
                 class="new_photo_tip"
                 title="New ID Photo"/>
            <el-image :src="identityPhotoHost+o" class="row-col-avatar box-shadow-radius"
                      preview-teleported="true"
                      hide-on-click-modal="true"
                      :preview-src-list="[identityPhotoHost+o]"/>
          </el-carousel-item>
        </el-carousel>
        <el-image v-else :src="identityPhotoHost+item.avatar"
                  class="row-col-avatar box-shadow-radius" style="width: 9%;height: 220px"
                  preview-teleported="true"
                  hide-on-click-modal="true"
                  :preview-src-list="[identityPhotoHost+item.avatar]">
          <template #error>
            <el-image src="default_face.png" style="width: 200px;"/>
          </template>
        </el-image>
        <el-descriptions :column="4" title="Basic Information" style="width: 90%;margin-left: 10px;"
                         direction="vertical"
                         border>
          <el-descriptions-item label="Identity No.">{{ item.idNo }}</el-descriptions-item>
          <el-descriptions-item label="Name En">
            {{ item.englishName }}
          </el-descriptions-item>
          <el-descriptions-item label="Name Ar">
            {{ item.arabicName }}
          </el-descriptions-item>
          <el-descriptions-item label="Nationality">
            <el-image :src="getCountryImage(item.country)" style="width: 30px"
                      :title="item.country"/>

          </el-descriptions-item>
          <el-descriptions-item label="Gender">{{ item.gender }}</el-descriptions-item>
          <el-descriptions-item label="Date of Birth">{{ item.birthDate }}</el-descriptions-item>
          <el-descriptions-item label="Age" v-if="item && item.isDead==='Yes'">
            <span style="color: red">{{ getAge(item) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Age" v-if="item && item.isDead==='No'">{{
              getAge(item)
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Deceased">
            <div :style="item && item.isDead==='Yes'?'color:red':''"
                 style="display: flex;align-items: center;">
              <span>{{ item.isDead }}</span>
              <span v-show="item && item.isDead==='Yes'" class="el-icon-info"
                    :title="'Date of Death: '+item.dateOfDeath"
                    style="cursor: pointer;margin-left: 5px"></span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="Martial Status">{{
              item.martialStatus
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Education">{{ item.education }}</el-descriptions-item>
          <el-descriptions-item label="Occupation">{{ item.occupation }}</el-descriptions-item>
          <el-descriptions-item label="Occupation Ar">{{
              item.occupationArabic
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Employment Status">{{
              item.employmentStatus
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Address">{{ item.address }}</el-descriptions-item>
        </el-descriptions>
        <el-image @click="openFamilyGraph(item)"
                  title="Family Relationships" :src="getImageUrl('family_icon.svg')"
                  style="width: 35px;height: 32px;margin-right: 65px;"
                  class="user-profile-tips"/>
      </div>
      <el-tabs type="card" style="margin: 10px" class="changedCardTabs" v-model="itemTbsName">
        <el-tab-pane label="Identity" name="10">
          <identityRecord style="margin: 0;height: 51vh" :content="item"
                          v-if="itemTbsName==='10'"/>
        </el-tab-pane>
        <el-tab-pane label="Family Relations" name="30">
          <familyRelations style="margin: 0;height: 51vh" :content="item"
                           v-if="itemTbsName==='30'"
                           :reQueryPersonInformation="reQueryPersonInformation"/>
        </el-tab-pane>

        <el-tab-pane label="Vehicle" name="50">
          <vehicleRecord style="margin: 0;height: 51vh" :content="item"
                         v-if="itemTbsName==='50'"
                         :reQueryPersonInformation="reQueryPersonInformation"/>
        </el-tab-pane>
<!--        <el-tab-pane label="Phone Number" name="60">-->
<!--          <phoneNumberRecord style="margin: 0;height: 51vh" :content="item"-->
<!--                             v-if="itemTbsName==='60'"-->
<!--                             :reQueryPersonInformation="reQueryPersonInformation"/>-->
<!--        </el-tab-pane>-->
      </el-tabs>
    </el-tab-pane>
  </el-tabs>
  <el-dialog
    fullscreen
    draggable
    append-to-body
    v-model="showFamilyGrph"
    @close="showFamilyGrph = false"
    v-if="showFamilyGrph">
    <div v-if="showFamilyGrph" style="width: 100%;">
      <familyRelationsGraph :content="familyContent" v-if="showFamilyGrph"
                            style="height: 92vh"/>
    </div>
  </el-dialog>
</template>
