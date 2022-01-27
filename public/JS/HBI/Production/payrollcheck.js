
var baseUrl = "/production/payrollcheck"

$(document).ready(function () {
    getZone();
    setTimeout(function(){
        getLineByZone();
    }, 500)
})

function getZone(){
    let action = '/production/zone/get';
    let datasend = {
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
           setTimeout(function(){
                DropDownListZone(response.data, $("#txtZone"));
           }, 100)
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function getLineByZone(){
    let zone = $("#txtZone").val();
    let action = '/production/zone/get-line-by-zone';
    let datasend = {
        zone: zone
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if(response.rs){
            DropDownListLine(response.data, $("#txt_group"));
        }
        else{
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function DropDownListZone(list, selector){
    selector.html('');
    let html = "";
    for(let i = 0; i < list.length; i++){
        let ele = list[i];
        if(ele.type == Enum_Production.Production)
            html += "<option value='"+ele.id+"'>"+ ele.name+ "</option>";
    }
    selector.html(html);
}

function DropDownListLine(list, selector){
    selector.html('');
    let html = "";
    for(let i = 0; i < list.length; i++){
        let ele = list[i];
        html += "<option value='"+ele.name+"'>"+ ele.name+ "</option>";
    }
    selector.html(html);
}

// window.onload= function(){
//     console.log('hello');
//     // console.log(System.getProperty("user.name"));
//     console.log(GetUserName());
// }
// var WinNetwork = new ActiveXObject("WScript.Network");
// alert(WinNetwork.UserName); 
// function GetUserName() {
//     var wshell = ActiveXObject && new ActiveXObject("WScript.Shell");
//     return wshell && wshell.ExpandEnvironmentStrings("%USERNAME%");
// }

document.getElementById('txt_bundle_search').value = "";
var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
var today = localISOTime;
var table_group_search = document.getElementById('table_group_search');
var tabel_wip_search = document.getElementById('table_wip_search');
var table_ID_search = document.getElementById('table_ID_search');
var table_error_search = document.getElementById('table_error_search');
var table_worklot_search = document.getElementById('table_worklot_search');
var table_double_seach = document.getElementById('table_double_search');
document.getElementById('date_group_search').value = today.substr(0, 10);
document.getElementById('date_ID_search_from').value = today.substr(0, 10);
document.getElementById('date_ID_search').value = today.substr(0, 10);
//yesterday
var yesterdate = new Date();
yesterdate.setDate(yesterdate.getDate() - 3);
var localISOTime_yesterday = yesterdate.toISOString().slice(0, -1);
document.getElementById('date_change_scan').value = localISOTime_yesterday.substr(0, 10);
document.getElementById('date_change_scan').min = localISOTime_yesterday.substr(0, 10);
document.getElementById('date_change_scan').max = localISOTime.substr(0, 10);
var group_data;
var shift;
var group = '';
var QC = '';
var group_detail_data;
var tab_mode = 0;
var date_tab = "0";
init();
function init() {
    txt_group = document.getElementById('txt_group_1').innerHTML;
    txt_shift = document.getElementById('txt_shift_1').innerHTML;
    group = '001-008';
    switch (txt_group) {
        // case '009-014':
        //     group='010-014';
        //     break;
        case '009-014':
            group = '010-014';
            break;
        case '015-024':
            group = '015-019';
            break;
        case '051-058':
            group = '051-059';
            break;
        default:
            group = txt_group;
    }
    shift = 'CALE';
    if (txt_shift == 'R') shift = 'CALE';
    else shift = 'CACHAN';
    console.log(group, shift);
    $('ul[for="groupScan"] li[data-val="' + group + '"]').attr("data-selected", "true");
    $('ul[for="shiftScan"] li[data-val="' + shift + '"]').attr("data-selected", "true");
}
function group_search_data(group) {
    table_group_search.style.display = "none";
    tabel_wip_search.style.display = "none";
    table_error_search.style.display = "none";
    var full_date = document.getElementById('date_group_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var table_group_load_spinner = document.getElementById('table_group_spinner');
    table_group_load_spinner.setAttribute("class", "mdl-spinner mdl-js-spinner is-active");
    componentHandler.upgradeElement(table_group_load_spinner);
    var body_table_group_search = document.getElementById("table_group_search_body");
    var body_table_wip_search = document.getElementById("table_wip_search_body");
    var body_table_error_search = document.getElementById('table_error_search_body');
    while (body_table_group_search.childNodes.length > 0)
        body_table_group_search.removeChild(body_table_group_search.childNodes[0]);
    while (body_table_wip_search.childNodes.length > 0)
        body_table_wip_search.removeChild(body_table_wip_search.childNodes[0]);
    while (body_table_error_search.childNodes.length > 0)
        body_table_error_search.removeChild(body_table_error_search.childNodes[0]);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/GroupNew", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            my_data = JSON.parse(xsend.responseText);
            var err_scan = 0;
            var err_bundle = 0;
            var err_qc = 0;
            var wip = 0;
            var wip_ns = 0;
            var wip_s = 0;
            console.log(my_data);
            var data = my_data.image_list;
            var error_list = my_data.error_list;
            var sum_scan = data.length;
            if (data == 'empty') {
                alert('Không tìm thấy dữ liệu!');
                document.getElementById('txt_image_scanned').innerHTML = 'Số tem hệ thống ghi nhận: 0';
                document.getElementById('txt_image_error_scan').innerHTML = 'Số ảnh thiếu Tem QC hoặc ID NV: 0';
                document.getElementById('txt_image_error_bundle').innerHTML = 'Thiếu tem NV: 0';
                document.getElementById('txt_image_error_qc').innerHTML = 'Thiếu tem QC: 0';
                document.getElementById('txt_error_scan').innerHTML = 'Hệ thống không xử lý được: 0';
                document.getElementById('txt_badge_wip').setAttribute('data-badge', '0');
                document.getElementById('txt_badge_err').setAttribute('data-badge', '0');
                table_group_load_spinner.removeAttribute("class");
            }
            else {
                console.log("group new");

                table_group_load_spinner.removeAttribute("class");
                table_group_search.style.display = "grid";
                tabel_wip_search.style.display = "grid";
                table_error_search.style.display = "grid";
                var rowIndexKickOut = 0;
                var rowIndexWip = 0;
                group_detail_data = data;
                for (var i = 0; i < data.length; i++) {
                    timeUpdateISO = new Date(data[i].TimeUpdate);
                    var tzoffset1 = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
                    var timeUpdateLocal = (new Date(timeUpdateISO - tzoffset1)).toISOString().slice(0, -1);
                    // if (data[i].FILE!=null){
                    var hourUpdate = data[i].FILE.substring(19, 21);//timeUpdateLocal.substr(11,2);
                    var minUpdate = data[i].FILE.substring(21, 23);//timeUpdateLocal.substr(14,2);
                    dateUpdate = data[i].FILE.substring(8, 10);
                    var timeUpdate = parseFloat(hourUpdate) + parseFloat(minUpdate / 60);
                    // console.log('DateUpdate', dateUpdate, day, hourUpdate, minUpdate, timeUpdate);
                    if (data[i].IASCAN > 0) continue;//14.45, 13.00
                    if ((timeUpdate <= 14.30 && timeUpdate >= 13.00 && dateUpdate == day && (data[i].QC == '' || data[i].QC == null || data[i].QC == '999999' || (data[i].IS_FULL > 0 && data[i].QC == '000000'))) || (timeUpdate <= 22.90 && timeUpdate >= 21.5 && dateUpdate == day && (data[i].QC == '' || data[i].QC == null || data[i].QC == '999999' || (data[i].IS_FULL > 0 && data[i].QC == '000000')))) {
                        wip = wip + 1;
                        var tr = document.createElement("tr");
                        //STT
                        var tdSTT = document.createElement("td");
                        tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(rowIndexKickOut);
                        tdSTT.appendChild(node);
                        tr.appendChild(tdSTT);
                        //Bundle
                        var tdBundle = document.createElement("td");
                        tdBundle.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(data[i].BUNDLE);
                        tdBundle.appendChild(node);
                        tr.appendChild(tdBundle);
                        //QC
                        var tdQC = document.createElement("td");
                        tdQC.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        qc = data[i].QC;
                        if (data[i].QC == null) qc = '';
                        var node = document.createTextNode(qc);
                        tdQC.appendChild(node);
                        tr.appendChild(tdQC);
                        //IS_FULL
                        var tdFull = document.createElement("td");
                        tdFull.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node;
                        if (data[i].IS_FULL == 0)
                            node = document.createTextNode('Đủ tem');
                        // else if (data[i].IS_FULL>=100)
                        //     node=document.createTextNode('Đã chỉnh sửa');
                        else
                            node = document.createTextNode('Thiếu tem');
                        tdFull.appendChild(node);
                        tr.appendChild(tdFull);
                        //FILE
                        var tdFile = document.createElement("td");
                        tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(data[i].FILE);
                        tdFile.appendChild(node);
                        tr.appendChild(tdFile);
                        tr.setAttribute('ondblclick', 'function_group_search(this, 1)');
                        componentHandler.upgradeElement(tr);
                        body_table_wip_search.appendChild(tr);
                        rowIndexKickOut = rowIndexKickOut + 1;
                    }
                    else if ((data[i].QC == '') || (data[i].IS_FULL > '0')) {
                        err_scan = err_scan + 1;
                        var tr = document.createElement("tr");
                        //STT
                        var tdSTT = document.createElement("td");
                        tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(rowIndexWip);
                        tdSTT.appendChild(node);
                        tr.appendChild(tdSTT);
                        //Bundle
                        var tdBundle = document.createElement("td");
                        tdBundle.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(data[i].BUNDLE);
                        tdBundle.appendChild(node);
                        tr.appendChild(tdBundle);
                        //QC
                        if (data[i].QC == '') err_qc = err_qc + 1;
                        var tdQC = document.createElement("td");
                        tdQC.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        qc = data[i].QC;
                        if (data[i].QC == null) qc = '';
                        var node = document.createTextNode(qc);
                        tdQC.appendChild(node);
                        tr.appendChild(tdQC);
                        //IS_FULL
                        if (data[i].IS_FULL == '0') err_bundle = err_bundle + 1;
                        var tdFull = document.createElement("td");
                        tdFull.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node;
                        if (data[i].IS_FULL == 0)
                            node = document.createTextNode('Đủ tem');
                        // else if (data[i].IS_FULL>=100)
                        //     node=document.createTextNode('Đã chỉnh sửa');
                        else
                            node = document.createTextNode('Thiếu tem');
                        tdFull.appendChild(node);
                        tr.appendChild(tdFull);
                        //FILE
                        var tdFile = document.createElement("td");
                        tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(data[i].FILE);
                        tdFile.appendChild(node);
                        tr.appendChild(tdFile);
                        // //ISSUE FILE
                        // var tdIssue=document.createElement("td");
                        // tdIssue.setAttribute("class","mdl-data-table__cell--non-numeric");
                        // var node=document.createTextNode(data[i].ISSUE_FILE);
                        // tdIssue.appendChild(node);
                        // tr.appendChild(tdIssue);
                        tr.setAttribute('ondblclick', 'function_group_search(this, 1)');
                        componentHandler.upgradeElement(tr);
                        body_table_group_search.appendChild(tr);
                        rowIndexWip = rowIndexWip + 1;
                    }
                }
                if (error_list != 'empty') {
                    var rowIndexErrorImage = 0;
                    for (var i = 0; i < error_list.length; i++) {
                        var tr = document.createElement("tr");
                        //STT
                        var tdSTT = document.createElement("td");
                        tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(rowIndexErrorImage);
                        tdSTT.appendChild(node);
                        tr.appendChild(tdSTT);
                        //FILE
                        var tdFile = document.createElement("td");
                        tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(error_list[i].FILE);
                        tdFile.appendChild(node);
                        tr.appendChild(tdFile);
                        tr.setAttribute('ondblclick', 'function_group_error_search(this)');
                        componentHandler.upgradeElement(tr);
                        body_table_error_search.appendChild(tr);
                        rowIndexErrorImage = rowIndexErrorImage + 1;
                    }
                    document.getElementById('txt_error_scan').innerHTML = 'Hệ thống không xử lý được: ' + error_list.length;
                    document.getElementById('txt_badge_err').setAttribute('data-badge', error_list.length);
                } else {
                    document.getElementById('txt_error_scan').innerHTML = 'Hệ thống không xử lý được: 0';
                    document.getElementById('txt_badge_err').setAttribute('data-badge', 0);
                }
                document.getElementById('txt_wip').innerHTML = 'WIP Sewing: ' + wip_s.toString();
                document.getElementById('txt_wip_ns').innerHTML = 'WIP Non-Sewing: ' + wip_ns.toString();
                document.getElementById('txt_badge_wip').setAttribute('data-badge', wip);
                document.getElementById('txt_image_scanned').innerHTML = 'Số tem hệ thống ghi nhận: ' + (sum_scan - wip);
                document.getElementById('txt_image_error_scan').innerHTML = 'Số ảnh thiếu Tem QC hoặc ID NV: ' + err_scan.toString();
                document.getElementById('txt_image_error_bundle').innerHTML = 'Thiếu tem NV: ' + err_bundle.toString();
                document.getElementById('txt_image_error_qc').innerHTML = 'Thiếu tem QC: ' + err_qc.toString();
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var date = year + month + day;
    data = { group: group, date: date };
    xsend.send(JSON.stringify(data));
}
function group_search_special(group) {
    table_double_search.style.display = "none";
    var body_table_double_search = document.getElementById("table_double_search_body");
    while (body_table_double_search.childNodes.length > 0)
        body_table_double_search.removeChild(body_table_double_search.childNodes[0]);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/GroupMultipleOperations", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            if (data.length == 0) {
                table_double_search.style.display = "none";
                return;
            }
            table_double_search.style.display = "grid";
            var rowIndex = 0;
            for (var i = 0; i < data.length; i++) {
                var tr = document.createElement("tr");
                //STT
                var tdSTT = document.createElement("td");
                tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(rowIndex);
                tdSTT.appendChild(node);
                tr.appendChild(tdSTT);
                //Employee
                var tdEmployee = document.createElement("td");
                tdEmployee.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].EMPLOYEE);
                tdEmployee.appendChild(node);
                tr.appendChild(tdEmployee);
                //NumOp
                var tdNumOp = document.createElement("td");
                tdNumOp.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].QC);
                tdNumOp.appendChild(node);
                tr.appendChild(tdNumOp);
                //NumTicket
                var tdNumTicket = document.createElement("td");
                tdNumTicket.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].TICKET);
                tdNumTicket.appendChild(node);
                tr.appendChild(tdNumTicket);
                //FILE
                var tdFile = document.createElement("td");
                tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].FILE);
                tdFile.appendChild(node);
                tr.appendChild(tdFile);
                tr.setAttribute('ondblclick', 'function_group_search(this, 2)');
                componentHandler.upgradeElement(tr);
                body_table_double_search.appendChild(tr);
                rowIndex = rowIndex + 1;
            }
            document.getElementById('txt_badge_double').setAttribute('data-badge', rowIndex);
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var full_date = document.getElementById('date_group_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;
    data = { group: group, date: date };
    xsend.send(JSON.stringify(data));
    console.log(data)
}
document.getElementById('btn_group_search').addEventListener('click', function () {
    tab_mode = 1;
    group_data = document.getElementById('txt_group').value;
    shift = document.getElementById('txt_shift').value;
    if (group_data == '001-007' && shift == 'CACHAN') group_data = '001-009';
    if (group_data == '010-017' && shift == 'CALE') group_data = '008-014';
    var fromLine = group_data.substr(0, 3);
    var toLine = group_data.substr(4, 3);
    if (shift == 'CALE') {
        group = fromLine + toLine + 'R';
    }
    else {
        group = fromLine + toLine + 'B';
    }

    group_search_data(group_data);
    group_search_special(group_data);
});
var listInput = document.getElementsByName('cb_option')[0];
var handInput = document.getElementsByName('cb_option')[1];
listInput.addEventListener('change', function () {
    if (listInput.checked == true) {
        // document.getElementById('cbb_bundle').style.display='grid';
        // document.getElementById('txt_bundle').style.display='none';
    }
});
handInput.addEventListener('change', function () {
    if (handInput.checked == true) {
        // document.getElementById('cbb_bundle').style.display='none';
        // document.getElementById('txt_bundle').style.display='grid';
    }
});
function imageExists(image_url) {
    console.log(image_url);
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    return http.status != 404;
}
var fileName = '';
function function_group_search(x, mode, col = 0) {
    console.log(mode);
    document.getElementById('btn_bundle_submit').disabled = false;
    if (mode == 3) {
        image_name = x.childNodes[col].innerHTML;
        var dateBundle = "";
        if (col == 8) dateBundle = x.childNodes[3].innerHTML;
        console.log(image_name);
        var full_date = document.getElementById('date_group_search').value;
        var image_date = image_name.substr(6, 10);
        var image_day = image_date.substr(0, 2);
        var image_month = image_date.substr(3, 2);
        var image_year = image_date.substr(6, 4);
        var image_dated = image_year + '-' + image_month + '-' + image_day;
        var image_date_record = image_year + image_month + image_day;
        var image_shift_record = image_name[6];
        var shift_record = 'CALE';
        if (image_shift_record == 'R') shift_record = 'CALE';
        if (image_shift_record == 'B') shift_record = 'CACHAN';
        full_date = image_dated;
        folder_name = image_name.substring(0, 6);
        if (folder_name == '001007') folder_name = '001008';
        if (folder_name == '001009') folder_name = '001008';
        if (group == '010017R') folder_name = '008014';
        s = image_name.substring(6, 7);
        if (s == 'R') shift = 'CALE'
        else if (s == 'B') shift = 'CACHAN'
        console.log(folder_name, shift, image_name);
        fileName = image_name;
        if (full_date != today.substr(0, 10)) {
            year = full_date.substr(0, 4);
            month = full_date.substr(5, 2);
            day = full_date.substr(8, 2);
            var date = year + month + day;

            folder_root = image_name.substring(0, 7);
            i = 7;
            while (i < image_name.length && image_name[i] != '_') {
                folder_root += image_name[i];//.substring(8, image_name.length);
                i++;
                // console.log(i);
            }
            image_name_root = image_name.substring(i + 1, image_name.length);
            document.getElementById('show_image').src = "";
            if (imageExists('../image2/' + date + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image2/' + date + '/' + image_name + '_done.jpg';
            else if (imageExists('../image2/Backup/' + date + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image2/Backup/' + date + '/' + image_name + '_done.jpg';
            else if (imageExists('../image/Backup/' + image_date_record + '/' + shift_record + '/' + folder_name + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/Backup/' + image_date_record + '/' + shift_record + '/' + folder_name + '/' + image_name + '_done.jpg';
            else if (imageExists('../image9/' + date + '/' + shift + '/' + folder_name + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image9/' + date + '/' + shift + '/' + folder_name + '/' + image_name + '_done.jpg';
            else if (imageExists('../image/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/' + image_name + '_done.jpg';
            // document.getElementById('show_image').src='../image/Backup/'+date+'/'+shift+'/'+folder_name+'/'+image_name+'_done.jpg';
        } else {
            document.getElementById('show_image').src = '../image/' + image_name + '_done.jpg';
        }
        document.getElementById('btn_bundle_confirm').style.display = 'none';
    } else {
        document.getElementById('txt_name').innerHTML = '';
        image_name = x.childNodes[4].innerHTML;
        console.log(image_name);
        var dateBundle = "";
        if (col == 8) dateBundle = x.childNodes[3].innerHTML;
        folder_name = group.substring(0, 6);
        if (folder_name == '001007') folder_name = '001008';
        if (folder_name == '001009') folder_name = '001008';
        if (group == '010017R') folder_name = '008014';
        // if (folder_name=='204210') shift='CACHAN';
        fileName = image_name;
        var full_date = document.getElementById('date_group_search').value;
        var image_date = image_name.substr(6, 10);
        var image_day = image_date.substr(0, 2);
        var image_month = image_date.substr(3, 2);
        var image_year = image_date.substr(6, 4);
        var image_dated = image_year + '-' + image_month + '-' + image_day;
        var image_date_record = image_year + image_month + image_day;
        var image_shift_record = image_name[6];
        var shift_record = 'CALE';
        if (image_shift_record == 'R') shift_record = 'CALE';
        if (image_shift_record == 'B') shift_record = 'CACHAN';
        full_date = image_dated;
        document.getElementById('show_image').src = "";
        if (full_date != today.substr(0, 10)) {
            year = full_date.substr(0, 4);
            month = full_date.substr(5, 2);
            day = full_date.substr(8, 2);
            var date = year + month + day;
            folder_root = image_name.substring(0, 7);
            i = 7;
            while (i < image_name.length && image_name[i] != '_') {
                folder_root += image_name[i];//.substring(8, image_name.length);
                i++;
                console.log(i);
            }
            image_name_root = image_name.substring(i + 1, image_name.length);
            console.log(image_name_root, folder_root);
            if (imageExists('../image2/' + date + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image2/' + date + '/' + image_name + '_done.jpg';
            else if (imageExists('../image2/Backup/' + date + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image2/Backup/' + date + '/' + image_name + '_done.jpg';
            else if (imageExists('../image/Backup/' + image_date_record + '/' + shift_record + '/' + folder_name + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/Backup/' + image_date_record + '/' + shift_record + '/' + folder_name + '/' + image_name + '_done.jpg';
            else if (imageExists('../image9/' + date + '/' + shift + '/' + folder_name + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image9/' + date + '/' + shift + '/' + folder_name + '/' + image_name + '_done.jpg';
            else if (imageExists('../image/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/' + image_name + '_done.jpg';
            else if (imageExists('../image/' + date + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/' + date + '/' + image_name + '_done.jpg';
        } else {
            if (imageExists('../image/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/' + image_name + '_done.jpg';
            else if (imageExists('../image/Pilot/' + shift_record + '/' + folder_name + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/Pilot/' + shift_record + '/' + folder_name + '/' + image_name + '_done.jpg';
            else if (imageExists('../image/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/' + image_name + '_done.jpg';
            else if (imageExists('../image/' + date + '/' + image_name + '_done.jpg'))
                document.getElementById('show_image').src = '../image/' + date + '/' + image_name + '_done.jpg';
        }
    }
    listInput.parentNode.MaterialRadio.check();
    handInput.parentNode.MaterialRadio.uncheck();
    QC = x.childNodes[2].innerHTML;
    if (tab_mode == 3) QC = x.childNodes[8].innerHTML;
    bundle = x.childNodes[1].innerHTML;
    var txt_note = document.getElementById('txt_note');
    txt_note.innerHTML = '';
    var list = document.getElementById("bundleScanList");
    while (list.childNodes.length > 0) {
        list.removeChild(list.childNodes[0]);
    }
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/BundleNew", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            console.log(data)
            if (data == 'empty') return;
            console.log("pay mode");
            document.getElementById('txt_ID_add').value = '';
            document.getElementById('bundleScan').value = '';
            if (mode == 1 || mode == 3) {
                document.getElementById('btn_bundle_skip').style.display = 'none';
                console.log("mode 1");
                for (var i = 0; i < data.length; i++) {
                    // if (data[i].EMPLOYEE==null){
                    var bundle_row = data[i].TICKET;
                    var li = document.createElement("li");
                    li.setAttribute("class", "mdl-menu__item");
                    var textNode = document.createTextNode(bundle_row);
                    li.appendChild(textNode);
                    list.appendChild(li);
                    getmdlSelect.init("#cbb_bundle");
                    // }
                }
            }
            // else if (mode==3){
            //     document.getElementById('btn_bundle_skip').style.display='none';
            //     console.log("mode 3");
            //     for (var i=0; i<data.length; i++){
            //         var bundle_row=data[i].TICKET;
            //         var li=document.createElement("li");
            //         li.setAttribute("class","mdl-menu__item");
            //         var textNode=document.createTextNode(bundle_row);
            //         li.appendChild(textNode);
            //         list.appendChild(li);ok see
            //         getmdlSelect.init("#cbb_bundle");
            //     }
            //}
            else if (mode == 2) {
                document.getElementById('btn_bundle_skip').style.display = 'grid';
                console.log("mode 2");
                employee = x.childNodes[1].innerHTML;
                console.log(employee);
                console.log(data);
                for (var i = 0; i < data.length; i++) {
                    console.log(data[i].TICKET)
                    if (employee == data[i].EMPLOYEE) {
                        var li = document.createElement("li");
                        li.setAttribute("class", "mdl-menu__item");
                        var textNode = document.createTextNode(data[i].TICKET);
                        li.appendChild(textNode);
                        list.appendChild(li);
                        getmdlSelect.init("#cbb_bundle");
                    }
                }
            }
            if (data != 'empty')
                for (var i = 0; i < data.length; i++)
                    if (data[i].EMPLOYEE != null) txt_note.innerHTML += "<div><b>" + data[i].TICKET + " - " + data[i].EMPLOYEE + "</b></div>";

        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var full_date = document.getElementById('date_group_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;
    data = { file: image_name, date: date, bundle: bundle };
    xsend.send(JSON.stringify(data));
    document.getElementById('btn_bundle_confirm').style.display = 'none';
    // document.getElementById('btn_bundle_skip').style.display='grid';
    document.getElementById('data').showModal();
}
function function_group_error_search(x) {
    console.log('file cap nhat moi nhat boi mai ngoi')
    image_name = x.childNodes[1].innerHTML;
    document.getElementById('btn_bundle_confirm').style.display = 'grid';
    document.getElementById('btn_bundle_submit').disabled = true;
    // document.getElementById('btn_bundle_skip').style.display='none';
    folder_name = group.substring(0, 6);
    if (folder_name == '001007') folder_name = '001008';
    if (folder_name == '001009') folder_name = '001008';
    if (group == '010017R') folder_name = '008014';
    // if (group=='284290B') folder_name='284290';
    // if (folder_name=='204210') shift='CACHAN';
    fileName = image_name;
    var full_date = document.getElementById('date_group_search').value;
    if (full_date != today.substr(0, 10)) {
        year = full_date.substr(0, 4);
        month = full_date.substr(5, 2);
        day = full_date.substr(8, 2);
        var date = year + month + day;
        if (imageExists('../image2/Backup/' + date + '/' + image_name + '_done.jpg'))
            document.getElementById('show_image').src = '../image2/Backup/' + date + '/' + image_name + '_done.jpg';
        else if (imageExists('../image/' + image_name + '_done.jpg'))
            document.getElementById('show_image').src = '../image/' + image_name + '_done.jpg';
        // else if (imageExists('../image7/'+date+'/'+shift+'/'+folder_name+'/'+image_name+'_done.jpg'))
        //     document.getElementById('show_image').src='../image7/'+date+'/'+shift+'/'+folder_name+'/'+image_name+'_done.jpg';
        // else if (imageExists('../image8/'+date+'/'+shift+'/'+folder_name+'/'+image_name+'_done.jpg'))
        //     document.getElementById('show_image').src='../image8/'+date+'/'+shift+'/'+folder_name+'/'+image_name+'_done.jpg';
        else if (imageExists('../image2/' + date + '/' + image_name + '_done.jpg'))
            document.getElementById('show_image').src = '../image2/' + date + '/' + image_name + '_done.jpg';
        // document.getElementById('show_image').src='../image/Backup/'+date+'/'+shift+'/'+folder_name+'/'+image_name+'_done.jpg';
        console.log('chay xong vong lap')
        document.getElementById('show_image').style.width = '880px';
    } else {
        document.getElementById('show_image').src = '../image/' + image_name + '_done.jpg';
        document.getElementById('show_image').style.width = '880px';
    }
    document.getElementById('btn_bundle_confirm').style.display = 'grid';
    // document.getElementById('btn_bundle_skip').style.display='grid';
    document.getElementById('data').showModal();
}
document.getElementById('btn_bundle_skip').addEventListener('click', function () {
    console.log('skip button');
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/Skip", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            console.log(data);
            if (data.result == 'done') {
                document.getElementById('data').close();
                document.getElementById('btn_group_search').click();
            } else {
                alert('Hãy thử lại');
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var full_date = document.getElementById('date_group_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;

    data = { date: date, file: fileName, QC: QC };
    console.log(data);
    xsend.send(JSON.stringify(data));
});
document.getElementById('txt_ID').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("btn_ID_search").click();
    }
});
function ID_search_workHrs() {
    var xsend2 = new XMLHttpRequest();
    xsend2.open("POST", "/Production/Payroll_Search/GetTimeSheet", true);
    xsend2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend2.responseText);
            console.log(data)
            if (data != 'empty') {
                document.getElementById('txt_reg_hrs').innerHTML = "Giờ quẹt thẻ: " + data[0].REG_HRS;
                document.getElementById('txt_ot').innerHTML = "Giờ tăng ca: " + data[0].OT;
                document.getElementById('txt_cd03').innerHTML = "Giờ 03: " + data[0].CD03;
                document.getElementById('txt_cd08').innerHTML = "Giờ 08: " + data[0].CD08;
                document.getElementById('txt_cd09').innerHTML = "Giờ 09: " + data[0].CD09;
                sah = document.getElementById('txt_sum_sah').innerHTML.split(": ")[1];
                workHrs = data[0].WORK_HRS - data[0].CD09;
                eff = 0;
                console.log(sah);
                if (workHrs > 0) eff = Math.round(sah / workHrs * 100);
                document.getElementById('txt_efficiency').innerHTML = "Hiệu suất: " + eff + "%";
                // document.getElementById('btn_bundle_submit').disabled=false;
            } else {
                alert('Không tìm thấy thông tin nhân viên!');
                document.getElementById('txt_reg_hrs').innerHTML = "Giờ quẹt thẻ: ";
                document.getElementById('txt_ot').innerHTML = "Giờ tăng ca: ";
                document.getElementById('txt_cd03').innerHTML = "Giờ 03: ";
                document.getElementById('txt_cd08').innerHTML = "Giờ 08: ";
                document.getElementById('txt_cd09').innerHTML = "Giờ 09: ";

            }
        }
    }
    var full_date = document.getElementById('date_ID_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;
    var full_date_from = document.getElementById('date_ID_search_from').value;
    year_from = full_date_from.substr(0, 4);
    month_from = full_date_from.substr(5, 2);
    day_from = full_date_from.substr(8, 2);
    var date_from = year_from + month_from + day_from;
    var id = document.getElementById('txt_ID').value;
    if (id.length == 6) id = id.substring(1, 6);
    if (isNaN(id)) {
        alert('ID là số có 5 chữ số');
        return;
    }
    data = { ID: id, date: date, datefrom: date_from };
    console.log(data);
    xsend2.setRequestHeader("Content-type", "application/json");
    xsend2.send(JSON.stringify(data));
}
document.getElementById('btn_ID_search').addEventListener('click', function () {
    tab_mode = 3;
    //show information
    var id = document.getElementById('txt_ID').value;
    if (id.length == 6) id = id.substring(1, 6);

    if (isNaN(id)) {
        alert('ID là số có 5 hoặc 6 chữ số!');
        return;
    }
    var xsend1 = new XMLHttpRequest();
    xsend1.open("POST", "/Production/Payroll_Search/GetName", true);
    xsend1.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend1.responseText);
            if (data.result != 'empty') {
                document.getElementById('txt_ID_name').innerHTML = "Họ và Tên: " + data[0].Name;
                document.getElementById('txt_ID_ID').innerHTML = "ID: " + data[0].ID;
                document.getElementById('txt_ID_shift').innerHTML = "Ca: " + data[0].Shift;
                document.getElementById('txt_ID_line').innerHTML = "Line: " + data[0].Line;
                // document.getElementById('btn_bundle_submit').disabled=false;
            } else {
                alert('Không tìm thấy thông tin nhân viên!');
                document.getElementById('txt_ID_name').innerHTML = "Họ và Tên: ";
                document.getElementById('txt_ID_ID').innerHTML = "ID: ";
                document.getElementById('txt_ID_shift').innerHTML = "Ca: ";
                document.getElementById('txt_ID_line').innerHTML = "Line: ";
            }
        }
    }

    xsend1.setRequestHeader("Content-type", "application/json");
    data = { ID: id };
    xsend1.send(JSON.stringify(data));

    //show SAH
    table_ID_search.style.display = "none";
    var table_ID_load_spinner = document.getElementById('table_ID_spinner');
    table_ID_load_spinner.setAttribute("class", "mdl-spinner mdl-js-spinner is-active");
    componentHandler.upgradeElement(table_ID_load_spinner);
    var body_table_ID_search = document.getElementById("table_ID_search_body");
    while (body_table_ID_search.childNodes.length > 0)
        body_table_ID_search.removeChild(body_table_ID_search.childNodes[0]);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/ID", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            var sum_sah = 0;
            if (data == 'empty') {
                alert('Không tìm thấy dữ liệu!');
                document.getElementById('txt_sum_ticket').innerHTML = 'Tổng tem: 0';
                document.getElementById('txt_sum_sah').innerHTML = 'Earned Hours: 0';
            } else {
                table_ID_load_spinner.removeAttribute("class");
                table_ID_search.style.display = "grid";
            }
            for (var i = 0; i < data.length; i++) {
                var tr = document.createElement("tr");
                //Bundle
                var tdBundle = document.createElement("td");
                tdBundle.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].BUNDLE);
                tdBundle.appendChild(node);
                tr.appendChild(tdBundle);
                //CODE
                var tdCode = document.createElement("td");
                tdCode.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].OPERATION_CODE);
                tdCode.appendChild(node);
                tr.appendChild(tdCode);
                //SAH
                if (data[i].EARNED_HOURS != 'null') sum_sah = sum_sah + data[i].EARNED_HOURS;
                else tr.setAttribute("style", "background-color: orange");
                var tdSAM = document.createElement("td");
                tdSAM.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(Math.round(data[i].EARNED_HOURS * 100) / 100);
                tdSAM.appendChild(node);
                tr.appendChild(tdSAM);
                //UNITS
                var tdUnit = document.createElement("td");
                tdUnit.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].UNITS);
                tdUnit.appendChild(node);
                tr.appendChild(tdUnit);
                //Worklot
                var tdWorklot = document.createElement("td");
                tdWorklot.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].WORK_LOT);
                tdWorklot.appendChild(node);
                tr.appendChild(tdWorklot);
                //UNITS
                var tdFile = document.createElement("td");
                tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].FILE);
                tdFile.appendChild(node);
                tr.appendChild(tdFile);
                // tr.setAttribute('ondblclick', 'function_group_search(this, 3, 5)');
                tr.setAttribute('ondblclick', 'function_find_bundle(this)');
                componentHandler.upgradeElement(tr);
                body_table_ID_search.appendChild(tr);
            }
            document.getElementById('txt_sum_ticket').innerHTML = 'Tổng tem: ' + data.length;
            document.getElementById('txt_sum_sah').innerHTML = 'Earned Hours: ' + Math.round(sum_sah / 60 * 100) / 100;
            //show workHrs
            ID_search_workHrs();
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var full_date = document.getElementById('date_ID_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;
    var full_date_from = document.getElementById('date_ID_search_from').value;
    year_from = full_date_from.substr(0, 4);
    month_from = full_date_from.substr(5, 2);
    day_from = full_date_from.substr(8, 2);
    var date_from = year_from + month_from + day_from;
    data = { id: id, date: date, datefrom: date_from };
    xsend.send(JSON.stringify(data));

});

document.getElementById('txt_worklot').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("btn_worklot_summary").click();
    }
});

document.getElementById('btn_worklot_summary').addEventListener('click', function () {
    tab_mode = 4;
    table_worklot_summary.style.display = "none";
    var table_worklot_load_spinner = document.getElementById('table_worklot_spinner');
    table_worklot_load_spinner.setAttribute("class", "mdl-spinner mdl-js-spinner is-active");
    componentHandler.upgradeElement(table_worklot_load_spinner);
    var body_table_worklot_summary = document.getElementById("table_worklot_summary_body");
    while (body_table_worklot_summary.childNodes.length > 0)
        body_table_worklot_summary.removeChild(body_table_worklot_summary.childNodes[0]);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/WorklotSummary", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            if (data == 'empty') {
                alert('Không tìm thấy dữ liệu!');
                document.getElementById('txt_sum_wl').innerHTML = 'Tổng tem: 0';
                document.getElementById('txt_notscan_wl').innerHTML = 'Đã scan: 0';
            }
            else {
                table_worklot_load_spinner.removeAttribute("class");
                table_worklot_summary.style.display = "grid";
            }
            var labels = new Array();
            var values = new Array();
            sum_issue = 0;
            sum_scan = 0;
            sum_ia = 0;
            sum_left = 0;
            for (var i = 0; i < data.length; i++) {
                sum_issue += 1;//data[i].ISSUE;
                if (data[i].EARN > 0)
                    sum_scan += 1;
                if (data[i].IA > 0)
                    sum_ia += 1;
                if (data[i].NOT_EARN == data[i].ISSUE)
                    sum_left += 1;
                if (data[i].NOT_EARN > 0) {
                    var tr = document.createElement("tr");
                    //BUNDLE
                    var tdBundle = document.createElement("td");
                    tdBundle.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].BUNDLE);
                    tdBundle.appendChild(node);
                    tr.appendChild(tdBundle);
                    //FILE
                    var tdCreate = document.createElement("td");
                    tdCreate.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].FILE);
                    tdCreate.appendChild(node);
                    tr.appendChild(tdCreate);
                    //ISSUE
                    var tdEmployee = document.createElement("td");
                    tdEmployee.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].ISSUE);
                    tdEmployee.appendChild(node);
                    tr.appendChild(tdEmployee);
                    //EARN
                    var tdEarn = document.createElement("td");
                    tdEarn.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].EARN);
                    tdEarn.appendChild(node);
                    tr.appendChild(tdEarn);
                    //IA
                    var tdCode = document.createElement("td");
                    tdCode.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].IA);
                    tdCode.appendChild(node);
                    tr.appendChild(tdCode);
                    //NOT_EARN
                    var tdSAM = document.createElement("td");
                    tdSAM.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].NOT_EARN);
                    tdSAM.appendChild(node);
                    tr.appendChild(tdSAM);
                    //NOT_EARN
                    var tdStatus = document.createElement("td");
                    tdStatus.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var nodeTxt = "";
                    if (data[i].NOT_EARN < data[i].ISSUE) nodeTxt = "Thiếu tem";
                    else nodeTxt = "Thiếu nguyên tờ";
                    var node = document.createTextNode(nodeTxt);
                    tdStatus.appendChild(node);
                    tr.appendChild(tdStatus);
                    if (nodeTxt == "Thiếu tem") tr.setAttribute("style", "background-color: orange");
                    tr.setAttribute('ondblclick', 'function_find_bundle(this)');
                    componentHandler.upgradeElement(tr);
                    body_table_worklot_summary.appendChild(tr);
                }
            }
            // labels.push('Kho in'); values.push(sum_issue);
            // labels.push('Đã scan'); values.push(sum_scan);
            // labels.push('Trả IA'); values.push(sum_ia);
            // labels.push('Còn lại'); values.push(sum_left);
            // document.getElementById("worklot_chart_div").innerHTML='<canvas id="worklot_chart"></canvas>';
            // document.getElementById("worklot_chart_div").style.display="grid";
            // draw_graph(labels, values, '', 'worklot_chart', 'doughnut', "Scan", false);
            document.getElementById('txt_issue').innerHTML = 'Số tờ đã in: ' + sum_issue;
            document.getElementById('txt_scan').innerHTML = 'Số tờ đã scan: ' + sum_scan;
            document.getElementById('txt_ia').innerHTML = 'Số tờ trả IA: ' + sum_ia;
            document.getElementById('txt_notscan').innerHTML = 'Số tờ chưa scan: ' + sum_left;
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var worklot = document.getElementById('txt_worklot').value;
    get_sum_wl_release(worklot);
    data = { worklot: worklot };
    xsend.send(JSON.stringify(data));
});

