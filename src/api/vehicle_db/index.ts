import request from '@/config/axios'

export function detailsPage(data: any) {
  return request.post({url: "/biz/vehicleDatabase/page", data})
}

export function details(data: any) {
  return request.post({url: "/biz/vehicleDatabase/details", data})
}

export const getRealIdentity = (data: any) => {
  return request.post({url: "/biz/vehicleDatabase/getRealIdentity", data})
}


export function checkImgUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url;
  })
}

export function getBrandPngLogo(o) {
  if (!o.vehicleMakerEnglish) return "";
  return 'https://192.168.80.185:8443/img/vehicle_brand/' + o.vehicleMakerEnglish.toLowerCase() + '.png';
}

export function getBrandLogo(o) {
  if (!o.vehicleMakerEnglish) return "";
  return 'https://192.168.80.185:8443/img/vehicle_brand/' + o.vehicleMakerEnglish.toLowerCase() + '.svg';
}


