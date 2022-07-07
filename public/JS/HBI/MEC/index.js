/*
    Author: TuyenNV
    DateTime: 
*/

// #region System variable
const baseUrl = "/innovation/";

const filterLocalStorage = "mec_sparepart_request_filter";

var errors = [
    { id: 1, value: "01", text: '01. Bỏ mũi', default: "selected" },
    { id: 2, value: "02", text: '02. Đứt chỉ', default: "" },
    { id: 3, value: "03", text: '03. Gãy kim', default: "" },
    { id: 4, value: "04", text: '04. Sùi chỉ', default: "" },
    { id: 5, value: "05", text: '05. Chỉ xấu', default: "" },
    { id: 6, value: "06", text: '06. Xù chỉ', default: "" },
    { id: 7, value: "07", text: '07. Móc sợi chỉ, chun', default: "" },
    { id: 8, value: "08", text: '08. Nhăn đường may', default: "" },
    { id: 9, value: "09", text: '09. Xước, hằn đường may', default: "" },
    { id: 10, value: "10", text: '10. Âm dương thông số', default: "" },
    { id: 11, value: "11", text: '11. Xếp li', default: "" },
    { id: 12, value: "12", text: '12. Déo hàng', default: "" },
    { id: 13, value: "13", text: '13. Bẩn đường may', default: "" },
    { id: 14, value: "14", text: '14. Đường keo sống', default: "" },
    { id: 15, value: "15", text: '15. Chảy keo,tràn keo', default: "" },
    { id: 16, value: "16", text: '16. Bai nhăn', default: "" },
    { id: 17, value: "17", text: '17. Máy kêu to', default: "" },
    { id: 18, value: "18", text: '18. Bó kẹt', default: "" },
    { id: 19, value: "19", text: '19. Sóng bai chun', default: "" },
    { id: 20, value: "20", text: '20. Lỗi motor không quay', default: "" },
    { id: 21, value: "21", text: '21. Máy báo sai nhiệt độ', default: "" },
    { id: 22, value: "22", text: '22. Chảy keo', default: "" },
    { id: 23, value: "23", text: '23. Bục đường may', default: "" },
    { id: 24, value: "24", text: '24. Trượt mí', default: "" },
    { id: 25, value: "25", text: '25. Mí không đều', default: "" },
    { id: 26, value: "26", text: '26. Láng keo chun', default: "" }

]

var zones = [];

const requestStatusList = [
    {
        index: 0, value : 'Chưa xử lý'
    },
    {
        index: 1, value : 'Đã duyệt'
    },
    {
        index: 2, value : 'Chưa duyệt'
    },
    {
        index: "", value : 'Tất cả'
    }
]

// Action enum
var Enum_Action = {
    None: 0,
    Approve: 1,
    Reject: 2
}

// Request Type enum
var Request_Type = {
    NewIssue: 0, // cấp mới
    Exchange: 1, // đổi trả
}

// 
var Enum_User_Type = {
    Manager: 1,
    SeniorManager: 2,
    Clerk: 3
}

