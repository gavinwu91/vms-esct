<script setup lang="ts">
import {vehiclePage} from "@/api/identity";
import {getCountryImage} from "@/views/vehicle/components";

defineOptions({name: 'VehicleRecord'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  },
  reQueryPersonInformation: {
    type: Function,
  }
})
const pageQuery = reactive({
  page: 1,
  pageSize: 20,
  args: "",
  plateNumber: [],
})
const response = ref({
  data: [],
  total: 0,
})
const plateCodes = ref([]);
const changePageSize = (val) => {
  pageQuery.pageSize = parseInt(val);
  changePage(1)
}
const changePage = async (num) => {
  const loading = ElLoading.service();
  pageQuery.page = parseInt(num);
  response.value.data = [];
  var res =await vehiclePage(pageQuery);
  response.value.data = res.data;
  response.value.total = res.total;
  loading.close();
}

const init = (params, params2) => {
  if (params) {
    plateCodes.value = params;
  } else {
    plateCodes.value = params;
  }
  if (plateCodes.value && plateCodes.value.length > 0) {
    pageQuery.plateNumber = plateCodes.value.at(0);
    changePage(1)
  }
}

const search = () => {
  changePage(1)
}

watch(() => props.content, (content) => {
  init(content.vehicleNumbers, content);
})

onMounted(() => {
  init(props.content.vehicleNumbers, props.content)
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
</style>
<template>
  <div class="filter-box"
       v-if="(plateCodes && plateCodes.length!==0) || (props.content.usedVehicleNumbers && props.content.usedVehicleNumbers.length !==0)">
    <el-select v-model="pageQuery.plateNumber" class="track-information-record-select" filterable
               style="width: 260px"
               @change="search" size="medium">
      <el-option v-for="(o,index) in plateCodes" :key="index" :value="o" :label="o"/>
      <el-option v-for="(o,index) in props.content.usedVehicleNumbers" :key="o+index" :value="o"
                 :label="o">
        <span style="float: left">{{ o }}</span>
        <span style="float: right;color: red;font-size: 13px">Used</span>
      </el-option>
    </el-select>
  </div>
  <el-table
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
                   @click="reQueryPersonInformation(row.idNo,row.avatar)">{{
              row.idNo
            }}
          </el-link>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Identity Type" align="center" prop="identityType" width="120"/>
    <el-table-column label="Name" align="center" prop="englishFullName">
      <template #default="{row}">
        <div style="display: flex; flex-direction: column;">
          <el-link type="primary" :title="row.englishFullName"
                   @click="reQueryPersonInformation(row.id,row.avatar)">{{ row.englishFullName }}
          </el-link>
          <el-link type="primary" :title="row.arabicOwnerName"
                   @click="reQueryPersonInformation(row.id,row.avatar)">{{ row.arabicOwnerName }}
          </el-link>
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
    layout="sizes,prev,pager,next"
    :size="pageQuery.pageSize"
    v-model:current-page="pageQuery.page"
    v-model:page-size="pageQuery.pageSize"
    @current-change="changePage"
    @size-change="changePageSize"
    :total="response.total"/>
</template>


