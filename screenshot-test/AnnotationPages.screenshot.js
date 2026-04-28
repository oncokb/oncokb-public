import puppeteer from 'puppeteer';
import fs from 'fs';

const DATA_DIR = './screenshot-test/data/';
const CLIENT_URL = 'http://localhost:9000/';
const SERVER_URL = 'http://localhost:9095/';

const VIEW_PORT_1080 = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
}
const MOBILE_VIEW_PORT = {
  width: 400,
  height: 800,
  deviceScaleFactor: 1,
}
const WAITING_TIME = 2000;
const LONG_WAITING_TIME = 10000;
const LATEST_SNAPSHOTS_DIR = './screenshot-test/__latest_snapshots__/';
const browserConfig = { // Docker requires --no-sandbox to be able to run the tests
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ignoreHTTPSErrors: true,
  dumpio: false
}

// Shared API response data
const apiAccount = fs.readFileSync(`${DATA_DIR}api-account.json`).toString();
const apiV1Info = fs.readFileSync(`${DATA_DIR}api-v1-info.json`).toString();
const numbersMain = fs.readFileSync(`${DATA_DIR}private-utils-numbers-main.json`).toString();
const numbersLevels = fs.readFileSync(`${DATA_DIR}private-utils-numbers-levels.json`).toString();
const tumorTypes = fs.readFileSync(`${DATA_DIR}private-utils-tumorTypes.json`).toString();
const activeBannerMessages = fs.readFileSync(`${DATA_DIR}api-user-banner-messages-active.json`).toString();
const gracePeriodBlacklist = fs.readFileSync(`${DATA_DIR}api-register-grace-period-blacklist.json`).toString();

// ROS1 gene page - API response data
const rose1GeneQuery = fs.readFileSync(`${DATA_DIR}api-v1-genes-ROS1.json`).toString();
const ros1BiologicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-bio-ROS1.json`).toString();
const rose1EnsemblGenes = fs.readFileSync(`${DATA_DIR}api-private-utils-ensembleGenes-ROS1.json`).toString();
const ros1GeneNumbers = fs.readFileSync(`${DATA_DIR}private-utils-numbers-gene-ROS1.json`).toString();
const ros1EvidenceSummary = fs.readFileSync(`${DATA_DIR}api-v1-evidences-ROS1-summary.json`).toString();
const ros1EvidenceBackground = fs.readFileSync(`${DATA_DIR}api-v1-evidences-ROS1-background.json`).toString();
const ros1ClinicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-cli-ROS1.json`).toString();

// TP53 Deletion page - API response data
// Mainly test the prognostic data
const tp53GeneQuery = fs.readFileSync(`${DATA_DIR}api-v1-genes-TP53.json`).toString();
const tp53GeneNumbers = fs.readFileSync(`${DATA_DIR}private-utils-numbers-gene-TP53.json`).toString();
const tp53EnsemblGenes = fs.readFileSync(`${DATA_DIR}api-private-utils-ensembleGenes-TP53.json`).toString();
const tp53BiologicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-bio-TP53.json`).toString();
const tp53ClinicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-cli-TP53.json`).toString();
const tp53DeletionVariantAnnotation = fs.readFileSync(`${DATA_DIR}api-private-utils-variantAnnotation-TP53-DELETION.json`).toString();
const tp53DeletionQuery = fs.readFileSync(`${DATA_DIR}api-v1-variants-TP53-DELETION.json`).toString();

// BRAF V600E shared API response data
const brafGeneQuery = fs.readFileSync(`${DATA_DIR}api-v1-genes-BRAF.json`).toString();
const brafGeneNumbers = fs.readFileSync(`${DATA_DIR}private-utils-numbers-gene-BRAF.json`).toString();
const brafEnsemblGenes = fs.readFileSync(`${DATA_DIR}api-private-utils-ensembleGenes-BRAF.json`).toString();
const brafBiologicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-bio-BRAF.json`).toString();
const brafClinicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-cli-BRAF.json`).toString();
const brafV600eQuery = fs.readFileSync(`${DATA_DIR}api-v1-variants-BRAF-V600E.json`).toString();
const brafV600eRelevantAlterations = fs.readFileSync(`${DATA_DIR}api-private-utils-relevantAlterations-BRAF-V600E.json`).toString();

