'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('HomeCtrl', function($scope, $location, $rootScope) {
    $scope.content = {hoveredGene: "gets", hoveredCount: ''};

    d3.csv('resources/files/all_genes_with_all_variants.csv', function(content) {
      var levelColors = {
        'LEVEL_1': '#008D14',
        'LEVEL_2A': '#019192',
        'LEVEL_2B': '#2A5E8E',
        'LEVEL_3A': '#794C87',
        'LEVEL_3B': '#9B7EB6',
        'LEVEL_4': 'black',
        //'LEVEL_R1': '#F40000',
        //'LEVEL_R2': '#C4006F',
        //'LEVEL_R3': '#6F08A3',
        'Other': 'grey'
      };

      var levelSize = {
        'LEVEL_1': 60,
        'LEVEL_2A': 50,
        'LEVEL_2B': 40,
        'LEVEL_3A': 35,
        'LEVEL_3B': 30,
        'LEVEL_4': 20,
        'Other': 15
      };

      var genes = {};

      $rootScope.subNavItems = ['427 Genes', '3000 Variants', '400 Tumor Types'];

      WordCloud(document.getElementById('wordCloud'), {
        list: content.map(function(d) {
          genes[d.gene] = d;
          return [d.gene, levelSize.hasOwnProperty(d.hLevel) ? (levelSize[d.hLevel] + Math.sqrt(d.altNum)) : levelSize['Other'], d.altNum, d.hLevel];
        }),
        fontFamily: 'Calibri',
        shape: 'circle',
        rotateRatio: 0,
        gridSize: '10',
        shuffle: false,
        color: function(word) {
          return levelColors.hasOwnProperty(genes[word].hLevel) ? levelColors[genes[word].hLevel] : levelColors['Other'];
        },
        hover: function(item, dimension, event) {
          var el = document.getElementById('canvas-hover');
          var hoverLabelElement = document.getElementById('canvas-hover-label');
          if (!item) {
            el.setAttribute('hidden', true);
            hoverLabelElement.setAttribute('hidden', true);
            return;
          }

          el.removeAttribute('hidden');
          el.style.left = dimension.x + 'px';
          el.style.top = dimension.y + 'px';
          el.style.width = dimension.w + 4 + 'px';
          el.style.height = dimension.h + 4 + 'px';


          hoverLabelElement.removeAttribute('hidden');
          $scope.content.hoveredGene = item[0];
          $scope.content.hoveredCount = item[2];
          $scope.content.hoveredHighestLevel = item[3].replace('LEVEL_','');
          $scope.$apply();
        },
        click: function() {
          $location.path('/gene');
        }
      });
    });
  });
