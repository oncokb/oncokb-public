import React, { useState } from 'react';
import {
  InputGroup,
  Button,
  Dropdown,
  DropdownButton,
  Row,
  Form,
  Col,
  Container,
} from 'react-bootstrap';
import classnames from 'classnames';
import { getMomentInstance } from 'app/shared/utils/Utils';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import moment from 'moment';
import {
  APP_LOCAL_DATETIME_FORMAT_Z_FORCE,
  APP_LOCAL_DATE_FORMAT,
} from 'app/config/constants';
import MomentLocaleUtils from 'react-day-picker/moment';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import pluralize from 'pluralize';

type CalendarButtonProps = {
  currentDate: string | undefined;
  currentFromDate: string | undefined;
  currentToDate: string | undefined;
  fromDate: (newDate: string) => void;
  toDate: (newDate: string) => void;
  filterToggled: (filterActive: boolean) => void;
};

const DATE_PLACEHOLDER = 'Select Date';

export const UsageAnalysisCalendarButton: React.FunctionComponent<CalendarButtonProps> = props => {
  function handleFromDayChange(day: Date) {
    props.fromDate(day.toISOString());
    props.filterToggled(true);
    if (
      props.currentToDate === undefined ||
      props.currentToDate === DATE_PLACEHOLDER
    ) {
      props.toDate(day.toISOString());
    }
  }

  function handleToDayChange(day: Date) {
    props.toDate(day.toISOString());
    props.filterToggled(true);
  }

  function handleResetDays() {
    props.fromDate(DATE_PLACEHOLDER);
    props.toDate(DATE_PLACEHOLDER);
    props.filterToggled(false);
  }

  return (
    <DefaultTooltip placement={'top'} overlay={'View Specific Date Range'}>
      <DropdownButton
        as={InputGroup.Append}
        title={<i className={classnames('fa fa-calendar')}></i>}
        id="time-select-dropdown"
        className="ml-3"
      >
        <Container>
          <div>From:</div>
          <DayPickerInput
            value={
              props.currentFromDate === undefined ||
              props.currentFromDate === DATE_PLACEHOLDER
                ? DATE_PLACEHOLDER
                : getMomentInstance(props.currentFromDate).format(
                    APP_LOCAL_DATE_FORMAT
                  )
            }
            onDayChange={handleFromDayChange}
            inputProps={{
              style: {
                textAlign: 'center',
                border: 'none',
              },
            }}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
          />
          <div>To:</div>
          <DayPickerInput
            value={
              props.currentToDate === undefined ||
              props.currentFromDate === DATE_PLACEHOLDER
                ? DATE_PLACEHOLDER
                : getMomentInstance(props.currentToDate).format(
                    APP_LOCAL_DATE_FORMAT
                  )
            }
            onDayChange={handleToDayChange}
            inputProps={{
              style: {
                textAlign: 'center',
                border: 'none',
              },
            }}
            dayPickerProps={{
              initialMonth:
                props.currentToDate === undefined
                  ? moment().toDate()
                  : getMomentInstance(props.currentToDate).toDate(),
            }}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
          />
          <div className={'mt-2 row'} style={{ justifyContent: 'center' }}>
            <Button size={'sm'} onClick={handleResetDays} style={{ zIndex: 0 }}>
              Reset
            </Button>
          </div>
        </Container>
      </DropdownButton>
    </DefaultTooltip>
  );
};
