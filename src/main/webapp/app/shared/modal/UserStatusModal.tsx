import { DefaultTooltip } from 'cbioportal-frontend-commons';
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { UserDTO } from '../api/generated/API';

type UserStatusModalProps = {
  user: UserDTO | undefined;
  show: boolean;
  onCancel: () => void;
  onConfirm: (sendEmail: boolean) => void;
};

export class UserStatusModal extends React.Component<UserStatusModalProps> {
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Update User Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure to{' '}
          {this.props.user?.activated ? 'deactivate' : 'activate'} the user?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.onCancel}>
            Close
          </Button>
          <Button variant="primary" onClick={() => this.props.onConfirm(true)}>
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
                onClick={() => this.props.onConfirm(false)}
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
