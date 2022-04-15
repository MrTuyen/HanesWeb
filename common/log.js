var fs = require('fs');
var config = require("../config")
var filePath = config.logFilePath;
var logHelper = {};

logHelper.writeLog = function (funcName, ex) {
    let time = new Date().toLocaleString();
    // let date = new Date().toLocaleDateString("vi-VN").replaceAll("/", "_");
    let date = new Date().toLocaleDateString("vi-VN").replace(/\//g,"_");
    let fileName = filePath + date + ".txt";
    console.log(fileName);
    try {
        fs.appendFile(fileName, time + ": " + funcName + "\n" + ex.message + "\n" + "---------------------------------------------" + "\n", () => {

        });
    }
    catch (ex) {
        console.log(ex);
    }
}

logHelper.writeLogMessage = function (funcName, message) {
    let time = new Date().toLocaleString();
    // let date = new Date().toLocaleDateString("vi-VN").replaceAll("/", "_");
    let date = new Date().toLocaleDateString("vi-VN").replace(/\//g,"_");
    let fileName = filePath + date + ".txt";
    console.log(fileName);
    try {
        fs.appendFile(fileName, time + ": " + funcName + "\n" + message + "\n" + "---------------------------------------------" + "\n", () => {

        });
    }
    catch (ex) {
        console.log(ex);
    }
}

module.exports = logHelper;