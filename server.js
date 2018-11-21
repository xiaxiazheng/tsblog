const Koa = require('koa');
const app = new Koa();
const path = require('path');

const static = require('koa-static');  // 配置静态资源目录
const staticPath = './server/img';
app.use(static(path.join(__dirname, staticPath)));

const bodyParser = require('koa-bodyparser');  // 使用 ctx.body 解析中间件
app.use(bodyParser());

const cors = require('koa2-cors');  // 跨域访问组件，允许跨域访问
app.use(cors());

let routerjs = require('./server/router.js');  // 调用路由的配置
app.use(routerjs.router.routes());
app.use(routerjs.router.allowedMethods());

const historyApiFallback = require('koa2-connect-history-api-fallback');
app.use(historyApiFallback());

// 起服务
console.log("环境:", process.env.NODE_ENV);
if (!process.env.NODE_ENV) {  // 本地
	let server = app.listen(3000, 'localhost', function () {
		let host = server.address().address;
		let port = server.address().port;
		console.log('Graduation app listening at http://%s:%s', host, port);
	});
} else if (process.env.NODE_ENV.match("productionPig")) {  // 服务器端
	let server = app.listen(518, function () {
		let port = server.address().port;
		console.log('Graduation app listening at http://123.207.5.131:%s', port);
	});
} else {
	let server = app.listen(3000, function () {
		let port = server.address().port;
		console.log('Graduation app listening at http://123.207.5.131:%s', port);
	});
}