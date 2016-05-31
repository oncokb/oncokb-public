'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GeneCtrl
 * @description
 * # GeneCtrl
 * Controller of the oncokbStaticApp
 */

angular.module('oncokbStaticApp')
        .controller('GeneCtrl', function ($scope, $rootScope, $routeParams, $location, $route, api, $timeout, DTColumnDefBuilder) {

            //fetch the mutation mapper from api and construct the graph from mutation mapper library
            var mutationData = [], uniqueClinicVariants = [], uniqueAnnotatedVariants = [];

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
                        elWidth: $('.wrapper>.navbar>.container').width() - 20 //When initialize mutation mapper, gene html hasn't been loaded yet. Only navbar is available.
                    },
                    mutationSummary: false
                },
                render: {
                    mutationDetails: {
                        coreTemplate: "custom_mutation_details_template",
                        loaderImage: 'resources/images/loader.gif',
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

            //fetch portal alteration data for histogram and construct the histogram with plotly.js
            function fetchHistogramData() {
                api.getPortalAlterationSampleCount()
                        .then(function (totalCounts) {
                            api.getPortalAlterationSampleCount($scope.gene)
                                    .then(function (countsByGene) {
                                        $scope.altFreFlag = (countsByGene.data.length > 0 ? true : false);
                                        if ($scope.altFreFlag) {
                                            var studies = [], results = [], shortNames = [], frequencies = [], fullNames = [], hoverInfo = [], tempNames = [];
                                            for (var i = 0; i < countsByGene.data.length; i++) {
                                                for (var j = 0; j < totalCounts.data.length; j++) {
                                                    if (totalCounts.data[j][0] === countsByGene.data[i][0]) {
                                                        results.push({
                                                            study: countsByGene.data[i][0],
                                                            frequency: (100 * countsByGene.data[i][1] / totalCounts.data[j][1]).toFixed(1)
                                                        });
                                                        break;
                                                    }

                                                }


                                            }
                                            results.sort(function (a, b) {
                                                return b.frequency - a.frequency;
                                            });
                                            results.forEach(function (item) {
                                                studies.push(item.study);
                                                frequencies.push(item.frequency);
                                                hoverInfo.push(item.frequency + "% of the patients have " + $scope.gene + " mutation");
                                            });
                                            var tempIndex = 0, tempString = "", secondIndex = 0;
                                            api.getStudies(studies.join())
                                                    .then(function (studyInfo) {
                                                        studies.forEach(function (item) {
                                                            studyInfo.data.forEach(function (item1) {
                                                                if (item1.id === item) {
                                                                    shortNames.push(item1.short_name.substring(0, item1.short_name.length - 7));
                                                                    fullNames.push(item1.name);
                                                                    //insert new line symbol to label content based on study name length
                                                                   if(item1.name.length < 40) {
                                                                        tempNames.push(item1.name);
                                                                    } else if (item1.name.length < 60){
                                                                        tempIndex = item1.name.indexOf("(TCGA,");
                                                                        tempNames.push(item1.name.substring(0, tempIndex) + '<br>' + item1.name.substring(tempIndex));
                                                                    } else{
                                                                        tempIndex = item1.name.indexOf("(TCGA,");
                                                                        tempString = item1.name.substring(0, tempIndex).trim();
                                                                        secondIndex = tempString.lastIndexOf(" ");
                                                                        tempNames.push(item1.name.substring(0, secondIndex) + '<br>' + item1.name.substring(secondIndex));
                                                                    }
                                                                }
                                                            });
                                                        });

                                                        _.each(hoverInfo, function (item, index) {
                                                            hoverInfo[index] = item + "<br> in " + tempNames[index];
                                                        });

                                                        plots(studies, shortNames, fullNames, frequencies, hoverInfo);
                                                    });
                                        }


                                    });
                        });
            }

            function plots(studies, shortNames, fullNames, frequencies, hoverInfo) {
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
                    text: hoverInfo,
                    hoverinfo: 'text',
                    marker: {
                        color: colors

                    }
                };

                var data = [trace];

                var layout = {
                    // title: 'Tumor Types with ' + $scope.gene + ' Alterations',
                    yaxis: {
                        title: 'Mutation Frequency',
                        titlefont: {
                            size: 14
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
                            size: Math.max(Math.min(180 / maxLengthStudy.length, 15, 180 / shortNames.length), 6)
                        },
                        tickangle: 30,
                        fixedrange: true
                    },
                    height: 250,
                    width: $('.plot-container').width(),
                    margin: {
                        t: 30,
                    }
                };

                Plotly.newPlot('histogramDiv', data, layout, {displayModeBar: false});
                var myPlot = document.getElementById("histogramDiv");
                myPlot.on('plotly_click', function (eventData) {
                    resetFlag = false;
                    var tempIndex = shortNames.indexOf(eventData.points[0].x);
                    var tempValue = studies[tempIndex];
                    $scope.studyName = "for " + fullNames[tempIndex];
                    var newMutationData = [];
                    newMutationData = mutationData.filter(function (item) {
                        return item.cancerStudy == tempValue;
                    });

                    mutationMapperConstructor(newMutationData, true);
                    colors.fill('#1c75cd');
                    colors[tempIndex] = '#064885';
                    Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});

                    $(".mutation-details-filter-reset").click(function () {
                        //show all of the data again
                        colors.fill('#1c75cd');
                        Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});
                    });

                });

            }

            function mutationMapperConstructor(mutationData, updateFlag) {
                if (!updateFlag) {
                    //load the template when first load the page
                    $("#templateDiv").load("views/mutationMapperTemplates.html", function () {
                        $scope.studyName = "accross Cancer Types";
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
                if (type === "deselect" || type === "reset") {
                    if (_.isObject($scope.meta.clinicalTable) && $scope.meta.clinicalTable.DataTable) {
                        $scope.meta.clinicalTable.DataTable.column(0).search("").draw();
                    }
                    if (_.isObject($scope.meta.biologicalTable) && $scope.meta.biologicalTable.DataTable) {
                        $scope.meta.biologicalTable.DataTable.column(0).search("").draw();
                    }
                    resetFlag = false;
                    $scope.clinicalVariantsCount = uniqueClinicVariants.length;
                    $scope.annoatedVariantsCount = uniqueAnnotatedVariants.length;
                    $scope.studyName = "accross Cancer Types";
                } else {
                    proteinChanges = _.uniq(proteinChanges);
                    var regexString = "";
                    for (var i = 0; i < proteinChanges.length - 1; i++) {
                        regexString += proteinChanges[i] + "|";
                    }
                    regexString += proteinChanges[proteinChanges.length - 1];
                    if (_.isObject($scope.meta.clinicalTable) && $scope.meta.clinicalTable.DataTable) {
                        $scope.meta.clinicalTable.DataTable.column(0).search(regexString, true).draw();
                    }
                    if (_.isObject($scope.meta.biologicalTable) && $scope.meta.biologicalTable.DataTable) {
                        $scope.meta.biologicalTable.DataTable.column(0).search(regexString, true).draw();
                    }
                    var tempCount = 0;
                    var regexp = new RegExp(regexString, "i");
                    _.each(uniqueClinicVariants, function (item) {
                        if (regexp.test(item))
                            tempCount++;
                    });
                    $scope.clinicalVariantsCount = tempCount;

                    tempCount = 0;
                    _.each(uniqueAnnotatedVariants, function (item) {
                        if (regexp.test(item))
                            tempCount++;
                    });
                    $scope.annoatedVariantsCount = tempCount;
                }
                $scope.$apply();
            }

            $scope.gene = $routeParams.geneName;
            $scope.meta = {};
            $scope.meta.clinicalTable = {};
            $scope.meta.biologicalTable = {};
            $scope.status = {
                hasSummary: false,
                hasBackground: false,
                hasLevel: false,
                moreInfo: false,
                getClinicalEvidence: false,
                getBiologicalEvidence: false,
            };
            $scope.altFreFlag = true;
            $scope.mutationMapperFlag = true;
            $scope.view = {};
            $scope.view.levelColors = $rootScope.data.levelColors;
            $scope.view.clinicalTableOptions = {
              hasBootstrap: true,
              "aoColumns": [
                {"sType": "num-html"},
                null,
                null,
                {asSorting: ['asc', 'desc']},
                {
                  "sType": "num-html",
                  asSorting: ['desc', 'asc']
                }
              ],
              paging: false,
              scrollCollapse: true,
              scrollY: 500,
              sDom: "ft",
              aaSorting: [[3, 'asc'], [0, 'asc']]
            };
            $scope.view.biologicalTableOptions = {
                hasBootstrap: true,
                "aoColumns": [
                  {"sType": "num-html"},
                  {asSorting: ['desc', 'asc']},
                  null,
                  {"sType": "num-html",
                    asSorting: ['desc', 'asc']}
                ],
                paging: false,
                scrollCollapse: true,
                scrollY: 500,
                sDom: "ft",
                aaSorting: [ [1,'desc'], [0,'asc']]
            };
            $rootScope.view.subNavItems = [{content: $scope.gene}];

            api.getNumbers('gene', $routeParams.geneName)
                    .then(function (result) {
                        var content = result.data;
                        if (content) {
                            $scope.gene = content.data.gene.hugoSymbol;
                            $route.updateParams({geneName: $scope.gene});
                            var subNavItems = [{content: $scope.gene}];

                            if (content.data.highestLevel) {
                                $scope.meta.highestLevel = content.data.highestLevel.replace('LEVEL_', '');
                                $scope.status.hasLevel = true;
                            }

                            $rootScope.view.subNavItems = subNavItems;

                            fetchHistogramData();
                        } else {
                            console.log('no such gene existed ');
                            $location.path('/genes');
                        }
                    }, function (error) {
                        console.log('oppos error happened ', error);
                    });

            //clinical variants table and annotated variants table
            api.getClinicalVariantByGene($scope.gene)
                    .then(function (clinicalVariants) {
                        $scope.clinicalVariants = clinicalVariants.data.data;
                        uniqueClinicVariants = _.uniq(_.map($scope.clinicalVariants, function (item) {
                            return item.variant;
                        }));
                        $scope.clinicalVariantsCount = uniqueClinicVariants.length;
                    });

            api.getBiologicalVariantByGene($scope.gene)
                    .then(function (biologicalVariants) {
                        // var numofOncogenicVariants = 0;
                        //
                        // _.each(biologicalVariants.data.data, function (item) {
                        //     if (item.oncogenic) {
                        //         if (item.oncogenic.toLowerCase().indexOf('oncogenic') !== -1) {
                        //             numofOncogenicVariants++;
                        //         }
                        //     }
                        // });

                        $scope.annoatedVariants = biologicalVariants.data.data;
                        uniqueAnnotatedVariants = _.uniq(_.map($scope.annoatedVariants, function (item) {
                            return item.variant;
                        }));


                        if (uniqueAnnotatedVariants.length > 0) {
                          $rootScope.view.subNavItems = [
                            {content: $scope.gene},
                            {content: uniqueAnnotatedVariants.length + ' annotated variant' + (uniqueAnnotatedVariants.length > 1 ? 's' : '')}
                          ];
                        }

                        $scope.annoatedVariantsCount = uniqueAnnotatedVariants.length;
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

            api.getMutationMapperData($routeParams.geneName)
                    .then(function (mutationMapperInfo) {
                        $scope.mutationMapperFlag = mutationMapperInfo.data.length > 0 ? true : false;
                        if ($scope.mutationMapperFlag) {
                            var count = 1;
                            mutationMapperInfo.data.forEach(function (item) {
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
                    });

            $scope.displayOncogenic = function (item) {
                if (item === "Oncogenic")
                    return "Yes";
                else if (item === "Likely Oncogenic")
                    return "Likely";
                else
                    return item;
            }

            $scope.setColor = function (level) {
                if ($scope.view.levelColors.hasOwnProperty(level)) {
                    return {color: $scope.view.levelColors[level]};
                } else {
                    return {color: $scope.view.levelColors.other};
                }
            };

            $scope.tableClicked = function (type) {
                //Bootstrap fade in has 150ms transition time. DataTable only can gets width after the transition.
                console.log('clicked');
                $timeout(function () {
                    if (type === 'annotated' && $scope.meta.biologicalTable && $scope.meta.biologicalTable.DataTable) {
                        console.log('biologicalTable adjusted.');
                        $scope.meta.biologicalTable.DataTable.columns.adjust().draw();
                    } else if (type === 'clinical' && $scope.meta.clinicalTable && $scope.meta.clinicalTable.DataTable) {
                        console.log('clinical adjusted.');
                        $scope.meta.clinicalTable.DataTable.columns.adjust().draw();
                    }
                }, 160);
            };

        });

//apply datatable options here
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "num-html-pre": function (a) {
        var x = String(a).replace(/(?!^-)[^0-9.]/g, "");
        return parseFloat(x);
    },
    "num-html-asc": function (a, b) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "num-html-desc": function (a, b) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    }
});
