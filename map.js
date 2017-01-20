// =================Mapzen=================

// Init map
var spb = {
  'lat': 59.93562345638782,
  'lon': 30.30291080474854
};
var spb_locations = [59.783808, 29.736831, 60.104248, 30.621194];
var MAX_ZOOM = 15;
var MIN_ZOOM = 11;

var map = L.map(
  'map', {
    "keyboardZoomOffset": .05,
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    zoomControl: true,
    "scrollWheelZoom": true,
    'tap': false,
    attributionControl: false
  });
map.zoomControl.setPosition('topleft');
var layer = Tangram.leafletLayer({
  scene: "lib/susanin/styles/crosshatch.yaml",
});
layer.addTo(map);

// ZoomControl for mobile/desktop
if (detectmob()) {
  map.zoomControl.remove();
}

var placeMarker, userMarker;
var userLocation, routeControl;

// Show map on click
map.on('click', function(e) {
  var path = document.location.hash;
  if (path != '#/' && path != "") {
    document.location.hash = '/';
  }
});

// Init
function init() {
  if (!webgl_support()) {
    alert('Включите WebGL или обновите браузер');
  }
  var _locations = [
    [59.936802, 30.327609],
    [59.939201, 30.323238],
    [59.955850, 30.320244],
    [59.932715, 30.316163],
    [59.931881, 30.330128],
    [59.930977, 30.345342],
    [59.930838, 30.361665],
    [59.938877, 30.352602],
    [59.942421, 30.334614]
  ]
  userLocation = _locations[Math.floor(Math.random() * _locations.length)];
  console.log(userLocation);
  addUserMarker(userLocation[0], userLocation[1]);

  // Boundary of map
  map.setMaxBounds([
    [spb_locations[0], spb_locations[1]],
    [spb_locations[2], spb_locations[3]]
  ]);
  map.setView([spb['lat'], spb['lon']], 12.5);

  function identifyGeo() {
    function geoDisable() {
      alert('Геолокация отключена.');
    }

    function notSaintPeterburg() {
      alert('Вы не в Санкт-Петербурге. Ваше местоположение на карте выбрано случаным образом :)');
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {

        // in SPb
        if (position.coords.latitude > spb_locations[0] && position.coords.latitude < spb_locations[2] && position.coords.longitude > spb_locations[1] && position.coords.longitude < spb_locations[3]) {

          addUserMarker(position.coords.latitude, position.coords.longitude);
          navigator.geolocation.watchPosition(function(position) {
            addUserMarker(position.coords.latitude, position.coords.longitude);
          });
        } else {
          notSaintPeterburg();
        }
      }, geoDisable);
    } else {
      // geoDisable();
    }
  }

  identifyGeo(); // DEBUG
}
init();


// Map API functions
function showPlace(lat, lon) {
  map.setView([lat, lon], 15);
  addPlaceMarker(lat, lon);
}

function deleteMarkers() {
  if (routeControl) {
    map.removeControl(routeControl);
  }
  if (placeMarker) {
    placeMarker.removeFrom(map);
  }
}

function routeToPlace(lat, lon) {
  deleteMarkers();

  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation[0], userLocation[1]),
      L.latLng(lat, lon)
    ],
    router: L.Routing.mapzen('mapzen-SHRFnGA', {
      costing: 'pedestrian'
    }),
    show: false,
    language: 'ru',
    routeWhileDragging: true,
    createMarker: function(i, waypoint, n) {
      if (i == 0) {
        return false;
      }
      return L.marker([waypoint.latLng.lat, waypoint.latLng.lng]);
    },
  });
  map.addControl(routeControl);
}

var AAA;
var BBB;
var routeLine;

function routeDirection(places) {
  routeLine = undefined;
  deleteMarkers();

  var waypoints = [];
  waypoints.push(L.latLng(userLocation[0], userLocation[1]));
  for (var i = 0; i < places.length; i++) {
    waypoints.push(L.latLng(places[i].lat, places[i].lon));
  }

  var plan = new L.Routing.Plan(waypoints, {
    draggableWaypoints: false
  });

  routeControl = L.Routing.control({
    waypoints: waypoints,

    router: L.Routing.mapzen('mapzen-SHRFnGA', {
      costing: 'pedestrian'
    }),
    show: false,
    language: 'ru',
    routeWhileDragging: true,
    routeLine: function(route) {
      routeLine = route;

      var line = L.Routing.line(route);
      return line;
    },
    createMarker: function(i, waypoint, n) {
      if (i == 0) {
        return false;
      }

      return L.marker([waypoint.latLng.lat, waypoint.latLng.lng]);
    },
  });

  AAA = routeControl;

  map.addControl(routeControl);
}

function deleteRouteDirection() {
  deleteMarkers();
}

function getRouteLine() {
  return routeLine;
}

function addPlaceMarker(lat, lon) {
  deleteMarkers();

  placeMarker = L.marker([lat, lon]);
  placeMarker.addTo(map);
}

function addUserMarker(lat, lon) {
  if (userMarker) {
    userMarker.removeFrom(map);
  }
  var userIcon = L.icon({
    iconUrl: './img/face.png',

    iconSize: [30, 41], // size of the icon
    iconAnchor: [30, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [-15, -41] // point from which the popup should open relative to the iconAnchor
  });

  userMarker = L.marker([lat, lon], {
    icon: userIcon
  });

  userMarker.addTo(map);
}