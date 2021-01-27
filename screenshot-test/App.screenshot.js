const puppeteer = require('puppeteer');
const fs = require('fs');

const DATA_DIR = './screenshot-test/data/';
const CLIENT_URL = 'http://localhost:9000/';
const SERVER_URL = 'http://localhost:9095/';
const viewPort_1080 = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
}
const WAITING_TIME = 2000;

const apiAccount = fs.readFileSync(`${DATA_DIR}api-account.json`).toString();
const apiAccountToken = fs.readFileSync(`${DATA_DIR}api-account-token.json`).toString();
const apiV1Info = fs.readFileSync(`${DATA_DIR}api-v1-info.json`).toString();
const numbersLevels = fs.readFileSync(`${DATA_DIR}private-utils-numbers-levels.json`).toString();
const numbersMain = fs.readFileSync(`${DATA_DIR}private-utils-numbers-main.json`).toString();
const geneList = fs.readFileSync(`${DATA_DIR}utils-cancerGeneList.json`).toString();
const allCuratedGenes = fs.readFileSync(`${DATA_DIR}utils-allCuratedGenes.json`).toString();
const evidenceLevels = fs.readFileSync(`${DATA_DIR}private-utils-evidences-levels.json`).toString();
const tumorTypes = fs.readFileSync(`${DATA_DIR}private-utils-tumorTypes.json`).toString();
const geneNumbers = fs.readFileSync(`${DATA_DIR}private-utils-numbers-gene-ABL1.json`).toString();
const geneQuery = fs.readFileSync(`${DATA_DIR}api-v1-genes-ABL1.json`).toString();
const biologicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-bio-ABL1.json`).toString();
const clinicalVariants = fs.readFileSync(`${DATA_DIR}api-private-search-variants-cli-ABL1.json`).toString();
const sampleCount = fs.readFileSync(`${DATA_DIR}api-private-utils-portalAlterationSampleCount.json`).toString();
const evidenceSummary = fs.readFileSync(`${DATA_DIR}api-v1-evidences-ABL1-summary.json`).toString();
const evidenceBackground = fs.readFileSync(`${DATA_DIR}api-v1-evidences-ABL1-background.json`).toString();
const variantAnnotation = fs.readFileSync(`${DATA_DIR}api-private-utils-variantAnnotation-ABL1-BCR.json`).toString();
const genomenexusTranscript = fs.readFileSync(`${DATA_DIR}genomenexus-transcript.json`).toString();
const genomenexusCanonicalTranscript = fs.readFileSync(`${DATA_DIR}genomenexus-canonical-transcript.json`).toString();
const userSize = fs.readFileSync(`${DATA_DIR}api-users-size.json`).toString();
const userDetails = fs.readFileSync(`${DATA_DIR}api-users-details.json`).toString();
const userToken = fs.readFileSync(`${DATA_DIR}api-users-tokens.json`).toString();

describe('Tests with login', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setRequestInterception(true); // Handle UnhandledPromiseRejectionWarning: Error: Request Interception is not enabled! 
    page.on('request', (request) => {
      let url = request.url()
      switch (url) {
        case `${SERVER_URL}api/account`:
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: apiAccount
          });
          break;
        case `${SERVER_URL}api/account/tokens`:
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: apiAccountToken
          });
          break;
        case `${SERVER_URL}api/v1/info`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: apiV1Info
            }
          );
          break;
        case `${SERVER_URL}api/private/utils/numbers/main/`:
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: numbersMain
          });
          break;
        case `${SERVER_URL}api/private/utils/numbers/levels/`:
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: numbersLevels
          });
          break;
        case `${SERVER_URL}api/v1/utils/cancerGeneList`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: geneList
            }
          );
          break;
        case `${SERVER_URL}api/v1/utils/allCuratedGenes`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: allCuratedGenes
            }
          );
          break;
        case `${SERVER_URL}api/private/utils/evidences/levels`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: evidenceLevels
            }
          );
          break;
        case `${SERVER_URL}api/private/utils/tumorTypes`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: tumorTypes
            }
          );
          break;
        case `${SERVER_URL}api/private/utils/numbers/gene/ABL1`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: geneNumbers
            }
          );
          break;
        case `${SERVER_URL}api/v1/genes/lookup?query=ABL1`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: geneQuery
            }
          );
          break;
        case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=ABL1`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: biologicalVariants
            }
          );
          break;
        case `${SERVER_URL}api/private/utils/portalAlterationSampleCount`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: sampleCount
            }
          );
          break;
        case `${SERVER_URL}api/v1/evidences/lookup?hugoSymbol=ABL1&evidenceTypes=GENE_SUMMARY`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: evidenceSummary
            }
          );
          break;
        case `${SERVER_URL}api/v1/evidences/lookup?hugoSymbol=ABL1&evidenceTypes=GENE_BACKGROUND`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: evidenceBackground
            }
          );
          break;
        case `${SERVER_URL}api/private/search/variants/clinical?hugoSymbol=ABL1`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: clinicalVariants
            }
          );
          break;
        case `https://www.genomenexus.org//ensembl/transcript`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: genomenexusTranscript
            }
          )
          break;
        case `https://www.genomenexus.org//ensembl/canonical-transcript/hgnc/?isoformOverrideSource=uniprot`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: genomenexusCanonicalTranscript
            }
          )
          break;
        case `${SERVER_URL}api/private/utils/variantAnnotation?hugoSymbol=ABL1&referenceGenome=GRCh37&alteration=BCR-ABL1%20Fusion`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: variantAnnotation
            }
          );
          break;
        case `${SERVER_URL}api/users?size=5000`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: userSize
            }
          );
          break;
        case `${SERVER_URL}api/users/admin`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: userDetails
            }
          );
          break;
        case `${SERVER_URL}api/users/admin/tokens`:
          request.respond(
            {
              status: 200,
              contentType: 'application/json',
              body: userToken
            }
          );
          break;
        default:
          request.continue();
      }
    });
    await page.goto(`${CLIENT_URL}`);
    await page.evaluate(() => {
      localStorage.setItem('localdev', 'true');
      localStorage.setItem('oncokb-user-token', 'oncokb-public-demo-admin-token');
    });
  })

  it('Home Page', async() => {
    await page.goto(`${CLIENT_URL}`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page with Login' });
  })

  it('Home Page #levelType=Dx', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Dx`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page DX with Login' });
  })

  it('Home Page #levelType=Px', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Px`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page PX with Login' });
  })

  it ('Levels of Evidence Page', async() => {
    await page.goto(`${CLIENT_URL}levels`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page with Login' });
  })

  it ('Levels of Evidence Page #version=DX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=DX`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page DX with Login' });
  })

  it ('Levels of Evidence Page #version=PX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=PX`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page PX with Login' });
  })

  it ('Levels of Evidence Page #version=AAC', async() => {
    await page.goto(`${CLIENT_URL}levels#version=AAC`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page AAC with Login' });
  })

  it ('Levels of Evidence Page #version=V1', async() => {
    await page.goto(`${CLIENT_URL}levels#version=V1`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page V1 with Login' });
  })

  it('Actionable Genes Page', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page with Login' });
  })

  it('Actionable Genes Page #levels=1,Dx1,Px1', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes#levels=1,Dx1,Px1`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page Levels Selected with Login' });
  })

  it('Cancer Genes Page', async() => {
    await page.goto(`${CLIENT_URL}cancerGenes`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Cancer Genes Page with Login' });
  })

  it('About Page', async() => {
    await page.goto(`${CLIENT_URL}about`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'About Page with Login' });
  })

  it('Team Page', async() => {
    await page.goto(`${CLIENT_URL}team`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Team Page with Login' });
  })

  it('Terms Page', async() => {
    await page.goto(`${CLIENT_URL}terms`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Terms Page with Login' });
  })

  it('FAQ Page', async() => {
    await page.goto(`${CLIENT_URL}faq`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(5000);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'FAQ Page with Login' });
  })

  it('Gene Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ABL1`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(10000);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Gene Page with Login' });
  })

  it('Alteration Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ABL1/BCR-ABL1%20Fusion`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page with Login' });
  })

  it('Account Settings Page', async() =>{
    await page.goto(`${CLIENT_URL}account/settings`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Account Settings Page' });
  })

  it('Users Infomation Page', async() =>{
    await page.goto(`${CLIENT_URL}admin/user-details`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Users Infomation Page' });
  })

  it('User Details Page', async() =>{
    await page.goto(`${CLIENT_URL}users/admin`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'User Details Page' });
  })

  afterAll(async () => {
    await browser.close();
  })
})

