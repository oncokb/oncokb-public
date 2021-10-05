import React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import {
  AvField,
  AvForm,
  AvGroup,
  AvInput,
  AvFeedback,
} from 'availity-reactstrap-validation';
import { Button, Col, Row } from 'react-bootstrap';
import {
  LicenseType,
  LICENSE_TITLES,
  LicenseStatus,
  CompanyType,
  COMPANY_TYPE_TITLES,
  LICENSE_STATUS_TITLES,
} from 'app/config/constants';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import autobind from 'autobind-decorator';
import client from 'app/shared/api/clientInstance';
import {
  CompanyDTO,
  CompanyDomainDTO,
  CompanyVM,
} from 'app/shared/api/generated/API';
import styles from './styles.module.scss';

type INewCompanyFormProps = {
  onValidSubmit: (newCompany: Partial<CompanyVM>) => void;
};

type IDomainListBoxProps = {
  domainList: string[];
  updateDomainList: (actionType: DomainListActions, event: any) => void;
};

enum DomainListActions {
  ADD,
  DELETE,
}

@observer
class DomainListBox extends React.Component<IDomainListBoxProps> {
  render() {
    return (
      <div className={styles.domain_box}>
        <div className={styles.main}>
          {this.props.domainList.map((domain, idx) => (
            <div key={idx} className={styles.content_container}>
              <span
                className={styles.delete}
                onClick={() =>
                  this.props.updateDomainList(DomainListActions.DELETE, domain)
                }
              >
                <i className="fa fa-times-circle"></i>
              </span>
              <span style={{ margin: '5px 10px 5px 5px' }}>{domain}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

@observer
export class NewCompanyForm extends React.Component<INewCompanyFormProps> {
  @observable companyDescription = '';
  @observable currentDomainText = '';
  @observable companyDomains: string[] = [];

  @autobind
  domainValidation(value: any, context: any, input: any, cb: any) {
    if (this.companyDomains.length > 0) {
      cb(true);
    } else {
      cb(false); // Can also return a string as error message
    }
  }

  @action.bound
  updateCompanyDescription(event: any) {
    this.companyDescription = event.target.value;
  }

  @action.bound
  updateCompanyDomainText(event: any) {
    this.currentDomainText = event.target.value;
  }

  @action.bound
  updateCompanyDomainList(actionType: DomainListActions, payload?: string) {
    switch (actionType) {
      case DomainListActions.ADD:
        if (this.currentDomainText.length < 1) break;
        if (!this.companyDomains.includes(this.currentDomainText)) {
          this.companyDomains.push(this.currentDomainText);
        }
        this.currentDomainText = ''; // Reset current text so user can add more domains
        break;
      case DomainListActions.DELETE:
        if (payload) {
          this.companyDomains = this.companyDomains.filter(
            domain => domain !== payload
          );
        }
        break;
      default:
    }
  }

  @action.bound
  handleValidSubmit(event: any, values: any) {
    const newCompany: Partial<CompanyVM> = {
      businessContact: values.businessContact,
      companyType: values.companyType,
      description: this.companyDescription,
      legalContact: values.legalContact,
      licenseStatus: values.licenseStatus,
      licenseType: values.licenseType,
      name: values.companyName,
      companyDomains: this.companyDomains,
    };
    this.props.onValidSubmit(newCompany);
  }

  render() {
    return (
      <AvForm onValidSubmit={this.handleValidSubmit}>
        <Row>
          <Col md="3">
            <h5>Company Information</h5>
          </Col>
          <Col md="9">
            <AvField
              name="companyName"
              label="Name"
              validate={{
                required: {
                  value: true,
                  errorMessage: 'The company name is required.',
                },
              }}
            />
            <div className="form-group">
              <label className="form-label">Company Description</label>
              <textarea
                onChange={this.updateCompanyDescription}
                style={{ minHeight: '50px' }}
                className="form-control"
              ></textarea>
            </div>
            <AvField
              type="select"
              name="companyType"
              label="Company Type"
              validate={{
                required: {
                  value: true,
                  errorMessage: 'The company type is required.',
                },
              }}
            >
              <option value="" disabled selected hidden>
                Choose a company type
              </option>
              {Object.keys(CompanyType).map((type, idx) => (
                <option value={CompanyType[type]}>
                  {COMPANY_TYPE_TITLES[CompanyType[type]]}
                </option>
              ))}
            </AvField>
            <AvField name="businessContact" label="Business Contact" />
            <AvField name="legalContact" label="Legal Contact" />
            <AvGroup>
              <Row>
                <Col>
                  <label htmlFor="companyDomains">Company Domain Name</label>
                  <div className="input-group">
                    <AvInput
                      id="companyDomains"
                      name="companyDomains"
                      label="Company Domains"
                      value={this.currentDomainText}
                      onChange={this.updateCompanyDomainText}
                      validate={{
                        minLength: {
                          value: 1,
                          errorMessage: 'Required to be at least 1 character',
                        },
                        custom: this.domainValidation,
                      }}
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() =>
                          this.updateCompanyDomainList(DomainListActions.ADD)
                        }
                      >
                        Add
                      </button>
                    </div>
                    <AvFeedback>Must have atleast one (1) domain.</AvFeedback>
                  </div>
                </Col>
                <Col>
                  <DomainListBox
                    domainList={this.companyDomains}
                    updateDomainList={this.updateCompanyDomainList}
                  />
                </Col>
              </Row>
            </AvGroup>
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col md="3">
            <h5>License Information</h5>
          </Col>
          <Col md="9">
            <AvField
              type="select"
              name="licenseType"
              label="License Type"
              validate={{
                required: {
                  value: true,
                  errorMessage: 'The license type is required.',
                },
              }}
            >
              <option value="" disabled selected hidden>
                Choose a license type
              </option>
              {Object.keys(LicenseType).map((type, idx) => (
                <option value={LicenseType[type]}>
                  {LICENSE_TITLES[LicenseType[type]]}
                </option>
              ))}
            </AvField>
            <AvField
              type="select"
              name="licenseStatus"
              label="License Status"
              validate={{
                required: {
                  value: true,
                  errorMessage: 'The license status is required.',
                },
              }}
            >
              <option value="" disabled selected hidden>
                Choose a license status
              </option>
              {Object.keys(LicenseStatus).map((type, idx) => (
                <option value={LicenseStatus[type]}>
                  {LICENSE_STATUS_TITLES[LicenseStatus[type]]}
                </option>
              ))}
            </AvField>
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col md="3">
            <h5>Review Information</h5>
          </Col>
          <Col md="9">
            <Button type="submit">Create Company</Button>
          </Col>
        </Row>
      </AvForm>
    );
  }
}
