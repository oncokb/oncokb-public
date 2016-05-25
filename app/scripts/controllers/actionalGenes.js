/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('oncokbStaticApp')
        .controller('actionableGenesCtrl', function($scope, $location, DTColumnDefBuilder){
            $scope.level1Genes = [
                {
                    "gene": "ABL1",
                    "variants": "BCR-ABL fusion",
                    "disease": "CML, ALL",
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
                    "variants": "10 specific missense / indels",
                    "disease": "GIST",
                    "drugs": "Imatinib, Sunitinib"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "FIP1L1-PDGFRA fusion",
                    "disease": "Hypereosinophilic Syndrome, CEL",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "Fusions",
                    "disease": "MDS/MPD",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "PDGFRB",
                    "variants": "Fusions",
                    "disease": "MDS/MPD",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "PDGFRB",
                    "variants": "COL1A1-PDGFB fusion",
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
                    "disease": "IMT",
                    "drugs": "Crizotinib, Ceritinib"
                },
                {
                    "gene": "BRAF",
                    "variants": "V600K/D/M/R/G",
                    "disease": "Melanoma",
                    "drugs": "Vemurafenib, Dabrafenib"
                },
                {
                    "gene": "BRAF",
                    "variants": "V600E/K/D/M/R/G",
                    "disease": "NSCLC, ECD",
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
                    "disease": "NSCLC",
                    "drugs": "Erlotinib, Gefitinib, Afatinib"
                },
                {
                    "gene": "KIT",
                    "variants": "K642E, L576P, V560E, V559D, D820E",
                    "disease": "Melanoma, GIST",
                    "drugs": "Imatinib, Sorafenib"
                },
                {
                    "gene": "MET",
                    "variants": "Amplification, Exon 14 skipping mt",
                    "disease": "NSCLC",
                    "drugs": "Crizotinib"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "17 specific missense / indels",
                    "disease": "GIST",
                    "drugs": "Imatinib"
                },
                {
                    "gene": "RET",
                    "variants": "Fusions",
                    "disease": "Lung Cancer",
                    "drugs": "Cabozantinib"
                },
                {
                    "gene": "TSC1",
                    "variants": "Inactivating mutations",
                    "disease": "SEGA",
                    "drugs": "Everolimus"
                },
                {
                    "gene": "TSC2",
                    "variants": "Inactivating mutations",
                    "disease": "SEGA",
                    "drugs": "Everolimus"
                }
            ];

            $scope.level3Genes = [
                {
                    "gene": "AKT1",
                    "variants": "E17K",
                    "disease": "Breast Cancer, Ovarian Cancer",
                    "drugs": "AZD5363"
                },
                {
                    "gene": "ALK",
                    "variants": "L1196M/Q, R1275Q, C1156Y",
                    "disease": "Lung Cancer, Neuroblastoma",
                    "drugs": "Brigatinib, X-396, Crizotinib"
                },
                {
                    "gene": "ARAF",
                    "variants": "S214A, S214C",
                    "disease": "ERD, Lung Cancer",
                    "drugs": "Sorafenib"
                },
                {
                    "gene": "BRAF",
                    "variants": "Fusions",
                    "disease": "Ovarian Cancer, Spindle Cell Neoplasms",
                    "drugs": "Paclitaxel + Selumetinib, Sorafenib + Temsirolimus"
                },
                {
                    "gene": "BRAF",
                    "variants": "K601E, L579Q/R/S/V",
                    "disease": "Melanoma",
                    "drugs": "Trametinib, TAK-733"
                },
                {
                    "gene": "EGFR",
                    "variants": "Exon 19 deletions/insertions A763_Y764insFQEA, EGFR-KDD, L858R, T790M",
                    "disease": "Lung Cancer",
                    "drugs": "First, Second and Third generation EGFR TKIs"
                },
                {
                    "gene": "EGFR",
                    "variants": "S492R",
                    "disease": "Colorectal Cancer",
                    "drugs": "Panitumumab"
                },
                {
                    "gene": "ERBB2",
                    "variants": "Amplification, Activating mutations, S618_S634indel, V659E",
                    "disease": "Breast Cancer, Lung Cancer",
                    "drugs": "Neratinib, Trastuzumab + Lapatinib, Dacomitinib, Afatinib, Lapatinib"
                },
                {
                    "gene": "ERCC2",
                    "variants": "Inactivating mutations",
                    "disease": "Bladder cancer",
                    "drugs": "Cisplatin"
                },
                {
                    "gene": "FGFR1",
                    "variants": "Amplification, BCR-FGFR1 Fusion",
                    "disease": "Multiple tumor types",
                    "drugs": "Dovitinib, Ponatinib, AZD4547"
                },
                {
                    "gene": "FGFR2",
                    "variants": "Amplification, Fusions",
                    "disease": "Multiple tumor types",
                    "drugs": "Dovitinib, JNJ-42756493"
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
                    "disease": "AML",
                    "drugs": "Sorafenib"
                },
                {
                    "gene": "IDH2",
                    "variants": "R140Q + 13 activating mutations",
                    "disease": "Hematological Tumors",
                    "drugs": "AG-221"
                },
                {
                    "gene": "JAK2",
                    "variants": "PCM1-JAK2 Fusion",
                    "disease": "CEL",
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
                    "disease": "Lung Cancer, Ovarian Cancer",
                    "drugs": "MEK inhibitor combinations"
                },
                {
                    "gene": "MAP2K1",
                    "variants": "Q56_V60del + 10 specific missense mt",
                    "disease": "Multiple cancer types",
                    "drugs": "MEK and ERK inhibitors"
                },
                {
                    "gene": "MET",
                    "variants": "Exon 14 skipping mutations",
                    "disease": "Lung Cancer",
                    "drugs": "Capmatinib, Cabozantinib"
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
                    "disease": "Melanoma, Thyroid Cancer",
                    "drugs": "MEK inhibitors (monotherapy/combinations)"
                },
                {
                    "gene": "NTRK1",
                    "variants": "Fusions",
                    "disease": "All Tumors",
                    "drugs": "LOXO-101"
                },
                {
                    "gene": "PDGFRA",
                    "variants": "BCR-PDGFRA, D842V",
                    "disease": "CML, GIST",
                    "drugs": "Imatinib, Sorafenib"
                },
                {
                    "gene": "PIK3CA",
                    "variants": "Activating mutations",
                    "disease": "Breast Cancer",
                    "drugs": "Apelisib"
                },
                {
                    "gene": "PTCH1",
                    "variants": "Truncating Mutations",
                    "disease": "BCC, Medulloblastoma",
                    "drugs": "Sonidegib, Vismodegib"
                },
                {
                    "gene": "PTEN",
                    "variants": "Inactivating mutations",
                    "disease": "Endometrial Cancer",
                    "drugs": "Olaparib"
                },
                {
                    "gene": "RICTOR",
                    "variants": "Amplification",
                    "disease": "Lung Cancer",
                    "drugs": "AZD2014, CC-223, MLN0128"
                },
                {
                    "gene": "ROS1",
                    "variants": "TFG-ROS1",
                    "disease": "IMT",
                    "drugs": "Crizotinib"
                }
            ];
            $scope.data = [{name: 'a', firstname: 'jiaojiao', lastname:'wang'},{name: 'b', firstname: 'jiaojiao', lastname:'wang'},{name: 'c', firstname: 'jiaojiao', lastname:'wang'}];
            $scope.biologicalDT = {};
            $scope.biologicalDT.dtOptions = {
                paging: false,
                scrollY: 481,
                hasBootstrap: true
            };
            $scope.biologicalDT.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3)
            ];

            $scope.clickGene = function(gene) {
              $location.path('/gene/' + gene);
            };
        });
























































































