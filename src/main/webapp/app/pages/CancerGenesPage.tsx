import React from 'react';
import apiClient from '../shared/api/oncokbClientInstance';
import { remoteData, DefaultTooltip } from 'cbioportal-frontend-commons';
import { CancerGene, CuratedGene } from 'app/shared/api/generated/OncoKbAPI';
import ReactTable from 'react-table';
import { observer, inject } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import { SuggestCuration } from 'app/components/SuggestCuration';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import fileDownload from 'js-file-download';
import { action, observable, computed } from 'mobx';
import * as _ from 'lodash';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { Redirect } from 'react-router-dom';

const InfoIcon = (props: { overlay: string | JSX.Element }) => {
  return (
    <DefaultTooltip overlay={props.overlay}>
      <i className="fa fa-question-circle-o ml-2" />
    </DefaultTooltip>
  );
};

const getGeneType = (isOncogene: boolean, isTsg: boolean) => {
  if (isOncogene) {
    if (isTsg) {
      return 'Oncogene/TSG';
    } else {
      return 'Oncogene';
    }
  } else if (isTsg) {
    return 'TSG';
  }
  return '';
};

const getPanelGeneCount = (data: ExtendCancerGene[], key: keyof ExtendCancerGene) => {
  return data.filter(cancerGene => cancerGene[key]).length;
};

type ExtendCancerGene = CancerGene & {
  numOfSources: number;
  annotated: boolean;
  geneType: string;
};

@inject('authenticationStore')
@observer
export default class CancerGenesPage extends React.Component<{ authenticationStore: AuthenticationStore }> {
  @observable searchKeyword = '';
  @observable needsRedirect = false;

  private fetchedDate = '05/07/2019';

