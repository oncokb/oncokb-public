'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
    .controller('HomeCtrl', function($scope, $location, $rootScope, $window, api) {
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
                        if (isNaN(query)) {
                            query = query.toString().toLowerCase();
                            content = result.data.data.sort(function(a, b) {
                                var _a = a.hugoSymbol.toString().toLowerCase();
                                var _b = b.hugoSymbol.toString().toLowerCase();

                                if (_a === query) {
                                    return -1;
                                }
                                if (_b === query) {
                                    return 1;
                                }
                                return _a.indexOf(query) - _b.indexOf(query);
                            });
                        } else {
                            content = result.data.data.sort();
                        }

                        return content.slice(0, 10);
                    }
                }, function() {

                });
        };

        $scope.searchConfirmed = function() {
            if ($scope.content.selectedGene.hugoSymbol) {
                $location.path('/gene/' + $scope.content.selectedGene.hugoSymbol);
            }
        };

        $scope.getGeneCountForLevel = function(level) {
            if ($scope.content.levels.hasOwnProperty(level)) {
                return $scope.content.levels[level].length;
            }
        };

        $rootScope.$watch('meta.numbers.main', function(n) {
            $scope.content.main = n;
        });

        $rootScope.$watch('meta.numbers.levels', function(n) {
            $scope.content.levels = n;
        });
    });
