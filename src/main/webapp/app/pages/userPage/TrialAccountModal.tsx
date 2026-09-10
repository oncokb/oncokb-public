import { Button, Modal, InputGroup, FormControl } from 'react-bootstrap';
import React from 'react';
import { UserTrialDTO } from 'app/shared/api/generated/API';
import { PAGE_ROUTE } from 'app/config/constants';
import { InfoRow } from 'app/pages/AccountPage';
import { CopyButton } from 'app/shared/button/CopyButton';
import { toAppTimestampFormat } from 'app/shared/utils/Utils';

export const TrialAccountModal: React.FunctionComponent<{
  baseUrl: string;
  userTrial: UserTrialDTO;
  show: boolean;
  onClose?: () => void;
}> = props => {
  const onClose = (event?: any) => {
    if (event) event.preventDefault();
    if (props.onClose) props.onClose();
  };

  function getInitiationLink() {
    if (props.userTrial.activationKey) {
      return `${props.baseUrl}${PAGE_ROUTE.ACCOUNT_ACTIVE_TRIAL_FINISH}?key=${props.userTrial.activationKey}`;
    } else {
      return 'Link is not available';
    }
  }

  return (
    <Modal show={props.show} onHide={() => onClose()}>
      <Modal.Header closeButton>
        <Modal.Title>Trial Account Info</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InfoRow
          title={<h6>Trial Account Initiation Link</h6>}
          content={
            <InputGroup size={'sm'}>
              <FormControl
                value={getInitiationLink()}
                type={'text'}
                contentEditable={false}
                disabled={true}
              />
              <InputGroup.Append>
                <CopyButton
                  text={getInitiationLink()}
                  disabled={!props.userTrial?.activationKey}
                />
              </InputGroup.Append>
            </InputGroup>
          }
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>Trial Account Initiation Date</h6>}
          content={toAppTimestampFormat(props.userTrial.initiationDate)}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>Trial Account Initiated By</h6>}
          content={props.userTrial.initiatedBy}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>Trial Account Activation Key</h6>}
          content={props.userTrial.activationKey}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>Trial Account Activation Date</h6>}
          content={toAppTimestampFormat(props.userTrial.activationDate)}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>License Agreement Assigned to</h6>}
          content={props.userTrial.licenseAgreementName}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>License Agreement Version</h6>}
          content={props.userTrial.licenseAgreementVersion}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>License Agreement Acceptance Date</h6>}
          content={toAppTimestampFormat(
            props.userTrial.licenseAgreementAcceptanceDate
          )}
          direction={'vertical'}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={(event: any) => onClose(event)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
