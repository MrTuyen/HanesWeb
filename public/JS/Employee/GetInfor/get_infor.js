document.getElementById("btn_employee_non_dr_search").addEventListener("click", function (event, result) {
    var table_body = document.getElementById("table_workHrs_non_dr_body");
    while (table_body.childNodes.length > 0) {
        table_body.removeChild(table_body.childNodes[0]);
    }
    var xsend = new XMLHttpRequest();
    xsend.open("POST", "/Employee/Get_NonDR_Infor", true);
    xsend.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            workHours_list = JSON.parse(xsend.responseText);
            var abs_day = 0;
            var ot_sum = 0;
            for (var i = 0; i < workHours_list.length; i++) {
                var tr = document.createElement("tr");
                //Date
                var tdDate = document.createElement("td");
                tdDate.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].Date.toString().substring(0, 10));
                tdDate.appendChild(nodeID);
                tr.appendChild(tdDate);
                //Shift
                var tdShift = document.createElement("td");
                tdShift.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].Shift);
                tdShift.appendChild(nodeID);
                tr.appendChild(tdShift);
                //Reg In
                var tdIn = document.createElement("td");
                tdIn.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].Reg_In);
                tdIn.appendChild(nodeID);
                tr.appendChild(tdIn);
                //Reg Out
                var tdOut = document.createElement("td");
                tdOut.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].Reg_Out);
                tdOut.appendChild(nodeID);
                tr.appendChild(tdOut);
                //Absenteeism
                var tdAb = document.createElement("td");
                tdAb.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].Absenteeism);
                if (workHours_list[i].Absenteeism > 0) {
                    tr.style.background = 'yellow';
                }
                tdAb.appendChild(nodeID);
                tr.appendChild(tdAb);
                abs_day += workHours_list[i].Absenteeism;
                //Late
                var tdLate = document.createElement("td");
                tdLate.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].Late);
                tdLate.appendChild(nodeID);
                tr.appendChild(tdLate);
                //Soon
                var tdSoon = document.createElement("td");
                tdSoon.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].Soon);
                tdSoon.appendChild(nodeID);
                tr.appendChild(tdSoon);
                //OT150
                var tdOT150 = document.createElement("td");
                tdOT150.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].OT150);
                tdOT150.appendChild(nodeID);
                tr.appendChild(tdOT150);
                ot_sum += workHours_list[i].OT150;
                //OT200
                var tdOT200 = document.createElement("td");
                tdOT200.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].OT200);
                tdOT200.appendChild(nodeID);
                tr.appendChild(tdOT200);
                //OT300
                var tdOT300 = document.createElement("td");
                tdOT300.setAttribute("class", "mdl-data-table__cell--non-numeric");
                var nodeID = document.createTextNode(workHours_list[i].OT300);
                tdOT300.appendChild(nodeID);
                tr.appendChild(tdOT300);
                componentHandler.upgradeElement(tr);
                document.getElementById("table_workHrs_non_dr_body").appendChild(tr);
            }
            document.getElementById("Abs_Day").innerHTML = "<i class='material-icons mdl-list__item-icon'>work</i>Số ngày nghỉ: " + (Math.round(abs_day) / 8).toFixed(2) + " ngày";
            document.getElementById("OT_Sum").innerHTML = "<i class='material-icons mdl-list__item-icon'>watch_later</i>Số giờ tăng ca: " + ot_sum.toFixed(2) + " giờ";
        }
    }
    xsend.setRequestHeader("Content-type", "application/json");
    // var ID=event.target.value;
    // var week =document.getElementById("weekCbc").value;
    // data={group: group, shift:shift, week: week};
    var month = '3';
    var year = '2020';
    data = { month: month, year: year };
    xsend.send(JSON.stringify(data));
});
