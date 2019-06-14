'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:mainLevel
 * @description
 * # mainLevel
 */
angular.module('oncokbStaticApp')
    .directive('actionButton', function() {
        return {
            templateUrl: 'views/actionButton.html',
            restrict: 'E',
            scope: {
                selected:'='
            },
            transclude: true,
            link: function postLink(scope) {
                scope.data = {
                    content: scope.content
                };
            }
        };
    });
