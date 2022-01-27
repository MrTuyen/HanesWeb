let listMcs = [];

var lines = [
    { id: 1, value: "1-3", text: 'Line A1-A3', default: "" },
    { id: 2, value: "4-6", text: 'Line A4-A6', default: "" },
    { id: 3, value: "7-9", text: 'Line A7-A9', default: "" },
    { id: 4, value: "10-12", text: 'Line A10-A12', default: "" },
    { id: 5, value: "13-15", text: 'Line A13-A15', default: "" },
]

// Socket
const socket = io();

socket.on('realtime', (data) => {
    alert(1)
});

$.fn.modal.Constructor.prototype._enforceFocus = function() {};

$(document).on('click', '.dropdown-menu', function (e) {
    e.stopPropagation();
});

$(document).on('click', '.day', function (e) {
    $('.datepicker').css('display', 'none')
    e.preventDefault();
    e.stopPropagation();
})

$(document).ready(async function () {
    // init time
    // init datepicker for all input date type
    $('.isDate').datepicker({
        format: "dd/mm/yyyy",
    });

    let date = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    let html = `<option value='${date};${date}' selected>Hôm nay</option>`;
    for (let i = 0; i < Timepickers.length; i++) {
        let ele = Timepickers[i];
        html += `<option value='${ele.value}'>${ele.text}</option>`
    }
    $("#txtTime").append(html);

    // init lines
    html = "";
    for (let i = 0; i < lines.length; i++) {
        let ele = lines[i];
        html += `<option value='${ele.value}' ${ele.default}>${ele.text}</option>`
    }
    $("#txtLineRange").append(html);
    $("#txtPartTime").append(html);
    let currentLineRange = $("#txtLineRange").val();
    //getSewingMachineList();
    getAllSewingMachine();

    setTimeout(() => drawMachineLine(currentLineRange), 100)
    socket.emit('realtime', { user: "", message: "" });
})

// Setup change time to 5 option
function changeDateFilter(){
    let val = $("#txtTime").val();
    if (val.toString() == "5") 
        $("#filterTime").css("display", "block");
    else
        $("#filterTime").css("display", "none");
}

function changeLine(id) {
    drawMachineLine(id);
}

function selectMachine(id, tag, line, pos) {
    $("#txtUId").val(id);
    $("#txtUMachineTag").val(tag);
    $("#txtUMachineOldLine").val(line);
    $("#txtUMachineOldPosition").val(pos);
    $("#modalUpdateMachinePosition").modal("show");
}

