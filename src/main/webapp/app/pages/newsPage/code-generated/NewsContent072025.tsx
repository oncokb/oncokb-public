import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent072025() {
  return (
    <>
      <ul>
        <li>
          Release of <a href="https://sop.oncokb.org/">OncoKB™ SOP v5.1</a>
        </li>
        <li>
          Update to OncoKB’s gene classification system to include a new
          category, “Insufficient Evidence,” for genes with weak or conflicting
          evidence describing their role as oncogenes or tumor suppressor genes.
          For more details, please refer to the OncoKB™ SOP v5.1.
        </li>
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
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                Oncogenic Mutations
                <br />
                <br />
                (excluding L858R, Exon 19 deletions, T790M, G719, L861Q, S768I,
                Exon 20 in-frame insertions, G724S, L718Q/V, D761Y, Exon 19
                in-frame insertions, L747P and Kinase Domain Duplication, which
                are already leveled)
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Datopotamab Deruxtecan (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink hugoSymbol="EGFR" alteration="G724S">
                  G724S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="EGFR" alteration="L718Q">
                  L718Q
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="EGFR" alteration="L718V">
                  V
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Datopotamab Deruxtecan (Level
                1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em> Afatinib (Level 3A)
              </td>
              <td>3A</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="Exon 19 in-frame insertions"
                >
                  Exon 19 in-frame insertions
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Datopotamab Deruxtecan (Level
                1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em> Erlotinib, Gefitinib,
                Patritumab Deruxtecan (Level 3A), Afatinib (Level 4)
              </td>
              <td>3A</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="Kinase Domain Duplication"
                >
                  Kinase Domain Duplication
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Datopotamab Deruxtecan (Level
                1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em> Afatinib, Erlotinib
                (Level 3A), Gefitinib (Level 4)
              </td>
              <td>3A</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink hugoSymbol="EGFR" alteration="L747P">
                  L747P
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Datopotamab Deruxtecan (Level
                1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em> Afatinib (Level 4)
              </td>
              <td>4</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink hugoSymbol="EGFR" alteration="D761Y">
                  D761Y
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Datopotamab Deruxtecan (Level
                1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em> Osimertinib (Level 4)
              </td>
              <td>4</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="Exon 20 in-frame insertions"
                >
                  Exon 20 in-frame insertions
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Amivantamab, Amivantamab + Chemotherapy (Level 1)</td>
              <td>Datopotamab Deruxtecan, Sunvozertinib (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
                ;{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-sunvozertinib-metastatic-non-small-cell-lung-cancer-egfr-exon-20">
                  FDA approval of sunvozertinib
                </a>
                ; Abstract:{' '}
                <a href="https://ascopubs.org/doi/10.1200/JCO.2024.42.16_suppl.8513">
                  Yang, JCH. et al., ASCO 2024
                </a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="Exon 19 in-frame deletions"
                >
                  Exon 19 in-frame deletions
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="EGFR" alteration="L858R">
                  L858R
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                Amivantamab + Chemo, Erlotinib, Gefitinib, Dacomitinib,
                Afatinib, Osimertinib, Lazertinib + Amivantamab, Erlotinib +
                Ramucirumab, Osimertinib + Chemotherapy (Level 1)
              </td>
              <td>Datopotamab Deruxtecan (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink hugoSymbol="EGFR" alteration="G719">
                  G719
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="EGFR" alteration="L861Q">
                  L861Q
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="EGFR" alteration="S768I">
                  S768I
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Afatinib (Level 1)</td>
              <td>Datopotamab Deruxtecan (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{getAlternativeGenePageLinks('EGFR')}</td>
              <td>
                <AlterationPageLink hugoSymbol="EGFR" alteration="T790M">
                  T790M
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Osimertinib (Level 1)</td>
              <td>Datopotamab Deruxtecan (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-datopotamab-deruxtecan-dlnk-egfr-mutated-non-small-cell-lung-cancer">
                  FDA approval of datopotamab deruxtecan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39761483/">39761483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39250535/">39250535</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['ABCC3', 'PAK3']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
