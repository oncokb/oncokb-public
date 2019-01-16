'use strict';

/**
 * @ngdoc service
 * @name oncokbStaticApp.utils
 * @description
 * # utils
 * Factory in the oncokbStaticApp.
 */
angular.module('oncokbStaticApp')
    .factory('utils', function(_, $rootScope) {
        return {
            insertSourceLink: function(str) {
                if (typeof str === 'string' && str) {
                    var regex = [/PMID:\s*([0-9]+,*\s*)+/ig, /NCT[0-9]+/ig];
                    var links = ['https://www.ncbi.nlm.nih.gov/pubmed/',
                        'http://clinicaltrials.gov/show/'];
                    for (var j = 0, regexL = regex.length; j < regexL; j++) {
                        var result = str.match(regex[j]);

                        if (result) {
                            var uniqueResult = result.filter(function(elem, pos) {
                                return result.indexOf(elem) === pos;
                            });
                            for (var i = 0, resultL = uniqueResult.length; i < resultL; i++) {
                                var _datum = uniqueResult[i];

                                switch (j) {
                                case 0:
                                    var _number = _datum.split(':')[1].trim();
                                    _number = _number.replace(/\s+/g, '');
                                    str = str.replace(new RegExp(_datum + '(?!\s*,)', 'g'), '<a class="withUnderScore" target="_blank" href="' + links[j] + _number + '">' + _datum + '</a>');
                                    break;
                                default:
                                    str = str.replace(_datum, '<a class="withUnderScore" target="_blank" href="' + links[j] + _datum + '">' + _datum + '</a>');
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    str = '';
                }
                return str;
            },
            getCancerTypeNameFromOncoTreeType: function(oncoTreeType) {
                return _.isObject(oncoTreeType) ?
                    (oncoTreeType.name ||
                    (oncoTreeType.mainType &&
                    oncoTreeType.mainType.name ?
                        oncoTreeType.mainType.name : 'NA') ||
                    'NA') : 'NA';
            },
            getAlterationCellContent: function(geneName, alterationName) {
                if (geneName && alterationName) {
                    geneName = geneName.trim();
                    alterationName = alterationName.trim();
                    var formattedVariantName = alterationName;
                    if (/\//.test(alterationName)) {
                        formattedVariantName = encodeURIComponent(encodeURIComponent(formattedVariantName));
                    }
                    return '<a href="gene/' + geneName + '/alteration/' + formattedVariantName + '">' + alterationName + '</a>';
                } else {
                    return '';
                }

            },
            getLevelColor: function(level) {
                if (level) {
                    if ($rootScope.data.levelColors.hasOwnProperty(level)) {
                        return {color: $rootScope.data.levelColors[level]};
                    }
                }
                return {color: $rootScope.data.levelColors.Other};
            }
        };
    });
