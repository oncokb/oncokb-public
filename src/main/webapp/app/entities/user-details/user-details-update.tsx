import React from 'react';
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
import { convertDateTimeFromServer, convertDateTimeToServer } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IUserDetailsUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export interface IUserDetailsUpdateState {
  isNew: boolean;
  userId: string;
}

export class UserDetailsUpdate extends React.Component<IUserDetailsUpdateProps, IUserDetailsUpdateState> {
  constructor(props) {
    super(props);
    this.state = {
      userId: '0',
      isNew: !this.props.match.params || !this.props.match.params.id
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.updateSuccess !== this.props.updateSuccess && nextProps.updateSuccess) {
      this.handleClose();
    }
  }

  componentDidMount() {
    if (this.state.isNew) {
      this.props.reset();
    } else {
      this.props.getEntity(this.props.match.params.id);
    }

    this.props.getUsers();
  }

  saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const { userDetailsEntity } = this.props;
      const entity = {
        ...userDetailsEntity,
        ...values
      };

      if (this.state.isNew) {
        this.props.createEntity(entity);
      } else {
        this.props.updateEntity(entity);
      }
    }
  };

  handleClose = () => {
    this.props.history.push('/entity/user-details');
  };

  render() {
    const { userDetailsEntity, users, loading, updating } = this.props;
    const { isNew } = this.state;

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h2 id="oncokbApp.userDetails.home.createOrEditLabel">Create or edit a UserDetails</h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="8">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <AvForm model={isNew ? {} : userDetailsEntity} onSubmit={this.saveEntity}>
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
                <Button tag={Link} id="cancel-save" to="/entity/user-details" replace color="info">
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
  }
}

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserDetailsUpdate);
