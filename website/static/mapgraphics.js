var polyline_dict = {};
var athlete_dict = {};
var map;
var bounds;
var center;
var polylines;
var infolines;
var uluru = {lat: -0, lng: 0};
var followers = [];
var drawing = false;
var drawing_points = [];
var clicked_shape;
var shapeInfoWindow;


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


function shape_rider_leaderboard(){
  var leaderboard = {};
  var last;
  var curr;
  var contains;
  for(var i in polyline_dict){
    leaderboard[i] = 0;
    for(var j in polyline_dict[i]){
      last = null;
      for(var k = 0; k < polyline_dict[i][j].getPath().length; k++){
        curr = polyline_dict[i][j].getPath().getAt(k);
        contains = google.maps.geometry.poly.containsLocation(curr, clicked_shape);
        if(contains){
          if(last==null){
            last = curr;
          } else{
            leaderboard[i] += google.maps.geometry.spherical.computeDistanceBetween(last, curr);
            last = curr;
          }
        } else{
          last = null;
        }
      }
    }
  }
  $("#shape_leaderboard_rows").contents().remove();
  $("#shape_leaderboard_rows").append("<tr>\
                                        <td>User</td>\
                                        <td>Distance (km)</td>\
                                      </tr>");

  var sorted_leaderboard = Object.keys(leaderboard).map(function(key) {
    return [key, leaderboard[key]]
  });
  sorted_leaderboard.sort(function(first, second) {
    return second[1] - first[1];
  });

  for(var i in sorted_leaderboard){
    if(sorted_leaderboard[i][1]<=0) continue;
    $("#shape_leaderboard_rows").append("<tr class=\"shape_leaderboard_items\" data-num=\"" + i + "\"><td><p>"+ athlete_dict[sorted_leaderboard[i][0]] + "<p/></td><td><p>"+ sorted_leaderboard[i][1]/1000 + "</p></td></tr>");
  }


  $("#shape_leaderboard").modal('show');
}

function delete_shape(){
  clicked_shape.setMap(null);
  shapeInfoWindow.close();
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

var filter_funcs = {'search' : search_filter};

/**
search follower functions return:
  TRUE if satisfies filtering condition
  FALSE if does not satisfy filtering condition
*/

function search_filter(a){
  var input = document.getElementById("rider_search_field");
  var filter = input.value.toUpperCase();
  if(filter == '') return true;
  if (a.getAttribute("name").toUpperCase().indexOf(filter) > -1) {
      return true;
  } else {
      return false;
  }
}

function followers_filter(a){
  if(followers.indexOf(a.getElementsByTagName("input")[0].id)!=-1){
    return true;
  } else {
    return false;
  }
}


function filter() { //general processing of filter criteria
    // Declare variables
    var ul, li, a, i;


    ul = document.getElementById("user_list");
    li = ul.getElementsByTagName("div");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i];
        a.style.display = "";
        for(var j in filter_funcs){ //AND of all filter functions
          if(!filter_funcs[j](a)){
            a.style.display = "none";
            break;
          }
        }

    }
}

function drawing_change(){
  if(drawing){
    document.getElementById("btn_drawing").style.background ="#04ca1e";
  } else {
    document.getElementById("btn_drawing").style.background ="#ca4104";
    for(var i in drawing_points){
      drawing_points[i].setMap(null);
    }
    drawing_points = [];
  }
}

function on_load(){
  $(".followers").addClass("disabled");
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
      make_visible(elems[i].getAttribute("data-id"));
    } else{
      make_invisible(elems[i].getAttribute("data-id"));
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
      $(".followers").removeClass("disabled");
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
      }
    }

  }
  checkbox_change();
}

function select_only_followers(){
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

function filter_followers(){
  if(filter_funcs.hasOwnProperty('followers')){
    delete filter_funcs['followers'];
    document.getElementById("filter_followers_btn").innerHTML="Followers";
    filter();
  } else {
    filter_funcs['followers'] = followers_filter;
    document.getElementById("filter_followers_btn").innerHTML="Followers <span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>";
    filter();
  }

}

function remove_filter(){
  filter_funcs = {'search' : search_filter};

  //clear search field
  var input = document.getElementById("rider_search_field");
  input.value = '';

  //reset filter buttons
  document.getElementById("filter_followers_btn").innerHTML="Followers";


  filter();
}

function draw_map_area(){
  drawing = !drawing;
  drawing_change();
}

function filter_leaderboard(){
  var val = parseInt(document.getElementById("leaderboard_size").value);
  var leaderboard_items = $(".shape_leaderboard_items");
  for(var i=0; i<leaderboard_items.length; i++){
    var item_val = parseInt(leaderboard_items[i].getAttribute("data-num"));
    if(val<0 || item_val<val){
      leaderboard_items[i].style.display="";
    } else{
      leaderboard_items[i].style.display="none";
    }
  }
}