// ROS1 tag (new pages: SomaticTagPage & SomaticTagCancerTypePage)
const ros1Tag = fs.readFileSync(`${DATA_DIR}api-v1-tag-ROS1.json`).toString();

// BRAF V600E HGVSg page - API response data
// Mainly test the therapeutic/fda data for solid disease
const brafV600eHgvsgVariantAnnotation = fs.readFileSync(`${DATA_DIR}api-private-utils-variantAnnotation-BRAF-V600E-HGVSG.json`).toString();

// APC G279Ffs*10 HGVSg page - API response data
// Mainly test the revue icon is shown properly
const apcGeneQuery = fs.readFileSync(`${DATA_DIR}api-v1-genes-APC.json`).toString();
const apcBiologicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-bio-APC.json`).toString();
const apcFSHgvsgVariantAnnotation = fs.readFileSync(`${DATA_DIR}api-private-utils-variantAnnotation-APC-HGVSG.json`).toString();


// BRAF V600E Hairy Cell Leukemia page - API response data
// Mainly test the therapeutic/diagnostic data for heme disease
const brafV600eHairyCellLeukemiaVariantAnnotation = fs.readFileSync(`${DATA_DIR}api-private-utils-variantAnnotation-BRAF-V600E-HCL.json`).toString();

// BRAF V600E Melanoma Leukemia page - API response data
// Mainly test the therapeutic/fda data for solid disease
const brafV600eMelanomaVariantAnnotation = fs.readFileSync(`${DATA_DIR}api-private-utils-variantAnnotation-BRAF-V600E-MEL.json`).toString();

// FGFR3 Y375C page - API response data
// Mainly test the alternativeOncoKbVariant message and linkout
const fgfr3GeneQuery = JSON.stringify([
  {
    entrezGeneId: 2261,
    hugoSymbol: 'FGFR3',
    grch37Isoform: 'ENST00000340107',
    grch37RefSeq: 'NM_000142.4',
    grch38Isoform: 'ENST00000644923',
    grch38RefSeq: 'NM_000142.4',
    geneAliases: [],
    genesets: [],
    geneType: 'ONCOGENE',
  },
]);
const fgfr3GeneNumbers = JSON.stringify({
  highestSensitiveLevel: null,
  highestResistanceLevel: null,
  highestDiagnosticImplicationLevel: null,
  highestPrognosticImplicationLevel: null,
  gene: {
    entrezGeneId: 2261,
    hugoSymbol: 'FGFR3',
    grch37Isoform: 'ENST00000340107',
    grch37RefSeq: 'NM_000142.4',
    grch38Isoform: 'ENST00000644923',
    grch38RefSeq: 'NM_000142.4',
    geneAliases: [],
    genesets: [],
    geneType: 'ONCOGENE',
  },
  alteration: 1,
  tumorType: null,
});
const fgfr3EnsemblGenes = JSON.stringify([
  {
    ensemblGeneId: 'ENSG00000068078',
    canonical: true,
    chromosome: '4',
    referenceGenome: 'GRCh37',
    strand: 1,
    start: 1807895,
    end: 1825441,
  },
  {
    ensemblGeneId: 'ENSG00000068078',
    canonical: true,
    chromosome: '4',
    referenceGenome: 'GRCh38',
    strand: 1,
    start: 1760139,
    end: 1777645,
  },
]);
const fgfr3Y375cQuery = JSON.stringify([
  {
    gene: {
      entrezGeneId: 2261,
      hugoSymbol: 'FGFR3',
      grch37Isoform: 'ENST00000340107',
      grch37RefSeq: 'NM_000142.4',
      grch38Isoform: 'ENST00000644923',
      grch38RefSeq: 'NM_000142.4',
      geneAliases: [],
      genesets: [],
      geneType: 'ONCOGENE',
    },
    consequence: {
      term: 'missense_variant',
      isGenerallyTruncating: false,
      description:
        'A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved',
    },
    alteration: 'Y375C',
    name: 'Y375C',
    refResidues: 'Y',
    proteinStart: 375,
    proteinEnd: 375,
    variantResidues: 'C',
    referenceGenomes: ['GRCh37', 'GRCh38'],
  },
]);
const fgfr3Y375cRelevantAlterations = JSON.stringify([
  {
    gene: {
      entrezGeneId: 2261,
      hugoSymbol: 'FGFR3',
      grch37Isoform: 'ENST00000340107',
      grch37RefSeq: 'NM_000142.4',
      grch38Isoform: 'ENST00000644923',
      grch38RefSeq: 'NM_000142.4',
      geneAliases: [],
      genesets: [],
      geneType: 'ONCOGENE',
    },
    consequence: {
      term: 'missense_variant',
      isGenerallyTruncating: false,
      description:
        'A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved',
    },
    alteration: 'Y375C',
    name: 'Y375C',
    refResidues: 'Y',
    proteinStart: 375,
    proteinEnd: 375,
    variantResidues: 'C',
    referenceGenomes: ['GRCh37', 'GRCh38'],
  },
]);
const fgfr3Y375cVariantAnnotation = JSON.stringify({
  query: {
    id: null,
    referenceGenome: 'GRCh37',
    hugoSymbol: 'FGFR3',
    entrezGeneId: 2261,
    alteration: 'Y375C',
    alterationType: 'MUTATION',
    svType: null,
    tumorType: null,
    consequence: 'missense_variant',
    proteinStart: 375,
    proteinEnd: 375,
    hgvs: null,
    hgvsInfo: null,
    canonicalTranscript: null,
    germline: false,
  },
  geneExist: true,
  variantExist: true,
  alleleExist: true,
  oncogenic: 'Unknown',
  mutationEffect: {
    knownEffect: 'Unknown',
    description: '',
    citations: {
      pmids: [],
      abstracts: [],
    },
  },
  germline: {
    genomicIndicators: [],
    penetrance: '',
    penetranceDescription: '',
    pathogenic: '',
    description: '',
    cancerRisk: '',
    clinVarId: '',
  },
  highestSensitiveLevel: null,
  highestResistanceLevel: null,
  highestDiagnosticImplicationLevel: null,
  highestPrognosticImplicationLevel: null,
  highestFdaLevel: null,
  otherSignificantSensitiveLevels: [],
  otherSignificantResistanceLevels: [],
  hotspot: false,
  exon: null,
  geneSummary: '',
  variantSummary: '',
  tumorTypeSummary: '',
  prognosticSummary: '',
  diagnosticSummary: '',
  diagnosticImplications: [],
  prognosticImplications: [],
  treatments: [],
  tumorTypes: [],
  dataVersion: 'v0',
  lastUpdate: '',
  vus: false,
  vue: false,
  alternativeOncoKbVariant: {
    gene: 'FGFR3',
    inputVariant: 'Y375C',
    transcriptId: 'ENST00000644923',
    foundAlteration: {
      gene: {
        entrezGeneId: 2261,
        hugoSymbol: 'FGFR3',
        grch37Isoform: 'ENST00000340107',
        grch37RefSeq: 'NM_000142.4',
        grch38Isoform: 'ENST00000644923',
        grch38RefSeq: 'NM_000142.4',
        geneAliases: [],
        genesets: [],
        geneType: 'ONCOGENE',
      },
      consequence: {
        term: 'missense_variant',
        isGenerallyTruncating: false,
        description:
          'A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved',
      },
      alteration: 'Y373C',
      name: 'Y373C',
      refResidues: 'Y',
      proteinStart: 373,
      proteinEnd: 373,
      variantResidues: 'C',
      referenceGenomes: ['GRCh37', 'GRCh38'],
    },
  },
});

// # Fix the time to expiration date.
function updateTokenExpirationDate(current){
  let today = new Date()
  today.setDate(today.getDate()+100);
  current.forEach(token => {
    token.expiration = today.toISOString();
  })
  return current;
}
let apiAccountToken = fs.readFileSync(`${DATA_DIR}api-account-token.json`).toString();
apiAccountToken = JSON.stringify(updateTokenExpirationDate(JSON.parse(apiAccountToken)));
let userToken = fs.readFileSync(`${DATA_DIR}api-users-tokens.json`).toString();
userToken = JSON.stringify(updateTokenExpirationDate(JSON.parse(userToken)));
let companyUserToken = fs.readFileSync(`${DATA_DIR}api-company-user-tokens.json`).toString();
companyUserToken = JSON.stringify(updateTokenExpirationDate(JSON.parse(companyUserToken)));


function getScreenshotConfig(name){
  return{
    path: `${LATEST_SNAPSHOTS_DIR}${name}-snap.png`,
    fullPage: true
  }
}

async function resetRegistrationCookies(page) {
  if (!page || page.isClosed()) {
    return;
  }
  try {
    await page.evaluate(() => {
      document.cookie = 'page_visit_count=0; Path=/; Max-Age=2592000; SameSite=Lax';
      document.cookie = 'registration_hover_count=0; Path=/; Max-Age=2592000; SameSite=Lax';
    });
  } catch (_error) {
    // Ignore cleanup errors so they do not mask screenshot assertion failures.
  }
}

if (!fs.existsSync(LATEST_SNAPSHOTS_DIR)){
  fs.mkdirSync(LATEST_SNAPSHOTS_DIR);
}

function getMockResponse(url){
  if (
    url.startsWith(`${SERVER_URL}api/v1/evidences/lookup?`) &&
    url.includes('evidenceTypes=GENOMIC_INDICATOR')
  ) {
    return {
      status: 200,
      contentType: 'application/json',
      body: '[]'
    };
  }

  let res = undefined
  switch (url) {
    case `${SERVER_URL}api/account`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: apiAccount
      };
      break;
    case `${SERVER_URL}api/account/tokens`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: apiAccountToken
      };
      break;
    case `${SERVER_URL}api/user-banner-messages/active`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: activeBannerMessages,
      };
      break;
    case `${SERVER_URL}api/v1/info`:
      res =  {
          status: 200,
          contentType: 'application/json',
          body: apiV1Info
      };
      break;
    case `${SERVER_URL}api/register/grace-period-blacklist`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: gracePeriodBlacklist
      };
      break;
    case `${SERVER_URL}api/private/utils/numbers/main/`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: numbersMain
      };
      break;
    case `${SERVER_URL}api/private/utils/numbers/levels/`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: numbersLevels
      };
      break;
    case `${SERVER_URL}api/private/utils/tumorTypes`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tumorTypes
      };
      break;
    case `${SERVER_URL}api/users/admin/tokens`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: userToken
      };
      break;

    // ROS1
    case `${SERVER_URL}api/private/utils/numbers/gene/ROS1?germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: ros1GeneNumbers
      };
      break;
    case `${SERVER_URL}api/v1/genes/lookup?query=ROS1`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: rose1GeneQuery
      };
      break;
    case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=ROS1&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: ros1BiologicalVariants
      };
      break;
    case `${SERVER_URL}api/private/search/variants/clinical?hugoSymbol=ROS1&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: ros1ClinicalVariants
      };
      break;
    case `${SERVER_URL}api/private/utils/ensembleGenes?entrezGeneId=6098`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: rose1EnsemblGenes
      };
      break;
    case `${SERVER_URL}api/v1/evidences/lookup?hugoSymbol=ROS1&evidenceTypes=GENE_SUMMARY`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: ros1EvidenceSummary
      };
      break;
    case `${SERVER_URL}api/v1/evidences/lookup?hugoSymbol=ROS1&evidenceTypes=GENE_BACKGROUND`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: ros1EvidenceBackground
      };
      break;
    case `https://www.genomenexus.org//ensembl/transcript`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: rose1EnsemblGenes
      };
      break;
    case `${SERVER_URL}api/private/utils/portalAlterationSampleCount`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;
    case `${SERVER_URL}api/private/utils/mutationMapperData?hugoSymbol=ROS1`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;
    case `https://www.genomenexus.org//ensembl/canonical-transcript/hgnc/ROS1?isoformOverrideSource=mskcc`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '{}'
      };
      break;
    case `https://www.genomenexus.org//pfam/domain`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;

    // TP53 Deletion
    case `${SERVER_URL}api/private/utils/numbers/gene/TP53?germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tp53GeneNumbers
      };
      break;
    case `${SERVER_URL}api/v1/genes/lookup?query=TP53`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tp53GeneQuery
      };
      break;
    case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=TP53&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tp53BiologicalVariants
      };
      break;
    case `${SERVER_URL}api/private/search/variants/clinical?hugoSymbol=TP53&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tp53ClinicalVariants
      };
      break;
    case `${SERVER_URL}api/private/utils/ensembleGenes?entrezGeneId=7157`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tp53EnsemblGenes
      };
      break;
    case `${SERVER_URL}api/private/utils/variantAnnotation?hugoSymbol=TP53&referenceGenome=GRCh37&alteration=Deletion&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tp53DeletionVariantAnnotation
      };
      break;
    case `${SERVER_URL}api/v1/variants/lookup?hugoSymbol=TP53&variant=Deletion`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tp53DeletionQuery
      };
      break;
    case `${SERVER_URL}api/private/utils/relevantAlterations?referenceGenome=GRCh37&entrezGeneId=7157&alteration=Deletion`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;

    // BRAF V600E
    case `${SERVER_URL}api/private/utils/numbers/gene/BRAF?germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafGeneNumbers
      };
      break;
    case `${SERVER_URL}api/v1/genes/lookup?query=BRAF`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafGeneQuery
      };
      break;
    case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=BRAF&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafBiologicalVariants
      };
      break;
    case `${SERVER_URL}api/private/search/variants/clinical?hugoSymbol=BRAF&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafClinicalVariants
      };
      break;
    case `${SERVER_URL}api/private/utils/ensembleGenes?entrezGeneId=673`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafEnsemblGenes
      };
      break;
    case `${SERVER_URL}api/private/tags/ROS1/TEST_TAG`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: ros1Tag,
      };
      break;
    case `${SERVER_URL}api/private/tags/ROS1/TEST_TAG/ALAL`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: ros1Tag,
      };
      break;
    case `${SERVER_URL}api/v1/variants/lookup?hugoSymbol=BRAF&variant=V600E`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafV600eQuery
      };
      break;
    case `${SERVER_URL}api/private/utils/relevantAlterations?referenceGenome=GRCh37&entrezGeneId=673&alteration=V600E`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafV600eRelevantAlterations
      };
      break;
    case `${SERVER_URL}api/private/utils/variantAnnotation?hugoSymbol=BRAF&referenceGenome=GRCh37&alteration=V600E&tumorType=MEL&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafV600eMelanomaVariantAnnotation
      };
      break;
    case `${SERVER_URL}api/private/utils/numbers/gene/FGFR3?germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: fgfr3GeneNumbers,
      };
      break;
    case `${SERVER_URL}api/v1/genes/lookup?query=FGFR3`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: fgfr3GeneQuery,
      };
      break;
    case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=FGFR3&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]',
      };
      break;
    case `${SERVER_URL}api/private/search/variants/clinical?hugoSymbol=FGFR3&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]',
      };
      break;
    case `${SERVER_URL}api/private/utils/ensembleGenes?entrezGeneId=2261`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: fgfr3EnsemblGenes,
      };
      break;
    case `${SERVER_URL}api/v1/variants/lookup?hugoSymbol=FGFR3&variant=Y375C`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: fgfr3Y375cQuery,
      };
      break;
    case `${SERVER_URL}api/private/utils/relevantAlterations?referenceGenome=GRCh37&entrezGeneId=2261&alteration=Y375C`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: fgfr3Y375cRelevantAlterations,
      };
      break;
    case `${SERVER_URL}api/private/utils/variantAnnotation?hugoSymbol=FGFR3&referenceGenome=GRCh37&alteration=Y375C&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: fgfr3Y375cVariantAnnotation,
      };
      break;
    case `${SERVER_URL}api/private/utils/variantAnnotation?hugoSymbol=BRAF&referenceGenome=GRCh37&alteration=V600E&tumorType=HCL&germline=false`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafV600eHairyCellLeukemiaVariantAnnotation
      };
      break;
    case `${SERVER_URL}api/private/utils/variantAnnotation?referenceGenome=GRCh37&hgvsg=7%3Ag.140453136A%3ET`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: brafV600eHgvsgVariantAnnotation
      };
      break;

    // APC G279Ffs*10
    case `${SERVER_URL}api/v1/genes/lookup?query=APC`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: apcGeneQuery
      };
      break;
    case `${SERVER_URL}api/v1/variants/lookup?hugoSymbol=APC&variant=G279Ffs*10`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;
    case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=APC`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: apcBiologicalVariants
      };
      break;
    case `${SERVER_URL}api/private/utils/variantAnnotation?referenceGenome=GRCh37&hgvsg=5%3Ag.112151184A%3EG`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: apcFSHgvsgVariantAnnotation
      };
      break;



    default:
      res = undefined
  }
  return res;
}

