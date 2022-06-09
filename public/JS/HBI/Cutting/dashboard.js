var baseUrl = "/cutting/dashboard/";

var shifts = [
    { id: 0, value: "", text: 'All', default: "" },
    { id: 1, value: "a_shift", text: 'Shift 1', default: "" },
    { id: 2, value: "b_shift", text: 'Shift 2', default: "" },
    { id: 3, value: "c_shift", text: 'Shift 3', default: "" },
]
// Common variables
var listMachines = [];
var listMachine92 = [];
var listMachine95 = [];

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
    // Init tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // init shifts
    let html = "";
    for (let i = 0; i < shifts.length; i++) {
        let ele = shifts[i];
        html += `<option value='${ele.value}' ${ele.default}>${ele.text}</option>`
    }
    $(".dropdown-shift").append(html);

    // init clock
    $('.clockpicker').clockpicker({
        placement: 'bottom',
        align: 'left',
        donetext: 'Done',
        default: 'now'
    });

    // init datepicker for all input date type
    $('.isDateTime').datepicker({
        format: "dd/mm/yyyy",
        clear: true
    });

    $('.isDate').datepicker({
        format: "dd/mm/yyyy",
        clear: true
    });
    let date = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    // let date = "01/11/2021";
    $('.isDate').val(date);
    $("#txtDate92").text(date);
    $("#txtDate95").text(date);

    // Initial data
    getMachines();
    getStackBarChart92();
    getStackBarChart95();
    changeViewType(92);
    changeViewType(95);

    //
    setTimeout(() => {
        selectBox1 = new vanillaSelectBox("#txtFilterMachine92", { "disableSelectAll": true, "maxHeight": 200, "placeHolder": "Select machine" });
        selectBox2 = new vanillaSelectBox("#txtFilterMachine95", { "disableSelectAll": true, "maxHeight": 200, "placeHolder": "Select machine" });
    }, 1000);
})

// --------------------- UI -----------------------
function changeWorkCenter(val) {
    if (val == "95") {
        DropDownListMachine(listMachine95, $("#txtReportMachine"))
    }
    if (val == "92") {
        DropDownListMachine(listMachine92, $("#txtReportMachine"))
    }
}

function DropDownListMachine(list, selector) {
    selector.html('');
    // let html = "<option value=''>All Machines</option>";
    let html = "";
    for (let i = 0; i < list.length; i++) {
        let ele = list[i];
        html += "<option value='" + ele.code + "'>" + ele.name + "</option>";
    }
    selector.append(html);
}

function changeViewType(type) {
    $(`#dateValue${type}`).css("display", "none");
    $(`#weekValue${type}`).css("display", "none");
    let viewType = $(`#cbViewType${type}`).is(":checked");
    if (viewType) {
        $(`#dateValue${type}`).css("display", "none");
        $(`#weekValue${type}`).css("display", "block");
        $(`#txtFilterWeek${type}`).focus();
        $(`#txtFilterWeek${type}`).val(new Date().getWeekNumber());
    }
    else {
        $(`#dateValue${type}`).css("display", "block");
        $(`#weekValue${type}`).css("display", "none");
    }
}

let clicked = true;
function zoomInZoomOut(area) {
    let cutArea = document.getElementById(area);
    if (clicked) {
        cutArea.classList.add("full-screen");
        cutArea.classList.remove("col-md-6");
    } else {
        cutArea.classList.remove("full-screen");
        cutArea.classList.add("col-md-6");
    }
    clicked = !clicked;
}

