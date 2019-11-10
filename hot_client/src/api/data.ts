import { encodeUrlParam } from '../util';

/**
 * 获取指定时间范围内的微博热搜数据
 * @param start_date
 * @param end_date
 */
export const getSinaData = (
  start_date: number,
  end_date: number
): Promise<APIResponse<HotData[]>> => {
  let url = '/data/sina';
  const payload = { start_date: start_date / 1000, end_date: end_date / 1000 };
  url = encodeUrlParam(payload, url);
  return fetch(url, {
    credentials: 'include',
    method: 'GET'
  }).then(res => res.json());
};

/**
 * 获取指定时间范围内的知乎热搜数据
 * @param start_date
 * @param end_date
 */
export const getZhihuData = (
  start_date: number,
  end_date: number
): Promise<APIResponse<HotData[]>> => {
  let url = '/data/zhihu';
  const payload = { start_date: start_date / 1000, end_date: end_date / 1000 };
  url = encodeUrlParam(payload, url);
  return fetch(url, {
    credentials: 'include',
    method: 'GET'
  }).then(res => res.json());
};

/**
 * 获取指定时间范围内的bilibili热榜数据
 * @param start_date
 * @param end_date
 */
export const getBilibiliData = (
  start_date: number,
  end_date: number
): Promise<APIResponse<HotData[]>> => {
  let url = '/data/bilibili';
  const payload = { start_date: start_date / 1000, end_date: end_date / 1000 };
  url = encodeUrlParam(payload, url);
  return fetch(url, {
    credentials: 'include',
    method: 'GET'
  }).then(res => res.json());
};
