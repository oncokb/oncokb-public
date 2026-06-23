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

export default function NewsContent062026() {
  return (
    <>
      <ul>
        <li>
          To align with the FDA-approved{' '}
          <a href="https://www.thermofisher.com/us/en/home/clinical/diagnostic-testing/condition-disease-diagnostics/oncology-diagnostics/oncomine-dx-target-test/oncomine-dx-target-test-us-only.html">
            companion diagnostic
          </a>{' '}
          for trastuzumab deruxtecan (T-DXd), the Level 1 annotation for ERBB2
          alterations associated with T-DXd in non-small cell lung cancer has
          been updated from{' '}
          <em>
            <strong>ERBB2</strong> Oncogenic Mutations
          </em>{' '}
          to{' '}
          <em>
            <strong>ERBB2</strong>
          </em>{' '}
          <strong>
            Oncogenic Missense Mutations and Exon 20 In-Frame Insertions
            (770_831ins)
          </strong>
          <em>.</em> As a result, ERBB2 fusions and in-frame insertions outside
          exon 20 are no longer included in this Level 1 association.
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
              <td>R1</td>
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
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="A337T"
                  germline={false}
                >
                  A337T
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="P465S"
                  germline={false}
                >
                  P465S
                </AlterationPageLink>
              </td>
              <td>
                Chronic Myelogenous Leukemia, B-Lymphoblastic Leukemia/Lymphoma
              </td>
              <td>Asciminib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40334072/">40334072</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39300220/">39300220</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31543464/">31543464</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38643492/">38643492</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('NTRK1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="NTRK1"
                  alteration="G667C"
                  germline={false}
                >
                  G667C
                </AlterationPageLink>
              </td>
              <td>All Solid Tumors</td>
              <td>Entrectinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/29463555/">29463555</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33328556/">33328556</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26546295/">26546295</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('NTRK1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="NTRK1"
                  alteration="F589L"
                  germline={false}
                >
                  F589L
                </AlterationPageLink>
              </td>
              <td>All Solid Tumors</td>
              <td>Larotrectinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31406350/">31406350</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/29466156/">29466156</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33328556/">33328556</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('FLT3', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="FLT3"
                  alteration="F691L"
                  germline={false}
                >
                  F691L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="FLT3"
                  alteration="N701K"
                  germline={false}
                >
                  N701K
                </AlterationPageLink>
              </td>
              <td>Acute Myeloid Leukemia</td>
              <td>Gilteritinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31088841/">31088841</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33780043/">33780043</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37815132/">37815132</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('MEN1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="MEN1"
                  alteration="M322I"
                  germline={false}
                >
                  M322I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="MEN1"
                  alteration="M322V"
                  germline={false}
                >
                  M322V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="MEN1"
                  alteration="G326R"
                  germline={false}
                >
                  G326R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="MEN1"
                  alteration="T344M"
                  germline={false}
                >
                  T344M
                </AlterationPageLink>
              </td>
              <td>Acute Myeloid Leukemia</td>
              <td>Revumenib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/36922589/">36922589</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41963592/">41963592</a>
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
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ABL1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="F359V"
                  germline={false}
                >
                  F359V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="F359I"
                  germline={false}
                >
                  F359I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ABL1"
                  alteration="F359C"
                  germline={false}
                >
                  F359C
                </AlterationPageLink>
              </td>
              <td>
                Chronic Myelogenous Leukemia, B-Lymphoblastic <br />
                <br /> Leukemia/Lymphoma
              </td>
              <td>
                Resistance Imatinib, Nilotinib (Level R1) <br />
                <br /> Sensitivity Bosutinib, Dasatinib (Level 2)
              </td>
              <td>Asciminib (Level R1)</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40334072/">40334072</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39300220/">39300220</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31543464/">31543464</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38643492/">38643492</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['ABI1', 'AFF1', 'ARFRP1', 'CD33', 'DUSP9', 'F3']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