// Enum Position
var Enum_User_Position = {
    Clerk: "Clerk",
    Supervisor: "Supervisor",
    Superintendant: "SuperIntendant",
    Admin: "Admin"
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
$(document).ready(async function () {
    // select2
    $("#txtRModel, #txtURModel").select2({
        placeholder: "Select a model",
        allowClear: true,
        width: '100%'
    });

    $("#txtAPartModel, #txtPartModel").select2({
        placeholder: "Select a model",
        allowClear: true,
        width: '100%',
        tag: true,
        multiple: true
    });

    // init time picker
    let date = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    $('.isDate').val(date);

    let html = "";
    for (let i = 0; i < Timepickers.length; i++) {
        let ele = Timepickers[i];
        html += `<option value='${ele.value}' ${ele.default}>${ele.text}</option>`
    }
    $("#txtPartTime").append(html);

    html = `<option value='${date};${date}' selected>Hôm nay</option>`;
    for (let i = 0; i < Timepickers.length; i++) {
        let ele = Timepickers[i];
        html += `<option value='${ele.value}'>${ele.text}</option>`
    }
    $("#txtTime").append(html);
    $("#txtFilterTime").append(html);

    // init list zone
    let result = await getZone();
    DropDownListZone(result, $(".list-zone"));

    // init list error
    html = "";
    for (let i = 0; i < errors.length; i++) {
        let ele = errors[i];
        html += `<option value='${ele.value}' ${ele.default}>${ele.text}</option>`
    }
    $(".list-error").append(html);

    // init datepicker for all input date type
    $('.isDate').datepicker({
        format: "dd/mm/yyyy",
    });

    $('.modal').on('shown.bs.modal', function () {
        $(this).find('[autofocus]').focus();
    });

    // Get user's information
    if(localStorage.getItem(filterLocalStorage) != null){
        let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
        $("#txtFilterZone").val(filter ? filter.zone : '');
        $("#txtStatus").val(filter ? filter.status : '');
        if(filter.filterDate && filter.filterDate != null){
            let dateArr = filter.filterDate.split(";");
            filter.filterDate = dateArr[0] == dateArr[1] ? `${date};${date}` : filter.filterDate;
        }
        $("#txtFilterTime").val(filter.filterDate != "" ? filter.filterDate : `${date};${date}`);

        displayFilter();
    }

    getAllRequest();

    // Reload page with current tab
    if(!localStorage.getItem('partActiveTab'))
        localStorage.setItem('partActiveTab', "#processing-panel");
    $("#innovation-tab a").on('click', function(e){
        localStorage.setItem('partActiveTab', $(e.currentTarget).attr('href'));
    });
    var activeTab = localStorage.getItem('partActiveTab');
    if(activeTab){
        $(".mdl-tabs__panel").removeClass("is-active");
        $(".mdl-tabs__tab").removeClass("is-active");
        $(activeTab).addClass("is-active");
        let currentTab =  $(document.querySelector(`[href='${activeTab}']`));
        currentTab.click();
        currentTab.addClass('is-active');
    }

    result = await getAllModel();
    DropDownListModel(result, $(`.list-model`));
})

async function getZone(){
    let action = '/production/zone/get';
    let datasend = {
    };
    return new Promise((resolve, reject) => {
        PostDataAjax(action, datasend, function (response) {
            if (response.rs) {
                zones = response.data;
                resolve(zones);
            }
        });
    });
}

function DropDownListZone(list, selector){
    // selector.html('');
    let html = "";
    for(let i = 0; i < list.length; i++){
        let ele = list[i];
        html += "<option value='"+ele.id+"'>"+ ele.name+ "</option>";
    }
    selector.append(html);
}

// get Model
function getAllModel() {
    let action = baseUrl + 'model/get';
    let datasend = {
        keyword: '',
        machine: ''
    };
    return new Promise((resolve, reject) => {
        PostDataAjax(action, datasend, function (response) {
            if (response.rs) {
                modelArr = response.data;
                resolve(modelArr);
            }
        });
    })
}

// Setup change time to 5 option
function changeDateFilter() {
    let val = $("#txtFilterTime").val();
    if (val.toString() == "5")
        $("#filterPickTime").css("display", "block");
    else
        $("#filterPickTime").css("display", "none");
}

function changeDateDownload() {
    let val = $("#txtTime").val();
    if (val.toString() == "5")
        $("#downloadPickTime").css("display", "block");
    else
        $("#downloadPickTime").css("display", "none");
}

function changeDatePart() {
    let val = $("#txtPartTime").val();
    if (val.toString() == "5")
        $("#partPickTime").css("display", "block");
    else
        $("#partPickTime").css("display", "none");
}

// get Model
function getListModel(ele){
    DropDownListModel(modelArr, $(`#${ele}`));
}

function DropDownListModel(list, selector){
    selector.html('');
    let html = "";
    for(let i = 0; i < list.length; i++){
        let ele = list[i];
        html += "<option value='"+ele.code+"'>"+ ele.name+ "</option>";
    }
    selector.append(html);

    selector.select2({
        placeholder: "Select a model",
        allowClear: true,
        width: '100%'
    });
}

/* 
    Part request section
*/
function changeRequestType(){
    let sManagerSection = $("#RSeniorManagerSection");
    let requsetType = $(`#cbRRequestType`).is(":checked");
    if(requsetType == Request_Type.NewIssue){
        sManagerSection.css("display", "block");
    }
    else{
        sManagerSection.css("display", "none");
    }
}

function deleteFilter(obj){
    let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
    filter[obj.key] = '';
    localStorage.setItem(filterLocalStorage, JSON.stringify(filter));
    refresh();
}

function displayFilter(){
    if(localStorage.getItem(filterLocalStorage) != null){
        let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
        
        let zoneVal = zones.filter(x => x.id == filter.zone)[0]?.name;
        let filterZone = filter.zone ? `<span class="label label-info mr-2" style="cursor: pointer;" onclick="deleteFilter({key: 'zone'})">${zoneVal}<i class="fa fa-times"></i></span>` : "";
        
        let statusVal = requestStatusList.filter(x => x.index == filter.status)[0].value;
        let filterStatus = filter.status ? `<span class="label label-info mr-2" style="cursor: pointer;" onclick="deleteFilter({key: 'status'})">${statusVal}<i class="fa fa-times"></i></span>` : "";
        let filterDate = filter.filterDate ? `<span class="label label-info mr-2" style="cursor: pointer;" onclick="deleteFilter({key: 'filterDate'})">${filter.filterDate}<i class="fa fa-times"></i></span>` : "";

        $("#filter-area").html(filterZone + filterStatus + filterDate);
    }
}

function getAllRequest() {
    let status = $("#txtStatus").val();
    let zone = $("#txtFilterZone").val();
    // let date = $("#processing-date").val();
    let filterDate = $("#txtFilterTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
    }
    let action = baseUrl + 'getPartRequest';
    let datasend = {
        status: status,
        zone: zone,
        filterDate: filterDate
    };
    LoadingShow();
    localStorage.setItem(filterLocalStorage, JSON.stringify(datasend));
    displayFilter();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data;
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                let zoneEle = zones.filter((x) => x.id == ele.zone)[0].name;
                html += "<tr>"
                    + "<td width='10%'>" + ele.id + "</td>"
                    + "<td width='10%'>" + (ele.request_type == 0 ? "Cấp mới" : "Đổi trả") + "</td>"
                    + "<td width='10%'>" + (ele.is_urgent == 0 ? "" : "<i class='text-success fa fa-check-circle'></i>") + "</td>"
                    + "<td width='10%'>" + zoneEle + "</td>"
                    + "<td width='10%'>" + ele.requester_name + "</td>"
                    + "<td width='10%'>" + ele.request_date + "</td>"
                    + "<td width='10%'>" + (ele.manager_status == Enum_Action.Approve ? "<i class='text-success fa fa-check-circle'></i>" : ele.manager_status == Enum_Action.Reject ? "<i class='text-danger fa fa-times-circle'></i>" : "") + "</td>"
                    + "<td width='10%'>" + (ele.s_manager_status == Enum_Action.Approve ? "<i class='text-success fa fa-check-circle'></i>" : ele.s_manager_status == Enum_Action.Reject ? "<i class='text-danger fa fa-times-circle'></i>" : "") + "</td>"
                    + "<td width='10%'>" + (ele.clerk_status == Enum_Action.Approve ? "<i class='text-success fa fa-check-circle'></i>" : ele.clerk_status == Enum_Action.Reject ? "<i class='text-danger fa fa-times-circle'></i>" : "") + "</td>"
                    + "<td width='10%'><a href='javascript:void(0)' class='btn btn-primary btn-sm' onclick='getRequestDetail(" + ele.id + ")'><i class='fa fa-edit' style='font-size: 14px'></i> Xem</a></td>"
                    + "</tr>";
            }
            $("#processing-table-body").html('').html(html);
            $("#processing-part-count").text("(" + data.length + ")");
        }
        else {

        }
    });
}

