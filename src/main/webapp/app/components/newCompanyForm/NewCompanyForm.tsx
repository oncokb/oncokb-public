import React from 'react';
import { observer } from 'mobx-react';
import { Button, Col, Row } from 'react-bootstrap';
import { observable, action, computed } from 'mobx';
import { CompanyVM } from 'app/shared/api/generated/API';
import { FormListField } from 'app/shared/list/FormListField';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { FormTextAreaField } from '../../shared/textarea/FormTextAreaField';
import { FormSelectWithLabelField } from '../../shared/select/FormSelectWithLabelField';
import { AvField, AvForm } from 'availity-reactstrap-validation';
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
import client from 'app/shared/api/clientInstance';
import _ from 'lodash';
import { notifyError } from 'app/shared/utils/NotificationUtils';

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
  @observable selectedLicenseModel: LicenseModel = LicenseModel.REGULAR;
  @observable selectedLicenseType: LicenseType = LicenseType.COMMERCIAL;
  @observable selectedLicenseStatus: LicenseStatus = LicenseStatus.REGULAR;

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

  private debouncedLookup = _.debounce(
    (value: string, ctx, input, cb: (isValid: boolean | string) => void) => {
      if (value.trim() === '') {
        cb(false);
        return;
      }
      client
        .getCompanyByNameUsingGET({ name: value.trim() })
        .then(company => cb('Company name in use!'))
        .catch((error: any) => {
          if (error.response.status === 404) {
            // If the company is not found with the entered name, then
            // it is available to use. The api will return 404 NOT FOUND.
            cb(true);
          } else {
            // If the api fails, then we show an error message
            cb(false);
            notifyError(error, 'Error finding company with name');
          }
        });
    },
    500
  );

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
                required: {
                  value: true,
                  errorMessage: 'The company name is required.',
                },
                async: this.debouncedLookup,
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
            <AvField name="businessContact" label="Business Contact" />
            <AvField name="legalContact" label="Legal Contact" />
            <FormListField
              list={this.companyDomains}
              addItem={(domain: string) => this.companyDomains.push(domain)}
              deleteItem={(domain: string) =>
                (this.companyDomains = this.companyDomains.filter(
                  domainName => domainName !== domain
                ))
              }
              labelText={'Company Domains'}
              placeholder={'Include at least one domain. ie) oncokb.org'}
            />
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
                (this.selectedLicenseModel = selectedOption.value)
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
