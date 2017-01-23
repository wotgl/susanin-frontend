// var baseURL = 'http://127.0.0.1:12345/api/v1';
baseURL = 'https://susanin.ml/api/v1';
// var baseURL_route = 'http://127.0.0.1/api';
// baseURL_route = 'http://192.168.0.113/api';
baseURL_route = 'https://susanin.ml/api';
var djangoURL = 'https://susanin.ml/api/django';
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

var logo_route = document.getElementById('route_logo');
logo_route.onclick = function() {
  var path = document.location.hash;
  if (path == '#/route/view') {
    history.back();
  } else {
    document.location.hash = '/route/view/';
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
  }).when("/expert/:id", {
    templateUrl: "expert.html",
    controller: "expertCtrl"
  }).when("/route/:view", {
    templateUrl: "route.html",
    controller: "routeCtrl"
  }).when("/about", {
    templateUrl: "about.html",
    controller: "aboutCtrl"
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
    console.info('menuCtrl');

    var stopPlaces, stopExperts;
    $scope.placesLoading = true;
    $scope.expertsLoading = true;
    $scope.previousRoute = false;
    $scope.selectedIndex = 1;

    $scope.$getPlace = function(place_id) {
      $location.path('/place/' + place_id + '/');
    };

    $scope.$getExpert = function(expert_id) {
      $location.path('/expert/' + expert_id + '/');
    };

    $scope.onTabSelected = function(md_selected) {
      $rootScope.md_selected = md_selected;
    };

    if ($rootScope.md_selected != undefined && $location.path() == "/menu/") {
      $scope.selectedIndex = $rootScope.md_selected;
      $rootScope.md_selected = undefined;
    }

    $scope.$on('event_expertRoute', function(event, arg) {
      $scope.$expertRoute(arg);
    });

    $scope.$expertRoute = function(expert_id) {
      var routes = expertsFactory.get_route_by_expert_id(expert_id);
      routeFactory.set_preview(routes);
      $location.path('/route/preview/');
    };

    $scope.startPreviousRoute = function() {
      $location.path('/route/view/');
    };

    $scope.startNewRoute = function() {
      $scope.previousRoute = false;
      logo_route.style.display = "none";
      routeFactory.del();
    };

    $scope.startNewRouteFromDirection = function() {
      $location.path('/menu/');
      $scope.startNewRoute();
    };

    // Places here
    function setPlacesContent() {
      var placesContent = placesFactory.get();
      if (placesContent.length != 0) {
        console.log('menuCtrl:setPlacesContent');

        $scope.placesLoading = false;
        $scope.placesContent = placesContent;

        if (stopPlaces != undefined) {
          $interval.cancel(stopPlaces);
          stopPlaces = undefined;
        }
      }
    }
    stopPlaces = $interval(setPlacesContent, TIMEOUT);
    setPlacesContent();

    // Experts here
    function setExpertsContent() {
      var expertsContent = expertsFactory.get();
      if (expertsContent.length != 0) {
        console.log('menuCtrl:setExpertsContent');

        $scope.expertsLoading = false;
        $scope.expertsContent = expertsContent;

        if (stopExperts != undefined) {
          $interval.cancel(stopExperts);
          stopExperts = undefined;
        }
      }
    }
    stopExperts = $interval(setExpertsContent, TIMEOUT);
    setExpertsContent();


    // Check previous route
    if (Object.keys(routeFactory.get()).length != 0) {
      $scope.previousRoute = true;
      logo_route.style.display = "block";
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
    console.info('placeCtrl');

    var stop;
    $scope.dataLoading = true;

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
        console.log('placeCtrl:setContent');

        $scope.content = content;
        $scope.dataLoading = false;
        $scope.content['distance'] = Math.floor(0.35 + getDistanceFromLatLonInKm(
          userLocation[0], userLocation[1], content.lat, content.lon));

        // tags here
        var tags = "";
        var tmp = $scope.content['tags'].split(',');
        for (var j = 0; j < tmp.length; j++) {
          if (tmp[j].trim().length != 0) {
            tags = tags + "#" + tmp[j].trim() + " ";
          }
        }
        $scope.content['tags'] = tags;

        if (stop != undefined) {
          $interval.cancel(stop);
          stop = undefined;
        }
      }
    }

    var stop;
    if (!$routeParams.id) {
      return;
    }
    var stop = $interval(setContent, TIMEOUT);
    setContent();

  }
]);

myApp.controller("expertCtrl", [
  '$scope',
  '$rootScope',
  '$http',
  '$routeParams',
  'expertsFactory',
  '$interval',
  '$mdDialog',
  '$location',
  function($scope, $rootScope, $http, $routeParams, expertsFactory, $interval, $mdDialog, $location) {
    console.info('expertCtrl');

    var stop;
    $scope.dataLoading = true;

    function setContent() {
      var content = expertsFactory.get_by_id($routeParams.id);
      if (content != undefined) {
        console.log('expertCtrl:setContent');

        $scope.content = content;
        $scope.dataLoading = false;

        if (stop != undefined) {
          $interval.cancel(stop);
          stop = undefined;
        }
      }
    }

    $scope.showConfirm = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'dialog-share.tmpl.html',
        parent: angular.element(document.querySelector('#app')),
        targetEvent: ev,
        clickOutsideToClose: true,
      });
    };

    function DialogController($scope, $mdDialog, $location) {
      $scope.link = $location.absUrl().replace('#', '%23'); // safe
      $scope.answer = function() {
        copyToClipboard($location.absUrl());
        $mdDialog.hide();
      };
    }

    $scope.getLink = function() {
      alert(1);
    }

    $scope.$goToExpertsRoute = function(expert_id) {
      $rootScope.$broadcast('event_expertRoute', expert_id);
    }

    stop = $interval(setContent, TIMEOUT);
    setContent();

  }
]);

