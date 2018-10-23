/** 后台公用函数 */
// 获取当前日期时间，格式“yyyy-MM-dd HH:MM:SS”
exports.getNowFormatDate = function () {
  let date = new Date();
  let seperator1 = "-";
  let seperator2 = ":";
  let month = date.getMonth() + 1;
  let strDate = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  if(month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if(strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  if(hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  if(minute >= 0 && minute <= 9) {
    minute = "0" + minute;
  }
  if(second >= 0 && second <= 9) {
    second = "0" + second;
  }
  let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + hour + seperator2 + minute + seperator2 + second;
  return currentdate;
};

// 获取一个极大的随机数
exports.getRandomNum = function () {
  return Math.round(Math.random() * 2147483647);
};

// 获取处理过的图片名
exports.getImageName = function (name, id) {
  console.log(name);
  let nameArray = name.split(".");

  let filerealname = '';
  for (let i = 0; i < nameArray.length - 1; i++) {
    filerealname += nameArray[i];
    if(i === nameArray.length - 2) {
      filerealname += id;
    }
    filerealname += '.';
  }
  return filerealname + nameArray[nameArray.length - 1];
}


let fs = require('fs');
// 读取文件
exports.readFile = function (fPath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fPath, function(err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
// 写入文件
exports.writeFile = function (fPath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fPath, content, function(err, data) {
      if (err) reject(err);
      else resolve("Successed");
    });
  });
}
// 删除文件
exports.deleteFile = function (fPath) {
  return new Promise(function(resolve, reject) {
    fs.unlink(fPath, function (err) {  // 删除缓存
      if(err) reject(err);
      else resolve("Successed");
    });
  });
}

// 获取文件类型
exports.getType = function (endTag) {
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