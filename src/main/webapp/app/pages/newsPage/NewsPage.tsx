import * as React from 'react';
import { CitationText } from 'app/components/CitationText';
import NewsList, { getNews, getNewsTitle } from 'app/pages/newsPage/NewsList';
import {
  DRUGS_ADDED_TO_ONCOKB,
  DRUGS_REMAINING_IN_ONCOKB,
  NEWS_BY_DATE,
} from 'app/pages/newsPage/NewsPageContent';
import {
  FAQ_LINK,
  IMG_MAX_WIDTH,
  LEVEL_TYPES,
  ONCOKB_CONTACT_EMAIL,
  ONCOKB_NEWS_GROUP_SUBSCRIPTION_LINK,
  ONCOKB_TM,
  PAGE_DESCRIPTION,
  PAGE_ROUTE,
  PAGE_TITLE,
  SOP_LINK,
} from 'app/config/constants';
import { Link } from 'react-router-dom';
import LevelChange from 'content/images/loe-change.png';
import AAC_IMAGE from 'content/images/level_AAC.png';
import { Linkout } from 'app/shared/links/Linkout';
import { RouterStore } from 'mobx-react-router';
import { getPageTitle, scrollWidthOffset } from 'app/shared/utils/Utils';
import { inject, observer } from 'mobx-react';
import { Version } from 'app/pages/LevelOfEvidencePage';
import OptimizedImage from 'app/shared/image/OptimizedImage';
import { NewlyAddedGenesListItem } from 'app/pages/newsPage/NewlyAddedGenesListItem';
import { GenePageLink, SopPageLink } from 'app/shared/utils/UrlUtils';
import { Row } from 'react-bootstrap';
import { FdaApprovalLink } from 'app/pages/newsPage/Links';
import { LevelOfEvidencePageLink } from 'app/shared/links/LevelOfEvidencePageLink';
import {
  LinkedInLink,
  UserGoogleGroupLink,
} from 'app/shared/links/SocialMediaLinks';
import { Helmet } from 'react-helmet-async';

