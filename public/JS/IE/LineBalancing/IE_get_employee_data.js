document.getElementById("group").addEventListener("change", function(event, result){
    var list = document.getElementById("wc_list");
    while (list.childNodes.length>0) { 
        list.removeChild(list.childNodes[0]);
    }
    var xsend= new XMLHttpRequest();
    xsend.open("POST","/IE/group_query",true);
    xsend.onreadystatechange= function(){
        if (this.readyState==4 && this.status==200){
            wc_list=JSON.parse(xsend.responseText);
            for (var i=0; i<wc_list.length; i++){
                var li=document.createElement("li");
                li.setAttribute("class","mdl-menu__item");
                // if (i==0) li.setAttribute("data-selected", "true");
                var textNode=document.createTextNode(wc_list[i].Fabric);
                li.appendChild(textNode);
                document.getElementById("wc_list").appendChild(li);
                getmdlSelect.init("#cbb_wc");
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var group=event.target.value;
    var week =document.getElementById("weekCbc").value;
    data={group: group, shift:shift, week: week};
    xsend.send(JSON.stringify(data));
});

document.getElementById("WC").addEventListener("change", function(event, result){
    var list = document.getElementById("style_list");
    while (list.childNodes.length>0) { 
        list.removeChild(list.childNodes[0]);
    }
    var xsend= new XMLHttpRequest();
    xsend.open("POST","/IE/style_query",true);
    xsend.onreadystatechange= function(){
        if (this.readyState==4 && this.status==200){
            var style_list=JSON.parse(xsend.responseText);
            for (var i=0; i<style_list.length; i++){
                var li=document.createElement("li");
                li.setAttribute("class","mdl-menu__item");
                // if (i==0) li.setAttribute("data-selected", "true");
                var textNode=document.createTextNode(style_list[i].Style);
                li.appendChild(textNode);
                document.getElementById("style_list").appendChild(li);
                getmdlSelect.init("#cbb_style");
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var wc=event.target.value;
    var group=document.getElementById("group").value;
    var week =document.getElementById("weekCbc").value;
    data={group: group, wc: wc, shift: shift, week: week};
    xsend.send(JSON.stringify(data));
});

document.getElementById("style").addEventListener("change", function(event, result){
    var list = document.getElementById("size_list");
    while (list.childNodes.length>0) { 
        list.removeChild(list.childNodes[0]);
    }
    var xsend= new XMLHttpRequest();
    xsend.open("POST","/IE/size_query",true);
    xsend.onreadystatechange= function(){
        if (this.readyState==4 && this.status==200){
            var size_list=JSON.parse(xsend.responseText);
            for (var i=0; i<size_list.length; i++){
                var li=document.createElement("li");
                li.setAttribute("class","mdl-menu__item");
                // if (i==0) li.setAttribute("data-selected", "true");
                var textNode=document.createTextNode(size_list[i].Size);
                li.appendChild(textNode);
                document.getElementById("size_list").appendChild(li);
                getmdlSelect.init("#cbb_size");
            }
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    var style=event.target.value;
    var group=document.getElementById("group").value;
    var wc   =document.getElementById("WC").value;
    var week =document.getElementById("weekCbc").value;
    data={group: group, wc: wc, shift: shift, week: week, style:style};
    xsend.send(JSON.stringify(data));
});

var employee_list="";

document.getElementById("emp_load").addEventListener("click", function(){
    document.getElementById("employee_data_panel_1").click();
    document.getElementById("op_div").style.display="none";
    //add spinner process while loading data
    var process_spinner=document.getElementById("process_spinner");
    process_spinner.setAttribute("class","mdl-progress mdl-js-progress mdl-progress__indeterminate");
    componentHandler.upgradeElement(process_spinner);
    //clear data from old table
    var emp_table = document.getElementById("table_emp_body");
    while (emp_table.childNodes.length>0) { 
        emp_table.removeChild(emp_table.childNodes[0]);
    }
    var op_table = document.getElementById("table_op_body");
    while (op_table.childNodes.length>0) { 
        op_table.removeChild(op_table.childNodes[0]);
    }
    //register a address to post and request data
    var xsend= new XMLHttpRequest();
    xsend.open("POST","/IE/load_emp_data",true);
    xsend.onreadystatechange= function(){
        if (this.readyState==4 && this.status==200){
            var emp_data=JSON.parse(xsend.responseText);
            employee_list=emp_data;
            var emp_length=emp_data.length
            for (var i=0; i<emp_length; i++){
                var tr=document.createElement("tr");
                //STT
                var tdSTT=document.createElement("td");
                tdSTT.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeSTT=document.createTextNode(i+1);
                tdSTT.appendChild(nodeSTT);
                tr.appendChild(tdSTT);
                //ID
                var tdID=document.createElement("td");
                tdID.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeID=document.createTextNode(emp_data[i].ID);
                tdID.appendChild(nodeID);
                tr.appendChild(tdID);
                //Name
                var tdName=document.createElement("td");
                tdName.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodename=document.createTextNode(emp_data[i].Name);
                tdName.appendChild(nodename);
                tr.appendChild(tdName);
                //Line
                var tdLine=document.createElement("td");
                tdLine.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeLine=document.createTextNode(emp_data[i].Line);
                tdLine.appendChild(nodeLine);
                tr.appendChild(tdLine);
                //Shift
                var tdShift=document.createElement("td");
                tdShift.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeShift=document.createTextNode(emp_data[i].Shift);
                tdShift.appendChild(nodeShift);
                tr.appendChild(tdShift);
                //Op1
                var tdOp1=document.createElement("td");
                tdOp1.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeOp1=document.createTextNode(emp_data[i].Operation1);
                tdOp1.appendChild(nodeOp1);
                tr.appendChild(tdOp1);
                //Ef1
                var tdEf1=document.createElement("td");
                tdEf1.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeEf1=document.createTextNode(emp_data[i].Efficiency1);
                tdEf1.appendChild(nodeEf1);
                tr.appendChild(tdEf1);
                //Op2
                var tdOp2=document.createElement("td");
                tdOp2.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeOp2=document.createTextNode(emp_data[i].Operation2);
                tdOp2.appendChild(nodeOp2);
                tr.appendChild(tdOp2);
                //EF2
                var tdEf2=document.createElement("td");
                tdEf2.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeEf2=document.createTextNode(emp_data[i].Efficiency2);
                tdEf2.appendChild(nodeEf2);
                tr.appendChild(tdEf2);
                //Note1
                var tdNote1=document.createElement("td");
                tdNote1.setAttribute("class","mdl-data-table__cell--non-numeric");
                var nodeNote1=document.createTextNode(emp_data[i].Note1);
                tdNote1.appendChild(nodeNote1);
                tr.appendChild(tdNote1);
                componentHandler.upgradeElement(tr);
                document.getElementById("table_emp_body").appendChild(tr);
                //Edit data
                // var tdNote2=document.createElement("button");
                // tdNote2.setAttribute("class","mdl-button mdl-js-button mdl-button--icon");
                // var icon=document.createElement("i");
                // icon.setAttribute("class","material-icons");
                // var iconText=document.createTextNode("create");
                // icon.appendChild(iconText);
                // componentHandler.upgradeElement(icon);
                // tdNote2.appendChild(icon);
                
                // tr.appendChild(tdNote2);
                // document.getElementById("table_body").appendChild(tr);
            }
            //hide spinner process
            process_spinner.removeAttribute("class");
        }
    }
    //send data to request table employee list
    xsend.setRequestHeader("Content-type", "application/json");
    var group=document.getElementById("group").value;
    var wc   =document.getElementById("WC").value;
    var shift=document.getElementById("shift").value;
    var week =document.getElementById("weekCbc").value;
    data={group: group, wc: wc, shift: shift, week: week};
    xsend.send(JSON.stringify(data));
});


Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

function append_week(week){
    var li=document.createElement("li");
    var textNode=document.createTextNode(week);
    li.setAttribute("class","mdl-menu__item");
    li.appendChild(textNode);
    document.getElementById("weekCBC").appendChild(li);
}

function add_week_to_cbb(){
    var thisWeek=new Date().getWeekNumber();
    var nextWeek=thisWeek+1;
    thisWeek='W'+thisWeek.toString();
    nextWeek='W'+nextWeek.toString()
    append_week(nextWeek);
    append_week(thisWeek);
    getmdlSelect.init("#cbb_weekCBC");
}
add_week_to_cbb();

document.getElementById("btn_cbc").addEventListener('click', function(){
    if (employee_list!=""){
        document.getElementById("operation_data_panel_1").click();
        var lineBalancing_spinner=document.getElementById("lineBalancing_spinner");
        lineBalancing_spinner.setAttribute("class","mdl-spinner mdl-js-spinner is-active");
        componentHandler.upgradeElement(lineBalancing_spinner);
        var op_table = document.getElementById("table_op_body");
        while (op_table.childNodes.length>0) { 
            op_table.removeChild(op_table.childNodes[0]);
        }
        var xsend= new XMLHttpRequest();
        xsend.open("POST","/IE/get_lineBalancing", true);
        xsend.onreadystatechange= function(){
            if (this.readyState==4 && this.status==200){
                var op_data=JSON.parse(xsend.responseText);
                var op_list= new Array();
                var headCount_list=new Array();
                var eff_list=new Array();
                var output_list= new Array();
                for (var i=0; i<op_data.length; i++){
                    op_list.push(op_data[i].Operation);
                    headCount_list.push(op_data[i].MainQ);
                    eff_list.push(op_data[i].MainE);
                    output_list.push(op_data[i].Output);
                    var tr=document.createElement("tr");
                    //Operation
                    var tdOp=document.createElement("td");
                    tdOp.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].Operation);
                    tdOp.appendChild(nodeID);
                    tr.appendChild(tdOp);
                    //Sam
                    var tdSAM=document.createElement("td");
                    tdSAM.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].SAM);
                    tdSAM.appendChild(nodeID);
                    tr.appendChild(tdSAM);
                    //MAT
                    var tdMAT=document.createElement("td");
                    tdMAT.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].MAT);
                    tdMAT.appendChild(nodeID);
                    tr.appendChild(tdMAT);
                    //HC
                    var tdHC=document.createElement("td");
                    tdHC.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].MainQ);
                    tdHC.appendChild(nodeID);
                    tr.appendChild(tdHC);
                    //eff
                    var tdEff=document.createElement("td");
                    tdEff.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].MainE);
                    tdEff.appendChild(nodeID);
                    tr.appendChild(tdEff);
                    //aQ
                    var tdRQ=document.createElement("td");
                    tdRQ.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].ReduceQ);
                    tdRQ.appendChild(nodeID);
                    tr.appendChild(tdRQ);
                    //RE
                    var tdRE=document.createElement("td");
                    tdRE.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].ReduceE2);
                    tdRE.appendChild(nodeID);
                    tr.appendChild(tdRE);
                    //AQ
                    var tdAQ=document.createElement("td");
                    tdAQ.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].AddQ);
                    tdAQ.appendChild(nodeID);
                    tr.appendChild(tdAQ);
                    //AE
                    var tdAE=document.createElement("td");
                    tdAE.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].AddE2);
                    tdAE.appendChild(nodeID);
                    tr.appendChild(tdAE);
                    //Output
                    var tdOutput=document.createElement("td");
                    tdOutput.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].Output);
                    tdOutput.appendChild(nodeID);
                    tr.appendChild(tdOutput);
                    //Machine
                    var tdMachine=document.createElement("td");
                    tdMachine.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].Machine);
                    tdMachine.appendChild(nodeID);
                    tr.appendChild(tdMachine);
                    //Wip
                    // var tdWIP=document.createElement("td");
                    // tdWIP.setAttribute("class","mdl-data-table__cell--non-numeric");
                    // var nodeID=document.createTextNode(op_data[i].WIP);
                    // tdWIP.appendChild(nodeID);
                    // tr.appendChild(tdWIP);
                    //Comment
                    var tdComment=document.createElement("td");
                    tdComment.setAttribute("class","mdl-data-table__cell--non-numeric");
                    var nodeID=document.createTextNode(op_data[i].Comment);
                    tdComment.appendChild(nodeID);
                    tr.appendChild(tdComment);
                    document.getElementById("table_op_body").appendChild(tr);
                }
                lineBalancing_spinner.removeAttribute("class");
                document.getElementById("op_div").style.display="grid";
                document.getElementById("headCount_chart").remove();
                document.getElementById("eff_chart").remove();
                document.getElementById("output_chart").remove();
                document.getElementById("headCount_chart_div").innerHTML='<canvas id="headCount_chart"></canvas>';
                document.getElementById("eff_chart_div").innerHTML+='<canvas id="eff_chart"></canvas>';
                document.getElementById("output_chart_div").innerHTML='<canvas id="output_chart"></canvas>';
                var color=new Array();
                for (var i=0; i<op_data.length; i++){
                    color.push('#' + (Math.random().toString(16) + '0000000').slice(2, 8));
                }
                draw_graph(op_list, headCount_list, 'HeadCount', 'headCount_chart', 'doughnut', color);
                draw_graph(op_list, eff_list,       'Hiệu Suất', 'eff_chart',       'line',     color);
                draw_graph(op_list, output_list,    'Sản Lượng', 'output_chart',    'bar',      color);
            }
        }
        xsend.setRequestHeader("Content-type", "application/json");
        var style=document.getElementById("style").value;
        var size =document.getElementById("size").value;
        data={style: style, size: size, emp_list:employee_list};
        xsend.send(JSON.stringify(data));
    }
    else {
        alert('Bạn chưa nhấn Tìm kiếm Danh sách');
    }
});

function draw_graph(op_list, output_list, label, balancingChart, typeChar, color){
    var ctx = document.getElementById(balancingChart).getContext('2d');
    var myChart = new Chart(ctx, {
        type: typeChar,//'bar',
        data: {
            labels: op_list,
            datasets: [{
                label: label,//'Sản lượng theo Công đoạn',
                data: output_list,
                backgroundColor: color,
                borderWidth: 1,
                fill: false
            }]
        }
        ,options: {
            // plugins:{
            //     colorschemes:{
            //         scheme: 'tableau.Classic10'
            //     }
            // },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines:{
                        display: false
                    }
                }]
            }
        }
    });
}