function function_find_bundle(x) {
    bundle = x.childNodes[0].innerHTML;
    // document.getElementById('div_bundle_search').focus();
    // console.log(document.querySelectorAll("a[href='#scroll-tab-6']"));
    document.querySelectorAll("a[href='#scroll-tab-6']")[0].click();
    document.getElementById('txt_bundle_search').value = bundle;
    document.getElementById('txt_bundle_search').parentNode.classList.add('is-dirty');
    document.getElementById('btn_bundle_search').click();
}

document.getElementById('btn_bundle_cancel').addEventListener('click', function () {
    document.getElementById('data').close();
    document.getElementById('btn_group_search').click();
});

document.getElementById('txt_ID_add').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("btn_bundle_submit").click();
    }
    if (document.getElementById('txt_ID_add').value.length == 5) {
        var ID = document.getElementById('txt_ID_add').value;
        if (isNaN(ID)) {
            // document.getElementById('btn_bundle_submit').disabled=true;
            alert('ID là số có 5 chữ số');
            return;
        }
        var xsend = new XMLHttpRequest();
        xsend.open("POST", "/Production/Payroll_Search/GetName", true);
        xsend.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = JSON.parse(xsend.responseText);
                console.log(data);
                if (data.result != 'empty') {
                    document.getElementById('txt_name').innerHTML = "<b>" + data[0].Name + "</b>";
                    // document.getElementById('btn_bundle_submit').disabled=false;
                } else {
                    document.getElementById('txt_name').innerHTML = 'Không tìm thấy';
                    // alert('Không tìm thấy nhân viên trong hệ thống. Không thể thực hiện');
                    // document.getElementById('btn_bundle_submit').disabled=true;
                    // return;
                }
            }
        }
        xsend.setRequestHeader("Content-type", "application/json");
        data = { ID: ID };
        xsend.send(JSON.stringify(data));
    } else {
        document.getElementById('txt_name').innerHTML = '';
    }
});

