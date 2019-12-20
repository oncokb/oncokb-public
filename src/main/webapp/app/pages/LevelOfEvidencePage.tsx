import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import {
  DOCUMENT_TITLES,
  IMG_MAX_WIDTH,
  PAGE_ROUTE,
  QUERY_SEPARATOR_FOR_QUERY_STRING
} from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import { inject, observer } from 'mobx-react';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction
} from 'mobx';
import * as QueryString from 'query-string';
import { RouterStore } from 'mobx-react-router';
import autobind from 'autobind-decorator';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

type LevelOfEvidencePageProps = {
  routing: RouterStore;
};

enum version {
  v1 = 'V1',
  v2 = 'V2'
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
            }
          } else {
            this.version = this.getVersionDefault();
          }
        },
        { fireImmediately: true }
      ),
      reaction(() => this.version, newVersion => {})
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  @autobind
  @action
  toggleVersion() {
    this.version = this.version === version.v2 ? version.v1 : version.v2;
  }

  render() {
    return (
      <DocumentTitle title={DOCUMENT_TITLES.LEVELS}>
        <div className="levels-of-evidence">
          <>
            <Row>
              <Col className="col-auto mr-auto d-flex align-content-center">
                {this.version === version.v2 && (
                  <span className={'d-flex align-items-center'}>
                    <span className={'mr-1'}>
                      Introducing Simplified OncoKB Levels of Evidence V2, refer to
                      the
                    </span>
                    <HashLink to={`${PAGE_ROUTE.NEWS}#12202019`}>
                      News 12/20/2019
                    </HashLink>
                  </span>
                )}
                {this.version === version.v1 && (
                  <span className={'d-flex align-items-center'}>
                    <span>This is the previous Levels of Evidence. </span>
                    <Button variant={'link'} onClick={this.toggleVersion}>
                      Click here to see{' '}
                      <b>{version.v2}</b> Levels of
                      Evidence
                    </Button>
                  </span>
                )}
              </Col>
              <Col className={'col-auto'}>
                <Button
                  size={'sm'}
                  className={classnames('ml-1')}
                  href={`content/files/levelOfEvidence/${this.version}/LevelsOfEvidence.ppt`}
                >
                  <i className={'fa fa-cloud-download mr-1'} />
                  Download Slide
                </Button>
                <DownloadButton
                  size={'sm'}
                  className={classnames('ml-1')}
                  href={`content/files/levelOfEvidence/${this.version}/LevelsOfEvidence.pdf`}
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
                  src={`content/images/level_${this.version}.jpg`}
                />
              </Col>
            </Row>
            {this.version === version.v2 && (
              <Row>
                <Col>
                  <Button variant={'link'} onClick={this.toggleVersion}>
                    Click here to see{' '}
                    {this.version === version.v2 ? version.v1 : version.v2} Levels of
                    Evidence
                  </Button>
                </Col>
              </Row>
            )}
          </>
        </div>
      </DocumentTitle>
    );
  }
}