// ----------------- CUTTING 92 -------------------
function getStackBarChart92() {
    let filterDate = $("#txtFilterDate92").val();
    let filterMachine = $("#txtFilterMachine92").val();
    let filterShift = $("#txtFilterShift92").val();

    let filterWeek = $("#txtFilterWeek92").val();
    let filterWeekEndValue = $("#txtFilterWeekEndValue92").val();

    let viewType = $("#cbViewType92").is(":checked"); // Select date or week
    if (viewType) {
        let objDate = getDateOfWeek(filterWeek);
        objDate.dateFrom = new Date(objDate.dateFrom);
        filterDate = `${objDate.dateFrom.formatDateDDMMYYYY()};${objDate.dateFrom.addDays(1).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(2).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(3).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(4).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(5).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(6).formatDateDDMMYYYY()}`;
    }

    let action = baseUrl + 'get-machine-data';
    let datasend = {
        filterDate: filterDate,
        filterMachine: filterMachine.length <= 0 ? "" : filterMachine,
        workCenter: 92,
        filterShift: filterShift,
        filterWeek: filterWeek,
        filterWeekEndValue: filterWeekEndValue,
        viewType: viewType
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            if (viewType) {
                let sumTotalCutTime = 0;
                let sumTotalTotalTime = 0;
                let listDate = response.data.stackBarChartData.listDate;
                let listMachine = response.data.stackBarChartData.listMachine;
                let labels = response.data.stackBarChartData.data1;
                let isMultiWeek = isNaN(parseInt(filterWeekEndValue));
                if (!isMultiWeek) {
                    let percentBarStackData = {
                        cutTimePercent: [],
                        dryHaulTimePercent: [],
                        idleTimePercent: [],
                        interruptTimePercent: []
                    };

                    for (let i = 0; i < response.data.stackBarChartData.data2.listMachines.length; i++) {
                        let listMachinesData = response.data.stackBarChartData.data2.listMachines[i];

                        let sumCutTime = listMachinesData.map(a => a.cutTime * 1).reduce((a, b) => a + b, 0);
                        let sumDryHaulTime = listMachinesData.map(a => a.dryHaulTime * 1).reduce((a, b) => a + b, 0);
                        let sumIdleTime = listMachinesData.map(a => a.idleTime * 1).reduce((a, b) => a + b, 0);
                        let sumInterruptTime = listMachinesData.map(a => a.interruptTime * 1).reduce((a, b) => a + b, 0);
                        let sumTotalTime = listMachinesData.map(a => a.totalTime * 1).reduce((a, b) => a + b, 0);

                        sumTotalCutTime += sumCutTime;
                        sumTotalTotalTime += sumTotalTime;

                        percentBarStackData.cutTimePercent = percentBarStackData.cutTimePercent.concat((sumCutTime / sumTotalTime) * 100);
                        percentBarStackData.dryHaulTimePercent = percentBarStackData.dryHaulTimePercent.concat((sumDryHaulTime / sumTotalTime) * 100);
                        percentBarStackData.idleTimePercent = percentBarStackData.idleTimePercent.concat((sumIdleTime / sumTotalTime) * 100);
                        percentBarStackData.interruptTimePercent = percentBarStackData.interruptTimePercent.concat((sumInterruptTime / sumTotalTime) * 100);
                    }

                    drawStackBarChartAllWeek92(labels, percentBarStackData);
                }
                else {
                    let percentBarStackData = {
                        cutTimePercent: [],
                        dryHaulTimePercent: [],
                        idleTimePercent: [],
                        interruptTimePercent: []
                    };

                    let minuteBarStackData = {
                        cutTime: [],
                        dryHaulTime: [],
                        idleTime: [],
                        interruptTime: []
                    };

                    let listMachinesData = [];
                    for (let i = 0; i < response.data.stackBarChartData.data2.length; i++) {
                        let machine = response.data.stackBarChartData.data2[i].data2.listMachines;
                        listMachinesData = listMachinesData.concat(machine);
                    }

                    listMachinesData = listMachinesData.sort((x, y) => x.machineName - y.machineName);

                    sumTotalCutTime += listMachinesData.map(a => a.cutTime * 1).reduce((a, b) => a + b, 0);
                    sumTotalTotalTime += listMachinesData.map(a => a.totalTime * 1).reduce((a, b) => a + b, 0);

                    percentBarStackData.cutTimePercent = percentBarStackData.cutTimePercent.concat(listMachinesData.map(a => a.cutTimePercent * 1));
                    percentBarStackData.dryHaulTimePercent = percentBarStackData.dryHaulTimePercent.concat(listMachinesData.map(a => a.dryHaulTimePercent * 1));
                    percentBarStackData.idleTimePercent = percentBarStackData.idleTimePercent.concat(listMachinesData.map(a => a.idleTimePercent * 1));
                    percentBarStackData.interruptTimePercent = percentBarStackData.interruptTimePercent.concat(listMachinesData.map(a => a.interruptTimePercent * 1));

                    minuteBarStackData.cutTime = minuteBarStackData.cutTime.concat(listMachinesData.map(a => a.cutTime * 1));
                    minuteBarStackData.dryHaulTime = minuteBarStackData.dryHaulTime.concat(listMachinesData.map(a => a.dryHaulTime * 1));
                    minuteBarStackData.idleTime = minuteBarStackData.idleTime.concat(listMachinesData.map(a => a.idleTime * 1));
                    minuteBarStackData.interruptTime = minuteBarStackData.interruptTime.concat(listMachinesData.map(a => a.interruptTime * 1));

                    drawStackBarChartWeek92(labels, percentBarStackData);
                    drawMinuteStackBarChartWeek92(labels, minuteBarStackData);

                    // speed area
                    let cutSpeedList = listMachinesData.map(x => x.cutSpeed);
                    let cutFileList = listMachinesData.map(x => x.cutFilenameList.length);
                    let cutSpeed = [];
                    cutSpeedList.forEach((x, i) => {
                        if(x > 0){
                            cutSpeed.push(x / cutFileList[i]);
                        }
                        else    
                            cutSpeed.push(0);
                    })

                    let datasets = [];
                    let machineColor = ["#4caf50", "#ffeb3b", "#ff9800", "#f44336", "#007bff"];
                    listMachine.forEach((ele, i) => {

                        let obj = {
                            label: ele.name,
                            data: [cutSpeed[i * 7], cutSpeed[i*7 + 1], cutSpeed[i*7 + 2], cutSpeed[i*7 + 3], cutSpeed[i*7 + 4], cutSpeed[i*7 + 5], cutSpeed[i*7 + 6]],
                            borderColor: machineColor[i],
                            backgroundColor: machineColor[i],
                            hoverBorderWidth: 5,
                            hoverBorderColor: machineColor[i],
                        };
                        datasets.push(obj);
                    });
                    drawSpeedChartWeek92(listDate, datasets);

                    // Idle, Interupted time average table
                    let machineList = [];
                    listMachine.forEach(ele => {
                        let temp = listMachinesData.filter(x => x.machineName == ele.code);
                        let obj = {
                            idleTime: temp.reduce((a, b) => a + b.idleTime, 0),
                            interruptTime: temp.reduce((a, b) => a + b.interruptTime, 0),
                            cutFilenameList: [].concat.apply([], temp.map(x => x.cutFilenameList)) // or temp.map(x => x.cutFilenameList).flat()
                        }

                        machineList.push(obj);
                    });
                    avgIdleInterupt(machineList, listMachine.map(x => x.name), '92');
                }
                $("#txtAvg92").text(((sumTotalCutTime / sumTotalTotalTime) * 100).toFixed(2));
                $("#txtDate92").text(filterWeek + (isMultiWeek ? "" : "-" + filterWeekEndValue));
            }
            else {
                let labels = response.data.stackBarChartData.data1.map(a => a.name);
                let machine = response.data.stackBarChartData.data2.listMachines;
                let percentAvg = (machine.map(a => a.cutTime * 1).reduce((a, b) => a + b, 0) / machine.map(a => a.totalTime * 1).reduce((a, b) => a + b, 0)) * 100;
                let percentBarStackData = [
                    machine.map(a => a.cutTimePercent * 1),
                    machine.map(a => a.dryHaulTimePercent * 1),
                    machine.map(a => a.idleTimePercent * 1),
                    machine.map(a => a.interruptTimePercent * 1)
                ]

                let minuteBarStackData = [
                    machine.map(a => a.cutTime * 1),
                    machine.map(a => a.dryHaulTime * 1),
                    machine.map(a => a.idleTime * 1),
                    machine.map(a => a.interruptTime * 1),
                ]

                drawStackBarChartDate92(labels, percentBarStackData);
                $("#txtAvg92").text(percentAvg.toFixed(2));
                $("#txtDate92").text(filterDate);

                drawMinuteStackBarChartDate92(labels, minuteBarStackData);

                // speed chart
                let cutSpeedList = machine.map(x => x.cutSpeed);
                let cutFileList = machine.map(x => x.cutFilenameList.length);
                let cutSpeed = [];
                cutSpeedList.forEach((x, i) => {
                    if(x > 0){
                        cutSpeed.push(x / cutFileList[i]);
                    }
                    else    
                        cutSpeed.push(0);
                })
                //drawSpeedChartDate92(labels, cutSpeed);

                let datasets = [];
                let machineColor = ["#4caf50", "#ffeb3b", "#ff9800", "#f44336", "#007bff"];
                labels.forEach((ele, i) => {
                    let obj = {
                        label: ele,
                        data: [cutSpeed[i]],
                        borderColor: machineColor[i],
                        backgroundColor: machineColor[i],
                        hoverBorderWidth: 5,
                        hoverBorderColor: machineColor[i],
                    };

                    datasets.push(obj);
                });
                drawSpeedChartWeek92([filterDate], datasets);

                // Idle, Interupted time average table
                avgIdleInterupt(machine, labels, '92');

                // abnormal record 
                abnormalRecords(response.data.stackBarChartData.data3, response.data.stackBarChartData.data4);
                $("#txtAbnormalDate").text(filterDate);
            }
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function drawStackBarChartDate92(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(%)",
                    data: data[0],
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(%)",
                    data: data[1],
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(%)",
                    data: data[2],
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(%)",
                    data: data[3],
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value) + '%';
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14,
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                },
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value) + "%";
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
        }
    };

    if (window.stackBar92) {
        window.stackBar92.destroy();
    }
    let ctx = document.getElementById("myPercentBarStackChart92");
    window.stackBar92 = new Chart(ctx, config);
}

