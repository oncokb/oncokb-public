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
import { getEntity, updateEntity, createEntity, reset } from './user-details.reducer';
import { IUserDetails } from 'app/shared/model/user-details.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IUserDetailsUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const UserDetailsUpdate = (props: IUserDetailsUpdateProps) => {
  const [userId, setUserId] = useState('0');
  const [isNew, setIsNew] = useState(!props.match.params || !props.match.params.id);

  const { userDetailsEntity, users, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/user-details');
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
    if (errors.length === 0) {
      const entity = {
        ...userDetailsEntity,
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
          <h2 id="oncokbPublicApp.userDetails.home.createOrEditLabel">Create or edit a UserDetails</h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : userDetailsEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="user-details-id">ID</Label>
                  <AvInput id="user-details-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="licenseTypeLabel" for="user-details-licenseType">
                  License Type
                </Label>
                <AvInput
                  id="user-details-licenseType"
                  type="select"
                  className="form-control"
                  name="licenseType"
                  value={(!isNew && userDetailsEntity.licenseType) || 'ACADEMIC'}
                >
                  <option value="ACADEMIC">ACADEMIC</option>
                  <option value="COMMERCIAL">COMMERCIAL</option>
                  <option value="RESEARCH_IN_COMMERCIAL">RESEARCH_IN_COMMERCIAL</option>
                  <option value="HOSPITAL">HOSPITAL</option>
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label id="jobTitleLabel" for="user-details-jobTitle">
                  Job Title
                </Label>
                <AvField id="user-details-jobTitle" type="text" name="jobTitle" />
              </AvGroup>
              <AvGroup>
                <Label id="companyLabel" for="user-details-company">
                  Company
                </Label>
                <AvField id="user-details-company" type="text" name="company" />
              </AvGroup>
              <AvGroup>
                <Label id="cityLabel" for="user-details-city">
                  City
                </Label>
                <AvField id="user-details-city" type="text" name="city" />
              </AvGroup>
              <AvGroup>
                <Label id="countryLabel" for="user-details-country">
                  Country
                </Label>
                <AvField id="user-details-country" type="text" name="country" />
              </AvGroup>
              <AvGroup>
                <Label id="addressLabel" for="user-details-address">
                  Address
                </Label>
                <AvField id="user-details-address" type="text" name="address" />
              </AvGroup>
              <AvGroup>
                <Label for="user-details-user">User</Label>
                <AvInput id="user-details-user" type="select" className="form-control" name="userId">
                  <option value="" key="0" />
                  {users
                    ? users.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/user-details" replace color="info">
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
  userDetailsEntity: storeState.userDetails.entity,
  loading: storeState.userDetails.loading,
  updating: storeState.userDetails.updating,
  updateSuccess: storeState.userDetails.updateSuccess
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

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailsUpdate);
