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

export default function NewsContent092026() {
  return (
    <>
      <ul>
        <li>
          Release of <a href="https://sop.oncokb.org/">OncoKB™ SOP v6.4</a>
        </li>
        <li>
          On May 11, 2026,{' '}
          <a href="https://www.fda.gov/drugs/drug-alerts-and-statements/fda-alerts-health-care-providers-and-patients-about-increased-risk-new-blood-cancers-tazverik">
            Tazemetostat was withdrawn from the US market
          </a>{' '}
          due to an increased rate of hematologic second primary malignancies.
          All leveled biomarkers associated with Tazemetostat have been removed
          or demoted (see tables below)
        </li>
      </ul>
      <p>
        <strong>Updated Therapeutic Implications: Sensitivity</strong>
      </p>
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
                  alteration="D538G"
                  germline={false}
                >
                  D538G
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="E380Q"
                  germline={false}
                >
                  E380Q
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="L536H"
                  germline={false}
                >
                  L536H
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="L536P"
                  germline={false}
                >
                  L536P
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="L536R"
                  germline={false}
                >
                  L536R
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
                  alteration="Y537C"
                  germline={false}
                >
                  Y537C
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="Y537D"
                  germline={false}
                >
                  Y537D
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="Y537N"
                  germline={false}
                >
                  Y537N
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="Y537S"
                  germline={false}
                >
                  Y537S
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="D538G"
                  cancerType="Breast Cancer"
                  germline={false}
                >
                  Breast Cancer
                </AlterationPageLink>
              </td>
              <td>
                Imlunestrant, Vepdegestrant, Elacestrant (Level 1) Fulvestrant
                (Level 3A)
              </td>
              <td>
                Camizestrant + Abemaciclib, Camizestrant + Palbociclib,
                Camizestrant + Ribociclib (Level1)
              </td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-camizestrant-cdk46-inhibitor-esr1-mutated-hr-positive-her2-negative">
                  FDA approval of camizestrantwith a CDK4/6 inhibitor
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/42442380/">42442380</a>
              </td>
            </tr>
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
              <td>
                <AlterationPageLink
                  hugoSymbol="ESR1"
                  alteration="V422del"
                  cancerType="Breast Cancer"
                  germline={false}
                >
                  Breast Cancer
                </AlterationPageLink>
              </td>
              <td>
                Imlunestrant, Vepdegestrant (Level 1) Elacestrant (Level 2)
                Fulvestrant (Level 3A)
              </td>
              <td>
                Camizestrant + Abemaciclib, Camizestrant + Palbociclib,
                Camizestrant + Ribociclib (Level1)
              </td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-camizestrant-cdk46-inhibitor-esr1-mutated-hr-positive-her2-negative">
                  FDA approval of camizestrantwith a CDK4/6 inhibitor
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/42442380/">42442380</a>
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ARID1A', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ARID1A"
                  alteration="Truncating Mutations"
                  germline={false}
                >
                  Truncating Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ARID1A"
                  alteration="Truncating Mutations"
                  cancerType="All Solid Tumors"
                  germline={false}
                >
                  All Solid Tumors
                </AlterationPageLink>
              </td>
              <td>Zavabresib (Level 4)</td>
              <td>Tulmimetostat (Level 4)</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38833522/">38833522</a>{' '}
                Abstract:{' '}
                <a href="https://www.asco.org/abstracts-presentations/224714">
                  Drescher et al. Abstract# 3094 ASCO 2023
                </a>
                .{' '}
                <a href="https://urldefense.com/v3/__https://ascopubs.org/doi/10.1200/JCO.2025.43.16_suppl.3102__;!!KVWo1iE!QZW9FuCOMAcBZcF-raU4pjWZVQXYacUwiaxeQ6Wj8CIp6t1T6izQEWWa2j1El665J76s5fJfHeTFSQ$">
                  Duska et al. Abstract# 3102 ASCO 2025
                </a>
                .
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul style={{ marginBottom: 0 }}>
        <li style={{ marginBottom: 0 }}>
          Demotion of tumor type-specific level of evidence for an alteration
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
              <th>Drug(s) removed from OncoKB™</th>
              <th>Previous Level</th>
              <th>Updated Level</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('EZH2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="A692V"
                  germline={false}
                >
                  A692V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="Y646C"
                  germline={false}
                >
                  Y646C
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="Y646F"
                  germline={false}
                >
                  Y646F
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="Y646H"
                  germline={false}
                >
                  Y646H
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="Y646N"
                  germline={false}
                >
                  Y646N
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="Y646S"
                  germline={false}
                >
                  Y646S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="A682G"
                  germline={false}
                >
                  A682G
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="A692V"
                  cancerType="Follicular Lymphoma"
                  germline={false}
                >
                  Follicular Lymphoma
                </AlterationPageLink>
              </td>
              <td>Tazemetostat</td>
              <td>1</td>
              <td>No Level</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-alerts-and-statements/fda-alerts-health-care-providers-and-patients-about-increased-risk-new-blood-cancers-tazverik">
                  Withdrawal of Tazemetostat from market
                </a>
                ; Increased rate of hematologic second primary malignancies
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('SMARCB1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="SMARCB1"
                  alteration="Deletion"
                  germline={false}
                >
                  Deletion
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="SMARCB1"
                  alteration="Deletion"
                  cancerType="Epithelioid Sarcoma"
                  germline={false}
                >
                  Epithelioid Sarcoma
                </AlterationPageLink>
              </td>
              <td>
                Tazemetostat <em>Drug(s) added to OncoKB™:</em> SHR2554, HH2853
                (Level 4)
              </td>
              <td>1</td>
              <td>4</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-alerts-and-statements/fda-alerts-health-care-providers-and-patients-about-increased-risk-new-blood-cancers-tazverik">
                  Withdrawal of Tazemetostat from market
                </a>
                ; Increased rate of hematologic second primary malignancies
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40821900/">40821900</a>{' '}
                Abstract:{' '}
                <a href="https://urldefense.com/v3/__https://ascopubs.org/doi/10.1200/JCO.2024.42.16_suppl.11549__;!!KVWo1iE!QZW9FuCOMAcBZcF-raU4pjWZVQXYacUwiaxeQ6Wj8CIp6t1T6izQEWWa2j1El665J76s5fLwLtqk6A$">
                  Zhou et al. Abstract#11549. ASCO. 2024
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('EZH2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EZH2"
                  alteration="Oncogenic Mutations"
                  cancerType="Follicular Lymphoma"
                  germline={false}
                >
                  Follicular Lymphoma
                </AlterationPageLink>
              </td>
              <td>Tazemetostat</td>
              <td>2</td>
              <td>No Level</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-alerts-and-statements/fda-alerts-health-care-providers-and-patients-about-increased-risk-new-blood-cancers-tazverik">
                  Withdrawal of Tazemetostat from market
                </a>
                ; Increased rate of hematologic second primary malignancies
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('SMARCB1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="SMARCB1"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="SMARCB1"
                  alteration="Oncogenic Mutations"
                  cancerType="All Liquid Tumors"
                  germline={false}
                >
                  All Liquid Tumors
                </AlterationPageLink>
              </td>
              <td>Tazemetostat</td>
              <td>4</td>
              <td>No Level</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-alerts-and-statements/fda-alerts-health-care-providers-and-patients-about-increased-risk-new-blood-cancers-tazverik">
                  Withdrawal of Tazemetostat from market
                </a>
                ; Increased rate of hematologic second primary malignancies
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('KDM6A', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KDM6A"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KDM6A"
                  alteration="Oncogenic Mutations"
                  cancerType="Bladder Cancer"
                  germline={false}
                >
                  Bladder Cancer
                </AlterationPageLink>
              </td>
              <td>Tazemetostat</td>
              <td>4</td>
              <td>No Level</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-alerts-and-statements/fda-alerts-health-care-providers-and-patients-about-increased-risk-new-blood-cancers-tazverik">
                  Withdrawal of Tazemetostat from market
                </a>
                ; Increased rate of hematologic second primary malignancies
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul style={{ marginBottom: 0 }}>
        <li style={{ marginBottom: 0 }}>
          Removal of therapy(s) associated with a tumor type-specific leveled
          alteration(s) (without changing the alteration's highest level of
          evidence)
        </li>
      </ul>
      <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Setting</th>
              <th>Level</th>
              <th>Gene</th>
              <th>Mutation</th>
              <th>Cancer Type</th>
              <th>Level-Associated Drugs in OncoKB™</th>
              <th>Drug(s) Removed from OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Somatic</td>
              <td>4</td>
              <td>{getAlternativeGenePageLinks('ARID1A', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ARID1A"
                  alteration="Truncating Mutations"
                  germline={false}
                >
                  Truncating Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ARID1A"
                  alteration="Truncating Mutations"
                  cancerType="All Solid Tumors"
                  germline={false}
                >
                  All Solid Tumors
                </AlterationPageLink>
              </td>
              <td>Tulmimetostat, Zavabresib (Level 4)</td>
              <td>Tazemetostat (Level 4)</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-alerts-and-statements/fda-alerts-health-care-providers-and-patients-about-increased-risk-new-blood-cancers-tazverik">
                  Withdrawal of Tazemetostat from market
                </a>
                ; Increased rate of hematologic second primary malignancies
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>Updated Therapeutic Implications: Resistance</strong>
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
              <th>Cancer Type</th>
              <th>Drug(s) added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="T474"
                  germline={false}
                >
                  T474
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="T474"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Ibrutinib, Acalabrutinib, Zanubrutinib, Pirtobrutinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35196427/">35196427</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41055698/">41055698</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38301010/">38301010</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481"
                  germline={false}
                >
                  C481
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="C481"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Ibrutinib, Acalabrutinib, Zanubrutinib</td>
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
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="L528"
                  germline={false}
                >
                  L528
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="L528"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Ibrutinib, Acalabrutinib, Zanubrutinib, Pirtobrutinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26182309/">26182309</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39853273/">39853273</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35901282/">35901282</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35196427/">35196427</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41055698/">41055698</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38301010/">38301010</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31217352/">31217352</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="A428D"
                  germline={false}
                >
                  A428D
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="A428D"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Ibrutinib, Zanubrutinib, Pirtobrutinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38754046/">38754046</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39853273/">39853273</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35196427/">35196427</a>{' '}
                Abstract:{' '}
                <a href="https://www.sciencedirect.com/science/article/pii/S0006497125048499">
                  Sievers, et al. Abstract# 641. ASH. 2025.
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <em>
          * Table: Position-level annotations (T474, C481) apply to variants at
          these residues not already leveled individually
        </em>
      </p>
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
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="T474I"
                  germline={false}
                >
                  T474I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="T474S"
                  germline={false}
                >
                  T474S
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="T474I"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Acalabrutinib, Zanubrutinib,
                Pirtobrutinib (Level R1) <em>Drug(s) promoted in OncoKB™:</em>{' '}
                Ibrutinib (Level R1, previously Level R2)
              </td>
              <td>R2</td>
              <td>R1</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38754046/">38754046</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35196427/">35196427</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41055698/">41055698</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38301010/">38301010</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'CREB3L1',
              'DDX6',
              'DDX10',
              'GLIS2',
              'MNX1',
              'PDE4DIP',
              'ZNF384',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