function drawStackBarChartWeek92(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(%)",
                    data: data.cutTimePercent,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                    xAxisID: 'xAxis1',
                },
                {
                    label: "Dry haul time(%)",
                    data: data.dryHaulTimePercent,
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                    xAxisID: 'xAxis1',
                },
                {
                    label: "Idle time(%)",
                    data: data.idleTimePercent,
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                    xAxisID: 'xAxis1',
                },
                {
                    label: "Interupted time(%)",
                    data: data.interruptTimePercent,
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                    xAxisID: 'xAxis1',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true,
                labels: {
                    fontColor: '#333',
                    fontSize: 8
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [
                    {
                        id: 'xAxis1',
                        type: "category",
                        ticks: {
                            callback: function (label) {
                                var date = label.split(";")[0];
                                var machine = label.split(";")[1];
                                return date.substring(0, 5);
                            },
                            fontColor: 'red',
                            fontSize: 10,
                            lineHeight: 0.8
                        },
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                        barPercentage: 0.6, // width of bar
                        stacked: true,
                    },
                    {
                        id: 'xAxis2',
                        type: "category",
                        offset: true,
                        ticks: {
                            callback: function (label) {
                                var machine = label.split(";")[1];
                                var index = label.split(";")[2];
                                if (index == 3)
                                    return machine;
                                else if (index == 6)
                                    return "|";
                                else
                                    return "";
                            },
                            fontColor: 'red',
                            fontSize: 8,
                            lineHeight: 0.1
                        },
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                    }
                ],
                yAxes: [{
                    gridLines: {
                        display: true,
                        drawBorder: true,
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    stacked: true,
                }]
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
            tooltips: {
                enabled: false
            }
        }
    };

    if (window.stackBar92) {
        window.stackBar92.destroy();
    }
    let ctx = document.getElementById("myPercentBarStackChart92");
    window.stackBar92 = new Chart(ctx, config);
}

