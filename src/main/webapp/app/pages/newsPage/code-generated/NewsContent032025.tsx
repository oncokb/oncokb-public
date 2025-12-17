import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
  GenePageLink,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

export default function NewsContent032025() {
  return (
    <>
      <ul>
        <li>
          Updated Therapeutic Implications - New alteration(s) with a tumor
          type-specific level of evidence
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
              <th>Drug(s) Added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>4</td>
              <td>{getAlternativeGenePageLinks('ERBB2')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="Oncogenic Mutations"
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Biliary Tract Cancer</td>
              <td>
                Neratinib, Trastuzumab Deruxtecan, Pertuzumab + Trastuzumab
              </td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/36746967/">36746967</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38710187/">38710187</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38748939/">38748939</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h4></h4>
      <ul>
        <li>
          Updated Therapeutic Implications - Promotion of tumor type-specific
          level of evidence for an alteration
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
                  alteration="Oncogenic Mutations"
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Breast Cancer</td>
              <td>
                <em>Drug(s) added to OncoKB™:</em>
                <br />
                Neratinib + Trastuzumab + Fulvestrant (Level 2)
                <br />
                <br />
                <em>Drug(s) remaining in OncoKB™:</em>
                <br />
                Neratinib (Level 3A)
              </td>
              <td>3A</td>
              <td>2</td>
              <td>
                Inclusion in Breast Cancer NCCN Guidelines V3.2025; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37597578/">37597578</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          Updated Therapeutic Implications - Addition of drug(s) associated with
          a tumor type-specific leveled alteration(s) currently in OncoKB™
          (without changing the alteration's highest level of evidence)
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
              <td>{getAlternativeGenePageLinks('NF1')}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="NF1"
                  alteration="Oncogenic Mutations"
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>Neurofibroma</td>
              <td>Selumentinib (Level 1)</td>
              <td>Mirdametinib (Level 1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-mirdametinib-adult-and-pediatric-patients-neurofibromatosis-type-1-who-have-symptomatic">
                  FDA approval of mirdametinib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39514826/">39514826</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['DIS3L2', 'ERCC6', 'FANCB', 'MTHFR', 'NFATC2']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
