import * as React from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import processImg from 'content/images/process.png';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { CitationText } from 'app/components/CitationText';
import { Link } from 'react-router-dom';
import {
  BILIBILI_VIDEO_IDS,
  DOCUMENT_TITLES,
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

type AboutPageProps = { appStore: AppStore; routing: RouterStore };
const ONCOKB_TUTORIAL = 'OncoKB Tutorials';
export const SHOW_MODAL_KEY = 'showModal';
export const SHOW_TUTORIALS_KEY = 'showTutorials';

type HashQueries = {
  [SHOW_MODAL_KEY]?: string;
  [SHOW_TUTORIALS_KEY]?: string;
};

@inject('appStore', 'routing')
@observer
export class AboutPage extends React.Component<AboutPageProps> {
  @observable [SHOW_TUTORIALS_KEY] = false;

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: AboutPageProps) {
    super(props);

    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(
            window.location.hash
          ) as HashQueries;
          if (_.has(queryStrings, SHOW_MODAL_KEY)) {
            this[SHOW_TUTORIALS_KEY] = queryStrings[SHOW_MODAL_KEY] === 'true';
          }
          if (_.has(queryStrings, SHOW_TUTORIALS_KEY)) {
            this[SHOW_TUTORIALS_KEY] =
              queryStrings[SHOW_TUTORIALS_KEY] === 'true';
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.hashQueries,
        newHash => {
          const parsedHashQueryString = QueryString.stringify(newHash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING,
          });
          window.location.hash = parsedHashQueryString;
        }
      )
    );
  }

  componentWillUnmount() {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  @computed
  get hashQueries() {
    const queryString: Partial<HashQueries> = {};
    if (this[SHOW_TUTORIALS_KEY]) {
      queryString[SHOW_TUTORIALS_KEY] = `${this[SHOW_TUTORIALS_KEY]}`;
    }
    return queryString;
  }

  private getTabIframe = (link: string) => (
    <Iframe
      width="100%"
      height="400"
      url={link}
      frameBorder={0}
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></Iframe>
  );

  private getTabs = (links: { youTube: string; bilibili: string }) => [
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

  render() {
    return (
      <DocumentTitle title={DOCUMENT_TITLES.ABOUT}>
        <>
          <Row>
            <Col className="d-flex justify-content-between">
              <h2>About OncoKB</h2>
              <Button
                className={'mb-2'}
                onClick={() => (this[SHOW_TUTORIALS_KEY] = true)}
              >
                <span>{ONCOKB_TUTORIAL}</span>
                <i className={'fa fa-play-circle-o fa-lg ml-2'} />
              </Button>
            </Col>
          </Row>
          <Row>
            <Col md={6} xs={12}>
              <p>
                OncoKB is a precision oncology knowledge base developed at
                Memorial Sloan Kettering Cancer Center (MSK) and reflects the
                understanding of the biological and clinical relevance of
                various genomic alterations in cancer from experts at MSK.
              </p>
              <p>
                Alterations are annotated with their biological and oncogenic
                effects. Additionally, alteration- and tumor type-specific
                therapeutic implications are classified using the{' '}
                <Link to="/levels">OncoKB Levels of Evidence</Link> system,
                which assigns clinical actionability to individual mutational
                events.
              </p>
              <p>
                For additional details about the OncoKB curation process, please
                refer to the version-controlled{' '}
                <Linkout link={SOP_LINK}>
                  OncoKB Curation Standard Operating Procedure v2.1
                </Linkout>
                . <CitationText />
              </p>
            </Col>
            <Col md={6} xs={12}>
              <Iframe
                width="100%"
                height="300"
                url={getYouTubeLink('embed', YOUTUBE_VIDEO_IDS.INTRO_LONG)}
                frameBorder={0}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></Iframe>
            </Col>
          </Row>
          <Row>
            <Col>
              <p className={'mt-5'}>
                <img src={processImg} style={{ width: '100%' }} />
              </p>
            </Col>
          </Row>
          <Modal
            show={this[SHOW_TUTORIALS_KEY]}
            onHide={() => (this[SHOW_TUTORIALS_KEY] = false)}
            size={'xl'}
          >
            <Modal.Header closeButton>
              <Modal.Title>{ONCOKB_TUTORIAL}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div>
                <h5>Webinar #1: Introduction to OncoKB</h5>
                <Tabs
                  items={this.getTabs({
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
                  items={this.getTabs({
                    youTube: getYouTubeLink(
                      'embed',
                      YOUTUBE_VIDEO_IDS.WEBINAR_API
                    ),
                    bilibili: getBilibiliLink(BILIBILI_VIDEO_IDS.WEBINAR_API),
                  })}
                  transform={false}
                />
              </div>
            </Modal.Body>
          </Modal>
        </>
      </DocumentTitle>
    );
  }
}
