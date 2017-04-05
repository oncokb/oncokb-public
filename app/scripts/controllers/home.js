'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
    .controller('HomeCtrl', function($scope, $location, $rootScope, $window, api, _) {
        $scope.content = {
            hoveredGene: 'gets',
            hoveredCount: '',
            main: $rootScope.meta.numbers.main,
            levels: $rootScope.meta.numbers.levels,
            matchedGenes: [],
            selectedGene: ''
        };

        $scope.searchKeyUp = function(query) {
            return api.searchGene(query, false)
                .then(function(result) {
                    if (result.status === 200) {
                        var content = [];
                        query = query.toString().toLowerCase();
                        content = result.data.sort(function(a, b) {
                            var _a = a.hugoSymbol.toString().toLowerCase();
                            var _b = b.hugoSymbol.toString().toLowerCase();

                            if (_a === query) {
                                return -1;
                            }
                            if (_b === query) {
                                return 1;
                            }

                            if (isNaN(query)) {
                                _a = _a.indexOf(query);
                                _b = _b.indexOf(query);
                            } else {
                                _a = a.entrezGeneId.toString().indexOf(query);
                                _b = b.entrezGeneId.toString().indexOf(query);
                            }

                            if (_a === _b) {
                                var _aIndexAlias = [-1, -1];
                                var _bIndexAlias = [-1, -1];
                                var i = 0;
                                var _index = -1;

                                if (!_.isArray(a.geneAliases)) {
                                    a.geneAliases = [];
                                }
                                if (!_.isArray(b.geneAliases)) {
                                    b.geneAliases = [];
                                }

                                for (i = 0; i < a.geneAliases.length; i++) {
                                    _index = a.geneAliases[i].toString().toLowerCase().indexOf(query);
                                    if (_index > -1) {
                                        _aIndexAlias = [i, _index];
                                        break;
                                    }
                                }

                                for (i = 0; i < b.geneAliases.length; i++) {
                                    _index = b.geneAliases[i].toString().toLowerCase().indexOf(query);
                                    if (_index > -1) {
                                        _bIndexAlias = [i, _index];
                                        break;
                                    }
                                }

                                if (_aIndexAlias[0] === _bIndexAlias[0]) {
                                    return compare(_aIndexAlias[1], _bIndexAlias[1]);
                                }
                                return compare(_aIndexAlias[0], _bIndexAlias[0]);
                            }
                            return compare(_a, _b);
                        });

                        return content.slice(0, 5);
                    }
                }, function() {

                });
        };

        $scope.searchConfirmed = function() {
            if ($scope.content.selectedGene) {
                $location.path('/gene/' + $scope.content.selectedGene);
            }
        };

        $scope.getGeneCountForLevel = function(level) {
            if ($scope.content.levels.hasOwnProperty(level)) {
                return $scope.content.levels[level].length;
            }
        };

        function compare(a, b) {
            if (a === -1) {
                return 1;
            }
            if (b === -1) {
                return -1;
            }
            return a - b;
        }

        $rootScope.$watch('meta.numbers.main', function(n) {
            $scope.content.main = n;
        });

        $rootScope.$watch('meta.numbers.levels', function(n) {
            $scope.content.levels = n;
        });
    });
