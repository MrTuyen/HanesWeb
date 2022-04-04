var baseUrl = "/system-user/";
var machineArr = []; // danh sách machine

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
    // select2
    $("#txtAManager, #txtUManager").select2({
        placeholder: "Select a dept",
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
    // let manager =  $("#txtManager").val();
    // let mechanicId = $("#txtMechanicId").val();
    // let mechanicName = $("#txtMechanicName").val();

    let action = baseUrl + 'get';
    let datasend = {
        // manager: manager,
        // mechanicId: mechanicId,
        // mechanicName: mechanicName
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
                        + "<td width='10%'>"+ ele.IdSystem +"</td>"
                        + "<td width='20%'>"+ ele.User +"</td>"
                        + "<td width='20%'>"+ ele.Name +"</td>"
                        + "<td width='20%'>"+ ele.Email +"</td>"
                        + "<td width='20%'>"+ ele.Department +"</td>"
                        + "<td width='10%'>"
                            + "<a href='javascript:void(0)' onclick='getUserDetail("+ele.IdSystem+")'><i class='fa fa-edit' style='font-size: 14px'></i></a>"
                            + "&nbsp;&nbsp;<a href='javascript:void(0)' onclick='deleteUser("+ele.IdSystem+")'><i class='fa fa-trash' style='font-size: 14px'></i></a>"
                        + "</td>"
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

// add user 
function addUser(){
    let username =  $("#txtAUsername");
    let fullname =  $("#txtAFullname");
    let email =  $("#txtAEmail");
    let dept =  $("#txtADept");
    let role =  $("#txtARole");
    let position =  $("#txtAPosition");

    if (!CheckNullOrEmpty(username, "Username không được để trống"))
        return false;
    if (!CheckNullOrEmpty(fullname, "Fullname không được để trống"))
        return false;
    if (!CheckNullOrEmpty(email, "Email không được để trống"))
        return false;

    let action = baseUrl + 'add';
    let datasend = {
        username: username.val(),
        fullname: fullname.val(),
        email: email.val(),
        dept: dept.val(),
        role: role.val(),
        position: position.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Thêm thành công");
            getAllUser();
            $("#modalAddUser").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update user 
function updateUser(){
    let id = $("#txtUId");
    let username =  $("#txtUUsername");
    let fullname =  $("#txtUFullname");
    let email =  $("#txtUEmail");
    let dept =  $("#txtUDept");
    let role =  $("#txtURole");
    let position =  $("#txtUPosition");

    if (!CheckNullOrEmpty(username, "Username không được để trống"))
        return false;
    if (!CheckNullOrEmpty(fullname, "Fullname không được để trống"))
        return false;
    if (!CheckNullOrEmpty(email, "Email không được để trống"))
        return false;

    let action = baseUrl + 'update';
    let datasend = {
        id: id.val(),
        username: username.val(),
        fullname: fullname.val(),
        email: email.val(),
        dept: dept.val(),
        role: role.val(),
        position: position.val()
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

// delete user
function deleteUser(id) {
    swal("Bạn có chắc xóa user này không? R U sure delete this user?", {
        buttons: ["No", "Yes!"],
    })
        .then((willDelete) => {
            if (willDelete) {
                // Call to server
                LoadingShow();
                var action = baseUrl + 'delete';
                var datasend = {
                    id: id
                };

                PostDataAjax(action, datasend, function (response) {
                    LoadingHide();
                    if (response.rs) {
                        toastr.success(response.msg);
                        getAllUser();
                    }
                    else {
                        toastr.error(response.msg);
                    }
                });
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
            $("#txtUId").val(data.IdSystem);
            $("#txtUUsername").val(data.User);
            $("#txtUFullname").val(data.Name);
            $("#txtUEmail").val(data.Email);
            $("#txtUDept").val(data.Department);
            $("#txtURole").val(data.Roles);
            $("#txtUPosition").val(data.Position);
            $("#modalUpdateUser").modal("show");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}