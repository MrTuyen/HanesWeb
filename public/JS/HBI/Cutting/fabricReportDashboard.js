/*
    Author: TuyenNV
    DateTime: 
*/

// #region System variable
const baseUrl = "/cutting/fabric-receive/";
const userLogin = JSON.parse(localStorage.getItem("user"));
var wh_display = (userLogin.dept == Enum_Department.Warehouse || userLogin.position == "Admin") ? "" : "display-none";
var ccd_display = (userLogin.dept == Enum_Department.Cutting || userLogin.position == "Admin") ? "" : "display-none";

const filterLocalStorage = "cutting_fr_report_filter";

// #endregion

// #region System Method

// Refresh data
function Refresh() {
    window.location.href = '/cutting/fabric-receive/report-dashboard';
}

// Menu
$(".fr-navbar li:nth-child(4)").addClass("active");

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

$(document).on("click",'.header', function(){
    $(this).toggleClass('expand').nextUntil('tr.header').slideToggle(100);
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
    if (localStorage.getItem(filterLocalStorage) != null) {
        let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
        $("#txtFilterGroup").val(filter ? filter.filterGroup : '');
        $("#txtFilterStatus").val(filter ? filter.filterStatus : '');
        $("#txtFilterWarehouseStatus").val(filter ? filter.filterWarehouseStatus : '');

        if (filter.viewType) {
            $("#cbViewType").attr('checked', true);
        } else {
            $("#cbViewType").attr('checked', false);
        }

        displayFilter();
    }
    changeViewType();
    getData();
})

function deleteFilter(obj) {
    let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
    filter[obj.key] = '';
    localStorage.setItem(filterLocalStorage, JSON.stringify(filter));
    Refresh();
}

function displayFilter() {
    if (localStorage.getItem(filterLocalStorage) != null) {
        let filter = JSON.parse(localStorage.getItem(filterLocalStorage));
        let filterGroup = filter.filterGroup ? `<span class="label label-info mr-2" style="cursor: pointer;" onclick="deleteFilter({key: 'filterGroup'})">${filter.filterGroup}<i class="fa fa-times"></i></span>` : "";

        $("#filter-area").html(filterGroup);
    }
}

function changeViewType() {
    $(`#dateValue`).css("display", "none");
    $(`#weekValue`).css("display", "none");
    let viewType = $(`#cbViewType`).is(":checked");
    if (!viewType) {
        $(`#dateValue`).css("display", "none");
        $(`#weekValue`).css("display", "block");
        $(`#txtFilterWeek`).focus();
        $(`#txtFilterWeek`).val(new Date().getWeekNumber());
    }
    else {
        $(`#dateValue`).css("display", "block");
        $(`#weekValue`).css("display", "none");
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

function getData() {
    let filterGroup = $("#txtFilterGroup").val();
    let filterDate = '';
    let filterWeek = '';
    let viewType = $("#cbViewType").is(":checked"); // Select date or week
    if (viewType) {
        filterDate = $("#txtFilterTime").val();
        if (filterDate.toString() == "5") {
            filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
        }
    }
    else {
        filterWeek = $("#txtFilterWeek").val();
    }

    let action = baseUrl + 'get-report-data';
    let datasend = {
        filterGroup: filterGroup,
        filterDate: filterDate,
        filterWeek: filterWeek,
        viewType: viewType
    };

    localStorage.setItem(filterLocalStorage, JSON.stringify(datasend));
    displayFilter();
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            let data = response.data;
            let html = '';

            for (let i = 0; i < data.master.length; i++) {
                let eleMarker = data.master[i];
                html += `<tr class="header expand">
                        <th>${i + 1}</th>
                        <th>${eleMarker._group}</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th>
                            <span class="fa-stack fa-sm">
                            <i class="fa fa-circle fa-stack-2x"></i>
                            <i class="fa fa-plus fa-stack-1x fa-inverse"></i>
                        </span>
                        </th>
                    </tr>`;

                for (let j = 0; j < data.detail.length; j++) {
                    let ele = data.detail[j];
                    html += `<tr>
                        <td></td>
                        <td>${j + 1}</td>
                        <td>${ele.item_color}</td>
                        <td>${ele.marker_request.toFixed(2)}</td>
                        <td>${ele.warehouse_supply.toFixed(2)}</td>
                        <td>${ele.request_more.toFixed(2)}</td>
                        <td>${ele.request_more_supply.toFixed(2)}</td>
                        <td>${ele.total_warehouse_supply.toFixed(2)}</td>
                        <td>${ele.return_qty.toFixed(2)}</td>
                        <td>${ele.diference.toFixed(2)}</td>
                    </tr>`;
                }
            }

            // for (let i = 0; i < data.length; i++) {
            //     let ele = data[i];
            //     html += `
            //         <tr>
            //             <td>${i + 1}</td>
            //             <td>${ele.group}</td>
            //             <td>${ele.item_color}</td>
            //             <td>${ele.marker_request}</td>
            //             <td>${ele.warehouse_supply}</td>
            //             <td>${ele.request_more}</td>
            //             <td>${ele.request_more_supply}</td>
            //             <td>${ele.total_warehouse_supply}</td>
            //             <td>${ele.return_qty}</td>
            //             <td>${ele.diference}</td>
            //         </tr>
            //     `;
            // }

            $("#report-table-body").html('').append(html);

        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function downloadMarkerData() {
    let filterGroup = $("#txtFilterGroup").val();
    let filterWarehouseStatus = $("#txtFilterWarehouseStatus").val();
    let filterStatus = $("#txtFilterStatus").val();
    let filterDate = '';
    let filterWeek = '';
    let viewType = $("#cbViewType").is(":checked"); // Select date or week
    if (viewType) {
        filterDate = $("#txtFilterTime").val();
        if (filterDate.toString() == "5") {
            filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
        }
    }
    else {
        filterWeek = $("#txtFilterWeek").val();
    }

    let action = baseUrl + 'download-marker-data';
    let datasend = {
        filterGroup: filterGroup,
        filterStatus: filterStatus,
        filterDate: filterDate,
        filterWeek: filterWeek,
        filterWarehouseStatus: filterWarehouseStatus
    };

    LoadingShow();
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
        return download(blob, GetTodayDate() + "_Demand_Fabric_Ticket.xlsx");
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