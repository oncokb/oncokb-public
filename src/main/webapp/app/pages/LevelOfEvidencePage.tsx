import React from 'react';
import { Row, Col, Button, Tabs, Tab, Form } from 'react-bootstrap';
import classnames from 'classnames';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import {
  PAGE_TITLE,
  IMG_MAX_WIDTH,
  LEVEL_TYPES,
  ONCOKB_TM,
  PAGE_ROUTE,
} from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import { inject, observer } from 'mobx-react';
import { action, IReactionDisposer, observable, reaction } from 'mobx';
import * as QueryString from 'query-string';
import { RouterStore } from 'mobx-react-router';
import { Link } from 'react-router-dom';
import autobind from 'autobind-decorator';
import mainStyles from '../index.module.scss';
import { ElementType } from 'app/components/SimpleTable';
import WindowStore from 'app/store/WindowStore';
import { Linkout } from 'app/shared/links/Linkout';
import OptimizedImage from 'app/shared/image/OptimizedImage';
import { getPageTitle } from 'app/shared/utils/Utils';

type LevelOfEvidencePageProps = {
  routing: RouterStore;
  windowStore: WindowStore;
};

// the level content should be all uppercase
export enum Version {
  V1 = 'V1',
  V2 = 'V2',
  FDA = 'FDA',
  FDA_NGS = 'FDA_NGS',
  AAC = 'AAC',
  DX = 'DX',
  PX = 'PX',
}

const TAB_TITLES = {
  [Version.V1]: 'Therapeutic Levels',
  [Version.V2]: 'Therapeutic Levels',
  [Version.AAC]: 'Therapeutic Levels',
  [Version.FDA_NGS]: 'FDA Levels',
};

export const LEVEL_TYPE_TO_VERSION: { [key in LEVEL_TYPES]: Version } = {
  [LEVEL_TYPES.TX]: Version.V2,
  [LEVEL_TYPES.DX]: Version.DX,
  [LEVEL_TYPES.PX]: Version.PX,
  [LEVEL_TYPES.FDA]: Version.FDA_NGS,
};

const DEFAULT_LEVEL_FILE_NAME = 'LevelsOfEvidence';
const AAC_CHECKBOX_ID = 'loe-aac-checkbox';
const ALLOWED_VERSIONS: string[] = [
  Version.V2,
  Version.V1,
  Version.AAC,
  Version.FDA,
  Version.FDA_NGS,
];
const V2_RELATED_LEVELS = [Version.V2, Version.FDA, Version.AAC];

const LEVEL_NAME: { [key in Version]?: ElementType } = {
  [Version.V1]: `${ONCOKB_TM} Therapeutic Level of Evidence V1`,
  [Version.V2]: `${ONCOKB_TM} Therapeutic Level of Evidence V2`,
  [Version.FDA]: 'FDA Levels of Evidence',
  [Version.FDA_NGS]: 'FDA Levels of Evidence',
  [Version.AAC]: 'AMP/ASCO/CAP Consensus Recommendation',
};

const LEVEL_TITLE: { [key in Version]?: ElementType } = {
  [Version.V1]: <>{LEVEL_NAME[Version.V1]}</>,
  [Version.V2]: <>{LEVEL_NAME[Version.V2]}</>,
  [Version.FDA]: (
    <>
      Mapping between the {ONCOKB_TM} Levels of Evidence and the{' '}
      {LEVEL_NAME[Version.FDA]}
    </>
  ),
  [Version.FDA_NGS]: <></>,
  [Version.AAC]: (
    <>
      Mapping between the {ONCOKB_TM} Levels of Evidence and the{' '}
      {LEVEL_NAME[Version.AAC]}
    </>
  ),
};
const LEVEL_SUBTITLE: { [key in Version]?: ElementType } = {
  [Version.V1]: (
    <>Click here to see Therapeutic Levels of Evidence {Version.V2}</>
  ),
  [Version.V2]: (
    <>Click here to see Therapeutic Levels of Evidence {Version.V1}</>
  ),
  [Version.AAC]: <></>,
  [Version.FDA]: <></>,
  [Version.FDA_NGS]: <></>,
};

const LEVEL_FILE_NAME: { [key in Version]?: string } = {
  [Version.V1]: DEFAULT_LEVEL_FILE_NAME,
  [Version.V2]: DEFAULT_LEVEL_FILE_NAME,
  [Version.FDA]: `Mapping_OncoKB_and_FDA_LOfE`,
  [Version.AAC]: `Mapping_OncoKB_and_AMP_ASCO_CAP_LOfE`,
  [Version.FDA_NGS]:
    'CDRH’s-Approach-to-Tumor-Profiling-Next-Generation-Sequencing-Tests',
};

@inject('routing', 'windowStore')
@observer
export default class LevelOfEvidencePage extends React.Component<
  LevelOfEvidencePageProps,
  any
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
    [Version.V2, Version.FDA_NGS].forEach(version => {
      tabs.push(
        <Tab
          eventKey={Version[version]}
          title={TAB_TITLES[version]}
          key={version}
        >
          <>
            <Row className="mt-2">
              <Col className="col-auto mr-auto d-flex align-content-center">
                {V2_RELATED_LEVELS.includes(this.version) && (
                  <span className={'d-flex align-items-center form-check'}>
                    <Form.Group>
                      {[Version.FDA, Version.AAC].map(versionCheck => (
                        <Form.Check
                          label={`Show mapping to ${LEVEL_NAME[versionCheck]}`}
                          type="checkbox"
                          onChange={() =>
                            this.toggleVersion(
                              this.version === versionCheck
                                ? Version.V2
                                : versionCheck
                            )
                          }
                          name="mapping-to-other-levels"
                          id={`mapping-to-other-levels-${versionCheck}`}
                          key={`mapping-to-other-levels-${versionCheck}`}
                          checked={this.version === versionCheck}
                        />
                      ))}
                    </Form.Group>
                  </span>
                )}
              </Col>
              <Col className={'col-auto'}>
                {this.version !== Version.FDA_NGS && (
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
                )}
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
                    maxWidth: [
                      Version.AAC,
                      Version.FDA,
                      Version.V1,
                      Version.V2,
                    ].includes(this.version)
                      ? undefined
                      : IMG_MAX_WIDTH,
                  }}
                >
                  <OptimizedImage
                    style={{ width: '100%' }}
                    progressiveLoading
                    src={`content/images/level_${this.version}.png`}
                  />
                  {this.version === Version.AAC ? (
                    <div className="text-right">
                      <span
                        style={{
                          marginRight: this.props.windowStore.isLargeScreen
                            ? '130px'
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
          </>
        </Tab>
      );
    });

    return (
      <DocumentTitle title={getPageTitle(PAGE_TITLE.LEVELS)}>
        <>
          <div className="mb-4 d-flex font-bold">
            <Link to={PAGE_ROUTE.DX_LEVELS} className="mr-5">
              Diagnostic Levels
            </Link>
            <Link to={PAGE_ROUTE.PX_LEVELS}>Prognostic Levels</Link>
          </div>

          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="levels-of-evidence">
                <>
                  <Tabs
                    defaultActiveKey={
                      this.version === Version.FDA_NGS
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
            </Col>
          </Row>
        </>
      </DocumentTitle>
    );
  }
}
