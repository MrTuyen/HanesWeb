const mysql = require("mysql");
const util = require("util");
var con = mysql.createConnection({
  host: "localhost",
  user: "root1",
  password: "Hmc081199",
  database: "sewing_needle_realtime",
  });
const query = util.promisify(con.query).bind(con);
class database{
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
