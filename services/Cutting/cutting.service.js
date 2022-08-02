const Database = require("../../database/db_cutting.js")
var db = new Database();
const logHelper = require("../../common/log.js");
const helper = require('../../common/helper.js');

var CuttingService = {};

// 
CuttingService.getMachines = async function (objDTO) {
    try {
        let query = `SELECT * FROM cutting_machine WHERE active = 1 ORDER BY position`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("CuttingService.getRequestDetail", error);
    }
}

// Add scanned roll fabric 
CuttingService.addScannedRecord = async function(objDTO){
    try {
        let query = `INSERT INTO cutting_scanned_fabric_receive (wo, roll_code, scanned_time, user, update_time) 
        VALUES ?`;

        return await db.excuteInsertWithParametersAsync(query, objDTO);
    } catch (error) {
        logHelper.writeLog("CuttingService.addScannedRecord", error);
    }
}

// Add fabric receive plan 
CuttingService.addFabricReceivePlan = async function(objDTO){
    try {
        let query = `INSERT INTO cutting_fr_marker_data_plan (_no, receive_date, receive_time, _group, cut_date, note, user_update, date_update) 
        VALUES ?`;

        return await db.excuteInsertWithParametersAsync(query, objDTO);
    } catch (error) {
        logHelper.writeLog("CuttingService.addFabricReceivePlan", error);
    }
}

// Add warehouse fabric inventory data
CuttingService.addFabricInventoryData = async function(objDTO){
    try {
        let query = `INSERT INTO cutting_fr_wh_fabric_inventory (
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
            user_update,
            date_update
        ) 
        VALUES ?`;

        return await db.excuteInsertWithParametersAsync(query, objDTO);
    } catch (error) {
        logHelper.writeLog("CuttingService.addFabricInventoryData", error);
    }
}

CuttingService.getInventoryDataDetail = async function (objDTO) {
    try {
        let query = `SELECT * FROM cutting_fr_wh_fabric_inventory 
                WHERE id = ${objDTO.id}`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("CuttingService.getInventoryDataDetail", error);
    }
}

CuttingService.updateInventoryDataDetail = async function(objDTO){
    try {
        let query = `UPDATE cutting_fr_wh_fabric_inventory 
                    SET yard = '${objDTO.yard}'
                    WHERE id = ${objDTO.id}`;

        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updateInventoryDataDetail", error);
    }
}

module.exports = CuttingService;