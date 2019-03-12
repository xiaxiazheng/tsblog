/** 操作树 */
const { query } = require('./db.js');
const Common = require('./common.js');

// 查
exports.getTree = async (ctx) => {
  let array = [];
  let sql1 = "SELECT * FROM category ORDER BY sort";
  let res1 = await query(sql1, array);
  let sql2 = "SELECT * FROM tree ORDER BY f_sort, c_sort";
  let res2 = await query(sql2, array);
  /* 先把 tree 里的二级树整理好 */
  let list = [];
  for (let i in res2) {
    let find = false;
    if (i !== 0) {
      for (let j in list) {
        if (list[j].id === res2[i].f_id) {
          list[j].children.push({
            id: res2[i].c_id,
            label: res2[i].c_label,
            sort: res2[i].c_sort,
            category_id: res2[i].category_id
          });
          find = true;
          break;
        }
      }
    }
    if (!find) {
      list.push({
        id: res2[i].f_id,
        label: res2[i].f_label,
        sort: res2[i].f_sort,
        category_id: res2[i].category_id,
        children: [{
          id: res2[i].c_id,
          label: res2[i].c_label,
          sort: res2[i].c_sort,
          category_id: res2[i].category_id
        }]
      });
    }
  }
  /* 然后再把分类套在上面 */
  let flist = [];
  for (let item of res1) {
    let clist = [];
    if (item.label === 'My Secret Place' && ctx.query.type === 'home') {
      continue;
    }
    for (let j in list) {
      if (item.category_id === list[j].category_id) {
        clist.push(list[j]);
      }
    }
    flist.push({
      id: item.category_id,
      label: item.label,
      sort: item.sort,
      children: clist
    });
  }
  return {
    resultsCode: 'success',
    message: '获取树成功',
    data: flist,
  };
}

// 按关键字搜索树
exports.searchTree = async (ctx) => {
  let keyword = ctx.query.keyword;
  let array = [];
  let sql1 = `SELECT * FROM category ORDER BY sort`;
  let res1 = await query(sql1, array);
  let sql2 = `SELECT * FROM tree WHERE c_label LIKE '%${keyword}%' || f_label LIKE '%${keyword}%' ORDER BY f_sort, c_sort`;
  let res2 = await query(sql2, array);
  res2.forEach((item) => {
    let category = '';
    for (let i = 0; i < res1.length; i++) {
      if (item.category_id === res1[i].category_id) {
        category = res1[i].label;
        break;
      }
    }
    item.category = category;
  });
  // 去除掉 MySceretPlace
  for (let i = 0; i < res2.length; i++) {
    if (res2[i].category === 'My Secret Place') {
      res2.splice(i, 1);
    }
  }
  
  return {
    resultsCode: 'success',
    message: '搜索树成功',
    data: res2,  // 返回记录列表
  };
}

// 查三级节点名
exports.getChildName = async (ctx) => {
  let sql = "SELECT c_label FROM tree WHERE c_id=?";
  let array = [ctx.query.id];
  let result = await query(sql, array);
  return {
    resultsCode: 'success',
    message: '获取三级节点名称成功',
    data: result,
  };
}

// 增
exports.addTreeNode = async (ctx) => {
  let sql = '';
  let newchildId = Common.getRandomNum();
  let level = ctx.request.body.level;
  if (level === 1) { // 若为一个大类
    let newfathId = Common.getRandomNum();
    let newcateId = Common.getRandomNum();
    sql = "INSERT INTO category VALUES (?, ?, ?)";
    let array = [newcateId, 'newCategory', (parseInt(ctx.request.body.sort) + 1)];
    await query(sql, array);

    sql = "INSERT INTO tree VALUES (?, ?, ?, ?, ?, ?, ?)";
    array = [newfathId, 'newNode', 1, newchildId, 'newChildNode', 1, newcateId];
    await query(sql, array);

    let time = Common.getNowFormatDate();
    sql = `INSERT INTO cont VALUES(${newchildId}, '${time}', '${time}', '标题', '内容', 1, '')`;
    array = [];
    await query(sql, array);

    return {
      resultsCode:'success',
      message:'添加成功'
    };
  }
  else {
    if(level === 2) { // 若是父节点
      let newfathId = Common.getRandomNum();
      sql = `INSERT INTO tree VALUES (${newfathId}, 'newNode', ${(parseInt(ctx.request.body.sort) + 1)}, ${newchildId}, 'newChildNode', 1, ${ctx.request.body.category_id})`;
    }
    if(level === 3) { // 若是子节点
      sql = `INSERT INTO tree VALUES (${ctx.request.body.id}, '${ctx.request.body.label}', ${ctx.request.body.f_sort}, ${newchildId}, 'newChildNode', ${(parseInt(ctx.request.body.c_sort) + 1)}, ${ctx.request.body.category_id})`;
    }
    let array = [];
    await query(sql, array);
    
    let time = Common.getNowFormatDate();
    let sql1 = `INSERT INTO cont VALUES(${newchildId}, '${time}', '${time}', '标题', '内容', 1, '')`;
    await query(sql1, array);

    return {
      resultsCode:'success',
      message:'添加成功'
    };
  }
};

