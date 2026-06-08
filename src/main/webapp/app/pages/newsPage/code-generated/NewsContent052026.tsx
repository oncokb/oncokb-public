import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
  GenePageLink,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';
import { convertGeneInputToLinks } from 'app/pages/newsPage/Util';

export default function NewsContent052026() {
  return (
    <>
      <ul>
        <li>
          Release of <a href="https://sop.oncokb.org/">OncoKB™ SOP v6.2</a>
        </li>
        <li>
          Update to our{' '}
          <Link to="/companion-diagnostic-devices">
            FDA Cleared or Approved Companion Diagnostic Devices
          </Link>{' '}
          (CDx) page
        </li>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
        </li>
      </ul>
      <p>
        <strong>Updated Therapeutic Implications</strong>
      </p>
      <ul style={{ marginBottom: 0 }}>
        <li style={{ marginBottom: 0 }}>
          New alteration(s) with a cancer type-specific level of evidence
        </li>
      </ul>
      <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Setting</th>
              <th>Gene(s)</th>
              <th>Mutation</th>
              <th>Cancer Type(s)</th>
              <th>Drug(s) added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ESR1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="L549P"
                  germline={false}
                >
                  L549P
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>Vepdegestrant (Level 1), Fulvestrant (Level 3A)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vepdegestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast?utm_medium=email&amp;utm_source=govdelivery">
                  FDA approval of Vepdegestrant
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40454645/">40454645</a>
              </td>
            </tr>
            <tr>
              <td>3A</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481S"
                  germline={false}
                >
                  C481S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481F"
                  germline={false}
                >
                  C481F
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481R"
                  germline={false}
                >
                  C481R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481Y"
                  germline={false}
                >
                  C481Y
                </AlterationPageLink>
              </td>
              <td>Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma</td>
              <td>Pirtobrutinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33676628/">33676628</a>
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('CDK4', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="CDK4"
                  alteration="Amplification"
                  germline={false}
                >
                  Amplification
                </AlterationPageLink>
              </td>
              <td>Uterine Sarcoma</td>
              <td>Palbociclib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37875500/">37875500</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ALK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="I1171S"
                  germline={false}
                >
                  I1171S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="V1180L"
                  germline={false}
                >
                  V1180L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="L1196Q"
                  germline={false}
                >
                  L1196Q
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Alectinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27009859/">27009859</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26464158/">26464158</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25393796/">25393796</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25228534/">25228534</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37907052/">37907052</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30662002/">30662002</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33209633/">33209633</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31712133/">31712133</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ALK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="T1151M"
                  germline={false}
                >
                  T1151M
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Crizotinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27009859/">27009859</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30892989/">30892989</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ALK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="I1171T"
                  germline={false}
                >
                  I1171T
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Alectinib, Crizotinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25749034/">25749034</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25228534/">25228534</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/24675041/">24675041</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/22034911/">22034911</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/29877262/">29877262</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25393798/">25393798</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('EGFR', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="T854A"
                  germline={false}
                >
                  T854A
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Erlotinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19010870/">19010870</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26041145/">26041145</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('MET', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="MET"
                  alteration="D1228H"
                  germline={false}
                >
                  D1228H
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Capmatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35690785/">35690785</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39180576/">39180576</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('RET', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="G810C"
                  germline={false}
                >
                  G810C
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="G810S"
                  germline={false}
                >
                  G810S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="G810R"
                  germline={false}
                >
                  G810R
                </AlterationPageLink>
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>Selpercatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37070927/">37070927</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31988000/">31988000</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33161056/">33161056</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul style={{ marginBottom: 0 }}>
        <li style={{ marginBottom: 0 }}>
          Promotion of cancer type-specific level of evidence for an alteration
        </li>
      </ul>
      <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Setting</th>
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
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('NRG1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="NRG1"
                  alteration="Fusions"
                  germline={false}
                >
                  Fusions
                </AlterationPageLink>
              </td>
              <td>Cholangiocarcinoma</td>
              <td>
                <em>Drug(s) promoted in OncoKB™:</em> Zenocutuzumab
              </td>
              <td>2</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-zenocutuzumab-zbco-advanced-unresectable-or-metastatic-cholangiocarcinoma">
                  FDA approval of Zenocutuzumab
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39908431/">39908431</a>
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ESR1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="K303R"
                  germline={false}
                >
                  K303R
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Vepdegestrant (Level 1){' '}
                <br />
                <br /> <em>Drug(s) remaining in OncoKB™:</em> Fulvestrant (Level
                3A)
              </td>
              <td>3A</td>
              <td>1</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vepdegestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast?utm_medium=email&amp;utm_source=govdelivery">
                  FDA approval of Vepdegestrant
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40454645/">40454645</a>
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481F"
                  germline={false}
                >
                  C481F
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481R"
                  germline={false}
                >
                  C481R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481Y"
                  germline={false}
                >
                  C481Y
                </AlterationPageLink>
              </td>
              <td>Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Acalabrutinib, Zanubrutinib
                (Level R1) <br />
                <br /> <em>Drug(s) promoted in OncoKB™:</em> Ibrutinib (Level
                R1, previously Level R2)
              </td>
              <td>R2</td>
              <td>R1</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39908431/">39908431</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26182309/">26182309</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30508305/">30508305</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35639855/">35639855</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39853273/">39853273</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27282255/">27282255</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/28049639/">28049639</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27571029/">27571029</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38754046/">38754046</a>{' '}
                Abstract:{' '}
                <a href="https://ashpublications.org/blood/article/134/Supplement_1/504/426369/Resistance-to-Acalabrutinib-in-CLL-Is-Mediated">
                  Woyach, J. et al. Abstract# 642.CLL, Blood. 2019
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul style={{ marginBottom: 0 }}>
        <li style={{ marginBottom: 0 }}>
          Addition of drug(s) associated with an existing cancer type-specific
          alteration with an assigned OncoKB™ level of evidence, without
          changing the alteration's highest level of evidence
        </li>
      </ul>
      <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Setting</th>
              <th>Gene</th>
              <th>Mutation</th>
              <th>Cancer Type</th>
              <th>Level-associated Drug(s) in OncoKB™</th>
              <th>Drug(s) added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ESR1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="V422del"
                  germline={false}
                >
                  V422del
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>
                Imlunestrant (Level 1), Elacestrant (Level 2), Fulvestrant
                (Level 3A)
              </td>
              <td>Vepdegestrant (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vepdegestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast?utm_medium=email&amp;utm_source=govdelivery">
                  FDA approval of Vepdegestrant
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40454645/">40454645</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ESR1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="D538"
                  germline={false}
                >
                  D538
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="E380"
                  germline={false}
                >
                  E380
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="Y537"
                  germline={false}
                >
                  Y537
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="L536"
                  germline={false}
                >
                  L536
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="L469V"
                  germline={false}
                >
                  L469V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="S463P"
                  germline={false}
                >
                  S463P
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="S463F"
                  germline={false}
                >
                  S463F
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>
                Imlunestrant, Elascetrant (Level 1), Fulvestrant (Level 3A)
              </td>
              <td>Vepdegestrant (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vepdegestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast?utm_medium=email&amp;utm_source=govdelivery">
                  FDA approval of Vepdegestrant
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40454645/">40454645</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ESR1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="Oncogenic missense mutations in the ligand binding domain (LBD)"
                  germline={false}
                  isTag={true}
                >
                  Oncogenic missense mutations in the ligand binding domain
                  (LBD)
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>Elascetrant (Level 1), Fulvestrant (Level 3A)</td>
              <td>Vepdegestrant (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vepdegestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast?utm_medium=email&amp;utm_source=govdelivery">
                  FDA approval of Vepdegestrant
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40454645/">40454645</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481S"
                  germline={false}
                >
                  C481S
                </AlterationPageLink>
              </td>
              <td>Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma</td>
              <td>Ibrutinib</td>
              <td>Acalabrutinib (Level R1), Zanubrutinib (Level R1)</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38754046/">38754046</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38301010/">38301010</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35639855/">35639855</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39853273/">39853273</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['ART1', 'CCT2', 'LAG3', 'PTH']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
