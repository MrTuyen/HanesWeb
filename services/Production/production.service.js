const Database = require("../../database/db_erpsystem.js")
var db = new Database();
const logHelper = require("../../common/log.js");
const helper = require('../../common/helper.js');

var ProductionService = {};

ProductionService.getZone = async function () {
    try {
        let query = `SELECT * FROM setup_zone`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("ProductionService.getZone", error);
    }
}

ProductionService.getLineByZone = async function (objDTO) {
    try {
        let query = `SELECT *
                    FROM setup_line
                    WHERE zone_id = '${objDTO.zone}'
                    ORDER BY name`;
        return await db.excuteQueryAsync(query);
    } catch (error) {
        logHelper.writeLog("ProductionService.getLineByZone", error);
    }
}

module.exports = ProductionService;