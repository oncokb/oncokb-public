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
          <p>
            We have removed ERBB2 V697L, Q709L, A710V and E717D from the level 1
            association for ERBB2 Tyrosine Kinase Domain Activating Mutations in
            non-small cell lung cancer for zongertinib.
          </p>
        </li>
        <li>
          <p>
            Updated Therapeutic Implications - Addition of drug(s) associated
            with a tumor type-specific leveled alteration(s) currently in
            OncoKB™ (without changing the alteration's highest level of
            evidence)
          </p>
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
                (excluding L726F, L726I, T733I, L768S, L755A, L755P, L755S,
                L755W, I767M, D769H, D769Y, V773L, G776S, G776V, V777L, V777M,
                V794M, T798M, D808N, G815R, D821N, L841V, V842I, L866M, L869R,
                770_831ins)
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
