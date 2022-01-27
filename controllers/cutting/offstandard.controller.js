var Database = require("../../database/db_linebalancing.js")
const db_linebalancing = new Database();
const logHelper = require('../../common/log.js');
const helper = require('../../common/helper.js');
const constant = require('../../common/constant');

function getCurrentTimeTypeDatetime(){
    tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    timeUpdate = localISOTime.replace(/T/, ' ').replace(/\..+/, '');
    return timeUpdate;
}

module.exports.getOffStandardPage = function (req, res) {
    if (req.isAuthenticated()) {
        res.render("Cutting/OffStandard");
    }
    else {
        res.render("login");
    }
}

module.exports.getOffStandardTracking = function (req, res) {
    try {
        if (req.isAuthenticated()) {
            date = req.body.date;
            wc = req.body.wc;
            sql = `select * 
                from linebalancing.cutting_operation_offstandard_tracking 
                where (
                    ('${wc}' IS NULL OR '${wc}' = '' )
                    OR WC LIKE CONCAT('%', '${wc}', '%')
                ) and SUBSTRING(DateUpdate, 1, 10)='${date}' ORDER BY ID DESC`;
            db_linebalancing.excuteQuery(sql, function (result) {
                res.send(result.data);
                res.end();
            });
        } else {
            res.render("login", { msg: "" });
        }
    } catch (error) {
        logHelper.writeLog("/Cutting/GetOffStandardTracking", error);
    }
}

module.exports.isExistedOffStandardTracking = function (req, res) {
    try {
        if (req.isAuthenticated()) {
            date = req.body.date;
            empID = req.body.empID;
            sql = "select * from linebalancing.cutting_operation_offstandard_tracking where ID='" + empID + "' and DateUpdate='" + date + "' and FinishTime is null;";
            db_linebalancing.excuteQuery(sql, function (result) {
                res.send(result.data);
                res.end();
            });
        } else {
            res.render("login");
        }
    } catch (error) {
        logHelper.writeLog("/Cutting/IsExistedOffStandardTracking", error);
    }
}

module.exports.insertOffStandardTracking = function (req, res) {
    try {
        if (req.isAuthenticated()) {
            workerID = req.body.workerID;
            name = req.body.name;
            code = req.body.code;
            wc = req.body.wc;
            op1 = req.body.op1;
            op2 = req.body.op2;
            note = req.body.note;
            finishTime = req.body.finishTime;
            currentDate = req.body.currenDate;
    
            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
            var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
            var timeUpdate = localISOTime.replace(/T/, ' ').replace(/\..+/, '');
            userUpdate = req.user.username;
            startTime = timeUpdate;
            dateUpdate = timeUpdate.split(' ')[0];
            hh = parseInt(timeUpdate.split(' ')[1].split(':')[0]);
            mm = parseInt(timeUpdate.split(' ')[1].split(':')[1]);
            // if (hh == 13 && mm > 45 && mm < 59) startTime = dateUpdate + ' 14:00:00';
            startTime = currentDate + ' ' + req.body.startTime;
            finishTime = finishTime == "" ? "" : currentDate + " " + finishTime;
            sql = `Insert into linebalancing.cutting_operation_offstandard_tracking (WorkerID, Name, Code, WC, Operation1, Operation2, StartTime, UserUpdate, DateUpdate, Note) 
                    values('${workerID}', '${name}', '${code}', '${wc}', '${op1}', '${op2}', '${startTime}', '${userUpdate}','${timeUpdate}', '${note}')`;
    
            if (finishTime != "") {
                let spanTime = helper.round((Math.abs(new Date(finishTime) - new Date(startTime)) / 1000) / 3600);
                sql = `Insert into linebalancing.cutting_operation_offstandard_tracking (WorkerID, Name, Code, WC, Operation1, Operation2, StartTime, FinishTime, SpanTime, UserUpdate, DateUpdate, Note) 
                values('${workerID}', '${name}', '${code}', '${wc}', '${op1}', '${op2}', '${startTime}', '${finishTime}', '${spanTime}', '${userUpdate}','${timeUpdate}', '${note}')`;
            }

            db_linebalancing.excuteQuery(sql, function (result) {
                res.send('done');
                res.end();
            });
        } else {
            res.render("login", { msg: "" });
        }
    } catch (error) {
        logHelper.writeLog("/Cutting/InsertOffStandardTracking", error);
    }
}

