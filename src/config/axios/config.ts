import type { AxiosHeaders } from 'axios'

const runtimeConfig = (window as any).RUNTIME_CONFIG || {};

const base_url_host = runtimeConfig.VITE_BASE_URL;
const base_url_api = import.meta.env.VITE_API_URL;

const config: {
  base_url: string
  result_code: number | string
  default_headers: AxiosHeaders | string
  request_timeout: number
} = {
  /**
   * api请求基础路径
   */
  // base_url: import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL,
  base_url: base_url_host + base_url_api,
  /**
   * 接口成功返回状态码
   */
  result_code: 200,

  /**
   * 接口请求超时时间
   */
  request_timeout: 300000,

  /**
   * 默认接口请求类型
   * 可选值：application/x-www-form-urlencoded multipart/form-data
   */
  default_headers: 'application/json'
}


export { config }
