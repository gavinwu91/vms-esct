import VehicleCaptureDetail from './detail.vue'
import IdentityInformation from '../../identity/index.vue'
import VehicleTracking from './track.vue'
import DriverFaceCompare from './driverFaceCompare.vue'
import DriverFaceSelect from './driverFaceSelect.vue'

export {
  VehicleCaptureDetail,
  IdentityInformation,
  VehicleTracking,
  DriverFaceCompare,
  DriverFaceSelect
}

export function getCountryImage(country) {
  if (country === 'Unknown') {
    return "https://192.168.80.185:8443/page/imgs/country/rect/Oman.svg?xx=0.889394221539701";
  }
  return "https://192.168.80.185:8443/page/imgs/country/rect/" + country + ".svg?xx=0.889394221539701";
}

export function getImageUrl(path) {
  return new URL(`/public/insight/${path}`, import.meta.url).href
}

export function imageShow(o) {
  return "https://192.168.80.185:8443/vehicle_img" + o;
}

export function personImageShow(o){
  return "https://192.168.80.185:8443/person_img/"+o;
}

export function getDay(day) {
  const today = new Date();
  const targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds);
  const tYear = today.getFullYear();
  let tMonth = today.getMonth();
  let tDate = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  return tYear + "-" + tMonth + "-" + tDate;
}

const doHandleMonth = (month) => {
  let m = month;
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  return m;
}


