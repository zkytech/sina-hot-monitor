/// <reference types="react-scripts" />
declare type APIResponse<T> ={
    success:boolean // 请求成功/失败
    data:T  // 数据
    message:string  // 消息
}

declare type SinaHot = {
    id:number   // id
    date_time:number    // 热搜排行榜时间
    title:string // 热搜标题
    rate:number // 热度
}