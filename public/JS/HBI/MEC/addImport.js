var baseUrl = "/innovation/";

function refresh(){
    location.href = baseUrl + "/import/add";
}

$(document).on('click', '.dropdown-menu', function (e) {
    e.stopPropagation();
});

$(document).on('select2:open', () => {
    if (!event.target.multiple) { 
        let ele = $('.select2-container--open .select2-search--dropdown .select2-search__field').last()[0];
        if(ele)
            ele.focus() 
    }
});

$(document).on('click', '.day', function (e) {
    $('.datepicker').css('display', 'none')
    e.preventDefault();
    e.stopPropagation();
})

$(document).ready(function () {
    $('.isDate').datepicker({
        format: "dd/mm/yyyy",
    });
    
    console.log(partArr);
})

var index = 1;
var partArr = [
    // {
    //     id: index
    // }
];
var listPart = [];
// add request 
function addRequest(){
    let po =  $("#txtPO");
    let importDate =  $("#txtImportDate");
    let vendor =  $("#txtVendor");
    let deliverer =  $("#txtDeliverer");
    let receiver =  $("#txtReceiver");

    if (!CheckNullOrEmpty(po, "Mã PO không được để trống"))
        return false;
    if (!CheckNullOrEmpty(importDate, "Ngày nhập không được để trống"))
        return false;
    if(partArr.length <= 0){
        toastr.error("Bạn chưa nhập danh sách vật tư");
        return false;
    }

    let partCodeList = $(".partCode");
    let vendorCodeList = $(".vendorCode");
    let modelList = $(".model");
    let partNameList = $(".partName");
    let unitList = $(".unit");
    let locationList = $(".location");
    let qtyPOList = $(".qtyPO");
    let qtyImportList = $(".qtyImport");

    for (let i = 0; i < partArr.length; i++) {
        partCode = $(partCodeList[i]).val();
        vendorCode =  $(vendorCodeList[i]).val();
        model =  $(modelList[i]).val();
        partName = $(partNameList[i]).val();
        unit = $(unitList[i]).val();
        partLocation = $(locationList[i]).val();
        qtyPO = $(qtyPOList[i]).val();
        qtyImport = $(qtyImportList[i]).val();
        
        if (qtyImport <= 0) {
            toastr.error("Số lượng nhập kho không nhỏ hơn 0.");
            $(qtyImportList[i]).focus();
            return false;
        }

        if(partName != ""){
            listPart.push({
                code: partCode,
                vendor_code: vendorCode,
                model: model,
                name: partName,
                unit: unit,
                location: partLocation,
                qty: qtyPO,
                qtyImport: qtyImport
            });
        }
    }

    if(listPart.length <= 0){
        toastr.error("Không có danh sách vật tư");
        return false;
    }

    let action = baseUrl + 'import/add';
    let datasend = {
        importInfo: {
            po: po.val(),
            importDate: importDate.val(),
            vendor: vendor.val(),
            deliverer: deliverer.val(),
            receiver: receiver.val(),
        },
        listPart: listPart
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success(response.msg, "Thành công");
            setTimeout(function(){
                refresh();
            }, 500)
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function addRow(){
    let idx = ++index;
    partArr.push({
        id: idx,
    })

    let html = `<tr id="tr-${idx}">
                    <td>
                        <input type="text" class="form-control partName" data-value='${idx}' id='name-${idx}'>
                        <div class="d-none search-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control partCode" data-value='${idx}' id='code-${idx}'>
                        <div class="d-none search-code-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control vendorCode" data-value='${idx}' id='vendor-code-${idx}'>
                        <div class="d-none search-code-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
                        </div>
                    </td>
                    <td>
                        <select class="form-control model" id='model-${idx}'>
                        </select>
                    </td>
                    <td><input type="text" class="form-control unit" id='unit-${idx}'></td>
                    <td><input type="text" class="form-control location" id='location-${idx}'></td>
                    <td><input type="number" class="form-control qtyPO"></td>
                    <td><input type="number" class="form-control qtyImport"></td>
                    <td><button class="btn btn-outline-success" onclick="deleteRow(event, ${idx})"><i class="fa fa-close"></i></button></td>
                </tr>`;

    $("#list-part-body").append(html);
    $("#name-" + idx).focus();
    getListModel(`model-${idx}`);
}

function deleteRow(e, idx){
    let obj = partArr.filter((ele) => {
        return ele.id == idx;
    })
    let i = partArr.indexOf(obj[0]);
    partArr.splice(i, 1);

    $(e.currentTarget).parent().parent().remove();
}

// tìm kiếm part
// $(".partName").on("keyup", $.debounce(250, searchPart));
$(document).on("keyup", ".partName", $.debounce(250, searchPart));
$(document).on("keyup", ".partCode", $.debounce(250, searchPartCode));
var partArrSearch = [];

function searchPart() {
    partArrSearch = [];
    let currentInput = $(this);
    let dataValue = currentInput.attr("data-value");
    let keyword = currentInput.val();
    setTimeout(function () {
        if (keyword.length >= 1) {
            let datasend = {
                keyword: keyword,
                pageSize: 5
            }
            let action = baseUrl + "suggest";
            PostDataAjax(action, datasend, function (response) {
                LoadingHide();
                setTimeout(function () {
                    if (response.rs) {
                        if (response.data.length >= 1) {
                            let data = response.data;
                            partArrSearch = data;
                            let html = "";
                            for (let i = 0; i < data.length; i++) {
                                let ele = data[i];
                                html += "<div class='d-flex part-result' onclick='selectPart(" + ele.id + ", "+ dataValue +")'>"
                                    + "<img class='search-image' src='/Image/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) +"' width='75px' />"
                                    + "<div class=''>"
                                    + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                                    + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                                    + "</div>"
                                    + "</div>";
                            }

                            currentInput.next().removeClass('d-none');
                            currentInput.next().html('');
                            currentInput.next().html(html);
                        }
                        else {
                            currentInput.next().addClass('d-none');
                            currentInput.next().html('');
                        }
                    }
                    else {
                        currentInput.next().addClass('d-none');
                        currentInput.next().html('');
                    }
                });
            });
        } else {
            currentInput.next().addClass('d-none');
            currentInput.next().html('');
        }
    });
}

function searchPartCode() {
    partArrSearch = [];
    let currentInput = $(this);
    let dataValue = currentInput.attr("data-value");
    let keyword = currentInput.val();
    setTimeout(function () {
        if (keyword.length >= 1) {
            let datasend = {
                keyword: keyword,
                pageSize: 5,
                type: 1
            }
            let action = "/innovation/suggest";
            PostDataAjax(action, datasend, function (response) {
                LoadingHide();
                setTimeout(function () {
                    if (response.rs) {
                        if (response.data.length >= 1) {
                            let data = response.data;
                            partArrSearch = data;
                            let html = "";
                            for (let i = 0; i < data.length; i++) {
                                let ele = data[i];
                                html += "<div class='d-flex part-result' onclick='selectPart(" + ele.id + ", "+ dataValue +")'>"
                                    + "<img class='search-image' src='/Image/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) +"' width='75px' />"
                                    + "<div class=''>"
                                    + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                                    + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                                    + "</div>"
                                    + "</div>";
                            }

                            currentInput.next().removeClass('d-none');
                            currentInput.next().html('');
                            currentInput.next().html(html);
                        }
                        else {
                            currentInput.next().addClass('d-none');
                            currentInput.next().html('');
                        }
                    }
                    else {
                        currentInput.next().addClass('d-none');
                        currentInput.next().html('');
                    }
                });
            });
        } else {
            currentInput.next().addClass('d-none');
            currentInput.next().html('');
        }
    });
}

// select part
function selectPart(id, value) {
    let listPart = partArrSearch.filter(function (ele) {
        return ele.id == id;
    })

    let selectedPart = listPart[0];
    // full fill to input
    $("#name-" + value).val(selectedPart.name);
    $("#code-" + value).val(selectedPart.code);
    $("#vendor-code-" + value).val(selectedPart.vendor_code);
    $("#model-" + value).val(selectedPart.machine_model).trigger("change");
    $("#unit-" + value).val(selectedPart.unit);
    $("#location-" + value).val(selectedPart.location);

    // close search result panel
    $(".search-result-panel").addClass('d-none');
    $(".search-result-panel").html('');
    $(".search-code-result-panel").addClass('d-none');
    $(".search-code-result-panel").html('');
}

// get Model
function getListModel(ele){

    let action = baseUrl + 'model/get';
    let datasend = {
        keyword: '',
        machine: ''
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            let listModels = response.data;
            DropDownListModel(listModels, $(`#${ele}`));
            $(`#${ele}`).select2({
                placeholder: "Select a model",
                allowClear: true,
                width: '100%'
            });
        }
        else{
            toastr.error(response.msg, " ");
        }
    });
}  

