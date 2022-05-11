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

var fabricRollList = []; // danh sách dạng key value lưu trữ key là item color. value là danh sách các cuộn vải theo item color
var markerDetailList = []; // danh sách lưu trữ danh sách các mã vải
var selectedFabricRollList = []; // danh sách tổng các cuộn vải được chọn của cả phiếu
var selectedSavedFabricRollList = []; // danh sách tổng các cuộn vải được chọn của cả phiếu
var markerPlan = {};
function getMarkerPlanDetail() {
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

            if (markerPlan.wh_prepare == '0') {
                selectedFabricRollList = response.data.selectedFabricRoll;
                selectedFabricRollList.forEach(function (ele, index) {
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
            $("#txtWHNote").val(master.wh_note);

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
                    <td style='text-align: -webkit-right'>
                        ${ele.item_color != colorFlag ?
                        `<a class='btn btn-sm btn-primary' onclick='OpenModalMarkerDetail({id: ${ele.id}, group_id: ${ele.group_id}, wo: "${ele.wo}", ass: "${ele.ass}", item_color: "${ele.item_color}", yard: ${ele.yard_demand}})'>Select</a>`
                        :
                        ``
                    }
                    </td>
                </tr>`;
                colorFlag = ele.item_color;
            }

            $("#fabric-table-body").html('').append(html);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

var currentFabricRollList = []; // danh sách cuộn vải theo item color cụ thể
var currentMarkerDetail = {}; // marker detail hiện tại khi chọn để select các cuộn vải
var sum = 0; // biến tạm lưu tổng số yard của 1 marker detail
function OpenModalMarkerDetail(markerDetail) {
    // get selected roll from other ticket
    var otherSelecedRollList = [];
    var itemColor = markerDetail.item_color;
    let markerPlanId = markerDetail.group_id;
    let action = baseUrl + 'get-other-selected-roll';
    let datasend = {
        itemColor: itemColor,
        markerPlanId: markerPlanId
    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            otherSelecedRollList = response.data;

            // general information
            let sameItemColorList = markerDetailList.filter(x => x.item_color == markerDetail.item_color);
            let sumYard = sameItemColorList.reduce((a, b) => a + b.yard_demand, 0);
            let html = '';
            for (let i = 0; i < sameItemColorList.length; i++) {
                let ele = sameItemColorList[i];
                html += `<tr> 
                            <td>${i + 1}</td>
                            <td>${ele.item_color}</td>
                            <td>${ele.wo}</td>
                            <td>${ele.ass}</td>
                            <td>${ele.yard_demand}</td>
                        </tr>`
                                }
                                $("#item-color-table-body").html('').append(html);

                                html = `<tr>
                            <td class='text-left'>Tổng tồn kho khả dụng: <span class='text-danger' id='txtSumInventory'>0</span> Số lượng chọn / Số lượng marker yêu cầu: <span class='text-danger' id='txtFabricRollYard'>0</span> / <span class='text-success' id='txtFabricRollDemandYard'>${sumYard}</span></td>
                        </tr>`
                $("#sum-table-body").html(html);

            // open modal to fill-up data
            $("#modalFabricRoll").modal("show");
            currentMarkerDetail = markerDetail;
            sum = 0;

            // lấy dữ liệu nguồn các cuộn vải theo item_color của chi tiết marker
            let itemColorRollList = fabricRollList.filter(x => x.itemColor === markerDetail.item_color)[0].rollList;
            itemColorRollList = sortArrayByKey(itemColorRollList, 'unipack2', false);
            currentFabricRollList = itemColorRollList;

            selectedRollList = selectedFabricRollList.filter(x => x.marker_plan_detail_id == markerDetail.id);

            // itemColorRollList = itemColorRollList.concat(selectedRollList);
            // console.log(itemColorRollList);
            // itemColorRollList = unique(itemColorRollList, ['unipack2', 'yard']);

            html = '';
            if (markerPlan.wh_prepare == '0') { // warehouse đã chuẩn bị phiếu - wh_prepare
                //selectedRollList = selectedFabricRollList.filter(x => x.marker_plan_detail_id == markerDetail.id);  

                for (let i = 0; i < selectedRollList.length; i++) {
                    let ele = selectedRollList[i];

                    let sameRollRemainYard = itemColorRollList.filter(x => x.unipack2 == ele.unipack2);
                    if (sameRollRemainYard && sameRollRemainYard.length > 0) {
                        let i = itemColorRollList.indexOf(sameRollRemainYard[0]);
                        itemColorRollList.splice(i, 1);

                        if (ele.yard == sameRollRemainYard[0].yard) {
                            ele.yard = ele.yard - parseFloat(ele.usedYard);
                        }
                        else {
                            ele.yard = sameRollRemainYard[0].yard;
                        }
                    }
                    // notice here assign ele.yard = 0 for remain if not exist in TTS or the roll has been used. or calculte to a variable to avoid problem
                    else{
                        ele.yard = 0;
                    }

                    html += `<tr id='tr-${ele.roll_id}'>
                                <td>
                                    <input type='checkbox' data-id='${ele.roll_id}' class='marker-select' id='cb-${ele.roll_id}' checked onchange="selectMarker()" style='transform: scale(1.5)' />
                                </td>
                                <td>${ele.unipack2}</td>
                                <td>${ele.rlocbr}</td>
                                <td>
                                    <div class="input-group eye-password">
                                        <input type="number" class="form-control" data-id='${ele.roll_id}' max="${ele.usedYard + ele.yard}" min="0" old-val="${ele.usedYard}" value="${ele.usedYard}" id="used-yard-${ele.roll_id}" onchange="yardChange()">
                                        <div class="input-group-addon">
                                            <span class="" id="inventory-yard-${ele.roll_id}">${ele.yard}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>${ele.rfinwt}</td>
                                <td>${ele.shade}</td>
                                <td>${ele.rgrade}</td>
                                <td>${ele.qccomment}</td>
                                <td>
                                    <input type='text' class='form-control' data-id='${ele.roll_id}' id='note-${ele.roll_id}' value="${ele.note ? ele.note : ""}" onchange="noteChange()" />
                                </td>
                                <td>${ele.item_color}</td>
                                <td>${ele.with_actual}</td>
                                <td>${ele.vendor}</td>
                            </tr>`;
                }
            }

            // Loại những cuộn cùng item_color được chỉ định ở phiếu khác
            for (let i = 0; i < otherSelecedRollList.length; i++) {
                let ele = otherSelecedRollList[i];

                let sameRoll = itemColorRollList.filter(x => x.unipack2 == ele.unipack2);
                if (sameRoll.length > 0) {
                    let i = itemColorRollList.indexOf(sameRoll[0]);
                    itemColorRollList.splice(i, 1);
                }
            }

            // Tính tổng tồn kho. Nếu còn đủ thì chọn không thì thôi
            let sumInventory = parseFloat(itemColorRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard), 0));
            $("#txtSumInventory").text(sumInventory.toFixed(2));

            // Hiển thị những cuộn khả dụng còn lại
            for (let i = 0; i < itemColorRollList.length; i++) {
                let ele = itemColorRollList[i];

                // kiểm tra xem danh sách chọn cuộn vải đã có cuộn này theo mã id cuộn và mã id chi tiết marker
                // let selectedRollList = selectedFabricRollList.filter(x => x.id == ele.id && x.markerDetailId == markerDetail.id);
                let selectedRollList = selectedFabricRollList.filter(x => x.unipack2 == ele.unipack2 && x.markerDetailId == markerDetail.id);

                let isSelected = selectedRollList.length > 0 ? true : false; // nếu có thì checked checkbox

                // kiểm tra xem danh sách chọn cuộn vải đã có cuộn này theo mã id cuộn và số lượng yard đã hết hay còn
                let remainYard = parseFloat(ele.yard) - parseFloat(selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.usedYard), 0));

                if (isSelected) {
                    html += `<tr id='tr-${ele.id}'>
                                <td>
                                    <input type='checkbox' data-id='${ele.id}' class='marker-select' id='cb-${ele.id}' checked onchange="selectMarker()" style='transform: scale(1.5)' />
                                </td>
                                <td>${ele.unipack2}</td>
                                <td>${ele.rlocbr}</td>
                                <td>
                                    <div class="input-group eye-password">
                                        <input type="number" class="form-control" data-id='${ele.id}' max="${remainYard}" min="0" value="${selectedRollList[0].usedYard}" id="used-yard-${ele.id}" onchange="yardChange()">
                                        <div class="input-group-addon">
                                            <span class="" id="inventory-yard-${ele.id}">${remainYard}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>${ele.rfinwt}</td>
                                <td>${ele.shade}</td>
                                <td>${ele.rgrade}</td>
                                <td>${ele.qccomment}</td>
                                <td>
                                    <input type='text' class='form-control' data-id='${ele.id}' id='note-${ele.id}' value="${ele.note ? ele.note : ""}" onchange="noteChange()" />
                                </td>
                                <td>${ele.item_color}</td>
                                <td>${ele.with_actual}</td>
                                <td>${ele.vendor}</td>
                            </tr>`;
                }
                else {
                    if (remainYard > 0) {
                        html += `<tr id='tr-${ele.id}'>
                                    <td>
                                        <input type='checkbox' data-id='${ele.id}' class='marker-select' id='cb-${ele.id}' onchange="selectMarker()" style='transform: scale(1.5)' />
                                    </td>
                                    <td>${ele.unipack2}</td>
                                    <td>${ele.rlocbr}</td>
                                    <td>
                                        <div class="input-group eye-password">
                                            <input type="number" class="form-control" data-id='${ele.id}' max="${remainYard}" min="0" value="${remainYard}" id="used-yard-${ele.id}" onchange="yardChange()" disabled>
                                            <div class="input-group-addon">
                                                <span class="" id="inventory-yard-${ele.id}">${remainYard}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${ele.rfinwt}</td>
                                    <td>${ele.shade}</td>
                                    <td>${ele.rgrade}</td>
                                    <td>${ele.qccomment}</td>
                                    <td>
                                        <input type='text' class='form-control' data-id='${ele.id}' id='note-${ele.id}' value="${ele.note ? ele.note : ""}" onchange="noteChange()" disabled />
                                    </td>
                                    <td>${ele.item_color}</td>
                                    <td>${ele.with_actual}</td>
                                    <td>${ele.vendor}</td>
                                </tr>`;
                    }
                }
            }

            $("#fabric-roll-table-body").html('');
            $("#fabric-roll-table-body").append(html);
            // tính tổng số yard các cuộn vải theo chi tiết marker
            $("#txtFabricRollYard").text(selectedFabricRollList.filter(x => x.markerDetailId == currentMarkerDetail.id).reduce((a, b) => parseFloat(a) + parseFloat(b.usedYard), 0));

        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function selectMarker() {
    let currentEle = $(event.target);
    let id = currentEle.attr('data-id');
    let isCheck = $(`#cb-${id}`).is(":checked");
    let currentNoteEle = $(`#note-${id}`);
    let currentYardEle = $(`#used-yard-${id}`);
    let usedYard = currentYardEle.val();

    // copy thông tin của cuộn vải được chọn kèm số yard sử dụng => không làm thay đổi dữ liệu nguồn các cuộn vải
    let tempRollInfo = currentFabricRollList.filter(x => x.id == id)[0];
    let rollInfo = Object.assign({}, tempRollInfo);
    rollInfo.usedYard = usedYard;
    rollInfo.markerDetailId = currentMarkerDetail.id;
    rollInfo.marker_plan_detail_id = currentMarkerDetail.id;
    rollInfo.markerPlanId = markerPlan.id;
    rollInfo.marker_plan_id = markerPlan.id;
    rollInfo.roll_id = rollInfo.id;

    let rootEleYard = parseFloat($(`#inventory-yard-${id}`).text());

    if (isCheck) {
        currentYardEle.removeAttr("disabled");
        currentNoteEle.removeAttr("disabled");

        // thêm vào danh sách tổng các cuộn vải được chọn
        selectedFabricRollList.push(rollInfo);

        $(`#inventory-yard-${id}`).text(rootEleYard - parseFloat(usedYard));
    }
    else {
        currentYardEle.attr("disabled", "disabled");
        currentNoteEle.attr("disabled", "disabled");

        // xóa đi cuộn vải trong danh sách tổng các cuộn vải được chọn
        // let objDelete = selectedFabricRollList.filter(x => x.id == id && x.markerDetailId == currentMarkerDetail.id)[0];
        let objDelete = selectedFabricRollList.filter(x => x.roll_id == id && x.markerDetailId == currentMarkerDetail.id)[0];
        let i = selectedFabricRollList.indexOf(objDelete);
        selectedFabricRollList.splice(i, 1);

        currentFabricRollList.push(objDelete); // trường hợp cuộn vải đã được lưu và untick thì thêm vào list cuộn vải chưa lưu lúc đầu
        $(`#inventory-yard-${id}`).text(rootEleYard + parseFloat(usedYard));
    }

    // tính tổng số yard các cuộn vải theo chi tiết marker
    $("#txtFabricRollYard").text(selectedFabricRollList.filter(x => x.markerDetailId == currentMarkerDetail.id).reduce((a, b) => parseFloat(a) + parseFloat(b.usedYard), 0));
}

function yardChange() {
    let currentEle = $(event.target);
    let id = parseInt(currentEle.attr('data-id'));
    let currentYardEle = $(`#used-yard-${id}`);
    let usedYard = parseFloat(currentYardEle.val());
    let oldVal = parseFloat(currentEle.attr('old-val'));
    currentEle.attr('old-val', usedYard);

    // let rollInfo = selectedFabricRollList.filter(x => x.id == id && x.markerDetailId == currentMarkerDetail.id)[0];
    let rollInfo = selectedFabricRollList.filter(x => x.roll_id == id && x.markerDetailId == currentMarkerDetail.id)[0];

    let sumYard = rollInfo.yard;
    if (!rollInfo.date_update) {
        sumYard = oldVal + parseFloat($(`#inventory-yard-${id}`).text());
    }

    let remainYard = 0;
    if (sumYard - usedYard < 0)
        remainYard = sumYard + usedYard;
    else if (sumYard - usedYard > 0)
        remainYard = sumYard - usedYard;
    else
        remainYard = 0;
    $(`#inventory-yard-${id}`).text(remainYard);

    rollInfo.usedYard = usedYard;
    // tính tổng số yard các cuộn vải theo chi tiết marker
    $("#txtFabricRollYard").text(selectedFabricRollList.filter(x => x.markerDetailId == currentMarkerDetail.id).reduce((a, b) => parseFloat(a) + parseFloat(b.usedYard), 0));
}

function noteChange() {
    let currentEle = $(event.target);
    let id = currentEle.attr('data-id');
    let currentNoteEle = $(`#note-${id}`);
    let note = currentNoteEle.val();

    let rollInfo = selectedFabricRollList.filter(x => x.id == id && x.markerDetailId == currentMarkerDetail.id)[0];
    rollInfo.note = note;
}

// change color of ....
function confirmSelectedMarker() {
    let isLess = parseFloat($('#txtFabricRollYard').text()) < parseFloat($('#txtFabricRollDemandYard').text());
    if (isLess) {
        toastr.warning("Bạn chưa chọn đủ cuộn vải với số lượng yard cần", "Cảnh báo");
    }

    $(`#tr-${currentMarkerDetail.id}`).css("background", `${isLess ? "#ef9b95" : "#b5d7b5"}`);
    $("#modalFabricRoll").modal("hide");
}

function whSubmitData() {
    Action(markerPlan.id);
}

function whPrepare() {
    markerPlan.note = $("#txtNote").val();
    markerPlan.wh_note = $("#txtWHNote").val();
    // send to server
    let action = baseUrl + 'warehouse-confirm';
    let datasend = {
        markerPlan: markerPlan,
        markerDetailList: markerDetailList,
        selectedRollList: selectedFabricRollList
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success(response.msg);
            setTimeout(function () {
                window.location.href = "/cutting/fabric-receive";
            }, 1000)

            //Action(markerPlan.id);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function openPreviewTicket() {
    $("#modalPreviewTicket").modal("show");
    getMarkerPlanDetailPreview();
}

function getMarkerPlanDetailPreview() {

    $("#txtPReceiveDate").val(markerPlan.receive_date);
    $("#txtPReceiveTime").val(markerPlan.receive_time);
    $("#txtPGroup").val(markerPlan._group);
    $("#txtPCutDate").val(markerPlan.cut_date);
    $("#txtPCreatedDate").val(markerPlan.date_update);
    $("#txtPWeek").val(new Date(markerPlan.date_update).getWeekNumber());
    $("#txtPNote").val(markerPlan.note);

    let html = '';
    let colorFlag = '';
    for (let i = 0; i < markerDetailList.length; i++) {
        let eleMarkerDetail = markerDetailList[i];
        if (eleMarkerDetail.item_color != colorFlag) {
            let selectedRollList = selectedFabricRollList.filter(x => x.markerDetailId == eleMarkerDetail.id);
            let sumYard = selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.usedYard), 0);
            let rollCount = selectedRollList.length;
            let sameColorList = markerDetailList.filter(x => x.item_color == eleMarkerDetail.item_color);
            let sumDemandYard = sameColorList.reduce((a, b) => parseFloat(a) + parseFloat(b.yard_demand), 0);

            if (selectedRollList.length > 0) {
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

// Action
function Action(groupId) {
    // Call to server
    LoadingShow();
    var action = baseUrl + 'action';
    var datasend = {
        groupId: groupId,
        action: Enum_Action.WHSend,
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

// 
$(document).on("keyup", ".txtSearchBin", $.debounce(250, searchByColumn));
var isAsc = true;
function searchByColumn() {
    let currentInput = $(".txtSearchBin").val().toLowerCase();

    // lấy dữ liệu nguồn các cuộn vải theo item_color của chi tiết marker
    let itemColorRollList = fabricRollList.filter(x => x.itemColor === currentMarkerDetail.item_color)[0].rollList;
    itemColorRollList = sortArrayByKey(itemColorRollList, 'unipack2', false);
    currentFabricRollList = itemColorRollList;

    selectedRollList = selectedFabricRollList.filter(x => x.marker_plan_detail_id == currentMarkerDetail.id);

    // itemColorRollList = itemColorRollList.concat(selectedRollList);
    // console.log(itemColorRollList);
    // itemColorRollList = unique(itemColorRollList, ['unipack2', 'yard']);

    html = '';
    if (markerPlan.wh_prepare == '0') { // warehouse đã chuẩn bị phiếu - wh_prepare
        //selectedRollList = selectedFabricRollList.filter(x => x.marker_plan_detail_id == markerDetail.id);  

        for (let i = 0; i < selectedRollList.length; i++) {
            let ele = selectedRollList[i];

            let sameRollRemainYard = itemColorRollList.filter(x => x.unipack2 == ele.unipack2);
            if (sameRollRemainYard && sameRollRemainYard.length > 0) {
                let i = itemColorRollList.indexOf(sameRollRemainYard[0]);
                itemColorRollList.splice(i, 1);
                if (ele.yard == sameRollRemainYard[0].yard) {
                    ele.yard = ele.yard - parseFloat(ele.usedYard);
                }
                else {
                    ele.yard = sameRollRemainYard[0].yard;
                }
            }
            // notice here assign ele.yard = 0 for remain if not exist in TTS or the roll has been used. or calculte to a variable to avoid problem
            else{
                ele.yard = 0;
            }

            html += `<tr id='tr-${ele.roll_id}'>
                <td>
                    <input type='checkbox' data-id='${ele.roll_id}' class='marker-select' id='cb-${ele.roll_id}' checked onchange="selectMarker()" style='transform: scale(1.5)' />
                </td>
                <td>${ele.unipack2}</td>
                <td>${ele.rlocbr}</td>
                <td>
                    <div class="input-group eye-password">
                        <input type="number" class="form-control" data-id='${ele.roll_id}' max="${ele.usedYard + ele.yard}" min="0" old-val="${ele.usedYard}" value="${ele.usedYard}" id="used-yard-${ele.roll_id}" onchange="yardChange()">
                        <div class="input-group-addon">
                            <span class="" id="inventory-yard-${ele.roll_id}">${ele.yard}</span>
                        </div>
                    </div>
                </td>
                <td>${ele.rfinwt}</td>
                <td>${ele.shade}</td>
                <td>${ele.rgrade}</td>
                <td>${ele.qccomment}</td>
                <td>
                    <input type='text' class='form-control' data-id='${ele.roll_id}' id='note-${ele.roll_id}' value="${ele.note ? ele.note : ""}" onchange="noteChange()" />
                </td>
                <td>${ele.item_color}</td>
                <td>${ele.with_actual}</td>
                <td>${ele.vendor}</td>
            </tr>`;
        }
    }

    // start search and sort
    isAsc = !isAsc;
    itemColorRollList = sortArrayByKey(itemColorRollList, 'rlocbr', isAsc);
    itemColorRollList = itemColorRollList.filter(x => x.rlocbr.toLowerCase().includes(currentInput));
    // end search and sort

    for (let i = 0; i < itemColorRollList.length; i++) {
        let ele = itemColorRollList[i];

        // kiểm tra xem danh sách chọn cuộn vải đã có cuộn này theo mã id cuộn và mã id chi tiết marker
        // let selectedRollList = selectedFabricRollList.filter(x => x.id == ele.id && x.markerDetailId == markerDetail.id);
        let selectedRollList = selectedFabricRollList.filter(x => x.unipack2 == ele.unipack2 && x.markerDetailId == currentMarkerDetail.id);

        let isSelected = selectedRollList.length > 0 ? true : false; // nếu có thì checked checkbox

        // kiểm tra xem danh sách chọn cuộn vải đã có cuộn này theo mã id cuộn và số lượng yard đã hết hay còn
        let remainYard = parseFloat(ele.yard) - parseFloat(selectedRollList.reduce((a, b) => parseFloat(a) + parseFloat(b.usedYard), 0));

        if (isSelected) {
            html += `<tr id='tr-${ele.id}'>
                <td>
                    <input type='checkbox' data-id='${ele.id}' class='marker-select' id='cb-${ele.id}' checked onchange="selectMarker()" style='transform: scale(1.5)' />
                </td>
                <td>${ele.unipack2}</td>
                <td>${ele.rlocbr}</td>
                <td>
                    <div class="input-group eye-password">
                        <input type="number" class="form-control" data-id='${ele.id}' max="${remainYard}" min="0" value="${selectedRollList[0].usedYard}" id="used-yard-${ele.id}" onchange="yardChange()">
                        <div class="input-group-addon">
                            <span class="" id="inventory-yard-${ele.id}">${remainYard}</span>
                        </div>
                    </div>
                </td>
                <td>${ele.rfinwt}</td>
                <td>${ele.shade}</td>
                <td>${ele.rgrade}</td>
                <td>${ele.qccomment}</td>
                <td>
                    <input type='text' class='form-control' data-id='${ele.id}' id='note-${ele.id}' value="${ele.note ? ele.note : ""}" onchange="noteChange()" />
                </td>
                <td>${ele.item_color}</td>
                <td>${ele.with_actual}</td>
                <td>${ele.vendor}</td>
            </tr>`;
        }
        else {
            if (remainYard > 0) {
                html += `<tr id='tr-${ele.id}'>
                    <td>
                        <input type='checkbox' data-id='${ele.id}' class='marker-select' id='cb-${ele.id}' onchange="selectMarker()" style='transform: scale(1.5)' />
                    </td>
                    <td>${ele.unipack2}</td>
                    <td>${ele.rlocbr}</td>
                    <td>
                        <div class="input-group eye-password">
                            <input type="number" class="form-control" data-id='${ele.id}' max="${remainYard}" min="0" value="${remainYard}" id="used-yard-${ele.id}" onchange="yardChange()" disabled>
                            <div class="input-group-addon">
                                <span class="" id="inventory-yard-${ele.id}">${remainYard}</span>
                            </div>
                        </div>
                    </td>
                    <td>${ele.rfinwt}</td>
                    <td>${ele.shade}</td>
                    <td>${ele.rgrade}</td>
                    <td>${ele.qccomment}</td>
                    <td>
                        <input type='text' class='form-control' data-id='${ele.id}' id='note-${ele.id}' value="${ele.note ? ele.note : ""}" onchange="noteChange()" disabled />
                    </td>
                    <td>${ele.item_color}</td>
                    <td>${ele.with_actual}</td>
                    <td>${ele.vendor}</td>
                </tr>`;
            }
        }
    }

    $("#fabric-roll-table-body").html('');
    $("#fabric-roll-table-body").append(html);
}

// #endregion

// #region Socket

// #endregion