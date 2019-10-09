import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import autobind from 'autobind-decorator';


export enum LicenseType {
  ACADEMIC = 'ACADEMIC',
  COMMERCIAL_RESEARCH = 'COMMERCIAL_RESEARCH',
  HOSPITAL = 'HOSPITAL',
  COMMERCIAL = 'COMMERCIAL',
}

type license = {
  key: LicenseType,
  title: string
}

const licenseTypes: license[] = [{
  key: LicenseType.ACADEMIC,
  title: 'Research use in an academic setting'
}, {
  key: LicenseType.COMMERCIAL_RESEARCH,
  title: 'Research use in a commercial setting'
}, {
  key: LicenseType.HOSPITAL,
  title: 'Annotation of patient reports in a hospital'
}, {
  key: LicenseType.COMMERCIAL,
  title: 'Use in a commercial product'
}];

export type LicenseSelectionProps = {
  onSelectLicense: (key: LicenseType) => void
}

@observer
export class LicenseSelection extends React.Component<LicenseSelectionProps, {}> {
  @observable selectedLicense: LicenseType;

  @autobind
  @action
  onSelectLicense(selectedLicense: LicenseType) {
    this.selectedLicense = selectedLicense;
    this.props.onSelectLicense(selectedLicense);
  }

  render() {
    return (
      <Row>
        {licenseTypes.map(license => (
          <Col
            key={license.key}
            xl={3}
            xs={6}
          >
            <Button
              active={this.selectedLicense === license.key}
              style={{
                width: 170
              }}
              variant={'outline-primary'}
              className={'mb-2'}
              onClick={() => this.onSelectLicense(license.key)}
            >
              <div className={'d-flex align-items-center'}>
                <span>{license.title}</span>
              </div>
            </Button>
          </Col>
        ))}
      </Row>
    );
  }
};
