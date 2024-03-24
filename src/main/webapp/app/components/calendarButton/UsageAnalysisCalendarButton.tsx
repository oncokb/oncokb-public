import React, { useEffect, useRef, useState } from 'react';
import { InputGroup, Button, Dropdown, Container } from 'react-bootstrap';
import classnames from 'classnames';
import { getMomentInstance } from 'app/shared/utils/Utils';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import moment from 'moment';
import { APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import MomentLocaleUtils from 'react-day-picker/moment';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

type CalendarButtonProps = {
  currentFromDate: string | undefined;
  currentToDate: string | undefined;
  currentMenuState: boolean;
  menuState: (isOpen: boolean) => void;
  fromDate: (newDate: string) => void;
  toDate: (newDate: string) => void;
  filterToggled: (filterActive: boolean) => void;
};

const DATE_PLACEHOLDER = 'Select Date';

export const UsageAnalysisCalendarButton: React.FunctionComponent<CalendarButtonProps> = props => {
  const [open, isOpen] = useState(props.currentMenuState);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentToggleState: boolean =
    props.currentFromDate !== undefined &&
    props.currentFromDate !== DATE_PLACEHOLDER &&
    props.currentToDate !== undefined &&
    props.currentToDate !== DATE_PLACEHOLDER;

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
    if (
      props.currentFromDate === undefined ||
      props.currentFromDate === DATE_PLACEHOLDER
    ) {
      props.fromDate(day.toISOString());
    }
  }

  function handleResetDays() {
    props.fromDate(DATE_PLACEHOLDER);
    props.toDate(DATE_PLACEHOLDER);
    props.filterToggled(false);
  }

  function handleOnClick() {
    isOpen(!open);
    props.menuState(!open);
  }

  const handleOutsideClick = (event: { target: any }) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      isOpen(false); // Close the dropdown
      props.menuState(false); // Update the parent component's state
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <DefaultTooltip placement={'top'} overlay={'View Specific Date Range'}>
      <Dropdown
        as={InputGroup.Append}
        id="time-select-dropdown"
        className="ml-3 active"
        show={open}
        ref={dropdownRef}
      >
        <Dropdown.Toggle
          className={currentToggleState ? 'active' : ''}
          onClick={handleOnClick}
        >
          <i className={classnames('fa fa-calendar')} />
        </Dropdown.Toggle>
        <Dropdown.Menu id="time-select-menu">
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
                props.currentToDate === DATE_PLACEHOLDER
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
                  props.currentToDate === undefined ||
                  props.currentToDate === DATE_PLACEHOLDER
                    ? moment().toDate()
                    : getMomentInstance(props.currentToDate).toDate(),
              }}
              formatDate={MomentLocaleUtils.formatDate}
              parseDate={MomentLocaleUtils.parseDate}
            />
            <div className={'mt-2 row'} style={{ justifyContent: 'center' }}>
              <Button
                size={'sm'}
                onClick={handleResetDays}
                style={{ zIndex: 0 }}
              >
                Reset
              </Button>
            </div>
          </Container>
        </Dropdown.Menu>
      </Dropdown>
    </DefaultTooltip>
  );
};
