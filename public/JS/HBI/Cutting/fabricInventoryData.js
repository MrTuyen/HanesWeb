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
    getInventoryData(currentPage);
})

var currentPage = 1;
var totalPage = 0;
var totalRow = 1;
var itemPerPage = 50;
function getInventoryData(intPage){
    if(intPage <= 0)
        intPage = 1;
    if(totalPage > 0 && intPage > totalPage)
        intPage = totalPage;

    currentPage = intPage;

    // send to server
    let action = baseUrl + 'get-inventory-data';
    let datasend = {
        currentPage: currentPage,
        itemPerPage: itemPerPage
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data.data;
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                html += `<tr>
                    <td>${ele.id}</td>
                    <td>${ele.unipack2}</td>
                    <td>${ele.yard}</td>
                    <td></td>
                </tr>`;
            }

            $("#fabric-table-body").html('');
            $("#fabric-table-body").append(html);

            totalPage = response.data.totalPage;
            totalRow = response.data.totalRow;

            $("#txtTotalPage").text(totalPage);
            $(".paging-textbox").val(intPage);
            $(".pagination-current").text(`${(currentPage - 1) * itemPerPage  + 1} - ${currentPage * itemPerPage > totalRow ? totalRow : currentPage * itemPerPage} trong ${totalRow} bản ghi`);
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
            url: baseUrl + 'upload-fabric-inventory-file',
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
    let action = baseUrl + 'save-upload-fabric-inventory-data';
    let datasend = {
        sheet: sheet,
        headerRow: headerRow,
        fileName: fileName
    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            toastr.success(response.msg, "Thành công")
            $("#modalUploadInventoryData").modal('hide');
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// #endregion

// #region Socket
 
// #endregion