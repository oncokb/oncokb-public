'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:qtip
 * @description
 * # qtip
 */
angular.module('oncokbStaticApp')
  .directive('qtip', function(api) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var src = '';
        var hideEvent = 'mouseleave';
        var my = attrs.hasOwnProperty('my') ? attrs.my : 'top left';
        var at = attrs.hasOwnProperty('at') ? attrs.at : 'bottom right';

        // src = '<iframe width="610px" height="400px" src="http://www.ncbi.nlm.nih.gov/pubmed/' + attrs.number + '"></iframe>';
        // content = $(src);
        var options = {
          content: '<img src="resources/images/loader.gif" />',
          position: {
            my: my,
            at: at,
            viewport: $(window)
          },
          style: {
            classes: 'qtip-light qtip-rounded',
          },
          show: 'mouseover',
          hide: {
            event: hideEvent,
            fixed: true,
            delay: 100
          },
          events: {
            show: function(event, qtipApi) {
              api.getpumbedArticle(attrs.number).then(function(articles) {
                var articlesData = articles.data.result;
                var content = '';
                if (articlesData !== undefined && articlesData.uids.length > 0) {
                  content = '<ul class="list-group" style="margin-bottom: 5px">';

                  articlesData.uids.forEach(function(uid) {
                    var articleContent = articlesData[uid];
                    content += '<li class="list-group-item" style="width: 100%"><a href="http://www.ncbi.nlm.nih.gov/pubmed/' + uid + '" target="_blank"><b>' + articleContent.title + '</b></a>';
                    if (articleContent.authors !== undefined) {
                      content += '<p>' + articleContent.authors[0].name + ' et al. ' + articleContent.source + '. ' + articleContent.pubdate + '</p></li>';
                    }
                  });
                  content += "</ul>";
                }
                qtipApi.set({
                  'content.text': content,
                  'style.classes': 'qtip-light qtip-rounded gene-evidence-qtip'
                });

                qtipApi.reposition(event, false);
              });
            }
          }
        };
        $(element).qtip(options);
      }
    };
  })
