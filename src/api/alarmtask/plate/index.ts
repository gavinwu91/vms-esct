import request from '@/config/axios'

// plate alarm VO
export interface AlarmTaskVO {
  id: number // ID
  deptId: number // DeptId
  apiTaskId: string // Kunlun alarm id
  strategyName: string // Strategy name
  carNumber: string
  status: number // Status
  termType: number // Term type
  startTime: Date // Start time
  endTime: Date // End time
  alarmsCount: number // No of alarms
  cameraIds: string // Camera ids
}

// plate alarm API
export const AlarmTaskApi = {
  // 查询plate alarm分页
  getAlarmTaskPage: async (params: any) => {
    return await request.get({ url: `/biz/alarm-platetask/page`, params })
  },

  // 查询plate options
  getLarmTaskOptions: async () => {
    return await request.get({ url: `/biz/alarm-platetask/taskOptions`})
  },

  // 查询plate alarm详情
  getAlarmTask: async (id: number) => {
    return await request.get({ url: `/biz/alarm-platetask/get?id=` + id })
  },

  // 新增plate alarm
  createAlarmTask: async (data: any) => {
    return await request.post({ url: `/biz/alarm-platetask/create`, data })
  },

  // 修改plate alarm
  updateAlarmTask: async (data: any) => {
    return await request.put({ url: `/biz/alarm-platetask/update`, data })
  },

  // 删除plate alarm
  deleteAlarmTask: async (id: number) => {
    return await request.delete({ url: `/biz/alarm-platetask/delete?id=` + id })
  },

  // 导出plate alarm Excel
  exportAlarmTask: async (params) => {
    return await request.download({ url: `/biz/alarm-platetask/export-excel`, params })
  }
}