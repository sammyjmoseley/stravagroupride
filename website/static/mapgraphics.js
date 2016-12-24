function add_encoded_polyline(str, map){
  var decodedPath = google.maps.geometry.encoding.decodePath(str);
  var path = new google.maps.Polyline({
    path: decodePath,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  path.setMap(map);

}
