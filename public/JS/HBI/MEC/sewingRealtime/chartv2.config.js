//setPlugin
var pluginsSet={
    color: '#2c3e50',
    weight:'italic',
    size: 15,
    position:'bottom',
}

var color = {
    machineOpTime: {
        background: "#3498db",
        boder: "#3498db",
    },
    machineRunTime: {
        background: "#2ecc71",
        boder: "#2ecc71",
    },
    machineDownTime: {
        background: "#ff3f34",
        boder: "#ff3f34",
    },
    machineNoLoadTime: {
        background: "#bdc3c7",
        boder: "#bdc3c7",
    },
    fontColor: {
        background: "#2c3e50"
    },
    repairingTime: {
        background: "rgba(235, 152, 78, 1)",
        boder: "rgba(150, 0, 0, 1)",
    },
    machineWaitingTime: {
        background: "rgba(241, 196, 15 , 1)",
        boder: "rgba(105, 105, 105, 1)",
    },
    machineColor: {
        background: "rgba(23, 32, 42,1)"
    },
};

var font = {
    size: {
        minute: 13,
        ratio: 14
    }
};

let timeData = {
    labels: [],
    datasets: [{
            label: "Operation time(h)",
            data: [],
            backgroundColor: color.machineOpTime.background,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            stack: "Stack 0",
        },
        {
            label: "Running time(h)",
            data: [],
            backgroundColor: color.machineRunTime.background,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            stack: "Stack 1",
        },
        {
            label: "Breakdown time(h)",
            data: [],
            backgroundColor: color.machineDownTime.background,
            // borderColor: color.machineDownTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
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
            label: "Breakdown time(%)",
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
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
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

let detailLine1 = {
    labels: [],
    datasets: [{
            label: "Operation time(m)",
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
            label: "Running time(m)",
            data: [],
            backgroundColor: color.machineRunTime.background,
            // borderColor: color.machineRunTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            // barPercentage:1,
            stack: "Stack 0",
        },
        {
            label: "Repairing time(m)",
            data: [],
            backgroundColor: color.repairingTime.background,
            // borderColor: color.repairingTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            // barPercentage:1,
            stack: "Stack 0",
        },
        {
            label: "Waiting time(m)",
            data: [],
            backgroundColor: color.machineWaitingTime.background,
            // borderColor: color.repairingTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 5,
            // barPercentage:1,
            stack: "Stack 0",
        }
    ],
};
let detailLine2 = {
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
            label: "Repairing time(%)",
            data: [],
            backgroundColor: color.repairingTime.background,
            // borderColor: color.machineRunTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:1,
            stack: "Stack 0",
        },
        {
            label: "Waiting time(%)",
            data: [],
            backgroundColor: color.machineWaitingTime.background,
            // borderColor: color.repairingTime.boder,
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
            // borderColor: color.repairingTime.boder,
            borderWidth: 0,
            maxBarThickness: "100",
            borderRadius: 3,
            // barPercentage:1,
            stack: "Stack 0",
        }
    ],
};
let configGeneral = {
    type: "bar",
    data: timeData,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                position: pluginsSet.position,
                labels: {
                    font: {
                        size: pluginsSet.size,
                        weight: pluginsSet.weight,
                    },
                    color: pluginsSet.color,
                }
            },
            datalabels: {
                color: color.fontColor.background,
                display: function (ctx) {
                    return ctx.dataset.data[ctx.dataIndex] > 0;
                },
                font: {
                    size: font.size.minute,
                },
                offset: 1,
                padding: 100,
                anchor: "center",
            },
        },
        Anchoring: "end",
        aspectRatio: 16/ 9,
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

let configRatio = {
    type: "bar",
    data: timeDataRatio,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                position: pluginsSet.position,
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: pluginsSet.size,
                        weight: pluginsSet.weight,
                    },
                    color: pluginsSet.color,
                }
            },
            datalabels: {
                color: color.fontColor.background,

                display: function (ctx) {
                    return ctx.dataset.data[ctx.dataIndex] > 5;
                },
                font: {
                    size: font.size.ratio,
                },
                offset: 1,
                padding: 100,
                anchor: "center",
            },
        },
        Anchoring: "start",
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
                    callback: function (value, index, ticks) {
                        return value + '%';
                    },
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

let configOEE = {
    type: "bar",
    data: timeOEE,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                position: pluginsSet.position,
                labels: {
                    font: {
                        size: pluginsSet.size,
                        weight: pluginsSet.weight,
                    },
                    color: pluginsSet.color,
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
let configDetailLine1 = {
    type: "bar",
    data: detailLine1,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: "index",
        },
        legend: {
            fontColor: "white"
        },
        plugins: {
            legend: {
                position: pluginsSet.position,
                labels: {
                    font: {
                        size: pluginsSet.size,
                        weight: pluginsSet.weight,
                    },
                    color: pluginsSet.color,
                }
            },
            datalabels: {
                color: color.fontColor.background,
                display: function (ctx) {
                    return ctx.dataset.data[ctx.dataIndex] > 5;
                },
                font: {
                    weight: "bold",
                    size: 12,
                },
                offset: 1,
                padding: 1,
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
              title: {
                color: 'red',
                display: true,
                text: 'Minute',
                font:{
                    size:15
                }
              },
              ticks: {
                // callback: function(value, index, ticks) {
                //     return  value +'m';
                // },
                color: 'black',
                font:{
                    weight: 'bold',
                    size:12
                }
              }
            },
            xAxes: {
                title: {
                  color: 'red',
                  display: true,
                  text: 'Operation',
                  font:{
                    size:15
                }
                  
                },
                ticks: {
                  color:'black',
                  font:{
                    weight: 'bold',
                    size:12
                }
                }
              }
          }
    },
};
let configDetailLine2 = {
    type: "bar",
    data: detailLine2,
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            legend: {
                position: pluginsSet.position,
                labels: {
                    font: {
                        size: pluginsSet.size,
                        weight: pluginsSet.weight,
                    },
                    color: pluginsSet.color,
                }
            },
            datalabels: {
                color: color.fontColor.background,

                display: function (ctx) {
                    return ctx.dataset.data[ctx.dataIndex] > 1;
                },
                font: {
                    size: 12,
                    weight: 'bold',
                    boxHeight: '5px'
                },
                offset: 1,
                padding: 1,
                anchor: "center",
            },
        },
        Anchoring: "start",
        aspectRatio: 16/9,
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
              title: {
                color: 'red',
                display: true,
                text: 'Ratio',
                font:{
                    size:15,
                }
              },
              ticks: {
                callback: function(value, index, ticks) {
                    return  value +'%';
                },
                color: 'black',
                font:{
                    weight: 'bold',
                    size:13
                }
              }
            },
            xAxes: {
                title: {
                  color: 'red',
                  display: true,
                  text: 'Operation',
                  font:{
                    size:15,
                }
                },
                ticks: {
                  color:'black',
                  font:{
                    weight: 'bold',
                    size:13
                }
                }
              }
          }
    },
};