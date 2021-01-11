import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore } from 'app/store/AnnotationStore';
import { computed, IReactionDisposer, reaction, observable } from 'mobx';
import AppStore from 'app/store/AppStore';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { RouterStore } from 'mobx-react-router';
import DocumentTitle from 'react-document-title';
import { Else, If, Then } from 'react-if';
import { RouteComponentProps } from 'react-router';
import AnnotationPage from 'app/pages/annotationPage/AnnotationPage';
import * as QueryString from 'query-string';
import {
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  REFERENCE_GENOME,
} from 'app/config/constants';
import { Alert } from 'react-bootstrap';

interface MatchParams {
  hgvsg: string;
}

type SearchQueries = {
  refGenome?: REFERENCE_GENOME;
  tumorType?: string;
};

interface HgvsgPageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  routing: RouterStore;
}

@inject('appStore', 'routing')
@observer
export default class HgvsgPage extends React.Component<HgvsgPageProps> {
  @observable tumorType = '';
  @observable refGenome = REFERENCE_GENOME.GRCh37;

  private store: AnnotationStore;
  readonly reactions: IReactionDisposer[] = [];

  constructor(props: any) {
    super(props);

    if (props.match.params) {
      this.store = new AnnotationStore({
        hgsvgQuery: props.match.params.hgvsg,
        tumorTypeQuery: this.tumorType,
        referenceGenomeQuery: this.refGenome,
      });
    }

    this.reactions.push(
      reaction(
        () => [props.routing.location.search],
        ([search]) => {
          const queryStrings = QueryString.parse(search) as SearchQueries;
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
    const queryString: Partial<SearchQueries> = {};
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
    if (this.store.annotationResultByHgvsg.result.query.hugoSymbol) {
      content.push(
        `Gene: ${this.store.annotationResultByHgvsg.result.query.hugoSymbol}`
      );
    }
    if (this.store.annotationResultByHgvsg.result.query.alteration) {
      content.push(
        `Alteration: ${this.store.annotationResultByHgvsg.result.query.alteration}`
      );
    }
    if (this.store.tumorTypeQuery) {
      content.push(`Cancer Type: ${this.store.tumorTypeQuery}`);
    }
    return content.join(', ');
  }

  render() {
    return (
      <DocumentTitle title={this.documentTitle}>
        <If condition={this.store.annotationResultByHgvsg.isComplete}>
          <Then>
            <If
              condition={
                !!this.store.annotationResultByHgvsg.result.query.hugoSymbol
              }
            >
              <Then>
                <AnnotationPage
                  hugoSymbol={
                    this.store.annotationResultByHgvsg.result.query.hugoSymbol
                  }
                  alteration={
                    this.store.annotationResultByHgvsg.result.query.alteration
                  }
                  tumorType={this.store.tumorTypeQuery}
                  annotation={this.store.annotationResultByHgvsg.result}
                  onChangeTumorType={newTumorType =>
                    (this.tumorType = newTumorType)
                  }
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
            <If condition={this.store.annotationResultByHgvsg.isError}>
              <Then>
                <Alert variant="warning" className={'text-center'}>
                  An error occurred while annotating your variant.
                </Alert>
              </Then>
              <Else>
                <LoadingIndicator size={'big'} center={true} isLoading={true} />
              </Else>
            </If>
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
