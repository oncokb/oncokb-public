import React from 'react';
import { remoteData } from 'cbioportal-frontend-commons';
import {
  CancerGene,
  CuratedGene,
  Gene,
} from 'app/shared/api/generated/OncoKbAPI';
import { inject, observer } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import { Col, Row } from 'react-bootstrap';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import {
  filterByKeyword,
  getDefaultColumnDefinition,
  getPageTitle,
} from 'app/shared/utils/Utils';
import {
  PAGE_TITLE,
  MSK_IMPACT_TM,
  ONCOKB_TM,
  TABLE_COLUMN_KEY,
  PAGE_DESCRIPTION,
} from 'app/config/constants';
import AppStore from 'app/store/AppStore';
import oncokbClient from 'app/shared/api/oncokbClientInstance';
import { DownloadButtonWithPromise } from 'app/components/downloadButtonWithPromise/DownloadButtonWithPromise';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';
import WithSeparator from 'react-with-separator';
import GeneAliasesDescription from 'app/shared/texts/GeneAliasesDescription';
import CommonInfoIcon from 'app/shared/icons/InfoIcon';
import { Helmet } from 'react-helmet-async';

const InfoIcon = (props: { overlay: string | JSX.Element }) => {
  return (
    <CommonInfoIcon
      overlay={props.overlay}
      type="question"
      className={'ml-2'}
    />
  );
};

const getGeneTypeText = (geneType: Gene['geneType']) => {
  if (geneType === 'ONCOGENE_AND_TSG') {
    return 'Oncogene/TSG';
  } else if (geneType === 'ONCOGENE') {
    return 'Oncogene';
  } else if (geneType === 'TSG') {
    return 'TSG';
  } else if (geneType === 'NEITHER') {
    return 'Neither';
  } else {
    return 'Unknown';
  }
};

const getPanelGeneCount = (
  data: ExtendCancerGene[],
  key: keyof ExtendCancerGene
) => {
  return data.filter(cancerGene => cancerGene[key]).length;
};

type ExtendCancerGene = CancerGene & {
  numOfSources: number;
  annotated: boolean;
  geneTypeText: string;
};

