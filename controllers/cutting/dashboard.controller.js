const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');

// database
var Database = require("../../database/db_cutting.js")
const db = new Database();

// service
const cuttingService = require("../../services/Cutting/cutting.service");

// model 
const CuttingMachineData = require('../../models/cutting/cutting.model')

// Machine
module.exports.getIndex = function (req, res) {
    res.render('Cutting/Dashboard/Dashboard');
}

module.exports.getMachines = async function (req, res) {
    let result = await cuttingService.getMachines();
    return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: result }));
}

module.exports.getStackBarMachineData = async function (req, res) {
    try {
        let listMachines = await cuttingService.getMachines();

        let filterWorkCenter = req.body.workCenter;
        let filterDate = req.body.filterDate;
        let filterMachine = req.body.filterMachine;
        let filterShift = req.body.filterShift;
        let filterWeek = req.body.filterWeek;
        let filterWeekEndValue = req.body.filterWeekEndValue;
        let filterViewType = JSON.parse(req.body.viewType);

        if (filterViewType && !isNaN(parseInt(filterWeekEndValue))) { // Khung nhìn theo nhiều tuần
            let listWeek = [];
            for (let i = filterWeek; i <= filterWeekEndValue; i++) {
                listWeek.push(parseInt(i));
            }

            let stackBarChartData92 = {
                data1: listWeek, // labels
                data2: {}
            };
            
            let labels = [];
            if (filterMachine == "") {
                labels = listMachines.filter(function (ele) {
                    return ele.group == filterWorkCenter;
                })
            }
            else {
                for (var i = 0; i < filterMachine.length; i++) {
                    let machine = filterMachine[i];
                    let tempMachine = listMachines.filter(function (ele) {
                        return ele.code == machine;
                    })
                    labels.push(tempMachine);
                }
            }
            labels = labels.flat();

            let newListMachines = [];
            for (let k = 0; k < listWeek.length; k++) {
                let listMachinesInWeek = [];
                let eleWeek = listWeek[k];
                let objDate = helper.getDateOfWeek(eleWeek);
                objDate.dateFrom = new Date(objDate.dateFrom);
                filterDate = `${objDate.dateFrom.formatDateDDMMYYYY()};${objDate.dateFrom.addDays(1).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(2).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(3).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(4).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(5).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(6).formatDateDDMMYYYY()}`;
                let listDate = filterDate.split(';');

                for (let i = 0; i < listDate.length; i++) {
                    let eleDate = listDate[i];
                    for (let j = 0; j < labels.length; j++) {
                        let objLabel = labels[j];
                        let machine = new CuttingMachineData(objLabel.code, objLabel.position);

                        let query = `CALL USP_Cutting_Net_Time_92 ('${eleDate}', '${objLabel.code}', '${constant.WorkCenter.Cutting92}', '${filterShift}')`;
                        let result92 = await db.excuteQueryAsync(query);
                        // Tính lại idle_time
                        if(result92[0]){
                            for (let j = 1; j < result92[0].length; j++) {
                                result92[0][j].idle_time = Math.abs(result92[0][j].start_time - result92[0][j - 1].end_time) / (1000 * 60);
                            }
                        }

                        query = `CALL USP_Cutting_Net_Time_92 ('${eleDate}', '${objLabel.code}', '${constant.WorkCenter.Cutting95}', '${filterShift}')`;
                        let result95 = await db.excuteQueryAsync(query);
                        // Tính lại idle_time
                        if(result95[0]){
                            for (let j = 1; j < result95[0].length; j++) {
                                result95[0][j].gap_time = Math.abs(result95[0][j].start_time - result95[0][j - 1].end_time) / (1000 * 60);
                            }
                        }

                        // order to find the first record of each machine in order to update idle time for the first record of day
                        result92 = result92[0].sort((x, y) => x.machine_code - y.machine_code);
                        for (let i = 0; i < labels.length; i++) {
                            let ele = labels[i];
                            let tempListMachine = result92.filter((x) => x.machine_code == ele.code);
                            if (tempListMachine.length > 0) {
                                reCalculateIdleTimeFirstRecord(tempListMachine[0], filterShift, false);
                            }
                        }

                        result95 = result95[0] === undefined ? [] : result95[0];
                        result95 = result95.sort((x, y) => x.machine_code - y.machine_code);
                        for (let i = 0; i < labels.length; i++) {
                            let ele = labels[i];
                            let tempListMachine = result95.filter((x) => x.machine_code == ele.code);
                            if (tempListMachine.length > 0) {
                                reCalculateIdleTimeFirstRecord(tempListMachine[0], filterShift, true);                  
                            }
                        }

                        for (let k = 0; k < result92.length; k++) {
                            let ele = result92[k];
                            if (ele["machine_code"] == objLabel.code)
                                sumData92(machine, ele);
                        }

                        for (let h = 0; h < result95.length; h++) {
                            let ele = result95[h];
                            if (ele["machine_code"] == objLabel.code)
                                sumData95(machine, ele);
                        }
                        machine.calculate();
                        listMachinesInWeek.push(machine);
                    }
                }
                newListMachines.push(listMachinesInWeek);
            }
            stackBarChartData92.data2 = {
                listMachines: newListMachines
            }
            returnData = {
                stackBarChartData: { data1: stackBarChartData92.data1, data2: stackBarChartData92.data2}
            }
        }
        else { // Khung nhìn theo 1 ngày và 1 tuần
            let listDate = filterDate.split(';');
            if (listDate.length > 1) { // Week
                let listStackBarChartData92 = [];
                let listLabel = [];

                let labels = [];
                if (filterMachine == "") {
                    labels = listMachines.filter(function (ele) {
                        return ele.group == filterWorkCenter;
                    })
                }
                else {
                    for (var i = 0; i < filterMachine.length; i++) {
                        let machine = filterMachine[i];
                        let tempMachine = listMachines.filter(function (ele) {
                            return ele.code == machine;
                        })
                        labels.push(tempMachine);
                    }
                }

                labels = labels.flat();
                for (let i = 0; i < labels.length; i++) {
                    for (let j = 0; j < listDate.length; j++) {
                        listLabel.push(`${listDate[j]};${labels[i].name};${j}`);
                    }
                }

                for (let i = 0; i < listDate.length; i++) {
                    let eleDate = listDate[i];
                    let stackBarChartData92 = {
                        data1: labels, // labels
                        data2: {}
                    };

                    newListMachines = [];
                    for (let j = 0; j < labels.length; j++) {
                        let objLabel = labels[j];
                        let machine = new CuttingMachineData(objLabel.code, objLabel.position);

                        let query = `CALL USP_Cutting_Net_Time_92 ('${eleDate}', '${objLabel.code}', '${constant.WorkCenter.Cutting92}', '${filterShift}')`;
                        let result92 = await db.excuteQueryAsync(query);
                        // Tính lại idle_time
                        if(result92[0]){
                            for (let j = 1; j < result92[0].length; j++) {
                                result92[0][j].idle_time = Math.abs(result92[0][j].start_time - result92[0][j - 1].end_time) / (1000 * 60);
                            }
                        }

                        query = `CALL USP_Cutting_Net_Time_92 ('${eleDate}', '${objLabel.code}', '${constant.WorkCenter.Cutting95}', '${filterShift}')`;
                        let result95 = await db.excuteQueryAsync(query);
                        // Tính lại idle_time
                        if(result95[0]){
                            for (let j = 1; j < result95[0].length; j++) {
                                // Loại bỏ trường hợp bất thường, thời gian kết thúc các bản ghi giống nhau
                                if(result95[0][j + 1] && result95[0][j].end_time.toString() != result95[0][j + 1].end_time.toString()){
                                    result95[0][j].gap_time = Math.abs(result95[0][j].start_time - result95[0][j - 1].end_time) / (1000 * 60);
                                }
                            }
                        }

                        // order to find the first record of each machine in order to update idle time for the first record of day
                        result92 = result92[0].sort((x, y) => x.machine_code - y.machine_code);
                        for (let i = 0; i < labels.length; i++) {
                            let ele = labels[i];
                            let tempListMachine = result92.filter((x) => x.machine_code == ele.code);
                            if (tempListMachine.length > 0) {
                                reCalculateIdleTimeFirstRecord(tempListMachine[0], filterShift, false);
                            }
                        }

                        result95 = result95[0] === undefined ? [] : result95[0];
                        result95 = result95.sort((x, y) => x.machine_code - y.machine_code);
                        for (let i = 0; i < labels.length; i++) {
                            let ele = labels[i];
                            let tempListMachine = result95.filter((x) => x.machine_code == ele.code);
                            if (tempListMachine.length > 0) {
                                reCalculateIdleTimeFirstRecord(tempListMachine[0], filterShift, true);
                            }
                        }

                        for (let k = 0; k < result92.length; k++) {
                            let ele = result92[k];
                            if (ele["machine_code"] == objLabel.code)
                                sumData92(machine, ele);
                        }

                        for (let h = 0; h < result95.length; h++) {
                            let ele = result95[h];
                            if (ele["machine_code"] == objLabel.code)
                                sumData95(machine, ele);
                        }
                        machine.calculate();
                        newListMachines.push(machine);
                    }

                    stackBarChartData92.data2 = {
                        listMachines: newListMachines
                    }

                    listStackBarChartData92.push(stackBarChartData92);
                }

                returnData = {
                    stackBarChartData: { data1: listLabel, data2: listStackBarChartData92, listDate: listDate, listMachine: labels },
                }
            }
            else { // Date
                // Bên 92 có 2 máy có cấu trúc dữ liệu giống bên 92 do đó phải query cả bảng Cutting_92 để lấy dữ liệu cho Cutting 95
                let result92 = [];
                let result95 = [];
                let labels = [];

                if (filterMachine == "") {
                    labels = listMachines.filter(function (ele) {
                        return ele.group == filterWorkCenter;
                    })
                }
                else {
                    for (var i = 0; i < filterMachine.length; i++) {
                        let machine = filterMachine[i];
                        let machineObj = listMachines.filter(function (ele) {
                            return ele.code == machine;
                        })
                        labels.push(machineObj[0]);
                    }
                }

                for (var i = 0; i < labels.length; i++) {
                    let machine = labels[i];

                    let query = `CALL USP_Cutting_Net_Time_92 ('${filterDate}', '${machine.code}', '${constant.WorkCenter.Cutting92}', '${filterShift}')`;
                    let tempResult = await db.excuteQueryAsync(query);
                    // Tính lại idle_time
                    if(tempResult){
                        let tempData = tempResult[0];
                        for (let j = 1; j < tempData.length; j++) {
                            tempData[j].idle_time = Math.abs(tempData[j].start_time - tempData[j - 1].end_time) / (1000 * 60);
                        }
                        result92.push(tempData);
                    }

                    query = `CALL USP_Cutting_Net_Time_92 ('${filterDate}', '${machine.code}', '${constant.WorkCenter.Cutting95}', '${filterShift}')`;
                    tempResult = await db.excuteQueryAsync(query);
                    // Tính lại idle_time
                    if(tempResult[0] !== undefined){
                        let tempData = tempResult[0];
                        for (let j = 1; j < tempData.length; j++) {
                            // Loại bỏ trường hợp bất thường, thời gian kết thúc các bản ghi giống nhau
                            if(tempData[j + 1] && tempData[j].end_time.toString() != tempData[j + 1].end_time.toString()){
                                tempData[j].gap_time = Math.abs(tempData[j].start_time - tempData[j - 1].end_time) / (1000 * 60);
                            }
                        }
                        result95.push(tempData);
                    }
                }

                labels = labels.flat();
                let stackBarChartData92 = {
                    data1: labels, // labels
                    data2: {}
                };

                // order to find the first record of each machine in order to update idle time for the first record of day
                result92 = result92.flat().sort((x, y) => x.machine_code - y.machine_code);
                for (let i = 0; i < labels.length; i++) {
                    let ele = labels[i];
                    let tempListMachine = result92.filter((x) => x.machine_code == ele.code);
                    if (tempListMachine.length > 0) {                  
                        reCalculateIdleTimeFirstRecord(tempListMachine[0], filterShift, false);
                    }
                }

                result95 = result95.flat().sort((x, y) => x.machine_code - y.machine_code);
                for (let i = 0; i < labels.length; i++) {
                    let ele = labels[i];
                    let tempListMachine = result95.filter((x) => x.machine_code == ele.code);
                    if (tempListMachine.length > 0) {
                        reCalculateIdleTimeFirstRecord(tempListMachine[0], filterShift, true);
                    }
                }

                listMachines = [];
                for (let i = 0; i < labels.length; i++) {
                    const objLabel = labels[i];
                    let machine = new CuttingMachineData(objLabel.code, objLabel.position);

                    for (let i = 0; i < result92.length; i++) {
                        let ele = result92[i];
                        if (ele["machine_code"] == objLabel.code)
                            sumData92(machine, ele);
                    }

                    for (let i = 0; i < result95.length; i++) {
                        let ele = result95[i];
                        if (ele["machine_code"] == objLabel.code)
                            sumData95(machine, ele);
                    }
                    machine.calculate();
                    listMachines.push(machine);
                }

                stackBarChartData92.data2 = {
                    listMachines: listMachines
                }

                returnData = {
                    // {label of chart, data of chart, all records, machine list }
                    stackBarChartData: { data1: stackBarChartData92.data1, data2: stackBarChartData92.data2, data3: result95, data4: labels }
                }
            }
        }

        return res.end(JSON.stringify({ rs: true, msg: "Thành công", data: returnData }));
    } catch (error) {
        logHelper.writeLog("cutting.getStackBarMachineData", error);
        return res.end(JSON.stringify({ rs: false, msg: error.message}));
    }
}

