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


function change_name_send() {
  var firstname =   document.getElementById('firstname').value;
  var lastname = document.getElementById('lastname').value;

  if(firstname == '' || lastname == ''){
    alert("Name cannot be empty");
    return;
  }

  var u = "change_name";
  post_data = {
    'firstname' : firstname,
    'lastname' : lastname,
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
        $('#change_name').modal('hide');
        var str = firstname + " " + lastname;
        document.getElementById('name_header').innerText = str;
      }
    }
  });
}

function change_password_send() {
  var old_password = document.getElementById('old_password').value;
  var new_password = document.getElementById('new_password').value;
  var new_password_confirm = document.getElementById('new_password_confirm').value;

  if(new_password == ''){
    //Password validation
    alert("password cannot be empty");
    return;
  }

  if(new_password != new_password_confirm){
    alert("passwords do not match");
    return;
  }

  var u = "change_password";
  post_data = {
    "old_password" : old_password,
    "new_password" : new_password,
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
        $('#change_password').modal('hide');

      },
      400: function() {
        alert("incorect password");
      }
    }
  });
}

function change_name(){
  change_name_send();
}

function change_password(){
  change_password_send();
}

function field_error(id){
  document.getElementById(id).style.visibility=
}

function account_on_load(){

}
