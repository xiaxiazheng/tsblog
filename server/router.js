const path = require('path');
const multer = require('koa-multer');  // 配置上传文件相关
let upload = multer({ dest: __dirname + '/' });
const Router = require('koa-router');  // 使用路由
let router = new Router();
const Common = require('./common.js');

// 放在最前，返回dist里的index
router.get('/', async (ctx) => {
	let filedata;
	try {
	  filedata = await Common.readFile(path.join(__dirname, '../dist/index.html'));
	} catch (err) {
		ctx.set('Content-Type', 'text/plain');
		ctx.status = 400;
		ctx.body = err.message;
	}
	ctx.set('Content-Type', 'text/html');
	ctx.status = 200;
	ctx.body = filedata;
});

const backUrl = '/back';  /* 绕开前端的 history 模式，不然路径叠加了 */

/* 开始写接口 */
// 登录
	let login = require('./login.js');
	router.post(backUrl + '/login', async (ctx) => {
		ctx.body = await login.checkLogin(ctx);
	});
// 操作树节点
	let tree = require('./tree.js');
	router.get(backUrl + '/tree', async (ctx) => {
		ctx.body = await tree.getTree(ctx);
	});
	router.get(backUrl + '/getchildname', async (ctx) => {
		ctx.body = await tree.getChildName(ctx);
	});
	router.post(backUrl + '/addtreenode', async (ctx) => {
		ctx.body = await tree.addTreeNode(ctx);
	});
	router.post(backUrl + '/modifytreenode', async (ctx) => {
		ctx.body = await tree.modifyTreeNode(ctx);
	});
	router.post(backUrl + '/deletetreenode', async (ctx) => {
		ctx.body = await tree.deleteTreeNode(ctx);
	});
	router.post(backUrl + '/changesort', async (ctx) => {
		ctx.body = await tree.changeSort(ctx);
	});
	router.post(backUrl + '/changefather', async (ctx) => {
		ctx.body = await tree.changeFather(ctx);
	});
// 操作子节点
	let cont = require('./cont.js');
	router.get(backUrl + '/cont', async (ctx) => {
    ctx.body = await cont.getNodeCont(ctx);
	});
	router.post(backUrl + '/allcont', async (ctx) => {
		ctx.body = await cont.getAllCont(ctx);
	});
	router.post(backUrl + '/almostcont', async (ctx) => {
		ctx.body = await cont.getAlmostCont(ctx);
	});
	router.post(backUrl + '/addnodecont', async (ctx) => {
		ctx.body = await cont.addNodeCont(ctx);
	});
	router.post(backUrl + '/modifynodecont', async (ctx) => {
		ctx.body = await cont.modifyNodeCont(ctx);
	});
	router.post(backUrl + '/deletenodecont', async (ctx) => {
		ctx.body = await cont.deleteNodeCont(ctx);
	});
	router.post(backUrl + '/changecontsort', async (ctx) => {
		ctx.body = await cont.changeContSort(ctx);
	});
// 上传图片
	let image = require('./image.js');
	router.post(backUrl + '/main_upload', upload.single('image'), async (ctx) => {
		ctx.body = await image.saveMainImg(ctx);
	});
	router.post(backUrl + '/wall_upload', upload.single('image'), async (ctx) => {
		ctx.body = await image.saveWallImg(ctx);
	});
	router.get(backUrl + '/getimglist', async (ctx) => {
		ctx.body = await image.getImgList(ctx);
	});
	router.post(backUrl + '/deleteimg', async (ctx) => { // 删除main和wall的
		ctx.body = await image.deleteImg(ctx);
	});
  router.post(backUrl + '/treecont_upload', upload.single('treecont'), async (ctx) => { // treecont上传图片
    ctx.body = await image.saveTreeContImg(ctx);
	});
	router.post(backUrl + '/deletetreecontimg', async (ctx) => { // 删除treecont的
		ctx.body = await image.deleteTreeContImg(ctx);
	});
// 操作日志
	let log = require('./log.js');
	router.post(backUrl + '/loglistbyctime', async (ctx) => {
		ctx.body = await log.getAllLogListByCTime(ctx);
	});
	router.post(backUrl + '/loglistbymtime', async (ctx) => {
		ctx.body = await log.getAllLogListByMTime(ctx);
	});
	router.get(backUrl + '/logcont', async (ctx) => {
    ctx.body = await log.getLogCont(ctx);
	});
	router.post(backUrl + '/addlogcont', async (ctx) => {
		ctx.body = await log.addLogCont(ctx);
	});
	router.post(backUrl + '/modifylogcont', async (ctx) => {
		ctx.body = await log.modifyLogCont(ctx);
	});
	router.post(backUrl + '/deletelogcont', async (ctx) => {
    ctx.body = await log.deleteLogCont(ctx);
	});
/* 结束 */

// 放在最后，用于传递文件
router.get('*', async (ctx) => {
	let filedata;
	try {
		filedata = await Common.readFile(path.join(__dirname, "../dist" + ctx.path));
	} catch (err) {
		ctx.set("Content-Type", "text/html");
		ctx.status = 400;
		ctx.body = err.message;
		// console.log("拿不到文件:%s", ctx.path);
		return;
	}

	let filename = ctx.path.substring(1);    // 去掉前导'/'
	let type = filename.substring(filename.lastIndexOf('.') + 1);
	let contType = Common.getType(type);
	ctx.set("Content-Type", contType);
	ctx.status = 200;
	if(type === 'ico' || type === 'jpg' || type === 'jpeg' || type === 'png') { // 传图片和ico文件
		ctx.body = filedata;
	} else { // 其他
		ctx.body = filedata.toString();
	}
});

exports.router = router;