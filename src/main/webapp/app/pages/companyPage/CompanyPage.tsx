import React from 'react';
import { observer } from 'mobx-react';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import {
  COMPANY_TYPE_TITLES,
  LicenseStatus,
  LICENSE_MODEL_TITLES,
  LICENSE_STATUS_TITLES,
  LICENSE_TITLES,
  THRESHOLD_NUM_OF_USER,
} from 'app/config/constants';
import { Alert, Button, Col, Modal, Row } from 'react-bootstrap';
import {
  CompanyDTO,
  CompanyVM,
  Token,
  UserDTO,
} from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { action, computed, observable } from 'mobx';
import { Else, If, Then } from 'react-if';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { RouteComponentProps } from 'react-router';
import _, { parseInt } from 'lodash';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { PromiseStatus } from 'app/shared/utils/PromiseUtils';
import { FormTextAreaField } from 'app/shared/textarea/FormTextAreaField';
import { FormSelectWithLabelField } from 'app/shared/select/FormSelectWithLabelField';
import { COMPANY_FORM_OPTIONS } from 'app/components/newCompanyForm/NewCompanyForm';
import { FormListField } from 'app/shared/list/FormListField';
import { UserTable } from 'app/shared/table/UserTable';
import Select from 'react-select';
import DocumentTitle from 'react-document-title';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

interface MatchParams {
  id: string;
}

type SelectOptionType = {
  label: string;
  value: number;
  user: UserDTO;
};

const LICENSE_STATUS_UPDATE_MESSAGES = {
  REGULAR: {
    TRIAL: `All users will be sent a trial activation email.`,
    EXPIRED: 'All accounts will be terminated immediately.',
  },
  TRIAL: {
    REGULAR: 'All accounts will be converted to a regular license.',
    TRIAL_EXPIRED: 'All trial accounts will be terminated immediately.',
    EXPIRED: 'All trial accounts will be terminated immediately',
  },
  TRIAL_EXPIRED: {
    TRIAL: 'All accounts can be reactivated using the activation email.',
    REGULAR: 'All account will be converted to a regular license.',
  },
  EXPIRED: {
    TRIAL: 'All account will be sent a trial activation email.',
    REGULAR: 'All accounts will be approved automatically.',
  },
};

@observer
export default class CompanyPage extends React.Component<
  RouteComponentProps<MatchParams>