function reCalculateIdleTimeFirstRecord(inputObj, shift, isParagon){
    let idleTime = 0;
    if(shift ==  'b_shift')
        idleTime = Math.abs(new Date(inputObj.start_time.toDateString() + " 14:00:00") - inputObj.start_time) / (1000 * 60);
    else if(shift ==  'c_shift')
        idleTime = Math.abs(new Date(inputObj.start_time.toDateString() + " 22:00:00") - inputObj.start_time) / (1000 * 60);     
    else if(shift ==  'a_shift')
        idleTime = Math.abs(new Date(inputObj.start_time.toDateString() + " 06:00:00") - inputObj.start_time) / (1000 * 60); 
    else
        idleTime = checkShift(inputObj);

    if(isParagon)
        inputObj.gap_time = idleTime;
    else 
        inputObj.idle_time = idleTime;
}

function checkShift(inputObj){
    let time = inputObj.start_time.toTimeString();
    let idleTime = 0;

    if(time >= "06:00:00" && time < "14:00:00")
        idleTime = Math.abs(new Date(inputObj.start_time.toDateString() + " 06:00:00") - inputObj.start_time) / (1000 * 60);
    else if(time >= "14:00:00" && time < "22:00:00")
        idleTime = Math.abs(new Date(inputObj.start_time.toDateString() + " 14:00:00") - inputObj.start_time) / (1000 * 60);
    else 
        idleTime = Math.abs(new Date(inputObj.start_time.toDateString() + " 22:00:00") - inputObj.start_time) / (1000 * 60);

    return idleTime;
}

