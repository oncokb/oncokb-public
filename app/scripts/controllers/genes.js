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
      scrollY: 500,
      aaSorting: [ [1,'desc'], [0,'asc'] ],
      aoColumnDefs: [{
        aTargets: 0
      }, {
        aTargets: 1,
        sType: 'level',
        asSorting: ['desc', 'asc']
      }, {
        aTargets: 2,
        asSorting: ['desc', 'asc']
      }
      ]
    };

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

jQuery.extend(jQuery.fn.dataTableExt.oSort, {
  "level-asc": function(a, b) {
    var levels = ['3B', '3A', '2B', '2A', '1'];
    var _a = levels.indexOf(a);
    var _b = levels.indexOf(b);
    if (_a === -1) {
      return 1;
    }
    if (_b === -1) {
      return -1;
    }
    return _a - _b;
  },
  "level-desc": function(a, b) {
    var levels = ['3B', '3A', '2B', '2A', '1'];
    var _a = levels.indexOf(a);
    var _b = levels.indexOf(b);
    if (_a === -1) {
      return 1;
    }
    if (_b === -1) {
      return -1;
    }
    return _b - _a;
  }
});
