import * as React from 'react';
import { action, IReactionDisposer, observable, reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from '../shared/api/oncokbPrivateClientInstance';
import {
  Gene,
  LevelNumber,
  TypeaheadSearchResp,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { Button, Col, Row } from 'react-bootstrap';
import { HomePageNumber } from 'app/components/HomePageNumber';
import pluralize from 'pluralize';
import {
  LEVEL_BUTTON_DESCRIPTION,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPE_NAMES,
  LEVEL_TYPES,
  LEVELS,
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
import { FDA_L1_DISABLED_BTN_TOOLTIP } from 'app/pages/genePage/FdaUtils';
import { COLOR_DARK_BLUE } from 'app/config/theme';

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
class HomePage extends React.Component<IHomeProps, {}> {
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
      level: LEVELS;
      linkoutLevel: string;
      combinedLevels: LEVELS[];
    }[] = [];
    for (const level in LEVELS) {
      if (LEVELS[level]) {
        switch (LEVELS[level]) {
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
          case LEVELS.Tx3A:
            break;
          case LEVELS.Tx3B:
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

  getLevelGenes(levels: string[]) {
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
      ).map(gene => gene.hugoSymbol)
    );
  }

  getLevelNumber(levels: LEVELS[]) {
    const level = levels.length > 0 ? levels[0] : null;
    switch (level) {
      case LEVELS.FDAx1:
      case LEVELS.FDAx2:
      case LEVELS.FDAx3:
        return this.props.appStore.fdaNumbers.result[level]
          ? this.props.appStore.fdaNumbers.result[level]
          : 0;
      default:
        return this.getLevelGenes(levels).length;
    }
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
            key={`button-tab-${LEVEL_TYPES[key]}`}
            className="mx-2"
            variant={
              this.levelTypeSelected === LEVEL_TYPES[key] ? 'primary' : 'light'
            }
            // size={'lg'}
            onClick={() => this.handleLevelTypeButton(LEVEL_TYPES[key])}
          >
            {LEVEL_TYPE_NAMES[LEVEL_TYPES[key]]} Levels
            {key === LEVEL_TYPES.FDA && (
              <div style={{ fontSize: '0.8em' }}>(Under FDA review)</div>
            )}
          </Button>
        );
      }
    }
    return (
      <div className="home">
        <Row className="mb-5">
          <Col
            md={8}
            className={'mx-auto d-flex flex-column align-items-center '}
          >
            <div
              className="text-center font-bold"
              style={{ fontSize: '3.5em', color: COLOR_DARK_BLUE }}
            >
              Welcome to OncoKB
            </div>
            <div className="text-center" style={{ fontSize: '2em' }}>
              MSK's Precision Oncology Knowledge Base
            </div>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col md={8} className={'mx-auto'}>
            <Row>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  isLoading={this.props.appStore.mainNumbers.isPending}
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
                  isLoading={this.props.appStore.mainNumbers.isPending}
                  number={this.props.appStore.mainNumbers.result.alteration}
                  title={`${pluralize(
                    'Alteration',
                    this.props.appStore.mainNumbers.result.alteration
                  )}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  isLoading={this.props.appStore.mainNumbers.isPending}
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
                  isLoading={this.props.appStore.mainNumbers.isPending}
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
          <div
            className="d-flex justify-content-center"
            style={{ width: '100%' }}
          >
            {levelTypeButtons}
          </div>
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
                  LEVEL_CLASSIFICATION[levelGadget.level] === LEVEL_TYPES.TX) ||
                (this.levelTypeSelected === LEVEL_TYPES.FDA &&
                  LEVEL_CLASSIFICATION[levelGadget.level] ===
                    LEVEL_TYPES.FDA)) && (
                <Col
                  xs={12}
                  sm={6}
                  lg={2}
                  key={levelGadget.level}
                  style={{ minHeight: 125 }}
                  className="px-0"
                >
                  <LevelButton
                    key={`${levelGadget.level}-button`}
                    level={levelGadget.level}
                    disabledTooltip={
                      levelGadget.level === LEVELS.FDAx1
                        ? FDA_L1_DISABLED_BTN_TOOLTIP
                        : ''
                    }
                    numOfGenes={this.getLevelNumber(levelGadget.combinedLevels)}
                    description={levelGadget.description}
                    title={
                      LEVEL_CLASSIFICATION[levelGadget.level] ===
                      LEVEL_TYPES.FDA
                        ? `FDA Level ${levelGadget.level
                            .toString()
                            .replace('FDAx', '')}`
                        : levelGadget.title
                    }
                    className="mb-2"
                    style={{
                      lineHeight:
                        levelGadget.level === LEVELS.Px3 ? '35px' : undefined,
                    }}
                    href={`${PAGE_ROUTE.ACTIONABLE_GENE}#levels=${
                      levelGadget.linkoutLevel
                    }&sections=${LEVEL_CLASSIFICATION[levelGadget.level]}`}
                    isLoading={
                      LEVEL_CLASSIFICATION[levelGadget.level] ===
                      LEVEL_TYPES.FDA
                        ? this.props.appStore.fdaNumbers.isPending
                        : this.levelNumbers.isPending
                    }
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
            <div className={'font-bold'}>
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
