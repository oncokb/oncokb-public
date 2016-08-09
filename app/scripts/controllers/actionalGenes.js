/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('oncokbStaticApp')
        .controller('actionableGenesCtrl', function ($scope, $location, DTColumnDefBuilder) {
            $scope.level1Genes = [
              {
                "gene": "ABL1",
                "variants": "BCR-ABL1 Fusion",
                "disease": "Acute Lymphoid Leukemia, Chronic Myelogenous Leukemia",
                "drugs": "Imatinib, Nilotinib"
              },
              {
                "gene": "ALK",
                "variants": "Fusions",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Crizotinib, Ceritinib, Alectinib"
              },
              {
                "gene": "BRAF",
                "variants": "V600E/K",
                "disease": "Melanoma",
                "drugs": "Dabrafenib + Trametinib, Vemurafenib + Cobimetinib, Dabrafenib, Trametinib, Vemurafenib"
              },
              {
                "gene": "EGFR",
                "variants": "Exon 19 deletions and insertions, L858R, G719, L861, S768I, A763_Y764insFQEA and other confirmed EGFR TKI sensitizing alterations",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Erlotinib, Afatinib, Gefitinib"
              },
              {
                "gene": "EGFR",
                "variants": "T790M",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Osimertinib"
              },
              {
                "gene": "ERBB2",
                "variants": "Amplification",
                "disease": "Breast Cancer",
                "drugs": "Trastuzumab, Ado-trastuzumab emtansine, Lapatinib, Pertuzumab"
              },
              {
                "gene": "ERBB2",
                "variants": "Amplification",
                "disease": "Stomach Adenocarcinoma",
                "drugs": "Trastuzumab"
              },
              {
                "gene": "KIT",
                "variants": "Y578C, V560D, V560del, K642E, V559D, L576P, M541L, D419del, K550_W557del, P551_E554del, Y553N, V555_L576del, V555_V559del, W557_K558del, V559G, V559del, V560G, E554_V559del, K558N, V559C, I563_L576del, V569_L576del, Y570H, P573_D579del, P577_W582delinsPYD, D579del, I653T, N822H, P838L, K558_V559del, M552_W557del, Y553_K558del, V559_V560del, T574insTQLPYD",
                "disease": "Gastrointestinal Stromal Tumor",
                "drugs": "Imatinib"
              },
              {
                "gene": "KIT",
                "variants": "A502_Y503dup, K558delinsNP, V560D, V560del, V654A, V559D, D820E, L576P, K550_W557del, K550_K558del, P551_E554del, P551_M552del, E554_K558del, V555_L576del, W557_K558del, D579del, T670I, H697Y",
                "disease": "Gastrointestinal Stromal Tumor",
                "drugs": "Sunitinib"
              },
              {
                "gene": "KIT",
                "variants": "K558NP, V560D, D820Y, N822K, K550_W557del, W557_K558del, D816G",
                "disease": "Gastrointestinal Stromal Tumor",
                "drugs": "Regorafenib"
              },
              {
                "gene": "KRAS",
                "variants": "Wildtype",
                "disease": "Colorectal Cancer",
                "drugs": "Cetuximab, Panitumumab, Regorafenib"
              },
              {
                "gene": "PDGFRA",
                "variants": "Fusions",
                "disease": "Myelodysplasia, Myeloproliferative Neoplasm",
                "drugs": "Imatinib"
              },
              {
                "gene": "PDGFRA",
                "variants": "FIP1L1-PDGFRA Fusion",
                "disease": "Leukemia",
                "drugs": "Imatinib"
              },
              {
                "gene": "PDGFRB",
                "variants": "Fusions",
                "disease": "Myelodysplasia, Myeloproliferative Neoplasm",
                "drugs": "Imatinib"
              },
              {
                "gene": "ROS1",
                "variants": "Fusions",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Crizotinib"
              }
            ];
            $scope.level2Genes = [
              {
                "gene": "ALK",
                "variants": "Fusions",
                "disease": "Soft Tissue Sarcoma",
                "drugs": "Crizotinib, Ceritinib"
              },
              {
                "gene": "BRAF",
                "variants": "V600E/K/D/R/M/G",
                "disease": "Histiocytosis",
                "drugs": "Vemurafenib"
              },
              {
                "gene": "BRAF",
                "variants": "V600D/R/M/G",
                "disease": "Melanoma",
                "drugs": "Vemurafenib"
              },
              {
                "gene": "BRAF",
                "variants": "V600E/K/D/R/M/G",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Trametinib + Dabrafenib, Dabrafenib, Vemurafenib"
              },
              {
                "gene": "BRCA1",
                "variants": "Inactivating mutations",
                "disease": "Ovarian Cancer",
                "drugs": "Olaparib"
              },
              {
                "gene": "BRCA2",
                "variants": "Inactivating mutations",
                "disease": "Ovarian Cancer",
                "drugs": "Olaparib"
              },
              {
                "gene": "CDK4",
                "variants": "Amplification",
                "disease": "Soft Tissue Sarcoma",
                "drugs": "Palbociclib"
              },
              {
                "gene": "KIT",
                "variants": "A502_Y503dup, V559D, D820E, W557_K558del, V560G, D816F/Y, L576P",
                "disease": "Gastrointestinal Stromal Tumor",
                "drugs": "Dasatinib"
              },
              {
                "gene": "KIT",
                "variants": "V560D, K642E, V654A, D820Y, V559D, L576P, V555_L576del, W557_K558del, Y568_Y570delinsFF, D816V, D820G",
                "disease": "Gastrointestinal Stromal Tumor",
                "drugs": "Nilotinib"
              },
              {
                "gene": "KIT",
                "variants": "V560D, K642E, D820E, W557_K558del, P577_D579del, T670I, D820G",
                "disease": "Gastrointestinal Stromal Tumor",
                "drugs": "Sorafenib"
              },
              {
                "gene": "KIT",
                "variants": "Y578C, V530I, V560D, V560del, K642E, V559D, L576P, M541L, D419del, K550_W557del, P551_E554del, Y553N, V555_L576del, V555_V559del, W557_K558del, V559G, V559del, V560G, E554_V559del, K558N, V559C, I563_L576del, V569_L576del, Y570H, P573_D579del, P577_W582insPYD, D579del, I653T, N822H, P838L, K558_V559del, M552_W557del, Y553_K558del, V559_V560del, T574insTQLPYD",
                "disease": "Melanoma",
                "drugs": "Imatinib"
              },
              {
                "gene": "MET",
                "variants": "Amplification, Exon 14-skipping mutations",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Crizotinib"
              },
              {
                "gene": "PDGFRA",
                "variants": "560_561insER, 566_571delinsR, A633T, C450ins, C456_N468del, C456_R481del, D842_H845del,D842_M844del, D842I, D842V, D846Y, E311_K312del, G853D, H650Q, H845Y, I843del, N659K, N659R, N659S, N848K, P577S, Q579R, R748G, R841K, S584, S584L, V469A, V536E, V544ins, V561A, V561D, V568A, V658A, W559_R560del, Y375_K455del, Y555C, Y849C/S",
                "disease": "Gastrointestinal Stromal Tumor",
                "drugs": "Imatinib"
              },
              {
                "gene": "RET",
                "variants": "Fusions",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Cabozantinib"
              },
              {
                "gene": "TSC1",
                "variants": "Inactivating mutations",
                "disease": "CNS Cancer",
                "drugs": "Everolimus"
              },
              {
                "gene": "TSC2",
                "variants": "Inactivating mutations",
                "disease": "CNS Cancer",
                "drugs": "Everolimus"
              }
            ];

            $scope.level3Genes = [
              {
                "gene": "AKT1",
                "variants": "E17K",
                "disease": "Breast Cancer, Cervical Cancer, Endometrial Cancer, Ovarian Cancer, Lung Cancer",
                "drugs": "AZD5363"
              },
              {
                "gene": "ALK",
                "variants": "R1275Q",
                "disease": "Embryonal Tumor",
                "drugs": "Crizotinib"
              },
              {
                "gene": "ALK",
                "variants": "L1196M/Q",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Brigatinib"
              },
              {
                "gene": "ARAF",
                "variants": "S214A",
                "disease": "Histiocytosis",
                "drugs": "Sorafenib"
              },
              {
                "gene": "ARAF",
                "variants": "S214C",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Sorafenib"
              },
              {
                "gene": "BRAF",
                "variants": "K601E",
                "disease": "Melanoma",
                "drugs": "Trametinib"
              },
              {
                "gene": "BRAF",
                "variants": "L597Q/R/S/V",
                "disease": "Melanoma",
                "drugs": "Trametinib, TAK-733"
              },
              {
                "gene": "BRAF",
                "variants": "CUL1-BRAF Fusion",
                "disease": "Ovarian Cancer",
                "drugs": "Paclitaxel + Selumetinib"
              },
              {
                "gene": "BRAF",
                "variants": "KIAA1549-BRAF Fusion",
                "disease": "Soft Tissue Sarcoma",
                "drugs": "Sorafenib + Temsirolimus"
              },
              {
                "gene": "EGFR",
                "variants": "S492R",
                "disease": "Colorectal Cancer",
                "drugs": "Panitumumab"
              },
              {
                "gene": "EGFR",
                "variants": "Exon 19 deletions and insertions, L858R, G719, L861, S768I, A763_Y764insFQEA and other confirmed EGFR TKI sensitizing alterations",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Dacomitinib"
              },
              {
                "gene": "ERBB2",
                "variants": "Amplification",
                "disease": "Breast Cancer",
                "drugs": "Neratinib, Lapatinib + Trastuzumab"
              },
              {
                "gene": "ERBB2",
                "variants": "Activating mutations",
                "disease": "Breast Cancer",
                "drugs": "Neratinib"
              },
              {
                "gene": "ERBB2",
                "variants": "V659E",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Lapatinib"
              },
              {
                "gene": "ERCC2",
                "variants": "D609E/G, E606G, G665A, N238S, P463L, V242F, Y24C",
                "disease": "Bladder Cancer",
                "drugs": "Cisplatin"
              },
              {
                "gene": "FGFR1",
                "variants": "Amplification",
                "disease": "Breast Cancer, Non-Small Cell Lung Cancer",
                "drugs": "Dovitinib, AZD4547"
              },
              {
                "gene": "FGFR1",
                "variants": "BCR-FGFR1 Fusion",
                "disease": "Leukemia",
                "drugs": "Ponatinib"
              },
              {
                "gene": "FGFR2",
                "variants": "Fusions",
                "disease": "Adrenocortical Carcinoma, Bladder Cancer, Endometrial Cancer",
                "drugs": "JNJ-42756493"
              },
              {
                "gene": "FGFR2",
                "variants": "Amplification",
                "disease": "Breast Cancer",
                "drugs": "Dovitinib"
              },
              {
                "gene": "FGFR3",
                "variants": "FGFR3-TACC3 Fusion",
                "disease": "Adrenocortical Carcinoma, Bladder Cancer, Glioma",
                "drugs": "JNJ-42756493"
              },
              {
                "gene": "FLT3",
                "variants": "FLT3-ITD",
                "disease": "Acute Myeloid Leukemia",
                "drugs": "Sorafenib"
              },
              {
                "gene": "IDH1",
                "variants": "R132C/G/H/Q",
                "disease": "Acute Myeloid Leukemia",
                "drugs": "AG-120"
              },
              {
                "gene": "IDH2",
                "variants": "R140G/K/Q/M/S",
                "disease": "All Liquid Tumors",
                "drugs": "AG-221"
              },
              {
                "gene": "JAK2",
                "variants": "PCM1-JAK2 Fusion",
                "disease": "Leukemia",
                "drugs": "Ruxolitinib"
              },
              {
                "gene": "KIT",
                "variants": "L576P",
                "disease": "Melanoma",
                "drugs": "Dasatinib, Nilotinib"
              },
              {
                "gene": "KRAS",
                "variants": "Wildtype",
                "disease": "Colorectal Cancer",
                "drugs": "Erlotinib + Cetuximab + Chemotherapy"
              },
              {
                "gene": "KRAS",
                "variants": "Activating mutations",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Docetaxel + Selumetinib"
              },
              {
                "gene": "KRAS",
                "variants": "Activating mutations",
                "disease": "Ovarian Cancer",
                "drugs": "Alpelisib + Binimetinib"
              },
              {
                "gene": "MAP2K1",
                "variants": "Activating mutations",
                "disease": "Ovarian Cancer, Histiocytosis, Melanoma, Non-Small Cell Lung Cancer",
                "drugs": "Selumetinib, Trametinib, Cobimetinib"
              },
              {
                "gene": "MET",
                "variants": "Exon 14 splice mutations",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Cabozatinib, Capmatinib"
              },
              {
                "gene": "MTOR",
                "variants": "E2014K",
                "disease": "Bladder Cancer",
                "drugs": "Everolimus"
              },
              {
                "gene": "NRAS",
                "variants": "Activating mutations",
                "disease": "Melanoma",
                "drugs": "Binimetinib, Binimetinib + LEE011"
              },
              {
                "gene": "NRAS",
                "variants": "Activating mutations",
                "disease": "Thyroid Cancer",
                "drugs": "Radioiodine Uptake Therapy + Selumetinib"
              },
              {
                "gene": "NTRK1",
                "variants": "Fusions",
                "disease": "All Tumors",
                "drugs": "LOXO-101"
              },
              {
                "gene": "PIK3CA",
                "variants": "Activating mutations",
                "disease": "Breast Cancer",
                "drugs": "Alpelisib"
              },
              {
                "gene": "PTCH1",
                "variants": "Truncating Mutations",
                "disease": "Embryonal Tumor",
                "drugs": "Sonidegib"
              },
              {
                "gene": "PTCH1",
                "variants": "Truncating Mutations",
                "disease": "Skin Cancer, Non-Melanoma",
                "drugs": "Vismodegib, Sonidegib"
              },
              {
                "gene": "RET",
                "variants": "Fusions",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Vandetanib"
              },
              {
                "gene": "ROS1",
                "variants": "D2033N",
                "disease": "Non-Small Cell Lung Cancer",
                "drugs": "Cabozantinib"
              }
            ];


            $scope.biologicalDT = {};
            $scope.biologicalDT.dtOptions = {
                paging: false,
                scrollY: 481,
                scrollCollapse: true,
                hasBootstrap: true,
                columnDefs: [
                  { responsivePriority: 1, targets: 0, "width": "10%" },
                  { responsivePriority: 2, targets: 1, "width": "40%" },
                  { responsivePriority: 3, targets: 2, "width": "30%" },
                  { responsivePriority: 4, targets: 3, "width": "20%" }
                ],
                responsive: {
                  details: {
                    display: $.fn.dataTable.Responsive.display.childRowImmediate,
                    type: '',
                    renderer: function(api, rowIdx, columns) {
                      var data = $.map(columns, function(col, i) {
                        return col.hidden ?
                        '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                        '<td>' + col.title + ':' + '</td> ' +
                        '<td>' + col.data + '</td>' +
                        '</tr>' :
                          '';
                      }).join('');

                      return data ?
                        $('<table/>').append(data) :
                        false;

                    }
                  }
                }
            };
            $scope.biologicalDT.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3)
            ];

            $scope.clickGene = function (gene) {
                $location.path('/gene/' + gene);
            };
        });
























































































