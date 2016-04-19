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
    $scope.dt = {};
    $scope.dt.dtOptions = DTOptionsBuilder.fromSource('resources/files/data.json')
      .withPaginationType('simple')
      .withBootstrap()
      .withOption('fnDrawCallback', function (a,b,c) {
        var cell = $(a.oInstance).find('.hasQtip[data-qtip!=""]');
        var pmids = cell.attr('data-qtip');
        cell.qtip({
          show: {event: "mouseover"},
          hide: {fixed: true, delay: 500, event: "mouseout"},
          content: pmids,
          style: {classes: 'qtip-light qtip-rounded qtip-wide'},
          position: {
            my: 'bottom center',
            at: 'top center',
            viewport: $(window)
          }
        })
      });
    $scope.dt.dtColumns = [
      DTColumnBuilder.newColumn('alteration').withTitle('Variant'),
      DTColumnBuilder.newColumn('oncogenic').withTitle('Oncogenic'),
      DTColumnBuilder.newColumn('tumorType').withTitle('Cancer Type').renderWith(function (data, type, full) {
        return toTitleCase(data);
      }),
      DTColumnBuilder.newColumn('level').withTitle('Level'),
      DTColumnBuilder.newColumn('drugs').withTitle('Drugs').renderWith(function (data, type, full) {
        if (full.pmids) {
          return '<div class="hasQtip" data-qtip="' + full.pmids + '">' + data + '</div>';
        } else {
          return data;
        }
      }),
      DTColumnBuilder.newColumn('pmids').withTitle('Evidence').notVisible()
    ];
    $scope.view = {};
    $scope.view.levelColors = $rootScope.data.levelColors;
    $rootScope.view.subNavItems = [{content: 'BRAF'}, {content: '170 Variants'}, {content: '50 Tumor Types'}];

    $scope.setColor = function (level) {
      if ($scope.view.levelColors.hasOwnProperty(level)) {
        return {color: $scope.view.levelColors[level]};
      } else {
        return {color: $scope.view.levelColors.other};
      }
    };

    function toTitleCase(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  });
