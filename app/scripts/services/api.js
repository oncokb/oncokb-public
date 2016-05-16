'use strict';

/**
 * @ngdoc service
 * @name oncokbStaticApp.api
 * @description
 * # api
 * Factory in the oncokbStaticApp.
 */
angular.module('oncokbStaticApp')
  .factory('api', function($http, apiLink) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      getNumbers: function(type, hugoSymbol) {
        if (type === 'main') {
          return $http.get(apiLink + 'numbers/main/');
        } else if (type === 'genes') {
          return $http.get(apiLink + 'numbers/genes/');
        } else if (type === 'gene') {
          return $http.get(apiLink + 'numbers/gene/' + hugoSymbol);
        } else if (type === 'levels') {
          return $http.get(apiLink + 'numbers/levels/');
        }
        return null;
      },
      getGenes: function() {
        return $http.get(apiLink + 'genes/');
      },
      getGeneSummary: function(hugoSymbol) {
        return $http.get(apiLink + 'search/evidences?hugoSymbol=' + hugoSymbol +
          '&type=GENE_SUMMARY');
      },
      getGeneBackground: function(hugoSymbol) {
        return $http.get(apiLink + 'search/evidences?hugoSymbol=' + hugoSymbol +
          '&type=GENE_BACKGROUND');
      },
      getClinicalVariantByGene: function(hugoSymbol) {
        return $http.get(apiLink + 'search/variants/clinical?hugoSymbol=' + hugoSymbol);
      },
      getBiologicalVariantByGene: function(hugoSymbol) {
        return $http.get(apiLink + 'search/variants/biological?hugoSymbol=' + hugoSymbol);
      },
      getPortalAlterationSampleCount: function(hugoSymbol) {
        if(hugoSymbol) {
          return $http.get("http://localhost:8080/oncokb/api/portalAlterationSampleCount?hugoSymbol=" + hugoSymbol);
        }else {
          return $http.get("http://localhost:8080/oncokb/api/portalAlterationSampleCount");
        }
      },
      getMutationMapperData: function(hugoSymbol) {
        return $http.get("http://localhost:8080/oncokb/api/mutationMapperData?hugoSymbol=" + hugoSymbol);
      },
      getStudies: function(studies){
          return $http.get("http://www.cbioportal.org/api/studies?study_ids=" + studies);
      }
    };
  });
