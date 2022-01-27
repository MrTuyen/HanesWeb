var Database = require("../../database/db.js")
const db = new Database();
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');
const innovationService = require("../../services/Innovation/innovation.service");

module.exports.getMachineIndex = function (req, res) {
    res.render('Innovation/Machine/MachineIndex');
}

// Sewing Machine
module.exports.getSewingMachine = function (req, res) {
    try {
        //parameters
        let zone = req.body.zone;
        let line = req.body.line;
        let status = req.body.status;
        let tag = req.body.tag;
        // execute
        db.excuteSP(`CALL USP_Sewing_Machine_Get ('${zone}', '${line}', '${status}', '${tag}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getSewingMachine", error);
    }
}

module.exports.addSewingMachine = async function (req, res) {
    try {
        //parameters
        let sewingMachine = req.body.sewingMachine;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let idInserted = await innovationService.addSewingMachine({
            serialNo: sewingMachine.serialNo,
            tag: sewingMachine.tag,
            machineModel: sewingMachine.machineModel,
            mecLocation: sewingMachine.mecLocation,
            line: sewingMachine.line,
            position: sewingMachine.position,
            description: sewingMachine.description,
            status: sewingMachine.status,
            lastUpdate: datetime,
            userUpdate: user
        });
        if (idInserted <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Thêm thông tin máy may không thành công." }));
        return res.end(JSON.stringify({ rs: true, msg: "Thêm thông tin máy may thành công." }));
    }
    catch (error) {
        logHelper.writeLog("innovation.addSewingMachine", error);
    }
}

module.exports.updateSewingMachine = async function (req, res) {
    try {
        //parameters
        let sewingMachine = req.body.sewingMachine;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let affectedRows = await innovationService.updateSewingMachine({
            id: sewingMachine.id,
            serialNo: sewingMachine.serialNo,
            tag: sewingMachine.tag,
            machineModel: sewingMachine.machineModel,
            mecLocation: sewingMachine.mecLocation,
            line: sewingMachine.line,
            position: sewingMachine.position,
            description: sewingMachine.description,
            status: sewingMachine.status,
            lastUpdate: datetime,
            userUpdate: user
        });
        if (affectedRows <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật thông tin máy may không thành công." }));
        return res.end(JSON.stringify({ rs: true, msg: "Cập nhật thông tin máy may thành công." }));
    }
    catch (error) {
        logHelper.writeLog("innovation.updateSewingMachine", error);
    }
}

module.exports.updatePositionSewingMachine = async function (req, res) {
    try {
        //parameters
        let sewingMachine = req.body.sewingMachine;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let affectedRows = await innovationService.updatePositionSewingMachine({
            id: sewingMachine.id,
            line: sewingMachine.newLine,
            position: sewingMachine.newPosition,
            preLine: sewingMachine.oldLine,
            prePosition: sewingMachine.oldPosition,
            lastUpdate: datetime,
            userUpdate: user
        });
        if (affectedRows <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật vị trí máy may không thành công." }));
        return res.end(JSON.stringify({ rs: true, msg: "Cập nhật vị trí máy may thành công." }));
    }
    catch (error) {
        logHelper.writeLog("innovation.updateSewingMachine", error);
    }
}

module.exports.getSewingMachineDetail = async function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        let result = await innovationService.getSewingMachineDetail({
            id: id,
        });
        if (result[0].length <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Lấy thông tin máy may không thành công." }));
        return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result[0] }));
    }
    catch (error) {
        logHelper.writeLog("innovation.getMachineDetail", error);
    }
}

module.exports.getPositionHistory = async function (req, res) {
    try {
        //parameters
        let sewingMachine = req.body.sewingMachine;
        let time = sewingMachine.filterDate.split(";");
        // execute
         db.excuteSP(`CALL USP_Sewing_Machine_Position_History_Get ('${sewingMachine.tag}', '${time[0]}', '${time[1]}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getPositionHistory", error);
    }
}

module.exports.downloadPositionHistory = async function (req, res) {
    try {
        //parameters
        let sewingMachine = req.body.sewingMachine;
        let time = sewingMachine.filterDate.split(";");
        // execute
         db.excuteSP(`CALL USP_Sewing_Machine_Position_History_Get ('${sewingMachine.tag}', '${time[0]}', '${time[1]}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonHistory = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('History'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Tag', key: 'tag', width: 10 },
                    { header: 'Model', key: 'machine_model', width: 30 },
                    { header: 'Pre Line', key: 'pre_line', width: 30 },
                    { header: 'Pre Position', key: 'pre_position', width: 30 },
                    { header: 'Line', key: 'line', width: 30 },
                    { header: 'Position', key: 'position', width: 30 },
                    { header: 'Status', key: 'status', width: 30 },
                    { header: 'Time Update', key: 'time_update', width: 30 },
                    { header: 'User Update', key: 'user_update', width: 30 },
                ];

                // Add Array Rows
                worksheet.addRows(jsonHistory);

                // Write to File
                let filename = "templates/sewing_machine_moving_position_history.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getPositionHistory", error);
    }
}

// Machine
module.exports.getMachine = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;
        let type = req.body.type;

        // execute
        db.excuteSP(`CALL USP_Machine_Get ('${keyword}', '${type}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getMachine", error);
    }
}

module.exports.addMachine = function (req, res) {
    try {
        //parameters
        let name = req.body.name;
        let code = req.body.code;
        let type = req.body.type;
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `INSERT INTO mec_machine (name, code, type, active, last_update, user_update) 
                    VALUES('${name}', '${code}', '${type}', 1, '${datetime}', '${user}')`;
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
        logHelper.writeLog("innovation.addMachine", error);
    }
}

module.exports.updateMachine = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let name = req.body.name;
        let code = req.body.code;
        let active = req.body.active;
        let type = req.body.type;
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE mec_machine
                    SET name = '${name}', code = '${code}', type = '${type}', active = '${active}', last_update = '${datetime}', user_update = '${user}'
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
        logHelper.writeLog("innovation.updateMachine", error);
    }
}

module.exports.getMachineDetail = function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        db.excuteSP(`SELECT * FROM mec_machine WHERE id = ${id}`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getMachineDetail", error);
    }
}

module.exports.downloadMachine = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;
        let type = req.body.type;

        // execute
        db.excuteSP(`CALL USP_Machine_Get ('${keyword}', '${type}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonMachine = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Machine'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Id', key: 'id', width: 10 },
                    { header: 'Name', key: 'name', width: 30 },
                    { header: 'Code', key: 'code', width: 30 },
                    { header: 'Type', key: 'type', width: 30 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonMachine);

                // Write to File
                let filename = "templates/machine.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadMachine", error);
    }
}

// Model 
module.exports.getModel = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;
        let machine = req.body.machine;

        // execute
        db.excuteSP(`CALL USP_Model_Get ('${keyword}', '${machine}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getModel", error);
    }
}

module.exports.addModel = function (req, res) {
    try {
        //parameters
        let name = req.body.name;
        let code = req.body.code;
        let machine = req.body.machine;
        let des = req.body.des;
        let qty = req.body.qty;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `INSERT INTO mec_model (name, code, quantity, machine_id, description, active, last_update, user_update) 
                    VALUES('${name}', '${code}', ${qty}, ${machine}, '${des}', 1, '${datetime}', '${user}')`;
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
        logHelper.writeLog("innovation.addModel", error);
    }
}

module.exports.updateModel = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let name = req.body.name;
        let code = req.body.code;
        let active = req.body.active;
        let machine = req.body.machine;
        let qty = req.body.qty ? req.body.qty : 0;
        let des = req.body.des;
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE mec_model
                    SET name = '${name}', code = '${code}', machine_id = ${machine}, quantity = ${qty}, description = '${des}', active = ${active}, last_update = '${datetime}', user_update = '${user}'
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
        logHelper.writeLog("innovation.updateModel", error);
    }
}

module.exports.getModelDetail = function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        db.excuteSP(`SELECT * FROM mec_model WHERE id = ${id}`, function (result) {
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
    }
}

module.exports.downloadModel = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;
        let machine = req.body.machine;

        // execute
        db.excuteSP(`CALL USP_Model_Get ('${keyword}', '${machine}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonModel = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Model'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Id', key: 'id', width: 10 },
                    { header: 'Name', key: 'name', width: 30 },
                    { header: 'Code', key: 'code', width: 30 },
                    { header: 'Quantity', key: 'quantity', width: 30 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonModel);

                // Write to File
                let filename = "templates/model.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadModel", error);
    }
}