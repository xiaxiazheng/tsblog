const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const app = new Koa();

// 使用路由
const Router = require('koa-router');
let router = new Router();

// 静态资源目录对于相对入口文件index.js的路径
const static = require('koa-static')
const staticPath = './server/img';
app.use(static(path.join( __dirname, staticPath)));

// 使用ctx.body解析中间件
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// 配置上传文件相关
const multer  = require('koa-multer');
let upload = multer({ dest: __dirname + '/' });

// 跨域访问组件，允许跨域访问
const cors = require('koa-cors');
app.use(cors());

// 公用函数
const Common = require('./server/common.js');
// 放在最前，返回dist里的index
router.get('/', async (ctx) => {
	let filedata;
	try {
	  filedata = await Common.readFile('./dist/index.html');
	} catch (err) {
		ctx.set('Content-Type', 'text/plain');
		ctx.status = 400;
		ctx.body = err.message;
	}
	ctx.set('Content-Type', 'text/html');
	ctx.status = 200;
	ctx.body = filedata;
});


/* 开始写接口 */
	// 登录
	let login = require('./server/login.js');
	router.post('/login', async (ctx) => {
		ctx.body = await login.checkLogin(ctx);
	});
	// 操作树节点
	let tree = require('./server/tree.js');
	router.get('/tree', async (ctx) => {
		ctx.body = await tree.getTree(ctx);
	});
	router.get('/getchildname', async (ctx) => {
		ctx.body = await tree.getChildName(ctx);
	});
	router.get('/addtreenode', async (ctx) => {
		ctx.body = await tree.addTreeNode(ctx);
	});
	router.get('/modifytreenode', async (ctx) => {
		ctx.body = await tree.modifyTreeNode(ctx);
	});
	router.get('/deletetreenode', async (ctx) => {
		ctx.body = await tree.deleteTreeNode(ctx);
	});
	router.get('/changesort', async (ctx) => {
		ctx.body = await tree.changeSort(ctx);
	});
	router.get('/changefather', async (ctx) => {
		ctx.body = await tree.changeFather(ctx);
	});
	// 操作子节点
	let cont = require('./server/cont.js');
	router.get('/cont', async (ctx) => {
    ctx.body = await cont.getNodeCont(ctx);
	});
	router.post('/addnodecont', async (ctx) => {
		ctx.body = await cont.addNodeCont(ctx);
	});
	router.post('/modifynodecont', async (ctx) => {
		ctx.body = await cont.modifyNodeCont(ctx);
	});
	router.get('/deletenodecont', async (ctx) => {
		ctx.body = await cont.deleteNodeCont(ctx);
	});
	router.get('/changecontsort', async (ctx) => {
		ctx.body = await cont.changeSort(ctx);
	});
	// 上传图片
	let image = require('./server/image.js');
	router.post('/main_upload', upload.single('image'), async (ctx) => {
		ctx.body = await image.saveMainImg(ctx);
	});
	router.post('/wall_upload', upload.single('image'), async (ctx) => {
		ctx.body = await image.saveWallImg(ctx);
	});
	router.get('/getimglist', async (ctx) => {
		ctx.body = await image.getImgList(ctx);
	});
	router.get('/deleteimg', async (ctx) => { // 删除main和wall的
		ctx.body = await image.deleteImg(ctx);
	});
  router.post('/treecont_upload', upload.single('treecont'), async (ctx) => { // treecont上传图片
    ctx.body = await image.saveTreeContImg(ctx);
	});
	router.get('/deletetreecontimg', async (ctx) => { // 删除treecont的
		ctx.body = await image.deleteTreeContImg(ctx);
	});
/* 结束 */


// 放在最后，用于传递文件
router.get('*', async (ctx) => {
	let filedata;
	try {
		filedata = await Common.readFile("./dist" + ctx.path);
	} catch (err) {
		ctx.set("Content-Type", "text/html");
		ctx.status = 400;
		ctx.body = err.message;
		// console.log("拿不到文件:%s", ctx.path);
		return;
	}

	let filename = ctx.path.substring(1);    // 去掉前导'/'
	let type = filename.substring(filename.lastIndexOf('.') + 1);
	let contType = getType(type);
	ctx.set("Content-Type", contType);
	ctx.status = 200;
	if(type === 'ico' || type === 'jpg' || type === 'jpeg' || type === 'png') { // 传图片和ico文件
		ctx.body = filedata;
	} else { // 其他
		ctx.body = filedata.toString();
	}
});

app.use(router.routes());
app.use(router.allowedMethods());


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
	let server = app.listen(80, function () {
		let port = server.address().port;
		console.log('Graduation app listening at http://123.207.5.131:%s', port);
	});
}

// 获取文件类型
function getType(endTag){
	let type = null;
	switch(endTag){
	case 'html' :
	case 'htm' :
			type = 'text/html; charset=UTF-8';
			break;
	case 'js' : 
			type = 'application/javascript; charset="UTF-8"';
			break;
	case 'css' :
			type = 'text/css; charset="UTF-8"';
			break;
	case 'txt' :
			type = 'text/plain; charset="UTF-8"';
			break;
	case 'manifest' :
			type = 'text/cache-manifest; charset="UTF-8"';
			break;
	case 'ico' :
			type = 'image/x-icon; charset="UTF-8"';
			break;
	case 'jpeg' :
	case 'jpg' :
			type = 'image/jpeg; charset="UTF-8"';
			break;
	case 'png' :
			type = 'image/png; charset="UTF-8"';
			break;
	default :
			type = 'application/octet-stream';
			break;
	}
	return type;
}