/**
 * Created by jiaojiao on 6/12/17.
 */
'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:CancerGenesCtrl
 * @description
 * # CancerGenesCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
    .controller('CancerGenesCtrl', function($rootScope, $scope, _, api, $q, apiLink, NgTableParams) {


        function displayConvert(obj, keys) {
            _.each(keys, function(key) {
                obj[key] = obj[key] === true ? 'Yes' : 'No';
            });
            return obj;
        }

        $scope.fetchedDate = '05/07/2019';
        $scope.sources = ['oncokbAnnotated', 'foundation', 'foundationHeme', 'mSKImpact', 'mSKHeme', 'vogelstein', 'sangerCGC'];
        $scope.numOfGenes = _.reduce($scope.sources, function(acc, next) {
            acc[next] = 0;
            return acc;
        }, {total: 0});

        $scope.doneLoading = true;

        $scope.data = {
            searchTerm: '',
            lastUpdate: $rootScope.data.lastUpdate
        };

        function getNgTable(data) {
            return new NgTableParams({
                sorting: {occurrenceCount: 'desc', hugoSymbol: 'asc', oncokbAnnotated: 'desc'},
                count: 15
            }, {
                counts: [15, 30, 50, 100],
                dataset: data
            });
        }

        $scope.updateSearchTerm = function() {
            $scope.tableParams.filter({$: $scope.data.searchTerm});
        };

        api.getCancerGeneList().then(function(result) {
            var tempData = result.data;
            _.each(tempData, function(item) {
                item = displayConvert(item, $scope.sources);
                if (item.oncogene) {
                    if (item.tsg) {
                        item.geneType = 'Oncogene/TSG';
                    } else {
                        item.geneType = 'Oncogene';
                    }
                } else if (item.tsg) {
                    item.geneType = 'TSG';
                }
            });
            _.each($scope.sources, function(key) {
                $scope.numOfGenes[key] = _.filter(tempData, function(item) {
                    return item[key] === 'Yes';
                }).length;
            });
            $scope.tableParams  = getNgTable(tempData);
            $scope.numOfGenes.total = tempData.length;
            $scope.doneLoading = false;
        }, function(error) {
            $scope.tableParams  = getNgTable([]);
            $scope.doneLoading = false;
        });
        $scope.apiLink = apiLink;
    });
