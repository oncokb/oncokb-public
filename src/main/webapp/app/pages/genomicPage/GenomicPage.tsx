import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore, IAnnotationStore } from 'app/store/AnnotationStore';
import { computed, IReactionDisposer, observable, reaction } from 'mobx';
import AppStore from 'app/store/AppStore';
import { RouterStore } from 'mobx-react-router';
import DocumentTitle from 'react-document-title';
import { RouteComponentProps } from 'react-router';
import AnnotationPage, {
  AnnotationType,
} from 'app/pages/annotationPage/AnnotationPage';
import * as QueryString from 'query-string';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  PAGE_ROUTE,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  REFERENCE_GENOME,
} from 'app/config/constants';
import autobind from 'autobind-decorator';
import {
  AlterationPageHashQueries,
  AlterationPageSearchQueries,
} from 'app/shared/route/types';
import WindowStore from 'app/store/WindowStore';
import AuthenticationStore from 'app/store/AuthenticationStore';

interface MatchParams {
  query: string;
}

interface GenomicPageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  routing: RouterStore;
  windowStore: WindowStore;
  authenticationStore: AuthenticationStore;
}

@inject('appStore', 'routing', 'windowStore', 'authenticationStore')
@observer
export default class GenomicPage extends React.Component<GenomicPageProps> {
  @observable tumorType = '';
  @observable refGenome = REFERENCE_GENOME.GRCh37;

  private readonly annotationType: AnnotationType;
  private selectedTab: ANNOTATION_PAGE_TAB_KEYS;

  private readonly store: AnnotationStore;
  readonly reactions: IReactionDisposer[] = [];

  constructor(props: any) {
    super(props);

    const lowerCasePathName = props.routing.location.pathname.toLowerCase();
    if (lowerCasePathName.startsWith(PAGE_ROUTE.HGVSG)) {
      this.annotationType = AnnotationType.HGVSG;
    } else if (lowerCasePathName.startsWith(PAGE_ROUTE.GENOMIC_CHANGE)) {
      this.annotationType = AnnotationType.GENOMIC_CHANGE;
    }

    if (props.match.params) {
      const params: IAnnotationStore = {
        type: AnnotationType.HGVSG,
        tumorTypeQuery: this.tumorType,
        referenceGenomeQuery: this.refGenome,
      };
      switch (this.annotationType) {
        case AnnotationType.HGVSG:
          params.type = AnnotationType.HGVSG;
          params.hgsvgQuery = props.match.params.query;
          break;
        case AnnotationType.GENOMIC_CHANGE:
          params.type = AnnotationType.GENOMIC_CHANGE;
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
    if (this.store.annotationData.isComplete) {
      if (this.store.annotationData.result.query.hugoSymbol) {
        content.push(this.store.annotationData.result.query.hugoSymbol);
      }
      if (this.store.annotationData.result.query.alteration) {
        content.push(this.store.annotationData.result.query.alteration);
      }
      if (this.store.tumorTypeQuery) {
        content.push(`in ${this.store.tumorTypeQuery}`);
      }
    }
    return content.join(', ');
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
        <AnnotationPage
          appStore={this.props.appStore}
          windowStore={this.props.windowStore}
          routing={this.props.routing}
          store={this.store}
          authenticationStore={this.props.authenticationStore}
          annotationType={this.annotationType}
          onChangeTumorType={newTumorType => (this.tumorType = newTumorType)}
          defaultSelectedTab={this.selectedTab}
          onChangeTab={this.onChangeTab}
        />
      </DocumentTitle>
    );
  }
}
