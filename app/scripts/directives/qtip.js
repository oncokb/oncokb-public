'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:qtip
 * @description
 * # qtip
 */
angular.module('oncokbStaticApp')
        .directive('qtip', function (api) {
            return {
                restrict: 'A',
                scope: {
                    time: '=',
                    by: '='
                },
                link: function (scope, element, attrs) {
                    var src = '';
                    var content = '<ul class="list-group" style="margin-bottom: 5px">';
                    var hideEvent = 'mouseleave';
                    var my = attrs.hasOwnProperty('my') ? attrs.my : 'bottom center';
                    var at = attrs.hasOwnProperty('at') ? attrs.at : 'top center';

//                    src = '<iframe width="610px" height="400px" src="http://www.ncbi.nlm.nih.gov/pubmed/' + attrs.number + '"></iframe>';
//                    content = $(src);

                    api.getpumbedArticle(attrs.number).then(function (articles) {
                        var articlesData = articles.data.result;
                        if (articlesData !== undefined && articlesData.uids.length > 0) {
                            articlesData.uids.forEach(function (uid) {
                                var articleContent = articlesData[uid];
                                content += '<li class="list-group-item" style="width: 100%"><a href="http://www.ncbi.nlm.nih.gov/pubmed/' + uid + '" target="_blank"><b>' + articleContent.title + '</b></a>';
                                if(articleContent.authors !== undefined){
                                    content += '<p>' + articleContent.authors[0].name + ' et al. ' + articleContent.source + '. ' + articleContent.pubdate + '</p></li>';
                                }                                
                            });
                            content += "</ul>";
                             
                        }

                        my = 'top left';
                        at = 'bottom right';

                        hideEvent = 'mouseleave';

                        var options = {
                            content: content,
                            position: {
                                my: my,
                                at: at,
                                viewport: $(window)
                            },
                            style: {
                                classes: 'qtip-light qtip-rounded myQTip',
                            },
                            show: 'mouseover',
                            hide: {
                                event: hideEvent,
                                fixed: true,
                                delay: 100
                            }

                        };
                        $(element).qtip(options);

                    });




                    scope.$watch("time", function (n, o) {
                        if (n) {
                            if ($(element).data('qtip')) {
                                $(element).qtip('api').set('content.text', '<span>Last edit: ' + new Date(scope.time).toLocaleDateString() + '</span><br/><span>By: ' + scope.by + '</span>');
                            }
                        }
                    });
                }
            };
        })