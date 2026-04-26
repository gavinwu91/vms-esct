export const statusOptions = [
  { id: 1, name: 'Unconfirm' },
  { id: 2, name: 'Unreceipt' },
  { id: 3, name: 'Unfeedback' },
  { id: 4, name: 'Closed' }
]
export function getStatusName(status) {
  if (status) {
    return statusOptions.find((x) => x.id == status).name
  }
  return null
}

export function getVehicleType(url) {
  const paramArr = url.split('_')
  return paramArr[4]
}

export function formatAbumName(name) {
  if (name.length > 10) {
    return name.substring(0, 10) + '...'
  }
  return name
}
export function getImageUrl(source){
  let url
  switch(source){
    case 'default_face':
      url = `${import.meta.env.VITE_BASE_PATH}/default_face.png`
      break
    case 'alarm_sound':
      url = `${import.meta.env.VITE_BASE_PATH}/images/alarm/alarm.png`
      break
    default:
      url = `${import.meta.env.VITE_BASE_PATH}/default_face.png`
  }
  return url
}


