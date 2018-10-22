let fs = require('fs');
let express = require('express');
let app = express();

app.use(express.static('img'));  // 在这里设置了静态目录，到时直接用'域名+文件名'访问server/img目录下的静态文件

// 让req获取到参数
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 配置上传文件相关
let multer  = require('multer');
let upload = multer({ dest: __dirname + '/' });

// 给所有的加该请求头
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
	res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
	next();
});

// 放在最前，返回dist里的index
app.get('/', function(req, res) {
	fs.readFile('../dist/index.html', function(err, content) {
		if(err) {
			res.setHeader('Content-Type', 'text/plain');
			res.status(400).send(err.message);
		} else {
			res.setHeader('Content-Type', 'text/html');
			res.status(200).send(content);
		}
		res.end();
	});
});


/* 开始写接口 */
	// 登录
	let login = require('./login.js');
	app.post('/login', function(req, res) {
		login.checkLogin(req, res);
	});
	// 操作树节点
	let tree = require('./tree.js');
	app.get('/tree', function(req, res) {
    tree.getTree(req, res);
	});
	app.get('/getchildname', function(req, res) {
		tree.getChildName(req, res);
	});
	app.get('/addtreenode', function(req, res) {
		tree.addTreeNode(req, res);
	});
	app.get('/modifytreenode', function(req, res) {
		tree.modifyTreeNode(req, res);
	});
	app.get('/deletetreenode', function(req, res) {
		tree.deleteTreeNode(req, res);
	});
	app.get('/changesort', function(req, res) {
		tree.changeSort(req, res);
	});
	app.get('/changefather', function(req, res) {
		tree.changeFather(req, res);
	});
	// 操作子节点
	let cont = require('./cont.js');
	app.get('/cont', function(req, res) {
    cont.getNodeCont(req, res);
	});
	app.post('/addnodecont', function(req, res) {
		cont.addNodeCont(req, res);
	});
	app.post('/modifynodecont', function(req, res) {
		cont.modifyNodeCont(req, res);
	});
	app.get('/deletenodecont', function(req, res) {
		cont.deleteNodeCont(req, res);
	});
	app.get('/changecontsort', function(req, res) {
		cont.changeSort(req, res);
	});
	// 上传图片
	let image = require('./image.js');
	app.post('/main_upload', upload.single('image'), function (req, res) {
		image.saveMainImg(req, res);
	});
	app.post('/wall_upload', upload.single('image'), function (req, res) {
		image.saveWallImg(req, res);
	});
	app.get('/getimglist', function(req, res) {
		image.getImgList(req, res);
	});
	app.get('/deleteimg', function(req, res) { // 删除main和wall的
		image.deleteImg(req, res);
	});
  app.post('/treecont_upload', upload.single('treecont'), function(req, res) { // treecont上传图片
    image.saveTreeContImg(req, res);
	});
	app.get('/deletetreecontimg', function(req, res) { // 删除treecont的
		image.deleteTreeContImg(req, res);
	});
/* 结束 */


// 放在最后，用于传递文件
app.get('*', function(req, res) {
	// console.log(req.baseUrl);    // 这个拿不到值
	// console.log(req.path)        // 这个可以
	// console.log(req.originalUrl) // 这个也可以
	fs.readFile("../dist" + req.path, function(err, data) {
		if(err) {
			res.setHeader("Content-Type", "text/html");
			res.status(400).send(err.message);
			console.log("拿不到文件:%s", req.path);
		}
		else {
			let filename = req.path.substring(1);    // 去掉前导'/'
			let type = filename.substring(filename.lastIndexOf('.') + 1);
      let contType = getType(type);
			res.writeHead(200, { "Content-Type": contType });
			if(type === 'ico' || type === 'jpg' || type === 'jpeg' || type === 'png') { // 传图片和ico文件
				res.write(data, "binary");
			} else { // 其他
				res.write(data.toString());
			}
		}
		res.end();
	});
});

// 获取文件类型
function getType(endTag){
	let type=null;
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