document.getElementById('btn_bundle_submit').addEventListener('click', function () {
    var bundle = '';
    bundle = document.getElementById('bundleScan').value;
    if (bundle.length < 10) {
        alert('Bạn chưa nhập đủ 10 ký tự!');
        return;
    }
    if (document.getElementById('txt_name').innerHTML == 'Không tìm thấy') {
        alert('Không tìm thấy nhân viên trong hệ thống. Xác nhận không thành công!');
        return;
    }
    var ID = document.getElementById('txt_ID_add').value;
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/Submit", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            if (data.result == 'done') alert('Đã cập nhật thành công');
            document.getElementById('txt_ID_add').value = '';
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var full_date = document.getElementById('date_group_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;
    if (ID.length < 5) {
        alert('Bạn chưa nhập đủ ID Nhân viên');
        return;
    }
    if (isNaN(ID)) {
        alert('ID là số có 5 chữ số');
        return;
    }
    if (bundle == '') {
        alert('Bạn chưa chọn mã Bundle');
        return;
    }
    if (tab_mode == 3) {
        console.log('hello');
        console.log(date_tab);
        date = date_tab;

    }
    data = { bundle: bundle, ID: ID, date: date, QC: QC, file: fileName };
    console.log(tab_mode, data)
    xsend.send(JSON.stringify(data));
});

var groupReportDialog = document.getElementById('dialog_group_report');

document.getElementById('btn_group_report').addEventListener('click', function () {
    groupReportDialog.showModal();
    group_data = document.getElementById('txt_group').value;
    console.log(group_data);
    if (group_data == '051-059') group_data = '051-058';
    if (group_data == '060-066') group_data = '059-066';
    shift = document.getElementById('txt_shift').value;
    var dialog_group_report_load_spinner = document.getElementById('dialog_group_report_spinner');
    dialog_group_report_load_spinner.setAttribute("class", "mdl-spinner mdl-js-spinner is-active");
    componentHandler.upgradeElement(dialog_group_report_load_spinner);
    var body_table_group_report = document.getElementById("table_group_report_body");
    while (body_table_group_report.childNodes.length > 0)
        body_table_group_report.removeChild(body_table_group_report.childNodes[0]);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/GroupReport", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            // console.log(data);
            dialog_group_report_load_spinner.removeAttribute("class");
            var rowIndex = 0;
            if (data.length > 0) {
                document.getElementById('table_group_report').style.display = 'grid';
            } else {
                alert('Không tìm thấy thông tin');
                groupReportDialog.close();
                return;
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i].Operation != null) {
                    var tr = document.createElement("tr");
                    //STT
                    var tdSTT = document.createElement("td");
                    tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(rowIndex);
                    tdSTT.appendChild(node);
                    tr.appendChild(tdSTT);
                    //ID
                    var tdID = document.createElement("td");
                    tdID.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].ID);
                    tdID.appendChild(node);
                    tr.appendChild(tdID);
                    //Name
                    var tdName = document.createElement("td");
                    tdName.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].Name);
                    tdName.appendChild(node);
                    tr.appendChild(tdName);
                    //Line
                    var tdLine = document.createElement("td");
                    tdLine.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].Line);
                    tdLine.appendChild(node);
                    tr.appendChild(tdLine);
                    //Operation
                    var tdOperation = document.createElement("td");
                    tdOperation.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].Operation);
                    tdOperation.appendChild(node);
                    tr.appendChild(tdOperation);
                    //Bundle
                    var tdBundle = document.createElement("td");
                    tdBundle.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].Bundle);
                    tdBundle.appendChild(node);
                    tr.appendChild(tdBundle);
                    componentHandler.upgradeElement(tr);
                    body_table_group_report.appendChild(tr);
                }
                rowIndex = rowIndex + 1;
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var full_date = document.getElementById('date_group_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;
    // if (group=='200-234'){
    //     return;
    // }
    data = { group: group_data, shift: shift, date: date };
    xsend.send(JSON.stringify(data));
});

