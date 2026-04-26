<script setup lang="ts">
import {checkImgUrl, details, getBrandLogo, getBrandPngLogo} from "@/api/vehicle_db";
import {getCountryImage, getImageUrl} from "@/views/vehicle/components";
import VehicleDatabaseDetailRecord from "@/views/vehicle_db/components/record.vue";
import IdentityInformation from "@/views/identity/index.vue";
import FamilyRelationsGraph from "@/views/identity/components/familyGraph.vue";

defineOptions({name: 'VehicleDatabaseDetail'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})

const loading = ref(true);
const obj = ref({});


watch(() => props.content, (newData) => {
  if (newData) {
    findInformation(newData)
  }
})

const findSuccess = ref(false);
const findInformation = async (query: any) => {
  loading.value = true;
  try {
    if (query) {
      obj.value = await details(JSON.stringify(query));
    } else {
      obj.value = {};
    }

  } catch (e) {

  } finally {
    loading.value = false;
  }
  findSuccess.value = true;
}


onMounted(async () => {
  console.log(props.content)
  await findInformation(props.content)
})

const informationQuery = ref({});
const showIdentityInformation = ref(false);
const goProfilePage = (idNo) => {
  informationQuery.value.idNo = idNo;
  informationQuery.value.sessionId = props.content.JSESSIONID;
  showIdentityInformation.value = true;
}


const familyContent = ref({});
const showFamilyGrph = ref(false);
const openFamilyGraph = (item) => {
  showFamilyGrph.value = true;
  familyContent.value = item;
}

</script>
<style scoped lang="scss">
.data-sta-box2 {
  position: absolute;
  cursor: pointer;
  top: 0;
  right: 6px;
  height: 102px;
  width: 88px;
  z-index: 99999;
}

