/** 操作子节点内容 */
const { query } = require('./db.js');
const Common = require('./common.js');

// 查
exports.getNodeCont = async (ctx) => {
	let sql = "SELECT * FROM cont WHERE c_id=? ORDER BY sort";
  let array = [ctx.query.id];
  let results = await query(sql, array);
  if(results.length !== 0) {
    let contObj = {};
    for (let i in results) {
      if(i == 0) {
        contObj = {
          id: results[0].c_id,
          list: [{
            title: results[0].title,
            cont: results[0].cont.replace(/<br\/>/g, "\n"),
            sort: results[0].sort,
            createtime: results[0].cTime,
            motifytime: results[0].mTime,
            filename: results[0].filename
          }]
        };
        continue;
      }
      contObj.list.push({
        title: results[i].title,
        cont: results[i].cont.replace(/<br\/>/g, "\n"),
        sort: results[i].sort,
        createtime: results[i].cTime,
        motifytime: results[i].mTime,
        filename: results[i].filename
      });
    }
    return { 
      resultsCode: 'success',
      message: '获取子节点数据成功', 
      data: contObj
    };
  } else {
    return {
      resultsCode: 'error',
      message: '没找到子节点数据'
    };
  }
};

// 增
exports.addNodeCont = async (ctx) => {
  let time = Common.getNowFormatDate();
	let sql = "INSERT INTO cont VALUES (" + ctx.request.body.id + ", '" + time + "', '" + time + "', '请输入标题', '请输入内容'," + (parseInt(ctx.request.body.sort) + 1) +", '')";
  let array = [ctx.query.id];
  await query(sql, array);
  return {
    resultsCode: 'success',
    message: '添加成功'
  };
};

// 改
exports.modifyNodeCont = async (ctx) => {
  // 先取
  let sql1 = "SELECT * FROM cont WHERE c_id=? ORDER BY sort";
  let array1 = [ctx.request.body.id];
  let res1 = await query(sql1, array1);
  let isUpdate = false;
  for (let i in res1) {
    // 后判断
    let cont = ctx.request.body.list[i].cont.replace(/\n|\r\n/g, "<br/>");  // 处理换行再对比，对比统一用<br/>
    if(res1[i].title != ctx.request.body.list[i].title || res1[i].cont != cont) {
      // 有修改就更新
      let sql2 = "UPDATE cont SET mTime='" + Common.getNowFormatDate() + "', title=?, cont=? WHERE c_id=? && sort=?";
      let array2 = [ctx.request.body.list[i].title, cont, ctx.request.body.id, ctx.request.body.list[i].sort];
      await query(sql2, array2);
      isUpdate = true;
    }
  }
  if(isUpdate) {
    return {
      resultsCode: 'success',
      message: '修改保存成功'
    };
  } else {
    return {
      resultsCode: 'success',
      message: '当前页面无修改'
    };
  }
};

// 删
exports.deleteNodeCont = async (ctx) => {
  let sql = "DELETE FROM cont WHERE c_id=? && sort=?";
  let array = [ctx.query.id, ctx.query.sort];
  await query(sql, array);
  return {
    resultsCode: 'success',
    message: '删除成功'
  };
};

// 交换顺序，上移或下移
exports.changeSort = async (ctx) => {
  let sql1 = "UPDATE cont SET sort=? WHERE cTime=?";
  let array1 = [ctx.query.otherSort, ctx.query.thiscTime];
  await query(sql1, array1);

  let sql2 = "UPDATE cont SET sort=? WHERE cTime=?";
  let array2 = [ctx.query.thisSort, ctx.query.othercTime];
  await query(sql2, array2);
  
  return {
    resultsCode: 'success',
    message: '移动成功'
  };
};