function drawMinuteStackBarChartDate92(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(minutes)",
                    data: data[0],
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(minutes)",
                    data: data[1],
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(minutes)",
                    data: data[2],
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(minutes)",
                    data: data[3],
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value);
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14,
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                }
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
            tooltips: {
                enabled: false
            }
        }
    };

    if (window.minute92) {
        window.minute92.destroy();
    }
    let ctx = document.getElementById("myMinuteBarStackChart92");
    window.minute92 = new Chart(ctx, config);
}

function drawMinuteStackBarChartWeek92(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(minutes)",
                    data: data.cutTime,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(minutes)",
                    data: data.dryHaulTime,
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(minutes)",
                    data: data.idleTime,
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(minutes)",
                    data: data.interruptTime,
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true,
                labels: {
                    fontColor: '#333',
                    fontSize: 8
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [
                    {
                        id: 'xAxis1',
                        type: "category",
                        ticks: {
                            align: 'center',
                            callback: function (label) {
                                var date = label.split(";")[0];
                                var machine = label.split(";")[1];
                                return date.substring(0, 5);
                            },
                            fontColor: 'red',
                            fontSize: 10,
                            lineHeight: 0.8
                        },
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                        barPercentage: 0.6, // width of bar
                        stacked: true,
                    },
                    {
                        id: 'xAxis2',
                        type: "category",
                        ticks: {
                            align: 'center',
                            callback: function (label) {
                                var date = label.split(";")[0];
                                var machine = label.split(";")[1];
                                var index = label.split(";")[2];
                                if (index == 3)
                                    return machine;
                                else if (index == 6)
                                    return "|";
                                else
                                    return "";
                            },
                            fontColor: 'red',
                            fontSize: 8,
                            lineHeight: 0.1
                        },
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                    }
                ],
                yAxes: [{
                    gridLines: {
                        display: true,
                        drawBorder: true,
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    stacked: true,
                }]
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
            tooltips: {
                enabled: false
            }
        }
    };

    if (window.minute92) {
        window.minute92.destroy();
    }
    let ctx = document.getElementById("myMinuteBarStackChart92");
    window.minute92 = new Chart(ctx, config);
}

function drawStackBarChartAllWeek92(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(%)",
                    data: data.cutTimePercent,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(%)",
                    data: data.dryHaulTimePercent,
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(%)",
                    data: data.idleTimePercent,
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(%)",
                    data: data.interruptTimePercent,
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function (value, index, values) {
                            return "WK" + value;
                        }
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value) + '%';
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14,
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                },
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value) + "%";
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
        }
    };

    if (window.stackBar92) {
        window.stackBar92.destroy();
    }
    let ctx = document.getElementById("myPercentBarStackChart92");
    window.stackBar92 = new Chart(ctx, config);
}

function drawSpeedChartDate92(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Cutting Speed",
                    data: data,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                }
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value);
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14,
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                },
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
        }
    };

    if (window.speed92) {
        window.speed92.destroy();
    }
    let ctx = document.getElementById("myChartSpeed92");
    window.speed92 = new Chart(ctx, config);
}

function drawSpeedChartWeek92(labels, datasets) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value);
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14, 
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                },
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
        }
    };

    if (window.speed92) {
        window.speed92.destroy();
    }
    let ctx = document.getElementById("myChartSpeed92");
    window.speed92 = new Chart(ctx, config);
}

