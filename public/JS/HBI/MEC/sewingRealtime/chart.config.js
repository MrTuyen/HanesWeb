labels_needle1 = ['fsf', 'dsf']
var color = {
    machineOpTime: {
        background: "rgba(41, 128, 185,1.0)",
        boder: "rgba(68, 64, 255, 1)",
    },
    machineRunTime: {
        background: "rgba(6, 248, 109, 1)",
        boder: "rgba(255, 99, 125, 1)",
    },
    machineDownTime: {
        background: "rgba(255, 0, 0, 1)",
        boder: "rgba(150, 0, 0, 1)",
    },
    machineNoLoadTime: {
        background: "rgba(166, 172, 175 , 1)",
        boder: "rgba(105, 105, 105, 1)",
    },
    fontColor: {
        background: "black"
    }
};
var font = {
    size: {
        minute: 13,
        ratio: 14
    }
};
// chart.options.data_needle1.datasets.barThickness=50;

let timeData = {
    labels: [],
    datasets: [{
            label: "Operation time(minute)",
            data: [],
            backgroundColor: color.machineOpTime.background,
            // borderColor: color.machineOpTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            // barPercentage:0,
            stack: "Stack 0",
        },
        {
            label: "Running time(minute)",
            data: [],
            backgroundColor: color.machineRunTime.background,
            // borderColor: color.machineRunTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            // barPercentage:1,
            stack: "Stack 1",
        },
        {
            label: "Brackdown time(minute)",
            data: [],
            backgroundColor: color.machineDownTime.background,
            // borderColor: color.machineDownTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            // barPercentage:1,
            stack: "Stack 2",
        },
    ],
};

let timeDataRatio = {
    labels: [],
    datasets: [{
            label: "Running time(%)",
            data: [],
            backgroundColor: color.machineRunTime.background,
            // borderColor: color.machineOpTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:0,
            stack: "Stack 0",
        },
        {
            label: "Brackdown time(%)",
            data: [],
            backgroundColor: color.machineDownTime.background,
            // borderColor: color.machineRunTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:1,
            stack: "Stack 0",
        },
        {
            label: "No load(%)",
            data: [],
            backgroundColor: color.machineNoLoadTime.background,
            // borderColor: color.machineDownTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:1,
            stack: "Stack 0",
        },
    ],
};

let timeOEE = {
    labels: [],
    datasets: [{
            label: "Availability",
            data: [],
            backgroundColor: color.machineRunTime.background,
            // borderColor: color.machineOpTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:0,
            stack: "Stack 0",
        },
        {
            label: "Quality",
            data: [],
            backgroundColor: color.machineDownTime.background,
            // borderColor: color.machineRunTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:1,
            stack: "Stack 0",
        },
        {
            label: "Performance",
            data: [],
            backgroundColor: color.machineNoLoadTime.background,
            // borderColor: color.machineDownTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:1,
            stack: "Stack 0",
        },
    ],
};

let configData = {
    type: "bar",
    data: timeData,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 13,
                        weight: "bold",
                    },
                    color: "black",
                }
            },
            datalabels: {
                color: color.fontColor.background,
                display: function (ctx) {
                    return ctx.dataset.data[ctx.dataIndex] > 0;
                },
                font: {
                    // weight: "bold",
                    size: font.size.minute,
                },
                offset: 1,
                padding: 100,
                anchor: "center",
            },
        },
        Anchoring: "end",
        aspectRatio: 16 / 9,
        cutoutPercentage: 8,
        layout: {
            padding: 1,
        },
        elements: {
            line: {
                fill: false,
                tension: 0.1,
            },
            point: {
                hoverRadius: 7,
                radius: 5,
            },
        },
        scales: {
            yAxes: {
                ticks: {
                    // callback: function(value, index, ticks) {
                    //     return  value +'m';
                    // },
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 13
                    }
                }
            },
            xAxes: {
                ticks: {
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 13
                    }
                }
            }
        }
    },
};

////////////////////////////////////////////////////////////////////////////////////
let configDataRatio = {
    type: "bar",
    data: timeDataRatio,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                    color: "black",
                }
            },
            datalabels: {
                color: color.fontColor.background,

                display: function (ctx) {
                    return ctx.dataset.data[ctx.dataIndex] > 5;
                },
                font: {
                    size: font.size.ratio,
                    // weight: 'bold',
                    // boxHeight:'5px'
                },
                offset: 1,
                padding: 100,
                anchor: "center",
            },
        },
        Anchoring: "start",
        aspectRatio: 23 / 12,
        cutoutPercentage: 8,
        layout: {
            padding: 1,
        },
        elements: {
            line: {
                fill: false,
                tension: 0.1,
            },
            point: {
                hoverRadius: 7,
                radius: 5,
            },
        },
        scales: {
            yAxes: {
                ticks: {
                    callback: function (value, index, ticks) {
                        return value + '%';
                    },
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            xAxes: {
                ticks: {
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 13
                    }
                }
            }
        }
    },
};

let configOEE = {
    type: "bar",
    data: timeOEE,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                    color: "black",
                }
            },
            datalabels: {
                color: "white",

                display: function (ctx) {
                    return ctx.dataset.data[ctx.dataIndex] > 0;
                },
                font: {
                    // fontsize:'2px',
                    weight: "bold",
                    // boxHeight:'5px'
                },
                offset: 1,
                padding: 100,
                anchor: "center",
            },
        },
        Anchoring: "start",
        aspectRatio: 24 / 12,
        cutoutPercentage: 8,
        layout: {
            padding: 1,
        },
        elements: {
            line: {
                fill: false,
                tension: 0.1,
            },
            point: {
                hoverRadius: 7,
                radius: 5,
            },
        },
        scales: {
            yAxes: {
                ticks: {
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 13
                    }
                }
            },
            xAxes: {
                ticks: {
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 13
                    }
                }
            }
        }
    },
};
