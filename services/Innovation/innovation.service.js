const Database = require("../../database/db.js")
var db = new Database();
const logHelper = require("../../common/log.js");
const helper = require('../../common/helper.js');
const constant = require('../../common/constant.js');

var InnovationService = {};

// Sewing machine
InnovationService.addSewingMachine = async function(objDTO){
    try {
        let query = `INSERT INTO mec_sewing_machine 
        (   
            serial_no, 
            tag, 
            asset_desc, 
            zone, 
            pre_zone, 
            line, 
            pre_line, 
            position, 
            pre_position,
            status, 
            mec_location, 
            machine_model, 
            description, 
            auto_machine,
            last_update, 
            user_update
        ) 
        VALUES 
        (
            '${objDTO.serialNo}', 
            '${objDTO.tag}', 
            '${objDTO.assetDesc ? objDTO.assetDesc : ''}', 
            '${objDTO.zone}', 
            '${objDTO.preZone}', 
            '${objDTO.line}', 
            '${objDTO.preLine}', 
            ${objDTO.position ? objDTO.position : 0}, 
            ${objDTO.prePosition ? objDTO.prePosition : 0}, 
            '${objDTO.status}', 
            '${objDTO.mecLocation ? objDTO.mecLocation : ''}', 
            '${objDTO.machineModel}', 
            '${objDTO.description ? objDTO.description : ''}', 
            '${objDTO.autoMachine}',
            '${objDTO.lastUpdate}', 
            '${objDTO.userUpdate}'
        )`;

        return await db.excuteInsertReturnIdAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.addSewingMachine", error);
    }
}

InnovationService.updateSewingMachine = async function(objDTO){
    try {
        let query = `UPDATE mec_sewing_machine 
                    SET serial_no = '${objDTO.serialNo}', 
                    tag = '${objDTO.tag}', 
                    asset_desc = '${objDTO.assetDesc}', 
                    zone = '${objDTO.zone}',
                    pre_zone = '${objDTO.preZone}',
                    line = '${objDTO.line}',
                    pre_line = '${objDTO.preLine}',
                    position = ${objDTO.position ? objDTO.position : 0},
                    pre_position = ${objDTO.prePosition ? objDTO.prePosition : 0},
                    status = '${objDTO.status}',
                    mec_location = '${objDTO.mecLocation ? objDTO.mecLocation : ''}',
                    machine_model = '${objDTO.machineModel}',
                    description = '${objDTO.description ? objDTO.description : ''}',
                    last_update = '${objDTO.lastUpdate}',
                    user_update =  '${objDTO.userUpdate}',
                    auto_machine = '${objDTO.autoMachine}'
                    WHERE id = ${objDTO.id}`;

        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updateSewingMachine", error);
    }
}

InnovationService.updatePositionSewingMachine = async function(objDTO){
    try {
        let query = `UPDATE mec_sewing_machine 
                    SET line = '${objDTO.line}',
                    pre_line = '${objDTO.preLine}',
                    position = ${objDTO.position ? objDTO.position : 0},
                    pre_position = ${objDTO.prePosition ? objDTO.prePosition : 0},
                    last_update = '${objDTO.lastUpdate}',
                    user_update =  '${objDTO.userUpdate}'
                    WHERE id = ${objDTO.id}`;

        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updatePositionSewingMachine", error);
    }
}

InnovationService.getSewingMachineDetail = async function (objDTO) {
    try {
        let query = `SELECT * FROM mec_sewing_machine 
                WHERE id = ${objDTO.id}`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.getSewingMachineDetail", error);
    }
}

// Spare part request
InnovationService.getRequestDetail = async function (objDTO) {
    try {
        let query = `SELECT * FROM mec_sparepart_request 
                WHERE id = ${objDTO.id}`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.getRequestDetail", error);
    }
}

