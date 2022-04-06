var formidable = require('formidable');
var fs = require('fs');
var Database = require("../../database/db_erpsystem.js")
const db = new Database();
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');

module.exports.getIndex = function (req, res) {
    res.render('SystemUser/Index');
}

module.exports.getUser = function (req, res) {
    try {
        //parameters
        // let manager = req.body.manager;
        // let mechanicId = req.body.mechanicId;
        // let mechanicName = req.body.mechanicName;

        // execute
        db.excuteQuery(`SELECT * FROM setup_user`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("systemuser.getUser", error);
    }
}

module.exports.addUser = function (req, res) {
    try {
        // parameters
        let username = req.body.username;
        let fullname = req.body.fullname;
        let email = req.body.email;
        let dept = req.body.dept;
        let role = req.body.role;
        let position = req.body.position;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `INSERT INTO setup_user (User, Password, Name, Email, Position, Department, Roles, TimeUpdate, UserUpdate) 
                    VALUES('${username}', '123456', '${fullname}', '${email}', '${position}', '${dept}', '${role}', '${datetime}', '${user}')`;
        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.addUser", error);
    }
}

module.exports.updateUser = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let username = req.body.username;
        let fullname = req.body.fullname;
        let email = req.body.email;
        let dept = req.body.dept;
        let role = req.body.role;
        let position = req.body.position;
       
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE setup_user
                    SET User = '${username}', Name = '${fullname}', Email = '${email}', Department = '${dept}', Roles = '${role}', Position = '${position}', TimeUpdate = '${datetime}', UserUpdate = '${user}'
                    WHERE IdSystem = ${id}`;

        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.updateUser", error);
    }
}

module.exports.deleteUser = function (req, res) {
    try {
        //parameters
        let id = req.body.id;

        // execute
        let query = `DELETE FROM setup_user
                    WHERE IdSystem = ${id}`;

        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.deleteUser", error);
    }
}

module.exports.changePassword = function (req, res) {
    try {
        //parameters
        let username = req.body.username;
        let password = req.body.password;
       
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE setup_user
                    SET Password = '${password}', TimeUpdate = '${datetime}', UserUpdate = '${user}'
                    WHERE User = '${username}'`;

        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.changePassword", error);
    }
}

module.exports.getUserDetail = function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        db.excuteSP(`SELECT * FROM setup_user WHERE IdSystem = ${id}`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("systemuser.getUserDetail", error);
    }
}

module.exports.downloadUser = function (req, res) {
    try {
        //parameters
        let manager = req.body.manager;
        let mechanicId = req.body.mechanicId;
        let mechanicName = req.body.mechanicName;

        // execute
        db.excuteSP(`CALL USP_User_Get ('${manager}', '${mechanicId}', '${mechanicName}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonUser = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Model'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Staff Id', key: 'id_mec', width: 10 },
                    { header: 'Fullname', key: 'fullname', width: 30 },
                    { header: 'Manager', key: 'manager', width: 30 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonUser);

                // Write to File
                let filename = "templates/mec_user.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadUser", error);
    }
}