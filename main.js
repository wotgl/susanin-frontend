var baseURL = 'https://thisisfine.tk:10241/api/v1';
var baseURL_route = 'http://127.0.0.1:5000'
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
  }).when("/route", {
    templateUrl: "route.html",
    controller: "routeCtrl"
  });
});

// ================Controllers================
myApp.controller("menuCtrl", [
  '$scope',
  '$http',
  'placesFactory',
  'expertsFactory',
  'routeFactory',
  '$interval',
  '$location',
  function($scope, $http, placesFactory, expertsFactory, routeFactory, $interval, $location) {
    var stopPlaces, stopExperts;
    $scope.placesLoading = true;
    $scope.expertsLoading = true;
    $scope.previousRoute = false;

    $scope.$getPlace = function(place_id) {
      $location.path('/place/' + place_id + '/');
    };

    // Places here
    function setPlacesContent() {
      var placesContent = placesFactory.get();
      if (placesContent.length != 0) {
        $scope.placesLoading = false;
        $scope.placesContent = placesContent;

        if (stopPlaces != undefined) {
          $interval.cancel(stop);
          stopPlaces = undefined;
        }
      }
    }
    setPlacesContent();
    stopPlaces = $interval(setPlacesContent, TIMEOUT);

    // Experts here
    function setExpertsContent() {
      var expertsContent = expertsFactory.get();
      if (expertsContent.length != 0) {
        $scope.expertsLoading = false;
        $scope.expertsContent = expertsContent;

        if (stopExperts != undefined) {
          $interval.cancel(stop);
          stopExperts = undefined;
        }
      }
    }
    setExpertsContent();
    stopExperts = $interval(setExpertsContent, TIMEOUT);

    $scope.startPreviousRoute = function() {
      document.location.hash = '/route';
    };

    $scope.startNewRoute = function() {
      $scope.previousRoute = false;
    };

    // Check previous route
    if (Object.keys(routeFactory.get()).length != 0) {
      $scope.previousRoute = true;
    }

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
      window.history.back();
    };

    $scope.showPlace = function(lat, lon) {
      showPlace(lat, lon);
      document.location.hash = '/';
    };

    $scope.routeToPlace = function(lat, lon) {
      routeToPlace(lat, lon);
      document.location.hash = '/';
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

myApp.controller("routeCtrl", [
  '$scope',
  '$http',
  '$routeParams',
  'routeFactory',
  '$interval',
  function($scope, $http, $routeParams, routeFactory, $interval) {
    $scope.dataLoading = true;

    function setContent() {
      var content = routeFactory.get();
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

myApp.controller('assembleRouteCtrl', [
  '$scope',
  'routeFactory',
  function($scope, routeFactory) {
    $scope.clearValue = function() {
      $scope.data = undefined;
    };
    $scope.data = {};
    $scope.save = function() {
      if ($scope.myForm.$valid) {
        console.log($scope.data);
        routeFactory.init($scope.data);
        document.location.hash = '/route';
      } else {
        alert('Form was invalid!');
      }
    };
  }
]);

myApp.controller('mainCtrl', [
  '$scope',
  function($scope) {
    $scope.$back = function() {
      window.history.back();
    };
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

myApp.factory('expertsFactory', [
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

    function init() {
      fetchPlaces();
    }

    function fetchPlaces() {
      var url = baseURL_route + '/expert/';
      $http.post(url, {
          places: 'all'
        })
        .then(function(result) {
          savedData = result.data;
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

myApp.factory('routeFactory', [
  '$http',
  function($http) {
    var init_data = {};
    var route = {};

    function init(data) {
      init_data = data;
      fetchRoute();
    }

    function get() {
      return route;
    }

    function del() {
      route = {};
    }

    function fetchRoute() {
      var url = baseURL_route + '/route/';
      $http.post(url, {
          places: 'all'
        })
        .then(function(result) {
          route = result.data;
        });
    }

    return {
      get: get,
      init: init,
      del: del
    }
  }
]);

// ================Init================
myApp.run(['placesFactory', 'expertsFactory', function(placesFactory, expertsFactory) {
  placesFactory.init(drawPlaces);
  expertsFactory.init();
}]);

// ================Dirictivies================
myApp.directive('placeItem', function() {
  return {
    templateUrl: '/templates/placeItem.html'
  };
});
