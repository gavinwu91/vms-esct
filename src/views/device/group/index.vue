<template>
  <div class="group-container">
    <el-button type="primary" @click="openDialog(null)">Add Group</el-button>
    
    <el-table :data="groups" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Group Name" />
      <el-table-column prop="description" label="Description" />
      <el-table-column label="Actions" width="200">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteGroup(scope.row.id)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" autocomplete="off" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import groupApi from '@/api/group';
import * as authUtil from '@/utils/auth'

// Define group data type
interface Group {
  id: number;
  name: string;
  description: string;
  createTime?: string;
  updateTime?: string;
}

// Form data type
interface GroupForm {
  name: string;
  description: string;
}

// State management
const groups = ref<Group[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);
const formRef = ref<FormInstance>();

// Form data and validation rules
const form = reactive<GroupForm>({
  name: '',
  description: ''
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: 'Group name cannot be empty', trigger: 'blur' },
    { min: 2, max: 20, message: 'Length must be between 2 and 20 characters', trigger: 'blur' }
  ],
  description: [
    { max: 100, message: 'Description cannot exceed 100 characters', trigger: 'blur' }
  ]
});

// Computed dialog title
const dialogTitle = computed(() => {
  return isEdit.value ? 'Edit Group' : 'Add Group';
});

// Reset form
const resetForm = () => {
  form.name = '';
  form.description = '';
  formRef.value?.clearValidate();
};

// Open dialog
const openDialog = (group: Group | null) => {
  resetForm();
  if (group) {
    isEdit.value = true;
    currentId.value = group.id;
    form.name = group.name;
    form.description = group.description || '';
  } else {
    isEdit.value = false;
    currentId.value = null;
  }
  dialogVisible.value = true;
};

// Handle form submission
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    saveGroup();
  } catch (error) {
    console.log('Form validation failed', error);
  }
};

// Save group
const saveGroup = async () => {
  try {
     const tenantid = authUtil.getTenantId();
     const loginFrom = authUtil.getLoginForm();
     form.tenantId = tenantid;
     form.creator = loginFrom.username;
    if (isEdit.value && currentId.value !== null) {
      await groupApi.updateGroup(currentId.value, form);
      ElMessage.success('Update successful');
    } else {
      await groupApi.createGroup(form);
      ElMessage.success('Added successfully');
    }
    dialogVisible.value = false;
    fetchGroups();
  } catch (error) {
    ElMessage.error('Operation failed');
    console.error('Save group error:', error);
  }
};

// Delete group
const deleteGroup = (id: number) => {
  ElMessageBox.confirm('Are you sure you want to delete this group?', 'Warning', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    try {
      await groupApi.deleteGroup(id);
      ElMessage.success('Deleted successfully');
      fetchGroups();
    } catch (error) {
      ElMessage.error('Deletion failed');
      console.error('Delete group error:', error);
    }
  }).catch(() => {
    // User canceled
  });
};

// Fetch group list
const fetchGroups = async () => {
  try {
    loading.value = true;
    const response = await groupApi.getAllGroups();
    console.log("=======response===", JSON.stringify(response))
    groups.value = response;
  } catch (error) {
    ElMessage.error('Failed to fetch groups');
    console.error('Fetch group error:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchGroups();
});
</script>

<style scoped>
.group-container {
  padding: 20px;
  margin: 0 auto;
}

.el-table {
  margin-top: 20px;
}
</style>

