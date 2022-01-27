var lines = [
    { id: 1, value: "1-3", text: 'Line 1-3', default: "" },
    { id: 2, value: "4-6", text: 'Line 4-6', default: "" },
    { id: 3, value: "7-9", text: 'Line 7-9', default: "" },
    { id: 4, value: "10-12", text: 'Line 10-12', default: "" },
    { id: 5, value: "13-15", text: 'Line 13-15', default: "" },
]

// Socket
const socket = io();

socket.on('realtime', (data) => {
    alert(1)
});

$(document).ready(function () {
    // init lines
    let html = "";
    for (let i = 0; i < lines.length; i++) {
        let ele = lines[i];
        html += `<option value='${ele.value}' ${ele.default}>${ele.text}</option>`
    }
    $("#txtTime").append(html);
    $("#txtPartTime").append(html);

    getSewingMachineList();

    drawMachineLine("1-3");
    socket.emit('realtime', { user: "", message: "" });
})

function changeLine(id) {
    drawMachineLine(id);
}

function selectMachine(id, line, pos) {
    alert(`Máy ${id} ở line: ${line} vị trí: ${pos} `);
}

let listMcs = [];
let listLines = ["1-3", "4-6", "7-9"];

function getSewingMachineList(){
    for (let i = 0; i < 24; i++) {
        let obj = new Machine(i + 1, "Zone A", 1, i + 1, 0, "123454" + i);
        listMcs.push(obj);
    }
    for (let i = 0; i < 24; i++) {
        let obj = new Machine(i + 1, "Zone A", 2, i + 1, 0, "123454" + i);
        listMcs.push(obj);
    }
    for (let i = 0; i < 24; i++) {
        let obj = new Machine(i + 1, "Zone A", 3, i + 1, 0, "123454" + i);
        listMcs.push(obj);
    }
    for (let i = 0; i < 24; i++) {
        let obj = new Machine(i + 1, "Zone A", 4, i + 1, 0, "123454" + i);
        listMcs.push(obj);
    }
    for (let i = 0; i < 24; i++) {
        let obj = new Machine(i + 1, "Zone A", 5, i + 1, 0, "123454" + i);
        listMcs.push(obj);
    }
    for (let i = 0; i < 24; i++) {
        let obj = new Machine(i + 1, "Zone A", 6, i + 1, 0, "123454" + i);
        listMcs.push(obj);
    }
    for (let i = 0; i < 24; i++) {
        let obj = new Machine(i + 1, "Zone A", 7, i + 1, 0, "123454" + i);
        listMcs.push(obj);
    }
}

function drawMachineLine(id) {
    let lines = id.split("-");
    lines.push(parseInt(lines[0]) + 1);

    let htmlMachineArea = "";
    for (let i = 0; i < lines.sort().length; i++) {
        let ele = lines[i];
        let listMcOfLine = listMcs.filter(function (val) {
            return val.line == ele;
        })

        htmlMachineLine = "";
        let html = "";
        for (let j = 0; j < listMcOfLine.length; j++) {
            let mc = listMcOfLine[j];
            html += `<div class="machine" id="${mc.id}" onclick="selectMachine(${mc.tag}, ${ele}, ${mc.pos})">
                        <div class='mc-pos'>${mc.pos}</div>
                        <div class='mc-tag'>${mc.tag}</div>
                    </div>`;
        }
        htmlMachineLine = `<div class='col-md-4 p-0'>
                            <div class='line-box line-box-header text-center'><strong>Line ${ele}</strong></div>
                            <div class='line-box'>${html}</div>
                        </div>`;
        htmlMachineArea += htmlMachineLine;
    }
    
    $(".machine-area").html(htmlMachineArea);
}