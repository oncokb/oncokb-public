import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
// tslint:disable-next-line:no-unused-variable
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IToken } from 'app/shared/model/token.model';
import { getEntities as getTokens } from 'app/entities/token/token.reducer';
import { getEntity, updateEntity, createEntity, reset } from './token-stats.reducer';
import { ITokenStats } from 'app/shared/model/token-stats.model';
// tslint:disable-next-line:no-unused-variable
import { convertDateTimeFromServer, convertDateTimeToServer } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITokenStatsUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export interface ITokenStatsUpdateState {
  isNew: boolean;
  tokenId: string;
}

export class TokenStatsUpdate extends React.Component<ITokenStatsUpdateProps, ITokenStatsUpdateState> {
  constructor(props) {
    super(props);
    this.state = {
      tokenId: '0',
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

    this.props.getTokens();
  }

  saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const { tokenStatsEntity } = this.props;
      const entity = {
        ...tokenStatsEntity,
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
    this.props.history.push('/entity/token-stats');
  };

  render() {
    const { tokenStatsEntity, tokens, loading, updating } = this.props;
    const { isNew } = this.state;

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h2 id="oncokbApp.tokenStats.home.createOrEditLabel">Create or edit a TokenStats</h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="8">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <AvForm model={isNew ? {} : tokenStatsEntity} onSubmit={this.saveEntity}>
                {!isNew ? (
                  <AvGroup>
                    <Label for="token-stats-id">ID</Label>
                    <AvInput id="token-stats-id" type="text" className="form-control" name="id" required readOnly />
                  </AvGroup>
                ) : null}
                <AvGroup>
                  <Label id="accessIpLabel" for="token-stats-accessIp">
                    Access Ip
                  </Label>
                  <AvField id="token-stats-accessIp" type="text" name="accessIp" />
                </AvGroup>
                <AvGroup>
                  <Label id="resourceLabel" for="token-stats-resource">
                    Resource
                  </Label>
                  <AvField id="token-stats-resource" type="text" name="resource" />
                </AvGroup>
                <AvGroup>
                  <Label id="accessTimeLabel" for="token-stats-accessTime">
                    Access Time
                  </Label>
                  <AvField id="token-stats-accessTime" type="date" className="form-control" name="accessTime" />
                </AvGroup>
                <AvGroup>
                  <Label for="token-stats-token">Token</Label>
                  <AvInput id="token-stats-token" type="select" className="form-control" name="token.id">
                    <option value="" key="0" />
                    {tokens
                      ? tokens.map(otherEntity => (
                          <option value={otherEntity.id} key={otherEntity.id}>
                            {otherEntity.id}
                          </option>
                        ))
                      : null}
                  </AvInput>
                </AvGroup>
                <Button tag={Link} id="cancel-save" to="/entity/token-stats" replace color="info">
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
  tokens: storeState.token.entities,
  tokenStatsEntity: storeState.tokenStats.entity,
  loading: storeState.tokenStats.loading,
  updating: storeState.tokenStats.updating,
  updateSuccess: storeState.tokenStats.updateSuccess
});

const mapDispatchToProps = {
  getTokens,
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
)(TokenStatsUpdate);
