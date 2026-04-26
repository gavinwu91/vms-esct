<template>
  <div class="region-management-container">
    <el-container>
      <!-- Left Query Area -->
      <el-aside width="20vw" class="query-aside">
        <div class="query-card">
          <h3 class="query-title">Region Query</h3>
          <el-form :model="queryForm" label-width="80px" class="query-form">
            <el-form-item label="Name">
              <el-input v-model="queryForm.name" placeholder="Enter region name" clearable />
            </el-form-item>
            <el-form-item label="Parent">
              <el-cascader
                v-model="queryForm.parentId"
                :options="regionOptions"
                :props="cascaderProps"
                clearable
                placeholder="Select parent region"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="Status">
              <el-select v-model="queryForm.status" placeholder="Select status" clearable>
                <el-option label="Enabled" :value="1" />
                <el-option label="Disabled" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery" class="vms-main-button">Search</el-button>
              <el-button @click="resetQuery" class="vms-reset-button">Reset</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-aside>

      <!-- Main Content Area -->
      <el-main class="main-content">
        <div class="operation-bar">
          <el-button type="primary" @click="handleAdd" class="vms-main-button" v-hasPermi="['biz:area:create']">
            <el-icon><plus /></el-icon> Add Region
          </el-button>
        </div>

        <!-- Region List Table -->
        <el-table
          :data="regionList"
          border
          stripe
          style="width: 100%"
          v-loading="loading"
          row-key="id"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          :expand-row-keys="expandedKeys"
        >
          <!-- <el-table-column prop="id" label="ID" width="80" /> -->
          <el-table-column prop="name" label="Region Name" min-width="180" />
          <el-table-column label="Parent Region" min-width="150">
            <template #default="{row}">
              {{ row.parentName || 'Top-level Region' }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="code" label="Region Code" min-width="120" /> -->
          <el-table-column label="Status" min-width="100">
            <template #default="{row}">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? 'Enabled' : 'Disabled' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="Sort" min-width="80" />
          <el-table-column label="Created Time" min-width="180">
            <template #default="{row}">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="Update Time" min-width="180">
            <template #default="{row}">
              {{ formatDate(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" min-width="220" fixed="right">
            <template #default="{row}">
              <el-button size="small" @click="handleView(row)">View</el-button>
              <el-button size="small" type="primary" @click="handleSubAdd(row)">Add</el-button>
              <el-button size="small" type="primary" @click="handleEdit(row)">Edit</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="regionFormRef" 
        :model="regionForm" 
        :rules="rules" 
        label-width="100px"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="regionForm.name" placeholder="Enter region name" />
        </el-form-item>
        <!-- <el-form-item label="Code" prop="code">
          <el-input v-model="regionForm.code" placeholder="Enter region code" />
        </el-form-item> -->
        <el-form-item label="Parent" prop="parentId">
          <el-cascader
            v-model="regionForm.parentId"
            :options="regionOptions"
            :props="cascaderProps"
            clearable
            placeholder="Select parent region"
            style="width: 100%"
            :show-all-levels="false"
            filterable
          />
        </el-form-item>
        <el-form-item label="Sort" prop="sort">
          <el-input-number v-model="regionForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-switch
            v-model="regionForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="Enabled"
            inactive-text="Disabled"
          />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input 
            v-model="regionForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="Enter remarks"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitForm">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="Region Details"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Region ID">{{ currentRegion.id }}</el-descriptions-item>
        <el-descriptions-item label="Region Name">{{ currentRegion.name }}</el-descriptions-item>
        <el-descriptions-item label="Parent Region">{{ currentRegion.parentName || 'Top-level Region' }}</el-descriptions-item>
        <el-descriptions-item label="Region Code">{{ currentRegion.code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Level">{{ currentRegion.typeLevel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Sort">{{ currentRegion.sort || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="currentRegion.status === 1 ? 'success' : 'danger'">
            {{ currentRegion.status === 1 ? 'Enabled' : 'Disabled' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Created Time">{{ formatDate(currentRegion.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="Remark" :span="2">
          {{ currentRegion.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailVisible = false">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAreaTree, getAreaOptions, createArea, deleteArea, updateArea, type AreaDo, type AreaTreeVO } from '@/api/device'
import * as authUtil from '@/utils/auth'

// 查询表单
const queryForm = reactive({
  name: '',
  parentId: null as number | null,
  status: null
})

// 区域表单
const regionForm = reactive({
  id: null as number | null,
  name: '',
  code: null,
  parentId: null as number | null,
  sort: 0,
  status: 1,
  remark: ''
})

// 表单验证规则
const rules = reactive({
  name: [{ required: true, message: 'input name', trigger: 'blur' }],
  // code: [{ required: true, message: 'input code', trigger: 'blur' }],
  parentId: [{
    validator: (rule: any, value: any, callback: any) => {
      if (regionForm.id && value && value === regionForm.id) {
        callback(new Error('can not select self for parent'))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }]
})

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}

// 组件状态
const loading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const dialogTitle = ref('')
const regionList = ref<any[]>([])
const regionOptions = ref<any[]>([])
const currentRegion = ref<Partial<AreaDo>>({})
const regionFormRef = ref()
const expandedKeys = ref<any[]>([])

// 初始化数据
onMounted(() => {
  fetchRegionList()
  fetchRegionOptions()
})

// 日期格式化
const formatDate = (timestamp: number | undefined | null) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

// 获取区域选项
const fetchRegionOptions = async () => {
  try {
    const res = await getAreaOptions()
    // console.log('获取区域123选项:', JSON.stringify(res))

    const list = res || []
    // console.log('获取区域选项:', list)
    
    // 构建树形结构
    const buildTree = (regions: any[], parentId: number | null = null): any[] => {
      return regions
        .filter(region => {
          // 处理可能的空值
          const regionParentId = region.parentId === null ? null : region.parentId;
          if (parentId === null) {
            return regionParentId === null
          } else {
            return regionParentId === parentId
          }
        })
        .map(region => {
          const children = buildTree(regions, region.id)
          return {
            ...region,
            children: children.length > 0 ? children : undefined
          }
        })
    }
    
    regionOptions.value = buildTree(list)
    // console.log('构建后的区域选项树:', regionOptions.value)
  } catch (error) {
    console.error('failed:', error)
    ElMessage.error('Failed')
  }
}

// 获取区域列表
const fetchRegionList = async () => {
  loading.value = true
  try {
    const params = {
      name: queryForm.name || undefined,
      parentId: queryForm.parentId || undefined,
      status: queryForm.status
    }
    // console.log("---------------22222222queryForm-" + JSON.stringify(queryForm))
    // console.log("---------------22222222params-" + JSON.stringify(params))

    const res = await getAreaTree(params)
    
    // 直接使用后端返回的树形结构
    regionList.value = res || []
    expandedKeys.value = regionList.value.filter((item: any) => item.parentId === null).map((item: any) => String(item.id))
    // console.log('获取区域树列表:', JSON.stringify(regionList.value))
  } catch (error) {
    console.error('Failed:', error)
    ElMessage.error('Failed')
  } finally {
    loading.value = false
  }
}

// 查询处理
const handleQuery = () => {
  fetchRegionList()
}

// 重置查询
const resetQuery = () => {
  queryForm.name = ''
  queryForm.parentId = null
  queryForm.status = null
  fetchRegionList()
}

// 新增区域
const handleAdd = () => {
  dialogTitle.value = 'New Region'
  Object.assign(regionForm, {
    id: null,
    name: '',
    code: '',
    parentId: null,
    sort: 0,
    status: 1,
    remark: ''
  })
  dialogVisible.value = true
}

const handleSubAdd = (row: any) => {
  dialogTitle.value = 'New Region'
  Object.assign(regionForm, {
    id: null,
    name: '',
    code: '',
    parentId: row.id,
    sort: 0,
    status: 1,
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = 'Edit Region'
  Object.assign(regionForm, {
    id: row.id,
    name: row.name,
    code: row.code || '',
    parentId: row.parentId,
    sort: row.sort || 0,
    status: row.status || 1,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: any) => {
  currentRegion.value = { ...row }
  detailVisible.value = true
}

// 删除区域
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${row.name}" ?`,
    'Delete Confirmation',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(async () => {
    try {
      let result = await deleteArea(row.id)
      if (result === 503) {
        ElMessage.success('There are devices in the area, can not deleted');
      } else if (result === 200) {
        ElMessage.success('Success');
        fetchRegionList()
        fetchRegionOptions()
      } else {
        ElMessage.success('Failed')
      }

    } catch (error: any) {
      console.error('Failed:', error)
      ElMessage.error('Failed: ' + (error.message || error))
    }
  }).catch(() => {
    ElMessage.info('Cancel')
  })
}

// 提交表单
const submitForm = () => {
  regionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    try {
      const formData: any = { ...regionForm }
      const tenantid = authUtil.getTenantId();
      const loginFrom = authUtil.getLoginForm();
      formData.tenantId = tenantid;
      formData.creator = loginFrom.username;
      // 特殊处理：如果选择的是顶级区域，parentId设为null
      if (formData.parentId === null || formData.parentId === undefined) {
        formData.parentId = null
      }
      
      // 处理空值字段
      if (!formData.code) formData.code = null
      if (!formData.remark) formData.remark = null
      
      if (formData.id) {
        // 更新操作
        await updateArea(formData)
      } else {
        // 创建操作
        await createArea(formData)
      }
      
      ElMessage.success('Operate success!')
      dialogVisible.value = false
      fetchRegionList()
      fetchRegionOptions()
    } catch (error: any) {
      console.error('Operate fail!:', error)
      ElMessage.error('Operate fail!: ' + (error.response?.data?.message || error.message || error))
    }
  })
}
</script>

<style scoped>
.region-management-container  {
  height: 85vh;
  display: flex;
  flex-direction: column;
}

.query-aside {
  border-right: 1px solid #e6e6e6;
  height: 100%;
}

.query-card {
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
}

.query-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.query-form {
  margin-top: 20px;
}

.main-content {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-left: 20px;
  
}

.operation-bar {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
  height: 80vh;
}

.el-descriptions {
  margin-top: 20px;
}

.el-descriptions-item__label {
  width: 100px;
}
</style>
