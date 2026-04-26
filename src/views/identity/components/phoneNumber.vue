<script setup lang="ts">
import {rt968Page} from "@/api/identity";
import {getCountryImage} from "@/views/vehicle/components";

defineOptions({name: 'phoneNumberRecord'})
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
  queryModel: "10",
  status: "0",
  page: 1,
  pageSize: 20,
  phone: "",
  args: "",
})
const response = ref({
  data: [],
  total: 0,
})
const mobiles = ref([]);
const changePageSize = (val) => {
  pageQuery.pageSize = parseInt(val);
  changePage(1)
}
const changePage = async (num) => {
  const loading = ElLoading.service();
  pageQuery.page = parseInt(num);
  response.value.data = [];
   var res = await rt968Page(pageQuery);
    response.value.data = res.data;
    response.value.total = res.total;
    loading.close();
}

const init = (params, params2) => {
  if (params) {
    mobiles.value = params;
  } else {
    mobiles.value = params;
  }
  if (mobiles.value && mobiles.value.length > 0) {
    pageQuery.phone = mobiles.value.at(0);
    pageQuery.args = mobiles.value.at(0);
    changePage(1)
  }
}

const search = () => {
  changePage(1)
}

watch(() => props.content, (content) => {
  init(content.mobiles, content);
})

onMounted(() => {
  init(props.content.mobiles, props.content)
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
  <div class="filter-box">
    <el-select v-model="pageQuery.phone" class="track-information-record-select" filterable
               style="width: 260px"
               @change="search" size="medium">
      <el-option v-for="(o,index) in mobiles" :key="index" :value="o" :label="o"/>
      <el-option v-for="(o,index) in props.content.usedMobiles" :key="o+index" :value="o"
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
    <el-table-column label="Identity Photo" prop="id" align="center" width="130">
      <template #default="{row}">
        <el-image preview-teleported="true"
                  hide-on-click-modal="true"
                  :src="'https://192.168.80.185:8443/person_img/'+row.picpath"
                  class="row-col-avatar-list"
                  :preview-src-list="['https://192.168.80.185:8443/person_img/'+row.picpath]">
          <template #error>
            <el-icon>
              <icon-picture/>
            </el-icon>
          </template>
        </el-image>
      </template>
    </el-table-column>
    <el-table-column label="Identity No." prop="identityid" align="center" width="130">
      <template #default="{row}">
        <div style="display: flex;align-items: center;justify-content: center;">
          <el-image :src="getCountryImage(row.orgCounty)" style="width: 30px"
                    :title="row.orgCounty"/>
          <el-link style="margin-left: 5px" type="primary" :title="row.identityid"
                   @click="reQueryPersonInformation(row.identityid,row.picpath)">{{
              row.identityid
            }}
          </el-link>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Real Name" prop="realname" align="center" width="450">
      <template #default="{row}">
        <el-link type="primary" :title="row.realname"
                 @click="reQueryPersonInformation(row.identityid,row.picpath)">{{ row.realname }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column label="Phone Num" prop="phonenum" align="center" width="180">
      <template #default="{row}">
        <span>{{ row.phonenum }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Telecom Carrier" prop="isp" align="center" width="150px">
      <template #default="{row}">
        <span>{{ row.isp }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Use  Date" prop="subscriptionDatecreation" align="center" width=""
                     sortable>
      <template #default="{row}">
        <div style="display: flex; flex-direction: column;">
          <span>Creation Date:&nbsp;{{ row.subscriptionDatecreation }}</span>
          <span v-if="row.subscriptionDeactivate">Expired Date:&nbsp;<span style="color: orangered">&nbsp;{{ row.subscriptionDeactivate }}</span></span>
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


