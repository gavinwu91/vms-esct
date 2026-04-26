import axios from 'axios'

export const searchProfiles = (params) =>
    axios.post('/api/personProfile/v5/search/list/query/img', params)

export const deployToLibrary = (params) =>
    axios.post('/api/capture/v5/capture/monitor', params)
