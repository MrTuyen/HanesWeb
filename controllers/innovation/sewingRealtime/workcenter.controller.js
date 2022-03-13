var database = require('../../../database/db_sewingRealtime');
var db = new database();
var workcenter = {
    getHomePage:async function(req,res,next) {
        var listZone = ["A","B","C","D","E","F","G","H"];
        var listLine = [1,2,3,4,5,6];
        let location = await db.QueryAsync(`SELECT CONCAT(zone,line) AS line_location,line_name FROM zone ORDER BY line_no;`);
        let online = await db.QueryAsync(`call usp_zone_online();`);
        let wait = await db.QueryAsync(`call usp_zone_wait();`);
        let repair = await db.QueryAsync(`call usp_zone_repair();`);
        var workcenterData = {
            listZone:listZone,
            listLine:listLine,
            listLineName:location,
            online:online[0],
            wait:wait[0],
            repair:repair[0]};
        res.render('Innovation/sewingRealtime/workcenter',workcenterData);   
    },
    adjustingZone:async function(req,res,next) {
        var location = req.body.location;
        var style = req.body.style;
        var deleteId = req.body.deleteId;
        let color;
        if(location == ""){
            return res.end(JSON.stringify({  msg: "Không được bỏ trống mã truyền may",status:0})); 
        }
        else{
                var no = await db.QueryAsync(`call usp_update_zone('${location}','${style}','${deleteId}')`);
                if(no[0].length > 0){
                    // let online = await db.QueryAsync(`call usp_zone_online();`);
                    // let wait = await db.QueryAsync(`call usp_zone_wait();`);
                    // let repair = await db.QueryAsync(`call usp_zone_repair();`);
                    // var checkOn = online.some(checkExist => checkExist.line_location === no[0][0].line_location); 
                    // var checkWait = wait.some(checkExist => checkExist.line_location === no[0][0].line_location );
                    // var checkRepaire = repair.some(checkExist => checkExist.line_location === no[0][0].line_location);
                    // if (checkOn == true && checkWait == false && checkRepaire == false) { 
                    //     color = "green";
                    // }
                    // else if(checkWait == true && checkRepaire == false) {
                    //     color = "yellow";
                    // }
                    // else if(checkRepaire == true) {
                    //     color = "red";
                    // }
                    // else{
                    //     color = "white";
                    // }
                    let data = {
                        msg: "Thay đổi thành công",
                        status:1,
                        line_no: no[0][0].line_no,
                        line_name: no[0][0].line_name,
                        color:color,
                    };
                    return res.end(JSON.stringify(data)); 
                }
                else{
                return res.end(JSON.stringify({  msg: "Không tìm thấy truyền may",status:2})); 
                }
        }
    },
};
module.exports = workcenter;