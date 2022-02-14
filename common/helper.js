var nodemailer = require('nodemailer');
const logHelper = require('../common/log');
const config = require('../config');
const excel = require('exceljs');
const transporter = nodemailer.createTransport({
    host: config.mailHost, // Host
    port: config.mailPort, // Port 
    secure: false,
});

var helper = {};

// #region DateTime
// ĐỊnh dạng theo format VIệt Nam dd/mm/yyyy
helper.getDateTimeNow = function () {
    let date = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    let time = new Date().toLocaleTimeString("vi-VN");
    return date + " " + time;
}

// ĐỊnh dạng theo format mm/dd/yyyy
helper.getDateTimeNowMMDDYYHHMMSS = function () {
    let date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    let time = new Date().toLocaleTimeString("vi-VN");
    return date + " " + time;
}

helper.getDateOfWeek = function (week) {
    var year = new Date().getFullYear();
    var d = new Date("Jan 01, " + year + " 01:00:00");
    var dayMs = (24 * 60 * 60 * 1000);
    var offSetTimeStart = dayMs * d.getDay();
    var w = d.getTime() + 604800000 * week - offSetTimeStart; //reducing the offset here
    var n1 = new Date(w);
    var n2 = new Date(w + 518400000);
    return {
        dateFrom: new Date(n1.formatDateMMDDYYYY()),
        dateTo: new Date(n2.formatDateMMDDYYYY())
    }
}

Date.prototype.getWeekNumber = function () {
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.formatDateDDMMYYYY = function () {
    let date = this.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return date;
}

Date.prototype.formatDateMMDDYYYY = function () {
    var dd = String(this.getDate()).padStart(2, '0');
    var mm = String(this.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = this.getFullYear();

    return mm + '/' + dd + '/' + yyyy;
}
// #endregion

helper.round = (x, n = 2) => {
    const precision = Math.pow(10, n)
    return Math.round((x + Number.EPSILON) * precision) / precision;
}

// #region Mail
helper.sendMailSystem = function (subject, to, cc, body) {
    let signature = "<br/><br/><br/><br/>------------------------------------------------<br/>";
    signature += "Welcome to HYC Application Center<br/> Contact Dev: Tuyen.Nguyen@hanes.com";
    body = body + signature;

    let mailOptions = {
        from: config.mailSystem,
        to: to,
        cc: cc,
        subject: subject,
        html: body
    };

    /* send mail with defined transport object */
    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logHelper.writeLog("helper.sendMailSystem", error);
                return false;
            }
            return true;
        });
    } catch (error) {
        logHelper.writeLog("exeption helper.sendMailSystem", error);
        return false;
    }
}

helper.sendMail = function (subject, from, to, cc, body) {
    let signature = "<br/><br/><br/><br/>------------------------------------------------<br/>";
    signature += "Welcome to HYC Application Center<br/> Contact Dev: Tuyen.Nguyen@hanes.com";
    body = body + signature;

    let mailOptions = {
        from: from,
        to: to,
        cc: cc,
        subject: subject,
        html: body
    };

    /* send mail with defined transport object */
    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logHelper.writeLog("helper.sendMail", error);
                return false;
            }
            return true;
        });
    } catch (error) {
        logHelper.writeLog("exeption helper.sendMail", error);
        return false;
    }
}

// #endregion

// #region Excel
helper.getDataFromExcel = async function (fileName, sheet, rowHeader) {
    let arr = [];
    let workbook = new excel.Workbook(); //creating workbook
    await workbook.xlsx.readFile(fileName, {
        "options": {
            "filter": true
        }
    })
        .then(function () {
            let worksheet = workbook.getWorksheet(parseInt(sheet));
            worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
                if (rowNumber > parseInt(rowHeader)) {
                    let tempArr = [];
                    row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                        // let ele = cell.value;
                        // if (ele && ele != null & ele.formula != undefined) {
                        //     tempArr.push(ele.result);
                        // }
                        // else {
                        //     tempArr.push(ele);
                        // }

                        tempArr.push(cell.text);
                    });

                    arr.push(tempArr);
                }
            });
        });

    return arr;
}

helper.getListSheetFromExcel = async function (fileName) {
    let arr = [];
    let workbook = new excel.Workbook(); //creating workbook

    await workbook.xlsx.readFile(fileName, {
        "options": {
            "filter": true
        }
    })
        .then(function () {
            workbook.worksheets.forEach((ele) => {
                arr.push({
                    id: ele.id,
                    sheetname: ele.name
                });
            })
        });

    return arr;
}

// #endregion

// #region String
helper.stringToSlug = function(str) {
	// remove accents
	var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
		to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
	for (var i = 0, l = from.length; i < l; i++) {
		str = str.replace(RegExp(from[i], "gi"), to[i]);
	}

	// str = str.toLowerCase()
	// 	  .trim()
	// 	  .replace(/[^a-z0-9\-]/g, '-')
	// 	  .replace(/-+/g, '-');
	str = str.toLowerCase()
		.trim()

	return str;
}

// #endregion

// #region Array
// get all duplicate property of objects in an array
helper.getDuplicatePropertyArray = function(arr, property) {
	const lookup = arr.reduce((a, e) => {
		a[e[property]] = ++a[e[property]] || 0;
		return a;
	}, {});

	return arr.filter(e => lookup[e[property]]);
}

/*
	Distinct duplicate object in array
	Ex: unique(array, ['class', 'fare'])
*/
helper.unique = function(arr, keyProps) {
	const kvArray = arr.map(entry => {
		const key = keyProps.map(k => entry[k]).join('|');
		return [key, entry];
	});
	const map = new Map(kvArray);
	return Array.from(map.values());
}

/*
	Sorting object in array by key
	Ex: sortArrayByKey(array, "key", true)
*/
helper.sortArrayByKey = function(listData, key, ascending) {
    if(ascending == true)
        return listData.sort((a, b) => (a[key] > b[key]) ? -1 : 1)
    return listData.sort((a, b) => (a[key] > b[key]) ? 1 : -1)
}

// #endregion

module.exports = helper;