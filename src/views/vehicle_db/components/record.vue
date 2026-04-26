<script setup lang="ts">
import {getCountryImage} from "@/views/vehicle/components";
import {vehiclePage} from "@/api/identity";
import IdentityInformation from "@/views/identity/index.vue";

defineOptions({name: 'VehicleDatabaseDetailRecord'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  }
})

const pageQuery = reactive({
  page: 1,
  pageSize: 20,
  args: "",
})
const response = ref({
  data: [],
  total: 0,
})

const informationQuery = ref({});
const showIdentityInformation = ref(false);
const goProfilePage = (idNo) => {
  informationQuery.value.idNo = idNo;
  informationQuery.value.sessionId = props.content.JSESSIONID;
  showIdentityInformation.value = true;
}

const loading = ref(true);

const changePageSize = (val) => {
  pageQuery.pageSize = parseInt(val);
  changePage(1)
}

const search = () => {
  changePage(1)
}
const changePage = async (num) => {
  loading.value = true;
  pageQuery.page = parseInt(num);
  response.value.data = [];
  try {
    let r = await vehiclePage(pageQuery);
    console.log(r, "============")
    response.value.data = r.data;
    response.value.total = r.total;
    loading.value = false;
  }catch (e){}
}

const init = (code) => {
  pageQuery.plateNumber = code;
  search();
}

watch(() => props.content, (content) => {
  init(content.plateCodeNumberEnglish);
})

onMounted(() => {
  init(props.content.plateCodeNumberEnglish)
})

</script>
<style scoped>
.row-col-avatar-list {
  height: 60px;
  width: 55px;
  border-radius: 60%;
  transition: 0.6s;
}

.row-col-avatar-list:hover {
  height: 90px;
  width: 85px;
  border-radius: 60%;
  transition: 0.6s;
}

:deep(.el-descriptions__title){
  font-size: 0.75rem!important;
}

:deep(.el-table .cell){
  font-size: 0.75rem!important;
}
</style>

<template>
  <el-descriptions title="Vehicle Changed Record" style="margin-top: 20px;"/>
  <el-table
    v-loading="loading"
    stripe
    border
    style="margin-top: 10px"
    :data="response.data"
    highlight-current-row
    height="50vh">
    <el-table-column label="Identity Photo" align="center">
      <template #default="{row}">
        <el-image class="row-col-avatar-list"
                  preview-teleported="true"
                  hide-on-click-modal="true"
                  :preview-src-list="['https://192.168.80.185:8443/person_img/'+row.avatar]"
                  :src="'https://192.168.80.185:8443/person_img/'+row.avatar">
          <template #error>
            <el-icon>
              <icon-picture/>
            </el-icon>
          </template>
        </el-image>
      </template>
    </el-table-column>
    <el-table-column label="Identity No." align="center" prop="id" width="120">
      <template #default="{row}">
        <div style="display: flex;align-items: center;justify-content: center;">
          <el-image :src="getCountryImage(row.country)" style="width: 30px" :title="row.country">
            <template #error>
              <el-icon>
                <icon-picture/>
              </el-icon>
            </template>
          </el-image>
          <el-link style="margin-left: 5px" type="primary" :title="row.idNo"
                   @click="goProfilePage(row.idNo)">{{
              row.idNo
            }}
          </el-link>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Identity Type" align="center" prop="identityType" width="120"/>
    <el-table-column label="Name" align="center" prop="englishFullName">
      <template #default="{row}">
        <div style="display: flex; flex-direction: column;" v-show="row.idNo">
          <el-link type="primary" :title="row.englishFullName"
                   @click="goProfilePage(row.idNo)">{{ row.englishFullName }}
          </el-link>
          <el-link type="primary" :title="row.arabicOwnerName"
                   @click="goProfilePage(row.idNo)">{{ row.arabicOwnerName }}
          </el-link>
        </div>
        <div style="display: flex; flex-direction: column;" v-show="!row.idNo">
          <span :title="row.englishFullName">{{ row.englishFullName }}</span>
          <span :title="row.arabicOwnerName">{{ row.arabicOwnerName }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Vehicle Information" prop="englishFullName">
      <template #default="{row}">
        <div style="display: flex; flex-direction: column;">
          <span>Brand:&emsp;{{ row.vehicleMakerEnglish }}</span>
          <span>Mode:&emsp;{{ row.yearManufactured }} &nbsp;{{
              row.vehicleModelEnglish
            }}&nbsp;{{ row.vehicleTypeEnglish }}</span>
          <span>Color:&emsp;{{ row.vehiclecolorenglish1 }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Registration Status" prop="englishRegistrationStatus" align="center"
                     width="180"/>
    <el-table-column label="Registration Model" align="center" prop="registrationModeEnglish"
                     width="180"/>
    <el-table-column label="Registration Date" align="center" prop="registrationstartdateStr"
                     sortable>
      <template #default="{row}">
        <div style="display: flex; flex-direction: column;">
          <span>Creation Date:&nbsp;{{ row.registrationstartdateStr }}</span>
          <span v-if="row.registrationexpirydateStr">Expired Date:&nbsp;<span
            style="color: orangered">&nbsp;{{ row.registrationexpirydateStr }}</span></span>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    style="float: right;margin: 10px"
    background
    layout="total,sizes,prev,pager,next"
    :size="pageQuery.pageSize"
    v-model:current-page="pageQuery.page"
    v-model:page-size="pageQuery.pageSize"
    @current-change="changePage"
    @size-change="changePageSize"
    :total="response.total"/>

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

