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
            scope: {},
            link: function postLink(scope, element, attrs) {
                scope.content = {
                    selectedGene: '',
                    loadingSearchResult: false
                };

                scope.searchConfirmed = function() {
                    if (scope.content.selectedItem) {
                        var link = scope.content.selectedItem.link;
                        scope.content.selectedItem = undefined;
                        $location.path(link);
                    }
                };

                scope.searchKeyUp = function(query) {
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
                            });
                            return result;
                        }, function() {
                        });
                };
            }
        };
    });
