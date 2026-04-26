<script setup lang="ts">
import {getCountryImage, getImageUrl} from "@/views/vehicle/components/index";
import {getUseResult} from "@/api/vehicle/index";
import IdentityInformation from "@/views/identity/index.vue";

defineOptions({name: 'VehicleUsedInformation'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})

let userList = ref([]);
let activeIndex = ref(0);
const tabPosition = ref<TbasInstance['tabPosition']>('left');


//open information
const informationQuery = ref({});
const showIdentityInformation = ref(false);
const goProfilePage = (idNo) => {
  informationQuery.value.idNo = idNo;
  informationQuery.value.sessionId = props.content.JSESSIONID;
  showIdentityInformation.value = true;
}

watch(() => props.content, (content) => {
  if (content) {
    init(content)
  }
})

const loading = ref(true);

const init = (data) => {
  loading.value = true;
  getUseResult({
    vehicleCode: data.licenseCode,
    captureTime: data.captureTime
  }).then((res) => {
    userList.value = res;
    loading.value = false;
  });
}

onMounted(() => {
  init(props.content)
})

</script>
<style scoped lang="scss">
.user-information {
  display: flex;
  flex-direction: row;
}

.country-image {
  width: 45px;
  height: 25px;
}

.relation-img {
  cursor: pointer;
  width: 40px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;
}
</style>
<template>
  <el-tabs :tab-position="tabPosition" v-loading="loading">
    <el-tab-pane :label="userDetail.phone" v-for="(userDetail,index) in userList" :key="index">
      <template #label>
        <span class="el-icon-mobile" :title="'SMS:'+userDetail.phone">&nbsp;{{
            userDetail.phone
          }}</span>
      </template>
      <div class="user-information">

        <el-image class="relation-img" v-show="userDetail.owner" :src="getImageUrl('owner_en.svg')"
                  title="Owner"/>
        <el-image class="relation-img" v-show="userDetail.family"
                  :src="getImageUrl('family_icon.svg')"
                  title="Owner Relative"/>
        <el-descriptions :column="1" border style="margin-left: 5px;width: 100%;position: relative"
                         direction="vertical"
                         title="Phone Number Information">
          <el-descriptions-item :cospan="2" align="center" label="Identity Photo">
            <el-image
              style="width: 300px;height: 320px;margin:3px"
              :src="userDetail.avatar"
              :preview-src-list="[userDetail.avatar]"/>
          </el-descriptions-item>
          <el-descriptions-item label="Identity No.">
            <div style="display: flex; align-items: center;justify-content: flex-start;"
                 v-if="userDetail.idNo">
              <el-link type="primary"
                       :class="{ 'active': -999 === activeIndex }"

                       @click=" goProfilePage(userDetail.idNo)"
              >{{ userDetail.idNo }}
              </el-link>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="Name">
                      <span v-if="userDetail.name">
                        <el-link type="primary"
                                 @click="goProfilePage(userDetail.idNo)">{{
                            userDetail.name
                          }}</el-link></span>
            <span v-else class="color-rgb118">Unknown</span>
          </el-descriptions-item>
          <el-descriptions-item label="Nationality">
            <div style="display: flex; align-items: center;justify-content: flex-start;"
                 v-if="userDetail.country">
              <el-image :src="getCountryImage(userDetail.country)"
                        :title="userDetail.country"
                        class="country-image"/>
            </div>
            <el-image v-else :src="getCountryImage('Oman')" class="country-image"/>
          </el-descriptions-item>
          <el-descriptions-item label="Phone">
            <span>{{ userDetail.phone }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Create Time">
            <span>{{ userDetail.createTime }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Update Time">
            <span>{{ userDetail.modifyTime }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Deactivate Time">
            <span style="color: red">{{ userDetail.deactivateTime }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Birth Date">
            <span v-if="userDetail.birthDate">{{ userDetail.birthDate }}</span>
            <span v-else class="color-rgb118">Unknown</span>
          </el-descriptions-item>

        </el-descriptions>
      </div>
    </el-tab-pane>
    <el-empty v-show="userList.length===0" :image-size="300"/>
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
</template>
