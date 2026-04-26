import request from '@/config/axios'

/**
 * 分页查询数据
 * @returns {Promise<AxiosResponse<any>>}
 * @param data
 */
export function personPage(data: any) {
  return request.post({url: "/biz/personDatabase/page", data})
}



