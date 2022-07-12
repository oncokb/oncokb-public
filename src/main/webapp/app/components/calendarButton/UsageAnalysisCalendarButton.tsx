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
  function handleFromDayChange(day: any) {
    props.fromDate(day);
    props.filterToggled(true);
    if (props.currentToDate == null || props.currentToDate === 'Invalid Date') {
      props.toDate(day);
    }
  }

  function handleToDayChange(day: any) {
    props.toDate(day);
    props.filterToggled(true);
  }

  function handleResetDays() {
    props.fromDate('Invalid Date');
    props.toDate('Invalid Date');
    props.filterToggled(false);
  }

  return (
    <DefaultTooltip placement={'top'} overlay={'View Specific Date Range'}>
      <DropdownButton
        as={InputGroup.Append}
        title={<i className={classnames('fa fa-calendar')}></i>}
        id="time-select-dropdown"
        className={'ml-3'}
      >
        <Container>
          <div>
            <Row>
              <Col>From:</Col>
            </Row>
          </div>
          <DayPickerInput
            value={getMomentInstance(props.currentFromDate).format(
              APP_LOCAL_DATE_FORMAT
            )}
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
          />
          <div>
            <Row>
              <Col>To:</Col>
            </Row>
          </div>
          <DayPickerInput
            value={getMomentInstance(props.currentToDate).format(
              APP_LOCAL_DATE_FORMAT
            )}
            onDayChange={handleToDayChange}
            inputProps={{
              style: {
                textAlign: 'center',
                border: 'none',
              },
            }}
            dayPickerProps={{
              initialMonth: getMomentInstance(props.currentToDate).toDate(),
            }}
            style={{ margin: '0 auto' }}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
          />
          <Row className={'mt-1'}>
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
