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
    .controller('CancerGenesCtrl', function($scope, _, api, $q) {
        // DataTable initialization & options
        $scope.dt = {};
        $scope.dt.dtOptions = {
            paging: false,
            hasBootstrap: true,
            language: {
                loadingRecords: '<img src="resources/images/loader.gif">'
            },
            scrollY: 500,
            scrollX: "100%",
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
        $scope.doneLoading = false;
        $q.all([api.getGenes(), api.getCancerGeneList()]).then(function(result) {
            var geneTypeMapping = {};
            _.each(result[0].data, function(gene) {
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
            var tempData = result[1].data;
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
            $scope.doneLoading = true;
        }, function(error) {
            $scope.cancerGeneList = [];
            $scope.doneLoading = true;
        });
        $scope.download = function() {
            var tempArr = ['Hugo Symbol', '# of occurence within resources', 'OncoKB Annotated', 'OncoKB Oncogene', 'OncoKB TSG', 'MSK-IMPACT', 'MSK-HEME', 'FOUNDATION ONE', 'FOUNDATION ONE HEME', 'Vogelstein', 'SANGER CGC'];
            var content = [tempArr.join('\t')];
            _.each($scope.cancerGeneList, function(item) {
                tempArr = [item.hugoSymbol, item.occurrenceCount, item.oncokbAnnotated, item.oncogene, item.tsg, item.foundation,
                    item.foundationHeme, item.mSKImpact, item.mSKHeme, item.vogelstein, item.sangerCGC];
                content.push(tempArr.join('\t'));
            });
            var blob = new Blob([content.join('\n')], {
                type: "text/plain;charset=utf-8;",
            });
            saveAs(blob, "CancerGenesList.txt");
        }
    });
