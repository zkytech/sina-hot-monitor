/**
 * 将对象转换为url参数，返回带参数的url
 * @param params
 */
export function encodeUrlParam(params: { [key: string]: any }, url: string) {
  let paramArray: string[] = [];
  Object.keys(params).forEach(key => paramArray.push(`${key}=${params[key]}`));
  return `${url}?${paramArray.join('&')}`;
}

const toString = Object.prototype.toString;

const isValidKey = (key: string) => {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
};

export const deepAssign = (target: any, ...args: any[]) => {
  let i = 0;
  if (isPrimitive(target)) target = args[i++];
  if (!target) target = {};
  for (; i < args.length; i++) {
    if (isObject(args[i])) {
      for (const key of Object.keys(args[i])) {
        if (isValidKey(key)) {
          if (isObject(target[key]) && isObject(args[i][key])) {
            deepAssign(target[key], args[i][key]);
          } else {
            target[key] = args[i][key];
          }
        }
      }
    }
  }
  return target;
};

function isObject(val: any) {
  return typeof val === 'function' || toString.call(val) === '[object Object]';
}

function isPrimitive(val: any) {
  return typeof val === 'object' ? val === null : typeof val !== 'function';
}
