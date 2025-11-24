import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent112025() {
  return (
    <>
      <ul>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
        </li>
        <li>
          Update to our{' '}
          <Link to="/companion-diagnostic-devices">
            FDA Cleared or Approved Companion Diagnostic Devices
          </Link>{' '}
          (CDx) page
        </li>
        <li>
          Key updates to the functional classification and variant-level
          annotation of the <em>NPM1</em> gene
          <ul>
            <li>
              <em>NPM1</em> updated from Tumor Suppressor gene (TSG) to both
              Oncogene (OG) and TSG
            </li>
            <li>
              Biological effect of annotated variants updated from
              Loss-of-function to Switch-of-function
            </li>
          </ul>
        </li>
      </ul>
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
              <td>{getAlternativeGenePageLinks('ESR1')}</td>
              <td>
                <AlterationPageLink hugoSymbol="ESR1" alteration="V422del">
                  V422del
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Imlunestrant (Level 1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em> Elacestrant (Level 2)
              </td>
              <td>2</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-imlunestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast">
                  FDA approval of imlunestrant
                </a>
                ; PMID:{' '}
                <a href="https://www.ncbi.nlm.nih.gov/pubmed/39660834">
                  39660834
                </a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('ESR1')}</td>
              <td>
                <AlterationPageLink hugoSymbol="ESR1" alteration="S463F">
                  S463F
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Imlunestrant (Level 1)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em> Fulvestrant (Level 3A)
              </td>
              <td>3A</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-imlunestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast">
                  FDA approval of imlunestrant
                </a>
                ; PMID:{' '}
                <a href="https://www.ncbi.nlm.nih.gov/pubmed/39660834">
                  39660834
                </a>
              </td>
            </tr>
            <tr>
              <td>{getAlternativeGenePageLinks('NPM1')}</td>
              <td>
                Susceptible NPM1 mutations per the FDA label:{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="Truncating mutations in Exon 5"
                >
                  Truncating mutations in Exon 5
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="Truncating mutations in Exon 9"
                >
                  Truncating mutations in Exon 9
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="Truncating mutations in Exon 11"
                >
                  Truncating mutations in Exon 11
                </AlterationPageLink>
                <br />
                <br />
                Select exon 5 indels:{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="K134delinsQLLSGL"
                >
                  K134delinsQLLSGL
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="L135insALELGN"
                >
                  L135insALELGN
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="L136_137insAEDVKLL"
                >
                  L136_137insAEDVKLL
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="K141_142insLSALSISGK"
                >
                  K141_142insLSALSISGK
                </AlterationPageLink>
                <br />
                <br />
                Select NPM1 fusions:{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="NPM1-CCDC28A Fusion"
                >
                  NPM1-CCDC28A Fusion
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="NPM1-HAUS1 Fusion"
                >
                  NPM1-HAUS1 Fusion
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="NPM1-MLF1 Fusion"
                >
                  NPM1-MLF1 Fusion
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="NPM1"
                  alteration="NPM1-RPP30 Fusion"
                >
                  NPM1-RPP30 Fusion
                </AlterationPageLink>
                <br />
                <br />
              </td>
              <td>Acute Myeloid Leukemia</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Ziftomenib (Level 1)
                <br />
                <br />
                <em>Drug(s) promoted in OncoKB™:</em> Revumenib (Level 1,
                previously Level 3A)
              </td>
              <td>3A</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-revumenib-relapsed-or-refractory-acute-myeloid-leukemia-susceptible-npm1-mutation?">
                  FDA approval of revumenib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40332046/">40332046</a>
                <br />
                <br />
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-ziftomenib-relapsed-or-refractory-acute-myeloid-leukemia-npm1-mutation?">
                  FDA approval of ziftomenib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40997296/">40997296</a>
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
              <td>{getAlternativeGenePageLinks('ESR1')}</td>
              <td>
                <AlterationPageLink hugoSymbol="ESR1" alteration="S463P">
                  S463P
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ESR1" alteration="L469V">
                  L469V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ESR1" alteration="L536">
                  L536
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ESR1" alteration="Y537">
                  Y537
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ESR1" alteration="D538">
                  D538
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ESR1" alteration="E380">
                  E380
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>Elacestrant (Level 1)</td>
              <td>Imlunestrant (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-imlunestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast">
                  FDA approval of imlunestrant
                </a>
                ; PMID:{' '}
                <a href="https://www.ncbi.nlm.nih.gov/pubmed/39660834">
                  39660834
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'AIM2',
              'AURKC',
              'CAV1',
              'COL5A1',
              'GSTO1',
              'HERPUD1',
              'LZTS1',
              'PICALM',
              'PTK7',
              'YWHAE',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
