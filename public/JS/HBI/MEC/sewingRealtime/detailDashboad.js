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
        var a = '';
        zoneChanged(response.data1[0]['Zone'], 1);
        for (const x of response.data1) {
            a += '<option class="detail_chart_header_option" value="' + x['Zone'] + '">Zone ' + x['Zone'] + '</option>\n';
        }
        document.getElementById('zone').innerHTML = a;
    })
    load();
});


function detailSubmit() {
    load();
}

function load() {
    check_time();
    var zone = document.getElementById("zone").value;
    var line = document.getElementById("line").value;
    var shift = document.getElementById("shift").value;
    var from_date = document.getElementById("timeCheckIn").value;
    var to_date = document.getElementById("timeCheckOut").value;
    if (line == '') {
        line = 1;
    }

    $.ajax({
        url: "/innovation/realtime/DetailDataSubmit",
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
        realtime.data.labels = response.data.lableRunTime;
        realtime.data.datasets[0].data = response.data.powerOnTime;
        realtime.data.datasets[1].data = response.data.runTime;
        realtime.data.datasets[2].data = response.data.repairingTime;
        realtime.data.datasets[3].data = response.data.waitingTime;
        realtime.options.scales.xAxes.ticks.color=response.data.lableColors;

        realtimeRatio.data.labels = response.dataRatio.lableRunTimeRatio;
        realtimeRatio.data.datasets[0].data = response.dataRatio.ratioRunTime;
        realtimeRatio.data.datasets[1].data = response.dataRatio.ratioRepairingTime;
        realtimeRatio.data.datasets[2].data = response.dataRatio.ratioWaitingTime;
        realtimeRatio.data.datasets[3].data = response.dataRatio.ratioNoLoad;
        realtimeRatio.options.scales.xAxes.ticks.color=response.data.lableColors;
        realtime.update();
        realtimeRatio.update();
        $('.line_name').html(`Line name: ${zone}${line}`);
        $('.detail_style').html(`Style: ${response.data.lineName[0]['line_name']}`);
    });
}

function zoneChanged(obj, options) {
    if (options == 0) {
        var zone = obj.value;
    } else {
        var zone = obj;
    }
    $.ajax({
        url: '/innovation/realtime/locations',
        type: 'post',
        data: {
            'options': 2,
            'lc': zone
        },
        dataType: 'json',
    }).done(function (response) {
        var a = '';
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
    var date1 = new Date(td[2], td[1], td[0], 0, 0, 0);
    var date2 = new Date(fd[2], fd[1], fd[0], 0, 0, 0);
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

$(function () {
    $("#timeCheckIn").datepicker({
        format: 'dd/mm/yyyy',
        orientation: 'top'
    });
    $("#timeCheckOut").datepicker({
        format: 'dd/mm/yyyy',

    });
    // $( "#timeCheckOut" ).datepicker( "dialog", "10/12/2012" );


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
    document.getElementById('timeCheckOut').value = `${nowTemp.getDate()}/${nowTemp.getMonth()+1}/${nowTemp.getFullYear()}`;
    document.getElementById('timeCheckIn').value = `${nowTemp.getDate()}/${nowTemp.getMonth()+1}/${nowTemp.getFullYear()}`;
});
