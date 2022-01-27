var baseUrl = "/innovation/";
var machineArr = []; // danh sách machine

// Refresh data
function refresh() {
    window.location.href = '/innovation/machine';
}

$.fn.modal.Constructor.prototype._enforceFocus = function() {};

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
    $(".list-model").select2({
        placeholder: "Select a model",
        allowClear: true,
        width: '100%'
    });

    $('.isDate').datepicker({
        format: "mm-dd-yyyy",
    });

    $('.modal').on('shown.bs.modal', function () {
        $(this).find('[autofocus]').focus();
    });

    // Reload page with current tab
    if(!localStorage.getItem('machineActiveTab'))
        localStorage.setItem('machineActiveTab', "#sewing-machine-panel");
    $("#machine-tab a").on('click', function(e){
        localStorage.setItem('machineActiveTab', $(e.currentTarget).attr('href'));
    });
    var activeTab = localStorage.getItem('machineActiveTab');
    if(activeTab){
        $(".mdl-tabs__panel").removeClass("is-active");
        $(".mdl-tabs__tab").removeClass("is-active");
        $(activeTab).addClass("is-active");
        let currentTab =  $(document.querySelector(`[href='${activeTab}']`));
        currentTab.click();
        currentTab.addClass('is-active');
    }

    getListModel();
    getAllMachine();

    // Bind select option for model select
    setTimeout(() => {
        if (machineArr.length > 0) {
            // let html = "<option value='' selected>Tất cả</option>";
            let html = "";
            for (let i = 0; i < machineArr.length; i++) {
                let ele = machineArr[i];
                html += "<option value='"+ele.id+"'>"+ele.name+"</option>";
            }
            $("#txtModelMachine, #txtUModelMachine").html('');
            $("#txtModelMachine, #txtUModelMachine").append(html);
       
            html = "<option value=''>Tất cả</option>";
            for (let i = 0; i < machineArr.length; i++) {
                let ele = machineArr[i];
                html += "<option value='"+ele.id+"'>"+ele.name+"</option>";
            }

            $("#txtFilterMachine").html('');
            $("#txtFilterMachine").append(html);
            
        }
    }, 500)
})

