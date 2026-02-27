import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
  GenePageLink,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent022026() {
  return (
    <>
      <ul>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
        </li>
        <li>
          Updates to the functional classification of the following genes:
          <details>
            <summary>View gene classification updates.</summary>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Gene</th>
                    <th>Previous Gene Classification</th>
                    <th>New Gene Classification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{getAlternativeGenePageLinks('KLHL6')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Tumor Suppressor</td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('MEF2C')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Oncogene</td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('MITF')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Oncogene</td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('NSD1')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Tumor Suppressor</td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('PRKCB')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Oncogene</td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('PTPN1')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Tumor Suppressor</td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('SERPINB3')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>
                      Insufficient evidence to classify as an Oncogene or Tumor
                      Suppressor
                    </td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('SMARCE1')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>
                      Insufficient evidence to classify as an Oncogene or Tumor
                      Suppressor
                    </td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('SOX9')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Tumor Suppressor</td>
                  </tr>
                  <tr>
                    <td>{getAlternativeGenePageLinks('ZBTB20')}</td>
                    <td>Oncogene, Tumor Suppressor</td>
                    <td>Oncogene</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </li>
      </ul>

      <p>
        <strong>Updated Therapeutic Implications</strong>
      </p>
      <ul>
        <li>
          Removal of therapy(s) associated with a tumor type-specific leveled
          alteration(s) (without changing the alteration's highest level of
          evidence)
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
              <th>Level-Associated Drug(s) Remaining in OncoKB™</th>
              <th>Drug(s) Removed from OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>R2</td>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink hugoSymbol="EGFR" alteration="S492R">
                  S492R
                </AlterationPageLink>
              </td>
              <td>Colorectal Cancer</td>
              <td>Cetuximab (Level R2)</td>
              <td>Panitumumab (Level R2)</td>
              <td>
                Data does not support EGFR S492R as conferring resistance to
                panitumumab in CRC; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/22270724/">22270724</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26059438/">26059438</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'ACACA',
              'ACP3',
              'ACSL4',
              'CARS1',
              'CHUK',
              'D2HGDH',
              'HOXA13',
              'MDH2',
              'MASTL',
              'NFKBIE',
              'TNFRSF9',
              'TOX',
              'XRCC3',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
