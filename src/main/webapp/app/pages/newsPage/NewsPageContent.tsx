import React from 'react';
import { Row, Col } from 'react-bootstrap';
import SearchOneImg from 'content/images/search_advanced_1.png';
import SearchTwoImg from 'content/images/search_advanced_2.png';
import ClinicalImg from 'content/images/cbioportal-clinical.png';
import BiologicalImg from 'content/images/cbioportal-biological.png';
import ERBBImg from 'content/images/ERBB.png';
import {
  ElementType,
  SimpleTable,
  SimpleTableCell
} from 'app/components/SimpleTable';
import { NewlyAddedGeneType } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE, WEBINAR_LINKS_05072020 } from 'app/config/constants';
import {
  AlterationPageLink,
  GenePageLink,
  MSILink
} from 'app/shared/utils/UrlUtils';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import { Linkout } from 'app/shared/links/Linkout';
import Iframe from 'react-iframe';
import { SHOW_MODAL_KEY } from '../AboutPage';

export type NewsData = {
  priorityNews?: ElementType[];
  news?: ElementType[];
  newlyAddedGenes?: string[];
  newlyAddedGenesTypes?: NewlyAddedGeneType[];
  updatedImplication?: ElementType[][];
  numOfAssociationsInUpdatedImplication?: number;
  updatedImplicationInOldFormat?: { [level: string]: ElementType[] };
  changedAnnotation?: ElementType[][];
};

export const NEWLY_ADDED_LEVEL_FOUR_COLUMNS = [
  { name: 'Gene', size: 2 },
  { name: 'Mutation', size: 6 },
  { name: 'Tumor Type', size: 2 },
  { name: 'Drug', size: 2 }
];

export const UPDATED_IMPLICATION_COLUMNS = [
  { name: 'Level' },
  { name: 'Gene' },
  { name: 'Mutation' },
  { name: 'Tumor Type' },
  { name: 'Drug' },
  { name: 'Evidence' }
];

export const UPDATED_IMPLICATION_OLD_FORMAT_COLUMNS = [
  { name: 'Level' },
  { name: 'Update' }
];

export const CHANGED_ANNOTATION_COLUMNS = [
  { name: 'Gene' },
  { name: 'Mutation' },
  { name: 'Tumor Type' },
  { name: 'Drug' },
  { name: 'Previous Level' },
  { name: 'Current Level' },
  { name: 'Reason' }
];

export const NEWLY_ADDED_LEVEL_FOUR = [
  ['ATM', 'Oncogenic Mutations', 'Prostate Cancer', 'Olaparib'],
  [
    'BRAF',
    'D287H, D594A, D594G, D594H, D594N, F595L, G464E, G464V, G466A, G466E, G466V, G469A, G469E, G469R, G469V, G596D, G596R, K601N, K601T, L597Q, L597V, N581I, N581S, S467L, V459L',
    'All Tumors',
    'PLX8394'
  ],
  [
    'CDKN2A',
    'Oncogenic Mutations',
    'All Tumors',
    'Abemaciclib, Palbociclib, Ribociclib'
  ],
  ['EGFR', 'A289V, R108K, T263P', 'Glioma', 'Lapatinib'],
  ['EGFR', 'Amplification', 'Glioma', 'Lapatinib'],
  ['EWSR1', 'EWSR1-FLI1 Fusion', 'Ewing Sarcoma', 'TK216'],
  [
    'FGFR1',
    'Oncogenic Mutations',
    'All Tumors',
    'AZD4547, BGJ398, Debio1347, Erdafitinib'
  ],
  [
    'FGFR2',
    'Oncogenic Mutations',
    'All Tumors',
    'AZD4547, BGJ398, Debio1347, Erdafitinib'
  ],
  [
    'KRAS',
    'Oncogenic Mutations',
    'All Tumors',
    'KO-947, LY3214996, Ravoxertinib, Ulixertinib'
  ],
  ['MTOR', 'Oncogenic Mutations', 'All Tumors', 'Everolimus, Temsirolimus'],
  ['NF1', 'Oncogenic Mutations', 'All Tumors', 'Cobimetinib, Trametinib'],
  ['PTEN', 'Oncogenic Mutations', 'All Tumors', 'AZD8186, GSK2636771'],
  ['SMARCB1', 'Oncogenic Mutations', 'All Tumors', 'Tazemetostat']
];

// NOTE: cannot associate a type to the object literal in order to have the CHANGED_ANNOTATION_DATE type works
// https://stackoverflow.com/questions/41947168/is-it-possible-to-use-keyof-operator-on-literals-instead-of-interfaces

