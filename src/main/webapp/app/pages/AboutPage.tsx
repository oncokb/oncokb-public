import * as React from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import processImg from 'content/images/process.png';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { CitationText } from 'app/components/CitationText';
import { Link } from 'react-router-dom';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  BILIBILI_VIDEO_IDS,
  DOCUMENT_TITLES,
  PAGE_ROUTE,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  SOP_LINK,
  YOUTUBE_VIDEO_IDS,
} from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import { Linkout } from 'app/shared/links/Linkout';
import { observable, IReactionDisposer, reaction, computed } from 'mobx';
import Tabs from 'react-responsive-tabs';
import Iframe from 'react-iframe';
import * as QueryString from 'query-string';
import _ from 'lodash';
import { RouterStore } from 'mobx-react-router';
import { getBilibiliLink, getYouTubeLink } from 'app/shared/utils/Utils';
import { WebinarLink } from 'app/shared/utils/UrlUtils';
import OptimizedImage from 'app/shared/image/OptimizedImage';

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
            <h5>Webinar #1: Introduction to OncoKB</h5>
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
              Webinar #2: Introduction to OncoKB Web API
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
      <DocumentTitle title={DOCUMENT_TITLES.ABOUT}>
        <>
          <Row>
            <Col md={6} xs={12}>
              <h2 className={'mt-1'}>About OncoKB</h2>
              <p className={'mt-3'}>
                OncoKB is a precision oncology knowledge base developed at
                Memorial Sloan Kettering Cancer Center (MSK) and reflects the
                understanding of the biological and clinical relevance of
                various genomic alterations in cancer from experts at MSK.
              </p>
              <p>
                Alterations are annotated with their biological and oncogenic
                effects. Additionally, alteration- and tumor type-specific
                therapeutic implications are classified using the{' '}
                <Link to={PAGE_ROUTE.LEVELS}>OncoKB Levels of Evidence</Link>{' '}
                system, which assigns clinical actionability to individual
                mutational events.
              </p>
              <p>
                For additional details about the OncoKB curation process, please
                refer to the version-controlled{' '}
                <Link to={PAGE_ROUTE.SOP}>
                  OncoKB Curation Standard Operating Procedure
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
              <p className={'mt-2'}>
                <OptimizedImage src={processImg} style={{ width: '100%' }} />
                <div className={'text-center'}>
                  <h5>Overview of OncoKB Process</h5>
                </div>
              </p>
            </Col>
          </Row>
        </>
      </DocumentTitle>
    );
  }
}
