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
  currentDate: string;
  currentFromDate: string;
  currentToDate: string;
  fromDate: (newDate: string) => void;
  toDate: (newDate: string) => void;
  filterToggled: (filterActive: boolean) => void;
};

export const UsageAnalysisCalendarButton: React.FunctionComponent<CalendarButtonProps> = props => {
  let selectedFromDay: string = props.currentFromDate;
  let selectedToDay: string = props.currentToDate;

  function handleFromDayChange(day: any) {
    selectedFromDay = day;
  }

  function handleToDayChange(day: any) {
    selectedToDay = day;
  }

  function handleSelectedDay() {
    props.fromDate(selectedFromDay);
    props.toDate(selectedToDay);
    props.filterToggled(true);
  }

  function handleResetDays() {
    props.filterToggled(false);
  }

  return (
    <DefaultTooltip placement={'top'} overlay={'View Specific Date Range'}>
      <DropdownButton
        as={InputGroup.Append}
        title={<i className={classnames('fa fa-calendar')}></i>}
        id="time-select-dropdown"
      >
        <Container>
          <div>
            <Row>
              <Col>From:</Col>
            </Row>
          </div>
          <DayPickerInput
            onDayChange={handleFromDayChange}
            inputProps={{
              style: {
                textAlign: 'center',
                border: 'none',
              },
            }}
            style={{ margin: '0 auto' }}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
            placeholder={`${getMomentInstance(props.currentDate).format(
              APP_LOCAL_DATE_FORMAT
            )}`}
          />
          <div>
            <Row>
              <Col>To:</Col>
            </Row>
          </div>
          <DayPickerInput
            onDayChange={handleToDayChange}
            inputProps={{
              style: {
                textAlign: 'center',
                border: 'none',
              },
            }}
            style={{ margin: '0 auto' }}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
            placeholder={`${getMomentInstance(props.currentDate).format(
              APP_LOCAL_DATE_FORMAT
            )}`}
          />
          <Row className={'mt-1'}>
            <Button
              size={'sm'}
              style={{ margin: '0 auto', zIndex: 0 }}
              onClick={handleSelectedDay}
            >
              Set
            </Button>
            <Button
              size={'sm'}
              style={{ margin: '0 auto', zIndex: 0 }}
              onClick={handleResetDays}
            >
              Reset
            </Button>
          </Row>
        </Container>
      </DropdownButton>
    </DefaultTooltip>
  );
};
