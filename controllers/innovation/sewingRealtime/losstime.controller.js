var database = require('../../../database/db_sewingRealtime');
var db = new database();
////////////////////////////////////////////////////////////////////////
var losstimeCtrl = {
   getLosstime : async function(req, res, next) {
    let result = await db.QueryAsync(`CALL procedure_losstime('All','All','');`);
        res.render('Innovation/sewingRealtime/losstime',today= result);
    },
    postLosstime:async function(req, res, next) {
        var zone =["A","B","C","D","E","F","G","H"];
        var x = req.body.zone;
        var y =req.body.line;
        var z =req.body.date;
        if(x.toString()=="All")
        {
            // query ="CALL procedure_losstime('All',"+"'"+ y.toString()+"'"+"," +"'"+ z.toString()+ "');"

            query =`CALL procedure_losstime('All','${y.toString()}','${z.toString()}');`
        }
        else
        {
            query ="CALL procedure_losstime('"+ zone[x].toString() + "',"+"'"+ y.toString()+"'"+"," +"'"+ z.toString()+ "');"
        }
        let result= await db.QueryAsync(query);
        res.render('Innovation/sewingRealtime/losstime',today= result[0]);  

    },
};
/////////////////////
module.exports = losstimeCtrl;



// var db = require('../config/db/db_realtime2');
// var db = new database();
// var losstimeCtrl = {
//     getLosstime : function(req, res,) {
//         db.con.query("SELECT loss_time.tag,loss_time.error_code,time(loss_time.start_wait) as start_wait, machine_locations.line, machine_locations.zone,machine_locations.operation ,time(loss_time.start_repair) as start_repair,time(loss_time.end_repair) as end_repair ,loss_time.loss_time_s,date_format(loss_time.start_repair,'%Y/%m/%d') as date FROM sewing_needle_realtime.loss_time INNER JOIN sewing_needle_realtime.machine_locations ON loss_time.tag = machine_locations.tag;" , function(err,result,fields){                               
//         res.render('pages/losstime', today = result);
//         });
//     },
//     postLosstime : function(req, res,) {
//         var zone =["A","B","C","D","E","F","G","H"];
//         var x = req.body.zone;
//         var y =req.body.line;
//         var z =req.body.date;
//         var query ="";
//         if(x.toString()=="All")
//         {
//             query ="CALL procedure_losstime('All',"+"'"+ y.toString()+"'"+"," +"'"+ z.toString()+ "');"
//         }
//         else
//         {
//             query ="CALL procedure_losstime('"+ zone[x].toString() + "',"+"'"+ y.toString()+"'"+"," +"'"+ z.toString()+ "');"
//         }
//         db.con.query(query, function(err,result,fields){                               
//             res.render('pages/losstime', today = result[0]);
//           });
//     },
// };