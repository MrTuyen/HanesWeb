var Database = require("../../database/db.js")
const db = new Database();
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');
const innovationService = require("../../services/Innovation/innovation.service");

// // config for your database
// const sql = require("mssql");
// var configMSSQL = {
//     user: 'hobui',
//     password: 'Hy$2017',
//     server: '10.113.97.23',
//     database: 'HYSCTS',
//     options: {
//         encrypt: false,
//     }
// };

// module.exports.getPOInfo = function (req, res) {
//     try {
//         //parameters
//         let po = req.body.po == '' ? "3844295774" : req.body.po;

//         // execute
//         sql.connect(configMSSQL, function (err) {
    
//             if (err) console.log(err);
    
//             // create Request object
//             var request = new sql.Request();
               
//             // query to the database and get the records
//             request.query(`SELECT * FROM Details WHERE PONo = '${po}'`, function (err, result) {
//                 if (err) 
//                     console.log(err)
//                 // send records as a response
//                 console.log(result.recordset)
//                 return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.recordset }));
//             });
//         });
//     }
//     catch (error) {
//         logHelper.writeLog("innovation.suggestPONumber", error);
//     }
// }


// #region UI
module.exports.getImportIndex = function (req, res) {
    res.render('Innovation/ImportPart/ImportPartIndex');
}

module.exports.addUI = function (req, res) {
    res.render("Innovation/ImportPart/AddImportRequest");
}

// #endregion

// #region LOGIC

module.exports.getImport = function (req, res) {
    try {
        //parameters
        let po = req.body.po;
        let importDate = req.body.importDate;
        let vendor = req.body.vendor;

        // execute
        db.excuteSP(`CALL USP_Part_Import_Get ('${po}', '${importDate.split(";")[0]}', '${importDate.split(";")[1]}', '${vendor}')`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result.data }));
            }
        });
    }
    catch (error) {
        logHelper.writeLog("innovation.getImport", error);
    }
}

