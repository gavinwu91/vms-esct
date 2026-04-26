import request from '@/config/axios'

// 人脸报警历史消息 VO
export interface AlarmFaceMsgVO {
  id: number // ID
  apiAlarmId: string // Api_ID
  deptId: number // DeptId
  alarmNo: string // Alarm_no
  status: number // Status
  trackId: string // Track_id
  captureTime: Date // Capture_time
  albumPhotoUrl: string // Album_photo_url
  cropUrl: string // Crop_url
  relationUrl: string // Relation_url
  fullUrl: string // Full_url
  clipUrl: string // Clip_url
  albumId: string // Album_id
  score: number // Score
  cameraId: string // Camera_id
  cropLocator: string // Crop_locator
  fullLocator: string // Full_locator
  photoInfo: string // PhotoInfo
}



//sdfdsfdsfsd
// 人脸报警历史消息 API
export const AlarmFaceMsgApi = {
  // 查询人脸报警历史消息分页
  getAlarmFaceMsgPage: async (params: any) => {
    return await request.get({ url: `/biz/alarm-face-msg/page`, params })
  },

  
  // 根据类型查询告警数量 1  人脸 5 车牌  type 没有则是查询车牌和人脸的总和
  getAlarmCountByType: async (params: any) => {
    return await request.get({ url: `/biz/alarm-face-msg/alarmCountByType`, params })
  },

  // 查询人脸报警历史消息详情
  getAlarmFaceMsg: async (id: number) => {
    return await request.get({ url: `/biz/alarm-face-msg/get?id=` + id })
  },

  // 新增人脸报警历史消息
  createAlarmFaceMsg: async (data: AlarmFaceMsgVO) => {
    return await request.post({ url: `/biz/alarm-face-msg/create`, data })
  },

  // 修改人脸报警历史消息
  updateAlarmFaceMsg: async (data: any) => {
    return await request.post({ url: `/biz/alarm-face-msg/update`, data })
  },

  // 删除人脸报警历史消息
  deleteAlarmFaceMsg: async (id: number) => {
    return await request.delete({ url: `/biz/alarm-face-msg/delete?id=` + id })
  },

  // 导出人脸报警历史消息 Excel
  exportAlarmFaceMsg: async (params) => {
    return await request.download({ url: `/biz/alarm-face-msg/export-excel`, params })
  }
}