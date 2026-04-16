import React from 'react';
import { Alert, Button, Col, Modal, Row } from 'react-bootstrap';
import { AUTHORITIES } from 'app/config/constants';
import { InfoRow } from 'app/pages/AccountPage';
import { UserDTO } from 'app/shared/api/generated/API';
import { formatEnumLabel } from 'app/shared/utils/Utils';
import styles from './UserQuickViewModal.module.scss';
import { Link } from 'react-router-dom';

type UserQuickViewModalProps = {
  user: UserDTO | undefined;
  show: boolean;
  onClose: () => void;
  onUpdateActiveStatus: (authorities: string[]) => void;
};

const emptyValue = 'Not provided';

function getDisplayValue(value: string | undefined) {
  return value || emptyValue;
}

function getActivationAuthorities(user: UserDTO | undefined) {
  const authorities = [...(user?.authorities ?? [])];
  const isRequestingApiAccess =
    user?.additionalInfo?.apiAccessRequest?.requested;

  if (isRequestingApiAccess && !authorities.includes(AUTHORITIES.API)) {
    authorities.push(AUTHORITIES.API);
  }

  return authorities;
}

export const UserQuickViewModal: React.FunctionComponent<UserQuickViewModalProps> = props => {
  const user = props.user;
  const isRequestingApiAccess =
    user?.additionalInfo?.apiAccessRequest?.requested;
  const apiAccessJustification =
    user?.additionalInfo?.apiAccessRequest?.justification;
  const activationVariant = user?.activated ? 'danger' : 'success';

  return (
    <Modal
      dialogClassName={styles.modal}
      show={props.show}
      onHide={props.onClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>User Quick View</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isRequestingApiAccess && !user?.activated && (
          <Alert variant="warning">
            This user is requesting API access. Activating this account will add
            API access.
          </Alert>
        )}
        <InfoRow
          title={<h6>User Page</h6>}
          content={
            user ? (
              <Link
                to={`/users/${user.login}`}
                className="d-flex align-items-center"
              >
                View user page
              </Link>
            ) : (
              ''
            )
          }
          direction={'vertical'}
        />
        <Row>
          <Col xs={12} md={4}>
            <InfoRow
              title={<h6>First Name</h6>}
              content={getDisplayValue(user?.firstName)}
              direction={'vertical'}
            />
          </Col>
          <Col xs={12} md={4}>
            <InfoRow
              title={<h6>Last Name</h6>}
              content={getDisplayValue(user?.lastName)}
              direction={'vertical'}
            />
          </Col>
          <Col xs={12} md={4}>
            <InfoRow
              title={<h6>Job Title</h6>}
              content={getDisplayValue(user?.jobTitle)}
              direction={'vertical'}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={4}>
            <InfoRow
              title={<h6>City</h6>}
              content={getDisplayValue(user?.city)}
              direction={'vertical'}
            />
          </Col>
          <Col xs={12} md={4}>
            <InfoRow
              title={<h6>Country</h6>}
              content={getDisplayValue(user?.country)}
              direction={'vertical'}
            />
          </Col>
          <Col xs={12} md={4}>
            <InfoRow
              title={<h6>License Type</h6>}
              content={
                user?.licenseType
                  ? formatEnumLabel(user.licenseType)
                  : emptyValue
              }
              direction={'vertical'}
            />
          </Col>
        </Row>
        <InfoRow
          title={<h6>Use Case</h6>}
          content={getDisplayValue(user?.additionalInfo?.userCompany?.useCase)}
          direction={'vertical'}
        />
        <InfoRow
          title={<h6>API Access Justification</h6>}
          content={getDisplayValue(apiAccessJustification)}
          direction={'vertical'}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>
          Close
        </Button>
        <Button
          variant={activationVariant}
          onClick={() =>
            props.onUpdateActiveStatus(getActivationAuthorities(user))
          }
        >
          {user?.activated
            ? 'Deactivate Account'
            : user?.emailVerified === false
            ? 'Email Not Verified'
            : 'Activate Account'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
