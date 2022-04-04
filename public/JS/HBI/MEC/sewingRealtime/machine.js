var locationLate = '';

function Adjusting() {
  var oldID = document.getElementById('oldID').value;
  var newID = document.getElementById('newID').value;
  if (oldID != '' && newID != '') {
    $.ajax({
      url: "updateMachine",
      type: "post",
      data: {
        'oldID': oldID,
        'newID': newID
      },
      dataType: "json",
    }).done(function () {
      location.reload(true);
    });
  }
};

function saveMachine() {
  let newID = document.getElementById("newID").value;
  let oldID = document.getElementById("machine-tag").innerHTML;
  document.getElementById("newID").value = '';
  $.ajax({
    url: 'updateMachine',
    type: 'post',
    data: {
      'newID': newID,
      'oldID': oldID,
      'lineName': lineName,
      'location': locationLate
    },
    dataType: 'json',

  }).done(function (response) {

    let msg = response.msg;
    if (response.status == '1') {
      updateLayoutLine(lineName);
      toastr.success(msg);
    } else toastr.warning(msg);
  })
}

function updateLayoutLine(lineName) {
  $.ajax({
    url: 'machine',
    type: 'post',
    data: {
      'lineName': lineName
    },
    dataType: 'json',
  }).done(function (data) {
    let html = '';
    var no = 1;
    var key;
    let keyLocation = data.line.map(function (e) {
      return e.location;
    });
    for (let row = 0; row < 2; row++) {
      html += '<div class="line row">'
      for (let col = 0; col < 13; col++) {
        if (data.line.some(checkExist => checkExist.location === no)) {
          key = keyLocation.indexOf(no)
          if (data.line[key]['state'] == 1 && !data.line[key]['repaired']) {
            html +=
              `<div class="machine-location col" style="border: 2px solid #fff;background:#27ae60;color:#ecf0f1;" title="${data.line[key]['operation']}: ${data.line[key]['title']}" data-bs-toggle="modal" data-bs-placement="bottom" data-bs-target="#modal-machine"  data-bookid="${data.line[key]['no']}">
                  <p class="machine-no">${no}</p>
                  <p class="machine-name">${data.line[key]['machine']}</p>
                  <p class="op">${data.line[key]['operation']}</p>
                  <p class="machine-tag">${data.line[key]['tag']}</p>
                </div>
                `;
          } else if (data.line[key]['repaired'] == 'pending') {
            html +=
              `<div class="machine-location col" style="border: 2px solid #fff;background:#e74c3c;color:#ecf0f1;" title="${data.line[key]['operation']}: ${data.line[key]['title']}" data-bs-toggle="modal" data-bs-placement="bottom" data-bs-target="#modal-machine"  data-bookid="${data.line[key]['no']}">
                  <p class="machine-no">${no}</p>
                  <p class="machine-name">${data.line[key]['machine']}</p>
                  <p class="op">${data.line[key]['operation']}</p>
                  <p class="machine-tag">${data.line[key]['tag']}</p>
                </div>
                `;
          } else if (data.line[key]['repaired'] == 'repairing') {
            html +=
              `<div class="machine-location col" style="border: 2px solid #fff;background:#f1c40f;color:#ecf0f1;" title="${data.line[key]['operation']}: ${data.line[key]['title']}" data-bs-toggle="modal" data-bs-placement="bottom" data-bs-target="#modal-machine"  data-bookid="${data.line[key]['no']}">
                  <p class="machine-no">${no}</p>
                  <p class="machine-name">${data.line[key]['machine']}</p>
                  <p class="op">${data.line[key]['operation']}</p>
                  <p class="machine-tag">${data.line[key]['tag']}</p>
                </div>
                `;
          } else {
            html +=
              `<div class="machine-location col" title="${data.line[key]['operation']}: ${data.line[key]['title']}" data-bs-toggle="modal" data-bs-placement="bottom" data-bs-target="#modal-machine"  data-bookid="${data.line[key]['no']}">
                  <p class="machine-no">${no}</p>
                  <p class="machine-name">${data.line[key]['machine']}</p>
                  <p class="op">${data.line[key]['operation']}</p>
                  <p class="machine-tag">${data.line[key]['tag']}</p>
                </div>
                `;
          }
        } else {
          html +=
            `<div class="empty machine-location col" title="Vị trí trống" data-bookid="${null}">
                <p class="empty-no">${no}</p>
                <i class="emty-icon fas fa-unlink"></i>
            </div>`;
        }
        no++
      }
      html += '</div>'
    }
    document.getElementById('content').innerHTML = html;
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('.machine-location'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  });
}
var myModal = document.getElementById('modal-machine');
myModal.addEventListener('show.bs.modal', function () {
  locationLate = $(event.relatedTarget).data('bookid')
  if (locationLate != null) {
    $.ajax({
      url: 'machineData',
      type: 'post',
      data: {
        'lineName': lineName,
        'index': locationLate
      },
      dataType: 'json',
    }).done(function (response) {
      document.getElementById('operation').innerHTML = response.machineData[0]['operation'];
      document.getElementById('title').innerHTML = response.machineData[0]['title'];
      document.getElementById('on-time').innerHTML = response.machineData[0]['power_on_time_s'];
      document.getElementById('run-time').innerHTML = response.machineData[0]['run_time_s'];
      document.getElementById('machine-tag').innerHTML = response.machineData[0]['tag'];
      document.getElementById('loss-time').innerHTML = response.machineData[0]['loss_time_s'];
    })
  } else {
    document.getElementById('operation').innerHTML = '';
    document.getElementById('title').innerHTML = '';
    document.getElementById('power_on_time_s').innerHTML = '';
    document.getElementById('run-time').innerHTML = '';
    document.getElementById('machine-tag').innerHTML = '';
    document.getElementById('loss-time').innerHTML = '';
  }

})