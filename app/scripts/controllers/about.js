'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
    .controller('AboutCtrl', function($scope, $rootScope) {
        $scope.numOfGenes = $rootScope.meta.numbers.main.gene;
    });
