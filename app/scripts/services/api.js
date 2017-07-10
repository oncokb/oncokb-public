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
            generalSearch: function(hugoSymbol, variant) {
                return $http.get(apiLink + 'search?hugoSymbol=' +
                    hugoSymbol + '&variant=' + variant);
            },
            searchGene: function(query, exactMatch) {
                if (!_.isBoolean(exactMatch)) {
                    exactMatch = false;
                }
                return $http.get(apiLink + 'genes/lookup?query=' + query);
            },
            variantLookup: function(hugoSymbol, variant) {
                return $http.get(apiLink + 'variants/lookup?hugoSymbol=' + hugoSymbol + '&variant=' + variant);
            },
            getGenes: function() {
                return $http.get(apiLink + 'genes/');
            },
            getGeneSummary: function(hugoSymbol) {
                return $http.get(apiLink +
                    'evidences/lookup?hugoSymbol=' + hugoSymbol +
                    '&evidenceTypes=GENE_SUMMARY');
            },
            getGeneBackground: function(hugoSymbol) {
                return $http.get(apiLink +
                    'evidences/lookup?hugoSymbol=' + hugoSymbol +
                    '&evidenceTypes=GENE_BACKGROUND');
            },
            getClinicalVariantByGene: function(hugoSymbol) {
                return $http.get(privateApiLink +
                    'search/variants/clinical?hugoSymbol=' + hugoSymbol);
            },
            getBiologicalVariantByGene: function(hugoSymbol) {
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
            getStudies: function(studies) {
                return $http.get('http://www.cbioportal.org/api-legacy/studies');
            },
            getpumbedArticle: function(pumbedID) {
                return $http.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + pumbedID);
            },
            getTreatmentsBylevel: function(level) {
                if (_.isUndefined(level)) {
                    return null;
                }
                return $http.get(legacyLink + 'evidence.json?levels=' + level);
            },
            getCancerGeneList: function() {
                return $http.get(apiLink  + 'utils/cancerGeneList');
            },
            searchVariant: function(hugoSymbol, variant, source, queryType) {
                return $http.get(apiLink + 'search?hugoSymbol=' + hugoSymbol + '&variant=' + variant + '&source=' + source + '&queryType=' + queryType);
            },
            searchVariantList: function(params) {
                return $http.post(apiLink + 'variants/lookup', params);
            }
        };
    });
