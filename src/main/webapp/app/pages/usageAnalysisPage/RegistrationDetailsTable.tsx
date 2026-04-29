import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { DownloadButtonWithPromise } from 'app/components/downloadButtonWithPromise/DownloadButtonWithPromise';
import { UsageAnalysisCalendarButton } from 'app/components/calendarButton/UsageAnalysisCalendarButton';
import { LICENSE_TITLES, LicenseType } from 'app/config/constants';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { SortingRule } from 'react-table';
import { UsageToggleGroup } from './UsageToggleGroup';
import {
  AggregatedUserRegistrationSummary,
  aggregateRegistrationData,
  compareRegistrationPeriodStart,
  filterRegistrationDataByDateRange,
  formatRegistrationSummaryAsTsv,
  getRegistrationTimeHeader,
  UserRegistrationSummary,
} from './registration-utils';
import { ToggleValue } from './usage-analysis-utils';

type RegistrationDetailsTableProps = {
  data: UserRegistrationSummary[];
  loadedData: boolean;
};

@observer
export default class RegistrationDetailsTable extends React.Component<
  RegistrationDetailsTableProps
> {
  @observable timeTypeToggleValue: ToggleValue = ToggleValue.RESULTS_BY_WEEK;
  @observable selectedLicenseType: LicenseType | undefined = undefined;
  @observable fromDate: string | undefined;
  @observable toDate: string | undefined;
  @observable filterToggled = false;
  @observable dropdownMenuOpen = false;
  @observable.shallow sorted: SortingRule[] = this.defaultSorted;

  get defaultSorted(): SortingRule[] {
    return [
      {
        id: 'periodStart',
        desc: true,
      },
      {
        id: 'total',
        desc: true,
      },
    ];
  }

  @autobind
  @action
  handleTimeTypeToggleChange(value: ToggleValue) {
    this.timeTypeToggleValue = value;
    this.sorted = this.defaultSorted;
  }

  @autobind
  @action
  handleFilterToggledChange(value: boolean) {
    this.filterToggled = value;
  }

  @autobind
  @action
  handleSortedChange(newSorted: SortingRule[]) {
    this.sorted = newSorted;
  }

  @computed
  get aggregatedData(): AggregatedUserRegistrationSummary[] {
    const aggregatedData = aggregateRegistrationData(
      this.props.data,
      this.timeTypeToggleValue,
      this.selectedLicenseType
    );
    return filterRegistrationDataByDateRange(
      aggregatedData,
      this.timeTypeToggleValue,
      this.filterToggled,
      this.fromDate,
      this.toDate
    );
  }

  @computed
  get exportedData(): AggregatedUserRegistrationSummary[] {
    const sorted = [...this.aggregatedData];

    if (this.sorted.length === 0) {
      return sorted;
    }

    return sorted.sort((first, second) => {
      for (const sortingRule of this.sorted) {
        const direction = sortingRule.desc ? -1 : 1;
        const id = sortingRule.id as keyof AggregatedUserRegistrationSummary;
        const firstValue = first[id];
        const secondValue = second[id];

        if (firstValue === secondValue) {
          continue;
        }

        if (id === 'periodStart') {
          return (
            compareRegistrationPeriodStart(
              String(firstValue),
              String(secondValue)
            ) * direction
          );
        }

        if (typeof firstValue === 'number' && typeof secondValue === 'number') {
          return (firstValue - secondValue) * direction;
        }

        return (
          String(firstValue).localeCompare(String(secondValue)) * direction
        );
      }

      return 0;
    });
  }

  @computed
  get columns(): SearchColumn<AggregatedUserRegistrationSummary>[] {
    return [
      {
        id: 'periodStart',
        Header: getRegistrationTimeHeader(this.timeTypeToggleValue),
        accessor: 'periodStart',
        sortMethod: compareRegistrationPeriodStart,
        onFilter: (row, keyword) => filterByKeyword(row.periodStart, keyword),
      },
      {
        id: 'licenseType',
        Header: 'License Type',
        accessor: 'licenseType',
        onFilter: (row, keyword) => filterByKeyword(row.licenseType, keyword),
        Cell(props: { original: AggregatedUserRegistrationSummary }) {
          const licenseType = props.original.licenseType as LicenseType;
          return LICENSE_TITLES[licenseType] || props.original.licenseType;
        },
      },
      {
        id: 'total',
        Header: 'Total',
        accessor: 'total',
      },
    ];
  }

  readonly filters = () => {
    return (
      <Row className="align-items-center">
        <UsageToggleGroup
          defaultValue={this.timeTypeToggleValue}
          toggleValues={[
            ToggleValue.RESULTS_BY_WEEK,
            ToggleValue.RESULTS_BY_YEAR,
            ToggleValue.RESULTS_BY_DAY,
          ]}
          handleToggle={this.handleTimeTypeToggleChange}
        />
        <Col xs="auto" className="ml-3">
          <Form.Control
            as="select"
            value={this.selectedLicenseType || ''}
            onChange={event => {
              this.selectedLicenseType = event.target.value
                ? (event.target.value as LicenseType)
                : undefined;
            }}
          >
            <option value="">All License Types</option>
            {Object.values(LicenseType).map(licenseType => (
              <option key={licenseType} value={licenseType}>
                {LICENSE_TITLES[licenseType]}
              </option>
            ))}
          </Form.Control>
        </Col>
        <UsageAnalysisCalendarButton
          currentFromDate={this.fromDate}
          currentToDate={this.toDate}
          currentMenuState={this.dropdownMenuOpen}
          menuState={(isOpen: boolean) => {
            this.dropdownMenuOpen = isOpen;
          }}
          fromDate={(newDate: string) => {
            this.fromDate = newDate;
          }}
          toDate={(newDate: string) => {
            this.toDate = newDate;
          }}
          filterToggled={this.handleFilterToggledChange}
        />
        <Col xs="auto" className="ml-3">
          <DownloadButtonWithPromise
            className="btn-sm"
            fileName="user_registrations.tsv"
            buttonText="Export"
            getDownloadData={() =>
              Promise.resolve(formatRegistrationSummaryAsTsv(this.exportedData))
            }
          />
        </Col>
        <Col xs={12} className="mt-2">
          <Alert variant="info" className="my-2 py-2">
            Weekly view uses week start dates. Each week starts on Monday and
            ends on the following Sunday.
          </Alert>
        </Col>
      </Row>
    );
  };

  render() {
    return (
      <OncoKBTable<AggregatedUserRegistrationSummary>
        key={this.timeTypeToggleValue}
        data={this.aggregatedData}
        columns={this.columns}
        loading={!this.props.loadedData}
        showPagination={true}
        minRows={1}
        defaultSorted={this.defaultSorted}
        sorted={this.sorted}
        onSortedChange={this.handleSortedChange}
        filters={this.filters}
        disableSearch
      />
    );
  }
}
