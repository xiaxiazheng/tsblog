/** 上传图片 */
let { query } = require('./db.js');
let Common = require('./common.js');
let fs = require('fs');

/** 获取上传的图片保存到本地，并将文件名保存到数据库 */
// 主页的，main
exports.saveMainImg = async (ctx) => {
  // console.log(ctx.request.file);  /* 上传的文件信息 */
  let img_id = Common.getRandomNum();
  let filename = Common.getImageName(ctx.request.file.originalname, img_id);
  let des_file = __dirname + "/img/main/" + filename; /* 这里要注意，因为这个文件已经在server里了，所以这里的__dirname是有server的 */
  fs.readFile(ctx.request.file.path, function (err, data) {
    fs.writeFile(des_file, data, async function (err) {
      if( err ){
        console.log( err );
      } else {
        let time = Common.getNowFormatDate();
        let sql = "INSERT INTO image VALUES (?, ?, ?, 'main', ?)";
        let array = [img_id, ctx.request.file.originalname, filename, time];
        await query(sql, array);

        fs.unlink(ctx.request.file.path, function (err) {  // 删除缓存
          if(err) {
            return {
              resultsCode: 'error',
              message: err
            };
          } else {
            return {
              resultsCode: 'success',
              message: '保存图片成功'
            };
          }
        });
      }
    });
  });
};

// 图片墙的，wall
exports.saveWallImg = async (ctx) => {
  // console.log(ctx.request.file);  /* 上传的文件信息 */
  let img_id = Common.getRandomNum();
  let filename = Common.getImageName(ctx.request.file.originalname, img_id);
  let des_file = __dirname + "/img/wall/" + filename; /* 这里要注意，因为这个文件已经在server里了，所以这里的__dirname是有server的 */
  fs.readFile(ctx.request.file.path, function (err, data) {
    fs.writeFile(des_file, data, async function (err) {
      if( err ){
        console.log( err );
      } else {
        let time = Common.getNowFormatDate();
        let sql = "INSERT INTO image VALUES (?, ?, ?, 'wall', ?)";
        let array = [img_id, ctx.request.file.originalname, filename, time];
        await query(sql, array);

        fs.unlink(ctx.request.file.path, function (err) {  // 删除缓存
          if(err) {
            return {
              resultsCode: 'error',
              message: err
            };
          } else {
            return {
              resultsCode: 'success',
              message: '保存图片成功'
            };
          }
        });
      }
    });
  });
};

// 树详细内容的，treeCont
exports.saveTreeContImg = async (ctx) => {
  // console.log(ctx.request.file);  /* 上传的文件信息 */
  console.log(ctx.request.file);
  console.log(req.body.c_id);
  let filename = Common.getImageName(ctx.request.file.originalname, (req.body.c_id + '.' + Common.getRandomNum()));
  console.log(filename);
  let des_file = __dirname + "/img/treecont/" + filename; /* 这里要注意，因为这个文件已经在server里了，所以这里的__dirname是有server的 */
  fs.readFile(ctx.request.file.path, function (err, data) {
    if(err){
      console.log(err);
      return;
    }
    fs.writeFile(des_file, data, async function (err) {
      if(err){
        return { resultsCode: 'error', message: '保存本地图片失败' };
        console.log(err);
        return;
      } else {
        let time = Common.getNowFormatDate();
        let sql = "UPDATE cont SET filename=?, mTime=? WHERE c_id=? && sort=?";
        let array = [filename, time, req.body.c_id, req.body.sort];
        await query(sql, array);

        fs.unlink(ctx.request.file.path, function (err) {  // 删除缓存
          if(err) {
            return { resultsCode: 'error', message: '删除缓存失败' };
            console.log(err);
            return;
          } else {
            return { resultsCode: 'success', message: '保存图片成功' };
          }
        });
      }
    });
  });
};

// 获取image中某个type的所有图片名称，然后可以通过express静态资源获取
exports.getImgList = async (ctx) => {
  let sql = "SELECT * FROM image WHERE type=? ORDER BY cTime";
  let array = [ctx.query.type];
  let results = await query(sql, array);

  return {
    resultsCode: 'success',
    message: '查询image成功',
    data: results
  };
};

// 删除某张图片，删掉本地的还要删掉image数据库的记录
exports.deleteImg = async (ctx) => {
  let des_file = '';
  if(ctx.query.type === 'main') {
    des_file = __dirname + "/img/main/" + ctx.query.filename;
  }
  if(ctx.query.type === 'wall') {
    des_file = __dirname + "/img/wall/" + ctx.query.filename;
  }
  fs.unlink(des_file, async function (err) {
    if( err ){
      console.log( err );
    } else {
      let sql = "DELETE FROM image WHERE img_id=? && type=?";
      let array = [ctx.query.img_id, ctx.query.type];
      await query(sql, array);

      return { resultsCode: 'success', message: '删除成功' };
    }
  });
}

// 删除树的某图片，删掉本地的图片，还要把cont数据库的对应filename设为''
exports.deleteTreeContImg = async (ctx) => {
  let des_file = __dirname + "/img/treecont/" + ctx.query.filename;
  fs.unlink(des_file, async function (err) {
    if(err){
      return { resultsCode: 'error', message: '删除本地图片失败' };
    } else {
      let sql = "UPDATE cont SET filename='' WHERE filename=?";
      let array = [ctx.query.filename];
      await query(sql, array);

      return { resultsCode: 'success', message: '删除成功' };
    }
  });
}