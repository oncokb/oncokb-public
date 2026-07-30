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

export default function NewsContent072026() {
  return (
    <>
      <ul style={{ marginBottom: 0 }}>
        <li style={{ marginBottom: 0 }}>
          <p>
            Following consultation and approval from hematologic experts in our{' '}
            <Link to="/team">
              Clinical Genomics Annotation Committee (CGAC)
            </Link>
            , we have updated our rules for assigning Level 3B to biomarkers
            detected in hematologic cancers. Biomarkers assigned Levels 1, 2, or
            3A in a specified hematologic cancer will now propagate to Level 3B
            in other hematologic cancers, unless specific evidence indicates
            otherwise. Please see our updated{' '}
            <Link to="/sop">OncoKB™ SOP v6.3</Link> for full details.
          </p>
        </li>
        <li style={{ marginBottom: 0 }}>
          <p>
            Also, for specifics on the changes to the rule regarding biomarker
            propagation to Level 3B in solid and hematologic cancers, please
            refer to our{' '}
            <a href="https://faq.oncokb.org/data-curation#do-all-therapeutics-propagate-as-level-3b-in-other-indications">
              FAQ
            </a>{' '}
            page.
            <strong>Updated Therapeutic Implications: Sensitivity</strong>
          </p>
        </li>
        <li style={{ marginBottom: 0 }}>
          <p>New alteration(s) with a cancer type-specific level of evidence</p>
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
              <td>2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('IDH2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="IDH2"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="IDH2"
                  alteration="Oncogenic Mutations"
                  cancerType="Myelodysplastic Syndromes"
                  germline={false}
                >
                  Myelodysplastic Syndromes
                </AlterationPageLink>
              </td>
              <td>Enasidenib</td>
              <td>
                Inclusion of IDH2 mutations in association with Enasidenib as
                “useful in certain circumstances” in the Myelodysplastic
                Syndrome NCCN Guidelines; Abstract:{' '}
                <a href="https://ashpublications.org/blood/article/144/Supplement%201/1839/529047/Enasidenib-ENA-Monotherapy-in-Patients-with-IDH2">
                  Sebert, M. et al. 2024 ASH. Abstract #637
                </a>
              </td>
            </tr>
            <tr>
              <td>3A</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('IDH1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="IDH1"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
                <br />
                <br />
                (excluding R132C, R132G, R132H, R132L, R132S, which are already
                leveled)
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="IDH1"
                  alteration="Oncogenic Mutations"
                  cancerType="Myelodysplastic Syndromes"
                  germline={false}
                >
                  Myelodysplastic Syndromes
                </AlterationPageLink>
              </td>
              <td>Olutasidenib, Olutasidenib + Azacitidine</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35973199/">35973199</a>
              </td>
            </tr>
            <tr>
              <td>3A</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('PTEN', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PTEN"
                  alteration="Deletion"
                  germline={false}
                >
                  Deletion
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="PTEN"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Prostate Cancer</td>
              <td>Capivasertib + Abiraterone + Prednisone</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-capivasertib-abiraterone-and-prednisone-pten-deficient-androgen-pathway-modulation">
                  FDA approval of Capivasertib and Abiraterone plus Prednisone
                  for PTEN-deficient (by IHC) prostate cancer
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41120017/">41120017</a>
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
              <th>Drug(s) added to OncoKBTM</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ERBB2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="Amplification"
                  germline={false}
                >
                  Amplification
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="Amplification"
                  cancerType="Breast Cancer"
                  germline={false}
                >
                  Breast Cancer
                </AlterationPageLink>
              </td>
              <td>
                Ado-Trastuzumab Emtansine, Lapatinib + Capecitabine, Lapatinib +
                Letrozole, Margetuximab + Chemotherapy, Neratinib, Neratinib +
                Capecitabine, Trastuzumab, Trastuzumab + Chemotherapy,
                Trastuzumab + Pertuzumab + Chemotherapy, Trastuzumab + Tucatinib
                + Capecitabine, Trastuzumab Deruxtecan, Trastuzumab Deruxtecan +
                Pertuzumab (Level 1)
              </td>
              <td>
                Palbociclib + Trastuzumab + Hormone Therapy + Pertuzumab
                Palbociclib + Trastuzumab + Hormone Therapy (Level 1)
              </td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-palbociclib-trastuzumab-or-without-pertuzumab-and-endocrine-therapy-maintenance">
                  FDA approval of palbociclib with trastuzumab, with or without
                  pertuzumab, and endocrine therapy
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41604639/">41604639</a>
              </td>
            </tr>
            <tr>
              <td>3A</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('IDH1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="IDH1"
                  alteration="R132C"
                  germline={false}
                >
                  R132C
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="IDH1"
                  alteration="R132G"
                  germline={false}
                >
                  R132G
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="IDH1"
                  alteration="R132H"
                  germline={false}
                >
                  R132H
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="IDH1"
                  alteration="R132L"
                  germline={false}
                >
                  R132L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="IDH1"
                  alteration="R132S"
                  germline={false}
                >
                  R132S
                </AlterationPageLink>
              </td>
              <td>Myelodysplastic Syndromes</td>
              <td>Ivosidenib (Level 1)</td>
              <td>Olutasidenib, Olutasidenib + Azacitidine (Level 3A)</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35973199/">35973199</a>
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
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="L248V"
                  germline={false}
                >
                  L248V
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="L248V"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12623848/">12623848</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19075254/">19075254</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/17303698/">17303698</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="Q252H"
                  germline={false}
                >
                  Q252H
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="Q252H"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/24109527/">24109527</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/16046538/">16046538</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15930265/">15930265</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19075254/">19075254</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/17303698/">17303698</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="Y253F"
                  germline={false}
                >
                  Y253F
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="Y253F"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15914554/">15914554</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12623848/">12623848</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12204532/">12204532</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/23044928/">23044928</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="E279K"
                  germline={false}
                >
                  E279K
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="E279K"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30335005/">30335005</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19075254/">19075254</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/16754879/">16754879</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="V289F"
                  germline={false}
                >
                  V289F
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="V289F"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/23355941/">23355941</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39440695/">39440695</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/24456693/">24456693</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="F311I"
                  germline={false}
                >
                  F311I
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="F311I"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37302352/">37302352</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39872583/">39872583</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="M351T"
                  germline={false}
                >
                  M351T
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="M351T"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/16172030/">16172030</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12204532/">12204532</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15710326/">15710326</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12654249/">12654249</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15930265/">15930265</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="E355G"
                  germline={false}
                >
                  E355G
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="E355G"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/16642048/">16642048</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/23502220/">23502220</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/20702476/">20702476</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19557636/">19557636</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39214096/">39214096</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="V379I"
                  germline={false}
                >
                  V379I
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="V379I"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26413254/">26413254</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12576318/">12576318</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15930265/">15930265</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="M388L"
                  germline={false}
                >
                  M388L
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="M388L"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30082224/">30082224</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="H396P"
                  germline={false}
                >
                  H396P
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="H396P"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/22160483/">22160483</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12576318/">12576318</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15930265/">15930265</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19075254/">19075254</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/21481795/">21481795</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="H396R"
                  germline={false}
                >
                  H396R
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="H396R"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/24456693/">24456693</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19768693/">19768693</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12576318/">12576318</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15930265/">15930265</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19075254/">19075254</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="E459K"
                  germline={false}
                >
                  E459K
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="E459K"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Imatinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41467077/">41467077</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25132497/">25132497</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/19201023/">19201023</a>
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
              <th>Drug(s) added to OncoKBTM</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="M244V"
                  germline={false}
                >
                  M244V
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="M244V"
                  cancerType="Chronic Myelogenous Leukemia"
                  germline={false}
                >
                  Chronic Myelogenous Leukemia
                </AlterationPageLink>
              </td>
              <td>Asciminib (Level R1)</td>
              <td>Imatinib (Level R2)</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/12399961/">12399961</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15930265/">15930265</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['ARNT', 'CDK7', 'GPRC5D', 'WNT10A']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
