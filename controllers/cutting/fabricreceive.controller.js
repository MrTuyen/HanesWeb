
// libraries
const formidable = require('formidable');
var fs = require('fs');
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');


// database
var Database = require("../../database/db_cutting.js")
const db = new Database();

// service
const cuttingService = require("../../services/Cutting/cutting.service");

// model 

// logic
module.exports.getIndex = function (req, res) {
    res.render('Cutting/FabricReceive/FabricReceive');
}

module.exports.addScannedRecord = async function (req, res) {
    try {
        // parameters
        let data = req.body.data;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            let eleArr = [];
            let ele = data[i];
            for (let j = 0; j < Object.values(ele).length; j++) {
                eleArr.push(Object.values(ele)[j]);
            }
            eleArr.push(user);
            eleArr.push(datetime);
            arr.push(eleArr);
        }
        
        let isAddSuccess = await cuttingService.addScannedRecord(arr);
        if (isAddSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Thêm thông tin scan vải không thành công." }));
            
        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.addScannedRecord", error);
    }
}

module.exports.getHistory = async function (req, res) {
    try {
        // parameters
        let filterDate = req.body.filterDate;

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_History ('${filterDate.split(";")[0]}', '${filterDate.split(";")[1]}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    } catch (error) {
        logHelper.writeLog("fabric_receive.getHistory", error);
    }
}

module.exports.uploadFabricFile = function (req, res) {
    try {
        // parameters
        let form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, file) {
            if (err)
            {
                logHelper.writeLog("fabric_receive.uploadFabricFile", err);
                return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
            }

            fs.rename(file.file.path, "templates/cutting/" + file.file.name, async function (err) {
                if (err)
                { 
                    logHelper.writeLog("fabric_receive.uploadFabricFile", err);
                    return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
                }
              
                let sheets = await helper.getListSheetFromExcel("templates/cutting/" + file.file.name);
                
                return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: sheets }));
            });
        });

    } catch (error) {
        logHelper.writeLog("fabric_receive.uploadFabricFile", error);
    }
}

module.exports.saveUploadData = async function (req, res) {
    try {
        // parameters
        let sheet = req.body.sheet;
        let headerRow = req.body.headerRow;
        let fileName = req.body.fileName;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // get data from excel file
        let arrExcelData = await helper.getDataFromExcel("templates/cutting/" + fileName, sheet, headerRow);

        // insert data into database
        let savedData = [];
        for (let i = 0; i < arrExcelData.length; i++){
            let row = arrExcelData[i];
            row.push(user);
            row.push(datetime);
            savedData.push(row);
        }
        
        let isUploadSuccess = cuttingService.addFabricReceivePlan(savedData);

        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadData", error);
    }
}

// inventory data
module.exports.getIndexInventoryData = function (req, res) {
    res.render('Cutting/FabricReceive/FabricInventoryData');
}

module.exports.getInventoryData = async function (req, res) {
    try {
        // parameters
        let currentPage = req.body.currentPage;
        let itemPerPage = req.body.itemPerPage;

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Inventory_Data (${currentPage}, ${itemPerPage})`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let resultData = result.data;
                let totalPage = 0;
                let totalRow = resultData.length == 0 ? 0 : resultData[0].totalRow;
                if (totalRow % itemPerPage == 0)
                    totalPage = totalRow == 0 ? 1 : totalRow / itemPerPage;
                else
                    totalPage = totalRow / itemPerPage + 1;

                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: { data: resultData, totalPage: Math.floor(totalPage), totalRow: totalRow} }));
            }
        });
    } catch (error) {
        logHelper.writeLog("fabric_receive.getHistory", error);
    }
}

module.exports.uploadFabricInventoryDataFile = function (req, res) {
    try {
        // parameters
        let form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, file) {
            if (err)
            {
                logHelper.writeLog("fabric_receive.uploadFabricInventoryDataFile", err);
                return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
            }

            fs.rename(file.file.path, "templates/cutting/" + file.file.name, async function (err) {
                if (err)
                { 
                    logHelper.writeLog("fabric_receive.uploadFabricInventoryDataFile", err);
                    return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
                }
              
                let sheets = await helper.getListSheetFromExcel("templates/cutting/" + file.file.name);
                
                return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: sheets }));
            });
        });

    } catch (error) {
        logHelper.writeLog("fabric_receive.uploadFabricInventoryDataFile", error);
    }
}

module.exports.saveUploadFabricInventoryDataFile = async function (req, res) {
    try {
        // parameters
        let sheet = req.body.sheet;
        let headerRow = req.body.headerRow;
        let fileName = req.body.fileName;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // get data from excel file
        let arrExcelData = await helper.getDataFromExcel("templates/cutting/" + fileName, sheet, headerRow);

        // insert data into database
        let savedData = [];
        for (let i = 0; i < arrExcelData.length; i++){
            let row = arrExcelData[i];
            savedData.push(row);
        }
        
        let isUploadSuccess = cuttingService.addFabricInventoryData(savedData);

        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadFabricInventoryDataFile", error);
    }
}

