/* 操作日志 */
const { query } = require('./db.js');
const Common = require('./common.js');

// 查所有，按创建时间倒序
exports.getAllLogListByCTime = async (ctx) => {
  let pageNo = ctx.query.pageNo;
  let pageSize = ctx.query.pageSize;

  let sql1 = `SELECT log_id, title, author, cTime FROM log ORDER BY ctime DESC LIMIT ${(pageNo - 1) * pageSize}, ${pageSize}`;
  let sql2 = `SELECT COUNT(*) FROM log`;

  let array1 = [];
  let res1 = await query(sql1, array1);
  let array2 = [];
  let res2 = await query(sql2, array2);
  return {
    resultsCode: 'success',
    message: '获取所有 log 数据成功', 
    data: {
      totalNumber: res2[0]["COUNT(*)"],
      list: res1
    }
  };
};

// 查所有，按修改时间倒序
exports.getAllLogListByMTime = async (ctx) => {
  let pageNo = ctx.query.pageNo;
  let pageSize = ctx.query.pageSize;

  let sql1 = `SELECT log_id, title, author, mTime FROM log ORDER BY mtime DESC LIMIT ${(pageNo - 1) * pageSize}, ${pageSize}`;
  let sql2 = `SELECT COUNT(*) FROM log`;

  let array1 = [];
  let res1 = await query(sql1, array1);
  let array2 = [];
  let res2 = await query(sql2, array2);
  return {
    resultsCode: 'success',
    message: '获取所有 log 数据成功', 
    data: {
      totalNumber: res2[0]["COUNT(*)"],
      list: res1
    }
  };
};

// 查单篇日志
exports.getLogCont = async (ctx) => {
  let sql = `SELECT * FROM log WHERE log_id=?`;
  let array = [ctx.query.id];
  let res = await query(sql, array);
  return {
    resultsCode: 'success',
    message: '获取单个 log 内容成功', 
    data: res[0]
  };
};

// 新增单篇日志
exports.addLogCont = async (ctx) => {
  let id = Common.getRandomNum();
  let time = Common.getNowFormatDate();
  let sql = `INSERT INTO log VALUES(?, ?, ?, ?, ?, ?)`;
  let array = [id, '新建日志', '作者', time, time, '请点击右上方按钮编辑本日志'];
  await query(sql, array);
  return {
    resultsCode: 'success',
    message: '新建日志成功',
    data: {
      newid: id
    }
  };
};

// 改单篇日志
exports.modifyLogCont = async (ctx) => {
  // 先取
  let sql1 = `SELECT * FROM log WHERE log_id=?`;
  let array1 = [ctx.request.body.id];
  let res1 = await query(sql1, array1);
  if(res1[0].logcont === ctx.request.body.logcont) {
    return {
      resultsCode: 'success',
      message: '当前页面无修改'
    };
  } else {
    let time = Common.getNowFormatDate();
    let sql = `UPDATE log SET title=?, author=?, mTime=?, logcont=? WHERE log_id=?`;
    let array = [ctx.request.body.title, ctx.request.body.author, time, ctx.request.body.logcont, ctx.request.body.id];
    await query(sql, array);
    return {
      resultsCode: 'success',
      message: '修改保存成功'
    };
  }
};

// 删单篇日志
exports.deleteLogCont = async (ctx) => {
  let sql = `DELETE FROM log WHERE log_id=?`;
  let array = [ctx.query.id];
  await query(sql, array);
  return {
    resultsCode: 'success',
    message: '删除成功', 
  };
};