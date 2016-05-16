'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:qtip
 * @description
 * # qtip
 */
angular.module('oncokbStaticApp')
        .directive('qtip', function () {
            return {
                restrict: 'A',
                scope: {
                    time: '=',
                    by: '='
                },
                link: function (scope, element, attrs) {
                    var src = '';
                    var content = '';
                    var hideEvent = 'mouseleave';
                    var my = attrs.hasOwnProperty('my') ? attrs.my : 'bottom center';
                    var at = attrs.hasOwnProperty('at') ? attrs.at : 'top center';

                    src = '<iframe width="580px" height="400px" src="http://www.ncbi.nlm.nih.gov/pubmed/' + attrs.number + '"></iframe>';
                    content = $(src);

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