function updateMachinePosition(){
    let id = $("#txtUId").val();
    let tag = $("#txtUMachineTag").val();
    let oldLine = $("#txtUMachineOldLine").val();
    let oldPosition = $("#txtUMachineOldPosition").val();
    let newLine = $("#txtUMachineNewLine").val();
    let newPosition = $("#txtUMachineNewPosition").val();

    let action = '/innovation/sewing-machine/update-position';
    let datasend = {
        sewingMachine: {
            id: id,
            tag: tag,
            oldLine: oldLine,
            oldPosition: oldPosition,
            newLine: newLine,
            newPosition: newPosition
        }
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success(response.msg, "Thành công");
            let currentLineRange = $("#txtLineRange").val();
            getAllSewingMachine();
            setTimeout(() => drawMachineLine(currentLineRange), 100)
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
    $("#modalUpdateMachinePosition").modal("hide");
}

function getAllSewingMachine(){
    let action = '/innovation/sewing-machine/get';
    let datasend = {
        zone: '',
        line: '',
        status: '',
        tag: ''
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            listMcs = [];
            let data = response.data;
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                let obj = new Machine(ele.id, ele.zone, ele.line, ele.position, ele.status, ele.tag);
                listMcs.push(obj);
            }
            
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function drawMachineLine(id) {
    let lines = id.split("-");
    lines.push(parseInt(lines[0]) + 1);

    let htmlMachineArea = "";
    for (let i = 0; i < lines.sort().length; i++) {
        let ele = lines[i];
        let listMcOfLine = listMcs.filter(function (val) {
            return val.line == ele;
        })
        listMcOfLine.sort((a,b) => (a.pos > b.pos) ? 1 : ((b.pos > a.pos) ? -1 : 0))
        htmlMachineLine = "";
        let html = "";
        for (let j = 1; j <= 24; j++) {
            let mc = listMcOfLine.filter((x) => x.pos == j)[0];
            if(mc){
                html += `<div class="machine" id="${mc.id}" onclick="selectMachine('${mc.id}', '${mc.tag}', '${mc.line}', ${mc.pos})">
                        <div style='background-color: ${(mc.status == 1 ? "#1ee81e" : mc.status == 2 ? "#fd0d0d" : "yellow")}' class='mc-pos'>${j}</div>
                        <div class='mc-tag'>${mc.tag}</div>
                    </div>`;
            }
            else{
                html += `<div class="no-machine" id="">
                        <div style='' class='mc-pos'>${j}</div>
                        <div class='mc-tag'></div>
                    </div>`;
            }
        }
        htmlMachineLine = `<div class='col-md-4 p-0'>
                            <div class='line-box line-box-header text-center'><strong>Line ${ele}</strong></div>
                            <div class='line-box'>${html}</div>
                        </div>`;
        htmlMachineArea += htmlMachineLine;
    }

    $(".machine-area").html(htmlMachineArea);
}

function getPositionHistory(){
    let tag = $("#txtFilterTag").val();
    let filterDate = $("#txtTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
    }
    let action = '/innovation/sewing-machine/get-position-history';
    let datasend = {
        sewingMachine: {
            tag: tag ? tag.trim() : tag,
            filterDate: filterDate
        }
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            $("#modalPositionHistory").modal("show");
            let data = response.data;
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                html += "<tr>"
                    + "<td width='10%'>" + (i + 1) + "</td>"
                    + "<td width='10%'>" + ele.tag + "</td>"
                    + "<td width='10%'>" + ele.machine_model + "</td>"
                    + "<td width='10%'>" + ele.pre_line + "</td>"
                    + "<td width='10%'>" + ele.pre_position + "</td>"
                    + "<td width='10%'>" + ele.line + "</td>"
                    + "<td width='10%'>" + ele.position + "</td>"
                    + "<td width='10%'>" + ele.status + "</td>"
                    + "<td width='10%'>" + ele.time_update + "</td>"
                    + "<td width='10%'>" + ele.user_update + "</td>"
                    + "</tr>";
            }
            $("#history-table-body").html('');
            $("#history-table-body").html(html);
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// Tải báo cáo
function downloadHistory () {
    LoadingShow();
    let tag = $("#txtFilterTag").val();
    let filterDate = $("#txtTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
    }
    let action = '/innovation/sewing-machine/download-position-history';
    let datasend = {
        sewingMachine: {
            tag: tag ? tag.trim() : tag,
            filterDate: filterDate
        }
    };

    fetch(action, {
        method: 'POST',
        body: JSON.stringify(datasend),
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(function (resp) {
        return resp.blob();
    }).then(function (blob) {
        LoadingHide();
        return download(blob, GetTodayDate() + "_sewing_machine_moving_position_history.xlsx");
    });
}

// function getSewingMachineList(){
    // for (let i = 0; i < 24; i++) {
    //     let obj = new Machine(i + 1, "Zone A", "A1", i + 1, 0, "123454" + i);
    //     listMcs.push(obj);
    // }
    // for (let i = 0; i < 24; i++) {
    //     let obj = new Machine(i + 1, "Zone A", 2, i + 1, 0, "123454" + i);
    //     listMcs.push(obj);
    // }
    // for (let i = 0; i < 24; i++) {
    //     let obj = new Machine(i + 1, "Zone A", 3, i + 1, 0, "123454" + i);
    //     listMcs.push(obj);
    // }
    // for (let i = 0; i < 24; i++) {
    //     let obj = new Machine(i + 1, "Zone A", 4, i + 1, 0, "123454" + i);
    //     listMcs.push(obj);
    // }
    // for (let i = 0; i < 24; i++) {
    //     let obj = new Machine(i + 1, "Zone A", 5, i + 1, 0, "123454" + i);
    //     listMcs.push(obj);
    // }
    // for (let i = 0; i < 24; i++) {
    //     let obj = new Machine(i + 1, "Zone A", 6, i + 1, 0, "123454" + i);
    //     listMcs.push(obj);
    // }
    // for (let i = 0; i < 24; i++) {
    //     let obj = new Machine(i + 1, "Zone A", 7, i + 1, 0, "123454" + i);
    //     listMcs.push(obj);
    // }
// }

// function drawMachineLine(id) {
//     let lines = id.split("-");
//     lines.push(parseInt(lines[0]) + 1);

//     let htmlMachineArea = "";
//     for (let i = 0; i < lines.sort().length; i++) {
//         let ele = lines[i];
//         let listMcOfLine = listMcs.filter(function (val) {
//             return val.line == ele;
//         })

//         htmlMachineLine = "";
//         let html = "";
//         for (let j = 0; j < listMcOfLine.length; j++) {
//             let mc = listMcOfLine[j];
//             html += `<div class="machine" id="${mc.id}" onclick="selectMachine(${mc.tag}, ${ele}, ${mc.pos})">
//                         <div class='mc-pos'>${mc.pos}</div>
//                         <div class='mc-tag'>${mc.tag}</div>
//                     </div>`;
//         }
//         htmlMachineLine = `<div class='col-md-4 p-0'>
//                             <div class='line-box line-box-header text-center'><strong>Line ${ele}</strong></div>
//                             <div class='line-box'>${html}</div>
//                         </div>`;
//         htmlMachineArea += htmlMachineLine;
//     }

//     $(".machine-area").html(htmlMachineArea);
// }