describe('Tests with login', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch(browserConfig);
    page = await browser.newPage();
    await page.setRequestInterception(true); // Handle UnhandledPromiseRejectionWarning: Error: Request Interception is not enabled!
    page.on('request', (request) => {
      let url = request.url()
      if (getMockResponse(url) !== undefined){
        request.respond(
          getMockResponse(url)
        )
      }
      else request.continue();
    });
    await page.goto(`${CLIENT_URL}`);
    await page.setViewport(VIEW_PORT_1080);
    await page.evaluate(() => {
      localStorage.setItem('localdev', 'true');
      localStorage.setItem('disablebanner', 'true');
      localStorage.setItem('oncokb-user-token', 'oncokb-public-demo-admin-token');
    });
  })

  afterEach(async () => {
    await resetRegistrationCookies(page);
  })

  it('Gene Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(LONG_WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Gene Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Gene Page with Login' });
  })

  it('Alteration Page', async() => {
    await page.goto(`${CLIENT_URL}gene/TP53/somatic/Deletion`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Login' });
  })

  it('Alteration Page with Cancer Type - Solid', async() => {
    await page.goto(`${CLIENT_URL}gene/BRAF/somatic/V600E/MEL`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Cancer Type - Solid with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Cancer Type - Solid with Login' });
  })

  it('Alteration Page with Cancer Type - Heme', async() => {
    await page.goto(`${CLIENT_URL}gene/BRAF/somatic/V600E/HCL`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Cancer Type - Heme with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Cancer Type - Heme with Login' });
  })

  it('Alteration Page with Alternative Variant Message', async() => {
    await page.goto(`${CLIENT_URL}gene/FGFR3/somatic/Y375C`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Alternative Variant Message with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Alternative Variant Message with Login' });
  })

  it('HGVSg Page', async() => {
    await page.goto(`${CLIENT_URL}hgvsg/7:g.140453136A>T?refGenome=GRCh37`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('HGVSg Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'HGVSg Page with Login' });
  })

  it('HGVSg Page - reVUE', async() => {
    // this is a variant that reannotated by reVUE. APC G279Ffs*10
    await page.goto(`${CLIENT_URL}hgvsg/5:g.112151184A>G?refGenome=GRCh37`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('HGVSg Page on VUE variant with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'HGVSg Page on VUE variant with Login' });
  })

  it('Tag Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic/tag/TEST_TAG`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Tag Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Tag Page with Login' });
  })

  it('Tag Page with Cancer Type - Solid', async() => {
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic/tag/TEST_TAG/ALAL`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Tag Page with Cancer Type - Solid with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Tag Page with Cancer Type - Solid with Login' });
  })

  afterAll(async () => {
    await browser.close();
  })
})

describe('Tests without login', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch(browserConfig);
    page = await browser.newPage();
    await page.setRequestInterception(true); // Handle UnhandledPromiseRejectionWarning: Error: Request Interception is not enabled!
    page.on('request', (request) => {
      let url = request.url()
      if (url.includes('recaptcha')){
        request.abort();
      }
      else{
        if (getMockResponse(url) !== undefined){
          request.respond(
            getMockResponse(url)
          )
        }
        else request.continue();
      }
    });
    await page.goto(`${CLIENT_URL}`);
    await page.setViewport(VIEW_PORT_1080);
    await page.evaluate(() => {
      localStorage.setItem('localdev', 'true');
      localStorage.setItem('disablebanner', 'true');
    });
  })

  afterEach(async () => {
    await resetRegistrationCookies(page);
  })

  it('Gene Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(LONG_WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Gene Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Gene Page without Login' });
  })

  it('Gene Page without Login - Registration Nudge', async() => {
    await page.goto(`${CLIENT_URL}`);
    await page.evaluate(() => {
      document.cookie = 'page_visit_count=11; Path=/; Max-Age=2592000; SameSite=Lax';
      document.cookie = 'registration_hover_count=0; Path=/; Max-Age=2592000; SameSite=Lax';
    });
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(LONG_WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Gene Page without Login - Registration Nudge'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Gene Page without Login - Registration Nudge' });
  })

  it('Gene Page without Login - Registration Hover', async() => {
    await page.goto(`${CLIENT_URL}`);
    await page.evaluate(() => {
      document.cookie = 'page_visit_count=0; Path=/; Max-Age=2592000; SameSite=Lax';
      document.cookie = 'registration_hover_count=11; Path=/; Max-Age=2592000; SameSite=Lax';
    });
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(LONG_WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Gene Page without Login - Registration Hover'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Gene Page without Login - Registration Hover' });
  })

  it('Alteration Page', async() => {
    await page.goto(`${CLIENT_URL}gene/TP53/somatic/Deletion`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page without Login' });
  })

  it('Alteration Page with Cancer Type - Solid', async() => {
    await page.goto(`${CLIENT_URL}gene/BRAF/somatic/V600E/MEL`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Cancer Type - Solid without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Cancer Type - Solid without Login' });
  })

  it('Alteration Page with Cancer Type - Heme', async() => {
    await page.goto(`${CLIENT_URL}gene/BRAF/somatic/V600E/HCL`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Cancer Type - Heme without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Cancer Type - Heme without Login' });
  })

  it('HGVSg Page', async() => {
    // this is BRAF V600E
    await page.goto(`${CLIENT_URL}hgvsg/7:g.140453136A>T?refGenome=GRCh37`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('HGVSg Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'HGVSg Page without Login' });
  })

  it('Tag Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic/tag/TEST_TAG`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Tag Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Tag Page without Login' });
  })

  it('Tag Page with Cancer Type - Solid', async() => {
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic/tag/TEST_TAG/ALAL`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Tag Page with Cancer Type - Solid without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Tag Page with Cancer Type - Solid without Login' });
  })

  afterAll(async () => {
    await browser.close();
  })
})


describe('Tests on mobile view (< large grid)', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch(browserConfig);
    page = await browser.newPage();
    await page.setRequestInterception(true); // Handle UnhandledPromiseRejectionWarning: Error: Request Interception is not enabled!
    page.on('request', (request) => {
      let url = request.url()
      if (getMockResponse(url) !== undefined){
        request.respond(
          getMockResponse(url)
        )
      }
      else request.continue();
    });
    await page.goto(`${CLIENT_URL}`);
    await page.setViewport(VIEW_PORT_1080);
    await page.evaluate(() => {
      localStorage.setItem('localdev', 'true');
      localStorage.setItem('disablebanner', 'true');
    });
  })

  afterEach(async () => {
    await resetRegistrationCookies(page);
  })

  it('Alteration Page with Cancer Type - With login - Mobile', async() => {
    await page.evaluate(() => {
      localStorage.setItem('oncokb-user-token', 'oncokb-public-demo-admin-token');
    });
    await page.goto(`${CLIENT_URL}gene/BRAF/somatic/V600E/HCL`);
    await page.setViewport(MOBILE_VIEW_PORT);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Cancer Type - With login - Mobile'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Cancer Type - With login - Mobile' });
  })

  it('Alteration Page with Cancer Type - Without login - Mobile', async() => {
    await page.evaluate(() => {
      localStorage.removeItem('oncokb-user-token');
    });
    await page.goto(`${CLIENT_URL}gene/BRAF/somatic/V600E/HCL`);
    await page.setViewport(MOBILE_VIEW_PORT);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Alteration Page with Cancer Type - Without login - Mobile'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Cancer Type - Without login - Mobile' });
  })

  it('Gene Page without Login - Registration Hover - Mobile', async() => {
    await page.evaluate(() => {
      localStorage.removeItem('oncokb-user-token');
      document.cookie = 'page_visit_count=0; Path=/; Max-Age=2592000; SameSite=Lax';
      document.cookie = 'registration_hover_count=11; Path=/; Max-Age=2592000; SameSite=Lax';
    });
    await page.goto(`${CLIENT_URL}gene/ROS1/somatic`);
    await page.setViewport(MOBILE_VIEW_PORT);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Gene Page without Login - Registration Hover - Mobile'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Gene Page without Login - Registration Hover - Mobile' });
  })

  afterAll(async () => {
    await browser.close();
  })

})
