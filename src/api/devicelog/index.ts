import request from '@/config/axios'

export function getList(params) {
   return request.get({ url: '/biz/device-log/page', params})
}

export function statistics(params) {
   return request.get({ url: '/biz/device-log/statistics',params})
}