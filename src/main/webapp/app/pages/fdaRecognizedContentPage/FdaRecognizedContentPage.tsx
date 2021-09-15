import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { DefaultTooltip, remoteData } from 'cbioportal-frontend-commons';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import {
  Alteration,
  Evidence,
  FdaAlteration,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import Select from 'react-select';
import _ from 'lodash';
import {
  FdaLevelIcon,
  getDefaultColumnDefinition,
} from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import pluralize from 'pluralize';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import { Else, If, Then } from 'react-if';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  COMPONENT_PADDING,
  DEFAULT_REFERENCE_GENOME,
  DOCUMENT_TITLES,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVELS,
  LG_TABLE_FIXED_HEIGHT,
  PAGE_ROUTE,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
} from 'app/config/constants';
import { RouterStore } from 'mobx-react-router';
import AuthenticationStore from 'app/store/AuthenticationStore';
import * as QueryString from 'query-string';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import DocumentTitle from 'react-document-title';
import { COLOR_BLUE } from 'app/config/theme';
import WithSeparator from 'react-with-separator';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import LevelSelectionRow from 'app/pages/actionableGenesPage/LevelSelectionRow';
import { Version } from 'app/pages/LevelOfEvidencePage';
import { Link } from 'react-router-dom';

type Treatment = {
  level: string;
  hugoSymbol: string;
  alterations: Alteration[];
  cancerTypes: string[];
  treatments: {}[];
  uniqueDrugs: string[];
  drugs: string;
};

type FdaRecognizedContentPageProps = {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
};

type HashQueries = {
  levels?: string[];
  hugoSymbol?: string;
  tumorType?: string;
  refGenome?: REFERENCE_GENOME;
};

type EvidencesByLevel = { [level: string]: Evidence[] };
@inject('routing', 'authenticationStore')
@observer
export default class FdaRecognizedContentPage extends React.Component<
  FdaRecognizedContentPageProps,
  any
