import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
  GenePageLink,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent012026() {
  return (
    <>
      <ul>
        <li>
          We hope everyone is having a great start to the new year! In 2025
          OncoKB added fifteen Level 1, eight Level 2, one Level 3 and one Level
          4 treatments for unique biomarker-selected indications to the
          database. A table summarizing these changes can be found{' '}
          <Link to="/year-end-summary#2025">here</Link>. For more details,
          please see the “Precision Oncology: 2025 in Review” article, found{' '}
          <a href="https://aacrjournals.org/cancerdiscovery/article-abstract/15/12/2414/767704/Precision-Oncology-2025-in-ReviewPrecision?">
            here
          </a>
        </li>
      </ul>
      <p>
        <strong>Updated Therapeutic Implications</strong>
      </p>
      <ul>
        <li>
          Addition of drug(s) associated with a tumor type-specific leveled
          alteration(s) currently in OncoKB™ (without changing the alteration's
          highest level of evidence)
        </li>
      </ul>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Gene</th>
              <th>Mutation</th>
              <th>Cancer Type</th>
              <th>Level-Associated Drug(s) in OncoKB™</th>
              <th>Drug(s) Added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('ERBB2')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="Amplification"
                >
                  Amplification
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>
                Trastuzumab, Trastuzumab Deruxtecan, Ado-Trastuzumab Emtansine,
                Margetuximab, Neratinib, Lapatinib, Trastuzumab + Pertuzumab,
                Trastuzumab + Tucatinib (Level 1)
              </td>
              <td>Trastuzumab Deruxtecan + Pertuzumab (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-fam-trastuzumab-deruxtecan-nxki-pertuzumab-unresectable-or-metastatic-her2-positive">
                  FDA approval of trastuzumab deruxtecan with pertuzumab
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41160818/">41160818</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'AAMP',
              'APCDD1',
              'ASXL3',
              'BACH1',
              'ESCO1',
              'FCGR2B',
              'H4C9',
              'HIP1',
              'PAFAH1B2',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
