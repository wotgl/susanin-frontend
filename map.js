var spb = {
  'lat': 59.93562345638782,
  'lon': 30.30291080474854
};
var map = L.map(
  'map', {
    "keyboardZoomOffset": .05,
    maxZoom: 15,
    zoomControl:false,
    "scrollWheelZoom": true
});
var placeMarker;
var layer = Tangram.leafletLayer({
  scene: "lib/susanin/styles/crosshatch.yaml",
});

map.setView([spb['lat'], spb['lon']], 12);
layer.addTo(map);

function goToPlace(lat, lon) {
  map.setView([lat, lon], 15);
  addPlaceMarker(lat, lon);
  document.location.hash = '/';
}

function addPlaceMarker(lat, lon) {
    if(placeMarker) {
      placeMarker.removeFrom(map);
    }
    placeMarker = L.marker([lat, lon]);
    placeMarker.addTo(map);
}