@inject('appStore')
@observer
export default class CancerGenesPage extends React.Component<{
  appStore: AppStore;
}> {
  private fetchedDate = '11/17/2020';

  private columns: SearchColumn<ExtendCancerGene>[] = [
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.HUGO_SYMBOL),
      onFilter: (data: ExtendCancerGene, keyword) =>
        filterByKeyword(data.hugoSymbol, keyword) ||
        filterByKeyword(data.geneAliases.join(', '), keyword),
      Cell(props: { original: ExtendCancerGene }) {
        const hugoInfo = [
          props.original.annotated ? (
            <GenePageLink hugoSymbol={props.original.hugoSymbol} />
          ) : (
            `${props.original.hugoSymbol}`
          ),
        ];
        if (
          props.original.geneAliases &&
          props.original.geneAliases.length > 0
        ) {
          hugoInfo.push(
            <CommonInfoIcon
              overlay={
                <GeneAliasesDescription
                  geneAliases={props.original.geneAliases}
                />
              }
            />
          );
        }
        return <WithSeparator separator={' '}>{hugoInfo}</WithSeparator>;
      },
    },
    {
      id: 'oncokbAnnotated',
      Header: (
        <span>
          {ONCOKB_TM}
          <br />
          Annotated
        </span>
      ),
      accessor: 'oncokbAnnotated',
      style: { textAlign: 'center' },
      minWidth: 100,
      sortMethod: defaultSortMethod,
      Cell: (props: { original: ExtendCancerGene }) => {
        return props.original.oncokbAnnotated ? (
          <i className="fa fa-check" />
        ) : (
          <FeedbackIcon
            feedback={{
              type: FeedbackType.ANNOTATION,
              annotation: {
                gene: props.original.hugoSymbol,
              },
            }}
            appStore={this.props.appStore}
          />
        );
      },
    },
    {
      id: 'geneType',
      Header: (
        <>
          <span>Oncogene/TSG</span>
          <InfoIcon overlay={`As categorised by ${ONCOKB_TM}`} />
        </>
      ),
      minWidth: 140,
      accessor: 'geneTypeText',
      onFilter: (data: ExtendCancerGene, keyword) =>
        filterByKeyword(data.geneType, keyword),
      sortMethod: (a: string, b: string) => a.localeCompare(b),
    },
    {
      id: 'mSKImpact',
      Header: (props: {
        original: ExtendCancerGene;
        data: ExtendCancerGene[];
      }) => (
        <>
          <span>{MSK_IMPACT_TM}</span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a
                  href="https://www.mskcc.org/msk-impact"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {MSK_IMPACT_TM} panel
                </a>{' '}
                ({getPanelGeneCount(props.data, 'mSKImpact')} genes,{' '}
                {this.fetchedDate})
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
      },
    },
    {
      id: 'mSKHeme',
      Header: (props: {
        original: ExtendCancerGene;
        data: ExtendCancerGene[];
      }) => (
        <>
          <span>
            {MSK_IMPACT_TM}
            <br />
            Heme
          </span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a
                  href="https://www.mskcc.org/msk-impact"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {MSK_IMPACT_TM} Heme and HemePACT panels
                </a>{' '}
                ({getPanelGeneCount(props.data, 'mSKHeme')} genes,{' '}
                {this.fetchedDate})
              </span>
            }
          />
        </>
      ),
      style: { textAlign: 'center' },
      accessor: 'mSKHeme',
      minWidth: 120,
      sortable: true,
      Cell(props: { original: ExtendCancerGene }) {
        return props.original.mSKHeme ? <i className="fa fa-check" /> : '';
      },
    },
    {
      id: 'foundation',
      Header: (props: {
        original: ExtendCancerGene;
        data: ExtendCancerGene[];
      }) => (
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
                <a
                  href="https://assets.ctfassets.net/w98cd481qyp0/YqqKHaqQmFeqc5ueQk48w/0a34fcdaa3a71dbe460cdcb01cebe8ad/F1CDx_Technical_Specifications_072020.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FoundationOne CDx panel
                </a>{' '}
                ({getPanelGeneCount(props.data, 'foundation')} genes,{' '}
                {this.fetchedDate})
              </span>
            }
          />
        </>
      ),
      style: { textAlign: 'center' },
      accessor: 'foundation',
      minWidth: 100,
      sortable: true,
      Cell(props: { original: ExtendCancerGene }) {
        return props.original.foundation ? <i className="fa fa-check" /> : '';
      },
    },
    {
      id: 'foundationHeme',
      Header: (props: {
        original: ExtendCancerGene;
        data: ExtendCancerGene[];
      }) => (
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
                <a
                  href="https://assets.ctfassets.net/w98cd481qyp0/42r1cTE8VR4137CaHrsaen/baf91080cb3d78a52ada10c6358fa130/FoundationOne_Heme_Technical_Specifications.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FoundationOne Heme panel
                </a>{' '}
                ({getPanelGeneCount(props.data, 'foundationHeme')} genes,{' '}
                {this.fetchedDate})
              </span>
            }
          />
        </>
      ),
      minWidth: 120,
      style: { textAlign: 'center' },
      accessor: 'foundationHeme',
      sortable: true,
      Cell(props: { original: ExtendCancerGene }) {
        return props.original.foundationHeme ? (
          <i className="fa fa-check" />
        ) : (
          ''
        );
      },
    },
    {
      id: 'vogelstein',
      Header: (props: {
        original: ExtendCancerGene;
        data: ExtendCancerGene[];
      }) => (
        <>
          <span>Vogelstein et al. 2013</span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the published{' '}
                <a
                  href="https://science.sciencemag.org/content/339/6127/1546.full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vogelstein et al. Science, 2013
                </a>{' '}
                cancer gene list ({getPanelGeneCount(props.data, 'vogelstein')}{' '}
                genes, 03/29/2013)
              </span>
            }
          />
        </>
      ),
      style: { textAlign: 'center' },
      minWidth: 110,
      accessor: 'vogelstein',
      sortable: true,
      Cell(props: { original: ExtendCancerGene }) {
        return props.original.vogelstein ? <i className="fa fa-check" /> : '';
      },
    },
    {
      id: 'sangerCGC',
      Header: (props: {
        original: ExtendCancerGene;
        data: ExtendCancerGene[];
      }) => (
        <>
          <span>
            COSMIC Cancer Gene Census
            <br />
            Tier 1
          </span>
          <InfoIcon
            overlay={
              <span>
                Gene is part of the{' '}
                <a
                  href="https://cancer.sanger.ac.uk/cosmic/census?tier=1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  COSMIC Cancer Gene Census Tier 1
                </a>{' '}
                ({getPanelGeneCount(props.data, 'sangerCGC')} genes, v99 - 28th
                November 2023)
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
      },
    },
    {
      id: 'numOfSources',
      Header: () => '# of Sources',
      style: { textAlign: 'center' },
      sortable: true,
      onFilter: (data: ExtendCancerGene, keyword) =>
        filterByKeyword(data.numOfSources.toString(), keyword),
      accessor: 'numOfSources',
    },
  ];

  private readonly cancerGenes = remoteData<CancerGene[]>({
    await: () => [],
    async invoke() {
      return oncokbClient.utilsCancerGeneListGetUsingGET({});
    },
    default: [],
  });

  private readonly annotatedGenes = remoteData<CuratedGene[]>({
    await: () => [],
    async invoke() {
      return oncokbClient.utilsAllCuratedGenesGetUsingGET({});
    },
    default: [],
  });

  private readonly extendedCancerGene = remoteData<ExtendCancerGene[]>({
    await: () => [this.annotatedGenes, this.cancerGenes],
    invoke: () => {
      const annotatedGenes = this.annotatedGenes.result.reduce((acc, next) => {
        acc[next.entrezGeneId] = true;
        return acc;
      }, {} as { [entrezGeneId: number]: boolean });
      return Promise.resolve(
        this.cancerGenes.result.reduce((cancerGenesAcc, cancerGene) => {
          const sourceKeys: (keyof CancerGene)[] = [
            'oncokbAnnotated',
            'mSKImpact',
            'mSKHeme',
            'foundation',
            'foundationHeme',
            'vogelstein',
            'sangerCGC',
          ];
          cancerGenesAcc.push({
            ...cancerGene,
            numOfSources: sourceKeys.reduce((numOfSourcesAcc, next) => {
              if (cancerGene[next]) {
                numOfSourcesAcc++;
              }
              return numOfSourcesAcc;
            }, 0),
            geneTypeText: getGeneTypeText(cancerGene.geneType),
            annotated: !!annotatedGenes[cancerGene.entrezGeneId],
            geneAliases: cancerGene.geneAliases,
          });
          return cancerGenesAcc;
        }, [] as ExtendCancerGene[])
      );
    },
    default: [],
  });

  render() {
    return (
      <>
        <Helmet>
          <title>{getPageTitle(PAGE_TITLE.CANCER_GENES)}</title>
          <meta name="description" content={PAGE_DESCRIPTION.CANCER_GENES} />
        </Helmet>
        <div className="cancerGenes">
          <Row>
            <Col className="col-auto mr-auto">
              <h2>{ONCOKB_TM} Cancer Gene List</h2>
            </Col>
            <Col className="col-auto">
              <DownloadButtonWithPromise
                fileName={'cancerGeneList.tsv'}
                getDownloadData={() => {
                  return oncokbClient.utilsCancerGeneListTxtGetUsingGET({});
                }}
                buttonText="Cancer Gene List"
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <div>
                {this.cancerGenes.result.length} genes, last update{' '}
                {this.props.appStore.appInfo.result.dataVersion.date}
              </div>
              <div>
                The following genes are considered to be cancer genes by{' '}
                {ONCOKB_TM}, based on their inclusion in various different
                sequencing panels, the Sanger Cancer Gene Census, or{' '}
                <a href="http://science.sciencemag.org/content/339/6127/1546.full">
                  Vogelstein et al. (2013)
                </a>
                .
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <OncoKBTable
                data={this.extendedCancerGene.result}
                columns={this.columns}
                showPagination={true}
                minRows={1}
                loading={this.extendedCancerGene.isPending}
                defaultPageSize={10}
                defaultSorted={[
                  {
                    id: 'oncokbAnnotated',
                    desc: true,
                  },
                  {
                    id: 'numOfSources',
                    desc: true,
                  },
                  {
                    id: TABLE_COLUMN_KEY.HUGO_SYMBOL,
                    desc: false,
                  },
                ]}
              />
            </Col>
          </Row>
        </div>
      </>
    );
  }
}
