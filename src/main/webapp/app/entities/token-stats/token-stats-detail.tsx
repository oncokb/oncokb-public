import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
// tslint:disable-next-line:no-unused-variable
import { ICrudGetAction, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './token-stats.reducer';
import { ITokenStats } from 'app/shared/model/token-stats.model';
// tslint:disable-next-line:no-unused-variable
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ITokenStatsDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export class TokenStatsDetail extends React.Component<ITokenStatsDetailProps> {
  componentDidMount() {
    this.props.getEntity(this.props.match.params.id);
  }

  render() {
    const { tokenStatsEntity } = this.props;
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
              <TextFormat value={tokenStatsEntity.accessTime} type="date" format={APP_LOCAL_DATE_FORMAT} />
            </dd>
            <dt>Token</dt>
            <dd>{tokenStatsEntity.token ? tokenStatsEntity.token.id : ''}</dd>
          </dl>
          <Button tag={Link} to="/entity/token-stats" replace color="info">
            <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
          </Button>
          &nbsp;
          <Button tag={Link} to={`/entity/token-stats/${tokenStatsEntity.id}/edit`} replace color="primary">
            <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = ({ tokenStats }: IRootState) => ({
  tokenStatsEntity: tokenStats.entity
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TokenStatsDetail);
