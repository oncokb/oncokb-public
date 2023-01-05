import React from 'react';

import { YEAR_END_SUMMARY_RANGE } from 'app/pages/aboutGroup/AboutPageNavTab';
import { TableData } from 'app/pages/yearEndSummaryPage/BiomarkerTable';
import { LEVELS } from 'app/config/constants';

type DataKey = typeof YEAR_END_SUMMARY_RANGE[number];
export const DATA: { [key in DataKey]: TableData } = {
  '2022': {
    [LEVELS.Tx1]: [
      [
        'BRAF V600E',
        'All Solid Tumors (except Colorectal Cancer)',
        'Dabrafenib + Trametinib',
        'Novel tumor-agnostic biomarker',
      ],
      [
        'RET Fusions',
        'All Solid Tumor',
        'Selpercatinib',
        'Novel tumor-agnostic biomarker',
      ],
      [
        'ERBB2 Oncogenic Mutations',
        'Non-Small Cell Lung Cancer',
        'Trastuzumab Deruxtecan',
        'Novel clinically actionable biomarker',
      ],
      [
        'FGFR2 Fusions',
        'Cholangiocarcinoma',
        'Futibatinib',
        'Addition of a novel drug to an existing clinically actionable biomarker',
      ],
      [
        'FGFR1 Fusions',
        'Myeloid/Lymphoid Neoplasms with FGFR1 Rearrangement',
        'Pemigatinib',
        'Novel clinically actionable  biomarker',
      ],
      [
        'ALK Fusions',
        'Inflammatory Myofibroblastic Tumor',
        'Crizotinib',
        'Novel clinically actionable biomarker in this cancer type ',
      ],
      [
        'KRAS G12C',
        'Non-Small Cell Lung Cancer',
        'Adagrasib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'IDH1 R132 C/H/L/G/S',
        'Acute Myeloid Leukemia',
        'Olutasidenib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
    ],
    [LEVELS.Tx2]: [
      [
        'BRCA2 Oncogenic Mutations',
        'Uterine Sarcoma',
        'Olaparib, Rucaparib, Niraparib',
        'Novel clinically actionable biomarker in this cancer type ',
      ],
      [
        'PALB2 Oncogenic Mutations',
        'Pancreatic Cancer',
        'Rucaparib',
        'Novel clinically actionable biomarker in this cancer type ',
      ],
      [
        'BRCA1/2 Oncogenic Mutations',
        'Pancreatic Cancer',
        'Rucaparib',
        'Novel clinically actionable biomarker in this cancer type ',
      ],
      [
        'EGFR S768I, L861Q, G719',
        'Non-Small Cell Lung Cancer',
        'Osimertinib ',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'ROS1 Fusions',
        'Non-Small Cell Lung Cancer',
        'Ceritinib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'ROS1 Fusions',
        'Non-Small Cell Lung Cancer',
        'Lorlatinib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'MET Amplification',
        'Non-Small Cell Lung Cancer',
        'Capmatinib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'MET Amplification',
        'Non-Small Cell Lung Cancer',
        'Tepotinib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'ALK Fusions',
        'Inflammatory Myofibroblastic Tumors',
        'Lorlatinib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
    ],
    [LEVELS.Tx3]: [
      [
        'KRAS G12C',
        'Gastrointestinal cancers ',
        'Adagrasib',
        'Novel clinically actionable biomarker in this cancer type ',
      ],
      [
        'KRAS G12C',
        'Pancreatic cancer',
        'Sotorasib',
        'Novel clinically actionable biomarker in this cancer type ',
      ],
      [
        'TP53 Y220C',
        'Solid tumors',
        'PC14586',
        'Novel clinically actionable biomarker',
      ],
      [
        'NRG1 Fusions',
        'Non-Small Cell Lung Cancer',
        'Seribantumab',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'ROS1 Fusions',
        'Non-Small Cell Lung Cancer',
        'Repotrectinib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'NTRK1/2/3 Fusions',
        'All Solid Tumors',
        'Repotrectinib',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'EGFR L858R, exon 19 deletions & insertions, G719, L861Q, S768I',
        'Non-Small Cell Lung Cancer',
        'Patritumab Deruxtecan',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'EGFR Exon 20 insertions',
        'Non-Small Cell Lung Cancer',
        'CLN-081',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'ERBB2 Oncogenic Mutations',
        'Non-Small Cell Lung Cancer',
        'Trastuzumab + Pertuzumab + Docetaxel',
        'Addition of novel drug to an existing clinically actionable biomarker',
      ],
      [
        'KMT2A Fusions',
        'B-Lymphoblastic Leukemia/Lymphoma, Acute Myeloid Leukemia',
        'SNDX-5613 ',
        'Novel clinically actionable biomarker',
      ],
      [
        'NPM1 Oncogenic Mutations',
        'Acute Myeloid Leukemia',
        'SNDX-5613 ',
        'Novel clinically actionable biomarker',
      ],
    ],
    [LEVELS.Tx4]: [
      [
        'PIK3CA Oncogenic Mutations',
        <div style={{ minWidth: 150 }}>All Solid Tumors</div>,
        'RLY-2608',
        'Novel clinically actionable biomarker in this cancer type ',
      ],
      [
        'PIK3CA H1047R',
        'All Solid Tumors',
        'LOXO-783',
        'Novel clinically actionable biomarker in this cancer type',
      ],
      [
        'CCNE1 Amplification',
        'All Solid Tumors',
        'RP-6306 BLU-222',
        'Novel clinically actionable biomarker',
      ],
      [
        'KRAS G12D',
        'All Solid Tumors',
        'RMC-6236',
        'Novel clinically actionable biomarker',
      ],
    ],
  },
};
