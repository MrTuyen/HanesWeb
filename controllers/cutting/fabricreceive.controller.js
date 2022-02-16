
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
    res.render('Cutting/FabricReceive/MarkerPlanDetail');
}

module.exports.getMarkerDataDetail = async function (req, res) {
    try {
        // parameters
        let groupId = req.body.groupId;

        // execute
        // master data info
        let masterInfo = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan WHERE id = ${groupId}`);
        
        // item-color detail info
        let detailInfo = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data_Detail (${groupId})`);

        // fabric roll info follow item-color
        let itemColorList = [];
        let farbicRollList = [];
        let selectedFabricRollList = [];
        if(detailInfo[0] != undefined && detailInfo[0].length > 1) {
            itemColorList = [...new Set(detailInfo[0].map(x => x.item_color))]; // distinct array

            for (let i = 0; i < itemColorList.length; i++) {
                let ele = itemColorList[i];
                let result = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Inventory_Data (1, 10000, '', '${ele}', '')`);
                farbicRollList.push({itemColor: ele, rollList: result[0]})
            }

            if(masterInfo[0].wh_confirm_by != undefined && masterInfo[0].wh_confirm_date != undefined) {
                let result = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id = ${groupId}`);
                selectedFabricRollList.push(result);
            }

            res.end(JSON.stringify({ rs: true, msg: "Thành công", data: {master: masterInfo[0], detail: detailInfo[0], fabricRoll: farbicRollList, selectedFabricRoll: selectedFabricRollList[0]}}));
        }
    } catch (error) {
        logHelper.writeLog("fabric_receive.getMarkerDataDetail", error);
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
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

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
        let query = `INSERT INTO cutting_fr_marker_data_plan (plant, work_center, receive_date, receive_time, _group, cut_date, note, marker_call_by, marker_call_date, user_update, date_update)
                    VALUES ('${fr[12]}', '${fr[13]}', '${new Date(fr[1]).toLocaleDateString()}', '${fr[2]}', '${fr[3]}', '${new Date(fr[8]).toLocaleDateString()}', '${fr[9]}', '${user}', '${datetime}', '${user}', '${datetime}')`;
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

            if(rowData[4] != '0' && rowData[4] != 0 && rowData[6] != undefined && rowData[6].length > 5){
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
        query = `INSERT INTO cutting_fr_marker_data_plan_detail (group_id, wo, ass, item_color, yard_demand, marker_name, dozen) 
        VALUES ?`;
        let isInsertDetailSuccess = await db.excuteInsertWithParametersAsync(query, detailData);

        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadData", error);
    }
}

module.exports.action = function(req, res){
    try {
        // parameters
        let groupId = req.body.groupId;
        let action = req.body.action;
        let actionTime = req.body.actionTime;
        let cancelReason = req.body.cancelReason;
        let cancelStep = req.body.cancelStep;

        // execute
        switch (parseInt(action))
        {
            case constant.Enum_Action.Cancel: 
                {
                    return cancel(req, res, groupId, cancelReason, cancelStep);
                }
            case constant.Enum_Action.Call:
                {
                    return markerCall(req, res, groupId);
                }
            case constant.Enum_Action.CCDSend:
                {
                    //return CPSend(assWo, actionTime);
                }
            case constant.Enum_Action.WHSend:
                {
                    return whSend(req, res, groupId, actionTime);
                }
            case constant.Enum_Action.Complete:
                {
                   //return Complete(assWo);
                }
        }
    } catch (error) {
        logHelper.writeLog("fabric_receive.action", error);
    }
}

