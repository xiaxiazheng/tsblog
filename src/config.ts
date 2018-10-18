let url: string = "";
if (process.env.NODE_ENV === 'development') {
  url = 'http://localhost:3000';
} else {
  url = 'http://123.207.5.131:80';
}
export const baseUrl = url;