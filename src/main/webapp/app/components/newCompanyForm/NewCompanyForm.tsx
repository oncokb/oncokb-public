import React from 'react';
import { observer } from 'mobx-react';
import styles from './styles.module.scss';
import autobind from 'autobind-decorator';
import { Button, Col, Row } from 'react-bootstrap';
import { observable, action, computed } from 'mobx';
import { CompanyVM } from 'app/shared/api/generated/API';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { FormTextAreaField } from '../../shared/textarea/FormTextAreaField';
import { FormSelectWithLabelField } from '../../shared/select/FormSelectWithLabelField';
import {
  AvField,
  AvForm,
  AvGroup,
  AvInput,
  AvFeedback,
} from 'availity-reactstrap-validation';
import {
  LicenseType,
  LICENSE_TITLES,
  LicenseStatus,
  CompanyType,
  COMPANY_TYPE_TITLES,
  LICENSE_STATUS_TITLES,
  LicenseModel,
  LICENSE_MODEL_TITLES,
} from 'app/config/constants';

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
      <div
        style={{
          border: '1px solid #ced4da',
          borderRadius: '0.25rem',
          padding: '0.375rem 0.75rem',
          overflowY: 'scroll',
          minHeight: '100px',
          maxHeight: '100px',
          marginTop: '28px',
        }}
      >
        <div className={styles.main}>
          {this.props.domainList.map(domain => (
            <div key={domain} className={styles.content_container}>
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

export const COMPANY_FORM_OPTIONS = {
  companyType: Object.keys(CompanyType).map(type => {
    return {
      value: CompanyType[type],
      label: COMPANY_TYPE_TITLES[CompanyType[type]],
    };
  }),
  licenseType: Object.keys(LicenseType).map(type => {
    return {
      value: LicenseType[type],
      label: LICENSE_TITLES[LicenseType[type]],
    };
  }),
  licenseModel: Object.keys(LicenseModel).map(type => {
    return {
      value: LicenseModel[type],
      label: LICENSE_MODEL_TITLES[LicenseModel[type]],
    };
  }),
  licenseStatus: Object.keys(LicenseStatus).map(type => {
    return {
      value: LicenseStatus[type],
      label: LICENSE_STATUS_TITLES[LicenseStatus[type]],
    };
  }),
};

@observer
export class NewCompanyForm extends React.Component<INewCompanyFormProps> {
  @observable companyDescription = '';
  @observable currentDomainText = '';
  @observable companyDomains: string[] = [];
  @observable selectedCompanyType: CompanyType = CompanyType.PARENT;
  @observable selectedLicenseModel: LicenseModel = LicenseModel.REGULAR;
  @observable selectedLicenseType: LicenseType = LicenseType.COMMERCIAL;
  @observable selectedLicenseStatus: LicenseStatus = LicenseStatus.REGULAR;

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
      companyType: this.selectedCompanyType,
      description: this.companyDescription,
      legalContact: values.legalContact,
      licenseStatus: this.selectedLicenseStatus,
      licenseModel: this.selectedLicenseModel,
      licenseType: this.selectedLicenseType,
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
            <FormTextAreaField
              onTextAreaChange={this.updateCompanyDescription}
              label={'Company Description'}
            />
            <FormSelectWithLabelField
              labelText={'Company Type'}
              name={'companyType'}
              defaultValue={{
                value: CompanyType.PARENT,
                label: COMPANY_TYPE_TITLES[CompanyType.PARENT],
              }}
              options={COMPANY_FORM_OPTIONS.companyType}
              onSelection={(selectedOption: any) =>
                (this.selectedCompanyType = selectedOption)
              }
            />
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
                      placeHolder="oncokb.org"
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
            <FormSelectWithLabelField
              labelText={'License Model'}
              name={'licenseModel'}
              defaultValue={{
                value: LicenseModel.REGULAR,
                label: LICENSE_MODEL_TITLES[LicenseModel.REGULAR],
              }}
              options={COMPANY_FORM_OPTIONS.licenseModel}
              onSelection={(selectedOption: any) =>
                (this.selectedLicenseModel = selectedOption)
              }
            />
            <FormSelectWithLabelField
              labelText={'License Type'}
              name={'licenseType'}
              defaultValue={{
                value: LicenseType.COMMERCIAL,
                label: LICENSE_TITLES[LicenseType.COMMERCIAL],
              }}
              options={COMPANY_FORM_OPTIONS.licenseType}
              onSelection={(selectedOption: any) =>
                (this.selectedLicenseType = selectedOption)
              }
            />
            <FormSelectWithLabelField
              labelText={'License Status'}
              name={'licenseStatus'}
              defaultValue={{
                value: LicenseStatus.REGULAR,
                label: LICENSE_STATUS_TITLES[LicenseStatus.REGULAR],
              }}
              options={COMPANY_FORM_OPTIONS.licenseStatus}
              onSelection={(selectedOption: any) =>
                (this.selectedLicenseStatus = selectedOption)
              }
            />
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
