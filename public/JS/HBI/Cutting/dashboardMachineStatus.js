var baseUrl = "/cutting/dashboard/";

var shifts = [
    { id: 0, value: "", text: 'All', default: "" },
    { id: 1, value: "a_shift", text: 'Shift 1', default: "" },
    { id: 2, value: "b_shift", text: 'Shift 2', default: "" },
    { id: 3, value: "c_shift", text: 'Shift 3', default: "" },
]
// Common variables
var listMachines = [];
var listMachine92 = [];
var listMachine95 = [];

// Refresh data
function refresh() {
    window.location.href = baseUrl;
}

$(document).on('click', '.dropdown-menu', function (e) {
    e.stopPropagation();
});


$(document).on('click', '.day', function (e) {
    $('.datepicker').css('display', 'none')
    e.preventDefault();
    e.stopPropagation();
})

// Load khi tải trang xong
$(document).ready(function () {
    // Init tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // init shifts
    let html = "";
    for (let i = 0; i < shifts.length; i++) {
        let ele = shifts[i];
        html += `<option value='${ele.value}' ${ele.default}>${ele.text}</option>`
    }
    $(".dropdown-shift").append(html);

    // init clock
    $('.clockpicker').clockpicker({
        placement: 'bottom',
        align: 'left',
        donetext: 'Done',
        default: 'now'
    });

    // init datepicker for all input date type
    $('.isDateTime').datepicker({
        format: "dd/mm/yyyy",
        clear: true
    });

    $('.isDate').datepicker({
        format: "dd/mm/yyyy",
        clear: true
    });
    let date = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    $('.isDate').val(date);
    $("#txtDate92").text(date);
    $("#txtDate95").text(date);
   
    // Initial data
    getMachines();
    getMachineData(92);
    getMachineData(95);
    $(".lbLastRefreshDate").text(formatDDMMYYHHMMSS(new Date()));

    //
    changeViewType(92);
    changeViewType(95);
    
    //
    setTimeout(() => {
        selectBox1 = new vanillaSelectBox("#txtFilterMachine92", { "disableSelectAll": true, "maxHeight": 200, "placeHolder": "Select machine" });
        selectBox2 = new vanillaSelectBox("#txtFilterMachine95", { "disableSelectAll": true, "maxHeight": 200, "placeHolder": "Select machine" });
    }, 1000);

    //
    runSchedule();
})

function runSchedule(){
    setInterval(() =>{
        getMachineData(92);
        getMachineData(95);
        $(".lbLastRefreshDate").text(formatDDMMYYHHMMSS(new Date()));
    }, 300000)
}

// --------------------- UI -----------------------
function DropDownListMachine(list, selector) {
    selector.html('');
    // let html = "<option value=''>All Machines</option>";
    let html = "";
    for (let i = 0; i < list.length; i++) {
        let ele = list[i];
        html += "<option value='" + ele.code + "'>" + ele.name + "</option>";
    }
    selector.append(html);
}

function changeViewType(type) {
    $(`#dateValue${type}`).css("display", "none");
    $(`#weekValue${type}`).css("display", "none");
    let viewType = $(`#cbViewType${type}`).is(":checked");
    if (viewType) {
        $(`#dateValue${type}`).css("display", "none");
        $(`#weekValue${type}`).css("display", "block");
        $(`#txtFilterWeek${type}`).focus();
        $(`#txtFilterWeek${type}`).val(new Date().getWeekNumber());
    }
    else {
        $(`#dateValue${type}`).css("display", "block");
        $(`#weekValue${type}`).css("display", "none");
    }
}

let clicked = true;
function zoomInZoomOut(area) {
    let cutArea = document.getElementById(area);
    if (clicked) {
        cutArea.classList.add("full-screen");
        cutArea.classList.remove("col-md-6");
    } else {
        cutArea.classList.remove("full-screen");
        cutArea.classList.add("col-md-6");
    }
    clicked = !clicked;
}

