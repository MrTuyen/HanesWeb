var formidable = require('formidable');
var fs = require('fs');
var Database = require("../../database/db.js")
const db = new Database();
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');
const innovationService = require("../../services/Innovation/innovation.service");

// Part
module.exports.getIndex = function (req, res) {
    res.render('Innovation/Index');
}

// suggest part while creating sparepart request
module.exports.suggestPart = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;
        let pageSize = req.body.pageSize;

        let query = `SELECT * FROM mec_part WHERE name LIKE '%${keyword}%'`;
        if (req.body.type) {
            query = `SELECT * FROM mec_part WHERE code LIKE '%${keyword}%'`;
        }

        // execute
        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.suggestPart", error);
    }
}

module.exports.getPartByModel = function (req, res) {
    try {
        //parameters
        let model = req.body.model;

        let query = `SELECT id, code, quantity, name, image, location, unit FROM mec_part WHERE FIND_IN_SET ('${model}', machine_model) <> 0`;
        // execute
        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getPartByModel", error);
    }
}

// display all warning part
module.exports.getWarningPart = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;

        // execute
        db.excuteSP(`CALL USP_Part_Warning_Get ('${keyword}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getWarningPart", error);
    }
}

module.exports.downloadWarningPart = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;

        // execute
        db.excuteSP(`CALL USP_Part_Warning_Get ('${keyword}')`, function (result) {
            if (!result.rs) {
                return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {

                let jsonWaringPart = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Warning part'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Id', key: 'id', width: 10 },
                    { header: 'Name', key: 'name', width: 30 },
                    { header: 'Code', key: 'code', width: 30 },
                    { header: 'Location', key: 'location', width: 30 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonWaringPart);

                // Write to File
                let filename = "templates/warning_part.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    // return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));

                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadWarningPart", error);
    }
}

// display all part
module.exports.getAllPart = function (req, res) {
    try {
        //parameters
        let keyword = req.body.keyword;

        // execute
        db.excuteSP(`CALL USP_Part_Get ('${keyword}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getAllPart", error);
    }
}

