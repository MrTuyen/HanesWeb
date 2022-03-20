var database = require('../../../database/db_sewingRealtime');
var db = new database();
const logHelper = require('../../../common/log.js');

module.exports.getDashboard = function (req, res, next) {
    try {
        res.render('Innovation/sewingRealtime/dashboard');
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.getDashboard", error);
    }
};

module.exports.portLocations = async function (req, res, ) {
    try {
        var options = req.body.options;
        if (options == 1) {
            let result = await db.QueryAsync('SELECT Zone FROM Zone GROUP BY zone ORDER BY zone;');
            return res.end(JSON.stringify({
                rs: true,
                msg: "Thành công",
                data1: result
            }));
        } else if (options == 2) {
            let result = await db.QueryAsync(`CALL dashboard_location('${req.body.lc}')`);
            return res.end(JSON.stringify({
                rs: true,
                msg: "Thành công",
                data1: result
            }))
        }
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.portLocations", error);
    }
};

module.exports.postDataSubmit = async function (req, res, ) {
    try {
        var zone = req.body.zone;
        var line = req.body.line;
        var shift = req.body.shift;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;

        let dataSQL = await db.QueryAsync(`CALL dashboard_data('${zone}','${line}','${shift}','${from_date}','${to_date}');`);
        let dataRatioSQL = await db.QueryAsync(`CALL dashboard_data_ratio('${zone}','${line}','${shift}','${from_date}','${to_date}');`);
        var repairingTime = [];
        var lossTime = [];
        var lableRunTime = [];
        var powerOnTime = [];
        var runTime = [];
        var lableRunTimeRatio = [];
        var ratioLossTime = [];
        var ratioPowerOnTime = [];
        var ratioRunTime = [];
        var ratioNoLoad = [];
        if(dataSQL != ''){
            for (const x of dataSQL[0]) {
                lableRunTime.push(x['date_s']);
                powerOnTime.push(x['power_on_time_s']);
                runTime.push(x['run_time_s']);
                lossTime.push(x['loss_time_s']);
                repairingTime.push(x['repairing_time_s']);
            }
        }
        if(dataRatioSQL != ''){
            for (const data of dataRatioSQL[0]) {
                lableRunTimeRatio.push(data['date_s']);
                ratioLossTime.push(data['ratio_loss_time']);
                ratioPowerOnTime.push(data['ratio_power_on_time']);
                ratioRunTime.push(data['ratio_run_time']);
                ratioNoLoad.push(data['ratio_no_load']);
            }
        }
        return res.end(JSON.stringify({
            rs: true,
            msg: "Thành công",
            data: {
                'lossTime': lossTime,
                'lableRunTime': lableRunTime,
                'powerOnTime': powerOnTime,
                'runTime': runTime
            },
            dataRatio: {
                'lableRunTimeRatio': lableRunTimeRatio,
                'ratioLossTime': ratioLossTime,
                'ratioNoLoad': ratioNoLoad,
                'ratioRunTime': ratioRunTime
            }
        }));
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.postDataSubmit", error);
    };
};

module.exports.portDownloadReport = async function (req, res, next) {
    try {
        var zone = req.body.zone;
        var line = req.body.line;
        var shift = req.body.shift;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        let dataLossTime = await db.QueryAsync(`CALL report_losstime('${zone}','${line}','${shift}','${from_date}','${to_date}');`);
        let dataRunTime = await db.QueryAsync(`CALL report_runtime('${zone}','${line}','${shift}','${from_date}','${to_date}');`);
        return res.end(JSON.stringify({
            rs: true,
            msg: "Thành công",
            data: {
                "dataLossTime": dataLossTime ? dataLossTime[0]:0,
                "dataRunTime": dataRunTime ? dataRunTime[0]:0
            }
        }));
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.portDownloadReport", error);
    };
};

module.exports.getdetailDashboard = function (req, res, next) {
    try {
        res.render('Innovation/sewingRealtime/detailDashboard');
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.getdetailDashboard", error);
    }
};

module.exports.postDetailDataSubmit = async function (req, res, next) {
    try {
        var zone = req.body.zone;
        var line = req.body.line;
        var shift = req.body.shift;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;

        let lineName = await db.QueryAsync(`SELECT line_name FROM zone WHERE CONCAT(zone,line)='${zone}${line}' LIMIT 1`);
        let dataRatioSQL = await db.QueryAsync(`CALL dashboard_detail_data_ratio('${zone}','${line}','${shift}','${from_date}','${to_date}');`);
        let dataSQL = await db.QueryAsync(`CALL dashboard_detail_data('${zone}','${line}','${shift}','${from_date}','${to_date}');`);
        var lableRunTime = [];
        var repairingTime = [];
        var waitingTime = [];
        var powerOnTime = [];
        var runTime = [];

        var lableRunTimeRatio = [];
        var ratioWaitingTime = [];
        var ratioRepairingTime = [];
        var ratioRunTime = [];
        var ratioNoLoad = [];
        var lableColors = [];
        if(dataSQL != ''){
            for (const x of dataSQL[0]) {
                if ((x['power_on_time_m'] == '0' || x['power_on_time_m'] == null) && (x['run_time_m'] == '0' || x['run_time_m'] == null)) {
                    lableColors.push('red')
                } else {
                    lableColors.push('black')
                };
                lableRunTime.push(x['operation']);
                powerOnTime.push(x['power_on_time_m']);
                runTime.push(x['run_time_m']);
                repairingTime.push(x['repairing_time_m']);
                waitingTime.push(x['waiting_time_m']);
            };
        };
        if(dataRatioSQL != ''){
            for (const data of dataRatioSQL[0]) {
                lableRunTimeRatio.push(data['operation']);
                ratioWaitingTime.push(data['ratio_waiting_time']);
                ratioRepairingTime.push(data['ratio_repairing_time']);
                ratioRunTime.push(data['ratio_run_time']);
                ratioNoLoad.push(data['ratio_no_load']);
            };
        };
        return res.end(JSON.stringify({
            rs: true,
            msg: "Thành công",
            data: {
                'waitingTime': waitingTime,
                'repairingTime': repairingTime,
                'lableRunTime': lableRunTime,
                'powerOnTime': powerOnTime,
                'runTime': runTime,
                'lineName': lineName,
                'lableColors': lableColors
            },
            dataRatio: {
                'lableRunTimeRatio': lableRunTimeRatio,
                'ratioWaitingTime': ratioWaitingTime,
                'ratioRepairingTime': ratioRepairingTime,
                'ratioRunTime': ratioRunTime,
                'ratioNoLoad': ratioNoLoad
            }
        }));
    } catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.postDetailDataSubmit", error);
    }
};
