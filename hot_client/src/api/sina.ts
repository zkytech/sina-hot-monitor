import {encodeUrlParam} from '../util'

type SinaData = SinaHot[]

/**
 * 获取指定时间范围内的微博热搜数据
 * @param start_date 
 * @param end_date 
 */
export const getSinaData = (start_date:number,end_date:number):Promise<APIResponse<SinaData>>=>{
    let url = '/sina/data'
    const payload = {start_date:start_date/1000,end_date:end_date/1000}
    url = encodeUrlParam(payload,url)
    return fetch(url,{
        credentials:'include',
        method:'GET'
    }).then(res=>res.json())
}

