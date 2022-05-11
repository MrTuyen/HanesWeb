
// libraries
const formidable = require('formidable');
var fs = require('fs');
const util = require('util');
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');
const xlsx = require('xlsx');
// const pdf = require('html-pdf');
// const fetch = require('node-fetch');
const { PythonShell } = require('python-shell');
const rename = util.promisify(fs.rename);
var JsBarcode = require('jsbarcode');
var { createCanvas } = require("canvas");
var canvas = createCanvas(1, 1);
const NodeCache = require("node-cache");
const myCache = new NodeCache();

// database
var Database = require("../../database/db_cutting.js")
const db = new Database();

// service
const cuttingService = require("../../services/Cutting/cutting.service");

// model

// logic
module.exports.getIndex = function (req, res) {
    let user = req.user;
    res.render('Cutting/FabricReceive/FabricReceive', { user: user });
}

// marker data
module.exports.getMarkerData = async function (req, res) {
    try {
        // parameters
        let filterPlant = req.body.filterPlant;
        let filterGroup = req.body.filterGroup;
        let filterWarehouseStatus = req.body.filterWarehouseStatus;
        let filterStatus = req.body.filterStatus;
        let filterWeek = req.body.filterWeek ? req.body.filterWeek : 0;
        let filterDate = req.body.filterDate;
        let fromDate = filterDate.split(';')[0];
        let toDate = filterDate.split(';')[1];

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data ('${filterPlant}', '${filterGroup}', '${filterStatus}', '${fromDate}', '${toDate}', ${filterWeek}, '${filterWarehouseStatus}')`, function (result) {
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
        masterInfo = masterInfo[0];

        // item-color detail info
        let detailInfo = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data_Detail (${groupId})`);

        // fabric roll info follow item-color
        let itemColorList = [];
        let farbicRollList = [];
        let selectedFabricRollList = [];
        if (detailInfo[0] != undefined && detailInfo[0].length >= 1) {
            itemColorList = [...new Set(detailInfo[0].map(x => x.item_color))]; // distinct array

            for (let i = 0; i < itemColorList.length; i++) {
                let ele = itemColorList[i];
                let result = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_wh_fabric_inventory WHERE item_color = '${ele}' AND plant = '${masterInfo.plant}'`);
                farbicRollList.push({ itemColor: ele, rollList: result.filter(x => x.rgrade == '1') });
            }

            if (masterInfo.wh_prepare == '0') {
                let result = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id = ${groupId}`);
                selectedFabricRollList.push(result);
            }
        }
        return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: { master: masterInfo, detail: detailInfo[0], fabricRoll: farbicRollList, selectedFabricRoll: selectedFabricRollList[0] } }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.getMarkerDataDetail", error);
        res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.getOtherSelectedRoll = async function (req, res) {
    try {
        // parameters
        let itemColor = req.body.itemColor;
        let markerPlanId = req.body.markerPlanId;

        // execute
        let detailInfo = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Used_Roll ('${itemColor}', ${markerPlanId})`);

        // fabric roll info follow item-color
        let otherSelectedFabricRollList = detailInfo[0];
        return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: otherSelectedFabricRollList }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.getOtherSelectedRoll", error);
        res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.uploadFabricFile = function (req, res) {
    try {
        // parameters
        let form = new formidable.IncomingForm();
        let data = [];

        form.parse(req, async function (err, fields, file) {
            if (err) {
                logHelper.writeLog("fabric_receive.uploadFabricFile", err);
                return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
            }

            for (var i = 0; i < Object.keys(file).length; i++) {
                let tempFile = file[Object.keys(file)[i]];

                // fs.rename(tempFile.path, "templates/cutting/" + tempFile.name, async function (err) {
                //     if (err) {
                //         logHelper.writeLog("fabric_receive.uploadFabricFile", err);
                //         return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
                //     }

                //     let sheets = await helper.getListSheetFromExcel("templates/cutting/" + tempFile.name);
                //     data.push({name: tempFile.name, sheets: sheets});

                //     if(data.length == Object.keys(file).length){
                //         return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: data }));
                //     }
                // });

                await rename(tempFile.path, "templates/cutting/" + tempFile.name)
                let sheets = [];
                if (tempFile.name.includes("xlsb")) {
                    sheets = helper.getListSheetFromExcel_Xlsx("templates/cutting/" + tempFile.name);
                }
                else {
                    sheets = await helper.getListSheetFromExcel("templates/cutting/" + tempFile.name);
                }
                data.push({ name: tempFile.name, sheets: sheets });

                if (data.length == Object.keys(file).length) {
                    return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: data }));
                }
            }
        });

    } catch (error) {
        logHelper.writeLog("fabric_receive.uploadFabricFile", error);
    }
}

module.exports.saveUploadData = async function (req, res) {
    try {
        // parameters
        let data = req.body.listData;

        // upload phiếu yêu cầu thêm vải (phiếu con của phiếu chính)
        let isParentTicket = req.body.parentTicketId ? 1 : 0;
        let parentTicketId = req.body.parentTicketId ? req.body.parentTicketId : 0;

        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();
        let datetimeDDMMYY = (new Date(datetime)).formatDateDDMMYYYY();

        for (let i = 0; i < data.length; i++) {
            let eleFile = data[i];
            // get data from excel file
            let arrExcelData = [];
            if (eleFile.file.includes("xlsb")) {
                arrExcelData = helper.getDataFromExcel_Xlsx("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }
            else {
                arrExcelData = await helper.getDataFromExcel("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }

            // clean data
            let masterData = [];
            for (let i = 0; i < arrExcelData.length; i++) {
                let rowData = arrExcelData[i];
                let group = rowData[3];
                let insertRow = [];
                if (group != '' && group.toLowerCase().trim() != 'không có') {
                    masterData.push(rowData);
                }
            }

            // insert to master table: only have group => take group, receive data, time, cut date, marker name, dozen value of first row                 
            let fr = masterData[0];
            let query = `SELECT id
                        FROM cutting_fr_marker_data_plan 
                        WHERE _group = '${fr[3]}'
                            AND cancel_by IS NULL
                            AND parentTicketId != 0`;

            let objMarkerPlan = await db.excuteQueryAsync(query);
            // if exist record with the same group name and it is not be canceled so system will not insert the record
            if (objMarkerPlan.length > 0) {
                continue;
            }

            query = `INSERT INTO cutting_fr_marker_data_plan (
                    plant, 
                    work_center, 
                    receive_date, 
                    receive_time, 
                    _group, 
                    cut_date, 
                    note, 
                    marker_call_by, 
                    marker_call_date, 
                    user_update, 
                    date_update, 
                    isParentTicket, 
                    parentTicketId,
                    request_reason,
                    request_user
                )
                VALUES (
                    '${fr[12]}', 
                    '${fr[13]}', 
                    '${new Date(fr[1]).toLocaleDateString()}', 
                    '${fr[2]}', 
                    '${fr[3]}', 
                    '${new Date(fr[8]).toLocaleDateString()}', 
                    '${fr[9]}', 
                    '${user}', 
                    '${datetime}', 
                    '${user}', 
                    '${datetime}', 
                    ${isParentTicket}, 
                    ${parentTicketId},
                    '${fr[15]}',
                    '${fr[16]}'
                )`;

            let isInsertMasterSuccess = await db.excuteQueryAsync(query);
            if (isInsertMasterSuccess.affectedRows < 0) {
                return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
            }

            // insert to child table: contain item color => insert each item color to child table
            let idMaster = isInsertMasterSuccess.insertId;
            let detailData = [];
            let html = '';
            for (let i = 0; i < masterData.length; i++) {
                let rowData = masterData[i];
                let detailObj = [];

                if (rowData[4] != '0' && rowData[4] != 0 && rowData[6] != undefined && rowData[6].length > 5) {
                    detailObj.push(idMaster);
                    detailObj.push(rowData[4]);
                    detailObj.push(rowData[5]);
                    detailObj.push(rowData[6]);
                    detailObj.push(rowData[7] ? rowData[7] : 0);
                    detailObj.push(rowData[10]);
                    detailObj.push(rowData[11]);

                    detailData.push(detailObj);

                    // section for send mail
                    html += `<tr>
                        <td>${datetimeDDMMYY}</td>
                        <td>${rowData[5]}</td>
                        <td>${fr[3].substring(fr[3].length - 2)}</td>
                        <td>${rowData[6]}</td>
                        <td>${rowData[7]}</td>
                        <td>${fr[15]}</td>
                        <td>${fr[3]}</td>
                        <td>${fr[16]}</td>
                    </tr>`
                }
            }
            query = `INSERT INTO cutting_fr_marker_data_plan_detail (group_id, wo, ass, item_color, yard_demand, marker_name, dozen) 
                    VALUES ?`;
            let isInsertDetailSuccess = await db.excuteInsertWithParametersAsync(query, detailData);

            // send mail
            if (isParentTicket == 1) { // phiếu yêu cầu thêm mới gửi mail
                let body = `
                    Dear all,
                    <br><br> Vui lòng cấp vải như yêu cầu bên dưới/ <i>Please supply fabric as table below</i>
                    <br> Truy cập website: <a href='http://10.113.98.238/cutting/fabric-receive'>Fabric Recieve</a> để xem chi tiết/ <i>Access website to know more <a href='http://10.113.98.238/cutting/fabric-receive'>Fabric Recieve</a></i>
                    <br> <br>
                    <table border='1' spacing='0' cellspacing='1' cellpadding='1'>
                        <tr style='background: #47a447'>
                            <th>Ngày</th>
                            <th>WL</th>
                            <th>Loại hàng</th>
                            <th>Mã màu</th>
                            <th>Số yard</th>
                            <th>Lý do</th>
                            <th>Nhóm</th>
                            <th>Người yêu cầu</th>
                        </tr>
                        {{table_body}}
                    </table>
                `;
                body = body.replace('{{table_body}}', html);
                let subject = `Tuyen Test YCT ${fr[3]} - ngày ${datetimeDDMMYY} chạy thử hệ thống, vui lòng bỏ qua - testing system, please ignore`;
                helper.sendMail(subject, 'HYS Innovation Innovation_System@hanes.com', config.MailList, 'tuyen.nguyen@hanes.com', body);
            }
        }

        testIo.emit('ccd-fabric-receive-action', {
            username: user,
            message: {
                actionType: constant.Enum_Action.Call
            }
        });

        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadData", error);
        res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.action = function (req, res) {
    try {
        // parameters
        let groupId = req.body.groupId;
        let action = req.body.action;
        let actionTime = req.body.actionTime;
        let cancelReason = req.body.cancelReason;
        let cancelStep = req.body.cancelStep;

        // execute
        switch (parseInt(action)) {
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
                    return ccdSend(req, res, groupId);
                }
            case constant.Enum_Action.WHSend:
                {
                    return whSend(req, res, groupId);
                }
        }
    } catch (error) {
        logHelper.writeLog("fabric_receive.action", error);
    }
}

async function markerCall(req, res, groupId) {
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `SELECT * FROM cutting_fr_marker_data_plan WHERE id=${groupId}`;
        let objMarker = await db.excuteQueryAsync(query);

        // check the ticket has been called or not
        if (objMarker[0].marker_call_by != undefined && objMarker[0].marker_call_by != undefined) {
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này đã được marker gọi/ This ticket has been called by marker" }));
        }
        else {
            query = `UPDATE cutting_fr_marker_data_plan 
                    SET marker_call_date = '${datetime}', marker_call_by = '${user}'
                    WHERE id = ${groupId}`;
            let isUpdateSuccess = await db.excuteNonQueryAsync(query);
            if (isUpdateSuccess <= 0) {
                return res.end(JSON.stringify({ rs: false, msg: "Gọi phiếu xảy ra lỗi/ Calling ticket occured error" }));
            }
            else {
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

async function cancel(req, res, groupId, cancelReason, cancelStep) {
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `UPDATE cutting_fr_marker_data_plan 
                    SET cancel_step = ${cancelStep}, 
                        cancel_reason = '${cancelReason}',  
                        cancel_date = '${datetime}', 
                        cancel_by = '${user}',
                        status = 3
                    WHERE id=${groupId}`;

        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Hủy phiếu cấp vải không thành công." }));

        // delete all fabric roll if selected before deleting
        // query = `DELETE FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id = ${groupId}`;
        // let isDeleteSuccess = await db.excuteNonQueryAsync(query);
        // if (isDeleteSuccess <= 0)
        //     return res.end(JSON.stringify({ rs: false, msg: "Hủy phiếu cấp vải không thành công." }));

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

async function whSend(req, res, groupId) {
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `SELECT * FROM cutting_fr_marker_data_plan WHERE id=${groupId}`;
        let objMarker = await db.excuteQueryAsync(query);

        // check the ticket has been called or not
        if (objMarker[0].marker_call_by == undefined && objMarker[0].marker_call_date == undefined) {
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này chưa được Marker gọi/ This ticket has not been called by Marker" }));
        }

        // check the ticket has been send by WH or not
        if (objMarker[0].wh_confirm_by != undefined && objMarker[0].wh_confirm_date != undefined) {
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này đã được WH gửi/ This ticket has been sent by warehouse" }));
        }
        else {
            query = `UPDATE cutting_fr_marker_data_plan 
                    SET wh_confirm_date = '${datetime}', wh_confirm_by = '${user}'
                    WHERE id = ${groupId}`;
            let isUpdateSuccess = await db.excuteNonQueryAsync(query);
            if (isUpdateSuccess <= 0) {
                return res.end(JSON.stringify({ rs: false, msg: "Warehouse gửi phiếu lỗi/ Warehouse send failed." }));
            }
            else {
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
        let selectedRollList = req.body.selectedRollList ? req.body.selectedRollList : [];

        let insertRollFaiiList = [];

        // update note marker plan 
        let query = `UPDATE cutting_fr_marker_data_plan 
                    SET note = '${markerPlan.note}', wh_prepare = '0', wh_note = '${markerPlan.wh_note}'
                    WHERE id = ${markerPlan.id}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật note phiếu yêu cầu vải không thành công." }));

        let scannedRollList = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id = ${markerPlan.id}`);

        // delete all roll in cutting_fr_marker_data_plan_detail_roll before insert new
        query = `DELETE FROM cutting_fr_marker_data_plan_detail_roll 
                WHERE marker_plan_id = ${markerPlan.id}`;
        let isDeleteSuccess = await db.excuteNonQueryAsync(query);
        if (isDeleteSuccess < 0)
            return res.end(JSON.stringify({ rs: false, msg: "Xóa thông tin cuộn vải không thành công." }));

        // update inventory and insert selected roll to database
        for (let i = 0; i < markerDetailList.length; i++) {
            let eleMarkerDetail = markerDetailList[i];
            let rollList = selectedRollList.filter(x => x.markerDetailId == eleMarkerDetail.id);

            for (let j = 0; j < rollList.length; j++) {
                let eleRoll = rollList[j];
                let existScannedRoll = scannedRollList.filter(x => x.unipack2 == eleRoll.unipack2);
                if (existScannedRoll.length > 0) {
                    eleRoll.scanned_time = existScannedRoll[0].scanned_time;
                }
                let scannedTime = eleRoll.scanned_time ? `${eleRoll.scanned_time}` : null;

                // insert to cutting_fr_marker_data_plan_detail_roll table
                if (scannedTime == null) {
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
                        rrstat,
                        ruser,
                        qccomment,
                        actual_with,
                        with_actual,
                        vendor,
                        rprtcd,
                        note
                    ) 
                    VALUES (
                        ${markerPlan.id},
                        ${eleMarkerDetail.id},
                        ${eleRoll.roll_id},
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
                        '${eleRoll.rrstat}',
                        '${eleRoll.ruser}',
                        '${eleRoll.qccomment}',
                        '${eleRoll.actual_with}',
                        '${eleRoll.with_actual}',
                        '${eleRoll.vendor}',
                        '${eleRoll.rprtcd}', 
                        '${eleRoll.note}'
                    )`;
                }
                else {
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
                        rrstat,
                        ruser,
                        qccomment,
                        actual_with,
                        with_actual,
                        vendor,
                        rprtcd,
                        note,
                        scanned_time
                    ) 
                    VALUES (
                        ${markerPlan.id},
                        ${eleMarkerDetail.id},
                        ${eleRoll.roll_id},
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
                        '${eleRoll.rrstat}',
                        '${eleRoll.ruser}',
                        '${eleRoll.qccomment}',
                        '${eleRoll.actual_with}',
                        '${eleRoll.with_actual}',
                        '${eleRoll.vendor}',
                        '${eleRoll.rprtcd}', 
                        '${eleRoll.note}', 
                        '${scannedTime}'
                    )`;
                }

                let isInsertRollSuccess = await db.excuteInsertReturnIdAsync(query);
                if (isInsertRollSuccess < 0) {
                    insertRollFaiiList.push(eleRoll);
                }
                // auto update roll 's yard in inventory warehouse: remain yard, note, status by using MySQL trigger
            }
        }

        if (insertRollFaiiList.length > 0) {
            return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
        }
        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.warehouseConfirm", error);
    }
}

async function ccdSend(req, res, groupId) {
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // execute
        let query = `SELECT * FROM cutting_fr_marker_data_plan WHERE id=${groupId}`;
        let objMarker = await db.excuteQueryAsync(query);

        // check the ticket has been called or not
        if (objMarker[0].marker_call_by == undefined && objMarker[0].marker_call_date == undefined) {
            return res.end(JSON.stringify({ rs: false, msg: "Phiếu này chưa được Marker gọi/ This ticket has not been called by Marker" }));
        }

        // check the ticket has been called or not
        // if (objMarker[0].ccd_confirm_by != undefined && objMarker[0].ccd_confirm_date != undefined) {
        //     return res.end(JSON.stringify({ rs: false, msg: "Phiếu này đã được ccd xác nhận hoàn thành/ This ticket has been confirmed by ccd" }));
        // }
        // else {
        //     query = `UPDATE cutting_fr_marker_data_plan 
        //             SET ccd_confirm_date = '${datetime}', ccd_confirm_by = '${user}'
        //             WHERE id = ${groupId}`;
        //     let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        //     if (isUpdateSuccess <= 0) {
        //         return res.end(JSON.stringify({ rs: false, msg: "Ccd xác nhận xảy ra lỗi/ The ticket has not beend confirmed by CCD successful" }));
        //     }
        //     else {
        //         testIo.emit('ccd-fabric-receive-action', {
        //             username: user,
        //             message: {
        //                 groupId: groupId,
        //                 actionType: constant.Enum_Action.CCDSend
        //             }
        //         });

        //         return res.end(JSON.stringify({ rs: true, msg: "Ccd xác nhận thành công/ The ticket has been confirmed by CCD successful" }));
        //     }
        // }

        query = `UPDATE cutting_fr_marker_data_plan 
                SET ccd_confirm_date = '${datetime}', ccd_confirm_by = '${user}'
                WHERE id = ${groupId}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0) {
            return res.end(JSON.stringify({ rs: false, msg: "Ccd xác nhận xảy ra lỗi/ The ticket has not beend confirmed by CCD successful" }));
        }
        else {
            testIo.emit('ccd-fabric-receive-action', {
                username: user,
                message: {
                    groupId: groupId,
                    actionType: constant.Enum_Action.CCDSend
                }
            });

            return res.end(JSON.stringify({ rs: true, msg: "Ccd xác nhận thành công/ The ticket has been confirmed by CCD successful" }));
        }
    } catch (error) {
        logHelper.writeLog("fabric_receive.ccdCall", error);
    }
}

module.exports.ccdConfirm = async function (req, res) {
    try {
        // parameters
        let markerPlan = req.body.markerPlan;
        let markerDetailList = req.body.markerDetailList;
        let selectedRollList = req.body.selectedRollList;

        let updateRollFaiiList = [];

        // update note marker plan 
        let query = `UPDATE cutting_fr_marker_data_plan 
                    SET note = '${markerPlan.note}', status = 2
                    WHERE id = ${markerPlan.id}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật note phiếu yêu cầu vải không thành công." }));

        // update inventory and insert selected roll to database
        for (let i = 0; i < markerDetailList.length; i++) {
            let eleMarkerDetail = markerDetailList[i];
            let rollList = selectedRollList.filter(x => x.marker_plan_detail_id == eleMarkerDetail.id);

            for (let j = 0; j < rollList.length; j++) {
                let eleRoll = rollList[j];

                if (eleRoll.scanned_time != '') {
                    // update scanned time to cutting_fr_marker_data_plan_detail_roll table
                    query = `UPDATE cutting_fr_marker_data_plan_detail_roll
                    SET scanned_time = '${eleRoll.scanned_time}'
                    WHERE id = ${eleRoll.id}`;

                    let isUpdateRollSuccess = await db.excuteNonQueryAsync(query);
                    if (isUpdateRollSuccess < 0) {
                        updateRollFaiiList.push(eleRoll);
                    }
                }
            }
        }

        if (updateRollFaiiList.length > 0) {
            return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
        }
        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.ccdConfirm", error);
    }
}

