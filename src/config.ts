// 前端访问路径及所在环境
let url: string = "";
let env: string = "";
let host: string = "http://www.xiaxiazheng.cn";
if (process.env.NODE_ENV.match('production')) {
  if  (process.env.VUE_APP_TITLE.match('hyp')) {
    url = `${host}:518`;
    env = "productionPig";    
  }
  if (process.env.VUE_APP_TITLE.match('zyb')) {
    url = `${host}:3000`;
    env = "production";
  }
}
if (process.env.NODE_ENV.match('development')) {
  url = 'http://localhost:3000';
  env = "development";
}
// console.log('VUE_APP_TITLE: ', process.env.VUE_APP_TITLE);
// console.log(process.env.NODE_ENV, url);
export const baseImgUrl = url;
export const baseUrl = `${url}/back`;
export const baseEnv = env;

