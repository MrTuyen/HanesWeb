const logHelper = require("../common/log.js");
const mysql = require("mysql");
const util = require('util');

var config = {
    // host: "10.113.98.238",
    // port: 3306,
    // user: "root",
    // password: "Hy$2020",
    // database: "cutting_system"

    host: "10.113.99.131",
    port: 3306,
    user: "root",
    password: "123456",
    database: "cutting_system"
};
var con = mysql.createPool(config);

const query = util.promisify(con.query).bind(con);
class Database {

    config(){
        return config;
    }
      
    async excuteQueryAsync(queryString) {
        try {
            var result = await query(queryString);
            return result;
        }
        catch (error) {
            logHelper.writeLog("excuteQueryAsync" + "/\n" + queryString, error);
            return null;
        }
      
    }

    async excuteSPAsync(queryString) {
        try {
            var result = await query(queryString);
            return result;
        }
        catch (error) {
            logHelper.writeLog("excuteSPAsync"+ "/\n" + queryString, error);
            return null;
        }
      
    }

    async excuteNonQueryAsync(queryString) {
        try {
            var result = await query(queryString);
            return result.affectedRows;
        }
        catch (error) {
            logHelper.writeLog("excuteNonQueryAsync"+ "/\n" + queryString, error);
            return null;
        }
      
    }

    async excuteInsertReturnIdAsync(queryString) {
        try {
            var result = await query(queryString);
            return result.insertId;
        }
        catch (error) {
            logHelper.writeLog("excuteInsertReturnIdAsync"+ "/\n" + queryString, error);
            return 0;
        }
        
    }

    async excuteInsertWithParametersAsync(queryString, parameters) {
        try {
            var result = await query(queryString, [parameters]);
            return result.affectedRows;
        }
        catch (error) {
            logHelper.writeLog("excuteInsertReturnIdAsync"+ "/\n" + queryString, error);
            return 0;
        }
        
    }

    excuteQuery(queryString, callback) {
        try {
            con.query(queryString, function (err, result, fields) {
                if (err) {
                    callback({ rs: false, msg: err });
                }
                else {
                    callback({ rs: true, msg: "", data: result });
                }
            })
        }
        catch (error) {
            logHelper.writeLog("excuteQuery"+ "/\n" + queryString, error);
            return null;
        }
        
    }

    excuteSP(queryString, callback) {
        try {
            con.query(queryString, function (err, result, fields) {
                if (err) {
                    callback({ rs: false, msg: err });
                }
                else {
                    callback({ rs: true, msg: "", data: result[0] });
                }
            })            
        }
        catch (error) {
            logHelper.writeLog("excuteSP"+ "/\n" + queryString, error);
            return null;
        }
        
    }
}

module.exports = Database;