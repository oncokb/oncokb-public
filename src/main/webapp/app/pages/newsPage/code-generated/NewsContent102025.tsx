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
          OncoTree updated from version 2019_12_01 to version{' '}
          <a href="https://oncotree.mskcc.org/?version=oncotree_candidate_release&amp;field=NAME">
            oncotree_candidate_release
          </a>
          , which incorporates changes to the CNS branch of OncoTree
        </li>
        <li>
          Update to CDKN2A to include two distinct gene pages, for the{' '}
          <Link to="/gene/CDKN2A">p16</Link> and{' '}
          <Link to="/gene/CDKN2A%20(p14)">p14</Link> isoforms
        </li>
        <li>
          Transcripts have been updated for the following genes:{' '}
          <Link to="/gene/ATXN7">ATXN7</Link>, <Link to="/gene/CCNQ">CCNQ</Link>
          , <Link to="/gene/CRLF2">CRLF2</Link>,{' '}
          <Link to="/gene/GAB1">GAB1</Link>,{' '}
          <Link to="/gene/KBTBD4">KBTBD4</Link>,{' '}
          <Link to="/gene/MUTYH">MUTYH</Link>, <Link to="/gene/NADK">NADK</Link>
          , <Link to="/gene/PAX8">PAX8</Link>,{' '}
          <Link to="/gene/PGBD8">PGBD8</Link>,{' '}
          <Link to="/gene/RBM10">RBM10</Link>
        </li>
      </ul>
      <details>
        <summary>View details for updated transcripts</summary>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Gene</th>
                <th>Old Transcript(s)</th>
                <th>Updated Transcript(s)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link to="/gene/ATXN7">ATXN7</Link>
                </td>
                <td>ENST00000295900 (GRCh37/GRCh38)</td>
                <td>ENST00000398590.3 (GRCh37) ENST00000522345.2 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/CCNQ">CCNQ</Link>
                </td>
                <td>ENST00000576892 (GRCh37/GRCh38)</td>
                <td>ENST00000406277.2 (GRCh37) ENST00000576892.8 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/CRLF2">CRLF2</Link>
                </td>
                <td>ENST00000381566 (GRCh37/GRCh38)</td>
                <td>ENST00000400841.2 (GRCh37) ENST00000400841.8 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/GAB1">GAB1</Link>
                </td>
                <td>ENST00000262994 (GRCh37/GRCh38)</td>
                <td>ENST00000262995.4 (GRCh37) ENST00000262995.9 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/KBTBD4">KBTBD4</Link>
                </td>
                <td>ENST00000395288 (GRCh37/GRCh38)</td>
                <td>ENST00000430070.2 (GRCh37) ENST00000430070.7 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/MUTYH">MUTYH</Link>
                </td>
                <td>ENST00000372115 (GRCh37/GRCh38)</td>
                <td>ENST00000450313.1 (GRCh37) ENST00000710952.2 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/NADK">NADK</Link>
                </td>
                <td>ENST00000341426 (GRCh37/GRCh38)</td>
                <td>ENST00000378625.1 (GRCh37) ENST00000378625.5 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/PAX8">PAX8</Link>
                </td>
                <td>ENST00000263334 (GRCh37/GRCh38)</td>
                <td>ENST00000429538.3 (GRCh37) ENST00000429538.8 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/PGBD8">PGBD8</Link>
                </td>
                <td>ENST00000525115 (GRCh37/GRCh38)</td>
                <td>ENST00000391860.1 (GRCh37) ENST00000391860.7 (GRCh38)</td>
              </tr>
              <tr>
                <td>
                  <Link to="/gene/RBM10">RBM10</Link>
                </td>
                <td>ENST00000329236 (GRCh37/GRCh38)</td>
                <td>ENST00000377604.3 (GRCh37) ENST00000377604.8 (GRCh38)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <br></br>
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
