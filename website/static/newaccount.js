function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
var csrftoken = getCookie('csrftoken');


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

function deleteUser(name) {
  var u = "delete_user";
  post_data = {
    'username' : name,
     "csrfmiddlewaretoken" : csrftoken
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
      204: function() {
        alert( "204" );
      }
    }
  });

}

function refresh_activities() {
  var u = "/refresh_activities";
  post_data = {
     "csrfmiddlewaretoken" : csrftoken
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
      200: function() {
        alert( "200" );
      }
    }
  });



}

function delete_activity(id) {
  var u = "delete_activity";
  post_data = {
    'id' : id,
     "csrfmiddlewaretoken" : csrftoken
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
      204: function() {
        alert( "204" );
      }
    }
  });
}