// get request detail
function getRequestDetail(id) {
    let userLogin = JSON.parse(localStorage.getItem("user"));
    let action = baseUrl + 'request/' + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if (response.rs) {
            let requestInfo = response.data.info;

            $("#cbURIsUrgent").prop("checked", requestInfo.is_urgent == 0 ? false : true);
            $("#cbURRequestType").prop("checked", requestInfo.request_type == 0 ? false : true);
            $("#txtURId").val(requestInfo.id);
            // $("#txtDPartDes").val(requestInfo.description);
            $("#txtURPartIdMechanic").val(requestInfo.requester);
            $("#txtURPartRequesterName").text(requestInfo.requester_name);
            $("#txtURPartManager").val(requestInfo.manager);
            $("#txtURPartSeniorManager").val(requestInfo.s_manager);
            $("#txtURZone").val(requestInfo.zone);
            $("#txtURMachineTag").val(requestInfo.tag_machine);
            $("#txtURPartReason").val(requestInfo.reason);
            $("#URSeniorManagerSection").css("display", requestInfo.request_type == 0 ? "block" : "none")

            $("#ur-list-part").html('');
            let html = "";
            let requestDetail = response.data.items;
            for (let i = 0; i < requestDetail.length; i++) {
                let ele = requestDetail[i];
                let idx = i + 1;
                html += `<tr id="tr-${idx}">
                            <td>
                                <input type="text" class="form-control URPartName" data-value='${idx}' value='${ele.name}' id='name-${idx}' disabled>
                            </td>
                            <td>
                                <input type="text" class="form-control URPartCode" data-value='${idx}' value='${ele.code}' id='code-${idx}' disabled>
                            </td>
                            <td>
                                <input type="text" class="form-control URLocation" id='location-${idx}' value='${ele.location}' disabled>
                            </td>
                            <td>
                                <input type="text" class="form-control URQty" id='qty-${idx}' value='${ele.qty}' disabled>
                            </td>
                            <td>
                                <input type="text" class="form-control URRemainQty" id='remain-qty-${idx}' value='${ele.remain_qty}' disabled>
                            </td>
                            <td>
                                <input type="text" class="form-control URReason" data-value='${idx}' value='${ele.reason == null ? "" : ele.reason}' disabled>
                            </td>
                            <td>
                                <input type="text" class="form-control URExportQty" data-value='${ele.id}' value='${ele.export_qty == 0 ? ele.qty : ele.export_qty}' id='export-qty-${idx}'>
                            </td>
                        </tr>`;
                
                partArrUpdate.push({
                    id: idx,
                });
            }
            index = requestDetail.length;
            $("#ur-list-part").append(html);

            // User 's position
            $(".clerk-section").css("display", (userLogin.position == Enum_User_Position.Admin || userLogin.position == Enum_User_Position.Clerk) ? "block" : "none");
            $(".manager-section").css("display", (userLogin.position == Enum_User_Position.Admin 
            || userLogin.position == Enum_User_Position.Supervisor 
            || userLogin.position == Enum_User_Position.Superintendant) ? "flex" : "none");
            $(".senior-manager-section").css("display", (userLogin.position == Enum_User_Position.Admin 
            || userLogin.position == Enum_User_Position.Superintendant
            || userLogin.username == requestInfo.s_manager) ? "flex" : "none");

        }
        else {

        }
    });

    $("#modalUpdateRequest").modal("show");
}

// Thêm yêu cầu vặt tư
function addRequest() {
    let isUrgent = $(`#cbRIsUrgent`).is(":checked");
    let requestType = $(`#cbRRequestType`).is(":checked");
    let reason = $("#txtRPartReason");
    let tag = $("#txtRMachineTag");
    let zone = $("#txtRZone").val();
    let idMechanic = $("#txtRPartIdMechanic");
    let manager = $("#txtRPartManager");
    let managerEmail = $("#txtRPartManagerEmail").val();
    let requesterName = $("#txtRPartRequesterName");
    let sManager = $("#txtRPartSeniorManager");
    let sManagerEmail = $('option:selected', $("#txtRPartSeniorManager")).attr('data-email');

    if (!CheckNullOrEmpty(tag, "Tag máy không được để trống"))
        return false;
    if (!CheckNullOrEmpty(idMechanic, "ID thợ máy không được để trống"))
        return false;
    if (!CheckNullOrEmpty(manager, "Nhấn enter ở ô ID Thợ máy để lấy thông tin Manager"))
        return false;

    if(partArr.length <= 0){
        toastr.error("Bạn chưa nhập danh sách vật tư");
        return false;
    }

    let partCodeList = $(".RPartCode");
    let partNameList = $(".RPartName");
    let locationList = $(".RLocation");
    let qtyList = $(".RQty");
    let remainQtyList = $(".RRemainQty");
    let partReasonList = $(".RPartReason");

    for (let i = 0; i < partArr.length; i++) {
        let ele = partArr[i].id;
        partCode = $(partCodeList[i]).val();
        partName = $(partNameList[i]).val();
        partLocation = $(locationList[i]).val();
        qty = isNaN(parseInt($(qtyList[i]).val())) ? 0 : parseInt($(qtyList[i]).val());
        remainQty = isNaN(parseInt($(remainQtyList[i]).text())) ? 0 : parseInt($(remainQtyList[i]).text());
        partReason = $(partReasonList[i]).val();

        if (qty <= 0) {
            toastr.error("Số lượng không nhỏ hơn 0.");
            $("#qty-" + ele).focus();
            listPart = [];
            return false;
        }

        if (qty > remainQty) {
            toastr.error("Trong kho không đủ số lượng.");
            $("#qty-" + ele).focus();
            listPart = [];
            return false;
        }
        
        if (partName != "")
        {
            listPart.push({
                code: partCode,
                name: partName,
                qty: qty,
                location: partLocation,
                export_qty: 0,
                part_reason: partReason,
                remain_qty: remainQty
            });
        }
    }

    let action = baseUrl + 'request/add';
    let datasend = {
        isUrgent: isUrgent,
        requestType: requestType,
        reason: reason.val(),
        tag: tag.val(),
        zone: zone,
        idMechanic: idMechanic.val(),
        manager: manager.val(),
        managerEmail: managerEmail,
        requesterName: requesterName.val(),
        sManager: sManager.val(),
        sManagerEmail: sManagerEmail,
        listPart: listPart
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success("Thành công", "Thêm thành công");
            $("#modalAddRequest").modal("hide");
            $("#list-part-body").html("");
            listPart = [];
            partArr = [];
            socket.emit('add-part-request', { user: "", message: "" });
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function getMechanicById(event) {
    let idMechanic = $("#txtRPartIdMechanic").val();
    if (idMechanic.length >= 6 && event.keyCode === 13) {
        let action = baseUrl + 'request/get-mechanic';
        let datasend = {
            id: idMechanic,
        };
        LoadingShow();
        PostDataAjax(action, datasend, function (response) {
            LoadingHide();
            if (response.rs) {
                if (response.data) {
                    $("#txtRPartManager").val(response.data.manager);
                    $("#txtRPartManagerEmail").val(response.data.email);
                    $("#txtRPartRequesterName").val(response.data.fullname);
                }
                else
                    toastr.error("Không tồn tại thợ máy với id này", "Thất bại");
            }
            else {
                toastr.error(response.msg, "Thất bại");
            }
        });
    }
}

function Approve(type) {
    let id = $("#txtURId").val();

    let action = baseUrl + 'request/manager-approve';
    if (type == Enum_User_Type.SeniorManager) {
        action = baseUrl + 'request/senior-manager-approve';
    }

    let datasend = {
        id: id
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            toastr.success("Thành công", "Cập nhật thành công");
            $("#modalUpdateRequest").modal("hide");
            socket.emit('update-part-request', { user: "", message: "" });
        }
        else {
            LoadingHide();
            toastr.error(response.msg);
        }
    });
}

