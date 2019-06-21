'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:GeneCtrl
 * @description
 * # GeneCtrl
 * Controller of the oncokbStaticApp
 */

angular.module('oncokbStaticApp')
    .controller('GeneCtrl', function($scope, $rootScope, $routeParams, $location, $route, api, $timeout,
                                     DTColumnDefBuilder, utils, _, MutationDetailsEvents, PileupUtil,
                                     Plotly, MutationMapper, MutationCollection, $q, $window) {
        // fetch the mutation mapper from api and construct the graph from mutation mapper library
        var mutationData = [];
        var uniqueClinicAlterations = [];
        var uniqueAnnotatedAlterations = [];
        var fakeSamplesCount = [];
        var tempIndex = -1;
        var tempFakeIndex = -1;
        var mutationMapper = null;
        var mutationDiagram = null;
        var resetFlag = false;
        var previousChosenIndex = -1;
        var singleStudyFlag = false;
        var currentMax = $('.diagram-y-axis-limit-input').val();

        // customized settings for main mapper
        var geneList = [$routeParams.geneName];
        var options = {
            el: '#mutation_details',
            data: {
                geneList: geneList
            },
            proxy: {
                mutationProxy: {
                    options: {
                        initMode: 'full',
                        data: mutationData
                    }
                },
                pfamProxy: {
                    options: {
                        servletName: $('.url-pfam-service').val() ||
                        'https://www.cbioportal.org/getPfamSequence.json',
                        initMode: 'lazy'
                    }
                },
                pdbProxy: {
                    options: {
                        servletName: $('.url-pdb-service').val() ||
                        'https://www.cbioportal.org/get3dPdb.json',
                        initMode: 'lazy'
                    }
                },
                mutationAlignerProxy: {
                    options: {
                        servletName: $('.url-mutation-aligner-service').val() ||
                        'https://www.cbioportal.org/getMutationAligner.json',
                        initMode: 'full'
                    }
                }

            },
            view: {
                mutationTable: false,
                vis3d: false,
                mutationDiagram: {
                    elWidth: $('.wrapper>.navbar>.container').width() - 20, // When initialize mutation mapper, gene html hasn't been loaded yet. Only navbar is available.
                    pileupConverter: function(mutations, location) {
                        var pileup = PileupUtil.initPileup(mutations, location);
                        if (!singleStudyFlag && $scope.meta.inGenePage) {
                            tempIndex = _.map(fakeSamplesCount, function(item) {
                                return item.location;
                            }).indexOf(pileup.location);
                            if (tempIndex !== -1) {
                                pileup.count -= fakeSamplesCount[tempIndex].count;
                            }
                        }
                        return pileup;
                    }
                },
                mutationSummary: false,
            },
            render: {
                mutationDetails: {
                    coreTemplate: 'custom_mutation_details_template',
                    loaderImage: 'resources/images/loader.gif',
                    init: function(mutationDetailsView) {
                        // hide loader image
                        mutationDetailsView.$el.find('.mutation-details-loader').hide();
                    },
                    format: function(mutationDetailsView) {
                        mutationDetailsView.dispatcher.trigger(
                            MutationDetailsEvents.GENE_TABS_CREATED);
                    }
                }
            }
        };

        function fetchTableData() {
            // clinical alterations table and annotated alterations table
            var apiCallsForTable = [api.getClinicalAlterationByGene($scope.gene.hugoSymbol), api.getBiologicalAlterationByGene($scope.gene.hugoSymbol)];
            if ($scope.meta.inAlterationPage) {
                apiCallsForTable.push(api.searchAlteration($routeParams.geneName, $scope.alteration.name, 'oncotree', 'regular'));
            }
            $q.all(apiCallsForTable).then(function(result) {
                var clinicalAlterations = result[0];
                var biologicalAlterations = result[1];
                var tempAnnotatedAlterations = _.map(biologicalAlterations.data, function(item) {
                    item.abstracts = item.oncogenicAbstracts.concat(item.mutationEffectAbstracts);
                    item.pmids = item.oncogenicPmids.concat(item.mutationEffectPmids);
                    return item;
                });
                if ($scope.meta.inAlterationPage) {
                    var tempHighestLevel = '';
                    var levels = ['4', '3B', '3A', '2B', '2A', 'R1', '1'];
                    $scope.clinicalAlterations = _.filter(clinicalAlterations.data, function(item) {
                        if (!$scope.alteration.highestLevel && $scope.alteration.relevantAlterations.indexOf(item.variant.name.toUpperCase()) !== -1 && levels.indexOf(item.level) > levels.indexOf(tempHighestLevel)) {
                            tempHighestLevel = item.level;
                        }
                        return $scope.alteration.relevantAlterations.indexOf(item.variant.name.toUpperCase()) !== -1;
                    });
                    if (tempHighestLevel) {
                        $scope.alteration.highestLevel = '<span class="level-' + tempHighestLevel + '">Level ' + tempHighestLevel + '</span>';
                    }
                    $scope.annotatedAlterations = _.filter(tempAnnotatedAlterations, function(item) {
                        if (stringMatch(item.variant.name, $scope.alteration.name) || stringMatch(item.variant.alteration, $scope.alteration.name)) {
                            $scope.alteration.mutationEffect = item.mutationEffect;
                            $scope.alteration.pmids = item.pmids;
                        }
                        return $scope.alteration.relevantAlterations.indexOf(item.variant.name.toUpperCase()) !== -1;
                    });
                    if (!$scope.alteration.mutationEffect) {
                        // handle this in the future
                    }
                    if (result[2] && result[2].data) {
                        if (!$scope.meta.isOtherBiomarkers) {
                            $scope.alteration.mutationSummary = result[2].data.variantSummary;
                        }
                        $scope.alteration.oncogenic = result[2].data.oncogenic;
                    }
                } else {
                    $scope.clinicalAlterations = clinicalAlterations.data;
                    $scope.annotatedAlterations = tempAnnotatedAlterations;
                }

                uniqueClinicAlterations = _.uniq(_.map($scope.clinicalAlterations, function(item) {
                    return item.variant.name;
                }));
                $scope.clinicalAlterationsCount = uniqueClinicAlterations.length;

                uniqueAnnotatedAlterations = _.uniq(_.map($scope.annotatedAlterations, function(item) {
                    return item.variant.name;
                }));

                var allMissenseAlterations = _.uniq(_.map($scope.annotatedAlterations, function(item) {
                    return item.variant;
                }));
                if ($scope.meta.inGenePage && uniqueAnnotatedAlterations.length > 0) {
                    $rootScope.view.subNavItems = [
                        {content: $scope.gene.hugoSymbol},
                        {content: uniqueAnnotatedAlterations.length + ' annotated alteration' + (uniqueAnnotatedAlterations.length > 1 ? 's' : '')}
                    ];
                } else if ($scope.meta.inAlterationPage) {
                    $rootScope.view.subNavItems = [
                        {content: $scope.gene.hugoSymbol, link: 'gene/' + $scope.gene.hugoSymbol},
                        {content: $scope.alteration.name}
                    ];
                }
                var mutationType = '';
                if (allMissenseAlterations.length > 0 && $scope.meta.inGenePage) {
                    _.each(allMissenseAlterations, function(item, index) {
                        if (item !== undefined && !(/fusion/i).test(item.alteration)) {
                            if (_.isNull(item.consequence)) {
                                mutationType = 'other';
                            } else {
                                switch (item.consequence.term) {
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
                                    mutationType = item.consequence.term;
                                }
                            }
                            mutationData.push({
                                cancerStudy: 'fakeStudy',
                                geneSymbol: $scope.gene.hugoSymbol,
                                caseId: 'fakeSample' + index,
                                proteinChange: item.name,
                                mutationType: mutationType,
                                proteinPosStart: item.proteinStart,
                                proteinPosEnd: item.proteinEnd,
                                mutationSid: 'fakeSigID' + index,
                                mutationId: 'fakeID' + index
                            });
                            tempFakeIndex = _.map(fakeSamplesCount, function(fakeItem) {
                                return fakeItem.location;
                            }).indexOf(item.proteinStart);
                            if (tempFakeIndex === -1) {
                                fakeSamplesCount.push({
                                    location: item.proteinStart,
                                    count: 1
                                });
                            } else {
                                fakeSamplesCount[tempFakeIndex].count++;
                            }
                        }
                    });
                }
                $scope.annotatedAlterationsCount = uniqueAnnotatedAlterations.length;
            });
        }

        // fetch, filter and restructure histogram and mutation mapper related data
        function fetchData() {
            if ($scope.meta.inAlterationPage) {
                api.alterationLookup($routeParams.geneName, $scope.alteration.name).then(function(result) {
                    $scope.alteration.relevantAlterations = _.map(result.data, function(item) {
                        if (!stringMatch(item.alteration, item.name) && (stringMatch(item.alteration, $scope.alteration.name) || stringMatch(item.name, $scope.alteration.name))) {
                            $scope.alteration.displayName = item.name + ' (' + item.alteration + ')';
                        }
                        return item.name.toUpperCase();
                    });
                    fetchTableData();
                    fetchGraphData();
                });
            } else if ($scope.meta.inGenePage) {
                fetchTableData();
                fetchGraphData();
            }

            // Get mutation effect(ME) if is Other Biomarkers
            // Use ME description as gene summary, additional info as background
            if ($scope.meta.isOtherBiomarkers && $scope.meta.inAlterationPage) {
                $scope.meta.showGeneAddition = false;
                api.getMutationEffect($scope.gene.hugoSymbol, $scope.alteration.name)
                    .then(function(result) {
                        var content = result.data;
                        if (_.isArray(content) && content.length > 0) {
                            $scope.meta.geneSummary = content[0].description;
                            $scope.meta.geneBackground = content[0].additionalInfo;
                            $scope.status.hasBackground = $scope.meta.geneBackground ? true : false;
                        } else {
                            $scope.meta.geneBackground = '';
                        }
                    }, function() {
                        $scope.status.hasBackground = false;
                    });
            }
        }

        function fetchGraphData() {
            var apiCallsForGraph = [api.getPortalAlterationSampleCount(), api.getMutationMapperData($routeParams.geneName)];
            $q.all(apiCallsForGraph).then(function(result) {
                var generalMutation = false;
                var totalCounts = result[0];
                var mutationMapperInfo = result[1];
                var tempMutationMapperInfo;

                if ($scope.meta.inAlterationPage) {
                    for (var i = 0; i < $scope.alteration.generalMutations.length; i++) {
                        if (stringMatch($scope.alteration.generalMutations[i], $scope.alteration.name)) {
                            generalMutation = true;
                            break;
                        }
                    }
                    if (generalMutation) {
                        tempMutationMapperInfo = _.filter(mutationMapperInfo.data, function(item) {
                            return $scope.alteration.relevantAlterations.indexOf(item.proteinChange.toUpperCase()) !== -1;
                        });
                    } else {
                        tempMutationMapperInfo = _.filter(mutationMapperInfo.data, function(item) {
                            return stringMatch(item.proteinChange, $scope.alteration.name);
                        });
                    }
                } else {
                    tempMutationMapperInfo = mutationMapperInfo.data;
                }
                var studyCountMapping = {};
                _.each(tempMutationMapperInfo, function(item) {
                    if (!studyCountMapping[item.cancerStudy]) {
                        studyCountMapping[item.cancerStudy] = [item.sampleId];
                    } else {
                        studyCountMapping[item.cancerStudy].push(item.sampleId);
                    }
                });
                var countsByGene = _.map(_.toPairs(studyCountMapping), function(item) {
                    return [item[0], _.uniq(item[1]).length];
                });

                $scope.meta.altFreFlag = countsByGene.length > 0;
                if ($scope.meta.altFreFlag) {
                    $scope.meta.title = true;
                    var studies = [];
                    var results = [];
                    var shortNames = [];
                    var frequencies = [];
                    var fullNames = [];
                    var hoverInfo = [];
                    var infoList = '<br/><ul class="fa-ul">';
                    for (var i = 0; i < countsByGene.length; i++) {
                        for (var j = 0; j < totalCounts.data.length; j++) {
                            if (totalCounts.data[j][0] === countsByGene[i][0]) {
                                if (totalCounts.data[j][1] > 50) {
                                    results.push({
                                        study: countsByGene[i][0],
                                        frequency: (100 * countsByGene[i][1] / totalCounts.data[j][1]).toFixed(1),
                                        numerator: countsByGene[i][1],
                                        denomerator: totalCounts.data[j][1]
                                    });
                                }
                                break;
                            }
                        }
                    }
                    results.sort(function(a, b) {
                        return b.frequency - a.frequency;
                    });
                    results.forEach(function(item) {
                        studies.push(item.study);
                        var shortName = item.study.substring(16).replace(/cancer|tumor|of/gi, '').replace(/_/g, ' ').trim();
                        var fullName = item.study.substring(16).replace(/_/g, ' ').trim();
                        shortNames.push(shortName);
                        fullNames.push(fullName);
                        frequencies.push(item.frequency);
                        if (results.length > 3) {
                            hoverInfo.push(fullName + '<br>' + 'Mutation frequency: ' +  (item.frequency < 0.001 ? '<0.1' : item.frequency) + '% (' + item.numerator + '/' + item.denomerator + ')<br><span style="font-size:10px">MSK Clinical Sequencing Cohort (Zehir et al. 2017)</span>');
                        } else {
                            infoList += '<li><i class="fa fa-circle iconSize"></i> ' + (item.frequency < 0.001 ? '<0.1' : item.frequency) + '% (' + item.numerator + '/' + item.denomerator + ') have annotated ';
                            if ($scope.meta.inGenePage) {
                                infoList += $scope.gene.hugoSymbol;
                            } else if ($scope.meta.inAlterationPage) {
                                infoList += $scope.gene.hugoSymbol + ' ' + $scope.alteration.name;
                            }
                            infoList += ' mutation in MSK-IMPACT ' + fullName + '</li><br/>';
                        }
                    });
                    if (results.length > 3) {
                        plots(studies, shortNames, fullNames, frequencies, hoverInfo);
                    } else {
                        infoList += '</ul>';
                        $('#histogramDiv').append(infoList);
                    }
                } else {
                    $scope.status.moreInfo = true;
                }

                $scope.mutationMapperFlag = tempMutationMapperInfo.length > 0;
                if ($scope.mutationMapperFlag) {
                    var count = 1;
                    tempMutationMapperInfo.forEach(function(item) {
                        mutationData.push({
                            cancerStudy: item.cancerStudy,
                            geneSymbol: item.gene.hugoSymbol,
                            caseId: item.sampleId,
                            proteinChange: item.proteinChange,
                            mutationType: item.alterationType,
                            proteinPosStart: item.proteinStart,
                            proteinPosEnd: item.proteinEnd,
                            mutationSid: 'stalone_mut_' + count,
                            mutationId: 'stalone_mut_' + count
                        });
                        count++;
                    });

                    mutationMapperConstructor(mutationData, false);
                }
            });
        }

        function autoBreakLines(rawText) {
            // insert new line symbol to label content
            var words = rawText.split(' ');
            var finalString = '';
            var currentLength = 0;
            for (var i = 0; i < words.length; i++) {
                if (currentLength + words[i].length < 38) {
                    finalString += words[i] + ' ';
                    currentLength += words[i].length + 1;
                } else {
                    finalString = finalString.trim();
                    finalString += '<br>' + words[i] + ' ';
                    currentLength = words[i].length + 1;
                }
            }
            return finalString;
        }

        function plots(studies, shortNames, fullNames, frequencies, hoverInfo) {
            // get the max length of the study short name
            var maxLengthStudy = '';
            var colors = [];
            var boldedNames = [];

            for (var i = 0; i < shortNames.length; i++) {
                colors.push('#1c75cd');
                boldedNames.push(shortNames[i]);
                if (shortNames[i].length > maxLengthStudy.length) {
                    maxLengthStudy = shortNames[i];
                }
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
                        size: 10
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
            if (maxLengthStudy.length > 0 && shortNames.length > 0) {
                layout.xaxis.tickfont.size = Math.max(Math.min(260 / maxLengthStudy.length, 15, 180 / shortNames.length), 10);
            }
            layout.xaxis.tickangle = 300/layout.xaxis.tickfont.size;
            Plotly.newPlot('histogramDiv', data, layout, {displayModeBar: false});
            var myPlot = document.getElementById('histogramDiv');
            myPlot.on('plotly_click', function(eventData) {
                resetFlag = false;
                singleStudyFlag = true;
                var tempIndex = shortNames.indexOf(eventData.points[0].x);
                if (previousChosenIndex === tempIndex) {
                    $('.mutation-details-filter-reset').trigger('click');
                } else {
                    previousChosenIndex = tempIndex;
                    var tempValue = studies[tempIndex];
                    $scope.studyName = 'MSK-IMPACT ' + fullNames[tempIndex];
                    var newMutationData = [];
                    newMutationData = mutationData.filter(function(item) {
                        return item.cancerStudy === tempValue;
                    });

                    mutationMapperConstructor(newMutationData, true);
                    _.fill(colors, '#1c75cd');
                    colors[tempIndex] = '#064885';
                    for (var i = 0; i < shortNames.length; i++) {
                        boldedNames[i] = shortNames[i];
                    }

                    boldedNames[tempIndex] = '<b>' + boldedNames[tempIndex] + '</b>';
                    Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});

                    $('.mutation-details-filter-reset').click(function() {
                        // show all of the data again
                        _.fill(colors, '#1c75cd');
                        singleStudyFlag = false;
                        for (var i = 0; i < shortNames.length; i++) {
                            boldedNames[i] = shortNames[i];
                        }
                        Plotly.redraw('histogramDiv', data, layout, {displayModeBar: false});
                    });
                }
            });
        }
        $scope.studyName = 'MSK-IMPACT Clinical Sequencing Cohort';
        function mutationMapperConstructor(mutationData, updateFlag) {
            if (updateFlag) {
                // update lollipop from the chosen study in the histogram
                mutationDiagram.updatePlot((new MutationCollection(mutationData)));
            } else {
                // load the template when first load the page
                $('#templateDiv').load('views/mutationMapperTemplates.html', function() {
                    // init mutation mapper
                    mutationMapper = new MutationMapper(options);
                    mutationMapper.init();
                    // listen to init event and attach lollipop event once it's done
                    mutationMapper.getView().dispatcher.on(MutationDetailsEvents.MAIN_VIEW_INIT, function(mainMutationView) {
                        mainMutationView.dispatcher.on(MutationDetailsEvents.DIAGRAM_INIT, function(diagram) {
                            $('.mutation-details-uniprot-link').hide();
                            mutationDiagram = diagram;
                            // still need to work on the click mutation type panel event
                            mutationDiagram.dispatcher.on(MutationDetailsEvents.LOLLIPOP_SELECTED, function() {
                                updateTable('select');
                            });
                            mutationDiagram.dispatcher.on(MutationDetailsEvents.LOLLIPOP_DESELECTED, function() {
                                updateTable('deselect');
                            });

                            $('.mutation-details-filter-reset').click(function() {
                                previousChosenIndex = -1;
                                resetFlag = true;
                                singleStudyFlag = false;
                            });

                            mutationDiagram.dispatcher.on(MutationDetailsEvents.DIAGRAM_PLOT_UPDATED, function() {
                                if (resetFlag) {
                                    updateTable('reset');
                                } else if ($('.diagram-y-axis-limit-input').val() === currentMax) {
                                    updateTable('plotUpdate');
                                } else {
                                    currentMax = $('.diagram-y-axis-limit-input').val();
                                }
                            });
                        });
                    });
                });
            }
        }

        // get the chosen mutation data from the lollipop and update the table
        function updateTable(type) {
            var proteinChanges = [];
            if (type === 'plotUpdate') {
                var pileUpValues = mutationDiagram.pileups;
                var currentProteinChanges = PileupUtil.getPileupMutations(pileUpValues);
                _.each(currentProteinChanges, function(ele) {
                    proteinChanges.push(ele.attributes.proteinChange);
                });
                updateTablesTemp(proteinChanges);
                $scope.$apply();
            } else {
                _.each(mutationDiagram.getSelectedElements(), function(ele) {
                    var mutations = ele.datum().mutations;
                    _.each(mutations, function(item) {
                        proteinChanges.push(item.attributes.proteinChange);
                    });
                });
                // make api call
                if (proteinChanges.length === 0) {
                    updateTablesTemp(proteinChanges);
                    $scope.$apply();
                } else {
                    $scope.alteration.loadingRelevantAlts = true;
                    var tempProteinChanges = _.uniq(proteinChanges);
                    var relevantAlts = tempProteinChanges;
                    var alterationList = [];
                    _.each(tempProteinChanges, function(proteinChange) {
                        alterationList.push({
                            hugoSymbol: $scope.gene.hugoSymbol,
                            variant: proteinChange
                        });
                    });
                    api.searchAlterationList(alterationList).then(function(result) {
                        _.each(result.data, function(relevantItems) {
                            _.each(relevantItems, function(item) {
                                relevantAlts.push(item.name);
                            });
                        });
                        relevantAlts = _.uniq(relevantAlts);
                        updateTablesTemp(relevantAlts);
                        $scope.alteration.loadingRelevantAlts = false;
                    });
                }
            }
            if (type === 'deselect' || type === 'reset') {
                if (_.isObject($scope.meta.clinicalTable) && $scope.meta.clinicalTable.DataTable) {
                    $scope.meta.clinicalTable.DataTable.column(0).search('').draw();
                }
                if (_.isObject($scope.meta.biologicalTable) && $scope.meta.biologicalTable.DataTable) {
                    $scope.meta.biologicalTable.DataTable.column(0).search('').draw();
                }
                resetFlag = false;
                $scope.clinicalAlterationsCount = uniqueClinicAlterations.length;
                $scope.annotatedAlterationsCount = uniqueAnnotatedAlterations.length;
                $scope.studyName = 'MSK-IMPACT Clinical Sequencing Cohort';
                $scope.$apply();
            }
        }

        function updateTablesTemp(proteinChanges) {
            var tempProteinChanges = _.map(_.uniq(proteinChanges), function(proteinChange) {
                return proteinChange.replace(/\*/g, '\\*');
            });
            var regexString = tempProteinChanges.join('|');
            if (_.isObject($scope.meta.clinicalTable) && $scope.meta.clinicalTable.DataTable) {
                $scope.meta.clinicalTable.DataTable.column(0).search(regexString, true, false).draw();
            }
            if (_.isObject($scope.meta.biologicalTable) && $scope.meta.biologicalTable.DataTable) {
                $scope.meta.biologicalTable.DataTable.column(0).search(regexString, true, false).draw();
            }
            var tempCount = 0;
            var regexp = new RegExp(regexString, 'i');
            _.each(uniqueClinicAlterations, function(item) {
                if (regexp.test(item)) {
                    tempCount++;
                }
            });
            $scope.clinicalAlterationsCount = tempCount;

            tempCount = 0;
            _.each(uniqueAnnotatedAlterations, function(item) {
                if (regexp.test(item)) {
                    tempCount++;
                }
            });
            $scope.annotatedAlterationsCount = tempCount;
        }

        function stringMatch(a, b) {
            if (!a && !b && a === b) {
                return true;
            }
            if (a && b) {
                return a.toUpperCase() === b.toUpperCase();
            }
            return false;
        }
        $scope.gene = {
            hugoSymbol: $routeParams.geneName
        };
        $scope.alteration = {
            name: $routeParams.alterationName ? decodeURIComponent($routeParams.alterationName) : '',
            oncogenic: '',
            mutationEffect: '',
            highestLevel: '',
            mutationSummary: '',
            displayName: $routeParams.alterationName ? decodeURIComponent($routeParams.alterationName) : '',
            relevantAlterations: [],
            loadingRelevantAlts: false,
            generalMutations: ['Oncogenic Mutations', 'Gain-of-function Mutations', 'Loss-of-function Mutations', 'Switch-of-function Mutations', 'Likely Oncogenic Mutations', 'Likely Gain-of-function Mutations', 'Likely Loss-of-function Mutations', 'Likely Switch-of-function Mutations'],
            displayGeneInfo: false,
            pmids: []
        };
        $scope.meta = {
            clinicalTable: {},
            biologicalTable: {},
            showGeneAddition: true,
            altFreFlag: true,
            highestLevels: [],
            title: false,
            isOtherBiomarkers: false,
            inGenePage: false,
            inAlterationPage: false
        };
        if ($routeParams.geneName) {
            if ($routeParams.alterationName) {
                $scope.meta.inAlterationPage = true;
                $window.document.title = $routeParams.geneName + ' ' + $routeParams.alterationName;
            } else {
                $scope.meta.inGenePage = true;
                $window.document.title = $routeParams.geneName;
            }
        }
        $scope.status = {
            hasSummary: false,
            hasBackground: false,
            moreInfo: false,
            getClinicalEvidence: false,
            getBiologicalEvidence: false
        };
        $scope.mutationMapperFlag = true;
        $scope.view = {};
        $scope.view.levelColors = $rootScope.data.levelColors;
        $scope.view.clinicalTableOptions = {
            hasBootstrap: true,
            aoColumnDefs: [{
                aTargets: 0,
                sType: $scope.meta.inAlterationPage ? 'alteration-html' : 'num-html',
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
            sDom: 'ft',
            aaSorting: $scope.meta.inAlterationPage ? [[0, 'asc'], [3, 'desc']] : [[3, 'desc'], [0, 'asc']],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.childRowImmediate,
                    type: '',
                    renderer: function(api, rowIdx, columns) {
                        var data = $.map(columns, function(col) {
                            return col.hidden ?
                                '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                                '<td>' + col.title + ':</td> ' +
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

        $scope.clinicalTableInstanceCallback = function(dtInstance) {
            if($rootScope.meta.clinicalTableSearchKeyWord) {
                dtInstance.DataTable.search($rootScope.meta.clinicalTableSearchKeyWord).draw();
                $rootScope.meta.clinicalTableSearchKeyWord = '';
            }
        };
        $scope.view.biologicalTableOptions = {
            hasBootstrap: true,
            aoColumns: [
                {
                    sType: $scope.meta.inAlterationPage ? 'alteration-html' : 'num-html',
                    asSorting: ['asc', 'desc']
                },
                {sType: 'oncogenic-html', asSorting: ['desc', 'asc']},
                null,
                {
                    sType: 'num-html',
                    asSorting: ['asc', 'desc']
                }
            ],
            paging: false,
            scrollCollapse: true,
            scrollY: 500,
            sDom: 'ft',
            aaSorting: $scope.meta.inAlterationPage ? [[0, 'asc'], [1, 'desc']] : [[1, 'desc'], [0, 'asc']],
            columnDefs: [
                {responsivePriority: 1, targets: 0},
                {responsivePriority: 2, targets: 1},
                {responsivePriority: 3, targets: 2}
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.childRowImmediate,
                    type: '',
                    renderer: function(api, rowIdx, columns) {
                        var data = $.map(columns, function(col) {
                            return col.hidden ?
                                '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                                '<td>' + col.title + ':</td> ' +
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
            .then(function(result) {
                var content = result.data;
                if (content) {
                    $scope.gene = content.gene;
                    if ($scope.gene.hugoSymbol.toLowerCase() === 'other biomarkers') {
                        $scope.meta.isOtherBiomarkers = true;
                    }
                    $route.updateParams({geneName: $scope.gene.hugoSymbol});
                    var subNavItems = [{content: $scope.gene.hugoSymbol}];

                    if (content.highestSensitiveLevel) {
                        $scope.meta.highestLevels.push(content.highestSensitiveLevel.replace('LEVEL_', ''));
                    }
                    if (content.highestResistanceLevel) {
                        $scope.meta.highestLevels.push(content.highestResistanceLevel.replace('LEVEL_', ''));
                    }
                    $rootScope.view.subNavItems = subNavItems;

                    fetchData();
                } else {
                    if (/[a-z]/.test($routeParams.geneName)) {
                        $location.path('gene/' +
                            $routeParams.geneName.toUpperCase());
                    } else {
                        $location.path('genes');
                    }
                }
            }, function() {

            });

        api.getGeneSummary($scope.gene.hugoSymbol)
            .then(function(result) {
                var content = result.data;
                if (_.isArray(content) && content.length > 0) {
                    $scope.meta.geneSummary =
                        utils.insertSourceLink(content[0].description);
                } else {
                    $scope.meta.geneSummary = '';
                }
                $scope.status.hasSummary = true;
            }, function() {
                $scope.meta.geneSummary = '';
            });

        api.getGeneBackground($scope.gene.hugoSymbol)
            .then(function(result) {
                var content = result.data;
                if (_.isArray(content) && content.length > 0) {
                    $scope.meta.geneBackground = utils.insertSourceLink(content[0].description);
                    $scope.status.hasBackground = true;
                } else {
                    $scope.meta.geneBackground = '';
                }
            }, function() {
                $scope.meta.geneBackground = '';
            });

        $scope.displayOncogenic = function(item) {
            if (item === 'Oncogenic') {
                return 'Yes';
            } else if (item === 'Likely Oncogenic') {
                return 'Likely';
            }
            return item;
        };

        $scope.getLevelColor = utils.getLevelColor;

        $scope.tableClicked = function(type) {
            // Bootstrap fade in has 150ms transition time. DataTable only can gets width after the transition.
            $timeout(function() {
                if (type === 'annotated' && $scope.meta.biologicalTable && $scope.meta.biologicalTable.DataTable) {
                    $scope.meta.biologicalTable.DataTable.columns.adjust().draw();
                } else if (type === 'clinical' && $scope.meta.clinicalTable && $scope.meta.clinicalTable.DataTable) {
                    $scope.meta.clinicalTable.DataTable.columns.adjust().draw();
                }
            }, 160);
        };

        $scope.getNumOfRefsAnnotatedAlteration = function(item) {
            var numOfPmids = item.mutationEffectPmids.length +
                item.oncogenicPmids.length +
                item.mutationEffectAbstracts.length +
                item.oncogenicAbstracts.length;
            return numOfPmids === 0 ? '' : (numOfPmids + (numOfPmids > 1 ? ' references' : ' reference'));
        };

        $scope.getNumOfRefsClinicalAlteration = function(item) {
            var numOfPmids = item.drugPmids.length +
                item.drugAbstracts.length;
            return numOfPmids === 0 ? '' : (numOfPmids + (numOfPmids > 1 ? ' references' : ' reference'));
        };

        $scope.getCancerTypeName = function(cancerType) {
            return utils.getCancerTypeNameFromOncoTreeType(cancerType);
        };

        $scope.getAlterationCellContent = function(alterationName) {
            return utils.getAlterationCellContent($scope.gene.hugoSymbol, alterationName);
        };

        $scope.isGeneralMutation = function() {
            if ($scope.meta.inGenePage) {
                return false;
            }
            for (var i = 0; i < $scope.alteration.generalMutations.length; i++) {
                if (stringMatch($scope.alteration.name, $scope.alteration.generalMutations[i])) {
                    return true;
                }
            }
            return false;
        };

        jQuery.extend(jQuery.fn.dataTableExt.oSort, {
            'alteration-html-asc': function(a, b) {
                a = $(a).text();
                b = $(b).text();
                return $scope.alteration.relevantAlterations.indexOf(a.toUpperCase()) - $scope.alteration.relevantAlterations.indexOf(b.toUpperCase());
            },
            'alteration-html-desc': function(a, b) {
                a = $(a).text();
                b = $(b).text();
                return $scope.alteration.relevantAlterations.indexOf(b.toUpperCase()) - $scope.alteration.relevantAlterations.indexOf(a.toUpperCase());
            }
        });
    });
