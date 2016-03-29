'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
  .controller('MainCtrl', function ($scope, $rootScope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    $scope.toggled = false;
    $scope.toggleMenu = function() {
      $scope.toggled = !$scope.toggled;
    };

    $scope.tabs = {
      'apiSummary': {
        name: 'Summary',
        attr: 'apiSummary',
        collapsibleElements: [{
          title: 'GET - Specific summary information',
          include: "views/getSpecificSummary.html",
          content: 'test',
          parameters: [
            {
              attr: 'entrezGeneId',
              name: 'entrezGeneId',
              type: 'String',
              description: 'Gene ID'
            },
            {
              attr: 'hugoSymbol',
              name: 'hugoSymbol',
              type: 'String',
              description: 'Gene hugo symbol. Multiple genes are separated by comma.'
            },
            {
              attr: 'alteration',
              name: 'alteration',
              type: 'String',
              description: 'Mutation name.  Multiple mutations are separated by comma.'
            },
            {
              attr: 'tumorType',
              name: 'tumorType',
              type: 'String',
              description: 'Multiple tumor types are separated by comma.'
            },
            {
              attr: 'source',
              name: 'source',
              type: 'String',
              description: 'The source ID to convert tumor types to OncoKB tumor types',
              members: [{
                name: 'quest',
                description: 'This is default option'
              }, {
                name: 'cbioportal',
                description: ''
              }]
            },
            {
              attr: 'type',
              name: 'type',
              type: 'String',
              description: 'The summary type',
              members: [{
                name: 'full',
                description: 'Gene summary + variant summary'
              }, {
                name: 'variant',
                description: 'Variant summary which includes oncogenic, drugs information.'
              }]
            }
          ]
        }, {
          title: 'POST - Specific summary information',
          include: "views/postSpecificSummary.html",
          content: 'test',
          parameters: [
            {
              attr: 'queries',
              name: 'queries',
              type: 'Array',
              description: 'This is the list of requesting variants. The list item is object which includes hugoSymbol, alteration, tumorType and id. "id" is a option parameter you can use to identify the query. The id will be included in response. Other parameters\' description are described in GET - Specific summary section.'
            },
            {
              attr: 'source',
              name: 'source',
              type: 'String',
              description: 'The source ID to convert tumor types to OncoKB tumor types',
              members: [{
                name: 'quest',
                description: 'This is default option'
              }, {
                name: 'cbioportal',
                description: ''
              }]
            },
            {
              attr: 'type',
              name: 'type',
              type: 'String',
              description: 'The summary type',
              members: [{
                name: 'full',
                description: 'Gene summary + variant summary'
              }, {
                name: 'variant',
                description: 'Variant summary which includes oncogenic, drugs information.'
              }]
            }
          ]
        }]
      },
      'apiEvidence': {
        name: 'Evidence',
        attr: 'apiEvidence',
        collapsibleElements: [{
          title: 'GET - All evidence information',
          include: "views/getAllEvidence.html",
          content: 'test'
        }, {
          title: 'GET - Specific evidence information',
          include: "views/getSpecificEvidence.html",
          content: 'test',
          parameters: [
            {
              attr: 'entrezGeneId',
              name: 'entrezGeneId',
              type: 'String',
              description: 'Gene ID'
            },
            {
              attr: 'hugoSymbol',
              name: 'hugoSymbol',
              type: 'tumorType',
              description: 'Gene hugo symbol. Multiple genes are separated by comma.'
            },
            {
              attr: 'alteration',
              name: 'alteration',
              type: 'String',
              description: 'Mutation name.  Multiple mutations are separated by comma.'
            },
            {
              attr: 'tumorType',
              name: 'tumorType',
              type: 'String',
              description: 'Tumor type name. In GET method, there is only one tumor type is allowed. For multiple tumor types, please use the POST method.'
            },
            {
              attr: 'consequence',
              name: 'consequence',
              type: 'String',
              description: 'Multiple consequences are separated by comma. For each variant pair, it could has multiple consequences, separated by plus.'
            },
            {
              attr: 'evidenceType',
              name: 'evidenceType',
              type: 'String',
              description: 'Evidence types ar eseparated by comma.',
              members: [{
                name: 'GENE_SUMMARY',
                description: ''
              }, {
                name: 'GENE_BACKGROUND',
                description: ''
              }, {
                name: 'MUTATION_SUMMARY',
                description: ''
              }, {
                name: 'MUTATION_EFFECT',
                description: ''
              }, {
                name: 'TUMOR_TYPE_SUMMARY',
                description: ''
              }, {
                name: 'PREVALENCE',
                description: ''
              }, {
                name: 'PROGNOSTIC_IMPLICATION',
                description: ''
              }, {
                name: 'NCCN_GUIDELINES',
                description: ''
              }, {
                name: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY',
                description: ''
              }, {
                name: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE',
                description: ''
              }, {
                name: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY',
                description: ''
              }, {
                name: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE',
                description: ''
              }, {
                name: 'CLINICAL_TRIAL',
                description: ''
              }]
            },
            {
              attr: 'geneStatus',
              name: 'geneStatus',
              type: 'String',
              description: 'Only get genes under specific status.',
              members: [{
                name: 'All',
                description: ''
              }, {
                name: 'Complete',
                description: ''
              }]
            },
            {
              attr: 'source',
              name: 'source',
              type: 'String',
              description: 'The source ID to convert tumor types to OncoKB tumor types',
              members: [{
                name: 'quest',
                description: 'This is default option'
              }, {
                name: 'cbioportal',
                description: ''
              }]
            }
          ]
        }, {
          title: 'POST - Specific evidence information',
          include: "views/postSpecificEvidence.html",
          content: 'test',
          parameters: [
            {
              attr: 'queries',
              name: 'queries',
              type: 'Array',
              description: 'This is the list of requesting variants. The list item is object which includes hugoSymbol, alteration, tumorType, consequence and id. "id" is a option parameter you can use to identify the query. The id will be included in response. Other parameters\' description are described in GET - Specific evidence section.'
            },
            {
              attr: 'evidenceType',
              name: 'evidenceType',
              type: 'String',
              description: 'Evidence types ar eseparated by comma.',
              members: [{
                name: 'GENE_SUMMARY',
                description: ''
              }, {
                name: 'GENE_BACKGROUND',
                description: ''
              }, {
                name: 'MUTATION_SUMMARY',
                description: ''
              }, {
                name: 'MUTATION_EFFECT',
                description: ''
              }, {
                name: 'TUMOR_TYPE_SUMMARY',
                description: ''
              }, {
                name: 'PREVALENCE',
                description: ''
              }, {
                name: 'PROGNOSTIC_IMPLICATION',
                description: ''
              }, {
                name: 'NCCN_GUIDELINES',
                description: ''
              }, {
                name: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY',
                description: ''
              }, {
                name: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE',
                description: ''
              }, {
                name: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY',
                description: ''
              }, {
                name: 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE',
                description: ''
              }, {
                name: 'CLINICAL_TRIAL',
                description: ''
              }]
            },
            {
              attr: 'geneStatus',
              name: 'geneStatus',
              type: 'String',
              description: 'Only get genes under specific status.',
              members: [{
                name: 'All',
                description: ''
              }, {
                name: 'Complete',
                description: ''
              }]
            },
            {
              attr: 'source',
              name: 'source',
              type: 'String',
              description: 'The source ID to convert tumor types to OncoKB tumor types',
              members: [{
                name: 'quest',
                description: 'This is default option'
              }, {
                name: 'cbioportal',
                description: ''
              }]
            }
          ]
        }]
      }
    };

    NProgress.done();
  });
