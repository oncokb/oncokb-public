'use strict';

/**
 * @ngdoc service
 * @name oncokbStaticApp.api
 * @description
 * # api
 * Factory in the oncokbStaticApp.
 */
angular.module('oncokbStaticApp')
  .factory('api', function($http, apiLink, publicApiLink) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      getNumbers: function(type, hugoSymbol) {
        if (type === 'main') {
          return $http.get(publicApiLink + 'numbers/main/');
        } else if (type === 'genes') {
          return $http.get(publicApiLink + 'numbers/genes/');
        } else if (type === 'gene') {
          return $http.get(publicApiLink + 'numbers/gene/' + hugoSymbol);
        } else if (type === 'levels') {
          return $http.get(publicApiLink + 'numbers/levels/');
        }
        return null;
      },
      searchGene: function(query, exactMatch) {
        if(!_.isBoolean(exactMatch)) {
          exactMatch = false;
        }
        return $http.get(publicApiLink + 'search/gene?query=' + query +
          '&exactMatch='+exactMatch.toString());
      },
      getGenes: function() {
        return $http.get(publicApiLink + 'genes/');
      },
      getGeneSummary: function(hugoSymbol) {
        return $http.get(publicApiLink + 'search/evidences?hugoSymbol=' + hugoSymbol +
          '&type=GENE_SUMMARY');
      },
      getGeneBackground: function(hugoSymbol) {
        return $http.get(publicApiLink + 'search/evidences?hugoSymbol=' + hugoSymbol +
          '&type=GENE_BACKGROUND');
      },
      getClinicalVariantByGene: function(hugoSymbol) {
        return $http.get(publicApiLink + 'search/variants/clinical?hugoSymbol=' + hugoSymbol);
      },
      getBiologicalVariantByGene: function(hugoSymbol) {
        return $http.get(publicApiLink + 'search/variants/biological?hugoSymbol=' + hugoSymbol);
      },
      getPortalAlterationSampleCount: function(hugoSymbol) {
        if(hugoSymbol) {
          return $http.get(apiLink + "portalAlterationSampleCount?hugoSymbol=" + hugoSymbol);
        }else {
          return $http.get(apiLink + "portalAlterationSampleCount");
        }
      },
      getMutationMapperData: function(hugoSymbol) {
        return $http.get(apiLink + "mutationMapperData?hugoSymbol=" + hugoSymbol);
      },
      getStudies: function(studies){
          return $http.get("http://www.cbioportal.org/api/studies?study_ids=" + studies);
      },
      getpumbedArticle: function(pumbedID){
          return $http.get("http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=" + pumbedID);
      }
    };
  });