> {
  @observable company: CompanyDTO;
  @observable getCompanyStatus: PromiseStatus;
  @observable selectedLicenseStatus: LicenseStatus;

  @observable showModal = false;
  @observable confirmModalText = '';
  @observable formValues: any;

  @observable companyUsers: UserDTO[] = [];
  @observable companyUsersTokens: Token[] = [];
  @observable availableUsers: SelectOptionType[] = [];
  @observable selectedUsersOptions: SelectOptionType[] = [];

  constructor(props: RouteComponentProps<MatchParams>) {
    super(props);
    this.getCompanyInfos();
  }

  @action
  async getCompanyInfos() {
    try {
      this.getCompanyStatus = PromiseStatus.pending;
      this.company = await client.getCompanyUsingGET({
        id: parseInt(this.props.match.params.id),
      });
      this.selectedLicenseStatus = this.company.licenseStatus as LicenseStatus;
      await this.getCompanyUsers();
      await this.getDropdownUsers();
      await this.getAllUsersTokens();
      this.getCompanyStatus = PromiseStatus.complete;
    } catch (error) {
      this.getCompanyStatus = PromiseStatus.error;
      notifyError(error);
    }
  }

  @action
  async getCompanyUsers() {
    try {
      this.companyUsers = await client.getCompanyUsersUsingGET({
        id: this.company.id,
      });
    } catch (error) {
      notifyError(error);
    }
  }

  @action
  async getDropdownUsers() {
    const allUsers = await client.getAllUsersUsingGET({
      size: THRESHOLD_NUM_OF_USER,
    });
    this.availableUsers = allUsers
      .filter(
        user =>
          !this.companyUsers.some(companyUser => companyUser.id === user.id)
      )
      .map(user => ({
        label: user.email,
        value: user.id,
        user,
      }));
  }

  @action
  async getAllUsersTokens() {
    this.companyUsersTokens = await client.getUsersTokensUsingPOST({
      logins: this.companyUsers.map(user => user.login),
    });
  }

  @action.bound
  showConfirmModal(event: any, value: any) {
    this.formValues = value;

    if (this.company.licenseStatus !== this.selectedLicenseStatus) {
      // Show warnings when license status is being changed
      this.showModal = true;
      this.confirmModalText =
        LICENSE_STATUS_UPDATE_MESSAGES[this.company.licenseStatus][
          this.selectedLicenseStatus
        ];
    } else {
      this.updateCompany();
    }
  }

  @action.bound
  async updateCompany() {
    this.showModal = false;
    this.getCompanyStatus = PromiseStatus.pending;
    const newCompanyUsers = this.selectedUsersOptions.map(
      selection => selection.user
    );
    const updatedCompany: CompanyVM = {
      ...this.company,
      licenseStatus: this.selectedLicenseStatus,
      name: this.formValues.companyName,
      companyDomains: this.company.companyDomains,
      businessContact: this.formValues.businessContact,
      legalContact: this.formValues.legalContact,
      companyUserDTOs: newCompanyUsers,
    };

    try {
      const updatedCompanyDTO = await client.updateCompanyUsingPUT({
        companyVm: updatedCompany,
      });
      // Update state with new information from company edit.
      this.company = updatedCompanyDTO;
      this.selectedLicenseStatus = this.company.licenseStatus as LicenseStatus;
      await this.getCompanyUsers();
      this.selectedUsersOptions = [];
      await this.getDropdownUsers();
      await this.getAllUsersTokens();
      this.getCompanyStatus = PromiseStatus.complete;
      notifySuccess('Company successfully updated');
    } catch (error) {
      this.getCompanyStatus = PromiseStatus.error;
      notifyError(error);
    }
  }

  @action.bound
  selectRelatedUsers() {
    this.selectedUsersOptions = [];
    this.selectedUsersOptions = this.availableUsers.filter(user =>
      this.company.companyDomains.includes(user.label.split('@').pop() || '')
    );
  }

  @action.bound
  removeUserFromCompany(userToRemove: UserDTO) {
    this.companyUsers = this.companyUsers.filter(
      user => user.id !== userToRemove.id
    );
    this.availableUsers.push({
      label: userToRemove.email,
      value: userToRemove.id,
      user: userToRemove,
    });
  }

  @action.bound
  updateCompanyUser(updatedUser: UserDTO) {
    this.companyUsers[
      this.companyUsers.findIndex(u => u.id === updatedUser.id)
    ] = updatedUser;
  }

  @computed
  // Certain license status changes are not valid, so we hide those options
  get licenseStatusOptions() {
    const hideOptions = [LicenseStatus.UNKNOWN]; // For now, we are hiding the UNKNOWN status
    switch (this.company.licenseStatus) {
      case LicenseStatus.REGULAR:
        hideOptions.push(LicenseStatus.TRIAL_EXPIRED);
        break;
      case LicenseStatus.TRIAL_EXPIRED:
        hideOptions.push(LicenseStatus.EXPIRED);
        break;
      case LicenseStatus.EXPIRED:
        hideOptions.push(LicenseStatus.TRIAL_EXPIRED);
        break;
      default:
    }
    return COMPANY_FORM_OPTIONS.licenseStatus.filter(
      option => !hideOptions.includes(option.value)
    );
  }

  render() {
    return (
      <If condition={this.getCompanyStatus === PromiseStatus.pending}>
        <Then>
          <LoadingIndicator isLoading={true} />
        </Then>
        <Else>
          <If condition={this.getCompanyStatus === PromiseStatus.error}>
            <Then>
              <Alert variant={'danger'}>
                Error loading company information.
              </Alert>
            </Then>
            <Else>
              {this.company !== undefined && (
                <DocumentTitle title={this.company.name}>
                  <>
                    <AvForm
                      onValidSubmit={this.showConfirmModal}
                      onKeyPress={(event: any) => {
                        if (event.which === 13) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <Row className={getSectionClassName()}>
                        <Col>
                          <AvField
                            name="companyId"
                            value={this.company.id}
                            label={
                              <span className="font-weight-bold">
                                Company ID
                              </span>
                            }
                            disabled
                          />
                          <AvField
                            name="companyName"
                            value={this.company.name}
                            label={
                              <span className="font-weight-bold">
                                Company Name
                              </span>
                            }
                          />
                          <FormTextAreaField
                            label="Company Description"
                            value={this.company.description}
                            onTextAreaChange={(event: any) =>
                              (this.company.description = event.target.value)
                            }
                            boldLabel
                          />
                          <FormSelectWithLabelField
                            labelText={'Company Type'}
                            name={'companyType'}
                            defaultValue={{
                              value: this.company.companyType,
                              label:
                                COMPANY_TYPE_TITLES[this.company.companyType],
                            }}
                            options={COMPANY_FORM_OPTIONS.companyType}
                            onSelection={(selectedOption: any) =>
                              (this.company.companyType = selectedOption.value)
                            }
                            boldLabel
                          />
                        </Col>
                      </Row>
                      <Row className={getSectionClassName()}>
                        <Col>
                          <AvField
                            name="businessContact"
                            value={this.company.businessContact}
                            label={
                              <span className="font-weight-bold">
                                Business Contact
                              </span>
                            }
                          />
                          <AvField
                            name="legalContact"
                            value={this.company.legalContact}
                            label={
                              <span className="font-weight-bold">
                                Legal Contact
                              </span>
                            }
                          />

                          <FormSelectWithLabelField
                            labelText={'License Type'}
                            name={'licenseType'}
                            defaultValue={{
                              value: this.company.licenseType,
                              label: LICENSE_TITLES[this.company.licenseType],
                            }}
                            options={COMPANY_FORM_OPTIONS.licenseType}
                            onSelection={(selectedOption: any) =>
                              (this.company.licenseType = selectedOption.value)
                            }
                            boldLabel
                          />
                          <FormSelectWithLabelField
                            labelText={'License Status'}
                            name={'licenseStatus'}
                            defaultValue={{
                              value: this.selectedLicenseStatus,
                              label:
                                LICENSE_STATUS_TITLES[
                                  this.selectedLicenseStatus
                                ],
                            }}
                            options={this.licenseStatusOptions}
                            onSelection={(selectedOption: any) =>
                              (this.selectedLicenseStatus =
                                selectedOption.value)
                            }
                            boldLabel
                          />
                        </Col>
                      </Row>
                      <Row className={getSectionClassName()}>
                        <Col>
                          <div className="form-group">
                            <div className={'font-weight-bold'}>
                              Company Users
                            </div>
                            <UserTable
                              data={this.companyUsers}
                              usersTokens={this.companyUsersTokens}
                              onRemoveUser={this.removeUserFromCompany}
                              onUpdateUser={this.updateCompanyUser}
                            />
                          </div>
                          <FormSelectWithLabelField
                            labelText={'License Model'}
                            name={'licenseModel'}
                            defaultValue={{
                              value: this.company.licenseModel,
                              label:
                                LICENSE_MODEL_TITLES[this.company.licenseModel],
                            }}
                            options={COMPANY_FORM_OPTIONS.licenseModel}
                            onSelection={(selectedOption: any) =>
                              (this.company.licenseModel = selectedOption.value)
                            }
                            boldLabel
                          />
                          <FormListField
                            list={this.company.companyDomains}
                            addItem={(domain: string) =>
                              this.company.companyDomains.push(domain)
                            }
                            deleteItem={(domain: string) => {
                              this.company.companyDomains = this.company.companyDomains.filter(
                                domainName => domainName !== domain
                              );
                            }}
                            labelText={'Company Domains'}
                            placeholder={
                              'Include at least one domain. ie) oncokb.org'
                            }
                            boldLabeL
                          />
                          <div className="form-group">
                            <div className={'font-weight-bold'}>
                              Add Users to Company
                            </div>
                            <div style={{ display: 'flex' }}>
                              <div style={{ flex: '1' }}>
                                <Select
                                  isMulti
                                  closeMenuOnSelect={false}
                                  hideSelectedOptions
                                  value={this.selectedUsersOptions.map(u => u)}
                                  options={this.availableUsers}
                                  onChange={(selectedOptions: any) => {
                                    this.selectedUsersOptions = selectedOptions
                                      ? selectedOptions
                                      : [];
                                  }}
                                  maxMenuHeight={200}
                                />
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  margin: '0 20px',
                                }}
                                className="font-weight-bold"
                              >
                                or
                              </div>
                              <div>
                                <DefaultTooltip
                                  placement={'top'}
                                  overlay={`Select all users whose email addresses matches the company's domain(s).`}
                                >
                                  <Button onClick={this.selectRelatedUsers}>
                                    Add All Related Users
                                  </Button>
                                </DefaultTooltip>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <Row className={getSectionClassName()}>
                        <Col>
                          <Button
                            id="update-company"
                            variant="primary"
                            type="submit"
                          >
                            Update Company
                          </Button>
                        </Col>
                      </Row>
                    </AvForm>
                    <Modal
                      show={this.showModal}
                      onHide={() => (this.showModal = false)}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>Review Company Changes</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <div>
                          Are you sure you want to change the company's license
                          status from{' '}
                          <span className="font-weight-bold">
                            {this.company.licenseStatus}
                          </span>{' '}
                          to{' '}
                          <span className="font-weight-bold">
                            {this.selectedLicenseStatus}
                          </span>
                          ?
                        </div>
                        <Alert
                          variant={'warning'}
                          style={{ marginTop: '20px' }}
                        >
                          Warning: {this.confirmModalText}
                        </Alert>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button
                          variant="secondary"
                          onClick={() => (this.showModal = false)}
                        >
                          Close
                        </Button>
                        <Button variant="primary" onClick={this.updateCompany}>
                          Update
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </>
                </DocumentTitle>
              )}
            </Else>
          </If>
        </Else>
      </If>
    );
  }
}
