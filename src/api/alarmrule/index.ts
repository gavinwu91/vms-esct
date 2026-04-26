import request from '@/config/axios'

// 查询规则管理列表
export const getRulePage = (params: PageParam) => {
  return request.get({ url: '/biz/rule/page', params })
}

// 查询规则详情
export const getRule = (id: number) => {
  return request.get({ url: '/biz/rule/get?id=' + id })
}

// 新增规则
export const createRule = (data: any) => {
  return request.post({ url: '/biz/rule/create', data })
}

// 修改规则
export const updateRule = (data: any) => {
  return request.post({ url: '/biz/rule/update', data })
}

// 删除规则
export const deleteRule = (id: number) => {
  return request.delete({ url: `/biz/rule/delete/${id}` })
}

// 导出规则
export const exportRule = (params: any) => {
  return request.download({ url: '/biz/rule/export', params })
}

// 下载规则导入模板
export const importRuleTemplate = () => {
  return request.download({ url: '/biz/rule/get-import-template' })
}

// 下载规则导入模板
export const notifyTemplateOptions = () => {
  return request.download({ url: '/biz/rule/notifyTemplateOptions' })
}