module.exports.downloadMachineDataReport = async function (req, res) {
    try {
        //parameters
        let workCenter = req.body.workCenter;
        let machine = req.body.machine;
        let fromDate = req.body.fromDate;
        let toDate = req.body.toDate;

        let workbook = new excel.Workbook(); //creating workbook
        if (workCenter == constant.WorkCenter.Cutting92) {
            let query = `CALL USP_Cutting_Machine_Data_Get_92('${constant.WorkCenter.Cutting95}', '${machine}', '${fromDate}', '${toDate}')`;
            let result95 = await db.excuteQueryAsync(query);
            let jsonMachineData = JSON.parse(JSON.stringify(result95[0]));
            jsonMachineData.forEach(ele => {
                ele.start_time = new Date(ele.start_time).toLocaleString();
                ele.end_time = new Date(ele.end_time).toLocaleString();
            });
            let worksheet = workbook.addWorksheet('Paragon'); //creating worksheet
            //  WorkSheet Header
            worksheet.columns = [
                { header: 'Machine', key: 'machine_code', width: 30 },
                { header: 'Job Name', key: 'job_name', width: 10 },
                { header: 'Start Time', key: 'start_time', width: 30 },
                { header: 'End Time', key: 'end_time', width: 30 },
                { header: 'Total Automatic Time (Minutes)', key: 'total_automatic_time', width: 30 },
                { header: 'Total Manual Time (Minutes)', key: 'total_manual_time', width: 30 },
                { header: 'Gap Time (Minutes)', key: 'gap_time', width: 30 },
                { header: 'Parts Completed', key: 'parts_completed', width: 30 },
                { header: 'Total Units', key: 'total_units', width: 30 },
                { header: 'Length (Meters)', key: 'length', width: 30 },
                { header: 'Material', key: 'material', width: 30 },
                { header: 'Number Recut Parts', key: 'number_recut_parts', width: 30 },
                { header: 'Operator', key: 'operator', width: 30 },
                { header: 'Processing Distance (Meters)', key: 'processing_distance', width: 30 },
                { header: 'Processing Time (Minutes)', key: 'processing_time', width: 30 },
                { header: 'Job Throughput (Inches / min)', key: 'job_throughput', width: 30 },
                { header: 'Scale X (Percent)', key: 'scale_x', width: 30 },
                { header: 'Scale Y (Percent)', key: 'scale_y', width: 30 },
                { header: 'Shift', key: 'shift', width: 30 },
                { header: 'Width (Meters)', key: 'width', width: 30 },
                { header: 'Material Length Used (Meters)', key: 'material_length_used', width: 30 },
                { header: 'Material Width (Meters)', key: 'material_width', width: 30 },
                { header: 'Total Error Time (Minutes)', key: 'total_error_time', width: 30 },
                { header: 'Total No Servos Time (Minutes)', key: 'total_no_servos_time', width: 30 },
                { header: 'Warning Count', key: 'warning_count', width: 30 },
                { header: 'Error Count', key: 'error_count', width: 30 },
                { header: 'Holder 1 Average Down Speed (Inches / min)', key: 'holder_1_average_down_speed', width: 30 },
                { header: 'Holder 1 Cycle Count', key: 'holder_1_cycle_count', width: 30 },
                { header: 'Holder 1 Down Distance (Meters)', key: 'holder_1_down_distance', width: 30 },
                { header: 'Holder 1 Down Time (Minutes)', key: 'holder_1_down_time', width: 30 },
                { header: 'Holder 1 Lift Time (Minutes)', key: 'holder_1_lift_time', width: 30 },
                { header: 'Holder 1 Maximum Down Speed (Inches / min)', key: 'holder_1_maximum_down_speed', width: 30 },
                { header: 'Holder 1 Plunge Time (Minutes)', key: 'holder_1_plunge_Time', width: 30 },
                { header: 'Holder 1 Up Distance (Meters)', key: 'holder_1_up_distance', width: 30 },
                { header: 'Holder 1 Up Time (Minutes)', key: 'holder_1_up_time', width: 30 },
                { header: 'Biting Distance (Meters)', key: 'biting_distance', width: 30 },
                { header: 'Bites', key: 'bites', width: 30 },
                { header: 'Biting Time (Minutes)', key: 'biting_time', width: 30 }
            ];
            worksheet.addRows(jsonMachineData);

            query = `CALL USP_Cutting_Machine_Data_Get_92 ('${constant.WorkCenter.Cutting92}', '${machine}', '${fromDate}', '${toDate}')`;
            let result92 = await db.excuteQueryAsync(query);
            jsonMachineData = JSON.parse(JSON.stringify(result92[0]));
            jsonMachineData.forEach(ele => {
                ele.start_time = new Date(ele.start_time).toLocaleString();
                ele.end_time = new Date(ele.end_time).toLocaleString();
            });
            worksheet = workbook.addWorksheet('XLC, S91'); //creating worksheet
            worksheet.columns = [
                { header: 'Machine', key: 'machine_code', width: 30 },
                { header: 'Cutfile Name', key: 'cut_file_name', width: 10 },
                { header: 'Start Time', key: 'start_time', width: 30 },
                { header: 'End Time', key: 'end_time', width: 30 },
                { header: 'Total Time', key: 'total_time', width: 30 },
                { header: 'Status', key: 'status', width: 30 },
                { header: 'Configuration', key: 'configuration', width: 30 },
                { header: 'Pieces Cut', key: 'pieces_cut', width: 30 },
                { header: 'Bites Cut', key: 'bites_cut', width: 30 },
                { header: 'Scale X', key: 'scale_x', width: 30 },
                { header: 'Scale Y', key: 'scale_y', width: 30 },
                { header: 'Cutfile Path', key: 'cutfile_path', width: 30 },
                { header: 'Ply Count', key: 'ply_count', width: 30 },
                { header: 'Cut Time (Minutes)', key: 'cut_time', width: 30 },
                { header: 'Dry Haul Time (Minutes)', key: 'dry_haul_time', width: 30 },
                { header: 'Sharpen Time (Minutes)', key: 'sharpen_time', width: 30 },
                { header: 'Bite Time (Minutes)', key: 'bite_time', width: 30 },
                { header: 'Interrupt Time (Minutes)', key: 'interrupt_time', width: 30 },
                { header: 'Processing Time (Minutes)', key: 'processing_time', width: 30 },
                { header: 'Idle Time (Minutes)', key: 'idle_time', width: 30 },
                { header: 'Dry Run Time (Minutes)', key: 'dry_run_time', width: 30 },
                { header: 'Cut Distance (Inches)', key: 'cut_distance', width: 30 },
                { header: 'Dry Haul Distance (Inches)', key: 'dry_haul_distance', width: 30 },
                { header: 'Dry Run Distance (Inches)', key: 'dry_run_distance', width: 30 },
                { header: 'Cut Speed Average (Inches/Min)', key: 'cut_speed_average', width: 30 },
                { header: 'Throughput Average (Inches/Min)', key: 'throughput_average', width: 30 },
                { header: 'Feed Rate Average (Inches/Min)', key: 'feed_rate_average', width: 30 },
                { header: 'Operator', key: 'operator', width: 30 },
                { header: 'Shift', key: 'shift', width: 30 }
            ];
            // Add Array Rows
            worksheet.addRows(jsonMachineData);
        }
        else {
            let query = `CALL USP_Cutting_Machine_Data_Get_95 ('${constant.WorkCenter.Cutting95}', '${machine}', '${fromDate}', '${toDate}')`;
            let result95 = await db.excuteQueryAsync(query);
            let jsonMachineData = JSON.parse(JSON.stringify(result95[0]));
            jsonMachineData.forEach(ele => {
                ele.start_time = new Date(ele.start_time).toLocaleString();
                ele.end_time = new Date(ele.end_time).toLocaleString();
            });
            let worksheet = workbook.addWorksheet('Paragon'); //creating worksheet
            //  WorkSheet Header
            worksheet.columns = [
                { header: 'Machine', key: 'machine_code', width: 30 },
                { header: 'Job Name', key: 'job_name', width: 10 },
                { header: 'Start Time', key: 'start_time', width: 30 },
                { header: 'End Time', key: 'end_time', width: 30 },
                { header: 'Total Automatic Time (Minutes)', key: 'total_automatic_time', width: 30 },
                { header: 'Total Manual Time (Minutes)', key: 'total_manual_time', width: 30 },
                { header: 'Gap Time (Minutes)', key: 'gap_time', width: 30 },
                { header: 'Parts Completed', key: 'parts_completed', width: 30 },
                { header: 'Total Units', key: 'total_units', width: 30 },
                { header: 'Length (Meters)', key: 'length', width: 30 },
                { header: 'Material', key: 'material', width: 30 },
                { header: 'Number Recut Parts', key: 'number_recut_parts', width: 30 },
                { header: 'Operator', key: 'operator', width: 30 },
                { header: 'Processing Distance (Meters)', key: 'processing_distance', width: 30 },
                { header: 'Processing Time (Minutes)', key: 'processing_time', width: 30 },
                { header: 'Job Throughput (Inches / min)', key: 'job_throughput', width: 30 },
                { header: 'Scale X (Percent)', key: 'scale_x', width: 30 },
                { header: 'Scale Y (Percent)', key: 'scale_y', width: 30 },
                { header: 'Shift', key: 'shift', width: 30 },
                { header: 'Width (Meters)', key: 'width', width: 30 },
                { header: 'Material Length Used (Meters)', key: 'material_length_used', width: 30 },
                { header: 'Material Width (Meters)', key: 'material_width', width: 30 },
                { header: 'Total Error Time (Minutes)', key: 'total_error_time', width: 30 },
                { header: 'Total No Servos Time (Minutes)', key: 'total_no_servos_time', width: 30 },
                { header: 'Warning Count', key: 'warning_count', width: 30 },
                { header: 'Error Count', key: 'error_count', width: 30 },
                { header: 'Holder 1 Average Down Speed (Inches / min)', key: 'holder_1_average_down_speed', width: 30 },
                { header: 'Holder 1 Cycle Count', key: 'holder_1_cycle_count', width: 30 },
                { header: 'Holder 1 Down Distance (Meters)', key: 'holder_1_down_distance', width: 30 },
                { header: 'Holder 1 Down Time (Minutes)', key: 'holder_1_down_time', width: 30 },
                { header: 'Holder 1 Lift Time (Minutes)', key: 'holder_1_lift_time', width: 30 },
                { header: 'Holder 1 Maximum Down Speed (Inches / min)', key: 'holder_1_maximum_down_speed', width: 30 },
                { header: 'Holder 1 Plunge Time (Minutes)', key: 'holder_1_plunge_Time', width: 30 },
                { header: 'Holder 1 Up Distance (Meters)', key: 'holder_1_up_distance', width: 30 },
                { header: 'Holder 1 Up Time (Minutes)', key: 'holder_1_up_time', width: 30 },
                { header: 'Biting Distance (Meters)', key: 'biting_distance', width: 30 },
                { header: 'Bites', key: 'bites', width: 30 },
                { header: 'Biting Time (Minutes)', key: 'biting_time', width: 30 }
            ];
            worksheet.addRows(jsonMachineData);

            query = `CALL USP_Cutting_Machine_Data_Get_95 ('${constant.WorkCenter.Cutting92}', '${machine}', '${fromDate}', '${toDate}')`;
            let result92 = await db.excuteQueryAsync(query);
            jsonMachineData = JSON.parse(JSON.stringify(result92[0]));
            jsonMachineData.forEach(ele => {
                ele.start_time = new Date(ele.start_time).toLocaleString();
                ele.end_time = new Date(ele.end_time).toLocaleString();
            });
            worksheet = workbook.addWorksheet('XLC, S91'); //creating worksheet
            worksheet.columns = [
                { header: 'Machine', key: 'machine_code', width: 30 },
                { header: 'Cutfile Name', key: 'cut_file_name', width: 10 },
                { header: 'Start Time', key: 'start_time', width: 30 },
                { header: 'End Time', key: 'end_time', width: 30 },
                { header: 'Total Time', key: 'total_time', width: 30 },
                { header: 'Status', key: 'status', width: 30 },
                { header: 'Configuration', key: 'configuration', width: 30 },
                { header: 'Pieces Cut', key: 'pieces_cut', width: 30 },
                { header: 'Bites Cut', key: 'bites_cut', width: 30 },
                { header: 'Scale X', key: 'scale_x', width: 30 },
                { header: 'Scale Y', key: 'scale_y', width: 30 },
                { header: 'Cutfile Path', key: 'cutfile_path', width: 30 },
                { header: 'Ply Count', key: 'ply_count', width: 30 },
                { header: 'Cut Time (Minutes)', key: 'cut_time', width: 30 },
                { header: 'Dry Haul Time (Minutes)', key: 'dry_haul_time', width: 30 },
                { header: 'Sharpen Time (Minutes)', key: 'sharpen_time', width: 30 },
                { header: 'Bite Time (Minutes)', key: 'bite_time', width: 30 },
                { header: 'Interrupt Time (Minutes)', key: 'interrupt_time', width: 30 },
                { header: 'Processing Time (Minutes)', key: 'processing_time', width: 30 },
                { header: 'Idle Time (Minutes)', key: 'idle_time', width: 30 },
                { header: 'Dry Run Time (Minutes)', key: 'dry_run_time', width: 30 },
                { header: 'Cut Distance (Inches)', key: 'cut_distance', width: 30 },
                { header: 'Dry Haul Distance (Inches)', key: 'dry_haul_distance', width: 30 },
                { header: 'Dry Run Distance (Inches)', key: 'dry_run_distance', width: 30 },
                { header: 'Cut Speed Average (Inches/Min)', key: 'cut_speed_average', width: 30 },
                { header: 'Throughput Average (Inches/Min)', key: 'throughput_average', width: 30 },
                { header: 'Feed Rate Average (Inches/Min)', key: 'feed_rate_average', width: 30 },
                { header: 'Operator', key: 'operator', width: 30 }
            ];
            // Add Array Rows
            worksheet.addRows(jsonMachineData);
        }

        // Write to File
        let filename = "templates/cutting_machine_data.xlsx";
        workbook.xlsx.writeFile(filename).then(function () {
            res.download(filename);
        });
    }
    catch (error) {
        logHelper.writeLog("cutting.downloadMachineData", error);
        return res.end(JSON.stringify({ rs: false, msg: error.message}));
    }
}

