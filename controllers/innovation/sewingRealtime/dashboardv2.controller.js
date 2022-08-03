var database = require('../../../database/db_sewingRealtime');
var db = new database();
const logHelper = require('../../../common/log.js');

module.exports.getDashboard = function (req, res, next) {
    try {
        res.render('Innovation/sewingRealtime/dashboardv2');
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.getDashboard", error);
    }
};

