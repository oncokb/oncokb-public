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
    $scope.view = {};
    $scope.view.levelColors = $rootScope.data.levelColors;
    $rootScope.view.subNavItems = [{content: 'BRAF'}, {content: '170 Variants'}, {content: '50 Tumor Types'}];

    $scope.setColor = function(level) {
      if ($scope.view.levelColors.hasOwnProperty(level)) {
        return {color: $scope.view.levelColors[level]};
      } else {
        return {color: $scope.view.levelColors.other};
      }
    };
  });
