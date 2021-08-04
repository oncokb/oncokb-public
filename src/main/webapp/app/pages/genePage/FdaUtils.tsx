import React from 'react';
import _ from 'lodash';
import { Linkout } from 'app/shared/links/Linkout';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import {
  concatElements,
  concatElementsByComma,
  filterByKeyword,
  getDefaultColumnDefinition
} from 'app/shared/utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import * as styles from 'app/index.module.scss';
import {FdaAlteration} from "app/shared/api/generated/OncoKbPrivateAPI";
import {LEVEL_PRIORITY, LEVELS, PAGE_ROUTE, TABLE_COLUMN_KEY} from "app/config/constants";
import {AlterationPageLink} from "app/shared/utils/UrlUtils";
import InfoIcon from "app/shared/icons/InfoIcon";
import {Link} from "react-router-dom";
import {Version} from "app/pages/LevelOfEvidencePage";

const DrugLabel: React.FunctionComponent<{ drug: any }> = props => {
  const drugLabelText = `drug label ${
    props.drug.drugLabelDate ? props.drug.drugLabelDate : ''
  }`;
  return props.drug.drugLabel ? (
    <Linkout link={props.drug.drugLabel}>{drugLabelText}</Linkout>
  ) : (
    <span className={styles.linkOutText}>{drugLabelText}</span>
  );
};

function hasDrugLabelInfo(treatment: any, drugs: any) {
  return _.some(treatment.drugs, drug => _.has(drugs, drug));
}

function getTreatmentDrugLabels(treatment: any, drugs: any) {
  if (treatment.drugs.length > 1) {
    return (
      <DefaultTooltip
        overlay={
          <>
            {treatment.drugs.map((drug: any) => (
              <div>
                {drug}: <DrugLabel drug={drugs[drug]} />
              </div>
            ))}
          </>
        }
      >
        <span className={styles.linkOutText}>drug label</span>
      </DefaultTooltip>
    );
  } else {
    return <DrugLabel drug={drugs[treatment.drugs[0]]} />;
  }
}
export function getReferenceCell(data: any) {
  let treatments: JSX.Element[] = [];
  _.each(data.treatments, (treatment: any) => {
    const treatmentName = treatment.drugs.join('+');
    const fdaText = 'FDA-approval announcement';
    const fdaElement = treatment.fdaApproval ? (
      <Linkout link={treatment.fdaApproval}>{fdaText}</Linkout>
    ) : (
      <span>{fdaText}</span>
    );

    if (treatment.fdaApproval) {
      treatments.push(
        <div key={treatmentName}>
          {treatmentName}: {fdaElement}{' '}
          {hasDrugLabelInfo(treatment, data.drugs) ? (
            <span>and {getTreatmentDrugLabels(treatment, data.drugs)}</span>
          ) : (
            ''
          )}
        </div>
      );
    } else {
      treatments.push(
        <div key={treatmentName}>
          {treatmentName}:
          {hasDrugLabelInfo(treatment, data.drugs) ? (
            <span> {getTreatmentDrugLabels(treatment, data.drugs)}</span>
          ) : (
            ''
          )}
        </div>
      );
    }
  });

  const uniqueDrugsInTreatment = _.uniq(
    _.reduce(
      data.treatments,
      (acc, next) => {
        acc = acc.concat(next.drugs);
        return acc;
      },
      []
    )
  );
  const drugsNotInTreatmentList = _.filter(
    _.keys(data.drugs),
    drug => !_.includes(uniqueDrugsInTreatment, drug)
  );
  treatments = treatments.concat(
    drugsNotInTreatmentList.map(drug => (
      <div>
        {drug}: <DrugLabel drug={data.drugs[drug]} />
      </div>
    ))
  );
  const renderContent = [];

  if (treatments.length > 0) renderContent.push(<div>{treatments}</div>);

  if (data.pmids)
    renderContent.push(
      <div>
        <PMIDLink pmids={data.pmids} />
      </div>
    );

  if (data.abstractList.length > 0)
    renderContent.push(
      <div>
        Abstract(s):{' '}
        {concatElementsByComma(
          data.abstractList.map((abstract: any) => (
            <Linkout link={abstract.link}>{abstract.abstract}</Linkout>
          ))
        )}
      </div>
    );

  if (data.nccn) renderContent.push(<div>{data.nccn}</div>);
  return (
    <div key={data.alteration}>{concatElements(renderContent, <br />)}</div>
  );
}

export const FDA_L1_DISABLED_BTN_TOOLTIP = 'OncoKB is not associated with a companion diagnostic test. Therefore by definition, no variants in OncoKB are considered FDA Level 1';

export const FDA_ALTERATIONS_TABLE_COLUMNS = [
  {
    ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
    accessor: 'alteration',
    width: 400,
    onFilter: (data: FdaAlteration, keyword: string) =>
      filterByKeyword(data.alteration.name, keyword),
    Cell(props: { original: FdaAlteration }) {
      return (
        <AlterationPageLink
          hugoSymbol={props.original.alteration.gene.hugoSymbol}
          alteration={props.original.alteration.name}
        />
      );
    },
  },
  {
    ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CANCER_TYPES),
    accessor: 'cancerType',
    width: 400,
    Header: <span>Cancer Type</span>,
    onFilter: (data: FdaAlteration, keyword: string) =>
      filterByKeyword(data.cancerType, keyword),
    Cell(props: { original: FdaAlteration }) {
      return <span>{props.original.cancerType}</span>;
    },
  },
  {
    ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
    Header: (
      <div>
        <span>FDA Level of Evidence</span>
        <InfoIcon
          className={'ml-1'}
          overlay={
            <span>
                  For more information about the FDA Level of Evidence, please
                  see{' '}
              <Link to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA_NGS}`}
                    className={'font-weight-bold'}>
                    HERE
                  </Link>
                  .
                </span>
          }
        />
      </div>
    ),
    width: undefined,
    accessor: 'level',
    onFilter: (data: FdaAlteration, keyword: string) =>
      filterByKeyword(data.level, keyword),
    sortMethod(a: string, b: string) {
      return (
        LEVEL_PRIORITY.indexOf(a.replace('Level ', '') as LEVELS) -
        LEVEL_PRIORITY.indexOf(b.replace('Level ', '') as LEVELS)
      );
    },
    Cell(props: { original: FdaAlteration }) {
      return <span>FDA Level {props.original.level.toString().replace('FDAx', '')}</span>;
    },
  },
];
