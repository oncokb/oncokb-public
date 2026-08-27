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
import OptimizedImage from 'app/shared/image/OptimizedImage';
import CbioportalGermlineAnnotationImg from 'content/images/cbioportal-germline-annotation.png';

export default function NewsContent082026() {
  return (
    <>
      <ul>
        <li>
          Update to our{' '}
          <Link to="/oncology-therapies">FDA-Approved Oncology Therapies</Link>{' '}
          page
        </li>
        <li>
          Addition of 164 statistically recurrent single-residue and in-frame
          indel mutation{' '}
          <a href="https://www.cancerhotspots.org/#/home">cancer hotspots</a> as
          reported by{' '}
          <a href="https://pubmed.ncbi.nlm.nih.gov/41895280/">
            Bandlamudi et al., 2026
          </a>
          . This is in addition to the previous set of 1,165 hotspots reported
          in{' '}
          <a href="https://pubmed.ncbi.nlm.nih.gov/29247016/">
            Chang et al., 2017
          </a>{' '}
          and{' '}
          <a href="https://pubmed.ncbi.nlm.nih.gov/26619011/">
            Chang et al., 2016
          </a>
        </li>
      </ul>
      <p>
        <strong>Germline Content Updates</strong>
      </p>
      <ul>
        <li>
          Addition of 237 germline variants seen in patients at MSK between
          December 2025 and June 2026
        </li>
        <li>
          Addition of a new genomic indicator “Reduced-penetrance
          CHEK2-associated cancer risk” associated with germline{' '}
          <Link to="/gene/CHEK2/germline">CHEK2</Link> variants{' '}
          <Link to="/gene/CHEK2/germline/c.1283C%3ET">c.1283C&gt;T</Link>,{' '}
          <Link to="/gene/CHEK2/germline/c.470T%3EC">c.470T&gt;C</Link>, and{' '}
          <Link to="/gene/CHEK2/germline/c.1427C%3ET">c.1427C&gt;T</Link>
        </li>
        <li>
          Germline annotation is now incorporated into{' '}
          <a href="https://www.cbioportal.org/">cBioPortal</a>! Take a look at,
          for example,{' '}
          <a href="https://www.cbioportal.org/results/mutations?cancer_study_list=ov_tcga_pub&amp;cancer_study_id=ov_tcga_pub&amp;genetic_profile_ids_PROFILE_MUTATION_EXTENDED=ov_tcga_pub_mutations&amp;Z_SCORE_THRESHOLD=2.0&amp;case_set_id=ov_tcga_pub_3way_complete&amp;gene_list=BRCA1%20BRCA2&amp;gene_set_choice=user-defined-list">
            BRCA1 and BRCA2 mutations in ovarian cancer
          </a>
          .<br />
          <OptimizedImage
            src={CbioportalGermlineAnnotationImg}
            alt="Germline annotation in cBioPortal"
            style={{ maxWidth: '100%', width: '600px', cursor: 'zoom-in' }}
            onClick={() =>
              window.open(CbioportalGermlineAnnotationImg, '_blank', 'noopener')
            }
          />
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
              <td>{getAlternativeGenePageLinks('ROS1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="Fusions"
                  germline={false}
                >
                  Fusions
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="Fusions"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>
                Crizotinib, Entrectinib, Repotrectinib, Taletrectinib (Level 1)
              </td>
              <td>Zidesamtinib (Level1)</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-zidesamtinib-ros1-positive-non-small-cell-lung-cancer">
                  FDA approval of zidesamtinib
                </a>
                ; Abstract:{' '}
                <a href="https://www.sciencedirect.com/science/article/pii/S1556086425010688">
                  Drilon, AE. et al. Abstract# PL02.15, J Thorac Oncol, 2025
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['BCL11A', 'CDX2', 'CLTC', 'ETV7', 'PBX1', 'PCM1']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
