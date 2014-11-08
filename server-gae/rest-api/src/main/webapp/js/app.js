var app = angular.module('myLazyClock', [

    'ui.bootstrap',
    'ui.router',
    'angular-cloud-endpoints',

    'myLazyClock.router',
    'myLazyClock.controller',

]);

app.run(['GAuth', 'GApi',
    function(GAuth, GApi) {

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

        GAuth.setClient(CLIENT);
        GAuth.load(function () {
            GAuth.login();
            GApi.load('myLazyClock','v1',BASE);
        });
    }
]);