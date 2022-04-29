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

// Menu
$(".fr-navbar li:nth-child(2)").addClass("active");

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
                let isCanceled = ele.cancel_date ? "background: #fbc8c4" : "";
               
                html += `<tr class='tr-${ele.id}' style='${isCanceled}'>
                    <td>${ele.id}</td>
                    <td>${ele.filename}</td>
                    <td>
                        ${ele.wh_confirm_by == null ? `<div class='rounded-circle white' id='wh-circle-${ele.id}'></div>`
                        : `<div class='rounded-circle green' id='wh-circle-${ele.id}'></div>`
                        }  
                    </td>
                    <td>${ele.user_update}</td>
                    <td>${ele.date_update}</td>
                    <td>
                        ${ele.cancel_date == undefined || userLogin.position == "Admin"? 
                        `<a class='btn btn-sm btn-primary' href="/cutting/fabric-receive/return-data-detail?id=${ele.id}">WH</a>
                        <button class='btn btn-sm btn-primary ${ccd_display}' onclick="cancel(${ele.id})">Cancel</button>`
                        : "" }
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

function cancel(id){
    swal("Bạn có chắc chắn hủy phiếu này không? R U sure to cancel this ticket?", {
        buttons: ["No", "Yes!"],
    })
    .then((willDelete) => {
        if (willDelete) {
            let action = baseUrl + 'cancel-return-data';
            let datasend = {
                id: id
            };
            LoadingShow();
            PostDataAjax(action, datasend, function (response) {
                LoadingHide();
                if (response.rs) {
                    toastr.success("Hủy phiếu thành công", "Thành công");
                    getListReturnData();
                }
                else {
                    toastr.error(response.msg, "Thất bại");
                }
            });
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