// ----------------- CUTTING 95 -------------------
function getStackBarChart95() {
    let filterDate = $("#txtFilterDate95").val();
    let filterMachine = $("#txtFilterMachine95").val();
    let filterShift = $("#txtFilterShift95").val();

    let filterWeek = $("#txtFilterWeek95").val();
    let filterWeekEndValue = $("#txtFilterWeekEndValue95").val();

    let viewType = $("#cbViewType95").is(":checked"); // Select date or week
    if (viewType) {
        let objDate = getDateOfWeek(filterWeek);
        objDate.dateFrom = new Date(objDate.dateFrom);
        filterDate = `${objDate.dateFrom.formatDateDDMMYYYY()};${objDate.dateFrom.addDays(1).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(2).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(3).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(4).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(5).formatDateDDMMYYYY()};${objDate.dateFrom.addDays(6).formatDateDDMMYYYY()}`;
    }

    let action = baseUrl + 'get-machine-data';
    let datasend = {
        filterDate: filterDate,
        filterMachine: filterMachine.length <= 0 ? "" : filterMachine,
        workCenter: 95,
        filterShift: filterShift,
        filterWeek: filterWeek,
        filterWeekEndValue: filterWeekEndValue,
        viewType: viewType
    };
    LoadingShow();
    PostDataAjax(action, datasend, function (response) {
        LoadingHide();
        if (response.rs) {
            if (viewType) {
                let sumTotalCutTime = 0;
                let sumTotalTotalTime = 0;
                let listDate = response.data.stackBarChartData.listDate;
                let listMachine = response.data.stackBarChartData.listMachine;
                let labels = response.data.stackBarChartData.data1;
                let isMultiWeek = isNaN(parseInt(filterWeekEndValue));
                if (!isMultiWeek) {
                    let percentBarStackData = {
                        cutTimePercent: [],
                        dryHaulTimePercent: [],
                        idleTimePercent: [],
                        interruptTimePercent: []
                    };

                    for (let i = 0; i < response.data.stackBarChartData.data2.listMachines.length; i++) {
                        let listMachinesData = response.data.stackBarChartData.data2.listMachines[i];

                        let sumCutTime = listMachinesData.map(a => a.cutTime * 1).reduce((a, b) => a + b, 0);
                        let sumDryHaulTime = listMachinesData.map(a => a.dryHaulTime * 1).reduce((a, b) => a + b, 0);
                        let sumIdleTime = listMachinesData.map(a => a.idleTime * 1).reduce((a, b) => a + b, 0);
                        let sumInterruptTime = listMachinesData.map(a => a.interruptTime * 1).reduce((a, b) => a + b, 0);
                        let sumTotalTime = listMachinesData.map(a => a.totalTime * 1).reduce((a, b) => a + b, 0);

                        sumTotalCutTime += sumCutTime;
                        sumTotalTotalTime += sumTotalTime;

                        percentBarStackData.cutTimePercent = percentBarStackData.cutTimePercent.concat((sumCutTime / sumTotalTime) * 100);
                        percentBarStackData.dryHaulTimePercent = percentBarStackData.dryHaulTimePercent.concat((sumDryHaulTime / sumTotalTime) * 100);
                        percentBarStackData.idleTimePercent = percentBarStackData.idleTimePercent.concat((sumIdleTime / sumTotalTime) * 100);
                        percentBarStackData.interruptTimePercent = percentBarStackData.interruptTimePercent.concat((sumInterruptTime / sumTotalTime) * 100);
                    }

                    drawStackBarChartAllWeek95(labels, percentBarStackData);
                }
                else {
                    let percentBarStackData = {
                        cutTimePercent: [],
                        dryHaulTimePercent: [],
                        idleTimePercent: [],
                        interruptTimePercent: []
                    };

                    let minuteBarStackData = {
                        cutTime: [],
                        dryHaulTime: [],
                        idleTime: [],
                        interruptTime: []
                    };

                    let listMachinesData = [];
                    for (let i = 0; i < response.data.stackBarChartData.data2.length; i++) {
                        let machine = response.data.stackBarChartData.data2[i].data2.listMachines;
                        listMachinesData = listMachinesData.concat(machine);
                    }

                    listMachinesData = listMachinesData.sort((x, y) => x.machineName - y.machineName);

                    sumTotalCutTime += listMachinesData.map(a => a.cutTime * 1).reduce((a, b) => a + b, 0);
                    sumTotalTotalTime += listMachinesData.map(a => a.totalTime * 1).reduce((a, b) => a + b, 0);

                    percentBarStackData.cutTimePercent = percentBarStackData.cutTimePercent.concat(listMachinesData.map(a => a.cutTimePercent * 1));
                    percentBarStackData.dryHaulTimePercent = percentBarStackData.dryHaulTimePercent.concat(listMachinesData.map(a => a.dryHaulTimePercent * 1));
                    percentBarStackData.idleTimePercent = percentBarStackData.idleTimePercent.concat(listMachinesData.map(a => a.idleTimePercent * 1));
                    percentBarStackData.interruptTimePercent = percentBarStackData.interruptTimePercent.concat(listMachinesData.map(a => a.interruptTimePercent * 1));

                    minuteBarStackData.cutTime = minuteBarStackData.cutTime.concat(listMachinesData.map(a => a.cutTime * 1));
                    minuteBarStackData.dryHaulTime = minuteBarStackData.dryHaulTime.concat(listMachinesData.map(a => a.dryHaulTime * 1));
                    minuteBarStackData.idleTime = minuteBarStackData.idleTime.concat(listMachinesData.map(a => a.idleTime * 1));
                    minuteBarStackData.interruptTime = minuteBarStackData.interruptTime.concat(listMachinesData.map(a => a.interruptTime * 1));

                    drawStackBarChartWeek95(labels, percentBarStackData);
                    drawMinuteStackBarChartWeek95(labels, minuteBarStackData);

                    // speed area
                    let cutSpeedList = listMachinesData.map(x => x.cutSpeed);
                    let cutFileList = listMachinesData.map(x => x.cutFilenameList.length);
                    let cutSpeed = [];
                    cutSpeedList.forEach((x, i) => {
                        if(x > 0){
                            cutSpeed.push(x / cutFileList[i]);
                        }
                        else    
                            cutSpeed.push(0);
                    })

                    let datasets = [];
                    let machineColor = ["#4caf50", "#ffeb3b", "#ff9800", "#f44336", "#007bff"];
                    listMachine.forEach((ele, i) => {

                        let obj = {
                            label: ele.name,
                            data: [cutSpeed[i * 7], cutSpeed[i*7 + 1], cutSpeed[i*7 + 2], cutSpeed[i*7 + 3], cutSpeed[i*7 + 4], cutSpeed[i*7 + 5], cutSpeed[i*7 + 6]],
                            borderColor: machineColor[i],
                            backgroundColor: machineColor[i],
                            hoverBorderWidth: 5,
                            hoverBorderColor: machineColor[i],
                        };
                        datasets.push(obj);
                    });
                    drawSpeedChartWeek95(listDate, datasets);

                    // Idle, Interupted time average table
                    let machineList = [];
                    listMachine.forEach(ele => {
                        let temp = listMachinesData.filter(x => x.machineName == ele.code);
                        let obj = {
                            idleTime: temp.reduce((a, b) => a + b.idleTime, 0),
                            interruptTime: temp.reduce((a, b) => a + b.interruptTime, 0),
                            cutFilenameList: [].concat.apply([], temp.map(x => x.cutFilenameList)) // or temp.map(x => x.cutFilenameList).flat()
                        }

                        machineList.push(obj);
                    });
                    avgIdleInterupt(machineList, listMachine.map(x => x.name), '95');
                }
                $("#txtAvg95").text(((sumTotalCutTime / sumTotalTotalTime) * 100).toFixed(2));
                $("#txtDate95").text(filterWeek + (isMultiWeek ? "" : "-" + filterWeekEndValue));
            }
            else {
                let labels = response.data.stackBarChartData.data1.map(a => a.name);
                let machine = response.data.stackBarChartData.data2.listMachines;
                let percentAvg = (machine.map(a => a.cutTime * 1).reduce((a, b) => a + b, 0) / machine.map(a => a.totalTime * 1).reduce((a, b) => a + b, 0)) * 100;
                let percentBarStackData = [
                    machine.map(a => a.cutTimePercent * 1),
                    machine.map(a => a.dryHaulTimePercent * 1),
                    machine.map(a => a.idleTimePercent * 1),
                    machine.map(a => a.interruptTimePercent * 1)
                ]

                let minuteBarStackData = [
                    machine.map(a => a.cutTime * 1),
                    machine.map(a => a.dryHaulTime * 1),
                    machine.map(a => a.idleTime * 1),
                    machine.map(a => a.interruptTime * 1),
                ]

                drawStackBarChartDate95(labels, percentBarStackData);
                $("#txtAvg95").text(percentAvg.toFixed(2));
                $("#txtDate95").text(filterDate);

                drawMinuteStackBarChartDate95(labels, minuteBarStackData);

                // speed chart
                let cutSpeedList = machine.map(x => x.cutSpeed);
                let cutFileList = machine.map(x => x.cutFilenameList.length);
                let cutSpeed = [];
                cutSpeedList.forEach((x, i) => {
                    if(x > 0){
                        cutSpeed.push(x / cutFileList[i]);
                    }
                    else    
                        cutSpeed.push(0);
                })
                //drawSpeedChartDate95(labels, cutSpeed);

                let datasets = [];
                let machineColor = ["#4caf50", "#ffeb3b", "#ff9800", "#f44336", "#007bff"];
                labels.forEach((ele, i) => {
                    let obj = {
                        label: ele,
                        data: [cutSpeed[i]],
                        borderColor: machineColor[i],
                        backgroundColor: machineColor[i],
                        hoverBorderWidth: 5,
                        hoverBorderColor: machineColor[i],
                    };

                    datasets.push(obj);
                });
                drawSpeedChartWeek95([filterDate], datasets);

                // Idle, Interupted time average table
                avgIdleInterupt(machine, labels, '95');

                // abnormal record 
                abnormalRecords(response.data.stackBarChartData.data3, response.data.stackBarChartData.data4);
                $("#txtAbnormalDate").text(filterDate);
            }
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

function drawStackBarChartDate95(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(%)",
                    data: data[0],
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(%)",
                    data: data[1],
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(%)",
                    data: data[2],
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(%)",
                    data: data[3],
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },

            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value) + '%';
                        }
                    },
                }],
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        return value == null || value == 0 ? "" : number_format(value) + "%";
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
            tooltips: {
                enabled: false
            }
        }
    };

    if (window.barStack95) {
        window.barStack95.destroy();
    }
    let ctx = document.getElementById("myPercentBarStackChart95");
    window.barStack95 = new Chart(ctx, config);
}

