var Database = require("../../database/db_linebalancing.js")
const db_linebalancing = new Database();
const logHelper = require('../../common/log.js');
const constant = require('../../common/constant');

function getCurrentTimeTypeDatetime(){
    tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    timeUpdate = localISOTime.replace(/T/, ' ').replace(/\..+/, '');
    return timeUpdate;
}

module.exports.ieConfirmOfStandard = function (req, res) {
    try {
        if(req.user.dept != constant.Department.IE)
            return res.end(JSON.stringify({ rs: false, msg: "User của bạn không phải IE." }));
        //parameters
        let id = req.body.id;
        let user = req.user.username;
        
        // execute
        let query = `UPDATE operation_offstandard_tracking
                    SET IEApprovedUser = '${user}', IEApprovedDate = '${getCurrentTimeTypeDatetime()}'
                    WHERE id = ${id}`;

        db_linebalancing.excuteQuery(query, function (result) {
            if (!result.rs) {
                return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("production.ieConfirmOfStandard", error);
    }
}