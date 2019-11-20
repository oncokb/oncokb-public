import React from 'react';
import {
  LICENSE_TITLES,
  LICENSE_TYPES,
  LicenseType
} from 'app/config/constants';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { COLOR_GREY, COLOR_LIGHT_GREY } from 'app/config/theme';

export const RadioSelections: React.FunctionComponent<{
  selectedRadio?: LicenseType;
  onSelectLicense: (licenseKey: LicenseType | undefined) => void;
}> = props => {
  return (
    <>
      {LICENSE_TYPES.map(license => (
        <div
          className="primary"
          key={license.key}
          onClick={() => props.onSelectLicense(license.key)}
        >
          <Form.Check
            className={'px-0'}
            type="radio"
            label={license.title}
            readOnly
            checked={props.selectedRadio === license.key}
          />
        </div>
      ))}
    </>
  );
};

const SelectionButton: React.FunctionComponent<{
  selectedButton?: LicenseType;
  onSelectLicense: (licenseKey: LicenseType | undefined) => void;
  license: LicenseType;
}> = props => {
  return (
    <Button
      size={'sm'}
      active={props.selectedButton === props.license}
      variant="outline-primary"
      onClick={() => props.onSelectLicense(props.license)}
      className={'mb-2'}
      style={{ width: '100%', maxWidth: 300, minHeight: 50 }}
    >
      {LICENSE_TITLES[props.license]}
    </Button>
  );
};

export const ButtonSelections: React.FunctionComponent<{
  isLargeScreen: boolean;
  selectedButton?: LicenseType;
  onSelectLicense: (licenseKey: LicenseType | undefined) => void;
}> = props => {
  return (
    <>
      <Row className={"my-2"}>
        <Col xl={3} sm={6} xs={12}>
          <SelectionButton
            selectedButton={props.selectedButton}
            onSelectLicense={props.onSelectLicense}
            license={LicenseType.COMMERCIAL}
          />
        </Col>
        <Col xl={3} sm={6} xs={12}>
          <SelectionButton
            selectedButton={props.selectedButton}
            onSelectLicense={props.onSelectLicense}
            license={LicenseType.HOSPITAL}
          />
        </Col>
        <Col xl={3} sm={6} xs={12}>
          <SelectionButton
            selectedButton={props.selectedButton}
            onSelectLicense={props.onSelectLicense}
            license={LicenseType.RESEARCH_IN_COMMERCIAL}
          />
        </Col>
        <Col xl={3} sm={6} xs={12}>
          <SelectionButton
            selectedButton={props.selectedButton}
            onSelectLicense={props.onSelectLicense}
            license={LicenseType.ACADEMIC}
          />
        </Col>
      </Row>
    </>
  );
};
