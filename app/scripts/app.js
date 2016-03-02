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
    'ui.router',
    'datatables',
    'datatables.bootstrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'HomeCtrl'
      })
      .when('/levels', {
        templateUrl: 'views/levels.html',
        controller: 'MainCtrl'
      })
      .when('/team', {
        templateUrl: 'views/team.html',
        controller: 'MainCtrl'
      })
      .when('/api', {
        templateUrl: 'views/api.html',
        controller: 'MainCtrl'
      })
      .when('/gene', {
        templateUrl: 'views/gene.html',
        controller: 'GeneCtrl',
        controllerAs: 'gene'
      })
      .when('/quest', {
        templateUrl: 'views/quest.html',
        controller: 'QuestCtrl',
        controllerAs: 'quest'
      })
      .otherwise({
        redirectTo: 'HomeCtrl'
      });
  });

NProgress.start();
angular.element(document).ready(function () {
  angular.bootstrap(document, ['oncokbStaticApp']);
});
