'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GenesCtrl
 * @description
 * # GenesCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('GenesCtrl', function($scope, $rootScope, $location, _, api, DTOptionsBuilder, DTColumnDefBuilder) {
    $scope.meta = {};

    $scope.clickGene = function(gene) {
      $location.path('/gene/' + gene);
    };

    //DataTable initialization & options
    $scope.dt = {};
    $scope.dt.dtOptions = {
      paging: false,
      hasBootstrap: true,
      language: {
        loadingRecords: '<img src="resources/images/loader.gif">'
      },
      scrollY: 500
    };
    $scope.dt.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0),
      DTColumnDefBuilder.newColumnDef(1),
      DTColumnDefBuilder.newColumnDef(2)
    ];

    api.getNumbers('genes')
      .then(function(content) {
        if (content && content.data && _.isArray(content.data.data)) {
          $scope.meta.genes = _.map(content.data.data, function(item, index) {
            var _hLevel = _.isString(item.highestLevel) ? (item.highestLevel.replace('LEVEL_', '')).replace('NULL', '') : undefined;
            return {gene: item.gene.hugoSymbol, level: _hLevel, altNum: item.alteration};
          });
        } else {
          $scope.meta.genes = [];
        }
      }, function(error) {
        $scope.meta.genes = [];
      });
  });