> {
  @observable relevantTumorTypeSearchKeyword = '';
  @observable geneSearchKeyword = '';
  @observable refGenome = DEFAULT_REFERENCE_GENOME;
  @observable levelSelected = this.initLevelSelected();
  @observable collapseStatus = {
    [LEVEL_TYPES.TX]: true,
    [LEVEL_TYPES.DX]: false,
    [LEVEL_TYPES.PX]: false,
  };
  @observable collapseInit = false;

  readonly allMainTypes = remoteData<string[]>({
    await: () => [],
    async invoke() {
      const result = await privateClient.utilsTumorTypesGetUsingGET({});
      return _.chain(result)
        .filter(cancerType => cancerType.level >= 0)
        .map(cancerType => cancerType.mainType)
        .uniq()
        .value()
        .sort();
    },
    default: [],
  });

  readonly allTumorTypes = remoteData<string[]>({
    await: () => [this.allMainTypes, this.allFdaAlterations],
    invoke: async () => {
      let allTumorTypes: string[] = _.uniq(
        this.allMainTypes.result
          .filter(mainType => !mainType.endsWith('NOS'))
          .map(mainType => mainType)
      );

      this.allFdaAlterations.result.forEach(fdaVariant => {
        allTumorTypes = allTumorTypes.concat(fdaVariant.cancerType);
      });

      return Promise.resolve(_.uniq(allTumorTypes));
    },
    default: [],
  });

  readonly allFdaAlterations = remoteData<FdaAlteration[]>({
    await: () => [],
    async invoke() {
      return await privateClient.utilsFdaAlterationsGetUsingGET({});
    },
    default: [],
  });

  readonly relevantTumorTypes = remoteData<string[]>({
    await: () => [this.allTumorTypes],
    invoke: async () => {
      let result = [];
      if (this.relevantTumorTypeSearchKeyword) {
        const allRelevantTumorTypes = await privateClient.utilRelevantTumorTypesGetUsingGET(
          {
            tumorType: this.relevantTumorTypeSearchKeyword,
          }
        );
        result = allRelevantTumorTypes.map(tumorType => {
          return tumorType.code ? tumorType.subtype : tumorType.mainType;
        });
      } else {
        result = this.allTumorTypes.result;
      }
      return result.sort();
    },
    default: [],
  });

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: Readonly<FdaRecognizedContentPageProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING,
          }) as HashQueries;
          if (queryStrings.levels) {
            this.levelSelected = this.initLevelSelected();
            (_.isArray(queryStrings.levels)
              ? queryStrings.levels
              : [queryStrings.levels]
            ).forEach(level => {
              this.levelSelected[level] = true;
            });
            if (!this.collapseInit) {
              (_.isArray(queryStrings.levels)
                ? queryStrings.levels
                : [queryStrings.levels]
              ).forEach(level => {
                this.collapseStatus[LEVEL_CLASSIFICATION[level]] = true;
              });
              this.collapseInit = true;
            }
          }
          if (queryStrings.hugoSymbol) {
            this.geneSearchKeyword = queryStrings.hugoSymbol;
          }
          if (queryStrings.tumorType) {
            this.relevantTumorTypeSearchKeyword = queryStrings.tumorType;
          }
          if (queryStrings.refGenome) {
            this.refGenome = queryStrings.refGenome;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.hashQueries,
        newHash => {
          const parsedHashQueryString = QueryString.stringify(newHash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING,
          });
          window.location.hash = parsedHashQueryString;
        }
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  initLevelSelected(): { [level: string]: boolean } {
    return _.reduce(
      LEVELS,
      (acc, level) => {
        acc[level] = false;
        return acc;
      },
      {} as { [level: string]: boolean }
    );
  }

  @computed
  get hashQueries() {
    const queryString: Partial<HashQueries> = {};
    if (this.selectedLevels.length > 0) {
      queryString.levels = this.selectedLevels;
    }
    if (this.geneSearchKeyword) {
      queryString.hugoSymbol = this.geneSearchKeyword;
    }
    if (this.relevantTumorTypeSearchKeyword) {
      queryString.tumorType = this.relevantTumorTypeSearchKeyword;
    }
    return queryString;
  }

  @computed
  get filteredFdaAlterations(): FdaAlteration[] {
    return this.allFdaAlterations.result.filter(fdaVariant => {
      let match = true;
      if (
        this.geneSearchKeyword &&
        fdaVariant.alteration.gene.hugoSymbol !== this.geneSearchKeyword
      ) {
        match = false;
      }
      if (
        this.relevantTumorTypeSearchKeyword &&
        this.relevantTumorTypes.result.filter(
          tumorType => tumorType === fdaVariant.cancerType
        ).length === 0
      ) {
        match = false;
      }
      if (
        this.selectedLevels.length > 0 &&
        !this.selectedLevels.includes(fdaVariant.level)
      ) {
        match = false;
      }
      return match;
    });
  }

  @computed
  get secondLayerFilterEnabled() {
    return !!this.geneSearchKeyword || !!this.relevantTumorTypeSearchKeyword;
  }

  @computed
  get fdaVariantsAreFiltered() {
    return this.selectedLevels.length > 0 || this.secondLayerFilterEnabled;
  }

  @computed
  get filteredGenes() {
    return _.uniq(
      this.filteredFdaAlterations.map(
        variant => variant.alteration.gene.hugoSymbol
      )
    ).sort();
  }

  @computed
  get filteredCancerTypes() {
    return _.uniq(
      this.filteredFdaAlterations.map(variant => variant.cancerType)
    );
  }

  @computed
  get levelNumbers() {
    const levelNumbers = _.reduce(
      LEVELS,
      (acc, level) => {
        acc[level] = [];
        return acc;
      },
      {} as { [level: string]: string[] }
    );

    // when there is no second layer filtering enabled, we allow to choose multiple levels
    const fdaVariantSource = this.secondLayerFilterEnabled
      ? this.filteredFdaAlterations
      : this.allFdaAlterations.result;
    fdaVariantSource.map(variant => {
      if (levelNumbers[variant.level]) {
        levelNumbers[variant.level].push(variant.alteration.gene.hugoSymbol);
      }
    });
    return _.reduce(
      levelNumbers,
      (acc, next, level) => {
        acc[level] = _.uniq(next).length;
        return acc;
      },
      {} as { [level: string]: number }
    );
  }

  @computed
  get filteredLevels() {
    return _.uniq(
      this.filteredFdaAlterations.map(fdaVariant => fdaVariant.level)
    );
  }

  @computed
  get data() {
    return null;
  }

  @computed
  get selectedLevels() {
    return _.reduce(
      this.levelSelected,
      (acc, selected, level) => {
        if (selected) {
          acc.push(level);
        }
        return acc;
      },
      [] as string[]
    );
  }

  @computed
  get tumorTypeSelectValue() {
    return this.relevantTumorTypeSearchKeyword
      ? {
          label: this.relevantTumorTypeSearchKeyword,
          value: this.relevantTumorTypeSearchKeyword,
        }
      : null;
  }

  @computed
  get geneSelectValue() {
    return this.geneSearchKeyword
      ? {
          label: this.geneSearchKeyword,
          value: this.geneSearchKeyword,
        }
      : null;
  }

  @autobind
  @action
  updateLevelSelection(levelOfEvidence: string) {
    this.levelSelected[levelOfEvidence] = !this.levelSelected[levelOfEvidence];
  }

  @autobind
  @action
  updateCollapseStatus(levelType: string) {
    this.collapseStatus[levelType] = !this.collapseStatus[levelType];
  }

  @autobind
  @action
  clearFilters() {
    this.levelSelected = this.initLevelSelected();
    this.relevantTumorTypeSearchKeyword = '';
    this.geneSearchKeyword = '';
  }

  @autobind
  downloadAssociation() {
    const header = [
      ['FDA Level', 'Gene', 'Alteration', 'Cancer Type'].join('\t'),
    ];
    const content: string[] = [];
    this.filteredFdaAlterations.forEach(item => {
      content.push(
        [
          item.level.replace('FDAx', ''),
          item.alteration.gene.hugoSymbol,
          item.alteration.name,
          item.cancerType,
        ].join('\t')
      );
    });
    content.sort();
    return Promise.resolve(header.concat(content).join('\n'));
  }

  getAlterationCell(hugoSymbol: string, alterations: Alteration[]) {
    const linkedAlts = alterations.map<React.ReactNode>(
      (alteration, index: number) => (
        <>
          <AlterationPageLink
            key={index}
            hugoSymbol={hugoSymbol}
            alteration={alteration.name}
            alterationRefGenomes={
              alteration.referenceGenomes as REFERENCE_GENOME[]
            }
          />
        </>
      )
    );
    if (linkedAlts.length > 5) {
      return (
        <span>
          {linkedAlts[0]} and{' '}
          <DefaultTooltip
            overlay={
              <div style={{ maxWidth: '400px' }}>
                <WithSeparator separator={', '}>{linkedAlts}</WithSeparator>
              </div>
            }
            overlayStyle={{
              opacity: 1,
            }}
            placement="right"
            destroyTooltipOnHide={true}
          >
            <span
              style={{
                textDecoration: 'underscore',
                color: COLOR_BLUE,
              }}
            >
              {linkedAlts.length - 1} other alterations
            </span>
          </DefaultTooltip>
        </span>
      );
    } else {
      return <WithSeparator separator={', '}>{linkedAlts}</WithSeparator>;
    }
  }

  private columns = [
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
      Header: <span>FDA Level</span>,
      accessor: 'level',
      minWidth: 120,
      width: 120,
      Cell(props: any) {
        return (
          <div className={'my-1 d-flex justify-content-center'}>
            <FdaLevelIcon level={props.original.level} withDescription={true} />
          </div>
        );
      },
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.HUGO_SYMBOL),
      style: { whiteSpace: 'normal' },
      accessor: 'alteration.gene.hugoSymbol',
      Cell(props: { original: FdaAlteration }) {
        return (
          <GenePageLink
            hugoSymbol={props.original.alteration.gene.hugoSymbol}
            selectedTab={ANNOTATION_PAGE_TAB_KEYS.FDA}
          />
        );
      },
    },
    {
      id: TABLE_COLUMN_KEY.ALTERATIONS,
      Header: <span>Alteration</span>,
      accessor: 'alteration.name',
      minWidth: 200,
      style: { whiteSpace: 'normal' },
      defaultSortDesc: false,
      sortMethod(a: string, b: string) {
        if (a && b) {
          return a.localeCompare(b);
        } else {
          return 0;
        }
      },
      Cell: (props: { original: FdaAlteration }) => {
        return (
          <div style={{ display: 'block' }}>
            {' '}
            {this.getAlterationCell(props.original.alteration.gene.hugoSymbol, [
              props.original.alteration,
            ])}
          </div>
        );
      },
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CANCER_TYPES),
      minWidth: 300,
      accessor: 'cancerType',
      sortMethod(a: string, b: string) {
        if (a && b) {
          return a.localeCompare(b);
        } else {
          return 0;
        }
      },
      Cell(props: { original: FdaAlteration }) {
        return <span>{props.original.cancerType}</span>;
      },
    },
  ];

  render() {
    const levelSelectionSection = [
      <LevelSelectionRow
        levelType={LEVEL_TYPES.FDA}
        collapseStatus={{
          [LEVEL_TYPES.FDA]: true,
        }}
        levelNumbers={this.levelNumbers}
        levelSelected={this.levelSelected}
        updateCollapseStatus={this.updateCollapseStatus}
        updateLevelSelection={this.updateLevelSelection}
      />,
    ];

    return (
      <DocumentTitle title={DOCUMENT_TITLES.ACTIONABLE_GENES}>
        <If
          condition={
            this.allTumorTypes.isComplete && this.allFdaAlterations.isComplete
          }
        >
          <Then>
            {levelSelectionSection}
            <Row
              style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
              className={'mb-2'}
            >
              <Col className={classnames(...COMPONENT_PADDING)} lg={6} xs={12}>
                <Select
                  value={this.geneSelectValue}
                  placeholder={`${
                    this.filteredGenes.length
                  } actionable ${pluralize('gene', this.filteredGenes.length)}`}
                  options={this.filteredGenes.map(hugoSymbol => {
                    return {
                      value: hugoSymbol,
                      label: hugoSymbol,
                    };
                  })}
                  isClearable={true}
                  onChange={(selectedOption: any) =>
                    (this.geneSearchKeyword = selectedOption
                      ? selectedOption.label
                      : '')
                  }
                />
              </Col>
              <Col className={classnames(...COMPONENT_PADDING)} lg={6} xs={12}>
                <CancerTypeSelect
                  tumorType={this.relevantTumorTypeSearchKeyword}
                  onChange={(selectedOption: any) =>
                    (this.relevantTumorTypeSearchKeyword = selectedOption
                      ? selectedOption.value
                      : '')
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <>
                  <p>
                    While the intended audience for OncoKB is primarily clinical
                    oncologists, molecular pathologists and cancer researchers,
                    NGS-test developers may also rely on OncoKB to support the
                    validity of their tests. The FDA regulates the approval of
                    tumor-profiling and companion diagnostic tests. Therefore,
                    the FDA introduced a process to recognize human variant
                    databases, such as OncoKB, to credential the robustness and
                    transparency of databases involved in variant evaluation.
                  </p>
                  <p>
                    Below is the FDA-recognized content(pending approval) in
                    OncoKB, including tumor type-specific alterations and their
                    corresponding{' '}
                    <Link
                      to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA_NGS}`}
                    >
                      FDA level of evidence
                    </Link>
                    . The assigned FDA level of evidence is based on these
                    alterations being tested in Formalin Fixed Paraffin Embedded
                    (FFPE) specimen types, except in cases where specimen type
                    is not specified.
                  </p>
                </>
              </Col>
            </Row>
            <Row className={'mb-2'}>
              <Col className="d-flex align-items-center">
                <span>
                  <b>
                    {`Showing ${
                      this.filteredFdaAlterations.length
                    } clinical  ${pluralize(
                      'implication',
                      this.filteredFdaAlterations.length
                    )}`}
                    {` (${this.filteredGenes.length} ${pluralize(
                      'gene',
                      this.filteredGenes.length
                    )},
                ${this.filteredCancerTypes.length} ${pluralize(
                      'cancer type',
                      this.filteredCancerTypes.length
                    )},
                ${this.filteredLevels.length} ${pluralize(
                      'level',
                      this.filteredLevels.length
                    )} of evidence)`}
                  </b>
                </span>
                <AuthDownloadButton
                  size={'sm'}
                  className={classnames('ml-2')}
                  getDownloadData={this.downloadAssociation}
                  fileName={'oncokb_fda_recongnized_genes.tsv'}
                  buttonText={'Associations'}
                />
                {this.fdaVariantsAreFiltered ? (
                  <Button
                    variant="link"
                    size={'sm'}
                    style={{ whiteSpace: 'nowrap' }}
                    className={'ml-auto pr-0'}
                    onClick={this.clearFilters}
                  >
                    Reset filters
                  </Button>
                ) : undefined}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <OncoKBTable
                  disableSearch={true}
                  data={this.filteredFdaAlterations}
                  loading={this.relevantTumorTypes.isPending}
                  columns={this.columns}
                  minRows={Math.round(LG_TABLE_FIXED_HEIGHT / 36) - 1}
                  pageSize={
                    this.filteredFdaAlterations.length === 0
                      ? 1
                      : this.filteredFdaAlterations.length
                  }
                  fixedHeight={true}
                  style={{
                    height: LG_TABLE_FIXED_HEIGHT,
                  }}
                  defaultSorted={[
                    {
                      id: TABLE_COLUMN_KEY.LEVEL,
                      desc: true,
                    },
                    {
                      id: TABLE_COLUMN_KEY.HUGO_SYMBOL,
                      desc: false,
                    },
                    {
                      id: TABLE_COLUMN_KEY.ALTERATIONS,
                      desc: false,
                    },
                    {
                      id: TABLE_COLUMN_KEY.CANCER_TYPES,
                      desc: false,
                    },
                  ]}
                />
              </Col>
            </Row>
          </Then>
          <Else>
            <LoadingIndicator
              size={'big'}
              center={true}
              isLoading={
                this.allTumorTypes.isPending || this.allFdaAlterations.isPending
              }
            />
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
