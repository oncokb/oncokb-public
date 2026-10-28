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

export default function NewsContent102026() {
  return (
    <>
      <p>
        <strong>Germline Content Updates</strong>
      </p>
      <ul>
        <li>
          Addition of 126 germline variants seen in patients at MSK between June
          30, 2026 and October 1, 2026
        </li>
      </ul>
      <p>
        <strong>Updated Therapeutic Implications: Sensitivity</strong>
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
              <th>Drug(s) Added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ROS1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="S1986F"
                  germline={false}
                >
                  S1986F
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="S1986Y"
                  germline={false}
                >
                  S1986Y
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="L2026M"
                  germline={false}
                >
                  L2026M
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="S1986F"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>Repotrectinib</td>
              <td>
                Inclusion of Repotrectinib in Non-Small Cell Lung Cancer NCCN
                Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38875108/">38875108</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38197815/">38197815</a>
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
              <td>{getAlternativeGenePageLinks('KRAS', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12A"
                  germline={false}
                >
                  G12A
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12R"
                  germline={false}
                >
                  G12R
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12S"
                  germline={false}
                >
                  G12S
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12V"
                  germline={false}
                >
                  G12V
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12A"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>Daraxonrasib</td>
              <td>3A</td>
              <td>2</td>
              <td>
                Inclusion of Daraxonrasib in Non-Small Cell Lung Cancer NCCN
                Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/42685317/">42685317</a>
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('KRAS', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12D"
                  germline={false}
                >
                  G12D
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12D"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Daraxonrasib (Level 2)
                <br />
                <br />
                <em>Drug(s) currently in OncoKB™:</em> Setidegrasib (Level 3A)
              </td>
              <td>3A</td>
              <td>2</td>
              <td>
                Inclusion of Daraxonrasib in Non-Small Cell Lung Cancer NCCN
                Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/42685317/">42685317</a>
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ROS1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="G2032R"
                  germline={false}
                >
                  G2032R
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="G2032R"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Repotrectinib,
                <br />
                Zidesamtinib (Level 2)
                <br />
                <br />
                <em>Drug(s) promoted in OncoKB™:</em> Taletrectinib (Level 2,
                previously Level 3A)
              </td>
              <td>3A</td>
              <td>2</td>
              <td>
                Inclusion of Repotrectinib, Zidesamtinib, and Taletrectinib in
                Non-Small Cell Lung Cancer NCCN Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38875108/">38875108</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38197815/">38197815</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40179330/">40179330</a>
                <br />
                <br />
                Abstract:{' '}
                <a href="https://www.sciencedirect.com/science/article/pii/S1556086425010688">
                  A. Drilon, et al. Abstract #PL02.15. 2025 WCLC.
                </a>
              </td>
            </tr>
            <tr>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('KRAS', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G13"
                  germline={false}
                >
                  G13
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="Q61"
                  germline={false}
                >
                  Q61
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G13"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>
                <em>Drug(s) added to OncoKB™:</em> Daraxonrasib (Level 2)
                <br />
                <br />
                <em>Drug(s) currently in OncoKB™:</em> Binimetinib,
                <br />
                Cobimetinib,
                <br />
                Trametinib (Level 4)
              </td>
              <td>4</td>
              <td>2</td>
              <td>
                Inclusion of Daraxonrasib in Non-Small Cell Lung Cancer NCCN
                Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/42685317/">42685317</a>
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
              <th>Highest Level-associated Drug(s) in OncoKB™</th>
              <th>Drug(s) Added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('KRAS', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12C"
                  germline={false}
                >
                  G12C
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="KRAS"
                  alteration="G12C"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>
                Adagrasib,
                <br />
                Sotorasib (Level 1)
              </td>
              <td>Daraxonrasib (Level 2)</td>
              <td>
                Inclusion of Daraxonrasib in Non-Small Cell Lung Cancer NCCN
                Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/42685317/">42685317</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul style={{ marginBottom: 0 }}>
        <li style={{ marginBottom: 0 }}>
          Removal of therapy(s) associated with a cancer-type-specific leveled
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
              <td>2</td>
              <td>{getAlternativeGenePageLinks('EGFR', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="G719"
                  germline={false}
                >
                  G719
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="S768I"
                  germline={false}
                >
                  S768I
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="L861Q"
                  germline={false}
                >
                  L861Q
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="EGFR"
                  alteration="G719"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>
                Afatinib,
                <br />
                Datopotamab Deruxtecan (Level 1)
              </td>
              <td>Amivantamab + Chemotherapy (Level 2)</td>
              <td>
                Based on the Non-Small Cell Lung Cancer NCCN Guidelines stating
                the therapeutic combination is “not an option for EGFR S768I,
                L861Q, and/or G719X mutations”
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
              <th>Drug(s) Added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ROS1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="S1986F"
                  germline={false}
                >
                  S1986F
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="S1986F"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>Crizotinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27401242/">27401242</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33685866/">33685866</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ROS1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="S1986Y"
                  germline={false}
                >
                  S1986Y
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="S1986Y"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>Crizotinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27401242/">27401242</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ROS1', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="L2026M"
                  germline={false}
                >
                  L2026M
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ROS1"
                  alteration="L2026M"
                  cancerType="Non-Small Cell Lung Cancer"
                  germline={false}
                >
                  Non-Small Cell Lung Cancer
                </AlterationPageLink>
              </td>
              <td>Crizotinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25351743/">25351743</a>
                <br />
                <br />
                Abstract:{' '}
                <a href="https://www.annalsofoncology.org/action/showPdf?pii=S0923-7534%2821%2904095-3">
                  Y. Weng, et al. Abstract #1262P. ESMO 2021.
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={[
              'ACSL3',
              'ACSL6',
              'EPS15',
              'EZR',
              'FCRL4',
              'FIP1L1',
              'PER1',
            ]}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
