var Database = require("../../database/db.js")
const db = new Database();
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');
const innovationService = require("../../services/Innovation/innovation.service");

// UI
module.exports.getIndex = function (req, res) {
    res.render('Innovation/User/index');
}

module.exports.getUser = function (req, res) {
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
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getUser", error);
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.addUser = function (req, res) {
    try {
        //parameters
        let manager = req.body.manager;
        let mechanicId = req.body.mechanicId;
        let mechanicName = req.body.mechanicName;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `INSERT INTO mec_user (id_mec, fullname, manager, last_update, user_update, active) 
                    VALUES('${mechanicId}', '${mechanicName}', '${manager}', '${datetime}', '${user}', 1)`;
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
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.updateUser = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let manager = req.body.manager;
        let mechanicId = req.body.mechanicId;
        let mechanicName = req.body.mechanicName;
       
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE mec_user
                    SET manager = '${manager}', fullname = '${mechanicName}', id_mec = '${mechanicId}', last_update = '${datetime}', user_update = '${user}'
                    WHERE id = ${id}`;

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
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.deleteUser = function (req, res) {
    try {
        //parameters
        let id = req.body.id;

        // execute
        let query = `DELETE FROM mec_user
                    WHERE id = ${id}`;

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
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.getUserDetail = function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        db.excuteSP(`SELECT * FROM mec_user WHERE id = ${id}`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getModelDetail", error);
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
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
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}