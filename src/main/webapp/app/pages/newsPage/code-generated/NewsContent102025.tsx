import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent102025() {
  return (
    <>
      <ul>
        <li>
          Release of <Link to="/sop">OncoKB™ SOP v5.2</Link>
        </li>
        <li>
          OncoTree updated from version{' '}
          <a href="https://oncotree.info/?version=oncotree_2019_12_01&amp;field=NAME">
            2019_12_01
          </a>{' '}
          to version oncotree_latest_stable, which incorporates changes to the
          CNS branch of OncoTree
        </li>
        <li>
          Transcripts have been updated for the following genes to better align
          with coordinating resources: ATXN7, CCNQ, CDKN2A, CRLF2, GAB1, KBTBD4,
          MUTYH, NADK, PAX8, PGBD5, RBM10
        </li>
        <li>CDKN2A has been split into the p16 and p14 isoforms</li>
      </ul>
      <p>
        <strong>Updated Therapeutic Implications</strong>
      </p>
      <ul>
        <li>New alteration(s) with a tumor type-specific level of evidence</li>
      </ul>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Gene</th>
              <th>Mutation</th>
              <th>Cancer Type</th>
              <th>Drug(s) Added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('H3-3A')}</td>
              <td>
                <AlterationPageLink hugoSymbol="H3-3A" alteration="K28M">
                  K28M
                </AlterationPageLink>
              </td>
              <td>Diffuse Midline Glioma, H3 K27-Altered</td>
              <td>Dordaviprone (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-dordaviprone-diffuse-midline-glioma">
                  FDA approval of dordaviprone
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38335473/">38335473</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('H3C2')}</td>
              <td>
                <AlterationPageLink hugoSymbol="H3C2" alteration="K28M">
                  K28M
                </AlterationPageLink>
              </td>
              <td>Diffuse Midline Glioma, H3 K27-Altered</td>
              <td>Dordaviprone (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-dordaviprone-diffuse-midline-glioma">
                  FDA approval of dordaviprone
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38335473/">38335473</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('H3C3')}</td>
              <td>
                <AlterationPageLink hugoSymbol="H3C3" alteration="K28M">
                  K28M
                </AlterationPageLink>
              </td>
              <td>Diffuse Midline Glioma, H3 K27-Altered</td>
              <td>Dordaviprone (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-dordaviprone-diffuse-midline-glioma">
                  FDA approval of dordaviprone
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38335473/">38335473</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