document.getElementById('btn_group_report_close').addEventListener('click', function () {
    groupReportDialog.close();
});

var groupDetailDialog = document.getElementById('dialog_group_detail');
var body_table_group_detail = document.getElementById('table_group_detail_body');
function show_group_detail() {
    if (group_detail_data != null) {
        var rowIndex = 1;
        document.getElementById('table_group_detail').style.display = 'Grid';
        while (body_table_group_detail.childNodes.length > 0)
            body_table_group_detail.removeChild(body_table_group_detail.childNodes[0]);
        for (var i = 0; i < group_detail_data.length; i++) {
            var tr = document.createElement("tr");
            //STT
            var tdSTT = document.createElement("td");
            tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
            var node = document.createTextNode(group_detail_data.length - rowIndex + 1);
            tdSTT.appendChild(node);
            tr.appendChild(tdSTT);
            //FILE
            var tdFile = document.createElement("td");
            tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
            var node = document.createTextNode(group_detail_data[i].FILE);
            tdFile.appendChild(node);
            tr.appendChild(tdFile);
            //Time
            var tdTime = document.createElement("td");
            tdTime.setAttribute("class", "mdl-data-table__cell--non-numeric");
            var node = document.createTextNode(group_detail_data[i].FILE.substring(19, 21) + ' : ' + group_detail_data[i].FILE.substring(21, 23));
            tdTime.appendChild(node);
            tr.appendChild(tdTime);
            //Tem
            var tdTicket = document.createElement("td");
            tdTicket.setAttribute("class", "mdl-data-table__cell--non-numeric");
            var node = document.createTextNode(group_detail_data[i].SCAN + "/" + group_detail_data[i].ISSUE);
            tdTicket.appendChild(node);
            tr.appendChild(tdTicket);
            //TimeUpdate
            var tdTimeUpdate = document.createElement("td");
            tdTimeUpdate.setAttribute("class", "mdl-data-table__cell--non-numeric");
            var timeUpdate = (new Date(group_detail_data[i].TimeUpdate)).toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
            var node = document.createTextNode(timeUpdate);
            tdTimeUpdate.appendChild(node);
            tr.appendChild(tdTimeUpdate);
            //TimeModified
            var tdTimeModified = document.createElement("td");
            tdTimeModified.setAttribute("class", "mdl-data-table__cell--non-numeric");
            var node;
            if (group_detail_data[i].TimeModified != null) {
                var timeModified = (new Date(group_detail_data[i].TimeModified)).toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
                node = document.createTextNode(timeModified);
            }
            else
                node = document.createTextNode('');
            tdTimeModified.appendChild(node);
            tr.appendChild(tdTimeModified);
            //Issue
            var tdIssue = document.createElement("td");
            tdIssue.setAttribute("class", "mdl-data-table__cell--non-numeric");
            var node = document.createTextNode(group_detail_data[i].ISSUE_FILE);
            tdIssue.appendChild(node);
            tr.appendChild(tdIssue);
            componentHandler.upgradeElement(tr);
            body_table_group_detail.appendChild(tr);
            rowIndex = rowIndex + 1;
        }
    } else {
        alert('Không tìm thấy thông tin!');
        return;
    }
    groupDetailDialog.showModal();
}