@inject('routing')
@observer
export default class NewsPage extends React.Component<{
  routing: RouterStore;
}> {
  componentDidMount(): void {
    // We have to add an offset when the page has a fix header
    // https://github.com/rafrex/react-router-hash-link/issues/13
    if (this.props.routing.location.hash) {
      setTimeout(() => {
        const id = this.props.routing.location.hash.slice(1);
        const element = document.getElementById(id);
        scrollWidthOffset(element);
      }, 200);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  render() {
    return (
      <div className="news">
        <Helmet>
          <title>{getPageTitle(PAGE_TITLE.NEWS)}</title>
        </Helmet>
        <div>
          <p>
            While we aim to keep the information up to date and correct, there
            will inevitably be gaps or mistakes. Please help us to identify any
            issues by <b>sending an email to</b>{' '}
            <a
              href={`mailto:${ONCOKB_CONTACT_EMAIL}?subject=${ONCOKB_TM} Feedback`}
            >
              {ONCOKB_CONTACT_EMAIL}
            </a>
            , or use the feedback button that appears next to alterations in
            cBioPortal.
          </p>
          <p>
            <b>Stay tuned</b> for future data updates (improved annotations, new
            alterations), as well as new features. You can follow us on{' '}
            <LinkedInLink />, or subscribe to our{' '}
            <UserGoogleGroupLink>low-volume email list</UserGoogleGroupLink> for
            updates.
          </p>
          <CitationText />
        </div>
        <div className="mt-2">
          <NewsList date={'04302025'} />
          <NewsList date={'03282025'} />
          <NewsList date={'02272025'} />
          <NewsList date={'01302025'} />
          <NewsList date={'12192024'} />
          <NewsList date={'11262024'} />
          <NewsList date={'10242024'} />
          <NewsList date={'09252024'} />
          <NewsList date={'08152024'} />
          <NewsList date={'07042024'} />
          <NewsList date={'07022024'} />
          <NewsList date={'06042024'} />
          <NewsList date={'05012024'} />
          <NewsList date={'03212024'} />
          <NewsList date={'02082024'} />
          <NewsList date={'01172024'} />
          <NewsList date={'12212023'} />
          <NewsList date={'12062023'} />
          <NewsList date={'11132023'} />
          <NewsList date={'10242023'} />
          <NewsList date={'10022023'} />
          <NewsList date={'09012023'} />
          <NewsList date={'07282023'} />
          <NewsList date={'07122023'} />
          <NewsList date={'05192023'} />
          <NewsList date={'04122023'} />
          <NewsList date={'03222023'} />
          <NewsList date={'02102023'} />
          <NewsList date={'02012023'}>
            <ul>
              <li>
                <NewlyAddedGenesListItem
                  sort
                  genes={['ALDH2', 'ADHFE1', 'BTG2', 'MAP4K4', 'PRPF8']}
                />
              </li>
              <li>
                <span>
                  To better align with the FDA drug label, all KIT oncogenic
                  mutations in GIST are now level 1 in association with
                  Imatinib, Sunitinib, Ripretinib, and Regorafenib. Previously,
                  only known sensitizing KIT exon 9, 11, 13, 14, 17 and 18
                  alterations were considered level 1 in this indication.
                </span>
              </li>
              <li>
                <span>
                  With the recent FDA approval of Tucatinib + Trastuzumab for
                  patients with RAS wildtype, HER2-positive colorectal cancer
                  the following OncoKB changes have been made:
                </span>
                <ul>
                  <li>
                    <span>
                      Changed annotation
                      <Row className={'overflow-auto'}>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Gene</th>
                              <th>Mutation</th>
                              <th>Cancer Type</th>
                              <th>Drug(s)</th>
                              <th>Previous Level</th>
                              <th>Current Level</th>
                              <th>Evidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <GenePageLink hugoSymbol={'ERBB2'} />
                              </td>
                              <td>Amplification</td>
                              <td>Colorectal Cancer</td>
                              <td>Tucatinib + Trastuzumab</td>
                              <td>2</td>
                              <td>1</td>
                              <td>
                                <FdaApprovalLink
                                  approval={
                                    'tucatinib + trastuzumab in colorectal cancer'
                                  }
                                  link={
                                    'https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-tucatinib-trastuzumab-colorectal-cancer'
                                  }
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </Row>
                    </span>
                  </li>
                  <li>
                    <span>
                      Updated therapeutic implications - addition of therapies
                      for variants with a level of evidence
                      <Row className={'overflow-auto'}>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Gene</th>
                              <th>Mutation</th>
                              <th>Cancer Type</th>
                              <th>Current Level of Evidence</th>
                              <th>{DRUGS_REMAINING_IN_ONCOKB}</th>
                              <th>{DRUGS_ADDED_TO_ONCOKB}</th>
                              <th>Evidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <GenePageLink hugoSymbol={'KRAS'} />
                                {', '}
                                <GenePageLink hugoSymbol={'NRAS'} />
                              </td>
                              <td>Oncogenic Mutations</td>
                              <td>Colorectal Cancer</td>
                              <td>R1</td>
                              <td>Cetuximab, Panitumumab</td>
                              <td>Tucatinib + Trastuzumab</td>
                              <td>
                                <FdaApprovalLink
                                  link={
                                    'https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-tucatinib-trastuzumab-colorectal-cancer'
                                  }
                                  approval={
                                    'tucatinib + trastuzumab in colorectal cancer'
                                  }
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </Row>
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </NewsList>
          <NewsList date={'01052023'} />
          <NewsList date={'12222022'} />
          <NewsList date={'12132022'} />
          <NewsList date={'11302022'}>
            <ul>
              <li>
                <NewlyAddedGenesListItem
                  title={'Addition of 15 new genes - a total of 711 to date!'}
                  sort
                  genes={[
                    'ATRIP',
                    'BAALC',
                    'CHTF8',
                    'EIF2B1',
                    'FZR1',
                    'LGR5',
                    'MLLT3',
                    'MYBL1',
                    'PSMB2',
                    'RAD17',
                    'REV3L',
                    'RNAseH2A',
                    'RNAseH2B',
                    'SET',
                    'SQSTM1',
                  ]}
                />
              </li>
              <li>
                In addition to monthly data releases, OncoKB will now release
                data following any relevant new or updated FDA-approvals or
                changes to tumor-type specific NCCN Guidelines (in accordance
                with the procedures outlined in the{' '}
                <SopPageLink version={2.2} />
                ). This ensures the most relevant clinical implications are
                incorporated into the API as soon as possible.
              </li>
            </ul>
          </NewsList>
          <NewsList date={'10282022'} />
          <NewsList date={'09062022'} />
          <NewsList date={'07252022'} />
          <NewsList date={'06062022'} />
          <NewsList date={'05052022'} />
          <NewsList date={'03292022'} />
          <NewsList date={'02282022'} />
          <NewsList date={'01072022'} />
          <NewsList date={'11292021'} />
          <NewsList date={'10262021'} />
          <NewsList date={'10072021'} />
          <NewsList date={'09292021'} />
          <NewsList date={'08312021'} />
          <NewsList date={'07162021'} />
          <NewsList date={'06172021'} />
          <NewsList date={'04142021'} />
          <NewsList date={'03122021'} />
          <NewsList date={'02102021'} />
          <NewsList date={'01142021'} />
          <NewsList date={'12172020'} />
          <NewsList date={'11132020'} />
          <NewsList date={'09172020'} />
          <NewsList date={'08282020'} />
          <NewsList date={'07232020'} />
          <NewsList date={'07092020'} />
          <NewsList date={'06092020'} />
          <NewsList date={'05112020'} />
          <NewsList date={'04242020'}>
            <ul>
              <li>
                We have introduced an{' '}
                <Linkout link={FAQ_LINK}>FAQ page</Linkout> where you can find
                answers to several frequently asked questions.
              </li>
            </ul>
          </NewsList>
          <NewsList date={'04232020'} />
          <NewsList date={'04162020'}>
            <ul>
              <li>
                An updated version of the {ONCOKB_TM} Curation Standard
                Operating Procedure, v1.1, has been released. See the{' '}
                {ONCOKB_TM} <Link to={PAGE_ROUTE.ABOUT}>About</Link> page or{' '}
                <Linkout link={SOP_LINK}>{SOP_LINK}</Linkout>.
              </li>
              <li>
                We now show a comparison between the {ONCOKB_TM} and
                AMP/ASCO/CAP Levels of Evidence on the{' '}
                <LevelOfEvidencePageLink
                  levelType={LEVEL_TYPES.TX}
                  version={Version.AAC}
                >
                  Levels of Evidence
                </LevelOfEvidencePageLink>{' '}
                page.
              </li>
              <OptimizedImage
                className="md-auto"
                style={{ maxWidth: IMG_MAX_WIDTH }}
                src={AAC_IMAGE}
              />
            </ul>
          </NewsList>
          <NewsList date={'02122020'} />
          <NewsList date={'12202019'}>
            <div>Introducing Simplified {ONCOKB_TM} Levels of Evidence:</div>
            <ul>
              <li>
                <b>New Level 2</b>, defined as "Standard care biomarker
                recommended by the NCCN or other expert panels predictive of
                response to an FDA-approved drug in this indication" (formerly
                Level 2A).
              </li>
              <li>
                <b>Unified Level 3B</b>, defined as "Standard care or
                investigational biomarker predictive of response to an
                FDA-approved or investigational drug in another indication"
                (combination of previous Levels 2B and 3B).
              </li>
            </ul>
            <OptimizedImage className="md-auto" src={LevelChange} />
            <div>
              We have implemented these changes for 2 reasons:
              <ol>
                <li>
                  To be consistent with the{' '}
                  <Linkout link="https://www.sciencedirect.com/science/article/pii/S1525157816302239?via%3Dihub">
                    Joint Consensus Recommendation by AMP, ASCO and CAP
                  </Linkout>{' '}
                  and the{' '}
                  <Linkout link="https://academic.oup.com/annonc/article/29/9/1895/5076792?searchresult=1">
                    ESMO Scale for Clinical Actionability of molecular Targets
                    (ESCAT)
                  </Linkout>
                </li>
                <li>
                  To reflect the clinical data that demonstrates patients with
                  investigational predictive biomarkers for a specific tumor
                  type based on compelling clinical evidence (currently Level
                  3A) are more likely to experience clinical benefit compared to
                  patients with predictive biomarkers that are considered
                  standard care in a different cancer type (previously Level 2B,
                  now combined into Level 3B).
                </li>
              </ol>
            </div>
          </NewsList>
          <NewsList date={'12122019'} />
          <NewsList date={'12092019'}>
            <span>
              We now require user logins for access to downloadable data files
              and API. {ONCOKB_TM} will continue to be accessible for no fee for
              research use in an academic setting, but a license will be
              required to use {ONCOKB_TM} for commercial and/or clinical
              purposes. Fees will be used to support future development and
              maintenance of {ONCOKB_TM}. Please visit the{' '}
              <Link to={PAGE_ROUTE.REGISTER}>registration page</Link>.
            </span>
          </NewsList>
          <NewsList date={'08282019'} />
          <NewsList date={'08042019'} />
          <NewsList date={'06212019'} />
          <NewsList date={'05092019'} />
          <NewsList date={'01242019'} />
          <NewsList date={'12142018'} />
          <NewsList date={'11022018'} />
          <NewsList date={'10262018'} />
          <NewsList date={'10012018'} />
          <NewsList date={'08202018'} />
          <NewsList date={'07122018'} />
          <NewsList date={'02022018'} />
          <NewsList date={'10262017'} />

          <h3>{getNewsTitle('08172017')}</h3>
          <div>
            <b>
              The following FDA-approvals have been incorporated into the
              Actionable Genes table:
            </b>
            <ul>
              {getNews({
                key: 'news-08172017',
                content: NEWS_BY_DATE['08172017'].news,
              })}
            </ul>
          </div>

          <NewsList date={'08022017'} />
          <NewsList date={'05152017'} />
          <NewsList date={'04052017'} />
          <NewsList date={'03072017'} />
          <NewsList date={'12292016'} />
          <NewsList date={'11222016'} />
          <NewsList date={'10242016'} />
          <NewsList date={'09162016'} />
          <NewsList date={'08102016'} />
          <NewsList date={'07062016'} />

          <h3>{getNewsTitle('07062016')}</h3>
          <div>
            <b>Improved clinical annotations:</b>
            <ul>
              {getNews({
                key: 'news-07062016',
                content: NEWS_BY_DATE['07062016'].news,
              })}
            </ul>
          </div>
        </div>
        <h3>Jun 6, 2016</h3>
        <div>
          <p>
            We are happy to announce the <b>first release of {ONCOKB_TM}</b>, a
            knowledge base for precision medicine. Our goal is to
            comprehensively annotate the oncogenic effect of mutations observed
            in cancer, as well as their therapeutic implications. This release
            contains information about almost 3,000 alterations in 418 cancer
            genes. For each alteration, we categorize the biological and
            clinical effect, along with citations of the source of the
            information, and, when available, the therapeutic implications of a
            alteration. We have focussed on FDA-approved (Level 1) or
            guideline-listed (Level 2) biomarkers, as well as biomarkers that
            with clinical evidence for sensitivity and for which therapies are
            currently explored in clinical trials (Level 3). See the Levels of
            Evidence and Actionable Genes pages for more information.
          </p>
          <p>
            We have also{' '}
            <b>
              integrated information from {ONCOKB_TM} into the cBioPortal for
              Cancer Genomics
            </b>
            . When exploring alterations in{' '}
            <a
              href="http://www.cbioportal.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              cbioportal.org
            </a>
            , you will see annotations from {ONCOKB_TM} when available.{' '}
            <a
              href="http://www.cbioportal.org/case.do?cancer_study_id=luad_tcga_pub&sample_id=TCGA-49-4494-01"
              target="_blank"
              rel="noopener noreferrer"
            >
              Example of a lung cancer case.
            </a>
          </p>
        </div>
      </div>
    );
  }
}
