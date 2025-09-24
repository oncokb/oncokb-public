import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlterationPageLink,
  getAlternativeGenePageLinks,
} from 'app/shared/utils/UrlUtils';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { TableOfContents } from 'app/pages/privacyNotice/TableOfContents';

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
              <td>{getAlternativeGenePageLinks('ERBB2')}</td>
              <td>
                Tyrosine Kinase Domain Activating Mutations (
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V697L">
                  V697L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="Q709L">
                  Q709L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="A710V">
                  A710V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="E717D">
                  E717D
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L726F">
                  L726F
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L726I">
                  L726I
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
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L755P">
                  L755P
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L755S">
                  L755S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="L755W">
                  L755W
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="I767M">
                  I767M
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="D769H">
                  D769H
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="D769Y">
                  D769Y
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V773L">
                  V773L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="G776S">
                  G776S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="G776V">
                  G776V
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V777L">
                  V777L
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink hugoSymbol="ERBB2" alteration="V777M">
                  V777M
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
