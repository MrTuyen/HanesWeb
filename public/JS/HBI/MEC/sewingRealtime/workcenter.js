function Adjusting(){
    let deleteId = 0;
    var location = document.getElementById("inLocation").value;
    var style = document.getElementById("inStyle").value;
    var checkDelete = $('#deleteId').is(':checked');
    if(checkDelete == true){
        deleteId = 1;
    }
    console.log(deleteId);
    $.ajax({
        url:'updateZone',
        type:'post',
        data:{'location':location,'style': style,'deleteId':deleteId},
        dataType:'json',
    }).done(function(response){
        console.log(response);
        let msg=response.msg;
        let status=response.status;
        if(status==0){
            toastr.warning(msg);
        }
        if(status==1){
            toastr.success(msg);
            document.getElementById(`p${response.line_no}`).innerHTML = response.line_name;
        }
        if(status==2){
            toastr.error(msg);
        } 
    })
        
}