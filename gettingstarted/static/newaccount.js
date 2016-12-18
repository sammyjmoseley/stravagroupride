function validateUsername(text) {
  if(text!=""){
    return "";
  } else {
    return "error";
  }
}

function validatePassword(text) {
  if(text!=""){
    return "";
  } else {
    return "error";
  }
}

function validateFormOnSubmit() {
  var reason = "";
  reason += validateUsername($('#username').val());
  reason += validatePassword($('#password').val());

  if (reason != "") {
    alert("Some fields need correction:\n" + reason);
  } else {
    var u = "create_user";
    var post_data = {
      'firstname' : $('#firstname').val(),
      'lastname' : $('#lastname').val(),
      'username' : $('#username').val(),
      'password' : $('#password').val()
    }

    $.ajax({
      url:u,
      type:'POST',
      data:post_data,
      success:function(data, status, xhr){
        //alert(status);
      },
      error: function(error){
        console.log(error);
      },
      statusCode: {
        201: function() {
          alert( "201" );
        }
      }
    });
  }
}
