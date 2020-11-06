import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore } from 'app/store/AnnotationStore';
import { computed, action, IReactionDisposer, reaction } from 'mobx';
import AppStore from 'app/store/AppStore';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { DEFAULT_GENE } from 'app/config/constants';
import { decodeSlash, encodeSlash } from 'app/shared/utils/Utils';
import { RouterStore } from 'mobx-react-router';
import DocumentTitle from 'react-document-title';
import { Else, If, Then } from 'react-if';
import { UnknownGeneAlert } from 'app/shared/alert/UnknownGeneAlert';
import { RouteComponentProps } from 'react-router';
import AnnotationPage from 'app/pages/annotationPage/AnnotationPage';

interface MatchParams {
  hugoSymbol: string;
  alteration: string;
  tumorType?: string;
}

interface AlterationPageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  routing: RouterStore;
}

@inject('appStore', 'routing')
@observer
export default class AlterationPage extends React.Component<
  AlterationPageProps
> {
  private store: AnnotationStore;

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: any) {
    super(props);
    if (props.match.params) {
      this.store = new AnnotationStore({
        hugoSymbolQuery: props.match.params.hugoSymbol,
        alterationQuery: decodeSlash(props.match.params.alteration),
        tumorTypeQuery: props.match.params.tumorType
          ? decodeSlash(props.match.params.tumorType)
          : props.match.params.tumorType
      });
    }

    this.reactions.push(
      reaction(
        () => this.store.tumorTypeQuery,
        newTumorType => {
          let tumorTypeSection = encodeSlash(this.store.tumorTypeQuery);
          tumorTypeSection = tumorTypeSection ? `/${tumorTypeSection}` : '';
          this.props.routing.history.replace(
            `/gene/${this.store.hugoSymbolQuery}/${this.store.alterationQuery}${tumorTypeSection}`
          );
        }
      )
    );
  }

  @action
  updateQuery(prevProps: AlterationPageProps) {
    if (
      this.props.match.params.hugoSymbol !== prevProps.match.params.hugoSymbol
    ) {
      this.store.hugoSymbolQuery = this.props.match.params.hugoSymbol;
    }
    if (
      this.props.match.params.alteration !== prevProps.match.params.alteration
    ) {
      this.store.alterationQuery = this.props.match.params.alteration;
    }
    // When a tumor type changed from the URL, we need to propagate that to the store
    // but if the tumor type is unset, we need to clear the query in the store
    if (
      this.props.match.params.tumorType !== prevProps.match.params.tumorType
    ) {
      this.store.tumorTypeQuery = this.props.match.params.tumorType
        ? decodeSlash(this.props.match.params.tumorType)!
        : '';
    }
  }

  componentDidUpdate(prevProps: AlterationPageProps) {
    this.updateQuery(prevProps);
  }

  @computed
  get pageShouldBeRendered() {
    return (
      this.store.gene.isComplete &&
      this.store.geneNumber.isComplete &&
      this.store.clinicalAlterations.isComplete &&
      this.store.biologicalAlterations.isComplete &&
      this.store.annotationResult.isComplete
    );
  }

  @computed
  get documentTitle() {
    const content = [];
    if (this.store.hugoSymbol) {
      content.push(`Gene: ${this.store.hugoSymbol}`);
    }
    if (this.store.alterationQuery) {
      content.push(`Alteration: ${this.store.alterationQuery}`);
    }
    if (this.store.tumorTypeQuery) {
      content.push(`Tumor Type: ${this.store.tumorTypeQuery}`);
    }
    return content.join(', ');
  }

  render() {
    return (
      <DocumentTitle title={this.documentTitle}>
        <If condition={this.store.gene.isComplete}>
          <Then>
            {this.store.gene.isError ||
            this.store.gene.result === DEFAULT_GENE ? (
              <UnknownGeneAlert />
            ) : (
              this.pageShouldBeRendered && (
                <AnnotationPage
                  hugoSymbol={this.store.hugoSymbol}
                  alteration={this.store.alterationQuery}
                  tumorType={this.store.tumorTypeQuery}
                  annotation={this.store.annotationResult.result}
                  allTumorTypesOptions={this.store.allTumorTypesOptions.result}
                  allSubtypes={this.store.allSubtype.result}
                  onChangeTumorType={newTumorType =>
                    (this.store.tumorTypeQuery = newTumorType)
                  }
                />
              )
            )}
          </Then>
          <Else>
            <LoadingIndicator
              size={'big'}
              center={true}
              isLoading={
                this.store.gene.isPending || !this.pageShouldBeRendered
              }
            />
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