describe('Tests without login', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setRequestInterception(true); // Handle UnhandledPromiseRejectionWarning: Error: Request Interception is not enabled! 
    page.on('request', (request) => {
      let url = request.url()
      if (url.includes('recaptcha')){
        request.abort();
      }
      else{
        switch (url) {
          case `${SERVER_URL}api/v1/info`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: apiV1Info
              }
            );
            break;
          case `${SERVER_URL}api/private/utils/numbers/main/`:
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: numbersMain
            });
            break;
          case `${SERVER_URL}api/private/utils/numbers/levels/`:
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: numbersLevels
            });
            break;
          case `${SERVER_URL}api/v1/utils/cancerGeneList`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: geneList
              }
            );
            break;
          case `${SERVER_URL}api/v1/utils/allCuratedGenes`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: allCuratedGenes
              }
            );
            break;
          case `${SERVER_URL}api/private/utils/evidences/levels`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: evidenceLevels
              }
            );
            break;
          case `${SERVER_URL}api/private/utils/tumorTypes`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: tumorTypes
              }
            );
            break;
          case `${SERVER_URL}api/private/utils/numbers/gene/ABL1`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: geneNumbers
              }
            );
            break;
          case `${SERVER_URL}api/v1/genes/lookup?query=ABL1`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: geneQuery
              }
            );
            break;
          case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=ABL1`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: biologicalVariants
              }
            );
            break;
          case `${SERVER_URL}api/private/utils/portalAlterationSampleCount`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: sampleCount
              }
            );
            break;
          case `${SERVER_URL}api/v1/evidences/lookup?hugoSymbol=ABL1&evidenceTypes=GENE_SUMMARY`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: evidenceSummary
              }
            );
            break;
          case `${SERVER_URL}api/v1/evidences/lookup?hugoSymbol=ABL1&evidenceTypes=GENE_BACKGROUND`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: evidenceBackground
              }
            );
            break;
          case `${SERVER_URL}api/private/search/variants/clinical?hugoSymbol=ABL1`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: clinicalVariants
              }
            );
            break;
          case `https://www.genomenexus.org//ensembl/transcript`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: genomenexusTranscript
              }
            )
            break;
          case `https://www.genomenexus.org//ensembl/canonical-transcript/hgnc/?isoformOverrideSource=uniprot`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: genomenexusCanonicalTranscript
              }
            )
            break;
          case `${SERVER_URL}api/private/utils/variantAnnotation?hugoSymbol=ABL1&referenceGenome=GRCh37&alteration=BCR-ABL1%20Fusion`:
            request.respond(
              {
                status: 200,
                contentType: 'application/json',
                body: variantAnnotation
              }
            );
            break;
          default:
            request.continue();
        }
      }     
    });
    await page.goto(`${CLIENT_URL}`);
    await page.evaluate(() => {
      localStorage.setItem('localdev', 'true');
    });
  })

  it('Home Page', async() => {
    await page.goto(`${CLIENT_URL}`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page without Login' });
  })

  it('Home Page #levelType=Dx', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Dx`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page DX without Login' });
  })

  it('Home Page #levelType=Px', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Px`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page PX without Login' });
  })

  it ('Levels of Evidence Page', async() => {
    await page.goto(`${CLIENT_URL}levels`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page without Login' });
  })

  it ('Levels of Evidence Page #version=DX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=DX`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page DX without Login' });
  })

  it ('Levels of Evidence Page #version=PX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=PX`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page PX without Login' });
  })

  it ('Levels of Evidence Page #version=AAC', async() => {
    await page.goto(`${CLIENT_URL}levels#version=AAC`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page AAC without Login' });
  })

  it ('Levels of Evidence Page #version=V1', async() => {
    await page.goto(`${CLIENT_URL}levels#version=V1`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page V1 without Login' });
  })

  it('Actionable Genes Page', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page without Login' });
  })

  it('Actionable Genes Page #levels=1,Dx1,Px1', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes#levels=1,Dx1,Px1`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page Levels Selected without Login' });
  })

  it('Cancer Genes Page', async() => {
    await page.goto(`${CLIENT_URL}cancerGenes`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Cancer Genes Page without Login' });
  })

  it('About Page', async() => {
    await page.goto(`${CLIENT_URL}about`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'About Page without Login' });
  })

  it('Team Page', async() => {
    await page.goto(`${CLIENT_URL}team`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Team Page without Login' });
  })

  it('Terms Page', async() => {
    await page.goto(`${CLIENT_URL}terms`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Terms Page without Login' });
  })

  it('FAQ Page', async() => {
    await page.goto(`${CLIENT_URL}faq`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(5000);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'FAQ Page without Login' });
  })

  it('Gene Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ABL1`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(10000);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Gene Page without Login' });
  })

  it('Alteration Page', async() => {
    await page.goto(`${CLIENT_URL}gene/ABL1/BCR-ABL1%20Fusion`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Alteration Page without Login' });
  })

  it('Login Page', async() => {
    await page.goto(`${CLIENT_URL}login`);
    await page.setViewport(viewPort_1080);
    await page.waitFor(WAITING_TIME);
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Login Page' });
  })

  afterAll(async () => {
    await browser.close();
  })
})