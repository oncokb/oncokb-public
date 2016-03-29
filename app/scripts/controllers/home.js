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
      var levelColors = $rootScope.data.levelColors;

      var levelSize = {
        '1': 60,
        '2A': 50,
        '2B': 40,
        '3A': 35,
        '3B': 30,
        '4': 20,
        'Other': 15
      };

      var genes = {};

      $rootScope.view.subNavItems = [{
        content: '427 Genes',
        link: '#/genes'
      }, {content: '3800 Variants'}, {content: '333 Tumor Types'}];

      WordCloud(document.getElementById('wordCloud'), {
        list: content.map(function(d) {
          d.hLevel = d.hLevel.replace('LEVEL_', '');
          d.hLevel = d.hLevel.replace('NULL', '');
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
          $scope.content.hoveredHighestLevel = item[3];
          $scope.$apply();
        },
        click: function(item) {
          $location.path('/gene/' + item[0]);
        }
      });
    });
  });
