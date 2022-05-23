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
        format: "mm/dd/yyyy",
        clear: true
    });

    // Load data from localstorage if those data has not submited
    getMarkerPlanDetail();
})

var queryStr = getUrlVars(window.location.href);

var fabricRollList = []; // danh sách dạng key value lưu trữ key là item color. value là danh sách các cuộn vải theo item color
var markerDetailList = []; // danh sách lưu trữ danh sách các mã vải
var selectedFabricRollList = []; // danh sách tổng các cuộn vải được chọn của cả phiếu
var selectedSavedFabricRollList = []; // danh sách tổng các cuộn vải được chọn của cả phiếu
var markerPlan = {};
function getMarkerPlanDetail(){
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
            $("#txtWeek").val(master._group.substring(2,4));
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

function markerUpdate(){
    let groupId = queryStr.group;
    let txtReceiveDate = $("#txtReceiveDate");
    let txtReceiveTime = $("#txtReceiveTime");
    let txtCutDate = $("#txtCutDate");
    let txtNote = $("#txtNote");

    if (!CheckNullOrEmpty(txtReceiveDate, "Ngày nhận không được để trống / Received date can not empty"))
        return false;
    if (!CheckNullOrEmpty(txtReceiveTime, "Giờ nhận không được để trống / Received time can not empty"))
        return false;
    if (!CheckNullOrEmpty(txtCutDate, "Ngày cắt không được để trống / Cut date can not empty"))
        return false;

    let action = baseUrl + 'marker-update';
    let datasend = {
        id: groupId,
        receivedDate: txtReceiveDate.val(),
        receivedTime: txtReceiveTime.val(),
        cutDate: txtCutDate.val(),
        note: txtNote.val()
    }

    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success(response.msg, "Thành công");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    })
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
            fileData.append("file" + i, files[i]);
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
                    var listFiles = result.data
                    let html = '';
                    for (var i = 0; i < listFiles.length; i++){
                        let ele = listFiles[i];

                        let options = "";
                        for (var j = 0; j < ele.sheets.length; j++) {
                            let item = ele.sheets[j];
                            if(item.sheetname == 'Upload-YCV')
                                options += "<option value =" + item.id + " selected>" + item.sheetname + "</option>";
                            else 
                                options += "<option value=" + item.id + ">" + item.sheetname + "</option>";
                        }

                        html += `<tr id='tr-file-${ele.name}'>
                            <td class='fileName'>${ele.name}</td>
                            <td>
                                <select class='form-control sheetName'>${options}</select>
                            </td>
                            <td>
                                <input type='number' class='form-control headerRow' min='1' value='1' />
                            </td>
                        </tr>`;
                    }

                    $("#file-table-body").append(html);
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
    let groupId = queryStr.group;
    let fileList = $(".fileName");
    let sheetList = $(".sheetName");
    let headerList = $(".headerRow");
    let listData = [];

    for (let i = 0; i < fileList.length; i++) {
        file = $(fileList[i]).text();
        sheet = $(sheetList[i]).val();
        header = $(headerList[i]).val();

        listData.push({
            file: file,
            sheet: sheet,
            header: header,
        });
    }

    if(listData.length <= 0){
        toastr.warning("Không có tập tin cần upload", "Warning");
        return false;
    }

    // send to server
    let action = baseUrl + 'save-update-upload-data';
    let datasend = {
        id: groupId,
        listData: listData
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg, "Thành công")
            $("#modalUploadData").modal('hide');
            getMarkerPlanDetail();
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function openPreviewTicket(){
    $("#modalPreviewTicket").modal("show");
    getMarkerPlanDetailPreview();
}

function getMarkerPlanDetailPreview(){
     
    $("#txtPReceiveDate").val(markerPlan.receive_date);
    $("#txtPReceiveTime").val(markerPlan.receive_time);
    $("#txtPGroup").val(markerPlan._group);
    $("#txtPCutDate").val(markerPlan.cut_date);
    $("#txtPCreatedDate").val(markerPlan.date_update);
    $("#txtPWeek").val(markerPlan._group.substring(2,4));
    $("#txtPNote").val(markerPlan.note);

    let html = '';
    let colorFlag = '';
    for (let i = 0; i < markerDetailList.length; i++) {
        let eleMarkerDetail = markerDetailList[i];
        if(eleMarkerDetail.item_color != colorFlag){
            let selectedRollList = selectedFabricRollList.filter(x => x.markerDetailId == eleMarkerDetail.id);
            let sumYard = selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.usedYard), 0);
            let rollCount = selectedRollList.length;
            let sameColorList = markerDetailList.filter(x => x.item_color == eleMarkerDetail.item_color);
            let sumDemandYard = sameColorList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0);

            if(selectedRollList.length > 0){
                let str = `<tr style='background: #ced6dd'>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>${rollCount} cuộn</td>
                    <td><span class='text-danger'>${sumYard}</span> / ${sumDemandYard}</td>
                    <td colspan='4'></td>
                </tr>`;

                for (let j = 0; j < selectedRollList.length; j++) {
                    let eleRoll = selectedRollList[j];
                    str += `<tr>
                        <td>${j + 1}</td>
                        <td>${sameColorList[j] ? sameColorList[j].item_color : ''}</td>
                        <td>${sameColorList[j] ? sameColorList[j].wo : ''}</td>
                        <td>${sameColorList[j] ? sameColorList[j].ass : ''}</td>
                        <td>${sameColorList[j] ? sameColorList[j].yard_demand : ''}</td>
                        <td>${eleRoll.unipack2}</td>
                        <td>${eleRoll.usedYard}</td>
                        <td>${eleRoll.rfinwt}</td>
                        <td>${eleRoll.rgrade}</td>
                        <td>${eleRoll.rlocbr}</td>
                        <td>${eleRoll.shade}</td>
                    </tr>`;
                }
                str += '<tr style="background: #ced6dd"><td colspan="20">&nbsp;</td></tr>';
                html += str;
            }
        }
        colorFlag = eleMarkerDetail.item_color;
    }
    
    $("#preview-fabric-table-body").html('');
    $("#preview-fabric-table-body").append(html);
}

// #endregion

// #region Socket

// #endregion