// get Model
function getListModel(){

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
            DropDownListModel(listModels, $(".list-model"));
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

/*
    SEWING MACHINE
*/
function getAllSewingMachine(){
    let zone = $("#txtFilterSMZone").val();
    let line = $("#txtFilterSMLine").val();
    let status = $("#txtFilterSMStatus").val();
    let tag = $("#txtFilterSMTag").val();

    let action = baseUrl + 'sewing-machine/get';
    let datasend = {
        zone: zone,
        line: line,
        status: status,
        tag: tag
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
                        + "<td width='15%'>"+ ele.tag +"</td>"
                        + "<td width='15%'>"+ ele.serial_no +"</td>"
                        + "<td width='10%'>"+ ele.machine_model +"</td>"
                        + "<td width='10%'>"+ ele.line +"</td>"
                        + "<td width='10%'>"+ ele.position +"</td>"
                        + "<td width='20%'>"+ ele.description +"</td>"
                        + "<td width='10%' style='background-color: "+ (ele.status == 1 ? "#1ee81e" : ele.status == 2 ? "#fd0d0d" : "yellow") +"'>"+ (ele.status == 1 ? "Good" : ele.status == 2 ? "Error" : "Repairing") +"</td>"
                        + "<td width='10%'><a href='javascript:void(0)' onclick='getSewingMachineDetail("+ele.id+")'><i class='fa fa-edit' style='font-size: 14px'></i></a></td>"
                        + "</tr>";
            }
            $("#sewing-machine-table-body").html('');
            $("#sewing-machine-table-body").html(html);
            $("#sewing-machine-count").text("(" + data.length + ")");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}    

// add machine 
function addSewingMachine(){
    let serialNo =  $("#txtASMSerial");
    let tag =  $("#txtASMTag");
    let model =  $("#txtASMMachineModel");
    let mecLocation =  $("#txtASMMechanicLocation");
    let line =  $("#txtASMLine");
    let position =  $("#txtASMPosition");
    let description =  $("#txtASMDescription");
    let status =  $("#txtASMStatus");

    if (!CheckNullOrEmpty(serialNo, "Serial máy không được để trống"))
        return false;
    if (!CheckNullOrEmpty(tag, "Tag máy không được để trống"))
        return false;

    let action = baseUrl + 'sewing-machine/add';
    let datasend = {
        sewingMachine: {
            serialNo: serialNo.val(),
            tag: tag.val(),
            machineModel: model.val(),
            mecLocation: mecLocation.val(),
            line: line.val(),
            position: position.val(),
            description: description.val(),
            status: status.val()
        }
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Thêm thành công");
            getAllSewingMachine();
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update machine 
function updateSewingMachine(){
    let id = $("#txtUSMId");
    let serialNo =  $("#txtUSMSerial");
    let tag =  $("#txtUSMTag");
    let model =  $("#txtUSMMachineModel");
    let mecLocation =  $("#txtUSMMechanicLocation");
    let line =  $("#txtUSMLine");
    let position =  $("#txtUSMPosition");
    let description =  $("#txtUSMDescription");
    let status =  $("#txtUSMStatus");

    if (!CheckNullOrEmpty(serialNo, "Serial máy không được để trống"))
        return false;
    if (!CheckNullOrEmpty(tag, "Tag máy không được để trống"))
        return false;

    let action = baseUrl + 'sewing-machine/update';
    let datasend = {
        sewingMachine: {
            id: id.val(),
            serialNo: serialNo.val(),
            tag: tag.val(),
            machineModel: model.val(),
            mecLocation: mecLocation.val(),
            line: line.val(),
            position: position.val(),
            description: description.val(),
            status: status.val()
        }
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Cập nhật thành công");
            $("#modalUpdateSewingMachine").modal("hide");
            getAllSewingMachine();
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// get machine detail
function getSewingMachineDetail(id){
    let action = baseUrl + 'sewing-machine/' + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            $("#txtUSMId").val(data.id);
            $("#txtUSMSerial").val(data.serial_no);
            $("#txtUSMTag").val(data.tag);
            $("#txtUSMMachineModel").val(data.machine_model);
            $("#txtUSMMechanicLocation").val(data.mec_location);
            $("#txtUSMLine").val(data.line);
            $("#txtUSMPosition").val(data.position);
            $("#txtUSMDescription").val(data.description);
            $("#txtUSMStatus").val(data.status);
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
    
    $("#modalUpdateSewingMachine").modal("show");
}

// download machine
function downloadSewingMachine() {
    LoadingShow();
    let keyword =  $("#txtMachine").val();
    let machineType = $("#txtFilterMachineType").val();

    let action = baseUrl + 'sewing-machine/download';
    let datasend = {
        keyword: keyword,
        type: machineType
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
        return download(blob, GetTodayDate() + "_machine.xlsx");
    });
}


/*
    MACHINE
*/
function getAllMachine(){
    let keyword =  $("#txtMachine").val();
    let machineType = $("#txtFilterMachineType").val();

    let action = baseUrl + 'machine/get';
    let datasend = {
        keyword: keyword,
        type: machineType
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            machineArr = data;
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                html += "<tr>"
                        + "<td width='10%'>"+ ele.id +"</td>"
                        + "<td width='20%'>"+ ele.code +"</td>"
                        + "<td width='40%'>"+ ele.name +"</td>"
                        + "<td width='20%'>"+ (ele.type == 1 ? "May" : "Cắt") +"</td>"
                        + "<td width='10%'><a href='javascript:void(0)' onclick='getMachineDetail("+ele.id+")'><i class='fa fa-edit' style='font-size: 14px'></i></a></td>"
                        + "</tr>";
            }
            $("#machine-table-body").html('');
            $("#machine-table-body").html(html);
            $("#machine-count").text("(" + data.length + ")");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}    

// add machine 
function addMachine(){
    let name =  $("#txtMachineName");
    let code =  $("#txtMachineCode");
    let type =  $("#txtMachineType");

    if (!CheckNullOrEmpty(name, "Tên loại máy không được để trống"))
        return false;
    if (!CheckNullOrEmpty(code, "Tên mã máy không được để trống"))
        return false;

    let action = baseUrl + 'machine/add';
    let datasend = {
        name: name.val(),
        code: code.val(),
        type: type.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            toastr.success("Thành công", "Thêm thành công");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update machine 
function updateMachine(){
    let id = $("#txtUMachineId");
    let name =  $("#txtUMachineName");
    let code =  $("#txtUMachineCode");
    let type =  $("#txtUMachineType");
    let active =  $("#txtUMachineActive");

    if (!CheckNullOrEmpty(name, "Tên loại máy không được để trống"))
        return false;
    if (!CheckNullOrEmpty(code, "Tên mã máy không được để trống"))
        return false;

    let action = baseUrl + 'machine/update';
    let datasend = {
        id: id.val(),
        name: name.val(),
        code: code.val(),
        type: type.val(),
        active: active.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            toastr.success("Thành công", "Cập nhật thành công");
            getAllMachine();
            $("#modalUpdateMachine").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// get machine detail
function getMachineDetail(id){
    let action = baseUrl + 'machine/' + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;

            $("#txtUMachineId").val(data.id);
            $("#txtUMachineName").val(data.name);
            $("#txtUMachineCode").val(data.code);
            $("#txtUMachineType").val(data.type);
            $("#txtUMachineActive").val(data.active);
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
    
    $("#modalUpdateMachine").modal("show");
}

// download machine
function downloadMachine() {
    LoadingShow();
    let keyword =  $("#txtMachine").val();
    let machineType = $("#txtFilterMachineType").val();

    let action = baseUrl + 'machine/download';
    let datasend = {
        keyword: keyword,
        type: machineType
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
        return download(blob, GetTodayDate() + "_machine.xlsx");
    });
}


/*
    MODEL
*/
function getAllModel(){
    let keyword =  $("#txtModel").val();
    let machine = $("#txtFilterMachine").val();

    let action = baseUrl + 'model/get';
    let datasend = {
        keyword: keyword,
        machine: machine
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
                        + "<td width='20%'>"+ ele.code +"</td>"
                        + "<td width='40%'>"+ ele.name +"</td>"
                        + "<td width='20%'>"+ ele.description +"</td>"
                        + "<td width='10%'><a href='javascript:void(0)' onclick='getModelDetail("+ele.id+")'><i class='fa fa-edit' style='font-size: 14px'></i></a></td>"
                        + "</tr>";
            }
            $("#model-table-body").html('');
            $("#model-table-body").html(html);
            $("#model-count").text("(" + data.length + ")");
        }
        else{
            toastr.error(response.msg, " ");
        }
    });
}    

// download model
function downloadModel() {
    LoadingShow();
    let keyword = $("#txtModel").val();
    let action = baseUrl + 'model/download';
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
        return download(blob, GetTodayDate() + "_model.xlsx");
    });
}

// add machine 
function addModel(){
    let name =  $("#txtModelName");
    let code =  $("#txtModelCode");
    let machine =  $("#txtModelMachine");
    let des =  $("#txtModelDes");
    let qty =  $("#txtModelQty");

    if (!CheckNullOrEmpty(name, "Tên model không được để trống"))
        return false;
    if (!CheckNullOrEmpty(code, "Mã model không được để trống"))
        return false;

    if(parseInt(qty.val()) < 0){
        alert("Số lượng không được nhỏ hơn 0");
        return false;
    }

    let action = baseUrl + 'model/add';
    let datasend = {
        name: name.val(),
        code: code.val(),
        machine: machine.val(),
        des: des.val(),
        qty: qty.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            toastr.success("Thành công", "Thêm thành công");
            getAllModel();
            // $("#modalAddModel").modal("hide");
            $("#txtModelName").val('');
            $("#txtModelCode").val('');        
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// update machine 
function updateModel(){
    let id = $("#txtUModelId");
    let name =  $("#txtUModelName");
    let code =  $("#txtUModelCode");
    let qty =  $("#txtUModelQty");
    let des =  $("#txtUModelDes");
    let machine =  $("#txtUModelMachine");
    let active =  $("#txtUModelActive");

    if (!CheckNullOrEmpty(name, "Tên model không được để trống"))
        return false;
    if (!CheckNullOrEmpty(code, "Tên model không được để trống"))
        return false;

    let action = baseUrl + 'model/update';
    let datasend = {
        id: id.val(),
        name: name.val(),
        code: code.val(),
        machine: machine.val(),
        qty: qty.val(),
        des: des.val(),
        active: active.val()
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;
            toastr.success("Thành công", "Cập nhật thành công");
            getAllModel();
            $("#modalUpdateModel").modal("hide");
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

// get machine detail
function getModelDetail(id){
    let action = baseUrl + 'model/' + id;
    LoadingShow();
    GetDataAjax(action, function (response) {
        LoadingHide();
        if(response.rs){
            let data = response.data;

            $("#txtUModelId").val(data.id);
            $("#txtUModelName").val(data.name);
            $("#txtUModelCode").val(data.code);
            $("#txtUModelQty").val(data.quantity);
            $("#txtUModelDes").val(data.description);
            $("#txtUModelMachine").val(data.machine_id);
            $("#txtUModelActive").val(data.active);
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
    
    $("#modalUpdateModel").modal("show");
}

// download model
function downloadModel() {
    LoadingShow();
    let keyword =  $("#txtModel").val();
    let machine = $("#txtFilterMachine").val();

    let action = baseUrl + 'model/download';
    let datasend = {
        keyword: keyword,
        machine: machine
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
        return download(blob, GetTodayDate() + "_model.xlsx");
    });
}