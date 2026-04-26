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

export const getLibraryPage = async (params: PageParam) => {
  return await request.get({ url: '/biz/manage/library/page', params })
}

export const getLibrary = async (id: number) => {
  return await request.get({ url: '/biz/manage/library/get?id=' + id })
}

export const createLibrary = async (data: LibraryVO) => {
  return await request.post({ url: '/biz/manage/library/create', data })
}

export const updateLibrary = async (data: LibraryVO) => {
  return await request.put({ url: '/biz/manage/library/update', data })
}


export const deleteLibrary = async (id: number) => {
  return await request.delete({ url: '/biz/manage/library/delete?id=' + id })
}


export const optionList = async () => {
  return await request.get({ url: '/biz/manage/library/optionList'})
}

