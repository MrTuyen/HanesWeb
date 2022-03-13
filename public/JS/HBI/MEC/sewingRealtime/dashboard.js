$(document).ready(function () {
    $.ajax({
        url: '/innovation/realtime/locations',
        type: 'post',
        data: {
            'options': 1,
            'b': 32
        },
        dataType: 'json',
    }).done(function (response) {
        var a = '<option class="chart_header_option" value="ALL">ALL</option>';
        zoneChanged(this, 0);
        for (const x of response.data1) {
            a += '<option class="chart_header_option" value="' + x['Zone'] + '">Zone ' + x['Zone'] + '</option>\n';
        }
        document.getElementById('zone').innerHTML = a;
    })

    load();
});

function submit() {
    load();

}

function load() {
    check_time();
    var zone = document.getElementById("zone").value;
    var line = document.getElementById("line").value;
    var shift = document.getElementById("shift").value;
    var from_date = document.getElementById("timeCheckIn").value;
    var to_date = document.getElementById("timeCheckOut").value;
    if(zone ==''){zone="ALL";};
    if(line==''){line="ALL";};
    if(shift==''){shift="ALL";};
    if(from_date=='' && to_date==''){
       var nowDate= new Date();
       from_date=`${nowDate.getDate()}/${nowDate.getMonth()+1}/${nowDate.getFullYear()}`;
       to_date=from_date;
    }
    $.ajax({
        url: "/innovation/realtime/dataSubmit",
        type: "post",
        data: {
            'zone': zone,
            'line': line,
            'shift': shift,
            'from_date': from_date,
            'to_date': to_date
        },
        dataType: "json",
    }).done(function (response) {
        myChart1.data.labels = response.data.lableRunTime;
        myChart1.data.datasets[0].data = response.data.powerOnTime;
        myChart1.data.datasets[1].data = response.data.runTime;
        myChart1.data.datasets[2].data = response.data.lossTime;
        myChart2.data.labels = response.dataRatio.lableRunTimeRatio;
        myChart2.data.datasets[0].data = response.dataRatio.ratioRunTime;
        myChart2.data.datasets[1].data = response.dataRatio.ratioLossTime;
        myChart2.data.datasets[2].data = response.dataRatio.ratioNoLoad;
        myChart1.update();
        myChart2.update();
        myChart3.update();
    });
}

function zoneChanged(obj) {
    $.ajax({
        url: '/innovation/realtime/locations',
        type: 'post',
        data: {
            'options': 2,
            'lc': obj.value
        },
        dataType: 'json',
    }).done(function (response) {
        var a = '<option class="chart_header_option" value="ALL">ALL</option>';
        for (const x of response.data1[0]) {
            if (x['line'] != null) {
                a += `<option class="chart_header_option" value=${x['line']}>Line ${x['line']}</option>\n`;
            }
        }
        if (a != "") {
            document.getElementById('line').innerHTML = a;
        }
    })
}


function check_time() {
    var fd = document.getElementById('timeCheckIn').value.split("/");
    var td = document.getElementById('timeCheckOut').value.split("/");
    var date1 = new Date()
    var date2 = new Date()
    if(td!=''){
        date1 = new Date(td[2], td[1], td[0], 0, 0, 0)
        date2 = new Date(fd[2], fd[1], fd[0], 0, 0, 0)
    }
    
    if (date1 - date2 < 0) {
        date1.setDate(date2.getDate() + 1);
        toastr.warning(`To date không được nhỏ hơn from date`);
        document.getElementById('timeCheckOut').value = `${date1.getDate()}/${date1.getMonth()}/${date1.getFullYear()}`;
    }
    if ((date1 - date2) / 86400000 > 10) {
        date1.setDate(date2.getDate() + 10);
        toastr.warning(`Khoảng thời gian quá lớn. Chỉ lên chon thời gian trong khoảng 10 ngày`);
        document.getElementById('timeCheckOut').value = `${date1.getDate()}/${date1.getMonth()}/${date1.getFullYear()}`;
    }
}

function download_report() {
    var zone = document.getElementById("zone").value;
    var line = document.getElementById("line").value;
    var shift = document.getElementById("shift").value;
    var from_date = document.getElementById("timeCheckIn").value;
    var to_date = document.getElementById("timeCheckOut").value;
    $.ajax({
        url: "/innovation/realtime/downloadReport",
        type: "post",
        data: {
            'zone': zone,
            'line': line,
            'shift': shift,
            'from_date': from_date,
            'to_date': to_date
        },
        dataType: "json",
    }).done(function (response) {
        var date = new Date();
        // toastr.info(`Data Report (${date.getHours()}h${date.getMinutes()}p${date.getSeconds()}s ${date.getDay()}_${date.getMonth()}_${date.getFullYear()})`)
        exportToExcel(`Data Report (${date.toLocaleString()})`, {
            'sheetName1': "LossTime",
            'sheetName2': 'RunTime'
        }, response.data)
    });
}

function exportToExcel(fileName, sheetName, data) {
    if (data['dataLossTime'].length === 0 && data['dataRunTime'].length === 0) {
        toastr.warning('Không có data !');
        return;
    }
    let wb;
    let ws;
    wb = XLSX.utils.book_new();
    for (var key in data) {
        ws = XLSX.utils.json_to_sheet(data[key]);
        XLSX.utils.book_append_sheet(wb, ws, key);
    };
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}

$(function () {
    $("#timeCheckIn").datepicker({
        format: 'dd/mm/yyyy'
    });
    $("#timeCheckOut").datepicker({
        format: 'dd/mm/yyyy'
    });
    var nowTemp = new Date();
    var now = new Date(2018, 1, 1, 0, 0, 0, 0);
    var checkin = $('#timeCheckIn').datepicker({
        onRender: function (date) {
            return date.valueOf() < now.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function (ev) {
        if (ev.date.valueOf() > checkout.date.valueOf()) {
            // var newDate = new Date(ev.date)
            var fd = document.getElementById('timeCheckIn').value.split("/");
            var newDate = new Date(new Date(fd[0], fd[1], fd[2], 0, 0, 0));
            // newDate.setDate(newDate.getDate() + 1);

            checkout.setValue(newDate);
        }

        var fd = document.getElementById('timeCheckIn').value.split("/");
        var newDate = new Date(new Date(parseInt(fd[2]), parseInt(fd[1]) - 1, parseInt(fd[0]) + 1, 0, 0, 0));
        // newDate.setDate(newDate.getDate() + 1);
        checkout.setValue(newDate);
        checkin.hide();
        $('#timeCheckOut')[0].focus();
    }).data('datepicker');
    var checkout = $('#timeCheckOut').datepicker({
        onRender: function (date) {
            return date.valueOf() <= $("#timeCheckIn").val() ? 'disabled' : '';
        }
    }).on('changeDate', function (ev) {
        check_time();
        checkout.hide();

    }).data('datepicker');
    document.getElementById('timeCheckOut').value = `${nowTemp.getDate()+1}/${nowTemp.getMonth()+1}/${nowTemp.getFullYear()}`;
    document.getElementById('timeCheckIn').value = `${nowTemp.getDate()}/${nowTemp.getMonth()+1}/${nowTemp.getFullYear()}`;
});