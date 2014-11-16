var app = angular.module('myLazyClock', [

    'ui.bootstrap',
    'ui.router',
    'angular-cloud-endpoints',

    'myLazyClock.router',
    'myLazyClock.controller',

]);

app.run(['GAuth', 'GApi', '$state',
    function(GAuth, GApi, $state) {

        var CLIENT;
        var BASE;
        if(window.location.hostname == 'localhost') {
            if(window.location.port == '8080') {
                CLIENT = '1072024627812-kgv1uou2btdphtvb2l2bbh14n6u2n2mg.apps.googleusercontent.com';
                BASE = 'http://localhost:8080/_ah/api';
            } else {
                CLIENT = '1072024627812-69lrpihiunbo6rrpqpnkho7djdl5fu74.apps.googleusercontent.com';
                BASE = 'http://localhost:8080/_ah/api';
            } 
        } else {
            CLIENT = '1072024627812-oh4jdt3mo6rihojkt480tqfsja2706b4.apps.googleusercontent.com';
            BASE = 'https://mylazyclock.appspot.com/_ah/api';
        }

        GApi.load('myLazyClock','v1',BASE);
        GApi.load('calendar','v3');
        GAuth.setClient(CLIENT);
        GAuth.setScopes(['https://www.googleapis.com/auth/userinfo.email','https://www.googleapis.com/auth/calendar.readonly']);
        GAuth.checkAuth().then(
            function () {
                if($state.includes('login'))
                    $state.go('webapp.home');
            },
            function() {
                $state.go('login');
            }
        );
    }
]);