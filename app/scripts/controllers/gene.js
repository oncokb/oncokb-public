'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GeneCtrl
 * @description
 * # GeneCtrl
 * Controller of the oncokbStaticApp
 */

angular.module('oncokbStaticApp')
        .controller('GeneCtrl', function ($scope, $rootScope, $routeParams, $location, $route, api) {
            $scope.gene = $routeParams.geneName;
            api.getNumbers('gene', $routeParams.geneName)
                    .then(function (result) {
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
                    }, function (error) {
                        console.log('oppos error happened ', error);
                    });




            $scope.meta = {};
            $scope.status = {
                hasSummary: false,
                hasBackground: false,
                hasLevel: false,
                moreInfo: false
            };
            $rootScope.view.subNavItems = [{content: $scope.gene}];

            //clinical variants table and annotated variants table
            api.getClinicalVariantByGene($scope.gene)
                    .then(function (clinicalVariants) {
                        $scope.clinicalVariants = clinicalVariants.data.data;
                    });

            api.getBiologicalVariantByGene($scope.gene)
                    .then(function (biologicalVariants) {
                        $scope.annoatedVariants = biologicalVariants.data.data;
                    });



            api.getGeneSummary($scope.gene)
                    .then(function (result) {
                        var content = result.data;
                        $scope.meta.geneSummary = content.data.length > 0 ? content.data[0].description : '';
                        $scope.status.hasSummary = true;
                    }, function (result) {
                        $scope.meta.geneSummary = '';
                    });


            api.getGeneBackground($scope.gene)
                    .then(function (result) {
                        var content = result.data;
                        if (content.data.length > 0) {
                            $scope.meta.geneBackground = content.data[0].description;
                            $scope.status.hasBackground = true;
                        } else {
                            $scope.meta.geneBackground = '';
                        }
                    }, function (result) {
                        $scope.meta.geneBackground = '';
                    });


            //filter the tables by chosen data in mutation mapper
            //use flag to tell if any need to filter the table or not
            $scope.flag = true;
            $scope.altFreFlag = true;
            $scope.mutationMapperFlag = true;
            $scope.alterationNames = [];
            $scope.synchronizeData = function () {

                return function (x) {
                    if ($scope.flag)
                        return true;
                    else {
                        return ($scope.alterationNames.indexOf(x.variant) !== -1);
                    }
                }
            };


            $scope.view = {};
            $scope.view.levelColors = $rootScope.data.levelColors;

            $scope.setColor = function (level) {
                if ($scope.view.levelColors.hasOwnProperty(level)) {
                    return {color: $scope.view.levelColors[level]};
                } else {
                    return {color: $scope.view.levelColors.other};
                }
            };


            //fetch portal alteration data for histogram and construct the histogram with plotly.js
            function fetchHistogramData() {
                api.getPortalAlterationSampleCount()
                        .then(function (totalCounts) {
                            api.getPortalAlterationSampleCount($scope.gene)
                                    .then(function (countsByGene) {
                                        $scope.altFreFlag = (countsByGene.data.length > 0 ? true : false);
                                        var studies = [], results = [], shortNames = [], frequencies = [], fullNames = [];
                                        for (var i = 0; i < countsByGene.data.length; i++) {
//                                            if(i < 2){
                                            for (var j = 0; j < totalCounts.data.length; j++)
                                            {
                                                if (totalCounts.data[j][0] === countsByGene.data[i][0])
                                                {
                                                    results.push({study: countsByGene.data[i][0], frequency: (100 * countsByGene.data[i][1] / totalCounts.data[j][1]).toFixed(1)});
                                                    break;
                                                }

                                            }
//                                            }


                                        }
                                        results.sort(function (a, b) {
                                            return b.frequency - a.frequency;
                                        });
                                        results.forEach(function (item) {
                                            studies.push(item.study);
                                            frequencies.push(item.frequency);
                                        });
                                        api.getStudies(studies.join())
                                                .then(function (studyInfo) {
                                                    studies.forEach(function (item) {
                                                        studyInfo.data.forEach(function (item1) {
                                                            if (item1.id === item) {
                                                                shortNames.push(item1.short_name.substring(0, item1.short_name.length - 7));
                                                                fullNames.push(item1.name);
                                                            }
                                                        });
                                                    });

                                                    plots(studies, shortNames, fullNames, frequencies);
                                                });

                                    });
                        });
            }
            function plots(studies, shortNames, fullNames, frequencies) {
                //get the max length of the study short name
                var maxLengthStudy = "", colors = [];
                for (var i = 0; i < shortNames.length; i++)
                {
                    colors.push('#1c75cd');
                    if (shortNames[i].length > maxLengthStudy.length)
                        maxLengthStudy = shortNames[i];
                }
                var histogramWidth = 500;
                if (frequencies.length < 5)
                {
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

                Plotly.newPlot('histogramDiv', data, layout, {displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud', 'zoom2d', 'pan2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']});
                var myPlot = document.getElementById("histogramDiv");
                myPlot.on('plotly_click', function (eventData) {
                    var tempIndex = shortNames.indexOf(eventData.points[0].x);
                    var tempValue = studies[tempIndex];
                    var newMutationData = [];
                    newMutationData = mutationData.filter(function (item) {
                        return item.cancerStudy == tempValue;
                    });

                    mutationMapperConstructor(newMutationData, true);
                    colors.fill('#1c75cd');
                    colors[tempIndex] = '#064885';
                    Plotly.redraw('histogramDiv', data, layout, {displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud', 'zoom2d', 'pan2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']});

                    $(".mutation-details-filter-reset").click(function () {
                        //show all of the data again
                        colors.fill('#1c75cd');
                        Plotly.redraw('histogramDiv', data, layout, {displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud', 'zoom2d', 'pan2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']});
                    });

                });

            }
            fetchHistogramData();



            //fetch the mutation mapper from api and construct the graph from mutation mapper library
            var mutationData = [];
            api.getMutationMapperData($routeParams.geneName).then(function (mutationMapperInfo) {
                $scope.mutationMapperFlag = mutationMapperInfo.data.length > 0 ? true : false;
                var count = 1;
                mutationMapperInfo.data.forEach(function (item) {
                    mutationData.push({cancerStudy: item.cancerStudy, geneSymbol: item.gene.hugoSymbol, caseId: item.sampleId, proteinChange: item.proteinChange, mutationType: item.alterationType, proteinPosStart: item.proteinStart, proteinPosEnd: item.proteinEnd, mutationSid: "stalone_mut_" + count, mutationId: "stalone_mut_" + count});
                    count++;
                });
                mutationMapperConstructor(mutationData, false);
            });

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
                        init: function (mutationDetailsView) {
                            // hide loader image
                            mutationDetailsView.$el.find(".mutation-details-loader").hide();
                        },
                        format: function (mutationDetailsView) {
                            mutationDetailsView.dispatcher.trigger(
                                    MutationDetailsEvents.GENE_TABS_CREATED);
                        }
                    }
                }
            };
            var mutationMapper = null, mutationDiagram = null;
            var resetFlag = false;
            function mutationMapperConstructor(mutationData, updateFlag) {
                if (!updateFlag) {
                    //load the template when first load the page
                    $("#templateDiv").load("../../lib/mutation-mapper/mutationMapperTemplates.html", function () {
                        // init mutation mapper
                        mutationMapper = new MutationMapper(options);
                        mutationMapper.init();
                        //listen to init event and attach lollipop event once it's done
                        mutationMapper.getView().dispatcher.on(MutationDetailsEvents.MAIN_VIEW_INIT, function (mainMutationView) {
                            mainMutationView.dispatcher.on(MutationDetailsEvents.DIAGRAM_INIT, function (diagram) {
                                $(".mutation-details-uniprot-link").hide();
                                mutationDiagram = diagram;
                                //still need to work on the click mutation type panel event
                                mutationDiagram.dispatcher.on(MutationDetailsEvents.LOLLIPOP_SELECTED, function () {
                                    updateTable("select");
                                });
                                mutationDiagram.dispatcher.on(MutationDetailsEvents.LOLLIPOP_DESELECTED, function () {
                                    updateTable("deselect");
                                });

                                $(".mutation-details-filter-reset").click(function () {
                                    resetFlag = true;
                                });

                                mutationDiagram.dispatcher.on(MutationDetailsEvents.DIAGRAM_PLOT_UPDATED, function () {
                                    if (resetFlag)
                                        updateTable("reset");
                                    else
                                        updateTable("plotUpdate");
                                });



                            });

                        });

                    });
                } else
                {
                    //update lollipop from the chosen study in the histogram
                    mutationDiagram.updatePlot(PileupUtil.convertToPileups(new MutationCollection(mutationData)));
                }


            }
            //get the chosen mutation data from the lollipop and update the table
            function updateTable(type) {

                var proteinChanges = [];
                if (type === "plotUpdate")
                {
                    var pileUpValues = mutationDiagram.pileups;
                    var currentProteinChanges = PileupUtil.getPileupMutations(pileUpValues);
                    _.each(currentProteinChanges, function (ele) {
                        proteinChanges.push(ele.attributes.proteinChange);
                    });
                } else {
                    _.each(mutationDiagram.getSelectedElements(), function (ele) {

                        var mutations = ele.datum().mutations;
                        _.each(mutations, function (item) {
                            proteinChanges.push(item.attributes.proteinChange);
                        });

                    });

                }

                $scope.$apply(function () {
                    if (type === "deselect" || type === "reset")
                    {
                        $scope.flag = true;
                        resetFlag = false;
                    } else
                    {
                        $scope.flag = false;
                        $scope.alterationNames = _.uniq(proteinChanges);
                    }
                });
            }



        });
