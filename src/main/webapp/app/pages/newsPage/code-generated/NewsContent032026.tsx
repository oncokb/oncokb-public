import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
  GenePageLink,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

// removed the corresponding markdown file for this componeent
// since you cannot represent rowspan in markdown tables.
export default function NewsContent032026() {
  return (
    <>
      <p>
        <strong>Updated Therapeutic Implications</strong>
      </p>
      <ul>
        <li>
          Promotion of tumor type-specific level of evidence for an alteration
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
              <td>{getAlternativeGenePageLinks('ERBB2')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="Amplification"
                >
                  Amplification
                </AlterationPageLink>
              </td>
              <td>Small Bowel Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Trastuzumab + Pertuzumab,
                Trastuzumab + Tucatinib (Level 2)
                <br />
                <br />
                <em>Drug(s) currently in OncoKB™:</em> Trastuzumab Deruxtecan
                (Level 3A)
              </td>
              <td>3A</td>
              <td>2</td>
              <td>
                Inclusion in Small Bowel Adenocarcinoma NCCN Guidelines V1.2026;
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30857956/">30857956</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41526345/">41526345</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          Replaced lists of individual mutations with range-based biomarker
          definitions that group oncogenic and likely oncogenic variants within
          defined functional domains for select therapeutic associations. Levels
          of evidence remain unchanged for listed variants.
          <details>
            <summary>View Updated Variant Nomenclature</summary>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Gene</th>
                    <th>Previous variant representation</th>
                    <th>Updated variant nomenclature</th>
                    <th>Inclusion criteria</th>
                    <th>Tumor type</th>
                    <th>Drug(s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>{getAlternativeGenePageLinks('ERBB2')}</td>
                    <td>
                      L726F/I, T733I, L768S, L755A/P/S/W, I767M, D769H/Y, V773L,
                      G776S/V, V777L/M, V794M, T798M, D808N, G815R, D821N,
                      L841V, V842I, L866M, L869R
                    </td>
                    <td>
                      Oncogenic missense mutations in the tyrosine kinase domain
                      (TKD)
                    </td>
                    <td>
                      Oncogenic and likely oncogenic missense mutations in the
                      range 721-975 (the TKD)
                    </td>
                    <td>NSCLC</td>
                    <td>Sevabertinb, Zongertinib</td>
                  </tr>
                  <tr>
                    <td>1</td>
                    <td>{getAlternativeGenePageLinks('ESR1')}</td>
                    <td>D538, E380, Y537, L536, L469V, S463P, G442R, F461V</td>
                    <td>
                      Oncogenic missense mutations in the ligand binding domain
                      (LBD)
                    </td>
                    <td>
                      Oncogenic and likely oncogenic missense mutations in the
                      range 310-547 (the LBD)
                    </td>
                    <td>Breast Cancer</td>
                    <td>Elascetrant</td>
                  </tr>
                  <tr>
                    <td rowSpan={2}>2</td>
                    <td rowSpan={2}>{getAlternativeGenePageLinks('POLD1')}</td>
                    <td rowSpan={2}>D402N, E318K, L474P, S478N</td>
                    <td rowSpan={2}>
                      Oncogenic missense mutations in the exonuclease domain
                    </td>
                    <td rowSpan={2}>
                      Oncogenic and likely oncogenic missense mutations in the
                      range 304-533 (the exonuclease domain)
                    </td>
                    <td>Colorectal Cancer</td>
                    <td>
                      Pembrolizumab, Nivolumab, Ipilimumab + Nivolumab,
                      Dostarlimab
                    </td>
                  </tr>
                  <tr>
                    <td>Small Bowel Cancer</td>
                    <td>
                      Pembrolizumab, Nivolumab, Ipilimumab + Nivolumab,
                      Dostarlimab
                    </td>
                  </tr>
                  <tr>
                    <td rowSpan={2}>2</td>
                    <td rowSpan={2}>{getAlternativeGenePageLinks('POLE')}</td>
                    <td rowSpan={2}>
                      A288V, A456P, A463D, A463T, A463V, D275A, D275G, D275V,
                      D368N, D368Y, F367L, F367S, F367V, L424I, L424V, M295R,
                      M444K, P286H, P286L, P286R, P286S, P436H, P436R, P436S,
                      S297F, S297Y, S459F, S459Y, S461L, S461P, S461T, V411L,
                      V411M, V464A, Y458C, Y458H
                    </td>
                    <td rowSpan={2}>
                      Oncogenic missense mutations in the exonuclease domain
                    </td>
                    <td rowSpan={2}>
                      Oncogenic and likely oncogenic missense mutations in the
                      range 268-471 (the exonuclease domain)
                    </td>
                    <td>Colorectal Cancer</td>
                    <td>
                      Pembrolizumab, Nivolumab, Ipilimumab + Nivolumab,
                      Dostarlimab
                    </td>
                  </tr>
                  <tr>
                    <td>Small Bowel Cancer</td>
                    <td>
                      Pembrolizumab, Nivolumab, Ipilimumab + Nivolumab,
                      Dostarlimab
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </li>
      </ul>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['AVIL', 'GID4', 'IL2RA', 'NT5E', 'PRMT5', 'WWOX']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
