'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:qtip
 * @description
 * # qtip
 */
angular.module('oncokbStaticApp')
    .directive('qtip', function(api, $rootScope, _) {
        return {
            restrict: 'A',
            scope: {
                abstracts: '=',
                pmids: '='
            },
            link: function(scope, element, attrs) {
                var hideEvent = 'mouseleave';
                var my = attrs.hasOwnProperty('my') ? attrs.my : 'bottom right';
                var at = attrs.hasOwnProperty('at') ? attrs.at : 'top left';
                var type = attrs.hasOwnProperty('qtipType') ? attrs.qtipType : '';
                var content = attrs.hasOwnProperty('qtipContent') ? attrs.qtipContent : '';

                var options = {
                    content: content,
                    position: {
                        my: my,
                        at: at,
                        viewport: $(window)
                    },
                    style: {
                        'classes': 'qtip-light qtip-shadow gene-evidence-qtip',
                        'max-height': 300
                    },
                    show: 'mouseover',
                    hide: {
                        event: hideEvent,
                        fixed: true,
                        delay: 100
                    }
                };

                if (type === 'geneEvidence') {
                    options.content = '<img src="resources/images/loader.gif" />';
                    options.events = {
                        show: function(event, qtipApi) {
                            scope.pmids = _.isArray(scope.pmids) ? scope.pmids : [];
                            api.getpumbedArticle(scope.pmids).then(function(articles) {
                                var articlesData = articles.data.result;
                                var content = [];
                                content.push('<ul class="list-group">');
                                if (articlesData !== undefined && articlesData.uids.length > 0) {
                                    articlesData.uids.forEach(function(uid) {
                                        var articleContent = articlesData[uid];
                                        var li = [];
                                        var subtitle = [];
                                        if (articleContent.title) {
                                            li.push('<a href="https://www.ncbi.nlm.nih.gov/pubmed/' + uid + '" target="_blank"><b>' + articleContent.title + '</b></a>');
                                        }
                                        if (_.isArray(articleContent.authors) && articleContent.authors.length > 0) {
                                            subtitle.push(articleContent.authors[0].name + ' et al.');
                                        }
                                        if (articleContent.source) {
                                            subtitle.push(articleContent.source + '.');
                                        }
                                        if (articleContent.pubdate) {
                                            subtitle.push((new Date(articleContent.pubdate)).getFullYear());
                                        }
                                        subtitle.push('<span ' + ((subtitle.length > 0 || li.length > 0) ? 'style="float: right"' : '') + '>PMID: <a href="https://www.ncbi.nlm.nih.gov/pubmed/' + uid + '" target="_blank"><b>' + uid + '</b></a></span>');

                                        if (li.length > 0 && subtitle.length > 0) {
                                            subtitle.unshift('<br/>');
                                        }
                                        li.unshift('<li class="list-group-item" style="width: 100%">');
                                        li.push(subtitle.join(' '));
                                        li.push('</li>');

                                        content.push(li.join(''));
                                    });
                                }
                                if (_.isArray(scope.abstracts)) {
                                    _.each(scope.abstracts, function(item) {
                                        content.push('<li class="list-group-item" style="width: 100%">');
                                        if (_.isString(item.link)) {
                                            content.push('<a href="' + item.link + '" target="_blank">');
                                        }
                                        content.push('<b>' + item.abstract + '</b>');
                                        if (_.isString(item.link)) {
                                            content.push('</a>');
                                        }
                                        content.push('</li>');
                                    });
                                }
                                content.push('</ul>');
                                qtipApi.set({
                                    'content.text': content.join(''),
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
                    };
                }

                $(element).qtip(options);
            }
        };
    });
