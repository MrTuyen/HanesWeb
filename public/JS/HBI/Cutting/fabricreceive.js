/*
    Author: TuyenNV
    DateTime: 
*/

// #region System variable
const baseUrl = "/cutting/fabric-receive/";

// Action enum
var Enum_Action = {
    Cancel: 1,
    Call: 2,
    CCDSend: 3,
    WHSend: 4,
    Complete: 5
}

// #endregion

// #region System Method

// Refresh data
function Refresh() {
    window.location.href = '/';
}

// Configure some plugin to work properly
$.fn.modal.Constructor.prototype._enforceFocus = function () { };

$(document).on('click', '.dropdown-menu', function (e) {
    e.stopPropagation();
});

$(document).on('click', '.day', function (e) {
    $('.datepicker').css('display', 'none')
    e.preventDefault();
    e.stopPropagation();
})

// For select2 open then focus on input search
$(document).on('select2:open', () => {
    if (!event.target.multiple) { 
        let ele = $('.select2-container--open .select2-search--dropdown .select2-search__field').last()[0];
        if(ele)
            ele.focus() 
    }
});

// Load khi tải trang xong
$(document).ready(function () {
    // init time picker
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
    $("#txtFilterTime").append(html);

    // init datepicker for all input date type
    $('.isDate').datepicker({
        format: "dd/mm/yyyy",
        clear: true
    });

    // get list marker data
    getListMarkerData();
})

// Setup change time to 5 option
function changeDateFilter(){
    let val = this.event.target.value;
    if (val.toString() == "5") 
        $("#filterTime").css("display", "block");
    else
        $("#filterTime").css("display", "none");
}

