'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:mainLevel
 * @description
 * # mainLevel
 */
angular.module('oncokbStaticApp')
    .directive('pillTag', function() {
        return {
            templateUrl: 'views/pillTag.html',
            restrict: 'E',
            scope: {
                key: '=',
                color: '=',
                onDelete: '&',
                content: '='
            },
            controller: function($scope) {
            },
            link: function postLink(scope) {
                scope.removeClick = function() {
                    scope.onDelete(scope.key, scope.content);
                };
            }
        };
    });
