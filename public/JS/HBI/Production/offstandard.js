var baseUrl = "/production/"

$('#date_group_search').datepicker({
    format: "yyyy-mm-dd",
});
$(document).ready(function () {
    load_off_standard_tracking();
})

load_week();
load_off_standard_code(false, false);
var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
var today = localISOTime.substring(0, 10);
table_employee_body = document.getElementById('table_employee_body');
document.getElementById('date_group_search').value = today;
week_list = document.getElementById('cbb_week_list');
list_cbb_style_detail = document.getElementById('list_cbb_style_detail');
list_cbb_code = document.getElementById('list_cbb_code');
list_cbb_old_op = document.getElementById('list_cbb_old_op');
list_cbb_new_op = document.getElementById('list_cbb_new_op');

function load_week() {
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetShiftTime", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            if (data.length > 0) {
                for (i = 1; i <= 53; i++) {
                    var li = document.createElement('li');
                    li.setAttribute('class', 'mdl-menu__item');
                    li.setAttribute('data-val', i);
                    li.innerHTML = i;
                    week_list.appendChild(li);
                }
                $('ul[for="cbb_week"] li[data-val="' + data[0].Week + '"]').attr("data-selected", "true");
                var d = new Date();
                var n = d.getHours();
                currShift = 'RIT';
                if (n >= data[0].StartTime && n <= data[0].FinishTime) {
                    if (data[0].Shift == 'R') currShift = 'RIT';
                    else currShift = 'BALI';
                } else {
                    if (data[0].Shift == 'R') currShift = 'BALI';
                    else currShift = 'RIT';
                }
                $('ul[for="cbb_shift"] li[data-val="' + currShift + '"]').attr("data-selected", "true");
                // $('ul[for="cbb_group"] li[data-val="'+data[0].Week+'"]').attr("data-selected", "true");                        
                getmdlSelect.init('#div_cbb_shift');
                getmdlSelect.init('#div_cbb_week');
                // getmdlSelect.init('#div_cbb_shift');
                load_group();
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    xsend.send();
}

document.getElementById('cbb_group').addEventListener('change', function () {
    load_style_detail();
    // load_off_standard_tracking();
});

document.getElementById('cbb_shift').addEventListener('change', function () {
    load_style_detail();
    // load_off_standard_tracking();
});

function load_style_detail() {
    week = document.getElementById('cbb_week').value;
    group = document.getElementById('cbb_group').value;
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetStyleDetail1", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            while (list_cbb_style_detail.childNodes.length > 0) {
                list_cbb_style_detail.removeChild(list_cbb_style_detail.childNodes[0]);
            }
            for (i = 0; i < data.length; i++) {
                var li = document.createElement('li');
                li.setAttribute('class', 'mdl-menu__item');
                if (i == 0) li.setAttribute('data-selected', 'true');
                li.setAttribute('data-val', data[i].style);
                li.innerHTML = data[i].style;
                list_cbb_style_detail.appendChild(li);
            }
            getmdlSelect.init('#div_style_detail');
            load_off_standard_tracking();
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { group: group, week: week };
    xsend.send(JSON.stringify(data));
}

function load_group() {
    group_list = document.getElementById('cbb_group_list');
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetGroup", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            first = 0
            for (i = 1; i < data.length; i++) {
                if (data[i].GROUP_PLAN == null) continue;
                var li = document.createElement('li');
                li.setAttribute('class', 'mdl-menu__item');
                if (first == 0) li.setAttribute('data-selected', "true")
                li.setAttribute('data-val', data[i].GROUP_PLAN);
                li.innerHTML = data[i].GROUP_PLAN;
                group_list.appendChild(li);
                if (first == 0) first = i;
            }
            $('ul[for="cbb_group"] li[data-val="' + data[0].Week + '"]').attr("data-selected", "true");
            getmdlSelect.init('#div_cbb_group');
            load_style_detail();

        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    xsend.send();
}

