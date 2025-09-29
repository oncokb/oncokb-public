import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent092025() {
  return (
    <>
      <ul>
        <li>
          We have updated the Level 1 annotation of ERBB2 Tyrosine Kinase Domain
          activating mutations in NSCLC (in association with zongertinib) to
          exclude the following mutations, which fall outside the TKD (ERBB2
          V697L, Q709L, A710V and E717D)
        </li>
        <li>
          Updated Therapeutic Implications - Addition of drug(s) associated with
          a tumor type-specific leveled alteration(s) currently in OncoKB™
          (without changing the alteration's highest level of evidence)
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
              <td>2</td>
              <td>{getAlternativeGenePageLinks('ERBB2')}</td>
              <td>
                Oncogenic Mutations
                <br />
                <br />
                (excluding select TKD activating mutations, which are currently
                Level 1)
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                Trastuzumab Deruxtecan (Level 1)<br></br>
                <br></br>Ado-Trastuzumab Emtansine (Level 2)<br></br>
                <br></br>Neratinib, Sevabertinib, Trastuzumab + Pertuzumab +
                Docetaxel, Zongertinib (Level 3A)
              </td>
              <td>Zongertinib (Level 2, previously Level 3A)</td>
              <td>
                Inclusion in Non-Small Cell Lung Cancer NCCN Guidelines V8.2025;
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
            genes={['OGT', 'OGA', 'RSPO2', 'RSPO3', 'VEGFB']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
