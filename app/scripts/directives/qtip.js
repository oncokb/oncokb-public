'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:qtip
 * @description
 * # qtip
 */
angular.module('oncokbStaticApp')
  .directive('qtip', function(api, $rootScope) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var src = '';
        var hideEvent = 'mouseleave';
        var my = attrs.hasOwnProperty('my') ? attrs.my : 'bottom right';
        var at = attrs.hasOwnProperty('at') ? attrs.at : 'top left';
        var type = attrs.hasOwnProperty('qtipType') ? attrs.qtipType : '';
        var content = attrs.hasOwnProperty('qtipContent') ? attrs.qtipContent : '';

        // src = '<iframe width="610px" height="400px" src="http://www.ncbi.nlm.nih.gov/pubmed/' + attrs.number + '"></iframe>';
        // content = $(src);
        var options = {
          content: content,
          position: {
            my: my,
            at: at,
            viewport: $(window)
          },
          style: {
            classes: 'qtip-light qtip-shadow gene-evidence-qtip',
            'max-height': 300
          },
          show: 'mouseover',
          hide: false
        };

        if (type === 'geneEvidence') {
          options.content = '<img src="resources/images/loader.gif" />';
          options.events = {
            show: function(event, qtipApi) {
              api.getpumbedArticle(attrs.number).then(function(articles) {
                var articlesData = articles.data.result;
                var content = '';
                if (articlesData !== undefined && articlesData.uids.length > 0) {
                  content = '<ul class="list-group">';

                  articlesData.uids.forEach(function(uid) {
                    var articleContent = articlesData[uid];
                    content += '<li class="list-group-item" style="width: 100%"><a href="https://www.ncbi.nlm.nih.gov/pubmed/' + uid + '" target="_blank"><b>' + articleContent.title + '</b></a>';
                    if (articleContent.authors !== undefined) {
                      content += '<br/><span>' + articleContent.authors[0].name + ' et al. ' + articleContent.source + '. ' + (new Date(articleContent.pubdate)).getFullYear() + '</span></li>';
                    }
                  });
                  content += "</ul>";
                }
                qtipApi.set({
                  'content.text': content,
                  'style.classes': 'qtip-light qtip-shadow gene-evidence-qtip'
                });

                qtipApi.reposition(event, false);
              });
            }
          };
        } else if (type === 'geneLevel') {
          options.content = '<img src="resources/images/loader.gif" />';
          options.events = {
            show: function(event, qtipApi) {
              var content = $rootScope.meta.levelsDescHtml[attrs.number.toString().toUpperCase()] || '';

              qtipApi.set({
                'content.text': content,
                'style.classes': 'qtip-light qtip-shadow'
              });

              qtipApi.reposition(event, false);
            }
          }
        }

        $(element).qtip(options);
      }
    };
  })
