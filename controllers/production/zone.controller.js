var Database = require("../../database/db_erpsystem.js")
const db = new Database();
const logHelper = require('../../common/log.js');
const helper = require('../../common/helper.js');
const constant = require('../../common/constant');
const productionService = require("../../services/Production/production.service");

module.exports.getIndex = function (req, res) {
    res.render('Production/Zone');
}

// Zone
module.exports.getAllZone = function (req, res) {
    try {
        //parameters

        // execute
        db.excuteSP(`CALL USP_Zone_Get ()`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("zone.getAllZone", error);
    }
}

module.exports.addZone = function (req, res) {
    try {
        // parameters
        let name = req.body.name;
        let code = req.body.code;
        let type = req.body.type;
        let order = req.body.order;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `INSERT INTO setup_zone (name, code, type, zone_order, last_update, user_update) 
                    VALUES('${name}', '${code}', ${type}, ${order}, '${datetime}', '${user}')`;
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
        logHelper.writeLog("zone.addZone", error);
    }
}

module.exports.updateZone = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let name = req.body.name;
        let code = req.body.code;
        let type = req.body.type;
        let order = req.body.order;
       
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE setup_zone
                    SET name = '${name}', code = '${code}', type = ${type}, zone_order = ${order}, last_update = '${datetime}', user_update = '${user}'
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
        logHelper.writeLog("zone.updateZone", error);
    }
}

module.exports.getZoneDetail = function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        db.excuteSP(`SELECT * FROM setup_zone WHERE id = ${id}`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("zone.getZoneDetail", error);
    }
}

// Line
module.exports.getAllLine = function (req, res) {
    try {
        //parameters
        let zone = req.body.zone;
        // execute  
        db.excuteSP(`CALL USP_Line_Get ('${zone}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("line.getAllLine", error);
    }
}

module.exports.addLine = function (req, res) {
    try {
        // parameters
        let name = req.body.name;
        let zoneName = req.body.zoneName;
        let zoneId = req.body.zoneId;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `INSERT INTO setup_line (zone_id, name, zone, last_update, user_update) 
                    VALUES(${zoneId}, '${name}', '${zoneName}', '${datetime}', '${user}')`;
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
        logHelper.writeLog("line.addLine", error);
    }
}

module.exports.updateLine = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let name = req.body.name;
        let zoneName = req.body.zoneName;
        let zoneId = req.body.zoneId;
       
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE setup_line
                    SET zone_id = ${zoneId}, name = '${name}', zone = '${zoneName}', last_update = '${datetime}', user_update = '${user}'
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
        logHelper.writeLog("line.updateLine", error);
    }
}

module.exports.getLineDetail = function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        db.excuteSP(`SELECT * FROM setup_line WHERE id = ${id}`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("line.getLineeDetail", error);
    }
}

module.exports.getZone = async function (req, res) {
    try {
        // parameters

        // execute
        let result = await productionService.getZone();
        if (!result)
            return res.end(JSON.stringify({ rs: false, msg: "Lỗi lấy zone" }));
        return res.end(JSON.stringify({ rs: true, msg: "", data: result}));
    }
    catch (error) {
        logHelper.writeLog("zone.getZone", error);
    }
}

module.exports.getLineByZone = async function (req, res) {
    try {
        // parameters
        let zone = req.body.zone;
        // execute
        let result = await productionService.getLineByZone({zone: zone});
        if (!result)
            return res.end(JSON.stringify({ rs: false, msg: "Lỗi lấy line theo zone" }));
        return res.end(JSON.stringify({ rs: true, msg: "", data: result}));
    }
    catch (error) {
        logHelper.writeLog("zone.getLineByZone", error);
    }
}