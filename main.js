var baseURL = 'https://thisisfine.tk:10241/api/v1';
var TIMEOUT = 200;

var logo = document.getElementById('susanin_logo');
logo.onclick = function() {
  var path = document.location.hash;
  if (path != '#/' && path != "") {
    document.location.hash = '/';
  } else {
    document.location.hash = '/menu';
  }
}

var myApp = angular.module('menuApp', ['ngRoute', 'ngMaterial']);

myApp.config(function($routeProvider) {
  $routeProvider.when("/menu", {
    templateUrl: "menu.html",
    controller: "menuCtrl"
  }).when("/place/:id", {
    templateUrl: "place.html",
    controller: "placeCtrl"
  });
});


// ================Controllers================
myApp.controller("menuCtrl", [
  '$scope',
  '$http',
  'placesFactory',
  '$interval',
  function($scope, $http, placesFactory, $interval) {
    var stop;
    $scope.dataLoading = true;

    function setContent() {
      var content = placesFactory.get();
      if (content.length != 0) {
        $scope.dataLoading = false;
        $scope.content = content;

        if (stop != undefined) {
          $interval.cancel(stop);
          stop = undefined;
        }
      }
    }

    setContent();
    stop = $interval(setContent, TIMEOUT);

  }
]);

myApp.controller("placeCtrl", [
  '$scope',
  '$http',
  '$routeParams',
  'placesFactory',
  '$interval',
  function($scope, $http, $routeParams, placesFactory, $interval) {
    var stop;
    $scope.dataLoading = true;

    $scope.$back = function() {
      console.log(1);
      window.history.back();
    };

    function setContent() {
      var content = placesFactory.get_by_id($routeParams.id);
      if (content != undefined) {
        $scope.content = content;
        $scope.dataLoading = false;

        if (stop != undefined) {
          $interval.cancel(stop);
          stop = undefined;
        }
      }
    }

    setContent();
    var stop = $interval(setContent, TIMEOUT);

  }
]);

// ================Factories================
myApp.factory('placesFactory', [
  '$http',
  function($http) {
    var savedData = [];

    function set(data) {
      savedData = data;
    }

    function get() {
      return savedData;
    }

    function get_by_id(id) {
      for (i = 0; i < savedData.length; i++) {
        if (savedData[i].id == id) {
          return savedData[i];
        }
      }
      return undefined;
    }

    function init(callback) {
      fetchPlaces(callback);
    }

    function fetchPlaces(callback) {
      var url = baseURL + '/places/';
      $http.post(url, {
          places: 'all'
        })
        .then(function(result) {
          savedData = result.data.data;
          callback(result.data.data);
        });
    }

    return {
      set: set,
      get: get,
      init: init,
      get_by_id: get_by_id
    }
  }
]);


// ================Init================
myApp.run(['placesFactory', function(placesFactory) {
  placesFactory.init(drawPlaces);
}]);


// ================Dirictivies================
myApp.directive('placeItem', function() {
  return {
    templateUrl: '/templates/placeItem.html'
  };
});


// =================Mapzen=================
var spb = {
  'lat': 59.93562345638782,
  'lon': 30.30291080474854
};
var map = L.map(
  'map', {
    "keyboardZoomOffset": .05,
    maxZoom: 20,
    zoomControl:false,
    "scrollWheelZoom": false
  });

map.setView([spb['lat'], spb['lon']], 12);

var layer = Tangram.leafletLayer({
  scene: "lib/susanin/styles/crosshatch.yaml",
});
layer.addTo(map);
