var database = require('../../../database/db_sewingRealtime');
var db = new database();

module.exports.getLosstime = async function (req, res, next) {
    try {
        let result = await db.QueryAsync(`CALL procedure_losstime('All','All','');`);
        res.render('Innovation/sewingRealtime/losstime', today = result);
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.getLosstime", error);
    }
};

module.exports.postLosstime = async function (req, res, next) {
    try {
        var zone = ["A", "B", "C", "D", "E", "F", "G", "H"];
        var x = req.body.zone;
        var y = req.body.line;
        var z = req.body.date;
        if (x.toString() == "All") {
            query = `CALL procedure_losstime('All','${y.toString()}','${z.toString()}');`
        } else {
            query = "CALL procedure_losstime('" + zone[x].toString() + "'," + "'" + y.toString() + "'" + "," + "'" + z.toString() + "');"
        }
        let result = await db.QueryAsync(query);
        res.render('Innovation/sewingRealtime/losstime', today = result[0]);

    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.postLosstime", error);
    }
};