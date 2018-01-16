'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:searchIcon
 * @description
 * # searchIcon
 */
angular.module('oncokbStaticApp')
    .directive('searchIcon', function($timeout) {
        return {
            templateUrl: 'views/searchIcon.html',
            restrict: 'E',
            scope: {},
            link: function postLink(scope, element, attrs) {
                scope.data = {
                    hideRect: false
                };
                scope.mouseLeave = function() {
                    // set timeout for the animation from css.
                    // Time should be the same with the transition time
                    $timeout(function() {
                        scope.data.hideRect = false;
                    }, 500);
                };
            }
        };
    });