module.exports.downloadPart = function (req, res) {
    try {
        //parameters
        let criteria = req.body.criteria;
        let filterDate = req.body.filterDate;

        // execute
        db.excuteSP(`CALL USP_Part_TopUsage_Download ('${filterDate.split(';')[0]}', '${filterDate.split(';')[1]}', ${criteria})`, function (result) {
            if (!result.rs) {
                return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {

                let jsonPart = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Part'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Code', key: 'code', width: 30 },
                    { header: 'Total Qty', key: 'total', width: 30 },
                    { header: 'Total Export Qty', key: 'total_export', width: 30 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonPart);

                // Write to File
                let filename = "templates/part.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    // return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));

                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadPart", error);
    }
}

module.exports.exportPartToLawsonSystem = function (req, res) {
    try {
        //parameters
        let criteria = req.body.criteria;
        let filterDate = req.body.filterDate;

        // execute
        db.excuteSP(`CALL USP_Part_TopUsage_Download ('${filterDate.split(';')[0]}', '${filterDate.split(';')[1]}', ${criteria})`, function (result) {
            if (!result.rs) {
                return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {

                let jsonPart = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Part'); //creating worksheet

                //  WorkSheet Header
                worksheet.columns = [
                    { header: 'Code', key: 'code', width: 30 },
                    { header: 'Total Qty', key: 'total', width: 30 },
                    { header: 'Total Export Qty', key: 'total_export', width: 30 }
                ];

                // Add Array Rows
                worksheet.addRows(jsonPart);

                // Write to File
                let filename = "templates/part.xlsx";
                workbook.xlsx.writeFile(filename).then(function () {
                    // return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));

                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadPart", error);
    }
}

module.exports.getPartDetail = function (req, res) {
    try {
        //parameters
        let id = req.params.id;

        // execute
        db.excuteSP(`SELECT * FROM mec_part WHERE id = ${id}`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getPartDetail", error);
    }
}

// upload part image
module.exports.upload = function (req, res) {
    try {
        let form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, file) {
            if (err)
                return res.redirect(303, 'Error');

            fs.rename(file.file.path, config.imageFilePath + file.file.name, function (err) {
                if (err)
                    throw err;
                console.log('upload successfully');
            });

            res.end();
        });
    } catch (error) {
        logHelper.writeLog("innovation.upload", error);
    }
}

module.exports.addPart = async function (req, res) {
    try {
        //parameters
        let name = req.body.name;
        let code = req.body.code;
        let vendorCode = req.body.vendorCode;
        let qty = req.body.qty;
        let min_qty = req.body.min_qty;
        let location = req.body.location;
        let des = req.body.des;
        let user = req.user.username;
        let datetime = helper.getDateTimeNow();
        let img = req.body.img ? req.body.img.split("\\")[2] : "";
        let model = req.body.model;
        let price = req.body.price;
        let unit = req.body.unit;

        // var base64Data = req.body.img.replace(/^data:image\/png;base64,/, "");
        // fs.writeFile(config.imageFilePath + "out.png", base64Data, 'base64', function(err) {
        //     console.log(err);
        // });

        // check exist
        let partObj = await innovationService.getPartDetail({ code: code.trim() });
        if (partObj.length > 0) {
            return res.end(JSON.stringify({ rs: false, msg: `Đẫ tồn tại part có mã code ${code}` }));
        }

        // execute
        let query = `INSERT INTO mec_part (name, code, vendor_code, quantity, min_quantity, price, unit, location, machine_model, description, image, last_update, user_update) 
                    VALUES('${name}', '${code}', '${vendorCode}' ,${qty}, ${min_qty}, ${price}, '${unit}', '${location}', '${model}', '${des}', '${img}', '${datetime}', '${user}')`;
        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.addMachine", error);
    }
}

module.exports.updatePart = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let name = req.body.name;
        let code = req.body.code;
        let vendorCode = req.body.vendorCode;
        let qty = req.body.qty;
        let location = req.body.location;
        let des = req.body.des;
        let price = req.body.price ? req.body.price : 0;
        let min_quantity = req.body.min_quantity ? req.body.min_quantity : 0;
        let unit = req.body.unit;
        let img = req.body.img ? req.body.img.split("\\")[2] : "";
        let oldImg = req.body.oldImg;
        let model = req.body.model ? req.body.model : "";

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        let query = `UPDATE mec_part
                    SET name = '${name}', code = '${code}', vendor_code = '${vendorCode}', quantity = '${qty}', location = '${location}', 
                    last_update = '${datetime}', user_update = '${user}', description = '${des}',
                    price = ${price}, min_quantity = ${min_quantity}, unit = '${unit}', machine_model = '${model}', image = '${img}'
                    WHERE id = ${id}`;

        if (img == "") {
            query = `UPDATE mec_part
                    SET name = '${name}', code = '${code}', vendor_code = '${vendorCode}', quantity = '${qty}', location = '${location}', 
                    last_update = '${datetime}', user_update = '${user}', description = '${des}',
                    price = ${price}, min_quantity = ${min_quantity}, unit = '${unit}', machine_model = '${model}'
                    WHERE id = ${id}`
        }
        else {
            let deleteFile = config.imageFilePath + oldImg;
            if (fs.existsSync(deleteFile)) {
                fs.unlink(deleteFile, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('deleted');
                })
            }
        }

        db.excuteQuery(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.updatePart", error);
    }
}

// Spare Part request
module.exports.getPartRequest = function (req, res) {
    try {
        //parameters
        let status = req.body.status;
        let zone = req.body.zone;
        let filterDate = req.body.filterDate;

        // execute
        if (req.user.position.toLowerCase() == "clerk") {
            let query = `CALL USP_Part_Request_Processing_Get ('${constant.Action_Status.None}', '${zone}', '', '')`;
            if (status != "")
                query = `CALL USP_Part_Request_Processing_Get ('${status}', '${zone}', '${filterDate.split(";")[0]}', '${filterDate.split(";")[1]}')`;
            db.excuteSP(query, function (result) {
                if (!result.rs) {
                    res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
                }
                else {
                    let data = result.data;
                    data = result.data.filter(ele => ele.manager_status == constant.Action_Status.Approve || ele.s_manager_status == constant.Action_Status.Approve);
                    return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: data }));
                }
            });
        }
        else {
            db.excuteSP(`CALL USP_Part_Request_Processing_Get ('${status}', '${zone}', '${filterDate.split(";")[0]}', '${filterDate.split(";")[1]}')`, function (result) {
                if (!result.rs) {
                    res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
                }
                else {
                    let data = result.data;
                    // if(req.user.position.toLowerCase() == "clerk")
                    //     data = result.data.filter(ele => ele.manager_status == constant.Action_Status.Approve);

                    if (req.user.position.toLowerCase() == "supervisor")
                        data = result.data.filter(ele => ele.manager == req.user.username);

                    return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: data }));
                }
            });
        }
    }
    catch (error) {
        logHelper.writeLog("innovation.getPartRequest", error);
    }
}

