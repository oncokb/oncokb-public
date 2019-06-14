"use strict"

angular.module('oncokbStaticApp')
    .controller('actionableGenesCtrl', function($scope, $location,
                                                DTColumnDefBuilder,
                                                _,
                                                utils,
                                                NgTableParams,
                                                api) {
        $scope.data = {
            genes: {
                levels: _.reduce($scope.meta.levelButtons, function(current, next) {
                    current[next.level] = [];
                    return current;
                }, {}),
                total: []
            },
            tumorTypes: [],
            drugs: [],
            treatments: []
        };
        $scope.allTreatmetns = [];
        $scope.filters = {};
        $scope.status = {
            loading: false
        };

        $scope.clickGene = function(gene) {
            $location.path('/gene/' + gene);
        };

        $scope.$watch('filters', function(newFilter) {
            var filteredResult = _.cloneDeep($scope.allTreatmetns);
            if (newFilter.disease) {
                filteredResult = _.filter(filteredResult, ['disease', newFilter.disease.name]);
            }
            if (newFilter.gene) {
                filteredResult = _.filter(filteredResult, ['gene', newFilter.gene.name]);
            }
            if (newFilter.drug) {
                filteredResult = _.filter(filteredResult, function(record) {
                    return record.drugs.includes(newFilter.drug.name);
                });
            }
            if (newFilter.levels) {
                var validLevelFilters = _.reduce(newFilter.levels, function(acc, status, level) {
                    if (status) {
                        acc.push(level);
                    }
                    return acc;
                }, []);
                // Don't filter if no level selected.
                if (validLevelFilters.length > 0) {
                    filteredResult = _.filter(filteredResult, function(record) {
                        return validLevelFilters.includes(match2KeyLevel(record.level));
                    });
                }
            }
            updateTreatments(filteredResult);
        }, true);

        function updateTreatments(treatments) {
            updateStats(treatments);
            $scope.tableParams = getNgTable(treatments);
        }

        function getTreatmentsMetadata() {
            $scope.status.loading = true;
            ajaxGetTreatments();
        }

        function getNgTable(data) {
            return new NgTableParams({
                sorting: {level: 'asc', gene: 'asc'},
                count: 500
            }, {
                counts: [10, 50, 100, 500],
                dataset: data
            });
        }

        function ajaxGetTreatments() {
            var levels = [{
                url: 'LEVEL_1',
                variable: 'one'
            }, {
                url: 'LEVEL_2A',
                variable: 'two'
            }, {
                url: 'LEVEL_3A',
                variable: 'three'
            }, {
                url: 'LEVEL_4',
                variable: 'four'
            }, {
                url: 'LEVEL_R1',
                variable: 'r1'
            }, {
                url: 'LEVEL_R2',
                variable: 'r2'
            }];

            api.getEvidencesBylevel()
                .then(function(result) {
                    try {
                        _.forEach(result.data, function(content, levelOfEvidence) {
                            var level = _.find(levels, function(_level) {
                                return _level.url === levelOfEvidence;
                            });
                            if (level !== undefined) {
                                $scope.data.treatments = $scope.data.treatments.concat(getTreatments(content));
                                $scope.allTreatmetns = $scope.data.treatments;
                            }
                        });

                        updateTreatments($scope.data.treatments);
                        $scope.status.loading = false;
                    } catch (error) {
                        console.error(error);
                        $scope.status.loading = false;
                    }
                });
        }

        function reduceObject2Array(data) {
            return _.reduce(data, function(acc, data, key) {
                acc.push({
                    name: key,
                    count: data
                });
                return acc;
            }, []);
        }

        function match2KeyLevel(level) {
            return _.replace(level, new RegExp('[AB]'), '');
        }

        function updateStats(treatments) {
            var genes = {
                levels: {},
                total: {}
            };
            var tumorTypes = {};
            var drugs = {};

            _.forEach(treatments, function(treatment) {
                var level = match2KeyLevel(treatment.level);
                var gene = treatment.gene;
                var tumorType = treatment.disease;
                if (genes.levels[level] === undefined) {
                    genes.levels[level] = {};
                }
                if (genes.levels[level][gene] === undefined) {
                    genes.levels[level][gene] = 0;
                }
                if (genes.total[gene] === undefined) {
                    genes.total[gene] = 0;
                }
                genes.levels[level][gene]++;
                genes.total[gene]++;

                if (tumorTypes[tumorType] === undefined) {
                    tumorTypes[tumorType] = 0;
                }
                tumorTypes[tumorType]++;

                _.forEach(treatment.treatments, function(treatment) {
                    _.forEach(treatment.drugs, function(drug) {
                        if (drugs[drug.drugName] === undefined) {
                            drugs[drug.drugName] = 0;
                        }
                        drugs[drug.drugName]++;
                    });
                });
            });

            $scope.data.genes.total = reduceObject2Array(genes.total);
            $scope.data.genes.levels = _.mapValues(genes.levels, function(gene) {
                return reduceObject2Array(gene);
            });
            $scope.data.drugs = reduceObject2Array(drugs);
            $scope.data.tumorTypes = reduceObject2Array(tumorTypes);
        }

        function getTreatments(metadata) {
            var treatments = [];
            if (_.isArray(metadata)) {
                _.forEach(metadata, function(item) {
                    var treatment = {
                        level: item.levelOfEvidence.replace('LEVEL_', ''),
                        gene: item.gene.hugoSymbol || 'NA',
                        alterations: item.alterations.map(function(alt) {
                            return alt.name ? alt.name : alt.alteration;
                        }).sort(),
                        disease: utils.getCancerTypeNameFromOncoTreeType(item.oncoTreeType),
                        treatments: item.treatments,
                        drugs: item.treatments.map(function(treatment) {
                            return treatment.drugs.map(function(drug) {
                                return drug.drugName;
                            }).sort().join(' + ');
                        }).sort().join(', ')
                    };
                    treatments.push(treatment);
                });
            }
            return treatments;
        }

        getTreatmentsMetadata();
    });

