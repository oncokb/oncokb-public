import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Location } from 'history';
import { RouterStore } from 'mobx-react-router';

export interface IFdaModal {
  routing: RouterStore;
  show: boolean;
  onHide: () => void;
  lastLocation: Location;
}

const LEAVING_PAGE_MESSAGE =
  'You are now leaving the FDA-recognized portion of this page.';

export const FdaModal: React.FunctionComponent<IFdaModal> = props => {
  function confirmLeavingFdaTab() {
    if (props.lastLocation) {
      props.routing.history.push(
        props.lastLocation.pathname + props.lastLocation.hash
      );
    }
    if (props.onHide) {
      props.onHide();
    }
  }

  return (
    <Modal show={props.show} onHide={confirmLeavingFdaTab}>
      <Modal.Body>{LEAVING_PAGE_MESSAGE}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={confirmLeavingFdaTab}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
