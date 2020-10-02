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
import { getEntity, updateEntity, createEntity, reset } from './user-mails.reducer';
import { IUserMails } from 'app/shared/model/user-mails.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IUserMailsUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const UserMailsUpdate = (props: IUserMailsUpdateProps) => {
  const [userId, setUserId] = useState('0');
  const [isNew, setIsNew] = useState(!props.match.params || !props.match.params.id);

  const { userMailsEntity, users, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/user-mails');
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
    values.sentDate = convertDateTimeToServer(values.sentDate);

    if (errors.length === 0) {
      const entity = {
        ...userMailsEntity,
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
          <h2 id="oncokbPublicApp.userMails.home.createOrEditLabel">Create or edit a UserMails</h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : userMailsEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="user-mails-id">ID</Label>
                  <AvInput id="user-mails-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="sentDateLabel" for="user-mails-sentDate">
                  Sent Date
                </Label>
                <AvInput
                  id="user-mails-sentDate"
                  type="datetime-local"
                  className="form-control"
                  name="sentDate"
                  placeholder={'YYYY-MM-DD HH:mm'}
                  value={isNew ? displayDefaultDateTime() : convertDateTimeFromServer(props.userMailsEntity.sentDate)}
                  validate={{
                    required: { value: true, errorMessage: 'This field is required.' }
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="sentByLabel" for="user-mails-sentBy">
                  Sent By
                </Label>
                <AvField
                  id="user-mails-sentBy"
                  type="text"
                  name="sentBy"
                  validate={{
                    required: { value: true, errorMessage: 'This field is required.' }
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="mailTypeLabel" for="user-mails-mailType">
                  Mail Type
                </Label>
                <AvInput
                  id="user-mails-mailType"
                  type="select"
                  className="form-control"
                  name="mailType"
                  value={(!isNew && userMailsEntity.mailType) || 'ACTIVATION'}
                >
                  <option value="ACTIVATION">ACTIVATION</option>
                  <option value="APPROVAL">APPROVAL</option>
                  <option value="CREATION">CREATION</option>
                  <option value="PASSWORD_RESET">PASSWORD_RESET</option>
                  <option value="LICENSE_REVIEW_COMMERCIAL">LICENSE_REVIEW_COMMERCIAL</option>
                  <option value="LICENSE_REVIEW_RESEARCH_COMMERCIAL">LICENSE_REVIEW_RESEARCH_COMMERCIAL</option>
                  <option value="LICENSE_REVIEW_HOSPITAL">LICENSE_REVIEW_HOSPITAL</option>
                  <option value="CLARIFY_ACADEMIC_FOR_PROFIT">CLARIFY_ACADEMIC_FOR_PROFIT</option>
                  <option value="CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL">CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL</option>
                  <option value="TEST">TEST</option>
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label id="sentFromLabel" for="user-mails-sentFrom">
                  Sent From
                </Label>
                <AvField
                  id="user-mails-sentFrom"
                  type="text"
                  name="sentFrom"
                  validate={{
                    required: { value: true, errorMessage: 'This field is required.' }
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label for="user-mails-user">User</Label>
                <AvInput id="user-mails-user" type="select" className="form-control" name="userId">
                  <option value="" key="0" />
                  {users
                    ? users.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.login}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/user-mails" replace color="info">
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
  userMailsEntity: storeState.userMails.entity,
  loading: storeState.userMails.loading,
  updating: storeState.userMails.updating,
  updateSuccess: storeState.userMails.updateSuccess
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

export default connect(mapStateToProps, mapDispatchToProps)(UserMailsUpdate);