function sumData92(machine, ele) {
    let cutTime = parseFloat(ele['cut_time']);
    let dryHaulTime = parseFloat(ele['dry_haul_time']);
    let dryRunTime = parseFloat(ele['dry_run_time']);
    let processingTime = parseFloat(ele['processing_time']);
    let biteTime = parseFloat(ele['bite_time']);
    let interruptTime = parseFloat(ele['interrupt_time']);
    let sharpenTime = parseFloat(ele['sharpen_time']);
    let idleTime = parseFloat(ele['idle_time']);

    let cutSpeed =  parseFloat(ele['cut_speed_average']);
    let cutFilename =  ele['cut_file_name'];
    let startTime =  ele['start_time'];
    let endTime =  ele['end_time'];


    machine.totalTime += cutTime + dryHaulTime + dryRunTime + processingTime + biteTime + interruptTime + sharpenTime + idleTime;
    machine.cutTime += cutTime;
    machine.dryHaulTime += dryHaulTime;
    machine.dryRunTime += dryRunTime;
    machine.processingTime += processingTime;
    machine.biteTime += biteTime;
    machine.interruptTime += interruptTime;
    machine.sharpenTime += sharpenTime;
    machine.idleTime += idleTime;

    machine.cutSpeed += cutSpeed;
    machine.cutFilenameList.push({cutFilename: cutFilename, startTime: startTime, endTime: endTime});
}

