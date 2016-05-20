'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GeneCtrl
 * @description
 * # GeneCtrl
 * Controller of the oncokbStaticApp
 */

angular.module('oncokbStaticApp')
  .controller('GeneCtrl', function($scope, $rootScope, $routeParams, $location, $route, api, $timeout, DTColumnDefBuilder) {

    //fetch the mutation mapper from api and construct the graph from mutation mapper library
    var mutationData = [];
    var clinicalTable, annotatedTable;

    // customized settings for main mapper
    var geneList = [$routeParams.geneName];
    var options = {
      el: "#mutation_details",
      data: {
        geneList: geneList
      },
      proxy: {
        mutationProxy: {
          options: {
            initMode: "full",
            data: mutationData
          }
        },
        pfamProxy: {
          options: {
            servletName: $(".url-pfam-service").val() ||
            "http://www.cbioportal.org/getPfamSequence.json",
            initMode: "lazy"
          }
        },
        pdbProxy: {
          options: {
            servletName: $(".url-pdb-service").val() ||
            "http://www.cbioportal.org/get3dPdb.json",
            initMode: "lazy"
          }
        },
        mutationAlignerProxy: {
          options: {
            servletName: $(".url-mutation-aligner-service").val() ||
            "http://www.cbioportal.org/getMutationAligner.json",
            initMode: "lazy"
          }
        }

      },
      view: {
        mutationTable: false,
        vis3d: false,
        mutationDiagram: {
          elWidth: 1100
        },
        mutationSummary: false
      },
      render: {
        mutationDetails: {
          coreTemplate: "custom_mutation_details_template",
          init: function(mutationDetailsView) {
            // hide loader image
            mutationDetailsView.$el.find(".mutation-details-loader").hide();
          },
          format: function(mutationDetailsView) {
            mutationDetailsView.dispatcher.trigger(
              MutationDetailsEvents.GENE_TABS_CREATED);
          }
        }
      }
    };
    var mutationMapper = null, mutationDiagram = null;
    var resetFlag = false;

    //fetch portal alteration data for histogram and construct the histogram with plotly.js
    function fetchHistogramData() {
      api.getPortalAlterationSampleCount()
        .then(function(totalCounts) {
          api.getPortalAlterationSampleCount($scope.gene)
            .then(function(countsByGene) {
              $scope.altFreFlag = (countsByGene.data.length > 0 ? true : false);
              if ($scope.altFreFlag) {
                var studies = [], results = [], shortNames = [], frequencies = [], fullNames = [];
                for (var i = 0; i < countsByGene.data.length; i++) {
//                                            if(i < 2){
                  for (var j = 0; j < totalCounts.data.length; j++) {
                    if (totalCounts.data[j][0] === countsByGene.data[i][0]) {
                      results.push({
                        study: countsByGene.data[i][0],
                        frequency: (100 * countsByGene.data[i][1] / totalCounts.data[j][1]).toFixed(1)
                      });
                      break;
                    }

                  }
//                                            }


                }
                results.sort(function(a, b) {
                  return b.frequency - a.frequency;
                });
                results.forEach(function(item) {
                  studies.push(item.study);
                  frequencies.push(item.frequency);
                });
                api.getStudies(studies.join())
                  .then(function(studyInfo) {
                    studies.forEach(function(item) {
                      studyInfo.data.forEach(function(item1) {
                        if (item1.id === item) {
                          shortNames.push(item1.short_name.substring(0, item1.short_name.length - 7));
                          fullNames.push(item1.name);
                        }
                      });
                    });

                    plots(studies, shortNames, fullNames, frequencies);
                  });
              }


            });
        });
    }

    function plots(studies, shortNames, fullNames, frequencies) {
      //get the max length of the study short name
      var maxLengthStudy = "", colors = [];
      for (var i = 0; i < shortNames.length; i++) {
        colors.push('#1c75cd');
        if (shortNames[i].length > maxLengthStudy.length)
          maxLengthStudy = shortNames[i];
      }
      var histogramWidth = 500;
      if (frequencies.length < 5) {
        histogramWidth = 150 + 50 * frequencies.length;
      } else if (frequencies.length < 10) {
        histogramWidth = 100 + 50 * frequencies.length;
      }


      var trace = {
        x: shortNames,
        y: frequencies,
        type: 'bar',
        text: fullNames,
        marker: {
          color: colors
        }
      };

      var data = [trace];

      var layout = {
        yaxis: {
          title: 'Alteration Frequency',
          titlefont: {
            size: 16
          },
          tickfont: {
            size: 12
          },
          tickmode: 'array',
          ticksuffix: "%",
          fixedrange: true
        },
        xaxis: {
          tickfont: {
            size: Math.min(180 / maxLengthStudy.length, 15)
          },
          tickangle: 30,
          fixedrange: true
        },
        height: 300,
        width: histogramWidth
      };

      Plotly.newPlot('histogramDiv', data, layout, {displayModeBar: false});
      var myPlot = document.getElementById("histogramDiv");
      myPlot.on('plotly_click', function(eventData) {
        resetFlag = false;
        var tempIndex = shortNames.indexOf(eventData.points[0].x);
        var tempValue = studies[tempIndex];
        var newMutationData = [];
        newMutationData = mutationData.filter(function(item) {
          return item.cancerStudy == tempValue;
        });

        mutationMapperConstructor(newMutationData, true);
        colors.fill('#1c75cd');
        colors[tempIndex] = '#064885';
        Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});

        $(".mutation-details-filter-reset").click(function() {
          //show all of the data again
          colors.fill('#1c75cd');
          Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});
        });

      });

    }

    function mutationMapperConstructor(mutationData, updateFlag) {
      if (!updateFlag) {
        //load the template when first load the page
        $("#templateDiv").load("views/mutationMapperTemplates.html", function() {
          // init mutation mapper
          mutationMapper = new MutationMapper(options);
          mutationMapper.init();
          //listen to init event and attach lollipop event once it's done
          mutationMapper.getView().dispatcher.on(MutationDetailsEvents.MAIN_VIEW_INIT, function(mainMutationView) {
            mainMutationView.dispatcher.on(MutationDetailsEvents.DIAGRAM_INIT, function(diagram) {
              $(".mutation-details-uniprot-link").hide();
              mutationDiagram = diagram;
              //still need to work on the click mutation type panel event
              mutationDiagram.dispatcher.on(MutationDetailsEvents.LOLLIPOP_SELECTED, function() {
                updateTable("select");
              });
              mutationDiagram.dispatcher.on(MutationDetailsEvents.LOLLIPOP_DESELECTED, function() {
                updateTable("deselect");
              });

              $(".mutation-details-filter-reset").click(function() {
                resetFlag = true;
              });

              mutationDiagram.dispatcher.on(MutationDetailsEvents.DIAGRAM_PLOT_UPDATED, function() {
                if (resetFlag)
                  updateTable("reset");
                else
                  updateTable("plotUpdate");
              });

            });


          });

        });
      } else {
        //update lollipop from the chosen study in the histogram
        mutationDiagram.updatePlot(PileupUtil.convertToPileups(new MutationCollection(mutationData)));
      }


    }

    //get the chosen mutation data from the lollipop and update the table
    function updateTable(type) {

      var proteinChanges = [];
      if (type === "plotUpdate") {
        var pileUpValues = mutationDiagram.pileups;
        var currentProteinChanges = PileupUtil.getPileupMutations(pileUpValues);
        _.each(currentProteinChanges, function(ele) {
          proteinChanges.push(ele.attributes.proteinChange);
        });
      } else {
        _.each(mutationDiagram.getSelectedElements(), function(ele) {

          var mutations = ele.datum().mutations;
          _.each(mutations, function(item) {
            proteinChanges.push(item.attributes.proteinChange);
          });

        });
      }
      if (type === "deselect" || type === "reset") {
        clinicalTable.column(0).search("")
          .draw();
        annotatedTable.column(0).search("")
          .draw();
        resetFlag = false;
      } else {
        proteinChanges = _.uniq(proteinChanges);
        var regexString = "";
        for (var i = 0; i < proteinChanges.length - 1; i++) {
          regexString += proteinChanges[i] + "|";
        }
        regexString += proteinChanges[proteinChanges.length - 1];
        clinicalTable.column(0).search(regexString, true)
          .draw();
        annotatedTable.column(0).search(regexString, true)
          .draw();

      }

    }

    $scope.gene = $routeParams.geneName;
    $scope.meta = {};
    $scope.status = {
      hasSummary: false,
      hasBackground: false,
      hasLevel: false,
      moreInfo: false
    };
    $scope.altFreFlag = true;
    $scope.mutationMapperFlag = true;
    $scope.view = {};
    $scope.view.levelColors = $rootScope.data.levelColors;

    $rootScope.view.subNavItems = [{content: $scope.gene}];

    api.getNumbers('gene', $routeParams.geneName)
      .then(function(result) {
        var content = result.data;
        if (content) {
          $scope.gene = content.data.gene.hugoSymbol;
          $route.updateParams({geneName: $scope.gene});
          var subNavItems = [{content: $scope.gene}];
          if (content.data.alteration) {
            subNavItems.push({content: content.data.alteration + ' Variants'});
          }

          if (content.data.tumorType) {
            subNavItems.push({content: content.data.tumorType + ' Tumor Types'});
          }

          if (content.data.highestLevel) {
            $scope.meta.highestLevel = content.data.highestLevel.replace('LEVEL_', '');
            $scope.status.hasLevel = true;
          }

          $rootScope.view.subNavItems = subNavItems;
        } else {
          console.log('no such gene existed ');
          $location.path('/genes');
        }
      }, function(error) {
        console.log('oppos error happened ', error);
      });

    //clinical variants table and annotated variants table
    api.getClinicalVariantByGene($scope.gene)
      .then(function(clinicalVariants) {
        $scope.clinicalVariants = clinicalVariants.data.data;
      });

    api.getBiologicalVariantByGene($scope.gene)
      .then(function(biologicalVariants) {
        $scope.annoatedVariants = biologicalVariants.data.data;
      });

    api.getGeneSummary($scope.gene)
      .then(function(result) {
        var content = result.data;
        $scope.meta.geneSummary = content.data.length > 0 ? content.data[0].description : '';
        $scope.status.hasSummary = true;
      }, function(result) {
        $scope.meta.geneSummary = '';
      });

    api.getGeneBackground($scope.gene)
      .then(function(result) {
        var content = result.data;
        if (content.data.length > 0) {
          $scope.meta.geneBackground = content.data[0].description;
          $scope.status.hasBackground = true;
        } else {
          $scope.meta.geneBackground = '';
        }
      }, function(result) {
        $scope.meta.geneBackground = '';
      });

    api.getMutationMapperData($routeParams.geneName)
      .then(function(mutationMapperInfo) {
        $scope.mutationMapperFlag = mutationMapperInfo.data.length > 0 ? true : false;
        if ($scope.mutationMapperFlag) {
          var count = 1;
          mutationMapperInfo.data.forEach(function(item) {
            mutationData.push({
              cancerStudy: item.cancerStudy,
              geneSymbol: item.gene.hugoSymbol,
              caseId: item.sampleId,
              proteinChange: item.proteinChange,
              mutationType: item.alterationType,
              proteinPosStart: item.proteinStart,
              proteinPosEnd: item.proteinEnd,
              mutationSid: "stalone_mut_" + count,
              mutationId: "stalone_mut_" + count
            });
            count++;
          });
          mutationMapperConstructor(mutationData, false);
        }

        //apply datatable options here
        jQuery.extend(jQuery.fn.dataTableExt.oSort, {
          "num-html-pre": function(a) {
            var x = String(a).replace(/(?!^-)[^0-9.]/g, "");
            return parseFloat(x);
          },
          "num-html-asc": function(a, b) {
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
          },
          "num-html-desc": function(a, b) {
            return ((a < b) ? 1 : ((a > b) ? -1 : 0));
          }
        });
        clinicalTable = $('#clinicalTable').DataTable({
          hasBootstrap: true,
          "aoColumns": [{"sType": "num-html"}, null, null, null,
            {"sType": "num-html"}
          ],
          paging: false,
          scrollY: 300,
          sDom: "ft"
        });

        annotatedTable = $('#annotatedTable').DataTable({
          hasBootstrap: true,
          "aoColumns": [{"sType": "num-html"}, null, null,
            {"sType": "num-html"}
          ],
          paging: false,
          scrollY: 300,
          sDom: "ft"
        });

      });

    $scope.displayOncogenic = function(item) {
      if (item === "Oncogenic")
        return "Yes";
      else if (item === "Likely Oncogenic")
        return "Likely";
      else
        return item;
    }

    $scope.setColor = function(level) {
      if ($scope.view.levelColors.hasOwnProperty(level)) {
        return {color: $scope.view.levelColors[level]};
      } else {
        return {color: $scope.view.levelColors.other};
      }
    };

    $scope.tableClicked = function(type) {
      //Bootstrap fade in has 150ms transition time. DataTable only can gets width after the transition.
      console.log('clicked');
      $timeout(function() {
        if (type === 'annotated') {
          console.log('annotatedTable adjusted.');
          annotatedTable.columns.adjust().draw();
        } else if (type === 'clinical') {
          console.log('clinical adjusted.');
          clinicalTable.columns.adjust().draw();
        }
      }, 160);
    };

    fetchHistogramData();
  });