async function markerCall(req, res, groupId){
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `SELECT * FROM cutting_fr_marker_data_plan WHERE id=${groupId}`;
        let objMarker = await db.excuteQueryAsync(query);

        // check the ticket has been called or not
        if(objMarker[0].marker_call_by != undefined && objMarker[0].marker_call_by != undefined){
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này đã được ccd gọi/ This ticket has been called" }));
        }
        else{
            query = `UPDATE cutting_fr_marker_data_plan 
                    SET ccd_call_date = '${datetime}', ccd_call_by = '${user}'
                    WHERE id = ${groupId}`;
            let isUpdateSuccess = await db.excuteNonQueryAsync(query);
            if(isUpdateSuccess <= 0){
                return res.end(JSON.stringify({ rs: false, msg: "Gọi phiếu xảy ra lỗi/ Calling ticket occured error" }));
            }
            else{
                testIo.emit('ccd-fabric-receive-action', {
                    username: user,
                    message: {
                        groupId: groupId, 
                        callDate: datetime,
                        actionType: constant.Enum_Action.Call
                    }
                });
        
                return res.end(JSON.stringify({ rs: true, msg: "Gọi phiếu thành công/ The ticket has been called successful" }));
            }
        }
    } catch (error) {
        logHelper.writeLog("fabric_receive.ccdCall", error);
    }
}

