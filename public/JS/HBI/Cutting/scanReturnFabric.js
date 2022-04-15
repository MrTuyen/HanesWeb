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
function refresh() {
    window.location.href = '/innovation';
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
        if (ele)
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

    // Load data from localstorage if those data has not submited
    getMarkerPlanDetail();
})

var queryStr = getUrlVars(window.location.href);

var fabricRollList = []; // danh sách dạng key value lưu trữ key là item color. value là danh sách các cuộn vải theo item color
var markerDetailList = []; // danh sách lưu trữ danh sách các mã vải
var selectedFabricRollList = [];
var markerPlan = {};
function getMarkerPlanDetail() {
    var queryStr = getUrlVars(window.location.href);
    let id = queryStr.id;
    // send to server
    let action = baseUrl + 'get-return-data-detail';
    let datasend = {
        id: id,
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let master = response.data.master;
            let detail = response.data.detail;
            selectedFabricRollList = detail;

            $("#txtTicketNumber").val(master.id);
            $("#txtUserUpdate").val(master.user_update);
            $("#txtDateUpdate").val(master.date_update);

            let html = '';
            for (let i = 0; i < detail.length; i++) {
                let ele = detail[i];
                html += `<tr>
                <td>${i + 1}</td>
                <td>${ele._group}</td>
                <td>${ele.item_color}</td>
                <td>${ele.unipack_receive}</td>
                <td>${ele.wo}</td>
                <td>${ele.return_qty_lbs}</td>
                <td>${ele.return_qty_yard}</td>
                <td>${ele.unipack_return}</td>
                <td>${ele.note}</td>
                <td><span class='scanned-status' id='scanned-status-${ele.unipack_return}'>${ele.scanned_time ? "<i class='text-success fa fa-check-circle'></i>" : ""}</span></td>
                <td><span class='scanned-time' id='scanned-time-${ele.unipack_return}'>${ele.scanned_time ? ele.scanned_time : ""}</span></td>`
            }

            $("#fabric-table-body").html('').append(html);

            setTimeout(function () {
                $("#lbSumRoll").text(detail.length);
                let obj = detail.filter(x => x.scanned_time != undefined).length;
                $("#lbCounted").text(obj);
                if (obj == detail.length) {
                    $("#lbCounted").removeClass("text-danger").addClass("text-success");
                }
            }, 500);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function whSubmitData() {
    // send to server
    let action = baseUrl + 'wh-confirm-return';
    let datasend = {
        selectedRollList: selectedFabricRollList
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg, "Thành công");
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function scanBarcode() {
    if (event.which === 13 || event.key == 'Enter') {
        let rollCode = $("#txtRollCode");
        if (rollCode.val().length > 0) {
            let code = rollCode.val();
            rollCode.val('');
            let scannedTime = formatMMDDYYHHMMSS(new Date());

            let roll = selectedFabricRollList.filter(x => x.unipack_return == code && x.scanned_time == null)[0];

            if (!roll) {
                toastr.error(`Không có cuộn vải có mã <span class='text-success'>${code}</span> hoặc đã được scanned trong phiếu này`, "Thất bại");
                return false;
            }

            roll.scanned_time = scannedTime;
            $(`#scanned-status-${code}`).html("<i class='text-success fa fa-check-circle'></i>");
            $(`#scanned-time-${code}`).text(scannedTime);
            let count = parseInt($("#lbCounted").text()) + 1;
            $("#lbCounted").text(count);
            if (selectedFabricRollList.length == count) {
                $("#lbCounted").removeClass("text-danger").addClass("text-success");
            }
        }
        else {
            toastr.error("Bạn chưa nhập mã cuộn vải /Roll code can not blank.");
        }
    }
}

// #endregion

// #region Socket

// #endregion
