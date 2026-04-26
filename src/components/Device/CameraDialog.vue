<template>
    <el-dialog
      v-model="visible"
      :title="mode === 'create' ? 'Create Device' : 'Edit Device'"
      width="80vw"
      class="camera-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="150px"
        label-position="right"
        class="camera-form"
      >
        <el-row :gutter="24">
          <!-- 左侧表单 -->
          <el-col :span="12">
            <div class="form-section-wrapper">
                <div class="form-section">
                <el-form-item label="Device Name" prop="cameraName">
                    <el-input v-model="form.cameraName" placeholder="Enter device name" clearable />
                </el-form-item>
                
                <el-form-item label="Device Type" prop="cameraType" style="display:none">
                    <el-select v-model="form.cameraType" placeholder="Select device type" @change="handleTypeChange" clearable>
                    <el-option
                        v-for="item in cameraTypes"
                        :key="item.code"
                        :label="item.value"
                        :value="item.code"
                    />
                    </el-select>
                </el-form-item>
                
                <!-- <template v-if="form.type === '2'">
                    <el-form-item label="关联智能盒" prop="boxId">
                    <el-select v-model="form.boxId" placeholder="请选择智能盒" clearable>
                        <el-option
                        v-for="box in boxes"
                        :key="box.id"
                        :label="box.name"
                        :value="box.id"
                        />
                    </el-select>
                    </el-form-item>
                    
                    <el-form-item label="通道号" prop="chanNo">
                    <el-select v-model="form.chanNo" placeholder="请选择通道号" clearable>
                        <el-option
                        v-for="n in channelNumbers"
                        :key="n"
                        :label="`通道${n}`"
                        :value="n"
                        />
                    </el-select>
                    </el-form-item>
                </template> -->
                
                <el-form-item label="Manufacturer" prop="manufacturer">
                    <el-select v-model="form.manufacturer" placeholder="Select manufacturer" clearable>
                    <el-option
                        v-for="mfg in manufacturers"
                        :key="mfg"
                        :label="mfg"
                        :value="mfg"
                    />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="Device Usage" prop="cameraUsage">
                    <el-select v-model="form.cameraUsage" placeholder="Select device usage" multiple clearable>
                    <el-option
                      v-for="dict in getIntDictOptions(DICT_TYPE.CAMERA_USAGE)"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                    <!-- <el-option
                        v-for="model in cameraUsages"
                        :key="model.id"
                        :label="model.name"
                        :value="model.id"
                    /> -->
                    </el-select>
                </el-form-item>
                
                <el-form-item label="Location" prop="areaId">
                  <el-cascader
                  v-model="form.areaId"
                  :options="areas"
                  :props="cascaderProps"
                  placeholder="Select device Location"
                  clearable
                  style="width: 100%"
                  />
              </el-form-item>

                <el-form-item label="Location Detail" prop="location">
                    <el-input v-model="form.location" placeholder="Enter location" clearable />
                </el-form-item>
                
                <el-form-item label="Location Type" prop="locationType">
                    <el-select v-model="form.locationType" placeholder="Select location type" clearable>
                    <el-option
                      v-for="dict in getIntDictOptions(DICT_TYPE.CAMERA_SCENE)"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                    <!-- <el-option
                        v-for="type in locationTypes"
                        :key="type.code"
                        :label="type.value"
                        :value="type.code"
                    /> -->
                    </el-select>
                </el-form-item>
                
                <!-- <el-form-item label="相机归属" prop="deptId">
                    <el-cascader
                    v-model="form.deptId"
                    :options="departments"
                    :props="cascaderProps"
                    placeholder="请选择归属部门"
                    clearable
                    style="width: 100%"
                    />
                </el-form-item> -->

                
                <!-- <el-form-item label="所属分组" prop="groupId">
                    <el-select v-model="form.groupId" placeholder="请选择分组" clearable>
                    <el-option
                        v-for="group in groups"
                        :key="group.id"
                        :label="group.name"
                        :value="group.id"
                    />
                    </el-select>
                </el-form-item> -->
                </div>
                
                <div class="form-section">
                <!-- <el-form-item v-if="form.type !== '2'" label="流地址" prop="videoStreamUrl">
                    <el-input
                    v-model="form.videoStreamUrl"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入流地址"
                    />
                    <div class="form-tip">示例: iot://admin:123456@192.168.2.10:8010?videoPort=33220#rtsp://192.168.3.15:8020/video</div>
                </el-form-item> -->
                <div class="rowshow">
                  <el-form-item label="IP" prop="cameraIp">
                      <el-input v-model="form.cameraIp" placeholder="Enter camera IP" clearable />
                  </el-form-item>
                  <el-form-item label="Port" prop="cameraPort">
                      <el-input v-model="form.cameraPort" placeholder="Enter camera port" clearable />
                  </el-form-item>
                </div>
                <div class="rowshow">
                  <el-form-item label="Account" prop="cameraAccount">
                      <el-input v-model="form.cameraAccount" placeholder="Enter camera account" clearable />
                  </el-form-item>
                  <el-form-item label="Password" prop="cameraPassword">
                      <el-input v-model="form.cameraPassword" placeholder="Enter camera password" clearable />
                  </el-form-item>
                </div>


                <el-form-item label="Enabled" prop="enableStatus">
                    <el-switch
                    v-model="form.enableStatus"
                    :active-value="true"
                    :inactive-value="false"
                    active-text="Enabled"
                    inactive-text="Disabled"
                    />
                </el-form-item>
                </div>
                
                <!-- <div class="form-section">
                  <el-form-item label="存储设置">
                    <div class="form-section2">
                    <div class="storage-item">
                    <el-checkbox v-model="form.isFace">人脸图</el-checkbox>
                    <div class="storage-ttl">
                        <span>保留</span>
                        <el-select v-model="form.faceImageRetentionDays" size="small">
                        <el-option
                            v-for="item in ttlOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                        </el-select>
                    </div>
                    </div>
                    
                    <div class="storage-item">
                    <el-checkbox v-model="form.isPanoramic">全景图</el-checkbox>
                    <div class="storage-ttl">
                        <span>保留</span>
                        <el-select v-model="form.panoramicRetentionDays" size="small">
                        <el-option
                            v-for="item in ttlOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                        </el-select>
                    </div>
                    </div>
                    
                    <el-checkbox v-model="form.isLowQuality" class="low-quality">低质量存储</el-checkbox>
                  </div>
                </el-form-item>
                </div> -->
                
                <div class="form-section">
                  <!-- <el-form-item label="Camera No." prop="platformCameraId">
                      <el-input v-model="form.platformCameraId" placeholder="Enter camera number" clearable />
                  </el-form-item> -->
                <el-form-item label="Remarks" prop="remark">
                    <el-input
                    v-model="form.remark"
                    type="textarea"
                    :rows="2"
                    placeholder="Enter remarks"
                    />
                </el-form-item>
                </div>
            </div>
          </el-col>
  
          <!-- 右侧地图和经纬度 -->
          <el-col :span="12">
            <div class="map-container">
              <el-form-item label="Coordinates" required class="coordinates">
                <div class="coordinates-inputs">
                  <el-input
                    v-model="form.longitude"
                    placeholder="Longitude"
                    clearable
                    class="coordinate-input"
                  />
                  <el-input 
                    v-model="form.latitude" 
                    placeholder="Latitude" 
                    clearable
                    class="coordinate-input"
                  />
                </div>
              </el-form-item>
  
              <div class="map-wrapper">
                <MapComponent
                  :longitude="form.longitude"
                  :latitude="form.latitude"
                  @update:longitude="val => form.longitude = val"
                  @update:latitude="val => form.latitude = val"
                />
              </div>
              
              <div class="map-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>Click on the map to set location or enter coordinates directly</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">Cancel</el-button>
          <el-button type="primary" @click="submitForm">Save</el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { InfoFilled } from '@element-plus/icons-vue'
  import MapComponent from './MapComponent.vue'
  import { getDepartments, getAreas, getGroups, getBoxes, getManufacturers } from '@/api/device'
  import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
  
  // 级联选择器配置
  const cascaderProps = {
    value: 'id',
    label: 'name',
    children: 'children',
    checkStrictly: true,
    emitPath: false
  }

  const props = defineProps({
    modelValue: Boolean,
    mode: {
      type: String,
      default: 'create'
    },
    data: {
      type: Object,
      default: null
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'submit'])
  
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })
  
  const formRef = ref(null)
  const form = ref({
    cameraName: '',
    cameraType: '',
    manufacturer: '',
    cameraUsage: [],
    location: '',
    locationType: '',
    deptId: '',
    areaId: '',
    groupId: '',
    videoStreamUrl: '',
    enableStatus: true,
    isFace: true,
    faceImageRetentionDays: 30,
    isPanoramic: true,
    panoramicRetentionDays: 30,
    isLowQuality: false,
    remark: '',
    longitude: '58.3392639371309',
    latitude: '23.598513105718',
    cameraIp: '',
    cameraPort: '',
    cameraAccount: '',
    cameraPassword: '',
    platformCameraId: ''
  })
  
  const rules = {
    cameraName: [
      { required: true, message: 'Please enter the camera name', trigger: 'blur' },
      { min: 2, max: 50, message: 'Length must be between 2 and 50 characters', trigger: 'blur' }
    ],
    // cameraType: [
    //   { required: true, message: 'Please select the camera type', trigger: 'change' }
    // ],
    manufacturer: [
      { required: true, message: 'Please select the camera manufacturer', trigger: 'change' }
    ],
    cameraUsage: [
      { required: true, message: 'Please select the camera usage', trigger: 'change' }
    ],
    // location: [
    //   { required: true, message: 'Please enter the camera location detail', trigger: 'blur' }
    // ],
    locationType: [
      { required: true, message: 'Please select the location type', trigger: 'change' }
    ],
    areaId: [
      { required: true, message: 'Please select the location', trigger: 'change' }
    ],
    cameraIp: [
      { required: true, message: 'Please enter the camera ip', trigger: 'blur' }
    ],
    cameraPort: [
      { required: true, message: 'Please enter the camera port', trigger: 'blur' }
    ]
    // ,
    // cameraAccount: [
    //   { required: true, message: 'Please enter the camera account', trigger: 'blur' }
    // ],
    // cameraPassword: [
    //   { required: true, message: 'Please enter the camera password', trigger: 'blur' }
    // ]
}
  
  // 选项数据
  const cameraTypes = ref([
    { code: 'Video_Stream_Camera', value: 'Video Stream Camera' },
    { code: 'Face_Capture_Camera', value: 'Face Capture Camera' },
    { code: 'Library_Camera', value: 'Video/Image Library Camera' },
    { code: 'Video_Management_System_Camera', value: 'Video Management System Camera' }
  ])
  
  const locationTypes = ref([
    { code: 'entrance', value: 'Entrance' },
    { code: 'passage', value: 'Passage' },
    { code: 'lobby', value: 'Lobby' },
    { code: 'elevator', value: 'Elevator' }
  ])
  
  const ttlOptions = ref([
    { value: 7, label: '7天' },
    { value: 15, label: '15天' },
    { value: 30, label: '30天' },
    { value: 60, label: '60天' },
    { value: 90, label: '90天' }
  ])
  
  const departments = ref([])
  const areas = ref([])
  const groups = ref([])
  const places = ref([])
  const boxes = ref([])
  const manufacturers = ref(["Megvii","Hikvision","Dahua","Uniview","Other"])
  const cameraUsages = ref([
    {id:"live_streaming", name:"Live Streaming"},
    {id:"video_playback", name:"Video Playback"},
    {id:"anpr", name:"ANPR"},
    {id:"fr", name:"FR"},
    {id:"video_storage", name:"Video Storage"},
    {id:"behavior alarm", name:"Behavior Alarm"}
  ])
  const channelNumbers = ref([1, 2, 3, 4, 5, 6, 7, 8])
  
  // 加载选项数据
  const loadOptions = async () => {
    try {
      let areaList = await getAreas()
      areas.value = buildAreaTree(areaList)
      let deptList = await getDepartments()
      departments.value = buildDeptTree(deptList)
      
      groups.value = await getGroups()
      boxes.value = await getBoxes()
      // manufacturers.value = await getManufacturers()
    } catch (error) {
      console.error('Failed to load option data:', error)
    }
  }

    // 构建树形结构
  const buildAreaTree = (regions, parentId = null) => {
    let result = regions
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
        const children = buildAreaTree(regions, region.id)
        return {
          ...region,
          children: children.length > 0 ? children : undefined
        }
      });
      return result;
  }

  // 构建树形结构
  const buildDeptTree = (regions, parentId = 0) => {
    let result = regions
      .filter(region => {
        // 处理可能的空值
        const regionParentId = region.parentId === 0 ? 0 : region.parentId;
        if (parentId === 0) {
          return regionParentId === 0
        } else {
          return regionParentId === parentId
        }
      })
      .map(region => {
        const children = buildDeptTree(regions, region.id)
        return {
          ...region,
          children: children.length > 0 ? children : undefined
        }
      });
      return result;
  }
  
  // 相机类型变化
  const handleTypeChange = async (type) => {
    if (type === '2') {
      // 如果是图片流相机，加载智能盒数据
      try {
        boxes.value = await getBoxes()
      } catch (error) {
        console.error('加载智能盒数据失败:', error)
      }
    }
  }
  
  // 提交表单
  const submitForm = async () => {
    try {
      await formRef.value.validate()
      emit('submit', form.value)
      visible.value = false
    } catch (error) {
      ElMessage.error('Please check if the form is filled out correctly')
    }
  }
  
  // 初始化表单数据
  const initFormData = () => {
    if (props.mode === 'edit' && props.data) {
      form.value = { ...props.data }
      form.value.cameraUsage = (form.value.cameraUsage || []).map(Number)
      form.value.locationType = Number(form.value.locationType)
    } else {
      formRef.value?.resetFields()
    }
  }
  
  // 监听对话框显示状态
  watch(visible, (val) => {
    if (val) {
      loadOptions()
      initFormData()
    }
  })
  </script>
  
  <style scoped lang="scss">
  .rowshow {
    display: flex;
    flex-direction: row;
  }
  .form-section2 {
    display: flex;
    flex-direction: column;
  }
    .form-section-wrapper {
    height: 560px; /* 控制左侧滚动区域高度 */
    overflow-y: auto;
    padding-right: 12px;
    }

  .camera-dialog {
    .el-dialog__body {
        padding: 20px;
        max-height: 600px; /* 根据你的实际需求调整 */
        overflow: hidden; /* 避免整体滚动 */
        display: flex;
        flex-direction: column;
    }
    
    .camera-form {
        flex: 1;
        overflow: hidden;
      .form-section {
        margin-bottom: 20px;
        padding: 15px;
        border-radius: 4px;
        border: 1px dotted #252323;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      .form-tip {
        font-size: 12px;
        color: #999;
        margin-top: 5px;
        line-height: 1.5;
      }
      
      .storage-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .storage-ttl {
          display: flex;
          align-items: center;
          
          span {
            font-size: 12px;
            color: #666;
            margin-right: 8px;
          }
          
          .el-select {
            width: 90px;
          }
        }
      }
      
      .low-quality {
        margin-top: 10px;
      }
    }
    
    .map-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      .coordinates {
        margin-bottom: 10px;
        
        .coordinates-inputs {
          display: flex;
          gap: 10px;
          
          .coordinate-input {
            flex: 1;
          }
        }
      }
      
      .map-wrapper {
        height: 50vh;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .map-tip {
        margin-top: 8px;
        font-size: 12px;
        color: #999;
        display: flex;
        align-items: center;
        
        .el-icon {
          margin-right: 5px;
          font-size: 14px;
        }
      }
    }
    
    .dialog-footer {
      text-align: right;
      padding: 10px 20px;
      border-top: 1px solid #e6e6e6;
    }
  }
  </style>