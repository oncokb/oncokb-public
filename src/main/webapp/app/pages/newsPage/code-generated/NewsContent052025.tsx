import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';

export default function NewsContent052025() {
  return (
    <>
      <ul>
        <li>
          Updated Therapeutic Implications - Promotion of tumor type-specific
          level of evidence for an alteration
        </li>
      </ul>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Gene</th>
              <th>Mutation</th>
              <th>Cancer Type</th>
              <th>Level-associated Drug(s) in OncoKB™</th>
              <th>Previous Level</th>
              <th>Updated Level</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{getAlternativeGenePageLinks('KRAS')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="Oncogenic Mutations"
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Low-Grade Serous Ovarian Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em>
                <br /> Avutometinib + Defactinib (Level 1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em>
                <br />
                Binimetinib, Cobimetinib, Trametinib (Level 4)
              </td>
              <td>4 (KRAS G12A/D/R/S/V previously Level 3B)</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-combination-avutometinib-and-defactinib-kras-mutated-recurrent-low">
                  FDA approval of avutometinib plus defactinib
                </a>
                ; Abstract:{' '}
                <a href="https://www.verastem.com/wp-content/uploads/2025/03/RAMP-201-Oral-Presentation-SGO-2025_03.17.25f.pdf">
                  Grisham et al. Abstract #814605, 2025 SGO Annual Meeting on
                  Women’s Cancer
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h4></h4>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['CTC1', 'GSTP1', 'TPMT', 'TYMS']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
