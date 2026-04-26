import request from '@/config/axios'

export interface UpdateStatusReqVO {
  id: number
  status: number
}
export const PersonApi = {
  getPage: async (params: PageParam) => {
    return await request.get({ url: '/biz/libraryPersonController/list', params })
  },

  get: async (platformPersonId: string) => {
    return await request.get({ url: '/biz/libraryPersonController/get?platformPersonId=' + platformPersonId })
  },

  delete: async (platformPersonId: string) => {
    return await request.delete({ url: '/biz/libraryPersonController/delete?platformPersonId=' + platformPersonId })
  }
}
