'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GeneCtrl
 * @description
 * # GeneCtrl
 * Controller of the oncokbStaticApp
 */

angular.module('oncokbStaticApp')
        .controller('GeneCtrl', function ($scope, $rootScope, $routeParams, $location, $route, api, $timeout, DTColumnDefBuilder, utils) {

            //fetch the mutation mapper from api and construct the graph from mutation mapper library
            var mutationData = [], uniqueClinicVariants = [], uniqueAnnotatedVariants = [], fakeSamplesCount = [], tempIndex = -1, tempFakeIndex = -1;

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
                            initMode: "full"
                        }
                    }

                },
                view: {
                    mutationTable: false,
                    vis3d: false,
                    mutationDiagram: {
                        elWidth: $('.wrapper>.navbar>.container').width() - 20, //When initialize mutation mapper, gene html hasn't been loaded yet. Only navbar is available.
                        pileupConverter: function (mutations, location)
                        {
                            var pileup = PileupUtil.initPileup(mutations, location);
                            if (!singleStudyFlag) {
                                tempIndex = _.map(fakeSamplesCount, function (item) {
                                    return item.location;
                                }).indexOf(pileup.location);
                                if (tempIndex !== -1) {
                                    pileup.count = pileup.count - fakeSamplesCount[tempIndex].count;
                                }
                            }
                            return pileup;
                        }
                    },
                    mutationSummary: false,
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
            var resetFlag = false, previousChosenIndex = -1, singleStudyFlag = false, currentMax = $(".diagram-y-axis-limit-input").val();

            //fetch portal alteration data for histogram and construct the histogram with plotly.js
            function fetchHistogramData() {
                api.getPortalAlterationSampleCount()
                        .then(function (totalCounts) {
                            api.getPortalAlterationSampleCount($scope.gene.hugoSymbol)
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
                                                hoverInfo.push(item.frequency + "% of patients have annotated " + $scope.gene.hugoSymbol + " mutation");
                                            });

                                            api.getStudies(studies.join())
                                                    .then(function (studyInfo) {
                                                        studies.forEach(function (item) {
                                                            studyInfo.data.forEach(function (item1) {
                                                                if (item1.id === item) {
                                                                    shortNames.push(item1.short_name.substring(0, item1.short_name.indexOf("(") - 1));
                                                                    fullNames.push(item1.name);
                                                                }
                                                            });
                                                        });
                                                        if (fullNames.length > 3) {
                                                            _.each(hoverInfo, function (item, index) {
                                                                hoverInfo[index] = autoBreakLines(item + " in " + fullNames[index]);
                                                            });

                                                            plots(studies, shortNames, fullNames, frequencies, hoverInfo);
                                                        } else {
                                                            var infoList = '<br/><ul class="fa-ul">';
                                                            _.each(hoverInfo, function (item, index) {
                                                                infoList += '<li><i class="fa fa-circle iconSize"></i> ' + item + ' in ' + fullNames[index] + '</li>';
                                                            });
                                                            infoList += '</ul>';
                                                            $("#histogramDiv").append(infoList);
                                                        }

                                                    });
                                        } else {
                                            $scope.status.moreInfo = true;
                                        }


                                    });
                        });
            }
            function autoBreakLines(rawText) {
                //insert new line symbol to label content
                var words = rawText.split(" ");
                var finalString = "", currentLength = 0;
                for (var i = 0; i < words.length; i++) {
                    if (currentLength + words[i].length < 38) {
                        finalString += words[i] + " ";
                        currentLength += words[i].length + 1;
                    } else {
                        finalString = finalString.trim();
                        finalString += "<br>" + words[i] + " ";
                        currentLength = words[i].length + 1;
                    }

                }
                return finalString;
            }
            function plots(studies, shortNames, fullNames, frequencies, hoverInfo) {
                //get the max length of the study short name
                var maxLengthStudy = "", colors = [], boldedNames = [];

                for (var i = 0; i < shortNames.length; i++) {
                    colors.push('#1c75cd');
                    boldedNames.push(shortNames[i]);
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
                    x: boldedNames,
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
                        title: 'Mutation Frequency (%)',
                        titlefont: {
                            size: 14
                        },
                        tickfont: {
                            size: 12
                        },
                        tickmode: 'array',
                        fixedrange: true
                    },
                    xaxis: {
                        tickfont: {
                            size: Math.max(Math.min(260 / maxLengthStudy.length, 15, 180 / shortNames.length), 6)
                        },
                        tickangle: 30,
                        fixedrange: true
                    },
                    height: 250,
                    width: $('.plot-container').width(),
                    margin: {
                        t: 10,
                    }
                };

                Plotly.newPlot('histogramDiv', data, layout, {displayModeBar: false});
                var myPlot = document.getElementById("histogramDiv");
                myPlot.on('plotly_click', function (eventData) {
                    resetFlag = false;
                    singleStudyFlag = true;
                    var tempIndex = shortNames.indexOf(eventData.points[0].x);
                    if(previousChosenIndex === tempIndex){
                      $('.mutation-details-filter-reset').trigger('click');
                    }else{
                        previousChosenIndex = tempIndex;
                        var tempValue = studies[tempIndex];
                        $scope.studyName = "for " + fullNames[tempIndex];
                        var newMutationData = [];
                        newMutationData = mutationData.filter(function (item) {
                            return item.cancerStudy == tempValue;
                        });

                        mutationMapperConstructor(newMutationData, true);
                        colors.fill('#1c75cd');
                        colors[tempIndex] = '#064885';
                        for (var i = 0; i < shortNames.length; i++) {
                            boldedNames[i] = shortNames[i];
                        }

                        boldedNames[tempIndex] = "<b>" + boldedNames[tempIndex] + "</b>";
                        Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});

                        $(".mutation-details-filter-reset").click(function () {
                            //show all of the data again
                            colors.fill('#1c75cd');
                            singleStudyFlag = false;
                            for (var i = 0; i < shortNames.length; i++) {
                                boldedNames[i] = shortNames[i];
                            }
                            Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});
                        });
                    }
                });

            }

            function mutationMapperConstructor(mutationData, updateFlag) {
                if (!updateFlag) {
                    //load the template when first load the page
                    $("#templateDiv").load("views/mutationMapperTemplates.html", function () {
                        $scope.studyName = "across 20 Disease Specific Studies";
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
                                    previousChosenIndex = -1;
                                    resetFlag = true;
                                    singleStudyFlag = false;
                                });

                                mutationDiagram.dispatcher.on(MutationDetailsEvents.DIAGRAM_PLOT_UPDATED, function () {
                                    if (resetFlag)
                                        updateTable("reset");
                                    else if($(".diagram-y-axis-limit-input").val() !== currentMax){
                                        currentMax = $(".diagram-y-axis-limit-input").val();
                                    }else{
                                        updateTable("plotUpdate");
                                    }

                                });
                            });
                        });

                    });
                } else {
                    //update lollipop from the chosen study in the histogram
                    mutationDiagram.updatePlot((new MutationCollection(mutationData)));
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
                    $scope.studyName = "across 20 Disease Specific Studies";
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

            $scope.gene = {
              hugoSymbol: $routeParams.geneName
            };
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
                aoColumnDefs: [{
                  aTargets: 0,
                  sType: 'num-html',
                  asSorting: ['desc', 'asc']
                }, {
                  aTargets: 3,
                  sType: 'level-html',
                  asSorting: ['desc', 'asc']
                }, {
                  aTargets: 4,
                  sType: 'num-html',
                  asSorting: ['desc', 'asc']
                }
                ],
                columnDefs: [
                    {responsivePriority: 1, targets: 0},
                    {responsivePriority: 2, targets: 3}
                ],
                paging: false,
                scrollCollapse: true,
                scrollY: 500,
                sDom: "ft",
                aaSorting: [[3, 'desc'], [0, 'asc']],
                responsive: {
                    details: {
                        display: $.fn.dataTable.Responsive.display.childRowImmediate,
                        type: '',
                        renderer: function (api, rowIdx, columns) {
                            var data = $.map(columns, function (col, i) {
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
            $scope.view.biologicalTableOptions = {
                hasBootstrap: true,
                "aoColumns": [
                    {"sType": "num-html",  asSorting: ['asc', 'desc']},
                    {"sType": "oncogenic-html", asSorting: ['desc', 'asc']},
                    null,
                    {"sType": "num-html",
                        asSorting: ['asc', 'desc']}
                ],
                paging: false,
                scrollCollapse: true,
                scrollY: 500,
                sDom: "ft",
                aaSorting: [[1, 'desc'], [0, 'asc']],
                columnDefs: [
                    {responsivePriority: 1, targets: 0},
                    {responsivePriority: 2, targets: 1},
                    {responsivePriority: 3, targets: 2}
                ],
                responsive: {
                    details: {
                        display: $.fn.dataTable.Responsive.display.childRowImmediate,
                        type: '',
                        renderer: function (api, rowIdx, columns) {
                            var data = $.map(columns, function (col, i) {
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
            $rootScope.view.subNavItems = [{content: $scope.gene.hugoSymbol}];

            api.getNumbers('gene', $routeParams.geneName)
                    .then(function (result) {
                        var content = result.data;
                        if (content) {
                            $scope.gene = content.data.gene;
                            $route.updateParams({geneName: $scope.gene.hugoSymbol});
                            var subNavItems = [{content: $scope.gene.hugoSymbol}];

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
            api.getClinicalVariantByGene($scope.gene.hugoSymbol)
                    .then(function (clinicalVariants) {
                        $scope.clinicalVariants = clinicalVariants.data.data;
                        uniqueClinicVariants = _.uniq(_.map($scope.clinicalVariants, function (item) {
                            return item.variant.name;
                        }));
                        $scope.clinicalVariantsCount = uniqueClinicVariants.length;
                    });

            api.getBiologicalVariantByGene($scope.gene.hugoSymbol)
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
                            return item.variant.name;
                        }));

                        var allMissenseVariants = _.uniq(_.map($scope.annoatedVariants, function (item) {
                            return item.variant;
                        }));
                        if (uniqueAnnotatedVariants.length > 0) {
                            $rootScope.view.subNavItems = [
                                {content: $scope.gene.hugoSymbol},
                                {content: uniqueAnnotatedVariants.length + ' annotated variant' + (uniqueAnnotatedVariants.length > 1 ? 's' : '')}
                            ];
                        }
                        var mutationType = '';
                        if (allMissenseVariants.length > 0) {
                            _.each(allMissenseVariants, function (item, index) {
                                if (item !== undefined) {
                                    if(_.isNull(item.consequence)){
                                      mutationType = 'other';
                                    }else{
                                      switch(item.consequence.term){
                                        case 'inframe_insertion':
                                          mutationType = 'in_frame_ins';
                                          break;
                                        case 'inframe_deletion':
                                          mutationType = 'in_frame_del';
                                          break;
                                        case 'frameshift_variant':
                                          mutationType = 'frameshift';
                                          break;
                                        case 'splice_region_variant':
                                          mutationType = 'splice_site';
                                          break;
                                        case 'feature_truncation':
                                        case 'stop_gained':
                                        case 'stop_lost':
                                        case 'initiator_codon_variant':
                                          mutationType = 'truncating';
                                          break;
                                        case 'any':
                                        case 'synonymous_variant':
                                          mutationType = 'other';
                                          break;
                                        default:
                                          mutationType =  item.consequence.term;
                                      }
                                    }
                                    mutationData.push({
                                        cancerStudy: "fakeStudy",
                                        geneSymbol: $scope.gene.hugoSymbol,
                                        caseId: "fakeSample" + index,
                                        proteinChange: item.name,
                                        mutationType: mutationType,
                                        proteinPosStart: item.proteinStart,
                                        proteinPosEnd: item.proteinEnd,
                                        mutationSid: "fakeSigID" + index,
                                        mutationId: "fakeID" + index
                                    });
                                    tempFakeIndex = _.map(fakeSamplesCount, function (fakeItem) {
                                        return fakeItem.location;
                                    }).indexOf(item.proteinStart);
                                    if (tempFakeIndex === -1) {
                                        fakeSamplesCount.push({location: item.proteinStart, count: 1});
                                    } else {
                                        fakeSamplesCount[tempFakeIndex].count++;
                                    }

                                }

                            });
                        }
                        $scope.annoatedVariantsCount = uniqueAnnotatedVariants.length;
                    });

            api.getGeneSummary($scope.gene.hugoSymbol)
                    .then(function (result) {
                        var content = result.data;
                        $scope.meta.geneSummary = content.data.length > 0 ? utils.insertSourceLink(content.data[0].description) : '';
                        $scope.status.hasSummary = true;
                    }, function (result) {
                        $scope.meta.geneSummary = '';
                    });

            api.getGeneBackground($scope.gene.hugoSymbol)
                    .then(function (result) {
                        var content = result.data;
                        if (content.data.length > 0) {
                            $scope.meta.geneBackground = utils.insertSourceLink(content.data[0].description);
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
