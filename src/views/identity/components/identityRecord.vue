<script setup lang="ts">
import {personPage} from "@/api/identity";

defineOptions({name: 'IdentityRecord'})
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

const changePageSize = (val) => {
  pageQuery.pageSize = parseInt(val);
  changePage(1)
}
const changePage =async (num) => {
  const loading = ElLoading.service();
  pageQuery.page = parseInt(num);
  response.value.data = [];
  try {
    let res = await personPage(pageQuery)
    response.value.data = res.data;
    response.value.total = res.total;
    loading.close();
  }catch (e){}
}

watch(() => props.content.idNo, (newId) => {
  pageQuery.args = newId;
  changePage(1)
})
onMounted(() => {
  pageQuery.args = props.content.idNo;
  try {
    changePage(1);
  } catch (e) {
  }
})

</script>
<template>
  <el-table
    border
    element-loading-text="Loading..."
    style="margin-top: 10px"
    :data="response.data"
    stripe
    highlight-current-row
    height="50vh">
    <el-table-column label="Identity Type" align="center" prop="documentName"/>
    <el-table-column label="Identity No." align="center" prop="documentNumber"/>
    <el-table-column label="Issue Date" align="center" prop="documentIssueDate"
                     width=""/>
    <el-table-column label="Expiry Date" align="center" prop="documentExpiryDate" sortable
                     width=""/>
    <el-table-column label="Issuing Place" align="center" prop="address"
                     width="">
      <template #default="scope">
        <div style="display: flex;flex-direction: column;">
          <span> {{ scope.row.issuingCountryCode }} &nbsp;{{ scope.row.issuingPlace }}</span>
          <span v-if="scope.row.visaNumber">Visa Number:&nbsp;<span
            style="color: orangered">{{ scope.row.visaNumber }}</span></span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Import Time" align="center" prop="importTime" sortable
                     width="240"/>
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


