import React from 'react';
import { InputGroup, DropdownButton, Container } from 'react-bootstrap';
import classnames from 'classnames';
import 'react-day-picker/lib/style.css';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import {
  DateSelector,
  DateSelectorProps,
} from 'app/components/dateSelector/DateSelector';

type CalendarButtonProps = DateSelectorProps & {};

export const CalendarButton: React.FunctionComponent<CalendarButtonProps> = props => {
  return (
    <DefaultTooltip placement={'top'} overlay={'Change token expiration date'}>
      <DropdownButton
        as={InputGroup.Append}
        title={<i className={classnames('fa fa-calendar')}></i>}
        id="time-entend-dropdown"
      >
        <Container>
          <DateSelector
            currentDate={props.currentDate}
            afterChangeDate={props.afterChangeDate}
          />
        </Container>
      </DropdownButton>
    </DefaultTooltip>
  );
};
