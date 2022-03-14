var database = require('../../../database/db_sewingRealtime');
var db = new database();

module.exports.getHomePage = async function (req, res, next) {
    try {
        var listZone = ["A", "B", "C", "D", "E", "F", "G", "H"];
        var listLine = [1, 2, 3, 4, 5, 6];
        let location = await db.QueryAsync(`SELECT CONCAT(zone,line) AS line_location,line_name FROM zone ORDER BY line_no;`);
        let online = await db.QueryAsync(`call usp_zone_online();`);
        let wait = await db.QueryAsync(`call usp_zone_wait();`);
        let repair = await db.QueryAsync(`call usp_zone_repair();`);
        var workcenterData = {
            listZone: listZone,
            listLine: listLine,
            listLineName: location ? location: '',
            online: online ? online[0]: '',
            wait: wait ? wait[0]: '',
            repair: repair ? repair[0]: ''
        };
        res.render('Innovation/sewingRealtime/workcenter', workcenterData);
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.getHomePage", error);
    }
};

module.exports.adjustingZone = async function (req, res, next) {
    try {
        var location = req.body.location;
        var style = req.body.style;
        var deleteId = req.body.deleteId;
        let color;
        if (location == "") {
            return res.end(JSON.stringify({
                msg: "Không được bỏ trống mã truyền may",
                status: 0
            }));
        } else {
            var no = await db.QueryAsync(`call usp_update_zone('${location}','${style}','${deleteId}')`);
            if (no[0].length > 0) {
                let data = {
                    msg: "Thay đổi thành công",
                    status: 1,
                    line_no: no[0][0].line_no,
                    line_name: no[0][0].line_name,
                    color: color,
                };
                return res.end(JSON.stringify(data));
            } else {
                return res.end(JSON.stringify({
                    msg: "Không tìm thấy truyền may",
                    status: 2
                }));
            }
        }
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.adjustingZone", error);
    }
};