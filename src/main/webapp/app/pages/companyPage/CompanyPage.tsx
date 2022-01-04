import React from 'react';
import { observer } from 'mobx-react';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import {
  COMPANY_TYPE_TITLES,
  LicenseModel,
  LicenseStatus,
  LicenseType,
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
import { remoteData } from 'cbioportal-frontend-commons';
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from 'app/shared/utils/NotificationUtils';
import { PromiseStatus } from 'app/shared/utils/PromiseUtils';
import { FormTextAreaField } from 'app/shared/textarea/FormTextAreaField';
import { FormSelectWithLabelField } from 'app/shared/select/FormSelectWithLabelField';
import { COMPANY_FORM_OPTIONS } from 'app/components/newCompanyForm/NewCompanyForm';
import { FormListField } from 'app/shared/list/FormListField';
import { UserTable } from 'app/shared/table/UserTable';
import Select from 'react-select';
import DocumentTitle from 'react-document-title';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { AdditionalInfoSelect } from 'app/shared/dropdown/AdditionalInfoSelect';
import {
  debouncedCompanyNameValidator,
  fieldRequiredValidation,
  textValidation,
} from 'app/shared/utils/FormValidationUtils';
import { MobxPromiseUnionType } from 'mobxpromise';

interface MatchParams {
  id: string;
}

type SelectOptionType = {
  label: string;
  value: string;
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
  @observable selectedLicenseStatus: LicenseStatus;

  @observable conflictingDomains: string[] = [];

  @observable showModal = false;

  @observable confirmModalText = '';

  @observable formValues: any;

  @observable selectedUsersOptions: SelectOptionType[] = [];

  @observable companyUserTokens: MobxPromiseUnionType<Token[]>;

  @observable companyUsers: MobxPromiseUnionType<UserDTO[]>;

  @observable company = remoteData<CompanyDTO>({
    invoke: async () => {
      const company = await client.getCompanyUsingGET({
        id: parseInt(this.props.match.params.id),
      });
      this.selectedLicenseStatus = company.licenseStatus as LicenseStatus;
      this.verifyCompanyDomains();
      this.getCompanyInfo(company.id);
      return company;
    },
  });

  readonly nonCompanyUsers = remoteData<SelectOptionType[]>({
    async invoke() {
      const allUsers = await client.getNonCompanyUserEmailsUsingGET({});
      return allUsers.map(email => ({
        label: email,
        value: email,
      }));
    },
    default: [],
  });

  /* After the company is fetched, we will fetch the company users and the tokens */
  @action.bound
  getCompanyInfo(id: number) {
    this.companyUsers = remoteData<UserDTO[]>({
      async invoke() {
        const companyUsers: UserDTO[] = await client.getCompanyUsersUsingGET({
          id,
        });
        this.companyUserTokens = remoteData<Token[]>({
          invoke() {
            return client.getUsersTokensUsingPOST({
              logins: companyUsers.map(user => user.login),
            });
          },
          onError(error) {
            notifyError(error);
          },
          default: [],
        });
        return companyUsers;
      },
      onError(error) {
        notifyError(error);
      },
      default: [],
    });
  }

  @action.bound
  updateCompany() {
    if (!this.company.isComplete) {
      notifyError(new Error('Cannot update when company is loading'));
      return;
    }

    /*eslint-disable no-console*/
    console.log('got here');

    const newCompanyUserEmails = this.selectedUsersOptions.map(
      selection => selection.value
    );
    const updatedCompany: CompanyVM = {
      ...this.company.result,
      licenseStatus: this.selectedLicenseStatus,
      name: this.formValues.companyName,
      companyDomains: this.company.result.companyDomains,
      businessContact: this.formValues.businessContact,
      legalContact: this.formValues.legalContact,
      companyUserEmails: newCompanyUserEmails,
    };

    this.company = remoteData<CompanyDTO>({
      invoke: async () => {
        const updatedCompanyDTO = await client.updateCompanyUsingPUT({
          companyVm: updatedCompany,
        });
        this.selectedLicenseStatus = updatedCompanyDTO.licenseStatus as LicenseStatus;
        this.selectedUsersOptions = [];
        this.conflictingDomains = [];
        this.verifyCompanyDomains();
        this.getCompanyInfo(updatedCompanyDTO.id);
        notifySuccess('Company successfully updated');
        return updatedCompanyDTO;
      },
      onError(error: Error) {
        notifyError(error);
      },
    });
  }

  @action.bound
  showConfirmModal(event: any, value: any) {
    if (!this.company.isComplete) return;
    this.formValues = value;
    // Show warnings when license status is being changed and there are company users
    if (
      this.company.result.licenseStatus !== this.selectedLicenseStatus &&
      this.companyUsers.result!.length > 0
    ) {
      this.showModal = true;
      this.confirmModalText =
        LICENSE_STATUS_UPDATE_MESSAGES[this.company.result.licenseStatus][
          this.selectedLicenseStatus
        ];
    } else {
      this.updateCompany();
    }
  }

  @action.bound
  selectRelatedUsers() {
    this.selectedUsersOptions = [];
    this.selectedUsersOptions = this.nonCompanyUsers.result.filter(user =>
      this.company.result?.companyDomains.includes(
        user.label.split('@').pop() || ''
      )
    );
  }

  @action.bound
  removeUserFromCompany(userToRemove: UserDTO) {
    if (this.company.isComplete) {
      this.getCompanyInfo(this.company.result.id);
      this.nonCompanyUsers.result.push({
        label: userToRemove.email,
        value: userToRemove.email,
      });
    } else {
      notifyError(new Error('Cannot remove user when company is loading'));
    }
  }

  @action.bound
  updateCompanyUser(updatedUser: UserDTO) {
    this.companyUsers[
      this.companyUsers.result!.findIndex(u => u.id === updatedUser.id)
    ] = updatedUser;
  }

  @action
  verifyCompanyDomains() {
    if (this.company.result?.licenseModel !== LicenseModel.FULL) {
      this.conflictingDomains = [];
      return;
    }
    client
      .verifyCompanyDomainUsingPOST({
        names: Array.from(this.company.result.companyDomains),
        companyId: this.company.result.id,
      })
      .then(
        conflictingDomains =>
          (this.conflictingDomains = conflictingDomains.map(
            domainDTO => domainDTO.name
          ))
      )
      .catch((error: Error) => notifyError(error));
  }

  @computed
  // Certain license status changes are not valid, so we hide those options
  get licenseStatusOptions() {
    const hideOptions = [LicenseStatus.UNKNOWN]; // For now, we are hiding the UNKNOWN status
    switch (this.company.result?.licenseStatus) {
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
      <If condition={this.company.isPending}>
        <Then>
          <LoadingIndicator isLoading={true} />
        </Then>
        <Else>
          <If condition={this.company.isError}>
            <Then>
              <Alert variant={'danger'}>
                Error loading company information.
              </Alert>
            </Then>
            <Else>
              {this.company.isComplete && (
                <DocumentTitle title={this.company.result.name}>
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
                            value={this.company.result.id}
                            label={
                              <span className="font-weight-bold">
                                Company ID
                              </span>
                            }
                            disabled
                          />
                          <AvField
                            name="companyName"
                            value={this.company.result.name}
                            label={
                              <span className="font-weight-bold">
                                Company Name
                              </span>
                            }
                            validate={{
                              ...fieldRequiredValidation('company name'),
                              ...textValidation(1, 100),
                              async: (
                                value: string,
                                ctx: any,
                                input: any,
                                cb: (isValid: boolean | string) => void
                              ) =>
                                debouncedCompanyNameValidator(
                                  value,
                                  ctx,
                                  input,
                                  cb,
                                  this.company.result!.id
                                ),
                            }}
                          />
                          <FormTextAreaField
                            label="Company Description"
                            value={this.company.result.description}
                            onTextAreaChange={(event: any) =>
                              (this.company.result!.description =
                                event.target.value)
                            }
                            boldLabel
                          />
                          <FormSelectWithLabelField
                            labelText={'Company Type'}
                            name={'companyType'}
                            defaultValue={{
                              value: this.company.result.companyType,
                              label:
                                COMPANY_TYPE_TITLES[
                                  this.company.result.companyType
                                ],
                            }}
                            options={COMPANY_FORM_OPTIONS.companyType}
                            onSelection={(selectedOption: any) =>
                              (this.company.result!.companyType =
                                selectedOption.value)
                            }
                            boldLabel
                          />
                        </Col>
                      </Row>
                      <Row className={getSectionClassName()}>
                        <Col>
                          <AvField
                            name="businessContact"
                            value={this.company.result.businessContact}
                            label={
                              <span className="font-weight-bold">
                                Business Contact
                              </span>
                            }
                            validate={{ ...textValidation(0, 255) }}
                          />
                          <AvField
                            name="legalContact"
                            value={this.company.result.legalContact}
                            label={
                              <span className="font-weight-bold">
                                Legal Contact
                              </span>
                            }
                            validate={{ ...textValidation(0, 255) }}
                          />

                          <FormSelectWithLabelField
                            labelText={'License Type'}
                            name={'licenseType'}
                            defaultValue={{
                              value: this.company.result.licenseType,
                              label:
                                LICENSE_TITLES[this.company.result.licenseType],
                            }}
                            options={COMPANY_FORM_OPTIONS.licenseType}
                            onSelection={(selectedOption: any) =>
                              (this.company.result!.licenseType =
                                selectedOption.value)
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
                              data={this.companyUsers.result || []}
                              usersTokens={this.companyUserTokens?.result || []}
                              onRemoveUser={this.removeUserFromCompany}
                              onUpdateUser={this.updateCompanyUser}
                              licenseStatus={
                                this.company.result
                                  .licenseStatus as LicenseStatus
                              }
                              loading={
                                this.companyUsers.isPending ||
                                this.companyUserTokens?.isPending
                              }
                            />
                          </div>
                          <div className="form-group">
                            <div className={'mb-2 font-weight-bold'}>
                              License Model
                            </div>
                            <AdditionalInfoSelect
                              name={'licenseModel'}
                              defaultValue={{
                                value: this.company.result.licenseModel,
                                label:
                                  LICENSE_MODEL_TITLES[
                                    this.company.result.licenseModel
                                  ],
                              }}
                              options={COMPANY_FORM_OPTIONS.licenseModel}
                              onSelection={(selectedOption: any) => {
                                this.company.result!.licenseModel =
                                  selectedOption.value;
                                this.verifyCompanyDomains();
                              }}
                            />
                          </div>
                          <FormListField
                            list={this.company.result.companyDomains}
                            addItem={(domain: string) => {
                              this.company.result!.companyDomains.push(domain);
                              this.verifyCompanyDomains();
                            }}
                            deleteItem={(domain: string) => {
                              this.company.result!.companyDomains = this.company.result!.companyDomains.filter(
                                domainName => domainName !== domain
                              );
                              this.conflictingDomains = this.conflictingDomains.filter(
                                domainName => domainName !== domain
                              );
                            }}
                            labelText={'Company Domains'}
                            placeholder={
                              'Include at least one domain. ie) oncokb.org'
                            }
                            conflictingItems={this.conflictingDomains}
                            boldLabel
                          />
                          {this.conflictingDomains.length > 0 ? (
                            <Alert variant="warning">
                              <i
                                className={'mr-2 fa fa-exclamation-triangle'}
                              />
                              <span>
                                The domains highlighted in yellow are associated
                                with another regular tiered company.
                              </span>
                            </Alert>
                          ) : null}
                          <div className="form-group">
                            <div className={'font-weight-bold mb-2'}>
                              Add Users to Company
                            </div>
                            <div style={{ display: 'flex' }}>
                              <div style={{ flex: '1' }}>
                                <Select
                                  isMulti
                                  closeMenuOnSelect={false}
                                  hideSelectedOptions
                                  value={this.selectedUsersOptions.map(u => u)}
                                  options={this.nonCompanyUsers.result.map(
                                    u => u
                                  )}
                                  onChange={(selectedOptions: any) => {
                                    this.selectedUsersOptions = selectedOptions
                                      ? selectedOptions
                                      : [];
                                  }}
                                  maxMenuHeight={200}
                                  isLoading={this.nonCompanyUsers.isPending}
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
                            {this.company.result.licenseStatus}
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
