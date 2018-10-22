/** 数据库信息配置 */
let mysql = require('mysql');
let pool;

if (process.env.NODE_ENV && process.env.NODE_ENV.match("productionPig")) {
	pool = mysql.createPool({
		host: "123.207.5.131", // 服务器地址
		user: "root",
		password: "zybzyb",
		database: "huangpp",
		post: 3306,
	});
} else {
	pool = mysql.createPool({
		host: "123.207.5.131", // 服务器地址
		user: "root",
		password: "zybzyb",
		database: "myblog",
		post: 3306,
	});
}

let query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}

module.exports = { query }