module.exports.printTicket = async function (req, res) {
    try {
        let ctextColorList = [];
        if(!myCache.get("ctex_color_list")){
            let ctexDb = await db.excuteQueryAsync(`SELECT color FROM cutting_fr_ctex`);
            myCache.set("ctex_color_list", ctexDb);
        }
        ctextColorList = myCache.get("ctex_color_list").map(x => x.color);

        // parameters
        let groupId = req.body.groupId;

        // execute
        // master data info
        let masterInfo = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan WHERE id = ${groupId}`);

        // item-color detail info
        let detailInfo = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data_Detail (${groupId})`);

        // fabric roll info follow item-color
        let itemColorList = [];
        let selectedFabricRollList = [];
        if (detailInfo[0] != undefined && detailInfo[0].length >= 1) {
            itemColorList = [...new Set(detailInfo[0].map(x => x.item_color))]; // distinct array

            if (masterInfo[0].wh_prepare == '0') {
                let result = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id = ${groupId}`);
                selectedFabricRollList.push(result);
            }
        }

        let data = {
            master: masterInfo[0],
            detail: detailInfo[0],
            selectedFabricRoll: selectedFabricRollList[0] ? selectedFabricRollList[0] : []
        }
        let sumYard = data.selectedFabricRoll.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);

        // checking includes ctex ctextColorList
        let isCtex = data.selectedFabricRoll.map(x => x.rffsty).some(r => ctextColorList.indexOf(r) >= 0);
        let templateFile = 'templates/print/fabricPrint.html';
        if(isCtex){
            templateFile = 'templates/print/fabricPrintCtex.html';
        }
        // read file and replace
        let template = fs.readFileSync(templateFile, 'utf8');

        let table1 = `<tr>
                        <td width="25%">Received Date: ${data.master.receive_date}</td>
                        <td width="25%">Received Time: ${data.master.receive_time}</td>
                        <td width="25%">Group: ${data.master._group}</td>
                        <td width="25%">Cut Date: ${data.master.cut_date}</td>
                    </tr>
                    <tr>
                        <td width="25%">Created Date: ${data.master.date_update}</td>
                        <td width="25%">Week ${new Date(data.master.date_update).getWeekNumber()}</td>
                        <td width="25%">Note</td>
                    </tr>
                    <tr>
                        <td width="10%">${data.selectedFabricRoll.length} Cuộn</td>
                        <td width="10%">${sumYard.toFixed(2)} YDS</td>
                    </tr>`

        template = template.replace("{{table1}}", table1);

        let table2 = '';
        let colorFlag = '';
        for (let i = 0; i < data.detail.length; i++) {
            let eleMarkerDetail = data.detail[i];
            if (eleMarkerDetail.item_color != colorFlag) {
                let selectedRollList = data.selectedFabricRoll.filter(x => x.marker_plan_detail_id == eleMarkerDetail.id);
                let sumYard = selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);
                let rollCount = selectedRollList.length;
                let sameColorList = data.detail.filter(x => x.item_color == eleMarkerDetail.item_color);
                let sumDemandYard = sameColorList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0);

                if (selectedRollList.length > 0) {
                    let str = `<tr style='background: #ced6dd'>
                        <td></td>
                        <td></td>
                        <td>${rollCount} cuộn</td>
                        <td></td>
                        <td><span class='text-danger'>${sumYard.toFixed(2)}</span> / ${sumDemandYard.toFixed(2)}</td>
                        <td></td>
                        <td></td>
                        <td colspan='15'></td>
                    </tr>`;
                    for (let j = 0; j < selectedRollList.length; j++) {
                        let eleRoll = selectedRollList[j];

                        let barcodeImg = '';
                        if (sameColorList[j] && sameColorList[j].wo != '') {
                            JsBarcode(canvas, sameColorList[j].wo);
                            barcodeImg = canvas.toDataURL();
                        }
                        if(isCtex){
                            str += `<tr>
                                <td>${j + 1}</td>
                                <td>${sameColorList[j] ? sameColorList[j].item_color : ''}</td>
                                <td>${eleRoll.unipack2}</td>
                                <td>${eleRoll.rlocbr}</td>
                                <td>${eleRoll.yard.toFixed(2)}</td>
                                <td>${eleRoll.rfinwt}</td>
                                <td>${eleRoll.rgrade}</td>
                                <td>${eleRoll.shade}</td>
                                <td>${eleRoll.vendor_lot}</td>
                                <td>${eleRoll.po_number}</td>
                                <td>${eleRoll.rccust == 0 ? '' : eleRoll.rccust.replace('.0', '')}</td>
                                <td>
                                    ${barcodeImg != '' ? `<img width="50" height="20" src=${barcodeImg} />` : ''}
                                </td>
                                <td>${ctextColorList.indexOf(eleRoll.rffsty) > 0 ? "Ctex" : ""}</td>
                                <td>${eleRoll.with_actual}</td>
                                <td>${eleRoll.vendor}</td>
                                <td>${eleRoll.note}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>`;
                        }
                        else{
                            str += `<tr>
                                <td>${j + 1}</td>
                                <td>${sameColorList[j] ? sameColorList[j].item_color : ''}</td>
                                <td>${eleRoll.unipack2}</td>
                                <td>${eleRoll.rlocbr}</td>
                                <td>${eleRoll.yard.toFixed(2)}</td>
                                <td>${eleRoll.rfinwt}</td>
                                <td>${eleRoll.rgrade}</td>
                                <td>${eleRoll.shade}</td>
                                <td>${eleRoll.vendor_lot}</td>
                                <td>${eleRoll.po_number}</td>
                                <td>${eleRoll.rccust == 0 ? '' : eleRoll.rccust.replace('.0', '')}</td>
                                <td>
                                    ${barcodeImg != '' ? `<img width="50" height="20" src=${barcodeImg} />` : ''}
                                </td>
                                <td>${eleRoll.with_actual}</td>
                                <td>${eleRoll.vendor}</td>
                                <td>${eleRoll.note}</td>
                            </tr>`;
                        }
                    }
                    // str += '<tr style="background: #ced6dd"><td colspan="20">&nbsp;</td></tr>';
                    table2 += str;
                }
            }
            colorFlag = eleMarkerDetail.item_color;
        }

        template = template.replace("{{table2}}", table2);

        fs.writeFile('public/Assets/fabricPrint.html', template, 'utf-8', function (err, response) {
            if (err) {
                logHelper.writeLog("fabric_receive.printTicket", err);
                return res.end(JSON.stringify({ rs: false, msg: "Thất bại" }));
            }
            return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
        });
    } catch (error) {
        logHelper.writeLog("fabric_receive.printTicket", error);
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

// module.exports.printTicket = async function (req, res) {
//     try {
//         // parameters
//         let groupId = req.body.groupId;

//         // execute
//         // master data info
//         let masterInfo = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan WHERE id = ${groupId}`);

//         // item-color detail info
//         let detailInfo = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data_Detail (${groupId})`);

//         // fabric roll info follow item-color
//         let itemColorList = [];
//         let selectedFabricRollList = [];
//         if (detailInfo[0] != undefined && detailInfo[0].length >= 1) {
//             itemColorList = [...new Set(detailInfo[0].map(x => x.item_color))]; // distinct array

//             if (masterInfo[0].wh_prepare == '0') {
//                 let result = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id = ${groupId}`);
//                 selectedFabricRollList.push(result);
//             }
//         }

//         let data = {
//             master: masterInfo[0],
//             detail: detailInfo[0],
//             selectedFabricRoll: selectedFabricRollList[0] ? selectedFabricRollList[0] : []
//         }
//         let sumYard = data.selectedFabricRoll.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);

//         // read file and replace
//         let template = fs.readFileSync('templates/print/fabricPrint.html', 'utf8');

//         let table1 = `<tr>
//                         <td width="25%">Received Date: ${data.master.receive_date}</td>
//                         <td width="25%">Received Time: ${data.master.receive_time}</td>
//                         <td width="25%">Group: ${data.master._group}</td>
//                         <td width="25%">Cut Date: ${data.master.cut_date}</td>
//                     </tr>
//                     <tr>
//                         <td width="25%">Created Date: ${data.master.date_update}</td>
//                         <td width="25%">Week ${new Date(data.master.date_update).getWeekNumber()}</td>
//                         <td width="25%">Note</td>
//                     </tr>
//                     <tr>
//                         <td width="10%">${data.selectedFabricRoll.length} Cuộn</td>
//                         <td width="10%">${sumYard.toFixed(2)} YDS</td>
//                     </tr>`

//         template = template.replace("{{table1}}", table1);

//         let table2 = '';
//         let colorFlag = '';
//         for (let i = 0; i < data.detail.length; i++) {
//             let eleMarkerDetail = data.detail[i];
//             if (eleMarkerDetail.item_color != colorFlag) {
//                 let selectedRollList = data.selectedFabricRoll.filter(x => x.marker_plan_detail_id == eleMarkerDetail.id);
//                 let sumYard = selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);
//                 let rollCount = selectedRollList.length;
//                 let sameColorList = data.detail.filter(x => x.item_color == eleMarkerDetail.item_color);
//                 let sumDemandYard = sameColorList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0);

//                 if (selectedRollList.length > 0) {
//                     let str = `<tr style='background: #ced6dd'>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                         <td>${rollCount} cuộn</td>
//                         <td><span class='text-danger'>${sumYard.toFixed(2)}</span> / ${sumDemandYard.toFixed(2)}</td>
//                         <td colspan='9'></td>
//                     </tr>`;
//                     for (let j = 0; j < selectedRollList.length; j++) {
//                         let eleRoll = selectedRollList[j];

//                         let barcodeImg = '';
//                         if (sameColorList[j] && sameColorList[j].wo != '') {
//                             JsBarcode(canvas, sameColorList[j].wo);
//                             barcodeImg = canvas.toDataURL();
//                         }
//                         str += `<tr>
//                             <td>${j + 1}</td>
//                             <td>${sameColorList[j] ? sameColorList[j].item_color : ''}</td>
//                             <td>
//                                 ${barcodeImg != '' ? `<img width="50" height="20" src=${barcodeImg} />` : ''}
//                             </td>
//                             <td>${sameColorList[j] ? sameColorList[j].wo : ''}</td>
//                             <td>${sameColorList[j] ? sameColorList[j].ass : ''}</td>
//                             <td>${sameColorList[j] ? sameColorList[j].yard_demand.toFixed(2) : ''}</td>
//                             <td>${eleRoll.unipack2}</td>
//                             <td>${eleRoll.yard.toFixed(2)}</td>
//                             <td>${eleRoll.rfinwt}</td>
//                             <td>${eleRoll.rgrade}</td>
//                             <td>${eleRoll.rlocbr}</td>
//                             <td>${eleRoll.shade}</td>
//                             <td>${eleRoll.with_actual}</td>
//                             <td>${eleRoll.po_number}</td>
//                             <td>${eleRoll.rccust == 0 ? '' : eleRoll.rccust.replace('.0', '')}</td>
//                             <td>${eleRoll.note}</td>
//                         </tr>`;
//                     }
//                     str += '<tr style="background: #ced6dd"><td colspan="20">&nbsp;</td></tr>';
//                     table2 += str;
//                 }
//             }
//             colorFlag = eleMarkerDetail.item_color;
//         }

//         template = template.replace("{{table2}}", table2);

//         fs.writeFile('public/Assets/fabricPrint.html', template, 'utf-8', function (err, response) {
//             if (err) {
//                 logHelper.writeLog("fabric_receive.printTicket", err);
//                 return res.end(JSON.stringify({ rs: false, msg: "Thất bại" }));
//             }
//             return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
//         });
//     } catch (error) {
//         logHelper.writeLog("fabric_receive.printTicket", error);
//         return res.end(JSON.stringify({ rs: false, msg: error.message }));
//     }
// }

module.exports.downloadMarkerData = function (req, res) {
    try {
        // parameters
        let filterPlant = req.body.filterPlant;
        let filterGroup = req.body.filterGroup;
        let filterWarehouseStatus = req.body.filterWarehouseStatus;
        let filterStatus = req.body.filterStatus;

        let filterWeek = req.body.filterWeek ? req.body.filterWeek : 0;
        let filterDate = req.body.filterDate;
        let fromDate = filterDate.split(';')[0];
        let toDate = filterDate.split(';')[1];

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data ('${filterPlant}', '${filterGroup}', '${filterStatus}', '${fromDate}', '${toDate}', ${filterWeek}, '${filterWarehouseStatus}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonModel = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Ticket Data'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'id', key: 'id', width: 10 },
                    { header: 'plant', key: 'plant', width: 10 },
                    { header: 'work_center', key: 'work_center', width: 10 },
                    { header: 'receive_date', key: 'receive_date', width: 20 },
                    { header: 'receive_time', key: 'receive_time', width: 20 },
                    { header: 'group', key: '_group', width: 20 },
                    { header: 'cut_date', key: 'cut_date', width: 20 },
                    { header: 'user_update', key: 'user_update', width: 20 },
                    { header: 'created_date', key: 'date_update', width: 20 },
                    { header: 'marker_call_date', key: 'marker_call_date', width: 20 },
                    { header: 'marker_call_by', key: 'marker_call_by', width: 20 },
                    { header: 'wh_confirm_date', key: 'wh_confirm_date', width: 20 },
                    { header: 'wh_confirm_by', key: 'wh_confirm_by', width: 20 },
                    { header: 'ccd_confirm_date', key: 'ccd_confirm_date', width: 20 },
                    { header: 'ccd_confirm_by', key: 'ccd_confirm_by', width: 20 },
                    { header: 'cancel_date', key: 'cancel_date', width: 20 },
                    { header: 'cancel_by', key: 'cancel_by', width: 20 },
                    { header: 'cancel_reason', key: 'cancel_reason', width: 20 },
                    { header: 'cancel_step', key: 'cancel_step', width: 20 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonModel);

                // Write to File
                let filename = "templates/ticket_data.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });
    } catch (error) {
        logHelper.writeLog("fabricreceive.downloadMarkerData", error);
    }
}

module.exports.downloadRollData = async function (req, res) {
    try {
        // parameters
        let filterPlant = req.body.filterPlant;
        let filterGroup = req.body.filterGroup;
        let filterWarehouseStatus = req.body.filterWarehouseStatus;
        let filterStatus = req.body.filterStatus;
        let filterWeek = req.body.filterWeek ? req.body.filterWeek : 0;
        let filterDate = req.body.filterDate;
        let fromDate = filterDate.split(';')[0];
        let toDate = filterDate.split(';')[1];

        // execute
        let result = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data ('${filterPlant}', '${filterGroup}', '${filterStatus}', '${fromDate}', '${toDate}', ${filterWeek}, '${filterWarehouseStatus}')`);

        // list marker plan => return id, group
        let markerInfoList = result[0].filter(x => x.cancel_date == null);
        // let markerInfoList = result[0];
        let finalResponse = [];
        for (let i = 0; i < markerInfoList.length; i++) {
            let ele = markerInfoList[i];

            let markerDetailInfo = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data_Detail (${ele.id})`);
            let rollInfo = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id = ${ele.id}`);

            if (markerDetailInfo[0] != undefined && markerDetailInfo[0].length >= 1) {

                for (let j = 0; j < markerDetailInfo[0].length; j++) {
                    let eleMarkerDetail = markerDetailInfo[0][j];

                    let tempRoll = rollInfo.filter(x => x.marker_plan_detail_id == eleMarkerDetail.id);
                    if (tempRoll.length > 0) {
                        tempRoll.forEach(x => {
                            let row = new MarkerPlanDetailRoll
                                (
                                    ele._group,
                                    eleMarkerDetail.wo,
                                    eleMarkerDetail.ass,
                                    ele.receive_date,
                                    ele.cut_date,
                                    eleMarkerDetail.item_color,
                                    eleMarkerDetail.yard_demand,
                                    x.unipack2,
                                    x.yard,
                                    x.rlocbr,
                                    x.note,
                                    ele.cancel_date == null ? "" : "Yes"
                                )

                            finalResponse.push(row);
                        })
                    }
                    else {
                        let row = new MarkerPlanDetailRoll
                            (
                                ele._group,
                                eleMarkerDetail.wo,
                                eleMarkerDetail.ass,
                                ele.receive_date,
                                ele.cut_date,
                                eleMarkerDetail.item_color,
                                eleMarkerDetail.yard_demand,
                                "",
                                "",
                                "",
                                "",
                                ele.cancel_date == null ? "" : "Yes"
                            )

                        finalResponse.push(row);
                    }
                }
            }
        }

        let jsonModel = JSON.parse(JSON.stringify(finalResponse));

        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet('Roll Data'); //creating worksheet

        //  WorkSheet Header
        worksheet.columns = [
            { header: 'group', key: 'group', width: 10 },
            { header: 'receive_date', key: 'receive_date', width: 10 },
            { header: 'cut_date', key: 'cut_date', width: 10 },
            { header: 'wo', key: 'wo', width: 10 },
            { header: 'ass', key: 'ass', width: 10 },
            { header: 'item_color', key: 'item_color', width: 20 },
            { header: 'demand_yard', key: 'demand_yard', width: 20 },
            { header: 'unipack', key: 'unipack', width: 20 },
            { header: 'roll_yard', key: 'roll_yard', width: 20 },
            { header: 'bin', key: 'bin', width: 20 },
            { header: 'note', key: 'note', width: 20 },
            { header: 'is_cancel', key: 'status', width: 20 }
        ];

        // Add Array Rows
        worksheet.addRows(jsonModel);

        // Write to File
        let filename = "templates/roll_data.xlsx";
        workbook.xlsx.writeFile(filename).then(function () {
            res.download(filename);
        });
    } catch (error) {
        logHelper.writeLog("fabricreceive.downloadRollData", error);
    }
}

module.exports.getIndexMarkerUpdate = function (req, res) {
    let user = req.user;
    res.render('Cutting/FabricReceive/MarkerUpdate', { user: user });
}

module.exports.markerUpdate = async function (req, res) {
    try {
        // parameters
        let id = req.body.id;
        let receivedDate = req.body.receivedDate;
        let receivedTime = req.body.receivedTime;
        let cutDate = req.body.cutDate;
        let note = req.body.note;

        // update some general information marker plan 
        let query = `UPDATE cutting_fr_marker_data_plan 
                    SET receive_date = '${receivedDate}', receive_time = '${receivedTime}', cut_date = '${cutDate}', note = '${note}'
                    WHERE id = ${id}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật thông tin phiếu yêu cầu vải không thành công." }));
        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.markerUpdate", error);
    }
}

module.exports.saveUpdateUploadData = async function (req, res) {
    try {
        // parameters
        let id = req.body.id;
        let data = req.body.listData;

        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        for (let i = 0; i < data.length; i++) {
            let eleFile = data[i];
            // get data from excel file
            let arrExcelData = [];
            if (eleFile.file.includes("xlsb")) {
                arrExcelData = helper.getDataFromExcel_Xlsx("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }
            else {
                arrExcelData = await helper.getDataFromExcel("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }

            // clean data
            let updateDetailData = [];
            for (let i = 0; i < arrExcelData.length; i++) {
                let rowData = arrExcelData[i];
                let group = rowData[3];
                if (group != '' && group.toLowerCase().trim() != 'không có') {
                    updateDetailData.push(rowData);
                }
            }

            // update general info
            let fr = updateDetailData[0];
            let query = `UPDATE cutting_fr_marker_data_plan 
                    SET receive_date = '${new Date(fr[1]).toLocaleDateString()}', 
                        receive_time = '${fr[2]}', 
                        cut_date = '${new Date(fr[8]).toLocaleDateString()}', 
                        note = '${fr[9]}',
                        plant = '${fr[12]}'
                    WHERE id = ${id}`;
            let isUpdateSuccess = await db.excuteNonQueryAsync(query);
            if (isUpdateSuccess <= 0)
                return res.end(JSON.stringify({ rs: false, msg: "Cập nhật thông tin phiếu yêu cầu vải không thành công." }));

            // update marker detail info
            let markerDetailInfo = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Marker_Data_Detail (${id})`);
            markerDetailInfo = markerDetailInfo[0];
            let detailData = [];
            for (let i = 0; i < updateDetailData.length; i++) {
                let rowData = updateDetailData[i];
                let detailObj = [];
                let isExistObj = markerDetailInfo.filter(x => x.wo == rowData[4] && x.ass == rowData[5] && x.item_color == rowData[6]);
                if (isExistObj && isExistObj.length > 0) { // update
                    let delIndex = markerDetailInfo.indexOf(isExistObj[0]);
                    markerDetailInfo.splice(delIndex, 1);

                    query = `UPDATE cutting_fr_marker_data_plan_detail  
                            SET yard_demand = ${rowData[7]}, marker_name = '${rowData[10]}', dozen = '${rowData[11]}'
                            WHERE id = ${isExistObj[0].id}`;
                    let isUpdateSuccess = await db.excuteNonQueryAsync(query);
                }
                else { // insert
                    if (rowData[4] != '0' && rowData[4] != 0 && rowData[6] != undefined && rowData[6].length > 5) {
                        detailObj.push(id);
                        detailObj.push(rowData[4]);
                        detailObj.push(rowData[5]);
                        detailObj.push(rowData[6]);
                        detailObj.push(rowData[7]);
                        detailObj.push(rowData[10]);
                        detailObj.push(rowData[11]);

                        detailData.push(detailObj);
                    }
                }
            }

            // delete 
            if (markerDetailInfo.length > 0) {
                query = `DELETE FROM cutting_fr_marker_data_plan_detail WHERE id IN (${markerDetailInfo.map(x => x.id)})`;
                let isDeleteDetailSuccess = await db.excuteNonQueryAsync(query);

                query = `DELETE FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_detail_id IN (${markerDetailInfo.map(x => x.id)})`;
                let isDeleteRollSuccess = await db.excuteNonQueryAsync(query);
            }

            if (detailData.length > 0) {
                query = `INSERT INTO cutting_fr_marker_data_plan_detail (group_id, wo, ass, item_color, yard_demand, marker_name, dozen) 
                    VALUES ?`;
                let isInsertDetailSuccess = await db.excuteInsertWithParametersAsync(query, detailData);
            }
        }

        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadData", error);
    }
}

module.exports.issueUpdate = async function (req, res) {
    try {
        // parameters
        let id = req.body.id;
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // update some general information marker plan 
        let query = `UPDATE cutting_fr_marker_data_plan 
                    SET issue_date = '${datetime}', issue_by = '${user}'
                    WHERE id = ${id}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật thông tin phiếu yêu cầu vải không thành công." }));

        testIo.emit('ccd-fabric-receive-action', {
            username: user,
            message: {
                groupId: id,
                actionType: constant.Enum_Action.Issue
            }
        });
        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.issueUpdate", error);
    }
}

// inventory data
module.exports.getIndexInventoryData = function (req, res) {
    let user = req.user;
    res.render('Cutting/FabricReceive/FabricInventoryData', { user: user });
}

module.exports.getInventoryData = async function (req, res) {
    try {
        // parameters
        let currentPage = req.body.currentPage;
        let itemPerPage = req.body.itemPerPage;
        let unipack = req.body.unipack;
        let itemColor = req.body.itemColor;
        let itemStatus = req.body.status;
        let itemNote = req.body.note;
        let plant = req.body.plant;

        // execute
        let query = `CALL USP_Cutting_Fabric_Receive_Get_Inventory_Data_Used ()`;
        let resultUsedRollList = await db.excuteSPAsync(query);
        let usedRollList = resultUsedRollList[0];

        query = `CALL USP_Cutting_Fabric_Receive_Get_Inventory_Data (${currentPage}, ${itemPerPage}, '${unipack}', '${itemColor}', '${itemStatus}', '${itemNote}', '${plant}')`;
        let resultRollList = await db.excuteSPAsync(query);
        let rollList =  resultRollList[0];
    
        rollList.forEach(ele => {
            let existusedObj = usedRollList.filter(x => x.unipack2 == ele.unipack2);
            if(existusedObj && existusedObj.length > 0) {
                ele.status = 1;
                ele.note = existusedObj[0]._group;
            }
        })

        // if(itemStatus == 1)
        //     rollList = rollList.filter(x => x.status == 1);

        // if(itemNote.length > 0)
        //     rollList = rollList.filter(x => x.note && x.note.includes(itemNote));

        let totalPage = 0;
        let totalRow = rollList.length == 0 ? 0 : rollList[0].totalRow;
        if (totalRow % itemPerPage == 0)
            totalPage = totalRow == 0 ? 1 : totalRow / itemPerPage;
        else
            totalPage = totalRow / itemPerPage + 1;

        res.end(JSON.stringify({ rs: true, msg: "Thành công", data: { data: rollList, totalPage: Math.floor(totalPage), totalRow: totalRow } }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.getInventoryData", error);
        res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.uploadFabricInventoryDataFile = function (req, res) {
    try {
        // parameters
        let form = new formidable.IncomingForm();
        let data = [];

        form.parse(req, async function (err, fields, file) {
            if (err) {
                logHelper.writeLog("fabric_receive.uploadFabricInventoryDataFile", err);
                return res.end(JSON.stringify({ rs: false, msg: "Tải file lên không thành công" }));
            }

            for (var i = 0; i < Object.keys(file).length; i++) {
                let tempFile = file[Object.keys(file)[i]];

                await rename(tempFile.path, "templates/cutting/" + tempFile.name)
                // let sheets = await helper.getListSheetFromExcel("templates/cutting/" + tempFile.name);
                let sheets = [];
                if (tempFile.name.includes("xlsb")) {
                    sheets = helper.getListSheetFromExcel_Xlsx("templates/cutting/" + tempFile.name);
                }
                else {
                    sheets = await helper.getListSheetFromExcel("templates/cutting/" + tempFile.name);
                }
                data.push({ name: tempFile.name, sheets: sheets });

                if (data.length == Object.keys(file).length) {
                    return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: data }));
                }
            }
        });
    } catch (error) {
        logHelper.writeLog("fabric_receive.uploadFabricInventoryDataFile", error);
    }
}

module.exports.saveUploadFabricInventoryDataFile = async function (req, res) {
    try {
        // parameters
        let data = req.body.listData;

        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        for (let j = 0; j < data.length; j++) {
            let eleFile = data[j];
            // get data from excel file
            let arrExcelData = [];
            if (eleFile.file.includes("xlsb")) {
                arrExcelData = helper.getDataFromExcel_Xlsx("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }
            else {
                arrExcelData = await helper.getDataFromExcel("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }
            // insert data into database
            let savedData = [];
            for (let i = 0; i < arrExcelData.length; i++) {
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

                row.push(user);
                row.push(datetime);

                savedData.push(row);
            }

            // delete all data before update latest data from Inventory6
            let query = `TRUNCATE TABLE cutting_fr_wh_fabric_inventory`;
            let isDeleteOldData = await db.excuteNonQueryAsync(query);
            if (isDeleteOldData < 0)
                return res.end(JSON.stringify({ rs: false, msg: "Xóa dữ liệu cũ không thành công" }));

            let loopNumber = Math.ceil(savedData.length / 1000);
            for (let i = 0; i < loopNumber; i++) {
                let index = i * 1000;
                let tempList = savedData.slice(index, index + 1000);
                let isUploadSuccess = await cuttingService.addFabricInventoryData(tempList);
                if (isUploadSuccess < 0)
                    return res.end(JSON.stringify({ rs: false, msg: "Thêm dữ liệu mới không thành công" }));
                if (i == loopNumber - 1)
                    return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
            }
        }

        // let isUploadSuccess = await cuttingService.addFabricInventoryData(savedData);
        // if(isUploadSuccess < 0)
        //     return res.end(JSON.stringify({ rs: false, msg: "Thêm dữ liệu mới không thành công" }));

        // return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadFabricInventoryDataFile", error);
    }
}

module.exports.getInventoryDataTTS = async function (req, res) {
    try {
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // delete all data before update latest data from Inventory6
        let query = `TRUNCATE TABLE cutting_fr_wh_fabric_inventory`;
        let isDeleteOldData = await db.excuteNonQueryAsync(query);
        if (isDeleteOldData < 0)
            return res.end(JSON.stringify({ rs: false, msg: "Xóa dữ liệu cũ không thành công" }));

        let options = {
            mode: 'text',
            pythonPath: 'python',
            scriptPath: './public/Python/Cutting/FabricReceive',
            pythonOptions: ['-u'], // get print results in real-time
            args: [JSON.stringify({ account: config.TTS_Account, password: config.TTS_Password, user: user, datetime: datetime })],
        };

        let shell = new PythonShell('getInventoryFromTTS.py', options);
        shell.on('message', function (message) {
            if (message == 'ok') {
                res.setHeader("Content-Type", "application/json");
                return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
            }
            else {
                logHelper.writeLogMessage("fabric_receive.getInventoryDataTTS", message);
                res.setHeader("Content-Type", "application/json");
                return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
            }
        });

        // query = `CALL USP_Cutting_Fabric_Receive_Update_Inventory_Data ()`;
        // db.excuteSPAsync(query);
    } catch (error) {
        logHelper.writeLog("fabric_receive.getInventoryDataTTS", error);
        return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
    }
}

module.exports.getInventoryDataDetail = async function (req, res) {
    try {
        // parameters
        let id = req.params.id;

        // get request info
        let requestInfo = await cuttingService.getInventoryDataDetail({ id: id });
        if (!requestInfo)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy thông tin phiếu yêu cầu" }));

        return res.end(JSON.stringify({ rs: true, msg: "", data: requestInfo }));
    }
    catch (error) {
        logHelper.writeLog("fabricreceive.getInventoryDataDetail", error);
    }
}

module.exports.updateInventoryDataDetail = async function (req, res, next) {
    try {
        var objReq = await cuttingService.getInventoryDataDetail(req.body);
        if (!objReq)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

        var isSuccess = await cuttingService.updateInventoryDataDetail(req.body);
        if (isSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
        return res.end(JSON.stringify({ rs: true, msg: "Cập nhật thành công" }));
    }
    catch (error) {
        logHelper.writeLog("fabricreceive.updateRequest", error);
    }
}

module.exports.downloadInventoryData = function (req, res) {
    try {
        //parameters
        let unipack = req.body.unipack;
        let itemColor = req.body.itemColor;
        let itemStatus = req.body.status;
        let itemNote = req.body.note;
        let plant = req.body.plant;

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Inventory_Data (1, 50000, '${unipack}', '${itemColor}', '${itemStatus}', '${itemNote}', '${plant}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonModel = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Inventory Data'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Id', key: 'id', width: 10 },
                    { header: 'Unipack', key: 'unipack2', width: 30 },
                    { header: 'ItemColor', key: 'item_color', width: 30 },
                    { header: 'Yard', key: 'yard', width: 30 },
                    { header: 'Bin', key: 'rlocbr', width: 30 },
                    { header: 'Status', key: 'status', width: 30 },
                    { header: 'Note', key: 'note', width: 30 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonModel);

                // Write to File
                let filename = "templates/inventory_data.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });
    } catch (error) {
        logHelper.writeLog("fabricreceive.downloadInventoryData", error);
        return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
    }
}

// return data
module.exports.getIndexReturnData = function (req, res) {
    let user = req.user;
    res.render('Cutting/FabricReceive/FabricReturnData', { user: user });
}

module.exports.getReturnData = async function (req, res) {
    try {
        // parameters
        let filterStatus = req.body.filterStatus;
        let filterDate = req.body.filterDate;
        let fromDate = filterDate.split(';')[0];
        let toDate = filterDate.split(';')[1];

        // execute
        db.excuteSP(`CALL USP_Cutting_Fabric_Receive_Get_Return_Data ('${filterStatus}', '${fromDate}', '${toDate}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let resultData = result.data;
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: resultData }));
            }
        });
    } catch (error) {
        logHelper.writeLog("fabric_receive.getReturnData", error);
    }
}

module.exports.getIndexReturnDataDetail = function (req, res) {
    let user = req.user;
    res.render('Cutting/FabricReceive/FabricReturnDataDetail', { user: user });
}

module.exports.getReturnDataDetail = async function (req, res) {
    try {
        // parameters
        let id = req.body.id;

        // execute
        // master data info
        let masterInfo = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_return_fabric_roll WHERE id = ${id}`);

        // item-color detail info
        let detailInfo = await db.excuteQueryAsync(`SELECT * FROM cutting_fr_return_fabric_roll_detail WHERE master_id = ${id}`);
        // fabric roll info follow item-color

        return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: { master: masterInfo[0], detail: detailInfo } }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.getReturnDataDetail", error);
    }
}

module.exports.whConfirmReturn = async function (req, res) {
    try {
        // parameters
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();
        let selectedRollList = req.body.selectedRollList;

        // update note marker plan 
        let query = `UPDATE cutting_fr_return_fabric_roll 
                    SET wh_confirm_date = '${datetime}', wh_confirm_by = '${user}'
                    WHERE id = ${selectedRollList[0].master_id}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật phiếu return không thành công." }));

        let updateRollFailList = [];
        // update inventory and insert selected roll to database
        for (let j = 0; j < selectedRollList.length; j++) {
            let eleRoll = selectedRollList[j];

            if (eleRoll.scanned_time != '') {
                // update scanned time to cutting_fr_marker_data_plan_detail_roll table
                query = `UPDATE cutting_fr_return_fabric_roll_detail
                SET scanned_time = '${eleRoll.scanned_time}', location = '${eleRoll.location}'
                WHERE id = ${eleRoll.id}`;

                let isUpdateRollSuccess = await db.excuteNonQueryAsync(query);
                if (isUpdateRollSuccess < 0) {
                    updateRollFailList.push(eleRoll);
                }
            }
        }

        if (updateRollFailList.length > 0) {
            return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
        }
        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.whConfirmReturn", error);
    }
}

module.exports.cancelReturnData = async function (req, res) {
    try {
        // parameters
        let id = req.body.id;
        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        // update note marker plan 
        let query = `UPDATE cutting_fr_return_fabric_roll 
                    SET status = 1, cancel_date = '${datetime}', cancel_by = '${user}'
                    WHERE id = ${id}`;
        let isUpdateSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật phiếu return không thành công." }));

        // update inventory and insert selected roll to database
        query = `UPDATE cutting_fr_return_fabric_roll_detail
                SET status = 1
                WHERE master_id = ${id}`;

        let isUpdateRollSuccess = await db.excuteNonQueryAsync(query);
        if (isUpdateRollSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật chi tiết phiếu return không thành công." }));

        return res.end(JSON.stringify({ rs: true, msg: "Cập nhật phiếu return thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.whConfirmReturn", error);
        return res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

module.exports.saveUploadReturnData = async function (req, res) {
    try {
        // parameters
        let data = req.body.listData;

        let user = req.user.username;
        let datetime = helper.getDateTimeNowMMDDYYHHMMSS();

        for (let i = 0; i < data.length; i++) {
            let eleFile = data[i];
            // get data from excel file
            let arrExcelData = [];
            if (eleFile.file.includes("xlsb")) {
                arrExcelData = helper.getDataFromExcel_Xlsx("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }
            else {
                arrExcelData = await helper.getDataFromExcel("templates/cutting/" + eleFile.file, eleFile.sheet, eleFile.header);
            }

            // clean data
            let masterData = [];
            for (let i = 0; i < arrExcelData.length; i++) {
                let rowData = arrExcelData[i];
                masterData.push(rowData);
            }

            // insert to master table: only have group => take group, receive data, time, cut date, marker name, dozen value of first row
            let fr = masterData[0];
            let query = `INSERT INTO cutting_fr_return_fabric_roll (
                    filename, 
                    user_update, 
                    date_update
                )
                VALUES (
                    '${fr[8]}', 
                    '${user}',
                    '${datetime}'
                )`;

            let isInsertMasterSuccess = await db.excuteQueryAsync(query);
            if (isInsertMasterSuccess.affectedRows < 0) {
                return res.end(JSON.stringify({ rs: false, msg: "Không thành công" }));
            }
            let idMaster = isInsertMasterSuccess.insertId;

            let detailData = [];
            for (let i = 0; i < masterData.length; i++) {
                let rowData = masterData[i];
                if (rowData[2].length <= 0) {
                    continue;
                }
                let detailObj = [];

                detailObj.push(idMaster);
                detailObj.push(rowData[0]);
                detailObj.push(rowData[1]);
                detailObj.push(rowData[2]);
                detailObj.push(rowData[3]);
                detailObj.push(rowData[4]);
                detailObj.push(rowData[5]);
                detailObj.push(rowData[6]);
                detailObj.push(rowData[7]);

                detailData.push(detailObj);
            }
            query = `INSERT INTO cutting_fr_return_fabric_roll_detail (
                    master_id, 
                    _group, 
                    item_color, 
                    unipack_receive, 
                    unipack_return, 
                    return_qty_lbs, 
                    return_qty_yard, 
                    wo,
                    note
                ) 
                VALUES ?`;
            let isInsertDetailSuccess = await db.excuteInsertWithParametersAsync(query, detailData);
        }

        return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.saveUploadData", error);
    }
}

module.exports.downloadReturnRollData = async function (req, res) {
    try {
        // parameters
        let filterStatus = req.body.filterStatus;
        let filterDate = req.body.filterDate;
        let fromDate = filterDate.split(';')[0];
        let toDate = filterDate.split(';')[1];

        // execute
        let result = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Return_Data ('${filterStatus}', '${fromDate}', '${toDate}')`);

        // get all return roll from returnIdList
        let returnIdList = [];
        returnIdList = result[0] ? result[0].map(x => x.id) : [];
        let query = `SELECT * FROM cutting_fr_return_fabric_roll_detail WHERE master_id IN (${returnIdList})`;
        let returnRollList = await db.excuteQueryAsync(query);

        if (returnRollList.length <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "" }));

        let finalResponse = [];
        for (let i = 0; i < returnRollList.length; i++) {
            let ele = returnRollList[i];

            let rrObj = new ReturnRollData(
                result[0].filter(x => x.id == ele.master_id)[0].filename,
                ele._group,
                ele.item_color,
                ele.unipack_receive,
                ele.unipack_return,
                ele.return_qty_lbs,
                ele.return_qty_yard,
                ele.location
            );

            finalResponse.push(rrObj);
        }

        let jsonModel = JSON.parse(JSON.stringify(finalResponse));

        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet('Roll Data'); //creating worksheet

        //  WorkSheet Header
        worksheet.columns = [
            { header: 'ticket', key: 'ticket', width: 10 },
            { header: 'group', key: 'group', width: 10 },
            { header: 'item_color', key: 'item_color', width: 20 },
            { header: 'unipack_receive', key: 'unipack_receive', width: 20 },
            { header: 'unipack_return', key: 'unipack_return', width: 20 },
            { header: 'return_qty_lbs', key: 'return_qty_lbs', width: 20 },
            { header: 'return_qty_yard', key: 'return_qty_yard', width: 20 },
            { header: 'location', key: 'location', width: 20 }
        ];

        // Add Array Rows
        worksheet.addRows(jsonModel);

        // Write to File
        let filename = "templates/return_roll_data.xlsx";
        workbook.xlsx.writeFile(filename).then(function () {
            res.download(filename);
        });
    } catch (error) {
        logHelper.writeLog("fabricreceive.downloadReturnRollData", error);
    }
}

// cutting scan
module.exports.getIndexScanMarkerDataDetail = async function (req, res) {
    res.render('Cutting/FabricReceive/ScanFabric');
}

// report dashboard
module.exports.getReportDashboard = function (req, res) {
    let user = req.user;
    res.render('Cutting/FabricReceive/Dashboard', { user: user });
}

module.exports.getReportData = async function (req, res) {
    try {
        // parameters
        let filterGroup = req.body.filterGroup;
        let filterWeek = req.body.filterWeek ? req.body.filterWeek : 0;
        let filterDate = req.body.filterDate;
        let fromDate = filterDate.split(';')[0];
        let toDate = filterDate.split(';')[1];

        // execute
        // Lấy ra những nhóm thỏa mãn điều kiện lọc
        let returnData = [];
        let result = await db.excuteSPAsync(`CALL USP_Cutting_Fabric_Receive_Get_Report_Data ('${filterGroup}', '${fromDate}', '${toDate}', ${filterWeek})`);
        let markerList = result[0];
        if (markerList.length > 0) {
            let listMarkerId = markerList.map(x => x.id);
            // Lấy tất cả marker yêu cầu thêm
            let query = `SELECT * FROM cutting_fr_marker_data_plan WHERE parentTicketId IN (${listMarkerId})`;
            let additionalMarkerList = await db.excuteQueryAsync(query);
            let additionalMarkerId = additionalMarkerList.map(x => x.id);

            // Lấy tất cả marker detail
            listMarkerId = listMarkerId.concat(additionalMarkerId);
            query = `SELECT * FROM cutting_fr_marker_data_plan_detail WHERE group_id IN (${listMarkerId})`;
            let markerDetailList = await db.excuteQueryAsync(query);

            // Lấy tất cả cuộn vải được chọn
            query = `SELECT * FROM cutting_fr_marker_data_plan_detail_roll WHERE marker_plan_id IN (${listMarkerId})`;
            let rollList = await db.excuteQueryAsync(query);

            // Lấy tất cả cuộn vải return
            let unipackList = rollList.map(x => x.unipack2);
            query = `SELECT * FROM cutting_fr_return_fabric_roll_detail WHERE status != 1 AND unipack_receive IN (${unipackList})`;
            let returnRollList = await db.excuteQueryAsync(query);

            // Xử lý lấy ra những thông tin cần thiết ra model
            for (let i = 0; i < markerList.length; i++) {
                let marker = markerList[i]; // master data

                // additional request
                let additionalMarker = additionalMarkerList != undefined ? additionalMarkerList.filter(x => x.parentTicketId == marker.id) : [];
                let additionalMarkerDetail = [];
                let additionalRoll = [];
                if (additionalMarker.length > 0) {
                    additionalMarker.map(k => k.id).forEach(function (id) {
                        let tmpArr = markerDetailList.filter(x => x.group_id == id);
                        additionalMarkerDetail = additionalMarkerDetail.concat(tmpArr);
                    })

                    additionalMarker.map(k => k.id).forEach(function (id) {
                        let tmpArr = rollList.filter(x => x.marker_plan_id == id);
                        additionalRoll = additionalRoll.concat(tmpArr);
                    })
                }

                // main request
                let markerDetail = markerDetailList.filter(x => x.group_id == marker.id);
                markerDetail = helper.sortArrayByKey(markerDetail, "item_color");
                let colorFlag = ""; // mark item_color is same then sum same item_color
                for (let j = 0; j < markerDetail.length; j++) {
                    let eleMarkerDetail = markerDetail[j];
                    if (colorFlag != eleMarkerDetail.item_color) {
                        let markerSameItemColor = markerDetail.filter(x => x.item_color == eleMarkerDetail.item_color);
                        let totalYard = markerSameItemColor.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0);

                        // additional
                        let markerDetailAddMore = additionalMarkerDetail.filter(x => x.item_color == eleMarkerDetail.item_color);
                        let rollAddMore = additionalRoll.filter(x => x.item_color == eleMarkerDetail.item_color);

                        // master
                        let selectedRoll = rollList.filter(x => x.marker_plan_id == marker.id && x.item_color == eleMarkerDetail.item_color);

                        // return
                        let sumSelectedRoll = rollAddMore.concat(selectedRoll);
                        let returnRoll = [];
                        if (sumSelectedRoll.length > 0) {
                            sumSelectedRoll.map(x => x.unipack2).forEach(function (unipack) {
                                let tmpArr = returnRollList.filter(x => x.unipack_receive == unipack && x.item_color == eleMarkerDetail.item_color);
                                returnRoll = returnRoll.concat(tmpArr);
                            })
                        }

                        // final result
                        let warehouseSupply = selectedRoll.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);
                        let requestMoreSupply = rollAddMore.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);
                        let returnQty = returnRoll.reduce((a, b) => parseFloat(a) + parseFloat(b.return_qty_yard), 0);
                        let difference = (parseFloat(eleMarkerDetail.yard_demand) + returnQty) - (warehouseSupply + requestMoreSupply);
                        let rmObj = new ReportMarker(
                            marker.id,
                            marker._group,
                            eleMarkerDetail.item_color,
                            totalYard,
                            warehouseSupply,
                            markerDetailAddMore.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0),
                            requestMoreSupply,
                            warehouseSupply + requestMoreSupply,
                            returnQty,
                            difference
                        );
                        returnData.push(rmObj);
                    }
                    colorFlag = eleMarkerDetail.item_color;
                }
            }
        }
        res.end(JSON.stringify({ rs: true, msg: "Thành công", data: { master: markerList, detail: returnData } }));
    } catch (error) {
        logHelper.writeLog("fabric_receive.getMarkerData", error);
        res.end(JSON.stringify({ rs: false, msg: error.message }));
    }
}

class MarkerPlanDetailRoll {
    constructor(group, wo, ass, received_date, cut_date, item_color, demand_yard, unipack, roll_yard, bin, note, status) {
        this.group = group;
        this.wo = wo;
        this.ass = ass;
        this.receive_date = received_date;
        this.cut_date = cut_date;
        this.item_color = item_color;
        this.demand_yard = demand_yard;
        this.unipack = unipack;
        this.roll_yard = roll_yard;
        this.bin = bin;
        this.note = note;
        this.status = status;
    }
}

class ReportMarker {
    constructor(marker_plan_id, group, item_color, marker_request, warehouse_supply, request_more, request_more_supply, total_warehouse_supply, return_qty, diference) {
        this.marker_plan_id = marker_plan_id;
        this.group = group;
        this.item_color = item_color;
        this.marker_request = marker_request;
        this.warehouse_supply = warehouse_supply;
        this.request_more = request_more;
        this.request_more_supply = request_more_supply;
        this.total_warehouse_supply = total_warehouse_supply;
        this.return_qty = return_qty;
        this.diference = diference;
    }
}

class ReturnRollData {
    constructor(ticket, group, item_color, unipack_receive, unipack_return, return_qty_lbs, return_qty_yard, location) {
        this.ticket = ticket;
        this.group = group;
        this.item_color = item_color;
        this.unipack_receive = unipack_receive;
        this.unipack_return = unipack_return;
        this.return_qty_lbs = return_qty_lbs;
        this.return_qty_yard = return_qty_yard;
        this.location = location;
    }
}