//convert 10 digit to 8 digit
function convert_rfid(digit10) {
    digit10 = parseInt(digit10);
    dec2hex = digit10.toString(16);
    if (dec2hex.length > 6) hex8digit = dec2hex.substring(dec2hex.length - 6, dec2hex.length);
    else hex8digit = dec2hex;
    while (hex8digit.length < 8) hex8digit = '0' + hex8digit;
    last4digit = hex8digit.substring(4, 9)
    pre4digit = hex8digit.substring(0, 4);
    if (pre4digit.length >= 3) pre4digit = parseInt(pre4digit.substring(pre4digit.length - 2, pre4digit.length), 16).toString();
    last4digit = parseInt(last4digit, 16).toString();
    emp8digit = '';
    while (pre4digit.length < 3) pre4digit = '0' + pre4digit;
    while (last4digit.length < 5) last4digit = '0' + last4digit;
    emp8digit = pre4digit + last4digit;
    return emp8digit;
}

function load_off_standard_tracking() {
    // group = document.getElementById('cbb_group').value;
    date = document.getElementById('date_group_search').value;
    // shift = document.getElementById('cbb_shift').value;
    wc = document.getElementById('cbb_wc').value;
    let xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetOffStandardTracking", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            let html = "";
            for (let i = 0; i < data.length; i++) {
                let ele = data[i];
                let StartTime = "";
                let FinishTime = "";
                if (ele.StartTime != null)
                    StartTime = (new Date(ele.StartTime)).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }).split(', ')[1];
                if (ele.FinishTime != null)
                    FinishTime = (new Date(ele.FinishTime)).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }).split(', ')[1];
                html += `<tr style="background: ${data[i].SpanTime == null ? "#ceebc6" : ""}">
                    <td>${ele.WorkerID}</td>
                    <td>${ele.Name}</td>
                    <td>${ele.Code}</td>
                    <td>${ele.Operation1}</td>
                    <td>${ele.Operation2}</td>
                    <td id="startTime-${ele.ID}">${StartTime}</td>
                    <td id="ft-${ele.ID}">${FinishTime == '' ? `<input id= 'finishTime-${ele.ID}' class='form-control' style='width: 120px' type='time'>` : FinishTime}</td>
                    <td>${ele.SpanTime == null ? "" : ele.SpanTime}</td>
                    <td>${ele.Note}</td>
                    <td style="text-align: center; font-size: 30px">
                        ${ele.Code.indexOf('03') > - 1 ? (ele.IEApprovedUser != null ? "<i class='text-success fa fa-check-circle'></i>" : "<i class='text-danger fa fa-times-circle'></i>") : ""}
                    </td>
                    <td>
                        <a href='#' onclick='closeOffStandardTracking(${ele.ID})' style="display: ${FinishTime == '' ? 'block' : 'none'}">Confirm</a>
                        <a href='#' onclick='ieConfirm(${ele.ID})' style="display: ${((ele.Code.indexOf('03') > - 1) && (ele.IEApprovedUser == null)) ? 'block' : 'none'}">IE Confirm</a>
                    </td>
                    </tr>`;
            }
            $("#table_employee_body").html('');
            $("#table_employee_body").html(html);
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { date: date, wc: wc };
    xsend.send(JSON.stringify(data));
}

function get_group_infor() {
    date = document.getElementById('date_group_search').value;
    group = document.getElementById('cbb_group').value;
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetOffStandardTracking", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { date: date, group: group };
    xsend.send(JSON.stringify(data));
}

