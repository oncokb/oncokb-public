import * as React from 'react';
import { observable, action, IReactionDisposer, reaction } from 'mobx';
import { observer, inject } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from '../shared/api/oncokbPrivateClientInstance';
import {
  Gene,
  LevelNumber,
  TypeaheadSearchResp,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { Row, Col, Button } from 'react-bootstrap';
import oncokbImg from 'content/images/oncokb.png';
import { HomePageNumber } from 'app/components/HomePageNumber';
import pluralize from 'pluralize';
import {
  LEVELS,
  LEVEL_BUTTON_DESCRIPTION,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVEL_TYPE_NAMES,
  PAGE_ROUTE,
} from 'app/config/constants';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { levelOfEvidence2Level } from 'app/shared/utils/Utils';
import { RouterStore } from 'mobx-react-router';
import { CitationText } from 'app/components/CitationText';
import _ from 'lodash';
import AppStore from 'app/store/AppStore';
import OncoKBSearch from 'app/components/oncokbSearch/OncoKBSearch';
import autobind from 'autobind-decorator';
import * as QueryString from 'query-string';

interface IHomeProps {
  content: string;
  routing: RouterStore;
  appStore: AppStore;
}

export type ExtendedTypeaheadSearchResp = TypeaheadSearchResp & {
  alterationsName: string;
  tumorTypesName: string;
};

@inject('routing', 'appStore')
@observer
class HomePage extends React.Component<IHomeProps> {
  @observable keyword = '';
  @observable levelTypeSelected = LEVEL_TYPES.TX;
  private levelGadgets = this.generateLevelGadgets();

  readonly reactions: IReactionDisposer[] = [];

  updateLocationHash = (newSelectedType: LEVEL_TYPES) => {
    window.location.hash = QueryString.stringify({
      levelType: newSelectedType,
    });
  };

  constructor(props: Readonly<IHomeProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash) as {
            levelType: LEVEL_TYPES;
          };
          if (queryStrings.levelType) {
            this.levelTypeSelected = queryStrings.levelType;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.levelTypeSelected,
        newSelectedType => this.updateLocationHash(newSelectedType)
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  generateLevelGadgets() {
    const levelGadgets: {
      title?: string;
      description: string;
      level: string;
      linkoutLevel: string;
      combinedLevels: string[];
    }[] = [];
    for (const level in LEVELS) {
      if (LEVELS[level]) {
        switch (level) {
          case LEVELS.R1:
            levelGadgets.push({
              level: LEVELS.R1,
              description: 'Resistance',
              title: `Level ${LEVELS.R1}/${LEVELS.R2}`,
              linkoutLevel: `${LEVELS.R1},${LEVELS.R2}`,
              combinedLevels: [LEVELS.R1, LEVELS.R2],
            });
            break;
          case LEVELS.R2:
            break;
          default:
            levelGadgets.push({
              level: LEVELS[level],
              description: LEVEL_BUTTON_DESCRIPTION[LEVELS[level]],
              linkoutLevel: LEVELS[level],
              combinedLevels: [LEVELS[level]],
            });
        }
      }
    }
    return levelGadgets;
  }

  readonly levelNumbers = remoteData<{ [level: string]: LevelNumber }>({
    await: () => [],
    async invoke() {
      const levelNumber = await oncokbPrivateClient.utilsNumbersLevelsGetUsingGET(
        {}
      );
      return Promise.resolve(
        _.reduce(
          levelNumber,
          (acc, next) => {
            acc[levelOfEvidence2Level(next.level, true)] = next;
            return acc;
          },
          {} as { [level: string]: LevelNumber }
        )
      );
    },
    default: {},
  });

  getLevelNumber(levels: string[]) {
    return _.uniq(
      _.reduce(
        levels,
        (acc, level) => {
          acc.push(
            ...(this.levelNumbers.result[level]
              ? this.levelNumbers.result[level].genes
              : [])
          );
          return acc;
        },
        [] as Gene[]
      )
    ).length;
  }

  @autobind
  @action
  handleLevelTypeButton(type: any) {
    this.levelTypeSelected = type;
  }

  public render() {
    const levelTypeButtons = [];
    for (const key in LEVEL_TYPES) {
      if (LEVEL_TYPES[key]) {
        levelTypeButtons.push(
          <Button
            className="mx-2"
            variant={
              this.levelTypeSelected === LEVEL_TYPES[key] ? 'primary' : 'light'
            }
            size="sm"
            onClick={() => this.handleLevelTypeButton(LEVEL_TYPES[key])}
          >
            {LEVEL_TYPE_NAMES[LEVEL_TYPES[key]]} Levels
          </Button>
        );
      }
    }
    return (
      <div className="home">
        <Row className="mb-5">
          <Col
            md={6}
            className={'mx-auto d-flex flex-column align-items-center '}
          >
            <img src={oncokbImg} className="home-page-logo" />
            <span className="home-page-logo-title">
              Precision Oncology Knowledge Base
            </span>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col md={8} className={'mx-auto'}>
            <Row>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  href={'/cancerGenes'}
                  number={this.props.appStore.mainNumbers.result.gene}
                  title={`${pluralize(
                    'Gene',
                    this.props.appStore.mainNumbers.result.gene
                  )}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  number={this.props.appStore.mainNumbers.result.alteration}
                  title={`${pluralize(
                    'Alteration',
                    this.props.appStore.mainNumbers.result.alteration
                  )}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  href={PAGE_ROUTE.ACTIONABLE_GENE}
                  number={this.props.appStore.mainNumbers.result.tumorType}
                  title={`${pluralize(
                    'Cancer Type',
                    this.props.appStore.mainNumbers.result.tumorType
                  )}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  href={PAGE_ROUTE.ACTIONABLE_GENE}
                  number={this.props.appStore.mainNumbers.result.drug}
                  title={`${pluralize(
                    'Drug',
                    this.props.appStore.mainNumbers.result.drug
                  )}`}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col md={8} className={'mx-auto'}>
            <OncoKBSearch />
          </Col>
        </Row>
        <Row className="mb-2">
          <div className="mx-auto">{levelTypeButtons}</div>
        </Row>
        <Row className="my-3 d-flex d-flex justify-content-between">
          <Col
            xs={0}
            lg={this.levelTypeSelected === LEVEL_TYPES.TX ? 1 : 3}
          ></Col>
          {this.levelGadgets.map(
            levelGadget =>
              ((this.levelTypeSelected === LEVEL_TYPES.DX &&
                LEVEL_CLASSIFICATION[levelGadget.level] === LEVEL_TYPES.DX) ||
                (this.levelTypeSelected === LEVEL_TYPES.PX &&
                  LEVEL_CLASSIFICATION[levelGadget.level] === LEVEL_TYPES.PX) ||
                (this.levelTypeSelected === LEVEL_TYPES.TX &&
                  LEVEL_CLASSIFICATION[levelGadget.level] ===
                    LEVEL_TYPES.TX)) && (
                <Col
                  xs={12}
                  sm={6}
                  lg={2}
                  key={levelGadget.level}
                  style={{ minHeight: 125 }}
                  className="px-0"
                >
                  <LevelButton
                    level={levelGadget.level}
                    numOfGenes={this.getLevelNumber(levelGadget.combinedLevels)}
                    description={levelGadget.description}
                    title={levelGadget.title}
                    className="mb-2"
                    style={{
                      lineHeight:
                        levelGadget.level === LEVELS.Px3 ? '35px' : undefined,
                    }}
                    href={`/actionableGenes#levels=${levelGadget.linkoutLevel}`}
                  />
                </Col>
              )
          )}
          <Col
            xs={0}
            lg={this.levelTypeSelected === LEVEL_TYPES.TX ? 1 : 3}
          ></Col>
        </Row>
        <Row className="mb-3">
          <Col className={'text-center'}>
            <div className={'font-weight-bold'}>
              Powered by the clinical expertise of Memorial Sloan Kettering
              Cancer Center
            </div>
            <div>
              <CitationText boldLinkout={true} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default HomePage;
