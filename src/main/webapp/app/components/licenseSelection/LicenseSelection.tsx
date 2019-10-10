import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import autobind from 'autobind-decorator';
import { LICENSE_TYPES, LicenseType } from 'app/config/constants';

export type LicenseSelectionProps = {
  onSelectLicense: (key: LicenseType | undefined) => void
}

@observer
export class LicenseSelection extends React.Component<LicenseSelectionProps, {}> {
  @observable selectedLicense: LicenseType | undefined;

  @autobind
  @action
  onSelectLicense(selectedLicense: LicenseType) {
    if (selectedLicense === this.selectedLicense) {
      this.selectedLicense = undefined;
    } else {
      this.selectedLicense = selectedLicense;
    }
    this.props.onSelectLicense(this.selectedLicense);
  }

  render() {
    return (
      <Row className={'d-flex flex-column'}>
        <Col>
          {LICENSE_TYPES.map((license, index) => (
            <div className='primary'
                 key={license.key}
                 onClick={() => this.onSelectLicense(license.key)}
            >
            <span className='mr-2'>
              {this.selectedLicense === license.key ? (
                <i className={'fa fa-check-circle'}></i>
              ) : (
                <i className={'fa fa-circle-o'}></i>
              )}
            </span>
              <span>{license.title}</span>
            </div>
          ))}
        </Col>
      </Row>
    );
  }
};