function load_off_standard_code(code03, code08) {
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetOffStandardCode", true);
    xsend.onreadystatechange = function () {
        // if (this.readyState == 4 && this.status == 200) {
        //     data = JSON.parse(xsend.responseText);
        //     while (list_cbb_code.childNodes.length > 0)
        //         list_cbb_code.removeChild(list_cbb_code.childNodes[0]);
        //     for (i = 0; i < data.length; i++) {
        //         if (code03 == false && data[i].OffCode.includes('03')) continue;
        //         if (code08 == false && data[i].OffCode.includes('08')) continue;
        //         var li = document.createElement('li');
        //         li.setAttribute('class', 'mdl-menu__item');
        //         li.setAttribute('data-val', data[i].OffCode);
        //         li.innerHTML = data[i].OffCode;
        //         list_cbb_code.appendChild(li);
        //     }
        //     getmdlSelect.init('#div_cbb_code');
        // }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    xsend.send();
}

document.getElementById('txt_rfid').addEventListener('keyup', function () {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        digit10 = document.getElementById("txt_rfid").value;
        if (digit10.length != 10 && digit10.length != 6) {
            alert('Hãy quẹt thẻ hoặc nhập ID 6 số đúng!');
            return;
        }
        if (digit10.length == 10) digit8 = convert_rfid(digit10);
        if (digit10.length == 6) digit8 = digit10;
        var xsend = new XMLHttpRequest();
        xsend.open("POST", "/Get_RFID", true);
        xsend.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = JSON.parse(xsend.responseText);
                if (data.length > 0) {
                    document.getElementById('txt_rfid').value = data[0].ID;
                    document.getElementById('txt_rfid_name').innerHTML = data[0].Name + ' - ' + data[0].Line + ' - ' + data[0].Shift + data[0].Section;
                    document.getElementById('txt_rfid').disabled = true;
                    document.getElementById('cbb_week').disabled = true;
                    document.getElementById('cbb_group').disabled = true;
                    document.getElementById('cbb_shift').disabled = true;
                    date = document.getElementById('date_group_search').value;
                    load_emp_status(data[0].ID);

                } else {
                    alert('Không tìm thấy thông tin nhân viên!');
                }
            }
        }
        xsend.setRequestHeader("Content-type", "application/json");
        data = { rfid: digit8 };
        xsend.send(JSON.stringify(data));
    }
});

document.getElementById('cbb_code').addEventListener('change', function () {
    code = document.getElementById('cbb_code').value;
    if (!code.includes('03') && !code.includes('08')) {
        // document.getElementById('div_txt_note').style.display = "none";
        document.getElementById('div_cbb_old_op').style.display = "none";
        document.getElementById('div_cbb_new_op').style.display = "none";
    } else {
        // document.getElementById('div_txt_note').style.display = "grid";
        document.getElementById('div_cbb_old_op').style.display = "grid";
        document.getElementById('div_cbb_new_op').style.display = "grid";
    }
    // if (code.includes('09')) document.getElementById('div_cbb_note').style.display = "grid";
    // else document.getElementById('div_cbb_note').style.display = "none";
});

function load_emp_status(emp) {
    ID = emp;//document.getElementById('txt_rfid');
    date = document.getElementById('date_group_search').value;
    week = document.getElementById('cbb_week').value;
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetOffStandardInfo", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            code03 = false;
            code08 = false;
            checkTracking(emp, date, function (result) {
                console.log(result)
                data = JSON.parse(xsend.responseText);
                console.log(data)
            });

        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { ID: ID, date: date, week: week };
    xsend.send(JSON.stringify(data));
}

