import request from '@/config/axios'

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

export function getAreaTree(params: SearchParam) {
  return request.get({ url: '/biz/device/area/tree', params})
}

// 获取相机列表
export function getCameras(params) {
  return request.get({ url: '/biz/device/camera/list', params })
}