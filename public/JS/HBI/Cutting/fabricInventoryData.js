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

    let unipack = $("#txtUnipack").val();
    let itemColor = $("#txtItemColor").val();
    let status = $("#txtFilterStatus").val();
    let note = $("#txtFilterNote").val();
    // send to server
    let action = baseUrl + 'get-inventory-data';
    let datasend = {
        currentPage: currentPage,
        itemPerPage: itemPerPage,
        unipack: unipack,
        itemColor: itemColor,
        status: status,
        note: note
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
                    <td>${ele.status == 0 ? "" : "Đã sử dụng"}</td>
                    <td>${ele.note ? ele.note : ''}</td>
                    <td>${ele.unipack2}</td>
                    <td>${ele.item_color}</td>
                    <td>${ele.rfinwt}</td>
                    <td>${ele.yard}</td>
                    <td>${ele.rlocbr}</td>
                    <td>${ele.rgrade}</td>
                    <td>${ele.shade}</td>
                    <td>${ele.qccomment}</td>
                    <td>${ele.with_actual}</td>
                    <td>${ele.vendor}</td>
                    <td>
                        <button class='btn btn-primary btn-sm' onclick="openModalUpdateRoll(${ele.id})">Update</button>
                    </td>
                </tr>`;
            }

            $("#fabric-table-body").html('');
            $("#fabric-table-body").append(html);

            totalPage = response.data.totalPage;
            totalRow = response.data.totalRow;

            $("#txtTotalPage").text(totalPage);
            $(".paging-textbox").val(intPage);
            $(".pagination-current").text(`${(currentPage - 1) * itemPerPage  + 1} - ${currentPage * itemPerPage > totalRow ? totalRow : currentPage * itemPerPage} trong ${totalRow} bản ghi`);
        
            let lastestUpdate = data ? data[0].date_update : "";
            $("#lbLastestUpdate").text(lastestUpdate);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function openModalUpdateRoll(id){
    $("#modalUpdateRoll").modal('show');

    let action = baseUrl + 'get-inventory-data-detail/' + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data[0];
            $("#txtURollId").val(data.id);
            $("#txtURollUnipack").val(data.unipack2);
            $("#txtURollYard").val(data.yard);
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function updateRoll(){

    let id = $("#txtURollId").val();
    let unipack = $("#txtURollUnipack");
    let yard = $("#txtURollYard");

    if (!CheckNullOrEmpty(unipack, "Unipack không được để trống"))
        return false;
    if (!CheckNullOrEmpty(yard, "Số lượng yard không được để trống"))
        return false;
    if(parseFloat(yard.val()) < 0){
        toastr.error("Số lượng yard không nhỏ hơn 0");
        return false;
    }

    let datasend = {
        id: id,
        unipack: unipack.val(),
        yard: yard.val(),
    };
    let action = baseUrl + 'update-inventory-data-detail';
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success(response.msg, "Thành công");
            $("#modalUpdateRoll").modal('hide');
            getInventoryData(1);
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// function uploadExcel(){
//     var e = event;
//     var fileName = e.target.files[0].name;
//     $('.fileUploadName').text(fileName);

//     if (window.FormData !== undefined) {

//         var fileUpload = $("#fileFabricReceiveUpload").get(0);
//         var files = fileUpload.files;

//         // Create FormData object
//         var fileData = new FormData();

//         // Looping over all files and add it to FormData object
//         for (var i = 0; i < files.length; i++) {
//             fileData.append("file", files[i]);
//         }

//         LoadingShow();
//         $.ajax({
//             url: baseUrl + 'upload-fabric-inventory-file',
//             method: 'POST',
//             contentType: false,
//             processData: false,
//             data: fileData,
//             success: function (result) {
//                 LoadingHide();
//                 result = JSON.parse(result);
//                 if (result.rs) {
//                     var listSheet = result.data
//                     var options = "";
//                     for (var i = 0; i < listSheet.length; i++) {
//                         let item = listSheet[i];
//                         options += "<option value=" + item.id + ">" + item.sheetname + "</option>";
//                     }

//                     $(".selected-sheet").html("").append(options);
//                     $(".selected-header").focus();
//                     console.log(result.msg);
//                 }
//                 else {
//                     LoadingHide();
//                     toastr.error(result.msg);
//                 }
//             },
//             error: function (err) {
//                 toastr.error(err.statusText);
//             }
//         });
//     } else {
//         toastr.error("FormData is not supported.");
//     }
// }

// function saveUploadData(){
//     // form data
//     let sheet = $("#selected-sheet").val();
//     let headerRow = $("#selected-header").val();
//     let fileName = $("#fileUploadName").text();

//     // send to server
//     let action = baseUrl + 'save-upload-fabric-inventory-data';
//     let datasend = {
//         sheet: sheet,
//         headerRow: headerRow,
//         fileName: fileName
//     };
//     LoadingShow();
//     PostDataAjax(action, datasend, function (response) {
//         LoadingHide();
//         if (response.rs) {
//             toastr.success(response.msg, "Thành công")
//             $("#modalUploadInventoryData").modal('hide');
//             setTimeout(function(){
//                 getInventoryData(currentPage);
//             }, 1000);
//         }
//         else {
//             toastr.error(response.msg, "Thất bại");
//         }
//     });
// }

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
            url: baseUrl + 'upload-fabric-inventory-file',
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
                            <td>
                                <button class="btn btn-outline-success" onclick="deleteRow({name: '${ele.name}'})"><i class="fa fa-close"></i></button>
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

function deleteRow(file){
    // let listFiles = [...$('input:file#fileFabricReceiveUpload')[0].files];
    // let removeEle = listFiles.filter(x => x.name == file.name);
    // let index = listFiles.indexOf(removeEle);
    // listFiles.splice(index, 1)

    // $('input:file#fileFabricReceiveUpload')[0].files = listFiles;

    $(event.currentTarget).parent().parent().remove();
}

function saveUploadData(){

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
    let action = baseUrl + 'save-upload-fabric-inventory-data';
    let datasend = {
        listData: listData
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg, "Thành công")
            $("#modalUploadInventoryData").modal('hide');
            setTimeout(function(){
                getInventoryData(currentPage);
            }, 1000);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function downloadInventoryData() {
    LoadingShow();
    let unipack = $("#txtUnipack").val();
    let itemColor = $("#txtItemColor").val();
    let status = $("#txtFilterStatus").val();
    let note = $("#txtFilterNote").val();
    // send to server
    let action = baseUrl + 'download-inventory-data';
    let datasend = {
        unipack: unipack,
        itemColor: itemColor,
        status: status,
        note: note
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
        return download(blob, GetTodayDate() + "_inventory.xlsx");
    });
}

// #endregion

// #region Socket
 
// #endregion