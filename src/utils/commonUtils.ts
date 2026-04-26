/**
 * 常用工具类函数
 */

// import {getSessionId} from "@/utils/sessionValidator.ts";

/**
 * 首字母大写
 * @param str 输入字符串
 * @returns 首字母大写的字符串
 */
export const capitalize = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 每个单词首字母大写
 * @param str 输入字符串
 * @returns 每个单词首字母大写的字符串
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return str
  return str.split(' ').map(word => capitalize(word)).join(' ')
}

/**
 * 文字过长截取用...代替
 * @param str 输入字符串
 * @param maxLength 最大长度
 * @param suffix 后缀，默认为 '...'
 * @returns 截取后的字符串
 */
export const truncate = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength) + suffix
}


export const handleVehicleCode = (obj: string):[] => {
  // const number = obj.replaceAll(/^[A-Z|a-z]?$/,"");
  // const latter = obj.replaceAll(/^[0-9]?$/,"");
 // return [obj.replaceAll(/\[A-Z|a-z]/g,""),obj.replaceAll(/\[0-9]/g,"")]
}

// export function dataDiff(var1: any, var2: any): any {
//     if (!var1) {
//         return;
//     }
//     let var1Str = var1.split("-");
//     let date2;
//     let date1 = new Date(var1Str[0], var1Str[1], var1Str[2])
//     if (var2) {
//         let var2Str = var2.split("-");
//         date2 = new Date(var2Str[0], var2Str[1], var2Str[2])
//     } else {
//         date2 = new Date();
//     }
//     let t1 = date1.getTime();
//     let t2 = date2.getTime();
//     let dateTime = 1000 * 60 * 60 * 24;
//     let minusDays = Math.floor(((t2 - t1) / dateTime));
//     let days = Math.abs(minusDays);
//     return days;
// }


export const goOtherPage = (url: string) => {
  window.open(url, '_blank')
}

// export function getAvg(obj: any): undefined | string {
//     if (!obj) {
//         return;
//     }
//     return (dataDiff(obj.birthDate, obj.dateOfDeath) / 365).toFixed(0);
// }

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param num 数字
 * @param decimals 小数位数，默认为0
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function trafficByteSize(val: any) {
  if (val / 1000 / 1000 / 1000 / 1000 >= 1) {
    return (val / 1000 / 1000 / 1000 / 1000).toFixed(2) + ' TB'
  } else if (val / 1000 / 1000 / 1000 >= 1) {
    return (val / 1000 / 1000 / 1000).toFixed(2) + ' GB'
  } else if (val / 1000 / 1000 >= 1) {
    return (val / 1000 / 1000).toFixed(2) + ' MB'
  } else if (val / 1000 >= 1) {
    return (val / 1000).toFixed(2) + ' KB'
  }
  return val + 'B'
}


/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 生成随机字符串
 * @param length 字符串长度，默认为8
 * @returns 随机字符串
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成随机ID
 * @returns 随机ID字符串
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
  let timeout: number | any
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }) as T
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const clonedObj = {} as any
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 检查对象是否为空
 * @param obj 要检查的对象
 * @returns 是否为空
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string') return obj.trim().length === 0
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 获取对象指定路径的值
 * @param obj 对象
 * @param path 路径，如 'user.name'
 * @param defaultValue 默认值
 * @returns 路径对应的值
 */
