import React from 'react';
import { DefaultTooltip, remoteData } from 'cbioportal-frontend-commons';
import { CancerGene, CuratedGene } from 'app/shared/api/generated/OncoKbAPI';
import { inject, observer } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import { SuggestCuration } from 'app/components/SuggestCuration';
import { Col, Row } from 'react-bootstrap';
import * as _ from 'lodash';
import OncoKBTable, { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword, getDefaultColumnDefinition } from 'app/shared/utils/Utils';
import { TABLE_COLUMN_KEY } from 'app/config/constants';
import AppStore from 'app/store/AppStore';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import oncokbClient from 'app/shared/api/oncokbClientInstance';

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

@inject('appStore')
@observer
export default class CancerGenesPage extends React.Component<{ appStore: AppStore }> {
  private fetchedDate = '05/07/2019';

  private columns: SearchColumn<ExtendCancerGene>[] = [
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.HUGO_SYMBOL),
      onFilter: (data: ExtendCancerGene, keyword) => filterByKeyword(data.hugoSymbol, keyword),
      Cell(props: { original: ExtendCancerGene }) {
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
      Cell(props: { original: ExtendCancerGene }) {
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
      onFilter: (data: ExtendCancerGene, keyword) => filterByKeyword(data.geneType, keyword),
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
                <a href="https://www.mskcc.org/msk-impact" target="_blank" rel="noopener noreferrer">
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
      Cell(props: { original: ExtendCancerGene }) {
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
                <a href="https://www.mskcc.org/msk-impact" target="_blank" rel="noopener noreferrer">
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
      Cell(props: { original: ExtendCancerGene }) {
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
                <a href="https://www.accessdata.fda.gov/cdrh_docs/pdf17/P170019C.pdf" target="_blank" rel="noopener noreferrer">
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
      Cell(props: { original: ExtendCancerGene }) {
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
                <a href="https://www.foundationmedicineasia.com/dam/assets/pdf/FOneHeme_Current_GeneList.pdf" target="_blank" rel="noopener noreferrer">
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
      Cell(props: { original: ExtendCancerGene }) {
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
                <a href="https://science.sciencemag.org/content/339/6127/1546.full" target="_blank" rel="noopener noreferrer">
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
      Cell(props: { original: ExtendCancerGene }) {
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
                <a href="https://cancer.sanger.ac.uk/cosmic/census?tier=1" target="_blank" rel="noopener noreferrer">
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
      Cell(props: { original: ExtendCancerGene }) {
        return props.original.sangerCGC ? <i className="fa fa-check" /> : '';
      }
    },
    {
      id: 'numOfSources',
      Header: () => '# of Sources',
      style: { textAlign: 'center' },
      sortable: true,
      onFilter: (data: ExtendCancerGene, keyword) => filterByKeyword(data.numOfSources.toString(), keyword),
      accessor: 'numOfSources'
    }
  ];

  private readonly cancerGenes = remoteData<CancerGene[]>({
    await: () => [],
    async invoke() {
      return oncokbClient.utilsCancerGeneListGetUsingGET({});
    },
    default: []
  });

  private readonly annotatedGenes = remoteData<CuratedGene[]>({
    await: () => [],
    async invoke() {
      return oncokbClient.utilsAllCuratedGenesGetUsingGET({});
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

  render() {
    return (
      <div className="cancerGenes">
        <Row>
          <Col className="col-auto mr-auto">
            <h2>OncoKB Cancer Gene List</h2>
          </Col>
          <Col className="col-auto">
            <AuthDownloadButton
              fileName="cancerGeneList.tsv"
              getDownloadData={() => oncokbClient.utilsCancerGeneListTxtGetUsingGET({})}
              buttonText="Cancer Gene List"
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <div>
              {this.cancerGenes.result.length} genes, last update {this.props.appStore.appInfo.result.dataVersion.date}
            </div>
            <div>
              The following genes are considered to be cancer genes by OncoKB, based on their inclusion in various different sequencing
              panels, the Sanger Cancer Gene Census, or{' '}
              <a href="http://science.sciencemag.org/content/339/6127/1546.full">Vogelstein et al. (2013)</a>.
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <OncoKBTable
              data={this.extendedCancerGene.result}
              columns={this.columns}
              loading={this.extendedCancerGene.isPending}
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
            />
          </Col>
        </Row>
      </div>
    );
  }
}
