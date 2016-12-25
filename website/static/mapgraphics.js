var polyline_dict = {};
var map;



function add_polyline_dict(polyline, athlete_id){
  if (!(athlete_id in polyline_dict)){
    polyline_dict[athlete_id]= [polyline];
  } else{
    polyline_dict[athlete_id].push(polyline);
  }
}

function make_visible(athlete_id){
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

function on_load(){
  var elems = document.getElementsByName("user_checkbox");
  for(var i=0; i < elems.length; i++) {
    elems[i].setAttribute("checked", true);
  }

  checkbox_change();
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
