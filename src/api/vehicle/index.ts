import request from '@/config/axios'


export interface VehicleCaptureInfo {
  rid: string
  checkpointId: string
  checkpointName: string
  cameraId: string
  cameraName: string
  licenseCode: string
  vehicleType: string
  speed: string
  captureTime: string
  vehicleColor: string
  licensePlateColor: string
  vehicleCountry: string
  brand: string
  laneNo: string
  imgPath: string
  imgPath2: string
  importTime: string
  captureTimeStr: string
  status: string
  longnum: string
  latnum: string
  location: string
  face1: string
  face2: string
  faceHas: string
  linkMethod: string
}


export function totalCharts(data: any) {
  return request.post({url: '/biz/vehicleSearch/totalCharts', data})
}

export function getDocumentTotal() {
  return request.get({url: '/biz/vehicleSearch/getDocumentTotal'})
}

export function queryCheckpoints(params) {
  return request.get({url: '/biz/vehicleSearch/queryCheckpoints', params})
}


export function search(data: any) {
  return request.post({url: '/biz/vehicleSearch/search', data})
}

export const track = async (data: any) => {
  return request.post({url: '/biz/vehicleSearch/track', data})
}


export const getUseResult = (data: any) => {
  return request.post({url: '/biz/vehicleSearch/getUseResult', data})
}

/**
 * 获取所有国家信息
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getCountryInfoList = async () => {
  return request.get({url: '/biz/vehicleSearch/getCountryInfoList'});
}

export function getFaceCompareResult(rid, faceIndex, data: any) {
  return request.post({
    url: "/biz/vehicleSearch/getFaceCompareResult/" + rid + "/" + faceIndex,
    data
  })
}


// export function getVehicleBrands() {
//   return request.post({url: `/vehicleDetails/getVehicleBrands`})
// }
