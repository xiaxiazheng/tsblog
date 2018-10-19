let url: string = "";
let env: string = "";
if (process.env.NODE_ENV.match('productionPig')) {
  url = 'http://123.207.5.131:518';
  env = "productionPig";
} else if (process.env.NODE_ENV.match('production')) {
  url = 'http://123.207.5.131:80';
  env = "production";
} else {
  url = 'http://localhost:3000';
  env = "development";
}
console.log(process.env.NODE_ENV, url);
export const baseUrl = url;
export const baseEnv = env;