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
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('oncokbStaticApp').run(
  function($timeout, $rootScope, $location, _) {
    $rootScope.meta = {};
    $rootScope.view = {};
    $rootScope.meta.view = {
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
    $rootScope.$on('$routeChangeStart', function() {
      $rootScope.view.subNavItems = [];
    });
    $rootScope.$on('$routeChangeSuccess', function() {
      var path = $location.path().split('/') || [];
      $rootScope.view.currentPage = path.length > 2 ? path[1] : '';
      if (!$rootScope.view.subNavItems || $rootScope.view.subNavItems.length === 0) {
        $.extend(true, $rootScope.view.subNavItems, $rootScope.meta.view.subNavItems);
      }
    });
  });


NProgress.start();
angular.element(document).ready(function () {
  angular.bootstrap(document, ['oncokbStaticApp']);
});
