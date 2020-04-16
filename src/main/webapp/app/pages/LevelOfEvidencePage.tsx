import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import {
  DOCUMENT_TITLES,
  IMG_MAX_WIDTH,
  PAGE_ROUTE
} from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import { inject, observer } from 'mobx-react';
import { action, IReactionDisposer, observable, reaction } from 'mobx';
import * as QueryString from 'query-string';
import { RouterStore } from 'mobx-react-router';
import autobind from 'autobind-decorator';
import { HashLink } from 'react-router-hash-link';
import mainStyles from '../index.module.scss';
import { ElementType } from 'app/components/SimpleTable';

type LevelOfEvidencePageProps = {
  routing: RouterStore;
};

// the level content should be all uppercase
export enum Version {
  v1 = 'V1',
  v2 = 'V2',
  JCS = 'JCS'
}

const DEFAULT_LEVEL_FILE_NAME = 'LevelsOfEvidence';
const JCS_CHECKBOX_ID = 'loe-jcs-checkbox';
const ALLOWED_VERSIONS: string[] = [Version.v2, Version.v1, Version.JCS];
const V2_RELATED_LEVELS = [Version.v2, Version.JCS];
const JCS_NAME = 'AMP/ASCO/CAP Levels of Evidence';
const LEVEL_TITLE: { [key in Version]: ElementType } = {
  [Version.v1]: <>OncoKB Levels of Evidence {Version.v1}</>,
  [Version.v2]: (
    <>
      OncoKB Levels of Evidence {Version.v2} ({' '}
      <HashLink to={`${PAGE_ROUTE.NEWS}#12202019`}>News 12/20/2019</HashLink> )
    </>
  ),
  [Version.JCS]: <>Mapping between OncoKB and AMP/ASCO/CAP Levels of Evidence</>
};
const LEVEL_SUBTITLE: { [key in Version]: ElementType } = {
  [Version.v1]: <>Click here to see Levels of Evidence {Version.v2}</>,
  [Version.v2]: <>Click here to see Levels of Evidence {Version.v1}</>,
  [Version.JCS]: <></>
};

const LEVEL_FILE_NAME: { [key in Version]: string } = {
  [Version.v1]: DEFAULT_LEVEL_FILE_NAME,
  [Version.v2]: DEFAULT_LEVEL_FILE_NAME,
  [Version.JCS]: `Mapping_OncoKB_and_AMP_ASCO_CAP_LOfE`
};

@inject('routing')
@observer
export default class LevelOfEvidencePage extends React.Component<
  LevelOfEvidencePageProps
> {
  @observable version: Version;

  readonly reactions: IReactionDisposer[] = [];

  getVersionDefault = () => {
    return Version.v2;
  };

  updateLocationHash = (newVersion: Version) => {
    window.location.hash = QueryString.stringify({ version: newVersion });
  };

  constructor(props: Readonly<LevelOfEvidencePageProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash) as { version: Version };
          if (queryStrings.version) {
            if (ALLOWED_VERSIONS.includes(queryStrings.version.toUpperCase())) {
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
      reaction(
        () => this.version,
        newVersion => {}
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  @autobind
  @action
  toggleVersion(version: Version) {
    this.version = version;
  }

  render() {
    return (
      <DocumentTitle title={DOCUMENT_TITLES.LEVELS}>
        <div className="levels-of-evidence">
          <>
            <Row>
              <Col className="col-auto mr-auto d-flex align-content-center">
                {V2_RELATED_LEVELS.includes(this.version) && (
                  <span className={'d-flex align-items-center form-check'}>
                    <input
                      type={'checkbox'}
                      className={'form-check-input'}
                      id={JCS_CHECKBOX_ID}
                      onClick={() =>
                        this.toggleVersion(
                          this.version === Version.JCS
                            ? Version.v2
                            : Version.JCS
                        )
                      }
                      checked={this.version === Version.JCS}
                    />
                    <label
                      className={'form-check-label'}
                      htmlFor={JCS_CHECKBOX_ID}
                    >
                      Showing mapping to {JCS_NAME}
                    </label>
                  </span>
                )}
              </Col>
              <Col className={'col-auto'}>
                <Button
                  size={'sm'}
                  className={classnames('ml-1')}
                  href={`content/files/levelOfEvidence/${this.version}/${
                    LEVEL_FILE_NAME[this.version]
                  }.ppt`}
                >
                  <i className={'fa fa-cloud-download mr-1'} />
                  Download Slide
                </Button>
                <DownloadButton
                  size={'sm'}
                  className={classnames('ml-1')}
                  href={`content/files/levelOfEvidence/${this.version}/${
                    LEVEL_FILE_NAME[this.version]
                  }.pdf`}
                >
                  <i className={'fa fa-cloud-download mr-1'} />
                  Download PDF
                </DownloadButton>
              </Col>
            </Row>
            <Row>
              <Col className={'d-md-flex justify-content-center mt-2'}>
                <div
                  style={{
                    maxWidth: this.version === Version.JCS ? 900 : IMG_MAX_WIDTH
                  }}
                >
                  <img
                    style={{ width: '100%' }}
                    src={`content/images/level_${this.version}.png`}
                  />
                </div>
              </Col>
            </Row>
            <Row className={'justify-content-md-center'}>
              <Col className={'col-md-auto text-center'}>
                <div>
                  <span className={'mr-1 font-weight-bold'}>
                    {LEVEL_TITLE[this.version]}
                  </span>
                </div>
                <div>
                  <span
                    onClick={() =>
                      this.toggleVersion(
                        V2_RELATED_LEVELS.includes(this.version)
                          ? Version.v1
                          : Version.v2
                      )
                    }
                    className={mainStyles.btnLinkText}
                  >
                    {LEVEL_SUBTITLE[this.version]}
                  </span>
                </div>
              </Col>
            </Row>
          </>
        </div>
      </DocumentTitle>
    );
  }
}
