const mysql = require("mysql");
const util = require("util");
var con = mysql.createConnection({
  // host: "10.113.98.238",
  // port: 3306,
  // user: "root",
  // password: "Hy$2020",
  // database: "sewing_needle_realtime"

  host: "10.113.99.3",
  port: 3306,
  user: "root",
  password: "123456",
  database: "sewing_needle_realtime"
});
const query = util.promisify(con.query).bind(con);
class database {
  async QueryAsync(queryString) {
    try {
      var result = await query(queryString);
      return result;
    }
    catch (error) {
      return null;
    }
  }
}
module.exports = database;
