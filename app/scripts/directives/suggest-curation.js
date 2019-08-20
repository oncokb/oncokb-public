'use strict';
angular.module('oncokbStaticApp')
    .directive('suggestCuration', function() {
        return {
            templateUrl: 'views/suggestCuration.html',
            restrict: 'E',
            scope: {
                suggestion: '='
            }
        };
    });