document.getElementById('btn_group_detail_close').addEventListener('click', function () {
    groupDetailDialog.close();
});

document.getElementById('txt_bundle_search').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("btn_bundle_search").click();
    }
});

document.getElementById('btn_bundle_search').addEventListener('click', function () {
    tab_mode = 3;
    var bundle = document.getElementById('txt_bundle_search').value.toUpperCase();
    var xsend = new XMLHttpRequest();
    var body_table_bundle_search = document.getElementById('table_bundle_search_body');
    xsend.open("POST", "/Production/Payroll_Search/BundleSearch", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            if (data != 'empty') {
                console.log(data);
                document.getElementById('table_bundle_search').style.display = 'Grid';
                while (body_table_bundle_search.childNodes.length > 0)
                    body_table_bundle_search.removeChild(body_table_bundle_search.childNodes[0]);
                var rowIndex = 0;
                console.log(data.length);
                date_tab = data[0].DATE;
                for (var i = 0; i < data.length; i++) {
                    var tr = document.createElement("tr");
                    //STT
                    var tdSTT = document.createElement("td");
                    tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(rowIndex);
                    tdSTT.appendChild(node);
                    tr.appendChild(tdSTT);
                    //Ticket
                    var tdTicket = document.createElement("td");
                    tdTicket.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].TICKET);
                    tdTicket.appendChild(node);
                    tr.appendChild(tdTicket);
                    //Employee
                    var tdEmployee = document.createElement("td");
                    tdEmployee.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].EMPLOYEE);
                    tdEmployee.appendChild(node);
                    tr.appendChild(tdEmployee);
                    //Date
                    var tdDate = document.createElement("td");
                    tdDate.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].DATE);
                    tdDate.appendChild(node);
                    tr.appendChild(tdDate);
                    //EARN
                    var tdSAH = document.createElement("td");
                    tdSAH.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].EARNED_HOURS);
                    tdSAH.appendChild(node);
                    tr.appendChild(tdSAH);
                    //Worklot
                    var tdWL = document.createElement("td");
                    tdWL.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].WORK_LOT);
                    tdWL.appendChild(node);
                    tr.appendChild(tdWL);
                    //File
                    var tdFile = document.createElement("td");
                    tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    var node = document.createTextNode(data[i].FILE);
                    tdFile.appendChild(node);
                    tr.appendChild(tdFile);
                    //NgtdMode
                    var tdMode = document.createElement("td");
                    tdMode.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    modified = '';
                    if (data[i].MODIFIED != null && data[i].MODIFIED != '') modified = data[i].MODIFIED;
                    var node = document.createTextNode(modified);
                    tdMode.appendChild(node);
                    tr.appendChild(tdMode);
                    //QC
                    var tdQC = document.createElement("td");
                    tdQC.setAttribute("class", "mdl-data-table__cell--non-numeric");
                    qc = ''
                    if (data[i].QC != null) qc = data[i].QC;
                    var node = document.createTextNode(qc);
                    tdQC.appendChild(node);
                    tr.appendChild(tdQC);
                    tr.setAttribute('ondblclick', 'function_group_search(this, 3, 6)');
                    componentHandler.upgradeElement(tr);
                    body_table_bundle_search.appendChild(tr);
                    rowIndex = rowIndex + 1;
                }
            } else {
                alert('Không tìm thấy thông tin!');
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { bundle: bundle };
    xsend.send(JSON.stringify(data));
});

