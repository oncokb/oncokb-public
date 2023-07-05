import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore, IAnnotationStore } from 'app/store/AnnotationStore';
import { computed, IReactionDisposer, observable, reaction } from 'mobx';
import AppStore from 'app/store/AppStore';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { RouterStore } from 'mobx-react-router';
import DocumentTitle from 'react-document-title';
import { Else, If, Then } from 'react-if';
import { RouteComponentProps } from 'react-router';
import AnnotationPage, {
  AnnotationType,
} from 'app/pages/annotationPage/AnnotationPage';
import * as QueryString from 'query-string';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_ANNOTATION,
  PAGE_ROUTE,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  REFERENCE_GENOME,
} from 'app/config/constants';
import { Alert } from 'react-bootstrap';
import autobind from 'autobind-decorator';
import {
  AlterationPageHashQueries,
  AlterationPageSearchQueries,
} from 'app/shared/route/types';
import WindowStore from 'app/store/WindowStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { remoteData } from 'cbioportal-frontend-commons';
import { VariantAnnotation } from 'app/shared/api/generated/OncoKbPrivateAPI';

interface MatchParams {
  query: string;
}

interface HgvsgPageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  routing: RouterStore;
  windowStore: WindowStore;
  authenticationStore: AuthenticationStore;
}

@inject('appStore', 'routing', 'windowStore', 'authenticationStore')
@observer
export default class HgvsgPage extends React.Component<HgvsgPageProps> {
  @observable tumorType = '';
  @observable refGenome = REFERENCE_GENOME.GRCh37;

  private readonly annotationType: AnnotationType;
  private selectedTab: ANNOTATION_PAGE_TAB_KEYS;

  private store: AnnotationStore;
  readonly reactions: IReactionDisposer[] = [];

  constructor(props: any) {
    super(props);

    if (props.routing.location.pathname.startsWith(PAGE_ROUTE.HGVSG)) {
      this.annotationType = AnnotationType.HGVSG;
    } else if (
      props.routing.location.pathname.startsWith(PAGE_ROUTE.GENOMIC_CHANGE)
    ) {
      this.annotationType = AnnotationType.GENOMIC_CHANGE;
    }

    if (props.match.params) {
      const params: IAnnotationStore = {
        tumorTypeQuery: this.tumorType,
        referenceGenomeQuery: this.refGenome,
      };
      switch (this.annotationType) {
        case AnnotationType.HGVSG:
          params.hgsvgQuery = props.match.params.query;
          break;
        case AnnotationType.GENOMIC_CHANGE:
          params.genomicChangeQuery = props.match.params.query;
          break;
        default:
          break;
      }
      this.store = new AnnotationStore(params);
    }

    this.props.appStore.toFdaRecognizedContent = false;

    this.reactions.push(
      reaction(
        () => [props.routing.location.search],
        ([search]) => {
          const queryStrings = QueryString.parse(
            search
          ) as AlterationPageSearchQueries;
          if (queryStrings.refGenome) {
            this.refGenome = queryStrings.refGenome;
            this.store.referenceGenomeQuery = this.refGenome;
          }
          if (queryStrings.tumorType) {
            this.tumorType = queryStrings.tumorType;
            this.store.tumorTypeQuery = this.tumorType;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(
            hash
          ) as AlterationPageHashQueries;
          if (queryStrings.tab) {
            this.selectedTab = queryStrings.tab;
            if (queryStrings.tab === ANNOTATION_PAGE_TAB_KEYS.FDA) {
              this.props.appStore.inFdaRecognizedContent = true;
            }
          }
        },
        true
      ),
      reaction(
        () => this.searchQueries,
        newHash => {
          const parsedSearchQueryString = QueryString.stringify(newHash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING,
          });
          window.location.search = `?${parsedSearchQueryString}`;
        }
      )
    );
  }

  @computed
  get annotationData() {
    switch (this.annotationType) {
      case AnnotationType.GENOMIC_CHANGE:
        return this.store.annotationResultByGenomicChange;
        break;
      case AnnotationType.HGVSG:
        return this.store.annotationResultByHgvsg;
        break;
      default:
        return this.store.defaultAnnotationResult;
        break;
    }
  }

  @computed
  get searchQueries() {
    const queryString: Partial<AlterationPageSearchQueries> = {};
    if (this.refGenome) {
      queryString.refGenome = this.refGenome;
    }
    if (this.tumorType) {
      queryString.tumorType = this.tumorType;
    }
    return queryString;
  }

  componentWillUnmount() {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  @computed
  get documentTitle() {
    const content = [];
    if (this.annotationData.isComplete) {
      if (this.annotationData.result.query.hugoSymbol) {
        content.push(this.annotationData.result.query.hugoSymbol);
      }
      if (this.annotationData.result.query.alteration) {
        content.push(this.annotationData.result.query.alteration);
      }
      if (this.store.tumorTypeQuery) {
        content.push(`in ${this.store.tumorTypeQuery}`);
      }
    }
    return content.join(', ');
  }

  @computed
  get pageShouldBeRendered() {
    return this.annotationData.isComplete;
  }

  @autobind
  onChangeTab(
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) {
    if (newTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA) {
      this.props.appStore.inFdaRecognizedContent = true;
    }
    if (
      selectedTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA &&
      newTabKey !== ANNOTATION_PAGE_TAB_KEYS.FDA
    ) {
      this.props.appStore.showFdaModal = true;
    } else {
      const newHash: AlterationPageHashQueries = { tab: newTabKey };
      window.location.hash = QueryString.stringify(newHash);
    }
    this.selectedTab = newTabKey;
  }

  render() {
    return (
      <DocumentTitle title={this.documentTitle}>
        <If condition={this.pageShouldBeRendered}>
          <Then>
            <If condition={!!this.annotationData.result.query.hugoSymbol}>
              <Then>
                <AnnotationPage
                  appStore={this.props.appStore}
                  windowStore={this.props.windowStore}
                  authenticationStore={this.props.authenticationStore}
                  annotationType={this.annotationType}
                  hugoSymbol={this.annotationData.result.query.hugoSymbol}
                  oncogene={this.store.gene.result.oncogene}
                  tsg={this.store.gene.result.tsg}
                  alteration={this.annotationData.result.query.alteration}
                  matchedAlteration={this.store.alteration.result}
                  tumorType={this.store.tumorTypeQuery}
                  refGenome={this.store.referenceGenomeQuery}
                  annotation={this.annotationData.result}
                  biologicalAlterations={
                    this.store.biologicalAlterations.result
                  }
                  relevantAlterations={this.store.relevantAlterations.result}
                  onChangeTumorType={newTumorType =>
                    (this.tumorType = newTumorType)
                  }
                  defaultSelectedTab={this.selectedTab}
                  onChangeTab={this.onChangeTab}
                />
              </Then>
              <Else>
                <Alert variant="warning" className={'text-center'}>
                  We do not have any information for this variant
                </Alert>
              </Else>
            </If>
          </Then>
          <Else>
            <If condition={this.annotationData.isError}>
              <Then>
                <Alert variant="warning" className={'text-center'}>
                  An error occurred while annotating your variant.
                </Alert>
              </Then>
              <Else>
                <LoadingIndicator
                  size={LoaderSize.LARGE}
                  center={true}
                  isLoading={true}
                />
              </Else>
            </If>
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
