import React from 'react';
import { observer } from 'mobx-react';

import { OncoTreeLink } from 'app/shared/utils/UrlUtils';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_MARGIN_BOTTOM_LG,
  OTHER_BIOMARKERS,
} from 'app/config/constants';
import styles from 'app/pages/alterationPage/AlterationPage.module.scss';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import { action, computed } from 'mobx';
import autobind from 'autobind-decorator';
import {
  BiologicalVariant,
  VariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  FdaImplication,
  TherapeuticImplication,
} from 'app/store/AnnotationStore';
import { isCategoricalAlteration } from 'app/shared/utils/Utils';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import AlterationTableTabs from 'app/pages/annotationPage/AlterationTableTabs';
import { getSummaries, SummaryKey } from 'app/pages/annotationPage/Utils';
import AppStore from 'app/store/AppStore';
import { Alteration } from 'app/shared/api/generated/OncoKbAPI';

export type IAlterationView = {
  appStore?: AppStore;
  hugoSymbol: string;
  alteration: string;
  matchedAlteration: Alteration | undefined;
  tumorType: string;
  onChangeTumorType: (newTumorType: string) => void;
  annotation: VariantAnnotation;
  biologicalAlterations?: BiologicalVariant[];
  relevantAlterations?: Alteration[];
  fdaImplication: FdaImplication[];
  therapeuticImplications: TherapeuticImplication[];
  diagnosticImplications: TherapeuticImplication[];
  prognosticImplications: TherapeuticImplication[];
  defaultSelectedTab?: ANNOTATION_PAGE_TAB_KEYS;
  onChangeTab?: (
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) => void;
};
@observer
export default class AlterationView extends React.Component<
  IAlterationView,
  {}
> {
  @autobind
  @action
  updateTumorTypeQuery(selectedOption: any) {
    this.props.onChangeTumorType(selectedOption ? selectedOption.value : '');
  }

  @computed
  get tumorTypeSummaries() {
    const orderedSummaries = this.props.tumorType
      ? [
          SummaryKey.TUMOR_TYPE_SUMMARY,
          SummaryKey.DIAGNOSTIC_SUMMARY,
          SummaryKey.PROGNOSTIC_SUMMARY,
        ]
      : [];
    return getSummaries(this.props.annotation, orderedSummaries);
  }

  @computed get isCategoricalAlteration() {
    return isCategoricalAlteration(this.props.alteration);
  }

  @computed
  get showGeneNameLink() {
    const lHugo = this.props.hugoSymbol.toLowerCase();
    const altNameIncludesGene = this.props.alteration
      .toLowerCase()
      .includes(lHugo);
    const isOtherBiomarkers = lHugo === OTHER_BIOMARKERS.toLowerCase();
    return !altNameIncludesGene && !isOtherBiomarkers;
  }

  @computed
  get relevantBiologicalVariants(): BiologicalVariant[] {
    if (
      this.isCategoricalAlteration &&
      this.props.biologicalAlterations &&
      this.props.relevantAlterations
    ) {
      const relevantAltNames = this.props.relevantAlterations.map(
        alt => alt.alteration
      );
      return this.props.biologicalAlterations.filter(variant =>
        relevantAltNames.includes(variant.variant.alteration)
      );
    } else {
      return [];
    }
  }

  render() {
    return (
      <>
        <Row className="mt-4">
          <Col>
            <div
              className={`d-flex align-items-center ${DEFAULT_MARGIN_BOTTOM_LG}`}
            >
              <span
                className={classnames(styles.headerTumorTypeSelection, 'mr-2')}
              >
                <CancerTypeSelect
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      height: '30px',
                      minHeight: '30px',
                    }),
                    dropdownIndicator: base => ({
                      ...base,
                      padding: 4,
                    }),
                    clearIndicator: base => ({
                      ...base,
                      padding: 4,
                    }),
                    valueContainer: base => ({
                      ...base,
                      padding: '0px 6px',
                    }),
                    input: base => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                    }),
                    menu: base => ({ ...base, zIndex: 10 }),
                  }}
                  tumorType={this.props.tumorType}
                  onChange={(selectedOption: any) =>
                    this.updateTumorTypeQuery(selectedOption)
                  }
                />
              </span>
              <InfoIcon
                overlay={
                  <span>
                    For cancer type specific information, please select a cancer
                    type from the dropdown. The cancer type is curated using{' '}
                    <OncoTreeLink />
                  </span>
                }
                placement="top"
              />
            </div>
          </Col>
        </Row>
        {this.props.tumorType && !this.isCategoricalAlteration ? (
          <Row>
            <Col>
              {this.tumorTypeSummaries.map((summary, index) => {
                return (
                  <div
                    className={DEFAULT_MARGIN_BOTTOM_LG}
                    key={`summary-${index}`}
                  >
                    <h6 className={'mb-0'}>{summary.title}</h6>
                    {summary.content}
                  </div>
                );
              })}
            </Col>
          </Row>
        ) : null}
        <Row className="mt-2">
          <Col>
            <AlterationTableTabs
              selectedTab={this.props.defaultSelectedTab}
              appStore={this.props.appStore}
              hugoSymbol={this.props.hugoSymbol}
              alteration={
                this.props.matchedAlteration
                  ? {
                      alteration: this.props.matchedAlteration.alteration,
                      name: this.props.matchedAlteration.name,
                    }
                  : {
                      alteration: this.props.alteration,
                      name: this.props.alteration,
                    }
              }
              cancerType={this.props.tumorType}
              biological={this.relevantBiologicalVariants}
              tx={this.props.therapeuticImplications}
              dx={this.props.diagnosticImplications}
              px={this.props.prognosticImplications}
              fda={this.props.fdaImplication}
              onChangeTab={this.props.onChangeTab}
            />
          </Col>
        </Row>
      </>
    );
  }
}
