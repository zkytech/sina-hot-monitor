
/**
 * 将对象转换为url参数，返回带参数的url
 * @param params 
 */
export const encodeUrlParam = (params:{[key:string]:any},url:string)=>{
    let paramArray:string[] = []
    Object.keys(params).forEach(key=>paramArray.push(`${key}=${params[key]}`))
    return `${url}?${paramArray.join('&')}`
}