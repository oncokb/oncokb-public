'use strict';

/**
 * @ngdoc service
 * @name oncokbStaticApp.api
 * @description
 * # api
 * Factory in the oncokbStaticApp.
 */
angular.module('oncokbStaticApp')
    .factory('api', function($q, $http, legacyLink, privateApiLink, apiLink, _) {
        return {
            getNumbers: function(type, hugoSymbol) {
                if (type === 'main') {
                    return $http.get(privateApiLink + 'utils/numbers/main/');
                } else if (type === 'genes') {
                    return $http.get(privateApiLink + 'utils/numbers/genes/');
                } else if (type === 'gene') {
                    return $http.get(privateApiLink + 'utils/numbers/gene/' +
                        hugoSymbol);
                } else if (type === 'levels') {
                    return $http.get(privateApiLink + 'utils/numbers/levels/');
                }
                return null;
            },
            blurSearch: function(query) {
                return $http.get(privateApiLink + 'search/typeahead?limit=100&query=' + query);
            },
            generalSearch: function(hugoSymbol, alteration) {
                return $http.get(apiLink + 'search?hugoSymbol=' +
                    hugoSymbol + '&alteration=' + alteration);
            },
            searchGene: function(query, exactMatch) {
                if (!_.isBoolean(exactMatch)) {
                    exactMatch = false;
                }
                return $http.get(apiLink + 'genes/lookup?query=' + query);
            },
            alterationLookup: function(hugoSymbol, alteration) {
                return $http.get(apiLink + 'variants/lookup?hugoSymbol=' + hugoSymbol + '&variant=' + alteration);
            },
            getGenes: function() {
                return $http.get(apiLink + 'genes/');
            },
            getGeneSummary: function(hugoSymbol) {
                return $http.get(apiLink +
                    'evidences/lookup?hugoSymbol=' + hugoSymbol +
                    '&evidenceTypes=GENE_SUMMARY');
            },
            getMutationEffect: function(hugoSymbol, alteration) {
                return $http.get(apiLink +
                    'evidences/lookup?hugoSymbol=' + hugoSymbol +
                    '&variant=' + alteration +
                    '&evidenceTypes=MUTATION_EFFECT');
            },
            getGeneBackground: function(hugoSymbol) {
                return $http.get(apiLink +
                    'evidences/lookup?hugoSymbol=' + hugoSymbol +
                    '&evidenceTypes=GENE_BACKGROUND');
            },
            getClinicalAlterationByGene: function(hugoSymbol) {
                return $http.get(privateApiLink +
                    'search/variants/clinical?hugoSymbol=' + hugoSymbol);
            },
            getBiologicalAlterationByGene: function(hugoSymbol) {
                return $http.get(privateApiLink +
                    'search/variants/biological?hugoSymbol=' + hugoSymbol);
            },
            getPortalAlterationSampleCount: function(hugoSymbol) {
                if (hugoSymbol) {
                    return $http.get(legacyLink +
                        'portalAlterationSampleCount?hugoSymbol=' + hugoSymbol);
                }
                return $http.get(legacyLink + 'portalAlterationSampleCount');
            },
            getMutationMapperData: function(hugoSymbol) {
                return $http.get(legacyLink +
                    'mutationMapperData?hugoSymbol=' + hugoSymbol);
            },
            getpumbedArticle: function(pumbedID) {
                return $http.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + pumbedID);
            },
            getEvidencesBylevel: function() {
                return $http.get(privateApiLink + 'utils/evidences/levels');
            },
            getCancerGeneList: function() {
                return $http.get(apiLink + 'utils/cancerGeneList');
            },
            searchAlteration: function(hugoSymbol, alteration, source, queryType) {
                return $http.get(apiLink + 'search?hugoSymbol=' + hugoSymbol + '&variant=' + alteration + '&source=' + source + '&queryType=' + queryType);
            },
            searchAlterationList: function(params) {
                return $http.post(apiLink + 'variants/lookup', params);
            }
        };
    });
