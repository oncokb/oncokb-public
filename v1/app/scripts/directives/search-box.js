'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:searchBox
 * @description
 * # searchBox
 */
angular.module('oncokbStaticApp')
    .directive('searchBox', function(api, $location) {
        return {
            templateUrl: 'views/searchBox.html',
            restrict: 'E',
            scope: {
                searchConfirmedEvent: '='
            },
            link: function postLink(scope) {
                function getAllVariantsName(variants) {
                    return variants ? variants.map(function(variant) {
                        return variant.name;
                    }).join(', ') : '';
                }

                function getAllTumorTypesName(tumorTypes) {
                    return tumorTypes ? tumorTypes.map(function(tumorType) {
                        return tumorType.name ? tumorType.name : (tumorType.mainType ? tumorType.mainType.name : '');
                    }).join(', ') : '';
                }
                scope.content = {
                    currentQuery: '',
                    selectedGene: '',
                    loadingSearchResult: false
                };

                scope.searchConfirmed = function() {
                    if (scope.content.selectedItem) {
                        var link = scope.content.selectedItem.link;
                        if (angular.isFunction(scope.searchConfirmedEvent)) {
                            scope.searchConfirmedEvent(scope.content.selectedItem);
                        }
                        $location.path(link);
                        scope.content.selectedItem = undefined;
                    }
                };

                scope.searchKeyUp = function(query) {
                    scope.content.currentQuery = query;
                    return api.blurSearch(query)
                        .then(function(resp) {
                            var result = resp;
                            if (_.isObject(resp)) {
                                result = resp.data;
                            }
                            _.each(result, function(item) {
                                if (item.highestSensitiveLevel) {
                                    item.highestSensitiveLevel = item.highestSensitiveLevel.replace('LEVEL_', '');
                                }
                                if (item.highestResistanceLevel) {
                                    item.highestResistanceLevel = item.highestResistanceLevel.replace('LEVEL_', '');
                                }
                                item.variantsName = getAllVariantsName(item.variants);
                                item.tumorTypesName = getAllTumorTypesName(item.tumorTypes);
                            });
                            return result;
                        }, function() {
                        });
                };
            }
        };
    });
