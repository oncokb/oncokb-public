import React from 'react';
import { LICENSE_TYPES, LicenseType, PAGE_ROUTE } from 'app/config/constants';
import { Form, Row, Button, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LICENSE_HASH_KEY } from 'app/pages/RegisterPage';
import { RouterStore } from 'mobx-react-router';

export const RadioSelections: React.FunctionComponent<{
  selectedRadio: LicenseType | undefined,
  onSelectLicense: (licenseKey: LicenseType | undefined) => void
}> = (props) => {
  return (
    <>
      {LICENSE_TYPES.map((license) => (
        <div className="primary" key={license.key} onClick={() => props.onSelectLicense(license.key)}>
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

export const ButtonSelections: React.FunctionComponent<{
  routing: RouterStore
}> = (props) => {
  const onClick = (licenseKey: LicenseType) => {
    props.routing.history.push(`${PAGE_ROUTE.REGISTER}#${LICENSE_HASH_KEY}=${licenseKey}`);
  };
  return (
    <Row className={'my-2'}>
      {
        LICENSE_TYPES.map((license) => (
          <Col key={license.key} lg={3} md={6} xs={12} className={'d-flex justify-content-center'}>
            <Button variant="outline-primary" onClick={() => onClick(license.key)} className={'p-2 my-2'}
                    style={{ width: '100%', maxWidth: 300 }}
            >
              {license.title}
            </Button>
          </Col>
        ))
      }
    </Row>
  );
};
