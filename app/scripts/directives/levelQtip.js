'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:qtip
 * @description
 * # qtip
 */
angular.module('oncokbStaticApp')
        .directive('levelQtip', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var hideEvent = 'mouseleave';
                    var my = attrs.hasOwnProperty('my') ? attrs.my : 'center right';
                    var at = attrs.hasOwnProperty('at') ? attrs.at : 'left center';
                    var options = {
                        content: '<img src="resources/images/loader.gif" />',
                        position: {
                            my: my,
                            at: at,
                            viewport: $(window)
                        },
                        style: {
                            classes: 'qtip-light qtip-rounded'
                        },
                        show: 'mouseover',
                        hide: {
                            event: hideEvent,
                            fixed: true,
                            delay: 100
                        },
                        events: {
                            show: function (event, qtipApi) {
                                var content = '';
                                switch (attrs.number) {
                                    case '1':
                                        content = '<p>FDA-approved biomarker and drug in this indication</p>';
                                        break;
                                    case '2a':
                                        content = '<p>Standard-of-care biomarker and drug in this indication but not FDA-approved*.</p>';
                                        break;
                                    case '2b':
                                        content = '<p>FDA-approved biomarker and drug in another indication, but not FDA or NCCN compendium-listed for this indication</p>';
                                        break;
                                    case '3a':
                                        content = '<p>Clinical evidence links biomarker to drug response in this indication but neither biomarker or drug are FDA-approved or NCCN compendium-listed</p>';
                                        break;
                                    case '3b':
                                        content = '<p>Clinical evidence links biomarker to drug response in another indication but neither biomarker or drug are FDA-approved or NCCN compendium-listed</p>';
                                        break;
                                    case '4':
                                        content = '<p>Preclinical evidence associates this biomarker to drug response, where the biomarker and drug are NOT FDA-approved or NCCN compendium-listed</p>';
                                        break;

                                }

                                qtipApi.set({
                                    'content.text': content,
                                    'style.classes': 'qtip-light qtip-rounded'
                                });

                                qtipApi.reposition(event, false);
                            }
                        }
                    };
                    $(element).qtip(options);
                }
            };
        })