module.exports.closeOffStandardTracking = function (req, res) {
    try {
        if (req.isAuthenticated()) {
            id = req.body.id;
            finishTime = req.body.finishTime;
            startTime = req.body.startTime;
            tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
            localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
            timeUpdate = localISOTime.replace(/T/, ' ').replace(/\..+/, '');
            
            // sql="update linebalancing.operation_offstandard_tracking set FinishTime='"+finishTime+"', SpanTime=ROUND(TIME_TO_SEC(TIMEDIFF('"+finishTime+"',StartTime))/3600,2) where ID='"+empID+"' and StartTime='"+startTime+"';"
            sql = "update linebalancing.cutting_operation_offstandard_tracking set "
            + " FinishTime= IF(StartTime<=CONCAT(CURDATE(),' 14:00:00'), IF(now()<=CONCAT(CURDATE(),' 13:45:00'), now(), CONCAT(CURDATE(),' 13:45:00')), "
            + " IF(StartTime<=CONCAT(CURDATE(),' 22:00:00') AND StartTime>=CONCAT(CURDATE(),' 14:00:00'), IF(now()<=CONCAT(CURDATE(),' 22:00:00'), now(), CONCAT(CURDATE(),' 22:00:00')), NOW())), "
            + " SpanTime=IF(ROUND(TIME_TO_SEC(TIMEDIFF(IF(StartTime<=CONCAT(CURDATE(),' 14:00:00'), IF(now()<=CONCAT(CURDATE(),' 13:45:00'), now(), CONCAT(CURDATE(),' 13:45:00')), "
            + " IF(StartTime<=CONCAT(CURDATE(),' 22:00:00') AND StartTime>=CONCAT(CURDATE(),' 14:00:00'), IF(now()<=CONCAT(CURDATE(),' 22:00:00'), now(), CONCAT(CURDATE(),' 22:00:00')), NOW())),StartTime))/3600,2)>7.5, 7.5, "
            + " ROUND(TIME_TO_SEC(TIMEDIFF(IF(StartTime<=CONCAT(CURDATE(),' 14:00:00'), IF(now()<=CONCAT(CURDATE(),' 13:45:00'), now(), CONCAT(CURDATE(),' 13:45:00')), "
            + " IF(StartTime<=CONCAT(CURDATE(),' 22:00:00') AND StartTime>=CONCAT(CURDATE(),' 14:00:00'), IF(now()<=CONCAT(CURDATE(),' 22:00:00'), now(), CONCAT(CURDATE(),' 22:00:00')), NOW())),StartTime))/3600,2))  "
            + ", DateUpdate='" + timeUpdate + "'"
            + " where ID=" + id + ";"

            if (finishTime != '') {
                ftTemp = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -1).substring(0, 10) + " " + finishTime;
                stTemp = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -1).substring(0, 10) + " " + startTime;
                let spanTime = helper.round((Math.abs(new Date(ftTemp) - new Date(stTemp)) / 1000) / 3600);
                sql = `update linebalancing.cutting_operation_offstandard_tracking set 
                FinishTime = '${ftTemp}', SpanTime = '${spanTime}', DateUpdate = '${timeUpdate}'
                where ID = ${id};`
            }
            console.log(sql);
            db_linebalancing.excuteQuery(sql, function (result) {
                sql1 = "select * from linebalancing.cutting_operation_offstandard_tracking where ID=" + id;
                db_linebalancing.excuteQuery(sql1, function (result2) {
                    res.send(result2.data);
                    res.end();
                });
            });
        } else {
            res.render("login", { msg: "" });
        }
    } catch (error) {
        logHelper.writeLog("/Cutting/CloseOffStandardTracking", error);
    }
}

module.exports.ieConfirmOfStandard = function (req, res) {
    try {
        if(req.user.dept != constant.Department.IE)
            return res.end(JSON.stringify({ rs: false, msg: "User của bạn không phải IE." }));
        //parameters
        let id = req.body.id;
        let user = req.user.username;
        
        // execute
        let query = `UPDATE cutting_operation_offstandard_tracking
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
        logHelper.writeLog("cutting.ieConfirmOfStandard", error);
    }
}