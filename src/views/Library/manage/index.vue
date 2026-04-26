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
      <el-form-item label="Library Name" prop="name">
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
        <el-button plain type="primary" @click="openForm('create')" v-hasPermi="['library:manage:create']" class="vms-main-button">
          <Icon class="mr-5px" icon="ep:plus" />
          Add
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="Library Name" prop="libraryName">
        <template #default="{ row }">
          <el-link
            type="primary"
            :underline="true"
            @click="handlePerson('manage/person', row)"
          >
            {{ row.libraryName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Create Time">
        <template #default="{ row }">
          {{ formatDate(new Date(row.createTime)) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Remark" prop="Remark" />

      <el-table-column :width="300" align="center" label="Operate">
        <template #default="{row}">
          <el-button link type="primary" @click="openForm('update', row.id)"  v-hasPermi="['library:manage:update']">
            Modify
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id)"  v-hasPermi="['library:manage:delete']"> Delete </el-button>
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
import { dateFormatter, formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import * as LibraryApi from '@/api/portraitlibrary'
import LibraryForm from './LibraryForm.vue'

defineOptions({ name: 'Library' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter()

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询角色列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await LibraryApi.getLibraryPage(queryParams)
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
    await LibraryApi.deleteLibrary(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/**method */
const handlePerson = async (path, row) => {
  router.push({
    path: path,
    query: { platformLibraryId: row.platformLibraryId,name: row.libraryName }
  })
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
