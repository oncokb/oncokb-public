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
  .constant('_', window._)
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
      .when('/gene/:geneName', {
        templateUrl: 'views/gene.html',
        controller: 'GeneCtrl',
        controllerAs: 'gene'
      })
      .when('/quest', {
        templateUrl: 'views/quest.html',
        controller: 'QuestCtrl',
        controllerAs: 'quest'
      })
      .when('/genes', {
        templateUrl: 'views/genes.html',
        controller: 'GenesCtrl',
        controllerAs: 'genes'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('oncokbStaticApp').run(
  function($timeout, $rootScope) {
    $rootScope.view = {
      subNavItems: [{
        content: '427 Genes',
        link: '#/genes'
      }, {content: '3800 Variants'}, {content: '333 Tumor Types'}]
    };
    $rootScope.data = {
      levelColors: {
        '1': '#008D14',
        '2A': '#019192',
        '2B': '#2A5E8E',
        '3A': '#794C87',
        '3B': '#9B7EB6',
        '4': 'black',
        //'R1': '#F40000',
        //'R2': '#C4006F',
        //'R3': '#6F08A3',
        'Other': 'grey'
      }
    };
    $rootScope.$on('$routeChangeEnd', function() {
      if (!$rootScope.view.subNavItems || $rootScope.view.subNavItems.length === 1) {
        $rootScope.view.subNavItems = [{
          content: '427 Genes',
          link: '#/genes'
        }, {content: '3800 Variants'}, {content: '333 Tumor Types'}];
      }
    });
  });


NProgress.start();
angular.element(document).ready(function () {
  angular.bootstrap(document, ['oncokbStaticApp']);
});
