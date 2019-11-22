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
import { getEntity, updateEntity, createEntity, reset } from './token.reducer';
import { IToken } from 'app/shared/model/token.model';
import { convertDateTimeFromServer, convertDateTimeToServer } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITokenUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export interface ITokenUpdateState {
  isNew: boolean;
  userId: string;
}

export class TokenUpdate extends React.Component<ITokenUpdateProps, ITokenUpdateState> {
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
    values.creation = convertDateTimeToServer(values.creation);
    values.expiration = convertDateTimeToServer(values.expiration);

    if (errors.length === 0) {
      const { tokenEntity } = this.props;
      const entity = {
        ...tokenEntity,
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
    this.props.history.push('/token');
  };

  render() {
    const { tokenEntity, users, loading, updating } = this.props;
    const { isNew } = this.state;

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h2 id="oncokbApp.token.home.createOrEditLabel">Create or edit a Token</h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="8">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <AvForm model={isNew ? {} : tokenEntity} onSubmit={this.saveEntity}>
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
                    value={isNew ? null : convertDateTimeFromServer(this.props.tokenEntity.creation)}
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
                    value={isNew ? null : convertDateTimeFromServer(this.props.tokenEntity.expiration)}
                  />
                </AvGroup>
                <AvGroup>
                  <Label for="token-user">User</Label>
                  <AvInput id="token-user" type="select" className="form-control" name="user.id">
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
  }
}

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TokenUpdate);
