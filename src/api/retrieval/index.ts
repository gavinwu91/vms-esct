import request from '@/config/axios'
import header from "@wangeditor/basic-modules/dist/basic-modules/src/modules/header";
import {getAccessToken} from "@/utils/auth";


export const getFaceImageRect = (data: any) => {
  return request.post({url: '/biz/retrieval/getFaceImageRect', data})
}



/**
 * 路人查询接口
 * @param passerbyId
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getPasserbyInfo = async (passerbyId: string) => {
  return request.get({url: '/biz/retrieval/getPasserbyInfo/' + passerbyId});
}


/**
 * 获取特征值选项
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getFeatures = () => {
  return request.get({url: '/biz/retrieval/getFeatures'});
}


/**
 * 获取设备信息
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getDevices = () => {
  return request.get({url: '/biz/retrieval/getDevices'});
}

/**
 * 获取性别
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getGenderList = () => {
  return request.get({url: '/biz/retrieval/getGenderList'});
}


/**
 * 证件类型
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getCardTypeList = async () => {
  return request.get({url: '/biz/retrieval/getCardTypeList'});
}

/**
 * 抓拍信息
 * @param data
 */
export const faceCaptureCount = async (data: any) => {
  return request.post({url: '/biz/retrieval/faceCaptureCount', data})
}


/**
 * 网络图片转base64
 * @param data
 */
export const convertUrlImageToBase64 = (data: any) => {
  return request.post({url: '/biz/retrieval/convertUrlImageToBase64', data})
}



/**
 * 抓拍信息
 * @param data
 */
export const page = (data: any) => {
  return request.post({url: '/biz/retrieval/page', data})
}


export const track = async (data: any) => {
  return request.post({url: '/biz/vehicleSearch/track', data})
}

/**
 * 同行人抓拍信息
 * @param data
 */
export const companion = async (data: any) => {
  return request.post({url: '/biz/retrieval/companion', data})
}


/**
 * 获取车辆抓拍的详情
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getVehicleCaptureDetail = (rid: string) => {
  return request.get({url: '/biz/retrieval/getVehicleCaptureDetail/' + rid});
}