.basic-information {
  display: flex;
  margin-top: 10px;
  align-items: center;
  justify-content: flex-start;
}
:deep(.el-tabs__item) {
  font-weight: unset;
  font-size: 0.75rem !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  font-size: 0.75rem !important;
}
</style>
<template>
  <el-tabs tab-position="top" type="card">
    <el-tab-pane label="Basic Information">
      <div v-loading="loading">
        <el-image class="data-sta-box2" v-if="obj.englishRegistrationStatus ==='Expired'"
                  title="Expired"
                  :src="getImageUrl('expired_ci.svg')"/>
        <div style="" class="basic-information"
             v-if="obj.identityType!=='Organization'">
          <el-image style="width: 310px;height: 300px;margin-top: 35px"
                    :src="'https://192.168.80.185:8443/person_img/'+obj.avatar"
                    preview-teleported="true"
                    hide-on-click-modal="true"
                    :preview-src-list="['https://192.168.80.185:8443/person_img/'+obj.avatar]">
            <template #error>
              <el-image :src="getImageUrl('default_face.png')" style="width: 200px;"/>
            </template>
          </el-image>
          <el-descriptions title="Registration Information" :column="2" border
                           style="margin-top: 10px;margin-left:10px;width: 100%">
            <el-descriptions-item label="Identity No.">
              <div v-if="obj.idNo" style="display: flex;align-items:flex-end">
                <el-link type="primary" @click="goProfilePage(obj.idNo)">{{ obj.idNo }}
                </el-link>
                <el-image :src="getImageUrl('family_icon.svg')" style="width: 30px;cursor: pointer"
                          @click="openFamilyGraph(obj)" title="Family Relationship"/>
              </div>
              <span v-else>{{ obj.idNo }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Identity Type">{{
                obj.identityType
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Name En" v-if="obj.idNo">
              <div style="display: flex">
                <el-link v-if="obj.idNo" type="primary" @click="goProfilePage(obj.idNo)">
                  {{ obj.englishFullName }}
                </el-link>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="Name En" v-else>{{
                obj.englishFullName
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Name Ar" v-if="obj.idNo">
              <el-link type="primary" @click="goProfilePage(obj.idNo)">
                {{ obj.arabicOwnerName }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="Name Ar" v-else>{{
                obj.arabicOwnerName
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Passport">{{ obj.passport }}</el-descriptions-item>
            <el-descriptions-item label="Nationality">
              <el-image :src="getCountryImage(obj.nationalityEnglish)" style="width: 30px;"
                        :title="obj.nationalityEnglish">
                <template #error>
                  <el-icon>
                    <icon-picture/>
                  </el-icon>
                </template>
              </el-image>
            </el-descriptions-item>
            <el-descriptions-item label="Date Of Birth">{{ obj.dob }}</el-descriptions-item>
            <el-descriptions-item label="PO Box" v-if="obj.address">{{
                obj.address.poBox
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Postal Code" v-if="obj.address">{{
                obj.address.postalCode
              }}
            </el-descriptions-item>
            <el-descriptions-item label="City" v-if="obj.address">{{
                obj.address.city
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Town" v-if="obj.address">{{
                obj.address.town
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Wilayat" v-if="obj.address">{{
                obj.address.wilayat
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Block Number" v-if="obj.address">{{
                obj.address.blockNumber
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <!--企业信息展示-->
        <el-descriptions title="Registration Information" :column="2" border v-else
                         style="margin-top: 10px;">
          <el-descriptions-item label="Identity Type">{{ obj.identityType }}</el-descriptions-item>
          <el-descriptions-item label="Name En">{{ obj.englishFullName }}</el-descriptions-item>
          <el-descriptions-item label="Name Ar">{{ obj.arabicOwnerName }}</el-descriptions-item>
          <el-descriptions-item label="Country">
            <el-image v-if="obj.nationalityEnglish!=='Unknown'"
                      :src="getCountryImage(obj.nationalityEnglish)"
                      style="width: 40px;height: 30px"
                      :title="obj.nationalityEnglish">
              <template #error>
                <el-icon>
                  <icon-picture/>
                </el-icon>
              </template>
            </el-image>
            <span v-else>{{ obj.nationalityEnglish }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="PO Box">{{ obj.address.poBox }}</el-descriptions-item>
          <el-descriptions-item label="Postal Code">{{
              obj.address.postalCode
            }}
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="Vehicle Information" :column="3" border style="margin-top: 20px"
                         direction="vertical">
          <el-descriptions-item label="Vehicle No.">
            <div v-if="from==='10'" class="search_box">
              <el-select
                style="width: 180px"
                v-loading="plateCodeLoading"
                v-model="plateCode"
                remote
                filterable
                clearable
                :remote-method="searchPlateCodeNumber">
                <el-option v-for="(o,index) in plateCodeList"
                           :key="index"
                           :value="o.plateCodeNumberEnglish"
                           label="">{{ o.plateCodeNumberEnglish + ' - ' + o.vehicleMakerEnglish }}
                </el-option>
              </el-select>
              <span class="el-icon-success" title="Search" @click="searchNewCode"></span>
            </div>
            <span v-else>{{ obj.plateCodeNumberEnglish }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Plate Type">{{ obj.plateTypeEnglish }}</el-descriptions-item>
          <el-descriptions-item label="Vehicle Brand">
            <div style="display: flex;align-items: center">
              <span style="padding: 5px">{{ obj.vehicleMakerEnglish }}</span>
              <el-image
                v-show="obj.vehicleMakerEnglish && obj.vehicleMakerEnglish!==''"
                style="width: 35px;cursor: pointer"
                :title="obj.vehicleMakerEnglish"
                v-if="checkImgUrl(getBrandLogo(obj))"
                :src="getBrandLogo(obj)">
                <template #error>
                  <el-icon>
                    <icon-picture/>
                  </el-icon>
                </template>
              </el-image>
              <el-image
                v-show="obj.vehicleMakerEnglish && obj.vehicleMakerEnglish!==''"
                style="width: 35px;cursor: pointer"
                :title="obj.vehicleMakerEnglish"
                v-if="checkImgUrl(getBrandPngLogo(obj))"
                :src="getBrandPngLogo(obj)">
                <template #error>
                  <el-icon>
                    <icon-picture/>
                  </el-icon>
                </template>
              </el-image>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="Vehicle Model">{{
              obj.vehicleModelEnglish
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Engine Number">{{ obj.engineNumber }}</el-descriptions-item>
          <el-descriptions-item label="Chassis Number">{{
              obj.chassisNumber
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Registration Mode">{{
              obj.registrationModeEnglish
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Registration Start">{{
              obj.registrationstartdateStr
            }}
          </el-descriptions-item>
          <el-descriptions-item label="Registration Expiry">{{
              obj.registrationexpirydateStr
            }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-empty v-if="!obj" image-size="300"/>
    </el-tab-pane>
    <el-tab-pane label="Changed Record">
      <VehicleDatabaseDetailRecord :content="obj" v-if="findSuccess" style="margin: 10px 0"/>
    </el-tab-pane>
  </el-tabs>


  <el-dialog
    width="95%"
    style="margin-top: 1px"
    draggable
    append-to-body
    v-model="showIdentityInformation"
    @close="showIdentityInformation=false"
    v-if="showIdentityInformation">
    <IdentityInformation :content="informationQuery" v-if="showIdentityInformation"/>
  </el-dialog>

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
