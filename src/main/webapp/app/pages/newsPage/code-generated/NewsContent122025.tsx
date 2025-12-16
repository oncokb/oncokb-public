import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent122025() {
  return (
    <>
      <ul>
        <li>
          We are excited to announce that OncoKB™ now includes germline variant
          annotation on our website!
          <ul>
            <li>
              This release includes 2649 pathogenic or likely pathogenic
              germline variants across 109 cancer-associated genes.
            </li>
            <li>
              Upcoming releases will incorporate therapeutic implications for
              germline variants and support for germline variant annotation
              through the API.
            </li>
            <li>
              To support this expansion, we have introduced a{' '}
              <strong>new gene page layout</strong> that clearly separates
              somatic and germline content. See{' '}
              <a href="/gene/BRCA1/germline">BRCA1</a> as an example.
            </li>
            <li>
              For more details on germline variant curation, please refer to our
              updated SOP,{' '}
              <em>PART II. Germline Variant annotation in OncoKB™</em> in v6.0
              of the <a href="https://sop.oncokb.org/">OncoKB™ SOP</a>.
            </li>
          </ul>
        </li>
        <li>
          Release of <a href="https://sop.oncokb.org/">OncoKB™ SOP v6.0</a>
        </li>
        <li>
          Transcripts have been updated for the following genes (note, only
          RefSeq transcripts have changed, not Ensembl transcripts):
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
                <td>{getAlternativeGenePageLinks('ANKRD26')}</td>
                <td>NM_001256053 (GRCh37/GRCh38)</td>
                <td>NM_014915.2 (GRCh37) NM_014915.3 (GRCh38)</td>
              </tr>
              <tr>
                <td>{getAlternativeGenePageLinks('TMEM127')}</td>
                <td>NM_001193304.2 (GRCh37/GRCh38)</td>
                <td>NM_017849.3 (GRCh37) NM_017849.4 (GRCh38)</td>
              </tr>
              <tr>
                <td>{getAlternativeGenePageLinks('MUTYH')}</td>
                <td>NM_012222.2 (GRCh37)</td>
                <td>NM_001128425.1 (GRCh37)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <br />
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
              <td>{getAlternativeGenePageLinks('ERBB2')}</td>
              <td>
                Tyrosine Kinase Domain Activating Mutations (
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L726F">
                  L726F
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L726I">
                  I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="T733I">
                  T733I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L768S">
                  L768S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L755A">
                  L755A
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L755P">
                  P
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L755S">
                  S
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L755W">
                  W
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="I767M">
                  I767M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="D769H">
                  D769H
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="ERBB2" alteration="D769Y">
                  Y
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V773L">
                  V773L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="G776S">
                  G776S
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="ERBB2" alteration="G776V">
                  V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V777L">
                  V777L
                </AlterationPageLink>
                /
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V777M">
                  M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V794M">
                  V794M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="T798M">
                  T798M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="D808N">
                  D808N
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="G815R">
                  G815R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="D821N">
                  D821N
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L841V">
                  L841V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V842I">
                  V842I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L866M">
                  L866M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L869R">
                  L869R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="770_831ins">
                  770_831ins
                </AlterationPageLink>
                )
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                Trastuzumab Deruxtecan, Zongertinib (Level 1)
                <br />
                <br />
                Ado-Trastuzumab Emtansine (Level 2)
                <br />
                <br />
                Neratinib, Sevabertinib, Trastuzumab + Pertuzumab + Docetaxel
                (Level 3A)
              </td>
              <td>Sevabertinib (Level 1, previously Level 3A)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-sevabertinib-non-squamous-non-small-cell-lung-cancer">
                  FDA approval of sevabertinib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41104928/">41104928</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'ALDH1A3',
              'ANK1',
              'APOBEC3B',
              'ATG5',
              'BABAM2',
              'BCL9L',
              'BIRC5',
              'BRD2',
              'BRD9',
              'CCAR1',
              'CCNB1IP1',
              'CEP43',
              'CHCHD7',
              'CILK1',
              'CLIP1',
              'KDSR',
              'LASP1',
              'MLF1',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
