import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';

export default function NewsContent022025() {
  return (
    <>
      <ul>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
        </li>
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
              <td>{getAlternativeGenePageLinks('FGFR1')}</td>
              <td>
                <AlterationPageLink hugoSymbol="FGFR1" alteration="Fusions">
                  Fusions
                </AlterationPageLink>
              </td>
              <td>Pancreatic Cancer</td>
              <td>
                <em>Drug(s) promoted in OncoKB™:</em>
                <br />
                Erdafitinib (Level 2, previously Level 4)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em>
                <br />
                Fexagratinib (Level 4)
              </td>
              <td>4</td>
              <td>2</td>
              <td>
                Inclusion in Pancreatic Cancer NCCN Guidelines V2.2025; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37541273/">37541273</a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('FGFR2')}</td>
              <td>
                <AlterationPageLink hugoSymbol="FGFR2" alteration="Fusions">
                  Fusions
                </AlterationPageLink>
              </td>
              <td>Pancreatic Cancer</td>
              <td>
                <em>Drug(s) promoted in OncoKB™:</em>
                <br />
                Erdafitinib (Level 2, previously Level 4)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em>
                <br />
                Fexagratinib (Level 4)
              </td>
              <td>4</td>
              <td>2</td>
              <td>
                Inclusion in Pancreatic Cancer NCCN Guidelines V2.2025; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37541273/">37541273</a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('FGFR2')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="FGFR2"
                  alteration="Oncogenic Mutations"
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                <em>Drug(s) promoted in OncoKB™:</em>
                <br />
                Erdafitinib (Level 2, previously Level 4)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em>
                <br />
                Fexagratinib, Lirafugratinib (Level 4)
              </td>
              <td>4</td>
              <td>2</td>
              <td>
                Inclusion in Non-Small Cell Lung Cancer NCCN Guidelines V3.2025;
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37541273/">37541273</a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('FGFR3')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="FGFR3"
                  alteration="Oncogenic Mutations"
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                <em>Drug(s) promoted in OncoKB™:</em>
                <br />
                Erdafitinib (Level 2, previously Level 4)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em>
                <br />
                Fexagratinib (Level 4)
              </td>
              <td>4</td>
              <td>2</td>
              <td>
                Inclusion in Non-Small Cell Lung Cancer NCCN Guidelines V3.2025;
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37541273/">37541273</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
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
              <td>1</td>
              <td>{getAlternativeGenePageLinks('BRAF')}</td>
              <td>
                <AlterationPageLink hugoSymbol="BRAF" alteration="V600E">
                  V600E
                </AlterationPageLink>
              </td>
              <td>Colorectal Cancer</td>
              <td>Encorafenib + Cetuximab (Level 1)</td>
              <td>Encorafenib + Cetuximab + FOLFOX Regimen (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-encorafenib-cetuximab-and-mfolfox6-metastatic-colorectal-cancer-braf">
                  FDA approval of encorafenib with cetuximab and mFOLFOX6
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39863775/">39863775</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h4></h4>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'ALOX5',
              'APEX1',
              'CBLB',
              'DHX15',
              'POLH',
              'RPS6KB1',
              'TACSTD2',
              'WEE1',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
