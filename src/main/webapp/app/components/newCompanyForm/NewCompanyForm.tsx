import React from 'react';
import { observer } from 'mobx-react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { observable, action, computed } from 'mobx';
import { CompanyVM } from 'app/shared/api/generated/API';
import { FormListField } from 'app/shared/list/FormListField';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { FormTextAreaField } from '../../shared/textarea/FormTextAreaField';
import { FormSelectWithLabelField } from '../../shared/select/FormSelectWithLabelField';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import {
  LONG_TEXT_VAL,
  SHORT_TEXT_VAL,
  TEXT_VAL,
  OPTIONAL_TEXT_VAL,
} from 'app/shared/utils/FormValidationUtils';
import {
  LicenseType,
  LICENSE_TITLES,
  LicenseStatus,
  CompanyType,
  COMPANY_TYPE_TITLES,
  LICENSE_STATUS_TITLES,
  LicenseModel,
  LICENSE_MODEL_TITLES,
  LICENSE_MODEL_DESCRIPTIONS,
} from 'app/config/constants';
import client from 'app/shared/api/clientInstance';
import _ from 'lodash';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { AdditionalInfoSelect } from 'app/shared/dropdown/AdditionalInfoSelect';
import {
  debouncedCompanyNameValidator,
  fieldRequiredValidation,
  textValidation,
} from 'app/shared/utils/FormValidationUtils';

type INewCompanyFormProps = {
  onValidSubmit: (newCompany: Partial<CompanyVM>) => void;
};

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
      description: LICENSE_MODEL_DESCRIPTIONS[LicenseModel[type]],
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
  @observable companyDomains: string[] = [];
  @observable selectedCompanyType: CompanyType = CompanyType.PARENT;
  @observable selectedLicenseModel: LicenseModel = LicenseModel.FULL;
  @observable selectedLicenseType: LicenseType = LicenseType.COMMERCIAL;
  @observable selectedLicenseStatus: LicenseStatus = LicenseStatus.REGULAR;
  @observable conflictingDomains: string[] = [];

  @action.bound
  updateCompanyDescription(event: any) {
    this.companyDescription = event.target.value;
  }

  @computed
  get licenseStatusOptions() {
    const optionSubset = [LicenseStatus.TRIAL, LicenseStatus.REGULAR];
    return COMPANY_FORM_OPTIONS.licenseStatus.filter(option =>
      optionSubset.includes(option.value)
    );
  }

  @action
  verifyCompanyDomains() {
    if (this.selectedLicenseModel !== LicenseModel.FULL) {
      this.conflictingDomains = [];
      return;
    }
    client
      .verifyCompanyDomainUsingPOST({ names: Array.from(this.companyDomains) })
      .then(
        conflictingDomains =>
          (this.conflictingDomains = conflictingDomains.map(
            domainDTO => domainDTO.name
          ))
      )
      .catch((error: Error) => notifyError(error));
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
      <AvForm
        onValidSubmit={this.handleValidSubmit}
        onKeyPress={(event: any) => {
          if (event.which === 13) {
            event.preventDefault();
          }
        }}
      >
        <Row>
          <Col md="3">
            <h5>Company Information</h5>
          </Col>
          <Col md="9">
            <AvField
              name="companyName"
              label="Name"
              validate={{
                ...fieldRequiredValidation('company name'),
                ...TEXT_VAL,
                async: debouncedCompanyNameValidator,
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
                (this.selectedCompanyType = selectedOption.value)
              }
            />
            <AvField
              name="businessContact"
              label="Business Contact"
              validate={{ ...OPTIONAL_TEXT_VAL }}
            />
            <AvField
              name="legalContact"
              label="Legal Contact"
              validate={{ ...OPTIONAL_TEXT_VAL }}
            />
            <FormListField
              list={this.companyDomains}
              addItem={(domain: string) => {
                this.companyDomains.push(domain);
                this.verifyCompanyDomains();
              }}
              deleteItem={(domain: string) => {
                this.companyDomains = this.companyDomains.filter(
                  domainName => domainName !== domain
                );
                this.conflictingDomains = this.conflictingDomains.filter(
                  domainName => domainName !== domain
                );
              }}
              labelText={'Company Domains'}
              placeholder={'Include at least one domain. ie) oncokb.org'}
              conflictingItems={this.conflictingDomains}
            />
            {this.conflictingDomains.length > 0 ? (
              <Alert variant="warning">
                <i className={'mr-2 fa fa-exclamation-triangle'} />
                <span>
                  The domains highlighted in yellow are associated with another
                  regular tiered company.
                </span>
              </Alert>
            ) : null}
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col md="3">
            <h5>License Information</h5>
          </Col>
          <Col md="9">
            <div className="form-group">
              <div className={`mb-2`}>License Model</div>
              <AdditionalInfoSelect
                name={'licenseModel'}
                defaultValue={{
                  value: LicenseModel.FULL,
                  label: LICENSE_MODEL_TITLES[LicenseModel.FULL],
                }}
                options={COMPANY_FORM_OPTIONS.licenseModel}
                onSelection={(selectedOption: any) => {
                  this.selectedLicenseModel = selectedOption.value;
                  this.verifyCompanyDomains();
                }}
              />
            </div>
            <FormSelectWithLabelField
              labelText={'License Type'}
              name={'licenseType'}
              defaultValue={{
                value: LicenseType.COMMERCIAL,
                label: LICENSE_TITLES[LicenseType.COMMERCIAL],
              }}
              options={COMPANY_FORM_OPTIONS.licenseType}
              onSelection={(selectedOption: any) =>
                (this.selectedLicenseType = selectedOption.value)
              }
            />
            <FormSelectWithLabelField
              labelText={'License Status'}
              name={'licenseStatus'}
              defaultValue={{
                value: LicenseStatus.REGULAR,
                label: LICENSE_STATUS_TITLES[LicenseStatus.REGULAR],
              }}
              options={this.licenseStatusOptions}
              onSelection={(selectedOption: any) =>
                (this.selectedLicenseStatus = selectedOption.value)
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
