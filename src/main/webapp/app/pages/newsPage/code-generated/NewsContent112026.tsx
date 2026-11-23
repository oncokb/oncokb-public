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
import CancerHotspotsImg from 'content/images/cancer-hotspots.svg';
import AnnotatedAlterationsHotspotImg from 'content/images/annotated-alterations-hotspot.png';

export default function NewsContent112026() {
  return (
    <>
      <ul style={{ marginBottom: 0 }}>
        <li>
          We are thrilled to announce that OncoKB is the recipient of an NIH U24
          grant to support feature development and research aimed specifically
          to benefit our academic community and community clinicians who make up
          ≥90% of registered users under a free academic license. Accordingly,
          we are pleased to add{' '}
          <a href="https://cancercontrol.cancer.gov/brp/about/staff/iles">
            Dr. Irina Iles, Program Officer
          </a>{' '}
          and{' '}
          <a href="https://epi.grants.cancer.gov/staff/kalia.html">
            Dr. Sarah Kalia, Project Coordinator
          </a>{' '}
          to our External Advisory Board as non-voting ex-officio members.
        </li>
        <li style={{ marginBottom: 0 }}>
          We have updated our annotation of{' '}
          <Link to="/gene/Other%20Biomarkers/somatic/TMB-H?refGenome=GRCh38">
            Tumor Mutational Burden-High (TMB-H)
          </Link>{' '}
          to adhere to new guidance following{' '}
          <a href="https://www.fda.gov/drugs/cancer-approvals/fda-grants-traditional-approval-pembrolizumab-or-pembrolizumab-and-berahyaluronidase-alfa-pmph">
            FDA’s traditional approval
          </a>{' '}
          of pembrolizumab in TMB-H solid tumors. The revised guidance has
          changed the TMB-H threshold from ≥10 mutations per megabase (mut/Mb)
          to ≥13 mut/Mb based on clinical efficacy data from the{' '}
          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8416776/">
            phase III KEYNOTE-158 (NCT02628067) trial
          </a>{' '}
          of pembrolizumab in patients with multiple types of advanced
          (unresectable or metastatic) cancers that progressed following prior
          treatment:
        </li>
      </ul>
      <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>
                <strong>TMB Status (mut/Mb)</strong>
              </th>
              <th>
                <strong>N</strong>
              </th>
              <th>
                <strong>ORR (95% CI)</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>≥13</td>
              <td>70</td>
              <td>37% (26-50)</td>
            </tr>
            <tr>
              <td>≥10 to &lt;13</td>
              <td>32</td>
              <td>13% (4-29)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <strong>New hotspot visualization</strong>: Our Annotated Alterations
          table now indicates whether a curated gene-alteration represents or
          overlaps with a recurrent{' '}
          <a href="https://www.cancerhotspots.org/#/home">cancer hotspot</a> as
          defined by{' '}
          <a href="https://pubmed.ncbi.nlm.nih.gov/29247016/">
            Chang et al. 2017
          </a>{' '}
          and{' '}
          <a href="https://pubmed.ncbi.nlm.nih.gov/41895280/">
            Bandlamudi et al. 2026
          </a>
          . Click the fire icon (
          <OptimizedImage
            src={CancerHotspotsImg}
            alt="Hotspot icon"
            style={{ maxWidth: '100%', width: '18px' }}
          />
          ) to access the curated hotspot page. Note: hotspots are positional
          not allele specific alterations (e.g.,{' '}
          <Link to="/gene/PIK3CA/somatic/H1047">PIK3CA H1047</Link>,{' '}
          <Link to="/gene/PIK3CA/somatic/hotspot/436-466">
            PIK3CA 436_466 In-frame Indels
          </Link>
          ).
          <br />
          <br />
          <OptimizedImage
            src={AnnotatedAlterationsHotspotImg}
            alt="Annotated Alterations hotspot example"
            style={{ maxWidth: '100%', width: '900px', cursor: 'zoom-in' }}
            onClick={() =>
              window.open(AnnotatedAlterationsHotspotImg, '_blank', 'noopener')
            }
          />
        </li>
        <li>
          Release of <a href="https://sop.oncokb.org/">OncoKB™ SOP v6.5</a>
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
        <li>
          Update to our <Link to="/faq">FAQ page</Link> to reflect our hotspot
          changes
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
              <td>{getAlternativeGenePageLinks('ALK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="Fusions"
                  germline={false}
                >
                  Fusions
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="Fusions"
                  cancerType="Langerhans Cell Histiocytosis"
                  germline={false}
                >
                  Langerhans Cell Histiocytosis
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="Fusions"
                  cancerType="Rosai-Dorfman Disease"
                  germline={false}
                >
                  Rosai-Dorfman Disease
                </AlterationPageLink>
              </td>
              <td>Crizotinib</td>
              <td>
                Inclusion in the Langerhans Cell Histiocytosis and Rosai-Dorfman
                Disease NCCN Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31768065/">31768065</a>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('ALK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="Fusions"
                  germline={false}
                >
                  Fusions
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="ALK"
                  alteration="Fusions"
                  cancerType="Erdheim-Chester Disease"
                  germline={false}
                >
                  Erdheim-Chester Disease
                </AlterationPageLink>
              </td>
              <td>Alectinib, Brigatinib, Ceritinib, Crizotinib, Lorlatinib</td>
              <td>
                Inclusion in the Erdheim-Chester Disease NCCN Guidelines; PMIDs:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31768065/">31768065</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/34727172/">34727172</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41980922/">41980922</a>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('CSF1R', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="CSF1R"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="CSF1R"
                  alteration="Oncogenic Mutations"
                  cancerType="Erdheim-Chester Disease"
                  germline={false}
                >
                  Erdheim-Chester Disease
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="CSF1R"
                  alteration="Oncogenic Mutations"
                  cancerType="Langerhans Cell Histiocytosis"
                  germline={false}
                >
                  Langerhans Cell Histiocytosis
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="CSF1R"
                  alteration="Oncogenic Mutations"
                  cancerType="Rosai-Dorfman Disease"
                  germline={false}
                >
                  Rosai-Dorfman Disease
                </AlterationPageLink>
              </td>
              <td>Pexidartinib</td>
              <td>
                Inclusion in the Erdheim-Chester, Langerhans Cell Histiocytosis
                and Rosai-Dorfman Disease NCCN Guidelines; PMIDs:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31768065/">31768065</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/34978715/">34978715</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39576953/">39576953</a>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Somatic</td>
              <td>{convertGeneInputToLinks('NTRK1, NTRK2, NTRK3', false)}</td>
              <td>Fusions</td>
              <td>
                Erdheim-Chester Disease, Langerhans Cell Histiocytosis,
                Rosai-Dorfman Disease
              </td>
              <td>Entrectinib, Larotrectinib, Repotrectinib</td>
              <td>
                Inclusion in the Erdheim-Chester, Langerhans Cell Histiocytosis
                and Rosai-Dorfman Disease NCCN Guidelines; PMIDs:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/29920189/">29920189</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/29466156/">29466156</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40315374/">40315374</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37930319/">37930319</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31838007/">31838007</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41639379/">41639379</a>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('PIK3CA', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PIK3CA"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PIK3CA"
                  alteration="Oncogenic Mutations"
                  cancerType="Erdheim-Chester Disease"
                  germline={false}
                >
                  Erdheim-Chester Disease
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="PIK3CA"
                  alteration="Oncogenic Mutations"
                  cancerType="Langerhans Cell Histiocytosis"
                  germline={false}
                >
                  Langerhans Cell Histiocytosis
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="PIK3CA"
                  alteration="Oncogenic Mutations"
                  cancerType="Rosai-Dorfman Disease"
                  germline={false}
                >
                  Rosai-Dorfman Disease
                </AlterationPageLink>
              </td>
              <td>Everolimus, Sirolimus</td>
              <td>
                Inclusion in the Erdheim-Chester, Langerhans Cell Histiocytosis
                and Rosai-Dorfman Disease NCCN Guidelines; PMIDs:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30919713/">30919713</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31524314/">31524314</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/32299103/">32299103</a>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('RET', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="Fusions"
                  germline={false}
                >
                  Fusions
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="Fusions"
                  cancerType="Erdheim-Chester Disease"
                  germline={false}
                >
                  Erdheim-Chester Disease
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="Fusions"
                  cancerType="Langerhans Cell Histiocytosis"
                  germline={false}
                >
                  Langerhans Cell Histiocytosis
                </AlterationPageLink>
                ,{' '}
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="Fusions"
                  cancerType="Rosai-Dorfman Disease"
                  germline={false}
                >
                  Rosai-Dorfman Disease
                </AlterationPageLink>
              </td>
              <td>Selpercatinib</td>
              <td>
                Inclusion in the Erdheim-Chester, Langerhans Cell Histiocytosis
                and Rosai-Dorfman Disease NCCN Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31768065/">31768065</a>
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
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BCL2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BCL2"
                  alteration="G101V"
                  germline={false}
                >
                  G101V
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BCL2"
                  alteration="G101V"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Venetoclax</td>
              <td>
                BCL2 G101V listed as associated with resistance to the BCL2
                inhibitor venetoclax in the Chronic Lymphocytic Leukemia/Small
                Lymphocytic Lymphoma NCCN; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31004028/">31004028</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30514704/">30514704</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/36982875/">36982875</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31160589/">31160589</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38211332/">38211332</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BCL2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BCL2"
                  alteration="D103Y"
                  germline={false}
                >
                  D103Y
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BCL2"
                  alteration="D103Y"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Venetoclax</td>
              <td>
                BCL2 D103Y listed as associated with resistance to the BCL2
                inhibitor venetoclax in the Chronic Lymphocytic Leukemia/Small
                Lymphocytic Lymphoma NCCN; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31004028/">31004028</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/36982875/">36982875</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33491510/">33491510</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30514704/">30514704</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('CARD11', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="CARD11"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="CARD11"
                  alteration="Oncogenic Mutations"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Acalabrutinib, Ibrutinib, Pirtobrutinib Zanubrutinib</td>
              <td>
                CARD11 Oncogenic Mutations listed as associated with resistance
                to the BTK inhibitors acalabrutinib, ibrutinib, pirtobrutinib
                and zanubrutinib in the Chronic Lymphocytic Leukemia/Small
                Lymphocytic Lymphoma NCCN; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/28235842/">28235842</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27224912/">27224912</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('PLCG2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Acalabrutinib</td>
              <td>
                PLCG2 Oncogenic Mutations listed as associated with resistance
                to the BTK inhibitors acalabrutinib, ibrutinib, pirtobrutinib
                and zanubrutinib in the Chronic Lymphocytic Leukemia/Small
                Lymphocytic Lymphoma NCCN; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38754046/">38754046</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('PLCG2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Ibrutinib</td>
              <td>
                PLCG2 Oncogenic Mutations listed as associated with resistance
                to the BTK inhibitors acalabrutinib, ibrutinib, pirtobrutinib
                and zanubrutinib in the Chronic Lymphocytic Leukemia/Small
                Lymphocytic Lymphoma NCCN; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/28049639/">28049639</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/24869598/">24869598</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/26182309/">26182309</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/28366935/">28366935</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38754046/">38754046</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27199251/">27199251</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/36696464/">36696464</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/28418267/">28418267</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/25972157/">25972157</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/29259203/">29259203</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35196427/">35196427</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/32184360/">32184360</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('PLCG2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Pirtobrutinib</td>
              <td>
                PLCG2 Oncogenic Mutations listed as associated with resistance
                to the BTK inhibitors acalabrutinib, ibrutinib, pirtobrutinib
                and zanubrutinib in the Chronic Lymphocytic Leukemia/Small
                Lymphocytic Lymphoma NCCN; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41055698/">41055698</a>
              </td>
            </tr>
            <tr>
              <td>R1</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('PLCG2', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  germline={false}
                >
                  Oncogenic Mutations
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PLCG2"
                  alteration="Oncogenic Mutations"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Zanubritinib</td>
              <td>
                PLCG2 Oncogenic Mutations listed as associated with resistance
                to the BTK inhibitors acalabrutinib, ibrutinib, pirtobrutinib
                and zanubrutinib in the Chronic Lymphocytic Leukemia/Small
                Lymphocytic Lymphoma NCCN; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38268449/">38268449</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="V416L"
                  germline={false}
                >
                  V416L
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="V416L"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Pirtobrutinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35196427/">35196427</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41055698/">41055698</a>
              </td>
            </tr>
            <tr>
              <td>R2</td>
              <td>Somatic</td>
              <td>{getAlternativeGenePageLinks('BTK', false)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="M437R"
                  germline={false}
                >
                  M437R
                </AlterationPageLink>
              </td>
              <td>
                <AlterationPageLink
                  hugoSymbol="BTK"
                  alteration="M437R"
                  cancerType="Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma"
                  germline={false}
                >
                  Chronic Lymphocytic Leukemia/Small Lymphocytic Lymphoma
                </AlterationPageLink>
              </td>
              <td>Pirtobrutinib</td>
              <td>
                PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35196427/">35196427</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          <NewlyAddedGenesListItem
            genes={['ACTB', 'AFF3', 'FOXO4', 'FSTL3']}
          ></NewlyAddedGenesListItem>
        </li>
      </ul>
    </>
  );
}
