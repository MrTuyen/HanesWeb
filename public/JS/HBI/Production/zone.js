var baseUrl = "/production/";

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
    $('.modal').on('shown.bs.modal', function () {
        $(this).find('[autofocus]').focus();
    });

    getAllZone();
    setTimeout(function(){
        getAllLine();
    }, 200)
})

function DropDownListZone(list, selector, isAddAllOption){
    selector.html('');
    let html = "";
    if(isAddAllOption)
        html = "<option value='' selected>Tất cả</option>";
    for(let i = 0; i < list.length; i++){
        let ele = list[i];
        html += "<option value='"+ele.id+"'>"+ ele.name+ "</option>";
    }
    selector.append(html);
}

// ZONE
function getAllZone(){
    let action = baseUrl + 'zone/get';
    let datasend = {
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            DropDownListZone(data, $(".list-zone"), false);
            DropDownListZone(data, $("#txtFilterZone"), true);
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                html += "<tr>"
                        + "<td width='10%'>"+ ele.id +"</td>"
                        + "<td width='20%'>"+ ele.name +"</td>"
                        + "<td width='20%'>"+ ele.code +"</td>"
                        + "<td width='10%'>"+ (ele.type == Enum_Production.Production ? "Production" : ( ele.type == Enum_Production.Cutting ? "Cutting" : "Other")) +"</td>"
                        + "<td width='10%'>"+ ele.zone_order +"</td>"
                        + "<td width='10%'>"+ ele.last_update +"</td>"
                        + "<td width='10%'>"+ ele.user_update +"</td>"
                        + "<td width='10%'><a href='javascript:void(0)' onclick='getZoneDetail("+ele.id+")'><i class='fa fa-edit' style='font-size: 14px'></i></a></td>"
                        + "</tr>";
            }
            $("#zone-table-body").html('');
            $("#zone-table-body").html(html);
        }
        else{
            toastr.error(response.msg, " ");
        }
    });
}    

// add zone 
function addZone(){
    let name =  $("#txtAZoneName");
    let code =  $("#txtAZoneCode");
    let type =  $("#txtAZoneType");
    let order =  $("#txtAZoneOrder");

    if (!CheckNullOrEmpty(name, "Name không được để trống"))
        return false;

    let action = baseUrl + 'zone/add';
    let datasend = {
        name: name.val(),
        code: code.val(),
        type: type.val(),
        order: order.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Thêm thành công");
            getAllZone();
            $("#modalAddZone").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update zone 
function updateZone(){
    let id = $("#txtUZoneId");
    let name =  $("#txtUZoneName");
    let code =  $("#txtUZoneCode");
    let type =  $("#txtUZoneType");
    let order =  $("#txtUZoneOrder");

    if (!CheckNullOrEmpty(name, "Name không được để trống"))
        return false;

    let action = baseUrl + 'zone/update';
    let datasend = {
        id: id.val(),
        name: name.val(),
        code: code.val(),
        type: type.val(),
        order: order.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Cập nhật thành công");
            getAllZone();
            $("#modalUpdateZone").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// get zone detail
function getZoneDetail(id){
    let action = baseUrl + "zone/" + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            $("#txtUZoneId").val(data.id);
            $("#txtUZoneName").val(data.name);
            $("#txtUZoneCode").val(data.code);
            $("#txtUZoneType").val(data.type);
            $("#txtUZoneOrder").val(data.zone_order);
            $("#modalUpdateZone").modal("show");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// LINE
function getAllLine(){
    let zone = $("#txtFilterZone").val();
    let action = baseUrl + 'line/get';
    let datasend = {
        zone: zone
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
                        + "<td width='20%'>"+ ele.name +"</td>"
                        + "<td width='20%'>"+ ele.zone +"</td>"
                        + "<td width='20%'>"+ ele.last_update +"</td>"
                        + "<td width='20%'>"+ ele.user_update +"</td>"
                        + "<td width='10%'><a href='javascript:void(0)' onclick='getLineDetail("+ele.id+")'><i class='fa fa-edit' style='font-size: 14px'></i></a></td>"
                        + "</tr>";
            }
            $("#line-table-body").html('');
            $("#line-table-body").html(html);
        }
        else{
            toastr.error(response.msg, " ");
        }
    });
}    

// add line 
function addLine(){
    let name =  $("#txtALineName");
    let zoneName =  $("#txtULineZone option:selected");
    let zoneId =  $("#txtULineZone");

    if (!CheckNullOrEmpty(name, "Name không được để trống"))
        return false;

    let action = baseUrl + 'line/add';
    let datasend = {
        name: name.val(),
        zoneName: zoneName.text(),
        zoneId: zoneId.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Thêm thành công");
            getAllLine();
            $("#modalAddLine").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update line 
function updateLine(){
    let id = $("#txtULineId");
    let name =  $("#txtULineName");
    let zoneName =  $("#txtULineZone option:selected");
    let zoneId =  $("#txtULineZone");

    if (!CheckNullOrEmpty(name, "Name không được để trống"))
        return false;

    let action = baseUrl + 'line/update';
    let datasend = {
        id: id.val(),
        name: name.val(),
        zoneName: zoneName.text(),
        zoneId: zoneId.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Cập nhật thành công");
            getAllLine();
            $("#modalUpdateLine").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// get line detail
function getLineDetail(id){
    let action = baseUrl + "line/" + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            $("#txtULineId").val(data.id);
            $("#txtULineName").val(data.name);
            $("#txtULineZone").val(data.zone_id);
            $("#modalUpdateLine").modal("show");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}