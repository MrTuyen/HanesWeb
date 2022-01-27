var Database = require("../../database/db_erpsystem.js")
const db = new Database();
const logHelper = require('../../common/log.js');
const constant = require('../../common/constant');
const productionService = require("../../services/Production/production.service");

module.exports.getSection = async function (req, res) {
    try {
        //parameters

        // execute
        let result = await productionService.getSection();
        if (!result)
            return res.end(JSON.stringify({ rs: false, msg: "Lỗi lấy section" }));
        return res.end(JSON.stringify({ rs: true, msg: "", data: result}));
    }
    catch (error) {
        logHelper.writeLog("mixSolve.getSection", error);
    }
}

module.exports.getLineBySection = async function (req, res) {
    try {
        //parameters
        let section = req.body.section;
        // execute
        let result = await productionService.getLineBySection({section: section});
        if (!result)
            return res.end(JSON.stringify({ rs: false, msg: "Lỗi lấy line theo seciton" }));
        return res.end(JSON.stringify({ rs: true, msg: "", data: result}));
    }
    catch (error) {
        logHelper.writeLog("mixSolve.getLineBySection", error);
    }
}