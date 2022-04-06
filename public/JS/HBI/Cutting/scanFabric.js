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
var selectedFabricRollList = [];
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
            selectedFabricRollList = response.data.selectedFabricRoll;

            setTimeout(function(){
                getMarkerPlanDetailPreview();
                $("#lbSumRoll").text(selectedFabricRollList.length);
                let obj = selectedFabricRollList.filter(x => x.scanned_time != undefined).length;
                $("#lbCounted").text(obj);
                if(obj == selectedFabricRollList.length){
                    $("#lbCounted").removeClass("text-danger").addClass("text-success");
                }
            }, 500);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function ccdSubmitData(){
    markerPlan.note = $("#txtPNote").val();
    // send to server
    let action = baseUrl + 'ccd-confirm';
    let datasend = {
        markerPlan: markerPlan,
        markerDetailList: markerDetailList,
        selectedRollList: selectedFabricRollList
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg, "Thành công");
            Action(markerPlan.id);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function getMarkerPlanDetailPreview(){
     
    $("#txtPReceiveDate").val(markerPlan.receive_date);
    $("#txtPReceiveTime").val(markerPlan.receive_time);
    $("#txtPGroup").val(markerPlan._group);
    $("#txtPCutDate").val(markerPlan.cut_date);
    $("#txtPCreatedDate").val(markerPlan.date_update);
    $("#txtPWeek").val(new Date(markerPlan.date_update).getWeekNumber());
    $("#txtPNote").val(markerPlan.note);

    let html = '';
    let colorFlag = '';
    let finalResponse = [];
    for (let j = 0; j < markerDetailList.length; j++) {
        let eleMarkerDetail = markerDetailList[j];
        let tempRoll = selectedFabricRollList.filter(x => x.marker_plan_detail_id == eleMarkerDetail.id);          
        if(tempRoll.length > 0){
            tempRoll.forEach(x =>{
                let row = new MarkerPlanDetailRoll
                (
                    eleMarkerDetail.id,
                    eleMarkerDetail.item_color,
                    eleMarkerDetail.wo,
                    eleMarkerDetail.ass,
                    eleMarkerDetail.yard_demand,
                    x.unipack2,
                    x.yard,
                    x.rfinwt,
                    x.rgrade,
                    x.rlocbr,
                    x.shade,
                    x.scanned_time
                )
                finalResponse.push(row);
            })
        }
        else{
            let row = new MarkerPlanDetailRoll
            (
                eleMarkerDetail.id,
                eleMarkerDetail.item_color,
                eleMarkerDetail.wo,
                eleMarkerDetail.ass,
                eleMarkerDetail.yard_demand,
                "",
                "",
                "",
                "",
                "",
                ""
            )
            finalResponse.push(row);
        }
    }
    
    for (let i = 0; i < finalResponse.length; i++) {
        let ele = finalResponse[i];
        let str = '';
        if(ele.item_color != colorFlag){
            let selectedRollList = selectedFabricRollList.filter(x => x.marker_plan_detail_id == ele.id);
            let sumYard = selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);
            let rollCount = selectedRollList.length;
            let sameColorList = markerDetailList.filter(x => x.item_color == ele.item_color);
            let sumDemandYard = sameColorList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0);

            str += '<tr style="background: #ced6dd"><td colspan="20">&nbsp;</td></tr>';
            str += `<tr style='background: #ced6dd'>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>${rollCount} cuộn</td>
                    <td><span class='text-danger'>${sumYard}</span> / ${sumDemandYard}</td>
                    <td colspan='4'></td>
                    <td><span id=''></span></td>
                    <td><span id=''></span></td>
                </tr>`;
            str += `<tr>
                <td>${i + 1}</td>
                <td>${ele.item_color}</td>
                <td>${ele.wo}</td>
                <td>${ele.ass}</td>
                <td>${ele.demand_yard}</td>
                <td>${ele.unipack}</td>
                <td>${ele.yard}</td>
                <td>${ele.lbs}</td>
                <td>${ele.grade}</td>
                <td>${ele.location}</td>
                <td>${ele.shade}</td>
                <td><span class='scanned-status' id='scanned-status-${ele.unipack}-${ele.id}'>${ele.scanned_time ? "<i class='text-success fa fa-check-circle'></i>" : ""}</span></td>
                <td><span class='scanned-time' id='scanned-time-${ele.unipack}-${ele.id}'>${ele.scanned_time ? ele.scanned_time : ""}</span></td>
            </tr>`;   
        }
        else{
            str += `<tr>
                <td>${i + 1}</td>
                <td>${ele.item_color}</td>
                <td>${ele.wo}</td>
                <td>${ele.ass}</td>
                <td>${ele.demand_yard}</td>
                <td>${ele.unipack}</td>
                <td>${ele.yard}</td>
                <td>${ele.lbs}</td>
                <td>${ele.grade}</td>
                <td>${ele.location}</td>
                <td>${ele.shade}</td>
                <td><span class='scanned-status' id='scanned-status-${ele.unipack}-${ele.id}'>${ele.scanned_time ? "<i class='text-success fa fa-check-circle'></i>" : ""}</span></td>
                <td><span class='scanned-time' id='scanned-time-${ele.unipack}-${ele.id}'>${ele.scanned_time ? ele.scanned_time : ""}</span></td>
            </tr>`;          
        }
        html += str;
        colorFlag = ele.item_color;
    }

    $("#preview-fabric-table-body").html('').append(html);
}

