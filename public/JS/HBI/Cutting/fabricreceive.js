/*
    Author: TuyenNV
    DateTime: 
*/

// #region System variable
const baseUrl = "/cutting/fabric-receive/";

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
    loadExistedData();
})

// Setup change time to 5 option
function changeDateFilter(){
    let val = this.event.target.value;
    if (val.toString() == "5") 
        $("#filterTime").css("display", "block");
    else
        $("#filterTime").css("display", "none");
}

function getListTicket(){
    
}

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

function getDetailTicket(){
    console.log(1);
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

function scanBarcode() {
    if (event.which === 13 || event.key == 'Enter') {
        let rollCode = $("#txtRollCode");
        let wo = $("#txtWo").val();
        if (rollCode.val().length > 0) {
            let code = rollCode.val();
            rollCode.val('');

            addRow({wo: wo, rollCode: code, scannedTime: formatDDMMYYHHMMSS(new Date())});

            let count = parseInt($("#lbCounted").text()) + 1;
            $("#lbCounted").text(count);
        }
        else {
            toastr.error("Bạn chưa nhập mã cuộn vải /Roll code can not blank.");
        }
    }
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

function loadHistory(){
    // form data
    let filterDate = $("#txtFilterTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
    }

    // send to server
    let action = baseUrl + 'get-history';
    let datasend = {
        filterDate: filterDate
    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            
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

        $.ajax({
            url: baseUrl + 'upload-fabric-file',
            method: 'POST',
            contentType: false,
            processData: false,
            data: fileData,
            success: function (result) {
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
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            toastr.success(response.msg, "Thành công")
            $("#modalUploadData").modal('hide');
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// #endregion

// #region Socket
 
// #endregion