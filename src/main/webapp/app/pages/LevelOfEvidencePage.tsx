import React from 'react';
import { Row, Col, Button, Tabs, Tab, Form } from 'react-bootstrap';
import classnames from 'classnames';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import {
  DOCUMENT_TITLES,
  FDA_LEVELS_OF_EVIDENCE_LINK,
  IMG_MAX_WIDTH,
  LEVEL_TYPES,
  PAGE_ROUTE,
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
import WindowStore from 'app/store/WindowStore';
import { Linkout } from 'app/shared/links/Linkout';

type LevelOfEvidencePageProps = {
  routing: RouterStore;
  windowStore: WindowStore;
};

// the level content should be all uppercase
export enum Version {
  V1 = 'V1',
  V2 = 'V2',
  FDA = 'FDA',
  AAC = 'AAC',
  DX = 'DX',
  PX = 'PX',
}

const TAB_TITLES = {
  [Version.V1]: 'Therapeutic Levels',
  [Version.V2]: 'Therapeutic Levels',
  [Version.AAC]: 'Therapeutic Levels',
  [Version.DX]: 'Diagnostic Levels',
  [Version.PX]: 'Prognostic Levels',
};

export const LEVEL_TYPE_TO_VERSION: { [key in LEVEL_TYPES]: Version } = {
  [LEVEL_TYPES.TX]: Version.V2,
  [LEVEL_TYPES.DX]: Version.DX,
  [LEVEL_TYPES.PX]: Version.PX,
};

const DEFAULT_LEVEL_FILE_NAME = 'LevelsOfEvidence';
const AAC_CHECKBOX_ID = 'loe-aac-checkbox';
const ALLOWED_VERSIONS: string[] = [
  Version.V2,
  Version.V1,
  Version.AAC,
  Version.DX,
  Version.PX,
  Version.FDA,
];
const V2_RELATED_LEVELS = [Version.V2, Version.FDA, Version.AAC];

const LEVEL_NAME: { [key in Version]: ElementType } = {
  [Version.V1]: 'OncoKB Therapeutic Level of Evidence V1',
  [Version.V2]: 'OncoKB Therapeutic Level of Evidence V2',
  [Version.FDA]: 'FDA Levels of Evidence',
  [Version.AAC]: 'AMP/ASCO/CAP Consensus Recommendation',
  [Version.DX]: 'OncoKB Diagnostic Levels of Evidence',
  [Version.PX]: 'OncoKB Prognostic Levels of Evidence',
};

const LEVEL_TITLE: { [key in Version]: ElementType } = {
  [Version.V1]: <>{LEVEL_NAME[Version.V1]}</>,
  [Version.V2]: (
    <>
      {LEVEL_NAME[Version.V2]} ({' '}
      <HashLink to={`${PAGE_ROUTE.NEWS}#12202019`}>News 12/20/2019</HashLink> )
    </>
  ),
  [Version.FDA]: (
    <>
      Mapping between the OncoKB Levels of Evidence and the{' '}
      {LEVEL_NAME[Version.FDA]}
    </>
  ),
  [Version.AAC]: (
    <>
      Mapping between the OncoKB Levels of Evidence and the{' '}
      {LEVEL_NAME[Version.AAC]}
    </>
  ),
  [Version.DX]: <>{LEVEL_NAME[Version.DX]}</>,
  [Version.PX]: <>{LEVEL_NAME[Version.PX]}</>,
};
const LEVEL_SUBTITLE: { [key in Version]: ElementType } = {
  [Version.V1]: (
    <>Click here to see Therapeutic Levels of Evidence {Version.V2}</>
  ),
  [Version.V2]: (
    <>Click here to see Therapeutic Levels of Evidence {Version.V1}</>
  ),
  [Version.AAC]: <></>,
  [Version.DX]: <></>,
  [Version.PX]: <></>,
  [Version.FDA]: <></>,
};

const LEVEL_FILE_NAME: { [key in Version]: string } = {
  [Version.V1]: DEFAULT_LEVEL_FILE_NAME,
  [Version.V2]: DEFAULT_LEVEL_FILE_NAME,
  [Version.FDA]: `Mapping_OncoKB_and_FDA_LOfE`,
  [Version.AAC]: `Mapping_OncoKB_and_AMP_ASCO_CAP_LOfE`,
  [Version.DX]: DEFAULT_LEVEL_FILE_NAME,
  [Version.PX]: DEFAULT_LEVEL_FILE_NAME,
};

@inject('routing', 'windowStore')
@observer
export default class LevelOfEvidencePage extends React.Component<
  LevelOfEvidencePageProps
> {
  @observable version: Version = Version.V2;

  readonly reactions: IReactionDisposer[] = [];

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
            }
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.version,
        newVersion => this.updateLocationHash(newVersion)
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  getSubTitle(version: Version) {
    switch (version) {
      case Version.V1:
      case Version.V2:
        return (
          <span
            onClick={() =>
              this.toggleVersion(
                V2_RELATED_LEVELS.includes(version) ? Version.V1 : Version.V2
              )
            }
            className={mainStyles.btnLinkText}
          >
            Click here to see {`${LEVEL_NAME[Version.V2]}`}
          </span>
        );
      default:
        return <></>;
    }
  }

  @autobind
  @action
  toggleVersion(version: Version) {
    this.version = version;
  }

  render() {
    const tabs: any[] = [];
    [Version.V2, Version.DX, Version.PX].forEach(version => {
      tabs.push(
        <Tab eventKey={Version[version]} title={TAB_TITLES[version]}>
          <Row className="mt-2">
            <Col className="col-auto mr-auto d-flex align-content-center">
              {V2_RELATED_LEVELS.includes(this.version) && (
                <span className={'d-flex align-items-center form-check'}>
                  <Form.Group>
                    {[Version.FDA, Version.AAC].map(versionCheck => (
                      <Form.Check
                        label={`Show mapping to ${LEVEL_NAME[versionCheck]}`}
                        type="checkbox"
                        onClick={() =>
                          this.toggleVersion(
                            this.version === versionCheck
                              ? Version.V2
                              : versionCheck
                          )
                        }
                        name="mapping-to-other-levels"
                        id={`mapping-to-other-levels-${versionCheck}`}
                        checked={this.version === versionCheck}
                      />
                    ))}
                  </Form.Group>
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
          <Row className={'justify-content-md-center mt-5'}>
            <Col className={'col-md-auto text-center'}>
              <h4>{LEVEL_TITLE[this.version]}</h4>
              <div>
                <span
                  onClick={() =>
                    this.toggleVersion(
                      V2_RELATED_LEVELS.includes(this.version)
                        ? Version.V1
                        : Version.V2
                    )
                  }
                  className={mainStyles.btnLinkText}
                >
                  {LEVEL_SUBTITLE[this.version]}
                </span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col className={'d-md-flex justify-content-center mt-2'}>
              <div
                style={{
                  maxWidth: [Version.AAC, Version.FDA].includes(this.version)
                    ? 1000
                    : IMG_MAX_WIDTH,
                }}
              >
                <img
                  style={{ width: '100%' }}
                  src={`content/images/level_${this.version}.png`}
                />
                {this.version === Version.AAC ? (
                  <div className="text-right">
                    <span
                      style={{
                        marginRight: this.props.windowStore.isLargeScreen
                          ? '85px'
                          : '35px',
                      }}
                    >
                      <sup>1</sup>{' '}
                      <Linkout link="https://www.sciencedirect.com/science/article/pii/S1525157816302239?via%3Dihub">
                        Li, MM et al., J Mol Diagn 2017
                      </Linkout>
                    </span>
                  </div>
                ) : null}
              </div>
            </Col>
          </Row>
        </Tab>
      );
    });

    return (
      <DocumentTitle title={DOCUMENT_TITLES.LEVELS}>
        <div className="levels-of-evidence">
          <>
            <Tabs
              defaultActiveKey={
                this.version === Version.DX || this.version === Version.PX
                  ? Version[this.version]
                  : Version.V2
              }
              id="level-type-tabs"
              onSelect={k => this.toggleVersion(Version[k || Version.V2])}
            >
              {tabs}
            </Tabs>
          </>
        </div>
      </DocumentTitle>
    );
  }
}
