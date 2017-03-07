'use strict';

/**
 * @ngdoc function
 * @name oncokbStaticApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oncokbStaticApp
 */
angular.module('oncokbStaticApp')
    .controller('NewsCtrl', function($scope) {
        $scope.data = {};
        $scope.data.updatedActionableGenes = {
            '03072017': {
                'Level 1': [
                    'Updated variants for EGFR - Non-Small Cell Lung Cancer - EGFR TKIs',
                    'Updated variants for KIT - Gastrointestinal Stromal Tumor - Imatinib, Sunitinib, Regorafenib'
                ],
                'Level 2': [
                    'CDK4 - Amplification - Well-Differentiated Liposarcoma/Dedifferentiated Liposarcoma - Palbociclib, Abemaciclib (<b>disease changed from Soft Tissue Sarcoma and Abemaciclib added</b>)',
                    'TSC1 - Renal Cell Carcinoma - Everolimus (<b>new association</b>)'
                ],
                'Level 3': [
                    'ESR1 - Oncogenic Mutations - AZD9496, Fulvestrant (<b>new association</b>)',
                    'FGFR1 - Amplification - Breast Cancer - Dovitinib (<b>removed</b>)',
                    'FGFR1 - Amplification - Lung Squamous Cell Carcinoma - Debio1347 (<b>new association</b>)',
                    'FGFR2 - Amplification - Breast Cancer - Dovitinib (<b>removed</b>)',
                    'FGFR2/3 - Fusions - Various tumor types - Debio1347 (<b>new association</b>)',
                    'FGFR3 - Hotspots - Bladder Cancer - Debio1347, JNJ-42756493 (<b>new association</b>)',
                    'KRAS - Oncogenic Mutations - Colorectal Cancer - Atezolizumab+Cobimetinib (<b>moved from Level 4 to 3A only in CRC</b>)',
                    'MDM2 - Amplification - Liposarcoma - DS-3032b and RG7112 (<b>new association</b>)',
                    'PIK3CA - Oncogenic Mutations - Breast Cancer - Alpelisib+Fulvestrant, Buparlisib+Fulvestrant, Copanlisib, GDC0077, Serabelisib, Fulvestrant+Taselisib (<b>new drugs added</b>)'
                ],
                'Level 4': [
                    'EGFR variants - Glioma - Erlotinib (<b>removed</b>)',
                    'MDM2 - Amplification - Liposarcoma - DS-3032b (<b>moved to Level 3A</b>)',
                    'PIK3CA - Oncogenic Mutations - Breast Cancer - Alpelisib+Fulvestrant (<b>moved to Level 3A</b>)',
                    'IDH1 - R132 variants - Chondrosarcoma - AG-120 (<b>moved from Level 3A to 4</b>)'
                ]
            }
        };
    });
