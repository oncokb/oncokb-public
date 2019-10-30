import React from 'react';
import { LICENSE_TITLES, LICENSE_TYPES, LicenseType } from 'app/config/constants';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { COLOR_GREY, COLOR_LIGHT_GREY } from 'app/config/theme';

export const RadioSelections: React.FunctionComponent<{
  selectedRadio?: LicenseType;
  onSelectLicense: (licenseKey: LicenseType | undefined) => void;
}> = props => {
  return (
    <>
      {LICENSE_TYPES.map(license => (
        <div className="primary" key={license.key} onClick={() => props.onSelectLicense(license.key)}>
          <Form.Check className={'px-0'} type="radio" label={license.title} readOnly checked={props.selectedRadio === license.key} />
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
      <Row className={'my-2'}>
        <Col
          lg={3}
          xs={12}
          style={
            props.isLargeScreen
              ? {
                  borderRight: `1px dashed ${COLOR_LIGHT_GREY}`
                }
              : {
                  borderBottom: `1px dashed ${COLOR_LIGHT_GREY}`,
                  marginBottom: '7px'
                }
          }
        >
          <Row className={'align-items-center'}>
            <Col lg={12} xs={6}>
              <SelectionButton
                selectedButton={props.selectedButton}
                onSelectLicense={props.onSelectLicense}
                license={LicenseType.ACADEMIC}
              />
            </Col>
            <Col lg={12} xs={6} style={{ textAlign: 'center' }}>
              <i style={{ color: COLOR_GREY }}>No fee</i>
            </Col>
          </Row>
        </Col>
        <Col lg={9} xs={12}>
          <Row className={'align-items-center'}>
            <Col lg={12} xs={6}>
              <Row>
                <Col lg={4} xs={12}>
                  <SelectionButton
                    selectedButton={props.selectedButton}
                    onSelectLicense={props.onSelectLicense}
                    license={LicenseType.RESEARCH_IN_COMMERCIAL}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <SelectionButton
                    selectedButton={props.selectedButton}
                    onSelectLicense={props.onSelectLicense}
                    license={LicenseType.HOSPITAL}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <SelectionButton
                    selectedButton={props.selectedButton}
                    onSelectLicense={props.onSelectLicense}
                    license={LicenseType.COMMERCIAL}
                  />
                </Col>
              </Row>
            </Col>
            <Col lg={12} xs={6} style={{ textAlign: 'center' }}>
              <i style={{ color: COLOR_GREY }}>
                Requires payment of a license fee, with the fee depending on the use of the product and the size of the company
              </i>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