document.getElementById('btn_bundle_confirm').addEventListener('click', function () {
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/Dismiss_error", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(xsend.responseText);
            console.log(data);
            if (data.result == 'done') {
                alert('Đã xác nhận scan lại!');
                document.getElementById('data').close();
                document.getElementById('btn_group_search').click();
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { fileName: fileName };
    xsend.send(JSON.stringify(data));
});
var ticketIndex = 0;
var body_table_ticket_search = document.getElementById('table_ticket_search_body');
var txt_ticket_status = document.getElementById('txt_ticket_status');
document.getElementById('txt_ticket_search').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        var ticket = document.getElementById('txt_ticket_search').value;
        if (ticket.length == 10) {
            var xsend = new XMLHttpRequest();
            xsend.open("POST", "/Production/Payroll_Search/Ticket", true);
            xsend.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    data = JSON.parse(xsend.responseText);
                    console.log(data);
                    if (data.result == 'empty') {
                        txt_ticket_status.innerHTML = ticket + " không tìm thấy!";
                        txt_ticket_status.setAttribute('style', 'color: Red');
                        var tr = document.createElement("tr");
                        //STT
                        var tdSTT = document.createElement("td");
                        tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(ticketIndex);
                        tdSTT.appendChild(node);
                        tr.appendChild(tdSTT);
                        //Ticket
                        var tdTicket = document.createElement("td");
                        tdTicket.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode(ticket);
                        tdTicket.appendChild(node);
                        tr.appendChild(tdTicket);
                        //Status
                        var tdStatus = document.createElement("td");
                        tdStatus.setAttribute("class", "mdl-data-table__cell--non-numeric");
                        var node = document.createTextNode('Chưa tồn tại');
                        tdStatus.appendChild(node);
                        tr.appendChild(tdStatus);
                        componentHandler.upgradeElement(tr);
                        body_table_ticket_search.appendChild(tr);
                        ticketIndex = ticketIndex + 1;
                        document.getElementById('txt_ticket_search').parentElement.MaterialTextfield.change("");
                    } else {
                        txt_ticket_status.innerHTML = ticket + " đã tồn tại!";
                        txt_ticket_status.setAttribute('style', 'color: Green');
                        document.getElementById('txt_ticket_search').parentElement.MaterialTextfield.change("");
                    }
                }
            }
            xsend.setRequestHeader("Content-type", "application/json");
            data = { ticket: ticket };
            xsend.send(JSON.stringify(data));
        }
    }
});

