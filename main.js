var baseURL = 'https://thisisfine.tk:10241/api/v1';
var baseURL_route = 'http://127.0.0.1/api';
baseURL_route = 'http://192.168.1.64/api';
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

myApp.config(function($routeProvider, $mdGestureProvider) {
  $routeProvider.when("/menu/:page", {
    templateUrl: "menu.html",
    controller: "menuCtrl"
  }).when("/menu/", {
    templateUrl: "menu.html",
    controller: "menuCtrl"
  }).when("/place/:id", {
    templateUrl: "place.html",
    controller: "placeCtrl"
  }).when("/route/:view", {
    templateUrl: "route.html",
    controller: "routeCtrl"
  });
  $mdGestureProvider.skipClickHijack();
});



// ================Controllers================
myApp.controller("menuCtrl", [
  '$scope',
  '$rootScope',
  '$http',
  'placesFactory',
  'expertsFactory',
  'routeFactory',
  '$interval',
  '$location',
  '$routeParams',
  function($scope, $rootScope, $http, placesFactory, expertsFactory, routeFactory, $interval, $location, $routeParams) {
    var stopPlaces, stopExperts;
    $scope.placesLoading = true;
    $scope.expertsLoading = true;
    $scope.previousRoute = false;
    $scope.selectedIndex = 1;

    $scope.$getPlace = function(place_id) {
      $location.path('/place/' + place_id + '/');
    };

    console.log("AAAA");

    $scope.onTabSelected = function(md_selected) {
      $rootScope.md_selected = md_selected;
    };

    if ($rootScope.md_selected != undefined) {
      $scope.selectedIndex = $rootScope.md_selected;
      $rootScope.md_selected = undefined;
    }

    $scope.$expertRoute = function(expert_id) {
      var routes = expertsFactory.get_route_by_expert_id(expert_id);
      routeFactory.set_preview(routes);
      $location.path('/route/preview/');
    };

    $scope.startPreviousRoute = function() {
      document.location.hash = '/route/view/';
    };

    $scope.startNewRoute = function() {
      $scope.previousRoute = false;
      routeFactory.del();
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


    // Check previous route
    if (Object.keys(routeFactory.get()).length != 0) {
      $scope.previousRoute = true;
    }

    // if (!$routeParams.page) {
    //   $scope.pageId = 1;
    // } else {
    //   $scope.pageId = $routeParams.page;
    // }
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
    $scope.userChoice = false;

    $scope.setRoute = function() {
      var previewRoute = routeFactory.get_preview();
      routeFactory.set(previewRoute);
      document.location.hash = '/menu/';
    };

    $scope.checkedPlace = function(placeId) {
      var delIndex;
      for (i = 0; i < $scope.content.length; i++) {
        if ($scope.content[i].id == placeId) {
          delIndex = i;
          break;
        }
      }
      $scope.content.splice(delIndex, 1);
      var url = baseURL_route + '/check_in/';
      $http.post(url, {
          placeId: placeId
        })
        .then(function(result) {});
    };

    $scope.deletePlace = function(placeId) {
      var delIndex;
      for (i = 0; i < $scope.content.length; i++) {
        if ($scope.content[i].id == placeId) {
          delIndex = i;
          break;
        }
      }
      $scope.content.splice(delIndex, 1);
    };

    function setContent() {
      var content;
      if ($routeParams.view == 'preview') {
        content = routeFactory.get_preview();
        $scope.userChoice = true;
      } else {
        content = routeFactory.get();
        $scope.userChoice = false;
      }
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
        document.location.hash = '/route/view/';
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

    function get_route_by_expert_id(id) {
      for (i = 0; i < savedData.length; i++) {
        if (savedData[i].id == id) {
          return savedData[i].places;
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
      get_route_by_expert_id: get_route_by_expert_id
    }
  }
]);

myApp.factory('routeFactory', [
  '$http',
  function($http) {
    var initData = {};
    var route = {};
    var routePreview = {};

    function init(data) {
      initData = data;
      fetchRoute();
    }

    function get() {
      return route;
    }

    function set(data) {
      route = data;
    }

    function get_preview() {
      return routePreview;
    }

    function set_preview(data) {
      routePreview = data;
    }

    function del() {
      route = {};
    }

    function fetchRoute() {
      var url = baseURL_route + '/get_route/';
      $http.post(url, {
          userLocation: {
            'lat': userLocation[0],
            'lon': userLocation[1]
          },
          data: initData
        })
        .then(function(result) {
          route = result.data;
        });
    }

    return {
      get: get,
      init: init,
      del: del,
      set: set,
      get_preview: get_preview,
      set_preview: set_preview,
    }
  }
]);


// ================Init================
myApp.run(['placesFactory', 'expertsFactory', '$http', function(placesFactory, expertsFactory, $http) {
  var url = baseURL_route + '/init/';
  $http.post(url)
    .then(function(result) {});
  placesFactory.init(drawPlaces);
  expertsFactory.init();
}]);

// ================Dirictivies================
myApp.directive('placeItem', function() {
  return {
    templateUrl: '/templates/placeItem.html'
  };
});