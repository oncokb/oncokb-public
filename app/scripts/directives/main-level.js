'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:mainLevel
 * @description
 * # mainLevel
 */
angular.module('oncokbStaticApp')
  .directive('mainLevel', function () {
    return {
      templateUrl: 'views/mainLevel.html',
      restrict: 'E',
      scope: {
        level: '=',
        color: '='
      },
      link: function postLink(scope, element, attrs) {
      }
    };
  });
