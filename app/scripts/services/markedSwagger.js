'use strict';

/**
 * @ngdoc service
 * @name oncokbStaticApp.api
 * @description
 * # api
 * Factory in the oncokbStaticApp.
 */
angular.module('oncokbStaticApp')
  .service('markedSwagger', function($q, marked) {
    this.execute = function(parserType, url, contentType, data, isTrustedSources, parseResult) {
      var deferred = $q.defer();

      if(parseResult.infos && parseResult.infos.description) {
        parseResult.infos.description = marked(parseResult.infos.description);
        deferred.resolve(true);
      }else {
        deferred.resolve(false);
      }
      // if nothing done: call deferred.resolve(false);
      // if success: call deferred.resolve(true);
      // if error: call deferred.reject({message: 'error message', code: 'error_code'});
      return deferred.promise;
    }
  });