// ----------------- Logic function --------------
function getMachineData(wc) {
    let filterDate = $(`#txtFilterDate${wc}`).val();
    let filterMachine = $(`#txtFilterMachine${wc}`).val();
    let filterShift = $(`#txtFilterShift${wc}`).val();

    let filterWeek = $(`#txtFilterWeek${wc}`).val();
    let filterWeekEndValue = $(`#txtFilterWeekEndValue${wc}`).val();

    let viewType = $(`#cbViewType${wc}`).is(":checked"); // Select date or week
    if (viewType) {
        let objDate = getDateOfWeek(filterWeek);
        objDate.dateFrom = new Date(objDate.dateFrom);
        filterDate = `${objDate.dateFrom.formatDateDDMMYYYY()};${objDate.dateFrom.addDays(1).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(2).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(3).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(4).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(5).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(6).formatDateDDMMYYYY()}`;
    }

    let action = baseUrl + 'get-machine-data';
    let datasend = {
        filterDate: filterDate,
        filterMachine: filterMachine.length <= 0 ? "" : filterMachine,
        workCenter: wc,
        filterShift: filterShift,
        filterWeek: filterWeek,
        filterWeekEndValue: filterWeekEndValue,
        viewType: viewType
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            if (viewType) {

            }
            else {
                let machineList = response.data.stackBarChartData.data1;
                let machineData = response.data.stackBarChartData.data2.listMachines;
                drawMachineLayout(machineList, machineData, `#cutting-machine-area-${wc}`);
                $(`#lbLastRefreshDate${wc}`).text(formatDDMMYYHHMMSS(new Date()));
            }
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// ----------------- Common function --------------
function getMachines() {
    let action = '/cutting/get-machines';
    let datasend = {

    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            listMachines = response.data;
            listMachine92 = response.data.filter(function (ele) {
                return ele.group == "92";
            })
            listMachine95 = response.data.filter(function (ele) {
                return ele.group == "95";
            })
            
            DropDownListMachine(listMachine92, $("#txtFilterMachine92"))
            DropDownListMachine(listMachine95, $("#txtFilterMachine95"))
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function drawMachineLayout(listMachine, listRecord, outputEle){
    let html = '';
    listMachine.forEach((ele, i) => {
        let recordTable = '';
        let listMachineData = listRecord.filter(x => x.machineName == ele.code)[0].cutFilenameList;
        listMachineData.forEach((eleData, iData) => {
            recordTable += `
            <tr>
                <td>${iData + 1}</td>
                <td style="width: 50px!important">${eleData.cutFilename}</td>
                <td>${formatDDMMYYHHMMSS(new Date(eleData.startTime))}</td>
                <td>${formatDDMMYYHHMMSS(new Date(eleData.endTime))}</td>
            </tr>
            `;
        });

        let isOnline = dateSubtractDateReturnSecond(new Date(), new Date(ele.last_active_date)) / 60 < 5 ? true : false;
        html += `
        <div class="col-md-6 col-sm-12 p-0">
            <div class="cutting-machine">
                Machine: 
                    <span class="label ${isOnline ? 'label-success' : 'label-danger'}">${ele.name}</span> 
                    ${isOnline ? '<span class="text-success">Online <i class="fa fa-circle"></i></span>' : '<span class="text-danger">Offline <i class="fa fa-circle"></i></span>'}
                    <br>
                Last active: ${formatDDMMYYHHMMSS(new Date(ele.last_active_date))}<br>
                Diagram qty: ${listMachineData.length}
                <div class="sticky-body">
                    <table class="table table-bordered mb-0">
                        <thead class="sticky-thead">
                            <th></th>
                            <th style="width: 50px!important">Marker name</th>
                            <th>Start time</th>
                            <th>End time</th>
                        </thead>
                        <tbody>
                            ${recordTable}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
    });
    $(outputEle).html('').append(html);
}

