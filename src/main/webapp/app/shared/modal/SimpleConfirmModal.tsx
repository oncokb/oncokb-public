import { Button, Modal } from 'react-bootstrap';
import React from 'react';

export const SimpleConfirmModal: React.FunctionComponent<{
  title?: string;
  body?: string | JSX.Element;
  show: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}> = props => {
  const onCancel = (event?: any) => {
    if (event) event.preventDefault();
    if (props.onCancel) props.onCancel();
  };
  return (
    <Modal show={props.show} onHide={() => onCancel()}>
      <Modal.Header closeButton>
        <Modal.Title>
          {props.title ? props.title : 'Please confirm'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.body ? props.body : 'Are you sure?'}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={(event: any) => onCancel(event)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={(event: any) => {
            event.preventDefault();
            if (props.onConfirm) props.onConfirm();
          }}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