// function getMarkerPlanDetailPreview(){
     
//     $("#txtPReceiveDate").val(markerPlan.receive_date);
//     $("#txtPReceiveTime").val(markerPlan.receive_time);
//     $("#txtPGroup").val(markerPlan._group);
//     $("#txtPCutDate").val(markerPlan.cut_date);
//     $("#txtPCreatedDate").val(markerPlan.date_update);
//     $("#txtPWeek").val(new Date(markerPlan.date_update).getWeekNumber());
//     $("#txtPNote").val(markerPlan.note);

//     let html = '';
//     let colorFlag = '';
//     for (let i = 0; i < markerDetailList.length; i++) {
//         let eleMarkerDetail = markerDetailList[i];
//         if(eleMarkerDetail.item_color != colorFlag){
//             let selectedRollList = selectedFabricRollList.filter(x => x.marker_plan_detail_id == eleMarkerDetail.id);
//             let sumYard = selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0);
//             let rollCount = selectedRollList.length;
//             let sameColorList = markerDetailList.filter(x => x.item_color == eleMarkerDetail.item_color);
//             let sumDemandYard = sameColorList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0);

//             if(selectedRollList.length > 0){
//                 let str = `<tr style='background: #ced6dd'>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td>${rollCount} cuộn</td>
//                     <td><span class='text-danger'>${sumYard}</span> / ${sumDemandYard}</td>
//                     <td colspan='4'></td>
//                     <td><span id=''></span></td>
//                     <td><span id=''></span></td>
//                 </tr>`;

//                 for (let j = 0; j < selectedRollList.length; j++) {
//                     let eleRoll = selectedRollList[j];
//                     str += `<tr>
//                         <td>${j + 1}</td>
//                         <td>${sameColorList[j] ? sameColorList[j].item_color : ''}</td>
//                         <td>${sameColorList[j] ? sameColorList[j].wo : ''}</td>
//                         <td>${sameColorList[j] ? sameColorList[j].ass : ''}</td>
//                         <td>${sameColorList[j] ? sameColorList[j].yard_demand : ''}</td>
//                         <td>${eleRoll.unipack2}</td>
//                         <td>${eleRoll.yard}</td>
//                         <td>${eleRoll.rfinwt}</td>
//                         <td>${eleRoll.rgrade}</td>
//                         <td>${eleRoll.rlocbr}</td>
//                         <td>${eleRoll.shade}</td>
//                         <td><span class='scanned-status' id='scanned-status-${eleRoll.unipack2}-${eleRoll.marker_plan_detail_id}'>${eleRoll.scanned_time ? "<i class='text-success fa fa-check-circle'></i>" : ""}</span></td>
//                         <td><span class='scanned-time' id='scanned-time-${eleRoll.unipack2}-${eleRoll.marker_plan_detail_id}'>${eleRoll.scanned_time ? eleRoll.scanned_time : ""}</span></td>
//                     </tr>`;
//                 }
//                 str += '<tr style="background: #ced6dd"><td colspan="20">&nbsp;</td></tr>';
//                 html += str;
//             }
//         }
//         colorFlag = eleMarkerDetail.item_color;
//     }
    
//     $("#preview-fabric-table-body").html('');
//     $("#preview-fabric-table-body").append(html);
// }

