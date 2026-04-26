import request from '@/config/axios'

// face alarm VO
export interface AlarmTaskVO {
  id: number // ID
  deptId: number // DeptId
  apiTaskId: string // Kunlun alarm id
  strategyName: string // Strategy name
  status: number // Status
  termType: number // Term type
  startTime: Date // Start time
  endTime: Date // End time
  alarmsCount: number // No of alarms
  albumList: string // Album list
  albumId: number // Album id
  threshold: number // Threshold 0-100
  albumType: number // Album type
  cameraIds: string // Camera ids
}

// face alarm API
export const AlarmTaskApi = {



  // 查询face alarm分页
  getAlarmTaskPage: async (params: any) => {
    return await request.get({ url: `/biz/alarm-task/page`, params })
  },


  // 查询face alarm options
  getTaskOptions: async () => {
    return await request.get({ url: `/biz/alarm-task/taskOptions`})
  },

  // 查询face alarm详情
  getAlarmTask: async (id: number) => {
    return await request.get({ url: `/biz/alarm-task/get?id=` + id })
  },


  // 查询监控库
  getSurveillanceLibrary: async () => {
    return await request.get({ url: `/biz/alarm-task/getSurveillanceLibrary`})
  },

  // 新增face alarm
  createAlarmTask: async (data: any) => {
    return await request.post({ url: `/biz/alarm-task/create`, data })
  },


  // 新增face alarm
  uploadAlarmTask: async (data: any) => {
    return await request.upload({ url: `/biz/alarm-task/create`, data })
  },

  // 修改face alarm
  updateAlarmTask: async (data: any) => {
    return await request.upload({ url: `/biz/alarm-task/update`, data })
  },

  // 删除face alarm
  deleteAlarmTask: async (id: number) => {
    return await request.delete({ url: `/biz/alarm-task/delete?id=` + id })
  },

  // 导出face alarm Excel
  exportAlarmTask: async (params) => {
    return await request.download({ url: `/biz/alarm-task/export-excel`, params })
  }
}