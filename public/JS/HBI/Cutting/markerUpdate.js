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

    // Load data from localstorage if those data has not submited
    getMarkerPlanDetail();
})

var fabricRollList = []; // danh sách dạng key value lưu trữ key là item color. value là danh sách các cuộn vải theo item color
var markerDetailList = []; // danh sách lưu trữ danh sách các mã vải
var selectedFabricRollList = []; // danh sách tổng các cuộn vải được chọn của cả phiếu
var selectedSavedFabricRollList = []; // danh sách tổng các cuộn vải được chọn của cả phiếu
var markerPlan = {};
function getMarkerPlanDetail(){
    var queryStr = getUrlVars(window.location.href);
    let groupId = queryStr.group;
    // send to server
    let action = baseUrl + 'get-marker-data-detail';
    let datasend = {
        groupId: groupId,
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let master = response.data.master;
            markerPlan = Object.assign({}, master);
            let detail = response.data.detail;
            markerDetailList = detail;
            fabricRollList = response.data.fabricRoll;
            selectedSavedFabricRollList = response.data.selectedFabricRoll;

            if(markerPlan.wh_prepare == '0'){
                selectedFabricRollList = response.data.selectedFabricRoll;
                selectedFabricRollList.forEach(function(ele, index){
                    ele.markerDetailId = ele.marker_plan_detail_id;
                    ele.markerPlanId = ele.marker_plan_id;
                    ele.usedYard = ele.yard;

                    ele.id = ele.roll_id;
                })
            }

            $("#txtReceiveDate").val(master.receive_date);
            $("#txtReceiveTime").val(master.receive_time);
            $("#txtGroup").val(master._group);
            $("#txtCutDate").val(master.cut_date);
            $("#txtCreatedDate").val(master.date_update);
            $("#txtWeek").val(new Date(master.date_update).getWeekNumber());
            $("#txtNote").val(master.note);

            let html = '';

            $("#table1").css("display", "block");
            $("#table2").css("display", "none");

            let colorFlag = "";
            for (let i = 0; i < detail.length; i++) {
                let ele = detail[i];
                html += `<tr id='tr-${ele.id}'>
                    <td>${ele.id}</td>
                    <td>${ele.wo}</td>
                    <td>${ele.ass}</td>
                    <td>${ele.item_color}</td>
                    <td>${ele.yard_demand}</td>
                </tr>`;
                colorFlag = ele.item_color;
            }

            $("#fabric-table-body").html('');
            $("#fabric-table-body").append(html);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// #endregion

// #region Socket

// #endregion