import * as React from 'react';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from '../shared/api/oncokbPrivateClientInstance';
import {
  Gene,
  LevelNumber,
  TypeaheadSearchResp,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { Row, Col } from 'react-bootstrap';
import oncokbImg from 'content/images/oncokb.png';
import { HomePageNumber } from 'app/components/HomePageNumber';
import pluralize from 'pluralize';
import { LEVEL_BUTTON_DESCRIPTION, PAGE_ROUTE } from 'app/config/constants';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { levelOfEvidence2Level } from 'app/shared/utils/Utils';
import { RouterStore } from 'mobx-react-router';
import { CitationText } from 'app/components/CitationText';
import _ from 'lodash';
import AppStore from 'app/store/AppStore';
import OncoKBSearch from 'app/components/oncokbSearch/OncoKBSearch';

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

  private levelGadgets: {
    title?: string;
    description: string;
    level: string;
    linkoutLevel: string;
    combinedLevels: string[];
  }[] = [
    {
      level: '1',
      description: LEVEL_BUTTON_DESCRIPTION['1'],
      linkoutLevel: '1',
      combinedLevels: ['1'],
    },
    {
      level: '2',
      description: LEVEL_BUTTON_DESCRIPTION['2'],
      linkoutLevel: '2',
      combinedLevels: ['2'],
    },
    {
      level: '3',
      description: LEVEL_BUTTON_DESCRIPTION['3'],
      linkoutLevel: '3',
      combinedLevels: ['3'],
    },
    {
      level: '4',
      description: LEVEL_BUTTON_DESCRIPTION['4'],
      linkoutLevel: '4',
      combinedLevels: ['4'],
    },
    {
      level: 'R1',
      description: 'Resistance',
      title: 'Level R1/R2',
      linkoutLevel: 'R1,R2',
      combinedLevels: ['R1', 'R2'],
    },
  ];

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

  public render() {
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
        <Row className="mb-5">
          <Col xs={0} lg={1}></Col>
          {this.levelGadgets.map(levelGadget => (
            <Col xs={12} sm={6} lg={2} key={levelGadget.level} className="px-0">
              <LevelButton
                level={levelGadget.level}
                numOfGenes={this.getLevelNumber(levelGadget.combinedLevels)}
                description={levelGadget.description}
                title={levelGadget.title}
                className="mb-2"
                href={`/actionableGenes#levels=${levelGadget.linkoutLevel}`}
              />
            </Col>
          ))}
          <Col xs={0} lg={1}></Col>
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
