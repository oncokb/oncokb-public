import { Button, Modal, InputGroup, FormControl } from 'react-bootstrap';
import React from 'react';
import { TrialAccount } from 'app/shared/api/generated/API';
import { PAGE_ROUTE } from 'app/config/constants';
import { InfoRow } from 'app/pages/AccountPage';
import { CopyButton } from 'app/shared/button/CopyButton';
import { toAppTimestampFormat } from 'app/shared/utils/Utils';

export const TrialAccountModal: React.FunctionComponent<{
  baseUrl: string;
  trialAccount: TrialAccount;
  show: boolean;
  onClose?: () => void;
  onRegenerate?: () => void;
}> = props => {
  const onClose = (event?: any) => {
    if (event) event.preventDefault();
    if (props.onClose) props.onClose();
  };

  function getInitiationLink() {
    if (props.trialAccount.activation?.key) {
      return `${props.baseUrl}${PAGE_ROUTE.ACCOUNT_ACTIVE_TRIAL_FINISH}?key=${props.trialAccount.activation.key}`;
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
                <CopyButton text={getInitiationLink()} />
              </InputGroup.Append>
            </InputGroup>
          }
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>Trial Account Initiation Date</h6>}
          content={toAppTimestampFormat(
            props.trialAccount.activation.initiationDate
          )}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>Trial Account Activation Key</h6>}
          content={props.trialAccount.activation.key}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>Trial Account Activation Date</h6>}
          content={toAppTimestampFormat(
            props.trialAccount.activation.activationDate
          )}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>License Agreement Assigned to</h6>}
          content={props.trialAccount.licenseAgreement.name}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>License Agreement Version</h6>}
          content={props.trialAccount.licenseAgreement.version}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>License Agreement Acceptance Date</h6>}
          content={toAppTimestampFormat(
            props.trialAccount.licenseAgreement.acceptanceDate
          )}
          direction={'vertical'}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={(event: any) => onClose(event)}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (props.onRegenerate) props.onRegenerate();
          }}
        >
          Reinitiate
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
