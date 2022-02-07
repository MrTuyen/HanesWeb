
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

// marker data
module.exports.getMarkerData = async function (req, res) {
    try {
        // parameters

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data ()`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let resultData = result.data;
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: resultData }));
            }
        });
    } catch (error) {
        logHelper.writeLog("fabric_receive.getMarkerData", error);
    }
}

module.exports.getIndexMarkerDataDetail = async function (req, res) {
    try {
        res.render('Cutting/FabricReceive/MarkerPlanDetail');
    } catch (error) {
        logHelper.writeLog("fabric_receive.getIndexMarkerDataDetail", error);
    }
}

module.exports.getMarkerDataDetail = async function (req, res) {
    try {
        // parameters
        let groupId = req.body.groupId;

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data_Detail (${groupId})`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let data = result.data;
                // get all unipack for each item color
                
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: data }));
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
            if (err) {
                logHelper.writeLog("fabric_receive.uploadFabricFile", err);
                return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
            }

            fs.rename(file.file.path, "templates/cutting/" + file.file.name, async function (err) {
                if (err) { 
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

        // clean data
        let masterData = [];
        for (let i = 0; i < arrExcelData.length; i++){
            let rowData = arrExcelData[i];
            let group = rowData[3];
            let insertRow = [];
            if(group != '' && group.toLowerCase().trim() != 'không có'){
                masterData.push(rowData);
            }
        }

        // insert to master table: only have group => take group, receive data, time, cut date, marker name, dozen value of first row
        let fr = masterData[0];
        let query = `INSERT INTO cutting_fr_marker_data_plan (receive_date, receive_time, _group, cut_date, note, user_update, date_update)
                    VALUES ('${new Date(fr[1]).toLocaleDateString()}', '${fr[2]}', '${fr[3]}', '${new Date(fr[8]).toLocaleDateString()}', '${fr[9]}', '${user}', '${datetime}')`;
        let isInsertMasterSuccess = await db.excuteQueryAsync(query);
        if(isInsertMasterSuccess.affectedRows < 0){
            return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
        }

        // insert to child table: contain item color => insert each item color to child table
        let idMaster = isInsertMasterSuccess.insertId;
        let detailData = [];
        for (let i = 0; i < masterData.length; i++){
            let rowData = masterData[i];
            let detailObj = []; 

            if(typeof(rowData[6]) != 'object' && typeof(rowData[6]) != 'Object' && rowData[6] != undefined && rowData[6].length > 5){
                detailObj.push(idMaster);
                detailObj.push(rowData[4]);
                detailObj.push(rowData[5]);
                detailObj.push(rowData[6]);
                detailObj.push(rowData[7]);
                detailObj.push(rowData[10]);
                detailObj.push(rowData[11]);

                detailData.push(detailObj);
            }
        } 
        query = `INSERT INTO cutting_fr_marker_data_plan_detail (group_id, wo, ass, item_color, yard, marker_name, dozen) 
        VALUES ?`;
        let isInsertDetailSuccess = await db.excuteInsertWithParametersAsync(query, detailData);

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
        let unipack = req.body.unipack;
        let itemColor = req.body.itemColor;

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Inventory_Data (${currentPage}, ${itemPerPage}, '${unipack}', '${itemColor}')`, function (result) {
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
            if (err){
                logHelper.writeLog("fabric_receive.uploadFabricInventoryDataFile", err);
                return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
            }

            fs.rename(file.file.path, "templates/cutting/" + file.file.name, async function (err) {
                if (err){ 
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
            let rowData = arrExcelData[i];
            let row = [];

            row.push(rowData[0]);
            row.push(rowData[1]);
            row.push(rowData[2]);
            row.push(rowData[3]);
            row.push(rowData[4]);
            row.push(rowData[5]);
            row.push(rowData[6]);
            row.push(rowData[7]);
            row.push(rowData[8]);
            row.push(rowData[9]);
            row.push(rowData[10]);
            row.push(rowData[11]);
            row.push(rowData[12]);
            row.push(rowData[13]);
            row.push(rowData[14]);
            row.push(rowData[15]);
            row.push(rowData[16]);
            row.push(rowData[17]);
            row.push(rowData[18]);
            row.push(rowData[19]);
            row.push(rowData[20]);
            row.push(rowData[21]);
            row.push(rowData[22]);
            row.push(rowData[23]);
            row.push(rowData[24]);
            row.push(rowData[25]);
            row.push(rowData[26]);

            savedData.push(row);
        }
        
        // delete all data before update latest data from Inventory6
        let query = `TRUNCATE TABLE cutting_fr_wh_fabric_inventory`;
        let isDeleteOldData = await db.excuteQueryAsync(query);

        let isUploadSuccess = cuttingService.addFabricInventoryData(savedData);

        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadFabricInventoryDataFile", error);
    }
}

// cutting scan
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

