import request from '@/config/axios'

export interface UpdateStatusReqVO {
  id: number
  status: number
}
export const PersonApi = {
  getPage: async (params: PageParam) => {
    return await request.get({ url: '/biz/surPersonController/list', params })
  },

  getPage2: async (params: PageParam) => {
    return await request.get({ url: '/biz/libraryPersonController/list', params })
  },

  get: async (platformPersonId: string) => {
    return await request.get({
      url: '/biz/surPersonController/get?platformPersonId=' + platformPersonId
    })
  },
  get2: async (params: any) => {
    return await request.get({
      url: '/biz/libraryPersonController/get',params})
  },

  delete: async (data: any) => {
    return await request.post({ url: '/biz/surPersonController/delete', data })
  },

  save: async (params: FormData) => {
    return await request.upload({ url: '/biz/surPersonController/save', data: params })
  },
  copy: async (params : any) =>{
      return await request.post({ url: '/biz/libraryPersonController/copy', data:params})
    }
}