document.getElementById('btn_ticket_delete').addEventListener('click', function () {
    while (body_table_ticket_search.childNodes.length > 0)
        body_table_ticket_search.removeChild(body_table_ticket_search.childNodes[0]);
});

document.getElementById('btn_group_wip').addEventListener('click', function () {
    document.getElementById('wip_img').src = "../report/WIP/Report.png";
    document.getElementById('color_img1').src = "../report/ColorBalancing/Report1.png";
    document.getElementById('color_img').src = "../report/ColorBalancing/Report.png";
    document.getElementById('kickout_img').src = "../report/KickOut/Report.png";
    document.getElementById('endline_img').src = "../report/EndLine/Report.png";
    document.getElementById('dialog_wip_detail').showModal();
});

document.getElementById('btn_wip_detail_close').addEventListener('click', function () {
    document.getElementById('dialog_wip_detail').close();
});

document.getElementById('btn_group_output').addEventListener('click', function () {
    document.getElementById('dialog_output_detail').showModal();
    var dialog_output_detail_spinner = document.getElementById('dialog_output_detail_spinner');
    dialog_output_detail_spinner.setAttribute("class", "mdl-spinner mdl-js-spinner is-active");
    componentHandler.upgradeElement(dialog_output_detail_spinner);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/GroupOutput", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            dialog_output_detail_spinner.removeAttribute("class");
            data = JSON.parse(xsend.responseText);
            console.log(data);
            console.log(data.length)
            // var table_output_detail_body=document.getElementById('table_output_detail_body');
            // while (table_output_detail_body.childNodes.length>0)
            //     table_output_detail_body.removeChild(table_output_detail_body.childNodes[0]);
            var operation_list = new Array();
            var output_list = new Array();
            for (var i = 0; i < data.length; i++) {
                // console.log(data[i].OPERATION, data[i].HEADCOUNT, data[i].OUTPUT);
                // var tr=document.createElement("tr");
                // //Operation
                // var tdOp=document.createElement("td");
                // tdOp.setAttribute("class","mdl-data-table__cell--non-numeric");
                // var node=document.createTextNode(data[i].OPERATION);
                // tdOp.appendChild(node);
                // tr.appendChild(tdOp);
                // //Headcount
                // var tdHC=document.createElement("td");
                // tdHC.setAttribute("class","mdl-data-table__cell--non-numeric");
                // var node=document.createTextNode(data[i].HEADCOUNT);
                // tdHC.appendChild(node);
                // tr.appendChild(tdHC);
                // //Target
                // var tdOutput=document.createElement("td");
                // tdOutput.setAttribute("class","mdl-data-table__cell--non-numeric");
                // var node=document.createTextNode(data[i].OUTPUT);
                // tdOutput.appendChild(node);
                // tr.appendChild(tdOutput);
                // componentHandler.upgradeElement(tr);
                // table_output_detail_body.appendChild(tr);
                operation_list.push(data[i].OPERATION + ' (' + data[i].HC + ')');
                output_list.push(data[i].OUTPUT);
            }
            document.getElementById("group_chart_div").innerHTML = '<canvas id="group_chart"></canvas>';
            draw_graph(operation_list, output_list, 'OUTPUT', 'group_chart', 'horizontalBar');
        }
    }
    group_data = document.getElementById('txt_group').value;
    if (group_data == '051-059') group_data = '051-058';
    if (group_data == '060-066') group_data = '059-066';
    shift = document.getElementById('txt_shift').value;
    var full_date = document.getElementById('date_group_search').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + month + day;
    // data={group: group, date: date};
    var dateFile = '_' + day + '-' + month + '-' + year + '_';
    xsend.setRequestHeader("Content-type", "application/json");
    data = { group: group_data, shift: shift, date: date, dateFile: dateFile };
    console.log(data)
    xsend.send(JSON.stringify(data));
});

