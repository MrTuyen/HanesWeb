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
    getMarkerPlanDetail();
})

var fabricRollList = [];
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
            let detail = response.data.detail;
            fabricRollList = response.data.fabricRoll;

            $("#txtReceiveDate").val(master.receive_date);
            $("#txtReceiveTime").val(master.receive_time);
            $("#txtGroup").val(master._group);
            $("#txtCutDate").val(master.cut_date);
            $("#txtCreatedDate").val(master.date_update);
            $("#txtWeek").val(new Date(new Date(master.date_update).formatDateDDMMYYYY()).getWeekNumber());
            $("#txtNote").val(master.note);

            $("#fabric-table-body").html('');
            let html = '';
            for (let i = 0; i < detail.length; i++) {
                let ele = detail[i];
                html += `<tr id='tr-${ele.id}'>
                    <td></td>
                    <td>${ele.wo}</td>
                    <td>${ele.ass}</td>
                    <td>${ele.item_color}</td>
                    <td>${ele.yard_demand}</td>
                    <td>
                        <a class='btn btn-sm btn-primary' onclick='OpenModalMarkerDetail({id: ${ele.id}, wo: "${ele.wo}", ass: "${ele.ass}", item_color: "${ele.item_color}", yard: ${ele.yard_demand}})'>Xem</a>
                    </td>
                </tr>`;
            }

            $("#fabric-table-body").append(html);
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

var currentFabricRollList = [];
var selectedFabricRollList = [];
var sum = 0;
function OpenModalMarkerDetail(markerDetail){
    sum = 0;
    // open modal to fill-up data
    $("#modalFabricRoll").modal("show");

    let itemColor = markerDetail.item_color;

    $("#txtWo").text(markerDetail.wo);
    $("#txtAss").text(markerDetail.ass);
    $("#txtItemColor").text(markerDetail.item_color);
    $("#txtDemandYard").text(markerDetail.yard);
    $("#txtFabricRollYard").text(0);


    let tempList = fabricRollList.filter(x => x.itemColor === itemColor)[0].rollList;
    tempList = sortArrayByKey(tempList, 'unipack2', false);
    currentFabricRollList = tempList;

    $("#fabric-roll-table-body").html('');
    let html = '';
    for (let i = 0; i < tempList.length; i++) {
        let ele = tempList[i];
        html += `<tr id='tr-${ele.id}'>
            <td>
                <input type='checkbox' data-id='${ele.id}' class='marker-select' id='cb-${ele.id}' onchange="selectMarker()" style='transform: scale(1.5)' />
            </td>
            <td>${ele.unipack2}</td>
            <td>${ele.rffsty}</td>
            <td>${ele.item_color}</td>
            <td>${ele.rcutwd}</td>
            <td>${ele.rfinwt}</td>
            <td>
                <div class="input-group eye-password">
                    <input type="number" class="form-control" data-id='${ele.id}' value="${ele.yard}" id="used-qty-${ele.id}" onchange="selectMarker()">
                    <div class="input-group-addon">
                        <span class="" id="inventory-qty-${ele.id}">${ele.yard}</span>
                    </div>
                </div>
            </td>
            <td>${ele.rlocbr}</td>
            <td>${ele.rgrade}</td>
            <td>${ele.shade}</td>
        </tr>`;
    }

    $("#fabric-roll-table-body").append(html);
}

function selectMarker(){
    let currentEle = $(event.target);
    let id = currentEle.attr('data-id');
    let isCheck = $(`#cb-${id}`).is(":checked");
    let usedQty = $(`#used-qty-${id}`).val();
    if(isCheck){
        sum += parseFloat(usedQty);
    }
    else{
        sum -= parseFloat(usedQty);
    }
    $("#txtFabricRollYard").text(sum);
}

// #endregion

// #region Socket
 
// #endregion