module.exports.getRequestDetail = async function (req, res) {
    try {
        // parameters
        let id = req.params.id;

        // get request info
        let requestInfo = await innovationService.getSparepartRequestDetail({ id: id });
        if (!requestInfo)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy thông tin phiếu yêu cầu" }));

        // get request detail item
        let requestDetail = await innovationService.getSparepartRequestDetailItem({ id: id });
        if (!requestDetail)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy thông tin chi tiết phiếu yêu cầu" }));

        return res.end(JSON.stringify({ rs: true, msg: "", data: { info: requestInfo[0], items: requestDetail } }));
    }
    catch (error) {
        logHelper.writeLog("innovation.getRequestDetail", error);
    }
}

module.exports.getMechanicById = function (req, res) {
    try {
        //parameters
        let id = req.body.id;
        let query = `SELECT mu.fullname, mu.manager, su.email
        FROM mec_user mu
        LEFT JOIN erpsystem.setup_user su ON mu.manager = su.user
        WHERE id_mec = ${id}`;
        // execute
        db.excuteSP(query, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getMechanicicanById", error);
    }
}

module.exports.addRequest = async function (req, res) {
    try {
        //parameters
        let requestType = req.body.requestType;
        let tag = req.body.tag;
        let reason = req.body.reason;
        let zone = req.body.zone;
        let idMechanic = req.body.idMechanic;
        let manager = req.body.manager;
        let managerEmail = req.body.managerEmail;
        let sManager = req.body.sManager;
        let sManagerEmail = req.body.sManagerEmail;
        let requesterName = req.body.requesterName;
        let listPart = req.body.listPart;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // execute
        // add request then return id to insert into import request detail
        let idInserted = await innovationService.addSparepartRequest({
            tag: tag,
            reason: reason,
            datetime: datetime,
            idMechanic: idMechanic,
            zone: zone,
            manager: manager,
            requesterName: requesterName,
            requestType: requestType,
            sManager: sManager
        });
        if (idInserted <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Thêm request không thành công." }));

        // add import request detail
        let arr = [];
        for (let i = 0; i < listPart.length; i++) {
            let eleArr = [];
            let ele = listPart[i];
            for (let j = 0; j < Object.values(ele).length; j++) {
                eleArr.push(Object.values(ele)[j]);
            }
            eleArr.push(idInserted);
            arr.push(eleArr);
        }

        let isAddDetailSuccess = await innovationService.addSparepartRequestDetail(arr);
        if (isAddDetailSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Thêm chi tiết không thành công." }));

        // send mail to supervisor
        let subject = "Yêu cầu cấp sparepart";
        let body = `Dear ${manager}, <br > <br >
        Vui lòng phê duyệt yêu cầu cấp sparepart từ thợ máy ${idMechanic} - ${requesterName}`;
        helper.sendMailSystem(subject, "tuyen.nguyen@hanes.com", "", body); 
        // helper.sendMailSystem(subject, managerEmail, "", body); 

        // send mail to superintendent if new issue
        if(requestType == 'false'){
            body = `Dear ${sManager}, <br > <br > 
            Vui lòng phê duyệt yêu cầu cấp sparepart từ thợ máy ${idMechanic} - ${requesterName}`;
            if(sManager != manager){
                helper.sendMailSystem(subject, "tuyen.nguyen@hanes.com", "", body); 
                // helper.sendMailSystem(subject, sManagerEmail, "", body); 
            }
        }
      
        return res.end(JSON.stringify({ rs: true, msg: "Thêm yêu cầu thành công." }));
    }
    catch (error) {
        logHelper.writeLog("innovation.addRequest", error);
    }
}

module.exports.updateRequest = async function (req, res, next) {
    try {
        var objReq = await innovationService.getRequestDetail(req.body);
        if (!objReq)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

        if (objReq[0].manager_status != constant.Action_Status.None)
            return res.end(JSON.stringify({ rs: false, msg: "Request đã được manager xử lý" }));

        var isSuccess = await innovationService.updateRequest(req.body);
        if (isSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
        return res.end(JSON.stringify({ rs: true, msg: "Cập nhật thành công" }));
    }
    catch (error) {
        logHelper.writeLog("innovation.updateRequest", error);
    }
}

module.exports.managerApprove = async function (req, res, next) {
    try {
        if (req.user.position == constant.Position.Supervisor 
            || req.user.position == constant.Position.SuperIntendant 
            || req.user.position == constant.Position.Admin) {
            // Check exist
            var objReq = await innovationService.getRequestDetail(req.body);
            if (!objReq)
                return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

            if (objReq[0].manager == req.user.username 
                || req.user.position == constant.Position.SuperIntendant 
                || req.user.position == constant.Position.Admin) {
                // Check has processed
                if (objReq[0].manager_status != constant.Action_Status.None)
                    return res.end(JSON.stringify({ rs: false, msg: "Request đã được xử lý" }));

                // Excute update
                var isSuccess = await innovationService.managerApprove(req.body);
                if (isSuccess <= 0)
                    return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
                return res.end(JSON.stringify({ rs: true, msg: "Cập nhật thành công" }));
            }
            return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải quản lý thợ máy của request này" }));
        }
        else {
            return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải là supervisor. Bạn không có quyền duyệt request này" }));
        }
    }
    catch (error) {
        logHelper.writeLog("innovation.managerApprove", error);
    }
}

module.exports.managerReject = async function (req, res, next) {
    try {
        if (req.user.position == constant.Position.Supervisor 
            || req.user.position == constant.Position.SuperIntendant 
            || req.user.position == constant.Position.Admin) {
            // Check exist
            var objReq = await innovationService.getRequestDetail(req.body);
            if (!objReq)
                return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

            if (objReq[0].manager == req.user.username 
                || req.user.position == constant.Position.SuperIntendant 
                || req.user.position == constant.Position.Admin) {
                // Check has processed
                if (objReq[0].manager_status != constant.Action_Status.None)
                    return res.end(JSON.stringify({ rs: false, msg: "Request đã được xử lý" }));

                // Excute update
                var isSuccess = await innovationService.managerReject(req.body);
                if (isSuccess <= 0)
                    return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
                return res.end(JSON.stringify({ rs: true, msg: "Cập nhật thành công" }));
            }
            return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải quản lý thợ máy của request này" }));
        }
        else {
            return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải là supervisor. Bạn không có quyền duyệt request này" }));
        }
    }
    catch (error) {
        logHelper.writeLog("innovation.managerReject", error);
    }
}

module.exports.sManagerApprove = async function (req, res, next) {
    try {
        var objReq = await innovationService.getRequestDetail(req.body);
        if (!objReq)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

        if (objReq[0].s_manager == req.user.username 
            || req.user.position == constant.Position.SuperIntendant 
            || req.user.position == constant.Position.Admin) {
            // Check manager has processed
            // if (objReq[0].manager_status != constant.Action_Status.Approve)
            //     return res.end(JSON.stringify({ rs: false, msg: "Request chưa đã được quản lý approve" }));

            // Check has processed
            if (objReq[0].s_manager_status != constant.Action_Status.None)
                return res.end(JSON.stringify({ rs: false, msg: "Request đã được xử lý" }));

            // Excute update
            var isSuccess = await innovationService.sManagerApprove(req.body);
            if (isSuccess <= 0)
                return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            return res.end(JSON.stringify({ rs: true, msg: "Cập nhật thành công" }));
        }
        return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải quản lý thợ máy của request này" }));
    }
    catch (error) {
        logHelper.writeLog("innovation.sManagerApprove", error);
    }
}

module.exports.sManagerReject = async function (req, res, next) {
    try {
        // Check exist
        var objReq = await innovationService.getRequestDetail(req.body);
        if (!objReq)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

            if (objReq[0].s_manager == req.user.username 
                || req.user.position == constant.Position.SuperIntendant 
                || req.user.position == constant.Position.Admin) {
            // Check manager has processed
            // if (objReq[0].manager_status != constant.Action_Status.Approve)
            //     return res.end(JSON.stringify({ rs: false, msg: "Request chưa đã được quản lý approve" }));

            // Check has processed
            if (objReq[0].s_manager_status != constant.Action_Status.None)
                return res.end(JSON.stringify({ rs: false, msg: "Request đã được xử lý" }));

            // Excute update
            var isSuccess = await innovationService.sManagerReject(req.body);
            if (isSuccess <= 0)
                return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            return res.end(JSON.stringify({ rs: true, msg: "Cập nhật thành công" }));
        }
        return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải quản lý thợ máy của request này" }));
    }
    catch (error) {
        logHelper.writeLog("innovation.sManagerReject", error);
    }
}

module.exports.clerkApprove = async function (req, res, next) {
    try {
        if (req.user.position != constant.Position.Clerk)
            return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải là clerk. Bạn không có quyền duyệt request này" }));

        // Check exist
        var objReq = await innovationService.getRequestDetail(req.body);
        if (!objReq)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

        // Check has processed
        if (objReq[0].manager_status == constant.Action_Status.None && objReq[0].s_manager_status == constant.Action_Status.None)
            return res.end(JSON.stringify({ rs: false, msg: "Request chưa được quản lý duyệt" }));

        // Check has processed
        if (objReq[0].clerk_status != constant.Action_Status.None)
            return res.end(JSON.stringify({ rs: false, msg: "Request đã được clerk xử lý" }));

        // Excute update
        var isSuccess = await innovationService.clerkApprove(req.body);
        if (isSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
        else {
            let isNewIssue = objReq[0].request_type == constant.Part_Request_Type.NewIssue;
            let listPart = req.body.listPart;
            if (listPart.length > 0) {
                for (let i = 0; i < listPart.length; i++) {
                    let partEle = listPart[i];
                    // update quantity in mec_part: substract the quantity
                    if(isNewIssue){
                        isSuccess = await innovationService.updatePartQuantity({ export_qty: partEle.export_qty, code: partEle.code });
                        if (isSuccess <= 0)
                            logHelper.writeLog("innovation.clerkApprove", "Cập nhật số lượng part trong kho sau khi xuất part không thành công.");
                    }

                    isSuccess = await innovationService.updatePartRequestDetailExportQty({ export_qty: partEle.export_qty, detail_id: partEle.detail_id });
                    if (isSuccess <= 0)
                        logHelper.writeLog("innovation.clerkApprove", "Cập nhật số lượng xuất part không thành công.");
                }
            }
            return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
        }
    }
    catch (error) {
        logHelper.writeLog("innovation.clerkApprove", error);
    }
}

module.exports.clerkReject = async function (req, res, next) {
    try {
        if (req.user.position != constant.Position.Clerk)
            return res.end(JSON.stringify({ rs: false, msg: "Bạn không phải là clerk. Bạn không có quyền duyệt request này" }));

        // Check exist
        var objReq = await innovationService.getRequestDetail(req.body);
        if (!objReq)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy request" }));

        // Check has processed
        if (objReq[0].manager_status == constant.Action_Status.None && objReq[0].s_manager_status == constant.Action_Status.None)
            return res.end(JSON.stringify({ rs: false, msg: "Request chưa được quản lý duyệt" }));

        // Check has processed
        if (objReq[0].clerk_status != constant.Action_Status.None)
            return res.end(JSON.stringify({ rs: false, msg: "Request đã được clerk xử lý" }));

        // Excute update
        var isSuccess = await innovationService.clerkReject(req.body);
        if (isSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
        else {
            return res.end(JSON.stringify({ rs: true, msg: "Thành công" }));
        }
    }
    catch (error) {
        logHelper.writeLog("innovation.clerkReject", error);
    }
}

module.exports.downloadRequest = function (req, res) {
    try {
        //parameters
        let zone = req.body.zone;
        // let includeFee = req.body.includeFee;
        let downloadType = req.body.downloadType;
        let filterDate = req.body.filterDate;

        // execute
        db.excuteSP(`CALL USP_Part_Export_Report_Download ('${filterDate.split(";")[0]}', '${filterDate.split(";")[1]}', '${zone}', ${downloadType})`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonMachine = JSON.parse(JSON.stringify(result.data));

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Data'); //creating worksheet

                let filename = "templates/sparepart_request.xlsx";
                //  WorkSheet Header
                if (downloadType == 0) {
                    worksheet.columns = [
                        { header: '#', key: 'id', width: 10 },
                        { header: 'CODE', key: 'code', width: 10 },
                        { header: 'NAME', key: 'name', width: 30 },
                        { header: 'ID', key: 'vendor_code', width: 30 },
                        { header: 'REQUEST QTY', key: 'qty', width: 10 },
                        { header: 'OUTCOMING QTY', key: 'export_qty', width: 10 },
                        { header: 'TAG MACHINE', key: 'tag_machine', width: 20 },
                        { header: 'ZONE', key: 'zone', width: 10 },
                        { header: 'REQUESTER', key: 'requester', width: 20 },
                        { header: 'REQUEST DATE', key: 'request_date', width: 20 },
                        { header: 'REASON', key: 'reason', width: 20 },
                        { header: 'MANAGER', key: 'manager', width: 20 },
                        { header: 'MANAGER STATUS', key: 'manager_status', width: 10 },
                        { header: 'MANAGER APPROVED DATE', key: 'manager_date', width: 20 },
                        { header: 'SENIOR MANAGER', key: 's_manager', width: 20 },
                        { header: 'SENIOR MANAGER STATUS', key: 's_manager_status', width: 10 },
                        { header: 'SENIOR MANAGER APPROVED DATE', key: 's_manager_date', width: 20 },
                        { header: 'CLERK STATUS', key: 'clerk_status', width: 10 },
                        { header: 'CLERK APPROVED DATE', key: 'clerk_date', width: 30 }
                    ];
                }

                if (downloadType == 1) {
                    worksheet.columns = [
                        { header: 'CODE', key: 'code', width: 10 },
                        { header: 'NAME', key: 'name', width: 20 },
                        { header: 'PRICE', key: 'price', width: 10 },
                        { header: 'REQUEST QTY', key: 'total', width: 10 },
                        { header: 'OUTCOMING QTY', key: 'total_export', width: 10 },
                        { header: 'TOTAL MONEY', key: 'money', width: 20 }
                    ];
                    filename = "templates/sparepart_request_export_cost.xlsx";
                }

                if (downloadType == 2) {
                    worksheet.columns = [
                        { header: 'NGÀY', key: 'request_date', width: 10 },
                        { header: 'SỐ PHIẾU', key: '', width: 20 },
                        { header: 'CODE', key: 'code', width: 10 },
                        { header: 'SỐ LƯỢNG', key: 'export_qty', width: 10 },
                        { header: 'NGƯỜI NHẬN', key: 'requester_name', width: 10 },
                        { header: 'ID', key: 'vendor_code', width: 20 },
                        { header: 'VỊ TRÍ', key: 'location', width: 20 },
                        { header: 'MÔ TẢ', key: 'name', width: 20 },
                        { header: 'GHI CHÚ', key: '', width: 20 }
                    ];
                    filename = "templates/sparepart_request_export_warehouse.xlsx";
                }

                // Add Array Rows
                worksheet.addRows(jsonMachine);

                // Write to File
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadRequest", error);
    }
}