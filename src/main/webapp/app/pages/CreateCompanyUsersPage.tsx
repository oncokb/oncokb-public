import React from 'react';
import { observer } from 'mobx-react';
import { RouteComponentProps } from 'react-router';
import { Row, Col, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { getSectionClassName } from './account/AccountUtils';
import { action, computed, observable } from 'mobx';
import { CompanyDTO, ManagedUserVM } from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { Else, If, Then } from 'react-if';
import { fieldRequiredValidation } from 'app/shared/utils/FormValidationUtils';
import _ from 'lodash';
import { remoteData } from 'cbioportal-frontend-commons';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { LicenseStatus } from 'app/config/constants';
import { PromiseStatus } from 'app/shared/utils/PromiseUtils';
import { Link } from 'react-router-dom';
import { getErrorMessage } from 'app/shared/alert/ErrorAlertUtils';

interface MatchParams {
  id: string;
}

enum CreateUserMode {
  SINGLE = 'Single',
  BATCH = 'Batch',
}

enum CreationStatus {
  EDIT,
  ERROR,
  SUCCESS,
}

type UserInfoType = {
  creationStatus: {
    status: CreationStatus;
    error?: Error;
  };
  email: string;
  firstName: string;
  lastName: string;
};

const emptyUserInfo: UserInfoType = {
  creationStatus: {
    status: CreationStatus.EDIT,
  },
  email: '',
  firstName: '',
  lastName: '',
};

const batchUserInputFormatText = `Enter the user informations (one user per line) using the format: email, first name, last name \nie) user@email.com,Sample,User
  \nYou can use commas or tabs to seperate each field`;

/* The number of users that can be created at a time */
const userLimit = 10;

@observer
export class CreateCompanyUsersPage extends React.Component<
  RouteComponentProps<MatchParams>
> {
  @observable userInfos: UserInfoType[] = [emptyUserInfo];
  @observable createdUsers: UserInfoType[] = [];
  @observable createUserMode = CreateUserMode.SINGLE;
  @observable usersInputText = '';
  @observable createUserStatus = PromiseStatus.complete;

  readonly company = remoteData<CompanyDTO>({
    invoke: () => {
      return client.getCompanyUsingGET({
        id: parseInt(this.props.match.params.id, 10),
      });
    },
  });

  @action.bound
  switchToBatch() {
    this.usersInputText = '';
    this.userInfos = [];
    this.createUserMode = CreateUserMode.BATCH;
  }

  @action.bound
  switchToSingle() {
    this.userInfos = [emptyUserInfo];
    this.createUserMode = CreateUserMode.SINGLE;
  }

  // This is to allow admin to press the TAB key while in textarea
  @action.bound
  onTabKey(event: any) {
    if (event.which === 9) {
      // tab key code
      event.preventDefault();
      const { selectionStart, selectionEnd } = event.target;
      this.usersInputText =
        this.usersInputText.substring(0, selectionStart) +
        '\t' +
        this.usersInputText.substring(selectionEnd);
    }
  }

  @action.bound
  onValidSubmit(event: any, values: any) {
    this.createUserStatus = PromiseStatus.pending;
    const managedUserVMs: ManagedUserVM[] = this.userInfos.map(userInfo => {
      return {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        login: userInfo.email,
        password: 'test',
        licenseType: this.company.result?.licenseType,
        tokenIsRenewable:
          this.company.result?.licenseStatus !== LicenseStatus.TRIAL,
        company: this.company.result,
        companyName: this.company.result?.name,
      } as ManagedUserVM;
    });

    Promise.all(
      managedUserVMs
        .map((managedUserVm: ManagedUserVM, idx: number) => {
          return client
            .createUserUsingPOST({ managedUserVm })
            .then(() => {
              this.userInfos[idx].creationStatus = {
                status: CreationStatus.SUCCESS,
              };
            })
            .catch((error: Error) => {
              this.userInfos[idx].creationStatus = {
                status: CreationStatus.ERROR,
                error,
              };
            });
        })
        .map(promise => promise.catch((error: Error) => error))
    ).then(() => {
      const [created, notCreated] = _.partition(
        this.userInfos,
        userInfo => userInfo.creationStatus.status === CreationStatus.SUCCESS
      );
      this.createdUsers = this.createdUsers.concat(created);
      this.userInfos = notCreated;
      if (this.createUserMode === CreateUserMode.SINGLE) {
        if (this.userInfos.length === 0) {
          this.userInfos.push(emptyUserInfo);
        }
      } else {
        this.usersInputText = this.userInfos.reduce((prev, curr) => {
          const { creationStatus, ...userDetails } = curr;
          return prev + Object.values(userDetails).join(',');
        }, '');
      }
      this.createUserStatus = PromiseStatus.complete;
    });
  }

  @action
  loginValidation(
    value: any,
    context: any,
    input: any,
    cb: (isValid: boolean | string) => void
  ) {
    client
      .verifyUserLoginUsingPOST({ login: value.trim() })
      .then(isValid => (isValid ? cb(true) : cb('Login is already is use')))
      .catch(error => notifyError(error));
  }

  @action.bound
  duplicateEmailValidation(
    value: any,
    context: any,
    input: any,
    cb: (isValid: boolean | string) => void
  ) {
    if (this.userInfos.filter(info => info.email === value.trim()).length > 1) {
      cb('This email has already been entered.');
    } else {
      cb(true);
    }
  }

  @action.bound
  parseUserInfoText() {
    this.userInfos = [];
    if (this.usersInputText.length === 0) {
      return;
    }
    let processedList: string[] = [];
    const status = CreationStatus.EDIT;
    if (this.usersInputText.includes(',')) {
      // comma delimited
      processedList = this.usersInputText.split(/\s*[,\r\n]\s*/g);
    } else {
      // tab delimited
      processedList = this.usersInputText.split(/[\r\n\t]+/g);
    }
    processedList = processedList.map(info => info.trim());
    for (
      let i = 0;
      i < processedList.length && this.userInfos.length < 10;
      i += 3
    ) {
      this.userInfos.push({
        email: processedList[i] || '',
        firstName: processedList[i + 1] || '',
        lastName: processedList[i + 2] || '',
        creationStatus: { status },
      });
    }
  }

  getErrorMessages() {
    const failedUsers = this.userInfos.filter(
      userInfo => userInfo.creationStatus.status === CreationStatus.ERROR
    );
    if (failedUsers.length !== 0) {
      return (
        <Alert variant="danger">
          <div>
            The following user(s) could not be created. Please review the
            information and try again.
          </div>
          {failedUsers.map(userInfo => (
            <div>
              {userInfo.email}:{' '}
              {getErrorMessage(
                userInfo.creationStatus.error || new Error('error')
              )}
            </div>
          ))}
        </Alert>
      );
    }
  }

  getCreateUserModeTabs(): JSX.Element[] {
    return Object.keys(CreateUserMode).map((mode: CreateUserMode) => {
      return (
        <Tab
          className="mt-2"
          eventKey={CreateUserMode[mode]}
          title={CreateUserMode[mode]}
        >
          <h5>In Progress</h5>
          {this.getErrorMessages()}
          {this.createUserMode === CreateUserMode.BATCH && (
            <AvField
              name={'userList'}
              label={'Users'}
              type={'textarea'}
              rows={5}
              value={this.usersInputText}
              placeholder={batchUserInputFormatText}
              onChange={(event: any) => {
                this.usersInputText = event.target.value;
                this.parseUserInfoText();
              }}
              onKeyDown={this.onTabKey}
            />
          )}

          {this.userInfos.map((info, idx) => (
            <Row key={`${idx}`}>
              <Col>
                <AvField
                  name={`email${idx}`}
                  label={`Email ${idx + 1}`}
                  value={this.userInfos[idx].email}
                  onChange={(event: any) => {
                    this.userInfos[idx].email = event.target.value;
                  }}
                  validate={{
                    ...fieldRequiredValidation('email'),
                    email: true,
                    asyncLoginValidation: _.debounce(this.loginValidation, 500),
                    duplicateEmailValidation: this.duplicateEmailValidation,
                  }}
                  disabled={CreateUserMode[mode] === CreateUserMode.BATCH}
                />
              </Col>
              <Col>
                <AvField
                  name={`firstName${idx}`}
                  label={'First Name'}
                  value={this.userInfos[idx].firstName}
                  onChange={(event: any) => {
                    this.userInfos[idx].firstName = event.target.value;
                  }}
                  validate={{
                    ...fieldRequiredValidation('first name'),
                  }}
                  disabled={CreateUserMode[mode] === CreateUserMode.BATCH}
                />
              </Col>
              <Col>
                <AvField
                  name={`lastName${idx}`}
                  label={'Last Name'}
                  value={this.userInfos[idx].lastName}
                  onChange={(event: any) => {
                    this.userInfos[idx].lastName = event.target.value;
                  }}
                  validate={{
                    ...fieldRequiredValidation('last name'),
                  }}
                  disabled={CreateUserMode[mode] === CreateUserMode.BATCH}
                />
              </Col>
              {CreateUserMode[mode] === CreateUserMode.SINGLE && (
                <i
                  style={{ marginTop: '40px', cursor: 'pointer' }}
                  className="fa fa-times-circle ml-2 fa-lg"
                  onClick={() => {
                    if (this.userInfos.length > 1) {
                      this.userInfos.splice(idx, 1);
                    }
                  }}
                />
              )}
            </Row>
          ))}
          <div
            className="mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (this.userInfos.length < userLimit) {
                this.userInfos.push(emptyUserInfo);
              }
            }}
          >
            {this.createUserMode === CreateUserMode.SINGLE && (
              <i className="fa fa-plus-circle fa-lg" />
            )}
          </div>
          <Button variant="primary" type="submit">
            Create Users
          </Button>
        </Tab>
      );
    });

    // const singleModeTab = (
    //   <Tab
    //     className="mt-4"
    //     eventKey={CreateUserMode.SINGLE}
    //     title={CreateUserMode.SINGLE}
    //   >
    //     <h5>In Progress</h5>
    //     {this.userInfos.map((info, idx) => (
    //       <Row key={`${idx}`}>
    //         <Col>
    //           <AvField
    //             name={`email${idx}`}
    //             label={`Email ${idx + 1}`}
    //             value={this.userInfos[idx].email}
    //             onChange={(event: any) => {
    //               this.onUserFieldChange(idx, UserInfoField.EMAIL, event);
    //             }}
    //             validate={{
    //               ...fieldRequiredValidation('email'),
    //               email: true,
    //               asyncLoginValidation: _.debounce(this.loginValidation, 500),
    //               duplicateEmailValidation: this.duplicateEmailValidation,
    //             }}
    //           />
    //         </Col>
    //         <Col>
    //           <AvField
    //             name={`firstName${idx}`}
    //             label={'First Name'}
    //             value={this.userInfos[idx].firstName}
    //             onChange={(event: any) => {
    //               this.onUserFieldChange(idx, UserInfoField.FIRST_NAME, event);
    //             }}
    //             validate={{
    //               ...fieldRequiredValidation('first name'),
    //             }}
    //           />
    //         </Col>
    //         <Col>
    //           <AvField
    //             name={`lastName${idx}`}
    //             label={'Last Name'}
    //             value={this.userInfos[idx].lastName}
    //             onChange={(event: any) => {
    //               this.onUserFieldChange(idx, UserInfoField.LAST_NAME, event);
    //             }}
    //             validate={{
    //               ...fieldRequiredValidation('last name'),
    //             }}
    //           />
    //         </Col>
    //         <div>
    //           <i
    //             style={{ marginTop: '40px', cursor: 'pointer' }}
    //             className="fa fa-times-circle ml-2 fa-lg"
    //             onClick={() => {
    //               if (this.userInfos.length > 1) {
    //                 this.userInfos.splice(idx, 1);
    //               }
    //             }}
    //           />
    //         </div>
    //       </Row>
    //     ))}
    //   </Tab>
    // );

    // const batchModeTab = (
    //   <Tab
    //     className="mt-4"
    //     eventKey={CreateUserMode.BATCH}
    //     title={CreateUserMode.BATCH}
    //   >
    //     <AvField
    //       name={'userList'}
    //       label={'Users'}
    //       type={'textarea'}
    //       rows={5}
    //       value={this.usersInputText}
    //       placeholder={batchUserInputFormatText}
    //       onChange={(event: any) => {
    //         this.usersInputText = event.target.value;
    //         this.parseUserInfoText();
    //       }}
    //       onKeyDown={this.onTabKey}
    //     />
    //     {this.userInfos.map((info, idx) => (
    //       <Row key={`${idx}`}>
    //         <Col>
    //           <AvField
    //             name={`email${idx}`}
    //             label={`Email ${idx + 1}`}
    //             value={this.userInfos[idx].email}
    //             validate={{
    //               ...fieldRequiredValidation('email'),
    //               email: true,
    //               asyncLoginValidation: _.debounce(this.loginValidation, 500),
    //               duplicateEmailValidation: this.duplicateEmailValidation,
    //             }}
    //             disabled
    //           />
    //         </Col>
    //         <Col>
    //           <AvField
    //             name={`firstName${idx}`}
    //             label={'First Name'}
    //             value={this.userInfos[idx].firstName}
    //             validate={{
    //               ...fieldRequiredValidation('first name'),
    //             }}
    //             disabled
    //           />
    //         </Col>
    //         <Col>
    //           <AvField
    //             name={`lastName${idx}`}
    //             label={'Last Name'}
    //             value={this.userInfos[idx].lastName}
    //             validate={{
    //               ...fieldRequiredValidation('last name'),
    //             }}
    //             disabled
    //           />
    //         </Col>
    //       </Row>
    //     ))}
    //   </Tab>
    // );
  }

  render() {
    return (
      <If
        condition={
          this.company.isPending ||
          this.createUserStatus === PromiseStatus.pending
        }
      >
        <Then>
          <LoadingIndicator isLoading={true} />
        </Then>
        <Else>
          <If condition={this.company.isError}>
            <Then>
              {' '}
              <Alert variant={'danger'}>
                Error loading company information
              </Alert>
            </Then>
            <Else>
              <Row className={getSectionClassName(true)}>
                <Col>
                  <h2>Create {this.company.result?.name} Users</h2>
                  <Link to={`/companies/${this.company.result?.id}`}>
                    Return to Company Page
                  </Link>
                </Col>
              </Row>
              <Row className={getSectionClassName(true)}>
                <Col>
                  <AvForm onValidSubmit={this.onValidSubmit}>
                    <Tabs
                      defaultActiveKey={this.createUserMode}
                      id="create-user-mode-tabs"
                      onSelect={tabKey =>
                        tabKey === CreateUserMode.SINGLE
                          ? this.switchToSingle()
                          : this.switchToBatch()
                      }
                    >
                      {this.getCreateUserModeTabs()}
                    </Tabs>
                  </AvForm>
                </Col>
              </Row>
              {this.createdUsers.length > 0 ? (
                <Row className={getSectionClassName()}>
                  <Col>
                    <h5>Successfully Created Users</h5>
                    {this.createdUsers.map((info, idx) => (
                      <Row key={`created-user-${idx}`}>
                        <Col>
                          {this.createdUsers[idx].email} (
                          {this.createdUsers[idx].firstName}{' '}
                          {this.createdUsers[idx].lastName})
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              ) : null}
            </Else>
          </If>
        </Else>
      </If>
    );
  }
}
