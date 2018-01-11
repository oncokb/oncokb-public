'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:searchIcon
 * @description
 * # searchIcon
 */
angular.module('oncokbStaticApp')
    .directive('searchIcon', function() {
        return {
            templateUrl: 'views/searchIcon.html',
            restrict: 'E',
            scope: {},
            link: function postLink(scope, element, attrs) {
            }
        };
    });
