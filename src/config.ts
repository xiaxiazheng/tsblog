// 前端访问路径及所在环境
let url: string = "";
let env: string = "";
if (process.env.NODE_ENV.match('productionPig')) {
  url = 'http://123.207.5.131:518/back';
  env = "productionPig";
} else if (process.env.NODE_ENV.match('production')) {
  url = 'http://123.207.5.131:80/back';
  env = "production";
} else {
  url = 'http://localhost:3000/back';
  env = "development";
}
console.log(process.env.NODE_ENV, url);
export const baseUrl = url;
export const baseEnv = env;

// 是否为手机端
let ispc = true;
if (window.screen.width < 600) {
  ispc = false;
}
export const isPC = ispc;
