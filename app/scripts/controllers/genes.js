'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GenesCtrl
 * @description
 * # GenesCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('GenesCtrl', function($scope, $rootScope, $location, _) {
    $scope.view = {};

    $scope.setColor = function(level) {
      if ($scope.view.levelColors.hasOwnProperty(level)) {
        return {color: $scope.view.levelColors[level]};
      } else {
        return {color: $scope.view.levelColors.other};
      }
    };

    $scope.clickGene = function(gene) {
      $location.path('/gene/' + gene);
    };

    d3.csv('resources/files/all_genes_with_all_variants.csv', function(content) {
      var priorityLevels = ['1', '2A', '2B', '3A', '3B', '4', 'R1', 'R2', 'R3'];
      var levels = {};
      var levelsContent = [];
      var genesWithLevels = [];

      _.each(content, function(item, index) {
        var _hLevel = _.isString(item.hLevel) ? item.hLevel.replace('LEVEL_', '') : undefined;

        if (_.isUndefined(levels[_hLevel])) {
          levels[_hLevel] = [];
        }
        levels[_hLevel].push(item.gene);
        genesWithLevels.push(item.gene);
      });
      _.each(priorityLevels, function(level) {
        if (!_.isUndefined(levels[level])) {
          levelsContent.push({
            level: level,
            data: levels[level]
          });
        }
      });
      var otherGenes = {level: 'Other', data: []};

      if (levels.hasOwnProperty('NULL')) {
        otherGenes.data = _.union(otherGenes.data, levels.NULL);
      }

      d3.csv('resources/files/all_genes_428.csv', function(_content) {
        var _genes = _.map(_content, function(m){if(m.gene)return m.gene});
        var _diff = _.difference(_genes, genesWithLevels)
        otherGenes.data = _.union(otherGenes.data, _diff);

        if (otherGenes.data.length > 0) {
          otherGenes.data.sort();
          levelsContent.push(otherGenes);
        }
        $scope.view.levels = levelsContent;
        $scope.view.levelColors = $rootScope.data.levelColors;
        $scope.$apply();
      });
    });
  });
