'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GeneCtrl
 * @description
 * # GeneCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('GeneCtrl', function (DTOptionsBuilder, DTColumnBuilder, $scope) {
    $scope.dt={};
    $scope.dt.dtOptions = DTOptionsBuilder.fromSource('resources/files/data.json')
      .withPaginationType('simple')
      .withBootstrap();
    $scope.dt.dtColumns = [
      DTColumnBuilder.newColumn('variant').withTitle('Variant'),
      DTColumnBuilder.newColumn('pmids').withTitle('PMIDs'),
      DTColumnBuilder.newColumn('hLevel').withTitle('Highest Level')
    ];
  });