export const NEWS_BY_DATE: { [date: string]: NewsData } = {
  '07232020': {
    updatedImplication: [
      [
        '1',
        'Other Biomarkers',
        'Tumor Mutational Burden - High',
        'All Solid Tumors',
        'Pembrolizumab',
        <span>
          Abstract:{' '}
          <Linkout
            link={
              'https://www.sciencedirect.com/science/article/pii/S0923753419594042'
            }
          >
            Marabelle et al. Abstract# 1192O, ESMO 2019
          </Linkout>
          ,{' '}
          <Linkout
            link={
              'https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-pembrolizumab-adults-and-children-tmb-h-solid-tumors'
            }
          >
            FDA-approval of Pembrolizumab
          </Linkout>
        </span>
      ]
    ],
    newlyAddedGenes: ['LARP4B', 'DAZAP1', 'KLF3', 'ZNF750', 'MEF2D']
  },
  '07092020': {
    updatedImplication: [
      [
        '1',
        'SMARCB1',
        'Deletion',
        'Epithelioid Sarcoma',
        'Tazemetostat',
        <span>
          Abstract:{' '}
          <Linkout
            link={
              'https://ascopubs.org/doi/abs/10.1200/JCO.2019.37.15_suppl.11003'
            }
          >
            Stacchiotti et al. Abstract# 11003, JCO 2019
          </Linkout>
          ,{' '}
          <Linkout
            link={
              'https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-tazemetostat-advanced-epithelioid-sarcoma'
            }
          >
            FDA-approval of Tazemetostat
          </Linkout>
        </span>
      ]
    ],
    changedAnnotation: [
      [
        'EZH2',
        'A682G, A692V, Y646C, Y646F, Y646H, Y646N, Y646S',
        'Follicular Lymphoma',
        <div>Tazemetostat</div>,
        '3A',
        '1',
        <div>
          Abstract:{' '}
          <Linkout
            link={
              'https://ashpublications.org/blood/article/134/Supplement_1/123/426294/Phase-2-Multicenter-Study-of-Tazemetostat-an-EZH2'
            }
          >
            Morschhauser et al. Abstract# 123, ASH 2019
          </Linkout>
          ,{' '}
          <Linkout
            link={
              'https://www.fda.gov/drugs/fda-granted-accelerated-approval-tazemetostat-follicular-lymphoma'
            }
          >
            FDA-approval of Tazemetostat
          </Linkout>
        </div>
      ]
    ],
    newlyAddedGenes: ['PPP2R2A']
  },
  '06092020': {
    numOfAssociationsInUpdatedImplication: 15,
    updatedImplication: [
      [
        '1',
        'BRCA1, BRCA2, BARD1, BRIP1, CDK12, CHEK1, CHEK2, FANCL, PALB2, RAD51B, RAD51C, RAD51D, RAD54L',
        <span style={{ whiteSpace: 'nowrap' }}>Oncogenic Mutations</span>,
        'Prostate Cancer',
        'Olaparib',
        <span>
          <PMIDLink pmids={'32343890'} />,{' '}
          <Linkout
            link={
              'https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-olaparib-hrr-gene-mutated-metastatic-castration-resistant-prostate-cancer'
            }
          >
            FDA-approval of Olaparib
          </Linkout>
        </span>
      ],
      [
        '1',
        'BRCA1, BRCA2',
        'Oncogenic Mutations',
        <span style={{ whiteSpace: 'nowrap' }}>Prostate Cancer</span>,
        'Rucaparib',
        <span>
          Abstract:{' '}
          <Linkout
            link={
              'https://www.sciencedirect.com/science/article/pii/S0923753419590627'
            }
          >
            Abida et al. Abstract# 846PD, ESMO 2019
          </Linkout>
          ,{' '}
          <Linkout
            link={
              'https://www.fda.gov/drugs/fda-grants-accelerated-approval-rucaparib-brca-mutated-metastatic-castration-resistant-prostate'
            }
          >
            FDA-approval of Rucaparib
          </Linkout>
        </span>
      ]
    ],
    changedAnnotation: [
      [
        'ATM',
        'Oncogenic Mutations',
        'Prostate Cancer',
        <div>Olaparib</div>,
        '4',
        '1',
        <div>
          <PMIDLink pmids={'32343890'} />,{' '}
          <Linkout
            link={
              'https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-olaparib-hrr-gene-mutated-metastatic-castration-resistant-prostate-cancer'
            }
          >
            FDA-approval of Olaparib
          </Linkout>
        </div>
      ]
    ],
    newlyAddedGenes: ['FANCL']
  },
  '05112020': {
    priorityNews: [
      <span>
        We are excited to announce that our first OncoKB webinar was a success!
        You can find a video recording{' '}
        <Link
          to={{
            pathname: PAGE_ROUTE.ABOUT,
            hash: `#${SHOW_MODAL_KEY}=true`
          }}
        >
          here
        </Link>
        .
      </span>
    ],
    updatedImplication: [
      [
        '1',
        'FGFR2',
        'Fusions',
        'Cholangiocarcinoma',
        'Pemigatinib',
        <span>
          <PMIDLink pmids={'32203698'} />,{' '}
          <a
            href="https://www.fda.gov/news-events/press-announcements/fda-approves-first-targeted-treatment-patients-cholangiocarcinoma-cancer-bile-ducts"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA-approval of Pemigatinib
          </a>
        </span>
      ],
      [
        '1',
        'RET',
        'Fusions',
        'Thyroid Cancer',
        'Selpercatinib',
        <div>
          <div>
            Abstract:{' '}
            <Linkout
              link={
                'https://www.sciencedirect.com/science/article/pii/S0923753419604539'
              }
            >
              Wirth et al. Abstract# LBA93, ESMO 2019;
            </Linkout>
          </div>
          <div>
            <Linkout
              link={
                'https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-selpercatinib-lung-and-thyroid-cancers-ret-gene-mutations-or-fusions'
              }
            >
              FDA-approval of Selpercatinib{' '}
            </Linkout>
          </div>
        </div>
      ],
      [
        '1',
        'ERBB2',
        'Amplification',
        'Breast Cancer',
        'Tucatinib + Trastuzumab + Capecitabine',
        <span>
          <PMIDLink pmids={'31825569'} />,{' '}
          <Linkout
            link={
              'https://www.fda.gov/news-events/press-announcements/fda-approves-first-new-drug-under-international-collaboration-treatment-option-patients-her2'
            }
          >
            FDA-approval of Tucatinib
          </Linkout>
        </span>
      ],
      [
        '1',
        'ERBB2',
        'Amplification',
        'Breast Cancer',
        'Trastuzumab Deruxtecan',
        <span>
          <PMIDLink pmids={'31825192'} />,{' '}
          <Linkout link="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-fam-trastuzumab-deruxtecan-nxki-unresectable-or-metastatic-her2-positive-breast-cancer">
            FDA-approval of Trastuzumab Deruxtecan
          </Linkout>
        </span>
      ],
      [
        '2',
        'BRAF',
        'V600E',
        'Pilocytic Astrocytoma, Pleomorphic Xanthoastrocytoma and Ganglioglioma',
        'Dabrafenib + Trametinib, Vemurafenib + Cobimetinib',
        <span>
          <span>Listing in 1.2020 CNS NCCN;</span>{' '}
          <PMIDLink
            pmids={'28984141, 29380516, 26287849, 30351999, 30120137'}
          />
        </span>
      ]
    ],
    changedAnnotation: [
      [
        'MET',
        'Exon 14 Skipping Mutations',
        'Non-Small Cell Lung Cancer',
        <div>Capmatinib</div>,
        '3A',
        '1',
        <div>
          <div>
            Abstract:{' '}
            <Linkout
              link={
                'https://ascopubs.org/doi/abs/10.1200/JCO.2019.37.15_suppl.9004'
              }
            >
              Wolf, J. et al. Abstract# 9004, ASCO 2019;
            </Linkout>
          </div>
          <div>
            <Linkout
              link={
                'https://www.fda.gov/drugs/drug-approvals-and-databases/fda-grants-accelerated-approval-capmatinib-metastatic-non-small-cell-lung-cancer'
              }
            >
              FDA-approval of Capmatinib{' '}
            </Linkout>
          </div>
        </div>
      ],
      [
        'RET',
        'Fusions',
        'Non-Small Cell Lung Cancer',
        'Selpercatinib',
        '3A',
        '1',
        <div>
          <div>
            Abstract:{' '}
            <Linkout
              link={
                'https://www.jto.org/article/S1556-0864(19)30742-7/fulltext'
              }
            >
              Drilon et al. Abstract# PL02.08, IASLC WCLC 2019;
            </Linkout>
          </div>
          <div>
            <Linkout
              link={
                'https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-selpercatinib-lung-and-thyroid-cancers-ret-gene-mutations-or-fusions'
              }
            >
              FDA-approval of Selpercatinib{' '}
            </Linkout>
          </div>
        </div>
      ],
      [
        'RET',
        'Oncogenic Mutations',
        'Medullary Thyroid Cancer',
        'Selpercatinib',
        '3A',
        '1',
        <div>
          <div>
            Abstract:{' '}
            <Linkout
              link={
                'https://www.sciencedirect.com/science/article/pii/S0923753419604539'
              }
            >
              Wirth et al. Abstract# LBA93, ESMO 2019;
            </Linkout>
          </div>
          <div>
            <Linkout
              link={
                'https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-selpercatinib-lung-and-thyroid-cancers-ret-gene-mutations-or-fusions'
              }
            >
              FDA-approval of Selpercatinib{' '}
            </Linkout>
          </div>
        </div>
      ]
    ]
  },
  '04232020': {
    updatedImplication: [
      [
        '1',
        'BRAF',
        'V600E',
        'Colorectal Cancer',
        'Encorafenib + Cetuximab',
        <span>
          <PMIDLink pmids={'31566309'} />,{' '}
          <a
            href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-encorafenib-combination-cetuximab-metastatic-colorectal-cancer-braf-v600e-mutation"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA-approval of Encorafenib + Cetuximab
          </a>
        </span>
      ],
      [
        '1',
        'NF1',
        'Oncogenic Mutations',
        'Neurofibroma',
        'Selumetinib',
        <span>
          <PMIDLink pmids={'28029918, 32187457'} />,{' '}
          <a
            href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-selumetinib-neurofibromatosis-type-1-symptomatic-inoperable-plexiform-neurofibromas"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA-approval of Selumetinib
          </a>
        </span>
      ],
      [
        '2',
        'BRAF',
        'V600E',
        'Colorectal Cancer',
        'Encorafenib + Panitumumab',
        <span>
          <span>Listing in 2.2020 Colon Cancer NCCN;</span>{' '}
          <PMIDLink pmids={'29431699, 31566309'} />
        </span>
      ],
      [
        '2',
        'ERBB2',
        'Amplification',
        'Colorectal Cancer',
        'Trastuzumab + Lapatinib',
        <span>
          <span>Listing in 2.2020 Colon Cancer NCCN;</span>{' '}
          <PMIDLink pmids={'27108243'} />
        </span>
      ],
      [
        '2',
        'ERBB2',
        'Amplification',
        'Colorectal Cancer',
        'Trastuzumab + Pertuzumab',
        <span>
          <span>Listing in 2.2020 Colon Cancer NCCN;</span>{' '}
          <PMIDLink pmids={'30857956'} />
        </span>
      ]
    ],
    changedAnnotation: [
      [
        'BRAF',
        'V600E',
        'Colorectal Cancer',
        <div>
          <div>Encorafenib + Cetuximab + Binimetinib,</div>
          <div>Dabrafenib + Panitumumab + Trametinib</div>
        </div>,
        '2',
        'None',
        'Listing removed from 2.2020 Colon Cancer NCCN'
      ]
    ],
    news: [
      <span>
        Updated EGFR biomarker-drug associations for investigational Levels 3A
        and 4
      </span>,
      <span>Updated and reorganized KIT biomarker-drug associations</span>
    ],
    newlyAddedGenes: ['DDX4', 'DDX41', 'ELMSAN1', 'MBD6']
  },
  '02122020': {
    priorityNews: [
      <span>
        The version controlled OncoKB Curation Standard Operating Procedure v1.0
        has been released in the <Link to="/about">OncoKB About</Link> page.
      </span>
    ],
    updatedImplication: [
      [
        '1',
        'PDGFRA',
        'D842V, D842Y, D842_H845del, D842_H845insV',
        'Gastrointestinal Stromal Tumor',
        'Avapritinib',
        <span>
          Abstract:{' '}
          <Linkout
            link={
              'https://ascopubs.org/doi/abs/10.1200/JCO.2019.37.15_suppl.11022'
            }
          >
            Heinrich et al. Abstract # 11022, ASCO 2019
          </Linkout>
          ;{' '}
          <Linkout link="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-avapritinib-gastrointestinal-stromal-tumor-rare-mutation">
            FDA-approval of Avapritinib; 2019
          </Linkout>
        </span>
      ],
      [
        '3A',
        'BRCA2',
        'Oncogenic Mutations',
        'Pancreatic Adenocarcinoma',
        'Rucaparib',
        <span>
          <PMIDLink pmids={'30051098'} />; Abstract:{' '}
          <a
            href="https://cancerres.aacrjournals.org/content/79/13_Supplement/CT234"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reiss Binder et al. Abstract# CT234, AACR 2019
          </a>
        </span>
      ],
      [
        '4',
        'EGFR',
        'L718V',
        'Non-Small Cell Lung Cancer',
        'Afatinib',
        <span>
          <PMIDLink pmids={'29571986, 31757379'} />
        </span>
      ],
      [
        'R2',
        'EGFR',
        'L718V',
        'Non-Small Cell Lung Cancer',
        'Osimertinib',
        <span>
          <PMIDLink pmids={'29568384, 29571986, 31301016, 31757379'} />
        </span>
      ],
      [
        'R2',
        'KIT',
        'A829P',
        'Gastrointestinal Stromal Tumor',
        'Imatinib',
        <span>
          <PMIDLink pmids={'18955458, 25239608, 31085175'} />
        </span>
      ],
      [
        'R2',
        'KIT',
        'A829P',
        'Gastrointestinal Stromal Tumor',
        'Sunitinib',
        <span>
          <PMIDLink pmids={'31085175'} />
        </span>
      ]
    ],
    newlyAddedGenes: ['AJUBA', 'ZBTB20', 'ZFP36L1']
  },
  '12122019': {
    priorityNews: [
      <span>User accounts and commercial licenses now available</span>,
      <span>OncoKB now contains annotation of over 5,000 variants</span>
    ],
    updatedImplication: [
      [
        '1',
        'FLT3',
        'D835, I836',
        'AML',
        'Gilteritinib',
        <span>
          <PMIDLink pmids={'28516360, 28645776'} /> ;{' '}
          <a
            href="https://www.fda.gov/drugs/fda-approves-gilteritinib-relapsed-or-refractory-acute-myeloid-leukemia-aml-flt3-mutatation"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA-approval of Gilteritinib
          </a>
        </span>
      ],
      [
        '1',
        <span style={{ whiteSpace: 'nowrap' }}>MSI-H</span>,
        '',
        'Colorectal Cancer',
        'Nivolumab + Ipilimumab',
        <span>
          <PMIDLink pmids={'29355075'} />;{' '}
          <a
            href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-ipilimumab-msi-h-or-dmmr-metastatic-colorectal-cancer"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA-approval of Nivolumab + Ipilimumab
          </a>
        </span>
      ],
      [
        '1',
        'ROS1',
        'Fusions',
        'NSCLC',
        'Entrectinib',
        <span>
          <PMIDLink pmids={'28183697'} />, Abstract:{' '}
          <a
            href="https://cancerres.aacrjournals.org/content/77/13_Supplement/CT060"
            target="_blank"
            rel="noopener noreferrer"
          >
            Drilon et al. Abstract# CT060, AACR 2017
          </a>{' '}
          ;{' '}
          <a
            href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-entrectinib-ntrk-solid-tumors-and-ros-1-nsclc"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA-approval of Entrectinib
          </a>
        </span>
      ],
      [
        '3A',
        'KRAS',
        'G12C',
        'NSCLC',
        'AMG-510',
        <span>
          Abstract:{' '}
          <a
            href="https://oncologypro.esmo.org/Meeting-Resources/ESMO-2019-Congress/Phase-1-Study-of-AMG-510-a-Novel-Molecule-Targeting-KRAS-G12C-Mutant-Solid-Tumors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Govindan et al. ESMO 2019
          </a>
        </span>
      ]
    ],
    changedAnnotation: [
      [
        'NTRK1/2/3',
        'Fusions',
        'All Solid Tumors',
        'Entrectinib',
        '3A',
        '1',
        <a
          href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-entrectinib-ntrk-solid-tumors-and-ros-1-nsclc"
          target="_blank"
          rel="noopener noreferrer"
        >
          FDA-approval of Entrectinib
        </a>
      ],
      [
        'ERBB2',
        'Oncogenic Mutations',
        'NSCLC',
        'Ado-trastuzumab Emtansine',
        '3A',
        '2A',
        <div>Listing in 1.2020 Non-Small Cell Lung Cancer NCCN</div>
      ],
      [
        'IDH1',
        'Oncogenic Mutations',
        'Cholangiocarcinoma',
        'Ivosidenib',
        '2B',
        '3A',
        <span>
          Abstract:{' '}
          <a
            href="https://oncologypro.esmo.org/Meeting-Resources/ESMO-2019-Congress/ClarIDHy-A-global-phase-3-randomized-double-blind-study-of-ivosidenib-IVO-vs-placebo-in-patients-with-advanced-cholangiocarcinoma-CC-with-an-isocitrate-dehydrogenase-1-IDH1-mutation"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abou-Alfa et al. Abstract# LBA10_PR, ESMO 2019
          </a>
        </span>
      ],
      [
        'PIK3CA',
        'Oncogenic Mutations',
        'Breast Cancer',
        'Alpelisib',
        '3A',
        'None',
        <div>
          Alpelisib in combination with fulvestrant is{' '}
          <a
            href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-alpelisib-metastatic-breast-cancer"
            target="_blank"
            rel="noopener noreferrer"
          >
            FDA-approved to treat patients with PIK3CA mutant breast cancer
          </a>
        </div>
      ]
    ],
    news: [
      <span>
        Refined KIT and EGFR biomarker-drug associations to strictly adhere to
        the FDA drug labels and NCCN guidelines
      </span>
    ],
    newlyAddedGenes: [
      'AGO1',
      'ALB',
      'APLNR',
      'CYP19A1',
      'DKK2',
      'DKK3',
      'DKK4',
      'GAB2',
      'HLA-C',
      'LRP5',
      'LRP6',
      'MLLT1',
      'DKK1',
      'NADK',
      'REST',
      'SCG5',
      'SFRP1',
      'SFRP2',
      'SOCS3',
      'STAT1',
      'STAT2',
      'TLE1',
      'TLE2',
      'TLE3',
      'TLE4',
      'WIF1'
    ]
  },
  '08282019': {
    newlyAddedGenes: [
      'ARHGAP35',
      'FOXF1',
      'GAB1',
      'MAD2L2',
      'SMARCA2',
      'SMARCE1'
    ],
    updatedImplication: [
      [
        '3A',
        'EZH2',
        'Oncogenic Mutations',
        'Follicular Lymphoma',
        'Tazemetostat',
        <a
          href="https://library.ehaweb.org/eha/2018/stockholm/214434/gilles.salles.interim.update.from.a.phase.2.multicenter.study.of.tazemetostat.html?f=topic=1574*media=3%27"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abstract: Morschhauser et al. Abstract# S100, EHA 2018.
        </a>
      ]
    ]
  },
  '08042019': {
    newlyAddedGenes: ['ATXN7', 'MTAP', 'SERPINB3', 'SERPINB4'],
    updatedImplication: [
      [
        '2A',
        'BRAF',
        'V600E',
        'Hairy Cell Leukemia',
        'Vemurafenib',
        <span>
          Listing in 3.2019 Hairy Cell Leukemia NCCN (
          <PMIDLink pmids={'26352686'} />)
        </span>
      ],
      [
        '3A',
        'ARAF, BRAF, RAF1, NRAS, KRAS, MAP2K2',
        'Oncogenic mutations',
        'Histiocytic and Dendritic Cell Neoplasms',
        'Cobimetinib',
        <PMIDLink pmids={'30867592'} />
      ]
    ],
    changedAnnotation: [
      [
        'BRAF',
        'D287H, D594, F595L, G466, G596, N581, S467L, V459L',
        'All Solid Tumors',
        'PLX8394',
        '4',
        'No level',
        <>
          <div>Re-review of PMID</div>
          <div>
            <PMIDLink pmids={'28783719'} />
          </div>
          <br />
          <div>
            BRAF class III mutants are not necessarily sensitive to dimer
            disrupter RAF inhibitor PLX8394
          </div>
        </>
      ]
    ]
  },
  '06212019': {
    priorityNews: [
      'Improved Actionable Genes page',
      <span>
        Updated the Cancer Genes list which now consists of 1039 genes (no
        longer referring to the{' '}
        <a
          href="https://cancer.sanger.ac.uk/cosmic/census?tier=2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cancer Gene Census Tier 2 genes
        </a>
        )
      </span>
    ],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          PIK3CA - Oncogenic Mutations - Breast Cancer - Alpelisib (
          <b>previously level 3A</b>)<br />
          May 24, 2019:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-alpelisib-metastatic-breast-cancer"
          >
            The FDA approved PI(3)-kinase alpha selective inhibitor alpelisib
          </a>{' '}
          in combination with fulvestrant, to treat patients with HR+/ HER2-
          PIK3CA-mutant advanced or metastatic breast cancer.
        </span>
      ],
      '2': [
        <span>
          BRAF - V600E - Colorectal Cancer - Encorafenib + Binimetinib +
          Cetuximab (<b>previously level 3A</b>)
        </span>,
        <span>
          ERBB2 - Amplification - Uterine Serous Carcinoma - Trastuzumab +
          Carboplatin-Paclitaxel (<b>previously level 2B</b>)
        </span>
      ]
    }
  },
  '05092019': {
    news: [
      <span>
        Standardization of therapeutic names with{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://ncit.nci.nih.gov/ncitbrowser/"
        >
          NCI thesaurus
        </a>
      </span>
    ],
    priorityNews: [
      <span>
        Addition of Actionable Genes for Hematologic Malignancies
        <Row>
          <table className="table">
            <thead>
              <tr>
                <th className="col-xs-1">Level</th>
                <th className="col-xs-1">Gene</th>
                <th className="col-xs-4">Mutation</th>
                <th className="col-xs-4">Tumor Type</th>
                <th className="col-xs-2">Drug</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={5}>1</td>
                <td rowSpan={3}>ABL1</td>
                <td rowSpan={2}>BCR-ABL1 fusion</td>
                <td>B-Lymphoblastic Leukemia/Lymphoma (BLL)</td>
                <td>Ponatinib</td>
              </tr>
              <tr>
                <td>Chronic Myelogenous Leukemia (CML)</td>
                <td>Bosutinib</td>
              </tr>
              <tr>
                <td>T315I</td>
                <td>BLL, CML</td>
                <td>Ponatinib</td>
              </tr>
              <tr>
                <td rowSpan={2}>FLT3</td>
                <td>Internal tandem duplications (ITD)</td>
                <td rowSpan={2}>Acute Myeloid Leukemia (AML)</td>
                <td>Gilteritinib</td>
              </tr>
              <tr>
                <td>Oncogenic Mutations</td>
                <td>Midostaurin + High Dose Chemotherapy</td>
              </tr>
              <tr>
                <td>R1</td>
                <td>ABL1</td>
                <td>T315I</td>
                <td>BLL, CML</td>
                <td>Imatinib, Dasatinib, Nilotinib, Bosutinib</td>
              </tr>
              <tr>
                <td rowSpan={4}>2A</td>
                <td rowSpan={4}>ABL1</td>
                <td>BCR-ABL1 fusion</td>
                <td>BLL</td>
                <td>Bosutinib, Nilotinib</td>
              </tr>
              <tr>
                <td>
                  E255K, E255V, F317C, F317I, F317L, F317V, F359C, F359I, F359V,
                  T315A, Y253H
                </td>
                <td rowSpan={3}>BLL, CML</td>
                <td>Bosutinib</td>
              </tr>
              <tr>
                <td>E255K, E255V, F359C, F359I, F359V, Y253H</td>
                <td>Dasatinib</td>
              </tr>
              <tr>
                <td>F317C, F317I, F317L, F317V, T315A, V299L</td>
                <td>Nilotinib</td>
              </tr>
              <tr>
                <td rowSpan={4}>3A</td>
                <td rowSpan={3}>ABL1</td>
                <td>BCR-ABL1 fusion</td>
                <td>CML</td>
                <td>Asciminib</td>
              </tr>
              <tr>
                <td>E255K, E255V, F359C, F359I, F359V, Y253H</td>
                <td rowSpan={2}>BLL, CML</td>
                <td>Dasatinib</td>
              </tr>
              <tr>
                <td>F317C, F317I, F317L, F317V, T315A, V299L</td>
                <td>Nilotinib</td>
              </tr>
              <tr>
                <td>FLT3</td>
                <td>ITD</td>
                <td>AML</td>
                <td>Crenolanib, Quizartinib</td>
              </tr>
              <tr>
                <td rowSpan={4}>4</td>
                <td>SF3B1</td>
                <td rowSpan={4}>Oncogenic Mutations</td>
                <td rowSpan={4}>
                  AML, Chronic Myelomonocytic Leukemia (CMML), Myelodysplastic
                  Syndrome (MDS)
                </td>
                <td rowSpan={4}>H3B-8800</td>
              </tr>
              <tr>
                <td>SRSF2</td>
              </tr>
              <tr>
                <td>U2AF1</td>
              </tr>
              <tr>
                <td>ZRSR2</td>
              </tr>
            </tbody>
          </table>
        </Row>
      </span>
    ],
    newlyAddedGenes: [
      'ATF1',
      'CCNB3',
      'CMTR2',
      'CREB1',
      'CTR9',
      'CXORF67',
      'DDIT3',
      'ETAA1',
      'ETV5',
      'FEV',
      'FLI1',
      'IL3',
      'KAT6A',
      'KBTBD4',
      'KLF2',
      'LMO2',
      'LZTR1',
      'MAF',
      'MAFB',
      'NR4A3',
      'NRG1',
      'NUP98',
      'PDGFB',
      'PGBD5',
      'PHF6',
      'PRKACA',
      'SETBP1',
      'SLFN11',
      'SPRTN',
      'SS18',
      'TCL1A',
      'TCL1B',
      'TFE3',
      'TRIP13',
      'USP8',
      'YY1',
      'ZNRF3'
    ],
    newlyAddedGenesTypes: ['heme', 'fusion'],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          April 12, 2019:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-erdafitinib-metastatic-urothelial-carcinoma"
          >
            the FDA approved erdafitinib
          </a>{' '}
          for patients with locally advanced or metastatic urothelial carcinoma,
          with susceptible FGFR3 or FGFR2 genetic alterations (FGFR2 Fusions,
          FGFR3 Fusions or FGFR3 R248C, S249C, G370C, Y373C mutations), that has
          progressed during or following platinum-containing chemotherapy.
        </span>
      ],
      '4': [
        <span>
          MET - Fusions - All Tumors - Crizotinib (<b>new association</b>)
        </span>,
        <span>
          CDK12 - Truncating Mutations - All Tumors - Pembrolizumab, Nivolumab,
          Cemiplimab (<b>new association</b>)
        </span>
      ]
    }
  },
  '01242019': {
    newlyAddedGenesTypes: ['heme'],
    newlyAddedGenes: [
      'ECT2L',
      'RELN',
      'TAL1',
      'MLLT10',
      'TLX3',
      'TLX1',
      'TRA',
      'TRB',
      'TRD',
      'TRG',
      'EPOR',
      'ABL2',
      'MECOM',
      'DEK',
      'RBM15',
      'BCL9'
    ],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          November 2, 2018:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm625027.htm"
          >
            the FDA approved lorlatinib
          </a>{' '}
          for patients with anaplastic lymphoma kinase (ALK)-positive metastatic
          non-small cell lung cancer (NSCLC) whose disease has progressed on
          crizotinib and at least one other ALK inhibitor or whose disease has
          progressed on alectinib or ceritinib for metastatic disease.
        </span>
      ]
    }
  },
  '12142018': {
    priorityNews: [
      <span>
        Inclusion of <GenePageLink hugoSymbol={'NTRK1'} /> and{' '}
        <GenePageLink hugoSymbol={'NTRK3'} /> Level R2 alterations to the
        Actionable Genes page
      </span>
    ],
    newlyAddedGenes: [
      'KSR2',
      'LCK',
      'LTB',
      'MGAM',
      'MOB3B',
      'MPEG1',
      'NCOR2',
      'PIGA',
      'PLCG1',
      'POT1',
      'ROBO1',
      'RUNX1T1',
      'SAMHD1',
      'SETD1A',
      'SGK1',
      'SMC1A',
      'SMC3',
      'SMG1',
      'SP140',
      'STAT6',
      'TBL1XR1',
      'UBR5',
      'VAV1',
      'VAV2',
      'XBP1'
    ],
    newlyAddedGenesTypes: ['heme'],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          November 26, 2018:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm626720.htm"
          >
            the FDA approved larotrectinib
          </a>{' '}
          for adult and pediatric patients with solid tumors that have an NTRK1,
          -2, or -3 gene fusion without a known acquired resistance mutation.
        </span>
      ],
      '2': [
        <span>
          BRCA1/2 - Oncogenic Mutations - Breast Cancer - Talazoparib (
          <b>new association</b>)
        </span>,
        <span>
          RET - Fusions - Non-Small Cell Lung Cancer - BLU-667 (
          <b>new association</b>)
        </span>
      ],
      '3': [
        <span>
          BRAF - V600E - Colorectal Cancer - Encorafenib + Binimetinib +
          Cetuximab (<b>new association</b>)
        </span>,
        <span>
          ERBB2 - Oncogenic Mutations - Non-Small Cell Lung Cancer -
          Ado-trastuzumab Emtansine (<b>new association</b>)
        </span>,
        <span>
          RET - Oncogenic Mutations - Medullary Thyroid Cancer - BLU-667 (
          <b>new association</b>)
        </span>
      ],
      '4': [
        <span>
          KDM6A - Oncogenic Mutations - Bladder Cancer - EZH2 inhibitors (
          <b>new association</b>)
        </span>
      ]
    }
  },
  '11022018': {
    updatedImplicationInOldFormat: {
      '2': [
        <span>
          RET - Fusions - Non-Small Cell Lung Cancer - LOXO-292 (
          <b>added as new association</b>)
        </span>
      ]
    }
  },
  '10262018': {
    news: [
      <span>
        OncoTree updated from version{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://oncotree.mskcc.org/#/home?version=oncotree_2017_06_21"
        >
          2017_06_21
        </a>{' '}
        to version{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://oncotree.mskcc.org/#/home?version=oncotree_2018_06_15"
        >
          2018_06_15
        </a>
      </span>,
      <span>
        OncoKB is monitoring the following drugs that were granted{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fda.gov/forpatients/approvals/fast/ucm405397.htm"
        >
          Breakthrough Therapy
        </a>{' '}
        designation by the FDA:
        <ul className="bullet" style={{ marginTop: '0.875rem' }}>
          <li>
            Oct 2, 2018:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.onclive.com/web-exclusives/fda-grants-rucaparib-breakthrough-designation-for-mcrpc"
            >
              Rucarparib in adult patients with BRCA1/2-positive metastatic
              castration-resistant disease following at least 1 androgen
              receptor–directed therapy and taxane-based chemotherapy.
            </a>
          </li>
        </ul>
      </span>
    ],
    priorityNews: [
      <span>
        Level <Link to={PAGE_ROUTE.ACTIONABLE_GENE}>R2</Link> alterations in{' '}
        <GenePageLink hugoSymbol={'ALK'} /> <GenePageLink hugoSymbol={'EGFR'} />{' '}
        <GenePageLink hugoSymbol={'MET'} /> are now included in the{' '}
        <Link to={PAGE_ROUTE.ACTIONABLE_GENE}>Actionable Genes</Link> page
      </span>
    ],
    newlyAddedGenes: [
      'NT5C2',
      'P2RY8',
      'PCBP1',
      'PDS5B',
      'PTPN1',
      'PTPN2 ',
      'STAG1',
      'TRAF3',
      'TRAF5'
    ],
    newlyAddedGenesTypes: ['heme'],
    updatedImplicationInOldFormat: {
      '4': [
        <span>
          ALK - C1156Y, G1269A, I1171N, L1196M - Non-Small Cell Lung Cancer -
          Lorlatinib
        </span>,
        <span>EGFR - D761Y - Non-Small Cell Lung Cancer - Osimertinib</span>
      ]
    }
  },
  '10012018': {
    news: [
      <span>
        OncoKB is monitoring the following drugs that were granted{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fda.gov/forpatients/approvals/fast/ucm405397.htm"
        >
          Breakthrough Therapy
        </a>{' '}
        designation by the FDA:
        <ul className="bullet" style={{ marginTop: '0.875rem' }}>
          <li>
            Sept 5, 2018:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.onclive.com/web-exclusives/fda-grants-loxo292-breakthrough-designation-for-nsclc-mtc"
            >
              LOXO-292 for RET fusion–positive non–small cell lung cancer
              (NSCLC) or RET-mutant medullary thyroid cancer (MTC)
            </a>
          </li>
        </ul>
      </span>
    ],
    updatedImplicationInOldFormat: {
      '3': [
        <span>
          RET - Oncogenic Mutations - Medullary Thyroid Cancer - LOXO-292 (
          <b>added as new association</b>)
        </span>
      ]
    },
    newlyAddedGenes: [
      'HIST1H1E',
      'SETD6',
      'SETD5',
      'SETD7',
      'SETDB2',
      'SETDB1',
      'SETD4',
      'SETD3',
      'SETD1B',
      'U2AF2',
      'TET3',
      'NFE2',
      'IRF8',
      'IRF1',
      'IKZF3',
      'JARID2',
      'NCSTN',
      'HIST1H2BO',
      'HIST1H2AC',
      'HIST1H2BG',
      'HIST1H2BJ',
      'HIST1H2BK',
      'HIST1H2BC',
      'HIST1H2AG',
      'HIST1H2AL',
      'HIST1H2AM',
      'TYK2'
    ],
    newlyAddedGenesTypes: ['heme']
  },
  '08202018': {
    news: [
      <span>
        Incorporation of positional variants (e.g., BRAF V600) into Actionable
        Genes table.
      </span>,
      <span>Updated layout of Actionable Genes table.</span>,
      <span>
        OncoKB is monitoring the following drugs that were granted{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fda.gov/forpatients/approvals/fast/ucm405397.htm"
        >
          Breakthrough Therapy
        </a>{' '}
        designation by the FDA:
        <ul className="bullet" style={{ marginTop: '0.875rem' }}>
          <li>
            August 6, 2018:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.ascopost.com/News/59131"
            >
              Lenvatinib Plus Pembrolizumab in non-MSI-H Endometrial Carcinoma
            </a>
          </li>
          <li>
            August 7, 2018:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.ascopost.com/News/59138"
            >
              Quizartinib for Relapsed/Refractory FLT3-ITD AML
            </a>
          </li>
          <li>
            August 14, 2018:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.ascopost.com/News/59160"
            >
              Encorafenib Plus Binimetinib and Cetuximab in BRAFV600E–Mutant
              Metastatic Colorectal Cancer
            </a>
          </li>
        </ul>
      </span>
    ],
    priorityNews: [
      <span>
        OncoKB now contains over 4000 curated alterations in over 500 genes.
      </span>
    ],
    newlyAddedGenes: [
      'ACTG1',
      'ARHGEF28',
      'ARID3A',
      'ARID3B',
      'ARID3C',
      'ARID4A',
      'ARID4B',
      'ARID5A',
      'ATP6AP1',
      'ATP6V1B2',
      'ATXN2',
      'BACH2',
      'BCL11B',
      'BCORL1',
      'BCR',
      'BTG1',
      'CD28',
      'CD58',
      'CIITA',
      'CRBN',
      'CUX1',
      'DDX3X',
      'DTX1',
      'DUSP22',
      'EGR1',
      'EP400',
      'ESCO2',
      'ETNK1',
      'FANCD2',
      'FAS',
      'FBXO11',
      'FURIN',
      'GNA12',
      'GNA13',
      'GNB1',
      'GTF2I',
      'HDAC1',
      'HDAC4',
      'HDAC7',
      'HIF1A',
      'HIST1H1B',
      'HIST1H1D'
    ],
    newlyAddedGenesTypes: ['heme'],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          July 20, 2018:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm614128.htm"
          >
            the FDA approved ivosidenib
          </a>{' '}
          for adult patients with relapsed or refractory acute myeloid leukemia
          (AML) with a susceptible IDH1 mutation as detected by an FDA-approved
          test.
        </span>
      ]
    }
  },
  '07122018': {
    news: [
      <span>
        New Level 4 associations have been added:
        <Row>
          <SimpleTable
            columns={NEWLY_ADDED_LEVEL_FOUR_COLUMNS}
            rows={NEWLY_ADDED_LEVEL_FOUR.map((record, index) => {
              return {
                key: `NEWLY_ADDED_LEVEL_FOUR-${index}`,
                content: record.map((subItem, subIndex) => {
                  return {
                    key: `NEWLY_ADDED_LEVEL_FOUR-${index}-${subIndex}`,
                    content: subItem
                  };
                })
              };
            })}
          />
        </Row>
      </span>,
      <span>
        Inclusion of Level R1 actionable alterations in Actionable Genes
      </span>
    ],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          April 18, 2018:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm605113.htm"
          >
            the FDA approved osimertinib
          </a>{' '}
          for the first-line treatment of patients with metastatic non-small
          cell lung cancer (NSCLC) whose tumors have epidermal growth factor
          receptor (EGFR) exon 19 deletions or exon 21 L858R mutations.
        </span>,
        <span>
          May 4, 2018:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm606708.htm"
          >
            the FDA approved the combination of dabrafenib plus trametinib
          </a>{' '}
          for treatment of patients with locally advanced or metastatic
          anaplastic thyroid cancer with BRAF V600E mutation and with no
          satisfactory locoregional treatment options.
        </span>,
        <span>
          June 27, 2018:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm611981.htm"
          >
            the FDA approved the combination of encorafenib plus binimetinib
          </a>{' '}
          for patients with BRAF V600E- or V600K-mutant metastatic and/or
          unresectable melanoma.
        </span>
      ],
      '3': [
        <span>
          EGFR - Exon 20 insertions - Non-small cell lung cancer - Poziotinib (
          <b>added as new association</b>)
        </span>,
        <span>
          ALK - G1202R - Non-small cell lung cancer - Lorlatinib (
          <b>added as new association</b>)
        </span>,
        <span>
          KIT - D816 mutations - Mastocytosis - Avapritinib (
          <b>added as new association</b>)
        </span>,
        <span>
          MTOR - E2014K, E2419K - Bladder cancer - Everolimus (
          <b>updated association</b>)
        </span>,
        <span>
          MTOR - L1460P, L2209V, L2427Q - Renal cell carcinoma - Temsirolimus (
          <b>updated association</b>)
        </span>,
        <span>
          MTOR - Q2223K - Renal cell carcinoma - Everolimus (
          <b>updated association</b>)
        </span>
      ]
    }
  },
  '02022018': {
    news: [
      <span>
        Addition of a new gene: KLF5 (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.ncbi.nlm.nih.gov/pubmed/28963353"
        >
          Zhang et al., Cancer Discovery, 2017
        </a>
        ).
      </span>,
      <span>
        Addition of new alterations and updates to existing alterations.
      </span>
    ],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          November 6, 2017:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.fda.gov/NewsEvents/Newsroom/PressAnnouncements/ucm583931.htm"
          >
            the FDA approved vemurafenib
          </a>{' '}
          for treatment of patients with Erdheim-Chester disease (histiocytosis)
          who harbor BRAF V600 mutations.
        </span>
      ],
      '3': [
        <span>
          HRAS - Oncogenic mutations - Head and Neck Squamous Cell Carcinoma -
          Tipifarnib (<b>moved from 4 to 3A only for HNSCC</b>)
        </span>
      ]
    }
  },
  '10262017': {
    news: [
      <span>Updates to Levels of Evidence 3A and 4.</span>,
      <span>
        Mutation frequency plots are now calculated based on{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.cbioportal.org/study?id=msk_impact_2017#summary"
        >
          MSK-IMPACT Clinical Sequencing Cohort
        </a>{' '}
        (
        <a
          href="https://www.ncbi.nlm.nih.gov/pubmed/28481359"
          target="_blank"
          rel="noopener noreferrer"
        >
          Zehir et al., Nature Medicine, 2017
        </a>
        ).
      </span>
    ]
  },
  '08172017': {
    news: [
      <span>
        August 1, 2017:{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm569366.htm"
        >
          the FDA approved nivolumab
        </a>{' '}
        for treatment of patients with mismatch repair deficient (MMR-D) and{' '}
        <MSILink /> metastatic colorectal cancer that has progressed following
        treatment with a fluoropyrimidine, oxaliplatin and irinotecan.
      </span>,
      <span>
        August 1, 2017:{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm569482.htm"
        >
          the FDA approved enasidenib
        </a>{' '}
        for treatment of patients with relapsed or refractory
        <GenePageLink hugoSymbol={'IDH2'} content={'IDH2-mutant'} /> Acute
        Myeloid Leukemia (AML).
      </span>,
      <span>
        June 22, 2017:{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm564331.htm"
        >
          the FDA approved combination dabrafenib + trametinib
        </a>{' '}
        for treatment of patients with{' '}
        <AlterationPageLink
          hugoSymbol={'BRAF'}
          alteration={'V600E'}
          showGene={true}
        />{' '}
        mutant metastatic NSCLC.
      </span>,
      <span>
        May 23, 2017:{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fda.gov/Drugs/InformationOnDrugs/ApprovedDrugs/ucm560040.htm"
        >
          the FDA approved pembrolizumab
        </a>{' '}
        for treatment of patients with unresectable or metastatic, <MSILink />{' '}
        or mismatch repair deficient (MMR-D) solid tumors.
      </span>
    ]
  },
  '08022017': {
    news: [
      <span>
        Introduced a curated list of{' '}
        <Link to={PAGE_ROUTE.CANCER_GENES}>cancer genes</Link>.
      </span>,
      <span>
        Addition of gene-alterations pages with alteration level annotation.{' '}
        <AlterationPageLink
          hugoSymbol={'BRAF'}
          alteration={'V600E'}
          content={'e.g. BRAF V600E'}
        />
        .
      </span>,
      <>
        <span style={{ marginLeft: '-0.25rem' }}>
          Improved search box that queries genes and alterations.
        </span>
        <br />
        <Row>
          <Col lg={6} md={8} xs={12}>
            <img src={SearchOneImg} />
          </Col>
        </Row>
        <Row>
          <Col lg={6} md={8} xs={12}>
            <img className="md-auto" src={SearchTwoImg} />
          </Col>
        </Row>
      </>
    ]
  },
  '05152017': {
    news: [
      <span>
        Brigatinib FDA-approval in ALK-positive NSCLC added as a new Level 1
        association.
      </span>,
      <span>
        Amplification events for most Oncogenes and Deletions or Truncating
        mutations for most Tumor Suppressor have been annotated/updated.
      </span>,
      <span>Inclusion of literature from AACR 2017.</span>,
      <span>
        Addition of new alterations and updates to existing alteration
        annotations.
      </span>
    ]
  },
  '04052017': {
    priorityNews: [
      <span>Curation of 58 additional genes.</span>,
      <>
        <span style={{ marginLeft: '-0.25rem' }}>
          Gene alias information added to gene page and search box.
        </span>
        <br />
        <Row>
          <Col xs={12} md={8} xl={6}>
            <img src={ERBBImg} />
          </Col>
        </Row>
      </>,
      <span>API updates.</span>
    ],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          BRCA1/2 - Oncogenic Mutations - Ovarian Cancer - Niraparib FDA
          approval added
        </span>,
        <span>
          BRCA1/2 - Oncogenic Mutations - Ovarian Cancer - Rucaparib (
          <b>new publication added</b>)
        </span>,
        <span>
          Updated alterations for KIT - Gastrointestinal Stromal Tumor -
          Imatinib, Sunitinib, Regorafenib
        </span>
      ],
      '2': [
        <span>
          Updated alterations for KIT - Gastrointestinal Stromal Tumor -
          Nilotinib, Dasatinib, Sorafenib
        </span>,
        <span>
          Updated alterations for KIT - Thymic cancer - Sunitinib, Sorafenib
        </span>
      ],
      '3': [
        <span>
          BRAF V600 - Colorectal Cancer - Encorafenib + Binimetinib + Cetuximab
          (<b>new association</b>)
        </span>,
        <span>
          FGFR1 - Amplification - Lung Squamous Cell Carcinoma - AZD4547,
          Debio1347 (<b>new abstract added</b>)
        </span>,
        <span>
          FGFR2 - Fusions - Cholangiocarcinoma - BGJ398, Debio1347 (
          <b>new abstract added</b>)
        </span>,
        <span>
          Updated alterations for FGFR3 - Bladder cancer - JNJ-42756493,
          Debio1347
        </span>,
        <span>
          PIK3CA - Oncogenic mutations - Breast cancer - Updated treatments and
          evidence
        </span>
      ],
      '4': [
        <span>
          BRAF V600 - Colorectal Cancer - Radiation + Trametinib + Fluorouracil
          (<b>new association</b>)
        </span>,
        <span>Updated alterations for FGFR3 - Breast cancer - Debio1347</span>,
        <span>KRAS - Wildtype - Updated treatments and evidence</span>,
        <span>
          KRAS - Oncogenic mtuations - Updated treatments and evidence
        </span>,
        <span>
          PIK3CA - Oncogenic mutations - Breast cancer - Updated treatments and
          evidence
        </span>,
        <span>
          PTEN - Oncogenic mutations - Breast cancer - Updated treatments and
          evidence
        </span>
      ]
    }
  },
  '03072017': {
    priorityNews: [
      <span>
        Expanded selection of genes with Oncogene or Tumor Suppressor
        annotation.
      </span>,
      <span>
        Level 4 actionable genes are now accessible from the home page.
      </span>
    ],
    updatedImplicationInOldFormat: {
      '1': [
        <span>
          Updated alterations for EGFR - Non-Small Cell Lung Cancer - EGFR TKIs
        </span>,
        <span>
          Updated alterations for KIT - Gastrointestinal Stromal Tumor -
          Imatinib, Sunitinib, Regorafenib
        </span>
      ],
      '2': [
        <span>
          CDK4 - Amplification - Well-Differentiated
          Liposarcoma/Dedifferentiated Liposarcoma - Palbociclib, Abemaciclib (
          <b>disease changed from Soft Tissue Sarcoma and Abemaciclib added</b>)
        </span>,
        <span>
          TSC1 - Renal Cell Carcinoma - Everolimus (<b>new association</b>)
        </span>
      ],
      '3': [
        <span>
          ESR1 - Oncogenic Mutations - AZD9496, Fulvestrant (
          <b>new association</b>)
        </span>,
        <span>
          FGFR1 - Amplification - Breast Cancer - Dovitinib (<b>removed</b>)
        </span>,
        <span>
          FGFR1 - Amplification - Lung Squamous Cell Carcinoma - Debio1347 (
          <b>new association</b>)
        </span>,
        <span>
          FGFR2 - Amplification - Breast Cancer - Dovitinib (<b>removed</b>)
        </span>,
        <span>
          FGFR2/3 - Fusions - Various tumor types - Debio1347 (
          <b>new association</b>)
        </span>,
        <span>
          FGFR3 - Hotspots - Bladder Cancer - Debio1347, JNJ-42756493 (
          <b>new association</b>)
        </span>,
        <span>
          KRAS - Oncogenic Mutations - Colorectal Cancer -
          Atezolizumab+Cobimetinib (<b>moved from 4 to 3A only in CRC</b>)
        </span>,
        <span>
          MDM2 - Amplification - Liposarcoma - DS-3032b and RG7112 (
          <b>new association</b>)
        </span>,
        <span>
          PIK3CA - Oncogenic Mutations - Breast Cancer - Alpelisib+Fulvestrant,
          Buparlisib+Fulvestrant, Copanlisib, GDC0077, Serabelisib,
          Fulvestrant+Taselisib (<b>new drugs added</b>)
        </span>
      ],
      '4': [
        <span>
          EGFR alterations - Glioma - Erlotinib (<b>removed</b>)
        </span>,
        <span>
          MDM2 - Amplification - Liposarcoma - DS-3032b (<b>moved to 3A</b>)
        </span>,
        <span>
          PIK3CA - Oncogenic Mutations - Breast Cancer - Alpelisib+Fulvestrant (
          <b>moved to 3A</b>)
        </span>,
        <span>
          IDH1 - R132 alterations - Chondrosarcoma - AG-120 (
          <b>moved from 3A to 4</b>)
        </span>
      ]
    }
  },
  '12292016': {
    news: [
      <span>
        Level 3 and 4 alterations supported by data from conference proceedings
        are now included in the Actionable Genes tab.
      </span>
    ]
  },
  '11222016': {
    news: [
      <span>
        All OncoKB alterations and their annotations can now be{' '}
        <Link to={PAGE_ROUTE.API_ACCESS}>
          {' '}
          batch downloaded or accessed programmatically via our API.
        </Link>
      </span>,
      <span>
        Oncogene and tumor suppressor gene annotations have been added.
      </span>,
      <span>
        Alterations with inconclusive supporting data have now been included.
      </span>
    ]
  },
  '10242016': {
    news: [
      <span>
        Inclusion of a selection of Level 4 associations in the Actionable Genes
        tab.
      </span>,
      <span>
        KRAS activating mutations are no longer considered Level 3A based on the
        completion of the SELECT-1 trial. Despite promising initial results,
        selumetinib did not have a significant effect on survival, and therefore
        activating KRAS mutations are now considered Level 4.
      </span>
    ]
  },
  '09162016': {
    news: [<span>Updated Actionable Genes.</span>]
  },
  '08102016': {
    news: [
      <>
        <span style={{ marginLeft: '-0.25rem' }}>
          Improved visualization of OncoKB in cBioPortal:
        </span>
        <br />
        <Row>
          <Col xs={12} md={8} xl={6}>
            <img src={ClinicalImg} />
          </Col>
          <Col xs={12} md={8} xl={6}>
            <img src={BiologicalImg} />
          </Col>
        </Row>
      </>,
      <span>
        Updated genes and alterations in the tables of Levels 1, 2 and 3
        Actionable Genes.
      </span>,
      <span>Updated Levels of Evidence.</span>
    ]
  },
  '07062016': {
    news: [
      <span>
        Annotations for Level 1, 2 and 3 genes now include key updates from ASCO
        2016.
      </span>,
      <span>
        The Levels of Evidence system now includes Level R1, comprising of
        alterations that are NCCN-compendium listed as a biomarker of resistance
        to an FDA-approved drug.
      </span>
    ]
  }
};
