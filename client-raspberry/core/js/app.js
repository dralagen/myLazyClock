var app = angular.module('myLazyClock', [

    'ui.router',
    'angular-google-gapi',
    'ngStorage',
    'ngAudio',
    'cfp.hotkeys',

    'myLazyClock.router',
    'myLazyClock.controller',

]);

app.run(['GApi', '$state', '$rootScope', '$http', '$timeout',
    function(GApi, $state, $rootScope, $http, $timeout) {

        //var BASE = 'http://localhost:8080/_ah/api';
        var BASE = 'https://mylazyclock.appspot.com/_ah/api';

        var init = false;

        $rootScope.online = false;

        var isOnline = function() {
          $http.get('https://api.github.com/', {'cache' : false}).
            success(function(data, status, headers, config) {
              $rootScope.online = true;
              if(!init) {
                init = true;
                GApi.load('myLazyClock','v1',BASE);
              }
              $timeout(isOnline, 60000);
            }).
            error(function(data, status, headers, config) {
              if(status == 0) {
                $rootScope.online = false;
                $timeout(isOnline, 4000);
              }
              else {
                if(!init) {
                  init = true;
                  GApi.load('myLazyClock','v1',BASE);
                }
                $rootScope.online = true;
                $timeout(isOnline, 60000);
              }
                
            });
        }

        isOnline();

        $rootScope.isRaspClient = false;
        if(window.navigator.userAgent == 'raspmylazyclock')
            $rootScope.isRaspClient = true;

    }
]);