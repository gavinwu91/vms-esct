<script setup lang="ts">
import {getAge} from "@/api/identity";
import {getCountryImage, getImageUrl} from "@/views/vehicle/components";
import familyRelationsGraph from "@/views/identity/components/familyGraph.vue";

defineOptions({name: 'familyRelations'})
const props = defineProps({
  content: {
    type: Object,
    default: () => {
    },
  },
  reQueryPersonInformation: {
    type: Function,
    default: () => {
    },
  }
})


const familyRelations = ref([]);
const data = ref([]);
const optionsVal = ref([]);
const showStyle = ref(false);

const handleData = () => {
  if (!optionsVal.value) {
    data.value = props.content.relationships;
    return;
  }
  data.value = optionsVal.value;
}


watch(() => props.content, (content) => {
  init(content.relationships, content.familyRelations)
})

const init = (prams, params2) => {
  const loading = ElLoading.service();
  if (prams.length ===0 || params2.length === 0){
    loading.close();
    return ;
  }
  if (prams && prams.length > 0) {
    data.value = prams;
    optionsVal.value = prams;
  }
  if (params2 && params2.length > 0) {
    familyRelations.value = params2;
  }
  loading.close();
}

onMounted(() => {
  init(props.content.relationships, props.content.familyRelations);
})

</script>
<style lang="css" scoped>

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
.change_style{
  cursor: pointer;
}

</style>
<template>
  <div style="display: flex;top: 8px;align-items: flex-end;margin-top: 10px">
    <el-select size="medium"
               v-if="data.length>0"
               filterable clearable
               style="margin-right: 5px;width: 250px"
               @change="handleData" v-model="optionsVal">
      <el-option :value="data"
                 label="All Family"/>

      <el-option :key="index" v-for="(o,index) in familyRelations" :value="o.family"
                 :label="o.relation +' - '+o.family.length"/>
    </el-select>
    <el-image class="change_style" style="width: 32px;height:31px;margin-right: 10px"
              :src="getImageUrl('family_relationships.svg')"
              title="Family Relationships Graph" v-if="data.length>0"
              @click="showStyle=true"/>
  </div>
  <el-table
    border
    element-loading-text="Loading..."
    style="margin-top: 10px"
    :data="data"
    stripe
    highlight-current-row
    height="50vh">
    <el-table-column label="Identity Photo" prop="id" width="120">
      <template #default="{row}">
        <el-image v-if="row.avatar" :src="'https://192.168.80.185:8443/person_img/'+row.avatar"
                  class="row-col-avatar-list"
                  show-progress
                  preview-teleported="true"
                  hide-on-click-modal="true"
                  :preview-src-list="['https://192.168.80.185:8443/person_img/'+row.avatar]">
          <template #error>
            <el-icon><icon-picture/></el-icon>
          </template>
        </el-image>
      </template>
    </el-table-column>
    <el-table-column label="Identity No." align="center" prop="idNo">
      <template #default="{row}">
        <div style="display: flex;align-items: center;justify-content: center;">
          <el-image :src="getCountryImage(row.country)" style="width: 30px" :title="row.country">
            <template #error>
              <el-icon><icon-picture/></el-icon>
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
    <el-table-column label="Name" align="center" prop="englishName" width="350">
      <template #default="{row}">
        <div
          style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
          <el-link type="primary" :title="row.englishName"
                   @click="reQueryPersonInformation(row.idNo,row.avatar)">
            {{ row.englishName }}
          </el-link>
          <el-link type="primary" :title="row.arabicName"
                   @click="reQueryPersonInformation(row.idNo,row.avatar)">
            {{ row.arabicName }}
          </el-link>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Gender" align="center" prop="gender"/>
    <el-table-column label="Passport No." align="center" prop="passportNo"/>
    <el-table-column label="Date of Birth" align="center" prop="birthDate"/>
    <el-table-column label="Age" align="center" prop="birthDate" sortable>
      <template #default="{row}">
        <span v-if="!row.dateOfDeath">{{ getAge(row) }} </span>
        <div v-if="row.dateOfDeath">
          <span style="color: red">{{ getAge(row) }}</span>
          <span
            class="el-icon-info"
            :title="'Date of Death: '+row.dateOfDeath"
            style="cursor: pointer;color:red;margin-left: 1px"></span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Relation" align="center" prop="relation"/>
    <el-table-column label="Relation End" align="center" prop="reasonOfEnd"/>
  </el-table>

  <!--  <div class="right-bottom"></div>-->
  <el-dialog
    fullscreen
    draggable
    append-to-body
    v-model="showStyle"
    @close="showStyle = false"
    v-if="showStyle">
    <div v-if="showStyle" style="width: 100%;">
      <familyRelationsGraph :content="content" v-if="showStyle"
                   style="height: 92vh"/>
    </div>
  </el-dialog>
</template>

