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
import GeneticTypeTag from 'app/components/tag/GeneticTypeTag';

export default function NewsContent082025() {
  return (
    <>
      <ul>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
        </li>
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
              <td>{getAlternativeGenePageLinks('ERBB2', false)}</td>
              <td>
                Tyrosine Kinase Domain Activating Mutations (
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="V697L"
                  germline={false}
                >
                  V697L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="Q709L"
                  germline={false}
                >
                  Q709L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="A710V"
                  germline={false}
                >
                  A710V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="E717D"
                  germline={false}
                >
                  E717D
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L726F"
                  germline={false}
                >
                  L726F
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L726I"
                  germline={false}
                >
                  L726I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="T733I"
                  germline={false}
                >
                  T733I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L768S"
                  germline={false}
                >
                  L768S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L755A"
                  germline={false}
                >
                  L755A
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L755P"
                  germline={false}
                >
                  L755P
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L755S"
                  germline={false}
                >
                  L755S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L755W"
                  germline={false}
                >
                  L755W
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="I767M"
                  germline={false}
                >
                  I767M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="D769H"
                  germline={false}
                >
                  D769H
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="D769Y"
                  germline={false}
                >
                  D769Y
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="V773L"
                  germline={false}
                >
                  V773L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="G776S"
                  germline={false}
                >
                  G776S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="G776V"
                  germline={false}
                >
                  G776V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="V777L"
                  germline={false}
                >
                  V777L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="V777M"
                  germline={false}
                >
                  V777M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="V794M"
                  germline={false}
                >
                  V794M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="T798M"
                  germline={false}
                >
                  T798M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="D808N"
                  germline={false}
                >
                  D808N
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="G815R"
                  germline={false}
                >
                  G815R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="D821N"
                  germline={false}
                >
                  D821N
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L841V"
                  germline={false}
                >
                  L841V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="V842I"
                  germline={false}
                >
                  V842I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L866M"
                  germline={false}
                >
                  L866M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="L869R"
                  germline={false}
                >
                  L869R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ERBB2"
                  alteration="770_831ins"
                  germline={false}
                >
                  770_831ins
                </AlterationPageLink>
                )
              </td>
              <td>Non-Small Cell Lung Cancer</td>
              <td>
                Trastuzumab Deruxtecan (Level 1)
                <br />
                <br />
                Ado-Trastuzumab Emtansine (Level 2)
                <br />
                <br />
                Neratinib, Sevabertinib, Trastuzumab + Pertuzumab + Docetaxel,
                Zongertinib (Level 3A)
              </td>
              <td>Zongertinib (Level 1, previously Level 3A)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-zongertinib-non-squamous-nsclc-her2-tkd-activating-mutations">
                  FDA approval of zongertinib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40293180/">40293180</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h4></h4>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['A1CF', 'ADAR', 'L1TD1', 'RELA']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
