function loadExistedData(){
    let listData = JSON.parse(localStorage.getItem("listScannedData"));
    if(listData && listData.length > 0) {
        let html = "";
        listData = sortArrayByKey(listData, "scannedTime", true);
        for (let i = 0; i < listData.length; i++) {
            let ele = listData[i];
            html += `<tr id='tr-${ele.wo}-${ele.rollCode}'>
                    <td></td>
                    <td>${ele.wo}</td>
                    <td>${ele.rollCode}</td>
                    <td>${ele.scannedTime}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                        <button class='btn btn-sm btn-primary' onclick="getDetailTicket()"><i class='fa fa-pencil'></i></button>
                        <button class='btn btn-sm btn-danger' onclick="deleteRow('${ele.wo}', '${ele.rollCode}')"><i class='fa fa-trash'></i></button>
                    </td>
                </tr>`;
        }
        $("#scanned-table-body").append(html);
        $("#lbCounted").text(listData.length);
    }
}

function addRecord(){
    // form data
    let tempData = localStorage.getItem("listScannedData");
    let listScannedData = JSON.parse(tempData) ? JSON.parse(tempData) : [];

    if(listScannedData.length <= 0){
        toastr.error("Không có dữ liệu để lưu.");
        return false;
    }

    // send to server
    let action = baseUrl + 'add-record';
    let datasend = {
        data: listScannedData
    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            toastr.success(response.msg, "Thành công");

            localStorage.setItem("listScannedData", null);
            $("#lbCounted").text("0");
            $("#scanned-table-body").html("");
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function scanBarcode() {
    if (event.which === 13 || event.key == 'Enter') {
        let rollCode = $("#txtRollCode");
        let wo = $("#txtWo").val();
        if (rollCode.val().length > 0) {
            let code = rollCode.val();
            rollCode.val('');

            addRow({wo: wo, rollCode: code, scannedTime: formatDDMMYYHHMMSS(new Date())});

            let count = parseInt($("#lbCounted").text()) + 1;
            $("#lbCounted").text(count);
        }
        else {
            toastr.error("Bạn chưa nhập mã cuộn vải /Roll code can not blank.");
        }
    }
}

function addRow(ele){
    // get existed data
    let listData = localStorage.getItem("listScannedData");
    listData = JSON.parse(listData) ? JSON.parse(listData) : [];
    
    // add data
    listData.push(ele);

    // re-assign data to storage
    localStorage.setItem("listScannedData", JSON.stringify(listData));

    // change UI
    let html = `<tr id='tr-${ele.wo}-${ele.rollCode}'>
                            <td width='10%'></td>
                            <td width='25%'>${ele.wo}</td>
                            <td width='25%'>${ele.rollCode}</td>
                            <td width='30%'>${ele.scannedTime}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td width='10%'><button class='btn btn-danger' onclick="deleteRow('${ele.wo}', '${ele.rollCode}')"><i class='fa fa-trash'></i></button></td>
                        </tr>`;
    $("#scanned-table-body").prepend(html);
}

function deleteRow(wo, rollCode){
    // get existed data
    let listData = localStorage.getItem("listScannedData");
    listData = JSON.parse(listData) ? JSON.parse(listData) : [];

    // find object then delete
    listData.splice(listData.findIndex(item => item.wo == wo && item.rollCode == rollCode), 1);

    // re-assign data to storage
    localStorage.setItem("listScannedData", JSON.stringify(listData));

    // change UI
    $(`#tr-${wo}-${rollCode}`).remove();
    let count = parseInt($("#lbCounted").text()) - 1;
    $("#lbCounted").text(count);
}

function loadHistory(){
    // form data
    let filterDate = $("#txtFilterTime").val();
    if (filterDate.toString() == "5") {
        filterDate = $("#txtFilterFrom").val() + ";" + $("#txtFilterTo").val();
    }

    // send to server
    let action = baseUrl + 'get-history';
    let datasend = {
        filterDate: filterDate
    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}
