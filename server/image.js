/** 上传图片 */
let { query } = require('./db.js');
let Common = require('./common.js');

/** 获取上传的图片保存到本地，并将文件名保存到数据库 */
// 主页的，main
exports.saveMainImg = async (ctx) => {
  // console.log(ctx.req.file);  /* 上传的文件信息 */
  let img_id = Common.getRandomNum();
  let filename = Common.getImageName(ctx.req.file.originalname, img_id);
  let saveTo = __dirname + "/img/main/" + filename; /* 这里要注意，因为这个文件已经在server里了，所以这里的__dirname是有server的 */
  
  try {
    let filedata = await Common.readFile(ctx.req.file.path);
    await Common.writeFile(saveTo, filedata);
    await Common.deleteFile(ctx.req.file.path);

    let time = Common.getNowFormatDate();
    let sql = "INSERT INTO image VALUES (?, ?, ?, 'main', ?)";
    let array = [img_id, ctx.req.file.originalname, filename, time];
    await query(sql, array);
  } catch (e) {
    console.log(e);
    return { resultsCode: 'error', message: `保存图片失败:${e}` };
  }

  return { resultsCode: 'success', message: '保存图片成功' };
};

// 图片墙的，wall
exports.saveWallImg = async (ctx) => {
  // console.log(ctx.req.file);  /* 上传的文件信息 */
  let img_id = Common.getRandomNum();
  let filename = Common.getImageName(ctx.req.file.originalname, img_id);
  let saveTo = __dirname + "/img/wall/" + filename; /* 这里要注意，因为这个文件已经在server里了，所以这里的__dirname是有server的 */
  
  try {
    let filedata = await Common.readFile(ctx.req.file.path);
    await Common.writeFile(saveTo, filedata);
    await Common.deleteFile(ctx.req.file.path);

    let time = Common.getNowFormatDate();
    let sql = "INSERT INTO image VALUES (?, ?, ?, 'wall', ?)";
    let array = [img_id, ctx.req.file.originalname, filename, time];
    await query(sql, array);
  } catch(e) {
    console.log(e);
    return { resultsCode: 'error', message: `保存图片失败:${e}` };
  }

  return { resultsCode: 'success', message: '保存图片成功' };
};

// 树详细内容的，treeCont
exports.saveTreeContImg = async (ctx) => {
  // console.log(ctx.req.file);  /* 上传的文件信息 */
  // console.log(ctx.req.body);  /* 上传的夹带数据 */
  let filename = Common.getImageName(ctx.req.file.originalname, (ctx.req.body.c_id + '.' + Common.getRandomNum()));
  let saveTo = __dirname + "/img/treecont/" + filename; /* 这里要注意，因为这个文件已经在server里了，所以这里的__dirname是有server的 */
  
  try {
    let filedata = await Common.readFile(ctx.req.file.path);
    await Common.writeFile(saveTo, filedata);
    await Common.deleteFile(ctx.req.file.path);

    let time = Common.getNowFormatDate();
    let sql = "UPDATE cont SET filename=?, mTime=? WHERE c_id=? && sort=?";
    let array = [filename, time, ctx.req.body.c_id, ctx.req.body.sort];
    await query(sql, array);
  } catch(e) {
    console.log(e);
    return { resultsCode: 'error', message: `保存图片失败:${e}` };
  }

  return { resultsCode: 'success', message: '保存图片成功' };
};

// 获取image中某个type的所有图片名称，然后可以通过express静态资源获取
exports.getImgList = async (ctx) => {
  let sql = "SELECT * FROM image WHERE type=? ORDER BY cTime";
  let array = [ctx.query.type];
  let results;
  try {
    results = await query(sql, array);
  } catch(e) {
    console.log(e);
    return { resultsCode: 'error', message: `查询image失败:${e}` };
  }
  
  return {
    resultsCode: 'success',
    message: '查询image成功',
    data: results
  };
};

// 删除某张图片，删掉本地的还要删掉image数据库的记录
exports.deleteImg = async (ctx) => {
  let filepath = '';
  if(ctx.request.body.type === 'main') {
    filepath = __dirname + "/img/main/" + ctx.request.body.filename;
  }
  if(ctx.request.body.type === 'wall') {
    filepath = __dirname + "/img/wall/" + ctx.request.body.filename;
  }

  try {
    await Common.deleteFile(filepath);

    let sql = "DELETE FROM image WHERE img_id=? && type=?";
    let array = [ctx.request.body.img_id, ctx.request.body.type];
    await query(sql, array);
  } catch(e) {
    console.log(e);
    return { resultsCode: 'error', message: `删除失败:${e}` };
  }

  return { resultsCode: 'success', message: '删除成功' };
}

// 删除树的某图片，删掉本地的图片，还要把cont数据库的对应filename设为''
exports.deleteTreeContImg = async (ctx) => {
  let filepath = __dirname + "/img/treecont/" + ctx.request.body.filename;

  try {
    await Common.deleteFile(filepath);

    let sql = "UPDATE cont SET filename='' WHERE filename=?";
    let array = [ctx.request.body.filename];
    await query(sql, array);
  } catch(e) {
    console.log(e);
    return { resultsCode: 'error', message: `删除失败:${e}` };
  }

  return { resultsCode: 'success', message: '删除成功' };
}