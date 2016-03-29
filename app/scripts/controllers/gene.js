'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GeneCtrl
 * @description
 * # GeneCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('GeneCtrl', function (DTOptionsBuilder, DTColumnBuilder, $scope, $rootScope) {
    $scope.dt={};
    $scope.dt.dtOptions = DTOptionsBuilder.fromSource('resources/files/data.json')
      .withPaginationType('simple')
      .withBootstrap();
    $scope.dt.dtColumns = [
      DTColumnBuilder.newColumn('variant').withTitle('Variant'),
      DTColumnBuilder.newColumn('oncogenic').withTitle('Oncogenic'),
      DTColumnBuilder.newColumn('pmids').withTitle('Evidence'),
      DTColumnBuilder.newColumn('hLevel').withTitle('Highest Level')
    ];
    $rootScope.view.subNavItems = [{content: 'BRAF'}, {content: '170 Variants'}, {content: '50 Tumor Types'}, {content: 'Level One'}];
  });