function drawStackBarChartWeek95(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(%)",
                    data: data.cutTimePercent,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(%)",
                    data: data.dryHaulTimePercent,
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(%)",
                    data: data.idleTimePercent,
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(%)",
                    data: data.interruptTimePercent,
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true,
                labels: {
                    fontColor: '#333',
                    fontSize: 8
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [
                    {
                        id: 'xAxis1',
                        type: "category",
                        ticks: {
                            callback: function (label) {
                                var date = label.split(";")[0];
                                var machine = label.split(";")[1];
                                return date.substring(0, 5);
                            },
                            fontColor: 'red',
                            fontSize: 10,
                            lineHeight: 0.8
                        },
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                        barPercentage: 0.6, // width of bar
                        stacked: true,
                    },
                    {
                        id: 'xAxis2',
                        type: "category",
                        offset: true,
                        ticks: {
                            callback: function (label) {
                                var machine = label.split(";")[1];
                                var index = label.split(";")[2];
                                if (index == 3)
                                    return machine;
                                else if (index == 6)
                                    return "|";
                                else
                                    return "";
                            },
                            fontColor: 'red',
                            fontSize: 8,
                            lineHeight: 0.1
                        },
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                    }
                ],
                yAxes: [{
                    gridLines: {
                        display: true,
                        drawBorder: true,
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    stacked: true,
                }]
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
            tooltips: {
                enabled: false
            }
        }
    };

    if (window.barStack95) {
        window.barStack95.destroy();
    }
    let ctx = document.getElementById("myPercentBarStackChart95");
    window.barStack95 = new Chart(ctx, config);
}

