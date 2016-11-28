function createCircle(text, color) {
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  var size = 13;
  var x = size;
  var y = size;
  var radius = size;
  var endPercent = 101;
  var curPerc = 0;
  var counterClockwise = false;
  var circ = Math.PI * 2;
  var quart = Math.PI / 2;
  var color = color;

  context.lineWidth = 10;
  context.strokeStyle = '#ad2323';
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  function doText(context, x, y, text) {
    context.lineWidth = 1;
    context.fillStyle = "#ffffff";
    context.lineStyle = "#ffffff";
    context.font = "12px sans-serif";
    context.fillText(text, x - 5, y + 5);
  }

  function animate(color) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 1;
  }
  animate(color);
  doText(context, x, y, text);
  var img = canvas.toDataURL("image/png");
  return img;
}

function drawPlaces(places) {
  console.log("drawPlaces");
  var colors = {};

  for (var i in places) {
    var place = places[i];
    if (!colors[place.colorCode]) {
      colors[place.colorCode] = [];
    }
    colors[place.colorCode].push(place);
  }

  for (var i in colors) {
    var markers = L.markerClusterGroup({maxClusterRadius: 25});
    for (var j in colors[i]) {
      var place = colors[i][j];

      var title = parseInt(place.id);
      var greenIcon = L.icon({
        iconUrl: createCircle(title, i),

        iconSize: [25, 25],
      });
      var marker = L.marker(new L.LatLng(place.lat, place.lon), {icon: greenIcon});

      (function(place) {
        marker.on('click', function(e) {
          location.hash = '/place/' + place.id
        })
      })(place)


      markers.addLayer(marker)
    }
    map.addLayer(markers)
  }
}
