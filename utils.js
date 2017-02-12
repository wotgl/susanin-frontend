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
    context.font = "bold 12px sans-serif";
    var delta_1_x = 3.2;
    var delta_1_y = 4;
    var delta_2_x = 6.7;
    var delta_2_y = 4;
    if (text.toString().length == 1) {
      context.fillText(text, x - delta_1_x, y + delta_1_y);
    } else {
      context.fillText(text, x - delta_2_x, y + delta_2_y);
    }
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
  var colors = {};

  function iconCreateFunction(cluster) {
    var childCount = cluster.getChildCount();
    // console.log("AAAA");

    var allMarkers = cluster.getAllChildMarkers();
    var colors = {};
    for (i = 0; i < allMarkers.length; i++) {
      // console.log(allMarkers[i].options.icon.options.color);
      if (colors[allMarkers[i].options.icon.options.color] == undefined) {
        colors[allMarkers[i].options.icon.options.color] = 1;
      } else {
        colors[allMarkers[i].options.icon.options.color] += 1;
      }
    }

    var sortColors = getSortedKeys(colors);

    var c = ' marker-cluster-';
    if (childCount < 10) {
      c += 'small';
    } else if (childCount < 100) {
      c += 'medium';
    } else {
      c += 'large';
    }

    return new L.DivIcon({
      // html: '<div style="background: linear-gradient(to left, ' + '#ffffff 50%' + ', ' + sortColors[0] + ' 50%);"><span>' + childCount + '</span></div>',
      html: '<div ><span>' + '<i class="material-icons">plus_one</i>' + '</span></div>',
      // html: '<div style="background: radial-gradient(at top, white 50%, ' + sortColors[0] + ' 50%);"><span>' + childCount + '</span></div>',
      className: 'marker-cluster' + c,
      iconSize: new L.Point(30, 30)
    });
  }

  for (var i in places) {
    var place = places[i];
    if (!colors[place.colorCode]) {
      colors[place.colorCode] = [];
    }
    colors[place.colorCode].push(place);
  }

  for (var i in colors) {
    var markers = L.markerClusterGroup({
      maxClusterRadius: 25,
      // iconCreateFunction: iconCreateFunction
    });
    for (var j in colors[i]) {
      var place = colors[i][j];

      var title = parseInt(place.id);
      var greenIcon = L.icon({
        iconUrl: createCircle(title, i),
        color: i,
        iconSize: [25, 25],
      });
      var marker = L.marker(new L.LatLng(place.lat, place.lon), {
        icon: greenIcon
      });

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


function drawMonuments() {
  $.ajax({
    type: "POST",
    url: 'https://susanin.ml/api/v1/static_places/',
    data: '{"type":"monument"}',
    success: function(data) {
      data = JSON.parse(data)['data'];
      for (i = 0; i < data.length; i++) {
        var imageUrl = 'https://susanin.ml' + data[i]['image'];

        // Перепутал высоту и ширину
        imageBounds = [
          [data[i]['lat'], data[i]['lon']],
          [data[i]['lat'] + data[i]['height'], data[i]['lon'] + data[i]['width']]
        ];

        L.imageOverlay(imageUrl, imageBounds).addTo(map);
      }
    },
  });
}

function drawMetros() {
  $.ajax({
    type: "POST",
    url: 'https://susanin.ml/api/v1/static_places/',
    data: '{"type":"metro"}',
    success: function(data) {
      data = JSON.parse(data)['data'];
      for (i = 0; i < data.length; i++) {
        var imageUrl = 'https://susanin.ml' + data[i]['image'];

        // Перепутал высоту и ширину
        imageBounds = [
          [data[i]['lat'], data[i]['lon']],
          [data[i]['lat'] + data[i]['height'], data[i]['lon'] + data[i]['height'] + 0.0007]
        ];

        var img = L.imageOverlay(imageUrl, imageBounds, {
          interactive: true
        })
        img.addTo(map);
        // img.bindTooltip('kek');

        var height = 0.0004;
        // var latlng = L.latLng(data[i]['lat'] + height, data[i]['lon'] + height);
        img.bindPopup(data[i]['name']);

        img.on('click', function(e) {
          var latlng = L.latLng(e.latlng.lat + height, e.latlng.lng);
          // console.log(e);
          this.openPopup(latlng);

          var self = this;

          function close() {
            self.closePopup();
          }
          setTimeout(close, 2000);
        });


        // var textLatLng = [data[i]['lat'], data[i]['lon']];
        // var myTextLabel = L.marker(textLatLng, {
        //   icon: L.divIcon({
        //     className: 'text-labels', // Set class for CSS styling
        //     html: '<p>' + data[i]['name'].replace(' ', '&nbsp;') + '</p>'
        //   }),
        //   draggable: false, // Allow label dragging...?
        //   zIndexOffset: 1000 // Make appear above other map features
        // });

        // map.addLayer(myTextLabel);

      }
    },
  });
}


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

function detectmob() {
  if (window.innerWidth <= 800 && window.innerHeight <= 750) {
    return true;
  } else {
    return false;
  }
}

function getSortedKeys(obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys.sort(function(a, b) {
    return obj[b] - obj[a]
  });
}

function copyToClipboard(text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}

function webgl_support() {
  try {
    var canvas = document.createElement('canvas');
    return !!window.WebGLRenderingContext && (
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
};

function getMapzenKey() {
  items = ['mapzen-phdCimb',
    'mapzen-ThZrQcG',
    'mapzen-gmTTaKs',
    'mapzen-BHcXLm2',
    'mapzen-SHRFnGA'
  ]
  var item = items[Math.floor(Math.random() * items.length)];
  return item;
}


function getDay() {
  var d = new Date();
  var weekday = new Array(7);
  weekday[0] = "su";
  weekday[1] = "mo";
  weekday[2] = "tu";
  weekday[3] = "we";
  weekday[4] = "th";
  weekday[5] = "fr";
  weekday[6] = "sa";

  return weekday[d.getDay()];
}

function getCurrentHours() {
  var d = new Date();
  var h = d.getHours();
  h = h.toString();
  if (h.length == 1) {
    h = '0' + h;
  }

  return h;
}

function getCurrentMinutes() {
  var d = new Date();
  var m = d.getMinutes();
  m = m.toString();
  if (m.length == 1) {
    m = '0' + m;
  }

  return m;
}