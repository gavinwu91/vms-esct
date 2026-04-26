import { config } from '@/utils/runtimeConfig'
export function getKsProxyUrl(source) {
  const basePath = `${config.KS_PROXY_URL}`
  let proxyUrl = ''
  if (basePath.includes('localhost')) {
    proxyUrl = `https://192.168.88.192/ks-pic/`
  } else {
    proxyUrl = `${basePath}/`
  }
  let proxyKsImageUrl
  if (source) {
    if (source.includes('http://10.1.0.20:8080/')) {
      proxyKsImageUrl = source.replace('http://10.1.0.20:8080/', proxyUrl)
      return proxyKsImageUrl
    } else if (source.includes('https://192.168.80.185/ks-pic/')) {
      proxyKsImageUrl = source.replace('https://192.168.80.185/ks-pic/', proxyUrl)
      return proxyKsImageUrl
    }
    return source
  }
}