function getListMarkerData(){
    let action = baseUrl + 'get-marker-data';
    let datasend = {
         
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data;
            let html = "";

            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
        
                // add row to table
                html += `<tr class='tr-${ele.id}'>
                    <td>${ele.id}</td>
                    <td>${ele.receive_date}</td>
                    <td>${ele.receive_time}</td>
                    <td>${ele._group}</td>
                    <td>${ele.cut_date}</td>
                    <td id="call-date-${ele.id}">
                        ${ele.marker_call_date == undefined ? "" : ele.marker_call_date}
                    </td>
                    <td style="vertical-align: middle">
                        <span class="txtTime" id="action-time-${ele.id}"></span>
                    </td>
                    <td>
                        ${
                            ele.marker_call_by == undefined ?  `<div class='rounded-circle white' id='ccd-circle-${ele.id}'></div>`
                            : ele.marker_call_by == undefined ? `<div class='rounded-circle red' id='ccd-circle-${ele.id}'></div>`
                            : `<div class='rounded-circle yellow' id='ccd-circle-${ele.id}'></div>`
                        }  
                    </td>
                    <td>
                        ${
                            ele.marker_call_by == undefined ?  `<div class='rounded-circle white' id='wh-circle-${ele.id}'></div>`
                            : ele.wh_confirm_by == undefined ? `<div class='rounded-circle red' id='wh-circle-${ele.id}'></div>`
                            : `<div class='rounded-circle yellow' id='wh-circle-${ele.id}'></div>`
                        }
                    </td>
                    <td>
                        ${
                            ele.marker_call_by == undefined ?  `<div class='rounded-circle white' id='ccd-circle-${ele.id}'></div>`
                            : ele.ccd_confirm_by == undefined ? `<div class='rounded-circle red' id='ccd-circle-${ele.id}'></div>`
                            : `<div class='rounded-circle yellow' id='ccd-circle-${ele.id}'></div>`
                        }  
                    </td>
                    <td>
                        ${ele.note}
                    </td>
                    <td>
                        <button class='btn btn-sm btn-primary' data-groupId='${ele.id}' onclick='Action(${Enum_Action.Call})'>Marker call</button>
                        <button class='btn btn-sm btn-primary' data-groupId='${ele.id}' onclick='OpenCancelModal(${ele.id})'>Cancel</button>
                        <a class='btn btn-sm btn-primary' href="/cutting/fabric-receive/scan-marker-data-detail?group=${ele.id}">CCD scan</a>
                        <a class='btn btn-sm btn-primary' href="/cutting/fabric-receive/marker-data-detail?group=${ele.id}">WH</a>
                    </td>
                </tr>`;
            }

            $("#fabric-plan-table-body").html('');
            $("#fabric-plan-table-body").append(html);

            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                // checking marker was called then continue counting if called
                let totalMinutes = 0;
                let now = new Date();
                if (ele.marker_call_date != undefined)
                {
                    var callDate = new Date(ele.marker_call_date);
                    var nextDay = callDate.addDays(1); // 6:00 next day from call day
                    if (now > nextDay)
                    {
                        var days = now.getDate() - callDate.getDate();
                        var counterTime = now - callDate;
                        totalMinutes = Math.round(counterTime / (1000 * 60)) - 480 * days; // 480 = 8 * 60 from 22h previous day to 06h next day
                    }
                    else
                    {
                        var maxCallDate = new Date(callDate.formatDateMMDDYYYY() + " 22:00:00"); // 22:00
                        if (now > maxCallDate)
                        {
                            var counterTime = maxCallDate - callDate;
                            totalMinutes = Math.round(counterTime / (1000 * 60));
                        }
                        else
                        {
                            var counterTime = now - callDate;
                            totalMinutes = Math.round(counterTime / (1000 * 60));
                        }
                    }
                    RunTime(ele.id, totalMinutes);
                }
            }
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function uploadExcel(){
    var e = event;
    var fileName = e.target.files[0].name;
    $('.fileUploadName').text(fileName);

    if (window.FormData !== undefined) {

        var fileUpload = $("#fileFabricReceiveUpload").get(0);
        var files = fileUpload.files;

        // Create FormData object
        var fileData = new FormData();

        // Looping over all files and add it to FormData object
        for (var i = 0; i < files.length; i++) {
            fileData.append("file", files[i]);
        }

        LoadingShow();
        $.ajax({
            url: baseUrl + 'upload-fabric-file',
            method: 'POST',
            contentType: false,
            processData: false,
            data: fileData,
            success: function (result) {
                LoadingHide();
                result = JSON.parse(result);
                if (result.rs) {
                    var listSheet = result.data
                    var options = "";
                    for (var i = 0; i < listSheet.length; i++) {
                        let item = listSheet[i];
                        options += "<option value=" + item.id + ">" + item.sheetname + "</option>";
                    }

                    $(".selected-sheet").html("").append(options);
                    $(".selected-header").focus();
                    console.log(result.msg);
                }
                else {
                    toastr.error(result.msg);
                }
            },
            error: function (err) {
                LoadingHide();
                toastr.error(err.statusText);
            }
        });
    } else {
        toastr.error("FormData is not supported.");
    }
}

function saveUploadData(){
    // form data
    let sheet = $("#selected-sheet").val();
    let headerRow = $("#selected-header").val();
    let fileName = $("#fileUploadName").text();

    // send to server
    let action = baseUrl + 'save-upload-data';
    let datasend = {
        sheet: sheet,
        headerRow: headerRow,
        fileName: fileName
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg, "Thành công")
            $("#modalUploadData").modal('hide');
            getListMarkerData();
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// Interval array
var arrInterval = [];

// Action
function Action(actionType){
    var ele = $(event.target);
    var groupId = "";
    var cancelReason = "";
    var cancelStep = "";
    if (actionType == Enum_Action.Cancel) {
        groupId = $("#txtGroupId").val();
        cancelReason = $("#txtReason").val();
        cancelStep = $("#txtCancelStep").val();
    }
    else {
        groupId = ele.attr("data-groupId");
    }
    var actionTime = $("#action-time-" + groupId).text();

    // Call to server
    LoadingShow();
    var action = baseUrl + 'action';
    var datasend = {
        groupId: groupId,
        action: actionType,
        actionTime: actionTime,
        cancelReason: cancelReason,
        cancelStep: cancelStep
    };

    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            LoadingHide();
            toastr.success(response.msg);

            switch (actionType) {
                case Enum_Action.Cancel: {
                    $("#modalReason").modal('hide');
                    $("#txtReason").val('');
                    ClearTime(groupId);
                    CCDChange(groupId, "white");
                    WHChange(groupId, "white");
                } break;
                case Enum_Action.CCDSend: {
                    $("#tr-" + groupId).remove();
                } break;
                case Enum_Action.WHSend: {
                    $("#tr-" + groupId).remove();
                } break;
            }
        }
        else {
            LoadingHide();
            toastr.error(response.msg);
        }
    });
}

