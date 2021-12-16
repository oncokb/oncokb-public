import { Button, Modal } from 'react-bootstrap';
import React from 'react';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { action, observable } from 'mobx';
import { Else, If, Then } from 'react-if';
import { observer } from 'mobx-react';
import client from '../api/clientInstance';
import { notifyError } from '../utils/NotificationUtils';
import _ from 'lodash';
import { fieldRequiredValidation } from '../utils/FormValidationUtils';
import { ManagedUserVM } from '../api/generated/API';

type CreateUsersModalProps = {
  title?: string;
  body?: string;
  show: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onSubmit: (managedUserVMs: Partial<ManagedUserVM>[]) => void;
};

type UserInfoType = {
  email: string;
  firstName: string;
  lastName: string;
};

const emptyUserInfo: UserInfoType = {
  email: '',
  firstName: '',
  lastName: '',
};

const batchUserInputFormatText = `Enter the user informations (one user per line) using the format: email, first name, last name \nie) user@email.com,Sample,User
  \nYou can use commas or tabs to seperate each field`;

@observer
export default class CreateUsersModal extends React.Component<
  CreateUsersModalProps
> {
  @observable userInfos: UserInfoType[] = [emptyUserInfo];
  @observable isBatchAdding = false;
  @observable usersInputText = '';

  @action.bound
  onCancel = (event?: any) => {
    if (event) event.preventDefault();
    if (this.props.onCancel) this.props.onCancel();
  };

  @action.bound
  switchToBatch() {
    this.isBatchAdding = true;
    this.usersInputText = this.userInfos
      .filter(
        info =>
          info.email.length > 0 ||
          info.firstName.length > 0 ||
          info.lastName.length > 0
      )
      .map(info => {
        return Object.keys(info)
          .reduce(
            (prev, curr) =>
              prev + ',' + (info[curr].length > 0 ? info[curr] : '[missing]'),
            ''
          )
          .slice(1);
      })
      .join('\n');
  }

  @action.bound
  switchToSingle() {
    let processedList: string[] = [];
    this.userInfos = [];
    if (this.usersInputText.includes(',')) {
      // comma delimited
      processedList = this.usersInputText.split(/\s*[,\r\n]\s*/);
    } else {
      // tab delimited (csv)
      processedList = this.usersInputText.split(/[\r\n\t]+/g);
    }
    processedList = processedList.map(info => info.trim());
    for (let i = 0; i < processedList.length; i += 3) {
      this.userInfos.push({
        email: processedList[i] || '',
        firstName: processedList[i + 1] || '',
        lastName: processedList[i + 2] || '',
      });
    }
    this.isBatchAdding = false;
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
    const managedUserVMs: Partial<ManagedUserVM>[] = this.userInfos.map(
      userInfo => {
        const newUser: Partial<ManagedUserVM> = {
          ...userInfo,
          login: userInfo.email,
        };
        return newUser;
      }
    );
    this.props.onSubmit(managedUserVMs);
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

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={() => this.onCancel()}
        scrollable={true}
        size="lg"
        style={{ maxHeight: '60vh' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Company Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AvForm onValidSubmit={this.onValidSubmit}>
            <div className="mb-2 font-weight-bold">Create User Mode</div>
            <div
              className="mb-2"
              style={{ display: 'flex', columnGap: '15px' }}
            >
              <Button
                variant="light"
                onClick={this.switchToSingle}
                disabled={!this.isBatchAdding}
              >
                <div>
                  <i className="fa fa-user-plus mr-2"></i>
                  Single
                </div>
              </Button>
              <Button
                variant="light"
                onClick={this.switchToBatch}
                disabled={this.isBatchAdding}
              >
                <div>
                  <i className="fa fa-users mr-2" />
                  Batch
                </div>
              </Button>
            </div>
            <div className="border-top py-3">
              <If condition={this.isBatchAdding}>
                <Then>
                  <AvField
                    name={'userList'}
                    label={'Emails'}
                    type={'textarea'}
                    rows={5}
                    value={this.usersInputText}
                    placeholder={batchUserInputFormatText}
                    onChange={(event: any) =>
                      (this.usersInputText = event.target.value)
                    }
                    onKeyDown={this.onTabKey}
                  />
                  <Button
                    variant="success"
                    size="sm"
                    onClick={this.switchToSingle}
                  >
                    Submit
                  </Button>
                </Then>
                <Else>
                  {this.userInfos.map((info, idx) => (
                    <div
                      key={`${info}${idx}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <AvField
                        name={`email${idx}`}
                        label="Email"
                        value={this.userInfos[idx].email}
                        onChange={(event: any) => {
                          this.userInfos[idx].email = event.target.value;
                        }}
                        validate={{
                          ...fieldRequiredValidation('email'),
                          email: true,
                          asyncLoginValidation: _.debounce(
                            this.loginValidation,
                            500
                          ),
                          duplicateEmailValidation: this
                            .duplicateEmailValidation,
                        }}
                      />
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
                      />
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
                      />
                      <div>
                        <i
                          style={{ marginTop: '40px' }}
                          className="fa fa-times-circle ml-2 fa-lg"
                          onClick={() => this.userInfos.splice(idx, 1)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="success"
                    onClick={() => this.userInfos.push(emptyUserInfo)}
                  >
                    Add new
                  </Button>
                </Else>
              </If>
            </div>
            <div className="border-top py-3 d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={(event: any) => this.onCancel(event)}
              >
                Cancel
              </Button>
              {!this.isBatchAdding ? (
                <Button className={'ml-2'} type="submit" variant="primary">
                  Create Users
                </Button>
              ) : null}
            </div>
          </AvForm>
        </Modal.Body>
      </Modal>
    );
  }
}
