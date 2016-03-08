'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('HomeCtrl', function ($scope, $location) {
    $scope.content = {hoveredGene: "gets", hoveredCount: ''};

    d3.csv('resources/files/all_genes_with_all_variants.csv', function (content) {
      var levelColors = {
        'LEVEL_1': '#006400',
        'LEVEL_2A': '#32CD32',
        'LEVEL_2B': '#98FB98',
        'LEVEL_3A': '#FFAA00',
        'LEVEL_3B': '#FF0000',
        'LEVEL_4': '#8B0000',
        //'LEVEL_R1': '#F40000',
        //'LEVEL_R2': '#C4006F',
        //'LEVEL_R3': '#6F08A3',
        'Other': '#000000'
      };

      var genes = {};

      WordCloud(document.getElementById('wordCloud'), {
        list: content.map(function (d) {
          genes[d.gene] = d;
          return [d.gene, Math.sqrt(d.altNum*3) * 4, d.altNum];
        }),
        fontFamily: 'Calibri',
        shape: 'circle',
        rotateRatio: 0,
        gridSize: '10',
        shuffle: false,
        color: function (word) {
          return levelColors.hasOwnProperty(genes[word].hLevel)?levelColors[genes[word].hLevel]:levelColors['Other'];
        },
        hover: function (item, dimension, event) {
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
          $scope.$apply();
        },
        click: function() {
          $location.path('/gene');
        }
      });
    });
  });
