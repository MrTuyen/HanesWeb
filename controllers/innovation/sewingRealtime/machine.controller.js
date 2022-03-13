var database = require('../../../database/db_sewingRealtime');
var db = new database();
var machineCtrl = {
    getMachine:async function(req, res,next) {
        var lineName = req.query.line;
        let machineLine = await db.QueryAsync(`call usp_view_machine_line('${lineName}');`);
        console.log(`call usp_view_machine_line('${lineName}');`)
        console.log(lineName)
        res.render('Innovation/sewingRealtime/machine',{line:machineLine[0],lineName:lineName});                     
    },
    postMachine:async function(req, res, next) {
        var lineName = req.body.lineName;
        let machineLine = await db.QueryAsync(`call usp_view_machine_line('${lineName}');`);
        return res.end(JSON.stringify({  msg: "Không được bỏ trông tag máy",line:machineLine[0],lineName:lineName}));         
    },
    postUpdateMachine:async function(req, res, next) {
        let oldID = req.body.oldID;
        let newID = req.body.newID;
        let lineName = req.body.lineName;
        let location = req.body.location;
        console.log(`CALL usp_change_machine_tag('${oldID}','${newID}','${lineName}')`);
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
    },
    getAbout: function(req, res,) {
        res.render('Innovation/sewingRealtime/about');
    },
    postMachneData:async function(req, res){
        var lineName= req.body.lineName;  
        var index= req.body.index;
        console.log(`CALL usp_view_machine_operation('${lineName}','${index}')`);
        machineData = await db.QueryAsync(`CALL usp_view_machine_operation('${lineName}','${index}')`);
        return res.end(JSON.stringify({ rs: true, msg: "Thành công",machineData:machineData[0]}))
    }
    // ,
    // getMachine1:async function(req, res,) {
    //     var lineName = req.query.line;
    //     let machineLine = await db.QueryAsync(`call usp_view_machine_line('${lineName}');`);
    //     let a = machineLine[0];
    //     // console.log(a[2]);
    //     res.render('Innovation/sewingRealtime/machine1',{line:machineLine[0]});
    // }
};

module.exports = machineCtrl;