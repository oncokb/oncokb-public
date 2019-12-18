import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import {
  DOCUMENT_TITLES,
  IMG_MAX_WIDTH,
  QUERY_SEPARATOR_FOR_QUERY_STRING
} from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import { inject, observer } from 'mobx-react';
import { computed, IReactionDisposer, observable, reaction } from 'mobx';
import * as QueryString from 'query-string';
import { RouterStore } from 'mobx-react-router';
import styles from 'app/components/downloadButton/DownloadButton.module.scss';
import Tabs from 'react-responsive-tabs';

type LevelOfEvidencePageProps = {
  routing: RouterStore;
};

enum version {
  v1 = 'v1',
  v2 = 'v2'
}
const ALLOWED_VERSIONS = [version.v2, version.v1];

@inject('routing')
@observer
export default class LevelOfEvidencePage extends React.Component<
  LevelOfEvidencePageProps
> {
  @observable version: version;

  readonly reactions: IReactionDisposer[] = [];

  getVersionDefault = () => {
    return version.v2;
  };

  updateLocationHash = (newVersion: version) => {
    window.location.hash = QueryString.stringify({ version: newVersion });
  };

  constructor(props: Readonly<LevelOfEvidencePageProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash) as { version: version };
          if (queryStrings.version) {
            if (ALLOWED_VERSIONS.includes(queryStrings.version)) {
              this.version = queryStrings.version;
            } else {
              this.version = this.getVersionDefault();
              this.updateLocationHash(this.version);
            }
          } else {
            this.version = this.getVersionDefault();
            this.updateLocationHash(this.version);
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.version,
        newVersion => {
          this.updateLocationHash(this.version);
        }
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  getTabContent(currentVersion: version) {
    return (
      <>
        <Row>
          <Col></Col>
          <Col className={'d-flex justify-content-end'}>
            <Button
              size={'sm'}
              className={classnames('ml-1')}
              href={`content/files/levelOfEvidence/${currentVersion}/LevelsOfEvidence.ppt`}
            >
              <i className={'fa fa-cloud-download mr-1'} />
              Download Slide
            </Button>
            <DownloadButton
              size={'sm'}
              className={classnames('ml-1')}
              href={`content/files/levelOfEvidence/${currentVersion}/LevelsOfEvidence.pdf`}
            >
              <i className={'fa fa-cloud-download mr-1'} />
              Download PDF
            </DownloadButton>
          </Col>
        </Row>
        <Row>
          <Col className={'d-sm-block d-md-flex justify-content-center'}>
            <img
              style={{ maxWidth: IMG_MAX_WIDTH, width: '100%' }}
              src={`content/images/level_${currentVersion}.jpg`}
            />
          </Col>
        </Row>
      </>
    );
  }

  @computed
  get tabs() {
    return ALLOWED_VERSIONS.map(allowedVersion => {
      return {
        title: `Version ${allowedVersion.slice(1)}`,
        getContent: () => this.getTabContent(allowedVersion),
        /* Optional parameters */
        key: allowedVersion,
        tabClassName: styles.tab,
        panelClassName: styles.panel
      };
    });
  }

  render() {
    return (
      <DocumentTitle title={DOCUMENT_TITLES.LEVELS}>
        <div className="levels-of-evidence">
          <Tabs
            items={this.tabs}
            transform={false}
            selectedTabKey={this.version}
            onChange={(nextTabKey: version) => (this.version = nextTabKey)}
          />
        </div>
      </DocumentTitle>
    );
  }
}