function DropDownListModel(list, selector){
    selector.html('');
    let html = "";
    for(let i = 0; i < list.length; i++){
        let ele = list[i];
        html += "<option value='"+ele.code+"'>"+ ele.name+ "</option>";
    }
    selector.append(html);
}

// function getPOInfo() {
//     if (event.which === 13 || event.key == 'Enter') {
//         var po = $("#txtPO").val();
//         LoadingShow();
//         var action = baseUrl + 'import/get-po';
//         var datasend = {
//             po: po
//         };

//         PostDataAjax(action, datasend, function (response) {
//             if (response.rs) {
//                 LoadingHide();
//                 var data = response.data;
//                 var html = "";
//                 for (var i = 0; i < data.length; i++) {
//                     var item = data[i];
//                     let idx = ++index;
//                     partArr.push({
//                         id: idx,
//                     })

//                     let html = `<tr id="tr-${idx}">
//                                     <td>
//                                         <input type="text" class="form-control partName" data-value='${idx}' id='name-${idx}'>
//                                         <div class="d-none search-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
//                                         </div>
//                                     </td>
//                                     <td>
//                                         <input type="text" class="form-control partCode" data-value='${idx}' id='code-${idx}'>
//                                         <div class="d-none search-code-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
//                                         </div>
//                                     </td>
//                                     <td>
//                                         <input type="text" class="form-control vendorCode" data-value='${idx}' id='vendor-code-${idx}'>
//                                         <div class="d-none search-code-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
//                                         </div>
//                                     </td>
//                                     <td>
//                                         <select class="form-control model" id='model-${idx}'>
//                                         </select>
//                                     </td>
//                                     <td><input type="text" class="form-control unit" id='unit-${idx}'></td>
//                                     <td><input type="text" class="form-control location" id='location-${idx}'></td>
//                                     <td><input type="number" class="form-control qtyPO"></td>
//                                     <td><input type="number" class="form-control qtyImport"></td>
//                                     <td><button class="btn btn-outline-success" onclick="deleteRow(event, ${idx})"><i class="fa fa-close"></i></button></td>
//                                 </tr>`;

//                     $("#list-part-body").append(html);
//                     $("#name-" + idx).focus();
//                     getListModel(`model-${idx}`);
//                 }

//                 // $("#table-material-code").html('');
//                 // $("#table-material-code").html(html);
//             }
//             else {
//                 LoadingHide();
//                 toastr.error(response.msg);
//             }
//         });
//     }
// }