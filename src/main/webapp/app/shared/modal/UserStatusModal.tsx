import { DefaultTooltip } from 'cbioportal-frontend-commons';
import React from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';
import { UserDTO } from '../api/generated/API';
import { AUTHORITIES } from 'app/config/constants';

type UserStatusModalProps = {
  user: UserDTO | undefined;
  show: boolean;
  onCancel: () => void;
  onConfirm: (
    sendEmail: boolean,
    authorities: string[],
    trialStatus: UserDTO['trialStatus']
  ) => void;
};

type UserStatusModalState = {
  selectedTrialStatus: 'REGULAR' | 'TRIAL';
};

export class UserStatusModal extends React.Component<
  UserStatusModalProps,
  UserStatusModalState
> {
  private toSelectableTrialStatus(
    trialStatus: UserDTO['trialStatus'] | undefined
  ): 'REGULAR' | 'TRIAL' {
    return trialStatus === 'REGULAR' ? 'REGULAR' : 'TRIAL';
  }

  state: UserStatusModalState = {
    selectedTrialStatus: this.toSelectableTrialStatus(
      this.props.user?.trialStatus
    ),
  };

  componentDidUpdate(prevProps: UserStatusModalProps) {
    if (
      prevProps.user?.id !== this.props.user?.id ||
      prevProps.show !== this.props.show
    ) {
      this.setState({
        selectedTrialStatus: this.toSelectableTrialStatus(
          this.props.user?.trialStatus
        ),
      });
    }
  }

  private getTrialStatus() {
    if (this.state.selectedTrialStatus === 'REGULAR') {
      return 'REGULAR';
    }
    return this.props.user?.trialStatus === 'TRIAL'
      ? 'TRIAL'
      : 'TRIAL_PENDING_TERMS_ACCEPTANCE';
  }

  render() {
    const isRequestingApiAccess =
      !this.props.user?.activated &&
      this.props.user?.additionalInfo?.apiAccessRequest?.requested;
    const authorities = [...(this.props.user?.authorities ?? [])];
    const trialTermsAccepted =
      this.props.user?.trialStatus === 'TRIAL' &&
      !!this.props.user?.userTrial?.licenseAgreementAcceptanceDate;
    const trialTermsPending =
      this.props.user?.trialStatus === 'TRIAL_PENDING_TERMS_ACCEPTANCE' ||
      (this.state.selectedTrialStatus === 'TRIAL' && !trialTermsAccepted);
    if (isRequestingApiAccess && !authorities.includes(AUTHORITIES.API)) {
      authorities.push(AUTHORITIES.API);
    }
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Update User Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isRequestingApiAccess && (
            <Alert variant="warning">
              <p>
                This user is requesting API access with the following
                justification:
              </p>
              <p>
                "
                {
                  this.props.user?.additionalInfo?.apiAccessRequest
                    ?.justification
                }
                "
              </p>
            </Alert>
          )}
          Are you sure to{' '}
          {this.props.user?.activated ? 'deactivate' : 'activate'} the user?
          <div className="mt-3">
            <label htmlFor="trial-status-select" className="font-weight-bold">
              Trial Status
            </label>
            <select
              id="trial-status-select"
              className="form-control"
              value={this.state.selectedTrialStatus}
              onChange={event => {
                this.setState({
                  selectedTrialStatus: event.target.value as
                    | 'REGULAR'
                    | 'TRIAL',
                });
              }}
            >
              <option value="REGULAR">Regular</option>
              <option value="TRIAL">Trial</option>
            </select>
            {trialTermsAccepted && (
              <div className="text-success mt-2">Trial terms accepted.</div>
            )}
            {trialTermsPending && (
              <div className="text-primary mt-2">
                Trial terms not accepted yet. Selecting Trial keeps the user in
                pending trial activation until terms are accepted.
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.onCancel}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              this.props.onConfirm(true, authorities, this.getTrialStatus())
            }
          >
            Update
          </Button>
          {!this.props.user?.activated ? (
            <DefaultTooltip
              placement={'top'}
              overlay={
                'Update user status without sending an email to the user'
              }
            >
              <Button
                variant="primary"
                onClick={() =>
                  this.props.onConfirm(
                    false,
                    authorities,
                    this.getTrialStatus()
                  )
                }
              >
                Silent Update
              </Button>
            </DefaultTooltip>
          ) : null}
        </Modal.Footer>
      </Modal>
    );
  }
}
