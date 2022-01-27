var baseUrl = "/innovation/user/";
var machineArr = []; // danh sách machine

var supervisor = [
    { id: 1, value: "chvan", text: 'Trần Văn Chung', default: "" },
    { id: 2, value: "cnguyen", text: 'Nguyễn Chiến Thắng', default: "" },
    { id: 3, value: "codinh", text: 'Lê Công Định', default: "" },
    { id: 4, value: "minguye1", text: 'Nguyễn Ngọc Minh', default: "" },
    { id: 5, value: "ngbay", text: 'Nguyễn Văn Bẩy', default: "" },
    { id: 6, value: "ngdoanh", text: 'Nguyễn Ngọc Doanh', default: "" },
    { id: 7, value: "ngthinh", text: 'Nguyễn Văn Thịnh', default: "" },
    { id: 8, value: "xumanh", text: 'Hoàng Xuân Mạnh', default: "" },
    { id: 9, value: "trlong", text: 'Trần Văn Long', default: "" },
    { id: 10, value: "trluong", text: 'Trần Trọng Lương', default: "" },
    { id: 11, value: "tiluong", text: 'Lương Văn Tìm', default: "" }
]

// Refresh data
function refresh() {
    window.location.href = baseUrl;
}

$(document).on('click', '.dropdown-menu', function (e) {
    e.stopPropagation();
});

$(document).on('click', '.day', function (e) {
    $('.datepicker').css('display', 'none')
    e.preventDefault();
    e.stopPropagation();
})

// Load khi tải trang xong
$(document).ready(function () {
     // init list supervisor
     let html = "";
     for (let i = 0; i < supervisor.length; i++) {
         let ele = supervisor[i];
         html += `<option value='${ele.value}'>${ele.text}</option>`
     }
     $(".list-sup").append(html);

    // select2
    $("#txtAManager, #txtUManager").select2({
        placeholder: "Select a manager",
        allowClear: true,
        width: '100%'
    });

    $('.isDate').datepicker({
        format: "mm-dd-yyyy",
    });

    $('.modal').on('shown.bs.modal', function () {
        $(this).find('[autofocus]').focus();
    });

    getAllUser();
})

function getAllUser(){
    let manager =  $("#txtManager").val();
    let mechanicId = $("#txtMechanicId").val();
    let mechanicName = $("#txtMechanicName").val();

    let action = baseUrl + 'get';
    let datasend = {
        manager: manager,
        mechanicId: mechanicId,
        mechanicName: mechanicName
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                html += "<tr>"
                        + "<td width='10%'>"+ ele.id +"</td>"
                        + "<td width='20%'>"+ ele.id_mec +"</td>"
                        + "<td width='40%'>"+ ele.fullname +"</td>"
                        + "<td width='20%'>"+ ele.manager +"</td>"
                        + "<td width='10%'><a href='javascript:void(0)' onclick='getUserDetail("+ele.id+")'><i class='fa fa-edit' style='font-size: 14px'></i></a></td>"
                        + "</tr>";
            }
            $("#user-table-body").html('');
            $("#user-table-body").html(html);
            $("#user-count").text("(" + data.length + ")");
        }
        else{
            toastr.error(response.msg, " ");
        }
    });
}    

// download user
function downloadUser() {
    LoadingShow();
    let manager =  $("#txtManager").val();
    let mechanicId = $("#txtMechanicId").val();
    let mechanicName = $("#txtMechanicName").val();

    let action = baseUrl + 'download';
    let datasend = {
        manager: manager,
        mechanicId: mechanicId,
        mechanicName
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
        return download(blob, GetTodayDate() + "_mec_user.xlsx");
    });
}

function resetForm(){
    $("#txtAMechanicName").val('');
    $("#txtAMechanicId").val('');
}

// add user 
function addUser(){
    let mechanicName =  $("#txtAMechanicName");
    let mechanicId =  $("#txtAMechanicId");
    let manager =  $("#txtAManager");

    if (!CheckNullOrEmpty(mechanicName, "Tên không được để trống"))
        return false;
    if (!CheckNullOrEmpty(mechanicId, "Mã không được để trống"))
        return false;

    let action = baseUrl + 'add';
    let datasend = {
        manager: manager.val(),
        mechanicId: mechanicId.val(),
        mechanicName: mechanicName.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Thêm thành công");
            getAllUser();
            // $("#modalAddUser").modal("hide");
            resetForm()
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update user 
function updateUser(){
    let id = $("#txtUId");
    let mechanicName =  $("#txtUMechanicName");
    let mechanicId =  $("#txtUMechanicId");
    let manager =  $("#txtUManager");

    if (!CheckNullOrEmpty(mechanicName, "Tên không được để trống"))
        return false;
    if (!CheckNullOrEmpty(mechanicId, "Mã không được để trống"))
        return false;

    let action = baseUrl + 'update';
    let datasend = {
        id: id.val(),
        manager: manager.val(),
        mechanicId: mechanicId.val(),
        mechanicName: mechanicName.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Cập nhật thành công");
            getAllUser();
            $("#modalUpdateUser").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// get user detail
function getUserDetail(id){
    let action = baseUrl + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;

            $("#txtUId").val(data.id);
            $("#txtUMechanicName").val(data.fullname);
            $("#txtUMechanicId").val(data.id_mec);
            $("#txtUManager").val(data.manager).trigger("change");
            $("#modalUpdateUser").modal("show");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}