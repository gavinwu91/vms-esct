<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="120px"
    >
      <div class="flex justify-between">
        <div
          ><el-form-item label="Library  Name" prop="name">
            <el-input
              v-model="queryParams.name"
              class="!w-240px"
              clearable
              placeholder="Library Name"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleQuery" class="vms-main-button">
              <Icon class="mr-5px" icon="ep:search" />
              Search
            </el-button>
            <el-button @click="resetQuery" class="vms-reset-button">
              <Icon class="mr-5px" icon="ep:refresh" />
              Reset
            </el-button>
          </el-form-item></div
        >
        <div>
          <el-form-item>
            <el-button
              plain
              type="primary"
              @click="openForm('create')"
              v-if="libraryType == '2'"
              class="vms-main-button"
            >
              <Icon class="mr-5px" icon="ep:plus" />
              Add
            </el-button>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="Library Name" prop="libraryName">
        <template #default="{ row }">
          <el-link :underline="true" @click="handlePerson(row)" type="primary">
            {{ row.libraryName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Level" prop="level">
        <template #default="{ row }">
          <el-tag :class="'level-tag' + row.level">Level {{ row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Dept Name" prop="deptName" v-if="libraryType == '2'" />
      <el-table-column align="center" label="Remark" prop="remark" />

      <el-table-column :width="300" align="center" label="Operate" v-if="libraryType == '2'">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            Modify
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"> Delete </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <LibraryForm ref="formRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as LibraryApi from '@/api/library'
import LibraryForm from './LibraryForm.vue'

defineOptions({ name: 'Library' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter()
const route = useRoute()

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const libraryType = route.meta.query.libraryType as string

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const handlePerson = (row) => {
  if (libraryType == '1') {
    router.push({
      path: 'person',
      query: { platformLibraryId: row.platformLibraryId, libraryType: 1 }
    })
  } else {
    router.push({
      path: 'user/person',
      query: { platformLibraryId: row.platformLibraryId, libraryType: 2, name: row.libraryName }
    })
  }
}

/** 查询角色列表 */
const getList = async () => {
  loading.value = true
  try {
    let data
    if (libraryType == '1') {
      data = await LibraryApi.getLibraryPage(queryParams)
    } else {
      data = await LibraryApi.getSurLibraryPage(queryParams)
    }
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await LibraryApi.deleteSurLibrary(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
<style scoped>
:deep(.el-tag .el-tag__content){
  padding:2px 5px;
}
:deep(.level-tag1) {
  background-color: #ce4f4f;
  color: white;
}
:deep(.level-tag2) {
  background-color: #e77e2d;
  color: white;
}
:deep(.level-tag3) {
  background-color: #fbc647;
  color: white;
}
:deep(.level-tag4) {
  background-color: #4c8ad4;
  color: white;
}
</style>
