/** 数据库信息配置 */
let mysql = require('mysql');
let pool;

if (process.env.NODE_ENV.match("productionPig")) {
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




exports.pool = pool;
