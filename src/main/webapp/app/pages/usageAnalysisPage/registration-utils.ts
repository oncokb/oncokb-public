import { LicenseType } from 'app/config/constants';
import { TABLE_DAY_FORMAT, TABLE_YEAR_FORMAT } from 'app/config/constants';
import moment from 'moment';
import { ToggleValue } from './usage-analysis-utils';

export type UserRegistrationSummary = {
  date: string;
  total: number;
  licenseType: string;
};

export type AggregatedUserRegistrationSummary = {
  periodStart: string;
  total: number;
  licenseType: string;
};

export const REGISTRATION_WEEK_FORMAT = TABLE_DAY_FORMAT;
export const NO_CREATION_DATE_LABEL = 'No creation date';

export function getRegistrationPeriodStart(
  periodStart: string,
  timeTypeToggleValue: ToggleValue
) {
  if (periodStart === NO_CREATION_DATE_LABEL) {
    return NO_CREATION_DATE_LABEL;
  }
  if (timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR) {
    return moment(periodStart).format(TABLE_YEAR_FORMAT);
  }
  if (timeTypeToggleValue === ToggleValue.RESULTS_BY_WEEK) {
    return moment(periodStart)
      .startOf('isoWeek')
      .format(REGISTRATION_WEEK_FORMAT);
  }
  return moment(periodStart).format(TABLE_DAY_FORMAT);
}

export function getRegistrationTimeHeader(timeTypeToggleValue: ToggleValue) {
  if (timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR) {
    return 'Year';
  }
  if (timeTypeToggleValue === ToggleValue.RESULTS_BY_WEEK) {
    return 'Week Start';
  }
  return 'Date';
}

export function compareRegistrationPeriodStart(
  firstPeriodStart: string,
  secondPeriodStart: string
) {
  if (firstPeriodStart === secondPeriodStart) {
    return 0;
  }
  if (firstPeriodStart === NO_CREATION_DATE_LABEL) {
    return -1;
  }
  if (secondPeriodStart === NO_CREATION_DATE_LABEL) {
    return 1;
  }
  return (
    moment(firstPeriodStart).valueOf() - moment(secondPeriodStart).valueOf()
  );
}

export function aggregateRegistrationData(
  data: UserRegistrationSummary[],
  timeTypeToggleValue: ToggleValue,
  selectedLicenseType?: LicenseType
) {
  const groupedData = new Map<string, AggregatedUserRegistrationSummary>();

  data.forEach(record => {
    if (selectedLicenseType && record.licenseType !== selectedLicenseType) {
      return;
    }

    const groupedPeriodStart = getRegistrationPeriodStart(
      record.date,
      timeTypeToggleValue
    );
    const key = `${groupedPeriodStart}__${record.licenseType}`;
    const existingRecord = groupedData.get(key);

    if (existingRecord) {
      existingRecord.total += record.total;
    } else {
      groupedData.set(key, {
        periodStart: groupedPeriodStart,
        total: record.total,
        licenseType: record.licenseType,
      });
    }
  });

  return Array.from(groupedData.values());
}

export function filterRegistrationDataByDateRange(
  data: AggregatedUserRegistrationSummary[],
  timeTypeToggleValue: ToggleValue,
  filterToggled: boolean,
  fromDate?: string,
  toDate?: string
) {
  if (!filterToggled || !fromDate || !toDate) {
    return data;
  }

  let tableFormat: string;
  if (timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR) {
    tableFormat = TABLE_YEAR_FORMAT;
  } else if (timeTypeToggleValue === ToggleValue.RESULTS_BY_WEEK) {
    tableFormat = REGISTRATION_WEEK_FORMAT;
  } else {
    tableFormat = TABLE_DAY_FORMAT;
  }

  const fromTime = moment(fromDate).format(tableFormat);
  const toTime = moment(toDate).format(tableFormat);

  return data.filter(record => {
    if (record.periodStart === NO_CREATION_DATE_LABEL) {
      return false;
    }
    return record.periodStart >= fromTime && record.periodStart <= toTime;
  });
}

export function formatRegistrationSummaryAsTsv(
  data: AggregatedUserRegistrationSummary[]
) {
  const header = ['period_start', 'license_type', 'total'];
  const rows = data.map(record => [
    record.periodStart,
    record.licenseType,
    record.total.toString(),
  ]);

  return [header, ...rows].map(row => row.join('\t')).join('\n');
}