function drawMinuteStackBarChartDate95(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(minutes)",
                    data: data[0],
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(minutes)",
                    data: data[1],
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(minutes)",
                    data: data[2],
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(minutes)",
                    data: data[3],
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value);
                        }
                    },
                }],
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
            tooltips: {
                enabled: false
            }
        }
    };

    if (window.minute95) {
        window.minute95.destroy();
    }
    let ctx = document.getElementById("myMinuteBarStackChart95");
    window.minute95 = new Chart(ctx, config);
}

function drawMinuteStackBarChartWeek95(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(minutes)",
                    data: data.cutTime,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(minutes)",
                    data: data.dryHaulTime,
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(minutes)",
                    data: data.idleTime,
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(minutes)",
                    data: data.interruptTime,
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true,
                labels: {
                    fontColor: '#333',
                    fontSize: 8
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [
                    {
                        id: 'xAxis1',
                        type: "category",
                        ticks: {
                            callback: function (label) {
                                var date = label.split(";")[0];
                                var machine = label.split(";")[1];
                                return date.substring(0, 5);
                            },
                            fontColor: 'red',
                            fontSize: 10,
                            lineHeight: 0.8
                        },
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                        barPercentage: 0.6, // width of bar
                        stacked: true,
                    },
                    {
                        id: 'xAxis2',
                        type: "category",
                        offset: true,
                        ticks: {
                            callback: function (label) {
                                var machine = label.split(";")[1];
                                var index = label.split(";")[2];
                                if (index == 3)
                                    return machine;
                                else if (index == 6)
                                    return "|";
                                else
                                    return "";
                            },
                            fontColor: 'red',
                            fontSize: 8,
                            lineHeight: 0.1
                        },
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            offsetGridLines: false,
                            drawOnChartArea: false
                        },
                    }
                ],
                yAxes: [{
                    gridLines: {
                        display: true,
                        drawBorder: true,
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    stacked: true,
                }]
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
            tooltips: {
                enabled: false
            }
        }
    };

    if (window.minute95) {
        window.minute95.destroy();
    }
    let ctx = document.getElementById("myMinuteBarStackChart95");
    window.minute95 = new Chart(ctx, config);
}

function drawStackBarChartAllWeek95(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Net cutting time(%)",
                    data: data.cutTimePercent,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                },
                {
                    label: "Dry haul time(%)",
                    data: data.dryHaulTimePercent,
                    borderColor: "#ffeb3b",
                    backgroundColor: "#ffeb3b",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ffeb3b',
                },
                {
                    label: "Idle time(%)",
                    data: data.idleTimePercent,
                    borderColor: "#ff9800",
                    backgroundColor: "#ff9800",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#ff9800',
                },
                {
                    label: "Interupted time(%)",
                    data: data.interruptTimePercent,
                    borderColor: "#f44336",
                    backgroundColor: "#f44336",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#f44336',
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function (value, index, values) {
                            return "WK" + value;
                        }
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value) + '%';
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14,
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                },
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value) + "%";
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
        }
    };

    if (window.barStack95) {
        window.barStack95.destroy();
    }
    let ctx = document.getElementById("myPercentBarStackChart95");
    window.barStack95 = new Chart(ctx, config);
}

