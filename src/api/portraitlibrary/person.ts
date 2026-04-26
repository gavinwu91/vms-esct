import request from '@/config/axios'

export interface UpdateStatusReqVO {
  id: number
  status: number
}
export const PersonApi = {
  page: async (params: PageParam) => {
    return await request.get({ url: '/biz/remote/libraryPerson/list', params })
  },

  get: async (params: any) => {
    return await request.get({
      url: '/biz/remote/libraryPerson/get',
      params
    })
  },
  save: async (data: FormData) => {
    return await request.upload({ url: '/biz/remote/libraryPerson/save', data })
  },
  delete: async (data: any) => {
    return await request.post({
      url: '/biz/remote/libraryPerson/delete',
      data
    })
  }
}
