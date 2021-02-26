import React from 'react';
import _ from 'lodash';
import { Linkout } from 'app/shared/links/Linkout';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import { concatElements, concatElementsByComma } from 'app/shared/utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import * as styles from 'app/index.module.scss';
import { Alteration } from 'app/shared/api/generated/OncoKbAPI';
import {
  FDA_ORIGIN_DATA,
  ONCOKB_L2_TO_FDA_L3,
} from 'app/pages/genePage/FdaData';

function initialDrug(drugs: any, newDrug: string) {
  if (!drugs[newDrug]) {
    drugs[newDrug] = {};
  }
}

function splitTreatment(str: string, regex: RegExp, stringSplit: string) {
  const treatments: any[] = [];
  (str.match(regex) || []).forEach(matchedItem => {
    const result = matchedItem.split(stringSplit);
    if (result.length > 0) {
      treatments.push({
        drugs: result[0].split('+').map(item => item.trim()),
        fdaApproval: result[1] === 'http:' ? '' : result[1],
      });
    }
  });
  return treatments;
}

function splitAssign(
  drugs: any,
  str: string,
  propertyToAdd: string,
  regex: RegExp,
  stringSplit: string
) {
  (str.match(regex) || []).forEach(matchedItem => {
    const result = matchedItem.split(stringSplit);
    if (result.length !== 2) {
      console.error(matchedItem);
    } else {
      const drug = result[0].trim();
      initialDrug(drugs, drug);
      drugs[drug][propertyToAdd] = result[1].trim();
    }
  });
}

function splitAbstracts(data: any, str: string) {
  const ABSTRACT_REGEX = /[^&]*:\s*http[^&]+/g;
  const abstracts: any[] = [];
  ((str || '').match(ABSTRACT_REGEX) || []).forEach(matchedItem => {
    const result = matchedItem.split(/:\s*http/);
    if (result.length !== 2) {
      console.error(matchedItem);
    } else {
      abstracts.push({
        abstract: result[0].trim(),
        link: `http${result[1].trim()}`,
      });
    }
  });
  data.abstractList = abstracts;
}

function getContent() {
  return _.map(FDA_ORIGIN_DATA, (row: any) => {
    const DRUG_REGEX = /[\w+\s-]+:\s*http[^\s]+/g;
    const DRUG_DATE_REGEX = /[\w+\s-]+:\s*\([\d/]+\)/g;
    // get fda approval
    row.treatments = splitTreatment(row.fdaApproval || '', DRUG_REGEX, ': ');

    const drugs = {};
    // get drug label
    splitAssign(drugs, row.drugLabel || '', 'drugLabel', DRUG_REGEX, ': ');

    // get drug date
    splitAssign(
      drugs,
      row.drugLabelDate || '',
      'drugLabelDate',
      DRUG_DATE_REGEX,
      ':'
    );
    row.drugs = drugs;

    splitAbstracts(row, row.abstracts);

    // get pmids and nccn
    if (!row.pmids) {
      row.pmids = '';
    }

    const pmids = row.pmids.toString().split('NCCN');
    if (pmids.length > 1) {
      row.nccn = `NCCN ` + pmids[1].trim();
    }
    if (pmids.length > 0) {
      row.pmids = pmids[0].trim();
    }

    const SEPARATOR = ', ';
    row.referenceStr = [
      row.abstractList.length > 0 ? 'abstract' : '',
      row.abstractList
        .map((abstract: any) => abstract.abstract)
        .join(SEPARATOR),
      _.keys(row.drugs).join(SEPARATOR),
      row.pmids.length > 0 ? 'pmid' : '',
      row.pmids,
      row.nccn,
    ].join(SEPARATOR);

    delete row.fdaApproval;
    delete row.drugLabel;
    delete row.drugLabelDate;

    return row;
  });
}

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

export type FdaVariant = {
  cancerType: string;
  level: string;
  alteration: Alteration;
};

export function getFdaData(hugoSymbol: string): FdaVariant[] {
  const fdaData = _.groupBy(getContent(), 'gene');
  return (fdaData[hugoSymbol] || []).map(record => {
    return {
      cancerType: record.cancerType,
      level: record.fdaLevel,
      alteration: record.alteration,
    };
  });
}

export function getFdaLevel(
  oncokbLevel: string,
  hugoSymbol: string,
  alteration: string,
  cancerType: string
) {
  switch (oncokbLevel) {
    case '1':
    case 'R1':
      return 'Level 2';
    case '2': {
      const fdaL3Alt =
        ONCOKB_L2_TO_FDA_L3.filter(
          evidence =>
            evidence.hugoSymbol === hugoSymbol &&
            evidence.alteration === alteration &&
            evidence.cancerType === cancerType
        ).length > 0;
      return fdaL3Alt ? 'Level 3' : 'Level 2';
    }
    case '3A':
    case '3B':
    case '4':
    case 'R2':
      return 'Level 3';
    default:
      return '';
  }
}
