import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ICrudGetAction, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './token.reducer';
import { IToken } from 'app/shared/model/token.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITokenDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TokenDetail = (props: ITokenDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { tokenEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2>
          Token [<b>{tokenEntity.id}</b>]
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="token">Token</span>
          </dt>
          <dd>{tokenEntity.token}</dd>
          <dt>
            <span id="creation">Creation</span>
          </dt>
          <dd>
            <TextFormat value={tokenEntity.creation} type="date" format={APP_DATE_FORMAT} />
          </dd>
          <dt>
            <span id="expiration">Expiration</span>
          </dt>
          <dd>
            <TextFormat value={tokenEntity.expiration} type="date" format={APP_DATE_FORMAT} />
          </dd>
          <dt>User</dt>
          <dd>{tokenEntity.user ? tokenEntity.user.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/token" replace color="info">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/token/${tokenEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ token }: IRootState) => ({
  tokenEntity: token.entity
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TokenDetail);