myApp.controller("routeCtrl", [
  '$scope',
  '$http',
  '$routeParams',
  'routeFactory',
  '$interval',
  '$location',
  function($scope, $http, $routeParams, routeFactory, $interval, $location) {
    console.info('routeCtrl');

    $scope.dataLoading = true;
    $scope.userChoice = false;
    $scope.infoLoading = true;

    $scope.setRoute = function() {
      var previewRoute = routeFactory.get_preview();

      routeFactory.set(previewRoute);
      $location.path('/route/view/');
      // routeDirection(previewRoute);
    };

    $scope.showRouteOnMap = function() {
      $location.path('/');
      routeFactory.set($scope.content);
      map.setZoom(MIN_ZOOM + 2);
    }

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

      // update direction
      routeFactory.set($scope.content);
      $scope.content = routeFactory.get();
      checkStopInfo();
      stopInfo = $interval(setInfo, TIMEOUT);
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

      // update direction
      routeFactory.set($scope.content);
      $scope.content = routeFactory.get();
      checkStopInfo();
      stopInfo = $interval(setInfo, TIMEOUT);
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
      if (content.length != 0 && content.length != undefined) {
        console.log('routeCtrl:setContent');
        $scope.dataLoading = false;
        $scope.content = content;

        if (stop != undefined) {
          $interval.cancel(stop);
          stop = undefined;
        }
      }
    }

    function checkStopInfo() {
      // delete previous interval
      if (stopInfo != undefined) {
        $interval.cancel(stopInfo);
        stopInfo = undefined;
      }
    }

    function setInfo() {
      var routeLine = getRouteLine();
      if (routeLine != undefined) {
        console.log('routeCtrl:setInfo');

        $scope.infoLoading = false;
        $scope.info = getRouteLine().summary;
        $scope.info['places'] = routeFactory.get();
        var tmp = ($scope.info.totalTime + ($scope.info.places.length * 2700)) / 3600;
        $scope.info['_totalTime'] = tmp.toFixed(1);

        if (stopInfo != undefined) {
          $interval.cancel(stopInfo);
          stopInfo = undefined;
        }
      }
    }

    var stop = $interval(setContent, TIMEOUT);
    setContent();
    var stopInfo;

    if ($routeParams.view == 'view') {
      stopInfo = $interval(setInfo, TIMEOUT);
    }
  }
]);

myApp.controller('assembleRouteCtrl', [
  '$scope',
  'routeFactory',
  function($scope, routeFactory) {
    console.info('assembleRouteCtrl');

    $scope.clearValue = function() {
      $scope.data = undefined;
    };
    $scope.data = {};
    $scope.save = function() {
      if ($scope.myForm.$valid) {
        routeFactory.init($scope.data);
        document.location.hash = '/route/view/';
      }
    };
  }
]);

myApp.controller('aboutCtrl', [
  '$scope',
  function($scope) {
    console.info('aboutCtrl');
  }
]);

myApp.controller('mainCtrl', [
  '$scope',
  '$document',
  function($scope, $document) {
    console.info('mainCtrl');

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
      var url = djangoURL + '/expert/';
      $http.get(url, {
          places: 'all'
        })
        .then(function(result) {
          savedData = result.data;
          // console.log(savedData);
        });
    }

    return {
      set: set,
      get: get,
      init: init,
      get_by_id: get_by_id,
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
    var routeInfo = {};

    function init(data) {
      initData = data;
      fetchRoute();
    }

    function get() {
      return route;
    }

    function set(data) {
      route = sortRouteByDistance(data);
      initRouteInfo(route);
      logo_route.style.display = "block";
    }

    function get_preview() {
      return routePreview;
    }

    function set_preview(data) {
      routePreview = data;
    }

    function del() {
      route = {};
      deleteRouteDirection();
    }

    function sortRouteByDistance(input_route) {
      var _route = JSON.parse(JSON.stringify(input_route));
      var len = _route.length;
      var sortRoute = [];
      var _user = [userLocation[0], userLocation[1]]
      for (var i = 0; i < len; i++) {
        var minDistance = 9999999999;
        var placeIndex = 0;
        for (var j = 0; j < _route.length; j++) {
          var distance = getDistanceFromLatLonInKm(_user[0], _user[1], _route[j].lat, _route[j].lon);
          if (distance < minDistance) {
            minDistance = distance;
            placeIndex = j;
          }
        }
        _route[placeIndex].distance = minDistance;

        // Info fo user - 1st place! But route use chains 
        // _route[placeIndex].distance = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], _route[placeIndex].lat, _route[placeIndex].lon);
        sortRoute.push(_route[placeIndex]);
        _user[0] = _route[placeIndex].lat;
        _user[1] = _route[placeIndex].lon;
        _route.splice(placeIndex, 1);
      }
      return sortRoute;
    }

    function initRouteInfo(input_route) {
      var _route = JSON.parse(JSON.stringify(input_route));
      routeDirection(_route);
    }

    function fetchRoute() {
      var url = baseURL_route + '/get_route/';
      var d = new Date();
      var t = d.getTime();

      $http.post(url, {
          userLocation: {
            'lat': userLocation[0],
            'lon': userLocation[1]
          },
          data: initData,
          userTime: t
        })
        .then(function(result) {
          set(result.data);
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
  drawMonuments();
}]);

// ================Dirictivies================
myApp.directive('placeItem', function() {
  return {
    templateUrl: '/templates/placeItem.html'
  };
});