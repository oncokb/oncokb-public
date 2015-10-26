'use strict';

/**
 * @ngdoc overview
 * @name oncokbStaticApp
 * @description
 * # oncokbStaticApp
 *
 * Main module of the application.
 */
angular
    .module('oncokbStaticApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.materialize',
        'ui.router'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/levels', {
                templateUrl: 'views/levels.html',
                controller: 'MainCtrl'
            })
            .when('/variants', {
                templateUrl: 'views/variants.html',
                controller: 'MainCtrl'
            })
            .when('/team', {
                templateUrl: 'views/team.html',
                controller: 'MainCtrl'
            })
            .when('/cbioportal', {
                templateUrl: 'views/cbioportal.html',
                controller: 'MainCtrl'
            })
            .when('/api', {
                templateUrl: 'views/api.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });

NProgress.start();
angular.element(document).ready(function () {
    angular.bootstrap(document, ['oncokbStaticApp']);
});
