import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IUser } from 'app/shared/model/user.model';
import { getUsers } from 'app/modules/administration/user-management/user-management.reducer';
import { getEntity, updateEntity, createEntity, reset } from './token.reducer';
import { IToken } from 'app/shared/model/token.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITokenUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TokenUpdate = (props: ITokenUpdateProps) => {
  const [userId, setUserId] = useState('0');
  const [isNew, setIsNew] = useState(!props.match.params || !props.match.params.id);

  const { tokenEntity, users, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/token');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getUsers();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    values.creation = convertDateTimeToServer(values.creation);
    values.expiration = convertDateTimeToServer(values.expiration);

    if (errors.length === 0) {
      const entity = {
        ...tokenEntity,
        ...values
      };
      entity.user = users[values.user];

      if (isNew) {
        props.createEntity(entity);
      } else {
        props.updateEntity(entity);
      }
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbPublicApp.token.home.createOrEditLabel">Create or edit a Token</h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : tokenEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="token-id">ID</Label>
                  <AvInput id="token-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="tokenLabel" for="token-token">
                  Token
                </Label>
                <AvField id="token-token" type="text" name="token" />
              </AvGroup>
              <AvGroup>
                <Label id="creationLabel" for="token-creation">
                  Creation
                </Label>
                <AvInput
                  id="token-creation"
                  type="datetime-local"
                  className="form-control"
                  name="creation"
                  placeholder={'YYYY-MM-DD HH:mm'}
                  value={isNew ? displayDefaultDateTime() : convertDateTimeFromServer(props.tokenEntity.creation)}
                />
              </AvGroup>
              <AvGroup>
                <Label id="expirationLabel" for="token-expiration">
                  Expiration
                </Label>
                <AvInput
                  id="token-expiration"
                  type="datetime-local"
                  className="form-control"
                  name="expiration"
                  placeholder={'YYYY-MM-DD HH:mm'}
                  value={isNew ? displayDefaultDateTime() : convertDateTimeFromServer(props.tokenEntity.expiration)}
                />
              </AvGroup>
              <AvGroup>
                <Label id="usageLimitLabel" for="token-usageLimit">
                  Usage Limit
                </Label>
                <AvField id="token-usageLimit" type="string" className="form-control" name="usageLimit" />
              </AvGroup>
              <AvGroup>
                <Label id="currentUsageLabel" for="token-currentUsage">
                  Current Usage
                </Label>
                <AvField
                  id="token-currentUsage"
                  type="string"
                  className="form-control"
                  name="currentUsage"
                  validate={{
                    required: { value: true, errorMessage: 'This field is required.' },
                    number: { value: true, errorMessage: 'This field should be a number.' }
                  }}
                />
              </AvGroup>
              <AvGroup check>
                <Label id="renewableLabel">
                  <AvInput id="token-renewable" type="checkbox" className="form-check-input" name="renewable" />
                  Renewable
                </Label>
              </AvGroup>
              <AvGroup>
                <Label for="token-user">User</Label>
                <AvInput id="token-user" type="select" className="form-control" name="user">
                  <option value="" key="0" />
                  {users
                    ? users.map((otherEntity, index) => (
                        <option value={index} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/token" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </AvForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  users: storeState.userManagement.users,
  tokenEntity: storeState.token.entity,
  loading: storeState.token.loading,
  updating: storeState.token.updating,
  updateSuccess: storeState.token.updateSuccess
});

const mapDispatchToProps = {
  getUsers,
  getEntity,
  updateEntity,
  createEntity,
  reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TokenUpdate);
