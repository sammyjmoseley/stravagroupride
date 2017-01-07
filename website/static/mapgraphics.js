var polyline_dict = {};
var map;
var bounds;
var center;
var polylines;
var infolines;
var uluru = {lat: -0, lng: 0};
var followers = [];
var drawing = false;

function repan_include_all(){
  map.setCenter(uluru);
  map.setZoom(4);
  bounds = map.getBounds();
  for (var i in polylines){
    if(polylines[i][0].map==null) continue;
    for (var j in polylines[i][2]){
      if (i==0 && j==0){
        map.setCenter(polylines[i][2][j]);
        map.setZoom(10);
        bounds = map.getBounds();

      }
      bounds.extend(polylines[i][2][j]);
    }
  }
  map.fitBounds(bounds);
}


function add_polyline_dict(polyline, athlete_id){
  if (!(athlete_id in polyline_dict)){
    polyline_dict[athlete_id]= [polyline];
  } else{
    polyline_dict[athlete_id].push(polyline);
  }
}

function make_visible(athlete_id){
  if(!(athlete_id in polyline_dict)) return;
  for(var i=0; i<polyline_dict[athlete_id].length; i++){
    // polyline_dict[athlete_id][i].strokeOpacity=1.0;
    polyline_dict[athlete_id][i].setMap(map);
  }
}

function make_invisible(athlete_id){
  for(var i=0; i<polyline_dict[athlete_id].length; i++){
    // polyline_dict[athlete_id][i].strokeOpacity=0.001;
    polyline_dict[athlete_id][i].setMap(null);
  }
}

function set_all_visible(b){
  ul = document.getElementById("user_list");
  li = ul.getElementsByTagName("div");

  var elems = document.getElementsByName("user_checkbox");
  for(var i=0; i < li.length; i++) {
    if(li[i].style.display==""){
      li[i].getElementsByTagName("input")[0].checked = b;
    }

  }
  checkbox_change();
}

function select_all_visible(){
  set_all_visible(true);
}

function deselect_all_visible(){
  set_all_visible(false);
}

function line_clicked(lines){
  color = '#FFFF00'
  for (x in lines){
    lines[x].setOptions({strokeColor: color});
  }
}

function line_unclicked(lines){
  color = '#FF0000'
  for (x in lines){
    lines[x].setOptions({strokeColor: color});
  }

}

function filter() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = document.getElementsByName('search');
    filter = input[0].value.toUpperCase();
    ul = document.getElementById("user_list");
    li = ul.getElementsByTagName("div");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i];
        if (a.getAttribute("name").toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function drawing_change(){
  if(drawing){
    document.getElementById("btn_drawing").style.background ="#04ca1e";
  } else {
    document.getElementById("btn_drawing").style.background ="#ca4104";
  }
}

function on_load(){
  $("#btn_select_followers")[0].disabled = true;
  var elems = document.getElementsByName("user_checkbox");
  for(var i=0; i < elems.length; i++) {
    elems[i].setAttribute("checked", true);
  }

  checkbox_change();

  fill_follower_list();
}

function checkbox_change(){
  var elems = document.getElementsByName("user_checkbox");
  for(var i=0; i < elems.length; i++) {
    if(elems[i].checked){
      make_visible(elems[i].getAttribute("id"));
    } else{
      make_invisible(elems[i].getAttribute("id"));
    }
  }
}

function fill_follower_list(){
  var u = "followers/1/";
  $.ajax({
    url:u,
    type:'GET',
    success:function(data, status, xhr){
      for (var i in data){
        followers.push("check_" + data[i]);
      }
      $("#btn_select_followers")[0].disabled = false;
    },
    error: function(error){
      console.log(error);
    }
  });
}

function select_followers(){
  ul = document.getElementById("user_list");
  li = ul.getElementsByTagName("div");

  var elems = document.getElementsByName("user_checkbox");
  for(var i=0; i < li.length; i++) {
    if(li[i].style.display==""){
      if(followers.indexOf(li[i].getElementsByTagName("input")[0].id)!=-1){
        li[i].getElementsByTagName("input")[0].checked = true;
      } else{
        li[i].getElementsByTagName("input")[0].checked = false;
      }
    }

  }
  checkbox_change();
}

function draw_map_area(){
  drawing = !drawing;
  drawing_change();
}