InnovationService.updateRequest = async function (objDTO) {
    try {
        let query = `UPDATE mec_sparepart_request 
                    SET name = '${objDTO.name}', code = '${objDTO.code}', location = '${objDTO.location}', qty = ${objDTO.qty}, 
                    tag_machine = '${objDTO.tag}', zone = ${objDTO.zone}, reason = '${objDTO.reason}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updateRequest", error);
    }
}

InnovationService.managerApprove = async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET manager_status = ${constant.Action_Status.Approve}, manager_date = '${datetime}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.managerApprove", error);
    }
}

InnovationService.managerReject = async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET manager_status = ${constant.Action_Status.Reject}, manager_date = '${datetime}', manager_comment = '${objDTO.comment}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.managerReject", error);
    }
}

InnovationService.sManagerApprove = async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET s_manager_status = ${constant.Action_Status.Approve}, s_manager_date = '${datetime}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.sManagerApprove", error);
    }
}

InnovationService.sManagerReject = async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET s_manager_status = ${constant.Action_Status.Reject}, s_manager_date = '${datetime}', s_manager_comment = '${objDTO.comment}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.sManagerReject", error);
    }
}

InnovationService.clerkApprove = async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET clerk_status = ${constant.Action_Status.Approve}, clerk_date = '${datetime}', comment = '${objDTO.comment}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.clerkApprove", error);
    }
}

InnovationService.clerkReject= async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET comment = '${objDTO.comment}', clerk_status = ${constant.Action_Status.Reject}, clerk_date = '${datetime}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.clerkReject", error);
    }
}

InnovationService.addSparepartRequest = async function(objDTO){
    try {
        let query = `INSERT INTO mec_sparepart_request (tag_machine, reason, request_date, requester, zone, manager, manager_email, requester_name, request_type, s_manager, s_manager_email) 
                    VALUES('${objDTO.tag}', '${objDTO.reason}', '${objDTO.datetime}', ${objDTO.idMechanic}, ${objDTO.zone}, '${objDTO.manager}', '${objDTO.managerEmail}', '${objDTO.requesterName}', ${objDTO.requestType}, '${objDTO.sManager}', '${objDTO.sManagerEmail}')`;

        return await db.excuteInsertReturnIdAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.addSparepartRequest", error);
    }
}

InnovationService.updateSparepartRequest = async function(objDTO){
    try {
        let query = `UPDATE mec_import_request 
                    SET import_date = '${objDTO.importDate}', vendor = '${objDTO.vendor}', receiver = '${objDTO.receiver}', deliverer = '${objDTO.deliverer}'
                    WHERE id = ${objDTO.id}`;

        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updateImportRequest", error);
    }
}

InnovationService.addSparepartRequestDetail = async function(objDTO){
    try {
        let query = `INSERT INTO mec_sparepart_request_detail (code, name, qty, location, export_qty, reason, sparepart_request_id) 
        VALUES ?`;

        return await db.excuteInsertWithParametersAsync(query, objDTO);
    } catch (error) {
        logHelper.writeLog("InnovationService.addSparepartRequestDetail", error);
    }
}

InnovationService.getSparepartRequestDetail = async function (objDTO) {
    try {
        let query = `SELECT * FROM mec_sparepart_request 
                WHERE id = ${objDTO.id}`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.getSparepartRequestDetail", error);
    }
}

InnovationService.getSparepartRequestDetailItem = async function (objDTO) {
    try {
        let query = 
        `SELECT mec_sparepart_request_detail.*, mec_part.id AS part_id, mec_part.quantity AS remain_qty
        FROM mec_sparepart_request_detail
        LEFT JOIN mec_part ON mec_sparepart_request_detail.code = mec_part.code
        WHERE sparepart_request_id = ${objDTO.id}`;

        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.getSparepartRequestDetailItem", error);
    }
}

// Part 
InnovationService.getPartDetail = async function (objDTO) {
    try {
        let query =`SELECT * FROM mec_part WHERE code = '${objDTO.code.trim()}'`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.getPartDetail", error);
    }
}

InnovationService.updatePartQuantity = async function (objDTO) {
    try {
        let query = `UPDATE mec_part 
            SET quantity = quantity - ${objDTO.export_qty}
            WHERE code = '${objDTO.code}'`;

        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updatePartQuantity", error);
    }
}

InnovationService.updatePartRequestDetailExportQty = async function (objDTO) {
    try {
        let query = `UPDATE mec_sparepart_request_detail 
            SET export_qty = ${objDTO.export_qty}
            WHERE id = ${objDTO.detail_id}`;

        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updatePartRequestDetailExportQty", error);
    }
}

// Import part from vendor
InnovationService.addImportRequest = async function(objDTO){
    try {
        let query = `INSERT INTO mec_import_request (po, import_date, vendor, receiver, deliverer, request_date, user) 
                    VALUES ('${objDTO.po}', '${objDTO.importDate}', '${objDTO.vendor}', '${objDTO.receiver}', 
                    '${objDTO.deliverer}', '${objDTO.requestDate}', '${objDTO.user}')`;

        return await db.excuteInsertReturnIdAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.addImportRequest", error);
    }
}

InnovationService.updateImportRequest = async function(objDTO){
    try {
        let query = `UPDATE mec_import_request 
                    SET import_date = '${objDTO.importDate}', vendor = '${objDTO.vendor}', receiver = '${objDTO.receiver}', deliverer = '${objDTO.deliverer}'
                    WHERE id = ${objDTO.id}`;

        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.updateImportRequest", error);
    }
}

InnovationService.addImportRequestDetail = async function(objDTO){
    try {
        let query = `INSERT INTO mec_import_request_detail (part_code, vendor_code, model, part_name, unit, location, qty_po, qty_real, import_request_id) 
        VALUES ?`;

        return await db.excuteInsertWithParametersAsync(query, objDTO);
    } catch (error) {
        logHelper.writeLog("InnovationService.addImportRequestDetail", error);
    }
}

InnovationService.getImportDetail = async function (objDTO) {
    try {
        let query = `SELECT * FROM mec_import_request 
                WHERE id = ${objDTO.id}`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.getImportDetail", error);
    }
}

InnovationService.getImportDetailItem = async function (objDTO) {
    try {
        let query = `SELECT * FROM mec_import_request_detail
                WHERE import_request_id = ${objDTO.id}`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.getImportDetailItem", error);
    }
}

InnovationService.deleteImportDetailItem = async function (objDTO) {
    try {
        let query = `DELETE FROM mec_import_request_detail
                WHERE import_request_id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.deleteImportDetailItem", error);
    }
}

InnovationService.checkInsertOrUpdatePart = async function (objDTO) {
    try {
        let query = `CALL USP_Part_Insert_Or_Update ('${objDTO.code}', '${objDTO.name}', '${objDTO.unit}', '${objDTO.location}', ${objDTO.qty}, '${objDTO.vendorCode}', '${objDTO.model}')`;
        return await db.excuteSPAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.checkInsertOrUpdatePart", error);
    }
}

module.exports = InnovationService;