import request from '@/config/axios'

export const DashboardAPI = {
  statistics:async () =>{
    return await request.get({url:'/manageDashboard/statistics'})
  }
}