// 改
exports.modifyTreeNode = async (ctx) => {
  if(ctx.request.body.level === 1) {
    let sql = "UPDATE category SET label=? WHERE category_id=?";
    let array = [ctx.request.body.label, ctx.request.body.id];
    await query(sql, array);

    return {
      resultsCode:'success',
      message:'修改成功'
    };
  } else {
    let flag = '';
    if(ctx.request.body.level === 3) {
      flag = 'c';
    }
    if(ctx.request.body.level === 2) {
      flag = 'f';
    }
    let sql = `UPDATE tree SET ${flag}_label=? WHERE ${flag}_id=?`;
    let array = [ctx.request.body.label, ctx.request.body.id];
    await query(sql, array);
    
    return { 
      resultsCode:'success',
      message:'修改成功'
    };
  }
}

  // 删
exports.deleteTreeNode = async (ctx) => {
  const level = ctx.request.body.level;
  const id = ctx.request.body.id;
  if(level === 1) { // 若为一级节点
    // 先找到该一级节点的所有三级节点
    let sql1 = "SELECT c_id FROM tree WHERE category_id=?";
    let array = [id];
    let res1 = await query(sql1, array);

    // 再根据三级节点id逐个逐个删除三级节点的具体信息
    for (let i in res1) {
      let sql2 = "DELETE FROM cont WHERE c_id=?";
      let array2 = [res1[i].c_id];
      await query(sql2, array2);
    }

    // 再删除树上的该一级节点及其二三级节点
    let sql3 = "DELETE FROM tree WHERE category_id=?";
    await query(sql3, array);

    // 最后删除category表上的一级节点
    let sql4 = "DELETE FROM category WHERE category_id=?";
    await query(sql4, array);
    
    return {
      resultsCode: 'success',
      message: '删除成功'
    };
  }
  if(level === 2) { // 若为二级节点
    // 先找到该二级节点的所有三级节点
    let sql1 = "SELECT c_id FROM tree WHERE f_id=?";
    let array = [id];
    let res1 = await(sql1, array);

    // 再根据三级节点id逐个逐个删除三级节点的具体信息
    for (let i in res1) {
      let sql2 = "DELETE FROM cont WHERE c_id=?";
      let array2 = [res1[i].c_id];
      await query(sql2, array2);
    }

    // 最后删除树上的该二级节点及其三级节点
    let sql3 = "DELETE FROM tree WHERE f_id=?";
    await query(sql3, array);

    return {
      resultsCode: 'success',
      message: '删除成功'
    };
  }
  if(level === 3) { // 若为三级节点
    // 删除该子节点的具体信息
    let sql1 = "DELETE FROM cont WHERE c_id=?";
    let array = [id];
    await query(sql1, array);

    // 删除树上的点
    let sql2 = "DELETE FROM tree WHERE c_id=?";
    await query(sql2, array);
    
    return {
      resultsCode:'success',
      message:'删除成功'
    };
  }
}

// 交换顺序，上移或下移
exports.changeSort = async (ctx) => {
  const level = ctx.request.body.level;
  if(level === 1) {
    let sql1 = "UPDATE category SET sort=? WHERE category_id=?";
    let array1 = [ctx.request.body.otherSort, ctx.request.body.thisId];
    await query(sql1, array1);

    let sql2 = "UPDATE category SET sort=? WHERE category_id=?";
    let array2 = [ctx.request.body.thisSort, ctx.request.body.otherId];
    await query(sql2, array2);

    return {
      resultsCode: 'success',
      message: '移动成功'
    };
  } else {
    let flag = '';
    level === 3 && (flag = 'c');
    level === 2 && (flag = 'f');
    
    let sql1 = `UPDATE tree SET ${flag}_sort=? WHERE ${flag}_id=?`;
    let array1 = [ctx.request.body.otherSort, ctx.request.body.thisId];
    await query(sql1, array1);
    
    let sql2 = `UPDATE tree SET ${flag}_sort=? WHERE ${flag}_id=?`;
    let array2 = [ctx.request.body.thisSort, ctx.request.body.otherId];
    await query(sql2, array2);
        
    return {
      resultsCode: 'success',
      message: '移动成功'
    };
  }
};

// 穿梭，子节点改变父节点（加到别的树枝下）
exports.changeFather = async (ctx) => {
  let sql = '', array = [];
  let body = ctx.request.body;
  if(body.shuttleLevel === 2) { // 二级节点要穿梭
    sql = "UPDATE tree SET category_id=?, f_sort=? WHERE f_id=?";
    array = [body.category_id, body.f_sort, body.f_id];
  }
  if(body.shuttleLevel === 3) {  // 三级节点要穿梭
    sql = "UPDATE tree SET f_id=?, f_label=?, f_sort=?, c_sort=? WHERE c_id=?";
    array = [body.fatherid, body.fatherlabel, body.fathersort, body.newchildsort, body.childid];
  }
  await query(sql, array);

  return {
    resultsCode: 'success',
    message: '穿梭成功'
  };
}
