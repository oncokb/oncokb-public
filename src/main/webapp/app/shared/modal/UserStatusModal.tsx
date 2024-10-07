import { DefaultTooltip } from 'cbioportal-frontend-commons';
import React from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';
import { UserDTO } from '../api/generated/API';
import { AUTHORITIES } from 'app/config/constants';

type UserStatusModalProps = {
  user: UserDTO | undefined;
  show: boolean;
  onCancel: () => void;
  onConfirm: (sendEmail: boolean, authorities: string[]) => void;
};

export class UserStatusModal extends React.Component<UserStatusModalProps> {
  render() {
    const isRequestingApiAccess =
      !this.props.user?.activated &&
      this.props.user?.additionalInfo?.apiAccessRequest?.requested;
    const authorities = [...(this.props.user?.authorities ?? [])];
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.onCancel}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => this.props.onConfirm(true, authorities)}
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
                onClick={() => this.props.onConfirm(false, authorities)}
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
