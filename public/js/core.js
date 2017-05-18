var red = angular.module("redrobotics", ["ngRoute"]);

function homeController($scope, $http) {

}

function gameController($scope, $http, socket) {
    var clock = new FlipClock($('#clock'), 0, {
      clockFace: 'MinuteCounter',
      countdown: true,
      autoStart: false,
    });

    var redScore = new FlipClock($('#red'), 0, {
      clockFace: 'Counter',
      autoStart: false,
    })

    var blueScore = new FlipClock($('#blue'), 0, {
      clockFace: 'Counter',
      autoStart: false,
    })

    socket.on('score', function (data) {
        redScore.setValue(data.red);
        blueScore.setValue(data.blue);
    });

    socket.on('startgame', function(data){
      game = data
      clock.setTime(game.end)
      clock.start()
      redScore.setValue(game.score.red);
      blueScore.setValue(game.score.blue);
    });

    socket.on('clock', function (data) {
        game=data
        if(clock.getTime() !== game.end-data){
          clock.setTime(game.end-game.clock)
        }
    });

    $scope.startGame = function(){
        console.log("pressed")
        $http.post('/startgame', {})
    }

    $scope.redPlus = function(){
        
    }
}

red.config([
  '$routeProvider',
  function ($route) {
    $route.when('/', {
      templateUrl: '/templates/home.html',
      controller: homeController
    });
    $route.when('/game', {
      templateUrl: '/templates/game.html',
      controller: gameController
    });
    $route.when('/admin', {
      templateUrl: '/templates/admin.html',
      controller: gameController
    });
  }
])

red.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

function twodigit(n){
    return n > 9 ? "" + n: "0" + n;
}