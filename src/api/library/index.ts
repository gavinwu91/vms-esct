import request from '@/config/axios'

export interface LibraryVO {
  id: number
  libraryName: string
  libraryType: string
  deptId: number
  remark: string
  creator: string
  tenantId: number
}

export interface UpdateStatusReqVO {
  id: number
  status: number
}

export const getSurLibraryPage = async (params: PageParam) => {
  return await request.get({ url: '/biz/surLibrary/page', params })
}

export const getLibraryPage = async (params: PageParam) => {
  return await request.get({ url: '/biz/library/page', params })
}

export const getSurLibrary = async (id: number) => {
  return await request.get({ url: '/biz/surLibrary/get?id=' + id })
}

export const createSurLibrary = async (data: LibraryVO) => {
  return await request.post({ url: '/biz/surLibrary/create', data })
}

export const updateSurLibrary = async (data: LibraryVO) => {
  return await request.put({ url: '/biz/surLibrary/update', data })
}


export const deleteSurLibrary = async (id: number) => {
  return await request.delete({ url: '/biz/surLibrary/delete?id=' + id })
}


export const surOptionList = async (params: any) => {
  return await request.get({ url: '/biz/surLibrary/optionList',params})
}

export const staticOptionList = async () => {
  return await request.get({ url: '/biz/library/optionList'})
}

