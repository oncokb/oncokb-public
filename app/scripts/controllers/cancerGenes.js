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
    .controller('CancerGenesCtrl', function($scope, _, api) {
        // DataTable initialization & options
        $scope.dt = {};
        $scope.dt.dtOptions = {
            paging: false,
            hasBootstrap: true,
            language: {
                loadingRecords: '<img src="resources/images/loader.gif">'
            },
            scrollY: 500,
            scrollX: 200,
            scrollCollapse: true,
            aaSorting: [[1, 'desc'], [2, 'asc'], [0, 'asc']]
        };

        function displayConvert(obj, keys) {
            if (obj.oncokbAnnotated === true) {
                obj.occurrenceCount += 1;
            }
            _.each(keys, function(key) {
                obj[key] = obj[key] === true ? 'Yes' : 'No';
            });
            return obj;
        }
        $scope.fetchedDate = '05/30/2017';
        api.getCancerGeneList()
            .then(function(content) {
                api.getGenes().then(function(response) {
                    var geneTypeMapping = {};
                    _.each(response.data, function(gene) {
                        if (gene.oncogene) {
                            if (gene.tsg) {
                                geneTypeMapping[gene.hugoSymbol] = 'Both';
                            } else {
                                geneTypeMapping[gene.hugoSymbol] = 'Oncogene';
                            }
                        } else if (gene.tsg) {
                            geneTypeMapping[gene.hugoSymbol] = 'TSG';
                        }
                    });
                    var tempData = content.data;
                    _.each(tempData, function(item) {
                        item = displayConvert(item, ['oncokbAnnotated', 'foundation', 'foundationHeme', 'mSKImpact', 'mSKHeme', 'vogelstein', 'sangerCGC']);
                        switch(geneTypeMapping[item.hugoSymbol]) {
                        case 'Oncogene':
                            item.oncogene = 'Yes';
                            break;
                        case 'TSG':
                            item.tsg = 'Yes';
                            break;
                        case 'Both':
                            item.oncogene = 'Yes';
                            item.tsg = 'Yes';
                            break;
                        default:
                            break;
                        }
                    });
                    $scope.cancerGeneList = tempData;
                }, function() {
                });
            }, function() {
            });
    });