function Reject(type) {
    let id = $("#txtURId").val();
    let comment = $("#txtManagerComment").val();
    let action = baseUrl + 'request/manager-reject';
    if (type == Enum_User_Type.SeniorManager) {
        comment = $("#txtSManagerComment").val();
        action = baseUrl + 'request/senior-manager-reject';
    }
    if (type == Enum_User_Type.Clerk) {
        comment = $("#txtClerkComment").val();
        action = baseUrl + 'request/clerk-reject';
    }

    let datasend = {
        id: id,
        comment: comment
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            toastr.success("Thành công", "Cập nhật thành công");
            $("#modalUpdateRequest").modal("hide");
            socket.emit('update-part-request', { user: "", message: "" });
        }
        else {
            LoadingHide();
            toastr.error(response.msg);
        }
    });
}

// Cập nhật yêu cầu vật tư
function clerkApprove() {
    listPart = [];
    let id = $("#txtURId").val();
   
    let partCodeList = $(".URPartCode");
    let qtyList = $(".URQty");
    let remainQtyList = $(".URRemainQty");
    let exportQtyList = $(".URExportQty");
    let comment = $("#txtClerkComment").val();

    for (let i = 0; i < partArrUpdate.length; i++) {
        let ele = partArrUpdate[i].id;
        partCode = $(partCodeList[i]).val();
        qty = isNaN(parseInt($(qtyList[i]).val())) ? 0 : parseInt($(qtyList[i]).val());
        remainQty = isNaN(parseInt($(remainQtyList[i]).val())) ? 0 : parseInt($(remainQtyList[i]).val());
        exportQty = isNaN(parseInt($(exportQtyList[i]).val())) ? 0 : parseInt($(exportQtyList[i]).val());
        detailId = $(exportQtyList[i]).attr("data-value");

        if (exportQty < 0) {
            toastr.error("Số lượng xuất không nhỏ hơn 0.");
            $("#export-qty-" + ele).focus();
            listPart = [];
            return false;
        }

        if (exportQty > qty) {
            toastr.error("Số lượng xuất không lớn hơn số lượng yêu cầu.");
            $("#export-qty-" + ele).focus();
            listPart = [];
            return false;
        }

        if (exportQty > remainQty) {
            toastr.error("Trong kho không đủ số lượng.");
            $("#export-qty-" + ele).focus();
            listPart = [];
            return false;
        }

        listPart.push({
            code: partCode,
            export_qty: exportQty,
            detail_id: detailId
        });
    }

    let action = baseUrl + 'request/clerk-update';
    let datasend = {
        id: id,
        listPart: listPart,
        comment: comment
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success("Thành công", response.msg);
            $("#modalUpdateRequest").modal("hide");
            listPart = [];
            partArrUpdate = [];
            socket.emit('update-part-request', { user: "", message: "" });
        }
        else {
            listPart = [];
            partArrUpdate = [];
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// Cập nhật yêu cầu vật tư
function updateRequest() {
    let id = $("#txtURId");
    let name = $("#txtURPartName");
    let code = $("#txtURPartCode");
    let qty = $("#txtURPartQty");
    let location = $("#txtURPartLocation");
    let reason = $("#txtURPartReason");
    let tag = $("#txtURMachineTag");
    let zone = $("#txtURZone");
    // let idMechanic = $("#txtURPartIdMechanic");
    // let manager = $("#txtURPartManager");

    if (!CheckNullOrEmpty(name, "Tên part không được để trống"))
        return false;
    if (!CheckNullOrEmpty(code, "Mã part không được để trống"))
        return false;
    if (!CheckNullOrEmpty(tag, "Tag máy không được để trống"))
        return false;
    if (parseInt(qty.val()) <= 0) {
        toastr.error("Số lượng không nhỏ hơn 0.");
        return false;
    }
    let remainQty = parseInt($("#txtURPartRemainQty").text());
    if (remainQty < parseInt(qty.val())) {
        toastr.error("Trong kho không đủ số lượng.");
        return false;
    }

    let action = baseUrl + 'request/update';
    let datasend = {
        id: id.val(),
        name: name.val(),
        code: code.val(),
        qty: qty.val(),
        location: location.val(),
        reason: reason.val(),
        tag: tag.val(),
        zone: zone.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success("Thành công", "Cập nhật thành công");
            $("#modalUpdateRequest").modal("hide");
            socket.emit('update-part-request', { user: "", message: "" });
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// Tải báo cáo
function report() {
    LoadingShow();
    let zone = $("#txtDownloadZone").val();
    let txtDownloadType = $("#txtDownloadType").val();
    let filterDate = $("#txtTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtReportFrom").val() + ";" + $("#txtReportTo").val();
    }

    let action = baseUrl + 'request/download';
    let datasend = {
        zone: zone,
        downloadType: txtDownloadType,
        filterDate: filterDate
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
        return download(blob, GetTodayDate() + "_spare_part_request.xlsx");
    });
}

var index = 1;
var partArr = [];
var partArrUpdate = [];
var listPart = [];
function addRow(){
    let idx = ++index;
    partArr.push({
        id: idx,
    })

    let html = `<tr id="tr-${idx}">
                    <td>
                        <select id='model-${idx}' class="form-control list-model" onchange="changeModel('${idx}')">
                            <option value="" selected="" disabled="">Select item...</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="form-control txtRSearchPartModel" data-value='${idx}' id="txtRSearchPartModel-${idx}">
                        <div class="d-none search-model-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 290px; border-radius: 3px; background: whitesmoke;overflow-y: scroll">
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control RPartName" data-value='${idx}' id='name-${idx}'>
                        <div class="d-none search-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control RPartCode" data-value='${idx}' id='code-${idx}'>
                        <div class="d-none search-code-result-panel" style="border: 1px dotted yellowgreen; width: 100%; height: 250px;overflow-y: scroll; border-radius: 3px; background: whitesmoke;">
                        </div>
                    </td>
                    <td>
                        <div class="input-group eye-password">
                            <input type="number" class="form-control RQty" data-value='${idx}' id='qty-${idx}'>
                            <div class="input-group-addon">
                                <span class="RRemainQty" id='remain-qty-${idx}'></span>
                            </div>
                        </div>
                    </td>
                    <td><input type="text" class="form-control RLocation" id='location-${idx}' disabled></td>
                    <td><input type="text" class="form-control RPartReason" id='reason-${idx}'></td>
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

// txtRModelChange
function changeModel(idx) {
    let panel = $("#model-" + idx).parent().next().find(".search-model-panel");
    let model = $("#model-" + idx).val();

    // create request to send to server then return a list of part
    let action = baseUrl + 'request/get-part-by-model';
    let datasend = {
        model: model,
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            if (response.data.length >= 1) {
                let data = response.data;
                partArrSearch = data;
                let html = "";
                for (let i = 0; i < data.length; i++) {
                    let ele = data[i];
                    html += `<div class='d-flex part-result' onclick="selectPart(${ele.id}, ${idx})">`
                        + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) + "' width='75px' loading='lazy' />"
                        + "<div class=''>"
                        + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                        + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                        + "</div>"
                        + "</div>";
                }
                $(panel).removeClass('d-none');
                $(panel).html('');
                $(panel).html(html);
                $("#txtRSearchPartModel-" + idx).focus();
            }
            else {
                $(panel).addClass('d-none');
                $(panel).html('');
            }
        }
        else {
            $(panel).addClass('d-none');
            $(panel).html('');
        }
    });
}

// tìm kiếm part 
$(document).on("keyup", ".txtRSearchPartModel", $.debounce(250, searchPartInModelList));
var partArrSearch = [];
function searchPartInModelList() {
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
                                    + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) +"' width='75px' />"
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

// tìm kiếm part 
$(document).on("keyup", ".RPartName", $.debounce(250, searchPartByName));
$(document).on("keyup", ".RPartCode", $.debounce(250, searchPartByCode));

function searchPartByName() {
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
                                    + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) +"' width='75px' />"
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

function searchPartByCode() {
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
                                    + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) +"' width='75px' />"
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
    $("#location-" + value).val(selectedPart.location);
    $("#remain-qty-" + value).text(selectedPart.quantity);
    
    // close search result panel
    $(".search-result-panel").addClass('d-none');
    $(".search-result-panel").html('');
    $(".search-code-result-panel").addClass('d-none');
    $(".search-code-result-panel").html('');
    $(".search-model-panel").addClass('d-none');
    $(".search-model-panel").html('');
}

// txtURModelChange
function changeURModel() {
    let panel = ".UR-search-model-panel";
    let model = $("#txtURModel").val();

    // create request to send to server then return a list of part
    let action = baseUrl + 'request/get-part-by-model';
    let datasend = {
        model: model,
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            if (response.data.length >= 1) {
                let data = response.data;
                partURArr = data;
                let html = "";
                for (let i = 0; i < data.length; i++) {
                    let ele = data[i];
                    let name = ele.name.replaceAll('"', '');
                    html += `<div class='d-flex part-result' onclick="selectURPart('${name}')">`
                        + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) + "' width='75px' loading='lazy' />"
                        + "<div class=''>"
                        + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                        + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                        + "</div>"
                        + "</div>";
                }
                $(panel).removeClass('d-none');
                $(panel).html('');
                $(panel).html(html);
                $("#txtUSearchPartModel").focus();
            }
            else {
                $(panel).addClass('d-none');
                $(panel).html('');
            }
        }
        else {
            $(panel).addClass('d-none');
            $(panel).html('');
        }
    });
}

$("#txtUSearchPartModel").on("keyup", $.debounce(250, searchUPartInModelList));
function searchUPartInModelList() {
    let panel = ".UR-search-model-panel";
    let part = $("#txtUSearchPartModel").val();
    setTimeout(function () {
        if (part.length >= 1) {
            setTimeout(function () {
                tempList = [];
                tempList = partURArr.filter(element => stringToSlug(element.name).indexOf(part.toLowerCase()) > -1);
                if (tempList.length > 0) {
                    data = tempList;
                    let html = "";
                    for (let i = 0; i < data.length; i++) {
                        let ele = data[i];
                        let name = ele.name.replaceAll('"', '');
                        html += `<div class='d-flex part-result' onclick="selectURPart('${name}')">`
                            + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) + "' width='75px' loading='lazy' />"
                            + "<div class=''>"
                            + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                            + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                            + "</div>"
                            + "</div>";
                    }
                    $(panel).removeClass('d-none');
                    $(panel).html('');
                    $(panel).html(html);
                }
                else {
                    $(panel).removeClass('d-none');
                    $(panel).html('');
                }
            });
        } else {
            let html = "";
            for (let i = 0; i < partURArr.length; i++) {
                let ele = partURArr[i];
                html += `<div class='d-flex part-result' onclick="selectURPart('${ele.name}')">`
                    + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) + "' width='75px' loading='lazy' />"
                    + "<div class=''>"
                    + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                    + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                    + "</div>"
                    + "</div>";
            }
            $(panel).removeClass('d-none');
            $(panel).html('');
            $(panel).html(html);
        }
    });
}

// Tìm kiếm part
$("#txtURPartName").on("keyup", $.debounce(250, searchURPartByName));
$("#txtURPartCode").on("keyup", $.debounce(250, searchURPartByCode));
var partURArr = [];

function searchURPartByName() {
    let panel = ".UR-search-result-panel";
    partURArr = [];
    let keyword = $("#txtURPartName").val();
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
                            partURArr = data;
                            let html = "";
                            for (let i = 0; i < data.length; i++) {
                                let ele = data[i];
                                let name = ele.name.replaceAll('"', '');
                                html += `<div class='d-flex part-result' onclick="selectURPart('${name}')">`
                                    + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) + "' width='75px' loading='lazy' />"
                                    + "<div class=''>"
                                    + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                                    + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                                    + "</div>"
                                    + "</div>";
                            }
                            $(panel).removeClass('d-none');
                            $(panel).html('');
                            $(panel).html(html);
                        }
                        else {
                            $(panel).addClass('d-none');
                            $(panel).html('');
                        }
                    }
                    else {
                        $(panel).addClass('d-none');
                        $(panel).html('');
                    }
                });
            });
        } else {
            $(panel).addClass('d-none');
            $(panel).html('');
        }
    });
}

function searchURPartByCode() {
    let panel = ".UR-search-code-result-panel";
    partURArr = [];
    let keyword = $("#txtURPartCode").val();
    setTimeout(function () {
        if (keyword.length >= 1) {
            let datasend = {
                keyword: keyword,
                pageSize: 5,
                type: 1
            }
            let action = baseUrl + "suggest";
            PostDataAjax(action, datasend, function (response) {
                LoadingHide();
                setTimeout(function () {
                    if (response.rs) {
                        if (response.data.length >= 1) {
                            let data = response.data;
                            partURArr = data;
                            let html = "";
                            for (let i = 0; i < data.length; i++) {
                                let ele = data[i];
                                let name = ele.name.replaceAll('"', '');
                                html += `<div class='d-flex part-result' onclick="selectURPart('${name}')">`
                                    + "<img class='search-image' src='/Images/Parts/" + (ele.image == "" ? "no_image.png" : ele.image) + "' width='75px' loading='lazy' />"
                                    + "<div class=''>"
                                    + "<h5>Tên: <strong>" + ele.name + "</strong></h5>"
                                    + "<p class='m-0'>Mã: <strong>" + ele.code + "</strong></p>"
                                    + "</div>"
                                    + "</div>";
                            }
                            $(panel).removeClass('d-none');
                            $(panel).html('');
                            $(panel).html(html);
                        }
                        else {
                            $(panel).addClass('d-none');
                            $(panel).html('');
                        }
                    }
                    else {
                        $(panel).addClass('d-none');
                        $(panel).html('');
                    }
                });
            });
        } else {
            $(panel).addClass('d-none');
            $(panel).html('');
        }
    });
}

// select part
function selectURPart(name) {
    let listPart = partURArr.filter(function (ele) {
        return ele.name.replaceAll('"', '') == name;
    })

    let selectedPart = listPart[0];
    // full fill to input
    $("#txtURPartName").val(selectedPart.name);
    $("#txtURPartCode").val(selectedPart.code);
    $("#txtURPartLocation").val(selectedPart.location);
    $("#txtURPartRemainQty").text(selectedPart.quantity);

    $("#txtPartQtyWH").text(selectedPart.quantity);

    // close search result panel
    $(".UR-search-result-panel").addClass('d-none');
    $(".UR-search-result-panel").html('');
    $(".UR-search-code-result-panel").addClass('d-none');
    $(".UR-search-code-result-panel").html('');
    $(".UR-search-model-panel").addClass('d-none');
    $(".UR-search-model-panel").html('');
}

/*
    Warning part section
*/
function getWarningPart() {
    let keyword = $("#txtWarningPart").val();
    let action = baseUrl + 'warning';
    let datasend = {
        keyword: keyword == "" ? "" : keyword
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data;
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                html += "<tr>"
                    + "<td width='10%'>" + ele.id + "</td>"
                    + "<td width='20%'>" + ele.code + "</td>"
                    + "<td width='30%'>" + ele.name + "</td>"
                    + "<td width='20%'>" + ele.quantity + "</td>"
                    + "<td width='20%'>" + ele.min_quantity + "</td>"
                    + "</tr>";
            }
            $("#warning-table-body").html('');
            $("#warning-table-body").html(html);
            $("#warning-part-count").text("(" + data.length + ")");
        }
        else {

        }
    });
}

$("#txtWarningPart").on("keyup", $.debounce(250, searchWarningPart));
function searchWarningPart() {
    let keyword = $("#txtWarningPart").val();
    setTimeout(function () {
        if (keyword.length >= 1) {
            let datasend = {
                keyword: keyword == "" ? "" : keyword
            };
            let action = baseUrl + 'parts';
            PostDataAjax(action, datasend, function (response) {
                LoadingHide();
                setTimeout(function () {
                    if (response.rs) {
                        if (response.data.length >= 1) {
                            let data = response.data;
                            let html = "";
                            for (let i = 0; i < data.length; i++) {
                                let ele = data[i];
                                html += "<tr>"
                                    + "<td width='10%'>" + ele.id + "</td>"
                                    + "<td width='20%'>" + ele.code + "</td>"
                                    + "<td width='30%'>" + ele.name + "</td>"
                                    + "<td width='20%'>" + ele.quantity + "</td>"
                                    + "<td width='20%'>" + ele.min_quantity + "</td>"
                                    + "</tr>";
                            }
                            $("#warning-table-body").html('');
                            $("#warning-table-body").html(html);
                            $("#warning-part-count").text("(" + data.length + ")");
                        }
                        else {
                            $("#warning-table-body").html('');
                        }
                    }
                });
            });
        } else {
            getWarningPart()
        }
    });
}

function downloadWarningPart() {
    LoadingShow();
    let keyword = $("#txtWarningPart").val();
    let action = baseUrl + 'warning/download';
    let datasend = {
        keyword: keyword == "" ? "" : keyword
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
        return download(blob, GetTodayDate() + "_warning_part.xlsx");
    });
}

/*
    All part section
*/
var allPart = [];
$('.part-table').on('scroll', function() {
    let div = $(this).get(0);
    if(div.scrollTop + div.clientHeight >= div.scrollHeight - 20) {
        console.log(div.scrollHeight);
        let nextScreenData = allPart.splice(0, 50); // Sử dụng splice
        let html = "";
        for (let i = 0; i < nextScreenData.length; i++) {
            let ele = nextScreenData[i];
            html += "<tr>"
                + "<td width='10%'>" + ele.id + "</td>"
                + "<td width='20%'>" + ele.code + "</td>"
                + "<td width='20%'>" + ele.name + "</td>"
                + "<td width='20%'>" + ele.quantity + "</td>"
                + "<td width='20%'>" + ele.location + "</td>"
                + "<td width='10%'><a href='javascript:void(0)' onclick='getPartDetail(" + ele.id + ")'><i class='fa fa-edit'></i></s></td>"
                + "</tr>";
        }
        $("#all-table-body").append(html);
    }
});

function getAllPart() {
    let keyword = $("#txtAllPart").val();
    let action = baseUrl + 'parts';
    let datasend = {
        keyword: keyword == "" ? "" : keyword
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data;
            allPart = data;
            $("#all-part-count").text("(" + data.length + ")");

            let firstScreenData = data.splice(0, 50); // Sử dụng splice
            let html = "";
            for (let i = 0; i < firstScreenData.length; i++) {
                let ele = firstScreenData[i];
                html += "<tr>"
                    + "<td width='10%'>" + ele.id + "</td>"
                    + "<td width='20%'>" + ele.code + "</td>"
                    + "<td width='20%'>" + ele.name + "</td>"
                    + "<td width='20%'>" + ele.quantity + "</td>"
                    + "<td width='20%'>" + ele.location + "</td>"
                    + "<td width='10%'><a href='javascript:void(0)' onclick='getPartDetail(" + ele.id + ")'><i class='fa fa-edit'></i></s></td>"
                    + "</tr>";
            }
            $("#all-table-body").html('').html(html);


            // let data = response.data;
            // let html = "";
            // for (let i = 0; i < data.length; i++) {
            //     let ele = data[i];
            //     html += "<tr>"
            //         + "<td width='10%'>" + ele.id + "</td>"
            //         + "<td width='20%'>" + ele.code + "</td>"
            //         + "<td width='20%'>" + ele.name + "</td>"
            //         + "<td width='20%'>" + ele.quantity + "</td>"
            //         + "<td width='20%'>" + ele.location + "</td>"
            //         + "<td width='10%'><a href='javascript:void(0)' onclick='getPartDetail(" + ele.id + ")'><i class='fa fa-edit'></i></s></td>"
            //         + "</tr>";
            // }
            // $("#all-table-body").html('');
            // $("#all-table-body").html(html);
            // $("#all-part-count").text("(" + data.length + ")");
        }
        else {

        }
    });
}

// tìm kiếm all part
$("#txtAllPart").on("keyup", $.debounce(250, searchAllPart));
function searchAllPart() {
    let keyword = $("#txtAllPart").val();
    setTimeout(function () {
        if (keyword.length >= 1) {
            let datasend = {
                keyword: keyword == "" ? "" : keyword
            };
            let action = baseUrl + 'parts';
            PostDataAjax(action, datasend, function (response) {
                LoadingHide();
                setTimeout(function () {
                    if (response.rs) {
                        if (response.data.length >= 1) {
                            let data = response.data;
                            let html = "";
                            for (let i = 0; i < data.length; i++) {
                                let ele = data[i];
                                html += "<tr>"
                                    + "<td width='10%'>" + ele.id + "</td>"
                                    + "<td width='20%'>" + ele.code + "</td>"
                                    + "<td width='20%'>" + ele.name + "</td>"
                                    + "<td width='20%'>" + ele.quantity + "</td>"
                                    + "<td width='20%'>" + ele.location + "</td>"
                                    + "<td width='10%'><a href='javascript:void(0)' onclick='getPartDetail(" + ele.id + ")'><i class='fa fa-edit'></i></s></td>"
                                    + "</tr>";
                            }
                            $("#all-table-body").html('');
                            $("#all-table-body").html(html);
                            $("#all-part-count").text("(" + data.length + ")");
                        }
                        else {
                            $("#all-table-body").html('');
                        }
                    }
                });
            });
        } else {
            getAllPart()
        }
    });
}

// download warning part
function downloadPart() {
    LoadingShow();
    let criteria = $("#txtCriteria").val();
    let filterDate = $("#txtPartTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtPartFrom").val() + ";" + $("#txtPartTo").val();
    }

    let action = baseUrl + 'part/download';
    let datasend = {
        criteria: criteria,
        filterDate: filterDate
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
        return download(blob, GetTodayDate() + "_part.xlsx");
    });
}

// get part detail
function getPartDetail(id) {
    let action = baseUrl + 'parts/' + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data;

            $("#txtDPartId").val(data.id);
            $("#txtDPartName").val(data.name);
            $("#txtDPartCode").val(data.code);
            $("#txtDPartVendorCode").val(data.vendor_code);
            $("#txtDPartQty").val(data.quantity);
            $("#txtDPartMinQty").val(data.min_quantity);
            $("#txtDPartPrice").val(data.price);
            $("#txtDPartUnit").val(data.unit);
            $("#txtDPartLocation").val(data.location);
            $("#txtDPartDes").val(data.description);
            $("#d-part-img").attr("src", "/Images/Parts/" + (data.image ? data.image : "no_image.png"));
            $("#d-old-part-img").val(data.image ? data.image : "");
            $("#txtPartModel").select2().val([]).trigger("change");
            $("#txtPartModel").select2().val(data.machine_model.split(",").map(function (ele) { return ele })).trigger("change");
        }
        else {

        }
    });

    $("#modalUpdatePart").modal("show");
}

// get part detail by code
function getPartDetailByCode(code) {
    let datasend = {
        keyword: code,
        pageSize: 1,
        type: 1
    }
    let action = "/innovation/suggest";
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            $("#txtURPartRemainQty").text(response.data[0].quantity);
        }
        else {
            
        }
    });
}

// add part 
function addPart() {
    let name = $("#txtAPartName");
    let code = $("#txtAPartCode");
    let vendorCode = $("#txtAPartVendorCode");
    let qty = $("#txtAPartQty");
    let min_qty = $("#txtAPartMinQty");
    let location = $("#txtAPartLocation");
    let des = $("#txtAPartDes");
    let img = $("#part-image-upload").val();
    let price = $("#txtAPartPrice");
    let model = $("#txtAPartModel");

    if (!CheckNullOrEmpty(name, "Tên vật tư không được để trống"))
        return false;
    if (!CheckNullOrEmpty(code, "Mã vật tư không được để trống"))
        return false;
    if (parseInt(qty.val()) < 0) {
        alert("Số lượng không được nhỏ hơn 0");
        return false;
    }
    if (parseInt(min_qty.val()) < 0) {
        alert("Số lượng tối thiểu không được nhỏ hơn 0");
        return false;
    }
    if (parseInt(price.val()) < 0) {
        alert("Giá tối thiểu không được nhỏ hơn 0");
        return false;
    }

    let action = baseUrl + 'parts/add';
    let datasend = {
        name: name.val(),
        code: code.val(),
        vendorCode: vendorCode.val(),
        qty: qty.val(),
        min_qty: min_qty.val(),
        location: location.val(),
        des: des.val(),
        img: img,
        price: price.val(),
        model: model.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success("Thành công", "Thêm thành công");
            getAllPart();
            $("#modalAddPart").modal("hide");
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update part 
function updatePart() {
    let id = $("#txtDPartId");
    let name = $("#txtDPartName");
    let code = $("#txtDPartCode");
    let vendorCode = $("#txtDPartVendorCode");
    let qty = $("#txtDPartQty");
    let price = $("#txtDPartPrice");
    let min_quantity = $("#txtDPartMinQty");
    let unit = $("#txtDPartUnit");
    let location = $("#txtDPartLocation");
    let des = $("#txtDPartDes");
    let oldImg = $("#d-old-part-img").val();
    let img = $("#d-part-image-upload").val();
    let model = $("#txtPartModel").val();

    if (!CheckNullOrEmpty(name, "Tên vật tư không được để trống"))
        return false;
    if (!CheckNullOrEmpty(code, "Mã vật tư không được để trống"))
        return false;

    let action = baseUrl + 'parts/update';
    let datasend = {
        id: id.val(),
        name: name.val(),
        code: code.val(),
        vendorCode: vendorCode.val(),
        qty: qty.val(),
        location: location.val(),
        des: des.val(),
        price: price.val(),
        min_quantity: min_quantity.val(),
        unit: unit.val(),
        img: img,
        oldImg: oldImg,
        model: model
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success("Thành công", "Cập nhật thành công");
            getAllPart();
            $("#modalUpdatePart").modal("hide");
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// upload image 
function uploadImage(event) {

    let files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();
        reader.onload = function (event) {
            setTimeout(function () {
                let img = event.target.result;
                $("#part-img").attr("src", img);
                $("#d-part-img").attr("src", img);

                // let file = event.target.files[0];
                let imageType = /image.*/;

                if (!file.type.match(imageType)) return;

                let form_data = new FormData();
                form_data.append('file', file);

                for (let key of form_data.entries()) {
                    console.log(key[0] + ', ' + key[1]);
                }

                $.ajax({
                    url: baseUrl + "part/upload",
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: form_data,
                    type: 'POST',
                    success: function (response) {
                        console.log(response);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });

            }, 100);
        };
        reader.readAsDataURL(file);
    }
}

function uploadExcel() {
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
            url: baseUrl + 'upload-file',
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

function deleteRow(file) {
    $(event.currentTarget).parent().parent().remove();
}

function saveUploadData() {

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
    let action = baseUrl + 'part/save-upload-data';
    let datasend = {
        listData: listData
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg, "Thành công")
            $("#modalUploadData").modal('hide');
            getAllPart();
            $("#file-table-body").html('');
            $("#fileFabricReceiveUpload").val('');
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// #endregion

// #region Socket
const socket = io();

socket.on('add-part-request', (data) => {
    getAllRequest();
});

socket.on('update-part-request', (data) => {
    getAllRequest();
});

// #endregion