//
function OpenCancelModal(groupId) {
    $("#txtGroupId").val(groupId);
    $("#modalReason").modal('show');
}

// Call click: Change CP and SP to red
function Call(groupId, message) {
    // var row = document.getElementById("tr-" + groupId); // find row to copy
    // var table = document.getElementById("table-kanban-body"); // find table to append to
    // var clone = row.cloneNode(true); // copy children too
    // $("#tr-" + groupId).remove();
    // if (message.newestAssWo.length > 0) {
    //     $(clone).insertAfter("#tr-" + message.newestAssWo);
    // }
    // else {
    //     table.prepend(clone);
    // }

    $("#call-date-" + groupId).text(message.callDate);
    ClearTime(groupId);
    RunTime(groupId, 0);
    CCDChange(groupId, "red");
    WHChange(groupId, "red");
}

// CP click: Change CCD to yellow
function CCDSend(groupId){
    CCDChange(groupId, "yellow");
}

// SP click: Change WH to yellow
function WHSend(groupId) {
    WHChange(groupId, "yellow");
}

// Cancel click: Change both CCD and WH to white
function Cancel(groupId) {
    $("#call-date-" + groupId).text("");
    ClearTime(groupId);
    CCDChange(groupId, "white");
    WHChange(groupId, "white");
}

// Complete click: Save data row to TBL_KANBAN_DATA
function Complete(groupId) {
    $("#tr-" + groupId).remove();
}

// CP change color
function CCDChange(groupId, color) {
    $("#ccd-circle-" + groupId).css("background", color);
}

// SP change color
function WHChange(groupId, color) {
    $("#wh-circle-" + groupId).css("background", color);
}

// Count time run every 1 minute
function RunTime(groupId, clickTime) {
    var actionTime = $("#action-time-" + groupId);
    var time = clickTime;
    actionTime.text(time);
    if (time > 240) {
        actionTime.addClass("text-danger");
    }
    function Timer() {
        time++;
        actionTime.text(time);
        if (time > 240) {
            actionTime.addClass("text-danger");
        }
    }

    var myInterval = setInterval(Timer, 1000 * 60);
    arrInterval.push({ groupId: groupId, id : myInterval });
}

// Clear interval
function ClearTime(groupId) {
    var actionTime = $("#action-time-" + groupId);
    actionTime.text(0);
    actionTime.removeClass("text-danger");
    if (arrInterval.length > 0) {
        let intervalId = arrInterval.filter(function (x) {
            return x.groupId.toString() === groupId;
        });

        if (intervalId.length > 0) {
            clearInterval(intervalId[0].id);
        }
    }
}

// #endregion

// #region Socket

const socket = io();

socket.on('ccd-fabric-receive-action', (data) => {
    let message = data.message;
    let groupId = message.groupId;
    switch (message.actionType) {
        case Enum_Action.Cancel:
            Cancel(groupId);  
            break;
        case Enum_Action.Call:                
            Call(groupId, message);
            break;
        case Enum_Action.CCDSend:
            CCDSend(groupId);
            break;
        case Enum_Action.WHSend:
            WHSend(groupId);
            break;
        case Enum_Action.Complete:
            Complete(groupId);
            break;
        default: Refresh(); break;
    }
});

// #endregion