function sumData95(machine, ele) {
    let cutTime = parseFloat(ele['holder_1_down_time']);
    let dryHaulTime = parseFloat(ele['holder_1_up_time']);
    let interruptTime = parseFloat(ele['total_manual_time']);
    let idleTime = parseFloat(ele['gap_time']);

    let processingTime = parseFloat(ele['processing_time']);
    let erorrTime = parseFloat(ele['total_error_time']);
    let noServosTime = parseFloat(ele['total_no_servos_time']);

    let cutSpeed =  parseFloat(ele['holder_1_average_down_speed']);
    let cutFilename =  ele['job_name'];
    let startTime =  ele['start_time'];
    let endTime =  ele['end_time'];

    machine.totalTime += processingTime + idleTime + erorrTime + noServosTime;
    machine.cutTime += cutTime;
    machine.dryHaulTime += dryHaulTime;
    machine.interruptTime += interruptTime;
    machine.idleTime += idleTime;

    machine.cutSpeed += cutSpeed;
   // machine.cutFilenameList.push(cutFilename);
   machine.cutFilenameList.push({cutFilename: cutFilename, startTime: startTime, endTime: endTime});
}

module.exports.getMachineStatusRealtime = function(req, res){
    res.render('Cutting/Dashboard/MachineStatusRealtime');
}