  private columns = [
    {
      id: 'hugoSymbol',
      Header: <span>Hugo Symbol</span>,
      accessor: 'hugoSymbol',
      minWidth: 100,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.annotated ? <GenePageLink hugoSymbol={props.original.hugoSymbol} /> : `${props.original.hugoSymbol}`;
      }
    },
    {
      id: 'oncokbAnnotated',
      Header: (
        <span>
          OncoKB
          <br />
          Annotated
        </span>
      ),
      accessor: 'oncokbAnnotated',
      style: { textAlign: 'center' },
      minWidth: 100,
      sortMethod: defaultSortMethod,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.oncokbAnnotated ? <i className="fa fa-check" /> : <SuggestCuration suggestion={props.original.hugoSymbol} />;
      }
    },
    {
      id: 'geneType',
      Header: (
        <>
          <span>Oncogene/TSG</span>
          <InfoIcon overlay={'As categorised by OncoKB'} />
        </>
      ),
      minWidth: 120,
      accessor: 'geneType',
      sortMethod: (a: string, b: string) => a.localeCompare(b)
    },
    {
      id: 'mSKImpact',
      Header: (props: { original: ExtendCancerGene; data: ExtendCancerGene[] }) => (
        <>
          <span>MSK-IMPACT</span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a href="https://www.mskcc.org/msk-impact" target="_blank">
                  MSK-IMPACT panel
                </a>{' '}
                ({getPanelGeneCount(props.data, 'mSKImpact')} genes, {this.fetchedDate})
              </span>
            }
          />
        </>
      ),
      minWidth: 120,
      accessor: 'mSKImpact',
      style: { textAlign: 'center' },
      sortable: true,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.mSKImpact ? <i className="fa fa-check" /> : '';
      }
    },
    {
      id: 'mSKHeme',
      Header: (props: { original: ExtendCancerGene; data: ExtendCancerGene[] }) => (
        <>
          <span>
            MSK-IMPACT
            <br />
            Heme
          </span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a href="https://www.mskcc.org/msk-impact" target="_blank">
                  MSK-IMPACT Heme and HemePACT panels
                </a>{' '}
                ({getPanelGeneCount(props.data, 'mSKHeme')} genes, {this.fetchedDate})
              </span>
            }
          />
        </>
      ),
      style: { textAlign: 'center' },
      accessor: 'mSKHeme',
      sortable: true,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.mSKHeme ? <i className="fa fa-check" /> : '';
      }
    },
    {
      id: 'foundation',
      Header: (props: { original: ExtendCancerGene; data: ExtendCancerGene[] }) => (
        <>
          <span>
            Foundation One
            <br />
            CDx
          </span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a href="https://www.accessdata.fda.gov/cdrh_docs/pdf17/P170019C.pdf" target="_blank">
                  FoundationOne CDx panel
                </a>{' '}
                ({getPanelGeneCount(props.data, 'foundation')} genes, {this.fetchedDate})
              </span>
            }
          />
        </>
      ),
      style: { textAlign: 'center' },
      accessor: 'foundation',
      minWidth: 150,
      sortable: true,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.foundation ? <i className="fa fa-check" /> : '';
      }
    },
    {
      id: 'foundationHeme',
      Header: (props: { original: ExtendCancerGene; data: ExtendCancerGene[] }) => (
        <>
          <span>
            Foundation One
            <br />
            Heme
          </span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a href="https://www.foundationmedicineasia.com/dam/assets/pdf/FOneHeme_Current_GeneList.pdf" target="_blank">
                  FoundationOne Heme panel
                </a>{' '}
                ({getPanelGeneCount(props.data, 'foundationHeme')} genes, {this.fetchedDate})
              </span>
            }
          />
        </>
      ),
      minWidth: 150,
      style: { textAlign: 'center' },
      accessor: 'foundationHeme',
      sortable: true,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.foundationHeme ? <i className="fa fa-check" /> : '';
      }
    },
    {
      id: 'vogelstein',
      Header: (props: { original: ExtendCancerGene; data: ExtendCancerGene[] }) => (
        <>
          <span>Vogelstein et al. 2013</span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the published{' '}
                <a href="https://science.sciencemag.org/content/339/6127/1546.full" target="_blank">
                  Vogelstein et al. Science, 2013
                </a>{' '}
                cancer gene list ({getPanelGeneCount(props.data, 'vogelstein')} genes, 03/29/2013)
              </span>
            }
          />
        </>
      ),
      style: { textAlign: 'center' },
      minWidth: 200,
      accessor: 'vogelstein',
      sortable: true,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.vogelstein ? <i className="fa fa-check" /> : '';
      }
    },
    {
      id: 'sangerCGC',
      Header: (props: { original: ExtendCancerGene; data: ExtendCancerGene[] }) => (
        <>
          <span>
            Cancer Gene Census
            <br />
            Tier 1
          </span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a href="https://cancer.sanger.ac.uk/cosmic/census?tier=1" target="_blank">
                  Cancer Gene Census Tier 1
                </a>{' '}
                ({getPanelGeneCount(props.data, 'sangerCGC')} genes, v89 - 15th May 2019)
              </span>
            }
          />
        </>
      ),
      style: { textAlign: 'center' },
      minWidth: 160,
      accessor: 'sangerCGC',
      sortable: true,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.sangerCGC ? <i className="fa fa-check" /> : '';
      }
    },
    {
      id: 'numOfSources',
      Header: () => '# of Sources',
      style: { textAlign: 'center' },
      sortable: true,
      accessor: 'numOfSources'
    }
  ];

  private readonly cancerGenes = remoteData<CancerGene[]>({
    await: () => [],
    invoke: async () => {
      return apiClient.utilsCancerGeneListGetUsingGET({});
    },
    default: []
  });

  private readonly annotatedGenes = remoteData<CuratedGene[]>({
    await: () => [],
    invoke: async () => {
      return apiClient.utilsAllCuratedGenesGetUsingGET({});
    },
    default: []
  });

  private readonly extendedCancerGene = remoteData<ExtendCancerGene[]>({
    await: () => [this.annotatedGenes, this.cancerGenes],
    invoke: async () => {
      const annotatedGenes = _.reduce(
        this.annotatedGenes.result,
        (acc, next) => {
          acc[next.entrezGeneId] = true;
          return acc;
        },
        {} as { [entrezGeneId: number]: boolean }
      );
      return Promise.resolve(
        _.reduce(
          this.cancerGenes.result,
          (cancerGenesAcc, cancerGene) => {
            const sourceKeys: (keyof CancerGene)[] = [
              'oncokbAnnotated',
              'mSKImpact',
              'mSKHeme',
              'foundation',
              'foundationHeme',
              'vogelstein',
              'sangerCGC'
            ];
            cancerGenesAcc.push({
              ...cancerGene,
              numOfSources: _.reduce(
                sourceKeys,
                (numOfSourcesAcc, next) => {
                  if (cancerGene[next]) {
                    numOfSourcesAcc++;
                  }
                  return numOfSourcesAcc;
                },
                0
              ),
              geneType: getGeneType(cancerGene.oncogene, cancerGene.tsg),
              annotated: !!annotatedGenes[cancerGene.entrezGeneId]
            });
            return cancerGenesAcc;
          },
          [] as ExtendCancerGene[]
        )
      );
    },
    default: []
  });

  @computed
  get filteredData() {
    return this.extendedCancerGene.result.filter(extendedCancerGene => {
      return (
        extendedCancerGene.hugoSymbol.toLowerCase().startsWith(this.searchKeyword) ||
        extendedCancerGene.geneType.toLowerCase().startsWith(this.searchKeyword) ||
        extendedCancerGene.numOfSources
          .toString()
          .toLowerCase()
          .startsWith(this.searchKeyword)
      );
    });
  }

  @action
  downloadData() {
    if (this.props.authenticationStore.isUserAuthenticated) {
      const data = apiClient.utilsAllCuratedGenesGetUsingGET({});
      if (data) {
        fileDownload(data.toString(), 'cancerGeneList.txt');
      }
    } else {
      this.needsRedirect = true;
    }
  }

  render() {
    if (this.needsRedirect) {
      return (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: 'dataAccess' }
          }}
        />
      );
    }
    return (
      <div className="cancerGenes">
        <Row>
          <Col className="col-auto mr-auto">
            <h2>OncoKB Cancer Gene List</h2>
          </Col>
          <Col className="col-auto">
            <Button size={'sm'} className={classnames('ml-1')} onClick={() => this.downloadData()}>
              <i className="fa fa-cloud-download" /> Cancer Gene List
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <div>
              {this.cancerGenes.result.length} genes, last update {`***`}
            </div>
            <div>
              The following genes are considered to be cancer genes by OncoKB, based on their inclusion in various different sequencing
              panels, the Sanger Cancer Gene Census, or{' '}
              <a href="http://science.sciencemag.org/content/339/6127/1546.full">Vogelstein et al. (2013)</a>.
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="col-auto ml-auto">
            <input
              onChange={(event: any) => {
                this.searchKeyword = event.target.value.toLowerCase();
              }}
              className="form-control input-sm"
              type="text"
              placeholder="Search ..."
            />
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <ReactTable
              data={this.filteredData}
              loading={this.extendedCancerGene.isPending}
              columns={this.columns}
              showPagination={true}
              defaultSortDesc={true}
              defaultSorted={[
                {
                  id: 'numOfSources',
                  desc: true
                },
                {
                  id: 'hugoSymbol',
                  desc: false
                },
                {
                  id: 'oncokbAnnotated',
                  desc: true
                }
              ]}
              className="-striped -highlight"
            />
          </Col>
        </Row>
      </div>
    );
  }
}
