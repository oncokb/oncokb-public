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

export default function NewsContent042026() {
  return (
    <>
      <ul>
        <li>
          We are now supporting germline variant annotation through the API!
          Please see our updated API documentation{' '}
          <a href="https://api.oncokb.org/oncokb-website/api">here</a>.
          Important points:
          <ul>
            <li>
              Only HGVSg and HGVSc formats are currently supported for the
              germline API
            </li>
            <li>
              New germline annotation endpoints are now available at
              “/api/v1/annotate/germline/…”. The existing “/api/v1/annotate/…”
              endpoints continue to serve somatic annotations.
            </li>
          </ul>
        </li>
        <li>
          We now have standard of care (Level 1 and 2) therapeutic implications
          for germline variants!
          <ul>
            <li>
              This release includes fifty Level 1 and seven Level 2 germline
              therapeutic associations across sixteen tumor types (see table
              below)
            </li>
          </ul>
        </li>
        <li>
          Updated{' '}
          <Link to="/actionable-genes#sections=Tx">Actionable Genes</Link> page
          to support germline therapeutic implications
        </li>
        <li>
          Updated <Link to="/faq">FAQ</Link> page to answer common questions
          regarding our germline annotations and curation process
        </li>
      </ul>
      <p>
        <strong>Updated Therapeutic Implications</strong>
      </p>
      <ul>
        <li>New alteration(s) with a tumor type-specific level of evidence</li>
      </ul>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Setting</th>
              <th>Gene(s)</th>
              <th>Mutation</th>
              <th>Cancer Type(s)</th>
              <th>Drug(s) Added to OncoKB™</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>
                {convertGeneInputToLinks('ATM, CHEK2, PALB2, RAD51C', true)}
              </td>
              <td>Pathogenic Variants</td>
              <td>Prostate Cancer</td>
              <td>Olaparib, Talazoparib + Enzalutamide</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-olaparib-hrr-gene-mutated-metastatic-castration-resistant-prostate-cancer">
                  FDA approval of Olaparib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/32343890/">32343890</a>{' '}
                <a href="https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-talazoparib-enzalutamide-hrr-gene-mutated-metastatic-castration-resistant-prostate">
                  FDA approval of Talazoparib + Enzalutamide
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38049622/">38049622</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>
                {convertGeneInputToLinks('BARD1, BRIP1, RAD51B, RAD51D', true)}
              </td>
              <td>Pathogenic Variants</td>
              <td>Prostate Cancer</td>
              <td>Olaparib</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-olaparib-hrr-gene-mutated-metastatic-castration-resistant-prostate-cancer">
                  FDA approval of Olaparib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/32343890/">32343890</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{convertGeneInputToLinks('BRCA1, BRCA2', true)}</td>
              <td>Pathogenic Variants</td>
              <td>
                Pancreatic Adenocarcinoma, Acinar Cell Carcinoma of the Pancreas
              </td>
              <td>
                Olaparib (Level 1)
                <br />
                <br />
                Rucaparib (Level 2)
              </td>
              <td>
                FDA approval of Olaparib; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/31157963/">31157963</a>{' '}
                Inclusion of Rucaprib in Pancreatic Adenocarcinoma NCCN
                Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33970687/">33970687</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{convertGeneInputToLinks('BRCA1, BRCA2', true)}</td>
              <td>Pathogenic Variants</td>
              <td>
                Peritoneal Serous Carcinoma, Ovarian Cancer, Ovary/Fallopian
                Tube
              </td>
              <td>
                Rucaparib, Olaparib + Bevacizumab, Niraparib, Olaparib (Level 1)
                <br />
                <br />
                Niraparib + Bevacizumab (Level 2)
              </td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-rucaparib-maintenance-treatment-recurrent-ovarian-fallopian-tube-or-primary-peritoneal">
                  FDA approval of Rucaparib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40580808/">40580808</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35658487/">35658487</a>{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-olaparib-plus-bevacizumab-maintenance-treatment-ovarian-fallopian-tube-or-primary">
                  FDA approval of Olaparib + Bevacizumab
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37211045/">37211045</a>{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-niraparib-first-line-maintenance-advanced-ovarian-cancer">
                  FDA approval of Niraparib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39284381/">39284381</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/27717299/">27717299</a>{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-olaparib-tablets-maintenance-treatment-ovarian-cancer">
                  FDA approval of Olaparib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33743851/">33743851</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/30345884/">30345884</a>{' '}
                Inclusion of Niraparib + Bevacizumab in Ovarian Cancer/Fallopian
                Tube Cancer/Primary Peritoneal Cancer NCCN Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40602355/">40602355</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{convertGeneInputToLinks('BRCA1, BRCA2', true)}</td>
              <td>Pathogenic Variants</td>
              <td>Prostate Cancer</td>
              <td>
                Olaparib + Abiraterone + Prednisone, Talazoparib + Enzalutamide,
                Olaparib, Rucaparib, Niraparib + Abiraterone Acetate +
                Prednisone
              </td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-olaparib-abiraterone-and-prednisone-or-prednisolone-brca-mutated-metastatic-castration">
                  FDA approval of Olaparib + Abiraterone + Prednisone
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37714168/">37714168</a>{' '}
                <a href="https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-talazoparib-enzalutamide-hrr-gene-mutated-metastatic-castration-resistant-prostate">
                  FDA approval of Talazoparib + Enzalutamide
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38049622/">38049622</a>{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-olaparib-hrr-gene-mutated-metastatic-castration-resistant-prostate-cancer">
                  FDA approval of Olaparib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/32343890/">32343890</a>{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-regular-approval-rucaparib-metastatic-castration-resistant-prostate-cancer">
                  FDA approval of Rucaparib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/36795891/">36795891</a>{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-niraparib-and-abiraterone-acetate-plus-prednisone-brca-mutated-metastatic-castration">
                  FDA approval of Niraparib + Abiraterone Acetate + Prednisone
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/36952634/">36952634</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/41057655/">41057655</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{convertGeneInputToLinks('FANCA, MLH1, NBN', true)}</td>
              <td>Pathogenic Variants</td>
              <td>Prostate Cancer</td>
              <td>Talazoparib + Enzalutamide</td>
              <td>
                <a href="https://www.fda.gov/drugs/drug-approvals-and-databases/fda-approves-talazoparib-enzalutamide-hrr-gene-mutated-metastatic-castration-resistant-prostate">
                  FDA approval of Talazoparib + Enzalutamide
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/38049622/">38049622</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{getAlternativeGenePageLinks('NF1', true)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="NF1"
                  alteration="Pathogenic Variants"
                  germline={true}
                >
                  Pathogenic Variants
                </AlterationPageLink>
              </td>
              <td>Neurofibroma</td>
              <td>Selumetinib, Mirdametinib</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-selumetinib-neurofibromatosis-type-1-symptomatic-inoperable-plexiform-neurofibromas">
                  FDA approval of Selumetinib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/32187457/">32187457</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/40473450/">40473450</a>{' '}
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-mirdametinib-adult-and-pediatric-patients-neurofibromatosis-type-1-who-have-symptomatic">
                  FDA approval of Mirdametinib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39514826/">39514826</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{getAlternativeGenePageLinks('PTCH1', true)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PTCH1"
                  alteration="Pathogenic Variants"
                  germline={true}
                >
                  Pathogenic Variants
                </AlterationPageLink>
              </td>
              <td>Basal Cell Carcinoma</td>
              <td>Vismodegib</td>
              <td>
                FDA approval of Vismodegib; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/22670903/">22670903</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/22670904/">22670904</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{getAlternativeGenePageLinks('RET', true)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="RET"
                  alteration="Pathogenic Variants"
                  germline={true}
                >
                  Pathogenic Variants
                </AlterationPageLink>
              </td>
              <td>Medullary Thyroid Cancer</td>
              <td>Selpercatinib</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-selpercatinib-medullary-thyroid-cancer-ret-mutation">
                  FDA approval of Selpercatinib
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/37870969/">37870969</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{convertGeneInputToLinks('TSC1, TSC2', true)}</td>
              <td>Pathogenic Variants</td>
              <td>Encapsulated Glioma</td>
              <td>Everolimus</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-everolimus-tuberous-sclerosis-complex-associated-partial-onset-seizures">
                  FDA approval of Everolimus
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/23158522/">23158522</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{convertGeneInputToLinks('TSC1, TSC2', true)}</td>
              <td>Pathogenic Variants</td>
              <td>Renal Angiomyolipoma</td>
              <td>
                Everolimus (Level 1)
                <br />
                <br />
                Sirolimus (Level 2)
              </td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-everolimus-tuberous-sclerosis-complex-associated-partial-onset-seizures">
                  FDA approval of Everolimus
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/23312829/">23312829</a>{' '}
                Inclusion of Sirolimus in Kidney Cancer NCCN Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/18184959/">18184959</a>
              </td>
            </tr>
            <tr>
              <td>1</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{getAlternativeGenePageLinks('VHL', true)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="VHL"
                  alteration="Pathogenic Variants"
                  germline={true}
                >
                  Pathogenic Variants
                </AlterationPageLink>{' '}
                (excluding c.429C&gt;T, c.571C&gt;G and c.598C&gt;T)
              </td>
              <td>
                Renal Cell Carcinoma, Pancreatic Neuroendocrine Tumor,
                Hemangioblastoma
              </td>
              <td>Belzutifan</td>
              <td>
                <a href="https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-belzutifan-cancers-associated-von-hippel-lindau-disease">
                  FDA approval of Belzutifan
                </a>
                ; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/34818478/">34818478</a>
                ,{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/39284337/">39284337</a>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>{<GeneticTypeTag isGermline={true} />}</td>
              <td>{getAlternativeGenePageLinks('PALB2', true)}</td>
              <td>
                <AlterationPageLink
                  hugoSymbol="PALB2"
                  alteration="Pathogenic Variants"
                  germline={true}
                >
                  Pathogenic Variants
                </AlterationPageLink>
              </td>
              <td>Pancreatic Cancer</td>
              <td>Rucaparib</td>
              <td>
                Inclusion in Pancreatic Adenocarcinoma NCCN Guidelines; PMID:{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/33970687/">33970687</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
