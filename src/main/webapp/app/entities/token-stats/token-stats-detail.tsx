import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { ICrudGetAction, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './token-stats.reducer';
import { ITokenStats } from 'app/shared/model/token-stats.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITokenStatsDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const TokenStatsDetail = (props: ITokenStatsDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { tokenStatsEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2>
          TokenStats [<b>{tokenStatsEntity.id}</b>]
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="accessIp">Access Ip</span>
          </dt>
          <dd>{tokenStatsEntity.accessIp}</dd>
          <dt>
            <span id="resource">Resource</span>
          </dt>
          <dd>{tokenStatsEntity.resource}</dd>
          <dt>
            <span id="accessTime">Access Time</span>
          </dt>
          <dd>
            <TextFormat value={tokenStatsEntity.accessTime} type="date" format={APP_DATE_FORMAT} />
          </dd>
          <dt>Token</dt>
          <dd>{tokenStatsEntity.token ? tokenStatsEntity.token.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/token-stats" replace color="info">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/token-stats/${tokenStatsEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ tokenStats }: IRootState) => ({
  tokenStatsEntity: tokenStats.entity
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(TokenStatsDetail);
