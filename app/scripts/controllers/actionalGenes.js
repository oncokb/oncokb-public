/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

angular.module('oncokbStaticApp')
    .controller('actionableGenesCtrl', function($scope, $location,
                                                DTColumnDefBuilder,
                                                _,
                                                utils,
                                                api) {
        $scope.data = {
            levels: [
                {
                    key: 'one',
                    title: '1',
                    titleStyleClass: 'level-1',
                    description: 'FDA-approved',
                    treatments: [],
                    treatmentsBlackList: [],
                    numOfGenes: 0,
                    numOfAlterations: 0
                },
                {
                    key: 'two',
                    title: '2',
                    titleStyleClass: 'level-2A',
                    description: 'Standard care',
                    treatments: [],
                    treatmentsBlackList: [
                        'KIT-D816A, D816E, D816F, D816G, D816H, D816N, D816V, D816Y-Melanoma-Imatinib',
                        'KIT-D816A, D816E, D816F, D816G, D816H, D816N, D816V, D816Y-Thymic Tumor-Sunitinib, Sorafenib',
                        'KIT-D816-Melanoma-Imatinib',
                        'KIT-D816-Thymic Tumor-Sunitinib, Sorafenib',
                        'KIT-Exon 17 mutations-Melanoma-Imatinib',
                        'KIT-Exon 17 mutations-Thymic Tumor-Sunitinib, Sorafenib',
                        'KIT-T670I-Melanoma-Imatinib',
                        'KIT-T670I-Thymic Tumor-Sunitinib, Sorafenib',
                        'KIT-V654A-Melanoma-Imatinib',
                        'KIT-V654A-Thymic Tumor-Sunitinib, Sorafenib'
                    ],
                    numOfGenes: 0,
                    numOfAlterations: 0
                },
                {
                    key: 'three',
                    title: '3',
                    titleStyleClass: 'level-3A',
                    description: 'Clinical evidence',
                    treatments: [],
                    numOfGenes: 0,
                    numOfAlterations: 0
                },
                {
                    key: 'four',
                    title: '4',
                    titleStyleClass: 'level-4',
                    description: 'Biological evidence',
                    treatments: [],
                    numOfGenes: 0,
                    numOfAlterations: 0
                },
                {
                    key: 'r1',
                    title: 'R1',
                    titleStyleClass: 'level-R1',
                    description: 'Standard care resistance',
                    treatments: [],
                    numOfGenes: 0,
                    numOfAlterations: 0
                }
            ]
        };
        $scope.status = {
            loading: {
                level: {
                    one: false,
                    two: false,
                    three: false,
                    four: false,
                    r1: false
                }
            }
        };

        $scope.actionableGenesDT = {};
        $scope.actionableGenesDT.dtOptions = {
            paging: false,
            scrollY: 481,
            scrollCollapse: true,
            hasBootstrap: true,
            columnDefs: [
                {responsivePriority: 1, targets: 0, width: '10%'},
                {responsivePriority: 2, targets: 1, width: '35%'},
                {responsivePriority: 3, targets: 2, width: '25%'},
                {responsivePriority: 4, targets: 3, width: '30%'}
            ],
            aaSorting: [[0, 'asc'], [1, 'asc'], [2, 'asc'], [3, 'asc']],
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
        $scope.actionableGenesDT.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0),
            DTColumnDefBuilder.newColumnDef(1),
            DTColumnDefBuilder.newColumnDef(2),
            DTColumnDefBuilder.newColumnDef(3)
        ];

        $scope.clickGene = function(gene) {
            $location.path('/gene/' + gene);
        };

        $scope.getAlterationsLink = function(gene, alterations) {
            return _.map(alterations.split(','), function(alteration) {
                return utils.getAlterationCellContent(gene, alteration);
            }).join(', ');
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
            }, {
                url: 'LEVEL_4',
                variable: 'four',
                loadingStatus: 'four'
            }, {
                url: 'LEVEL_R1',
                variable: 'r1',
                loadingStatus: 'r1'
            }];
            _.each(levels, function(level) {
                $scope.status.loading.level[level.loadingStatus] = true;
                ajaxGetTreatments(level);
            });
        }

        function ajaxGetTreatments(level) {
            api.getTreatmentsBylevel(level.url)
                .then(function(result) {
                    try {
                        var treatments = getTreatments(result.data[0]);
                        var genes = {};
                        var alterations = {};
                        _.each(treatments, function(treatment) {
                            if (treatment.gene) {
                                genes[treatment.gene] = true;
                            }
                            _.each(treatment.alterations.split(','), function(alt) {
                                var id = treatment.gene + '-' + alt.trim();
                                alterations[id] = true;
                            });
                        });

                        var _levelData = getLevelInDataByKey(level.variable);
                        if (_levelData) {
                            _levelData.treatments = mergeTreatments(treatments, _levelData.treatmentsBlackList);
                            _levelData.numOfGenes = Object.keys(genes).length;
                            _levelData.numOfAlterations = Object.keys(alterations).length;
                        }
                        $scope.status.loading.level[level.loadingStatus] = false;
                    } catch (error) {
                        $scope.status.loading.level[level.loadingStatus] = false;
                    }
                });
        }

        function getLevelInDataByKey(key) {
            for (var i = 0; i < $scope.data.levels.length; i++) {
                if ($scope.data.levels[i].key === key) {
                    return $scope.data.levels[i];
                }
            }
            return undefined;
        }

        function getTreatments(metadata) {
            var treatments = [];
            if (_.isArray(metadata)) {
                _.each(metadata, function(item) {
                    var treatment = {
                        gene: item.gene.hugoSymbol || 'NA',
                        alterations: item.alterations.map(function(alt) {
                            return alt.name ? alt.name : alt.alteration;
                        }).sort().join(', ') || 'NA',
                        disease: utils.getCancerTypeNameFromOncoTreeType(item.oncoTreeType),
                        drugs: item.treatments.map(function(treatment) {
                            return treatment.drugs.map(function(drug) {
                                return drug.drugName;
                            }).sort().join('+');
                        }).sort().join(', ')
                    };
                    treatments.push(treatment);
                });
            }
            return treatments;
        }

        function mergeTreatments(treatments, treatmentsBlackList) {
            var map = {};
            var mergedTreatments = [];
            _.each(treatments, function(treatment) {
                var _key = treatment.gene + treatment.alterations + treatment.disease;

                if (!map.hasOwnProperty(_key)) {
                    map[_key] = [];
                }
                map[_key].push(treatment);
            });
            _.each(map, function(treatments) {
                var _treatment = treatments[0];
                _treatment.drugs = treatments.map(function(t) {
                    return t.drugs;
                }).join(', ');
                var _treatmentsBlackList = treatmentsBlackList || [];
                var _key = [_treatment.gene, _treatment.alterations, _treatment.disease, _treatment.drugs].join('-');
                if (_treatmentsBlackList.indexOf(_key) == -1) {
                    mergedTreatments.push(_treatment);
                }
            });

            map = {};
            _.each(mergedTreatments, function(treatment) {
                var _key = treatment.gene + treatment.disease + treatment.drugs;

                if (!map.hasOwnProperty(_key)) {
                    map[_key] = [];
                }
                map[_key].push(treatment);
            });
            mergedTreatments = [];
            _.each(map, function(treatments) {
                var _treatment = treatments[0];
                _treatment.alterations = treatments.map(function(t) {
                    return t.alterations;
                }).join(', ');
                mergedTreatments.push(_treatment);
            });
            return mergedTreatments;
        }
    });