document.getElementById('btn_emp_register').addEventListener('click', function () {
    ID = document.getElementById('txt_rfid').value;
    if (ID == '') {
        alert('Bạn chưa quẹt thẻ hoặc nhập mã ID!');
        return;
    }
    emp_infor = document.getElementById('txt_rfid_name').innerHTML.split(' - ');
    if (emp_infor.length == 1) {
        alert('Hãy nhấn Enter để nhận thông tin!');
        return;
    }
    name = emp_infor[0];
    wc = emp_infor[2];
    // groupTo = document.getElementById('cbb_group').value;
    // if (groupTo == '') {
    //     alert('Bạn chưa chọn group đến!');
    //     return;
    // }
    code = document.getElementById('cbb_code').value;
    if (code == '') {
        alert('Bạn chưa chọn mã code!');
        return;
    }
    // wc = document.getElementById('cbb_style_detail').value.toUpperCase();
    // op1 = document.getElementById('cbb_old_op').value.split(' - ')[0];
    // if (op1 == '' && (code.includes('03') || code.includes('08'))) {
    //     alert('Chọn CĐ đang may!');
    //     return;
    // }
    // if (!code.includes('03') && !code.includes('08')) op1 = '';
    // op2 = document.getElementById('cbb_new_op').value.split(' - ')[0];
    // if (op2 == '' && (code.includes('03') || code.includes('08'))) {
    //     alert('Chọn CĐ muốn chuyển đổi!');
    //     return;
    // }
    // eff2 = sessionStorage.getItem(ID + wc.toUpperCase() + op1);
    // if (!code.includes('03') && !code.includes('08')) {
    //     eff2 = '0'
    //     op2 = '';
    // }

    op1 = document.getElementById('txtOldOp').value;
    if (op1 == '' && (code.includes('03') || code.includes('08'))) {
        alert('Nhập công đoạn đang may!');
        return;
    }
    if (!code.includes('03') && !code.includes('08')) op1 = '';
    op2 = document.getElementById('txtNewOp').value;
    if (op2 == '' && (code.includes('03') || code.includes('08'))) {
        alert('Nhập công đoạn muốn chuyển đổi!');
        return;
    }

    // wc = document.getElementById('cbb_wc').value;
    // if (wc == '') {
    //     alert('Bạn chưa chọn wc!');
    //     return;
    // }
    // weekUpdate = document.getElementById('cbb_week').value;
    // if (weekUpdate == '') {
    //     alert('Chọn tuần!');
    //     return;
    // }

    startTime = document.getElementById('txtStartTime').value;
    if (startTime == '') {
        alert('Bạn chưa nhập thời gian bắt đầu!');
        return false;
    }
    finishTime = $("#txtFinishTime").val();
    let currenDate = $("#date_group_search").val();
    if (finishTime != "") {
        if (new Date(currenDate + " " + finishTime) < new Date(currenDate + " " + startTime)) {
            alert("Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu.");
            return false;
        }
    }

    note = document.getElementById('txt_note').value;
    if (code.includes('09') && note == '') {
        alert('Bạn chưa nhập lý do!');
        return false;
    }
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/InsertOffStandardTracking", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = xsend.responseText;
            if (code.includes('03') || code.includes('08'))
                alert('Bạn đã mở ticket mã ' + code + ' THÀNH CÔNG!\nHiệu suất bạn cần đạt là: ' + document.getElementById('cbb_new_op').value.split(' - ')[1] + '%');
            else
                alert('Bạn đã mở ticket mã ' + code + ' THÀNH CÔNG!');
        }
        location.reload();
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = {
        workerID: ID,
        name: name,
        code: code,
        wc: wc,
        op1: op1,
        op2: op2,
        startTime: startTime,
        finishTime: finishTime,
        note: note,
        currenDate: currenDate
    };
    xsend.send(JSON.stringify(data));
});

function checkTracking(empID, date, callback) {
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/IsExistedOffStandardTracking", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = xsend.responseText;
            if (data.length > 0) return callback(JSON.parse(data));
            else return callback('');
            // location.reload();
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { empID: empID, date: date };
    xsend.send(JSON.stringify(data));
}