document.getElementById('btn_output_detail_close').addEventListener('click', function () {
    document.getElementById('dialog_output_detail').close();
});

var form = document.getElementById("upload_change_scan");
form.addEventListener("submit", e => {
    e.preventDefault();
    return false;
});
document.getElementById('btn_change_scan').addEventListener('click', function () {
    document.getElementById('file').click();
    document.getElementById("file").onchange = function () {
        if (document.getElementById("file").value != "")
            document.getElementById('submit').click();
    };
    var form = document.getElementById("upload_change_scan");
    form.addEventListener("submit", e => {
        if (document.getElementById('file').value != '') {
            e.preventDefault();
            var xsend = new XMLHttpRequest();
            xsend.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var data = JSON.parse(xsend.responseText);
                    if (data.result == 'done') {
                        alert("Đã cập nhật thành công!");
                    }
                }
            }
            var fileInput = document.getElementById('file');
            var file_name = new Array();
            var file_name_str = '';
            for (var i = 0; i < fileInput.files.length; i++) {
                extend = fileInput.files[i].name.split('.')[1];
                file = fileInput.files[i].name.split('.')[0];
                file_name.push({ 'file': file })
                file_name_str += file.substring(0, file.length - 5) + ';';
            }
            file_name_str = file_name_str.substring(0, file_name_str.length - 1);
            if (file_name_str.length != 0) {
                var date_change_scan = document.getElementById('date_change_scan').value;
                year = date_change_scan.substring(0, 4);
                month = date_change_scan.substring(5, 7);
                day = date_change_scan.substring(8, 10);
                date = year + month + day;
                data = { date: date, file_x: file_name_str };
                console.log(JSON.stringify(data));
                var r = confirm("Bạn đã chắc chắn đây là những tem cần đổi ngày?");
                if (r == true) {
                    document.getElementById("file").value = '';
                    xsend.open('POST', '/Production/Payroll_Search/Update_Date_Scan1', true);
                    xsend.setRequestHeader("Content-type", "application/json");
                    xsend.send(JSON.stringify(data));
                } else {
                    return;
                }
            }
        }
        return false;
    });
});

function func_supervisor_release_bundle() {
    // asslot=document.getElementById('txt_worklot').value;
    document.getElementById('dialog_worklot_infor').showModal();
}

function get_sum_wl_release(asslot) {
    document.getElementById('txt_sup_release_worklot').innerHTML = asslot.toString();
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/Sup_Release", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            asslot = JSON.parse(xsend.responseText);
            console.log(asslot);
            table_worklot_infor_body = document.getElementById('table_worklot_infor_body');
            while (table_worklot_infor_body.childNodes.length > 0)
                table_worklot_infor_body.removeChild(table_worklot_infor_body.childNodes[0]);
            sum_wl = 0;
            for (i = 0; i < asslot.length; i++) {
                var tr = document.createElement("tr");
                //STT
                var tdSTT = document.createElement("td");
                tdSTT.setAttribute("class", "mdl-data-table__cell--non-numeric");
                tdSTT.setAttribute("style", "color: black;");
                var node = document.createTextNode(i + 1);
                tdSTT.appendChild(node);
                tr.appendChild(tdSTT);
                //Quality
                var tdQuantity = document.createElement("td");
                tdQuantity.setAttribute("class", "mdl-data-table__cell--non-numeric");
                tdQuantity.setAttribute("style", "color: black;");
                var node = document.createTextNode(asslot[i].QTY_ISSUE);
                tdQuantity.appendChild(node);
                tr.appendChild(tdQuantity);
                sum_wl += parseInt(asslot[i].QTY_ISSUE);
                //User
                var tdUser = document.createElement("td");
                tdUser.setAttribute("class", "mdl-data-table__cell--non-numeric");
                tdUser.setAttribute("style", "color: black;");
                var node = document.createTextNode(asslot[i].USER);
                tdUser.appendChild(node);
                tr.appendChild(tdUser);
                //Note
                var tdNote = document.createElement("td");
                tdNote.setAttribute("class", "mdl-data-table__cell--non-numeric");
                tdNote.setAttribute("style", "color: black;");
                var node = document.createTextNode(asslot[i].NOTE);
                tdNote.appendChild(node);
                tr.appendChild(tdNote);
                //TimeUpdate
                var tdTime = document.createElement("td");
                tdTime.setAttribute("class", "mdl-data-table__cell--non-numeric");
                tdTime.setAttribute("style", "color: black;");
                var node = document.createTextNode(asslot[i].TIME_RELEASE);
                tdTime.appendChild(node);
                tr.appendChild(tdTime);
                componentHandler.upgradeElement(tr);
                table_worklot_infor_body.appendChild(tr);
            }
            document.getElementById('txt_sup_release').innerHTML = 'Phát tem: ' + sum_wl.toString();
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { asslot: asslot };
    xsend.send(JSON.stringify(data));
}
document.getElementById('btn_worklot_infor_close').addEventListener('click', function () {
    document.getElementById('dialog_worklot_infor').close();
});

document.getElementById('txt_sup_note').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        worklot = document.getElementById('txt_sup_release_worklot').innerHTML;
        quantity = document.getElementById('txt_sup_release_quantity').value;
        note = document.getElementById('txt_sup_note').value;
        if (worklot == '' || quantity == '') {
            alert('Thông tin chưa đầy đủ');
            return;
        }
        document.getElementById('txt_sup_release_worklot').innerHTML = worklot;
        var xsend = new XMLHttpRequest();
        xsend.open("POST", "/Production/Payroll_Search/Sup_Release_Submit", true);
        xsend.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = JSON.parse(xsend.responseText);
                get_sum_wl_release(worklot);
                document.getElementById('txt_sup_release_quantity').value = '';
                document.getElementById('txt_sup_note').value = '';
            }
        }
        xsend.setRequestHeader("Content-type", "application/json");
        data = { worklot: worklot, quantity: quantity, note: note };
        console.log(data);
        xsend.send(JSON.stringify(data));
    }
});

function draw_graph(name, list_data, label, chart_name, typeChar, title = "", grid = true) {
    var color = new Array();
    for (var i = 0; i < name.length; i++) {
        color.push('#' + (Math.random().toString(16) + '0000000').slice(2, 8));
    }
    var ctx = document.getElementById(chart_name).getContext('2d');
    var myChart = new Chart(ctx, {
        type: typeChar,//'bar',

        data: {
            labels: name,
            datasets: [{
                label: label,//'Sản lượng theo Công đoạn',
                data: list_data,
                backgroundColor: color,
                borderWidth: 1,
                fill: false
            }]
        }
        , options: {
            animation: {
                onComplete: function () {
                    var chartInstance = this.chart,
                        ctx = chartInstance.ctx;

                    ctx.font = Chart.helpers.fontString(15, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'center';

                    this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            var data = dataset.data[index];
                            ctx.fillText(data, bar._model.x + 25, bar._model.y);
                        });
                    });
                }
            },
            title: {
                display: true,
                text: title,
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        display: grid//true
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        display: grid//true
                    }
                }]
            }
        }
    });
}