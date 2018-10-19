let url: string = "";
if (process.env.NODE_ENV === 'production') {
  url = 'http://123.207.5.131:80';
} else {
  url = 'http://localhost:3000';
}
console.log(process.env.NODE_ENV, url);
export const baseUrl = url;