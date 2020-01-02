import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IToken } from 'app/shared/model/token.model';
import { getEntities as getTokens } from 'app/entities/token/token.reducer';
import { getEntity, updateEntity, createEntity, reset } from './token-stats.reducer';
import { ITokenStats } from 'app/shared/model/token-stats.model';
import { convertDateTimeFromServer, convertDateTimeToServer } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ITokenStatsUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TokenStatsUpdate = (props: ITokenStatsUpdateProps) => {
  const [tokenId, setTokenId] = useState('0');
  const [isNew, setIsNew] = useState(!props.match.params || !props.match.params.id);

  const { tokenStatsEntity, tokens, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/token-stats');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getTokens();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...tokenStatsEntity,
        ...values
      };

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
          <h2 id="oncokbApp.tokenStats.home.createOrEditLabel">Create or edit a TokenStats</h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : tokenStatsEntity} onSubmit={saveEntity}>
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
              <Button tag={Link} id="cancel-save" to="/token-stats" replace color="info">
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

export default connect(mapStateToProps, mapDispatchToProps)(TokenStatsUpdate);
