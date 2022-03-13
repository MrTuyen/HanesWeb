var color = {
    machineOpTime: {
        background: "rgba(41, 128, 185,1.0)",
        boder: "rgba(68, 64, 255, 1)",
    },
    machineRunTime: {
        background: "rgba(6, 248, 109, 1)",
        boder: "rgba(255, 99, 125, 1)",
    },
    repairingTime: {
        background: "rgba(235, 152, 78, 1)",
        boder: "rgba(150, 0, 0, 1)",
    },
    machineNoLoadTime: {
        background: "rgba(151, 154, 154 , 1)",
        boder: "rgba(105, 105, 105, 1)",
    },
    machineWaitingTime: {
        background: "rgba(241, 196, 15 , 1)",
        boder: "rgba(105, 105, 105, 1)",
    },
    machineColor: {
        background: "rgba(23, 32, 42,1)"
    },
    fontColor: {
        background: "black"
    }
};
fontSize = 13;
// chart.options.data_needle1.datasets.barThickness=50;

let timeData = {
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
        legend: {
            fontColor: "white"
        },
        plugins: {
            legend: {
                position: "right",
                labels: {
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
                    return ctx.dataset.data[ctx.dataIndex] > 5;
                },
                font: {
                    weight: "bold",
                    size: fontSize,
                },
                offset: 1,
                padding: 100,
                anchor: "center",
            },
        },
        Anchoring: "end",
        aspectRatio: 24 / 8,
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
                    size:20
                }
              },
              ticks: {
                // callback: function(value, index, ticks) {
                //     return  value +'m';
                // },
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
                    size:20
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
                position: "right",
                labels: {
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
                    return ctx.dataset.data[ctx.dataIndex] > 1;
                },
                font: {
                    size: fontSize,
                    weight: 'bold',
                    boxHeight: '5px'
                },
                offset: 1,
                padding: 100,
                anchor: "center",
            },
        },
        Anchoring: "start",
        aspectRatio: 24 / 8,
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
                    size:20,
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
                    size:20,
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


///////////////////////////////////////////////////////////////////////////////////////
