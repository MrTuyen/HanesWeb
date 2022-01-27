
var baseUrl = "/production/mixsolve"

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


function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}
var ticket = "";
// document.getElementById('image_btn1').addEventListener('click', function(){
//     document.getElementById('image_name1').value='';
// });

// document.getElementById('image_btn2').addEventListener('click', function(){
//     document.getElementById('image_name2').value='';
// });
var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1).substr(0, 10);
document.getElementById('date_from').value = localISOTime
document.getElementById('date_to').value = localISOTime;
document.getElementById('btn_confirm').addEventListener('click', function () {
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/Alert_Update_Status", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xsend.responseText);
            document.getElementById('dialog_image_show').close();
            document.getElementById('btn_search').click();
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { ticket: ticket, status: 'Y' };
    xsend.send(JSON.stringify(data));
});

document.getElementById('btn_skip').addEventListener('click', function () {
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/Alert_Update_Status", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xsend.responseText);
            document.getElementById('dialog_image_show').close();
            document.getElementById('btn_search').click();
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    data = { ticket: ticket, status: 'I' };
    xsend.send(JSON.stringify(data));
});

document.getElementById('btn_search').addEventListener('click', function () {
    table_search.style.display = "none";
    var spinner = document.getElementById('spinner');
    spinner.setAttribute("class", "mdl-spinner mdl-js-spinner is-active");
    componentHandler.upgradeElement(spinner);
    var body_table_search = document.getElementById("table_body");
    while (body_table_search.childNodes.length > 0)
        body_table_search.removeChild(body_table_search.childNodes[0]);
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Production/Payroll_Search/Alert", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xsend.responseText)
            data = JSON.parse(xsend.responseText);

            spinner.removeAttribute("class");
            table_search.style.display = "grid";
            for (var i = 0; i < data.length; i++) {
                var tr = document.createElement("tr");
                //Ticket
                var tdTicket = document.createElement("td");
                tdTicket.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].TICKET);
                tdTicket.appendChild(node);
                tr.appendChild(tdTicket);
                //EMP
                var tdEmployee = document.createElement("td");
                tdEmployee.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].OLD_EMPLOYEE);
                tdEmployee.appendChild(node);
                tr.appendChild(tdEmployee);
                //FILE
                var tdFile = document.createElement("td");
                tdFile.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].OLD_FILE);
                tdFile.appendChild(node);
                tr.appendChild(tdFile);
                //EMP
                var tdEmployeeN = document.createElement("td");
                tdEmployeeN.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].NEW_EMPLOYEE);
                tdEmployeeN.appendChild(node);
                tr.appendChild(tdEmployeeN);
                //FILE
                var tdFileN = document.createElement("td");
                tdFileN.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var node = document.createTextNode(data[i].NEW_FILE);
                tdFileN.appendChild(node);
                tr.appendChild(tdFileN);
                //Status
                var tdStatus = document.createElement("td");
                tdStatus.setAttribute("class", "mdl-data-table__cell--non-numeric");
                if (data[i].STATUS == 'Y') tr.style.backgroundColor = 'orange';
                var node = document.createTextNode(data[i].STATUS);
                tdStatus.appendChild(node);
                tr.appendChild(tdStatus);
                // tr.setAttribute('ondblclick', 'function_group_search(this, 3, 5)');
                tr.setAttribute('ondblclick', 'function_find_bundle(this)');
                componentHandler.upgradeElement(tr);
                body_table_search.appendChild(tr);
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var full_date = document.getElementById('date_to').value;
    year = full_date.substr(0, 4);
    month = full_date.substr(5, 2);
    day = full_date.substr(8, 2);
    var date = year + '-' + month + '-' + day;
    var full_date_from = document.getElementById('date_from').value;
    year_from = full_date_from.substr(0, 4);
    month_from = full_date_from.substr(5, 2);
    day_from = full_date_from.substr(8, 2);
    var date_from = year_from + '-' + month_from + '-' + day_from;
    group_line = document.getElementById('txt_group').value;
    data = { date: date, datefrom: date_from, group: group_line };
    xsend.send(JSON.stringify(data));
});

function function_find_bundle(x) {
    ticket = x.childNodes[0].innerHTML;
    old_file = x.childNodes[2].innerHTML;
    new_file = x.childNodes[4].innerHTML;
    document.getElementById('image_name1').value = old_file;
    document.getElementById('image_name2').value = new_file;
    var bt = document.createElement('button');
    show_image('image_name1', 'show_image1');
    show_image('image_name2', 'show_image2');
    document.getElementById('dialog_image_show').showModal();
}

function imageExists(image_url) {
    console.log(image_url);
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    return http.status != 404;
}

document.getElementById('image_name1').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        show_image('image_name1', 'show_image1');
    }
});

document.getElementById('image_name2').addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        show_image('image_name2', 'show_image2');
    }
});

function show_image(img_name, img_element) {
    image_name = document.getElementById(img_name).value;
    group = image_name.substring(0, 6)
    shift = image_name.substring(6, 7);
    if (shift == 'B') shift = "BALI";
    if (shift == 'R') shift = "RIT";
    day = image_name.substring(6, 8);
    month = image_name.substring(9, 11);
    year = image_name.substring(12, 16);
    date = year + month + day;
    folder_name = group;
    dateBundle = date;
    folder_root = group;
    shift_record = shift
    image_name_root = image_name;
    image_date_record = date;

    var image = date + '/' + image_name + '_done.jpg';
    document.getElementById(img_element).src = '';
    if (imageExists('../image/' + image))
        document.getElementById(img_element).src = '../image/' + image;
    else if (imageExists('../image2/' + image))
        document.getElementById(img_element).src = '../image2/' + image;
    else if (imageExists('../image3/' + image))
        document.getElementById(img_element).src = '../image3/' + image;
    else if (imageExists('../image4/' + image))
        document.getElementById(img_element).src = '../image4/' + image;
}