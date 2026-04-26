import request from '@/config/axios'

// types.ts
export interface AreaDo {
  id: number
  name: string
  code: string
  typeLevel: number
  parentId: number | null
  parentName?: string
  sort: number
  status: number
  remark?: string
  createTime: string
}

interface SearchParam {
  name?: string
  parentId?: number
  status?: number
}

export interface AreaTreeVO extends AreaDo {
  children?: AreaTreeVO[]
}

export function getCamerasByRole(params) {
   return request.get({ url: '/biz/device/camera/role_cameras', params})
}

export function getPermissionDeviceTree(params) {
  return request.get({url: '/biz/device/camera/permission_tree', params})
}

export function loadCameraTree(params) {
  if (!params.areaId || !params.areaId===undefined) {
    params.areaId = '0'
  }
  return request.get({url: `/biz/device/camera/loadCameraTree?areaId=${params.areaId}&cameraType=${params.cameraType}`})
}
//过滤查询
export function filterPermissionDeviceTree(params) {
  return request.get({url: '/biz/device/camera/filter_permission_tree', params})
}


// 获取区域详情
export const getParentArea = (params) => {
  return request.get({url: `/biz/device/camera/getParentArea`,params})
}


export function getPermissionDeviceList(params){
  return request.get({ url: '/biz/device/camera/permission_list',params})
}

export function getBboxZoomList(params){
  return request.get({ url: '/biz/device/camera/getBboxZoomList',params})
}

// 获取相机列表
export function getCameras(params) {
    return request.get({ url: '/biz/device/camera/list', params })
}

// 更新相机状态
export function updateCameraStatus(id, params) {
  return request.put({ url: `/biz/device/camera/status/${id}`, params })
}

// 删除相机
export function deleteCamera(id) {
   return request.delete<boolean>({ url: `/biz/device/camera/${id}` })
}

export function deleteCameras(data) {
   return request.post({ url: '/biz/device/camera/batchDelete', data })
}

export function enableCameras(data) {
   return request.post({ url: '/biz/device/camera/batchEnable', data })
}
export function disableCameras(data) {
   return request.post({ url: '/biz/device/camera/batchDisable', data })
}
// 创建相机
export function createDevice(data) {
  return request.post({ url: '/biz/device/camera/create', data })
}

// 更新相机
export function updateCamera(data) {
}

export function getCameraStat(params) {
 return request.get({ url: '/biz/device/camera/getCameraStat', params })
}
// 获取部门列表
export function getDepartments() {
  return request.get({ url: '/system/dept/list-all-simple'})
}

// 获取区域列表
export function getAreas() {
  return request.get({ url: '/biz/device/area/options'})
}

// 获取分组列表
export function getGroups() {
   return request.get({ url: '/biz/device/group/list'})
}

// 获取智能盒列表
export function getBoxes() {
}

// 获取相机厂商列表
export function getManufacturers() {
}

// 获取相机型号列表
export function getCameraModels(manufacturerId) {
}

// 批量导入相机
export function importCameras(data) {
  return request.upload({ url: `/biz/device/camera/upload`, data })
}

// 下载导入模板
export function downloadTemplate() {
  return request.download({ url: '/biz/device/camera/downloadTemplate'})
}


export function getAreaTree(params: SearchParam) {
  console.log("----------------" + JSON.stringify(params))
     return request.get({ url: '/biz/device/area/tree', params})
}

export function getAreaOptions() {
    return request.get({ url: '/biz/device/area/options'})
}

export const createArea = (data: AreaDo) => {
  return request.post({ url: '/biz/device/area/create', data })
}


// 更新区域
export const updateArea = (data: AreaDo) => {
  return request.post({ url: '/biz/device/area/create', data })
}

// 删除区域
export const deleteArea = (id: number) => {
  console.log(id)
  return request.delete<number>({ url: `/biz/device/area/delete/${id}` })

}

// 获取区域详情
export const getAreaById = (id: number) => {
  return request.get<AreaDo>(`/biz/device/area/${id}`)
}






