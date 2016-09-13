/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('oncokbStaticApp')
  .controller('actionableGenesCtrl', function($scope, $location,
                                              DTColumnDefBuilder,
                                              _,
                                              api) {

    $scope.data = {
      levels: {
        one: {
          treatments: [],
          numOfGenes: 0,
          numOfVariants: 0
        },
        two: {
          treatments: [],
          numOfGenes: 0,
          numOfVariants: 0
        },
        three: {
          treatments: [],
          numOfGenes: 0,
          numOfVariants: 0
        },
      }
    }
    $scope.status = {
      loading: {
        level: {
          one: false,
          two: false,
          three: false
        }
      }
    };

    $scope.biologicalDT = {};
    $scope.biologicalDT.dtOptions = {
      paging: false,
      scrollY: 481,
      scrollCollapse: true,
      hasBootstrap: true,
      columnDefs: [
        {responsivePriority: 1, targets: 0, "width": "10%"},
        {responsivePriority: 2, targets: 1, "width": "40%"},
        {responsivePriority: 3, targets: 2, "width": "30%"},
        {responsivePriority: 4, targets: 3, "width": "20%"}
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.childRowImmediate,
          type: '',
          renderer: function(api, rowIdx, columns) {
            var data = $.map(columns, function(col, i) {
              return col.hidden ?
              '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
              '<td>' + col.title + ':' + '</td> ' +
              '<td>' + col.data + '</td>' +
              '</tr>' :
                '';
            }).join('');

            return data ?
              $('<table/>').append(data) :
              false;

          }
        }
      }
    };
    $scope.biologicalDT.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0),
      DTColumnDefBuilder.newColumnDef(1),
      DTColumnDefBuilder.newColumnDef(2),
      DTColumnDefBuilder.newColumnDef(3)
    ];

    $scope.clickGene = function(gene) {
      $location.path('/gene/' + gene);
    };

    getTreatmentsMetadata();

    function getTreatmentsMetadata() {
      var levels = [{
        url: 'LEVEL_1',
        variable: 'one',
        loadingStatus: 'one'
      }, {
        url: 'LEVEL_2A',
        variable: 'two',
        loadingStatus: 'two'
      }, {
        url: 'LEVEL_3A',
        variable: 'three',
        loadingStatus: 'three'
      }];
      _.each(levels, function(level) {
        $scope.status.loading.level[level.loadingStatus] = true;
        ajaxGetTreatments(level);
      })
    }

    function ajaxGetTreatments(level) {
      api.getTreatmentsBylevel(level.url)
        .then(function(result) {
          try {
            var treatments = getTreatments(result.data[0]);
            var genes = {};
            var variants = {};
            _.each(treatments, function(treatment) {
              if (treatment.gene) {
                genes[treatment.gene] = true;
              }
              if (_.isArray(treatment.alterations)) {
                _.each(treatment.alterations, function(alt) {
                  variants[alt] = true;
                });
              }
            });

            $scope.data.levels[level.variable] = {
              treatments: treatments,
              numOfGenes: Object.keys(genes).length,
              numOfVariants: Object.keys(variants).length
            };
            $scope.status.loading.level[level.loadingStatus] = false;
          } catch (error) {
            $scope.status.loading.level[level.loadingStatus] = false;
          }
        });
    }

    function getTreatments(metadata) {
      var treatments = [];
      if (_.isArray(metadata)) {
        _.each(metadata, function(item) {
          treatments.push({
            gene: item.gene.hugoSymbol || 'NA',
            variants: item.alterations.map(function(alt) {
              return alt.alteration;
            }).sort().join(', ') || 'NA',
            alterations: item.alterations.map(function(alt) {
              return alt.alteration;
            }).sort(),
            disease: item.oncoTreeType.subtype || item.oncoTreeType.cancerType || 'NA',
            drugs: item.treatments.map(function(treatment) {
              return treatment.drugs.map(function(drug) {
                return drug.drugName;
              }).sort().join('+');
            }).sort().join(', ')
          });
        })
      }
      return treatments;
    }
  });
























































































