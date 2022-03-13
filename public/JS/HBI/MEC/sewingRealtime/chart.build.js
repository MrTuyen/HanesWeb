var myChart1 = new Chart(
    document.getElementById('myChart'),
    configData
    );
  var myChart2 = new Chart(
    document.getElementById('myChart1'),
    configDataRatio
  );
  var myChart3 = new Chart(
    document.getElementById('myChart2'),
    configOEE
  );
  
  