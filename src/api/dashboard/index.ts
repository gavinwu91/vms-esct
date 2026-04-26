import request from '@/config/axios'
interface TodayCount{
  faceCapture:number,
  vehicleCapture:number,
  faceAlarm:number,
  vehicleAlarm:number
}
export const DashboardAPI = {
  getTodayCount:async():Promise<TodayCount>=>{
    return await request.get({url:'/dashboard/getTodayCount'})
  },
  getAlarmMap :async () => {
    return await request.get({url: '/dashboard/getAlarmMap'})
  },
// 查询deviceList
  getDeviceMap : async() => {
    return await request.get({url: '/dashboard/getDeviceMap'})
  },
  getCaptureCount : async() => {
    return await request.get({url: '/dashboard/getCaptureCount'})
  },
  getCaptureQuantity : async() => {
    return await request.get({url: '/dashboard/getCaptureQuantity'})
  },
  getCameraDistribution : async() => {
    return await request.get({url: '/dashboard/getCameraDistribution'})
  },
  getDocuments :async () => {
    return await request.get({url: '/dashboard/getDocuments'})
  },
  getAlarmCount : async() => {
    return await request.get({url: '/dashboard/getAlarmCount'})
  },
  getVehicleQuantity : async() => {
    return await request.get({url: '/dashboard/getVehicleQuantity'})
  },
  getAlarms : async() => {
    return await request.get({url: '/dashboard/getAlarms'})
  },
  getFaceCaptures : async() => {
    return await request.get({url: '/dashboard/getFaceCaptures'})
  },
  getVehicleCaptures :async () => {
    return await request.get({url: '/dashboard/getVehicleCaptures'})
  }
}