export const get = (obj: any, path: string, defaultValue?: any): any => {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * 设置对象指定路径的值
 * @param obj 对象
 * @param path 路径，如 'user.name'
 * @param value 要设置的值
 * @returns 设置后的对象
 */
export const set = (obj: any, path: string, value: any): any => {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
  return obj
}

/**
 * 数组去重
 * @param arr 数组
 * @param key 对象数组的去重键，可选
 * @returns 去重后的数组
 */
export const unique = <T>(arr: T[], key?: string): T[] => {
  if (!Array.isArray(arr)) return []

  if (key) {
    const seen = new Set()
    return arr.filter(item => {
      const value = get(item, key)
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }

  return [...new Set(arr)]
}

/**
 * 数组分组
 * @param arr 数组
 * @param key 分组键
 * @returns 分组后的对象
 */
export const groupBy = <T>(arr: T[], key: string): Record<string, T[]> => {
  return arr.reduce((groups, item) => {
    const groupKey = get(item, key)
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export const downloadFile = (url: string, filename?: string): void => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证身份证号格式
 * @param idCard 身份证号
 * @returns 是否有效
 */
export const isValidIdCard = (idCard: string): boolean => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

/**
 * 获取URL参数
 * @param name 参数名
 * @returns 参数值
 */
export const getUrlParam = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

/**
 * 设置URL参数
 * @param name 参数名
 * @param value 参数值
 */
export const setUrlParam = (name: string, value: string): void => {
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.replaceState({}, '', url.toString())
}

/**
 * 移除URL参数
 * @param name 参数名
 */
export const removeUrlParam = (name: string): void => {
  const url = new URL(window.location.href)
  url.searchParams.delete(name)
  window.history.replaceState({}, '', url.toString())
}

/**
 * 导航到用户详情页面（新标签页打开）
 * @param userId 用户ID
 * @param from 来源页面标识
 */
export const navigateToUserDetail = (
  userId: string,
  from: string = 'unknown'
): void => {
  const baseUrl = window.location.origin
  const sessionId = sessionStorage.getItem('sessionId') || ''
  const url = `${baseUrl}/user-profile/${userId}?sessionId=${encodeURIComponent(sessionId)}&from=${encodeURIComponent(from)}`

  // 在当前浏览器中打开新标签页
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 导航到用户详情页面（使用window.open打开）
 * @param userId 用户ID
 * @param from 来源页面标识
 * @param windowFeatures 窗口特性，默认为 'width=1200,height=800,scrollbars=yes,resizable=yes'
 */
export const navigateToUserDetailWithWindow = (
  userId: string,
  from: string = 'unknown',
  windowFeatures: string = 'width=1200,height=800,scrollbars=yes,resizable=yes'
): void => {
  const baseUrl = window.location.origin
  const sessionId = sessionStorage.getItem('sessionId') || ''
  const url = `${baseUrl}/user-profile/${userId}?sessionId=${encodeURIComponent(sessionId)}&from=${encodeURIComponent(from)}`

  // 使用window.open打开新窗口
  const windowName = `userDetail_${userId}_${Date.now()}`
  window.open(url, windowName, windowFeatures)
}


export const ispPhoneFormat = (phone: string): string | null => {
  if (phone && phone.includes("968")) {
    return phone.replace("968", "+968\t");
  }
  return phone;
}

export const nationalityFlag = (country: string | null) => {
  if (!country) {
    return `https://192.168.80.185:8443/page/imgs/country/rect/oman.svg?xx=0.889394221539701`
  }
  return `https://192.168.80.185:8443/page/imgs/country/rect/${country}.svg?xx=0.889394221539701`
}


export const vehicleBrandPic = (brand: string | null): string | undefined => {
  if (brand) {
    if (['audi', 'mercedes', 'kia'].includes(brand.toLowerCase())) {
      return ` https://192.168.80.185:8443/img/vehicle_brand/${brand.toLowerCase()}_less.svg`;
    }
    return ` https://192.168.80.185:8443/img/vehicle_brand/${brand.toLowerCase()}.svg`;
  }
}


export const normalSvgErrorHandle = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
}

export const isNormalCompany = (name: string): boolean => {
  return ["Ooredoo", "OoredooBill", "ooredoo", "omantel", "Omantel", "awasr", "Awasr", "vodafone", "Vodafone"].includes(name)
}

export const normalSvg = (name: string): string | null => {
  console.log(name, "===============")
  if (name.includes("Ooredoo") || name.includes("ooredoo")) {
    return "assets/icons/isp/Ooredoo.svg"
  }
  if (name.includes("omantel") || name.includes("Omantel")) {
    return "assets/icons/isp/omantel.svg"
  }
  if (name.includes("awasr") || name.includes("Awasr")) {
    return "assets/icons/isp/awasr_icon.png"
  }
  if (name.includes("vodafone") || name.includes("Vodafone")) {
    return "assets/icons/isp/vodafone.svg"
  }
  return '';
}

export const handleNullPersonPic = (event: Event) => {
  const target = event.target as HTMLImageElement;
  return '/vms/public/default_face.png'
}

export const handleVehicleBrandPic = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "assets/icons/vehicle/default_vehicle_brand.svg"
}

export const personalPic = (pic: string): string | null => {
  if (pic && !pic.includes("default_avatar.webp")) {
    return `https://192.168.80.185:8443/person_img/${pic}`
  }
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM2QjcyODAiLz4KPGNpcmNsZSBjeD0iNDAiIGN5PSIzMCIgcj0iMTIiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTE2IDYwQzE2IDUwIDI2IDQwIDQwIDQwQzU0IDQwIDY0IDUwIDY0IDYwIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo='
}

export function handleApp(app: any) {
  const google = ["google", "gstatic", "gtimg", "gboxlab"];
  if (google.some(item => item.includes(app))) {
    return "google";
  }

  const samsung = ["samsung"];
  if (samsung.some(item => item.includes(app))) {
    return "samsung"
  }

  const yandex = ["yandex", "yandexadexchange"];
  if (yandex.some(item => item.includes(app))) {
    return "yandex"
  }

  const tencent = ["qlogo", "tencent"]
  if (tencent.some(item => item.includes(app))) {
    return "tencent"
  }
  if (app.indexOf("hihonor") !== -1) {
    return "huawei"
  }
  const apple = ["apple", "me", "icloud"]
  if (apple.some(item => item.includes(app))) {
    return "apple"
  }
  if (app.indexOf("oneic") !== -1) {
    return "awaser"
  }
  const amazon = ["sc-cdn", "earnwith", "moengage", "eum-appdynamics"]
  if (amazon.some(item => item.includes(app))) {
    return "amazon"
  }

  const microsoft = ["microsoftapp", "appcenter", "microsoft", "window"]
  if (microsoft.some(item => item.includes(app))) {
    return "microsoft"
  }

  const aliyun = ["ali", "taobao"]
  if (aliyun.some(item => item.includes(app))) {
    return "aliyun"
  }
  const cloudflare = ["onesignal", "hubspot", "sgmbocast"]
  if (cloudflare.some(item => item.includes(app))) {
    return "cloudflare"
  }
  if (app.indexOf("kzhi") !== -1) {
    return "bigo"
  }
  if (app === "x") {
    return "twitter"
  }
  const tiktop = ["douyin", "zijie", "dingtalk", ""]
  if (tiktop.some(item => item.includes(app))) {
    return "tiktok";
  }
  const dingtalk = ["dingtalk", "ding"]
  if (dingtalk.some(item => item.includes(app))) {
    return "dingding"
  }
  if (app.indexOf("bankmuscat") !== -1) {
    return "bankmuscat"
  }
  if (app.indexOf("toutiao") !== -1) {
    return "toutiao"
  }
  if (app.indexOf("baidu") !== -1) {
    return "baidu"
  }
  if (app.indexOf("jd") !== -1) {
    return "jd"
  }
  return app;
}

//显示app的icon
export const showApplicationPNG = (name: string): string | null => {
  if (name) {
    return `https://192.168.80.185:8443/img/application/${handleApp(name)}.png`
  }
  return "https://192.168.80.185:8443/img/application/default_app.svg"
}


export const handleErrorNationality = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "https://192.168.80.185:8443/page/imgs/country/rect/oman.svg?xx=0.889394221539701"
}


//错误时显示默认的应用图标
export const handleApplicationPNGError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "https://192.168.80.185:8443/img/application/default_app.svg"
}


// 处理图片加载失败
export const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  // 使用SVG默认头像
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM2QjcyODAiLz4KPGNpcmNsZSBjeD0iNDAiIGN5PSIzMCIgcj0iMTIiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTE2IDYwQzE2IDUwIDI2IDQwIDQwIDQwQzU0IDQwIDY0IDUwIDY0IDYwIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=';
};


// 判断日期是否过期
export const isExpired = (dateString: string | any) => {
  const expiryDate = new Date(dateString);
  const today = new Date();
  return expiryDate < today;
};


// export const goLinkinfo = (mobile: string | any) => {
//     const url = `http://192.168.80.185:8080/faceboard/#/linkinfo?phone=${mobile}&JSESSIONID=${getSessionId()}&sessionId=${getSessionId()}`;
//     window.open(url, '_blank')
// }

export const handleExportWord = (id: string) => {
  const url = `https://192.168.80.185/prod-api/business/persona/exportWord?idNo=${id}`;
  console.log("handleExportWord:", url)
  location.href = url;
}

// export const goUserProfile = (id: string) => {
//     let url = `https://192.168.80.185:8443/#/CrowdPortrait?sessionId=${getSessionId()}&type=idcard&userId=${id}&identityId=${id}&JSESSIONID=${getSessionId()}`;
//     window.open(url, '_blank')
// }


// export const getDay = (day: any): any => {
//     let today = new Date();
//     let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
//     today.setTime(targetday_milliseconds);
//     let tYear = today.getFullYear();
//     let tMonth: string | number = today.getMonth() + 1;
//     let tDate: string | number = today.getDate();
//     if (tMonth.toString().length === 1) {
//         tMonth = "0" + tMonth;
//     }
//     if (tDate.toString().length == 1) {
//         tDate = "0" + tDate;
//     }
//     return new Date(tYear + "-" + tMonth + "-" + tDate + 'T00:00:00');
// }
