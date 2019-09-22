import * as React from 'react';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from '../shared/api/oncokbPrivateClientInstance';
import { LevelNumber, MainNumber, TypeaheadSearchResp } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import autobind from 'autobind-decorator';
import { Row, Col } from 'react-bootstrap';
import oncokbImg from '../resources/images/oncokb.png';
import { HomePageNumber } from 'app/components/HomePageNumber';
import pluralize from 'pluralize';
import { LEVELS } from 'app/config/constants';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { levelOfEvidence2Level } from 'app/shared/utils/Utils';
import { RouterStore } from 'mobx-react-router';
import { CitationText } from 'app/components/CitationText';
import _ from 'lodash';

interface IHomeProps {
  content: string;
  routing: RouterStore;
}

@inject('routing')
@observer
class HomePage extends React.Component<IHomeProps> {
  @observable keyword: string;

  readonly searchOptions = remoteData<TypeaheadSearchResp[]>({
    await: () => [],
    invoke: async () => {
      return oncokbPrivateClient.searchTypeAheadGetUsingGET({
        query: this.keyword
      });
    },
    onError: () => {
      // TODO:
    },
    default: []
  });

  readonly mainNumbers = remoteData<MainNumber>({
    await: () => [],
    invoke: async () => {
      return oncokbPrivateClient.utilsNumbersMainGetUsingGET({});
    },
    default: {
      gene: 0,
      alteration: 0,
      tumorType: 0,
      drug: 0,
      level: []
    }
  });

  readonly levelNumbers = remoteData<{ [level: string]: LevelNumber }>({
    await: () => [],
    invoke: async () => {
      const levelNumber = await oncokbPrivateClient.utilsNumbersLevelsGetUsingGET({});
      return Promise.resolve(
        _.reduce(
          levelNumber,
          (acc, next) => {
            acc[levelOfEvidence2Level(next.level)] = next;
            return acc;
          },
          {} as { [level: string]: LevelNumber }
        )
      );
    },
    default: {}
  });

  @autobind
  @action
  onSearch(keyword: string) {
    this.keyword = keyword;
  }

  levelOnClick(level: string) {
    this.props.routing.history.push(`/actionableGenes#level=${level}`);
  }

  getLevelNumber(level: string) {
    return this.levelNumbers.result[level] ? this.levelNumbers.result[level].genes.length : 0;
  }

  public render() {
    return (
      <div className="home">
        <Row className="mb-5">
          <Col md={6} className={'mx-auto d-flex flex-column align-items-center '}>
            <img src={oncokbImg} className="home-page-logo" />
            <span className="home-page-logo-title">Precision Oncology Knowledge Base</span>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col md={8} className={'mx-auto'}>
            <Row>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber number={this.mainNumbers.result.gene} title={`${pluralize('Gene', this.mainNumbers.result.gene)}`} />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  number={this.mainNumbers.result.alteration}
                  title={`${pluralize('Alteration', this.mainNumbers.result.alteration)}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  number={this.mainNumbers.result.tumorType}
                  title={`${pluralize('Tumor Type', this.mainNumbers.result.tumorType)}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber number={this.mainNumbers.result.drug} title={`${pluralize('Drug', this.mainNumbers.result.drug)}`} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col md={8} className={'mx-auto'}>
            <AsyncTypeahead
              bsSize={'lg'}
              id={'mainSearch'}
              isLoading={this.searchOptions.isPending}
              options={this.searchOptions.result}
              labelKey={(option: TypeaheadSearchResp) => `${option.link} ${option.annotation}`}
              onSearch={this.onSearch}
              placeholder="Search Gene / Alteration / Drug"
              renderMenuItemChildren={(option: TypeaheadSearchResp, props) => <div>{option.link}</div>}
            />
          </Col>
        </Row>
        <Row className="mb-5">
          {LEVELS.map(level => (
            <Col xs={12} sm={6} lg={2} key={level}>
              <LevelButton
                level={level}
                numOfGenes={this.getLevelNumber(level)}
                className="mb-2"
                href={`/actionableGenes#levels=${level}`}
              />
            </Col>
          ))}
        </Row>
        <Row className="mb-3">
          <Col className={'d-flex justify-content-center'}>
            <CitationText boldLinkout={true} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default HomePage;
