import request from '@/config/axios'
// 车牌报警历史消息 API
export const AlarmPlateMsgApi = {
  // 查询车牌报警历史消息分页
  getAlarmPlateMsgPage: async (params: any) => {
    return await request.get({ url: `/biz/alarm-plate-msg/page`, params })
  },

  // 查询车牌报警历史消息详情
  getAlarmPlateMsg: async (id: number) => {
    return await request.get({ url: `/biz/alarm-plate-msg/get?id=` + id })
  },

  // 查询车牌报警历史消息详情
  getAlarmPlateDetail: async (params: any) => {
    return await request.get({ url: `/biz/alarm-plate-msg/getAlarmPlateDetail`, params })
  },


  // 查询车牌抓拍详情
  getCapturePlateDetail: async (param: any) => {
    return await request.get({ url: `/biz/alarm-plate-msg/getCapturePlateDetail`,param})
  },
  // 查询vs8440的rid
  getVsRid: async (rid: String) => {
    return await request.get({ url: `/biz/alarm-plate-msg/getVsRid/${rid}`})
  },

  // 新增车牌报警历史消息
  createAlarmPlateMsg: async (data: any) => {
    return await request.post({ url: `/biz/alarm-plate-msg/create`, data })
  },

  // 修改车牌报警历史消息
  updateAlarmPlateMsg: async (data: any) => {
    return await request.post({ url: `/biz/alarm-plate-msg/update`, data })
  },

  // 删除车牌报警历史消息
  deleteAlarmPlateMsg: async (id: number) => {
    return await request.delete({ url: `/biz/alarm-plate-msg/delete?id=` + id })
  },

  // 导出车牌报警历史消息 Excel
  exportAlarmPlateMsg: async (params) => {
    return await request.download({ url: `/biz/alarm-plate-msg/export-excel`, params })
  }
}
export function imageShow(url) {
  return "https://192.168.80.185:8443/vehicle_img" + url;
}

export function personImageShow(url){
  return "https://192.168.80.185:8443/person_img/"+url;
}


export function getDay(day) {
  const today = new Date();
  const targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds);
  const tYear = today.getFullYear();
  let tMonth = today.getMonth();
  let tDate = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  return tYear + "-" + tMonth + "-" + tDate;
}

const doHandleMonth = (month) => {
  let m = month;
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  return m;
}