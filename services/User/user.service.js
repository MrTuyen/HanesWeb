const Database = require("../../common/db.js")
var db = new Database();
const logHelper = require("../../common/log.js");
const helper = require('../../common/helper.js');

var InnovationService = {};

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

InnovationService.managerUpdateRequest = async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET manager_status = 1, manager_date = '${datetime}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.managerUpdateRequest", error);
    }
}

InnovationService.clerkUpdateRequest = async function (objDTO) {
    try {
        let datetime = helper.getDateTimeNow();
        let query = `UPDATE mec_sparepart_request 
                    SET export_qty = ${objDTO.export_qty}, clerk_status = 1, clerk_date = '${datetime}'
                    WHERE id = ${objDTO.id}`;
        return await db.excuteNonQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.clerkUpdateRequest", error);
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
        let query = `INSERT INTO mec_import_request_detail (part_code, part_name, unit, location, qty_po, qty_real, import_request_id) 
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
        let query = `CALL USP_Part_Insert_Or_Update ('${objDTO.code}', '${objDTO.name}', '${objDTO.unit}', '${objDTO.location}', ${objDTO.qty})`;
        return await db.excuteSPAsync(query);
    } catch (error) {
        logHelper.writeLog("InnovationService.checkInsertOrUpdatePart", error);
    }
}

module.exports = InnovationService;