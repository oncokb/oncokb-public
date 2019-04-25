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
    .controller('CancerGenesCtrl', function($scope, _, api, $q, apiLink, NgTableParams) {


        function displayConvert(obj, keys) {
            _.each(keys, function(key) {
                obj[key] = obj[key] === true ? 'Yes' : 'No';
            });
            return obj;
        }
        // DataTable initialization & options
        $scope.dt = {};
        $scope.dt.dtOptions = {
            paging: true,
            hasBootstrap: true,
            language: {
                loadingRecords: '<img src="resources/images/loader.gif">'
            },
            pageLength: 15,
            lengthMenu: [[15, 30, 50, 100, -1], [15, 30, 50, 100, 'All']],
            pagingType: 'numbers',
            aaSorting: [[9, 'desc'], [0, 'asc'], [1, 'desc']],
            columns: [
                {type: 'html', orderSequence: ['asc', 'desc']},
                {type: 'html', orderSequence: ['desc', 'asc']},
                {type: 'string', orderSequence: ['desc', 'asc']},
                {type: 'string', orderSequence: ['desc', 'asc']},
                {type: 'string', orderSequence: ['desc', 'asc']},
                {type: 'string', orderSequence: ['desc', 'asc']},
                {type: 'string', orderSequence: ['desc', 'asc']},
                {type: 'string', orderSequence: ['desc', 'asc']},
                {type: 'string', orderSequence: ['desc', 'asc']},
                {type: 'number', orderSequence: ['desc', 'asc']}
            ],
            responsive: true
        };

        $scope.fetchedDate = '05/30/2017';
        $scope.numOfGenes = 0;
        $scope.doneLoading = true;

        function getNgTable(data) {
            return new NgTableParams({
                sorting: {occurrenceCount: 'desc', hugoSymbol: 'asc', oncokbAnnotated: 'desc'},
                count: 15
            }, {
                counts: [15, 30, 50, 100],
                dataset: data
            });
        }

        api.getCancerGeneList().then(function(result) {
            var tempData = result.data;
            _.each(tempData, function(item) {
                item = displayConvert(item, ['oncokbAnnotated', 'foundation', 'foundationHeme', 'mSKImpact', 'mSKHeme', 'vogelstein', 'sangerCGC']);
                if (item.oncogene) {
                    if (item.tsg) {
                        item.geneType = 'Oncogene /TSG';
                    } else {
                        item.geneType = 'Oncogene';
                    }
                } else if (item.tsg) {
                    item.geneType = 'TSG';
                }
            });
            $scope.tableParams  = getNgTable(tempData);
            $scope.numOfGenes = tempData.length;
            $scope.doneLoading = false;
        }, function(error) {
            $scope.tableParams  = getNgTable([]);
            $scope.doneLoading = false;
        });
        $scope.apiLink = apiLink;
    });
