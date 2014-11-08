var module = angular.module('angular-cloud-endpoints', []);

module.factory('GClient', ['$document', '$q', '$timeout',
		function ($document, $q, $timeout) {

        var LOAD_GAE_API = false;
        var URL = 'https://apis.google.com/js/client.js';

        function loadScript(src) {
				var deferred = $q.defer();
				var script = $document[0].createElement('script');
				script.onload = function () {
					$timeout(function () {
						deferred.resolve();
					});
				};
				script.onerror = function () {
					$timeout(function () {
						deferred.reject();
					});
				};
				script.src = src;
				$document[0].body.appendChild(script);
				return deferred.promise;
		};

		function load(calback) {
				loadScript(URL).then(function() {
                	$timeout(calback);
                    LOAD_GAE_API = true;
                	
				}).catch(function() {
					LOAD_GAE_API = false;
				});
		}

        return {

            get: function(calback){
                if(LOAD_GAE_API)
                	calback();
                else
                	load(calback);

            }

        }

    }]);


module.factory('GAuth', ['$rootScope', 'GClient',
    function($rootScope, GClient){

        var CLIENT_ID;
        var SCOPES = ['https://www.googleapis.com/auth/userinfo.email'];
        var RESPONSE_TYPE = 'token id_token';

        function signin(mode, authorizeCallback) {
            gapi.auth.authorize({client_id: CLIENT_ID,
                    scope: SCOPES, immediate: mode, response_type : RESPONSE_TYPE},
                authorizeCallback);
        }

        function getUser() {
            var request =
                gapi.client.oauth2.userinfo.get().execute(function(resp) {
                    if (!resp.code) {
                        $rootScope.user = {};
                        $rootScope.user.email = resp.email;
                        $rootScope.user.picture = resp.picture;
                        $rootScope.user.id = resp.id;
                        $rootScope.user.name = resp.name;
                        $rootScope.user.link = resp.link;
                        $rootScope.$apply($rootScope.user);
                    }
                });
        }

        return {

        	setClient: function(client) {
        		CLIENT_ID = client;
        	},

        	setScopes: function(scopes) {
        		SCOPES = scopes;
        	},

            load: function(calback){
            	var args = arguments.length;
            	GClient.get(function (){
                	gapi.client.load('oauth2', 'v2', function() {
                    	if (args == 1)
                    		calback();
                	});
            	});

            },

            login: function(){
            	signin(true, getUser);
            },

            signin: function(calback){                
                signin(false, function() {
                    getUser();
                    calback();
                });
            },


        }

    }]);

module.factory('GApi', ['GClient',
    function(GClient){

        var LOAD_API = false;
        var API_NAME;

        var observerCallbacks = [];
        var observerCallbacksname = [];
        var observerCallbacksPostarray = [];

        function registerObserverCallback(name, postarray, callback){
            observerCallbacksname.push(name);
            observerCallbacksPostarray.push(postarray);
            observerCallbacks.push(callback);
        };

        function load(name, version, url) {
        	GClient.get(function (){
            gapi.client.load(name, version, function() {
                console.log("myLazyClock api loaded");
                LOAD_API = true;
                API_NAME = name;
                var i = 0;
                angular.forEach(observerCallbacks, function(callback){
                    gapi.client[name][observerCallbacksname[i]](observerCallbacksPostarray[i++]).execute(callback);
                });
            }, url)
        	});
        }

        function api(apiname, postarray, apifunction) {
            if (LOAD_API) {
                gapi.client[API_NAME][apiname](postarray).execute(apifunction);
            }
            else
                registerObserverCallback(apiname, postarray, apifunction);
        }

        return {

            load: function(name, version, url){
                load(name, version, url);
            },

            get: function(apiname, arg2, arg3){
            	if(arguments.length == 3)              
                	api(apiname, arg2, arg3);
                if(arguments.length == 2)
                	api(apiname, null, arg2);
            },
        }

    }]);