function Action(groupId){
    // Call to server
    LoadingShow();
    var action = baseUrl + 'action';
    var datasend = {
        groupId: groupId,
        action: Enum_Action.CCDSend,
        actionTime: 0,
        cancelReason: ''
    };

    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            LoadingHide();
            setTimeout(function () {
                toastr.success(response.msg);
            }, 1000)
            window.location.href = "/cutting/fabric-receive";
        }
        else {
            LoadingHide();
            toastr.error(response.msg);
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

            // addRow({wo: wo, rollCode: code, scannedTime: formatDDMMYYHHMMSS(new Date())});

            let roll = selectedFabricRollList.filter(x => x.unipack2 == code && x.scanned_time == null)[0];

            if(!roll){
                toastr.error(`Không có cuộn vải có mã <span class='text-success'>${code}</span> hoặc đã được scanned trong phiếu này` ,"Thất bại");
                return false;
            }

            // if(roll.scanned_time != null) {
            //     toastr.error(`Cuộn vải có mã <span class='text-success'>${code}</span> đã được scan` ,"Thất bại");
            //     return false;
            // }

            roll.scanned_time = scannedTime;
            $(`#scanned-status-${code}-${roll.marker_plan_detail_id}`).html("<i class='text-success fa fa-check-circle'></i>");
            $(`#scanned-time-${code}-${roll.marker_plan_detail_id}`).text(scannedTime);
            let count = parseInt($("#lbCounted").text()) + 1;
            $("#lbCounted").text(count);
            if(selectedFabricRollList.length == count){
                $("#lbCounted").removeClass("text-danger").addClass("text-success");
            }
        }
        else {
            toastr.error("Bạn chưa nhập mã cuộn vải /Roll code can not blank.");
        }
    }
}

class MarkerPlanDetailRoll{
    constructor(id, item_color, wo, ass, demand_yard, unipack, yard, lbs, grade, location, shade, scanned_time){
        this.id = id;
        this.item_color = item_color;
        this.wo = wo;
        this.ass = ass;
        this.demand_yard = demand_yard;
        this.unipack = unipack;
        this.yard = yard;
        this.lbs = lbs;
        this.grade = grade;
        this.location = location;
        this.shade = shade;
        this.scanned_time = scanned_time;
    }
}

// #endregion

function loadExistedData(){
    let listData = JSON.parse(localStorage.getItem("listScannedData"));
    if(listData && listData.length > 0) {
        let html = "";
        listData = sortArrayByKey(listData, "scannedTime", true);
        for (let i = 0; i < listData.length; i++) {
            let ele = listData[i];
            html += `<tr id='tr-${ele.wo}-${ele.rollCode}'>
                    <td></td>
                    <td>${ele.wo}</td>
                    <td>${ele.rollCode}</td>
                    <td>${ele.scannedTime}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                        <button class='btn btn-sm btn-primary' onclick="getDetailTicket()"><i class='fa fa-pencil'></i></button>
                        <button class='btn btn-sm btn-danger' onclick="deleteRow('${ele.wo}', '${ele.rollCode}')"><i class='fa fa-trash'></i></button>
                    </td>
                </tr>`;
        }
        $("#scanned-table-body").append(html);
        $("#lbCounted").text(listData.length);
    }
}

function addRecord(){
    // form data
    let tempData = localStorage.getItem("listScannedData");
    let listScannedData = JSON.parse(tempData) ? JSON.parse(tempData) : [];

    if(listScannedData.length <= 0){
        toastr.error("Không có dữ liệu để lưu.");
        return false;
    }

    // send to server
    let action = baseUrl + 'add-record';
    let datasend = {
        data: listScannedData
    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            toastr.success(response.msg, "Thành công");

            localStorage.setItem("listScannedData", null);
            $("#lbCounted").text("0");
            $("#scanned-table-body").html("");
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function addRow(ele){
    // get existed data
    let listData = localStorage.getItem("listScannedData");
    listData = JSON.parse(listData) ? JSON.parse(listData) : [];
    
    // add data
    listData.push(ele);

    // re-assign data to storage
    localStorage.setItem("listScannedData", JSON.stringify(listData));

    // change UI
    let html = `<tr id='tr-${ele.wo}-${ele.rollCode}'>
                            <td width='10%'></td>
                            <td width='25%'>${ele.wo}</td>
                            <td width='25%'>${ele.rollCode}</td>
                            <td width='30%'>${ele.scannedTime}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td width='10%'><button class='btn btn-danger' onclick="deleteRow('${ele.wo}', '${ele.rollCode}')"><i class='fa fa-trash'></i></button></td>
                        </tr>`;
    $("#scanned-table-body").prepend(html);
}

function deleteRow(wo, rollCode){
    // get existed data
    let listData = localStorage.getItem("listScannedData");
    listData = JSON.parse(listData) ? JSON.parse(listData) : [];

    // find object then delete
    listData.splice(listData.findIndex(item => item.wo == wo && item.rollCode == rollCode), 1);

    // re-assign data to storage
    localStorage.setItem("listScannedData", JSON.stringify(listData));

    // change UI
    $(`#tr-${wo}-${rollCode}`).remove();
    let count = parseInt($("#lbCounted").text()) - 1;
    $("#lbCounted").text(count);
}

// #region Socket

// #endregion
