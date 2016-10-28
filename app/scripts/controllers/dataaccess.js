'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:DataaccessCtrl
 * @description
 * # DataaccessCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('DataaccessCtrl', function ($scope, apiLink) {
    $scope.apiLink = apiLink;
    $scope.swaggerUrl = apiLink + 'v2/api-docs';
  });
