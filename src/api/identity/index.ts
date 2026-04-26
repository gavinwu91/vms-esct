import request from '@/config/axios'

/**
 * 分页查询
 * @param params
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const personPage = async (data: any) => {
  return request.post({url: "/biz/identityChangedRecord/person", data});
}



export const rt968Page = async (data: any) => {
  return request.post({url: "/biz/identityChangedRecord/rt968", data});
}

export const vehiclePage = async (data: any) => {
  return request.post({url: "/biz/identityChangedRecord/vehicle", data});
}




/**
 * 获取真实身份
 * @param params
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getInsightPerson =  (id: string) => {
  return  request.get({url: '/biz/identityChangedRecord/getInsightPerson/' + id})
}

/**
 * 獲取家庭關係圖
 * @param params
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
/**
 * 獲取家庭關係圖
 * @param params
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getFamilyGraph = async (id: string) => {
  return request.get({url: '/biz/identityChangedRecord/graph?idNo=' + id});
}
export function familyRelations(relationType) {
  switch (relationType) {
    case "F":
      return "Father";
    case "M":
      return "Mother";
    case "H":
      return "Spouse"
  }
}


export function getAge(obj) {
  if (!obj) {
    return;
  }
  const birthDate = obj.birthDate?obj.birthDate : obj.dataBaseDOB;
  return (dataDiff(birthDate, obj.dateOfDeath) / 365).toFixed(0);
}

export function dataDiff(var1: any, var2: any) {
  if (!var1) {
    return;
  }
  const var1Str = var1.split("-");
  let date2;
  const date1 = new Date(var1Str[0], var1Str[1], var1Str[2])
  if (var2) {
    const var2Str = var2.split("-");
    date2 = new Date(var2Str[0], var2Str[1], var2Str[2])
  } else {
    date2 = new Date();
  }
  const t1 = date1.getTime();
  const t2 = date2.getTime();
  const dateTime = 1000 * 60 * 60 * 24;
  const minusDays = Math.floor(((t2 - t1) / dateTime));
  const days = Math.abs(minusDays);
  return days;
}