module.exports.addImportRequest = async function (req, res) {
    try {
        //parameters
        let importInfo = req.body.importInfo;
        let listPart = req.body.listPart;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // add import request then return id to insert into import request detail
        let idInserted = await innovationService.addImportRequest({
            po: importInfo.po,
            importDate: importInfo.importDate,
            vendor: importInfo.vendor,
            receiver: importInfo.receiver,
            deliverer: importInfo.deliverer,
            requestDate: datetime,
            user: user
        });
        if (idInserted <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Thêm import request không thành công." }));

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
        
        let isAddDetailSuccess = await innovationService.addImportRequestDetail(arr);
        if (isAddDetailSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Thêm chi tiết không thành công." }));

        // Kiểm tra tồn tại part chưa? => Cập nhật nếu tồn tại => Thêm nếu chưa
        for (let i = 0; i < listPart.length; i++) {
            let partObj = listPart[i];
            let isInsertUpdateSuccess = await innovationService.checkInsertOrUpdatePart(partObj);
            console.log(isInsertUpdateSuccess);
        }

        return res.end(JSON.stringify({ rs: true, msg: "Thêm import request thành công." }));
    }
    catch (error) {
        logHelper.writeLog("innovation.addImportRequest", error);
    }
}

module.exports.getImportDetail = async function (req, res) {
    try {
        // parameters
        let id = req.body.id;

        // get import info
        let importInfo = await innovationService.getImportDetail({ id: id });
        if (!importInfo)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy thông tin nhập hàng" }));

        // get import detail item
        let importDetail = await innovationService.getImportDetailItem({ id: id });
        if (!importDetail)
            return res.end(JSON.stringify({ rs: false, msg: "Không tìm thấy thông tin chi tiết nhập hàng" }));

        return res.end(JSON.stringify({ rs: true, msg: "", data: { info: importInfo[0], items: importDetail } }));
    }
    catch (error) {
        logHelper.writeLog("innovation.getImportDetail", error);
    }
}

module.exports.updateImportRequest = async function (req, res) {
    try {
        //parameters
        let importInfo = req.body.importInfo;
        let listPart = req.body.listPart;

        let user = req.user.username;
        let datetime = helper.getDateTimeNow();

        // update import request
        let isUpdateSuccess = await innovationService.updateImportRequest({
            id: importInfo.id,
            importDate: importInfo.importDate,
            vendor: importInfo.vendor,
            receiver: importInfo.receiver,
            deliverer: importInfo.deliverer
        });
        if (isUpdateSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật thông tin import request không thành công." }));

        // delete all existed item detail
        let isDeleteSuces = await innovationService.deleteImportDetailItem({ id: importInfo.id });
        // if (isDeleteSuces <= 0)
        //     return res.end(JSON.stringify({ rs: false, msg: "Xóa chi tiết không thành công." }));

        // add import request detail
        let arr = [];
        for (let i = 0; i < listPart.length; i++) {
            let eleArr = [];
            let ele = listPart[i];
            for (let j = 0; j < Object.values(ele).length; j++) {
                eleArr.push(Object.values(ele)[j]);
            }
            eleArr.push(importInfo.id);
            arr.push(eleArr);
        }

        let isAddDetailSuccess = await innovationService.addImportRequestDetail(arr);
        if (isAddDetailSuccess <= 0)
            return res.end(JSON.stringify({ rs: false, msg: "Cập nhật chi tiết không thành công." }));
        
        // Kiểm tra tồn tại part chưa? => Cập nhật nếu tồn tại => Thêm nếu chưa

        return res.end(JSON.stringify({ rs: true, msg: "Cập nhật import request thành công." }));
    }
    catch (error) {
        logHelper.writeLog("innovation.updateImportRequest", error);
    }
}

module.exports.downloadImportRequest = function (req, res) {
    try {
        //parameters
        let vendor = req.body.vendor;
        let downloadType = req.body.downloadType;
        let importDate = req.body.importDate;

        // execute
        db.excuteSP(`CALL USP_Part_Import_Report_Download ('${importDate.split(";")[0]}', '${importDate.split(";")[1]}', '${vendor}', ${downloadType})`, function (result) {
            if (!result.rs) {
                res.end(JSON.stringify({ rs: false, msg: result.msg.message }));
            }
            else {
                let jsonMachine = JSON.parse(JSON.stringify(result.data));
                
                jsonMachine.forEach(ele => {
                    ele.part_name = ele.part_name.replaceAll("<br >", "\n")
                });

                let workbook = new excel.Workbook(); //creating workbook
                let worksheet = workbook.addWorksheet('Import'); //creating worksheet
                //  WorkSheet Header
                let filename = "templates/import_request.xlsx";
                //  WorkSheet Header
                if (downloadType == 0) {
                    worksheet.columns = [
                        { header: '#', key: 'id', width: 10 },
                        { header: 'PO', key: 'po', width: 10 },
                        { header: 'IMPORT_DATE', key: 'import_date', width: 30 },
                        { header: 'VENDOR', key: 'vendor', width: 30 },
                        { header: 'RECEIVER', key: 'receiver', width: 10 },
                        { header: 'DELIVERER', key: 'deliverer', width: 10 },
                        { header: 'PART CODE', key: 'part_code', width: 20 },
                        { header: 'PART NAME', key: 'part_name', width: 10 },
                        { header: 'UNIT', key: 'unit', width: 20 },
                        { header: 'PO QUANTITY', key: 'qty_po', width: 20 },
                        { header: 'REAL IMPORT QUANTITY', key: 'qty_real', width: 20 },
                        { header: 'LOCATION', key: 'location', width: 20 }
                    ];
                }

                if (downloadType == 1) {
                    worksheet.columns = [
                        { header: 'CODE', key: 'part_code', width: 10 },
                        { header: 'NAME', key: 'part_name', width: 20 },
                        { header: 'PRICE', key: 'price', width: 10 },
                        { header: 'REQUEST QTY', key: 'total', width: 10 },
                        { header: 'OUTCOMING QTY', key: 'total_import', width: 10 },
                        { header: 'TOTAL MONEY', key: 'money', width: 20 }
                    ];
                    filename = "templates/import_request_cost.xlsx";
                }

                if (downloadType == 2) {
                    worksheet.columns = [
                        { header: 'SỐ PHIẾU', key: '', width: 20 },
                        { header: 'NGÀY NHẬP', key: 'import_date', width: 10 },
                        { header: 'VENDOR', key: 'vendor', width: 10 },
                        { header: 'INV', key: '', width: 10 },
                        { header: 'SỐ PO', key: 'po', width: 20 },
                        { header: 'SỐ HỆ THỐNG', key: '', width: 20 },
                        { header: 'CODE', key: 'part_code', width: 20 },
                        { header: 'MÔ TẢ', key: 'part_name', width: 20 },
                        { header: 'SỐ LƯỢNG', key: 'qty_real', width: 20 },
                        { header: 'ID', key: 'vendor_code', width: 20 },
                        { header: 'VỊ TRÍ', key: 'location', width: 20 },
                        { header: 'GHI CHÚ', key: '', width: 20 }
                    ];
                    filename = "templates/import_request_warehouse.xlsx";
                }

                // Add Array Rows
                worksheet.addRows(jsonMachine);
                worksheet.getColumn(5).alignment = { vertical: 'middle', wrapText: true };

                // Write to File
                workbook.xlsx.writeFile(filename).then(function () {
                    res.download(filename);
                });
            }
        });

    } catch (error) {
        logHelper.writeLog("innovation.downloadImportRequest", error);
    }
}

// #endregion