function drawSpeedChartDate95(labels, data) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Cutting Speed",
                    data: data,
                    borderColor: "#4caf50",
                    backgroundColor: "#4caf50",
                    hoverBorderWidth: 5,
                    hoverBorderColor: '#4caf50',
                }
            ],
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value);
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14,
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                },
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
        }
    };

    if (window.speed95) {
        window.speed95.destroy();
    }
    let ctx = document.getElementById("myChartSpeed95");
    window.speed95 = new Chart(ctx, config);
}

function drawSpeedChartWeek95(labels, datasets) {
    var config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: "right",
                reverse: true
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4, // width of bar
                    stacked: true,
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        maxTicksLimit: 10,
                        suggestedMin: 0, //min
                        suggestedMax: 120, //max 
                        padding: 20,
                        callback: function (value, index, values) {
                            return number_format(value);
                        }
                    },
                }],
            },
            tooltips: {
                backgroundColor: "#282c34",
                titleMarginBottom: 10,
                titleFontSize: 14, 
                xPadding: 15,
                yPadding: 15,
                intersect: true,
                mode: 'label',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
                    }
                },
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: function (value, ctx) {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return value == null || value == 0 ? "" : number_format(value);
                    },
                    font: {
                        weight: "bold"
                    },
                    color: "black"
                }
            },
        }
    };

    if (window.speed95) {
        window.speed95.destroy();
    }
    let ctx = document.getElementById("myChartSpeed95");
    window.speed95 = new Chart(ctx, config);
}

// ----------------- Common function --------------
function avgIdleInterupt(machineList, labels, wc){
    let html = '';
    machineList.forEach((ele, i) => {
        let idleTimeAverage = ele.cutFilenameList.length > 0 ? ele.idleTime / ele.cutFilenameList.length : 0;
        let interuptTimeAverage = ele.cutFilenameList.length > 0 ? ele.interruptTime / ele.cutFilenameList.length : 0;

        html += `<tr>
                <td>${labels[i]}</td>
                <td>${idleTimeAverage.toFixed(1)}</td>
                <td>${interuptTimeAverage.toFixed(1)}</td>
                <td>${ele.cutFilenameList.length > 0 ? ele.cutFilenameList.length : 0}</td>
            </tr>`;
    })
    $(`#idleTable${wc}`).html('').append(html);
}

function downloadMachineDataReport() {
    LoadingShow();

    let fromDate = $("#txtReportFromDate").val() + " " + $("#txtReportFromTime").val();
    let toDate = $("#txtReportToDate").val() + " " + $("#txtReportToTime").val();
    let machine = $("#txtReportMachine").val();
    let workCenter = $("#txtReportWC").val();

    let action = baseUrl + 'download-machine-data';
    let datasend = {
        fromDate: fromDate,
        toDate: toDate,
        machine: machine,
        workCenter: workCenter
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
        return download(blob, GetTodayDate() + "_Cutting_Machine_Data.xlsx");
    });
}

function abnormalRecords(abnormalRecords, machineList) {
    let duplicateRecord = getDuplicatePropertyArray(abnormalRecords, "end_time");
    for (let i = 0; i < abnormalRecords.length; i++) {
        let ele = abnormalRecords[i];
        if (ele.total_automatic_time > 200) {
            duplicateRecord.push(ele);
        }
    }

    duplicateRecord = unique(duplicateRecord, ["job_name", "end_time"]);

    let html = "";
    for (let i = 0; i < duplicateRecord.length; i++) {
        let ele = duplicateRecord[i];
        let machine = machineList.filter(x => x.code == ele.machine_code)[0];
        html += "<tr>"
            + "<td>" + machine.name + "</td>"
            + "<td>" + ele.job_name + "</td>"
            + "<td>" + new Date(ele.start_time).toLocaleString() + "</td>"
            + "<td>" + new Date(ele.end_time).toLocaleString() + "</td>"
            + "<td>" + ele.total_automatic_time + "</td>"
            + "<td>" + ele.total_manual_time + "</td>"
            + "</tr>";
    }

    $("#abnormal-table-body").html('');
    $("#abnormal-table-body").html(html);
}

function getMachines() {
    let action = '/cutting/get-machines';
    let datasend = {

    };
    PostDataAjax(action, datasend, function (response) {
        if (response.rs) {
            listMachines = response.data;
            listMachine92 = response.data.filter(function (ele) {
                return ele.group == "92";
            })
            listMachine95 = response.data.filter(function (ele) {
                return ele.group == "95";
            })
            DropDownListMachine(listMachine92, $("#txtReportMachine"))
            DropDownListMachine(listMachine92, $("#txtFilterMachine92"))
            DropDownListMachine(listMachine95, $("#txtFilterMachine95"))
        }
        else {
            toastr.error(response.msg, "Thất bại");
        }
    });
}

