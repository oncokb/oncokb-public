import React, { useState } from 'react';
import {
  InputGroup,
  Button,
  Dropdown,
  DropdownButton,
  Row,
  Form,
  Col,
  Container
} from 'react-bootstrap';
import classnames from 'classnames';
import { getMomentInstance } from 'app/shared/utils/Utils';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import moment from 'moment';
import {
  APP_LOCAL_DATETIME_FORMAT_Z_FORCE,
  APP_LOCAL_DATE_FORMAT
} from 'app/config/constants';
import MomentLocaleUtils from 'react-day-picker/moment';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import pluralize from 'pluralize';

type CalendarButtonProps = {
  currentDate: string;
  afterChangeDate: (newDate: string) => void;
};

enum ExtensionType {
  FROM_TODAY = 'Today',
  FROM_EXPIRATION = 'Expiration Day'
}

export const CalendarButton: React.FunctionComponent<CalendarButtonProps> = props => {
  const [extensionType, setExtensionType] = useState(ExtensionType.FROM_TODAY);

  let selectedDay: Date;

  function handleDayChange(day: any) {
    selectedDay = day;
  }

  function handleSelectedDay() {
    props.afterChangeDate(
      moment(selectedDay).format(APP_LOCAL_DATETIME_FORMAT_Z_FORCE)
    );
  }

  const extendSchedule: {
    amount: number;
    unit: moment.unitOfTime.DurationConstructor;
    unitText: string;
  }[] = [
    {
      amount: 1,
      unit: 'w',
      unitText: 'week'
    },
    {
      amount: 1,
      unit: 'M',
      unitText: 'month'
    },
    {
      amount: 6,
      unit: 'M',
      unitText: 'month'
    },
    {
      amount: 1,
      unit: 'y',
      unitText: 'year'
    }
  ];

  return (
    <DefaultTooltip placement={'top'} overlay={'Change token expiration date'}>
      <DropdownButton
        as={InputGroup.Append}
        title={<i className={classnames('fa fa-calendar')}></i>}
        id="time-entend-dropdown"
      >
        <Container>
          <div>
            <Row>
              <Col>Extend after</Col>
            </Row>
            <Form.Group as={Row}>
              <Col>
                <Form.Check
                  label={ExtensionType.FROM_TODAY}
                  type="radio"
                  onClick={() => setExtensionType(ExtensionType.FROM_TODAY)}
                  name="extension-choice"
                  id="extension-type-by-today"
                  defaultChecked
                />
                <Form.Check
                  label={ExtensionType.FROM_EXPIRATION}
                  type="radio"
                  onClick={() =>
                    setExtensionType(ExtensionType.FROM_EXPIRATION)
                  }
                  name="extension-choice"
                  id="extension-type-by-expiration"
                />
              </Col>
            </Form.Group>
          </div>
          <Dropdown.Divider />
          {extendSchedule.map((val, index) => {
            return (
              <Dropdown.Item
                key={`calender-quick-selection-${index}`}
                eventKey={`${index}`}
                style={{ textAlign: 'center' }}
                onClick={() => {
                  const momentInstance =
                    extensionType === ExtensionType.FROM_TODAY
                      ? moment()
                      : getMomentInstance(props.currentDate);
                  props.afterChangeDate(
                    momentInstance
                      .add(val.amount, val.unit)
                      .format(APP_LOCAL_DATETIME_FORMAT_Z_FORCE)
                  );
                }}
              >
                {pluralize(val.unitText, val.amount, true)}
              </Dropdown.Item>
            );
          })}
          <Dropdown.Divider />
          <DayPickerInput
            onDayChange={handleDayChange}
            inputProps={{
              style: {
                textAlign: 'center',
                border: 'none'
              }
            }}
            style={{ margin: '0 auto' }}
            formatDate={MomentLocaleUtils.formatDate}
            parseDate={MomentLocaleUtils.parseDate}
            placeholder={`Expires on: ${getMomentInstance(
              props.currentDate
            ).format(APP_LOCAL_DATE_FORMAT)}`}
          />
          <Row className={'mt-1'}>
            <Button
              size={'sm'}
              style={{ margin: '0 auto', zIndex: 0 }}
              onClick={handleSelectedDay}
            >
              Set
            </Button>
          </Row>
        </Container>
      </DropdownButton>
    </DefaultTooltip>
  );
};