async function cancel(req, res, groupId, cancelReason, cancelStep){
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `UPDATE cutting_fr_marker_data_plan 
                    SET cancel_step = ${cancelStep}, 
                        cancel_reason = '${cancelReason}',  
                        cancel_date = '${datetime}', 
                        cancel_by = '${user}'
                    WHERE id=${groupId}`;

        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if(isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Hủy phiếu cấp vải không thành công." }));

        testIo.emit('ccd-fabric-receive-action', {
            username: user,
            message: {
                groupId: groupId,
                actionType: constant.Enum_Action.Cancel
            }
        });
        return res.end(JSON.stringify({ rs: true, msg: "Hủy thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.cancel", error);
    }
}

async function whSend(req, res, groupId, actionTime){
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `SELECT * FROM cutting_fr_marker_data_plan WHERE id=${groupId}`;
        let objMarker = await db.excuteQueryAsync(query);

        // check the ticket has been called or not
        if(objMarker[0].marker_call_by == undefined && objMarker[0].marker_call_date == undefined){
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này chưa được Marker gọi/ This ticket has not been called by Marker" }));
        }

        // check the ticket has been send by WH or not
        if(objMarker[0].wh_confirm_by != undefined && objMarker[0].wh_confirm_date != undefined){
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này đã được WH gửi/ This ticket has been sent by warehouse" }));
        }
        else{
            query = `UPDATE cutting_fr_marker_data_plan 
                    SET wh_confirm_date = '${datetime}', wh_confirm_by = '${user}', wh_confirm_time = ${actionTime}
                    WHERE id = ${groupId}`;
            let isUpdateSuccess = await db.excuteNonQueryAsync(query);
            if(isUpdateSuccess <= 0){
                return res.end(JSON.stringify({ rs: false, msg: "Warehouse gửi phiếu lỗi/ Warehouse send failed." }));
            }
            else{
                testIo.emit('ccd-fabric-receive-action', {
                    username: user,
                    message: {
                        groupId: groupId, 
                        actionType: constant.Enum_Action.WHSend
                    }
                });
        
                return res.end(JSON.stringify({ rs: true, msg: "Warehouse gửi thành công/ Warehouse send successful" }));
            }
        }
    } catch (error) {
        logHelper.writeLog("fabric_receive.whSend", error);
    }
}

module.exports.warehouseConfirm = async function (req, res) {
    try {
        // parameters
        let markerPlan = req.body.markerPlan;
        let markerDetailList = req.body.markerDetailList;
        let selectedRollList = req.body.selectedRollList;

        let insertRollFaiiList = [];
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // update note marker plan 
        let query = `UPDATE cutting_fr_marker_data_plan 
                    SET note = '${markerPlan.note}'
                    WHERE id = ${markerPlan.id}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if(isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật note phiếu yêu cầu vải không thành công." }));

        // update inventory and insert selected roll to database
        for (let i = 0; i < markerDetailList.length; i++) {
            let eleMarkerDetail = markerDetailList[i];
            let rollList = selectedRollList.filter(x => x.markerDetailId == eleMarkerDetail.id);
            
            for (let j = 0; j < rollList.length; j++) {
                let eleRoll = rollList[j];
                
                // insert to cutting_fr_marker_data_plan_detail_roll table
                query = `INSERT INTO cutting_fr_marker_data_plan_detail_roll (
                    marker_plan_id,
                    marker_plan_detail_id,
                    roll_id,
                    runip,
                    unipack2,
                    rcutwo,
                    rffsty,
                    item_color,
                    rcutwd,
                    rcolor,
                    rfinwt,
                    yard,
                    rlocbr,
                    rgrade,
                    shade,
                    vendor_lot,
                    po_number,
                    rccust,
                    rlstdt,
                    vender,
                    rlocdp,
                    rdyedt,
                    rfindt,
                    fnd,
                    rrstat,
                    ruser,
                    rfstyl,
                    rshapr,
                    rlnvar,
                    rdylot
                ) 
                VALUES (
                    ${markerPlan.id},
                    ${eleMarkerDetail.id},
                    '${eleRoll.id}',
                    '${eleRoll.runip}',
                    '${eleRoll.unipack2}',
                    '${eleRoll.rcutwo}',
                    '${eleRoll.rffsty}',
                    '${eleRoll.item_color}',
                    '${eleRoll.rcutwd}',
                    '${eleRoll.rcolor}',
                    ${eleRoll.rfinwt},
                    ${eleRoll.usedYard},
                    '${eleRoll.rlocbr}',
                    '${eleRoll.rgrade}',
                    '${eleRoll.shade}',
                    '${eleRoll.vendor_lot}',
                    '${eleRoll.po_number}',
                    '${eleRoll.rccust}',
                    '${eleRoll.rlstdt}',
                    '${eleRoll.vender}',
                    '${eleRoll.rlocdp}',
                    '${eleRoll.rdyedt}',
                    '${eleRoll.rfindt}',
                    '${eleRoll.fnd}',
                    '${eleRoll.rrstat}',
                    '${eleRoll.ruser}',
                    '${eleRoll.rfstyl}',
                    '${eleRoll.rshapr}',
                    '${eleRoll.rlnvar}',
                    '${eleRoll.rdylot}'
                )`;
                
                let isInsertRollSuccess = await db.excuteInsertReturnIdAsync(query);
                if(isInsertRollSuccess < 0){
                    insertRollFaiiList.push(eleRoll);
                }
                // auto update roll 's yard in inventory warehouse: remain yard, note, status by using MySQL trigger
            }
        }
        
        if (insertRollFaiiList.length > 0){
            return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
        }
        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.warehouseConfirm", error);
    }
}

async function ccdSend(req, res, groupId){
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `SELECT * FROM cutting_fr_marker_data_plan WHERE id=${groupId}`;
        let objMarker = await db.excuteQueryAsync(query);

        // check the ticket has been called or not
        if(objMarker[0].marker_call_by != undefined && objMarker[0].marker_call_by != undefined){
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này đã được ccd gọi/ This ticket has been called" }));
        }
        else{
            query = `UPDATE cutting_fr_marker_data_plan 
                    SET ccd_call_date = '${datetime}', ccd_call_by = '${user}'
                    WHERE id = ${groupId}`;
            let isUpdateSuccess = await db.excuteNonQueryAsync(query);
            if(isUpdateSuccess <= 0){
                return res.end(JSON.stringify({ rs: false, msg: "Gọi phiếu xảy ra lỗi/ Calling ticket occured error" }));
            }
            else{
                testIo.emit('ccd-fabric-receive-action', {
                    username: user,
                    message: {
                        groupId: groupId, 
                        callDate: datetime,
                        actionType: constant.Enum_Action.Call
                    }
                });
        
                return res.end(JSON.stringify({ rs: true, msg: "Gọi phiếu thành công/ The ticket has been called successful" }));
            }
        }
    } catch (error) {
        logHelper.writeLog("fabric_receive.ccdCall", error);
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
        let itemStatus = req.body.status;

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Inventory_Data (${currentPage}, ${itemPerPage}, '${unipack}', '${itemColor}', '${itemStatus}')`, function (result) {
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

function calTaskNumber(totalRow, numberPerTask, taskNumDefault)
{
    if (totalRow <= taskNumDefault)
    {
        taskNumDefault = 1;
        numberPerTask = totalRow;
    }
    else
    {
        numberPerTask = totalRow / taskNumDefault;
        if (numberPerTask % taskNumDefault != 0)
            numberPerTask++;
    }
}

// cutting scan
module.exports.getIndexScanMarkerDataDetail = async function (req, res) {
    res.render('Cutting/FabricReceive/ScanFabric');
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

