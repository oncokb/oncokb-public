import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import processImg from 'content/images/process.png';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { CitationText } from 'app/components/CitationText';
import { Link } from 'react-router-dom';
import {
  BILIBILI_VIDEO_IDS,
  LEVEL_TYPES,
  ONCOKB_TM,
  PAGE_ROUTE,
  PAGE_TITLE,
  YOUTUBE_VIDEO_IDS,
} from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import { IReactionDisposer, observable } from 'mobx';
import Tabs from 'react-responsive-tabs';
import Iframe from 'react-iframe';
import { RouterStore } from 'mobx-react-router';
import {
  getBilibiliLink,
  getPageTitle,
  getYouTubeLink,
} from 'app/shared/utils/Utils';
import OptimizedImage from 'app/shared/image/OptimizedImage';
import { LevelOfEvidencePageLink } from 'app/shared/links/LevelOfEvidencePageLink';

type AboutPageProps = { appStore: AppStore; routing: RouterStore };

enum VIDEO_TAB_EKY {
  INTRO = 'INTRO',
  DEMO = 'DEMO',
  TUTORIALS = 'TUTORIALS',
}

@inject('appStore', 'routing')
@observer
export class AboutPage extends React.Component<AboutPageProps> {
  @observable selectedVideoTabKey: VIDEO_TAB_EKY = VIDEO_TAB_EKY.INTRO;

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: AboutPageProps) {
    super(props);
  }

  componentWillUnmount() {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  private getTabIframe = (link: string) => (
    <Iframe
      width="100%"
      height="300"
      url={link}
      frameBorder={0}
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></Iframe>
  );

  private getTutorialTabs = (links: { youTube: string; bilibili: string }) => [
    {
      title: 'YouTube.com',
      getContent: () => this.getTabIframe(links.youTube),
      key: 'youtube',
    },
    {
      title: 'bilibili.com',
      getContent: () => this.getTabIframe(links.bilibili),
      key: 'bilibili',
    },
  ];

  getVideoTabs = () => [
    {
      title: 'Intro',
      getContent: () =>
        this.getTabIframe(getYouTubeLink('embed', YOUTUBE_VIDEO_IDS.INTRO)),
      key: VIDEO_TAB_EKY.INTRO,
    },
    {
      title: 'Demo',
      getContent: () =>
        this.getTabIframe(
          getYouTubeLink('embed', YOUTUBE_VIDEO_IDS.INTRO_LONG)
        ),
      key: VIDEO_TAB_EKY.DEMO,
    },
    {
      title: 'Tutorials',
      getContent: () => {
        return (
          <div>
            <h5>Webinar #1: Introduction to {ONCOKB_TM}</h5>
            <Tabs
              items={this.getTutorialTabs({
                youTube: getYouTubeLink(
                  'embed',
                  YOUTUBE_VIDEO_IDS.WEBINAR_INTRO
                ),
                bilibili: getBilibiliLink(BILIBILI_VIDEO_IDS.WEBINAR_INTRO),
              })}
              transform={false}
            />

            <h5 className={'mt-3'}>
              Webinar #2: Introduction to {ONCOKB_TM} Web API
            </h5>
            <Tabs
              items={this.getTutorialTabs({
                youTube: getYouTubeLink('embed', YOUTUBE_VIDEO_IDS.WEBINAR_API),
                bilibili: getBilibiliLink(BILIBILI_VIDEO_IDS.WEBINAR_API),
              })}
              transform={false}
            />
          </div>
        );
      },
      key: VIDEO_TAB_EKY.TUTORIALS,
    },
  ];

  render() {
    return (
      <DocumentTitle title={getPageTitle(PAGE_TITLE.ABOUT)}>
        <>
          <Row>
            <Col md={6} xs={12}>
              <h2 className={'mt-1'}>About {ONCOKB_TM}</h2>
              <p className={'mt-3'}>
                {ONCOKB_TM} is a precision oncology knowledge base developed at
                Memorial Sloan Kettering Cancer Center that contains biological
                and clinical information about genomic alterations in cancer.
              </p>
              <p>
                Alteration- and tumor type-specific therapeutic implications are
                classified using the{' '}
                <LevelOfEvidencePageLink levelType={LEVEL_TYPES.TX}>
                  {ONCOKB_TM} Levels of Evidence
                </LevelOfEvidencePageLink>{' '}
                system, which assigns clinical actionability to individual
                mutational events.
              </p>
              <p>
                For additional details about the {ONCOKB_TM} curation process,
                please refer to the version-controlled{' '}
                <Link to={PAGE_ROUTE.SOP}>
                  {ONCOKB_TM} Curation Standard Operating Procedure
                </Link>
                . <CitationText />
              </p>
            </Col>
            <Col md={6} xs={12}>
              <Tabs
                transform={false}
                items={this.getVideoTabs()}
                selectedTabKey={this.selectedVideoTabKey}
                onChange={(tabKey: VIDEO_TAB_EKY) => {
                  this.selectedVideoTabKey = tabKey;
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div className={'mt-2'}>
                <OptimizedImage src={processImg} style={{ width: '100%' }} />
                <div className={'text-center'}>
                  <h5>Overview of {ONCOKB_TM} Process</h5>
                </div>
              </div>
            </Col>
          </Row>
        </>
      </DocumentTitle>
    );
  }
}
