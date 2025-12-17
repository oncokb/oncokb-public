import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
  GenePageLink,
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
              germline variants across
            </li>
          </ul>
        </li>
      </ul>
      <details>
        <summary>109 cancer-associated genes.</summary>
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <tbody>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="ALK" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="ANKRD26" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="APC" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="ATM" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="AXIN2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="BAP1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="BARD1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="BLM" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="BMPR1A" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="BRCA1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="BRCA2" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="BRIP1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="BTK" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CALR" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CBL" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CDC73" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CDH1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CDK4" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CDKN1B" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CDKN2A" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CDKN2A (p14)" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CEBPA" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="CHEK2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="CTR9" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="DDX41" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="DICER1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="DPYD" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="EGFR" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="ELOC" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="EPCAM" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="ERCC3" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="ETV6" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="FANCA" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="FANCC" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="FAS" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="FH" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="FLCN" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="GATA2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="GREM1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="HOXB13" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="HRAS" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="IKZF1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="KEAP1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="KIT" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="KRAS" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="LZTR1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MAP3K1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MAX" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MEN1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MET" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MITF" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MLH1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MPL" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MSH2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MSH3" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="MSH6" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="MUTYH" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="NBN" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="NF1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="NF2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="NRAS" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="NSD1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="NTHL1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PALB2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PAX5" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PDGFRA" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="PHOX2B" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PMS2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="POLD1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="POLE" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="POT1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PRKAR1A" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PTCH1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PTEN" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="PTPN11" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="RAD51B" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="RAD51C" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="RAD51D" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="RB1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="REST" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="RET" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="RNF43" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="RTEL1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="RUNX1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SDHA" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SDHAF2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SDHB" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SDHC" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="SDHD" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SH2B3" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SMAD3" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SMAD4" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SMARCA4" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SMARCB1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SMARCE1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SRP72" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="STK11" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="SUFU" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TERT" germline />
                </td>
              </tr>
              <tr>
                <td>
                  <GenePageLink hugoSymbol="TGFBR1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TGFBR2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TMEM127" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TP53" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TRIP13" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TSC1" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TSC2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="TYK2" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="VHL" germline />
                </td>
                <td>
                  <GenePageLink hugoSymbol="WT1" germline />
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <br />
      <ul>
        <li>
          Upcoming releases will incorporate therapeutic implications for
          germline variants and support for germline variant annotation through
          the API.
        </li>
        <li>
          To support this expansion, we have introduced a{' '}
          <strong>new gene page layout</strong> that clearly separates somatic
          and germline content. See <a href="/gene/BRCA1/germline">BRCA1</a> as
          an example.
        </li>
        <li>
          For more details on germline variant curation, please refer to our
          updated SOP, <em>PART II. Germline Variant annotation in OncoKB™</em>{' '}
          in v6.0 of the <a href="https://sop.oncokb.org/">OncoKB™ SOP</a>.
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
