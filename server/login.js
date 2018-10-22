/** 登录 */
const { query } = require('./db.js');

exports.checkLogin = async (ctx) => {
	let sql = "SELECT * FROM login";
  let array = [];
  let results = await query(sql, array);
  console.log(results);
  console.log(ctx.request.body);

  // 前端传数据到这，取出数据库数据到这，直接做判断并且直接返回resultsCode
  let find = false;
  for (let i = 0; i < results.length; i++) {
    if (results[i].username === ctx.request.body.username) {
      if (results[i].userpword === ctx.request.body.userpword) {
        find = true;
        return {
          resultsCode: 'success',
          message: '登录成功'
        };
      }
      else {
        find = true;
        return {
          resultsCode: 'error',
          message: '登录失败'
        };
      }
    }
  }
  if (!find) {
    return {
      resultsCode: 'warning',
      message: '登录失败'
    };
  }
};