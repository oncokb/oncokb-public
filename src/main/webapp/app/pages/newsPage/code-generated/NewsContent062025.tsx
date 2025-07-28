import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';

export default function NewsContent062025() {
  return (
    <>
      <ul>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
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
              <td>{getAlternativeGenePageLinks('ROS1')}</td>
              <td>
                <AlterationPageLink hugoSymbol="ROS1" alteration="Fusions">
                  Fusions
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Crizotinib, Entrectinib, Repotrectinib (Level 1)</td>
              <td>Taletrectinib (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-taletrectinib-ros1-positive-non-small-cell-lung-cancer?utm_medium=email&amp;utm_source=govdelivery">
                  FDA approval of taletrectinib
                </a>
                ;<br />
                <br />
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40179330/">40179330</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('ERBB2')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="Oncogenic Mutations"
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Trastuzumab Deruxtecan (Level 1)</td>
              <td>Sevabertinib, Zongertinib (Level 3A)</td>
              <td>
                Abstract:{' '}
                <a href="https://ascopubs.org/doi/10.1200/JCO.2025.43.16_suppl.8504">
                  Loong, HH. et al., ASCO 2025
                </a>
                ;<br />
                <br />
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40293180/">40293180</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['ASCL1', 'ATMIN', 'DLL3']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
