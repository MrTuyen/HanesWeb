var database = require('../../../database/db_sewingRealtime');
var db = new database();

module.exports.getMachine = async function(req, res,next) {
    try{
        var lineName = req.query.line;
        let machineLine = await db.QueryAsync(`call usp_view_machine_line('${lineName}');`);
        res.render('Innovation/sewingRealtime/machine',{line:machineLine[0],lineName:lineName});  
    }
    catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.getMachine", error);
    }
};

module.exports.postMachine = async function(req, res, next) {
    try{
        var lineName = req.body.lineName;
        let machineLine = await db.QueryAsync(`call usp_view_machine_line('${lineName}');`);
        return res.end(JSON.stringify({  msg: "Không được bỏ trông tag máy",line:machineLine[0],lineName:lineName}));  
    }
    catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.postMachine", error);
    }    
};

module.exports.postUpdateMachine = async function(req, res, next) {
    try{
        let oldID = req.body.oldID;
    let newID = req.body.newID;
    let lineName = req.body.lineName;
    let location = req.body.location;
    if(newID == 0){
        return res.end(JSON.stringify({  msg: "Không được bỏ trông tag máy",status:0})); 
    }
    else{
        if (oldID == newID) {
            return res.end(JSON.stringify({  msg: "Cần nhập tag máy mới khác tag máy cũ",status:0})); 
        }
        else{
            try {
                let a= await db.QueryAsync(`CALL usp_change_machine_tag('${oldID}','${newID}','${lineName}','${location}')`);
                if (a[0][0]['status']=='1'||a[0][0]['status']==1){
                    return res.end(JSON.stringify({  msg: "Cập nhật tag máy thành công",status:1}));  
                }
                else  return res.end(JSON.stringify({  msg: "Cập nhật tag máy không thành công: tag máy đã tồn tại",status:0}));           
            } catch (error) {
                return res.end(JSON.stringify({  msg: error,status:0})); 
            }
        }
    }      
    }
    catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.postUpdateMachine", error);
    }    
};

module.exports.getAbout = function(req, res,) {
    try{
        res.render('Innovation/sewingRealtime/about');
    }
   catch(error){
    logHelper.writeLog("innovation.sewingRealtime.getAbout", error);
   }
};

module.exports.postMachneData = async function(req, res){
    try{
        var lineName= req.body.lineName;  
    var index= req.body.index;
    // console.log(`CALL usp_view_machine_operation('${lineName}','${index}')`);
    machineData = await db.QueryAsync(`CALL usp_view_machine_operation('${lineName}','${index}')`);
    return res.end(JSON.stringify({ rs: true, msg: "Thành công",machineData:machineData[0]}))
    }
    catch (error) {
        logHelper.writeLog("innovation.sewingRealtime.postMachneData", error);
    }
};
