import request from '@/config/axios'

export interface GroupDo {
  id: number
  name: string
  description: string
  createTime: string
  updateTime: string
}

export default {
  getAllGroups() {
    return request.get({ url: '/biz/device/group/list'})
  },
  getGroup(id) {
    return request.get(`/biz/device/group/${id}`)
  },
  createGroup(data) {
    return request.post({ url: '/biz/device/group/create', data })
  },
  updateGroup(id, data) {
    return request.put({ url: `/biz/device/group/update/${id}`, data })
  },
  deleteGroup(id) {
    return request.delete<boolean>({ url: `/biz/device/group/delete/${id}` })
  }
};