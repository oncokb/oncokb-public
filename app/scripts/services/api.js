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
        }
        return null;
      },
      getGenes: function() {
        return $http.get(apiLink + 'genes/');
      },
      getEvidence: function(hugoSymbol, type) {
        return $http.get(apiLink + 'search/evidences?hugoSymbol=' + hugoSymbol +
          '&type=' + type);
      }
    };
  });
