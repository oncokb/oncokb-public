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

    d3.csv('resources/files/all_genes_with_variants.csv', function (content) {
      WordCloud(document.getElementById('wordCloud'), {
        list: content.map(function (d) {
          return [d.gene, Math.sqrt(d.alt*2) * 5, d.alt];
        }),
        fontFamily: 'tunga',
        shape: 'Ariel',
        rotateRatio: 0,
        gridSize: '14',
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