function ieConfirm(id){
    let action = baseUrl + 'ie-confirm-offstandard';
    let datasend = {
        id: id,
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            toastr.success("Thành công", "Cập nhật thành công");
            setTimeout(() => {
                location.reload();
            }, 1500)
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function closeOffStandardTracking(id) {
    if ($("#ft-" + id).text() != "") {
        alert("Request này đã được xử lý.");
        return false;
    }

    let finishTime = $("#finishTime-" + id).val();
    let startTime = $("#startTime-" + id).text();
    let currenDate = $("#date_group_search").val();
    if (new Date(currenDate + " " + finishTime) < new Date(currenDate + " " + startTime)) {
        alert("Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu.");
        return false;
    }
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/CloseOffStandardTracking", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            if (data.length > 0) {
                alert('Bạn đã đóng ticket THÀNH CÔNG!\nThời gian quẹt thẻ ' + data[0].Code + ' là ' + data[0].SpanTime + 'h');
                location.reload();
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { id: id, startTime: startTime, finishTime: finishTime };
    xsend.send(JSON.stringify(data));
}
// document.getElementById('btn_7000_show_dialog').addEventListener('click', function () {
//     load_7000_table();
//     empID = document.getElementById('txt_rfid').value.substring(1, 6);
//     if (empID != '')
//         document.getElementById('dialog_7000').showModal();
// });

function load_7000_table() {
    empID = document.getElementById('txt_rfid').value.substring(1, 6);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/GetOperationByEmployee7000", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            console.log(data);
            table_7000_body = document.getElementById('table_7000_body');
            while (table_7000_body.childNodes.length > 0)
                table_7000_body.removeChild(table_7000_body.childNodes[0]);
            for (var i = 0; i < data.length; i++) {
                var tr = document.createElement("tr");
                //ID
                var tdTicket = document.createElement("td");
                tdTicket.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode('');
                node = document.createTextNode(data[i].OPERATION);
                tdTicket.appendChild(node);
                tr.appendChild(tdTicket);
                //Code
                var tdEmployee = document.createElement("td");
                tdEmployee.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode('');
                node = document.createTextNode(data[i].GOAL);
                tdEmployee.appendChild(node);
                tr.appendChild(tdEmployee);
                //Operation1
                var tdName = document.createElement("td");
                tdName.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode('');
                if (data[i].TARGET != null) node = document.createTextNode('ĐÃ ĐK');
                else node = document.createTextNode('CHƯA ĐK');
                tdName.appendChild(node);
                tr.appendChild(tdName);
                //checkbox
                var tdLabel = document.createElement('td')
                var label = document.createElement('label');
                label.setAttribute('class', 'mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect');
                label.setAttribute('for', data[i].OPERATION);
                var input = document.createElement('input');
                input.setAttribute('click', 'mdl-checkbox__input');
                input.setAttribute('type', "checkbox");
                if (data[i].TARGET != null)
                    input.setAttribute('checked', "true");
                input.setAttribute('onchange', 'function_7000_reg(this)')
                input.setAttribute('id', data[i].OPERATION);
                var span = document.createElement('span');
                span.setAttribute('class', 'mdl-checkbox__label');
                componentHandler.upgradeElement(input);
                componentHandler.upgradeElement(span);
                label.appendChild(input);
                label.appendChild(span);
                tdLabel.appendChild(label);
                tr.appendChild(tdLabel);
                componentHandler.upgradeElement(tr);
                table_7000_body.appendChild(tr);
            }

        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { empID: empID };
    xsend.send(JSON.stringify(data));
}

function function_7000_reg(x) {
    // console.log(x.parentNode.parentNode.parentNode.childNodes[0])
    empID = document.getElementById('txt_rfid').value.substring(1, 6);
    operation = x.parentNode.parentNode.parentNode.childNodes[0].innerHTML;
    // actual=x.childNodes[1].innerHTML;
    // target=x.childNodes[2].innerHTML;
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/AddOperationByEmployee7000", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = xsend.responseText;
            load_7000_table();
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { empID: empID, operation: operation, actual: '0', target: '0' };
    console.log(data)
    xsend.send(JSON.stringify(data));
}
// document.getElementById('btn_7000_close').addEventListener('click', function () {
//     document.getElementById('dialog_7000').close();
//     location.reload();
// })