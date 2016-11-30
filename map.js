// =================Mapzen=================

// Init map
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
var layer = Tangram.leafletLayer({
  scene: "lib/susanin/styles/crosshatch.yaml",
});

map.setView([spb['lat'], spb['lon']], 12);
layer.addTo(map);

var placeMarker, userMarker;
var userLocation;

// Init
function init() {
  var _locations = [
    [59.936802, 30.327609], [59.939201, 30.323238], [59.955850, 30.320244],
    [59.932715, 30.316163], [59.931881, 30.330128], [59.930977, 30.345342],
    [59.930838, 30.361665], [59.938877, 30.352602], [59.942421, 30.334614]
  ]
  userLocation = _locations[Math.floor(Math.random() * _locations.length)];
  console.log(userLocation);
  addUserMarker(userLocation[0], userLocation[1])

}
init();


// Map API functions
function goToPlace(lat, lon) {
  map.setView([lat, lon], 15);
  addPlaceMarker(lat, lon);
  document.location.hash = '/';
}

function addPlaceMarker(lat, lon) {
  if (placeMarker) {
    placeMarker.removeFrom(map);
  }
  placeMarker = L.marker([lat, lon]);
  placeMarker.addTo(map);
}

function addUserMarker(lat, lon) {
  if (userMarker) {
    userMarker.removeFrom(map);
  }
  var userIcon = L.icon({
    iconUrl: './img/face.png',

    iconSize:     [30, 41], // size of the icon
    iconAnchor:   [30, 41], // point of the icon which will correspond to marker's location
    popupAnchor:  [-15, -41] // point from which the popup should open relative to the iconAnchor
  });

  userMarker = L.marker([lat, lon], {icon: userIcon});

  userMarker.addTo(map);
  userMarker.bindPopup("Вы здесь").openPopup();
  // userMarker.bindPopup("Museum of New Zealand.").openPopup();
}
