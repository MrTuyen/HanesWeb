/*
    Author: TuyenNV
    DateTime: 
*/

// #region System variable
const baseUrl = "/cutting/fabric-receive/";
const userLogin = JSON.parse(localStorage.getItem("user"));
var wh_display = (userLogin.dept == Enum_Department.Warehouse || userLogin.position == "Admin") ? "" : "display-none";
var ccd_display = (userLogin.dept == Enum_Department.Cutting || userLogin.position == "Admin") ? "" : "display-none";
const statusList = [
    {
        index: 1, value : 'Done'
    },
    {
        index: 0, value : 'All'
    }
]

const filterLocalStorage = "cutting_fr_return_filter";

// #endregion

// #region System Method

// Refresh data
function Refresh() {
    window.location.href = '/cutting/fabric-receive/return-data';
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
    let html = `<option value='${date};${date}'>Hôm nay</option>`;
    for (let i = 0; i < Timepickers.length; i++) {
        let ele = Timepickers[i];
        html += `<option value='${ele.value}' ${i == 0 ? 'selected' : ''}>${ele.text}</option>`
    }
    $("#txtFilterTime").append(html);

    // init datepicker for all input date type
    $('.isDate').datepicker({
        format: "dd/mm/yyyy",
        clear: true
    });

    // get list marker data
    if(localStorage.getItem(filterLocalStorage) != null){
        let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
        $("#txtFilterStatus").val(filter ? filter.filterStatus : '');
        
        if(filter.viewType){
            $("#cbViewType").attr('checked', true);
        }else{
            $("#cbViewType").attr('checked', false);
        }

        displayFilter();
    }
    getListReturnData();
})

function deleteFilter(obj){
    let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
    filter[obj.key] = '';
    localStorage.setItem(filterLocalStorage, JSON.stringify(filter));
    Refresh();
}

function displayFilter(){
    if(localStorage.getItem(filterLocalStorage) != null){
        let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
        let statusVal = statusList.filter(x => x.index == filter.filterStatus)[0].value;
        let filterStatus = filter.filterStatus ? `<span class="label label-info mr-2" style="cursor: pointer;" onclick="deleteFilter({key: 'filterStatus'})">${statusVal}<i class="fa fa-times"></i></span>` : "";

        $("#filter-area").html(filterStatus);
    }
}

// Setup change time to 5 option
function changeDateFilter() {
    let val = this.event.target.value;
    if (val.toString() == "5")
        $("#filterTime").css("display", "block");
    else
        $("#filterTime").css("display", "none");
}

function getListReturnData() {
    let filterStatus = $("#txtFilterStatus").val();
    let filterDate = '';

    filterDate = $("#txtFilterTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
    }

    let action = baseUrl + 'get-return-data';
    let datasend = {
        filterStatus: filterStatus,
        filterDate: filterDate
    };

    localStorage.setItem(filterLocalStorage, JSON.stringify(datasend));
    displayFilter();
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data;
            let html = "";

            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
               
                html += `<tr class='tr-${ele.id}'>
                    <td>${ele.id}</td>
                    <td>${ele.filename}</td>
                    <td>
                        ${ele.wh_confirm_by == '' ? `<div class='rounded-circle white' id='wh-circle-${ele.id}'></div>`
                        : `<div class='rounded-circle green' id='wh-circle-${ele.id}'></div>`
                        }  
                    </td>
                    <td>${ele.user_update}</td>
                    <td>${ele.date_update}</td>
                    <td>
                        <a class='btn btn-sm btn-primary ${wh_display}' href="/cutting/fabric-receive/return-data-detail?id=${ele.id}">WH</a>
                    </td>
                </tr>`;
            }

            $("#fabric-plan-table-body").html('').append(html);

            $("#lbSumMarkerData").text(data.length);
            $("#lbLastestUpdate").text(data.length > 0 ? data[0].date_update : '');
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function uploadExcelReturnData() {
    if (window.FormData !== undefined) {

        var fileUpload = $("#fileFabricReturnUpload").get(0);
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
                    for (var i = 0; i < listFiles.length; i++) {
                        let ele = listFiles[i];

                        let options = "";
                        for (var j = 0; j < ele.sheets.length; j++) {
                            let item = ele.sheets[j];
                            if (item.sheetname == 'Upload-YCV')
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

                    $("#return-file-table-body").append(html);
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

function saveUploadReturnData() {

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

    if (listData.length <= 0) {
        toastr.warning("Không có tập tin cần upload", "Warning");
        return false;
    }

    // send to server
    let action = baseUrl + 'save-upload-return-data';
    let datasend = {
        listData: listData
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg, "Thành công")
            $("#modalUploadReturnData").modal('hide');
            getListMarkerData();
            $("#file-table-body").html('');
            $("#fileFabricReturnUpload").val('');
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// #endregion

// #region Socket

const socket = io();

socket.on('ccd-fabric-receive-action', (data) => {
    let message = data.message;
    let groupId = message.groupId;
    switch (message.actionType) {
        case Enum_Kanban_Action.Cancel:
            Cancel(groupId);
            break;
        case Enum_Kanban_Action.Call:
            //Call(groupId, message);
            getListMarkerData();
            break;
        case Enum_Kanban_Action.CCDSend:
            CCDSend(groupId);
            break;
        case Enum_Kanban_Action.WHSend:
            WHSend(groupId);
            break;
        case Enum_Kanban_Action.Issue:
            IssueChange(groupId, "green");
            break;
        default: Refresh(); break;
    }
});

// #endregion