/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('oncokbStaticApp')
        .controller('actionableGenesCtrl', function ($scope, $location, DTColumnDefBuilder) {
            $scope.level1Genes = [
                {
                    "gene": "ABL",
                    "variants": "BCR-ABL Fusion",
                    "disease": "Chronic myeloid leukemia,         Acute lymphoblastic leukemia",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "ALK",
                    "variants": "Fusions",
                    "disease": "Lung cancer",
                    "drugs": "Crizotinib, Ceritinib, Alectinib"
                },
                {
                    "gene": "BRAF",
                    "variants": "V600E/K",
                    "disease": "Melanoma",
                    "drugs": "Trametinib, Dabrafenib, Vemurafenib"
                },
                {
                    "gene": "EGFR",
                    "variants": "Exon 19 deletions, L858R",
                    "disease": "Lung cancer",
                    "drugs": "Erlotinib, Afatinib, Gefitinib"
                },
                {
                    "gene": "EGFR",
                    "variants": "T790M",
                    "disease": "Lung cancer",
                    "drugs": "Osimertinib"
                },
                {
                    "gene": "ERBB2",
                    "variants": "Amplification",
                    "disease": "Breast cancer",
                    "drugs": "Trastuzumab, T-DM1, Pertuzumab, Lapatinib"
                },
                {
                    "gene": "ERBB2",
                    "variants": "Amplification",
                    "disease": "Gastric cancer",
                    "drugs": "Trastuzumab"
                },
                {
                    "gene": "KIT",
                    "variants": "10 specific missense mutations / indels",
                    "disease": "Gastrointestinal stromal tumor",
                    "drugs": "Imatinib, Sunitinib, Regorafenib"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "FIP1L1-PDGFRA Fusion",
                    "disease": "Hypereosinophilic syndrome, Chronic eosinophilic leukemia",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "Fusions",
                    "disease": "Myelodysplastic /myeloproliferative disease",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "PDGFRB",
                    "variants": "Fusions",
                    "disease": "Myelodysplastic /myeloproliferative disease",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "PDGFB",
                    "variants": "COL1A1-PDGFB Fusion",
                    "disease": "Dermatofibrosarcoma Protuberans",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "ROS1",
                    "variants": "Fusions",
                    "disease": "Lung cancer",
                    "drugs": "Crizotinib"
                }
            ];
            $scope.level2Genes = [
                {
                    "gene": "ALK",
                    "variants": "Fusions",
                    "disease": "Inflammatory myofibroblastic tumor",
                    "drugs": "Crizotinib, Ceritinib"
                },
                {
                    "gene": "BRAF",
                    "variants": "V600E",
                    "disease": "Non-small cell lung cancer",
                    "drugs": "Dabrafenib, Trametinib"
                },
                {
                    "gene": "BRAF",
                    "variants": "V600K/D/M/R/G",
                    "disease": "Melanoma",
                    "drugs": "Vemurafenib"
                },
                {
                    "gene": "BRAF",
                    "variants": "V600E/K/D/M/R/G",
                    "disease": "Non-small cell lung cancer,                    Erdheim-Chester disease",
                    "drugs": "Vemurafenib"
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
                    "disease": "Liposarcoma",
                    "drugs": "Palbociclib"
                },
                {
                    "gene": "EGFR",
                    "variants": "G719A/C/D/S, S768I, L861Q/R",
                    "disease": "Non-small cell lung cancer",
                    "drugs": "Erlotinib, Gefitinib, Afatinib"
                },
                {
                    "gene": "KIT",
                    "variants": "K642E, L576P, V560E, V559D",
                    "disease": "Melanoma",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "KIT",
                    "variants": "D820E",
                    "disease": "Gastrointestinal stromal tumor",
                    "drugs": "Sorafenib"
                },
                {
                    "gene": "MET",
                    "variants": "Amplification, Exon 14 skipping mutations",
                    "disease": "Non-small cell lung cancer",
                    "drugs": "Crizotinib"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "17 specific missense mutations / indels",
                    "disease": "Gastrointestinal stromal tumor",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "RET",
                    "variants": "Fusions",
                    "disease": "Lung cancer",
                    "drugs": "Cabozantinib"
                },
                {
                    "gene": "TSC1",
                    "variants": "Inactivating mutations",
                    "disease": "Subependymal giant cell astrocytoma",
                    "drugs": "Everolimus"
                },
                {
                    "gene": "TSC2",
                    "variants": "Inactivating mutations",
                    "disease": "Subependymal giant cell astrocytoma",
                    "drugs": "Everolimus"
                }
            ];

            $scope.level3Genes = [
                {
                    "gene": "AKT1",
                    "variants": "E17K",
                    "disease": "Breast cancer, Ovarian cancer",
                    "drugs": "AZD5363"
                },
                {
                    "gene": "ALK",
                    "variants": "L1196M/Q",
                    "disease": "Lung cancer",
                    "drugs": "Brigatinib"
                },
                {
                    "gene": "ALK",
                    "variants": "L1196M, C1156Y",
                    "disease": "Lung cancer",
                    "drugs": "X-396"
                },
                {
                    "gene": "ALK",
                    "variants": "R1275Q",
                    "disease": "Neuroblastoma",
                    "drugs": "Crizotinib"
                },
                {
                    "gene": "ARAF",
                    "variants": "S214A; S214C",
                    "disease": "Lung cancer;                                  Erdheim–Chester disease",
                    "drugs": "Sorafenib"
                },
                {
                    "gene": "BRAF",
                    "variants": "Fusions",
                    "disease": "Ovarian cancer;                                 Spindle cell neoplasms",
                    "drugs": "Paclitaxel + Selumetinib; Sorafenib + Temsirolimus"
                },
                {
                    "gene": "BRAF",
                    "variants": "K601E; L579Q/R/S/V",
                    "disease": "Melanoma",
                    "drugs": "Trametinib; TAK-733"
                },
                {
                    "gene": "EGFR",
                    "variants": "Exon 19 deletions/insertions, A763_Y764insFQEA, EGFR-KDD, L858R, T790M",
                    "disease": "Lung cancer",
                    "drugs": "First, Second and Third generation EGFR TKIs"
                },
                {
                    "gene": "EGFR",
                    "variants": "S492R",
                    "disease": "Colorectal cancer",
                    "drugs": "Panitumumab"
                },
                {
                    "gene": "ERBB2",
                    "variants": "Amplification; Activating mutations",
                    "disease": "Breast cancer",
                    "drugs": "Neratinib, Trastuzumab + Lapatinib; Neratinib"
                },
                {
                    "gene": "ERBB2",
                    "variants": "S618_S634indel; V659E",
                    "disease": "Lung cancer",
                    "drugs": "Dacomitinib, Afatinib; Lapatinib"
                },
                {
                    "gene": "ERCC2",
                    "variants": "Inactivating mutations",
                    "disease": "Bladder cancer",
                    "drugs": "Cisplatin"
                },
                {
                    "gene": "FGFR1",
                    "variants": "Amplification; BCR-FGFR1 Fusion",
                    "disease": "Multiple tumor types",
                    "drugs": "Dovitinib, AZD4547; Ponatinib"
                },
                {
                    "gene": "FGFR2",
                    "variants": "Amplification; Fusions",
                    "disease": "Multiple tumor types",
                    "drugs": "Dovitinib; JNJ-42756493"
                },
                {
                    "gene": "FGFR3",
                    "variants": "FGFR3-TACC3 Fusion",
                    "disease": "Multiple tumor types",
                    "drugs": "JNJ-42756493"
                },
                {
                    "gene": "FLT3",
                    "variants": "FLT3-ITD",
                    "disease": "Acute myeloid leukemia",
                    "drugs": "Sorafenib"
                },
                {
                    "gene": "IDH1",
                    "variants": "R132C/G/S/H/L/P",
                    "disease": "Acute myeloid leukemia",
                    "drugs": "AG-120"
                },
                {
                    "gene": "IDH2",
                    "variants": "R140 and R172 mutations",
                    "disease": "Hematological tumors",
                    "drugs": "AG-221"
                },
                {
                    "gene": "JAK2",
                    "variants": "PCM1-JAK2 Fusion",
                    "disease": "Chronic eosinophilic leukemia",
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
                    "variants": "Activating mutations",
                    "disease": "Lung cancer, Ovarian cancer",
                    "drugs": "MEK inhibitor combinations"
                },
                {
                    "gene": "MAP2K1",
                    "variants": "Q56_V60del + 10 specific missense mutations",
                    "disease": "Multiple cancer types",
                    "drugs": "MEK and ERK inhibitors"
                },
                {
                    "gene": "MET",
                    "variants": "Exon 14 skipping mutations",
                    "disease": "Lung cancer",
                    "drugs": "Capmatinib, Cabozantinib"
                },
                {
                    "gene": "MTOR",
                    "variants": "E2014K",
                    "disease": "Bladder cancer",
                    "drugs": "Everolimus"
                },
                {
                    "gene": "NRAS",
                    "variants": "Activating mutations",
                    "disease": "Melanoma, Thyroid cancer",
                    "drugs": "MEK inhibitors (monotherapy/combinations)"
                },
                {
                    "gene": "NTRK1",
                    "variants": "Fusions",
                    "disease": "All cancer types",
                    "drugs": "LOXO-101"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "BCR-PDGFRA; D842V",
                    "disease": "Chronic myeloid leukemia;       Gastrointestinal stromal tumor",
                    "drugs": "Imatinib; Sorafenib"
                },
                {
                    "gene": "PIK3CA",
                    "variants": "Activating mutations",
                    "disease": "Breast cancer",
                    "drugs": "Apelisib"
                },
                {
                    "gene": "PTCH1",
                    "variants": "Truncating mutations",
                    "disease": "Basal cell carcinoma; Medulloblastoma",
                    "drugs": "Sonidegib, Vismodegib; Sonidegib"
                },
                {
                    "gene": "PTEN",
                    "variants": "Inactivating mutations",
                    "disease": "Endometrial cancer",
                    "drugs": "Olaparib"
                },
                {
                    "gene": "RICTOR",
                    "variants": "Amplification",
                    "disease": "Lung cancer",
                    "drugs": "AZD2014, CC-223, MLN0128"
                },
                {
                    "gene": "RET",
                    "variants": "Fusions",
                    "disease": "Lung cancer",
                    "drugs": "Vandetinib"
                },
                {
                    "gene": "ROS1",
                    "variants": "TFG-ROS1 Fusion",
                    "disease": "Inflammatory myofibroblastic tumor",
                    "drugs": "Crizotinib"
                }
            ];

            $scope.biologicalDT = {};
            $scope.biologicalDT.dtOptions = {
                paging: false,
                scrollY: 481,
                scrollCollapse: true,
                hasBootstrap: true
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
























































































